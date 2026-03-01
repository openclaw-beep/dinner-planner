"""Executable Twilio harness integration checks.

Run:
    python backend/twilio_test/test_webhook.py
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from twilio_test.mock_data import (  # noqa: E402
    MOCK_RESTAURANT_RESPONSES,
    MOCK_RESTAURANTS,
    MOCK_USER_REQUESTS,
)
from twilio_test.simulator import WhatsAppSimulator  # noqa: E402


def _assert(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def test_case_1_parse_dinner_message() -> None:
    sim = WhatsAppSimulator(restaurants=MOCK_RESTAURANTS)
    result = sim.mock_incoming_user_message(
        from_number="whatsapp:+15550001111",
        body=MOCK_USER_REQUESTS["parse_dinner"],
    )
    parsed = result["parsed"]
    _assert(result["status"] == "restaurant_contacted", "Case 1 expected restaurant_contacted")
    _assert(parsed["party_size"] == 4, "Case 1 expected party size 4")
    _assert(parsed["reservation_at"] is not None, "Case 1 expected parsed reservation datetime")

    expected_hour = 19
    actual_hour = parsed["reservation_at"].hour
    _assert(actual_hour == expected_hour, f"Case 1 expected hour {expected_hour}, got {actual_hour}")

    now = datetime.now()
    delta = parsed["reservation_at"] - now
    _assert(-timedelta(hours=1) <= delta <= timedelta(days=7), "Case 1 parsed date fell outside expected range")


def test_case_2_italian_food_search() -> None:
    sim = WhatsAppSimulator(restaurants=MOCK_RESTAURANTS)
    result = sim.mock_incoming_user_message(
        from_number="whatsapp:+15550001111",
        body=MOCK_USER_REQUESTS["search_italian"],
    )
    _assert(result["status"] == "restaurant_contacted", "Case 2 expected restaurant_contacted")
    _assert("Pasta House" in result["candidate_restaurants"], "Case 2 expected Italian restaurant match")
    _assert(result["contacted_restaurant"] == "Pasta House", "Case 2 should contact Pasta House first")


def test_case_3_yes_confirms_booking() -> None:
    sim = WhatsAppSimulator(restaurants=MOCK_RESTAURANTS)
    creation = sim.mock_incoming_user_message(
        from_number="whatsapp:+15550002222",
        body="dinner for 3 tomorrow at 8pm",
    )
    _assert(creation["status"] == "restaurant_contacted", "Case 3 setup failed")

    confirm = sim.mock_incoming_restaurant_message(
        from_number="whatsapp:+14155550101",
        body=MOCK_RESTAURANT_RESPONSES["confirm_yes"],
    )
    _assert(confirm["status"] == "booking_confirmed", "Case 3 expected booking_confirmed")
    _assert(confirm["party_size"] == 3, "Case 3 expected party size 3")


def test_case_4_invalid_inputs() -> None:
    sim = WhatsAppSimulator(restaurants=MOCK_RESTAURANTS)
    bad_user = sim.mock_incoming_user_message(
        from_number="whatsapp:+15550003333",
        body=MOCK_USER_REQUESTS["invalid"],
    )
    _assert(bad_user["status"] == "error", "Case 4 expected user parsing error")

    bad_restaurant = sim.mock_incoming_restaurant_message(
        from_number="whatsapp:+14155559999",
        body="MAYBE",
    )
    _assert(bad_restaurant["status"] == "error", "Case 4 expected restaurant response error")


def run_all() -> None:
    test_case_1_parse_dinner_message()
    print("PASS: 'dinner for 4 tomorrow at 7pm' parsed correctly")

    test_case_2_italian_food_search()
    print("PASS: 'Italian food Friday 8pm' triggered restaurant search")

    test_case_3_yes_confirms_booking()
    print("PASS: 'YES' from restaurant confirmed booking")

    test_case_4_invalid_inputs()
    print("PASS: invalid inputs returned error handling")

    print("\nAll Twilio harness integration checks passed.")


if __name__ == "__main__":
    run_all()
