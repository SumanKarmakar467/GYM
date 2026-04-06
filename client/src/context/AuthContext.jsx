import { createContext, useEffect, useMemo, useState } from "react";
import api, { setClientToken } from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const setAuthState = ({ nextUser, nextToken }) => {
    setUser(nextUser || null);
    setToken(nextToken || "");
    setClientToken(nextToken || "");

    if (nextToken) {
      localStorage.setItem("gymforge_token", nextToken);
    } else {
      localStorage.removeItem("gymforge_token");
    }
  };

  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    setAuthState({ nextUser: data.user, nextToken: data.token });
    return data.user;
  };

  const login = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAuthState({ nextUser: data.user, nextToken: data.token });
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore server-side logout errors and still clear local auth state
    }

    setAuthState({ nextUser: null, nextToken: "" });
  };

  useEffect(() => {
    const bootstrap = async () => {
      const persistedToken = localStorage.getItem("gymforge_token") || "";
      setClientToken(persistedToken);
      setToken(persistedToken);

      try {
        await refreshUser();
      } catch {
        setAuthState({ nextUser: null, nextToken: "" });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      register,
      login,
      logout,
      refreshUser,
      setUser
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
