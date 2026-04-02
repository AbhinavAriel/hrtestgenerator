import { request } from "./http"
import { API_ENDPOINTS } from "../constants/apiEndpoints"
import { HrMeta, HrRow } from "../types/hr"

// ─── Param / response types ──────────────────────────────────────────────────

interface GetTestsParams {
  page?: number
  pageSize?: number
}

interface HrPagedData {
  items: HrRow[]
  totalCount: number
  page: number
}

export interface HrTestsResponse {
  isSuccess: boolean
  message: string
  data: HrPagedData
}

// ─── Meta ────────────────────────────────────────────────────────────────────

export const getHrMeta = async (): Promise<HrMeta> => {
  const res = await request<any>(API_ENDPOINTS.HR.META)
  return res?.data ?? res
}

// ─── Test list ───────────────────────────────────────────────────────────────

export const getHrTests = async (
  { page = 1, pageSize = 10 }: GetTestsParams = {}
): Promise<HrTestsResponse> => {
  return request<HrTestsResponse>(
    `${API_ENDPOINTS.HR.TESTS}?page=${page}&pageSize=${pageSize}`
  )
}

// ─── Get by id ───────────────────────────────────────────────────────────────

export const getHrTestById = (testId: string): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TEST_BY_ID(testId))
}

// ─── Get by token (candidate entry link) ────────────────────────────────────

export const getHrTestByToken = (token: string): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TEST_BY_TOKEN(token))
}

// ─── Create ──────────────────────────────────────────────────────────────────

export const createHrTest = (payload: unknown): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TESTS, {
    method: "POST",
    data: payload,
  })
}

// ─── Update ──────────────────────────────────────────────────────────────────

export const updateHrTest = (testId: string, payload: unknown): Promise<HrRow> => {
  return request<HrRow>(API_ENDPOINTS.HR.TEST_BY_ID(testId), {
    method: "PUT",
    data: payload,
  })
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteHrTest = (testId: string): Promise<void> => {
  return request<void>(API_ENDPOINTS.HR.TEST_BY_ID(testId), {
    method: "DELETE",
  })
}

// ─── Submit ──────────────────────────────────────────────────────────────────

export const submitHrTest = (testId: string): Promise<void> => {
  return request<void>(API_ENDPOINTS.HR.SUBMIT(testId), {
    method: "POST",
  })
}


export const getHrTestReport = (testId: string): Promise<any> => {
  return request<any>(API_ENDPOINTS.HR.REPORT(testId))
}