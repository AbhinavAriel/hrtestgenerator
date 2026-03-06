import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useTest } from "../context/TestContext";
import OptionCard from "../components/OptionCard";
import { formatTime } from "../lib/format";
import { useAssessmentData } from "../hooks/useAssessmentData";
import { useAssessmentTimer } from "../hooks/useAssessmentTimer";
import { useAssessmentGuard } from "../hooks/useAssessmentGuard";
import { useAssessmentActions } from "../hooks/useAssessmentActions";
import { useAssessmentSecurity } from "../hooks/useAssessmentSecurity"; 

export default function Assessment() {
  const navigate = useNavigate();
  const { testId: routeTestId } = useParams();
  const ctx = useTest();

  const { agreed, answers, setAnswers, user, setUser, testId: ctxTestId } = ctx;
  const testId = (ctxTestId || routeTestId || "").trim();

  useEffect(() => {
    if (!agreed) navigate("/policy", { replace: true });
  }, [agreed, navigate]);

  const { questions, loading, durationSeconds } = useAssessmentData({ testId, user, setUser });

  const {
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
  } = useAssessmentActions({
    testId,
    questions,
    answers,
    setAnswers,
    user,
    ctx,
    calcElapsedSeconds: () => calcElapsedSeconds(),
  });

  const { totalTime, calcElapsedSeconds } = useAssessmentTimer({
    startSeconds: durationSeconds,
    loading,
    hasQuestions: questions.length > 0,
    submittedRef,
    onExpire: handleSubmit,
  });

  useAssessmentGuard({
    submittedRef,
    onAutoSubmit: handleSubmit,
    incrementTabWarning,
  });

  const { containerProps } = useAssessmentSecurity({
    enabled: !loading && questions.length > 0 && !submittedRef.current, 
    submittedRef,
    maxWarnings: 5,
    onViolation: () => incrementTabWarning(),
    onAutoSubmit: handleSubmit,
    blockSelection: true,
    blockCopy: true,
    blockContextMenu: true,
    blockDevtoolsShortcuts: true,
    detectTabSwitch: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-xl p-8">Loading assessment...</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-xl p-8">No questions found. Please seed the database.</div>
      </div>
    );
  }

  const selected = answers?.[currentQuestion?.id] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen flex bg-gray-100" {...containerProps}>
      <div className="flex-1 flex flex-col">
        <div className="bg-white px-8 py-4 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
            <div className="text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div
              className={`font-semibold text-lg ${
                (totalTime ?? 0) < 60 ? "text-red-600 animate-pulse" : "text-blue-600"
              }`}
            >
              ⏳ {formatTime(totalTime ?? 0)}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-200 flex justify-center items-center p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-10">
            <h2 className="text-lg font-semibold mb-8 text-gray-800">{currentQuestion.text}</h2>

            <div className="grid grid-cols-2 gap-4">
              {(currentQuestion.options || []).map((opt, index) => (
                <OptionCard
                  key={opt.id}
                  name={`question-${currentQuestion.id}`}
                  option={opt.text}
                  index={index}
                  selected={selected === opt.id}
                  onSelect={() => handleSelect(opt.id)}
                />
              ))}
            </div>

            <div className="flex justify-between items-center mt-10">
              <div className="text-xs text-gray-500">
                {tabWarnings > 0 ? `Warnings: ${tabWarnings}/5` : ""}
              </div>

              <div className="flex gap-3">
                <button
                  disabled={currentIndex === 0 || savingRef.current}
                  onClick={handlePrev}
                  className={`px-6 py-3 text-sm rounded-xl font-medium transition ${
                    currentIndex === 0 || savingRef.current
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  Previous
                </button>

                <button
                  disabled={savingRef.current}
                  onClick={isLastQuestion ? handleSubmit : handleNext}
                  className={`px-6 py-3 text-sm rounded-xl text-white font-medium transition ${
                    savingRef.current ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {savingRef.current ? "Saving..." : isLastQuestion ? "Submit Test" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}