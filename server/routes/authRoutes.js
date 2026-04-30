import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  changePassword,
  deleteMe,
  firebaseAuth,
  googleAuthUnavailable,
  googleCallback,
  login,
  logout,
  me,
  refresh,
  register
} from "../controllers/authController.js";
import passport, { ensureGoogleStrategy } from "../config/passport.js";
import protect from "../middleware/protect.js";

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later."
  }
});
const getFrontendUrl = () =>
  String(process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
    .find(Boolean) || "http://localhost:5173";

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/admin-login", adminLogin);
router.post("/firebase", firebaseAuth);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", protect, me);
router.patch("/password", protect, changePassword);
router.delete("/me", protect, deleteMe);

router.get("/google", (req, res, next) => {
  if (!ensureGoogleStrategy()) {
    return googleAuthUnavailable(req, res);
  }

  return passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!ensureGoogleStrategy()) {
    return googleAuthUnavailable(req, res);
  }

  return passport.authenticate("google", {
    session: false,
    failureRedirect: `${getFrontendUrl()}/login?error=google_auth`
  })(req, res, next);
}, googleCallback);

export default router;
