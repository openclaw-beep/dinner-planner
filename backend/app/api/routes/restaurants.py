from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.schemas.review import RestaurantReviewItem, RestaurantReviewsResponse
from app.schemas.restaurant import RestaurantCreate, RestaurantRead, RestaurantSearchResponse, RestaurantUpdate
from app.services.search_service import search_restaurants

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("", response_model=RestaurantRead, status_code=201)
def create_restaurant(payload: RestaurantCreate, db: Session = Depends(get_db)) -> Restaurant:
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
) -> Restaurant:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

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
    city: str | None = Query(None),
    db: Session = Depends(get_db),
) -> RestaurantSearchResponse:
    try:
        reservation_at = datetime.fromisoformat(f"{date}T{time}:00")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date/time format") from exc

    results = search_restaurants(db=db, reservation_at=reservation_at, party_size=party_size, city=city)
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
