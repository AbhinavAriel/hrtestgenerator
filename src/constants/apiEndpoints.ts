export const API_ENDPOINTS = {

  HR: {
    META: "api/Hr/meta",
    TESTS: "api/Hr/tests",
    TEST_BY_ID: (id: string) => `api/Hr/tests/${id}`,
    TEST_BY_TOKEN: (token: string) => `api/Hr/tests/by-token/${token}`,
    SUBMIT: (id: string) => `api/Hr/tests/${id}/submit`,
    REPORT: (id: string) => `api/Hr/tests/${id}/report`
  },

  QUESTIONS: {
    LIST: "api/Questions",
    BY_ID: (id: string) => `api/Questions/${id}`
  },

   ANSWERS: {
    SUBMIT: "api/Answers"
  },

  APPLICANT: {
    LOGIN: "/applicant/login",
    DETAILS: "/applicant/details"
  }

}