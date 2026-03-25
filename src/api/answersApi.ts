/**
 * answersApi.ts
 *
 * Submits a single question answer during assessment.
 *
 * Fix applied: the previous version built a `dto` object (with PascalCase keys)
 * but then passed the original `payload` (camelCase) to request() instead.
 * We now send the correctly-cased dto so the backend receives the right field names.
 */

import { request } from "./http"
import { unwrap } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SubmitAnswerPayload {
  testId: string
  applicantId: string
  questionId: string
  selectedOptionId?: string | null
  elapsedSeconds?: number
}

// ─── API call ─────────────────────────────────────────────────────────────────

export const submitAnswer = async (
  payload: SubmitAnswerPayload
): Promise<unknown> => {
  // Send PascalCase DTO to match the backend's C# model binder.
  const dto = {
    TestId:          payload.testId,
    ApplicantId:     payload.applicantId,
    QuestionId:      payload.questionId,
    SelectedOptionId: payload.selectedOptionId ?? null,
    ElapsedSeconds:  Number(payload.elapsedSeconds ?? 0),
  }

  const res = await request<any>(API_ENDPOINTS.ANSWERS.SUBMIT, {
    method: "POST",
    data: dto,           // ← was `payload` (bug fixed)
  })

  return unwrap(res)
}