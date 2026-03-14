import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useTodos from "../hooks/useTodos";
import useWorkoutPlan from "../hooks/useWorkoutPlan";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
const todayDate = new Date().toISOString().slice(0, 10);

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: plan } = useWorkoutPlan();
  const { data: todos, stats, toggleTodo } = useTodos(todayDate);

  const todayWorkout = plan?.weeklySchedule?.find((d) => d.day === todayName);
  const streak = stats?.completionPercentage === 100 ? 1 : 0;

  const markAllDone = async () => {
    const pending = todos.filter((t) => !t.completed);
    for (const todo of pending) {
      // sequential on purpose to avoid race on local refresh
      // eslint-disable-next-line no-await-in-loop
      await toggleTodo(todo._id);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="panel p-5">
          <p className="text-white/60 text-sm">{new Date().toDateString()}</p>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <article className="panel p-4 md:col-span-2">
            <h2 className="text-lg font-semibold">Today's Workout</h2>
            {todayWorkout ? (
              <>
                <p className="text-white/70 mt-2">{todayWorkout.muscleGroups.join(" + ")}</p>
                <p className="text-accent font-bold mt-1">{todayWorkout.exercises.length} exercises</p>
                <Link
                  to={`/workout/${todayWorkout.day}`}
                  className="inline-block mt-3 px-3 py-2 rounded-lg bg-accent text-black font-semibold"
                >
                  Open Detail
                </Link>
              </>
            ) : (
              <p className="text-white/60 mt-2">Generate your plan to get started.</p>
            )}
          </article>
          <article className="panel p-4">
            <h2 className="text-lg font-semibold">Quick Stats</h2>
            <p className="text-white/70 mt-2">Streak Days: {streak}</p>
            <p className="text-white/70">Completed this week: {stats?.completed || 0}</p>
            <p className="text-white/70">Weekly completion: {stats?.completionPercentage || 0}%</p>
          </article>
        </section>

        <section className="panel p-4">
          <h2 className="text-lg font-semibold mb-3">Weekly Calendar</h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {days.map((day) => {
              const isRest = day === "Sunday";
              return (
                <Link
                  key={day}
                  to={`/workout/${day}`}
                  className={`rounded-lg px-3 py-2 border text-center ${
                    isRest ? "border-white/10 bg-white/5 text-white/40" : "border-accent/40 bg-accent/10"
                  }`}
                >
                  {day.slice(0, 3)}
                </Link>
              );
            })}
          </div>
        </section>

        <Link to="/todos" className="fixed bottom-6 right-6 rounded-full bg-accent text-black font-bold px-6 py-3 shadow-lg">
          Todos
        </Link>
        <button
          onClick={markAllDone}
          className="fixed bottom-6 left-6 rounded-full bg-white text-black font-bold px-5 py-3 shadow-lg"
        >
          Mark all done
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
