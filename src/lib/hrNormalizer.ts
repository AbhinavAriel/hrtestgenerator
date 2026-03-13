import { HrRow } from "../types/hr"

export const normalizeRow = (r: any): HrRow => {
  if (!r || typeof r !== "object") return r

  return {
    serialNo: r.serialNo ?? r.SerialNo ?? null,
    testId: r.testId ?? r.TestId ?? r.id ?? r.Id ?? null,
    applicantId: r.applicantId ?? r.ApplicantId ?? null,
    applicantName: r.applicantName ?? r.ApplicantName ?? r.fullName ?? r.FullName ?? null,
    email: r.email ?? r.Email ?? null,
    phoneNumber: r.phoneNumber ?? r.PhoneNumber ?? null,
    level: r.level ?? r.Level ?? null,
    totalQuestions: r.totalQuestions ?? r.TotalQuestions ?? null,
    durationMinutes: r.durationMinutes ?? r.DurationMinutes ?? null,
    techStacks: r.techStacks ?? r.TechStacks ?? [],
    status: r.status ?? r.Status ?? "Created",
    answeredCount: r.answeredCount ?? r.AnsweredCount ?? 0,
    correctCount: r.correctCount ?? r.CorrectCount ?? 0,
    createdAtUtc: r.createdAtUtc ?? r.CreatedAtUtc ?? null,
    submittedAtUtc: r.submittedAtUtc ?? r.SubmittedAtUtc ?? null,
    testToken: r.testToken ?? r.TestToken ?? null,
    expiresAtUtc: r.expiresAtUtc ?? r.ExpiresAtUtc ?? null,
  }
}