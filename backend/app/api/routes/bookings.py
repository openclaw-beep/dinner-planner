from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.restaurant import Restaurant
from app.schemas.booking import BookingCreate, BookingRead, BookingStatusUpdateResponse
from app.services.booking_service import generate_confirmation_code, has_capacity_conflict

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=list[BookingRead])
def list_bookings(
    restaurant_id: int | None = Query(None),
    status_filter: BookingStatus | None = Query(None, alias="status"),
    from_time: datetime | None = Query(None),
    to_time: datetime | None = Query(None),
    db: Session = Depends(get_db),
) -> list[Booking]:
    query = select(Booking).order_by(Booking.reservation_at.desc(), Booking.id.desc())

    if restaurant_id is not None:
        query = query.where(Booking.restaurant_id == restaurant_id)

    if status_filter is not None:
        query = query.where(Booking.status == status_filter)

    if from_time is not None:
        query = query.where(Booking.reservation_at >= from_time)

    if to_time is not None:
        query = query.where(Booking.reservation_at <= to_time)

    return list(db.scalars(query).all())


@router.post("", response_model=BookingRead, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)) -> Booking:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == payload.restaurant_id))
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if payload.party_size > restaurant.capacity:
        raise HTTPException(status_code=400, detail="Party size exceeds restaurant capacity")

    if has_capacity_conflict(db, payload.restaurant_id, payload.reservation_at, payload.party_size):
        raise HTTPException(status_code=409, detail="Restaurant capacity unavailable for requested time")

    booking = Booking(
        **payload.model_dump(),
        confirmation_code=generate_confirmation_code(db),
        status=BookingStatus.PENDING,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/{booking_id}", response_model=BookingRead)
def get_booking(booking_id: int, db: Session = Depends(get_db)) -> Booking:
    booking = db.scalar(select(Booking).where(Booking.id == booking_id))
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.post("/{booking_id}/confirm", response_model=BookingStatusUpdateResponse)
def confirm_booking(booking_id: int, db: Session = Depends(get_db)) -> BookingStatusUpdateResponse:
    booking = db.scalar(select(Booking).where(Booking.id == booking_id))
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == BookingStatus.DENIED:
        raise HTTPException(status_code=409, detail="Denied booking cannot be confirmed")

    if has_capacity_conflict(db, booking.restaurant_id, booking.reservation_at, booking.party_size, booking_id_exclude=booking.id):
        raise HTTPException(status_code=409, detail="Restaurant capacity unavailable for requested time")

    booking.status = BookingStatus.CONFIRMED
    db.add(booking)
    db.commit()
    return BookingStatusUpdateResponse(id=booking.id, status=booking.status)


@router.post("/{booking_id}/deny", response_model=BookingStatusUpdateResponse)
def deny_booking(booking_id: int, db: Session = Depends(get_db)) -> BookingStatusUpdateResponse:
    booking = db.scalar(select(Booking).where(Booking.id == booking_id))
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == BookingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Confirmed booking cannot be denied without cancellation flow",
        )

    booking.status = BookingStatus.DENIED
    db.add(booking)
    db.commit()
    return BookingStatusUpdateResponse(id=booking.id, status=booking.status)
