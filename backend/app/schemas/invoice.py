from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import InvoiceStatus


class InvoiceRead(BaseModel):
    id: int
    restaurant_id: int
    period_start: date
    period_end: date
    booking_count: int
    gross_booking_value: Decimal
    commission_amount: Decimal
    status: InvoiceStatus
    issued_at: datetime

    model_config = ConfigDict(from_attributes=True)
