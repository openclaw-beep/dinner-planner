"""Twilio-free WhatsApp simulator for parser + booking flow tests."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from app.services.nlp_service import parse_booking_intent


@dataclass
class PendingRequest:
    request_id: str
    user_number: str
    restaurant_phone: str
    restaurant_name: str
    party_size: int
    reservation_at: datetime
    user_message: str


class WhatsAppSimulator:
    def __init__(self, restaurants: list[dict[str, Any]]):
        self.restaurants = restaurants
        self.pending: dict[str, PendingRequest] = {}
        self.confirmed: list[dict[str, Any]] = []
        self.errors: list[str] = []

    def mock_incoming_user_message(self, from_number: str, body: str) -> dict[str, Any]:
        intent = parse_booking_intent(body)
        party_size = intent.party_size
        reservation_at = intent.reservation_at

        # Fallback for common cuisine-first messages like: "Italian food Friday 8pm"
        cuisine = self._extract_cuisine(body)
        if not party_size:
            party_size = self._extract_party_size(body) or 2

        if not reservation_at:
            return self._error("Could not parse reservation date/time", body)

        matches = self._search_restaurants(intent.restaurant_name, cuisine, party_size)
        if not matches:
            return self._error("No matching restaurants found", body)

        chosen = matches[0]
        request_id = f"REQ-{len(self.pending) + len(self.confirmed) + 1:04d}"
        pending = PendingRequest(
            request_id=request_id,
            user_number=from_number,
            restaurant_phone=chosen["phone_number"],
            restaurant_name=chosen["name"],
            party_size=party_size,
            reservation_at=reservation_at,
            user_message=body,
        )
        self.pending[request_id] = pending

        return {
            "status": "restaurant_contacted",
            "request_id": request_id,
            "parsed": {
                "restaurant_name": intent.restaurant_name,
                "party_size": party_size,
                "reservation_at": reservation_at,
            },
            "candidate_restaurants": [m["name"] for m in matches],
            "contacted_restaurant": chosen["name"],
        }

    def mock_incoming_restaurant_message(self, from_number: str, body: str) -> dict[str, Any]:
        normalized = body.strip().upper()
        pending = self._find_pending_by_restaurant(from_number)
        if not pending:
            return self._error("No pending request for restaurant", body)

        if normalized == "YES":
            confirmation = {
                "request_id": pending.request_id,
                "status": "booking_confirmed",
                "restaurant_name": pending.restaurant_name,
                "user_number": pending.user_number,
                "party_size": pending.party_size,
                "reservation_at": pending.reservation_at,
            }
            self.confirmed.append(confirmation)
            del self.pending[pending.request_id]
            return confirmation

        if normalized == "NO":
            result = {
                "request_id": pending.request_id,
                "status": "booking_denied",
                "restaurant_name": pending.restaurant_name,
            }
            del self.pending[pending.request_id]
            return result

        return self._error("Restaurant response must be YES or NO", body)

    def _extract_cuisine(self, body: str) -> str | None:
        cuisines = {r["cuisine"].lower(): r["cuisine"] for r in self.restaurants}
        lowered = body.lower()
        for key, display in cuisines.items():
            if key in lowered:
                return display
        return None

    def _extract_party_size(self, body: str) -> int | None:
        match = re.search(r"(?:for|party of)\s+(\d{1,2})", body, flags=re.IGNORECASE)
        return int(match.group(1)) if match else None

    def _search_restaurants(
        self,
        restaurant_name: str | None,
        cuisine: str | None,
        party_size: int,
    ) -> list[dict[str, Any]]:
        filtered = self.restaurants
        if restaurant_name:
            name_lower = restaurant_name.lower()
            filtered = [r for r in filtered if name_lower in r["name"].lower()]
        if cuisine:
            filtered = [r for r in filtered if r["cuisine"].lower() == cuisine.lower()]
        filtered = [r for r in filtered if r["capacity"] >= party_size]
        return filtered

    def _find_pending_by_restaurant(self, from_number: str) -> PendingRequest | None:
        for item in self.pending.values():
            if item.restaurant_phone == from_number:
                return item
        return None

    def _error(self, detail: str, body: str) -> dict[str, Any]:
        msg = f"{detail}: {body}"
        self.errors.append(msg)
        return {"status": "error", "detail": detail, "message": body}
