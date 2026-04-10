import OnboardingProfile from "../models/OnboardingProfile.js";
import TodoItem from "../models/TodoItem.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";

export const getAdminOverview = async (req, res) => {
  try {
    const [users, admins, onboardedUsers, plans, todos, completedTodos] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isOnboarded: true }),
      WorkoutPlan.countDocuments(),
      TodoItem.countDocuments(),
      TodoItem.countDocuments({ completed: true })
    ]);

    return res.json({
      users,
      admins,
      onboardedUsers,
      profiles: await OnboardingProfile.countDocuments(),
      plans,
      todos,
      completedTodos
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

    return res.json({ users });
  } catch {
    return res.status(500).json({ message: "Failed to load users." });
  }
};
