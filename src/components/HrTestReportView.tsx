import { useEffect, useState } from "react"
import { HrTestReportViewProps } from "../types/report"
import { pillClass } from "../utils/hrHelpers"
import { getSnapshots, SnapshotRecord } from "../api/snapShot"

function SnapshotGallery({
  snapshots,
  loading,
}: {
  snapshots: SnapshotRecord[]
  loading: boolean
}) {
  const [selected, setSelected] = useState<SnapshotRecord | null>(null)

  return (
    <div className="mt-6">
      <h2 className="text-base font-bold text-gray-900 mb-3">
        Captured Snapshots
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({snapshots.length} captured)
        </span>
      </h2>

      {loading && (
        <div className="text-sm text-gray-500 py-4">Loading snapshots…</div>
      )}

      {!loading && snapshots.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          No proctoring snapshots found for this test.
        </div>
      )}

      {!loading && snapshots.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {snapshots.map((snap) => (
            <button
              key={snap.id}
              onClick={() => setSelected(snap)}
              className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:border-blue-400 transition"
              title={new Date(snap.capturedAt).toLocaleString()}
            >
              <img
                src={snap.imageUrl}
                alt={`Snapshot at ${snap.capturedAt}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
                {new Date(snap.capturedAt).toLocaleTimeString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.imageUrl}
              alt="Snapshot"
              className="w-full"
            />
            <div className="bg-white px-4 py-2 text-xs text-gray-600 flex justify-between items-center">
              <span>Captured: {new Date(selected.capturedAt).toLocaleString()}</span>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-base"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default function HrTestReportView({
  report,
  loading = false,
}: HrTestReportViewProps) {

  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([])
  const [loadingSnapshots, setLoadingSnapshots] = useState(false)

  const testId = report?.testId ?? report?.TestId

  useEffect(() => {
    if (!testId) return

    let mounted = true
    setLoadingSnapshots(true)

    getSnapshots(String(testId))
      .then((snaps) => {
        if (mounted) setSnapshots((snaps as SnapshotRecord[]) ?? [])
      })
      .catch(() => {
        // snapshot errors are supplementary — silently ignore
      })
      .finally(() => {
        if (mounted) setLoadingSnapshots(false)
      })

    return () => { mounted = false }
  }, [testId])

  if (loading) {
    return <div className="p-6 text-gray-600">Loading report...</div>
  }

  if (!report) {
    return <div className="p-6 text-gray-600">No report found.</div>
  }

  const questions  = report.questions  ?? report.Questions  ?? []
  const techStacks = report.techStacks ?? report.TechStacks ?? []
  const isPassed   = report.isPassed   ?? report.IsPassed   ?? false

  return (
    <div className="rounded-b-2xl rounded-tr-2xl border border-t-0 border-gray-200 bg-white p-6 shadow-2xl">

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Test Preview</h1>
            <p className="text-sm text-gray-600">
              TestId: <span className="font-mono">{report.testId ?? report.TestId}</span>
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize">
              {report.status ?? report.Status ?? "-"}
            </span>
            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              isPassed
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {isPassed ? "Passed" : "Failed"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 mt-4 gap-3">
          <StatCard label="Total Questions" value={report.totalQuestions ?? report.TotalQuestions ?? 0} color="yellow" />
          <StatCard label="Duration"        value={`${report.durationMinutes ?? report.DurationMinutes ?? 0} min`} color="blue" />
          <StatCard label="Answered"        value={report.answeredCount ?? report.AnsweredCount ?? 0} color="red" />
          <StatCard label="Correct"         value={report.correctCount  ?? report.CorrectCount  ?? 0} color="green" />
        </div>

        <div className="mt-5">
          <div className="text-sm text-gray-800 mb-2">Candidate</div>
          <div className="grid grid-cols-4 w-full">
            <CandidateField label="name"  value={report.applicantName ?? report.ApplicantName} />
            <CandidateField label="email" value={report.email         ?? report.Email} />
            <CandidateField label="phone" value={report.phoneNumber   ?? report.PhoneNumber} />
            <CandidateField label="score" value={report.scorePercentage ?? report.ScorePercentage} />
          </div>
        </div>

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

      </div>

      {/* Questions */}
      <div className="mt-6 space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            No questions found for this test.
          </div>
        ) : (
          questions.map((q) => {
            const questionId  = q.questionId ?? q.QuestionId
            const order       = q.order      ?? q.Order
            const text        = q.text       ?? q.Text
            const selectedId  = q.selectedOptionId ?? q.SelectedOptionId
            const correctId   = q.correctOptionId  ?? q.CorrectOptionId
            const isCorrect   = q.isCorrect  ?? q.IsCorrect
            const options     = q.options    ?? q.Options ?? []

            return (
              <div key={questionId} className="rounded-xl border border-gray-200 p-4 bg-white shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Question {order}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {selectedId ? (isCorrect ? "correct" : "wrong") : "skipped"}
                  </span>
                </div>

                <p className="mt-2 text-gray-800 font-medium">{text}</p>

                <div className="mt-4 grid lg:grid-cols-2 gap-4">
                  {options.map((opt) => {
                    const optId       = opt.id   ?? opt.Id
                    const optText     = opt.text  ?? opt.Text
                    const isSelected  = selectedId && optId === selectedId
                    const isCorrectOpt = correctId && optId === correctId

                    return (
                      <div
                        key={optId}
                        className={`rounded-lg border px-4 py-2 text-sm flex items-center justify-between
                          ${isSelected   ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                          ${isCorrectOpt ? "border-green-500" : ""}`}
                      >
                        <span className="text-gray-800">{optText}</span>
                        <div className="flex gap-2">
                          {isSelected && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              Selected
                            </span>
                          )}
                          {isCorrectOpt && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Correct
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Proctoring Snapshots */}
      <SnapshotGallery snapshots={snapshots} loading={loadingSnapshots} />

    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, color }: {
  label: string
  value: string | number
  color: "yellow" | "blue" | "red" | "green" | "purple"
}) {
  const colors: Record<string, string> = {
    yellow: "border-yellow-100 bg-yellow-50",
    blue:   "border-blue-100   bg-blue-50",
    red:    "border-red-100    bg-red-50",
    green:  "border-green-100  bg-green-50",
    purple: "border-purple-100 bg-purple-50",
  }
  return (
    <div className={`rounded-xl border p-3 shadow-md ${colors[color]}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}

function CandidateField({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value ?? "-"}</div>
    </div>
  )
}