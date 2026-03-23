import { createContext, useContext, useState, ReactNode, useCallback } from "react"

interface User {
  id?: string
  name?: string
  email?: string
  phone?: string
  applicantId?: string
  userId?: string
  [key: string]: any
}

type AnswerMap = Record<string, string | null>

interface TestContextType {
  user: User | null
  setUser: (user: User | null) => void

  agreed: boolean
  setAgreed: (value: boolean) => void

  answers: AnswerMap
  setAnswers: React.Dispatch<React.SetStateAction<AnswerMap>>

  testId: string | null
  setTestId: (id: string | null) => void

  isSubmitted: boolean
  setIsSubmitted: (value: boolean) => void
}

const TestContext = createContext<TestContextType | undefined>(undefined)

export function TestProvider({ children }: { children: ReactNode }) {

  const [user, setUserState] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [testId, setTestIdState] = useState<string | null>(() => {
    return sessionStorage.getItem("testId");
  });

  const [agreed, setAgreedState] = useState(() => {
    return sessionStorage.getItem("agreed") === "true";
  });

  const [answers, setAnswers] = useState<AnswerMap>({});

  const [isSubmitted, setIsSubmittedState] = useState<boolean>(false);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) sessionStorage.setItem("user", JSON.stringify(u));
    else sessionStorage.removeItem("user");
  }, []);

  const setTestId = useCallback((id: string | null) => {
    setTestIdState(id);
    if (id) {
      sessionStorage.setItem("testId", id);
    } else {
      sessionStorage.removeItem("testId");
    }
    // Reset agreed whenever a new testId is set so stale agreed=true never carries over
    setAgreedState(false);
    sessionStorage.setItem("agreed", "false");
  }, []);

  const setAgreed = useCallback((val: boolean) => {
    setAgreedState(val);
    sessionStorage.setItem("agreed", String(val));
  }, []);

  const setIsSubmitted = useCallback((val: boolean) => {
    setIsSubmittedState(val);
  }, []);

  return (
    <TestContext.Provider
      value={{
        user,
        setUser,
        agreed,
        setAgreed,
        answers,
        setAnswers,
        testId,
        setTestId,
        isSubmitted,
        setIsSubmitted,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext)

  if (!context) {
    throw new Error("useTest must be used inside TestProvider")
  }

  return context
}