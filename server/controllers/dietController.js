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
  eggs: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=88",
  chicken: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=88",
  fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=88",
  prawns: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=88",
  tuna: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=88",
  turkey: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&w=900&q=88",
  leanMeat: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=88",
  salmon: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=88",
  paneer: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?auto=format&fit=crop&w=900&q=88",
  tofu: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=900&q=88",
  dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=88",
  chickpea: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=88",
  rajma: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=900&q=88",
  sprout: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=88",
  oats: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=88",
  curd: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=88",
  quinoa: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=88",
  peanutButter: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=88",
  rice: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=88",
  sweetPotato: "https://images.unsplash.com/photo-1579123521334-44e68095cd7a?auto=format&fit=crop&w=900&q=88"
};

const foods = [
  { key: "egg-plate", meal: "Non-Veg", name: "Egg Plate", protein: 13, carbs: 1, fiber: 0, calories: 155, image: foodImages.eggs, note: "Boiled or scrambled eggs for fast complete protein." },
  { key: "grilled-chicken", meal: "Non-Veg", name: "Grilled Chicken", protein: 31, carbs: 0, fiber: 0, calories: 165, image: foodImages.chicken, note: "Lean chicken breast for muscle repair." },
  { key: "fish-fillet", meal: "Non-Veg", name: "Fish Fillet", protein: 26, carbs: 0, fiber: 0, calories: 206, image: foodImages.fish, note: "High protein fish with healthy fats." },
  { key: "prawn-bowl", meal: "Non-Veg", name: "Prawns", protein: 24, carbs: 0, fiber: 0, calories: 99, image: foodImages.prawns, note: "Light seafood protein for lean meals." },
  { key: "tuna-bowl", meal: "Non-Veg", name: "Tuna Bowl", protein: 29, carbs: 0, fiber: 0, calories: 132, image: foodImages.tuna, note: "Dense protein with low calories." },
  { key: "turkey-slices", meal: "Non-Veg", name: "Turkey Slices", protein: 29, carbs: 0, fiber: 0, calories: 147, image: foodImages.turkey, note: "Lean poultry option for high-protein plates." },
  { key: "lean-meat", meal: "Non-Veg", name: "Lean Meat", protein: 26, carbs: 0, fiber: 0, calories: 250, image: foodImages.leanMeat, note: "Controlled portion meat for strength phases." },
  { key: "salmon-steak", meal: "Non-Veg", name: "Salmon", protein: 25, carbs: 0, fiber: 0, calories: 208, image: foodImages.salmon, note: "Protein plus omega fats for recovery." },
  { key: "paneer-cubes", meal: "Veg", name: "Paneer", protein: 18, carbs: 3, fiber: 0, calories: 265, image: foodImages.paneer, note: "Classic vegetarian protein for lunch or dinner." },
  { key: "tofu-bowl", meal: "Veg", name: "Tofu", protein: 17, carbs: 3, fiber: 2, calories: 144, image: foodImages.tofu, note: "Light plant protein that pairs well with vegetables." },
  { key: "dal-bowl", meal: "Veg", name: "Dal", protein: 9, carbs: 20, fiber: 8, calories: 116, image: foodImages.dal, note: "Everyday Indian protein with high fiber." },
  { key: "roasted-chana", meal: "Veg", name: "Roasted Chana", protein: 19, carbs: 60, fiber: 17, calories: 360, image: foodImages.chickpea, note: "Crunchy high-fiber vegetarian snack." },
  { key: "rajma-bowl", meal: "Veg", name: "Rajma", protein: 9, carbs: 23, fiber: 6, calories: 127, image: foodImages.rajma, note: "Kidney beans for carbs, fiber, and protein." },
  { key: "sprout-salad", meal: "Veg", name: "Sprout Salad", protein: 8, carbs: 14, fiber: 5, calories: 105, image: foodImages.sprout, note: "Fresh sprouts for micronutrients and crunch." },
  { key: "oats-bowl", meal: "Common", name: "Oats Bowl", protein: 13, carbs: 68, fiber: 10, calories: 389, image: foodImages.oats, note: "Slow carbs and fiber for training energy." },
  { key: "greek-curd", meal: "Common", name: "Greek Curd", protein: 10, carbs: 4, fiber: 0, calories: 98, image: foodImages.curd, note: "Easy protein that supports daily targets." },
  { key: "quinoa-bowl", meal: "Common", name: "Quinoa Bowl", protein: 4, carbs: 21, fiber: 3, calories: 120, image: foodImages.quinoa, note: "Balanced carb base with extra minerals." },
  { key: "peanut-butter", meal: "Common", name: "Peanut Butter", protein: 25, carbs: 20, fiber: 6, calories: 588, image: foodImages.peanutButter, note: "Calorie-dense add-on for bulking phases." },
  { key: "rice-bowl", meal: "Common", name: "Rice Bowl", protein: 3, carbs: 28, fiber: 1, calories: 130, image: foodImages.rice, note: "Simple carb source for workout fuel." },
  { key: "sweet-potato", meal: "Common", name: "Sweet Potato", protein: 2, carbs: 20, fiber: 3, calories: 86, image: foodImages.sweetPotato, note: "Clean carbs and fiber for steady energy." }
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

const scaleFoods = (items, targets) => {
  const baseProtein = items.reduce((sum, food) => sum + food.protein, 0);
  const factor = baseProtein > 0 ? targets.proteinGrams / baseProtein : 1;
  return items.map((food) => ({
    ...food,
    protein: Math.max(1, Math.round(food.protein * factor)),
    carbs: Math.max(0, Math.round(food.carbs * Math.min(1.2, Math.max(0.9, factor)))),
    fiber: Math.max(0, Math.round(food.fiber * Math.min(1.25, Math.max(0.9, factor)))),
    calories: Math.round(food.calories * Math.min(1.2, Math.max(0.9, factor)))
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
    const scaledFoods = scaleFoods(foods, targets);
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
        total: scaledFoods.length,
        percent: scaledFoods.length ? Math.round((count / scaledFoods.length) * 100) : 0
      };
    });

    return res.json({
      profile: targets,
      foods: scaledFoods,
      today: {
        date,
        completedKeys,
        completed: completedKeys.length,
        total: scaledFoods.length,
        percent: scaledFoods.length ? Math.round((completedKeys.length / scaledFoods.length) * 100) : 0
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
