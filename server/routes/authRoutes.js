import express from "express";
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

router.post("/register", register);
router.post("/login", login);
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
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth`
  })(req, res, next);
}, googleCallback);

export default router;
