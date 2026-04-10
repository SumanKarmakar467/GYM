import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import ExerciseCard from "../components/workout/ExerciseCard";
import useToast from "../hooks/useToast";
import { buildExerciseGuide } from "../utils/exerciseGuide";
import { getExerciseDateMap } from "../utils/plan";
import { liveQueryOptions } from "../utils/realtime";

const WorkoutDetailPage = () => {
  const { weekNum, dayNum } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showGuide, setShowGuide] = useState(false);

  const weekNumber = Number(weekNum);
  const dayNumber = Number(dayNum);

  const planQuery = useQuery({
    queryKey: ["plan"],
    queryFn: async () => {
      const { data } = await api.get("/workout/me");
      return data;
    },
    ...liveQueryOptions
  });

  const dateForDay = useMemo(() => {
    if (!planQuery.data) return null;
    const map = getExerciseDateMap(planQuery.data);
    return map.get(`${weekNumber}-${dayNumber}`) || null;
  }, [planQuery.data, weekNumber, dayNumber]);

  const todosQuery = useQuery({
    queryKey: ["todos", dateForDay],
    enabled: Boolean(dateForDay),
    queryFn: async () => {
      const { data } = await api.get("/todos", { params: { date: dateForDay } });
      return data;
    },
    ...liveQueryOptions
  });

  const workoutDemosQuery = useQuery({
    queryKey: ["workout-demos"],
    queryFn: async () => {
      const { data } = await api.get("/media/workout-demos");
      return data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (todo) => api.patch(`/todos/${todo._id}`, { completed: !todo.completed }),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: ["todos", dateForDay] });
      const previousTodos = queryClient.getQueryData(["todos", dateForDay]);

      queryClient.setQueryData(["todos", dateForDay], (current = []) =>
        current.map((item) => (item._id === todo._id ? { ...item, completed: !item.completed } : item))
      );

      return { previousTodos };
    },
    onError: (_error, _todo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", dateForDay], context.previousTodos);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos", dateForDay] });
      await queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["todo-streak"] });
    }
  });

  const plan = planQuery.data;
  const week = plan?.weeks?.find((item) => item.weekNumber === weekNumber);
  const day = week?.days?.[dayNumber - 1];
  const exerciseGuides = useMemo(
    () => (day?.exercises || []).map((exercise) => buildExerciseGuide(exercise)),
    [day]
  );
  const workoutDemos = workoutDemosQuery.data?.demos || {};

  const todosByName = new Map((todosQuery.data || []).map((todo) => [todo.exerciseName, todo]));

  const markAllComplete = async () => {
    const pending = (todosQuery.data || []).filter((todo) => !todo.completed);

    if (pending.length === 0) {
      addToast("All exercises already completed.", "success");
      return;
    }

    await Promise.all(pending.map((todo) => api.patch(`/todos/${todo._id}`, { completed: true })));
    await queryClient.invalidateQueries({ queryKey: ["todos", dateForDay] });
    await queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
    await queryClient.invalidateQueries({ queryKey: ["todo-streak"] });
    addToast("Great job. Session marked complete.", "success");
  };

  if (planQuery.isLoading) {
    return <div className="grid min-h-screen place-items-center">Loading workout...</div>;
  }

  if (!day) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="mx-auto mt-8 max-w-3xl px-4 text-center">
          <p>Workout day not found.</p>
          <Link to="/plan" className="btn-primary mt-4 inline-flex">
            Back to Plan
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">
            Week {weekNumber} / Day {dayNumber}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{day.dayName} - {day.focus}</h1>
          <p className="mt-2 text-textSecondary">Warm-up: {day.warmup}</p>
          <p className="mt-2 text-xs font-mono uppercase tracking-[0.2em] text-brandSecondary">Live tracking active</p>
          <button
            type="button"
            className="btn-ghost mt-4"
            onClick={() => setShowGuide((prev) => !prev)}
          >
            {showGuide ? "Hide Workout Guide" : "How To Do This Workout"}
          </button>
        </section>

        {showGuide ? (
          <section className="mt-4 card p-5 md:p-6">
            <h2 className="text-xl font-semibold text-brandSecondary">Workout Technique Guide</h2>
            <p className="mt-2 text-sm text-textSecondary">
              Follow these cues for safer, cleaner reps. Start light and prioritize form.
            </p>

            <div className="mt-4 space-y-3">
              {exerciseGuides.map((guide) => (
                <article key={guide.name} className="rounded-xl border border-borderSubtle bg-bgSecondary p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">{guide.name}</h3>
                    <span className="rounded-full border border-borderSubtle bg-black/25 px-2 py-1 text-xs text-brandSecondary">
                      Animated In-App Demo
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-brandSecondary">{guide.label}</p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-borderSubtle bg-black/25">
                    <video
                      className="h-48 w-full object-cover"
                      src={(workoutDemos[guide.category] || workoutDemos.general)?.videoUrl}
                      poster={(workoutDemos[guide.category] || workoutDemos.general)?.posterImageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      preload="metadata"
                    />
                  </div>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-textSecondary">
                    {guide.steps.map((step) => (
                      <li key={`${guide.name}-${step}`}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-textSecondary">
                    Key cues: {guide.cues.join(" ")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-4 space-y-3">
          {day.exercises.map((exercise) => {
            const todo = todosByName.get(exercise.name);
            return (
              <ExerciseCard
                key={exercise.name}
                exercise={exercise}
                checked={Boolean(todo?.completed)}
                onToggle={() => {
                  if (todo) {
                    toggleMutation.mutate(todo);
                  }
                }}
              />
            );
          })}
        </section>

        <button type="button" className="btn-primary mt-5 w-full" onClick={markAllComplete}>
          Mark All Complete
        </button>

        <section className="mt-5 card p-4">
          <p className="text-sm text-textSecondary">Cool-down</p>
          <p className="mt-1">{day.cooldown}</p>
        </section>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate(`/workout/${weekNumber}/${Math.max(dayNumber - 1, 1)}`)}
          >
            Prev Day
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate(`/workout/${weekNumber}/${Math.min(dayNumber + 1, 7)}`)}
          >
            Next Day
          </button>
        </div>
      </main>
    </div>
  );
};

export default WorkoutDetailPage;
