# 🚀 Deploy Backend to Fly.io - Complete Guide

**Status:** Fly.io config ready on GitHub (commit `3e984c0`)  
**Time to deploy:** 5-10 minutes

---

## Quick Deploy (3 Commands)

```bash
cd /tmp/dinner-planner/backend

# 1. Login to Fly.io
flyctl auth login

# 2. Launch app (creates app + PostgreSQL)
flyctl launch --now

# 3. Done! Get URL
flyctl status
```

---

## Step-by-Step Instructions

### 1. Install Fly.io CLI (if not installed)

```bash
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"
```

### 2. Authenticate

```bash
cd /tmp/dinner-planner/backend
flyctl auth login
```

This opens browser → login with your Fly.io account

### 3. Create PostgreSQL Database

```bash
flyctl postgres create --name dinner-planner-db --region iad
```

**Save the connection string!** It looks like:
```
postgres://username:password@dinner-planner-db.internal:5432/dinner_planner
```

### 4. Launch the App

```bash
flyctl launch --now
```

**It will ask:**
- App name: `dinner-planner-backend` (press Enter)
- Region: `iad` (Washington DC - press Enter)
- Add PostgreSQL: `y` (yes)
- Deploy now: `y` (yes)

### 5. Set Environment Variables

```bash
# Link database (if not auto-linked)
flyctl postgres attach dinner-planner-db

# Set commission rate
flyctl secrets set COMMISSION_RATE=0.05

# Set Twilio (or use sandbox)
flyctl secrets set TWILIO_AUTH_TOKEN=sandbox
```

### 6. Run Database Migrations

```bash
flyctl ssh console
alembic upgrade head
exit
```

### 7. Seed Database (Optional)

```bash
flyctl ssh console
python seed_data.py
exit
```

This adds 5 Ottawa restaurants:
- Gezellig, North & Navy, Stofa, Soca Kitchen, Pure Kitchen

### 8. Get Your Backend URL

```bash
flyctl status
```

Look for: `dinner-planner-backend.fly.dev`

---

## Update Frontend + Admin URLs

Once backend is deployed, set environment variables in Vercel:

### Frontend Project Settings:
```bash
NEXT_PUBLIC_API_URL=https://dinner-planner-backend.fly.dev
```

### Admin Project Settings:
```bash
NEXT_PUBLIC_API_URL=https://dinner-planner-backend.fly.dev
```

**Or via CLI:**
```bash
cd /tmp/dinner-planner/frontend
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://dinner-planner-backend.fly.dev

cd /tmp/dinner-planner/admin
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://dinner-planner-backend.fly.dev
```

Then redeploy:
```bash
cd /tmp/dinner-planner/frontend
vercel --prod

cd /tmp/dinner-planner/admin
vercel --prod
```

---

## Cloudflare DNS (Optional Custom Domain)

Point `dinner-api.rgcsagents.cloud` to Fly.io:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/dd5e7bd56dba665cedfdea0bb83f770b/dns_records" \
  -H "Authorization: Bearer Vv1Vf9Q0ojVmaybW-z1OYD_sjN5hqpj3qbS89RW1" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "dinner-api",
    "content": "dinner-planner-backend.fly.dev",
    "ttl": 1,
    "proxied": true
  }'
```

Then add custom domain in Fly.io:
```bash
flyctl certs add dinner-api.rgcsagents.cloud
```

---

## Testing

### Test Backend Health
```bash
curl https://dinner-planner-backend.fly.dev/health
# Expected: {"status":"ok"}
```

### Test Restaurant Search
```bash
curl "https://dinner-planner-backend.fly.dev/restaurants/search?date=2026-03-15&time=19:00&party_size=4"
# Expected: JSON array of restaurants
```

### Test Full Booking Flow
1. Frontend: https://dinner.rgcsagents.cloud
2. Search for restaurants → Should show results!
3. Book → Admin dashboard should show pending booking
4. Admin: https://dinner-admin.rgcsagents.cloud
5. Login → See pending → Confirm!

---

## Troubleshooting

### "App name already taken"
```bash
flyctl launch --name dinner-planner-backend-prod
```

### Database connection error
```bash
# Check database is attached
flyctl postgres list
flyctl postgres attach dinner-planner-db -a dinner-planner-backend
```

### Migrations failed
```bash
flyctl ssh console
alembic current  # Check current version
alembic upgrade head  # Run migrations
alembic history  # View migration history
```

### App won't start
```bash
flyctl logs
# Check for errors in startup
```

---

## What's Already Configured

**✅ In fly.toml:**
- App name: `dinner-planner-backend`
- Region: `iad` (Washington DC)
- Auto-scaling: 0-1 machines (free tier friendly)
- Memory: 512MB
- Port: 8080
- HTTPS: Force enabled
- Release command: `alembic upgrade head` (auto-runs migrations)

**✅ In Procfile:**
- Web command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**✅ In requirements.txt:**
- All dependencies listed
- FastAPI, SQLAlchemy, Alembic, psycopg2-binary, etc.

---

## Cost

**Free tier includes:**
- 3 shared-cpu VMs
- 160GB bandwidth/month
- PostgreSQL: 3GB storage

**Your app uses:**
- 1 VM (auto-sleeps when idle)
- ~100MB storage
- **Estimated: $0/month** (stays in free tier)

---

## Alternative: One-Command Deploy Script

```bash
#!/bin/bash
cd /tmp/dinner-planner/backend

# Login
flyctl auth login

# Deploy
flyctl launch \
  --name dinner-planner-backend \
  --region iad \
  --now

# Attach Postgres
flyctl postgres attach dinner-planner-db

# Set secrets
flyctl secrets set COMMISSION_RATE=0.05 TWILIO_AUTH_TOKEN=sandbox

# Run migrations + seed
flyctl ssh console -C "alembic upgrade head && python seed_data.py"

# Show URL
flyctl status

echo "✅ Backend deployed!"
echo "URL: https://dinner-planner-backend.fly.dev"
```

Save as `deploy-fly.sh`, run: `bash deploy-fly.sh`

---

**Ready to deploy! Takes 5-10 minutes total.**

— **Brahma 🪷**
