
export interface ServerEnvelope<T = unknown> {
  isSuccess: boolean
  message?: string
  Message?: string
  data?: T
  Data?: T
}

/**
 * Unwrap a standard { isSuccess, message, data } server envelope.
 *
 * Call this AFTER `request<ServerEnvelope<T>>(...)` — i.e. after Axios has
 * already extracted the response body.
 *
 * @throws Error with the server's message if isSuccess === false.
 */
export function unwrap<T>(envelope: ServerEnvelope<T>): T {
  // Normalise casing (backend may send PascalCase or camelCase)
  const isSuccess = envelope?.isSuccess ?? (envelope as any)?.IsSuccess

  // If no envelope shape detected, return as-is (plain payload, no wrapper)
  if (typeof isSuccess !== "boolean") {
    return envelope as unknown as T
  }

  if (!isSuccess) {
    const msg =
      envelope?.message ||
      (envelope as any)?.Message ||
      "Request failed"
    throw new Error(msg)
  }

  const data = envelope?.data ?? (envelope as any)?.Data
  return data as T
}

/**
 * Re-throw an API error as a proper Error instance.
 *
 * After the http.ts interceptor runs, `e` is already an ApiError:
 *   { message: string, status?: number, data?: unknown }
 *
 * This function ensures the error is an actual Error object so callers get
 * proper stack traces and can do `instanceof Error` checks.
 *
 * Usage:
 *   catch (e) { throw normalizeApiError(e) }
 */
export function normalizeApiError(e: unknown): never {
  if (e instanceof Error) throw e

  // ApiError shape from http.ts interceptor
  const apiErr = e as { message?: string; status?: number; data?: unknown }

  const message =
    apiErr?.message ||
    (apiErr?.data as any)?.message ||
    (apiErr?.data as any)?.Message ||
    "Request failed"

  const err: Error & { status?: number; data?: unknown } = new Error(message)
  err.status = apiErr?.status
  err.data   = apiErr?.data

  throw err
}