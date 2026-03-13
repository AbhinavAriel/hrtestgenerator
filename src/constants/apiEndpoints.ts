export const API_ENDPOINTS = {

  HR: {
    META: "/hr/meta",
    TESTS: "/hr/tests",
    TEST_BY_ID: (id: string) => `/hr/tests/${id}`,
    TEST_BY_TOKEN: (token: string) => `/hr/tests/by-token/${token}`,
    SUBMIT: (id: string) => `/hr/tests/${id}/submit`,
    REPORT: (id: string) => `/hr/tests/${id}/report`
  },

  QUESTIONS: {
    LIST: "/questions",
    BY_ID: (id: string) => `/questions/${id}`
  },

   ANSWERS: {
    SUBMIT: "/answers"
  },

  APPLICANT: {
    LOGIN: "/applicant/login",
    DETAILS: "/applicant/details"
  }

}