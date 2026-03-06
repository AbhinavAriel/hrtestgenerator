import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getQuestions } from "../api/questionsApi";
import { getHrTestById } from "../api/hrApi";

export function useAssessmentData({ testId, user, setUser }) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        if (!testId) {
          toast.error("Missing test id. Please open the link again.");
          navigate("/", { replace: true });
          return;
        }

        const [questionData, testDetail] = await Promise.all([
          getQuestions(testId),
          getHrTestById(testId),
        ]);
        if (!mounted) return;

        const test = testDetail?.test ?? testDetail?.Test ?? null;

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
        ).toString();

        const isSubmitted =
          Boolean(submittedAt) || status.toLowerCase() === "submitted";

        if (isSubmitted) {
          navigate(`/test/${testId}/already-submitted`, { replace: true });
          return;
        }

        const applicant = testDetail?.applicant ?? testDetail?.Applicant ?? null;
        const applicantId =
          applicant?.id ??
          applicant?.Id ??
          testDetail?.applicantId ??
          testDetail?.ApplicantId;

        if (!applicantId) {
          toast.error("Invalid test: applicant not found.");
          navigate("/", { replace: true });
          return;
        }

        if (!user?.id || String(user.id) !== String(applicantId)) {
          setUser?.({
            id: applicantId,
            applicantId,
            ...(applicant || {}),
          });
        }

        const list = Array.isArray(questionData) ? questionData : [];
        const sorted = [...list].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setQuestions(sorted);

        const durationMinutes = Number(
          test?.durationMinutes ?? test?.DurationMinutes
        );

        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
          toast.error("Invalid test duration. Please contact HR/admin.");
          navigate("/", { replace: true });
          return;
        }

        setDurationSeconds(Math.floor(durationMinutes * 60));
      } catch (e) {
        console.error("Failed to load assessment data", e);
        toast.error(e?.message || "Failed to load assessment data.");
        navigate("/", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [testId, navigate, setUser]);

  return { questions, loading, durationSeconds };
}