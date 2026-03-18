import { AnswerMap, User } from "./assessment";

export interface TestContextType {
  agreed: boolean;
  setAgreed: (value: boolean) => void;

  answers: AnswerMap;
  setAnswers: React.Dispatch<React.SetStateAction<AnswerMap>>;

  user: User | null;
  // setUser: React.Dispatch<React.SetStateAction<User | null>>;

  setUser: (user: User | null) => void;         // was Dispatch
  setTestId: (id: string | null) => void;      

  testId: string | null;
  // setTestId: (id: string) => void;
}