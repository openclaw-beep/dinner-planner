# AI Dinner Planner - Build Brief
**Strategy:** Build fast, launch fast, scale if it works
**Timeline:** 3 weeks to first paying users
**Team:** Brahma (product spec) + Codex (build) + BVM (coordination)

---

## MVP Scope (Week 1-2)

### Core Features (MUST HAVE)
1. **WhatsApp Bot Interface**
   - Create dinner via message: "Plan dinner for [group name]"
   - Bot polls group: "When works for everyone this week?"
   - AI finds optimal date from responses
   - Sends confirmation + reminders (2 days before, day of)

2. **Smart Scheduling**
   - Google Calendar integration (check everyone's availability)
   - Suggests 3 best time slots based on group overlap
   - Handles timezone differences automatically

3. **Group Memory**
   - Remembers dietary preferences
   - Tracks who usually attends
   - Learns preferred restaurants/cuisines

4. **Restaurant Suggestions**
   - Yelp/Google Maps API integration
   - Filters by dietary restrictions
   - Shows ratings + distance from group members

### Nice-to-Have (Week 3 if time)
- Bill splitting coordination (post-dinner)
- OpenTable/Resy booking integration
- Recurring dinners (auto-schedule monthly)

---

## Tech Stack (We Already Have Most of This)

**Existing Infrastructure:**
- ✅ WhatsApp integration (`credentials/gmail.json` + WhatsApp auth)
- ✅ Google Calendar API (`/home/openclaw/.openclaw/workspace/skills/google-calendar-api/`)
- ✅ Multi-agent orchestration (our core platform)
- ✅ Memory/persistence (Google Drive + local MEMORY.md)

**New Integrations Needed:**
- 🆕 Yelp Fusion API (restaurant search)
- 🆕 Google Maps Places API (backup for restaurant data)
- 🆕 Stripe (payments - Week 3)

**Code Structure:**
```
dinner-planner/
├── bot/
│   ├── whatsapp-handler.js      # Message parsing & responses
│   ├── scheduler.js              # Date/time optimization logic
│   └── group-manager.js          # Group state & preferences
├── integrations/
│   ├── calendar.js               # Google Calendar API
│   ├── restaurants.js            # Yelp + Google Maps
│   └── payments.js               # Stripe (Week 3)
├── ai/
│   ├── optimizer.js              # Find best date/time/restaurant
│   └── memory.js                 # Learn preferences over time
└── tests/
    └── e2e-flow.test.js          # Full dinner planning flow
```

---

## Launch Strategy (Week 3)

### Beta Group Selection (10 groups)
1. **Your friend groups** (3-4 groups)
2. **Krong Thai staff** (1 group - team dinners)
3. **YC/startup founder networks** (3-4 groups)
4. **Remote team groups** (2 groups - async coordination pain is HIGH)

### Success Metrics (4 weeks post-launch)
**Scale Triggers:**
- ✅ 40%+ retention (groups use it for 2nd+ dinner)
- ✅ 20%+ conversion to paid after free trial
- ✅ NPS >50 (would recommend to friends)

**Kill Triggers:**
- ❌ <20% retention (one-and-done usage)
- ❌ <5% payment conversion
- ❌ Groups revert to WhatsApp manual coordination

---

## Pricing (Start Simple)

**Free Tier:**
- 1 dinner/month
- Up to 8 people
- Basic scheduling

**Pro Tier ($10/mo per group):**
- Unlimited dinners
- Unlimited group size
- Restaurant booking
- Bill splitting
- Dietary preference memory
- Priority support

**Launch Offer:**
- First 100 groups: Free for 3 months
- After trial: $10/mo or revert to free tier

---

## GitHub Repo Structure

**Repo:** `openclaw-beep/dinner-planner` (public)
**Note:** Always use openclaw-beep account for new projects, NEVER rgcs/

**Capabilities to include (from yesterday's setup):**
- CI/CD with GitHub Actions
- Docker containerization
- Environment variable management (.env.example)
- API documentation (OpenAPI/Swagger)
- Contributing guidelines
- MIT License

**README sections:**
1. Problem statement
2. Quick start (self-host instructions)
3. API documentation
4. Architecture diagram
5. Contributing guide
6. Roadmap

---

## Week-by-Week Breakdown

### Week 1: Core Loop
**Brahma:** Product spec + user flow diagrams
**Codex:** 
- WhatsApp message handler
- Basic scheduling logic (poll group, find best date)
- Google Calendar integration
**BVM:** 
- Set up repo + CI/CD
- Configure credentials (Yelp API, etc.)

**Deliverable:** Bot can coordinate a dinner date via WhatsApp

### Week 2: Intelligence Layer
**Codex:**
- Restaurant suggestions (Yelp API)
- Dietary preference memory
- Smart date suggestions (based on calendar analysis)
- Reminder system (2 days before, day of)
**Brahma:** 
- Test with 2-3 internal groups
- Document bugs/UX issues

**Deliverable:** Fully functional MVP with restaurant suggestions

### Week 3: Launch Prep
**Codex:**
- Payment integration (Stripe)
- Polish UX based on internal testing
- Documentation (README, API docs)
**Brahma:**
- Onboard 10 beta groups
- Create feedback loop (weekly check-ins)
**BVM:**
- Monitor usage metrics
- Coordinate bug fixes

**Deliverable:** 10 beta groups actively using the product

---

## Decision Point: Week 7 (4 weeks post-launch)

**IF retention >40% + payment conversion >20%:**
→ **SCALE:** Raise small round or bootstrap growth, hire GTM, expand features

**IF retention 20-40% OR payment 5-20%:**
→ **PIVOT:** Try B2B restaurant model or adjust pricing/features

**IF retention <20% OR payment <5%:**
→ **KILL:** Archive repo, write postmortem, move to next idea

---

## Why This Approach Works

1. **Low risk:** 3 weeks of build time (we can afford this)
2. **Real feedback:** Market will tell us if people actually want this
3. **Fast iteration:** Can pivot based on actual usage data
4. **Portfolio approach:** Not betting the farm, just testing hypothesis
5. **Speed advantage:** Beat competitors to market

---

## Next Actions (TODAY)

1. **BVM:** Send build brief to Brahma (product spec request)
2. **Brahma:** Spec MVP by end of Monday (user flows, feature list)
3. **BVM:** Spin up Codex session Tuesday morning to start build
4. **BVM:** Set up GitHub repo + get API keys (Yelp, Stripe sandbox)

---

**Let's ship this. 🚀**

— **BVM 🙏**
