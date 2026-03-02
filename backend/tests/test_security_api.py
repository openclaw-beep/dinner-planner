from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException

from app.api.deps.auth import AdminContext
from app.api.routes.bookings import confirm_booking, create_booking, create_booking_review, get_booking
from app.api.routes.restaurants import create_restaurant
from app.api.routes.users import create_user
from app.schemas.booking import BookingCreate
from app.schemas.restaurant import RestaurantCreate
from app.schemas.review import ReviewCreate
from app.schemas.user import UserCreate


def _create_user(db_session, name: str, phone: str):
    return create_user(UserCreate(name=name, phone_number=phone), db_session)


def _create_restaurant(db_session, name: str):
    return create_restaurant(
        RestaurantCreate(
            name=name,
            cuisine="Italian",
            city="San Francisco",
            address="123 Mission St",
            capacity=40,
            average_price_per_guest=Decimal("55.00"),
        ),
        db_session,
    )


def _create_booking(db_session, user_id: int, restaurant_id: int, reservation_at: datetime):
    return create_booking(
        BookingCreate(
            user_id=user_id,
            restaurant_id=restaurant_id,
            reservation_at=reservation_at,
            party_size=2,
        ),
        db_session,
    )


def test_booking_access_enforces_ownership(db_session):
    alice = _create_user(db_session, "Alice", "+15551110001")
    bob = _create_user(db_session, "Bob", "+15551110002")
    restaurant = _create_restaurant(db_session, "Ownership Check")
    booking = _create_booking(db_session, alice.id, restaurant.id, datetime.now(timezone.utc) + timedelta(days=1))

    owned = get_booking(booking.id, user_id=alice.id, db=db_session)
    assert owned.id == booking.id

    try:
        get_booking(booking.id, user_id=bob.id, db=db_session)
        assert False, "Expected ownership check to fail"
    except HTTPException as exc:
        assert exc.status_code == 403


def test_xss_payload_is_sanitized_in_review_submission(db_session):
    user = _create_user(db_session, "Reviewer", "+15551110003")
    restaurant = _create_restaurant(db_session, "XSS Check")

    booking = _create_booking(db_session, user.id, restaurant.id, datetime.now(timezone.utc) - timedelta(days=2))
    confirm_booking(booking.id, db_session)

    review = create_booking_review(
        booking_id=booking.id,
        payload=ReviewCreate(rating=5, review_text="<script>alert('xss')</script> excellent"),
        user_id=user.id,
        db=db_session,
    )

    assert "<script>" not in review.review_text
    assert "&lt;script&gt;" in review.review_text


def test_sqli_style_input_is_stored_as_plain_text(db_session):
    user = _create_user(db_session, "SQL Tester", "+15551110004")
    restaurant = _create_restaurant(db_session, "SQLi Check")

    booking = _create_booking(db_session, user.id, restaurant.id, datetime.now(timezone.utc) - timedelta(days=3))
    confirm_booking(booking.id, db_session)

    review = create_booking_review(
        booking_id=booking.id,
        payload=ReviewCreate(rating=4, review_text="' OR 1=1 --"),
        user_id=user.id,
        db=db_session,
    )
    assert review.review_text == "' OR 1=1 --"


def test_booking_admin_scope_blocks_cross_restaurant_updates(db_session):
    user = _create_user(db_session, "Scope Tester", "+15551110005")
    restaurant_a = _create_restaurant(db_session, "Scope A")
    restaurant_b = _create_restaurant(db_session, "Scope B")

    booking = _create_booking(db_session, user.id, restaurant_b.id, datetime.now(timezone.utc) + timedelta(days=2))

    try:
        confirm_booking(booking.id, db_session, admin_context=AdminContext(restaurant_id=restaurant_a.id))
        assert False, "Expected admin scope check to fail"
    except HTTPException as exc:
        assert exc.status_code == 403
