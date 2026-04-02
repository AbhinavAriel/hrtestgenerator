export const API_ENDPOINTS = {

  AUTH: {
    LOGIN: "api/Auth/login",
    REGISTER: "api/Auth/register",   
    // LOGOUT: "api/Auth/logout",   
  },

  HR: {
    META: "api/Hr/meta",
    TESTS: "api/Hr/tests",
    TEST_BY_ID: (id: string) => `api/Hr/tests/${id}`,
    TEST_BY_TOKEN: (token: string) => `api/Hr/tests/by-token/${token}`,
    SUBMIT: (id: string) => `api/Hr/tests/${id}/submit`,
    REPORT: (id: string) => `api/Hr/tests/${id}/report`,
    REJECT: (id: string) => `api/Hr/tests/${id}/reject`,
  },

  QUESTIONS: {
    LIST: "api/Questions",
    BY_ID: (id: string) => `api/Questions/${id}`,
  },

  ANSWERS: {
    SUBMIT: "api/Answers",
  },

  APPLICANT: {
    LOGIN: "api/applicant/login",
    DETAILS: "api/applicant/details",
  },


  SNAPSHOTS: {
    UPLOAD:  "api/Snapshots",
    BY_TEST: (testId: string) => `api/Snapshots/${testId}`,
  },

} as const