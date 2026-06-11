* GymForge

GymForge is a full-stack MERN app for AI-generated physique plans and daily training tracking.

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

Backend environment values live in `server/.env`.
Frontend environment values live in `client/.env`.
For admin panel access, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, and matching `VITE_ADMIN_EMAIL` in `client/.env`.
Use `server/.env.example` as the backend template. Never commit real `.env` files or API keys.

## MongoDB Atlas Deployment

If Render logs say `Could not connect to any servers in your MongoDB Atlas cluster`, Atlas is blocking the server IP or the Mongo URI is wrong.

1. In MongoDB Atlas, open **Security > Network Access**.
2. For a portfolio/demo deployment on Render, add `0.0.0.0/0` so Render's changing outbound IPs can connect. For a stricter production setup, use a paid/static outbound IP provider and whitelist only that IP.
3. In Render, set `MONGO_URI` to a full Atlas URI that includes the database name, for example:

```text
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/gymforge?retryWrites=true&w=majority&appName=Cluster0
```

4. Keep `DISABLE_LOCAL_DB_FALLBACK=false` and `RETRY_MONGO=true` on Render. The app will keep working with the local JSON fallback if Atlas is temporarily blocked, and it will retry MongoDB in the background.
5. Check `/api/health`. It reports `database: "mongodb"` when Atlas is connected, or `database: "local-json-fallback"` when the fallback is active.

For portfolio reviews, keep `ENABLE_DEMO_LOGIN=true`. The login page includes a **Try Demo** button that creates a seeded demo user, profile, workout plan, and todos in whichever database is active.

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
