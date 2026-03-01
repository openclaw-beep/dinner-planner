# Backend README

FastAPI backend for Dinner Planner Phase 2A.

## Installation Instructions

### Prerequisites
- Python 3.11+
- `pip` (or `uv`)
- SQLite (default) or PostgreSQL (production)

### Local Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

### Run the API
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run Tests
```bash
cd backend
source .venv/bin/activate
pytest
```

## API Endpoints Documentation

Base URL (local): `http://localhost:8000`

### Health
- `GET /health`
- Returns service health.

### Users
- `POST /users`
- Creates a user.

Request body:
```json
{
  "name": "Alice",
  "phone_number": "+15550001111"
}
```

### Restaurants
- `POST /restaurants`
- Creates a restaurant.

- `GET /restaurants/search?date=YYYY-MM-DD&time=HH:MM&party_size=INT&city=OPTIONAL`
- Searches restaurants and returns availability for requested party size.

### Bookings
- `POST /bookings`
- Creates a pending booking with generated 6-char confirmation code.

- `GET /bookings/{booking_id}`
- Returns booking by id.

- `POST /bookings/{booking_id}/confirm`
- Confirms a booking if no capacity conflict exists.

- `POST /bookings/{booking_id}/deny`
- Denies a booking unless already confirmed.

### Integrations
- `POST /webhooks/whatsapp`
- Parses booking intent from Twilio WhatsApp webhook payload.
- If `TWILIO_AUTH_TOKEN` is set, request must include `x-twilio-signature` header.

- `POST /invoices/monthly?month=YYYY-MM`
- Generates draft invoices for confirmed bookings in the given month.
- If `month` is omitted, generates for the previous calendar month.

## Environment Variables

Configured in `backend/app/core/config.py`:

- `DATABASE_URL`
  - SQLAlchemy DB URL.
  - Default: `sqlite+pysqlite:///./dinner_planner.db`
  - Example Postgres: `postgresql+psycopg://user:password@host:5432/dinner_planner`

- `COMMISSION_RATE`
  - Commission fraction used during invoice generation.
  - Default: `0.1` (10%).

- `TWILIO_AUTH_TOKEN`
  - If non-empty, webhook endpoint enforces presence of `x-twilio-signature` header.
  - Default: empty string.

## Database Setup

### Local SQLite (default)
No external DB needed. DB file is created automatically.

### Migrations (Alembic)
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

Current initial migration: `backend/alembic/versions/20260301_0001_initial_phase2a_schema.py`

### Core Tables
- `users`
- `restaurants`
- `bookings`
- `invoices`

### Production PostgreSQL
1. Provision PostgreSQL (Railway/Neon/Supabase/etc.).
2. Set `DATABASE_URL` to PostgreSQL URL.
3. Run migrations:
```bash
cd backend
alembic upgrade head
```

## Deployment Guide

### Railway (recommended)
The repo already contains `railway.json` with:
- Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`
- Healthcheck path: `/health`

Steps:
1. Create Railway project from this repo.
2. Add environment variables:
   - `DATABASE_URL`
   - `COMMISSION_RATE`
   - `TWILIO_AUTH_TOKEN`
3. Attach PostgreSQL service and use its connection string.
4. Run migration job (`alembic upgrade head`) during deploy or via release command.
5. Verify `GET /health` on the deployed URL.

### Container Notes
Nixpacks is used by Railway builder. Ensure backend dependencies are resolvable from `backend/pyproject.toml`.

### Post-Deploy Smoke Tests
```bash
curl https://<your-backend-domain>/health
curl -X POST https://<your-backend-domain>/users \
  -H 'content-type: application/json' \
  -d '{"name":"Smoke","phone_number":"+15555550000"}'
```
