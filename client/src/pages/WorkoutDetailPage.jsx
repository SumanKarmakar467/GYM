import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import AppNavbar from "../components/layout/AppNavbar";
import SkeletonCard, { SkeletonGrid } from "../components/SkeletonCard";
import useAuth from "../hooks/useAuth";
import { addDays, toYmd } from "../utils/date";
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

const getWeekDays = (plan, weekIndex = 0) => {
  const week = plan?.weeks?.[weekIndex];
  if (!week) return [];

  return (week.days || []).map((day, dayIndex) => ({
    weekNumber: week.weekNumber,
    weekIndex,
    dayNumber: dayIndex + 1,
    dayIndex,
    dayName: day.dayName,
    focus: day.focus,
    isRestDay: Boolean(day.isRestDay),
    warmup: day.warmup,
    exercises: Array.isArray(day.exercises) ? day.exercises : [],
    cooldown: day.cooldown
  }));
};

const getDemoType = (exerciseName = "") => {
  const value = exerciseName.toLowerCase();
  if (value.includes("deadlift") || value.includes("rdl") || value.includes("romanian") || value.includes("hinge") || value.includes("hip thrust")) return "hinge";
  if (value.includes("squat") || value.includes("lunge") || value.includes("leg press") || value.includes("step up") || value.includes("split squat")) return "lower";
  if (value.includes("shoulder") || value.includes("overhead") || value.includes("lateral raise") || value.includes("arnold")) return "shoulder";
  if (value.includes("curl") || value.includes("triceps") || value.includes("extension") || value.includes("pushdown") || value.includes("hammer")) return "arms";
  if (value.includes("plank") || value.includes("crunch") || value.includes("sit up") || value.includes("hollow") || value.includes("leg raise") || value.includes("russian twist")) return "core";
  if (value.includes("press") || value.includes("push")) return "push";
  if (value.includes("row") || value.includes("pull") || value.includes("lat")) return "pull";
  if (value.includes("run") || value.includes("jump") || value.includes("burpee")) return "cardio";
  return "general";
};

const exerciseIcons = {
  lower: "L",
  hinge: "H",
  push: "P",
  pull: "B",
  shoulder: "S",
  arms: "A",
  core: "O",
  cardio: "C",
  general: "G"
};

const muscleProfiles = {
  lower: [["Quads", 92], ["Glutes", 84], ["Hamstrings", 70], ["Core", 45]],
  hinge: [["Hamstrings", 90], ["Glutes", 86], ["Lower Back", 68], ["Core", 62]],
  push: [["Chest", 90], ["Shoulders", 74], ["Triceps", 82], ["Core", 38]],
  pull: [["Lats", 88], ["Upper Back", 82], ["Biceps", 68], ["Rear Delts", 58]],
  shoulder: [["Shoulders", 92], ["Triceps", 64], ["Upper Chest", 46], ["Core", 58]],
  arms: [["Biceps", 86], ["Triceps", 82], ["Forearms", 62], ["Shoulders", 36]],
  core: [["Core", 96], ["Obliques", 78], ["Hip Flexors", 54], ["Shoulders", 42]],
  cardio: [["Heart Rate", 95], ["Leg Drive", 76], ["Core", 62], ["Calves", 55]],
  general: [["Full Body", 84], ["Core", 72], ["Glutes", 58], ["Shoulders", 45]]
};

const getExerciseName = (exercise) => exercise?.exerciseName || exercise?.name || "Exercise";

const getExerciseNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : fallback;
};

const formatRestShort = (restValue) => {
  const seconds = parseRestSeconds(restValue);
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
};

const getDifficulty = (exercise, type) => {
  const reps = getExerciseNumber(exercise?.reps, 10);
  const sets = getExerciseNumber(exercise?.sets, 3);
  const base = type === "cardio" ? 4 : 3;
  return Math.max(2, Math.min(5, base + (sets >= 4 ? 1 : 0) + (reps >= 15 ? 1 : 0)));
};

const getYoutubeDemoUrl = (exerciseName = "") => {
  const query = encodeURIComponent(`${exerciseName} proper form exercise tutorial`);
  return `https://www.youtube.com/results?search_query=${query}`;
};

const getExerciseKey = (day, exerciseIndex) => `${day?.weekNumber || 0}-${day?.dayNumber || 0}-${exerciseIndex}`;

const getWorkoutDateForDay = (plan, day) => {
  if (!plan?.generatedAt || !day) return toYmd(new Date());
  const startDate = new Date(plan.generatedAt);
  startDate.setHours(0, 0, 0, 0);
  return toYmd(addDays(startDate, day.weekIndex * 7 + day.dayIndex));
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
  const [timerBarWidth, setTimerBarWidth] = useState(100);
  const [workoutTodos, setWorkoutTodos] = useState([]);
  const [syncingKey, setSyncingKey] = useState("");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const didCelebrateRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadPlan = async () => {
      setLoading(true);
      try {
        if (isDemoAthlete(user)) {
          if (active) setPlan(demoWorkoutPlan);
          return;
        }

        const { data } = await api.get("/workout/me");
        if (active) setPlan(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPlan();
    return () => {
      active = false;
    };
  }, [user]);

  const weekDays = useMemo(() => getWeekDays(plan, selectedWeekIndex), [plan, selectedWeekIndex]);
  const activeDay = weekDays[selectedDayIndex] || weekDays[0] || null;
  const exercises = activeDay?.exercises || [];
  const workoutDate = useMemo(() => {
    return getWorkoutDateForDay(plan, activeDay);
  }, [activeDay, plan]);
  const selectedExercise = exercises[selectedIndex] || exercises[0] || null;
  const selectedKey = selectedExercise ? getExerciseKey(activeDay, selectedIndex) : "";
  const selectedType = getDemoType(getExerciseName(selectedExercise));
  const selectedGuide = selectedExercise ? buildExerciseGuide(selectedExercise) : null;
  const musclesWorked = muscleProfiles[selectedType] || muscleProfiles.general;
  const selectedSets = getExerciseNumber(selectedExercise?.sets, 3);
  const selectedReps = getExerciseNumber(selectedExercise?.reps, 10);
  const selectedRest = formatRestShort(selectedExercise?.rest || 60);
  const selectedCalories = Math.max(25, selectedSets * selectedReps * (selectedType === "cardio" ? 3 : 2));
  const selectedDifficulty = getDifficulty(selectedExercise || {}, selectedType);
  const totalExercises = exercises.length;
  const completedExercises = exercises.reduce((count, _exercise, index) => {
    const key = getExerciseKey(activeDay, index);
    return completedMap[key] ? count + 1 : count;
  }, 0);

  const todoByExerciseKey = useMemo(() => {
    const map = new Map();
    workoutTodos.forEach((todo) => {
      const exerciseIndex = Number(todo.exerciseIndex);
      if (todo.weekNum !== activeDay?.weekNumber || todo.dayNum !== activeDay?.dayNumber || !Number.isFinite(exerciseIndex)) return;
      map.set(getExerciseKey(activeDay, exerciseIndex), todo);
    });
    return map;
  }, [activeDay, workoutTodos]);

  useEffect(() => {
    setSelectedWeekIndex(0);
    setSelectedDayIndex(0);
  }, [plan?._id, plan?.generatedAt]);

  useEffect(() => {
    setSelectedIndex(0);
    setRestTimer(null);
  }, [activeDay?.weekNumber, activeDay?.dayIndex, activeDay?.dayName]);

  useEffect(() => {
    let active = true;

    const loadWorkoutTodos = async () => {
      if (!activeDay || isDemoAthlete(user)) {
        setWorkoutTodos([]);
        setCompletedMap({});
        return;
      }

      try {
        const { data } = await api.get("/todos", { params: { date: workoutDate } });
        if (!active) return;

        const items = Array.isArray(data) ? data : [];
        setWorkoutTodos(items);
        setCompletedMap(() => {
          const next = {};
          items.forEach((todo) => {
            if (todo.weekNum === activeDay.weekNumber && todo.dayNum === activeDay.dayNumber && Number.isFinite(Number(todo.exerciseIndex))) {
              next[getExerciseKey(activeDay, Number(todo.exerciseIndex))] = Boolean(todo.completed);
            }
          });
          return next;
        });
      } catch {
        toast.error("Could not sync workout todos.");
      }
    };

    loadWorkoutTodos();
    return () => {
      active = false;
    };
  }, [activeDay, user, workoutDate]);

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

    if (!isComplete) didCelebrateRef.current = false;
  }, [completedExercises, totalExercises]);

  useEffect(() => {
    if (!restTimer) return undefined;

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
    const timer = window.setTimeout(() => setTimerBarWidth(0), 30);
    return () => window.clearTimeout(timer);
  }, [restTimer?.exerciseKey]);

  const toggleDone = async (exercise, index) => {
    const key = getExerciseKey(activeDay, index);
    const done = !completedMap[key];
    const linkedTodo = todoByExerciseKey.get(key);

    setCompletedMap((prev) => ({ ...prev, [key]: done }));
    setWorkoutTodos((prev) => prev.map((todo) => (todo._id === linkedTodo?._id ? { ...todo, completed: done } : todo)));

    if (done) {
      const seconds = parseRestSeconds(exercise.rest);
      setRestTimer({ exerciseKey: key, remaining: seconds, duration: seconds });
    } else if (restTimer?.exerciseKey === key) {
      setRestTimer(null);
    }

    if (!linkedTodo || isDemoAthlete(user)) return;

    setSyncingKey(key);
    try {
      const { data } = await api.patch(`/todos/${linkedTodo._id}`, { completed: done });
      setWorkoutTodos((prev) => prev.map((todo) => (todo._id === linkedTodo._id ? data : todo)));
      toast.success(done ? "Workout reflected in todo." : "Workout reopened in todo.");
    } catch {
      setCompletedMap((prev) => ({ ...prev, [key]: !done }));
      setWorkoutTodos((prev) => prev.map((todo) => (todo._id === linkedTodo._id ? linkedTodo : todo)));
      toast.error("Could not update todo.");
    } finally {
      setSyncingKey("");
    }
  };

  const selectExercise = (index) => {
    setSelectedIndex(index);
  };

  const selectDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setSelectedIndex(0);
    setRestTimer(null);
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.round((completedExercises / Math.max(totalExercises, 1)) * 100);
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
          <section className="mt-4"><SkeletonGrid /></section>
          <section className="mt-4 space-y-3"><SkeletonCard lines={4} /></section>
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
      <main className="workout-player-shell">
        <section className="workout-player-topbar">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Week {activeDay.weekNumber}</p>
            <h1>{activeDay.dayName} - {activeDay.focus}</h1>
            <p className="mt-1 text-sm text-textSecondary">Todo graph date: {workoutDate}</p>
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

        <section className="workout-week-strip" aria-label="Select workout day">
          {weekDays.slice(0, 7).map((day) => {
            const selected = day.dayIndex === selectedDayIndex;
            const dayDate = getWorkoutDateForDay(plan, day);
            const exerciseCount = day.exercises.length;

            return (
              <button
                key={`${day.weekNumber}-${day.dayNumber}`}
                type="button"
                className={`workout-day-pill ${selected ? "is-active" : ""} ${day.isRestDay || exerciseCount === 0 ? "is-rest" : ""}`}
                onClick={() => selectDay(day.dayIndex)}
                aria-pressed={selected}
              >
                <span>Day {day.dayNumber}</span>
                <strong>{day.dayName}</strong>
                <small>{day.focus}</small>
                <em>{day.isRestDay || exerciseCount === 0 ? "Recovery" : `${exerciseCount} workouts`} - {dayDate}</em>
              </button>
            );
          })}
        </section>

        <div className="workout-demo-layout">
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

            <p className="workout-panel-label mt-6">Todo Graph</p>
            <div className="mt-3 rounded-lg border border-white/[0.08] bg-black/20 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold text-fire">{completedExercises}/{totalExercises}</p>
                  <p className="text-xs text-textSecondary">completed on {workoutDate}</p>
                </div>
                <Link to="/todos" className="border border-fire/50 px-3 py-2 text-xs font-bold uppercase tracking-[2px] text-fire hover:bg-fire/10">
                  View Graph
                </Link>
              </div>
              <div className="mt-4 h-3 overflow-hidden bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-fire to-gold"
                  initial={prefersReducedMotion ? false : { width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
                />
              </div>
            </div>

            <p className="workout-panel-label mt-6">Difficulty</p>
            <div className="workout-stars" aria-label={`${selectedDifficulty} out of 5 difficulty`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className={index < selectedDifficulty ? "is-active" : ""}>*</span>
              ))}
            </div>

            <p className="workout-panel-label mt-6">Form Tips</p>
            <ul className="workout-tip-list">
              {(selectedGuide?.cues || []).map((cue) => <li key={cue}>{cue}</li>)}
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

          <section className="workout-demo-sidebar workout-list-section">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="workout-panel-label">Workout List</p>
                <h2 className="text-2xl font-bold">Complete today exercise by exercise</h2>
              </div>
              <p className="text-sm text-textSecondary">{completedExercises}/{totalExercises} done</p>
            </div>

            <div
              key={`${activeDay.weekNumber}-${activeDay.dayNumber}`}
              className="workout-demo-list"
            >
              {exercises.map((exercise, index) => {
                const name = getExerciseName(exercise);
                const type = getDemoType(name);
                const key = getExerciseKey(activeDay, index);
                const done = Boolean(completedMap[key]);
                const selected = index === selectedIndex;

                return (
                  <article
                    key={key}
                    className={`workout-demo-item ${selected ? "is-selected" : ""} ${done ? "is-done" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDone(exercise, index)}
                      disabled={syncingKey === key}
                      className="workout-circle-check"
                      aria-label={`${done ? "Mark incomplete" : "Mark complete"} ${name}`}
                      aria-pressed={done}
                    >
                      {done ? "OK" : ""}
                    </button>

                    <button type="button" className="workout-list-main" onClick={() => selectExercise(index)}>
                      <span className="workout-demo-icon">{exerciseIcons[type] || "G"}</span>
                      <span className="min-w-0">
                        <strong>{name}</strong>
                        <small>{exercise.sets || 3} sets - {exercise.reps || "10"} reps - {formatRestShort(exercise.rest || 60)} rest</small>
                      </span>
                    </button>

                    <a
                      className="workout-youtube-btn"
                      href={getYoutubeDemoUrl(name)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open YouTube proper form videos for ${name}`}
                    >
                      YouTube
                    </a>
                  </article>
                );
              })}
            </div>

            {exercises.length === 0 ? (
              <div className="workout-rest-state">
                <span>Recovery Day</span>
                <strong>{activeDay.cooldown || "Mobility, walking, stretching, and breathing work."}</strong>
              </div>
            ) : null}

            <div className="workout-week-note">
              <p className="workout-panel-label">Focus Note</p>
              <p className="workout-day-focus-note">
                {activeDay.focus || (activeDay.isRestDay ? "Recovery day" : "Training day")}
              </p>
            </div>
          </section>

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
