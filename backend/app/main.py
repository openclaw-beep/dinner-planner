from fastapi import FastAPI

from app.api.routes import bookings, restaurants, users, webhooks

app = FastAPI(title="Dinner Planner Backend", version="0.1.0")

app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(bookings.router)
app.include_router(webhooks.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
