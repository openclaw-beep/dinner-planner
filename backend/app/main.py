from collections import defaultdict, deque
from collections.abc import Callable
from threading import Lock
from time import time

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.routes import bookings, restaurants, users, webhooks
from app.core.config import settings

app = FastAPI(title="Dinner Planner Backend", version="0.1.0")


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI) -> None:
        super().__init__(app)
        self.window = max(1, settings.rate_limit_window_seconds)
        self.limit = max(1, settings.rate_limit_requests)
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            client_ip = request.client.host if request.client else "unknown"
            now = time()
            cutoff = now - self.window

            with self._lock:
                bucket = self._requests[client_ip]
                while bucket and bucket[0] < cutoff:
                    bucket.popleft()

                if len(bucket) >= self.limit:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Rate limit exceeded. Please retry later."},
                    )

                bucket.append(now)

        return await call_next(request)


# CORS configuration - allow known frontend/admin origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dinner.rgcsagents.cloud",
        "https://dinner-admin.rgcsagents.cloud",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "X-User-Token", "X-Admin-Token", "X-Restaurant-Id"],
)
app.add_middleware(RateLimitMiddleware)


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(_: Request, __: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": "Invalid request payload"})


app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(bookings.router)
app.include_router(webhooks.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
