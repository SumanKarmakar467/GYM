import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DownloadAppButton from "../components/DownloadAppButton";
import Reveal from "../components/Reveal";

const ParticleMesh = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let pts = [];
    const LINK = 160;

    const populate = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const n = Math.min(72, Math.floor((canvas.width * canvas.height) / 14000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.5 + 0.4,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;

      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.phase += 0.016;
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const d = Math.sqrt(d2);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(249,115,22,${(1 - d / LINK) * 0.13})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }

        const dm = Math.hypot(pts[i].x - mx, pts[i].y - my);
        const near = dm < 130;
        const pulse = 0.28 + Math.sin(pts[i].phase) * 0.12;
        const opacity = near ? Math.max(pulse, (1 - dm / 130) * 0.9) : pulse * 0.65;
        const radius = near ? pts[i].r * (1 + (1 - dm / 130) * 1.8) : pts[i].r;

        if (near && dm < 80) {
          const grd = ctx.createRadialGradient(pts[i].x, pts[i].y, 0, pts[i].x, pts[i].y, 14);
          grd.addColorStop(0, `rgba(251,146,60,${opacity * 0.55})`);
          grd.addColorStop(1, "rgba(249,115,22,0)");
          ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 14, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }

        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${opacity})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onMouse = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    const onResize = () => populate();

    populate();
    raf = requestAnimationFrame(draw);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
};

const words = ["Build Muscle.", "Burn Fat.", "Track Every Rep.", "Forge Your Legacy."];

const heroSignals = [
  { label: "Volume", value: "+18%" },
  { label: "Protein", value: "148g" },
  { label: "Streak", value: "14d" }
];

const heroPulseLines = ["Plan generated", "Workout synced", "Demo form ready", "Todo graph live"];

const AIWorkoutPreview = () => (
  <div style={{ background: "#0d0d0d", height: "100%", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", fontFamily: "inherit" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ background: "linear-gradient(90deg,#f97316,#fb923c)", color: "#000", fontSize: "8px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.14em" }}>AI PLAN BUILDER</span>
      <span style={{ fontSize: "8px", color: "#52525b", letterSpacing: "0.1em" }}>GymForge</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {[["Goal", "Build Muscle"], ["Level", "Intermediate"], ["Equipment", "Full Gym"], ["Days/week", "4"]].map(([label, val]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", padding: "5px 9px" }}>
          <span style={{ fontSize: "9px", color: "#71717a" }}>{label}</span>
          <span style={{ fontSize: "9px", color: "#e4e4e7", fontWeight: "600" }}>{val}</span>
        </div>
      ))}
    </div>
    <div style={{ flex: 1, background: "#111", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "8px", padding: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "8px", color: "#f97316", fontWeight: "700", letterSpacing: "0.12em" }}>GENERATED PLAN · PUSH DAY</span>
        <span style={{ fontSize: "7px", color: "#3f3f46", background: "#1c1c1c", padding: "2px 5px", borderRadius: "3px" }}>4 wk</span>
      </div>
      {[["Bench Press", "4 × 10", "85%"], ["Incline DB Press", "3 × 12", "70%"], ["Cable Fly", "3 × 15", "65%"], ["Tricep Pushdown", "3 × 12", "75%"]].map(([name, sets, load]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
            <span style={{ fontSize: "9px", color: "#d4d4d8" }}>{name}</span>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "8px", color: "#a1a1aa" }}>{sets}</span>
            <span style={{ fontSize: "7px", color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "1px 4px", borderRadius: "3px" }}>{load}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ flex: 1, height: "3px", borderRadius: "99px", background: "#1c1c1c", overflow: "hidden" }}>
        <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg,#f97316,#fb923c)", borderRadius: "99px" }} />
      </div>
      <span style={{ fontSize: "8px", color: "#f97316", fontWeight: "700" }}>72%</span>
      <span style={{ fontSize: "8px", color: "#52525b" }}>volume</span>
    </div>
  </div>
);

const TodoTrackerPreview = () => (
  <div style={{ background: "#0d0d0d", height: "100%", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", fontFamily: "inherit" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "9px", fontWeight: "800", color: "#e4e4e7", letterSpacing: "0.12em" }}>TODAY&apos;S TRACKER</span>
      <div style={{ display: "flex", gap: "4px" }}>
        <span style={{ fontSize: "7px", color: "#f97316", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>🔥 14d streak</span>
      </div>
    </div>
    <div style={{ fontSize: "8px", color: "#52525b", letterSpacing: "0.1em" }}>Workout · Water · Meals · Recovery</div>
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
      {[
        { label: "Push day strength session", done: true },
        { label: "Protein target completed", done: true },
        { label: "2.5L water intake", done: true },
        { label: "Mobility before sleep", done: false, active: true },
        { label: "Log bodyweight", done: false },
        { label: "10k steps", done: false },
      ].map(({ label, done, active }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", background: done ? "rgba(249,115,22,0.05)" : active ? "rgba(255,255,255,0.03)" : "transparent", border: `1px solid ${done ? "rgba(249,115,22,0.15)" : active ? "rgba(255,255,255,0.08)" : "transparent"}`, borderRadius: "6px", padding: "5px 8px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#f97316" : active ? "rgba(249,115,22,0.15)" : "#1c1c1c", border: done ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
            {done && <span style={{ fontSize: "8px", color: "#000", fontWeight: "900" }}>✓</span>}
            {active && !done && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f97316", display: "block" }} />}
          </div>
          <span style={{ fontSize: "9px", color: done ? "#a1a1aa" : active ? "#e4e4e7" : "#52525b", textDecoration: done ? "line-through" : "none" }}>{label}</span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <div key={d} style={{ width: "8px", height: "8px", borderRadius: "2px", background: d <= 5 ? "#f97316" : "#1c1c1c" }} />
        ))}
      </div>
      <span style={{ fontSize: "8px", color: "#52525b" }}>3 / 6 done</span>
    </div>
  </div>
);

const WallpaperPreview = () => (
  <div style={{ position: "relative", height: "100%", overflow: "hidden", background: "linear-gradient(160deg,#0a0a0a 0%,#1a0800 45%,#2d0f00 100%)" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 90%, rgba(249,115,22,0.45) 0%, transparent 65%)" }} />
    <svg viewBox="0 0 400 200" style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", height: "55%" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="mtnGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c1c" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="1" />
        </linearGradient>
      </defs>
      <polygon points="0,200 80,60 140,120 200,30 260,90 320,50 400,140 400,200" fill="url(#mtnGrad)" />
      <polygon points="0,200 60,110 120,150 180,80 240,130 300,90 380,160 400,200" fill="url(#mtnGrad2)" />
    </svg>
    <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", width: "80%", textAlign: "center" }}>
      <div style={{ fontSize: "7px", color: "#f97316", fontWeight: "700", letterSpacing: "0.22em", marginBottom: "8px" }}>FORGE MODE</div>
      <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff", lineHeight: 1.3, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>The Iron Doesn&apos;t<br />Lie. Neither Do You.</div>
      <div style={{ marginTop: "8px", fontSize: "8px", color: "#fb923c", letterSpacing: "0.1em" }}>Build Muscle · 4 days/week</div>
    </div>
    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "radial-gradient(circle at 38% 35%, #ffd700 0%, #f97316 45%, #7c2d12 100%)", boxShadow: "0 0 12px rgba(249,115,22,0.7)" }} />
    </div>
    <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}>Custom motivational wallpaper</span>
    </div>
  </div>
);

const featureCards = [
  {
    icon: "🧠",
    title: "AI Workout Generator",
    Preview: AIWorkoutPreview,
    description: "Enter your goal, experience, equipment, and schedule. GymForge turns it into a structured plan with clear exercise targets."
  },
  {
    icon: "✅",
    title: "Daily Todo Tracker",
    Preview: TodoTrackerPreview,
    description: "Every workout becomes a focused daily checklist so you can finish reps, habits, recovery, and streak goals without guessing."
  },
  {
    icon: "🖼️",
    title: "Motivational Wallpapers",
    Preview: WallpaperPreview,
    description: "Create lock-screen style motivation from your training goal, so the plan follows you even before you open the app."
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

const featureInsights = [
  {
    label: "AI Workout Generator",
    headline: "Plans tuned by goal, schedule, equipment, and level.",
    stats: [
      { value: "4 wk", label: "smart plan blocks" },
      { value: "42", label: "exercise swaps" },
      { value: "90s", label: "plan generation" }
    ],
    activity: ["Goal scanned", "Split selected", "Volume balanced", "Plan ready"]
  },
  {
    label: "Daily Todo Tracker",
    headline: "Training tasks become a clean daily execution board.",
    stats: [
      { value: "14", label: "day streak" },
      { value: "86%", label: "habits cleared" },
      { value: "7", label: "tasks today" }
    ],
    activity: ["Warm-up done", "Push day active", "Hydration logged", "Recovery queued"]
  },
  {
    label: "Wallpaper Motivation",
    headline: "Custom lock-screen energy made from your own fitness goal.",
    stats: [
      { value: "12", label: "visual styles" },
      { value: "4K", label: "export ready" },
      { value: "1 tap", label: "download" }
    ],
    activity: ["Goal parsed", "Theme matched", "Quote forged", "Wallpaper saved"]
  }
];

const exerciseVisuals = [
  {
    title: "Lat Pulldown",
    image: "/images/exercises/lat-pulldown.jpg",
    focus: "Lats + Upper Back",
    cue: "Pull elbows down, keep chest tall."
  },
  {
    title: "Incline Curl",
    image: "/images/exercises/incline-curl.jpg",
    focus: "Biceps",
    cue: "Keep shoulders pinned, curl with control."
  },
  {
    title: "Dumbbell Press",
    image: "/images/exercises/dumbbell-press.jpg",
    focus: "Shoulders + Triceps",
    cue: "Brace ribs and press in a clean vertical path."
  },
  {
    title: "Push-Up",
    image: "/images/exercises/push-up.jpg",
    focus: "Chest + Core",
    cue: "Keep body straight and lower with tempo."
  },
  {
    title: "Pull-Up",
    image: "/images/exercises/pull-up.jpg",
    focus: "Back + Arms",
    cue: "Start from a dead hang, drive elbows down."
  },
  {
    title: "Barbell Lunge",
    image: "/images/exercises/barbell-lunge.jpg",
    focus: "Quads + Glutes",
    cue: "Step with control and keep your front knee tracking."
  },
  {
    title: "Bodyweight Squat",
    image: "/images/exercises/bodyweight-squat.jpg",
    focus: "Legs + Mobility",
    cue: "Sit hips back, keep chest lifted, and drive through heels."
  },
  {
    title: "Barbell Calf Raise",
    image: "/images/exercises/barbell-calf-raise.jpg",
    focus: "Calves",
    cue: "Pause at the top and lower through full range."
  },
  {
    title: "Incline Cable Fly",
    image: "/images/exercises/incline-cable-fly.jpg",
    focus: "Upper Chest",
    cue: "Open wide, then squeeze across the chest without rushing."
  },
  {
    title: "Standing Curl",
    image: "/images/exercises/standing-curl.jpg",
    focus: "Biceps + Forearms",
    cue: "Lock elbows close and avoid swinging your torso."
  },
  {
    title: "Bulgarian Split Squat",
    image: "/images/exercises/bulgarian-split-squat.jpg",
    focus: "Glutes + Quads",
    cue: "Drop straight down and push through the front foot."
  },
  {
    title: "Cable Lateral Raise",
    image: "/images/exercises/cable-lateral-raise.jpg",
    focus: "Side Delts",
    cue: "Lead with elbows and keep tension through the full arc."
  },
  {
    title: "Cable Row",
    image: "/images/exercises/cable-row.jpg",
    focus: "Mid Back",
    cue: "Pull elbows back, pause, then return with control."
  }
];

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const formatTicker = (item, value) => {
  if (item.id === "rating") {
    return `${(value / 10).toFixed(1)}★ ${item.label}`;
  }

  return `${value.toLocaleString()}${item.suffix} ${item.label}`;
};

const getUniqueExerciseVisuals = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.title}-${item.image}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const LandingPage = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [typed, setTyped] = useState("");
  const dragStartRef = useRef(null);
  const [videoTransform, setVideoTransform] = useState({ rotateX: 7, rotateY: -14, zoom: 1 });
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [counters, setCounters] = useState(
    Object.fromEntries(tickerItems.map((item) => [item.id, 0]))
  );
  const [spotlight, setSpotlight] = useState({ x: -9999, y: -9999 });
  const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });
  const heroSectionRef = useRef(null);

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

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveInsightIndex((current) => (current + 1) % featureInsights.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const onMove = (e) => setSpotlight({ x: e.clientX, y: e.clientY });
    const onLeave = () => setSpotlight({ x: -9999, y: -9999 });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion]);

  const handleHeroMouseMove = (e) => {
    if (prefersReducedMotion || !heroSectionRef.current) return;
    const rect = heroSectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setHeroParallax({ x: x * 10, y: y * 6 });
  };

  const handleHeroMouseLeave = () => setHeroParallax({ x: 0, y: 0 });

  const duplicatedTicker = useMemo(() => [...tickerItems, ...tickerItems], []);
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials], []);
  const uniqueExerciseVisuals = useMemo(() => getUniqueExerciseVisuals(exerciseVisuals), []);
  const duplicatedExerciseVisuals = useMemo(() => [...uniqueExerciseVisuals, ...uniqueExerciseVisuals], [uniqueExerciseVisuals]);
  const activeInsight = featureInsights[activeInsightIndex];

  const clampVideoTransform = (nextTransform) => ({
    rotateX: Math.max(-28, Math.min(28, nextTransform.rotateX)),
    rotateY: Math.max(-180, Math.min(180, nextTransform.rotateY)),
    zoom: Math.max(0.78, Math.min(1.32, nextTransform.zoom))
  });

  const updateVideoTransform = (nextTransform) => {
    setVideoTransform((current) => clampVideoTransform({ ...current, ...nextTransform }));
  };

  const handleVideoDragStart = (event) => {
    if (prefersReducedMotion) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: videoTransform.rotateX,
      rotateY: videoTransform.rotateY
    };
  };

  const handleVideoDrag = (event) => {
    const dragStart = dragStartRef.current;

    if (!dragStart) {
      return;
    }

    const nextRotateY = dragStart.rotateY + (event.clientX - dragStart.x) * 0.18;
    const nextRotateX = dragStart.rotateX - (event.clientY - dragStart.y) * 0.16;
    setVideoTransform((current) => clampVideoTransform({ ...current, rotateX: nextRotateX, rotateY: nextRotateY }));
  };

  const handleVideoDragEnd = () => {
    dragStartRef.current = null;
  };

  const handleVideoWheel = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.05 : 0.05;
    setVideoTransform((current) => clampVideoTransform({ ...current, zoom: current.zoom + direction }));
  };

  const resetVideoTransform = () => {
    setVideoTransform({ rotateX: 7, rotateY: -14, zoom: 1 });
  };

  const openFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ParticleMesh />
      <div className="page-depth-layer" aria-hidden="true" />
      {!prefersReducedMotion && (
        <div
          className="cursor-spotlight"
          aria-hidden="true"
          style={{ left: spotlight.x, top: spotlight.y }}
        />
      )}
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
            <DownloadAppButton variant="small" />
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
                <div className="pt-1">
                  <DownloadAppButton variant="small" />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      <main>
        <section
          ref={heroSectionRef}
          className="relative flex min-h-screen items-center overflow-hidden px-4 md:px-6"
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          <div className="hero-ambient-left pointer-events-none absolute left-0 top-0 h-full w-1/2" aria-hidden="true" />
          <div className="hero-ambient-right pointer-events-none absolute right-0 top-0 h-full w-1/2" aria-hidden="true" />

          <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 py-24 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)]">
            <div>
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
                className="hero-badge-pill inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/8 px-4 py-2 text-xs uppercase tracking-[0.18em] text-orange-300"
              >
                <span className="hero-badge-dot h-1.5 w-1.5 rounded-full bg-orange-400" />
                AI-Powered Fitness Platform
              </motion.div>

              <div className="mt-7 max-w-4xl">
                <h1 className="min-h-[4rem] text-4xl font-bold leading-[1.08] tracking-tight md:min-h-[5rem] md:text-[3.8rem]">
                  <span className="hero-typed-gradient">{typed}</span>
                  <span className="ml-1 text-orange-400" style={{ animation: "blink 1s infinite" }}>|</span>
                </h1>
                <h2 className="mt-2 text-3xl font-bold leading-tight text-white/90 md:text-5xl" style={{ animation: "fadeUp 0.9s 0.2s both" }}>
                  Your Best Body.
                </h2>
              </div>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.7 }}
                className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
              >
                AI-powered workout plans, habit tracking, and motivation — built for athletes who mean it.
              </motion.p>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.7 }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="hero-primary-btn hero-cta-main rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-7 py-3.5 text-sm font-semibold text-black"
                >
                  Start For Free →
                </button>
                <DownloadAppButton variant="hero" />
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={prefersReducedMotion ? false : { opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.9, duration: prefersReducedMotion ? 0 : 0.7 }}
                className="mt-10 flex items-center gap-6"
              >
                {[["12K+", "Athletes"], ["98%", "Success Rate"], ["100%", "Free"]].map(([val, label]) => (
                  <div key={label} className="hero-mini-stat">
                    <strong>{val}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 60, scale: 0.96 }}
              animate={prefersReducedMotion ? false : { opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.75, ease: "easeOut" }}
              style={prefersReducedMotion ? {} : {
                transform: `perspective(1200px) rotateY(${-7 + heroParallax.x * 0.5}deg) rotateX(${3 - heroParallax.y * 0.4}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              className="hero-visual-shell"
              aria-label="Animated bodybuilding image collage"
            >
              <div className="hero-visual-glow" />
              <div className="hero-collage-scene">
                <div className="hero-scanline" aria-hidden="true" />
                <div className="hero-holo-rings" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="hero-particle-field" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="hero-collage-grid">
                  <motion.figure
                    className="hero-collage-card hero-collage-card-large"
                    animate={prefersReducedMotion ? false : { y: [0, -12, 0], rotateZ: [-1, 1, -1] }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src="/images/hero-collage/bodybuilder-shadow.jpg" alt="Bodybuilder silhouette in dramatic light" />
                  </motion.figure>
                  <motion.figure
                    className="hero-collage-card hero-collage-card-tall"
                    animate={prefersReducedMotion ? false : { y: [0, 10, 0], rotateZ: [1, -1, 1] }}
                    transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src="/images/hero-collage/classic-pose.jpg" alt="Classic bodybuilding pose" />
                  </motion.figure>
                  <motion.figure
                    className="hero-collage-card hero-collage-card-small"
                    animate={prefersReducedMotion ? false : { y: [0, -8, 0], scale: [1, 1.03, 1] }}
                    transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src="/images/hero-collage/body-detail.jpg" alt="Bodybuilder leg and torso detail" />
                  </motion.figure>
                  <motion.figure
                    className="hero-collage-card hero-collage-card-wide"
                    animate={prefersReducedMotion ? false : { y: [0, 8, 0], scale: [1, 1.025, 1] }}
                    transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src="/images/hero-collage/front-pose.jpg" alt="Front bodybuilding pose" />
                  </motion.figure>
                  <motion.figure
                    className="hero-collage-card hero-collage-card-portrait"
                    animate={prefersReducedMotion ? false : { y: [0, -10, 0], rotateZ: [0.8, -0.8, 0.8] }}
                    transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src="/images/hero-collage/upper-body.jpg" alt="Upper body bodybuilding portrait" />
                  </motion.figure>
                </div>
                <div className="hero-collage-badge">
                  <span />
                  Live training visual system
                </div>
                <div className="hero-signal-stack">
                  {heroSignals.map((signal, index) => (
                    <motion.div
                      key={signal.label}
                      className="hero-signal-chip"
                      animate={prefersReducedMotion ? false : { y: [0, -7, 0], opacity: [0.82, 1, 0.82] }}
                      transition={{ duration: 3.2 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.18 }}
                    >
                      <span>{signal.label}</span>
                      <strong>{signal.value}</strong>
                    </motion.div>
                  ))}
                </div>
                <div className="hero-collage-stat">
                  <span>Focus</span>
                  <strong>Hypertrophy</strong>
                  <small>Strength · Shape · Discipline</small>
                </div>
                <div className="hero-command-rail">
                  {heroPulseLines.map((line, index) => (
                    <motion.p
                      key={line}
                      animate={prefersReducedMotion ? false : { x: [0, 8, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.22 }}
                    >
                      <span />
                      {line}
                    </motion.p>
                  ))}
                </div>
                <div className="hero-waveform" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? false : { opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
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

        <section className="landing-feature-radar mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
          <Reveal>
            <div className="landing-feature-radar-grid">
              <div className="landing-feature-radar-copy">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Live feature pulse</p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">Random GymForge signals that make progress feel alive</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
                  The landing page now shows animated feature data: workout generation, todo progress, and wallpaper motivation cycling like a live product dashboard.
                </p>
              </div>

              <div className="landing-feature-radar-panel">
                <div className="feature-radar-orbit" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInsight.label}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReducedMotion ? false : { opacity: 0, y: -18, scale: 0.97 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                    className="feature-radar-card"
                  >
                    <p className="feature-radar-label">{activeInsight.label}</p>
                    <h3>{activeInsight.headline}</h3>

                    <div className="feature-radar-stats">
                      {activeInsight.stats.map((stat) => (
                        <div key={`${activeInsight.label}-${stat.label}`}>
                          <strong>{stat.value}</strong>
                          <span>{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="feature-radar-activity">
                      {activeInsight.activity.map((item, index) => (
                        <motion.p
                          key={`${activeInsight.label}-${item}`}
                          initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                          animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
                          transition={{ delay: prefersReducedMotion ? 0 : index * 0.08 }}
                        >
                          <span />
                          {item}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="feature-radar-tabs">
                  {featureInsights.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      className={index === activeInsightIndex ? "is-active" : ""}
                      onClick={() => setActiveInsightIndex(index)}
                      aria-label={`Show ${item.label} data`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
          <Reveal>
            <p className="section-kicker">Core Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Why Athletes Pick <span className="text-gradient-fire">GymForge</span></h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-4 max-w-2xl text-zinc-400">Everything you need to plan, track, and execute your transformation without friction.</p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featureCards.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 120}>
                <motion.article
                  whileHover={prefersReducedMotion ? undefined : { y: -8, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
                  className="feature-card-premium group rounded-2xl border border-white/8 bg-[#111]/80 p-5 backdrop-blur-sm"
                >
                  <div className="feature-card-media-premium overflow-hidden rounded-xl border border-white/6">
                    <feature.Preview />
                  </div>
                  <div className="mt-5 flex items-start gap-3">
                    <motion.div
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.12, rotate: 6 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "backOut" }}
                      className="inline-grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-orange-500/12 text-xl ring-1 ring-orange-500/20"
                    >
                      {feature.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-white">{feature.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
                    </div>
                  </div>
                  <div className="feature-card-shimmer" aria-hidden="true" />
                </motion.article>
              </Reveal>
            ))}
          </div>
        </section>
        <div className="premium-section-divider" aria-hidden="true" />

        <section className="exercise-visual-showcase overflow-hidden py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <Reveal>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Exercise form library</p>
                  <h2 className="mt-3 text-3xl font-bold md:text-4xl">Visual workouts that feel alive</h2>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
                  Real exercise anatomy references now move through the page with clean depth, glow, and hover motion so users instantly understand what GymForge trains.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="exercise-visual-track mt-8">
            {duplicatedExerciseVisuals.map((exercise, index) => (
              <motion.article
                key={`${exercise.title}-${index}`}
                className="exercise-visual-card"
                whileHover={prefersReducedMotion ? undefined : { y: -10, rotateY: -4, scale: 1.02 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
              >
                <div className="exercise-visual-image">
                  <img src={exercise.image} alt={`${exercise.title} muscle anatomy guide`} />
                  <span>{String(index % uniqueExerciseVisuals.length + 1).padStart(2, "0")}</span>
                </div>
                <div className="exercise-visual-body">
                  <p>{exercise.focus}</p>
                  <h3>{exercise.title}</h3>
                  <small>{exercise.cue}</small>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="demo-video" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
          <Reveal>
            <div className="demo-video-section">
              <div className="demo-video-copy">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Demo video</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Watch the Shorts demo inside GymForge</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300 md:text-base">
                  The player stays embedded on this page. Drag the top handle to rotate the video card, then zoom with the controls or your mouse wheel.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateVideoTransform({ zoom: videoTransform.zoom - 0.08 })}
                    className="demo-video-control"
                    aria-label="Zoom out demo video"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVideoTransform({ zoom: videoTransform.zoom + 0.08 })}
                    className="demo-video-control"
                    aria-label="Zoom in demo video"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVideoTransform({ rotateY: videoTransform.rotateY - 18 })}
                    className="demo-video-control"
                    aria-label="Rotate demo video left"
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVideoTransform({ rotateY: videoTransform.rotateY + 18 })}
                    className="demo-video-control"
                    aria-label="Rotate demo video right"
                  >
                    Right
                  </button>
                  <button
                    type="button"
                    onClick={resetVideoTransform}
                    className="demo-video-control demo-video-control-reset"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div
                className="demo-video-stage"
                onWheel={handleVideoWheel}
                aria-label="Rotatable and zoomable GymForge demo video"
              >
                <div
                  className="demo-video-card"
                  style={{
                    transform: `rotateX(${videoTransform.rotateX}deg) rotateY(${videoTransform.rotateY}deg) scale(${videoTransform.zoom})`
                  }}
                >
                  <div
                    className="demo-video-drag-handle"
                    onPointerDown={handleVideoDragStart}
                    onPointerMove={handleVideoDrag}
                    onPointerUp={handleVideoDragEnd}
                    onPointerCancel={handleVideoDragEnd}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag to rotate demo video"
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="demo-video-frame">
                    <iframe
                      title="GymForge demo video"
                      src="https://www.youtube.com/embed/nu8rzPjRYTI?rel=0&modestbranding=1&playsinline=1"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
          <div className="grid gap-6 rounded-3xl border border-white/10 bg-[#101010] p-6 md:grid-cols-2 md:p-8">
            <Reveal direction="left">
              <div>
                <h3 className="text-3xl font-bold">How It Works</h3>
                <p className="mt-3 text-zinc-300">From setup to consistency, GymForge keeps your workflow simple: generate the plan, convert it into daily actions, then track what you complete.</p>

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
              <div className="tracker-showcase">
                <motion.img
                  src="/images/todo-tracker-showcase.webp"
                  alt="GymForge daily todo tracker showing workout progress and completed habits"
                  className="tracker-showcase-image"
                  animate={prefersReducedMotion ? false : { y: [0, -10, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="tracker-showcase-panel">
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Todo Tracker</p>
                  <p className="mt-2 text-lg font-semibold text-white">See the day at a glance</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Completed habits, next actions, streaks, and progress are visible together, so the app feels like a coach and checklist in one.
                  </p>
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

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-6">
          <Reveal>
            <div className="cta-premium-card relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
              <div className="cta-premium-glow" aria-hidden="true" />
              <div className="cta-premium-grid" aria-hidden="true" />
              <div className="cta-premium-ring cta-ring-1" aria-hidden="true" />
              <div className="cta-premium-ring cta-ring-2" aria-hidden="true" />
              <div className="relative z-10">
                <p className="section-kicker mb-4">Ready to start?</p>
                <p className="text-3xl font-bold tracking-tight text-white md:text-4xl">100% Free. No credit card.<br /><span className="text-gradient-fire">No BS.</span></p>
                <p className="mx-auto mt-4 max-w-sm text-sm text-zinc-400">Join 12,400+ athletes already training smarter with GymForge.</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="hero-primary-btn hero-cta-main inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-3.5 text-sm font-semibold text-black"
                  >
                    Create Your Account →
                  </button>
                  <DownloadAppButton variant="small" />
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/6 px-4 py-8 text-sm text-zinc-500 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="font-heading text-base text-orange-400/70">GymForge <span className="text-zinc-600">— Built for athletes.</span></p>
          <div className="flex items-center gap-5">
            <a href="https://github.com/SumanKarmakar467/GYM" target="_blank" rel="noreferrer" className="landing-nav-link hover:text-orange-400 focus-visible:text-orange-400 transition-colors">GitHub</a>
            <a href="#" className="landing-nav-link hover:text-orange-400 focus-visible:text-orange-400 transition-colors">Privacy</a>
            <a href="#" className="landing-nav-link hover:text-orange-400 focus-visible:text-orange-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
