import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB, { isDatabaseConnected } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import wallpaperRoutes from "./routes/wallpaperRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
const app = express();

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === "true";

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) return true;
  if (allowVercelPreviews && normalized.endsWith(".vercel.app")) return true;
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("CORS blocked for origin: " + origin));
    }
  })
);
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    dbConnected: isDatabaseConnected()
  })
);

app.use("/api", (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      message:
        "Database is not connected yet. Check MONGO_URI / Atlas Network Access and retry in a few seconds."
    });
  }
  return next();
});

app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/wallpaper", wallpaperRoutes);

app.use((err, req, res, next) => {
  if (err.message.startsWith("CORS")) return res.status(403).json({ message: err.message });
  return next(err);
});

const start = async () => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });

  const connectWithRetry = async () => {
    try {
      await connectDB();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("MongoDB connect failed. Retrying in 10s:", error.message);
      setTimeout(connectWithRetry, 10000);
    }
  };

  await connectWithRetry();
};

start();
