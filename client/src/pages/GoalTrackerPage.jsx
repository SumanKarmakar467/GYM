import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import ExerciseCard from "../components/workout/ExerciseCard";
import ProgressRing from "../components/workout/ProgressRing";
import StreakCounter from "../components/workout/StreakCounter";
import { addDays, getStartOfWeek, toYmd } from "../utils/date";
import { liveQueryOptions } from "../utils/realtime";

const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GoalTrackerPage = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(toYmd(new Date()));

  const weekDates = useMemo(() => {
    const start = getStartOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(start, index);
      return {
        label: weekday[index],
        date: toYmd(date)
      };
    });
  }, []);

  const todosQuery = useQuery({
    queryKey: ["todos", selectedDate],
    queryFn: async () => {
      const { data } = await api.get("/todos", { params: { date: selectedDate } });
      return data;
    },
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

  const toggleMutation = useMutation({
    mutationFn: async (todo) => api.patch(`/todos/${todo._id}`, { completed: !todo.completed }),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: ["todos", selectedDate] });
      const previousTodos = queryClient.getQueryData(["todos", selectedDate]);

      queryClient.setQueryData(["todos", selectedDate], (current = []) =>
        current.map((item) => (item._id === todo._id ? { ...item, completed: !item.completed } : item))
      );

      return { previousTodos };
    },
    onError: (_error, _todo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", selectedDate], context.previousTodos);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos", selectedDate] });
      await queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["todo-streak"] });
    }
  });

  useEffect(() => {
    if (statsQuery.data?.percent === 100) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
    }
  }, [statsQuery.data?.percent]);

  const dailyMap = new Map((statsQuery.data?.daily || []).map((entry) => [entry.date, entry]));
  const today = toYmd(new Date());

  const getStatusClass = (date) => {
    const day = dailyMap.get(date);

    if (date > today) return "border-zinc-700 bg-zinc-900/30 text-zinc-500";
    if (!day || day.total === 0) return "border-zinc-700 bg-zinc-900/30 text-zinc-400";
    if (day.percent === 100) return "border-emerald-500/70 bg-emerald-500/15 text-emerald-100";
    if (day.percent > 0) return "border-amber-500/70 bg-amber-500/15 text-amber-100";
    return "border-rose-500/70 bg-rose-500/15 text-rose-100";
  };

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Goal Tracker</h1>
              <p className="text-textSecondary">Track each exercise and keep your streak alive.</p>
            </div>
            <ProgressRing percent={statsQuery.data?.percent || 0} label="this week" />
            <StreakCounter streak={streakQuery.data?.streak || 0} />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-7">
          {weekDates.map((item) => (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedDate(item.date)}
              className={`rounded-xl border px-2 py-3 text-center text-sm ${getStatusClass(item.date)} ${
                selectedDate === item.date ? "ring-2 ring-brandPrimary" : ""
              } ${item.date === today ? "border-brandPrimary" : ""}`}
            >
              <p>{item.label}</p>
            </button>
          ))}
        </section>

        <section className="mt-5 space-y-3">
          {(todosQuery.data || []).length === 0 ? (
            <div className="card p-6 text-center text-textSecondary">No exercises scheduled for this date.</div>
          ) : (
            (todosQuery.data || []).map((todo) => (
              <ExerciseCard
                key={todo._id}
                exercise={{ exerciseName: todo.exerciseName }}
                checked={todo.completed}
                onToggle={() => toggleMutation.mutate(todo)}
                showNote={false}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default GoalTrackerPage;
