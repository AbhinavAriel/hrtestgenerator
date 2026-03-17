import { request } from "./http"
import { unwrap, normalizeApiError } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

interface GetQuestionsParams {
  testId?: string
  applicantId?: string
}

export const getQuestions = async (
  params?: string | GetQuestionsParams
): Promise<any> => {

  try {

    // ✅ BACKWARD COMPATIBILITY
    const testId =
      typeof params === "string" ? params : params?.testId

    const applicantId =
      typeof params === "string" ? undefined : params?.applicantId

    // ✅ BUILD QUERY PARAMS SAFELY
    let url = API_ENDPOINTS.QUESTIONS.LIST

    const queryParams: string[] = []

    if (testId) queryParams.push(`testId=${testId}`)
    if (applicantId) queryParams.push(`applicantId=${applicantId}`)

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`
    }

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

    throw normalizeApiError(e)

  }
}