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
 *   by adminAuth.ts.  The interceptor below reads that key and attaches it
 *   ONLY for admin-protected routes. Candidate-facing routes (questions,
 *   answers, snapshots, test by token/id) must work without any token so
 *   applicants can use them from incognito / fresh browsers.
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
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5143"

// ─── Shared error shape ──────────────────────────────────────────────────────
export interface ApiError {
  message: string
  status?: number
  data?: unknown
}

// ─── Admin route detection ────────────────────────────────────────────────────
//
// The Bearer token is attached ONLY for admin-protected routes.
// Candidate-facing routes must work token-free (incognito / fresh browser).
//
// Admin routes (token attached):
//   POST   api/Auth/login
//   GET    api/Hr/meta
//   GET    api/Hr/tests                  ← list (?page=1&pageSize=10)
//   POST   api/Hr/tests                  ← create
//   PUT    api/Hr/tests/:id              ← update
//   DELETE api/Hr/tests/:id              ← delete
//   GET    api/Hr/tests/:id/report       ← view report
//   PATCH/PUT api/Hr/tests/:id/reject    ← admin reject candidate
//   POST   api/Questions                 ← create question
//   GET    api/Snapshots/:testId         ← admin views snapshot list
//   GET    api/Snapshots/image/:id       ← admin views snapshot image
//
// Candidate public routes (no token):
//   GET    api/Hr/tests/by-token/:token  ← open test link
//   GET    api/Hr/tests/:id              ← [AllowAnonymous] on backend
//   POST   api/Hr/tests/:id/submit       ← candidate submits
//   GET    api/Questions?testId=...      ← load questions
//   POST   api/Answers                   ← save answer
//   POST   api/Snapshots                 ← candidate uploads snapshot
//
function isAdminRequest(config: InternalAxiosRequestConfig): boolean {
  // Strip query string + trailing slash before matching
  const rawUrl = config.url ?? ""
  const url = rawUrl.split("?")[0].replace(/\/+$/, "")
  const method = (config.method ?? "get").toUpperCase()

  // Admin login
  if (/api\/Auth\/login$/i.test(url)) return true

  // HR meta
  if (/api\/Hr\/meta$/i.test(url)) return true

  // GET/POST on the test list root: api/Hr/tests (no further path segments)
  if (/api\/Hr\/tests$/i.test(url)) return true

  // GET api/Hr/tests/:id/report
  if (/api\/Hr\/tests\/[^/]+\/report$/i.test(url)) return true

  // PATCH or PUT api/Hr/tests/:id/reject
  if (/api\/Hr\/tests\/[^/]+\/reject$/i.test(url)) return true

  // PUT or DELETE api/Hr/tests/:id  (update / delete — single segment after tests/)
  if (
    (method === "PUT" || method === "DELETE") &&
    /api\/Hr\/tests\/[^/]+$/i.test(url)
  ) return true

  // POST api/Questions  (create question — admin only)
  if (method === "POST" && /api\/Questions$/i.test(url)) return true

  // GET api/Snapshots/*  — admin views snapshot list or image
  // POST api/Snapshots is excluded — candidates upload without a token
  if (method === "GET" && /api\/Snapshots\//i.test(url)) return true

  return false
}

// ─── Axios instance ──────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
})

// ─── Request interceptor: attach Bearer token only for admin routes ───────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (isAdminRequest(config)) {
      const raw = localStorage.getItem("admin_session")
      if (raw) {
        try {
          const session = JSON.parse(raw)
          const token: string | undefined = session?.token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch {
          // Corrupt storage — ignore, request will proceed without token
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: normalize errors + 401 guard ──────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as Record<string, unknown> | undefined

    // Only clear session and redirect on 401 if this was an admin request
    // (i.e. a Bearer token was actually sent). Candidate endpoints can also
    // return 401 legitimately and must never trigger an admin logout.
    if (error.response?.status === 401) {
      const sentToken = (error.config as any)?.headers?.Authorization
      if (sentToken && typeof sentToken === "string" && sentToken.startsWith("Bearer ")) {
        localStorage.removeItem("admin_session")
        window.location.replace("/admin-login")
      }
    }

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
export async function request<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const res = await api({ url, ...config })
  return res.data as T
}