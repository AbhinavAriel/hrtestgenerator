import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { getHrTestReport } from "../api/hrApi"
import { pillClass } from "../utils/hrHelpers"
import { ReportStatCard } from "../components/report/ReportStatCard"
import { ReportQuestionCard } from "../components/report/ReportQuestionCard"
import type { HrTestReport, ReportQuestion } from "../types/report"

export default function HrTestPreview() {
  const { testId } = useParams<{ testId: string }>()
  const navigate   = useNavigate()

  const [loading, setLoading] = useState(true)
  const [report, setReport]   = useState<HrTestReport | null>(null)

  const goBack = () => {
    if (window.history.length > 1) { navigate(-1); return }
    navigate("/admin", { replace: true })
  }

  useEffect(() => {
    if (!testId) return
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res: any    = await getHrTestReport(testId)
        const outer: any  = res?.data ?? res
        const data: HrTestReport = outer?.isSuccess !== undefined ? outer.data : outer
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

  const questions  = (report.questions  ?? report.Questions  ?? []) as ReportQuestion[]
  const techStacks = (report.techStacks ?? report.TechStacks ?? []) as string[]
  const level      = report.level    ?? report.Level
  const isPassed   = report.isPassed ?? report.IsPassed ?? false

  return (
    <div className="min-h-screen bg-blue-50">

      <div className="max-w-6xl mx-auto py-8 px-4">
        <button onClick={goBack} className="bg-blue-100 border border-blue-200 hover:bg-blue-200 cursor-pointer text-xs py-1 px-3 rounded-lg text-blue-600 font-semibold">
          Go back
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8">

        {/* ── Header card ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Test Preview</h1>
              <p className="text-sm text-gray-500">TestId: <span className="font-mono">{report.testId ?? report.TestId}</span></p>
            </div>
            <div className="flex items-center gap-2">
              {level && (
                <span className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">{level}</span>
              )}
              <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize">
                {report.status ?? report.Status ?? "-"}
              </span>
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${isPassed ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                {isPassed ? "Passed" : "Failed"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 mt-4 gap-3">
            <ReportStatCard label="Total Questions" value={report.totalQuestions ?? report.TotalQuestions ?? 0} border="border-yellow-100" bg="bg-yellow-50" />
            <ReportStatCard label="Duration (min)"  value={report.durationMinutes ?? report.DurationMinutes ?? 0} border="border-blue-100" bg="bg-blue-50" />
            <ReportStatCard label="Answered"        value={report.answeredCount ?? report.AnsweredCount ?? 0} border="border-red-100" bg="bg-red-50" />
            <ReportStatCard label="Correct"         value={report.correctCount ?? report.CorrectCount ?? 0} border="border-green-100" bg="bg-green-50" />
          </div>

          <div className="mt-5">
            <div className="text-sm text-gray-800 mb-2">Candidate</div>
            <div className="grid grid-cols-4 w-full">
              {[
                { label: "name",  value: report.applicantName ?? report.ApplicantName },
                { label: "email", value: report.email ?? report.Email },
                { label: "phone", value: report.phoneNumber ?? report.PhoneNumber },
                { label: "score", value: report.scorePercentage ?? report.ScorePercentage },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold text-sm text-gray-900">{value ?? "-"}</div>
                </div>
              ))}
            </div>
          </div>

          {techStacks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {techStacks.map((t) => (
                <span key={t} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pillClass(t)}`}>
                  {t}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* ── Questions ── */}
        <div className="mt-6 space-y-4">
          {questions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              No questions found for this test.
            </div>
          ) : (
            questions.map((q) => (
              <ReportQuestionCard key={q.questionId ?? q.QuestionId} q={q} />
            ))
          )}
        </div>

      </div>
    </div>
  )
}