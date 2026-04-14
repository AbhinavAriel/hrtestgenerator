import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

import { getCandidateToken } from "../lib/Candidateauth"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5143"

export interface ApiError {
  message: string
  status?: number
  data?: unknown
}

function isAdminRequest(config: InternalAxiosRequestConfig): boolean {
  const rawUrl = config.url ?? ""
  const url = rawUrl.split("?")[0].replace(/\/+$/, "")
  const method = (config.method ?? "get").toUpperCase()

  if (/api\/Auth\/login$/i.test(url)) return true
  if (/api\/Hr\/meta$/i.test(url)) return true
  if (/api\/Hr\/tests$/i.test(url)) return true
  if (/api\/Hr\/tests\/[^/]+\/report$/i.test(url)) return true
  if (/api\/Hr\/tests\/[^/]+\/reject$/i.test(url)) return true

  if (
    (method === "PUT" || method === "DELETE") &&
    /api\/Hr\/tests\/[^/]+$/i.test(url)
  ) return true

  if (method === "POST" && /api\/Questions$/i.test(url)) return true
  if (method === "GET" && /api\/Snapshots\//i.test(url)) return true

  return false
}

function isCandidateRequest(config: InternalAxiosRequestConfig): boolean {
  const rawUrl = config.url ?? ""
  const url = rawUrl.split("?")[0].replace(/\/+$/, "")
  const method = (config.method ?? "get").toUpperCase()

  // Fetch questions for a test (GET /api/Questions?testId=...)
  if (method === "GET" && /api\/Questions$/i.test(url)) return true

  // Submit an answer
  if (method === "POST" && /api\/Answers$/i.test(url)) return true

  // Submit the test
  if (method === "POST" && /api\/Hr\/tests\/[^/]+\/submit$/i.test(url)) return true

  // Upload a snapshot during assessment
  if (method === "POST" && /api\/Snapshots$/i.test(url)) return true

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

// ─── Request interceptor ─────────────────────────────────────────────────────
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
          // Corrupt storage — ignore
        }
      }
    } else if (isCandidateRequest(config)) {
      const rawUrl = config.url ?? ""
      const [path, queryString] = rawUrl.split("?")

      let testId: string | undefined

      const match = path.match(/tests\/([^/]+)/i)
      if (match) {
        testId = match[1]
      }

      if (!testId && queryString) {
        const params = new URLSearchParams(queryString)
        testId = params.get("testId") ?? undefined
      }

      const token = getCandidateToken(testId)
      console.log("[AUTH DEBUG]", { url: config.url, testId, token: token ? "present" : "MISSING" })
      console.log("[STORED]", {
        stored_test_id: sessionStorage.getItem("candidate_test_id"),
        stored_token: sessionStorage.getItem("candidate_token") ? "present" : "MISSING"
      })

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as Record<string, unknown> | undefined

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
      data: responseData,
    }

    return Promise.reject(apiErr)
  }
)

// ─── Generic request wrapper ──────────────────────────────────────────────────
export async function request<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const res = await api({ url, ...config })
  return res.data as T
}