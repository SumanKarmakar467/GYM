const dayCodes = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultWeek = [
  {
    day: "Mon",
    name: "Push Focus",
    muscles: "Chest / Shoulders / Triceps",
    exercises: [
      { name: "Bench Press", muscle: "Chest", sets: "4", reps: "6-10", rest: "90s" },
      { name: "Incline Dumbbell Press", muscle: "Chest", sets: "3", reps: "8-12", rest: "75s" },
      { name: "Shoulder Press", muscle: "Shoulders", sets: "3", reps: "8-12", rest: "75s" },
      { name: "Cable Pushdown", muscle: "Triceps", sets: "3", reps: "10-15", rest: "60s" }
    ]
  },
  {
    day: "Tue",
    name: "Pull Focus",
    muscles: "Back / Biceps",
    exercises: [
      { name: "Pull-Up", muscle: "Back", sets: "4", reps: "6-10", rest: "90s" },
      { name: "One-Arm Row", muscle: "Back", sets: "3", reps: "8-12", rest: "75s" },
      { name: "Lat Pulldown", muscle: "Back", sets: "3", reps: "10-12", rest: "75s" },
      { name: "Hammer Curl", muscle: "Biceps", sets: "3", reps: "10-12", rest: "60s" }
    ]
  },
  {
    day: "Wed",
    name: "Leg Strength",
    muscles: "Quads / Glutes / Hamstrings",
    exercises: [
      { name: "Back Squat", muscle: "Quads", sets: "4", reps: "5-8", rest: "120s" },
      { name: "Romanian Deadlift", muscle: "Hamstrings", sets: "3", reps: "8-10", rest: "90s" },
      { name: "Walking Lunge", muscle: "Glutes", sets: "3", reps: "10/leg", rest: "75s" },
      { name: "Calf Raise", muscle: "Calves", sets: "4", reps: "12-15", rest: "45s" }
    ]
  },
  {
    day: "Thu",
    name: "Recovery & Core",
    muscles: "Core / Mobility",
    exercises: [
      { name: "Plank", muscle: "Core", sets: "3", reps: "45-60s", rest: "45s" },
      { name: "Dead Bug", muscle: "Core", sets: "3", reps: "10/side", rest: "45s" },
      { name: "Hip Flexor Stretch", muscle: "Mobility", sets: "3", reps: "45s", rest: "30s" },
      { name: "Thoracic Rotations", muscle: "Mobility", sets: "2", reps: "12", rest: "30s" }
    ]
  },
  {
    day: "Fri",
    name: "Upper Power",
    muscles: "Chest / Back / Shoulders",
    exercises: [
      { name: "Incline Press", muscle: "Chest", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Barbell Row", muscle: "Back", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Dips", muscle: "Chest", sets: "3", reps: "8-12", rest: "75s" },
      { name: "Face Pull", muscle: "Shoulders", sets: "3", reps: "12-15", rest: "60s" }
    ]
  },
  {
    day: "Sat",
    name: "Lower + Conditioning",
    muscles: "Legs / Conditioning",
    exercises: [
      { name: "Front Squat", muscle: "Quads", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Hip Thrust", muscle: "Glutes", sets: "3", reps: "8-12", rest: "75s" },
      { name: "Kettlebell Swing", muscle: "Posterior Chain", sets: "4", reps: "15", rest: "45s" },
      { name: "Bike Intervals", muscle: "Conditioning", sets: "6", reps: "30s on", rest: "60s" }
    ]
  },
  {
    day: "Sun",
    name: "Active Recovery",
    muscles: "Full Body Mobility",
    exercises: [
      { name: "Brisk Walk", muscle: "Cardio", sets: "1", reps: "20-30 min", rest: "-" },
      { name: "Hamstring Stretch", muscle: "Mobility", sets: "2", reps: "60s", rest: "30s" },
      { name: "Couch Stretch", muscle: "Mobility", sets: "2", reps: "60s", rest: "30s" },
      { name: "Breathing Drill", muscle: "Recovery", sets: "1", reps: "5 min", rest: "-" }
    ]
  }
];

const extractJSONArray = (text) => {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array found in Anthropic response");
  }

  return JSON.parse(text.slice(start, end + 1));
};

const cleanExercise = (exercise, index) => ({
  name: String(exercise?.name || `Exercise ${index + 1}`),
  muscle: String(exercise?.muscle || "General"),
  sets: String(exercise?.sets || "3"),
  reps: String(exercise?.reps || "8-12"),
  rest: String(exercise?.rest || "60s")
});

const normalizeWeekPlan = (plan) =>
  dayCodes.map((day, index) => {
    const incoming = Array.isArray(plan) ? plan[index] || {} : {};
    const fallback = defaultWeek[index];
    const exercisesSource = Array.isArray(incoming.exercises) && incoming.exercises.length > 0
      ? incoming.exercises
      : fallback.exercises;

    return {
      day,
      name: String(incoming.name || fallback.name),
      muscles: String(incoming.muscles || fallback.muscles),
      exercises: exercisesSource.slice(0, 8).map(cleanExercise)
    };
  });

const buildPrompt = ({ goal, location, level, height, weight }) => `
Create a 7-day workout plan for a user with:
- Goal: ${goal}
- Training location: ${location}
- Experience level: ${level}
- Height: ${height} cm
- Weight: ${weight} kg

Return ONLY valid JSON (no markdown, no extra text) as an array of exactly 7 objects in order Mon..Sun using this schema:
[
  {
    "day": "Mon",
    "name": "Push Day",
    "muscles": "Chest / Shoulders / Triceps",
    "exercises": [
      { "name": "Exercise Name", "muscle": "Chest", "sets": "4", "reps": "8-10", "rest": "90s" }
    ]
  }
]

Rules:
- Include 4-6 exercises per day.
- Keep exercises realistic for ${location}.
- Fit the plan to ${level} level.
- Sunday should be recovery-focused.
- Keep set/rep/rest values concise strings.
`;

const generateWorkoutPlan = async ({ goal, location, level, height, weight }) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return defaultWeek;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2200,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: buildPrompt({ goal, location, level, height, weight })
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const text = payload?.content?.find((item) => item.type === "text")?.text || "";
  const parsed = extractJSONArray(text);

  return normalizeWeekPlan(parsed);
};

export default generateWorkoutPlan;
