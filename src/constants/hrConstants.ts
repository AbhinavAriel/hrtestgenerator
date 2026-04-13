import { HrForm } from "../types/hr"

export const DEFAULT_FORM: HrForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  totalQuestions: "10",
  durationMinutes: "20",
  techStacks: [],
}

export const LEVELS = ["Beginner", "Intermediate", "Professional"] as const
export type Level = typeof LEVELS[number]