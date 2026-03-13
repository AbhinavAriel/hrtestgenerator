import { request } from "./http"
import { unwrap, normalizeApiError } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

export const getQuestions = async (testId?: string): Promise<any> => {

  try {

    const url = testId
      ? `${API_ENDPOINTS.QUESTIONS.LIST}?testId=${testId}`
      : API_ENDPOINTS.QUESTIONS.LIST

    const res = await request<any>(url)

    return unwrap(res)

  } catch (e) {

    normalizeApiError(e)

  }
}

export const createQuestion = async (payload: any): Promise<any> => {

  try {

    const res = await request<any>(
      API_ENDPOINTS.QUESTIONS.LIST,
      {
        method: "POST",
        data: payload
      }
    )

    return unwrap(res)

  } catch (e) {

    normalizeApiError(e)

  }
}