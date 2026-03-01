from datetime import datetime

from pydantic import BaseModel


class WhatsAppWebhookPayload(BaseModel):
    From: str
    Body: str
    MessageSid: str


class ParsedBookingIntent(BaseModel):
    restaurant_name: str | None = None
    party_size: int | None = None
    reservation_at: datetime | None = None
