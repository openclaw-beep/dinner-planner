from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.params import Depends as DependsMarker
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.api.deps.auth import AdminContext, require_admin, resolve_admin_for_route
from app.db.session import get_db
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.schemas.review import RestaurantRatingResponse, RestaurantReviewItem, RestaurantReviewsResponse
from app.schemas.restaurant import (
    RestaurantAvailabilityResponse,
    RestaurantAvailabilitySlot,
    RestaurantCreate,
    RestaurantRead,
    RestaurantSearchResponse,
    RestaurantUpdate,
)
from app.services.search_service import search_restaurants

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("", response_model=RestaurantRead, status_code=201)
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    admin_context: AdminContext | DependsMarker = Depends(require_admin),
) -> Restaurant:
    resolve_admin_for_route(admin_context)
    restaurant = Restaurant(**payload.model_dump())
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/id/{restaurant_id}", response_model=RestaurantRead)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)) -> Restaurant:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.patch("/id/{restaurant_id}", response_model=RestaurantRead)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    db: Session = Depends(get_db),
    admin_context: AdminContext | DependsMarker = Depends(require_admin),
) -> Restaurant:
    resolved_admin = resolve_admin_for_route(admin_context)
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if resolved_admin.restaurant_id is not None and restaurant.id != resolved_admin.restaurant_id:
        raise HTTPException(status_code=403, detail="Restaurant outside admin scope")

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(restaurant, field_name, value)

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/search", response_model=RestaurantSearchResponse)
def restaurant_search(
    date: str = Query(..., description="YYYY-MM-DD"),
    time: str = Query(..., description="HH:MM"),
    party_size: int = Query(..., gt=0),
    city: str | None = None,
    cuisine: str | None = None,
    price: str | None = None,
    dietary: str | None = None,
    db: Session = Depends(get_db),
) -> RestaurantSearchResponse:
    try:
        reservation_at = datetime.fromisoformat(f"{date}T{time}:00")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date/time format") from exc

    results = search_restaurants(
        db=db,
        reservation_at=reservation_at,
        party_size=party_size,
        city=city,
        cuisine=cuisine,
        price=price,
        dietary=dietary,
    )
    return RestaurantSearchResponse(date=date, time=time, party_size=party_size, results=results)


@router.get("/{restaurant_id}/reviews", response_model=RestaurantReviewsResponse)
def get_restaurant_reviews(
    restaurant_id: int,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> RestaurantReviewsResponse:
    restaurant = db.scalar(select(Restaurant.id).where(Restaurant.id == restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    rows = db.execute(
        select(Review, User.name)
        .join(User, User.id == Review.user_id)
        .where(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return RestaurantReviewsResponse(
        reviews=[
            RestaurantReviewItem(
                user_name=user_name,
                rating=review.rating,
                review_text=review.review_text,
                created_at=review.created_at,
            )
            for review, user_name in rows
        ],
        limit=limit,
        offset=offset,
    )


@router.get("/{restaurant_id}/rating", response_model=RestaurantRatingResponse)
def get_restaurant_rating(restaurant_id: int, db: Session = Depends(get_db)) -> RestaurantRatingResponse:
    restaurant = db.scalar(select(Restaurant.id).where(Restaurant.id == restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    avg_rating, review_count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.restaurant_id == restaurant_id)
    ).one()

    return RestaurantRatingResponse(
        average=float(avg_rating) if avg_rating is not None else 0.0,
        count=int(review_count),
    )


@router.get("/{restaurant_id}/availability", response_model=RestaurantAvailabilityResponse)
def get_restaurant_availability(
    restaurant_id: int,
    date: str = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
) -> RestaurantAvailabilityResponse:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    try:
        target_date = datetime.fromisoformat(date).date()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD") from exc

    service_hours = [17, 18, 19, 20, 21]
    slots: list[RestaurantAvailabilitySlot] = []
    limited_threshold = max(1, int(restaurant.capacity * 0.25))

    for hour in service_hours:
        slot_start = datetime.combine(target_date, datetime.min.time()).replace(hour=hour)
        slot_end = slot_start.replace(hour=min(hour + 2, 23))

        occupied = db.scalar(
            select(func.coalesce(func.sum(Booking.party_size), 0)).where(
                and_(
                    Booking.restaurant_id == restaurant.id,
                    Booking.status == BookingStatus.CONFIRMED,
                    Booking.reservation_at >= slot_start,
                    Booking.reservation_at <= slot_end,
                )
            )
        )
        spots_left = max(0, int(restaurant.capacity) - int(occupied))

        if spots_left <= 0:
            status = "full"
            spots = 0
        elif spots_left <= limited_threshold:
            status = "limited"
            spots = spots_left
        else:
            status = "available"
            spots = spots_left

        slots.append(
            RestaurantAvailabilitySlot(
                time=f"{hour:02d}:00",
                status=status,
                spots_left=spots,
            )
        )

    return RestaurantAvailabilityResponse(date=date, slots=slots)
