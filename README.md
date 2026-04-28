* GymForge

GymForge is a full-stack MERN app for AI-generate physique plans and daily training tracking.

## Stack

- Frontend: React 18 + Vite + Tailwind + Framer Motion + React Query + Firebase Auth
- Backend: Node + Express + MongoDB + Passport Google OAuth + JWT cookies
- AI: Anthropic Claude (`claude-sonnet-4-20250514`)

## Features

- Landing, auth, onboarding wizard, plan generation, plan viewer, workout detail, tracker, profile
- Firebase Authentication (email/password + Google popup) on client
- Backend Firebase ID token exchange (`POST /api/auth/firebase`) -> JWT access (15m) + refresh (7d) in HttpOnly cookies
- Claude-based structured plan generation
- Auto-seeded exercise todos, weekly stats, streak endpoint

## Environment

Copy `.env.example` to `.env` and fill values.
The Vite client reads variables from the repo root `.env` (configured via `client/vite.config.js` with `envDir: ".."`).
For admin panel access, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and matching `VITE_ADMIN_EMAIL`.

## Run Locally

1. `cd server && npm install`
2. `cd ../client && npm install`
3. `cd ../server && npm run dev`
4. `cd ../client && npm run dev`

Server runs on `http://localhost:5000` and client on `http://localhost:5173`.

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin-login`
- `POST /api/auth/firebase`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### Onboarding
- `POST /api/onboarding`
- `GET /api/onboarding/me`

### Workout
- `POST /api/workout/generate`
- `GET /api/workout/me`
- `DELETE /api/workout/me`

### Todos
- `GET /api/todos?date=YYYY-MM-DD`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`
- `GET /api/todos/stats`
- `GET /api/todos/streak`

### Profile
- `GET /api/profile/me`
- `PATCH /api/profile/me`

### Admin (requires `role=admin`)
- `GET /api/admin/overview`
- `GET /api/admin/users`
