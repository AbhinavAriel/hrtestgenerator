import axios from "axios";
import { clearAdminSession, getAdminToken } from "../lib/adminAuth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5143/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAdminSession();
    }

    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Request failed";

    const normalized = new Error(msg);
    normalized.status = err?.response?.status;
    normalized.data = err?.response?.data;
    return Promise.reject(normalized);
  }
);