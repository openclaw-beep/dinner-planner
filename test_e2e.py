#!/usr/bin/env python3
from __future__ import annotations

import os
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any
from uuid import uuid4

import requests

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.api.routes.bookings import create_booking, create_booking_review, get_booking  # noqa: E402
from app.api.routes.bookings import list_bookings as list_bookings_route  # noqa: E402
from app.api.routes.bookings import confirm_booking  # noqa: E402
from app.api.routes.restaurants import (  # noqa: E402
    create_restaurant,
    get_restaurant,
    get_restaurant_availability,
    get_restaurant_rating,
    get_restaurant_reviews,
    restaurant_search,
)
from app.api.routes.users import create_user  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.schemas.booking import BookingCreate  # noqa: E402
from app.schemas.restaurant import RestaurantCreate  # noqa: E402
from app.schemas.review import ReviewCreate  # noqa: E402
from app.schemas.user import UserCreate  # noqa: E402

TIMEOUT_SECONDS = 8
API_CANDIDATES = [
    os.getenv("API_BASE_URL", "").strip(),
    "http://localhost:8080",
    "http://localhost:8000",
    "https://dinner-planner-backend.fly.dev",
]
FRONTEND_CANDIDATES = [
    os.getenv("FRONTEND_URL", "").strip(),
    "http://localhost:3000",
    "https://dinner.rgcsagents.cloud",
]


@dataclass
class E2EResult:
    passed: int = 0
    total: int = 4
    critical_issues: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    scenario_status: dict[str, bool] = field(default_factory=dict)

    def record(self, scenario: str, ok: bool, message: str | None = None) -> None:
        self.scenario_status[scenario] = ok
        if ok:
            self.passed += 1
        elif message:
            self.critical_issues.append(f"{scenario}: {message}")


def _unique_phone() -> str:
    return f"+1555{int(time.time() * 1000) % 10**7:07d}{int(uuid4().int % 100):02d}"


def _pick_live_url(candidates: list[str]) -> str | None:
    for candidate in candidates:
        if not candidate:
            continue
        try:
            response = requests.get(f"{candidate}/health", timeout=TIMEOUT_SECONDS)
            if response.status_code == 200:
                return candidate
        except requests.RequestException:
            continue
    return None


def _verify_frontend(urls: list[str], result: E2EResult) -> None:
    for url in urls:
        if not url:
            continue
        try:
            response = requests.get(url, timeout=TIMEOUT_SECONDS)
            if response.status_code < 500:
                return
        except requests.RequestException:
            continue
    result.warnings.append("Frontend not reachable from this environment; verified backend flow only.")


def run_live_http(base_url: str, result: E2EResult) -> None:
    session = requests.Session()
    admin_token = os.getenv("ADMIN_API_TOKEN", "").strip()
    city = f"E2ECity{uuid4().hex[:6]}"
    date_str = (datetime.now(timezone.utc) + timedelta(days=7)).date().isoformat()

    restaurant_payload = {
        "name": f"E2E Italian Vegan {uuid4().hex[:6]}",
        "cuisine": "Italian",
        "city": city,
        "address": "100 E2E Ave",
        "capacity": 30,
        "average_price_per_guest": "35.00",
    }
    restaurant_resp = session.post(f"{base_url}/restaurants", json=restaurant_payload, timeout=TIMEOUT_SECONDS)
    assert restaurant_resp.status_code == 201, restaurant_resp.text
    restaurant_id = restaurant_resp.json()["id"]

    scenario_1 = "Scenario 1: Restaurant Search & Filter"
    search_resp = session.get(
        f"{base_url}/restaurants/search",
        params={
            "date": date_str,
            "time": "19:00",
            "party_size": 2,
            "city": city,
            "cuisine": "italian",
            "price": "$$",
            "dietary": "vegan",
        },
        timeout=TIMEOUT_SECONDS,
    )
    if search_resp.status_code != 200:
        result.record(scenario_1, False, f"search endpoint failed ({search_resp.status_code})")
    else:
        rows = search_resp.json().get("results", [])
        ok = all(
            "italian" in str(item.get("cuisine", "")).lower()
            and item.get("price_tier") == "$$"
            and "vegan" in (item.get("dietary_options") or [])
            for item in rows
        )
        result.record(scenario_1, ok, "results do not match cuisine/price/dietary filters")

    scenario_2 = "Scenario 2: Restaurant Selection & Review Display"
    detail = session.get(f"{base_url}/restaurants/id/{restaurant_id}", timeout=TIMEOUT_SECONDS)
    reviews = session.get(f"{base_url}/restaurants/{restaurant_id}/reviews", timeout=TIMEOUT_SECONDS)
    rating = session.get(f"{base_url}/restaurants/{restaurant_id}/rating", timeout=TIMEOUT_SECONDS)
    slots = session.get(
        f"{base_url}/restaurants/{restaurant_id}/availability",
        params={"date": date_str},
        timeout=TIMEOUT_SECONDS,
    )
    ok_2 = (
        detail.status_code == 200
        and reviews.status_code == 200
        and rating.status_code == 200
        and slots.status_code == 200
        and isinstance(rating.json().get("average"), (int, float))
        and len(slots.json().get("slots", [])) > 0
    )
    result.record(scenario_2, ok_2, "restaurant detail/review/rating/timeslot endpoints are not all healthy")

    scenario_3 = "Scenario 3: Booking Flow"
    user_resp = session.post(
        f"{base_url}/users",
        json={"name": "E2E Booker", "phone_number": _unique_phone()},
        timeout=TIMEOUT_SECONDS,
    )
    if user_resp.status_code != 201:
        result.record(scenario_3, False, "user creation failed")
        return
    user_id = user_resp.json()["id"]
    user_token = user_resp.json().get("auth_token", "")
    reservation_at = (datetime.now(timezone.utc) + timedelta(days=2)).replace(minute=0, second=0, microsecond=0)
    booking_resp = session.post(
        f"{base_url}/bookings",
        json={
            "user_id": user_id,
            "restaurant_id": restaurant_id,
            "reservation_at": reservation_at.isoformat(),
            "party_size": 2,
        },
        headers={"x-user-token": user_token},
        timeout=TIMEOUT_SECONDS,
    )
    if booking_resp.status_code != 201:
        result.record(scenario_3, False, "booking creation failed")
        return
    booking = booking_resp.json()
    booking_id = booking["id"]
    booking_get = session.get(
        f"{base_url}/bookings/{booking_id}",
        params={"user_id": user_id},
        headers={"x-user-token": user_token},
        timeout=TIMEOUT_SECONDS,
    )
    booking_list_ok = False
    if admin_token:
        booking_list = session.get(
            f"{base_url}/bookings",
            headers={"x-admin-token": admin_token},
            timeout=TIMEOUT_SECONDS,
        )
        booking_list_ok = booking_list.status_code == 200 and any(item.get("id") == booking_id for item in booking_list.json())
    else:
        result.warnings.append("ADMIN_API_TOKEN not set; skipped /bookings admin list verification in live-http mode.")
    ok_3 = (
        isinstance(booking.get("confirmation_code"), str)
        and len(booking["confirmation_code"]) == 6
        and booking_get.status_code == 200
        and (booking_list_ok or booking_get.json().get("id") == booking_id)
    )
    result.record(scenario_3, ok_3, "confirmation code or persisted booking check failed")

    scenario_4 = "Scenario 4: Review Submission"
    past_booking_resp = session.post(
        f"{base_url}/bookings",
        json={
            "user_id": user_id,
            "restaurant_id": restaurant_id,
            "reservation_at": (datetime.now(timezone.utc) - timedelta(days=2)).replace(microsecond=0).isoformat(),
            "party_size": 2,
        },
        headers={"x-user-token": user_token},
        timeout=TIMEOUT_SECONDS,
    )
    if past_booking_resp.status_code != 201:
        result.record(scenario_4, False, "unable to create completed booking seed")
        return
    past_booking_id = past_booking_resp.json()["id"]
    if admin_token:
        confirm = session.post(
            f"{base_url}/bookings/{past_booking_id}/confirm",
            headers={"x-admin-token": admin_token},
            timeout=TIMEOUT_SECONDS,
        )
    else:
        confirm = requests.Response()
        confirm.status_code = 401
        result.warnings.append("ADMIN_API_TOKEN not set; confirm step in review scenario may fail in live-http mode.")
    review = session.post(
        f"{base_url}/bookings/{past_booking_id}/review",
        json={"rating": 5, "review_text": "Excellent service"},
        headers={"x-user-token": user_token},
        timeout=TIMEOUT_SECONDS,
    )
    page_reviews = session.get(f"{base_url}/restaurants/{restaurant_id}/reviews", timeout=TIMEOUT_SECONDS)
    review_rows = page_reviews.json().get("reviews", []) if page_reviews.status_code == 200 else []
    ok_4 = (
        confirm.status_code == 200
        and review.status_code == 201
        and review.json().get("verified") is True
        and any(row.get("rating") == 5 for row in review_rows)
    )
    result.record(scenario_4, ok_4, "review creation/list/verified badge contract failed")


def run_local_route_mode(result: E2EResult) -> None:
    Base.metadata.create_all(bind=engine)
    date_str = (datetime.now(timezone.utc) + timedelta(days=7)).date().isoformat()
    scenario_1 = "Scenario 1: Restaurant Search & Filter"
    scenario_2 = "Scenario 2: Restaurant Selection & Review Display"
    scenario_3 = "Scenario 3: Booking Flow"
    scenario_4 = "Scenario 4: Review Submission"

    with SessionLocal() as db:
        restaurant = create_restaurant(
            RestaurantCreate(
                name=f"E2E Italian Vegan {uuid4().hex[:6]}",
                cuisine="Italian",
                city=f"E2ECity{uuid4().hex[:6]}",
                address="100 E2E Ave",
                capacity=30,
                average_price_per_guest=Decimal("35.00"),
            ),
            db,
        )
        rows = restaurant_search(
            date=date_str,
            time="19:00",
            party_size=2,
            city=restaurant.city,
            cuisine="italian",
            price="$$",
            dietary="vegan",
            db=db,
        ).results
        ok_1 = all(
            "italian" in item.cuisine.lower()
            and item.price_tier == "$$"
            and item.dietary_options
            and "vegan" in item.dietary_options
            for item in rows
        )
        result.record(scenario_1, ok_1, "search filter contract failed in local route mode")

        detail = get_restaurant(restaurant.id, db)
        reviews = get_restaurant_reviews(restaurant.id, limit=10, offset=0, db=db)
        rating = get_restaurant_rating(restaurant.id, db=db)
        slots = get_restaurant_availability(restaurant.id, date=date_str, db=db)
        ok_2 = (
            detail.id == restaurant.id
            and isinstance(reviews.reviews, list)
            and isinstance(rating.average, float)
            and len(slots.slots) > 0
        )
        result.record(scenario_2, ok_2, "detail/review/rating/availability contract failed")

        user = create_user(UserCreate(name="E2E Booker", phone_number=_unique_phone()), db)
        booking = create_booking(
            BookingCreate(
                user_id=user.id,
                restaurant_id=restaurant.id,
                reservation_at=(datetime.now(timezone.utc) + timedelta(days=2)).replace(minute=0, second=0, microsecond=0),
                party_size=2,
            ),
            db,
        )
        booking_fetched = get_booking(booking_id=booking.id, user_id=user.id, db=db)
        booking_rows = list_bookings_route(
            restaurant_id=None,
            status_filter=None,
            from_time=None,
            to_time=None,
            db=db,
        )
        ok_3 = (
            len(booking.confirmation_code) == 6
            and booking_fetched.id == booking.id
            and any(item.id == booking.id for item in booking_rows)
        )
        result.record(scenario_3, ok_3, "booking confirmation/persistence failed")

        completed_booking = create_booking(
            BookingCreate(
                user_id=user.id,
                restaurant_id=restaurant.id,
                reservation_at=(datetime.now(timezone.utc) - timedelta(days=2)).replace(microsecond=0),
                party_size=2,
            ),
            db,
        )
        confirm_booking(completed_booking.id, db)
        created_review = create_booking_review(
            booking_id=completed_booking.id,
            payload=ReviewCreate(rating=5, review_text="Excellent service"),
            user_id=user.id,
            db=db,
        )
        review_rows = get_restaurant_reviews(restaurant.id, limit=10, offset=0, db=db).reviews
        ok_4 = created_review.verified and any(item.rating == 5 for item in review_rows)
        result.record(scenario_4, ok_4, "review did not persist as verified on restaurant page")


def main() -> int:
    result = E2EResult()
    live_base_url = _pick_live_url(API_CANDIDATES)

    if live_base_url:
        print(f"[mode] live-http: {live_base_url}")
        run_live_http(live_base_url, result)
    else:
        result.warnings.append("Live backend unreachable; executed local route-level fallback.")
        print("[mode] local-route-fallback")
        run_local_route_mode(result)

    _verify_frontend(FRONTEND_CANDIDATES, result)

    print("\nScenario Results:")
    for name, ok in result.scenario_status.items():
        print(f"- {name}: {'PASS' if ok else 'FAIL'}")

    if result.critical_issues:
        print("\nCritical Issues:")
        for issue in result.critical_issues:
            print(f"- {issue}")

    if result.warnings:
        print("\nWarnings:")
        for warning in result.warnings:
            print(f"- {warning}")

    summary = (
        f"E2E tests: {result.passed}/{result.total} scenarios passing, "
        f"{len(result.critical_issues)} critical issues, {len(result.warnings)} warnings"
    )
    print(f"\n{summary}")
    return 1 if result.passed != result.total else 0


if __name__ == "__main__":
    raise SystemExit(main())
