from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class RestaurantSearchResult(BaseModel):
    id: int
    name: str
    cuisine: str
    city: str
    address: str
    capacity: int
    average_price_per_guest: Decimal
    price_tier: str | None = None
    outdoor_seating: bool | None = None
    dietary_options: list[str] | None = None
    ambiance_tags: list[str] | None = None
    available: bool


class RestaurantSearchResponse(BaseModel):
    date: str
    time: str
    party_size: int
    results: list[RestaurantSearchResult]


class RestaurantAvailabilitySlot(BaseModel):
    time: str
    status: str
    spots_left: int | None


class RestaurantAvailabilityResponse(BaseModel):
    date: str
    slots: list[RestaurantAvailabilitySlot]


class RestaurantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    cuisine: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=80)
    address: str = Field(min_length=5, max_length=200)
    capacity: int = Field(ge=1, le=500)
    average_price_per_guest: Decimal = Field(gt=0)


class RestaurantRead(BaseModel):
    id: int
    name: str
    cuisine: str
    city: str
    address: str
    capacity: int
    average_price_per_guest: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RestaurantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    cuisine: str | None = Field(default=None, min_length=2, max_length=80)
    city: str | None = Field(default=None, min_length=2, max_length=80)
    address: str | None = Field(default=None, min_length=5, max_length=200)
    capacity: int | None = Field(default=None, ge=1, le=500)
    average_price_per_guest: Decimal | None = Field(default=None, gt=0)
