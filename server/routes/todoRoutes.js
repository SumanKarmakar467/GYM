import express from "express";
import {
  createTodo,
  deleteTodo,
  getTodos,
  getTodoStats,
  getTodoStreak,
  toggleTodo
} from "../controllers/todoController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.get("/", getTodos);
router.post("/", createTodo);
router.patch("/:id", toggleTodo);
router.delete("/:id", deleteTodo);
router.get("/stats", getTodoStats);
router.get("/streak", getTodoStreak);

export default router;