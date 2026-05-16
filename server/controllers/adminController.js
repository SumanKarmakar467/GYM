import OnboardingProfile from "../models/OnboardingProfile.js";
import TodoItem from "../models/TodoItem.js";
import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";
import WorkoutPlan from "../models/WorkoutPlan.js";

const toId = (value) => String(value?._id || value || "");

const serializeActivity = (activity, user = null) => ({
  id: activity._id,
  userId: activity.userId,
  type: activity.type,
  message: activity.message,
  metadata: activity.metadata || {},
  createdAt: activity.createdAt,
  user: user
    ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user"
      }
    : null
});

export const getAdminOverview = async (req, res) => {
  try {
    const [users, admins, onboardedUsers, plans, todos, completedTodos, logins, registrations, activities] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isOnboarded: true }),
      WorkoutPlan.countDocuments(),
      TodoItem.countDocuments(),
      TodoItem.countDocuments({ completed: true }),
      UserActivity.countDocuments({ type: { $in: ["login", "admin_login"] } }),
      UserActivity.countDocuments({ type: "register" }),
      UserActivity.find().sort({ createdAt: -1 }).limit(500)
    ]);
    const activeUsers = new Set(activities.map((activity) => toId(activity.userId)).filter(Boolean)).size;

    return res.json({
      users,
      admins,
      onboardedUsers,
      profiles: await OnboardingProfile.countDocuments(),
      plans,
      todos,
      completedTodos,
      logins,
      registrations,
      totalActivity: await UserActivity.countDocuments(),
      activeUsers
    });
  } catch {
    return res.status(500).json({ message: "Failed to load admin overview." });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query?.limit) || 50, 1), 200);
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email role isOnboarded createdAt avatar");
    const userIds = users.map((user) => user._id);
    const activities = await UserActivity.find({ userId: { $in: userIds } }).sort({ createdAt: -1 }).limit(5000);
    const usageByUser = new Map();

    activities.forEach((activity) => {
      const key = toId(activity.userId);
      const entry = usageByUser.get(key) || {
        totalActivity: 0,
        loginCount: 0,
        planCount: 0,
        todoActions: 0,
        lastActivityAt: null,
        lastActivity: ""
      };

      entry.totalActivity += 1;
      if (activity.type === "login" || activity.type === "admin_login") {
        entry.loginCount += 1;
      }
      if (activity.type === "plan_generated") {
        entry.planCount += 1;
      }
      if (String(activity.type || "").startsWith("todo_")) {
        entry.todoActions += 1;
      }
      if (!entry.lastActivityAt) {
        entry.lastActivityAt = activity.createdAt;
        entry.lastActivity = activity.message;
      }

      usageByUser.set(key, entry);
    });

    return res.json({
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        isOnboarded: Boolean(user.isOnboarded),
        createdAt: user.createdAt,
        avatar: user.avatar,
        usage: usageByUser.get(toId(user._id)) || {
          totalActivity: 0,
          loginCount: 0,
          planCount: 0,
          todoActions: 0,
          lastActivityAt: null,
          lastActivity: ""
        }
      }))
    });
  } catch {
    return res.status(500).json({ message: "Failed to load users." });
  }
};

export const getAdminActivity = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query?.limit) || 75, 1), 250);
    const activities = await UserActivity.find().sort({ createdAt: -1 }).limit(limit);
    const userIds = Array.from(new Set(activities.map((activity) => toId(activity.userId)).filter(Boolean)));
    const users = await User.find({ _id: { $in: userIds } }).select("name email role");
    const usersById = new Map(users.map((user) => [toId(user._id), user]));

    return res.json({
      activities: activities.map((activity) => serializeActivity(activity, usersById.get(toId(activity.userId))))
    });
  } catch {
    return res.status(500).json({ message: "Failed to load activity history." });
  }
};
