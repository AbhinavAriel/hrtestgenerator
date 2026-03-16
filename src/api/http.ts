import axios, { AxiosError, AxiosRequestConfig } from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5143/api"

export interface ApiError {
  message: string
  status?: number
  data?: any
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
})

/* Request interceptor (attach token) */
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* Response interceptor (normalize errors) */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {

    const err: ApiError = {
      message:
        (error.response?.data as any)?.message ||
        error.message ||
        "Request failed",
      status: error.response?.status,
      data: error.response?.data
    }

    return Promise.reject(err)
  }
)

/* Generic request wrapper */
export async function request<T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {

  const res = await api({
    url,
    ...config
  })

  return res.data as T
}