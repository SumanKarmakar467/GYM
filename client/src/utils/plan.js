import { addDays, toYmd } from "./date";

export const getExerciseDateMap = (plan) => {
  if (!plan?.weeks?.length || !plan.generatedAt) {
    return new Map();
  }

  const start = new Date(plan.generatedAt);
  start.setHours(0, 0, 0, 0);

  const map = new Map();

  plan.weeks.forEach((week, weekIndex) => {
    week.days.forEach((day, dayIndex) => {
      const date = toYmd(addDays(start, weekIndex * 7 + dayIndex));
      const key = `${week.weekNumber}-${dayIndex + 1}`;
      map.set(key, date);
    });
  });

  return map;
};

export const getTodayWorkoutRoute = (plan) => {
  if (!plan?.weeks?.length) {
    return null;
  }

  const dateMap = getExerciseDateMap(plan);
  const today = toYmd(new Date());

  for (const [key, value] of dateMap.entries()) {
    if (value === today) {
      const [weekNum, dayNum] = key.split("-");
      return `/workout/${weekNum}/${dayNum}`;
    }
  }

  return "/workout/1/1";
};