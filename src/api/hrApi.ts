import { request } from "./http"
import { API_ENDPOINTS } from "../constants/apiEndpoints"
import { HrMeta, HrRow } from "../types/hr"

interface GetTestsParams {
  page?: number
  pageSize?: number
}

/* ---------- API RESPONSE TYPES ---------- */

interface HrPagedData {
  items: HrRow[]
  totalCount: number
  page: number
}

interface HrTestsResponse {
  isSuccess: boolean
  message: string
  data: HrPagedData
}

/* ---------- META ---------- */

export const getHrMeta = async (): Promise<HrMeta> => {
  const res = await request<any>(API_ENDPOINTS.HR.META)
  return res?.data ?? res
}

/* ---------- TEST LIST ---------- */

export const getHrTests = async (
  { page = 1, pageSize = 10 }: GetTestsParams = {}
): Promise<HrTestsResponse> => {

  return request<HrTestsResponse>(
    `${API_ENDPOINTS.HR.TESTS}?page=${page}&pageSize=${pageSize}`
  )
}

/* ---------- GET BY ID ---------- */

export const getHrTestById = (testId: string): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TEST_BY_ID(testId))
}

/* ---------- GET BY TOKEN ---------- */

export const getHrTestByToken = (token: string): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TEST_BY_TOKEN(token))
}

/* ---------- CREATE ---------- */

export const createHrTest = (payload: any): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TESTS, {
    method: "POST",
    data: payload
  })
}

/* ---------- UPDATE ---------- */

export const updateHrTest = (
  testId: string,
  payload: any
): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TEST_BY_ID(testId), {
    method: "PUT",
    data: payload
  })
}

/* ---------- DELETE ---------- */

export const deleteHrTest = (testId: string): Promise<void> => {
  return request<void>(API_ENDPOINTS.HR.TEST_BY_ID(testId), {
    method: "DELETE"
  })
}

/* ---------- SUBMIT ---------- */

export const submitHrTest = (testId: string): Promise<void> => {
  return request<void>(API_ENDPOINTS.HR.SUBMIT(testId), {
    method: "POST"
  })
}

/* ---------- REPORT ---------- */

export const getHrTestReport = (testId: string) => {
  return request(API_ENDPOINTS.HR.REPORT(testId))
}