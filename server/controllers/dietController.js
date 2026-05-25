import DietLog from "../models/DietLog.js";
import OnboardingProfile from "../models/OnboardingProfile.js";
import { recordActivity } from "../services/activityService.js";

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const foodImages = {
  oats: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=85",
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85",
  dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85",
  tofu: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=900&q=85",
  eggs: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85",
  chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",
  fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",
  curd: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
  chickpea: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=85",
  rice: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
  whey: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=85"
};

const vegFoods = [
  { key: "breakfast-oats-curd", meal: "Breakfast", name: "Greek curd oats bowl", protein: 28, fiber: 9, calories: 430, image: foodImages.oats, note: "Oats, curd, banana, chia, almonds." },
  { key: "lunch-paneer-dal", meal: "Lunch", name: "Paneer dal power plate", protein: 42, fiber: 14, calories: 680, image: foodImages.paneer, note: "Paneer, dal, rice, cucumber salad." },
  { key: "snack-whey-chickpea", meal: "Snack", name: "Whey + roasted chana", protein: 34, fiber: 8, calories: 310, image: foodImages.whey, note: "Fast protein with high-fiber crunch." },
  { key: "dinner-tofu-salad", meal: "Dinner", name: "Tofu greens bowl", protein: 36, fiber: 13, calories: 520, image: foodImages.tofu, note: "Tofu, mixed vegetables, quinoa or roti." }
];

const nonVegFoods = [
  { key: "breakfast-eggs-oats", meal: "Breakfast", name: "Eggs and oats plate", protein: 34, fiber: 8, calories: 470, image: foodImages.eggs, note: "3 eggs, oats, fruit, black coffee." },
  { key: "lunch-chicken-rice", meal: "Lunch", name: "Chicken rice training bowl", protein: 52, fiber: 9, calories: 720, image: foodImages.chicken, note: "Grilled chicken, rice, dal, salad." },
  { key: "snack-curd-chickpea", meal: "Snack", name: "Curd and chickpea bowl", protein: 24, fiber: 10, calories: 330, image: foodImages.curd, note: "Curd, chickpeas, onion, tomato, lemon." },
  { key: "dinner-fish-greens", meal: "Dinner", name: "Fish with greens", protein: 46, fiber: 11, calories: 560, image: foodImages.fish, note: "Fish, vegetables, roti or sweet potato." }
];

const goalLabel = {
  bodybuilder: "Muscular",
  powerlifter: "Power and Strength",
  calisthenics: "Lean and Athletic",
  crossfit: "Functional Endurance",
  athlete: "Lean and Athletic"
};

const getTargets = (profile, user) => {
  const weight = Number(profile?.weightKg || 70);
  const goal = String(profile?.goal || "athlete");
  const proteinMultiplier = goal === "bodybuilder" || goal === "powerlifter" ? 2.1 : goal === "athlete" ? 1.8 : 1.7;
  const calories = Math.round(weight * (goal === "bodybuilder" || goal === "powerlifter" ? 36 : goal === "athlete" ? 30 : 33));

  return {
    weightKg: weight,
    bodyGoal: goalLabel[goal] || "Lean and Athletic",
    dietPreference: profile?.dietPreference || user.dietPreference || "veg",
    proteinGrams: Math.round(weight * proteinMultiplier),
    fiberGrams: Math.max(25, Math.round(calories / 1000 * 14)),
    calories
  };
};

const scaleFoods = (foods, targets) => {
  const baseProtein = foods.reduce((sum, food) => sum + food.protein, 0);
  const factor = baseProtein > 0 ? targets.proteinGrams / baseProtein : 1;
  return foods.map((food) => ({
    ...food,
    protein: Math.round(food.protein * factor),
    fiber: Math.max(2, Math.round(food.fiber * Math.min(1.35, Math.max(0.85, factor)))),
    calories: Math.round(food.calories * Math.min(1.25, Math.max(0.85, factor)))
  }));
};

const getTodayLog = async (userId, date) => {
  const log = await DietLog.findOne({ userId, date });
  return log || { userId, date, completedKeys: [] };
};

export const getDietPlan = async (req, res) => {
  try {
    const date = String(req.query.date || toYmd(new Date()));
    const profile = await OnboardingProfile.findOne({ userId: req.user._id });
    const targets = getTargets(profile, req.user);
    const foods = scaleFoods(targets.dietPreference === "non-veg" ? nonVegFoods : vegFoods, targets);
    const log = await getTodayLog(req.user._id, date);
    const completedKeys = Array.isArray(log.completedKeys) ? log.completedKeys : [];
    const historyStart = addDays(new Date(`${date}T00:00:00`), -13);
    const historyDates = Array.from({ length: 14 }).map((_, index) => toYmd(addDays(historyStart, index)));
    const logs = await DietLog.find({ userId: req.user._id, date: { $in: historyDates } });
    const logByDate = new Map(logs.map((entry) => [entry.date, entry]));

    const history = historyDates.map((day) => {
      const entry = logByDate.get(day);
      const count = entry?.completedKeys?.length || 0;
      return {
        date: day,
        completed: count,
        total: foods.length,
        percent: foods.length ? Math.round((count / foods.length) * 100) : 0
      };
    });

    return res.json({
      profile: targets,
      foods,
      today: {
        date,
        completedKeys,
        completed: completedKeys.length,
        total: foods.length,
        percent: foods.length ? Math.round((completedKeys.length / foods.length) * 100) : 0
      },
      history
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch diet plan." });
  }
};

export const updateDietLog = async (req, res) => {
  try {
    const date = String(req.body?.date || toYmd(new Date()));
    const itemKey = String(req.body?.itemKey || "").trim();
    const completed = Boolean(req.body?.completed);

    if (!itemKey) {
      return res.status(400).json({ message: "itemKey is required." });
    }

    const current = await getTodayLog(req.user._id, date);
    const keys = new Set(current.completedKeys || []);
    if (completed) keys.add(itemKey);
    else keys.delete(itemKey);

    const log = await DietLog.findOneAndUpdate(
      { userId: req.user._id, date },
      { userId: req.user._id, date, completedKeys: Array.from(keys) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recordActivity(req.user._id, completed ? "diet_completed" : "diet_reopened", `${completed ? "Completed" : "Reopened"} diet item.`, { date, itemKey });

    return res.json(log);
  } catch {
    return res.status(500).json({ message: "Failed to update diet log." });
  }
};
