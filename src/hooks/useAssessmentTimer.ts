import { useEffect, useRef, useState } from "react";

interface UseAssessmentTimerProps {
  startSeconds: number | null;
  loading: boolean;
  hasQuestions: boolean;
  submittedRef: React.RefObject<boolean>;
  onExpire: () => void;
}

interface UseAssessmentTimerReturn {
  totalTime: number | null;
  totalTimeRef: React.MutableRefObject<number | null>;
  calcElapsedSeconds: () => number;
}

export function useAssessmentTimer({
  startSeconds,
  loading,
  hasQuestions,
  submittedRef,
  onExpire,
}: UseAssessmentTimerProps): UseAssessmentTimerReturn {

  const [totalTime, setTotalTime] = useState<number | null>(null);

  const totalTimeRef = useRef<number | null>(null);
  const initialSecondsRef = useRef<number | null>(null);

  useEffect(() => {
    if (startSeconds == null) return;

    setTotalTime(startSeconds);
    totalTimeRef.current = startSeconds;
    initialSecondsRef.current = startSeconds;

  }, [startSeconds]);

  useEffect(() => {

    if (
      loading ||
      !hasQuestions ||
      totalTime === null ||
      submittedRef.current
    )
      return;

    if (totalTime <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {

      setTotalTime((prev) => {

        const next = (prev ?? 0) - 1;

        totalTimeRef.current = next;

        if (next <= 0) {
          clearInterval(timer);
          onExpire();
          return 0;
        }

        return next;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [totalTime, loading, hasQuestions, submittedRef, onExpire]);

  const calcElapsedSeconds = (): number => {

    const initial = initialSecondsRef.current;
    const remaining = totalTimeRef.current;

    if (!Number.isFinite(initial) || !Number.isFinite(remaining))
      return 0;

    return Math.max(0, Math.floor(initial - remaining));

  };

  return {
    totalTime,
    totalTimeRef,
    calcElapsedSeconds,
  };
}