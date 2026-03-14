import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useTodos from "../hooks/useTodos";
import useWorkoutPlan from "../hooks/useWorkoutPlan";

const WorkoutDetailPage = () => {
  const { day } = useParams();
  const { data: plan } = useWorkoutPlan();
  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: todos, createTodo, toggleTodo } = useTodos(todayDate);
  const [openExercise, setOpenExercise] = useState(null);

  const workoutDay = useMemo(
    () => plan?.weeklySchedule?.find((item) => item.day.toLowerCase() === day.toLowerCase()),
    [plan, day]
  );

  if (!workoutDay) return <div className="min-h-screen p-6 text-white">Workout not found.</div>;

  const todoMap = new Map(todos.map((todo) => [todo.exerciseName, todo]));
  const doneCount = workoutDay.exercises.filter((ex) => todoMap.get(ex.name)?.completed).length;

  const onToggle = async (exercise) => {
    const todo = todoMap.get(exercise.name);
    if (!todo) {
      await createTodo({
        exerciseName: exercise.name,
        day: workoutDay.day,
        muscleGroup: workoutDay.muscleGroups[0] || "",
        sets: exercise.sets,
        reps: exercise.reps,
        date: todayDate
      });
      return;
    }
    await toggleTodo(todo._id);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto panel p-5">
        <h1 className="text-2xl font-bold">
          {workoutDay.day} - {workoutDay.muscleGroups.join(" & ")}
        </h1>
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${(doneCount / Math.max(workoutDay.exercises.length, 1)) * 100}%` }}
          />
        </div>
        <p className="text-sm text-white/70 mt-1">
          {doneCount}/{workoutDay.exercises.length} completed
        </p>

        <div className="space-y-3 mt-5">
          {workoutDay.exercises.map((exercise, index) => {
            const done = !!todoMap.get(exercise.name)?.completed;
            const opened = openExercise === exercise.name;
            return (
              <article key={exercise.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-3 items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{exercise.name}</h2>
                    <p className="text-white/70 text-sm">
                      {exercise.sets} x {exercise.reps} • Rest {exercise.restSeconds}s
                    </p>
                    <span className="inline-block text-xs mt-1 px-2 py-1 rounded-full bg-accent/15 text-accent">Pro Tips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={done} onChange={() => onToggle(exercise)} />
                    {done && <span className="text-accent font-bold animate-pulse">✓</span>}
                  </div>
                </div>
                <button onClick={() => setOpenExercise(opened ? null : exercise.name)} className="text-sm text-accent mt-2">
                  {opened ? "Hide instructions" : "Show instructions"}
                </button>
                {opened && (
                  <div className="mt-2 text-sm text-white/80 space-y-1 animate-fade-slide-in">
                    {exercise.instructions?.map((line) => (
                      <p key={line}>• {line}</p>
                    ))}
                    {exercise.tips?.[index % exercise.tips.length] && (
                      <p className="text-accent/90">Tip: {exercise.tips[index % exercise.tips.length]}</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;
