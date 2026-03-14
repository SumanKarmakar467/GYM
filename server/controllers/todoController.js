import TodoItem from "../models/TodoItem.js";

const getMonday = (date = new Date()) => {
  const dt = new Date(date);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(dt.setDate(diff));
};

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

export const getTodos = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user._id };
    if (date) filter.date = date;
    const todos = await TodoItem.find(filter).sort({ completed: 1, createdAt: -1 });
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch todos.", error: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { exerciseName, day, muscleGroup, sets, reps, date } = req.body;
    if (!exerciseName || !day || !date) {
      return res.status(400).json({ message: "exerciseName, day and date are required." });
    }
    const todo = await TodoItem.create({
      userId: req.user._id,
      exerciseName,
      day,
      muscleGroup: muscleGroup || "",
      sets: sets || 0,
      reps: reps || "",
      date
    });
    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create todo.", error: error.message });
  }
};

export const toggleTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!todo) return res.status(404).json({ message: "Todo not found." });
    todo.completed = !todo.completed;
    await todo.save();
    return res.json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update todo.", error: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const deleted = await TodoItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Todo not found." });
    return res.json({ message: "Todo removed." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete todo.", error: error.message });
  }
};

export const getTodoStats = async (req, res) => {
  try {
    const start = getMonday();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startStr = formatDate(start);
    const endStr = formatDate(end);

    const todos = await TodoItem.find({
      userId: req.user._id,
      date: { $gte: startStr, $lte: endStr }
    });

    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return res.json({
      weekStart: startStr,
      weekEnd: endStr,
      total,
      completed,
      completionPercentage
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get stats.", error: error.message });
  }
};
