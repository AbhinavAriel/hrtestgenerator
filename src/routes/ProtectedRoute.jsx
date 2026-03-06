import { Navigate, Outlet } from "react-router-dom";
import { useTest } from "../context/TestContext";

export function RequireCandidate() {
  const { user, testId } = useTest();
  if (!user?.id || !testId) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function RequireAgreed() {
  const { agreed } = useTest();
  if (!agreed) return <Navigate to="/policy" replace />;
  return <Outlet />;
}

export function RequireSubmitted() {
  const { isSubmitted } = useTest();
  if (!isSubmitted) return <Navigate to="/result" replace />;
  return <Outlet />;
}