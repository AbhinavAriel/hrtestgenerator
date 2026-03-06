import { useEffect, useRef, useState } from "react";

/**
 * Countdown timer for the assessment.
 * Returns { totalTime, totalTimeRef, initialSecondsRef, calcElapsedSeconds }
 *
 * Starts ticking once `startSeconds` is set (non-null) and questions are loaded.
 * Calls `onExpire` when the timer reaches zero.
 *
 * @param {{ startSeconds: number|null, loading: boolean, hasQuestions: boolean, submittedRef: React.MutableRefObject<boolean>, onExpire: () => void }} opts
 */
export function useAssessmentTimer({ startSeconds, loading, hasQuestions, submittedRef, onExpire }) {
    const [totalTime, setTotalTime] = useState(null);
    const totalTimeRef = useRef(null);
    const initialSecondsRef = useRef(null);

    // Sync initial value when startSeconds arrives
    useEffect(() => {
        if (startSeconds == null) return;
        setTotalTime(startSeconds);
        totalTimeRef.current = startSeconds;
        initialSecondsRef.current = startSeconds;
    }, [startSeconds]);

    // Tick
    useEffect(() => {
        if (loading || !hasQuestions || totalTime === null || submittedRef.current) return;

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
    }, [totalTime, loading, hasQuestions]);

    const calcElapsedSeconds = () => {
        const initial = initialSecondsRef.current;
        const remaining = totalTimeRef.current;
        if (!Number.isFinite(initial) || !Number.isFinite(remaining)) return 0;
        return Math.max(0, Math.floor(initial - remaining));
    };

    return { totalTime, totalTimeRef, calcElapsedSeconds };
}
