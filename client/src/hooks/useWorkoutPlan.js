import { useCallback, useEffect, useState } from "react";
import api from "../api/api";

const useWorkoutPlan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/workout/me");
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch workout plan");
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/workout/generate");
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to generate workout plan";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { data, loading, error, fetchPlan, generatePlan };
};

export default useWorkoutPlan;
