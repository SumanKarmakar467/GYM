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

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register") || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || api.post("/auth/refresh");
      await refreshPromise;
      refreshPromise = null;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      return Promise.reject(refreshError);
    }
  }
);

export default api;