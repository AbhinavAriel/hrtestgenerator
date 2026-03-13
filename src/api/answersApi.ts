import { request } from "./http"
import { unwrap } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

interface SubmitAnswerPayload {
  testId: string
  applicantId: string
  questionId: string
  selectedOptionId?: string | null
  elapsedSeconds?: number
}

export const submitAnswer = async (
  payload: SubmitAnswerPayload
): Promise<any> => {

  const dto = {
    TestId: payload.testId,
    ApplicantId: payload.applicantId,
    QuestionId: payload.questionId,
    SelectedOptionId: payload.selectedOptionId ?? null,
    ElapsedSeconds: Number(payload.elapsedSeconds ?? 0),
  }

  const res = await request<any>(
    API_ENDPOINTS.ANSWERS.SUBMIT,
    {
      method: "POST",
      data: payload
    }
  )

  return unwrap(res)
}