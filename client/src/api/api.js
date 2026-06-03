import axios from "axios";

const normalizeApiBaseUrl = () => {
  const defaultLocalApi = (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5000/api").trim();
  const configuredApi = (import.meta.env.VITE_API_URL || defaultLocalApi).trim();
  const raw =
    import.meta.env.DEV && /your-render-backend\.onrender\.com/i.test(configuredApi)
      ? defaultLocalApi
      : configuredApi;
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
let refreshRequest = null;

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
};

const isAuthEndpoint = (requestUrl) =>
  requestUrl.includes("/auth/login") ||
  requestUrl.includes("/auth/register") ||
  requestUrl.includes("/auth/admin-login") ||
  requestUrl.includes("/auth/firebase") ||
  requestUrl.includes("/auth/refresh");

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || "");
    const originalRequest = error.config || {};

    if (status === 401 && !isAuthEndpoint(requestUrl) && !originalRequest.skipAuthRedirect && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        refreshRequest = refreshRequest || api.post("/auth/refresh", null, { skipAuthRedirect: true });
        await refreshRequest;
        refreshRequest = null;
        return api(originalRequest);
      } catch (refreshError) {
        refreshRequest = null;
      }
    }

    if (status === 401 && !isAuthEndpoint(requestUrl) && !originalRequest.skipAuthRedirect) {
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
