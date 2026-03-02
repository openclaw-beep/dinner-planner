from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import bookings, restaurants, users, webhooks

app = FastAPI(title="Dinner Planner Backend", version="0.1.0")

# CORS configuration - allow frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dinner.rgcsagents.cloud",
        "https://dinner-admin.rgcsagents.cloud",
        "http://localhost:3000",  # for local development
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(bookings.router)
app.include_router(webhooks.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
