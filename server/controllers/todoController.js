import TodoItem from "../models/TodoItem.js";

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfWeek = (date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const getTodos = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.date) {
      filter.date = String(req.query.date);
    }

    const todos = await TodoItem.find(filter).sort({ date: 1, weekNum: 1, dayNum: 1, exerciseIndex: 1 });
    return res.json(todos);
  } catch {
    return res.status(500).json({ message: "Failed to fetch todos." });
  }
};

export const createTodo = async (req, res) => {
  try {
    const date = String(req.body?.date || "");
    const exerciseName = String(req.body?.exerciseName || "").trim();

    if (!date || !exerciseName) {
      return res.status(400).json({ message: "date and exerciseName are required." });
    }

    const todo = await TodoItem.create({
      userId: req.user._id,
      date,
      weekNum: Number(req.body?.weekNum) || 1,
      dayNum: Number(req.body?.dayNum) || 1,
      exerciseId: String(req.body?.exerciseId || `custom-${Date.now()}`),
      exerciseName,
      exerciseIndex: Number(req.body?.exerciseIndex) || 0,
      completed: false,
      completedAt: null
    });

    return res.status(201).json(todo);
  } catch {
    return res.status(500).json({ message: "Failed to create todo." });
  }
};

export const toggleTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findOne({ _id: req.params.id, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    const targetCompleted =
      typeof req.body?.completed === "boolean" ? req.body.completed : !todo.completed;

    todo.completed = targetCompleted;
    todo.completedAt = targetCompleted ? new Date() : null;
    await todo.save();

    return res.json(todo);
  } catch {
    return res.status(500).json({ message: "Failed to update todo." });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const deleted = await TodoItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found." });
    }

    return res.json({ message: "Todo deleted." });
  } catch {
    return res.status(500).json({ message: "Failed to delete todo." });
  }
};

export const getTodoStats = async (req, res) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekDates = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + idx);
      return toYmd(date);
    });

    const todos = await TodoItem.find({ userId: req.user._id, date: { $in: weekDates } });

    const daily = weekDates.map((date) => {
      const items = todos.filter((todo) => todo.date === date);
      const completed = items.filter((todo) => todo.completed).length;
      const percent = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

      return {
        date,
        total: items.length,
        completed,
        percent
      };
    });

    const total = todos.length;
    const completedTotal = todos.filter((todo) => todo.completed).length;

    return res.json({
      total,
      completed: completedTotal,
      percent: total > 0 ? Math.round((completedTotal / total) * 100) : 0,
      daily
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch todo stats." });
  }
};

export const getTodoStreak = async (req, res) => {
  try {
    const completedTodos = await TodoItem.find({ userId: req.user._id, completed: true }).sort({ date: -1 });
    const completedDates = Array.from(new Set(completedTodos.map((todo) => todo.date))).sort((a, b) =>
      a > b ? -1 : 1
    );

    if (completedDates.length === 0) {
      return res.json({ streak: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayYmd = toYmd(today);
    let cursor = new Date(today);

    if (!completedDates.includes(todayYmd)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;

    while (true) {
      const key = toYmd(cursor);
      if (!completedDates.includes(key)) {
        break;
      }

      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return res.json({ streak });
  } catch {
    return res.status(500).json({ message: "Failed to fetch streak." });
  }
};