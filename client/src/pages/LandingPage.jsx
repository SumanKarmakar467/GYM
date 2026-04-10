import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  { label: "Users", value: "10,000+" },
  { label: "Physique Types", value: "5" },
  { label: "Exercises", value: "100+" },
  { label: "AI Powered", value: "24/7" }
];

const physiques = [
  { name: "Bodybuilder", desc: "Hypertrophy and sculpted size" },
  { name: "Calisthenics", desc: "Bodyweight mastery and control" },
  { name: "Powerlifter", desc: "Raw strength in big 3 lifts" },
  { name: "CrossFit", desc: "Hybrid fitness and conditioning" },
  { name: "Athlete", desc: "Speed, agility, and explosiveness" }
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bgPrimary text-white">
      <div className="hex-grid pointer-events-none" />

      <header className="sticky top-0 z-20 border-b border-borderSubtle bg-black/55 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <span className="font-display text-4xl tracking-wide text-brandPrimary">GymForge</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-6 md:pt-16">
        <section className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-brandSecondary">AI Physique Platform</p>
            <h1 className="font-display text-6xl leading-[0.92] text-brandPrimary md:text-8xl">Transform Your Body</h1>
            <p className="mt-4 max-w-xl text-lg text-textSecondary">Powered by AI.</p>
            <p className="mt-4 max-w-xl text-textSecondary">
              Build personalized training blueprints by goal, environment, and timeline. Track daily progress, streaks,
              and consistency in one dark, high-energy workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">
                Start Your Journey
              </Link>
              <a href="#how" className="btn-ghost">
                See How It Works
              </a>
            </div>
          </motion.div>

          <div className="card p-6 md:p-8">
            <h2 className="font-heading text-xl">5 Physique Archetypes</h2>
            <div className="mt-4 space-y-3">
              {physiques.map((item) => (
                <article key={item.name} className="rounded-xl border border-borderSubtle bg-bgSecondary px-4 py-3">
                  <p className="font-heading text-sm text-brandSecondary">{item.name}</p>
                  <p className="text-sm text-textSecondary">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="card p-4 text-center">
              <p className="font-display text-5xl text-brandPrimary">{item.value}</p>
              <p className="text-xs uppercase tracking-wide text-textSecondary">{item.label}</p>
            </article>
          ))}
        </section>

        <section id="how" className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["1. Onboard", "Enter metrics, goal, environment, and timeline."],
            ["2. Generate", "Claude builds your structured week-by-week plan."],
            ["3. Track", "Complete exercise cards and grow your streak daily."]
          ].map(([title, text]) => (
            <article key={title} className="card p-5 transition hover:-translate-y-1 hover:border-brandPrimary">
              <h3 className="font-heading text-lg text-brandSecondary">{title}</h3>
              <p className="mt-2 text-sm text-textSecondary">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Realtime Engine</p>
            <h3 className="mt-2 text-xl font-semibold">⚡ Real-time: Live workout tracking with instant updates</h3>
            <p className="mt-2 text-sm text-textSecondary">
              Progress syncs continuously so your completion status, streak, and weekly stats stay fresh.
            </p>
          </article>
          <article className="card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Design Language</p>
            <h3 className="mt-2 text-xl font-semibold">🎨 Modern Design: Electric Cyan + Volt Green</h3>
            <p className="mt-2 text-sm text-textSecondary">
              A high-energy neon visual system built around #00E5FF and #39FF14.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
