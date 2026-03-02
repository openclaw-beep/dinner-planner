from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BookingStatus


class BookingCreate(BaseModel):
    user_id: int | None = None
    restaurant_id: int
    reservation_at: datetime
    party_size: int = Field(gt=0, le=30)


class BookingRead(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    reservation_at: datetime
    party_size: int
    status: BookingStatus
    confirmation_code: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingStatusUpdateResponse(BaseModel):
    id: int
    status: BookingStatus
