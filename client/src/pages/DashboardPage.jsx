import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";
import { addDays, getStartOfWeek, toYmd } from "../utils/date";
import { liveQueryOptions } from "../utils/realtime";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPage = () => {
  const { user } = useAuth();
  const todayKey = toYmd(new Date());

  const weekDates = useMemo(() => {
    const start = getStartOfWeek(new Date());

    return weekdays.map((label, index) => {
      const date = addDays(start, index);
      return { label, date: toYmd(date) };
    });
  }, []);

  const statsQuery = useQuery({
    queryKey: ["todo-stats"],
    queryFn: async () => {
      const { data } = await api.get("/todos/stats");
      return data;
    },
    ...liveQueryOptions
  });

  const todayTodosQuery = useQuery({
    queryKey: ["todos", todayKey],
    queryFn: async () => {
      const { data } = await api.get("/todos", { params: { date: todayKey } });
      return data;
    },
    ...liveQueryOptions
  });

  const fallbackWeeklyQuery = useQuery({
    queryKey: ["weekly-completion-fallback", weekDates[0]?.date],
    enabled: statsQuery.isSuccess && (!Array.isArray(statsQuery.data?.daily) || statsQuery.data.daily.length === 0),
    queryFn: async () => {
      const byDay = await Promise.all(
        weekDates.map(async (item) => {
          const { data } = await api.get("/todos", { params: { date: item.date } });
          const total = data.length;
          const completed = data.filter((todo) => todo.completed).length;

          return {
            day: item.label,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0
          };
        })
      );

      return byDay;
    }
  });

  const weeklyData = useMemo(() => {
    if (Array.isArray(statsQuery.data?.daily) && statsQuery.data.daily.length > 0) {
      const percentByDate = new Map(statsQuery.data.daily.map((entry) => [entry.date, Number(entry.percent) || 0]));
      return weekDates.map((item) => ({ day: item.label, percent: percentByDate.get(item.date) ?? 0 }));
    }

    if (fallbackWeeklyQuery.data?.length) {
      return fallbackWeeklyQuery.data;
    }

    return weekdays.map((label) => ({ day: label, percent: 0 }));
  }, [statsQuery.data?.daily, fallbackWeeklyQuery.data, weekDates]);

  const streak = Number(statsQuery.data?.streak || 0);
  const todayTotal = todayTodosQuery.data?.length || 0;
  const todayDone = (todayTodosQuery.data || []).filter((todo) => todo.completed).length;
  const todayPercent = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - todayPercent / 100);

  const chartLoading = statsQuery.isLoading || fallbackWeeklyQuery.isLoading;
  const allSectionsLoading = statsQuery.isLoading || todayTodosQuery.isLoading || chartLoading;

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <h1 className="text-3xl font-bold md:text-4xl">Welcome back, {user?.name || "Athlete"} 👋</h1>
          <p className="mt-2 text-textSecondary">Your latest consistency and completion insights.</p>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <article className="card p-5">
            {statsQuery.isLoading ? (
              <div className="animate-pulse">
                <div className="h-5 w-32 rounded bg-white/10" />
                <div className="mt-4 h-12 w-40 rounded bg-white/10" />
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Consistency</p>
                <p className="mt-3 text-4xl font-bold">🔥 {streak} Day Streak</p>
                <p className="mt-2 text-sm text-textSecondary">
                  {streak === 0 ? "Start your streak today!" : "You are building unstoppable momentum."}
                </p>
              </>
            )}
          </article>

          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Weekly Completion</p>
            {chartLoading ? (
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
            {todayTodosQuery.isLoading ? (
              <div className="mt-4 h-48 animate-pulse rounded-xl bg-white/10" />
            ) : (
              <div className="mt-4 grid place-items-center">
                <div className="relative">
                  <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                    <circle cx="66" cy="66" r={ringRadius} stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
                    <circle
                      cx="66"
                      cy="66"
                      r={ringRadius}
                      stroke="#f97316"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      style={{ transition: "stroke-dashoffset 0.35s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <p className="text-2xl font-bold">{todayPercent}% today</p>
                    <p className="text-xs text-textSecondary">{todayDone}/{todayTotal} done</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">Quick Actions</p>
            {allSectionsLoading ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded-xl bg-white/10" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Link to="/tracker" className="btn-ghost text-center">➕ Add Todo</Link>
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
