# GymForge (MERN)

## Folder Structure

```text
gymforge/
├── .env.example
├── README.md
├── render.yaml
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api/api.js
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   └── WallpaperGenerator.jsx
│       ├── context/AuthContext.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useTodos.js
│       │   ├── useWallpaper.js
│       │   └── useWorkoutPlan.js
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── OnboardingPage.jsx
│       │   ├── TodoListPage.jsx
│       │   ├── WallpaperPage.jsx
│       │   └── WorkoutDetailPage.jsx
│       └── styles/index.css
└── server/
    ├── index.js
    ├── package.json
    ├── config/db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── todoController.js
    │   ├── wallpaperController.js
    │   └── workoutController.js
    ├── middleware/protect.js
    ├── models/
    │   ├── TodoItem.js
    │   ├── User.js
    │   ├── WallpaperConfig.js
    │   └── WorkoutPlan.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── todoRoutes.js
    │   ├── wallpaperRoutes.js
    │   └── workoutRoutes.js
    └── services/generateWorkoutPlan.js
```

## Local Setup

1. Copy `.env.example` to `.env` at project root and fill values.
2. Install backend packages:
   - `cd server && npm install`
3. Install frontend packages:
   - `cd ../client && npm install`
4. Run backend:
   - `cd ../server && npm run dev`
5. Run frontend:
   - `cd ../client && npm run dev`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `POST /api/workout/generate` (protected)
- `GET /api/workout/me` (protected)
- `GET /api/todos?date=YYYY-MM-DD` (protected)
- `POST /api/todos` (protected)
- `PATCH /api/todos/:id` (protected)
- `DELETE /api/todos/:id` (protected)
- `GET /api/todos/stats` (protected)
- `GET /api/wallpaper` (protected)
- `POST /api/wallpaper` (protected)

## Deployment

### Render (Backend)

1. Create a new Web Service from this repo.
2. Use `gymforge/server` as root directory.
3. Set env vars:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Vercel URL)
4. Build command: `npm install`
5. Start command: `npm start`
6. `render.yaml` is included at project root.

### Vercel (Frontend)

1. Import project with root set to `gymforge/client`.
2. Add env var:
   - `VITE_API_URL=https://<render-backend-url>/api`
3. Build command: `npm run build`
4. Output directory: `dist`
5. `vercel.json` is included in `client`.

### CORS

The backend CORS allowlist is controlled by `FRONTEND_URL` in `server/index.js` and supports comma-separated URLs.
