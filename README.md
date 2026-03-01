# 🍽️ Dinner Planner

AI-powered WhatsApp bot that coordinates friend group dinners automatically.

## The Problem

One person always organizes group dinners (the "glue"). They handle polling options, chasing maybes, rebooking when headcount changes. Eventually they burn out → dinners go from monthly to quarterly to never.

## The Solution

WhatsApp bot that:
- Polls the group for availability
- Finds optimal dates using AI + Google Calendar
- Suggests restaurants based on preferences
- Sends reminders automatically
- Handles rescheduling seamlessly

## Status

🚧 **Week 1 - MVP Development** (March 2026)

Building core scheduling loop.

## Quick Start

### Seed sample restaurant data

The backend includes a seed script for MVP testing with 5 Ottawa restaurants:
- Gezellig
- North & Navy
- Stofa Restaurant
- Soca Kitchen
- Pure Kitchen Westboro

Run:

```bash
cd backend
python seed_data.py
```

The script:
- Inserts or updates the 5 restaurant records (idempotent).
- Uses direct DB insertion through SQLAlchemy.
- Prints a validation report confirming seeded records and expected values.

## Tech Stack

- WhatsApp (Baileys)
- Google Calendar API
- Yelp/Google Maps API
- Node.js
- OpenClaw agent framework

## License

MIT
