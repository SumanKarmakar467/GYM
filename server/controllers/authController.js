import bcrypt from "bcrypt";
import mongoose from "mongoose";
import OnboardingProfile from "../models/OnboardingProfile.js";
import DietLog from "../models/DietLog.js";
import TodoItem from "../models/TodoItem.js";
import User from "../models/User.js";
import WallpaperConfig from "../models/WallpaperConfig.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import {
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../services/tokenService.js";
import { recordActivity } from "../services/activityService.js";
import { verifyFirebaseIdToken } from "../services/firebaseAuth.js";
import { isLocalDataFallbackActive } from "../utils/localModel.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const getFrontendUrl = () =>
  String(process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
    .find(Boolean) || "http://localhost:5173";

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

const isDemoLoginEnabled = () => process.env.ENABLE_DEMO_LOGIN !== "false";

const buildDemoPlan = (userId) => ({
  userId,
  planName: "Demo Muscle Builder",
  goal: "Build Muscle",
  level: "Intermediate",
  daysPerWeek: "",
  durationLabel: "1 month",
  equipment: "Full Gym",
  environment: "gym",
  durationWeeks: 4,
  generatedAt: new Date(),
  weeks: Array.from({ length: 4 }).map((_, weekIndex) => ({
    weekNumber: weekIndex + 1,
    theme: weekIndex === 0 ? "Foundation" : "Progressive Overload",
    days: [
      {
        dayName: "Monday",
        focus: "Push Strength",
        isRestDay: false,
        warmup: "5 min incline walk + shoulder mobility",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "6-8", rest: "90s", notes: "Control the eccentric." },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: "8-10", rest: "75s", notes: "Keep ribs down." },
          { name: "Incline Cable Fly", sets: 3, reps: "12-15", rest: "60s", notes: "Squeeze at the top." }
        ],
        cooldown: "Chest and triceps stretch"
      },
      {
        dayName: "Tuesday",
        focus: "Pull Hypertrophy",
        isRestDay: false,
        warmup: "Band pull-aparts + light rows",
        exercises: [
          { name: "Lat Pulldown", sets: 4, reps: "8-12", rest: "75s", notes: "Drive elbows down." },
          { name: "Cable Row", sets: 3, reps: "10-12", rest: "75s", notes: "Pause on each rep." },
          { name: "Incline Curl", sets: 3, reps: "10-12", rest: "60s", notes: "Slow negative." }
        ],
        cooldown: "Lat and biceps stretch"
      },
      {
        dayName: "Wednesday",
        focus: "Lower Body",
        isRestDay: false,
        warmup: "Bike + hip mobility",
        exercises: [
          { name: "Bodyweight Squat", sets: 4, reps: "12-15", rest: "60s", notes: "Full depth." },
          { name: "Bulgarian Split Squat", sets: 3, reps: "8-10 each", rest: "75s", notes: "Stay balanced." },
          { name: "Barbell Calf Raise", sets: 4, reps: "12-15", rest: "45s", notes: "Pause at peak." }
        ],
        cooldown: "Quad and hamstring stretch"
      },
      {
        dayName: "Thursday",
        focus: "Recovery",
        isRestDay: true,
        warmup: "Easy walk",
        exercises: [],
        cooldown: "10 min mobility flow"
      },
      {
        dayName: "Friday",
        focus: "Upper Volume",
        isRestDay: false,
        warmup: "Dynamic upper body mobility",
        exercises: [
          { name: "Dumbbell Press", sets: 3, reps: "10-12", rest: "75s", notes: "Smooth tempo." },
          { name: "Pull-up", sets: 4, reps: "AMRAP", rest: "90s", notes: "Use assistance if needed." },
          { name: "Cable Lateral Raise", sets: 3, reps: "12-15", rest: "45s", notes: "Lead with elbows." }
        ],
        cooldown: "Shoulder mobility"
      },
      {
        dayName: "Saturday",
        focus: "Conditioning",
        isRestDay: false,
        warmup: "5 min easy cardio",
        exercises: [
          { name: "Push-up", sets: 4, reps: "12-20", rest: "45s", notes: "Keep a straight line." },
          { name: "Barbell Lunge", sets: 3, reps: "10 each", rest: "60s", notes: "Soft landing." },
          { name: "Core / Finisher", sets: 3, reps: "45s", rest: "45s", notes: "Stay braced." }
        ],
        cooldown: "Full-body stretch"
      },
      {
        dayName: "Sunday",
        focus: "Rest & Mobility",
        isRestDay: true,
        warmup: "Breathing reset",
        exercises: [],
        cooldown: "Light stretching"
      }
    ]
  }))
});

const formatDateYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const seedDemoTodos = async (userId, plan) => {
  const existing = await TodoItem.countDocuments({ userId });
  if (existing > 0) {
    return;
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const todos = [];
  plan.weeks.forEach((week, weekIndex) => {
    week.days.forEach((day, dayIndex) => {
      if (day.isRestDay) {
        return;
      }

      const date = new Date(startDate);
      date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

      day.exercises.forEach((exercise, exerciseIndex) => {
        todos.push({
          userId,
          date: formatDateYmd(date),
          weekNum: week.weekNumber,
          dayNum: dayIndex + 1,
          exerciseId: `demo-w${week.weekNumber}-d${dayIndex + 1}-e${exerciseIndex + 1}`,
          exerciseName: exercise.name,
          exerciseIndex,
          completed: weekIndex === 0 && dayIndex < 2,
          completedAt: weekIndex === 0 && dayIndex < 2 ? new Date() : null
        });
      });
    });
  });

  if (todos.length > 0) {
    await TodoItem.insertMany(todos);
  }
};

const ensureDemoAccount = async () => {
  const email = normalizeEmail(process.env.DEMO_EMAIL || "demo@gymforge.app");
  let user = await User.findOne({ email }).select("+refreshToken");

  if (!user) {
    user = await User.create({
      name: "Demo Athlete",
      email,
      role: "user",
      dietPreference: "non-veg",
      isOnboarded: true
    });
    user = await User.findById(user._id).select("+refreshToken");
  } else if (!user.isOnboarded) {
    user.isOnboarded = true;
    await user.save();
  }

  await OnboardingProfile.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      age: 24,
      weightKg: 74,
      heightCm: 176,
      gender: "male",
      goal: "bodybuilder",
      environment: "gym",
      durationWeeks: 4,
      dietPreference: "non-veg"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let plan = await WorkoutPlan.findOne({ userId: user._id });
  if (!plan) {
    plan = await WorkoutPlan.create(buildDemoPlan(user._id));
  }

  await seedDemoTodos(user._id, plan);
  return user;
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
  avatar: user.avatar,
  dietPreference: user.dietPreference || "veg",
  isOnboarded: Boolean(user.isOnboarded),
  hasPassword: Boolean(user.passwordHash),
  createdAt: user.createdAt
});

const isDatabaseConnected = () => mongoose.connection.readyState === 1 || isLocalDataFallbackActive();

const databaseUnavailableResponse = (res) =>
  res.status(503).json({
    message: "Database is not connected. Check MONGO_URI and MongoDB Atlas Network Access IP whitelist."
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
    if (!isDatabaseConnected()) {
      return databaseUnavailableResponse(res);
    }

    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const dietPreference = String(req.body?.dietPreference || "veg") === "non-veg" ? "non-veg" : "veg";

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
      dietPreference,
      passwordHash
    });

    await issueAuthTokens(res, user);
    await recordActivity(user._id, "register", "Registered with email and password.");

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Registration failed:", error?.message || error);
    return res.status(500).json({ message: "Registration failed." });
  }
};

export const login = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return databaseUnavailableResponse(res);
    }

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+passwordHash +refreshToken");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: "This account uses Google Sign-In. Continue with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    await issueAuthTokens(res, user);
    await recordActivity(user._id, "login", "Logged in with email and password.");

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login failed:", error?.message || error);
    return res.status(500).json({ message: "Login failed." });
  }
};

export const demoLogin = async (req, res) => {
  try {
    if (!isDemoLoginEnabled()) {
      return res.status(404).json({ message: "Demo login is not enabled." });
    }

    if (!isDatabaseConnected()) {
      return databaseUnavailableResponse(res);
    }

    const user = await ensureDemoAccount();
    await issueAuthTokens(res, user);
    await recordActivity(user._id, "demo_login", "Started demo session.");

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Demo login failed:", error?.message || error);
    return res.status(500).json({ message: "Demo login failed." });
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
        avatar,
        dietPreference: "veg"
      });
      user = await User.findById(user._id).select("+refreshToken");
      await recordActivity(user._id, "register", "Registered with Google.");
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
    await recordActivity(user._id, "login", "Logged in with Google.");
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
      await recordActivity(user._id, "register", "Admin account created from configured credentials.");
    } else if (user.role !== "admin") {
      user.role = "admin";
      if (!user.isOnboarded) {
        user.isOnboarded = true;
      }
      await user.save();
    }

    await issueAuthTokens(res, user);
    await recordActivity(user._id, "admin_login", "Logged in to the admin panel.");
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

export const changePassword = async (req, res) => {
  try {
    const oldPassword = String(req.body?.oldPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");

    if (!user) {
      return res.status(400).json({ message: "Password change is unavailable for this account." });
    }

    if (!user.passwordHash) {
      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      return res.json({ message: "Password added successfully." });
    }

    if (!oldPassword) {
      return res.status(400).json({ message: "Old password is required." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: "Password updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update password." });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      TodoItem.deleteMany({ userId }),
      WorkoutPlan.deleteMany({ userId }),
      WallpaperConfig.deleteMany({ userId }),
      DietLog.deleteMany({ userId }),
      OnboardingProfile.deleteMany({ userId }),
      User.deleteOne({ _id: userId })
    ]);

    clearAuthCookies(res);
    return res.json({ message: "Account deleted." });
  } catch {
    return res.status(500).json({ message: "Failed to delete account." });
  }
};

export const googleAuthUnavailable = (req, res) => {
  return res.status(503).json({ message: "Google OAuth is not configured on this server." });
};

export const googleCallback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");

    await issueAuthTokens(res, user);

    const frontendUrl = getFrontendUrl();
    const destination = user.isOnboarded ? "/dashboard" : "/onboarding";

    return res.redirect(`${frontendUrl}${destination}`);
  } catch {
    const frontendUrl = getFrontendUrl();
    return res.redirect(`${frontendUrl}/login?error=google_callback_failed`);
  }
};
