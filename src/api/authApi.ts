/**
 * authApi.ts
 *
 * Admin authentication.
 *
 * The full AdminSession object (token + user + expiry) is persisted via
 * saveAdminSession() from adminAuth.ts, which writes to localStorage under
 * the key "admin_session".  The request interceptor in http.ts reads that
 * same key, so subsequent authenticated requests automatically carry the
 * correct Bearer token.
 *
 * We no longer write localStorage("token") directly — that was the old approach
 * and created a mismatch between what authApi stored and what the interceptor read.
 */

import { request } from "./http"
import { saveAdminSession } from "../lib/adminAuth"
import { AdminLoginRequest, AdminSession } from "../types/auth"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

export async function loginAdmin(
  payload: AdminLoginRequest
): Promise<AdminSession> {
  const session = await request<AdminSession>(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    data: payload,
  })

  // Persist the full session object.
  // http.ts interceptor reads localStorage("admin_session").token automatically.
  saveAdminSession(session)

  return session
}

export async function logoutAdmin(): Promise<void> {
  // Best-effort server-side logout (no endpoint currently — placeholder)
  // await request(API_ENDPOINTS.AUTH.LOGOUT, { method: "POST" })
}