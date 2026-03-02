from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import HTTPException

from app.api.routes.bookings import confirm_booking, create_booking, create_booking_review
from app.api.routes.restaurants import create_restaurant, get_restaurant_reviews
from app.api.routes.users import create_user
from app.schemas.booking import BookingCreate
from app.schemas.restaurant import RestaurantCreate
from app.schemas.review import ReviewCreate
from app.schemas.user import UserCreate


def _create_user(db_session, name: str, phone_number: str) -> int:
    user = create_user(UserCreate(name=name, phone_number=phone_number), db_session)
    return user.id


def _create_restaurant(db_session) -> int:
    restaurant = create_restaurant(
        RestaurantCreate(
            name="Saffron Table",
            cuisine="Indian",
            city="San Francisco",
            address="123 Mission St",
            capacity=30,
            average_price_per_guest=Decimal("42.50"),
        ),
        db_session,
    )
    return restaurant.id


def _create_and_confirm_booking(db_session, user_id: int, restaurant_id: int, reservation_at: datetime) -> int:
    booking = create_booking(
        BookingCreate(
            user_id=user_id,
            restaurant_id=restaurant_id,
            reservation_at=reservation_at,
            party_size=4,
        ),
        db_session,
    )
    confirm_booking(booking.id, db_session)
    return booking.id


def test_create_review_for_completed_owned_booking(db_session):
    user_id = _create_user(db_session, "Alice", "+15551110001")
    restaurant_id = _create_restaurant(db_session)
    booking_id = _create_and_confirm_booking(db_session, user_id, restaurant_id, datetime.utcnow() - timedelta(days=2))

    review = create_booking_review(
        booking_id=booking_id,
        payload=ReviewCreate(rating=5, review_text="Excellent service"),
        user_id=user_id,
        db=db_session,
    )

    assert review.booking_id == booking_id
    assert review.user_id == user_id
    assert review.restaurant_id == restaurant_id
    assert review.rating == 5
    assert review.review_text == "Excellent service"
    assert review.verified is True


def test_create_review_rejects_when_user_does_not_own_booking(db_session):
    owner_id = _create_user(db_session, "Owner", "+15551110002")
    other_id = _create_user(db_session, "Other", "+15551110003")
    restaurant_id = _create_restaurant(db_session)
    booking_id = _create_and_confirm_booking(db_session, owner_id, restaurant_id, datetime.utcnow() - timedelta(days=1))

    try:
        create_booking_review(
            booking_id=booking_id,
            payload=ReviewCreate(rating=4),
            user_id=other_id,
            db=db_session,
        )
        assert False, "Expected ownership check to fail"
    except HTTPException as exc:
        assert exc.status_code == 403
        assert exc.detail == "User does not own this booking"


def test_create_review_rejects_when_booking_not_completed(db_session):
    user_id = _create_user(db_session, "Bob", "+15551110004")
    restaurant_id = _create_restaurant(db_session)
    booking_id = _create_and_confirm_booking(db_session, user_id, restaurant_id, datetime.utcnow() + timedelta(days=1))

    try:
        create_booking_review(
            booking_id=booking_id,
            payload=ReviewCreate(rating=3, review_text="Too early"),
            user_id=user_id,
            db=db_session,
        )
        assert False, "Expected completed booking check to fail"
    except HTTPException as exc:
        assert exc.status_code == 400
        assert exc.detail == "Booking must be completed before review"


def test_get_restaurant_reviews_returns_newest_first_with_user_names(db_session):
    first_user_id = _create_user(db_session, "First User", "+15551110005")
    second_user_id = _create_user(db_session, "Second User", "+15551110006")
    restaurant_id = _create_restaurant(db_session)

    first_booking_id = _create_and_confirm_booking(
        db_session, first_user_id, restaurant_id, datetime.utcnow() - timedelta(days=4)
    )
    second_booking_id = _create_and_confirm_booking(
        db_session, second_user_id, restaurant_id, datetime.utcnow() - timedelta(days=3)
    )

    create_booking_review(
        booking_id=first_booking_id,
        payload=ReviewCreate(rating=4, review_text="Great"),
        user_id=first_user_id,
        db=db_session,
    )
    create_booking_review(
        booking_id=second_booking_id,
        payload=ReviewCreate(rating=5, review_text="Amazing"),
        user_id=second_user_id,
        db=db_session,
    )

    response = get_restaurant_reviews(restaurant_id=restaurant_id, limit=10, offset=0, db=db_session)

    assert response.limit == 10
    assert response.offset == 0
    assert len(response.reviews) == 2
    assert response.reviews[0].user_name == "Second User"
    assert response.reviews[0].rating == 5
    assert response.reviews[0].review_text == "Amazing"
    assert response.reviews[1].user_name == "First User"
    assert response.reviews[1].rating == 4
    assert response.reviews[1].review_text == "Great"


def test_get_restaurant_reviews_supports_limit_and_offset(db_session):
    user_ids = [
        _create_user(db_session, "User One", "+15551110007"),
        _create_user(db_session, "User Two", "+15551110008"),
        _create_user(db_session, "User Three", "+15551110009"),
    ]
    restaurant_id = _create_restaurant(db_session)

    for idx, user_id in enumerate(user_ids):
        booking_id = _create_and_confirm_booking(
            db_session,
            user_id,
            restaurant_id,
            datetime.utcnow() - timedelta(days=5 - idx),
        )
        create_booking_review(
            booking_id=booking_id,
            payload=ReviewCreate(rating=idx + 3, review_text=f"Review {idx + 1}"),
            user_id=user_id,
            db=db_session,
        )

    response = get_restaurant_reviews(restaurant_id=restaurant_id, limit=1, offset=1, db=db_session)

    assert response.limit == 1
    assert response.offset == 1
    assert len(response.reviews) == 1
    assert response.reviews[0].user_name == "User Two"
