import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHrTestByToken } from "../api/hrApi";
import { useTest } from "../context/TestContext";
import toast from "react-hot-toast";

const onlyDigits = (value) => (value || "").replace(/\D/g, "");

function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg1 bg-cover px-4">
      <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function CandidatePage() {
  const navigate = useNavigate();

  const { testId: token } = useParams();
  const { setUser, setTestId } = useTest();
  const safeToken = useMemo(() => (token || "").trim(), [token]);

  const [checking, setChecking] = useState(true);
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    applicantId: "",
    testId: "",
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setApiError("");

      if (!safeToken) {
        toast.error("Invalid test link.");
        navigate("/admin-login", { replace: true });
        return;
      }

      try {
        setChecking(true);

        // Candidate must only use public token endpoint
        const testDetail = await getHrTestByToken(safeToken);

        const test = testDetail?.test || testDetail?.Test || null;

        const submittedAt =
          test?.submittedAtUtc ??
          test?.SubmittedAtUtc ??
          testDetail?.submittedAtUtc ??
          testDetail?.SubmittedAtUtc ??
          null;

        const status = (
          test?.status ??
          test?.Status ??
          testDetail?.status ??
          testDetail?.Status ??
          ""
        )
          .toString()
          .trim()
          .toLowerCase();

        const isSubmitted = Boolean(submittedAt) || status === "submitted";

        if (isSubmitted) {
          navigate(`/test/${safeToken}/already-submitted`, { replace: true });
          return;
        }

        const applicant = testDetail?.applicant || testDetail?.Applicant || null;

        const applicantId =
          testDetail?.applicantId ||
          testDetail?.ApplicantId ||
          applicant?.id ||
          applicant?.Id;

        const resolvedTestId =
          testDetail?.testId ||
          testDetail?.TestId ||
          test?.id ||
          test?.Id ||
          null;

        if (!applicantId || !resolvedTestId) {
          throw new Error("Applicant or test details are missing for this link.");
        }

        const fullName =
          (applicant?.fullName || applicant?.FullName || "").trim() ||
          [
            applicant?.firstName || applicant?.FirstName,
            applicant?.lastName || applicant?.LastName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim();

        const email = (applicant?.email || applicant?.Email || "").trim();
        const phone = onlyDigits(applicant?.phoneNumber || applicant?.PhoneNumber || "");

        const next = {
          testId: resolvedTestId,
          applicantId,
          name: fullName || "",
          email: email || "",
          phone: phone || "",
        };

        if (!mounted) return;

        setForm(next);

        setTestId(resolvedTestId);
        setUser({
          id: applicantId,
          applicantId,
          testId: resolvedTestId,
          name: next.name,
          email: next.email,
          phone: next.phone,
        });
      } catch (err) {
        if (!mounted) return;
        const msg = err?.message || "Unable to load candidate details.";
        setApiError(msg);
        toast.error(msg);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [safeToken, setUser, setTestId, navigate]);

  const handleStart = (e) => {
    e.preventDefault();
    if (checking) return;
    if (apiError) return;

    if (!form.email || form.phone.length !== 10) {
      toast.error("Candidate details are incomplete. Please contact admin.");
      return;
    }

    navigate("/policy", { replace: true });
  };

  if (checking) {
    return <FullPageLoader message="Validating your test link..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg1 bg-cover">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg backdrop-blur-3xl z-50">
        <h2 className="text-2xl font-bold mb-2 text-center">Candidate Details</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Verify your details before starting the assessment.
        </p>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {apiError}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-3">
          <div>
            <label className="text-xs">Full Name</label>
            <input
              className="w-full border border-gray-300 text-sm p-3 rounded-lg outline-none bg-gray-200"
              value={form.name}
              readOnly
              disabled={!!apiError}
            />
          </div>

          <div>
            <label className="text-xs">Email</label>
            <input
              className="w-full border border-gray-300 text-sm p-3 rounded-lg outline-none bg-gray-200"
              value={form.email}
              readOnly
              disabled={!!apiError}
            />
          </div>

          <div>
            <label className="text-xs">Phone Number</label>
            <input
              className="w-full border border-gray-300 text-sm p-3 rounded-lg outline-none bg-gray-200"
              value={form.phone}
              readOnly
              disabled={!!apiError}
            />
          </div>

          <button
            type="submit"
            disabled={!!apiError}
            className="w-full bg-linear-to-r from-blue-500 to-blue-700 cursor-pointer font-semibold text-white p-3 rounded-lg text-base transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Start Test
          </button>
        </form>
      </div>
    </div>
  );
}