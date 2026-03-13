import { lazy } from "react";
import { ROUTES } from "./routeConstants";
import { RoutesConfig } from "../types/routes";

const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const HrCreateTest = lazy(() => import("../pages/HrCreateTest"));
const CreateQuestion = lazy(() => import("../pages/CreateQuestion"));
const HrTestPreview = lazy(() => import("../pages/HrTestPreview"));

const CandidatePage = lazy(() => import("../pages/CandidatePage"));
const PolicyAgreement = lazy(() => import("../pages/PolicyAgreement"));
const Assessment = lazy(() => import("../pages/Assessment"));
const Result = lazy(() => import("../pages/Result"));
const TestAlreadySubmitted = lazy(() =>
  import("../pages/TestAlreadySubmitted")
);

export const routesConfig: RoutesConfig = {
  public: [
    { path: ROUTES.ADMIN_LOGIN, element: <AdminLogin /> },
    { path: ROUTES.TEST, element: <CandidatePage /> },
    { path: ROUTES.POLICY, element: <PolicyAgreement /> },
    { path: ROUTES.TEST_SUBMITTED, element: <TestAlreadySubmitted /> },
    { path: ROUTES.TEST_ALREADY_SUBMITTED, element: <TestAlreadySubmitted /> },
  ],

  admin: [
    { path: ROUTES.ADMIN_DASHBOARD, element: <HrCreateTest /> },
    { path: ROUTES.CREATE_QUESTION, element: <CreateQuestion /> },
    { path: ROUTES.TEST_PREVIEW, element: <HrTestPreview /> },
  ],

  candidate: {
    agreed: [{ path: ROUTES.ASSESSMENT, element: <Assessment /> }],
    submitted: [{ path: ROUTES.RESULT, element: <Result /> }],
  },
};