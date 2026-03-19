import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { getHrTestReport } from "../api/hrApi"
import type { HrTestReport, ReportQuestion, ReportOption } from "../types/report"
import { pillClass } from "../utils/hrHelpers"


function StatCard({ label, value, border, bg }: { label: string; value: number; border: string; bg: string }) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-3 shadow-md`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}

function CandidateInfo({ report }: { report: HrTestReport }) {
  return (
    <div className="mt-5">
      <div className="text-sm text-gray-800 mb-2">Candidate</div>
      <div className="grid grid-cols-3 w-full">
        {[
          { label: "name",  value: report.applicantName ?? report.ApplicantName },
          { label: "email", value: report.email ?? report.Email },
          { label: "phone", value: report.phoneNumber ?? report.PhoneNumber },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-semibold text-sm text-gray-900">{value ?? "-"}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptionRow({ opt, selectedId, correctId }: {
  opt: ReportOption
  selectedId?: string | number | null
  correctId?: string | number | null
}) {
  const optId   = opt.id   ?? opt.Id
  const optText = opt.text ?? opt.Text
  const isSelected   = Boolean(selectedId && optId === selectedId)
  const isCorrectOpt = Boolean(correctId  && optId === correctId)

  return (
    <div className={`rounded-lg border px-4 py-2 text-sm flex items-center justify-between
      ${isSelected   ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      ${isCorrectOpt ? "border-green-500" : ""}`}
    >
      <span className="text-gray-800">{optText}</span>
      <div className="flex gap-2">
        {isSelected   && <Badge color="blue">Selected</Badge>}
        {isCorrectOpt && <Badge color="green">Correct</Badge>}
      </div>
    </div>
  )
}

function Badge({ color, children }: { color: "blue" | "green"; children: string }) {
  const cls = color === "blue"
    ? "bg-blue-100 text-blue-700"
    : "bg-green-100 text-green-700"
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>
      {children}
    </span>
  )
}

function QuestionCard({ q }: { q: ReportQuestion }) {
  const questionId = q.questionId ?? q.QuestionId
  const order      = q.order      ?? q.Order
  const text       = q.text       ?? q.Text
  const selectedId = q.selectedOptionId ?? q.SelectedOptionId
  const correctId  = q.correctOptionId  ?? q.CorrectOptionId
  const isCorrect  = q.isCorrect  ?? q.IsCorrect
  const options    = q.options    ?? q.Options ?? []

  const statusLabel = selectedId ? (isCorrect ? "correct" : "wrong") : "skipped"
  const statusCls   = isCorrect
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"

  return (
    <div key={questionId} className="rounded-xl border border-gray-300 p-4 mb-4 bg-white shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Question {order}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCls}`}>
          {statusLabel}
        </span>
      </div>

      <p className="my-2 text-gray-800 font-semibold">{text}</p>

      <div className="grid grid-cols-2 gap-4">
        {(options as ReportOption[]).map((opt) => (
          <OptionRow
            key={opt.id ?? opt.Id}
            opt={opt}
            selectedId={selectedId}
            correctId={correctId}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function HrTestPreview() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [report, setReport]   = useState<HrTestReport | null>(null)

  const goBack = () => {
    if (window.history.length > 1) { navigate(-1); return }
    navigate("/admin", { replace: true })
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await getHrTestReport(testId)
        if (mounted) setReport(data)
      } catch (e: any) {
        toast.error(e?.message || "Failed to load report")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [testId])

  if (loading) return <div className="min-h-screen p-6 text-gray-600">Loading report...</div>
  if (!report)  return <div className="min-h-screen p-6 text-gray-600">No report found.</div>

  const questions  = report.questions  ?? report.Questions  ?? []
  const techStacks = report.techStacks ?? report.TechStacks ?? []

  return (
    <div className="min-h-screen bg-blue-50">

      <div className="max-w-6xl mx-auto py-8">
        <button onClick={goBack} className="bg-blue-100 border border-blue-200 hover:bg-blue-200 cursor-pointer text-xs py-1 px-3 rounded-lg text-blue-600 font-semibold">
          Go back
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8">

        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Test Preview</h1>
              <p className="text-sm text-gray-600">
                TestId: <span className="font-mono">{report.testId ?? report.TestId}</span>
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize">
              {report.status ?? report.Status ?? "-"}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 mt-4 gap-3">
            <StatCard label="Total Questions" value={report.totalQuestions ?? report.TotalQuestions ?? 0} border="border-yellow-100" bg="bg-yellow-50" />
            <StatCard label="Duration (min)"  value={report.durationMinutes ?? report.DurationMinutes ?? 0} border="border-blue-100"   bg="bg-blue-50"   />
            <StatCard label="Answered"        value={report.answeredCount   ?? report.AnsweredCount   ?? 0} border="border-red-100"    bg="bg-red-50"    />
            <StatCard label="Correct"         value={report.correctCount    ?? report.CorrectCount    ?? 0} border="border-green-100"  bg="bg-green-50"  />
          </div>

          <CandidateInfo report={report} />

          {/* Tech stacks */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(techStacks as string[]).map((t) => (
              <span key={t} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pillClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="mt-6 space-y-4">
          {questions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              No questions found for this test.
            </div>
          ) : (
            (questions as ReportQuestion[]).map((q) => (
              <QuestionCard key={q.questionId ?? q.QuestionId} q={q} />
            ))
          )}
        </div>

      </div>
    </div>
  )
}