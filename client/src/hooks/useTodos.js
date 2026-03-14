import { useCallback, useEffect, useState } from "react";
import api from "../api/api";

const useTodos = (date) => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [todosRes, statsRes] = await Promise.all([
        api.get("/todos", { params: date ? { date } : {} }),
        api.get("/todos/stats")
      ]);
      setData(todosRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  }, [date]);

  const createTodo = async (payload) => {
    await api.post("/todos", payload);
    await fetchTodos();
  };

  const toggleTodo = async (id) => {
    await api.patch(`/todos/${id}`);
    await fetchTodos();
  };

  const removeTodo = async (id) => {
    await api.delete(`/todos/${id}`);
    await fetchTodos();
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return { data, stats, loading, error, fetchTodos, createTodo, toggleTodo, removeTodo };
};

export default useTodos;
