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
  const startedRef = useRef<boolean>(false); // prevents double-start

  // Always keep onExpire current inside the interval without re-creating it
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Initialise totalTime as soon as durationSeconds arrives from data hook
  useEffect(() => {
    if (startSeconds == null) return;

    setTotalTime(startSeconds);
    totalTimeRef.current = startSeconds;
    initialSecondsRef.current = startSeconds;

  }, [startSeconds]);

  /*
  ─────────────────────────────────────────────────────────
  START THE COUNTDOWN
  Deps include totalTime so this effect re-evaluates after
  the initialise effect above sets it. Once the interval is
  started (startedRef = true) the effect cleans up and does
  NOT create a second interval on subsequent renders.
  ─────────────────────────────────────────────────────────
  */
  useEffect(() => {

    // Not ready yet
    if (loading || !hasQuestions || totalTime === null || submittedRef.current) {
      return;
    }

    // Already counting — don't start a second interval
    if (startedRef.current) return;

    // Time already expired before interval even started
    if (totalTime <= 0) {
      onExpireRef.current();
      return;
    }

    startedRef.current = true;

    const timer = setInterval(() => {

      setTotalTime((prev) => {

        const next = (prev ?? 0) - 1;
        totalTimeRef.current = next;

        if (next <= 0) {
          clearInterval(timer);
          onExpireRef.current();
          return 0;
        }

        return next;
      });

    }, 1000);

    return () => {
      clearInterval(timer);
      startedRef.current = false; // allow restart if component remounts
    };

  }, [loading, hasQuestions, totalTime, submittedRef]);

  const calcElapsedSeconds = (): number => {
    const initial = initialSecondsRef.current;
    const remaining = totalTimeRef.current;

    if (!Number.isFinite(initial) || !Number.isFinite(remaining)) return 0;

    return Math.max(0, Math.floor((initial as number) - (remaining as number)));
  };

  return {
    totalTime,
    totalTimeRef,
    calcElapsedSeconds,
  };
}