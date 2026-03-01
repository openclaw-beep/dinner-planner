# Dinner Planner Frontend

User booking interface for Dinner Planner built with Next.js + React + Tailwind.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

```bash
cp .env.example .env.local
```

3. Start local dev server:

```bash
npm run dev
```

## Environment

- `NEXT_PUBLIC_API_URL=https://dinner-api.domain.com`

## Pages

- `/` Home search page
- `/search` Search results
- `/book/[restaurantId]` Booking form
- `/confirmation/[bookingId]` Booking confirmation

## Deployment

```bash
npx vercel --prod
```

Set `NEXT_PUBLIC_API_URL` in Vercel project environment variables before deploying.
