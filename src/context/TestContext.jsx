import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TestContext = createContext();
const SUBMITTED_TEST_KEY = "assessment_submitted_test_id";

export const TestProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [testId, setTestId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(() => Boolean(sessionStorage.getItem(SUBMITTED_TEST_KEY)));

  useEffect(() => {
    if (isSubmitted && testId) {
      sessionStorage.setItem(SUBMITTED_TEST_KEY, testId);
      return;
    }

    if (!isSubmitted) {
      sessionStorage.removeItem(SUBMITTED_TEST_KEY);
    }
  }, [isSubmitted, testId]);

  const value = useMemo(
    () => ({
      agreed,
      setAgreed,
      answers,
      setAnswers,
      user,
      setUser,
      testId,
      setTestId,
      isSubmitted,
      setIsSubmitted,
      submittedTestId: sessionStorage.getItem(SUBMITTED_TEST_KEY),
    }),
    [agreed, answers, user, testId, isSubmitted]
  );

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

export const useTest = () => useContext(TestContext);