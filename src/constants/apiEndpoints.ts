/**
 * apiEndpoints.ts
 *
 * Single source of truth for every API path.
 *
 * Rules:
 *   - All strings start with "api/" (no leading slash).
 *   - baseURL in http.ts is the bare origin ("http://localhost:5143"),
 *     so axios joins them correctly as "http://localhost:5143/api/...".
 *   - No hardcoded base URLs anywhere else in the codebase.
 */

export const API_ENDPOINTS = {

  // ── Authentication ────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:    "api/Auth/login",
    REGISTER: "api/Auth/register",   // candidate self-registration (public)
    // LOGOUT: "api/Auth/logout",    // uncomment when backend implements it
  },

  // ── HR admin ──────────────────────────────────────────────────────────────
  HR: {
    META:          "api/Hr/meta",
    TESTS:         "api/Hr/tests",
    TEST_BY_ID:    (id: string)    => `api/Hr/tests/${id}`,
    TEST_BY_TOKEN: (token: string) => `api/Hr/tests/by-token/${token}`,
    SUBMIT:        (id: string)    => `api/Hr/tests/${id}/submit`,
    REPORT:        (id: string)    => `api/Hr/tests/${id}/report`,
  },

  // ── Questions ─────────────────────────────────────────────────────────────
  QUESTIONS: {
    LIST:  "api/Questions",
    BY_ID: (id: string) => `api/Questions/${id}`,
  },

  // ── Answers ───────────────────────────────────────────────────────────────
  ANSWERS: {
    SUBMIT: "api/Answers",
  },

  // ── Applicant (legacy — kept for any direct usages outside applicantApi) ──
  APPLICANT: {
    LOGIN:   "api/applicant/login",
    DETAILS: "api/applicant/details",
  },

  // ── Proctoring snapshots ──────────────────────────────────────────────────
  SNAPSHOTS: {
    UPLOAD:  "api/Snapshots",
    BY_TEST: (testId: string) => `api/Snapshots/${testId}`,
  },

} as const