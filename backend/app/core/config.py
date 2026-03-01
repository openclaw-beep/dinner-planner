import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    commission_rate: float
    twilio_auth_token: str


settings = Settings(
    database_url=os.getenv("DATABASE_URL", "sqlite+pysqlite:///./dinner_planner.db"),
    commission_rate=float(os.getenv("COMMISSION_RATE", "0.1")),
    twilio_auth_token=os.getenv("TWILIO_AUTH_TOKEN", ""),
)
