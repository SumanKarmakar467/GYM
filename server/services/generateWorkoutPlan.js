import Anthropic from "@anthropic-ai/sdk";

const dayTemplates = [
  ["Monday", "Push Strength"],
  ["Tuesday", "Pull Hypertrophy"],
  ["Wednesday", "Lower Body Power"],
  ["Thursday", "Active Recovery"],
  ["Friday", "Upper Volume"],
  ["Saturday", "Conditioning"],
  ["Sunday", "Rest & Mobility"]
];

const goalDescriptions = {
  bodybuilder: "Hypertrophy focus with progressive overload and high training volume.",
  calisthenics: "Bodyweight progressions, skill work, and relative strength development.",
  powerlifter: "Strength focus for squat, bench, and deadlift with low-rep compounds.",
  crossfit: "Mixed-modal conditioning with strength and high-intensity WOD patterns.",
  athlete: "Explosive power, sprint mechanics, agility, and endurance development."
};

const buildPrompt = (profile) => `You are an elite personal trainer and sports scientist. Create a detailed, periodized workout plan.

User Profile:
- Age: ${profile.age} years
- Weight: ${profile.weightKg} kg
- Height: ${profile.heightCm} cm
- Gender: ${profile.gender}
- Goal: ${profile.goal} (${goalDescriptions[profile.goal]})
- Environment: ${profile.environment}
- Duration: ${profile.durationWeeks} weeks

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just JSON.

JSON Schema:
{
  "planName": "string",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "string",
      "days": [
        {
          "dayName": "Monday",
          "focus": "Chest & Triceps",
          "isRestDay": false,
          "warmup": "5 min light cardio + dynamic stretching",
          "exercises": [
            {
              "name": "Barbell Bench Press",
              "sets": 4,
              "reps": "8-10",
              "rest": "90s",
              "notes": "Control the eccentric"
            }
          ],
          "cooldown": "5 min static stretching"
        }
      ]
    }
  ]
}

Use exactly 7 days for each week and ensure all weeks from 1 to ${profile.durationWeeks} are present.`;

const cleanExercise = (exercise, index) => ({
  name: String(exercise?.name || `Exercise ${index + 1}`),
  sets: Number(exercise?.sets) > 0 ? Number(exercise.sets) : 3,
  reps: String(exercise?.reps || "8-12"),
  rest: String(exercise?.rest || "60s"),
  notes: String(exercise?.notes || "")
});

const normalizeDay = (day, dayIndex) => {
  const [fallbackDayName, fallbackFocus] = dayTemplates[dayIndex] || ["Day", "General Training"];

  return {
    dayName: String(day?.dayName || fallbackDayName),
    focus: String(day?.focus || fallbackFocus),
    isRestDay: Boolean(day?.isRestDay),
    warmup: String(day?.warmup || "5 min light cardio + dynamic mobility"),
    exercises: Array.isArray(day?.exercises)
      ? day.exercises.slice(0, 10).map(cleanExercise)
      : [cleanExercise({}, 0), cleanExercise({}, 1), cleanExercise({}, 2)],
    cooldown: String(day?.cooldown || "5 min static stretching and breathing")
  };
};

const normalizePlan = (candidate, profile) => {
  const durationWeeks = Number(profile.durationWeeks);
  const weeks = Array.isArray(candidate?.weeks) ? candidate.weeks : [];

  const normalizedWeeks = Array.from({ length: durationWeeks }).map((_, idx) => {
    const weekNumber = idx + 1;
    const incomingWeek = weeks.find((week) => Number(week?.weekNumber) === weekNumber) || {};
    const incomingDays = Array.isArray(incomingWeek.days) ? incomingWeek.days : [];

    return {
      weekNumber,
      theme: String(incomingWeek.theme || `Week ${weekNumber} Foundation`),
      days: dayTemplates.map((_, dayIndex) => normalizeDay(incomingDays[dayIndex], dayIndex))
    };
  });

  return {
    planName: String(candidate?.planName || `${profile.goal.toUpperCase()} ${profile.durationWeeks}-Week Plan`),
    weeks: normalizedWeeks
  };
};

const buildFallbackPlan = (profile) => {
  const weeks = Array.from({ length: profile.durationWeeks }).map((_, weekIndex) => ({
    weekNumber: weekIndex + 1,
    theme: weekIndex < 2 ? "Foundation" : weekIndex < 6 ? "Progressive Overload" : "Performance Peak",
    days: dayTemplates.map(([dayName, focus], dayIndex) => ({
      dayName,
      focus,
      isRestDay: dayIndex === 6,
      warmup: "5 min light cardio + dynamic mobility",
      exercises:
        dayIndex === 6
          ? []
          : [
              { name: "Compound Main Lift", sets: 4, reps: "6-10", rest: "90s", notes: "RPE 7-8" },
              { name: "Accessory Lift A", sets: 3, reps: "8-12", rest: "75s", notes: "Controlled tempo" },
              { name: "Accessory Lift B", sets: 3, reps: "10-15", rest: "60s", notes: "Full range of motion" },
              { name: "Core / Finisher", sets: 3, reps: "30-45s", rest: "45s", notes: "Keep form strict" }
            ],
      cooldown: "5 min static stretching and breathwork"
    }))
  }));

  return {
    planName: `${profile.goal.toUpperCase()} Transformation Blueprint`,
    weeks
  };
};

const parseJsonPayload = (rawText) => {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in Claude response.");
  }

  return JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
};

const callClaude = async (client, prompt, maxTokens = 8000) => {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }]
  });

  const textBlock = response.content.find((item) => item.type === "text");
  return textBlock?.text || "";
};

const generateWorkoutPlan = async (profile) => {
  const fallbackPlan = buildFallbackPlan(profile);

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackPlan;
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildPrompt(profile);

    const firstTryText = await callClaude(anthropic, prompt);

    try {
      const parsed = parseJsonPayload(firstTryText);
      return normalizePlan(parsed, profile);
    } catch {
      const strictPrompt = `${prompt}\n\nYour previous response was invalid. Output strict JSON ONLY.`;
      const secondTryText = await callClaude(anthropic, strictPrompt, 9000);
      const parsedRetry = parseJsonPayload(secondTryText);
      return normalizePlan(parsedRetry, profile);
    }
  } catch {
    return fallbackPlan;
  }
};

export default generateWorkoutPlan;