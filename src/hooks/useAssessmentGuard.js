import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export function useAssessmentGuard({ submittedRef, onAutoSubmit, incrementTabWarning }) {
  const warningsRef = useRef(0);
  const autoSubmittingRef = useRef(false);

  useEffect(() => {
    const warn = () => {
      if (submittedRef?.current) return;
      if (autoSubmittingRef.current) return;

      warningsRef.current += 1;
      incrementTabWarning?.();

      const w = warningsRef.current;

      if (w < 6) {
        toast.error(`You cannot switch tabs during the assessment. Warning ${w}/3`);
        return;
      }

      toast.error("Too many violations. Submitting your test now...");
      autoSubmittingRef.current = true;

      Promise.resolve(onAutoSubmit?.()).finally(() => {
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") warn();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [submittedRef, onAutoSubmit, incrementTabWarning]);
}