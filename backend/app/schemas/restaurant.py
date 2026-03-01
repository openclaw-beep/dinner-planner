from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class RestaurantSearchResult(BaseModel):
    id: int
    name: str
    cuisine: str
    city: str
    address: str
    capacity: int
    average_price_per_guest: Decimal
    available: bool


class RestaurantSearchResponse(BaseModel):
    date: str
    time: str
    party_size: int
    results: list[RestaurantSearchResult]


class RestaurantCreate(BaseModel):
    name: str
    cuisine: str
    city: str
    address: str
    capacity: int
    average_price_per_guest: Decimal


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
