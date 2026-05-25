import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import SkeletonCard, { SkeletonGrid } from "../components/SkeletonCard";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";
import { demoWorkoutPlan, isDemoAthlete } from "../utils/demoUserData";
import { buildExerciseGuide } from "../utils/exerciseGuide";

const parseRestSeconds = (restValue) => {
  if (typeof restValue === "number" && Number.isFinite(restValue)) {
    return Math.max(1, Math.round(restValue));
  }

  if (typeof restValue === "string") {
    const match = restValue.toLowerCase().match(/(\d+)\s*(m|min|mins|minute|minutes|s|sec|secs|second|seconds)?/);
    if (match) {
      const amount = Number(match[1]);
      const unit = match[2] || "s";
      if (!Number.isFinite(amount)) {
        return 60;
      }
      return unit.startsWith("m") ? amount * 60 : amount;
    }
  }

  return 60;
};

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const pickActiveWorkoutDay = (plan) => {
  if (!plan?.weeks?.length) {
    return null;
  }

  for (const week of plan.weeks) {
    for (const day of week.days || []) {
      if (Array.isArray(day.exercises) && day.exercises.length > 0) {
        return {
          weekNumber: week.weekNumber,
          dayName: day.dayName,
          focus: day.focus,
          exercises: day.exercises
        };
      }
    }
  }

  return null;
};

const getDemoType = (exerciseName = "") => {
  const value = exerciseName.toLowerCase();

  if (value.includes("squat") || value.includes("lunge")) return "lower";
  if (value.includes("press") || value.includes("push")) return "push";
  if (value.includes("row") || value.includes("pull") || value.includes("lat")) return "pull";
  if (value.includes("run") || value.includes("jump") || value.includes("burpee")) return "cardio";
  return "general";
};

const demoLabels = {
  lower: "Lower body tempo",
  push: "Push strength path",
  pull: "Back and biceps path",
  cardio: "Conditioning rhythm",
  general: "Full body control"
};

const exerciseIcons = {
  lower: "L",
  push: "P",
  pull: "B",
  cardio: "C",
  general: "G"
};

const muscleProfiles = {
  lower: [
    ["Quads", 92],
    ["Glutes", 84],
    ["Hamstrings", 70],
    ["Core", 45]
  ],
  push: [
    ["Chest", 90],
    ["Shoulders", 74],
    ["Triceps", 82],
    ["Core", 38]
  ],
  pull: [
    ["Lats", 88],
    ["Upper Back", 82],
    ["Biceps", 68],
    ["Rear Delts", 58]
  ],
  cardio: [
    ["Heart Rate", 95],
    ["Leg Drive", 76],
    ["Core", 62],
    ["Calves", 55]
  ],
  general: [
    ["Full Body", 84],
    ["Core", 72],
    ["Glutes", 58],
    ["Shoulders", 45]
  ]
};

const getExerciseName = (exercise) => exercise?.exerciseName || exercise?.name || "Exercise";

const getExerciseNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : fallback;
};

const formatRestShort = (restValue) => {
  const seconds = parseRestSeconds(restValue);

  if (seconds >= 60 && seconds % 60 === 0) {
    return `${seconds / 60}m`;
  }

  return `${seconds}s`;
};

const getDifficulty = (exercise, type) => {
  const reps = getExerciseNumber(exercise?.reps, 10);
  const sets = getExerciseNumber(exercise?.sets, 3);
  const base = type === "cardio" ? 4 : type === "general" ? 3 : 3;
  return Math.max(2, Math.min(5, base + (sets >= 4 ? 1 : 0) + (reps >= 15 ? 1 : 0)));
};

const DemoAnimation = ({ type }) => {
  return (
    <div className={`demo-stage demo-stage-3d demo-stage-${type}`}>
      <div className="demo-floor" />
      <div className="demo-grid" />
      <div className="demo-rep-meter">
        <span />
      </div>
      <div className={`demo-athlete demo-athlete-${type}`}>
        <span className="demo-head" />
        <span className="demo-torso" />
        <span className="demo-arm demo-arm-left" />
        <span className="demo-arm demo-arm-right" />
        <span className="demo-leg demo-leg-left" />
        <span className="demo-leg demo-leg-right" />
        <span className="demo-muscle demo-muscle-chest" />
        <span className="demo-muscle demo-muscle-core" />
        <span className="demo-dumbbell demo-dumbbell-left" />
        <span className="demo-dumbbell demo-dumbbell-right" />
      </div>
      <div className="demo-exercise-ghost demo-ghost-one" />
      <div className="demo-exercise-ghost demo-ghost-two" />
      <p className="demo-stage-label">{demoLabels[type] || demoLabels.general}</p>
    </div>
  );
};

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const WorkoutDetailPage = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedMap, setCompletedMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [restTimer, setRestTimer] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [pulseKey, setPulseKey] = useState("");
  const [timerBarWidth, setTimerBarWidth] = useState(100);
  const didCelebrateRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadPlan = async () => {
      setLoading(true);
      try {
        if (isDemoAthlete(user)) {
          if (active) {
            setPlan(demoWorkoutPlan);
          }
          return;
        }

        const { data } = await api.get("/workout/me");
        if (active) {
          setPlan(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPlan();

    return () => {
      active = false;
    };
  }, [user]);

  const activeDay = useMemo(() => pickActiveWorkoutDay(plan), [plan]);
  const exercises = activeDay?.exercises || [];
  const selectedExercise = exercises[selectedIndex] || exercises[0] || null;
  const selectedKey = selectedExercise ? `${activeDay?.weekNumber || 0}-${selectedIndex}` : "";
  const selectedName = getExerciseName(selectedExercise);
  const selectedType = getDemoType(selectedName);
  const selectedGuide = selectedExercise ? buildExerciseGuide(selectedExercise) : null;
  const musclesWorked = muscleProfiles[selectedType] || muscleProfiles.general;
  const selectedSets = getExerciseNumber(selectedExercise?.sets, 3);
  const selectedReps = getExerciseNumber(selectedExercise?.reps, 10);
  const selectedRest = formatRestShort(selectedExercise?.rest || 60);
  const selectedCalories = Math.max(25, selectedSets * selectedReps * (selectedType === "cardio" ? 3 : 2));
  const selectedDifficulty = getDifficulty(selectedExercise || {}, selectedType);
  const totalExercises = exercises.length;
  const completedExercises = exercises.reduce((count, _exercise, index) => {
    const key = `${activeDay?.weekNumber || 0}-${index}`;
    return completedMap[key] ? count + 1 : count;
  }, 0);

  useEffect(() => {
    const isComplete = totalExercises > 0 && completedExercises === totalExercises;

    if (isComplete && !didCelebrateRef.current) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f97316", "#ffffff", "#fbbf24"]
      });
      didCelebrateRef.current = true;
    }

    if (!isComplete) {
      didCelebrateRef.current = false;
    }
  }, [completedExercises, totalExercises]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeDay?.weekNumber, activeDay?.dayName]);

  useEffect(() => {
    if (!restTimer) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRestTimer((current) => {
        if (!current) return null;
        if (current.remaining <= 1) return null;
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [restTimer?.exerciseKey]);

  useEffect(() => {
    if (!restTimer) {
      setTimerBarWidth(100);
      return;
    }

    setTimerBarWidth(100);
    const timer = window.setTimeout(() => {
      setTimerBarWidth(0);
    }, 30);

    return () => window.clearTimeout(timer);
  }, [restTimer?.exerciseKey]);

  const toggleDone = (exercise, index) => {
    const key = `${activeDay?.weekNumber || 0}-${index}`;
    const done = !completedMap[key];

    setCompletedMap((prev) => ({ ...prev, [key]: done }));

    if (done) {
      setPulseKey(key);
      window.setTimeout(() => setPulseKey(""), 220);
      const seconds = parseRestSeconds(exercise.rest);
      setRestTimer({ exerciseKey: key, remaining: seconds, duration: seconds });
      return;
    }

    if (restTimer?.exerciseKey === key) {
      setRestTimer(null);
    }
  };

  const selectPreviousExercise = () => {
    setSelectedIndex((current) => Math.max(0, current - 1));
  };

  const selectNextExercise = () => {
    setSelectedIndex((current) => Math.min(totalExercises - 1, current + 1));
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = Math.max(totalExercises, 1);
  const percent = Math.round((completedExercises / safeTotal) * 100);
  const ringOffset = circumference * (1 - percent / 100);

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 md:px-6">
          <section className="card mt-2 p-5 md:p-6">
            <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-8 w-72 animate-pulse rounded bg-white/10" />
          </section>
          <section className="mt-4">
            <SkeletonGrid />
          </section>
          <section className="mt-4 space-y-3">
            <SkeletonCard lines={4} />
          </section>
        </main>
      </div>
    );
  }

  if (!plan || !activeDay) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="mx-auto mt-10 w-full max-w-3xl px-4 text-center md:px-6">
          <EmptyState
            icon="???"
            title="No plan yet. -> Go to Onboarding"
            subtitle="Complete onboarding to generate your personalized plan."
            ctaLabel="Go to Onboarding"
            ctaLink="/onboarding"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <AppNavbar />
      <main className={`workout-player-shell ${isPlayerExpanded ? "is-expanded" : ""}`}>
        <section className="workout-player-topbar">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Week {activeDay.weekNumber}</p>
            <h1>{activeDay.dayName} - {activeDay.focus}</h1>
          </div>
          <div className="workout-progress-ring">
            <svg width="68" height="68" viewBox="0 0 132 132" className="-rotate-90">
              <circle cx="66" cy="66" r={radius} stroke="var(--border-subtle)" strokeWidth="12" fill="none" />
              <circle
                className="ring-progress"
                cx="66"
                cy="66"
                r={radius}
                stroke="#ff6b00"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span>{percent}%</span>
          </div>
        </section>

        <div className="workout-demo-layout">
          <aside className="workout-demo-sidebar">
            <p className="workout-panel-label">Workout Plan</p>
            <motion.div
              variants={listVariants}
              initial={prefersReducedMotion ? false : "hidden"}
              animate={prefersReducedMotion ? false : "show"}
              className="workout-demo-list"
            >
              {exercises.map((exercise, index) => {
                const name = getExerciseName(exercise);
                const type = getDemoType(name);
                const key = `${activeDay.weekNumber}-${index}`;
                const done = Boolean(completedMap[key]);
                const selected = index === selectedIndex;

                return (
                  <motion.button
                    key={key}
                    variants={cardVariants}
                    animate={{ scale: pulseKey === key ? 1.02 : 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`workout-demo-item ${selected ? "is-selected" : ""} ${done ? "is-done" : ""}`}
                  >
                    <span className="workout-demo-icon">{exerciseIcons[type] || "G"}</span>
                    <span className="min-w-0">
                      <strong>{name}</strong>
                      <small>{exercise.sets || 3} sets · {exercise.reps || "10"} reps</small>
                    </span>
                    {done ? <span className="workout-demo-dot is-complete" /> : selected ? <span className="workout-demo-dot" /> : null}
                  </motion.button>
                );
              })}
            </motion.div>
          </aside>

          <section className="workout-demo-player" aria-label={`${selectedName} workout demo`}>
            <div className="workout-now-playing">
              <span />
              Now Playing - {selectedName}
            </div>

            <div className="workout-video-phone">
              <DemoAnimation type={selectedType} />
              <div className="workout-video-gradient">
                <h2>{selectedName}</h2>
                <div className="workout-video-tags">
                  <span>{selectedGuide?.label || "Technique"}</span>
                  <span>{selectedSets} sets</span>
                  <span>{selectedReps} reps</span>
                </div>
              </div>
            </div>

            <div className="workout-player-controls">
              <button type="button" onClick={selectPreviousExercise} disabled={selectedIndex === 0}>
                Prev
              </button>
              <button
                type="button"
                className="is-primary"
                onClick={() => selectedExercise && toggleDone(selectedExercise, selectedIndex)}
                aria-pressed={Boolean(completedMap[selectedKey])}
              >
                {completedMap[selectedKey] ? "Completed" : "Mark Done"}
              </button>
              <button type="button" onClick={() => setIsMuted((current) => !current)}>
                {isMuted ? "Muted" : "Sound"}
              </button>
              <button type="button" onClick={selectNextExercise} disabled={selectedIndex >= totalExercises - 1}>
                Next
              </button>
              <button type="button" onClick={() => setIsPlayerExpanded((current) => !current)}>
                {isPlayerExpanded ? "Exit" : "Fullscreen"}
              </button>
            </div>
          </section>

          <aside className="workout-demo-inspector">
            <p className="workout-panel-label">Muscles Worked</p>
            <div className="workout-muscle-list">
              {musclesWorked.map(([muscle, value]) => (
                <div key={muscle} className="workout-muscle-row">
                  <span>{muscle}</span>
                  <div><span style={{ width: `${value}%` }} /></div>
                  <small>{value}%</small>
                </div>
              ))}
            </div>

            <p className="workout-panel-label mt-6">Workout Stats</p>
            <div className="workout-stat-grid">
              <div><strong>{selectedSets}</strong><span>Sets</span></div>
              <div><strong>{selectedReps}</strong><span>Reps</span></div>
              <div><strong>{selectedRest}</strong><span>Rest</span></div>
              <div><strong>{selectedCalories}</strong><span>Calories</span></div>
            </div>

            <p className="workout-panel-label mt-6">Difficulty</p>
            <div className="workout-stars" aria-label={`${selectedDifficulty} out of 5 difficulty`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className={index < selectedDifficulty ? "is-active" : ""}>★</span>
              ))}
            </div>

            <p className="workout-panel-label mt-6">Form Tips</p>
            <ul className="workout-tip-list">
              {(selectedGuide?.cues || []).map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>

            <label htmlFor={`note-${selectedKey}`} className="workout-panel-label mt-6 block">Training Notes</label>
            <textarea
              id={`note-${selectedKey}`}
              rows={4}
              className="input-field mt-3 resize-y"
              placeholder="Add weight, form notes, or pain-free range..."
              value={notesMap[selectedKey] || ""}
              onChange={(event) => setNotesMap((prev) => ({ ...prev, [selectedKey]: event.target.value }))}
            />
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {restTimer ? (
          <motion.div
            initial={prefersReducedMotion ? false : { y: 80 }}
            animate={prefersReducedMotion ? false : { y: 0 }}
            exit={prefersReducedMotion ? false : { y: 80 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-borderSubtle bg-black/90 px-4 py-3 backdrop-blur-sm"
          >
            <div className="mx-auto w-full max-w-5xl">
              <div className="mb-2 h-1 w-full overflow-hidden rounded bg-white/10">
                <div
                  className="h-full rounded bg-orange-500"
                  style={{
                    width: `${timerBarWidth}%`,
                    transition: prefersReducedMotion ? "none" : `width ${restTimer.duration}s linear`
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm md:text-base">
                <p>
                  Rest: {formatTimer(restTimer.remaining)} remaining -{" "}
                  <button
                    type="button"
                    onClick={() => setRestTimer(null)}
                    className="font-semibold text-brandSecondary hover:underline focus-visible:underline"
                  >
                    Skip
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
};

export default WorkoutDetailPage;
