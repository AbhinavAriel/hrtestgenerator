import { createContext, useContext, useState } from "react";

const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [testId, setTestId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <TestContext.Provider
      value={{
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
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => useContext(TestContext);
