import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import ProgressRing from "../components/workout/ProgressRing";
import StreakCounter from "../components/workout/StreakCounter";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { getExerciseDateMap, getTodayWorkoutRoute } from "../utils/plan";
import { toYmd } from "../utils/date";
import { liveQueryOptions } from "../utils/realtime";

const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const planQuery = useQuery({
    queryKey: ["plan"],
    queryFn: async () => {
      const { data } = await api.get("/workout/me");
      return data;
    },
    retry: false,
    ...liveQueryOptions
  });

  const statsQuery = useQuery({
    queryKey: ["todo-stats"],
    queryFn: async () => {
      const { data } = await api.get("/todos/stats");
      return data;
    },
    ...liveQueryOptions
  });

  const streakQuery = useQuery({
    queryKey: ["todo-streak"],
    queryFn: async () => {
      const { data } = await api.get("/todos/streak");
      return data;
    },
    ...liveQueryOptions
  });

  const plan = planQuery.data;
  const todayRoute = getTodayWorkoutRoute(plan);

  let todayFocus = "No plan generated yet";

  if (plan?.weeks?.length) {
    const dateMap = getExerciseDateMap(plan);
    const today = toYmd(new Date());

    for (const [key, date] of dateMap.entries()) {
      if (date === today) {
        const [weekNum, dayNum] = key.split("-").map(Number);
        const week = plan.weeks.find((item) => item.weekNumber === weekNum);
        const day = week?.days?.[dayNum - 1];
        todayFocus = day?.focus || todayFocus;
      }
    }
  }

  useEffect(() => {
    if (planQuery.isError) {
      addToast("No plan found yet. Complete onboarding to generate one.", "info");
    }
  }, [planQuery.isError, addToast]);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <p className="text-sm text-textSecondary">Welcome back, {user?.name || "Athlete"}</p>
          <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">
            Welcome back, {user?.name || "Athlete"}
          </h1>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card p-4">
              <StreakCounter streak={streakQuery.data?.streak || 0} />
            </div>
            <div className="card p-4">
              <ProgressRing percent={statsQuery.data?.percent || 0} label="weekly completion" />
            </div>
            <div className="card p-4">
              <p className="font-heading text-sm uppercase tracking-wide text-brandSecondary">Days Remaining</p>
              <p className="mt-3 font-display text-6xl text-brandPrimary">{Math.max((plan?.durationWeeks || 0) * 7 - (statsQuery.data?.completed || 0), 0)}</p>
              <p className="text-sm text-textSecondary">estimated sessions left</p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brandSecondary">Today</p>
            <h2 className="mt-2 text-2xl font-semibold">Continue Today&apos;s Workout</h2>
            <p className="mt-2 text-textSecondary">Focus: {todayFocus}</p>
            <div className="mt-5">
              {todayRoute ? (
                <Link to={todayRoute} className="btn-primary">
                  Continue Session
                </Link>
              ) : (
                <Link to="/onboarding" className="btn-primary">
                  Start Onboarding
                </Link>
              )}
            </div>
          </article>

          <article className="card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brandSecondary">Your Plan</p>
            <h2 className="mt-2 text-2xl font-semibold">{plan?.planName || "No Plan Yet"}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan ? (
                <>
                  <span className="badge">{plan.durationWeeks} weeks</span>
                  <span className="badge">{plan.goal}</span>
                  <span className="badge">{plan.environment}</span>
                </>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/plan" className="btn-ghost">
                View Full Plan
              </Link>
              <Link to="/tracker" className="btn-ghost">
                Track Today
              </Link>
              <Link to="/onboarding" className="btn-ghost">
                Edit Goals
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
