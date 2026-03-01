from datetime import datetime, timedelta
from decimal import Decimal

from app.api.routes.bookings import confirm_booking, create_booking, deny_booking
from app.api.routes.restaurants import restaurant_search
from app.api.routes.users import create_user
from app.api.routes.webhooks import generate_monthly_invoices, whatsapp_webhook
from app.models.restaurant import Restaurant
from app.schemas.booking import BookingCreate
from app.schemas.restaurant import RestaurantCreate
from app.schemas.user import UserCreate
from app.schemas.webhook import WhatsAppWebhookPayload


def _create_restaurant(db_session, name="Krong Thai", capacity=20, avg_price=Decimal("50.00")):
    return Restaurant(**RestaurantCreate(
        name=name,
        cuisine="Thai",
        city="San Francisco",
        address="123 Market St",
        capacity=capacity,
        average_price_per_guest=avg_price,
    ).model_dump())


def test_restaurant_search_by_datetime_and_party_size(db_session):
    user = create_user(UserCreate(name="Alice", phone_number="+15550001111"), db_session)

    restaurant = _create_restaurant(db_session)
    db_session.add(restaurant)
    db_session.commit()
    db_session.refresh(restaurant)

    reservation_time = (datetime.utcnow() + timedelta(days=2)).replace(minute=0, second=0, microsecond=0)
    booking = create_booking(
        BookingCreate(
            user_id=user.id,
            restaurant_id=restaurant.id,
            reservation_at=reservation_time,
            party_size=8,
        ),
        db_session,
    )
    confirm_booking(booking.id, db_session)

    result = restaurant_search(
        date=reservation_time.date().isoformat(),
        time=reservation_time.strftime("%H:%M"),
        party_size=15,
        city=None,
        db=db_session,
    )

    assert result.party_size == 15
    assert len(result.results) == 1
    assert result.results[0].available is False


def test_booking_flow_create_confirm_and_deny_rules(db_session):
    user = create_user(UserCreate(name="Alice", phone_number="+15550001111"), db_session)

    restaurant = _create_restaurant(db_session, capacity=10)
    db_session.add(restaurant)
    db_session.commit()
    db_session.refresh(restaurant)

    reservation_time = (datetime.utcnow() + timedelta(days=1)).replace(minute=0, second=0, microsecond=0)
    booking = create_booking(
        BookingCreate(
            user_id=user.id,
            restaurant_id=restaurant.id,
            reservation_at=reservation_time,
            party_size=4,
        ),
        db_session,
    )

    assert len(booking.confirmation_code) == 6
    assert booking.status.value == "pending"

    confirm_result = confirm_booking(booking.id, db_session)
    assert confirm_result.status.value == "confirmed"

    try:
        deny_booking(booking.id, db_session)
        assert False, "Expected deny after confirm to fail"
    except Exception as exc:
        assert "cannot be denied" in str(exc.detail).lower()


def test_whatsapp_webhook_parses_intent():
    result = whatsapp_webhook(
        payload=WhatsAppWebhookPayload(
            From="whatsapp:+15550001111",
            Body="Book at Krong Thai tomorrow 7pm for 4",
            MessageSid="SM123",
        ),
        x_twilio_signature=None,
    )
    assert result.restaurant_name is not None
    assert result.party_size == 4


def test_monthly_invoice_generation(db_session):
    user = create_user(UserCreate(name="Alice", phone_number="+15550001111"), db_session)

    restaurant = _create_restaurant(db_session, avg_price=Decimal("100.00"))
    db_session.add(restaurant)
    db_session.commit()
    db_session.refresh(restaurant)

    reservation_time = (datetime.utcnow() - timedelta(days=10)).replace(minute=0, second=0, microsecond=0)
    booking = create_booking(
        BookingCreate(
            user_id=user.id,
            restaurant_id=restaurant.id,
            reservation_at=reservation_time,
            party_size=5,
        ),
        db_session,
    )
    confirm_booking(booking.id, db_session)

    month = reservation_time.strftime("%Y-%m")
    invoices = generate_monthly_invoices(db=db_session, month=month)

    assert len(invoices) == 1
    assert invoices[0].restaurant_id == restaurant.id
    assert invoices[0].booking_count == 1
    assert invoices[0].gross_booking_value == Decimal("500.00")
    assert invoices[0].commission_amount == Decimal("50.00")
