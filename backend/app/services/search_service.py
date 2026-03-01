from datetime import datetime

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.restaurant import Restaurant


def search_restaurants(db: Session, reservation_at: datetime, party_size: int, city: str | None = None) -> list[dict]:
    filters = [Restaurant.capacity >= party_size]
    if city:
        filters.append(Restaurant.city.ilike(city))

    restaurants = db.scalars(select(Restaurant).where(and_(*filters)).order_by(Restaurant.name.asc())).all()

    start = reservation_at.replace(minute=0, second=0, microsecond=0)
    end = start.replace(hour=min(start.hour + 2, 23))

    results: list[dict] = []
    for restaurant in restaurants:
        occupied = db.scalar(
            select(func.coalesce(func.sum(Booking.party_size), 0)).where(
                and_(
                    Booking.restaurant_id == restaurant.id,
                    Booking.status == BookingStatus.CONFIRMED,
                    Booking.reservation_at >= start,
                    Booking.reservation_at <= end,
                )
            )
        )
        available = (restaurant.capacity - int(occupied)) >= party_size
        results.append(
            {
                "id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "city": restaurant.city,
                "address": restaurant.address,
                "capacity": restaurant.capacity,
                "average_price_per_guest": restaurant.average_price_per_guest,
                "available": available,
            }
        )

    return results
