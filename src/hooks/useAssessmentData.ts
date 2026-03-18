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

      // Guard: do nothing if testId is not ready
      if (!testId) return;

      // Guard: do nothing until user is in context
      if (!user?.id) return;

      try {

        setLoading(true);

        const [rawQuestions, rawTestDetail] = await Promise.all([
          getQuestions(testId),
          getHrTestById(testId),
        ]);

        if (!mounted) return;

        /*
        ─────────────────────────────────────────
        UNWRAP API RESPONSE ENVELOPE
        Both APIs return: { isSuccess, data: {...}, errors, message }
        We must read .data before accessing test/applicant/questions
        ─────────────────────────────────────────
        */
        const r = (rawTestDetail as any);
        const testDetail = r?.data ?? r; // unwrap { isSuccess, data: {...} }

        const test =
          testDetail?.test ??
          testDetail?.Test ??
          null;

        // ── Submitted check ──────────────────────────────────────
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
        ).toString().toLowerCase();

        if (Boolean(submittedAt) || status === "submitted") {
          navigate(`/test/${testId}/already-submitted`, { replace: true });
          return;
        }

        // ── Applicant sync ───────────────────────────────────────
        const applicant =
          testDetail?.applicant ??
          testDetail?.Applicant ??
          null;

        const applicantId =
          applicant?.id ??
          applicant?.Id ??
          testDetail?.applicantId ??
          testDetail?.ApplicantId;

        const finalApplicantId = applicantId || user?.id;

        if (!finalApplicantId) {
          toast.error("Invalid test: applicant not found.");
          navigate("/policy", { replace: true });
          return;
        }

        if (!user?.id || String(user.id) !== String(finalApplicantId)) {
          setUser?.({
            id: finalApplicantId,
            applicantId: finalApplicantId,
            ...(applicant || {}),
          });
        }

        // ── Questions ────────────────────────────────────────────
        // Questions API also returns { isSuccess, data: [...] }
        const qr = (rawQuestions as any);
        const questionList = qr?.data ?? qr;

        const list: Question[] = Array.isArray(questionList)
          ? questionList
          : [];

        const sorted = [...list].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        setQuestions(sorted);

        // ── Duration ─────────────────────────────────────────────
        const durationMinutes = Number(
          test?.durationMinutes ??
          test?.DurationMinutes
        );

        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
          toast.error("Invalid test duration. Please contact HR/admin.");
          navigate("/policy", { replace: true });
          return;
        }

        setDurationSeconds(Math.floor(durationMinutes * 60));

      } catch (e: any) {

        if (!mounted) return;
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

  }, [testId, user?.id]);

  return { questions, loading, durationSeconds };
}