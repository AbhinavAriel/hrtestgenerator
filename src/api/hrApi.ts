import { request } from "./http"
import { API_ENDPOINTS } from "../constants/apiEndpoints"
import { HrMeta } from "../types/hr"

interface GetTestsParams {
  page?: number
  pageSize?: number
}

export const getHrMeta = (): Promise<HrMeta> => {
  return request<HrMeta>(API_ENDPOINTS.HR.META)
}

export const getHrTests = async ( {page = 1, pageSize = 10}: GetTestsParams = {}) => {
  return request(
    `${API_ENDPOINTS.HR.TESTS}?page=${page}&pageSize=${pageSize}`
  )
}

export const getHrTestById = (testId: string) => {
  return request(API_ENDPOINTS.HR.TEST_BY_ID(testId))
}

export const getHrTestByToken = (token: string) => {
  return request(API_ENDPOINTS.HR.TEST_BY_TOKEN(token))
}

export const createHrTest = (payload: any) => {
  return request(API_ENDPOINTS.HR.TESTS, {
    method: "POST",
    data: payload
  })
}

export const updateHrTest = (testId: string, payload: any) => {
  return request(API_ENDPOINTS.HR.TEST_BY_ID(testId), {
    method: "PUT",
    data: payload
  })
}

export const deleteHrTest = (testId: string) => {
  return request(API_ENDPOINTS.HR.TEST_BY_ID(testId), {
    method: "DELETE"
  })
}

export const submitHrTest = (testId: string) => {
  return request(API_ENDPOINTS.HR.SUBMIT(testId), {
    method: "POST"
  })
}

export const getHrTestReport = (testId: string) => {
  return request(API_ENDPOINTS.HR.REPORT(testId))
}