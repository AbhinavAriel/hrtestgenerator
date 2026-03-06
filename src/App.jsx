import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TestProvider } from "./context/TestContext";
import PolicyAgreement from "./pages/PolicyAgreement";
import Assessment from "./pages/Assessment";
import Result from "./pages/Result";
import HrCreateTest from "./pages/HrCreateTest";
import CandidatePage from "./pages/CandidatePage";
import TestAlreadySubmitted from "./pages/TestAlreadySubmitted";
import HrTestPreview from "./pages/HrTestPreview";

import { RequireCandidate, RequireAgreed, RequireSubmitted } from "./routes/ProtectedRoute";

function App() {
  return (
    <TestProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<HrCreateTest />} />
          <Route path="/test/:testId" element={<CandidatePage />} />
          <Route path="/policy" element={<PolicyAgreement />} />

          <Route element={<RequireCandidate />}>
            <Route element={<RequireAgreed />}>
              <Route path="/assessment" element={<Assessment />} />
            </Route>

            <Route element={<RequireSubmitted />}>
              <Route path="/result" element={<Result />} />
            </Route>
          </Route>
          <Route path="/hr/tests/:testId/preview" element={<HrTestPreview />} />

          <Route path="/test/:testId/already-submitted" element={<TestAlreadySubmitted />} />

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </TestProvider>
  );
}

export default App;