import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { submitAnswer } from "../api/answersApi";
import { submitHrTest } from "../api/hrApi";

export function useAssessmentActions({
  testId,
  questions,
  answers,
  setAnswers,
  user,
  ctx,
  calcElapsedSeconds,
}) {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);

  const submittedRef = useRef(false);
  const savingRef = useRef(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [testId]);

  const currentQuestion = questions?.[currentIndex] ?? null;

  const getApplicantId = () => user?.applicantId || user?.id || user?.userId;

  const handleSelect = (optionId) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({ ...(prev || {}), [currentQuestion.id]: optionId }));
  };


  const saveCurrentAnswer = async ({ allowSkip = true } = {}) => {
    if (!currentQuestion) return true;

    const applicantId = getApplicantId();
    if (!applicantId) {
      toast.error("Missing applicant id. Please restart test.");
      return false;
    }

    if (!testId) {
      toast.error("Missing test id. Please open the test link again.");
      return false;
    }

    const selectedOptionId = answersRef.current?.[currentQuestion.id] ?? null;

    if (!selectedOptionId) {
      return allowSkip ? true : false;
    }

    if (savingRef.current) return false;
    savingRef.current = true;

    try {
      await submitAnswer({
        testId,
        applicantId,
        questionId: currentQuestion.id,
        selectedOptionId,
        elapsedSeconds: typeof calcElapsedSeconds === "function" ? calcElapsedSeconds() : 0,
      });
      return true;
    } catch (e) {
      console.error("Save answer failed", e);
      toast.error(e?.message || "Failed to save answer.");
      return false;
    } finally {
      savingRef.current = false;
    }
  };

  const submitAllAnswers = async () => {
    const applicantId = getApplicantId();
    if (!applicantId) {
      toast.error("Missing applicant id. Please restart test.");
      return false;
    }

    if (!testId) {
      toast.error("Missing test id. Please open the test link again.");
      return false;
    }

    const elapsedSeconds = typeof calcElapsedSeconds === "function" ? calcElapsedSeconds() : 0;

    for (const q of questions || []) {
      const selectedOptionId = answersRef.current?.[q.id] ?? null;

      try {
        if (selectedOptionId) {
          await submitAnswer({
            testId,
            applicantId,
            questionId: q.id,
            selectedOptionId,
            elapsedSeconds,
          });
          continue;
        }

        await submitAnswer({
          testId,
          applicantId,
          questionId: q.id,
          selectedOptionId: null,
          elapsedSeconds,
        });
      } catch (e) {
        console.error("Submit answer failed for question:", q?.id, e);
        toast.error(e?.message || "Failed to submit answers.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      const okCurrent = await saveCurrentAnswer({ allowSkip: true });
      if (!okCurrent) {
        submittedRef.current = false;
        return;
      }

      const okAll = await submitAllAnswers();
      if (!okAll) {
        submittedRef.current = false;
        return;
      }

      await submitHrTest(testId);

      ctx.setIsSubmitted?.(true);
      navigate("/result", { replace: true, state: { testId } });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to submit test.");
      submittedRef.current = false;
    }
  };

  const handlePrev = async () => {
    if (!currentQuestion || submittedRef.current) return;

    await saveCurrentAnswer({ allowSkip: true });

    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = async () => {
    if (!currentQuestion || submittedRef.current) return;

    const ok = await saveCurrentAnswer({ allowSkip: true });
    if (!ok) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const incrementTabWarning = () => setTabWarnings((w) => w + 1);

  return {
    currentIndex,
    currentQuestion,
    tabWarnings,
    incrementTabWarning,
    submittedRef,
    savingRef,
    handleSelect,
    handlePrev,
    handleNext,
    handleSubmit,
  };
}