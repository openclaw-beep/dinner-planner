# Deployment Guide

This document covers production deployment for:
- Backend on Railway
- Frontend on Vercel
- DNS on Cloudflare
- Environment configuration for all services

## Railway Backend Setup

### 1. Create Project
1. In Railway, create a new project from this GitHub repository.
2. Ensure `railway.json` is detected.

Current deploy settings:
- Builder: `NIXPACKS`
- Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`
- Health check: `/health`

### 2. Provision Database
1. Add PostgreSQL plugin/service in Railway.
2. Copy internal/external connection string.
3. Set `DATABASE_URL` in backend service variables.

### 3. Set Environment Variables
Required:
- `DATABASE_URL=postgresql+psycopg://...`
- `COMMISSION_RATE=0.1`

Optional:
- `TWILIO_AUTH_TOKEN=<token>`

### 4. Run Migrations
Run once per deploy or release phase:
```bash
cd backend
alembic upgrade head
```

### 5. Validate Deployment
- `GET /health` returns `{ "status": "ok" }`.
- Test one write endpoint (`POST /users`).

## Vercel Frontend Setup

### 1. Import Project
1. Create Vercel project from same GitHub repo.
2. Set Root Directory to `frontend`.
3. Select framework (recommended: Next.js).

### 2. Environment Variables
Set in Vercel:
- `NEXT_PUBLIC_API_BASE_URL=https://<railway-backend-domain>`

### 3. Build/Output
Use framework defaults (if Next.js):
- Build: `next build`
- Output: `.next`

### 4. Validate
- Open deployed frontend URL.
- Verify API calls reach Railway backend.

## Cloudflare DNS

Assuming domain `example.com` managed in Cloudflare.

### 1. Backend Record
Create CNAME:
- Name: `api`
- Target: `<railway-generated-domain>`
- Proxy: DNS only during troubleshooting, proxied in steady state if needed

### 2. Frontend Record
Create CNAME:
- Name: `app` (or `www`)
- Target: `cname.vercel-dns.com`
- Proxy: DNS only recommended for clean Vercel SSL automation

### 3. Apex Domain (optional)
Route apex to Vercel per Vercel domain instructions (ANAME/flattened CNAME behavior depends on Cloudflare zone settings).

### 4. SSL/TLS
- Cloudflare SSL mode: `Full` or `Full (strict)` once certs are active.
- Verify both `api.example.com` and `app.example.com` have valid certs.

## Environment Configuration Matrix

### Backend (Railway)
- `DATABASE_URL`: PostgreSQL URL (required)
- `COMMISSION_RATE`: Decimal commission fraction (required)
- `TWILIO_AUTH_TOKEN`: Twilio webhook auth token (optional but recommended)

### Frontend (Vercel)
- `NEXT_PUBLIC_API_BASE_URL`: Public HTTPS backend URL (required)

### Local Development
Backend `.env` example:
```bash
DATABASE_URL=sqlite+pysqlite:///./dinner_planner.db
COMMISSION_RATE=0.1
TWILIO_AUTH_TOKEN=
```

Frontend `.env.local` example:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Release Checklist

1. Backend migrations applied (`alembic upgrade head`).
2. Backend health check passing.
3. Frontend env points to production backend.
4. DNS records resolve correctly.
5. Twilio webhook URL points to `https://api.<domain>/webhooks/whatsapp`.
6. Smoke test complete for user creation, restaurant search, booking create/confirm, invoice generation.
