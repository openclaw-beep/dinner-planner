# 📘 Dinner Planner - Operational Runbook

**For:** Production operations, incident response, daily tasks  
**Audience:** Akash (operator), future team members

---

## 🌅 Daily Operations

### Morning Routine (Every Day)
```bash
# 1. Check system health
curl https://dinner.rgcsagents.cloud > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend DOWN"
curl https://dinner-admin.rgcsagents.cloud > /dev/null && echo "✅ Admin OK" || echo "❌ Admin DOWN"  
curl https://dinner-planner-backend.fly.dev/health && echo "✅ Backend OK" || echo "❌ Backend DOWN"

# 2. Check backend logs for errors
flyctl logs --app dinner-planner-backend | grep -i error | tail -20

# 3. Check pending bookings
# Visit: https://dinner-admin.rgcsagents.cloud
# Login with any restaurant ID
# Review pending bookings (should be low)

# 4. Check commission tracker (Google Sheets)
# Review yesterday's bookings
# Verify all completed bookings have commission calculated
```

### Weekly Routine (Every Monday)
```bash
# 1. Review metrics
# - Total bookings last week
# - Confirmation rate
# - No-show rate
# - Revenue generated

# 2. Restaurant outreach
# - Email 5 new restaurant targets
# - Follow up with interested restaurants

# 3. Update database (if needed)
# - Add new restaurants
# - Update operating hours
# - Adjust commission rates

# 4. Review user feedback
# - Check for support requests
# - Address any issues
```

### Monthly Routine (First Monday of Month)
```bash
# 1. Generate invoices
flyctl ssh console --app dinner-planner-backend
python -c "
from app.services.invoice_service import generate_monthly_invoices
from datetime import datetime, timedelta
last_month = datetime.now() - timedelta(days=30)
generate_monthly_invoices(last_month.year, last_month.month)
"
exit

# 2. Send invoices to restaurants
# Download from database or generate PDFs
# Email to restaurants

# 3. Track payments
# Mark invoices as paid when payment received
# Follow up on overdue invoices

# 4. Review metrics
# Compare month-over-month growth
# Analyze trends
```

---

## 🚨 Incident Response

### Frontend Down

**Symptoms:**
- https://dinner.rgcsagents.cloud returns 500/502/503 or times out

**Diagnosis:**
```bash
# 1. Check Vercel deployment status
vercel ls --prod

# 2. Check Vercel logs
# Visit: https://vercel.com/openclaw-5008s-projects/frontend
# Click "Deployments" → Latest → "Logs"

# 3. Check Cloudflare status
curl -I https://dinner.rgcsagents.cloud
```

**Resolution:**
```bash
# Redeploy frontend
cd /tmp/dinner-planner/frontend
vercel --prod --yes

# If that fails, rollback
vercel rollback
```

**Prevention:**
- Always test changes in staging first
- Monitor Vercel build logs before marking live

---

### Backend Down

**Symptoms:**
- API calls return 500/502/503
- `/health` endpoint fails

**Diagnosis:**
```bash
# 1. Check Fly.io status
flyctl status --app dinner-planner-backend

# 2. Check logs
flyctl logs --app dinner-planner-backend | tail -50

# 3. Check database connection
flyctl postgres list
flyctl postgres db list --app dinner-planner-db
```

**Resolution:**
```bash
# Restart app
flyctl apps restart dinner-planner-backend

# If database issue:
flyctl postgres restart --app dinner-planner-db

# If code issue:
cd /tmp/dinner-planner/backend
git pull
flyctl deploy
```

**Prevention:**
- Run tests before deploying (`pytest`)
- Monitor error logs daily
- Set up uptime monitoring (UptimeRobot, Pingdom)

---

### Database Issues

**Symptoms:**
- Bookings not saving
- Restaurants not appearing
- "Connection refused" errors

**Diagnosis:**
```bash
# 1. Check Postgres status
flyctl postgres list

# 2. Check connection
flyctl ssh console --app dinner-planner-backend
python -c "from app.db.session import engine; print(engine.connect())"
exit

# 3. Check migrations
flyctl ssh console --app dinner-planner-backend
alembic current
alembic history
exit
```

**Resolution:**
```bash
# Run missing migrations
flyctl ssh console --app dinner-planner-backend
alembic upgrade head
exit

# If data corruption:
# CAREFUL: This will lose data
flyctl postgres db drop dinner_planner --app dinner-planner-db
flyctl postgres db create dinner_planner --app dinner-planner-db
# Then re-run migrations and seed
```

**Prevention:**
- Regular database backups
- Test migrations in staging
- Monitor database size/performance

---

## 🔧 Common Tasks

### Add New Restaurant

```bash
# Option 1: Via SSH console
flyctl ssh console --app dinner-planner-backend

python
from app.db.session import SessionLocal
from app.models.restaurant import Restaurant

db = SessionLocal()
restaurant = Restaurant(
    name="New Restaurant",
    address="123 Main St, Ottawa",
    cuisine_types=["Italian"],
    average_check_per_person=45.00,
    commission_rate=5.0,
    # ... more fields
)
db.add(restaurant)
db.commit()
db.close()
exit()

# Option 2: Via API (once admin dashboard supports it)
curl -X POST https://dinner-planner-backend.fly.dev/admin/restaurants \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Update Restaurant Hours

```bash
flyctl ssh console --app dinner-planner-backend

python
from app.db.session import SessionLocal
from app.models.restaurant import Restaurant

db = SessionLocal()
restaurant = db.query(Restaurant).filter(Restaurant.name == "Gezellig").first()
restaurant.operating_hours = {
    "monday": {"open": "17:00", "close": "22:00"},
    # ... update other days
}
db.commit()
db.close()
exit()
```

### Generate Invoice Manually

```bash
flyctl ssh console --app dinner-planner-backend

python
from app.services.invoice_service import InvoiceService
from app.db.session import SessionLocal
from datetime import date

db = SessionLocal()
service = InvoiceService(db)

# For specific restaurant and month
invoice = service.generate_monthly_invoice(
    restaurant_id="uuid-here",
    period_start=date(2026, 3, 1),
    period_end=date(2026, 3, 31)
)

print(f"Invoice generated: {invoice.total_commission}")
db.close()
exit()
```

### Mark Booking as No-Show

```bash
flyctl ssh console --app dinner-planner-backend

python
from app.db.session import SessionLocal  
from app.models.booking import Booking, BookingStatus

db = SessionLocal()
booking = db.query(Booking).filter(Booking.confirmation_code == "ABC123").first()
booking.status = BookingStatus.NO_SHOW
db.commit()
print(f"Booking {booking.id} marked as no-show")
db.close()
exit()
```

---

## 📊 Monitoring

### Key Metrics to Track

**Technical:**
- Uptime percentage (target: >99%)
- API response time (target: <500ms)
- Error rate (target: <1%)
- Database query time (target: <100ms)

**Business:**
- Daily bookings (target: >5/day by week 4)
- Confirmation rate (target: >80%)
- No-show rate (target: <10%)
- Restaurant response time (target: <15min avg)

### How to Monitor

**Free Tools:**
- **UptimeRobot** (https://uptimerobot.com) - Monitor URLs every 5 minutes
- **Fly.io Metrics** - Built-in dashboard for backend
- **Vercel Analytics** - Free tier for frontend/admin
- **Google Sheets** - Manual tracking of business metrics

**Commands:**
```bash
# Backend health
watch -n 60 'curl -s https://dinner-planner-backend.fly.dev/health'

# Frontend health  
watch -n 60 'curl -s -o /dev/null -w "%{http_code}" https://dinner.rgcsagents.cloud'

# Recent errors
flyctl logs --app dinner-planner-backend | grep ERROR | tail -20
```

---

## 🔐 Security

### Secrets Management

**Current secrets:**
- `DATABASE_URL` (auto-set by Fly.io)
- `COMMISSION_RATE` (set to 0.05)
- `TWILIO_AUTH_TOKEN` (set to "sandbox" or real token)

**Update a secret:**
```bash
flyctl secrets set KEY=VALUE --app dinner-planner-backend
```

**View secrets (names only, not values):**
```bash
flyctl secrets list --app dinner-planner-backend
```

### Access Control

**Who has access:**
- Akash: Full admin (Fly.io, Vercel, Cloudflare, GitHub)
- Brahma: Read-only monitoring (via BVM credentials)

**Revoking access:**
```bash
# Rotate Fly.io token
flyctl auth token

# Rotate Vercel token  
# Visit: https://vercel.com/account/tokens

# Rotate Cloudflare token
# Visit: https://dash.cloudflare.com/profile/api-tokens
```

---

## 💾 Backups

### Database Backups (Fly.io Postgres)

**Automatic:**
- Fly.io takes daily snapshots (retained 7 days)

**Manual backup:**
```bash
# Dump database
flyctl postgres db dump dinner_planner --app dinner-planner-db > backup-$(date +%Y%m%d).sql

# Restore from backup
flyctl postgres db restore dinner_planner --app dinner-planner-db < backup-20260301.sql
```

**Backup schedule:**
- Daily: Automatic (Fly.io)
- Weekly: Manual dump to local/S3 (recommended)
- Monthly: Archive backup (recommended)

### Code Backups

**GitHub is source of truth:**
- All code backed up automatically
- Clone anytime: `git clone https://github.com/openclaw-beep/dinner-planner`

---

## 📱 WhatsApp Bot Management

### Test WhatsApp Flow (Sandbox)

```bash
# 1. Send test message
# Use Twilio sandbox: +1 415-523-8886
# Message: "join <your-sandbox-code>"

# 2. Test booking request
# Send: "Plan dinner for 4 on March 15 at 7pm"

# 3. Check backend logs
flyctl logs --app dinner-planner-backend | grep whatsapp
```

### Production WhatsApp Setup

**Once Twilio WhatsApp Business API approved:**
```bash
# Update secret
flyctl secrets set TWILIO_AUTH_TOKEN=<your-real-token> --app dinner-planner-backend

# Configure webhook in Twilio console
# URL: https://dinner-planner-backend.fly.dev/webhooks/whatsapp
# Method: POST
```

---

## 📞 Support

### Customer Support

**User issues:**
- Email: support@dinnerplanner.ca (set up forwarding)
- WhatsApp: Direct message to booking number

**Restaurant issues:**
- Phone: Direct line to Akash
- WhatsApp: Same booking number
- Email: support@dinnerplanner.ca

### Technical Support

**Vercel:** https://vercel.com/support  
**Fly.io:** https://community.fly.io  
**Cloudflare:** https://dash.cloudflare.com/support

---

## 🚀 Deployment

### Deploy New Code

**Frontend:**
```bash
cd /tmp/dinner-planner/frontend
git pull
vercel --prod
```

**Admin:**
```bash
cd /tmp/dinner-planner/admin
git pull  
vercel --prod
```

**Backend:**
```bash
cd /tmp/dinner-planner/backend
git pull
flyctl deploy
```

### Rollback

**Vercel:**
```bash
vercel rollback
```

**Fly.io:**
```bash
flyctl releases --app dinner-planner-backend
flyctl releases rollback <version> --app dinner-planner-backend
```

---

## 📝 Change Log

**Keep track of major changes:**

### 2026-03-01
- Initial deployment (frontend, admin, backend)
- Configured custom domains
- Seeded 5 Ottawa restaurants

### Future Changes
- Add date here when you make changes
- What changed
- Why it changed

---

**This runbook is a living document. Update it as you learn!**

— **Brahma 🪷**
