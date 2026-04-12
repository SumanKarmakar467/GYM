import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import AppNavbar from "../components/layout/AppNavbar";
import { addDays, getStartOfWeek, toYmd } from "../utils/date";

const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];

const TodoListPage = () => {
  const todayKey = toYmd(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [weekStatus, setWeekStatus] = useState({});
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const weekDates = useMemo(() => {
    const start = getStartOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(start, index);
      const key = toYmd(date);
      return {
        key,
        date,
        letter: dayLetters[index]
      };
    });
  }, []);

  const fetchTodosByDate = async (date) => {
    const { data } = await api.get("/todos", { params: { date } });
    return Array.isArray(data) ? data : [];
  };

  const refreshWeekStatus = async () => {
    setLoadingWeek(true);
    try {
      const byDay = await Promise.all(
        weekDates.map(async (item) => {
          const list = await fetchTodosByDate(item.key);
          const total = list.length;
          const completed = list.filter((todo) => todo.completed).length;
          return [item.key, { total, completed }];
        })
      );

      setWeekStatus(Object.fromEntries(byDay));
    } finally {
      setLoadingWeek(false);
    }
  };

  const refreshTodosForDate = async (date) => {
    setLoadingTodos(true);
    try {
      const list = await fetchTodosByDate(date);
      setTodos(list);
    } finally {
      setLoadingTodos(false);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [statusEntries, selectedTodos] = await Promise.all([
          Promise.all(
            weekDates.map(async (item) => {
              const list = await fetchTodosByDate(item.key);
              const total = list.length;
              const completed = list.filter((todo) => todo.completed).length;
              return [item.key, { total, completed }];
            })
          ),
          fetchTodosByDate(todayKey)
        ]);

        if (!active) {
          return;
        }

        setWeekStatus(Object.fromEntries(statusEntries));
        setTodos(selectedTodos);
      } finally {
        if (active) {
          setLoadingWeek(false);
          setLoadingTodos(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [todayKey, weekDates]);

  const onSelectDate = async (date) => {
    setSelectedDate(date);
    await refreshTodosForDate(date);
  };

  const getPillClass = (date) => {
    if (date > todayKey) {
      return "border-zinc-700 bg-zinc-900/30 text-zinc-400";
    }

    const status = weekStatus[date];
    const hasTodos = Number(status?.total || 0) > 0;
    const allDone = hasTodos && status.completed === status.total;

    if (date < todayKey) {
      if (!hasTodos) {
        return "border-zinc-700 bg-zinc-900/30 text-zinc-400";
      }
      return allDone
        ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-100"
        : "border-rose-500/70 bg-rose-500/20 text-rose-100";
    }

    if (!hasTodos) {
      return "border-brandPrimary/60 bg-brandPrimary/10 text-white";
    }

    return allDone
      ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-100"
      : "border-rose-500/70 bg-rose-500/20 text-rose-100";
  };

  const createTodo = async (event) => {
    event.preventDefault();
    const exerciseName = newTodo.trim();
    if (!exerciseName || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/todos", { date: selectedDate, exerciseName });
      setNewTodo("");
      await Promise.all([refreshTodosForDate(selectedDate), refreshWeekStatus()]);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTodo = async (todo) => {
    await api.patch(`/todos/${todo._id}`, { completed: !todo.completed });
    await Promise.all([refreshTodosForDate(selectedDate), refreshWeekStatus()]);
  };

  const deleteTodo = async (todoId) => {
    await api.delete(`/todos/${todoId}`);
    await Promise.all([refreshTodosForDate(selectedDate), refreshWeekStatus()]);
  };

  return (
    <div className="page-enter min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-5xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-6">
          <h1 className="text-3xl font-bold">Todo Tracker</h1>
          <p className="mt-2 text-sm text-textSecondary">Pick a day and stay accountable.</p>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {weekDates.map((item) => (
              <button
                key={item.key}
                type="button"
                disabled={loadingWeek}
                onClick={() => onSelectDate(item.key)}
                className={`rounded-xl border px-1 py-2 text-center ${getPillClass(item.key)} ${
                  selectedDate === item.key ? "ring-2 ring-brandPrimary" : ""
                } ${item.key === todayKey ? "border-brandPrimary" : ""}`}
              >
                <p className="text-xs font-semibold">{item.letter}</p>
                <p className="mt-1 text-sm">{item.date.getDate()}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {loadingTodos ? (
            [1, 2, 3].map((item) => <div key={item} className="card h-14 animate-pulse bg-white/5" />)
          ) : todos.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No todos for this day. Add one below."
              subtitle="Start small and keep your streak alive."
              ctaLabel=""
              ctaLink=""
            />
          ) : (
            todos.map((todo) => (
              <article key={todo._id} className="card flex items-center justify-between gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggleTodo(todo)}
                  className="flex items-center gap-3 text-left"
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${
                      todo.completed ? "border-emerald-400 bg-emerald-500 text-black" : "border-borderSubtle"
                    }`}
                  >
                    {todo.completed ? "✓" : ""}
                  </span>
                  <span className={todo.completed ? "text-textSecondary line-through" : "text-white"}>
                    {todo.exerciseName}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteTodo(todo._id)}
                  className="rounded-lg border border-rose-500/60 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </section>

        <section className="card mt-5 p-4">
          <form onSubmit={createTodo} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newTodo}
              onChange={(event) => setNewTodo(event.target.value)}
              className="input-field"
              placeholder="Add a todo for selected day..."
            />
            <button type="submit" className="btn-primary sm:w-auto" disabled={submitting}>
              {submitting ? "Adding..." : "Add Todo"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default TodoListPage;
