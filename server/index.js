import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import rateLimiter from "./middleware/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS origin not allowed"));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(rateLimiter);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/profile", profileRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  const port = Number(process.env.PORT) || 5000;

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`GymForge server running on port ${port}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Server start failed", error);
  process.exit(1);
});
