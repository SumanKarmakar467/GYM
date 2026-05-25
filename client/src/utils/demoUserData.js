import { addDays, getStartOfWeek, toYmd } from "./date";

export const DEMO_EMAIL = "0dhonironaldo77@gmail.com";

export const isDemoAthlete = (user) => String(user?.email || "").toLowerCase() === DEMO_EMAIL;

const homeExercises = {
  push: [
    { name: "Decline Push-ups", sets: 4, reps: "10-14", rest: "60s" },
    { name: "Pike Shoulder Press", sets: 3, reps: "8-12", rest: "75s" },
    { name: "Chair Triceps Dips", sets: 3, reps: "10-15", rest: "60s" },
    { name: "Slow Mountain Climbers", sets: 3, reps: "40s", rest: "45s" }
  ],
  pull: [
    { name: "Backpack Bent-over Row", sets: 4, reps: "12-15", rest: "75s" },
    { name: "Towel Door Row", sets: 3, reps: "8-12", rest: "90s" },
    { name: "Reverse Snow Angels", sets: 3, reps: "15", rest: "45s" },
    { name: "Superman Hold", sets: 3, reps: "35s", rest: "45s" }
  ],
  lower: [
    { name: "Tempo Bodyweight Squat", sets: 4, reps: "15", rest: "75s" },
    { name: "Reverse Lunges", sets: 3, reps: "12 each leg", rest: "75s" },
    { name: "Single-leg Glute Bridge", sets: 3, reps: "12 each leg", rest: "60s" },
    { name: "Wall Sit", sets: 3, reps: "45s", rest: "60s" }
  ],
  core: [
    { name: "Plank Shoulder Taps", sets: 4, reps: "30s", rest: "45s" },
    { name: "Dead Bug", sets: 3, reps: "12 each side", rest: "45s" },
    { name: "Hollow Body Hold", sets: 3, reps: "25s", rest: "45s" },
    { name: "Burpee Finisher", sets: 4, reps: "8", rest: "60s" }
  ]
};

const weekTemplate = [
  ["Monday", "Push Strength", homeExercises.push],
  ["Tuesday", "Pull + Posture", homeExercises.pull],
  ["Wednesday", "Legs at Home", homeExercises.lower],
  ["Thursday", "Core Conditioning", homeExercises.core],
  ["Friday", "Upper Body Density", [...homeExercises.push.slice(0, 2), ...homeExercises.pull.slice(0, 2)]],
  ["Saturday", "Mobility + Cardio", [
    { name: "Jumping Jacks", sets: 4, reps: "45s", rest: "30s" },
    { name: "Hip Mobility Flow", sets: 3, reps: "60s", rest: "30s" },
    { name: "Incline Push-up Practice", sets: 3, reps: "12", rest: "45s" },
    { name: "Walk or Stair Climb", sets: 1, reps: "20 min", rest: "0s" }
  ]],
  ["Sunday", "Recovery", [
    { name: "Full-body Stretch", sets: 1, reps: "15 min", rest: "0s" },
    { name: "Easy Walk", sets: 1, reps: "25 min", rest: "0s" },
    { name: "Sleep Prep Routine", sets: 1, reps: "10 min", rest: "0s" }
  ]]
];

export const demoWorkoutPlan = {
  goal: "Lean muscle and fat loss",
  level: "Intermediate",
  equipment: "Home setup: backpack, chair, towel, floor space",
  daysPerWeek: 6,
  durationLabel: "4 weeks",
  weeks: Array.from({ length: 4 }).map((_, weekIndex) => ({
    weekNumber: weekIndex + 1,
    days: weekTemplate.map(([dayName, focus, exercises], dayIndex) => ({
      dayName,
      focus,
      exercises: exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        name: weekIndex === 0 ? exercise.name : `${exercise.name}`,
        notes: dayIndex === 0 && exerciseIndex === 0 ? "Use a slow 3-second lowering tempo." : ""
      }))
    }))
  }))
};

export const demoWallpaper = {
  quote: "One month in. No missed Mondays.",
  style: "Fire"
};

const getCompletionPercent = (dateKey) => {
  const day = new Date(`${dateKey}T12:00:00`).getDay();
  if (day === 0) return 100;
  if (day === 6) return 75;
  const dayOfMonth = Number(dateKey.slice(-2));
  return [100, 83, 100, 67, 92][dayOfMonth % 5];
};

export const getDemoTodoStats = (weekDates) => ({
  streak: 24,
  totalCompleted: 103,
  totalTodos: 124,
  daily: weekDates.map((item) => ({
    date: item.date,
    percent: getCompletionPercent(item.date)
  }))
});

export const getDemoTodosForDate = (dateKey = toYmd(new Date())) => {
  const date = new Date(`${dateKey}T12:00:00`);
  const todayKey = toYmd(new Date());
  const isFuture = dateKey > todayKey;
  const dayIndex = (date.getDay() + 6) % 7;
  const [dayName, focus, exercises] = weekTemplate[dayIndex];
  const completionPercent = isFuture ? 0 : getCompletionPercent(dateKey);
  const doneCount = Math.round((exercises.length * completionPercent) / 100);

  const habits = [
    `${focus}: ${exercises[0]?.name || "Workout"}`,
    `${focus}: ${exercises[1]?.name || "Technique work"}`,
    "Drink 3L water",
    "Protein target: 130g",
    "10-minute mobility reset"
  ];

  return habits.map((exerciseName, index) => ({
    _id: `demo-${dateKey}-${index}`,
    date: dateKey,
    dayName,
    exerciseName,
    completed: !isFuture && index < Math.min(doneCount + 1, habits.length)
  }));
};

export const getDemoWeekStatus = (weekDates) =>
  Object.fromEntries(
    weekDates.map((item) => {
      const todos = getDemoTodosForDate(item.key);
      return [
        item.key,
        {
          total: todos.length,
          completed: todos.filter((todo) => todo.completed).length
        }
      ];
    })
  );

export const getDemoWeeklyData = () => {
  const start = getStartOfWeek(new Date());
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
    const date = toYmd(addDays(start, index));
    return { day, date, percent: getCompletionPercent(date) };
  });
};
