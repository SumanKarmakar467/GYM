import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import { SkeletonCard } from "../components/Skeleton";
import AppNavbar from "../components/layout/AppNavbar";

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

const DemoAnimation = ({ type }) => {
  return (
    <div className="demo-stage">
      <div className="demo-floor" />
      <div className={`demo-person demo-${type}`} />
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
  const prefersReducedMotion = useReducedMotion();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedMap, setCompletedMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [restTimer, setRestTimer] = useState(null);
  const [demoExercise, setDemoExercise] = useState(null);
  const [pulseKey, setPulseKey] = useState("");
  const [timerBarWidth, setTimerBarWidth] = useState(100);
  const didCelebrateRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadPlan = async () => {
      setLoading(true);
      try {
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
  }, []);

  const activeDay = useMemo(() => pickActiveWorkoutDay(plan), [plan]);
  const exercises = activeDay?.exercises || [];
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
          <section className="mt-4 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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
      <main className="mx-auto w-full max-w-5xl px-4 pb-6 md:px-6">
        <section className="card mt-2 p-5 md:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Week {activeDay.weekNumber}</p>
          <h1 className="mt-2 text-3xl font-bold">{activeDay.dayName} - {activeDay.focus}</h1>
          <div className="mt-5 grid place-items-center rounded-2xl border border-borderSubtle bg-bgSecondary p-5">
            <div className="relative">
              <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                <circle cx="66" cy="66" r={radius} stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
                <circle
                  className="ring-progress"
                  cx="66"
                  cy="66"
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <p className="font-heading text-xl font-bold">{completedExercises}/{totalExercises} Done</p>
              </div>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-brandSecondary">{percent}% complete</p>
          </div>
        </section>

        <motion.section
          variants={listVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? false : "show"}
          className="mt-4 space-y-3"
        >
          {exercises.map((exercise, index) => {
            const key = `${activeDay.weekNumber}-${index}`;
            const done = Boolean(completedMap[key]);
            const restLabel = exercise.rest ? `${exercise.rest} rest` : "60s rest";

            return (
              <motion.article
                key={key}
                variants={cardVariants}
                animate={{ scale: pulseKey === key ? 1.02 : 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className={`card rounded-2xl border-l-4 p-5 transition-[border-color] duration-300 ${done ? "border-l-emerald-500" : "border-l-transparent"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">{exercise.name}</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                      {exercise.sets || 3} x {exercise.reps || "10"} - {restLabel}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDemoExercise(exercise)}
                      className="rounded-lg border border-brandPrimary/40 bg-brandPrimary/10 px-3 py-2 text-xs font-semibold text-brandPrimary hover:bg-brandPrimary/20 focus-visible:bg-brandPrimary/20"
                    >
                      View Demo
                    </button>

                    <motion.button
                      whileTap={prefersReducedMotion ? undefined : { scale: 1.02 }}
                      type="button"
                      onClick={() => toggleDone(exercise, index)}
                      aria-label={`Mark ${exercise.name} as done`}
                      aria-pressed={done}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded border border-emerald-300/70 bg-black/20">
                        <motion.span
                          initial={false}
                          animate={done ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -45, opacity: 0 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                          className="text-xs"
                        >
                          ?
                        </motion.span>
                      </span>
                      <span>{done ? "Done" : "Mark Done"}</span>
                    </motion.button>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor={`note-${key}`} className="text-sm text-textSecondary">Notes</label>
                  <textarea
                    id={`note-${key}`}
                    rows={3}
                    className="input-field mt-2 resize-y"
                    placeholder="Add your form notes or weight used..."
                    value={notesMap[key] || ""}
                    onChange={(event) => setNotesMap((prev) => ({ ...prev, [key]: event.target.value }))}
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.section>
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

      <AnimatePresence>
        {demoExercise ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? false : { opacity: 1 }}
            exit={prefersReducedMotion ? false : { opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={prefersReducedMotion ? false : { scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl border border-borderSubtle bg-[#0c1723] p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold">{demoExercise.name} Demo</h3>
                  <p className="mt-1 text-sm text-textSecondary">Animated local guide. No external website embed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoExercise(null)}
                  className="rounded-lg border border-zinc-600 px-3 py-1 text-sm text-zinc-200"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-borderSubtle bg-[#09121d] p-4">
                <DemoAnimation type={getDemoType(demoExercise.name)} />
                <p className="mt-4 text-sm text-textSecondary">
                  Keep your core tight, use controlled tempo, and maintain full range of motion.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutDetailPage;
