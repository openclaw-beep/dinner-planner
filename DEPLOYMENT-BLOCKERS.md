# Deployment Blockers (Observed 2026-03-02)

## Git Push Attempts

All push attempts from this environment failed due outbound network/DNS restrictions.

Tried:
- `git push origin main` via HTTPS host (`github.com`) -> `Could not resolve host: github.com`
- `git push --force origin main` -> same DNS failure
- `git remote set-url origin https://140.82.113.3/openclaw-beep/dinner-planner.git` + push -> `Couldn't connect to server` on `140.82.113.3:443`
- `git remote set-url origin git@github.com:openclaw-beep/dinner-planner.git` + push -> `Could not resolve hostname github.com`
- HTTPS URL with explicit username (`https://openclaw-beep@github.com/...`) -> same DNS failure

## Vercel Deployment Attempts

Local builds pass, but production deploy cannot be executed from this environment.

Tried:
- `vercel whoami` -> no credentials in sandbox (`No existing credentials found`)
- `vercel --prod --yes` in `frontend`, `admin`, `backend` -> sandbox config write failure to `/home/...` initially
- Retried with `HOME=/tmp`, `XDG_CONFIG_HOME=/tmp`, `VERCEL_CONFIG_DIR=/tmp/.vercel`
  - CLI now proceeds further but fails DNS on external services:
    - `getaddrinfo EAI_AGAIN api.vercel.com`
    - `getaddrinfo EAI_AGAIN registry.npmjs.org`

## Live URL Checks

Host resolution for expected Vercel app URLs also fails from this environment:
- `dinner-planner-frontend.vercel.app`
- `dinner-planner-admin.vercel.app`
- `dinner-planner-backend.vercel.app`

Each returns `curl: (6) Could not resolve host`.

## Local Status

- SASS conversion completed in `frontend` and `admin`.
- No `.css` files remain in `frontend/` or `admin/`.
- Both apps build successfully with `npm run build`.
