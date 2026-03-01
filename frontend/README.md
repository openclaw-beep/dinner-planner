# Frontend README

This repository currently does not contain a production `frontend` application codebase yet. This document defines setup and integration standards for the frontend that will be deployed to Vercel.

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm or pnpm
- Backend API running locally or deployed

### Recommended Bootstrap (Next.js)
```bash
cd frontend
npx create-next-app@latest . --ts --eslint --app --src-dir --import-alias "@/*"
npm install axios zod react-hook-form
```

### Environment
Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Run
```bash
cd frontend
npm run dev
```

## Component Structure

Suggested structure:

```text
frontend/
  src/
    app/
      page.tsx
      bookings/
      restaurants/
    components/
      ui/
      forms/
      bookings/
      restaurants/
    lib/
      api.ts
      types.ts
      validators.ts
    hooks/
      useBookings.ts
      useRestaurants.ts
```

Guidelines:
- Keep API types in `src/lib/types.ts` synchronized with `API.md`.
- Keep HTTP client configuration centralized in `src/lib/api.ts`.
- Keep endpoint-specific logic in hooks/services, not UI components.

## API Integration

Use `NEXT_PUBLIC_API_BASE_URL` as the source of truth.

Example API client (`src/lib/api.ts`):

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

Example request:

```ts
const response = await api.post('/bookings', {
  user_id: 1,
  restaurant_id: 2,
  reservation_at: '2026-03-10T19:00:00Z',
  party_size: 4,
});
```

Backend endpoints to integrate first:
- `POST /users`
- `POST /restaurants`
- `GET /restaurants/search`
- `POST /bookings`
- `GET /bookings/{booking_id}`
- `POST /bookings/{booking_id}/confirm`
- `POST /bookings/{booking_id}/deny`

## Deployment

### Vercel Setup
1. Import repository into Vercel.
2. Set root directory to `frontend`.
3. Framework preset: Next.js.
4. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL=https://<railway-backend-domain>`
5. Deploy.

### CORS Requirement
Backend currently has no CORS middleware configured. Before browser-based frontend traffic, add FastAPI CORS middleware in `backend/app/main.py` for your Vercel domain(s).

### Health Check
After deployment:
- Load Vercel URL
- Verify frontend can call `/health` via backend base URL
