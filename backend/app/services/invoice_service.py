from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.booking import Booking
from app.models.enums import BookingStatus, InvoiceStatus
from app.models.invoice import Invoice
from app.models.restaurant import Restaurant


def calculate_booking_value(booking: Booking, restaurant: Restaurant) -> Decimal:
    return Decimal(booking.party_size) * restaurant.average_price_per_guest


def create_monthly_invoices(db: Session, period_start: date, period_end: date) -> list[Invoice]:
    restaurants = db.scalars(select(Restaurant)).all()
    invoices: list[Invoice] = []
    commission_rate = Decimal(str(settings.commission_rate))

    for restaurant in restaurants:
        bookings = db.scalars(
            select(Booking).where(
                and_(
                    Booking.restaurant_id == restaurant.id,
                    Booking.status == BookingStatus.CONFIRMED,
                    Booking.reservation_at >= datetime.combine(period_start, datetime.min.time()),
                    Booking.reservation_at <= datetime.combine(period_end, datetime.max.time()),
                )
            )
        ).all()

        if not bookings:
            continue

        gross = sum((calculate_booking_value(b, restaurant) for b in bookings), Decimal("0.00"))
        commission = (gross * commission_rate).quantize(Decimal("0.01"))

        invoice = Invoice(
            restaurant_id=restaurant.id,
            period_start=period_start,
            period_end=period_end,
            booking_count=len(bookings),
            gross_booking_value=gross,
            commission_amount=commission,
            status=InvoiceStatus.DRAFT,
        )
        db.add(invoice)
        invoices.append(invoice)

    db.commit()

    for invoice in invoices:
        db.refresh(invoice)

    return invoices
