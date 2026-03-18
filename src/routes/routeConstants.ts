export const ROUTES = {
  ADMIN_LOGIN: "/admin-login",
  TEST: "/test/:testId",
  POLICY: "/policy",
  TEST_SUBMITTED: "/test-submitted",
  TEST_ALREADY_SUBMITTED: "/test/:testId/already-submitted",

  ADMIN_DASHBOARD: "/admin",
  CREATE_QUESTION: "/admin/questions/create",
  TEST_PREVIEW: "/hr/tests/:testId/preview",

  ASSESSMENT: "/assessment", 
  RESULT: "/result",
} as const;