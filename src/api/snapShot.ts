/**
 * snapshotApi.ts
 *
 * Proctoring snapshot upload and retrieval.
 * Uses the shared request() from http.ts — authenticated via the
 * admin_session token interceptor where required.
 *
 * Upload endpoint is called during the candidate's live assessment
 * (no admin token present — the server should accept it as a semi-public
 * route authenticated by testId + applicantId in the body).
 *
 * Retrieval endpoint is admin-only (Bearer token required — handled
 * automatically by the http.ts interceptor).
 */

import { request } from "./http"
import { normalizeApiError } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SnapshotPayload {
  testId: string
  applicantId: string
  imageData: string    // base64 data-URL: "data:image/jpeg;base64,..."
  capturedAt: string   // ISO-8601 UTC
}

export interface SnapshotRecord {
  id: string
  testId: string
  applicantId: string
  imageUrl: string     // pre-signed S3 URL or base64 string, per backend impl
  capturedAt: string
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * POST /api/Snapshots
 *
 * Called inside useAssessmentCamera at each capture interval.
 * Failures are intentionally swallowed by the caller — we never
 * disrupt the candidate's test over a missed snapshot.
 */
export const uploadSnapshot = async (
  payload: SnapshotPayload
): Promise<void> => {
  try {
    await request<void>(API_ENDPOINTS.SNAPSHOTS.UPLOAD, {
      method: "POST",
      data: {
        TestId:      payload.testId,
        ApplicantId: payload.applicantId,
        ImageData:   payload.imageData,
        CapturedAt:  payload.capturedAt,
      },
    })
  } catch (e) {
    throw normalizeApiError(e)
  }
}

// ─── Retrieve ─────────────────────────────────────────────────────────────────

/**
 * GET /api/Snapshots/{testId}
 *
 * Admin-only. Fetches all snapshots for a given test for the HR report view.
 */
export const getSnapshots = async (
  testId: string
): Promise<SnapshotRecord[]> => {
  try {
    const res = await request<any>(
      API_ENDPOINTS.SNAPSHOTS.BY_TEST(testId)
    )
    // Handle envelope or plain array
    const list = res?.data ?? res
    return Array.isArray(list) ? list : []
  } catch (e) {
    throw normalizeApiError(e)
  }
}