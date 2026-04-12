import axios from "axios";

const normalizeApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
  const cleaned = raw.replace(/\/+$/, "");

  if (cleaned === "/api" || cleaned.endsWith("/api")) {
    return cleaned;
  }

  return `${cleaned}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(),
  withCredentials: true
});

let unauthorizedHandler = null;

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || "");
    const isAuthAttempt = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register") || requestUrl.includes("/auth/admin-login") || requestUrl.includes("/auth/firebase");

    if (status === 401 && !isAuthAttempt && !error.config?.skipAuthRedirect) {
      localStorage.removeItem("token");
      sessionStorage.setItem("session_expired", "1");

      if (unauthorizedHandler) {
        unauthorizedHandler();
      }

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
