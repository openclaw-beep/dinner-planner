from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone_number: str = Field(min_length=7, max_length=32, pattern=r"^[+\d][\d\s().-]{6,31}$")


class UserRead(BaseModel):
    id: int
    name: str
    phone_number: str
    auth_token: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
