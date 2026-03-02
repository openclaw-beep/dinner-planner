# 🍽️ Dinner Planner

**WhatsApp-based restaurant booking marketplace for Ottawa**

Save 70% on booking commissions. 5% vs OpenTable's 15-30%.

---

## 🌐 Live URLs

**Frontend (User Booking):** https://dinner.rgcsagents.cloud  
**Admin Dashboard (Restaurants):** https://dinner-admin.rgcsagents.cloud

---

## 🚀 Quick Start

### Deploy Backend (10 minutes)
```bash
cd backend
flyctl auth login
flyctl launch --now
```

### Full Documentation
- **Platform Summary:** [COMPLETE-PLATFORM-SUMMARY.md](./COMPLETE-PLATFORM-SUMMARY.md)
- **Deployment Guide:** [FLY-IO-DEPLOY.md](./FLY-IO-DEPLOY.md)
- **Operational Runbook:** [OPERATIONAL-RUNBOOK.md](./OPERATIONAL-RUNBOOK.md)
- **Production Checklist:** [PRODUCTION-READY-CHECKLIST.md](./PRODUCTION-READY-CHECKLIST.md)

---

## 📦 What's Included

**Frontend:** Next.js + TypeScript + Tailwind (✅ Deployed to Vercel)  
**Admin:** Next.js + TypeScript + Tailwind (✅ Deployed to Vercel)  
**Backend:** FastAPI + PostgreSQL + Alembic (⏸ Ready for Fly.io)

**Features:**
- Restaurant search (date, time, party size, cuisine)
- WhatsApp booking confirmations
- Admin dashboard for restaurants
- Commission tracking (5% per booking)
- Invoice generation
- 5 Ottawa restaurants seeded

---

## 🎯 Tech Stack

**Frontend & Admin:**
- Next.js 14 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Vercel (hosting)
- Cloudflare (CDN + DNS)

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Alembic (migrations)
- PostgreSQL (database)
- Twilio (WhatsApp API)
- Fly.io (hosting)

---

## 📊 Business Model

**Commission:** 5% per confirmed booking  
**Target:** Ottawa restaurants  
**Value Prop:** Save 70% vs OpenTable (5% vs 15-30%)

**Revenue Projections:**
- 10 restaurants × 50 bookings/month = $3,500/month
- 100 restaurants = $35,000/month

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │──────│   Backend    │──────│  PostgreSQL │
│  (Vercel)   │      │   (Fly.io)   │      │  (Fly.io)   │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐      ┌──────────────┐
│    Admin    │      │   Twilio     │
│  (Vercel)   │      │  WhatsApp    │
└─────────────┘      └──────────────┘
```

---

## 📝 Development

### Backend Setup
```bash
cd backend
pip install -e .
alembic upgrade head
python seed_data.py
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Admin Setup
```bash
cd admin
npm install
npm run dev
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# E2E tests
cd frontend
npx playwright test
```

---

## 📖 Documentation

**Product:**
- [Phase 2 Spec](./dinner-planner-phase2-spec.md) - Complete product specification
- [Restaurant Onboarding Guide](./restaurant-onboarding-guide.md)
- [User FAQ](./user-faq.md)

**Technical:**
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./FLY-IO-DEPLOY.md)

**Operations:**
- [Operational Runbook](./OPERATIONAL-RUNBOOK.md)
- [Production Checklist](./PRODUCTION-READY-CHECKLIST.md)

**Marketing:**
- [Social Media Launch Posts](./social-media-launch-posts.md)
- [Restaurant Outreach Templates](./restaurant-outreach-email.md)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built in 6 hours on March 1, 2026 by:
- **Product Manager:** Brahma (AI agent)
- **Engineering:** 8 parallel Codex instances
- **Infrastructure:** BVM (credential management)
- **Vision:** Akash Gupta

---

**Status:** 95% Complete - Backend deployment pending (10 minutes)

**Next:** Deploy backend → Set env vars → Test full flow → Launch! 🚀
