import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getQuestions } from "../api/questionsApi";
import { getHrTestById } from "../api/hrApi";

interface Question {
  id: string;
  order?: number;
}

interface User {
  id?: string;
  applicantId?: string;
  [key: string]: any;
}

interface UseAssessmentDataProps {
  testId: string;
  user: User | null;
  setUser?: (user: User) => void;
}

interface UseAssessmentDataReturn {
  questions: Question[];
  loading: boolean;
  durationSeconds: number | null;
}

export function useAssessmentData({
  testId,
  user,
  setUser,
}: UseAssessmentDataProps): UseAssessmentDataReturn {

  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  useEffect(() => {

    let mounted = true;

    const load = async () => {

      try {

        setLoading(true);

        if (!testId) {
          toast.error("Missing test id. Please open the link again.");
          navigate("/policy", { replace: true });
          return;
        }

        const [questionData, testDetail] = await Promise.all([
          getQuestions(testId),
          getHrTestById(testId),
        ]);

        if (!mounted) return;

        const test =
          (testDetail as any)?.test ??
          (testDetail as any)?.Test ??
          null;

        const submittedAt =
          test?.submittedAtUtc ??
          test?.SubmittedAtUtc ??
          (testDetail as any)?.submittedAtUtc ??
          (testDetail as any)?.SubmittedAtUtc ??
          null;

        const status = (
          test?.status ??
          test?.Status ??
          (testDetail as any)?.status ??
          (testDetail as any)?.Status ??
          ""
        ).toString();

        const isSubmitted =
          Boolean(submittedAt) ||
          status.toLowerCase() === "submitted";

        if (isSubmitted) {
          navigate(`/test/${testId}/already-submitted`, { replace: true });
          return;
        }

        const applicant =
          (testDetail as any)?.applicant ??
          (testDetail as any)?.Applicant ??
          null;

        const applicantId =
          applicant?.id ??
          applicant?.Id ??
          (testDetail as any)?.applicantId ??
          (testDetail as any)?.ApplicantId;

        if (!applicantId) {
          toast.error("Invalid test: applicant not found.");
          navigate("/policy", { replace: true });
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
          (a: Question, b: Question) =>
            (a.order || 0) - (b.order || 0)
        );

        setQuestions(sorted);

        const durationMinutes = Number(
          test?.durationMinutes ?? test?.DurationMinutes
        );

        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
          toast.error("Invalid test duration. Please contact HR/admin.");
          navigate("/policy", { replace: true });
          return;
        }

        setDurationSeconds(Math.floor(durationMinutes * 60));

      } catch (e: any) {

        console.error("Failed to load assessment data", e);
        toast.error(e?.message || "Failed to load assessment data.");
        navigate("/policy", { replace: true });

      } finally {

        if (mounted) setLoading(false);

      }
    };

    load();

    return () => {
      mounted = false;
    };

  }, [testId, navigate, setUser]);

  return {
    questions,
    loading,
    durationSeconds,
  };
}