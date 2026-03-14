import { useCallback, useEffect, useState } from "react";
import api from "../api/api";

const useWallpaper = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/wallpaper");
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch wallpaper config");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/wallpaper", payload);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save wallpaper config";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { data, loading, error, fetchConfig, saveConfig };
};

export default useWallpaper;
