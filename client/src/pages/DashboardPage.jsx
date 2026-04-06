import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";

const dayCodes = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toYmd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getStartOfWeek = (base = new Date()) => {
  const copy = new Date(base);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const buildWeek = () => {
  const start = getStartOfWeek(new Date());
  return dayCodes.map((code, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      code,
      date: toYmd(date)
    };
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "GF";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("workout");
  const [selectedDay, setSelectedDay] = useState(dayCodes[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  const [plan, setPlan] = useState(null);
  const [todayTodos, setTodayTodos] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [todoText, setTodoText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayDate = useMemo(() => toYmd(new Date()), []);
  const week = useMemo(() => buildWeek(), []);

  const fetchTodos = async () => {
    const [todayResponse, allResponse] = await Promise.all([
      api.get("/todos", { params: { date: todayDate } }),
      api.get("/todos")
    ]);

    setTodayTodos(todayResponse.data);
    setAllTodos(allResponse.data);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const planResponse = await api.get("/workout/me").catch(() => null);
      setPlan(planResponse?.data || null);
      await fetchTodos();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const addTodo = async () => {
    if (!todoText.trim()) return;

    await api.post("/todos", { text: todoText.trim(), date: todayDate });
    setTodoText("");
    await fetchTodos();
  };

  const toggleTodo = async (todo) => {
    await api.patch(`/todos/${todo._id}`, { done: !todo.done });
    await fetchTodos();
  };

  const removeTodo = async (todoId) => {
    await api.delete(`/todos/${todoId}`);
    await fetchTodos();
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const dayPlan = plan?.weekPlan?.find((item) => item.day === selectedDay) || null;

  const weeklyProgress = week.map((item) => {
    const dayTodos = allTodos.filter((todo) => todo.date === item.date);
    const completed = dayTodos.filter((todo) => todo.done).length;
    const percent = dayTodos.length ? Math.round((completed / dayTodos.length) * 100) : 0;

    return {
      ...item,
      percent,
      completed,
      total: dayTodos.length
    };
  });

  const streakDays = new Set(allTodos.filter((todo) => todo.done).map((todo) => todo.date));
  const sortedTodayTodos = [...todayTodos].sort((a, b) => Number(a.done) - Number(b.done));

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-zinc-200">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen px-5 py-7 sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              <h1 className="mt-1 font-heading text-5xl">GYMFORGE DASHBOARD</h1>
            </div>
            <div className="profile-badge">
              <span className="avatar-mini">{getInitials(user?.name)}</span>
              <div>
                <p className="text-sm text-zinc-400">Logged in as</p>
                <p className="text-base text-zinc-100">{user?.name}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("workout")}
              className={activeTab === "workout" ? "tab-btn tab-btn-active" : "tab-btn"}
            >
              Workout Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("todos")}
              className={activeTab === "todos" ? "tab-btn tab-btn-active" : "tab-btn"}
            >
              To-Do List
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={activeTab === "profile" ? "tab-btn tab-btn-active" : "tab-btn"}
            >
              Profile
            </button>
          </div>
        </header>

        {error ? <p className="rounded-xl border border-rose-700/60 bg-rose-900/20 p-3 text-sm text-rose-300">{error}</p> : null}

        {activeTab === "workout" ? (
          <section className="rounded-3xl border border-white/10 bg-surface p-6">
            <h2 className="font-heading text-4xl text-gold">
              {plan?.goal ? `${plan.goal.toUpperCase()} PROGRAM` : "WORKOUT PLAN"}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {dayCodes.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={day === selectedDay ? "day-chip day-chip-active" : "day-chip"}
                >
                  {day}
                </button>
              ))}
            </div>

            {!plan ? (
              <p className="mt-5 text-zinc-400">No generated plan yet. Complete onboarding to generate your plan.</p>
            ) : !dayPlan ? (
              <p className="mt-5 text-zinc-400">No exercises available for this day.</p>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-card px-4 py-3">
                  <p className="text-sm text-zinc-400">{dayPlan.day}</p>
                  <p className="font-heading text-3xl">{dayPlan.name}</p>
                  <p className="text-zinc-400">{dayPlan.muscles}</p>
                </div>

                {dayPlan.exercises.map((exercise, index) => (
                  <article
                    key={`${exercise.name}-${index}`}
                    className="rounded-2xl border border-white/10 border-l-4 bg-card p-4"
                    style={{ borderLeftColor: "var(--fire)" }}
                  >
                    <h3 className="font-heading text-3xl text-zinc-100">{exercise.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">Muscle Group: {exercise.muscle}</p>
                    <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
                      <p>Sets: {exercise.sets}</p>
                      <p>Reps: {exercise.reps}</p>
                      <p>Rest: {exercise.rest}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "todos" ? (
          <section className="rounded-3xl border border-white/10 bg-surface p-6">
            <h2 className="font-heading text-4xl">To-Do List</h2>
            <p className="mt-1 text-zinc-400">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                className="input-dark min-w-[220px] flex-1"
                placeholder="Add a task for today"
                value={todoText}
                onChange={(event) => setTodoText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTodo();
                  }
                }}
              />
              <button type="button" className="btn-primary" onClick={addTodo}>
                Add
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {sortedTodayTodos.length === 0 ? (
                <p className="text-zinc-400">No tasks yet for today.</p>
              ) : (
                sortedTodayTodos.map((todo) => (
                  <div key={todo._id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-card px-3 py-2">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo)}
                      className="h-4 w-4"
                      style={{ accentColor: "var(--fire)" }}
                    />
                    <p className={`flex-1 ${todo.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{todo.text}</p>
                    <button type="button" className="btn-delete" onClick={() => removeTodo(todo._id)}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-3xl text-gold">Weekly Progress</h3>
              <div className="mt-3 space-y-3">
                {weeklyProgress.map((item) => (
                  <div key={item.date}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.code}</span>
                      <span className="text-zinc-400">{item.percent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full"
                        style={{
                          width: `${item.percent}%`,
                          background: "linear-gradient(90deg, var(--fire), var(--gold))"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "profile" ? (
          <section className="rounded-3xl border border-white/10 bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="avatar-xl">{getInitials(user?.name)}</div>
                <div>
                  <h2 className="font-heading text-4xl">{user?.name}</h2>
                  <p className="text-zinc-400">{user?.goal || "Goal not set"}</p>
                  <p className="text-sm text-zinc-500">
                    {user?.location || "Location not set"} | {user?.level || "Level not set"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-xl border border-blue-300/40 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20"
                onClick={handleSignOut}
              >
                Logout
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <article className="stat-card">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Height</p>
                <p className="mt-1 font-heading text-4xl">{user?.height || "--"}</p>
                <p className="text-zinc-400">cm</p>
              </article>
              <article className="stat-card">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Weight</p>
                <p className="mt-1 font-heading text-4xl">{user?.weight || "--"}</p>
                <p className="text-zinc-400">kg</p>
              </article>
              <article className="stat-card">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Age</p>
                <p className="mt-1 font-heading text-4xl">{user?.age || "--"}</p>
                <p className="text-zinc-400">years</p>
              </article>
            </div>

            <div className="mt-7">
              <h3 className="font-heading text-3xl text-gold">7-Day Streak</h3>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {week.map((item) => (
                  <div
                    key={item.date}
                    className={`rounded-xl border px-2 py-3 text-center text-sm ${
                      streakDays.has(item.date)
                        ? "border-fire bg-[rgba(255,77,0,0.20)] text-zinc-100"
                        : "border-white/10 bg-card text-zinc-500"
                    }`}
                  >
                    {item.code}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPage;
