import { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = (token, profile) => {
    localStorage.setItem("gymforge_token", token);
    setUser(profile);
  };

  const clearAuth = () => {
    localStorage.removeItem("gymforge_token");
    setUser(null);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistAuth(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistAuth(data.token, data.user);
    return data.user;
  };

  const logout = () => clearAuth();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("gymforge_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
