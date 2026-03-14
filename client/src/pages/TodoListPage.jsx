import { useMemo, useState } from "react";
import useTodos from "../hooks/useTodos";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const todayDate = new Date().toISOString().slice(0, 10);

const getMonday = () => {
  const dt = new Date();
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(dt.setDate(diff));
};

const TodoListPage = () => {
  const { data, loading, createTodo, toggleTodo } = useTodos();
  const [filter, setFilter] = useState("Today");
  const [dayTab, setDayTab] = useState(dayNames[0]);
  const [openModal, setOpenModal] = useState(false);
  const [custom, setCustom] = useState({ exerciseName: "", day: "Monday", sets: 3, reps: "10", date: todayDate });

  const filtered = useMemo(() => {
    if (filter === "Today") return data.filter((todo) => todo.date === todayDate);
    if (filter === "This Week") {
      const weekStart = getMonday().toISOString().slice(0, 10);
      const weekEndDate = new Date(getMonday());
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      const weekEnd = weekEndDate.toISOString().slice(0, 10);
      return data.filter((todo) => todo.date >= weekStart && todo.date <= weekEnd);
    }
    if (filter === "By Day") return data.filter((todo) => todo.day === dayTab);
    return data;
  }, [filter, dayTab, data]);

  const sorted = [...filtered].sort((a, b) => Number(a.completed) - Number(b.completed));

  const addCustom = async (e) => {
    e.preventDefault();
    await createTodo(custom);
    setOpenModal(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto panel p-5">
        <h1 className="text-2xl font-bold mb-4">Workout Todo Tracker</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Today", "This Week", "By Day"].map((name) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              className={`px-3 py-1 rounded-full border ${filter === name ? "bg-accent text-black border-accent" : "border-white/15"}`}
            >
              {name}
            </button>
          ))}
        </div>

        {filter === "By Day" && (
          <div className="flex gap-1 mb-4 overflow-auto">
            {dayNames.map((day) => (
              <button
                key={day}
                onClick={() => setDayTab(day)}
                className={`px-3 py-1 rounded-lg border text-sm ${dayTab === day ? "bg-accent/20 border-accent" : "border-white/10"}`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <p className="text-5xl mb-3">🧩</p>
            <p>All done. No tasks left.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((todo) => (
              <label
                key={todo._id}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 transition ${
                  todo.completed ? "border-accent/40 bg-accent/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div>
                  <p className={todo.completed ? "line-through text-white/50" : ""}>{todo.exerciseName}</p>
                  <p className="text-xs text-white/60">
                    {todo.day} • {todo.muscleGroup || "General"} • {todo.sets} x {todo.reps}
                  </p>
                </div>
                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo._id)} />
              </label>
            ))}
          </div>
        )}

        <button onClick={() => setOpenModal(true)} className="mt-5 px-4 py-2 rounded-lg bg-accent text-black font-semibold">
          Add custom exercise
        </button>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4">
          <form onSubmit={addCustom} className="panel p-5 w-full max-w-md space-y-3">
            <h2 className="text-lg font-semibold">Custom Exercise</h2>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
              placeholder="Exercise name"
              value={custom.exerciseName}
              onChange={(e) => setCustom((p) => ({ ...p, exerciseName: e.target.value }))}
              required
            />
            <select
              className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
              value={custom.day}
              onChange={(e) => setCustom((p) => ({ ...p, day: e.target.value }))}
            >
              {dayNames.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                type="number"
                value={custom.sets}
                onChange={(e) => setCustom((p) => ({ ...p, sets: Number(e.target.value) }))}
              />
              <input
                className="rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                value={custom.reps}
                onChange={(e) => setCustom((p) => ({ ...p, reps: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpenModal(false)} className="px-3 py-2 border border-white/20 rounded-lg">
                Cancel
              </button>
              <button className="px-3 py-2 rounded-lg bg-accent text-black font-semibold">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TodoListPage;
