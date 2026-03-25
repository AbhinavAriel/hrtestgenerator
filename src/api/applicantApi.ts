/**
 * applicantApi.ts
 *
 * Candidate / applicant registration.
 *
 * Previously this file created its own raw `axios` instance with a hardcoded
 * base URL.  It is now migrated to the shared `request()` from http.ts so:
 *   - The base URL is driven by the VITE_API_URL env variable (no hardcoded values).
 *   - Errors are normalised by the shared response interceptor.
 *   - Any future auth header requirement is handled automatically.
 */

import { request } from "./http"
import { normalizeApiError } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateApplicantPayload {
  name: string
  email: string
  phone: string
}

export interface ApplicantResponse {
  id?: string
  userId?: string
  userID?: string
  fullName: string
  email: string
  phoneNumber: string
}

// ─── API call ─────────────────────────────────────────────────────────────────

export const createApplicant = async (
  data: CreateApplicantPayload
): Promise<ApplicantResponse> => {
  try {
    // POST /api/Auth/register
    // The endpoint is a public route — no Bearer token needed.
    // http.ts will include the header only if admin_session exists in storage,
    // which is fine (the server should simply ignore it for public routes).
    const res = await request<any>(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      data: {
        fullName:    data.name,
        email:       data.email,
        phoneNumber: data.phone,
      },
    })

    // The register endpoint may or may not wrap in { isSuccess, data }
    // Handle both shapes gracefully.
    const payload: ApplicantResponse = res?.data ?? res

    return payload
  } catch (e) {
    throw normalizeApiError(e)
  }
}