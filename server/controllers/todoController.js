import TodoItem from "../models/TodoItem.js";

export const getTodos = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.date) {
      filter.date = req.query.date;
    }

    const todos = await TodoItem.find(filter).sort({ createdAt: -1 });
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch todos.", error: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { text, date } = req.body;

    if (!text || !date) {
      return res.status(400).json({ message: "text and date are required." });
    }

    const todo = await TodoItem.create({
      userId: req.user._id,
      text,
      date
    });

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create todo.", error: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    const { done, text } = req.body;

    if (typeof done === "boolean") {
      todo.done = done;
    } else if (done === undefined) {
      todo.done = !todo.done;
    }

    if (typeof text === "string" && text.trim()) {
      todo.text = text.trim();
    }

    await todo.save();

    return res.json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update todo.", error: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    return res.json({ message: "Todo deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete todo.", error: error.message });
  }
};
