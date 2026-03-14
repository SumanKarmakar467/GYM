import express from "express";
import {
  createTodo,
  deleteTodo,
  getTodoStats,
  getTodos,
  toggleTodo
} from "../controllers/todoController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getTodoStats);
router.get("/", getTodos);
router.post("/", createTodo);
router.patch("/:id", toggleTodo);
router.delete("/:id", deleteTodo);

export default router;
