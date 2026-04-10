import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import { getTodayWorkoutRoute } from "../utils/plan";
import { liveQueryOptions } from "../utils/realtime";

const PlanPage = () => {
  const [openWeek, setOpenWeek] = useState(1);

  const planQuery = useQuery({
    queryKey: ["plan"],
    queryFn: async () => {
      const { data } = await api.get("/workout/me");
      return data;
    },
    retry: false,
    ...liveQueryOptions
  });

  if (planQuery.isLoading) {
    return <div className="grid min-h-screen place-items-center">Loading plan...</div>;
  }

  if (planQuery.isError || !planQuery.data) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="mx-auto mt-8 w-full max-w-4xl px-4 text-center md:px-6">
          <div className="card p-8">
            <h1 className="text-3xl font-semibold">No Plan Found</h1>
            <p className="mt-2 text-textSecondary">Generate your AI plan to begin tracking sessions.</p>
            <Link to="/onboarding" className="btn-primary mt-6 inline-flex">
              Generate Your Plan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const plan = planQuery.data;
  const todayRoute = getTodayWorkoutRoute(plan);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <h1 className="text-3xl font-bold">{plan.planName}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="badge">{plan.goal}</span>
            <span className="badge">{plan.environment}</span>
            <span className="badge">{plan.durationWeeks} weeks</span>
          </div>

          {todayRoute ? (
            <Link to={todayRoute} className="btn-primary mt-5 inline-flex" style={{ animation: "pulseGlow 1.6s infinite" }}>
              Start Today
            </Link>
          ) : null}
        </section>

        <section className="mt-5 space-y-3">
          {plan.weeks.map((week) => (
            <article key={week.weekNumber} className="card overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5"
                onClick={() => setOpenWeek((prev) => (prev === week.weekNumber ? 0 : week.weekNumber))}
              >
                <div>
                  <p className="font-heading text-lg">Week {week.weekNumber}</p>
                  <p className="text-sm text-textSecondary">{week.theme}</p>
                </div>
                <span className="text-brandSecondary">{openWeek === week.weekNumber ? "-" : "+"}</span>
              </button>

              {openWeek === week.weekNumber ? (
                <div className="border-t border-borderSubtle px-5 py-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {week.days.map((day, index) => (
                      <Link
                        key={`${week.weekNumber}-${day.dayName}`}
                        to={`/workout/${week.weekNumber}/${index + 1}`}
                        className="rounded-xl border border-borderSubtle bg-bgSecondary p-4 transition hover:-translate-y-0.5 hover:border-brandPrimary hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                      >
                        <p className="font-heading text-base">{day.dayName}</p>
                        <p className="text-sm text-textSecondary">{day.focus}</p>
                        <p className="mt-2 text-xs text-textSecondary">{day.exercises?.length || 0} exercises</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default PlanPage;
