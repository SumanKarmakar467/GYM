import { useEffect, useState } from "react";

const statTargets = [
  { label: "Workouts Generated", value: 18420, suffix: "+" },
  { label: "API Endpoints", value: 13, suffix: "" },
  { label: "Pages", value: 6, suffix: "" },
  { label: "JavaScript", value: 100, suffix: "%" }
];

const features = [
  {
    title: "AI Workout Plans",
    text: "Generate personalized weekly routines in seconds based on your goals and profile.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v3M12 18v3M4.8 6.2l2.1 2.1M17.1 17.7l2.1 2.1M3 12h3M18 12h3M4.8 17.8l2.1-2.1M17.1 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    )
  },
  {
    title: "Todo Tracker",
    text: "Stay locked in with daily tasks and date filtering that keeps your progress easy to review.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7h12M8 12h12M8 17h12" />
        <path d="m3 7 1.4 1.4L6.8 6M3 12l1.4 1.4L6.8 11M3 17l1.4 1.4L6.8 16" />
      </svg>
    )
  },
  {
    title: "Wallpaper Generator",
    text: "Create custom gym wallpapers that match your mindset and keep your motivation visible.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m5 18 5-5 3.5 3.5 2.5-2.5 3 4" />
      </svg>
    )
  },
  {
    title: "Auth & Onboarding",
    text: "JWT-secured login and a clean onboarding flow get users from signup to plan instantly.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 5 7v5c0 4.5 2.9 7.8 7 9 4.1-1.2 7-4.5 7-9V7l-7-4Z" />
        <path d="m9.2 12.3 1.8 1.8 3.8-3.8" />
      </svg>
    )
  }
];

const weeklyActivity = [
  { day: "Mon", value: 82 },
  { day: "Tue", value: 68 },
  { day: "Wed", value: 92 },
  { day: "Thu", value: 56 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 74 },
  { day: "Sun", value: 46 }
];

const exercises = [
  { name: "Barbell Bench Press", meta: "4 sets x 8 reps" },
  { name: "Incline Dumbbell Press", meta: "3 sets x 10 reps" },
  { name: "Cable Fly", meta: "3 sets x 12 reps" },
  { name: "Triceps Rope Pushdown", meta: "4 sets x 12 reps" }
];

const stack = ["React", "Vite", "Tailwind", "Node.js", "Express", "MongoDB", "JWT", "Vercel", "Render"];

const formatStatValue = (value, suffix) => {
  if (value >= 1000 && suffix !== "%") {
    return `${value.toLocaleString()}${suffix}`;
  }
  return `${value}${suffix}`;
};

const LandingPage = () => {
  const [counts, setCounts] = useState(statTargets.map(() => 0));
  const [barsReady, setBarsReady] = useState(false);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(statTargets.map((item) => Math.round(item.value * eased)));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBarsReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    const revealNodes = document.querySelectorAll("[data-reveal]");
    revealNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  const toggleExercise = (index) => {
    setChecked((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-[#04070b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_86%_2%,rgba(59,130,246,0.12),transparent_38%),linear-gradient(180deg,#03060a,#04070b_52%,#03060a)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#04070b]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <h1 className="text-xl font-bold tracking-[0.2em] text-white">GYMFORGE</h1>
          <a
            href="https://gym-tan-theta.vercel.app/register"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-blue-400/60 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500/30"
          >
            Free Signup
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section data-reveal className="reveal grid items-center gap-8 rounded-3xl border border-white/10 bg-black/35 p-6 sm:grid-cols-2 sm:p-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Live Demo
            </p>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Your AI-powered fitness companion
            </h2>
            <p className="mt-4 max-w-xl text-slate-300">
              GymForge combines AI workout planning, daily task focus, custom wallpaper generation, and secure auth to keep your
              progress clear every day.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="https://gym-tan-theta.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-blue-400 bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Try the app
              </a>
              <a
                href="https://github.com/SumanKarmakar467/GYM"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <svg viewBox="0 0 360 180" className="dumbbell-loop h-40 w-full max-w-md text-blue-300">
              <rect x="72" y="84" width="216" height="12" rx="6" fill="currentColor" opacity="0.95" />
              <rect x="48" y="72" width="20" height="36" rx="5" fill="currentColor" opacity="0.7" />
              <rect x="30" y="66" width="16" height="48" rx="4" fill="currentColor" opacity="0.55" />
              <rect x="292" y="72" width="20" height="36" rx="5" fill="currentColor" opacity="0.7" />
              <rect x="314" y="66" width="16" height="48" rx="4" fill="currentColor" opacity="0.55" />
              <circle cx="180" cy="90" r="8" fill="#dbeafe" />
            </svg>
          </div>
        </section>

        <section data-reveal className="reveal mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statTargets.map((item, idx) => (
            <article key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-extrabold text-blue-300 sm:text-3xl">{formatStatValue(counts[idx], item.suffix)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
            </article>
          ))}
        </section>

        <section data-reveal className="reveal mt-12">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">Core Features</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {features.map((feature, idx) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1.5 hover:border-blue-400/60 hover:bg-blue-500/10"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <div className="inline-flex rounded-lg border border-blue-300/40 bg-blue-500/10 p-2 text-blue-200">{feature.icon}</div>
                <h4 className="mt-3 text-lg font-semibold text-white">{feature.title}</h4>
                <p className="mt-2 text-sm text-slate-300">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section data-reveal className="reveal mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Monday Push Day</h3>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            </div>
            <div className="space-y-3">
              {exercises.map((exercise, index) => {
                const done = Boolean(checked[index]);
                return (
                  <button
                    key={exercise.name}
                    type="button"
                    onClick={() => toggleExercise(index)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-blue-300/50"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{exercise.name}</p>
                      <p className="text-sm text-slate-400">{exercise.meta}</p>
                    </div>
                    <span className={`exercise-check ${done ? "checked" : ""}`} aria-hidden="true">
                      <svg viewBox="0 0 20 20" className={`h-4 w-4 text-white transition ${done ? "opacity-100" : "opacity-0"}`}>
                        <path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">Weekly Activity</h3>
            <p className="mt-1 text-sm text-slate-400">Workout completion trend</p>
            <div className="mt-5 flex h-56 items-end justify-between gap-2">
              {weeklyActivity.map((item) => (
                <div key={item.day} className="flex w-full flex-col items-center justify-end gap-2">
                  <div className="relative flex h-44 w-full max-w-[38px] items-end overflow-hidden rounded-lg border border-white/10 bg-black/35">
                    <div
                      style={{ "--bar-scale": item.value / 100 }}
                      className={`chart-bar w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-300 ${barsReady ? "grow" : ""}`}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section data-reveal className="reveal mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Tech Stack</h3>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {stack.map((item) => (
              <span key={item} className="rounded-full border border-blue-300/35 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-100">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section data-reveal className="reveal mt-12 rounded-3xl border border-blue-300/40 bg-blue-500/10 p-8 text-center">
          <h3 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to forge your best self?</h3>
          <p className="mx-auto mt-3 max-w-xl text-slate-200">
            Join GymForge for free and build a smarter, consistent training system around your goals.
          </p>
          <a
            href="https://gym-tan-theta.vercel.app/register"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-xl border border-blue-300 bg-blue-500 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-400"
          >
            Free signup
          </a>
        </section>
      </main>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(34px);
          transition: opacity 750ms ease, transform 750ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal-show {
          opacity: 1;
          transform: translateY(0);
        }

        .dumbbell-loop {
          animation: dumbbell-bounce 2000ms ease-in-out infinite;
          filter: drop-shadow(0 16px 30px rgba(59, 130, 246, 0.35));
        }

        .exercise-check {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: rgba(15, 23, 42, 0.5);
          transition: all 280ms ease;
          flex-shrink: 0;
        }

        .exercise-check.checked {
          border-color: #22c55e;
          background: #22c55e;
          animation: check-pop 280ms ease;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.22);
        }

        .chart-bar {
          transform-origin: bottom;
          transform: scaleY(0);
          transition: transform 1100ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .chart-bar.grow {
          transform: scaleY(var(--bar-scale));
        }

        @keyframes dumbbell-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
        }

        @keyframes check-pop {
          0% {
            transform: scale(0.82);
          }
          70% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
