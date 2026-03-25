/**
 * questionsApi.ts
 *
 * Fetches and creates assessment questions.
 * No logic changes from original — only import paths verified.
 */

import { request } from "./http"
import { unwrap, normalizeApiError } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

// ─── Types ───────────────────────────────────────────────────────────────────

interface GetQuestionsParams {
  testId?: string
  applicantId?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const getQuestions = async (
  params?: string | GetQuestionsParams
): Promise<unknown> => {
  try {
    // Backward-compatible: accepts a bare testId string or a params object
    const testId =
      typeof params === "string" ? params : params?.testId

    const applicantId =
      typeof params === "string" ? undefined : params?.applicantId

    let url = API_ENDPOINTS.QUESTIONS.LIST
    const queryParams: string[] = []

    if (testId)      queryParams.push(`testId=${testId}`)
    if (applicantId) queryParams.push(`applicantId=${applicantId}`)
    if (queryParams.length > 0) url += `?${queryParams.join("&")}`

    const res = await request<any>(url)
    return unwrap(res)
  } catch (e) {
    throw normalizeApiError(e)
  }
}

export const createQuestion = async (payload: unknown): Promise<unknown> => {
  try {
    const res = await request<any>(API_ENDPOINTS.QUESTIONS.LIST, {
      method: "POST",
      data: payload,
    })
    return unwrap(res)
  } catch (e) {
    throw normalizeApiError(e)
  }
}