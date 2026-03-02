from datetime import datetime

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.restaurant import Restaurant


def _normalize(value: str) -> str:
    return value.strip().lower()


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [_normalize(item) for item in value.split(",") if item.strip()]


def _price_tier(amount: float) -> str:
    if amount <= 20:
        return "$"
    if amount <= 40:
        return "$$"
    if amount <= 70:
        return "$$$"
    return "$$$$"


def _restaurant_profile(restaurant: Restaurant) -> dict[str, object]:
    cuisine = _normalize(restaurant.cuisine)
    defaults: dict[str, dict[str, object]] = {
        "italian": {
            "outdoor_seating": True,
            "dietary_options": ["vegan", "gf"],
            "ambiance_tags": ["romantic", "family"],
        },
        "vegetarian": {
            "outdoor_seating": True,
            "dietary_options": ["vegan", "gf", "nut-free"],
            "ambiance_tags": ["family", "business"],
        },
        "contemporary canadian": {
            "outdoor_seating": True,
            "dietary_options": ["gf", "nut-free"],
            "ambiance_tags": ["business", "family"],
        },
        "modern european": {
            "outdoor_seating": False,
            "dietary_options": ["gf"],
            "ambiance_tags": ["romantic", "business"],
        },
        "latin caribbean": {
            "outdoor_seating": True,
            "dietary_options": ["gf", "halal"],
            "ambiance_tags": ["family", "business"],
        },
    }

    profile = defaults.get(
        cuisine,
        {
            "outdoor_seating": False,
            "dietary_options": [],
            "ambiance_tags": [],
        },
    )

    amount = float(restaurant.average_price_per_guest)
    return {
        "price_tier": _price_tier(amount),
        "outdoor_seating": bool(profile["outdoor_seating"]),
        "dietary_options": list(profile["dietary_options"]),
        "ambiance_tags": list(profile["ambiance_tags"]),
    }


def search_restaurants(
    db: Session,
    reservation_at: datetime,
    party_size: int,
    city: str | None = None,
    cuisine: str | None = None,
    price: str | None = None,
    dietary: str | None = None,
) -> list[dict]:
    filters = [Restaurant.capacity >= party_size]
    if city:
        filters.append(Restaurant.city.ilike(f"%{city.strip()}%"))

    restaurants = db.scalars(select(Restaurant).where(and_(*filters)).order_by(Restaurant.name.asc())).all()

    start = reservation_at.replace(minute=0, second=0, microsecond=0)
    end = start.replace(hour=min(start.hour + 2, 23))
    cuisine_filters = _parse_csv(cuisine)
    dietary_filters = _parse_csv(dietary)
    price_filters = _parse_csv(price)
    numeric_price_filters: list[float] = []
    tier_filters: list[str] = []

    for token in price_filters:
        if token.startswith("$"):
            tier_filters.append(token)
            continue
        try:
            numeric_price_filters.append(float(token))
        except ValueError:
            continue

    max_price = min(numeric_price_filters) if numeric_price_filters else None

    results: list[dict] = []
    for restaurant in restaurants:
        profile = _restaurant_profile(restaurant)
        restaurant_price = float(restaurant.average_price_per_guest)

        if cuisine_filters and not any(token in _normalize(restaurant.cuisine) for token in cuisine_filters):
            continue
        if max_price is not None and restaurant_price > max_price:
            continue
        if tier_filters and str(profile["price_tier"]) not in tier_filters:
            continue
        if dietary_filters and not all(option in profile["dietary_options"] for option in dietary_filters):
            continue

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
                "price_tier": profile["price_tier"],
                "outdoor_seating": profile["outdoor_seating"],
                "dietary_options": profile["dietary_options"],
                "ambiance_tags": profile["ambiance_tags"],
                "available": available,
            }
        )

    return results
