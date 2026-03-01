import secrets
import string
from datetime import datetime, timedelta

from sqlalchemy import Select, and_, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.restaurant import Restaurant

CODE_ALPHABET = string.ascii_uppercase + string.digits


def generate_confirmation_code(db: Session) -> str:
    for _ in range(20):
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        exists = db.scalar(select(Booking.id).where(Booking.confirmation_code == code))
        if not exists:
            return code
    raise RuntimeError("Unable to generate unique confirmation code")


def has_capacity_conflict(
    db: Session, restaurant_id: int, reservation_at: datetime, party_size: int, booking_id_exclude: int | None = None
) -> bool:
    # Keep a 2-hour seating window to approximate overlapping reservations.
    start = reservation_at - timedelta(hours=2)
    end = reservation_at + timedelta(hours=2)

    query: Select[tuple[int, int]] = select(Booking.id, Booking.party_size).where(
        and_(
            Booking.restaurant_id == restaurant_id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.reservation_at >= start,
            Booking.reservation_at <= end,
        )
    )
    bookings = db.execute(query).all()

    if booking_id_exclude is not None:
        bookings = [b for b in bookings if b.id != booking_id_exclude]

    reserved_total = sum(item.party_size for item in bookings)
    capacity = db.scalar(select(Restaurant.capacity).where(Restaurant.id == restaurant_id))
    if capacity is None:
        return True

    return reserved_total + party_size > capacity
