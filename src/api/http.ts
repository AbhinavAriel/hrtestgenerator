/**
 * http.ts — Single Axios instance for the entire application.
 *
 * All API modules (authApi, hrApi, questionsApi, answersApi,
 * applicantApi, snapshotApi …) must import `request` from here.
 * No other file may create its own axios instance.
 *
 * Base URL:
 *   VITE_API_URL should be the server root, e.g. "http://localhost:5143"
 *   All endpoint strings must start with "api/..." (no leading slash needed —
 *   axios joins baseURL + relative path automatically).
 *
 * Auth:
 *   Admin token is stored as a JSON object under the key "admin_session"
 *   by adminAuth.ts.  The interceptor below reads that key and pulls
 *   session.token so every authenticated request carries the correct header.
 *
 * Error shape (after response interceptor):
 *   { message: string, status?: number, data?: any }
 *   — guaranteed, so callers never need to inspect e.response.data themselves.
 */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

// ─── Base URL ────────────────────────────────────────────────────────────────
// Keep the env variable as the bare origin (e.g. "http://localhost:5143").
// Do NOT include a trailing "/api" — all endpoint constants already begin with "api/".
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5143"

// ─── Shared error shape ──────────────────────────────────────────────────────
export interface ApiError {
  message: string
  status?: number
  data?: unknown
}

// ─── Axios instance ──────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
})

// ─── Request interceptor: attach Bearer token ────────────────────────────────
//
// adminAuth.ts stores the session as JSON under "admin_session":
//   { token: string, user: { id, fullName, email, roles }, expiresAtUtc }
//
// We read that object and pull .token so the right value is sent every time.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const raw = localStorage.getItem("admin_session")
    if (raw) {
      try {
        const session = JSON.parse(raw)
        const token: string | undefined = session?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // Corrupt storage — ignore, unauthenticated request will get a 401
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: normalize errors ──────────────────────────────────
//
// All rejected promises are converted to a plain ApiError so every catch block
// can simply read `e.message`, `e.status`, and `e.data` without traversing the
// full Axios AxiosError chain.
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as Record<string, unknown> | undefined

    const message: string =
      (responseData?.message as string) ||
      (responseData?.Message as string) ||
      error.message ||
      "Request failed"

    const apiErr: ApiError = {
      message,
      status: error.response?.status,
      data:   responseData,
    }

    return Promise.reject(apiErr)
  }
)

// ─── Generic request wrapper ─────────────────────────────────────────────────
//
// Returns res.data directly.
// Callers receive the raw server payload — envelope unwrapping is done in
// apiHelper.ts when a consistent { isSuccess, data } envelope is expected,
// or inline in the API module when the shape is known.
export async function request<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const res = await api({ url, ...config })
  return res.data as T
}