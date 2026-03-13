import { createContext, useContext, useState, ReactNode } from "react"

interface User {
  id: string
  name?: string
  email?: string
  phone?: string
}

type AnswerMap = Record<string, string>

interface TestContextType {
  user: User | null
  setUser: (user: User | null) => void

  agreed: boolean
  setAgreed: (value: boolean) => void

  answers: AnswerMap
  setAnswers: React.Dispatch<React.SetStateAction<AnswerMap>>

  testId: string | null
  setTestId: (id: string | null) => void
}

const TestContext = createContext<TestContextType | undefined>(undefined)

export function TestProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [testId, setTestId] = useState<string | null>(null)

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
        setTestId
      }}
    >
      {children}
    </TestContext.Provider>
  )
}

export function useTest() {
  const context = useContext(TestContext)

  if (!context) {
    throw new Error("useTest must be used inside TestProvider")
  }

  return context
}