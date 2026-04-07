import type { HrTestReport } from "../../types/report"
import { pillClass } from "../../utils/hrHelpers"
import { ReportStatCard } from "./ReportStatCard"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportHeaderProps {
  report: HrTestReport
  isRejected: boolean
  onCancelClick: () => void
}

// ─── Candidate info row ───────────────────────────────────────────────────────

function CandidateField({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-sm text-gray-900">{value ?? "-"}</div>
    </div>
  )
}

// ─── Cancellation reason banner ───────────────────────────────────────────────

function CancellationBanner({ reason }: { reason: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
      <svg
        className="w-4 h-4 text-orange-500 shrink-0 mt-0.5"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
      </svg>
      <div>
        <p className="text-xs font-semibold text-orange-700">Cancellation Reason</p>
        <p className="text-xs text-orange-600 mt-0.5">{reason}</p>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ReportHeader({ report, isRejected, onCancelClick }: ReportHeaderProps) {
  const level      = report.level ?? report.Level
  const isPassed   = report.isPassed ?? report.IsPassed ?? false
  const techStacks = (report.techStacks ?? report.TechStacks ?? []) as string[]
  const status     = (report.status ?? report.Status ?? "").toLowerCase()
  const isSubmitted = status === "submitted"

  const cancellationReason =
    report.cancellationReason ?? report.CancellationReason ?? null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">

      {/* ── Title row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Test Preview</h1>
          <p className="text-sm text-gray-500">
            TestId: <span className="font-mono">{report.testId ?? report.TestId}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Level pill */}
          {level && (
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
              {level}
            </span>
          )}

          {/* Status pill */}
          <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize">
            {report.status ?? report.Status ?? "-"}
          </span>

          {/* Pass / Fail / Cancelled pill */}
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            isRejected
              ? "bg-orange-100 text-orange-700 border border-orange-200"
              : isPassed
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            {isRejected ? "Cancelled" : isPassed ? "Passed" : "Failed"}
          </span>

          {/* Cancel button — shown for all submitted, non-cancelled tests */}
          {isSubmitted && !isRejected && (
            <button
              onClick={onCancelClick}
              className="inline-flex items-center gap-1.5 rounded-full cursor-pointer px-3 py-1
                text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border border-red-700 transition"
            >
              ✕ Cancel Result
            </button>
          )}
        </div>
      </div>

      {/* Cancellation reason banner (visible once cancelled) */}
      {isRejected && cancellationReason && (
        <CancellationBanner reason={cancellationReason} />
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 mt-4 gap-3">
        <ReportStatCard
          label="Total Questions"
          value={report.totalQuestions ?? report.TotalQuestions ?? 0}
          border="border-yellow-100"
          bg="bg-yellow-50"
        />
        <ReportStatCard
          label="Duration (min)"
          value={report.durationMinutes ?? report.DurationMinutes ?? 0}
          border="border-blue-100"
          bg="bg-blue-50"
        />
        <ReportStatCard
          label="Answered"
          value={report.answeredCount ?? report.AnsweredCount ?? 0}
          border="border-red-100"
          bg="bg-red-50"
        />
        <ReportStatCard
          label="Correct"
          value={report.correctCount ?? report.CorrectCount ?? 0}
          border="border-green-100"
          bg="bg-green-50"
        />
      </div>

      {/* ── Candidate info ── */}
      <div className="mt-5">
        <div className="text-sm text-gray-800 mb-2">Candidate</div>
        <div className="grid grid-cols-4 w-full">
          <CandidateField label="name"  value={report.applicantName ?? report.ApplicantName} />
          <CandidateField label="email" value={report.email         ?? report.Email} />
          <CandidateField label="phone" value={report.phoneNumber   ?? report.PhoneNumber} />
          <CandidateField label="score" value={report.scorePercentage ?? report.ScorePercentage} />
        </div>
      </div>

      {/* ── Tech stacks ── */}
      {techStacks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {techStacks.map((t) => (
            <span
              key={t}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pillClass(t)}`}
            >
              {t}
            </span>
          ))}
        </div>
      )}

    </div>
  )
}