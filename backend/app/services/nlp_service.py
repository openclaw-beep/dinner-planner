import re
from datetime import datetime

from dateutil import parser

from app.schemas.webhook import ParsedBookingIntent

PARTY_RE = re.compile(r"(?:for|party of)\s+(\d{1,2})", re.IGNORECASE)
AT_RE = re.compile(r"at\s+([a-zA-Z0-9'\-\s]+?)(?:\s+for|\s+on|\s+tomorrow|\s+today|$)", re.IGNORECASE)


def parse_booking_intent(message: str) -> ParsedBookingIntent:
    party_size = None
    restaurant_name = None
    reservation_at = None

    party_match = PARTY_RE.search(message)
    if party_match:
        party_size = int(party_match.group(1))

    restaurant_match = AT_RE.search(message)
    if restaurant_match:
        restaurant_name = restaurant_match.group(1).strip()

    try:
        reservation_at = parser.parse(message, fuzzy=True)
    except (parser.ParserError, ValueError, TypeError, OverflowError):
        reservation_at = None

    # Ignore likely false positives where parser only gives current date/time.
    if reservation_at and abs((reservation_at - datetime.now()).total_seconds()) < 30:
        reservation_at = None

    return ParsedBookingIntent(
        restaurant_name=restaurant_name or None,
        party_size=party_size,
        reservation_at=reservation_at,
    )
