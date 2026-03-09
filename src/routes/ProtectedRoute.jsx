import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTest } from "../context/TestContext";
import { isAdminAuthenticated } from "../lib/adminAuth";

export function RequireAdmin() {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireCandidate() {
  const { user, testId } = useTest();
  if (!user?.id || !testId) return <Navigate to="/admin-login" replace />;
  return <Outlet />;
}

export function RequireAgreed() {
  const { agreed, isSubmitted } = useTest();
  if (isSubmitted) return <Navigate to="/test-submitted" replace />;
  if (!agreed) return <Navigate to="/policy" replace />;
  return <Outlet />;
}

export function RequireSubmitted() {
  const { isSubmitted } = useTest();
  if (!isSubmitted) return <Navigate to="/result" replace />;
  return <Outlet />;
}