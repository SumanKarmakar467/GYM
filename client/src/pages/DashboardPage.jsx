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
import { SkeletonText } from "../components/Skeleton";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";
import { addDays, getStartOfWeek, toYmd } from "../utils/date";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayTodos, setTodayTodos] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - todayPercent / 100);

  return (
    <div className="page-enter min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <h1 className="text-3xl font-bold md:text-4xl">Welcome back, {user?.name || "Athlete"} 👋</h1>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <article className="card p-5">
            {loading ? (
              <div className="space-y-3">
                <SkeletonText width="35%" />
                <SkeletonText width="70%" />
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Consistency</p>
                <p className="mt-3 text-4xl font-bold">🔥 {streak} Day Streak</p>
                <p className="mt-2 text-sm text-textSecondary">
                  {streak === 0 ? "Start your streak today!" : "Keep forging momentum."}
                </p>
              </>
            )}
          </article>

          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Weekly Completion</p>
            {loading ? (
              <div className="mt-4 h-[270px] animate-pulse rounded-xl bg-white/10" />
            ) : (
              <div className="mt-4 h-[270px]">
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
                    <Bar dataKey="percent" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Today Completion</p>
            {loading ? (
              <div className="mt-4 h-48 animate-pulse rounded-xl bg-white/10" />
            ) : (
              <div className="mt-4 grid place-items-center">
                <div className="relative">
                  <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                    <circle cx="66" cy="66" r={radius} stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
                    <circle
                      cx="66"
                      cy="66"
                      r={radius}
                      stroke="#f97316"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: "stroke-dashoffset 0.35s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <p className="text-2xl font-bold">{todayPercent}% today</p>
                    <p className="text-xs text-textSecondary">{todayDone}/{todayTodos.length} done</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Quick Actions</p>
            {loading ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded-xl bg-white/10" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Link to="/todos" className="btn-ghost text-center">➕ Add Todo</Link>
                <Link to="/workout" className="btn-ghost text-center">🏋️ View Workout</Link>
                <Link to="/wallpaper" className="btn-ghost text-center">🖼️ Wallpaper</Link>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
