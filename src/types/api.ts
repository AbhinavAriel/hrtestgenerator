export interface ApiError extends Error {
  status?: number
  data?: any
}

export interface ApiResponse<T> {
  isSuccess: boolean
  message?: string
  data: T
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  totalPages: number
}