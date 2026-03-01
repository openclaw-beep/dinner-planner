"""Mock fixtures for Twilio WhatsApp harness tests."""

from __future__ import annotations

from datetime import datetime, timedelta

NOW = datetime.now().replace(second=0, microsecond=0)

MOCK_RESTAURANTS = [
    {
        "id": "r1",
        "name": "Pasta House",
        "cuisine": "Italian",
        "capacity": 18,
        "phone_number": "whatsapp:+14155550101",
    },
    {
        "id": "r2",
        "name": "Krong Thai",
        "cuisine": "Thai",
        "capacity": 20,
        "phone_number": "whatsapp:+14155550102",
    },
    {
        "id": "r3",
        "name": "Sushi Bay",
        "cuisine": "Japanese",
        "capacity": 12,
        "phone_number": "whatsapp:+14155550103",
    },
]

MOCK_USER_REQUESTS = {
    "parse_dinner": "dinner for 4 tomorrow at 7pm",
    "search_italian": "Italian food Friday 8pm",
    "invalid": "book something maybe whenever",
}

MOCK_RESTAURANT_RESPONSES = {
    "confirm_yes": "YES",
    "deny": "NO",
}


def next_friday_8pm() -> datetime:
    """Deterministic-ish helper for Friday 8pm used in tests."""
    base = NOW + timedelta(days=1)
    while base.weekday() != 4:
        base += timedelta(days=1)
    return base.replace(hour=20, minute=0)
