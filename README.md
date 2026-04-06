# GymForge (MERN)

GymForge is a full-stack fitness platform built with MongoDB, Express, React (Vite), and Node.js.

## Project Structure

- `client/` - React + Vite + Tailwind frontend
- `server/` - Express + MongoDB backend

## Core Features

- Public landing page
- Register/Login with JWT auth in `httpOnly` cookies
- 4-step onboarding wizard
- AI-generated 7-day workout plan via Anthropic (`claude-sonnet-4-20250514`)
- Dashboard with 3 tabs:
  - Workout Plan
  - To-Do List
  - Profile

## Environment Variables

Create `.env` at repo root:

```env
MONGO_URI=...
JWT_SECRET=...
ANTHROPIC_API_KEY=...
FRONTEND_URL=http://localhost:5173
PORT=5001
VITE_API_URL=http://localhost:5001/api
```

## Run Locally

1. Install backend deps:
   - `cd server && npm install`
2. Install frontend deps:
   - `cd ../client && npm install`
3. Start backend:
   - `cd ../server && npm run dev`
4. Start frontend:
   - `cd ../client && npm run dev`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/workout/generate`
- `GET /api/workout/me`
- `GET /api/todos?date=YYYY-MM-DD`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`

## Deployment

- Backend: Render (`server/` as root) using `render.yaml`
- Frontend: Vercel (`client/` as root) using `client/vercel.json`
