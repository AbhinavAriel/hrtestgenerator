/**
 * apiHelper.ts
 *
 * Shared utilities for API modules.
 *
 * WHY unwrap() exists
 * -------------------
 * The backend wraps most responses in an envelope:
 *   { isSuccess: boolean, message: string, data: T }
 *
 * `request()` in http.ts already returns res.data (the axios response body),
 * so by the time a payload reaches unwrap() it looks like:
 *   { isSuccess: true, message: "...", data: <actual payload> }
 *
 * unwrap() checks the isSuccess flag and either throws the server message
 * or returns the inner `data` field.
 *
 * API modules that return a flat value (no envelope) — e.g. authApi — should
 * NOT call unwrap().
 *
 * normalizeApiError()
 * -------------------
 * After the response interceptor in http.ts runs, every rejected promise is
 * already a plain ApiError: { message, status, data }.
 * normalizeApiError re-throws it as a proper Error so stack traces are preserved
 * and callers can use instanceof Error checks.
 */

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