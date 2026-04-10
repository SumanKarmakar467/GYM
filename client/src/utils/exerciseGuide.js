const guideLibrary = [
  {
    patterns: ["squat", "lunge", "leg press", "split squat", "step up"],
    category: "lower_body",
    label: "Lower Body Control",
    steps: [
      "Stand tall with your core braced and feet stable.",
      "Lower with control while keeping knees tracking with toes.",
      "Drive through mid-foot to return to the start position."
    ],
    cues: ["Keep your chest up.", "Do not let knees collapse inward.", "Control the lowering phase."]
  },
  {
    patterns: ["deadlift", "rdl", "romanian", "hinge", "good morning", "hip thrust"],
    category: "hinge",
    label: "Hip Hinge Form",
    steps: [
      "Start with a neutral spine and shoulders set down and back.",
      "Push hips backward first and keep the load close to your body.",
      "Squeeze glutes to stand tall without overextending your lower back."
    ],
    cues: ["Brace core before each rep.", "Keep spine neutral.", "Move slowly on the way down."]
  },
  {
    patterns: ["bench", "push up", "chest press", "dip", "fly"],
    category: "push",
    label: "Push Pattern Mechanics",
    steps: [
      "Set shoulders back and keep wrists stacked over elbows.",
      "Lower under control until a strong stretch position.",
      "Press smoothly while keeping shoulder blades stable."
    ],
    cues: ["Elbows at roughly 45-70 degrees.", "No bouncing at the bottom.", "Exhale through the press."]
  },
  {
    patterns: ["row", "pull up", "lat pulldown", "face pull", "rear delt", "pull-down"],
    category: "pull",
    label: "Pull Pattern Mechanics",
    steps: [
      "Start with shoulders down and chest tall.",
      "Lead the movement by pulling elbows toward your torso.",
      "Pause briefly at peak contraction, then lower with control."
    ],
    cues: ["Do not shrug shoulders.", "Avoid swinging your torso.", "Control both directions."]
  },
  {
    patterns: ["shoulder press", "overhead press", "lateral raise", "arnold press"],
    category: "shoulder",
    label: "Shoulder Stability",
    steps: [
      "Brace core and keep rib cage stacked over hips.",
      "Press or raise in a smooth arc without jerking.",
      "Lower slowly to keep tension and protect joints."
    ],
    cues: ["Keep neck relaxed.", "Avoid excessive back arch.", "Use controlled tempo."]
  },
  {
    patterns: ["curl", "triceps", "extension", "pushdown", "hammer"],
    category: "arms",
    label: "Arm Isolation",
    steps: [
      "Set elbows and keep upper arms steady.",
      "Move only through the elbow joint with full range.",
      "Pause and squeeze at peak contraction."
    ],
    cues: ["Limit body swing.", "Use moderate load.", "Prioritize muscle feel over momentum."]
  },
  {
    patterns: ["plank", "crunch", "sit up", "hollow", "leg raise", "russian twist"],
    category: "core",
    label: "Core Tension",
    steps: [
      "Brace abs as if preparing for a punch.",
      "Keep pelvis controlled and avoid lower-back collapse.",
      "Maintain breathing rhythm while holding tension."
    ],
    cues: ["Slow and controlled reps.", "No neck pulling.", "Maintain neutral spine."]
  },
  {
    patterns: ["run", "bike", "rower", "jump rope", "burpee", "cardio"],
    category: "cardio",
    label: "Conditioning Effort",
    steps: [
      "Begin at a manageable pace and build gradually.",
      "Maintain consistent breathing and relaxed shoulders.",
      "Finish strong while keeping technique clean."
    ],
    cues: ["Stay rhythmic.", "Do not sprint too early.", "Hydrate between rounds."]
  }
];

const defaultGuide = {
  category: "general",
  label: "General Exercise Technique",
  steps: [
    "Set up with stable posture and a braced core.",
    "Use a controlled range of motion for each repetition.",
    "Finish each set with clean form rather than rushing."
  ],
  cues: ["Keep breathing controlled.", "Use full control on the lowering phase.", "Stop if form breaks down."]
};

const pickGuide = (exerciseName) => {
  const normalized = String(exerciseName || "").toLowerCase();

  return (
    guideLibrary.find((item) => item.patterns.some((pattern) => normalized.includes(pattern))) || defaultGuide
  );
};

export const buildExerciseGuide = (exercise) => {
  const name = exercise.exerciseName || exercise.name || "Exercise";
  const guide = pickGuide(name);

  return {
    name,
    category: guide.category,
    label: guide.label,
    steps: guide.steps,
    cues: guide.cues
  };
};
