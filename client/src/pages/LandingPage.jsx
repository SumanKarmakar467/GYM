import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const heroLines = ["Build Your Best Body.", "Track Every Rep.", "Forge Your Legacy."];

const features = [
  {
    icon: "🧠",
    title: "AI Workout Generator",
    description: "Tell us your goal and experience. Get a personalized plan in seconds."
  },
  {
    icon: "✅",
    title: "Daily Todo Tracker",
    description: "Stay consistent with date-aware habit tracking and streak rewards."
  },
  {
    icon: "🖼️",
    title: "Motivational Wallpapers",
    description: "Generate custom gym wallpapers to keep you locked in."
  }
];

const LandingPage = () => {
  const [typedLine, setTypedLine] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let pauseTicks = 0;

    const interval = window.setInterval(() => {
      const currentLine = heroLines[lineIndex];

      if (!deleting && charIndex === currentLine.length) {
        pauseTicks += 1;
        if (pauseTicks < 8) {
          return;
        }
        deleting = true;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        pauseTicks = 0;
        lineIndex = (lineIndex + 1) % heroLines.length;
      }

      charIndex += deleting ? -1 : 1;
      setTypedLine(currentLine.slice(0, charIndex));
    }, 90);

    return () => window.clearInterval(interval);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/55 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="font-heading text-2xl tracking-wide text-orange-400">GymForge</Link>

          <nav className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-lg border border-white/15 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-orange-400/70">
              Login
            </Link>
            <Link to="/register" className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(249,115,22,0.35)]">
              Get Started
            </Link>
          </nav>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          </button>
        </div>

        <div className={`overflow-hidden border-t border-white/10 bg-[#101010] transition-all duration-300 md:hidden ${menuOpen ? "max-h-40" : "max-h-0"}`}>
          <div className="space-y-2 px-4 py-3">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg border border-white/15 px-4 py-2 text-sm">
              Login
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="block rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-black">
              Get Started
            </Link>
            <button type="button" onClick={scrollToFeatures} className="block w-full rounded-lg border border-white/15 px-4 py-2 text-left text-sm">
              See Features
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden">
          <div className="landing-orb pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-purple-500/40 via-fuchsia-500/25 to-orange-500/45 blur-3xl" />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
            <p className="text-xs uppercase tracking-[0.4em] text-orange-300">GymForge Platform</p>
            <h1 className="mt-4 min-h-[5.5rem] max-w-3xl text-4xl font-bold leading-tight md:min-h-[7rem] md:text-6xl">
              {typedLine}
              <span className="ml-1 animate-pulse text-orange-400">|</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-zinc-300 md:text-lg">
              AI-powered workout plans, habit tracking, and motivation — built for athletes who mean it.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(249,115,22,0.35)]">
                Start For Free →
              </Link>
              <button
                type="button"
                onClick={scrollToFeatures}
                className="rounded-lg border border-white/15 px-6 py-3 text-sm transition hover:-translate-y-0.5 hover:border-orange-400/70"
              >
                See How It Works
              </button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <h2 className="text-3xl font-bold md:text-4xl">Why Athletes Pick GymForge</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-[#141414] p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(0,0,0,0.45)]"
              >
                <p className="text-3xl">{feature.icon}</p>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#131313] p-8 text-center md:p-10">
            <p className="text-2xl font-bold md:text-3xl">100% Free. No credit card. No BS.</p>
            <Link
              to="/register"
              className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(249,115,22,0.35)]"
            >
              Create Your Account →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-sm text-zinc-400 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p>© 2025 GymForge. Built for athletes.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/SumanKarmakar467/GYM" target="_blank" rel="noreferrer" className="hover:text-orange-300">GitHub</a>
            <a href="#" className="hover:text-orange-300">Privacy</a>
            <a href="#" className="hover:text-orange-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
