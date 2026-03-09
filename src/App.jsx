import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TestProvider } from "./context/TestContext";
import PolicyAgreement from "./pages/PolicyAgreement";
import Assessment from "./pages/Assessment";
import Result from "./pages/Result";
import HrCreateTest from "./pages/HrCreateTest";
import CandidatePage from "./pages/CandidatePage";
import TestAlreadySubmitted from "./pages/TestAlreadySubmitted";
import HrTestPreview from "./pages/HrTestPreview";
import AdminLogin from "./pages/AdminLogin";
import CreateQuestion from "./pages/CreateQuestion";
import {
  RequireAdmin,
  RequireCandidate,
  RequireAgreed,
  RequireSubmitted,
} from "./routes/ProtectedRoute";

function App() {
  return (
    <TestProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<HrCreateTest />} />
            <Route path="/admin/questions/create" element={<CreateQuestion />} />
            <Route path="/hr/tests/:testId/preview" element={<HrTestPreview />} />
          </Route>

          <Route path="/test/:testId" element={<CandidatePage />} />
          <Route path="/policy" element={<PolicyAgreement />} />
          <Route path="/test-submitted" element={<TestAlreadySubmitted />} />
          <Route path="/test/:testId/already-submitted" element={<TestAlreadySubmitted />} />

          <Route element={<RequireCandidate />}>
            <Route element={<RequireAgreed />}>
              <Route path="/assessment" element={<Assessment />} />
            </Route>

            <Route element={<RequireSubmitted />}>
              <Route path="/result" element={<Result />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/admin-login" replace />} />
        </Routes>
      </BrowserRouter>
    </TestProvider>
  );
}

export default App;