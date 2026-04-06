import axios from "axios";

const normalizeApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").trim();
  const trimmed = raw.replace(/\/+$/, "");

  // Allow relative "/api" as-is and append "/api" to absolute origins that omitted it.
  if (trimmed === "/api" || trimmed.endsWith("/api")) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(),
  withCredentials: true
});

export const setClientToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
