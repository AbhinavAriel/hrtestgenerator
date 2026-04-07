export interface ReportOption {
  id?: string | number
  Id?: string | number
  text?: string
  Text?: string
}

export interface ReportQuestion {
  questionId?: string | number
  QuestionId?: string | number
  order?: number
  Order?: number
  text?: string
  Text?: string
  selectedOptionId?: string | number
  SelectedOptionId?: string | number
  correctOptionId?: string | number
  CorrectOptionId?: string | number
  isCorrect?: boolean
  IsCorrect?: boolean
  options?: ReportOption[]
  Options?: ReportOption[]
}

export interface HrTestReport {
  testId?: string | number
  TestId?: string | number
  status?: string
  Status?: string
  totalQuestions?: number
  TotalQuestions?: number
  durationMinutes?: number
  DurationMinutes?: number
  answeredCount?: number
  AnsweredCount?: number
  correctCount?: number
  CorrectCount?: number
  scorePercentage?: number
  ScorePercentage?: number
  isPassed?: boolean
  IsPassed?: boolean
  isRejected?: boolean
  IsRejected?: boolean
  cancellationReason?: string   // reason stored when admin cancels result
  CancellationReason?: string
  applicantName?: string
  ApplicantName?: string
  email?: string
  Email?: string
  phoneNumber?: string
  PhoneNumber?: string
  techStacks?: string[]
  TechStacks?: string[]
  questions?: ReportQuestion[]
  Questions?: ReportQuestion[]
  level?: string
  Level?: string
  applicantId?: string
  ApplicantId?: string
  createdAtUtc?: string
  submittedAtUtc?: string
}

export interface HrTestReportViewProps {
  report?: HrTestReport | null
  loading?: boolean
  /** Called after admin successfully cancels the result — parent can refresh data */
  onCancelResult?: (testId: string, reason: string) => Promise<void>
}