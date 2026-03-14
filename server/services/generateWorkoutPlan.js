const daySplit = [
  { day: "Monday", muscleGroups: ["Chest", "Triceps"] },
  { day: "Tuesday", muscleGroups: ["Back", "Biceps"] },
  { day: "Wednesday", muscleGroups: ["Shoulders", "Abs"] },
  { day: "Thursday", muscleGroups: ["Legs"] },
  { day: "Friday", muscleGroups: ["Full Body", "Cardio"] },
  { day: "Saturday", muscleGroups: ["Arms", "Core"] },
  { day: "Sunday", muscleGroups: ["Rest", "Stretching"] }
];

const templates = {
  gym: {
    Monday: ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Fly", "Rope Pushdown"],
    Tuesday: ["Barbell Row", "Lat Pulldown", "Seated Cable Row", "EZ-Bar Curl"],
    Wednesday: ["Overhead Press", "Dumbbell Lateral Raise", "Face Pull", "Cable Crunch"],
    Thursday: ["Back Squat", "Romanian Deadlift", "Leg Press", "Walking Lunges"],
    Friday: ["Kettlebell Swings", "Burpees", "Cable Woodchop", "Bike Sprints"],
    Saturday: ["Close-Grip Bench Press", "Hammer Curl", "Triceps Dips", "Hanging Leg Raise"],
    Sunday: ["Light Mobility Flow", "Hamstring Stretch Series", "Thoracic Rotation", "Deep Breathing"]
  },
  home: {
    Monday: ["Push-Ups", "Decline Push-Ups", "Chair Dips", "Band Triceps Extension"],
    Tuesday: ["Pull-Ups", "Band Rows", "Superman Hold", "Backpack Biceps Curl"],
    Wednesday: ["Pike Push-Ups", "Band Lateral Raise", "Plank Shoulder Tap", "V-Ups"],
    Thursday: ["Bodyweight Squat", "Bulgarian Split Squat", "Glute Bridge", "Jump Squats"],
    Friday: ["Mountain Climbers", "Jump Rope", "High Knees", "Bear Crawl"],
    Saturday: ["Diamond Push-Ups", "Band Curls", "Plank to Push-Up", "Dead Bug"],
    Sunday: ["Sun Salutation", "Hip Opener Flow", "Ankle Mobility Drill", "Box Breathing"]
  }
};

const goalConfig = {
  bodybuilder: { sets: 5, reps: "8-12", restSeconds: 90, focus: "muscle hypertrophy" },
  athlete: { sets: 4, reps: "4-8 explosive", restSeconds: 120, focus: "power and speed" },
  maintain_health: { sets: 3, reps: "10", restSeconds: 75, focus: "general fitness" },
  weight_loss: { sets: 4, reps: "40s on / 20s off", restSeconds: 30, focus: "circuit conditioning" },
  flexibility: { sets: 3, reps: "45-60s hold", restSeconds: 30, focus: "mobility and recovery" }
};

const buildInstructions = (name, goal) => {
  if (goal === "flexibility") {
    return [
      `Start ${name} with slow nasal breathing.`,
      "Move through the full pain-free range of motion.",
      "Hold end range with posture control before returning."
    ];
  }
  return [
    `Set up for ${name} with stable posture and neutral spine.`,
    "Perform each rep with controlled eccentric and strong concentric effort.",
    "Stop the set when form quality drops."
  ];
};

const buildTips = (goal) => {
  const common = ["Hydrate between sets.", "Keep a training log for progressive overload."];
  if (goal === "athlete") return [...common, "Prioritize bar speed over chasing fatigue."];
  if (goal === "weight_loss") return [...common, "Minimize rest and keep heart rate elevated."];
  if (goal === "bodybuilder") return [...common, "Use full ROM and controlled tempo for muscle tension."];
  if (goal === "flexibility") return [...common, "Never force painful stretches."];
  return [...common, "Train consistently 3-5 days each week."];
};

export const generateWorkoutPlan = (user) => {
  const location = user.workoutLocation === "home" ? "home" : "gym";
  const goal = goalConfig[user.goal] ? user.goal : "maintain_health";
  const config = goalConfig[goal];

  return {
    goal,
    workoutLocation: location,
    weeklySchedule: daySplit.map(({ day, muscleGroups }) => {
      const exercises = (templates[location][day] || []).map((name) => ({
        name,
        sets: config.sets,
        reps: config.reps,
        restSeconds: config.restSeconds,
        videoUrl: "",
        instructions: buildInstructions(name, goal),
        tips: buildTips(goal)
      }));

      if (day === "Sunday") {
        return {
          day,
          muscleGroups,
          exercises: exercises.map((exercise) => ({
            ...exercise,
            sets: 2,
            reps: goal === "flexibility" ? "60s hold" : "20-30 min light flow",
            restSeconds: 20
          }))
        };
      }

      return { day, muscleGroups, exercises };
    })
  };
};

export default generateWorkoutPlan;
