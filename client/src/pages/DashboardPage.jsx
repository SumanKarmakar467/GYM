import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../api/api";
import Reveal from "../components/Reveal";
import { SkeletonText } from "../components/Skeleton";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";
import { addDays, getStartOfWeek, toYmd } from "../utils/date";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const DashboardPage = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [stats, setStats] = useState(null);
  const [todayTodos, setTodayTodos] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedMetrics, setAnimatedMetrics] = useState({ streak: 0, completion: 0, calories: 0 });

  const weekDates = useMemo(() => {
    const start = getStartOfWeek(new Date());
    return dayLabels.map((label, index) => {
      const date = addDays(start, index);
      return { day: label, date: toYmd(date) };
    });
  }, []);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const todayKey = toYmd(new Date());
        const [statsRes, todayRes] = await Promise.all([
          api.get("/todos/stats"),
          api.get("/todos", { params: { date: todayKey } })
        ]);

        if (!active) {
          return;
        }

        const statsData = statsRes.data || {};
        setStats(statsData);
        setTodayTodos(Array.isArray(todayRes.data) ? todayRes.data : []);

        if (Array.isArray(statsData.daily) && statsData.daily.length > 0) {
          const percentByDate = new Map(statsData.daily.map((entry) => [entry.date, Number(entry.percent) || 0]));
          setWeeklyData(
            weekDates.map((item) => ({
              day: item.day,
              percent: percentByDate.get(item.date) ?? 0
            }))
          );
        } else {
          const fallbackDaily = await Promise.all(
            weekDates.map(async (item) => {
              const { data } = await api.get("/todos", { params: { date: item.date } });
              const total = data.length;
              const done = data.filter((todo) => todo.completed).length;

              return {
                day: item.day,
                percent: total > 0 ? Math.round((done / total) * 100) : 0
              };
            })
          );

          if (active) {
            setWeeklyData(fallbackDaily);
          }
        }
      } catch {
        if (active) {
          setStats({ streak: 0 });
          setTodayTodos([]);
          setWeeklyData(dayLabels.map((day) => ({ day, percent: 0 })));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [weekDates]);

  const streak = Number(stats?.streak || 0);
  const todayDone = todayTodos.filter((todo) => todo.completed).length;
  const todayPercent = todayTodos.length > 0 ? Math.round((todayDone / todayTodos.length) * 100) : 0;
  const caloriesBurned = todayDone * 45;

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setAnimatedMetrics({ streak, completion: todayPercent, calories: caloriesBurned });
      return undefined;
    }

    const start = performance.now();
    const duration = 1200;
    let frameId = null;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);

      setAnimatedMetrics({
        streak: Math.round(streak * eased),
        completion: Math.round(todayPercent * eased),
        calories: Math.round(caloriesBurned * eased)
      });

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
  }, [loading, streak, todayPercent, caloriesBurned, prefersReducedMotion]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - todayPercent / 100);
  const [ringOffset, setRingOffset] = useState(circumference);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    setRingOffset(circumference);

    if (prefersReducedMotion) {
      setRingOffset(targetOffset);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRingOffset(targetOffset);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [loading, targetOffset, circumference, prefersReducedMotion]);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <h1 className="text-3xl font-bold md:text-4xl">Welcome back, {user?.name || "Athlete"}!</h1>
        </section>

        <motion.section
          variants={containerVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? false : "show"}
          className="mt-5 grid gap-4 md:grid-cols-3"
        >
          <motion.article variants={itemVariants} className="card p-5">
            {loading ? (
              <div className="space-y-3">
                <SkeletonText width="35%" />
                <SkeletonText width="70%" />
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Streak</p>
                <p className="mt-3 text-4xl font-bold">
                  {animatedMetrics.streak} Day Streak{" "}
                  {streak > 0 ? (
                    <span style={{ display: "inline-block", animation: "pulse 1s ease-in-out infinite" }}>🔥</span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-textSecondary">
                  {streak === 0 ? "Start your streak today!" : "Momentum looks strong."}
                </p>
              </>
            )}
          </motion.article>

          <motion.article variants={itemVariants} className="card p-5">
            {loading ? (
              <div className="space-y-3">
                <SkeletonText width="35%" />
                <SkeletonText width="70%" />
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Completion</p>
                <p className="mt-3 text-4xl font-bold">{animatedMetrics.completion}%</p>
                <p className="mt-2 text-sm text-textSecondary">Today task completion rate.</p>
              </>
            )}
          </motion.article>

          <motion.article variants={itemVariants} className="card p-5">
            {loading ? (
              <div className="space-y-3">
                <SkeletonText width="35%" />
                <SkeletonText width="70%" />
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Calories Burned</p>
                <p className="mt-3 text-4xl font-bold">{animatedMetrics.calories}</p>
                <p className="mt-2 text-sm text-textSecondary">Estimated from completed workouts.</p>
              </>
            )}
          </motion.article>
        </motion.section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_320px]">
          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Weekly Completion</p>
            {loading ? (
              <div className="mt-4 h-[300px] animate-pulse rounded-xl bg-white/10" />
            ) : (
              <Reveal>
                <div className="mt-4 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} axisLine={false} />
                      <YAxis
                        domain={[0, 100]}
                        tickCount={6}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Completion"]}
                        contentStyle={{ background: "#101010", border: "1px solid #2a2a2a", borderRadius: "10px" }}
                      />
                      <Bar
                        dataKey="percent"
                        fill="#f97316"
                        radius={[6, 6, 0, 0]}
                        animationDuration={prefersReducedMotion ? 0 : 1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Reveal>
            )}
          </article>

          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Today Ring</p>
            {loading ? (
              <div className="mt-4 h-52 animate-pulse rounded-xl bg-white/10" />
            ) : (
              <div className="mt-4 grid place-items-center">
                <div className="relative">
                  <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                    <circle cx="66" cy="66" r={radius} stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
                    <circle
                      className="ring-progress"
                      cx="66"
                      cy="66"
                      r={radius}
                      stroke="#f97316"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <p className="text-2xl font-bold">{todayPercent}% today</p>
                    <p className="text-xs text-textSecondary">{todayDone}/{todayTodos.length} done</p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-brandSecondary">Quick Actions</p>
            <div className="mt-3 grid gap-3">
              <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}>
                <Link to="/todos" className="btn-ghost block text-center focus-visible:scale-[1.04] focus-visible:ring-2 focus-visible:ring-orange-400">+ Add Todo</Link>
              </motion.div>
              <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}>
                <Link to="/workout" className="btn-ghost block text-center focus-visible:scale-[1.04] focus-visible:ring-2 focus-visible:ring-orange-400">Workout</Link>
              </motion.div>
              <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}>
                <Link to="/wallpaper" className="btn-ghost block text-center focus-visible:scale-[1.04] focus-visible:ring-2 focus-visible:ring-orange-400">Wallpaper</Link>
              </motion.div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
