from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    review_text: str | None = None


class ReviewRead(BaseModel):
    id: UUID
    booking_id: int
    user_id: int
    restaurant_id: int
    rating: int
    review_text: str | None
    verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RestaurantReviewItem(BaseModel):
    user_name: str
    rating: int
    review_text: str | None
    created_at: datetime


class RestaurantReviewsResponse(BaseModel):
    reviews: list[RestaurantReviewItem]
    limit: int
    offset: int


class RestaurantRatingResponse(BaseModel):
    average: float
    count: int
