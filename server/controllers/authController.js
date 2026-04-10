import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../services/tokenService.js";
import { verifyFirebaseIdToken } from "../services/firebaseAuth.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const getAdminEmails = () => {
  const fromList = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

  const fromSingle = normalizeEmail(process.env.ADMIN_EMAIL);

  const adminEmails = new Set([...fromList, fromSingle]);
  return adminEmails;
};

const getAdminPassword = () => String(process.env.ADMIN_PASSWORD || "");

const isAdminEmail = (email) => getAdminEmails().has(normalizeEmail(email));

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
  avatar: user.avatar,
  isOnboarded: Boolean(user.isOnboarded),
  createdAt: user.createdAt
});

const issueAuthTokens = async (res, user) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email }).select("+passwordHash");
    if (existingUser?.passwordHash) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    if (existingUser && !existingUser.passwordHash) {
      return res.status(409).json({ message: "This email is registered with Google. Use Google Sign In." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      role: isAdminEmail(email) ? "admin" : "user",
      passwordHash
    });

    await issueAuthTokens(res, user);

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Registration failed." });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+passwordHash +refreshToken");

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    await issueAuthTokens(res, user);

    return res.json({ user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Login failed." });
  }
};

export const me = async (req, res) => res.json({ user: sanitizeUser(req.user) });

export const firebaseAuth = async (req, res) => {
  try {
    const idToken = String(req.body?.idToken || "");
    const payload = await verifyFirebaseIdToken(idToken);

    const firebaseUid = String(payload.user_id || payload.sub || "");
    const email = normalizeEmail(payload.email);
    const name = String(payload.name || email.split("@")[0] || "GymForge User");
    const avatar = String(payload.picture || "");
    const shouldBeAdmin = isAdminEmail(email);

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "Invalid Firebase token payload." });
    }

    let user = await User.findOne({
      $or: [{ googleId: firebaseUid }, { email }]
    }).select("+refreshToken");

    if (!user) {
      user = await User.create({
        name,
        email,
        role: shouldBeAdmin ? "admin" : "user",
        googleId: firebaseUid,
        avatar
      });
      user = await User.findById(user._id).select("+refreshToken");
    } else {
      let changed = false;
      if (!user.googleId) {
        user.googleId = firebaseUid;
        changed = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (!user.name && name) {
        user.name = name;
        changed = true;
      }
      if (shouldBeAdmin && user.role !== "admin") {
        user.role = "admin";
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    await issueAuthTokens(res, user);
    return res.json({ user: sanitizeUser(user) });
  } catch {
    return res.status(401).json({ message: "Firebase authentication failed." });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (!getAdminPassword() || getAdminEmails().size === 0) {
      return res.status(503).json({ message: "Admin credentials are not configured on server." });
    }

    if (!isAdminEmail(email) || password !== getAdminPassword()) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    let user = await User.findOne({ email }).select("+refreshToken");

    if (!user) {
      user = await User.create({
        name: "Admin",
        email,
        role: "admin",
        isOnboarded: true
      });

      user = await User.findById(user._id).select("+refreshToken");
    } else if (user.role !== "admin") {
      user.role = "admin";
      if (!user.isOnboarded) {
        user.isOnboarded = true;
      }
      await user.save();
    }

    await issueAuthTokens(res, user);
    return res.json({ user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Admin login failed." });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (refreshToken) {
      await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });
    }

    clearAuthCookies(res);
    return res.json({ message: "Logged out." });
  } catch {
    clearAuthCookies(res);
    return res.json({ message: "Logged out." });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token." });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    await issueAuthTokens(res, user);

    return res.json({ user: sanitizeUser(user) });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Refresh token expired." });
  }
};

export const googleAuthUnavailable = (req, res) => {
  return res.status(503).json({ message: "Google OAuth is not configured on this server." });
};

export const googleCallback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");

    await issueAuthTokens(res, user);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const destination = user.isOnboarded ? "/dashboard" : "/onboarding";

    return res.redirect(`${frontendUrl}${destination}`);
  } catch {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/login?error=google_callback_failed`);
  }
};
