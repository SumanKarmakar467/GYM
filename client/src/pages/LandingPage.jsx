import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";

const words = ["Build Muscle.", "Burn Fat.", "Track Every Rep.", "Forge Your Legacy."];

const featureCards = [
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

const steps = [
  {
    number: "01",
    title: "Choose your goal",
    description: "Set your outcome, experience level, and training setup in under a minute."
  },
  {
    number: "02",
    title: "Generate your plan",
    description: "GymForge creates a tailored workout plan and auto-loads your daily todo list."
  },
  {
    number: "03",
    title: "Track and improve",
    description: "Complete workouts, monitor streaks, and stay motivated with custom wallpapers."
  }
];

const testimonials = [
  {
    quote: "I went from inconsistent to six days a week because GymForge made my next step obvious.",
    name: "Arjun N.",
    role: "Strength Athlete"
  },
  {
    quote: "The AI plans are clean, practical, and hard enough to keep me honest.",
    name: "Maya K.",
    role: "Fitness Coach"
  },
  {
    quote: "The todo + workout combo is addictive. My streak has never been higher.",
    name: "Ritik P.",
    role: "College Athlete"
  },
  {
    quote: "I finally train with structure. No more random workouts, just focused progress.",
    name: "Sara D.",
    role: "Hybrid Trainee"
  }
];

const tickerItems = [
  { id: "athletes", target: 12400, suffix: "+", label: "Active Athletes" },
  { id: "success", target: 98, suffix: "%", label: "Goal Success Rate" },
  { id: "workouts", target: 89000, suffix: "+", label: "Workouts Generated" },
  { id: "rating", target: 49, suffix: "", label: "Rating" },
  { id: "streaks", target: 24, suffix: "+", label: "Day Streaks" },
  { id: "free", target: 100, suffix: "%", label: "Free" }
];

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const formatTicker = (item, value) => {
  if (item.id === "rating") {
    return `${(value / 10).toFixed(1)}★ ${item.label}`;
  }

  return `${value.toLocaleString()}${item.suffix} ${item.label}`;
};

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [typed, setTyped] = useState("");
  const [counters, setCounters] = useState(
    Object.fromEntries(tickerItems.map((item) => [item.id, 0]))
  );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTyped(words[0]);
      return undefined;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let mode = "typing";
    let pauseRemaining = 0;
    let typingAccumulator = 0;

    const interval = window.setInterval(() => {
      const currentWord = words[wordIndex];

      if (mode === "pause") {
        pauseRemaining -= 55;
        if (pauseRemaining <= 0) {
          mode = "deleting";
        }
        return;
      }

      if (mode === "typing") {
        typingAccumulator += 55;
        if (typingAccumulator < 90) {
          return;
        }
        typingAccumulator = 0;
        charIndex += 1;
        setTyped(currentWord.slice(0, charIndex));

        if (charIndex >= currentWord.length) {
          mode = "pause";
          pauseRemaining = 1800;
        }
        return;
      }

      if (mode === "deleting") {
        charIndex = Math.max(0, charIndex - 1);
        setTyped(currentWord.slice(0, charIndex));

        if (charIndex === 0) {
          wordIndex = (wordIndex + 1) % words.length;
          mode = "typing";
          typingAccumulator = 0;
        }
      }
    }, 55);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCounters(Object.fromEntries(tickerItems.map((item) => [item.id, item.target])));
      return undefined;
    }

    let frameId = null;
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setCounters(
        Object.fromEntries(
          tickerItems.map((item) => [item.id, Math.round(item.target * eased)])
        )
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [prefersReducedMotion]);

  const duplicatedTicker = useMemo(() => [...tickerItems, ...tickerItems], []);
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials], []);

  const openFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        className={`landing-nav sticky top-0 z-50 border-b border-white/10 bg-black/70 ${scrolled ? "scrolled" : ""}`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="font-heading text-2xl tracking-wide text-orange-400">GymForge</Link>

          <nav className="hidden items-center gap-6 md:flex">
            <button type="button" onClick={openFeatures} className="landing-nav-link text-sm text-zinc-200 hover:text-white focus-visible:text-white">
              Features
            </button>
            <a href="#how" className="landing-nav-link text-sm text-zinc-200 hover:text-white focus-visible:text-white">How It Works</a>
            <a href="#reviews" className="landing-nav-link text-sm text-zinc-200 hover:text-white focus-visible:text-white">Reviews</a>
            <Link to="/login" className="rounded-lg border border-white/15 px-4 py-2 text-sm transition hover:border-orange-400/70 focus-visible:border-orange-400/70">
              Login
            </Link>
            <Link to="/register" className="hero-primary-btn rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-black">
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

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
              animate={prefersReducedMotion ? false : { y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
              className="border-t border-white/10 bg-[#101010] px-4 py-3 md:hidden"
            >
              <div className="space-y-2">
                <button type="button" onClick={openFeatures} className="block w-full rounded-lg border border-white/15 px-4 py-2 text-left text-sm hover:border-orange-400/60 focus-visible:border-orange-400/60">
                  Features
                </button>
                <a href="#how" onClick={() => setMenuOpen(false)} className="block rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-orange-400/60 focus-visible:border-orange-400/60">
                  How It Works
                </a>
                <a href="#reviews" onClick={() => setMenuOpen(false)} className="block rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-orange-400/60 focus-visible:border-orange-400/60">
                  Reviews
                </a>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg border border-white/15 px-4 py-2 text-sm">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-black">
                  Get Started
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden px-4 md:px-6">
          <div className="hero-orb-primary pointer-events-none absolute left-[6%] top-1/4 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.15)_0%,rgba(249,115,22,0.05)_40%,transparent_70%)]" />
          <div className="hero-orb-secondary pointer-events-none absolute right-[8%] top-[18%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,rgba(168,85,247,0.05)_45%,transparent_75%)]" />

          <div className="relative z-10 mx-auto w-full max-w-6xl py-24">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-orange-200"
            >
              <span className="h-2 w-2 rounded-full bg-orange-400" style={{ animation: "blink 1s infinite" }} />
              <span>AI-Powered Fitness Platform</span>
            </motion.div>

            <div className="mt-6 max-w-4xl">
              <h1 className="min-h-[4rem] text-4xl font-bold leading-tight md:min-h-[5rem] md:text-6xl">
                {typed}
                <span className="ml-1 text-orange-400" style={{ animation: "blink 1s infinite" }}>|</span>
              </h1>
              <h2 className="mt-2 text-3xl font-bold text-zinc-100 md:text-5xl" style={{ animation: "fadeUp 0.9s 0.2s both" }}>
                Your Best Body.
              </h2>
            </div>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.7 }}
              className="mt-6 max-w-2xl text-base text-zinc-300 md:text-lg"
            >
              AI-powered workout plans, habit tracking, and motivation - built for athletes who mean it.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.7 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link to="/register" className="hero-primary-btn rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-black">
                Start For Free →
              </Link>
              <button
                type="button"
                onClick={openFeatures}
                className="hero-outline-btn rounded-lg border border-white/15 px-6 py-3 text-sm"
              >
                See How It Works
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? false : { opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              <div className="scroll-mouse">
                <span className="scroll-mouse-dot" />
              </div>
              <span>Scroll</span>
            </div>
          </motion.div>
        </section>

        <section className="ticker-strip overflow-hidden border-y border-white/10 bg-black/45 py-4">
          <div className="ticker-track items-center gap-4 whitespace-nowrap px-4">
            {duplicatedTicker.map((item, index) => {
              const value = counters[item.id] || 0;
              return (
                <p key={`${item.id}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200">
                  {formatTicker(item, value)}
                </p>
              );
            })}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <Reveal>
            <h2 className="text-3xl font-bold md:text-4xl">Why Athletes Pick GymForge</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-3 max-w-2xl text-zinc-300">Everything you need to plan, track, and execute your transformation without friction.</p>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featureCards.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 100}>
                <motion.article
                  whileHover={prefersReducedMotion ? undefined : { y: -6, borderColor: "rgba(249,115,22,0.4)" }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                  className="feature-card rounded-2xl border border-white/10 bg-[#141414] p-6"
                >
                  <motion.div
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: 5 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                    className="inline-grid h-12 w-12 place-items-center rounded-xl bg-orange-500/15 text-2xl"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{feature.description}</p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
          <div className="grid gap-6 rounded-3xl border border-white/10 bg-[#101010] p-6 md:grid-cols-2 md:p-8">
            <Reveal direction="left">
              <div>
                <h3 className="text-3xl font-bold">How It Works</h3>
                <p className="mt-3 text-zinc-300">From setup to consistency, GymForge keeps your workflow simple and high output.</p>

                <div className="mt-6 space-y-3">
                  {steps.map((step, index) => (
                    <Reveal key={step.number} delay={index * 120}>
                      <motion.div
                        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
                      >
                        <motion.span
                          whileHover={prefersReducedMotion ? undefined : { scale: 1.1, backgroundColor: "#f97316", color: "#fff" }}
                          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-orange-400/40 bg-orange-500/10 text-sm font-bold text-orange-200"
                        >
                          {step.number}
                        </motion.span>
                        <div>
                          <p className="font-semibold">{step.title}</p>
                          <p className="mt-1 text-sm text-zinc-300">{step.description}</p>
                        </div>
                      </motion.div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/15 via-black/30 to-purple-500/15 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Live Preview</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
                  <p className="text-sm text-zinc-400">Today Progress</p>
                  <p className="mt-2 text-3xl font-bold">72%</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-orange-400" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-zinc-300">
                    <div className="rounded-lg border border-white/10 p-3">Streak: 14 days</div>
                    <div className="rounded-lg border border-white/10 p-3">Plan: 3 months</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="reviews" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <Reveal>
            <h3 className="text-3xl font-bold md:text-4xl">Athlete Reviews</h3>
          </Reveal>

          <div className="marquee-wrap mt-6 overflow-hidden">
            <div className="marquee-track gap-4">
              {duplicatedTestimonials.map((item, index) => (
                <motion.article
                  key={`${item.name}-${index}`}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02, borderColor: "rgba(249,115,22,0.3)" }}
                  className="w-[320px] flex-shrink-0 rounded-2xl border border-white/10 bg-[#141414] p-5"
                >
                  <p className="text-sm leading-relaxed text-zinc-200">"{item.quote}"</p>
                  <p className="mt-4 text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.role}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141414] p-8 text-center md:p-10">
              <div className="cta-spin-overlay pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.25)_0%,transparent_65%)]" />
              <div className="relative z-10">
                <p className="text-2xl font-bold md:text-3xl">100% Free. No credit card. No BS.</p>
                <Link
                  to="/register"
                  className="hero-primary-btn mt-6 inline-flex rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-black"
                >
                  Create Your Account →
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-sm text-zinc-400 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p>© 2025 GymForge. Built for athletes.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/SumanKarmakar467/GYM" target="_blank" rel="noreferrer" className="landing-nav-link hover:text-orange-300 focus-visible:text-orange-300">GitHub</a>
            <a href="#" className="landing-nav-link hover:text-orange-300 focus-visible:text-orange-300">Privacy</a>
            <a href="#" className="landing-nav-link hover:text-orange-300 focus-visible:text-orange-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
