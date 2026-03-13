import { AnswerMap, User } from "./assessment";

export interface TestContextType {
  agreed: boolean;
  setAgreed: (value: boolean) => void;

  answers: AnswerMap;
  setAnswers: React.Dispatch<React.SetStateAction<AnswerMap>>;

  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  testId: string | null;
  setTestId: (id: string) => void;
}