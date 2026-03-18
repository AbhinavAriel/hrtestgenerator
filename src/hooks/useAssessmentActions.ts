import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { submitAnswer } from "../api/answersApi";
import { submitHrTest } from "../api/hrApi";

import type { RefObject } from "react";

interface Question {
  id: string;
}

interface User {
  applicantId?: string;
  id?: string;
  userId?: string;
}

type AnswerMap = Record<string, string | null>;

interface UseAssessmentActionsProps {
  testId: string;
  questions: Question[];
  answers: AnswerMap;
  setAnswers: React.Dispatch<React.SetStateAction<AnswerMap>>;
  user: User | null;
  ctx: any;
  calcElapsedSeconds?: (() => number) | undefined; // optional — wired from useAssessmentTimer
}

interface UseAssessmentActionsReturn {
  currentIndex: number;
  currentQuestion: Question | null;
  tabWarnings: number;
  incrementTabWarning: () => void;
  submittedRef: RefObject<boolean>;
  savingRef: RefObject<boolean>;
  handleSelect: (optionId: string) => void;
  handlePrev: () => Promise<void>;
  handleNext: () => Promise<void>;
  handleSubmit: () => Promise<void>;
}

export function useAssessmentActions({
  testId,
  questions,
  answers,
  setAnswers,
  user,
  ctx,
  calcElapsedSeconds,
}: UseAssessmentActionsProps): UseAssessmentActionsReturn {

  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [tabWarnings, setTabWarnings] = useState<number>(0);

  const submittedRef = useRef<boolean>(false);
  const savingRef = useRef<boolean>(false);

  const answersRef = useRef<AnswerMap>(answers);

  // Keep a stable ref to calcElapsedSeconds so closures always get latest version
  const calcElapsedRef = useRef<(() => number) | undefined>(calcElapsedSeconds);
  useEffect(() => {
    calcElapsedRef.current = calcElapsedSeconds;
  }, [calcElapsedSeconds]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [testId]);

  const currentQuestion: Question | null = questions?.[currentIndex] ?? null;

  const getApplicantId = (): string | undefined =>
    user?.applicantId || user?.id || user?.userId;

  const getElapsed = (): number =>
    typeof calcElapsedRef.current === "function"
      ? calcElapsedRef.current()
      : 0;

  const handleSelect = (optionId: string): void => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...(prev || {}),
      [currentQuestion.id]: optionId,
    }));
  };

  const saveCurrentAnswer = async ({
    allowSkip = true,
  }: { allowSkip?: boolean } = {}): Promise<boolean> => {

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
        elapsedSeconds: getElapsed(),
      });

      return true;
    } catch (e: any) {
      console.error("Save answer failed", e);
      toast.error(e?.message || "Failed to save answer.");
      return false;
    } finally {
      savingRef.current = false;
    }
  };

  const submitAllAnswers = async (): Promise<boolean> => {

    const applicantId = getApplicantId();

    if (!applicantId) {
      toast.error("Missing applicant id. Please restart test.");
      return false;
    }

    if (!testId) {
      toast.error("Missing test id. Please open the test link again.");
      return false;
    }

    const elapsedSeconds = getElapsed();

    for (const q of questions || []) {

      const selectedOptionId = answersRef.current?.[q.id] ?? null;

      try {
        await submitAnswer({
          testId,
          applicantId,
          questionId: q.id,
          selectedOptionId,
          elapsedSeconds,
        });
      } catch (e: any) {
        console.error("Submit answer failed for question:", q?.id, e);
        toast.error(e?.message || "Failed to submit answers.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {

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

    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to submit test.");
      submittedRef.current = false;
    }
  };

  const handlePrev = async (): Promise<void> => {

    if (!currentQuestion || submittedRef.current) return;

    await saveCurrentAnswer({ allowSkip: true });

    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = async (): Promise<void> => {

    if (!currentQuestion || submittedRef.current) return;

    const ok = await saveCurrentAnswer({ allowSkip: true });

    if (!ok) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const incrementTabWarning = (): void =>
    setTabWarnings((w) => w + 1);

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