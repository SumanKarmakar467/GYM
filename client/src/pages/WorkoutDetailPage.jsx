import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
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

const ProgressRing = ({ completed, total }) => {
  const safeTotal = Math.max(total, 1);
  const percent = Math.round((completed / safeTotal) * 100);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="grid place-items-center rounded-2xl border border-borderSubtle bg-bgSecondary p-5">
      <div className="relative">
        <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
          <circle cx="66" cy="66" r={radius} stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
          <circle
            cx="66"
            cy="66"
            r={radius}
            stroke="#22c55e"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.35s ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <p className="font-heading text-xl font-bold">{completed}/{total} Done</p>
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-brandSecondary">{percent}% complete</p>
    </div>
  );
};

const WorkoutDetailPage = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedMap, setCompletedMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [restTimer, setRestTimer] = useState(null);

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
    if (!restTimer) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRestTimer((current) => {
        if (!current) {
          return null;
        }
        if (current.remaining <= 1) {
          return null;
        }
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [restTimer?.exerciseKey]);

  const toggleDone = (exercise, index) => {
    const key = `${activeDay?.weekNumber || 0}-${index}`;
    const done = !completedMap[key];
    setCompletedMap((prev) => ({ ...prev, [key]: done }));

    if (!done) {
      if (restTimer?.exerciseKey === key) {
        setRestTimer(null);
      }
      return;
    }

    const seconds = parseRestSeconds(exercise.rest);
    setRestTimer({ exerciseKey: key, remaining: seconds });
  };

  if (loading) {
    return (
      <div className="page-enter min-h-screen">
        <AppNavbar />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 md:px-6">
          <section className="card mt-2 p-5 md:p-6">
            <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-8 w-72 animate-pulse rounded bg-white/10" />
          </section>
          <section className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <article key={item} className="card animate-pulse p-5">
                <div className="h-7 w-52 rounded bg-white/10" />
                <div className="mt-3 h-4 w-40 rounded bg-white/10" />
                <div className="mt-4 h-24 rounded-xl bg-white/5" />
                <div className="mt-4 h-10 w-36 rounded bg-white/10" />
              </article>
            ))}
          </section>
        </main>
      </div>
    );
  }

  if (!plan || !activeDay) {
    return (
      <div className="page-enter min-h-screen">
        <AppNavbar />
        <main className="mx-auto mt-10 w-full max-w-3xl px-4 text-center md:px-6">
          <div className="card p-7">
            <p className="text-xl font-semibold">No plan yet. → Go to Onboarding</p>
            <Link to="/onboarding" className="btn-primary mt-5 inline-flex">
              Go to Onboarding
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen pb-24">
      <AppNavbar />
      <main className="mx-auto w-full max-w-5xl px-4 pb-6 md:px-6">
        <section className="card mt-2 p-5 md:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">
            Week {activeDay.weekNumber}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{activeDay.dayName} - {activeDay.focus}</h1>
          <div className="mt-5">
            <ProgressRing completed={completedExercises} total={totalExercises} />
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {exercises.map((exercise, index) => {
            const key = `${activeDay.weekNumber}-${index}`;
            const done = Boolean(completedMap[key]);
            const restLabel = exercise.rest ? `${exercise.rest} rest` : "60s rest";

            return (
              <article
                key={key}
                className={`card rounded-2xl border-l-4 p-5 ${done ? "border-l-emerald-500" : "border-l-transparent"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">{exercise.name}</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                      {exercise.sets || 3} × {exercise.reps || "10"} · {restLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={done ? "rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100" : "btn-primary text-sm"}
                    onClick={() => toggleDone(exercise, index)}
                  >
                    {done ? "Done ✓" : "Mark Done ✓"}
                  </button>
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
              </article>
            );
          })}
        </section>
      </main>

      {restTimer ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-borderSubtle bg-black/90 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 text-sm md:text-base">
            <p>
              Rest: {formatTimer(restTimer.remaining)} remaining —{" "}
              <button
                type="button"
                onClick={() => setRestTimer(null)}
                className="font-semibold text-brandSecondary hover:underline"
              >
                Skip
              </button>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WorkoutDetailPage;
