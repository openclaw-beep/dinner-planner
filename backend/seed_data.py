"""Seed sample Ottawa restaurant data for MVP testing.

Usage:
    python seed_data.py
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import select

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.restaurant import Restaurant


@dataclass(frozen=True)
class SeedRestaurant:
    name: str
    cuisine: str
    city: str
    address: str
    capacity: int
    average_price_per_guest: Decimal
    operating_hours: dict[str, str]


SEED_RESTAURANTS: list[SeedRestaurant] = [
    SeedRestaurant(
        name="Gezellig",
        cuisine="Contemporary Canadian",
        city="Ottawa",
        address="337 Richmond Rd, Ottawa, ON K2A 0E7",
        capacity=90,
        average_price_per_guest=Decimal("58.00"),
        operating_hours={
            "weekday": "Tue-Thu 5:00 PM-10:00 PM",
            "weekend": "Fri-Sat 5:00 PM-10:30 PM, Sun 5:00 PM-9:00 PM",
        },
    ),
    SeedRestaurant(
        name="North & Navy",
        cuisine="Italian",
        city="Ottawa",
        address="226 Nepean St, Ottawa, ON K2P 0B8",
        capacity=75,
        average_price_per_guest=Decimal("72.00"),
        operating_hours={
            "weekday": "Wed-Thu 5:00 PM-10:00 PM",
            "weekend": "Fri-Sat 5:00 PM-11:00 PM, Sun 5:00 PM-9:30 PM",
        },
    ),
    SeedRestaurant(
        name="Stofa Restaurant",
        cuisine="Modern European",
        city="Ottawa",
        address="1356 Wellington St W, Ottawa, ON K1Y 3C3",
        capacity=40,
        average_price_per_guest=Decimal("95.00"),
        operating_hours={
            "weekday": "Wed-Thu 5:00 PM-10:00 PM",
            "weekend": "Fri-Sat 5:00 PM-10:30 PM, Sun 5:00 PM-9:00 PM",
        },
    ),
    SeedRestaurant(
        name="Soca Kitchen",
        cuisine="Latin Caribbean",
        city="Ottawa",
        address="93 Holland Ave, Ottawa, ON K1Y 0Y1",
        capacity=70,
        average_price_per_guest=Decimal("48.00"),
        operating_hours={
            "weekday": "Tue-Thu 5:00 PM-10:00 PM",
            "weekend": "Fri-Sat 5:00 PM-11:00 PM, Sun 5:00 PM-9:00 PM",
        },
    ),
    SeedRestaurant(
        name="Pure Kitchen Westboro",
        cuisine="Vegetarian",
        city="Ottawa",
        address="357 Richmond Rd, Ottawa, ON K2A 0E7",
        capacity=110,
        average_price_per_guest=Decimal("32.00"),
        operating_hours={
            "weekday": "Mon-Thu 11:30 AM-9:00 PM",
            "weekend": "Fri-Sun 11:30 AM-10:00 PM",
        },
    ),
]


def upsert_restaurants() -> tuple[int, int]:
    inserted = 0
    updated = 0

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        for item in SEED_RESTAURANTS:
            existing = db.scalar(
                select(Restaurant).where(
                    Restaurant.name == item.name,
                    Restaurant.address == item.address,
                    Restaurant.city == item.city,
                )
            )
            if existing:
                existing.cuisine = item.cuisine
                existing.capacity = item.capacity
                existing.average_price_per_guest = item.average_price_per_guest
                updated += 1
                continue

            db.add(
                Restaurant(
                    name=item.name,
                    cuisine=item.cuisine,
                    city=item.city,
                    address=item.address,
                    capacity=item.capacity,
                    average_price_per_guest=item.average_price_per_guest,
                )
            )
            inserted += 1

        db.commit()

    return inserted, updated


def validate_seed() -> bool:
    with SessionLocal() as db:
        rows = db.scalars(
            select(Restaurant).where(
                Restaurant.city == "Ottawa",
                Restaurant.name.in_([item.name for item in SEED_RESTAURANTS]),
            )
        ).all()

    by_name = {row.name: row for row in rows}
    is_valid = True
    print("\nValidation report:")
    for item in SEED_RESTAURANTS:
        row = by_name.get(item.name)
        if not row:
            is_valid = False
            print(f"- MISSING: {item.name}")
            continue

        matches = (
            row.cuisine == item.cuisine
            and row.address == item.address
            and row.capacity == item.capacity
            and row.average_price_per_guest == item.average_price_per_guest
        )
        if not matches:
            is_valid = False
            print(f"- MISMATCH: {item.name}")
            continue

        print(
            f"- OK: {item.name} | {item.cuisine} | cap={item.capacity} | avg=${item.average_price_per_guest}"
        )
        print(f"  Hours: weekday={item.operating_hours['weekday']} | weekend={item.operating_hours['weekend']}")

    return is_valid


def main() -> int:
    inserted, updated = upsert_restaurants()
    print(f"Seed complete: inserted={inserted}, updated={updated}")
    valid = validate_seed()
    if not valid:
        print("\nValidation failed.")
        return 1
    print("\nValidation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
