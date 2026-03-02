import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    commission_rate: float
    twilio_auth_token: str
    admin_api_token: str
    rate_limit_requests: int
    rate_limit_window_seconds: int


settings = Settings(
    database_url=os.getenv("DATABASE_URL", "sqlite+pysqlite:///./dinner_planner.db"),
    commission_rate=float(os.getenv("COMMISSION_RATE", "0.1")),
    twilio_auth_token=os.getenv("TWILIO_AUTH_TOKEN", ""),
    admin_api_token=os.getenv("ADMIN_API_TOKEN", "dev-admin-token"),
    rate_limit_requests=int(os.getenv("RATE_LIMIT_REQUESTS", "60")),
    rate_limit_window_seconds=int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")),
)
