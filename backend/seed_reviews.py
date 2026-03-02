"""Seed verified reviews linked to completed bookings.

Usage:
    python seed_reviews.py
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid5, NAMESPACE_DNS

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from seed_data import upsert_restaurants


@dataclass(frozen=True)
class SeedUser:
    name: str
    phone_number: str


@dataclass(frozen=True)
class SeedReview:
    user_phone: str
    restaurant_name: str
    days_ago: int
    party_size: int
    confirmation_code: str
    rating: int
    review_text: str


SEED_USERS: list[SeedUser] = [
    SeedUser(name="Alex Mercer", phone_number="+16135550101"),
    SeedUser(name="Priya Singh", phone_number="+16135550102"),
    SeedUser(name="Noah Carter", phone_number="+16135550103"),
    SeedUser(name="Sofia Patel", phone_number="+16135550104"),
    SeedUser(name="Liam Chen", phone_number="+16135550105"),
    SeedUser(name="Emma Brooks", phone_number="+16135550106"),
    SeedUser(name="Maya Johnson", phone_number="+16135550107"),
    SeedUser(name="Owen Bell", phone_number="+16135550108"),
]


SEED_REVIEWS: list[SeedReview] = [
    SeedReview("+16135550101", "Gezellig", 45, 2, "RVA101", 5, "Excellent service and perfectly timed courses."),
    SeedReview("+16135550102", "Gezellig", 30, 4, "RVA102", 4, "Great atmosphere and strong wine recommendations."),
    SeedReview("+16135550103", "Gezellig", 18, 2, "RVA103", 5, "Consistently high quality and very welcoming staff."),
    SeedReview("+16135550104", "North & Navy", 40, 2, "RVB201", 5, "Fresh pasta and creative menu, worth the visit."),
    SeedReview("+16135550105", "North & Navy", 27, 3, "RVB202", 4, "Solid dinner and attentive service throughout."),
    SeedReview("+16135550106", "North & Navy", 16, 2, "RVB203", 5, "One of the best date-night spots in the city."),
    SeedReview("+16135550107", "Stofa Restaurant", 38, 2, "RVC301", 5, "Tasting menu was balanced and beautifully presented."),
    SeedReview("+16135550108", "Stofa Restaurant", 22, 2, "RVC302", 4, "Excellent flavors, pacing felt just a bit slow."),
    SeedReview("+16135550101", "Stofa Restaurant", 11, 2, "RVC303", 5, "Standout dishes from start to finish."),
    SeedReview("+16135550102", "Soca Kitchen", 34, 4, "RVD401", 4, "Fun vibe and strong cocktail list."),
    SeedReview("+16135550103", "Soca Kitchen", 25, 3, "RVD402", 5, "Bold flavors and very good value."),
    SeedReview("+16135550104", "Soca Kitchen", 9, 2, "RVD403", 4, "Friendly team and fast service."),
    SeedReview("+16135550105", "Pure Kitchen Westboro", 29, 2, "RVE501", 5, "Fresh ingredients and lots of variety."),
    SeedReview("+16135550106", "Pure Kitchen Westboro", 21, 3, "RVE502", 4, "Great vegetarian options for mixed groups."),
    SeedReview("+16135550107", "Pure Kitchen Westboro", 14, 2, "RVE503", 4, "Healthy menu without sacrificing taste."),
    SeedReview("+16135550108", "Pure Kitchen Westboro", 7, 2, "RVE504", 5, "Reliable quality and generous portions."),
]


def review_uuid_from_code(code: str) -> UUID:
    return uuid5(NAMESPACE_DNS, f"dinner-planner-review-{code}")


def upsert_users() -> None:
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        for item in SEED_USERS:
            existing = db.scalar(select(User).where(User.phone_number == item.phone_number))
            if existing:
                existing.name = item.name
                continue
            db.add(User(name=item.name, phone_number=item.phone_number, created_at=now))
        db.commit()


def upsert_bookings_and_reviews() -> tuple[int, int]:
    now = datetime.now(timezone.utc)
    inserted = 0
    updated = 0
    with SessionLocal() as db:
        users_by_phone = {u.phone_number: u for u in db.scalars(select(User)).all()}
        restaurants_by_name = {r.name: r for r in db.scalars(select(Restaurant)).all()}

        for item in SEED_REVIEWS:
            user = users_by_phone[item.user_phone]
            restaurant = restaurants_by_name[item.restaurant_name]
            reservation_at = now - timedelta(days=item.days_ago)

            booking = db.scalar(select(Booking).where(Booking.confirmation_code == item.confirmation_code))
            if booking is None:
                booking = Booking(
                    user_id=user.id,
                    restaurant_id=restaurant.id,
                    reservation_at=reservation_at,
                    party_size=item.party_size,
                    status=BookingStatus.CONFIRMED,
                    confirmation_code=item.confirmation_code,
                    created_at=reservation_at,
                )
                db.add(booking)
                db.flush()
            else:
                booking.user_id = user.id
                booking.restaurant_id = restaurant.id
                booking.reservation_at = reservation_at
                booking.party_size = item.party_size
                booking.status = BookingStatus.CONFIRMED

            verified = booking.status == BookingStatus.CONFIRMED and booking.reservation_at <= now
            review = db.scalar(select(Review).where(Review.booking_id == booking.id))
            if review is None:
                db.add(
                    Review(
                        id=review_uuid_from_code(item.confirmation_code),
                        booking_id=booking.id,
                        user_id=user.id,
                        restaurant_id=restaurant.id,
                        rating=item.rating,
                        review_text=item.review_text,
                        verified=verified,
                        created_at=reservation_at + timedelta(hours=2),
                        updated_at=reservation_at + timedelta(hours=2),
                    )
                )
                inserted += 1
            else:
                review.user_id = user.id
                review.restaurant_id = restaurant.id
                review.rating = item.rating
                review.review_text = item.review_text
                review.verified = verified
                review.updated_at = now
                updated += 1

        db.commit()
    return inserted, updated


def validate_seed() -> bool:
    with SessionLocal() as db:
        total_reviews = db.query(Review).count()
        distinct_restaurants = db.query(Review.restaurant_id).distinct().count()
        unverified = db.query(Review).where(Review.verified.is_(False)).count()

    print("\nValidation report:")
    print(f"- Reviews total: {total_reviews}")
    print(f"- Distinct restaurants: {distinct_restaurants}")
    print(f"- Unverified reviews: {unverified}")
    return total_reviews >= 15 and distinct_restaurants >= 5 and unverified == 0


def main() -> int:
    upsert_restaurants()
    upsert_users()
    inserted, updated = upsert_bookings_and_reviews()
    print(f"Review seed complete: inserted={inserted}, updated={updated}")
    if not validate_seed():
        print("\nValidation failed.")
        return 1
    print("\nValidation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
