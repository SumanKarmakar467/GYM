import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import WallpaperGenerator from "../components/WallpaperGenerator";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";
import { demoWallpaper, getDemoTodosForDate, isDemoAthlete } from "../utils/demoUserData";
import { addDays, toYmd } from "../utils/date";

const buildProgressDays = (todos = [], days = 126) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = addDays(today, -(days - 1));
  const byDate = new Map();

  todos.forEach((todo) => {
    const key = String(todo.date || "");
    if (!key) return;
    const current = byDate.get(key) || { total: 0, completed: 0 };
    current.total += 1;
    if (todo.completed) current.completed += 1;
    byDate.set(key, current);
  });

  return Array.from({ length: days }).map((_, index) => {
    const date = addDays(start, index);
    const key = toYmd(date);
    const stats = byDate.get(key) || { total: 0, completed: 0 };
    const isPast = key < toYmd(today);
    const isToday = key === toYmd(today);
    const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const missed = stats.total > 0 && stats.completed < stats.total && isPast;
    const emptyToday = isToday && stats.total === 0;

    return {
      date: key,
      total: stats.total,
      completed: stats.completed,
      percent,
      state: stats.total === 0 ? "blank" : missed ? "missed" : percent === 100 ? "done" : "partial",
      urgent: missed || emptyToday
    };
  });
};

const buildDemoProgressTodos = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 126 }).flatMap((_, index) => {
    const key = toYmd(addDays(today, -(125 - index)));
    return getDemoTodosForDate(key);
  });
};

const WallpaperPage = () => {
  const { user } = useAuth();
  const previewRef = useRef(null);
  const demoMode = isDemoAthlete(user);
  const [quote, setQuote] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Dark");
  const [loading, setLoading] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasSavedConfig, setHasSavedConfig] = useState(false);
  const [progressDays, setProgressDays] = useState([]);

  useEffect(() => {
    let active = true;

    const loadWallpaper = async () => {
      setLoading(true);
      try {
        if (demoMode) {
          setQuote(demoWallpaper.quote);
          setSelectedStyle(demoWallpaper.style);
          setHasSavedConfig(true);
          return;
        }

        const { data } = await api.get("/wallpaper");
        if (!active) {
          return;
        }

        if (data) {
          setQuote(String(data.quote || ""));
          setSelectedStyle(String(data.style || "Dark"));
          setHasSavedConfig(true);
        } else {
          setQuote("No shortcuts. Just work.");
          setSelectedStyle("Dark");
          setHasSavedConfig(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWallpaper();

    return () => {
      active = false;
    };
  }, [demoMode]);

  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      try {
        if (demoMode) {
          if (active) setProgressDays(buildProgressDays(buildDemoProgressTodos()));
          return;
        }

        const { data } = await api.get("/todos");
        if (active) setProgressDays(buildProgressDays(Array.isArray(data) ? data : []));
      } catch {
        if (active) setProgressDays(buildProgressDays([]));
      }
    };

    loadProgress();
    const interval = window.setInterval(loadProgress, 30000);
    window.addEventListener("focus", loadProgress);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadProgress);
    };
  }, [demoMode]);

  const generateRandomQuote = async () => {
    setLoadingRandom(true);
    try {
      if (demoMode) {
        const demoQuotes = [
          "One month in. No missed Mondays.",
          "Home floor. Hard work. Real progress.",
          "Earn the streak before the day ends.",
          "Small room, big engine."
        ];
        setQuote(demoQuotes[Math.floor(Math.random() * demoQuotes.length)]);
        return;
      }

      const { data } = await api.get("/wallpaper/quote");
      setQuote(String(data?.quote || "No shortcuts. Just work."));
    } finally {
      setLoadingRandom(false);
    }
  };

  const savePreview = async () => {
    if (!quote.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (demoMode) {
        setHasSavedConfig(true);
        return;
      }

      await api.post("/wallpaper", {
        quote: quote.trim(),
        style: selectedStyle
      });
      setHasSavedConfig(true);
    } finally {
      setSaving(false);
    }
  };

  const downloadPreview = async () => {
    if (!previewRef.current || downloading) {
      return;
    }

    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "gymforge-wallpaper.png";
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Wallpaper Studio</p>
          <h1 className="mt-2 text-3xl font-bold">Motivational Wallpaper Generator</h1>
          {demoMode ? (
            <p className="mt-2 text-sm text-textSecondary">
              Saved dummy wallpaper setup for {user.email}, matching the one-month home-workout progress story.
            </p>
          ) : null}
        </section>

        <div className="mt-5">
          {loading ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
              <div className="card h-[620px] animate-pulse bg-white/5" />
              <div className="card h-[620px] animate-pulse bg-white/5" />
            </div>
          ) : (
            <>
              {!hasSavedConfig ? (
                <div className="mb-5">
                  <EmptyState
                    icon="🖼️"
                    title="No wallpaper saved yet. Create your first one."
                    subtitle="Tune your quote and style, then save a preview."
                    ctaLabel=""
                    ctaLink=""
                  />
                </div>
              ) : null}

              <WallpaperGenerator
                quote={quote}
                setQuote={setQuote}
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
                onRandomQuote={generateRandomQuote}
                onGeneratePreview={savePreview}
                onDownload={downloadPreview}
                previewRef={previewRef}
                loadingRandom={loadingRandom}
                saving={saving}
                downloading={downloading}
                progressDays={progressDays}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default WallpaperPage;
