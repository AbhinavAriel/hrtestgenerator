import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { getHrTestReport, rejectHrTest } from "../api/hrApi"
import { getSnapshots, SnapshotRecord } from "../api/snapShot"
import type { HrTestReport as BaseReport, ReportQuestion, ReportOption } from "../types/report"
import { pillClass } from "../utils/hrHelpers"

type HrTestReport = BaseReport & {
  level?: string
  Level?: string
  applicantId?: string
  ApplicantId?: string
  createdAtUtc?: string
  submittedAtUtc?: string
  scorePercentage?: number
  ScorePercentage?: number
  isPassed?: boolean
  IsPassed?: boolean
  isRejected?: boolean
  IsRejected?: boolean
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, border, bg }: {
  label: string; value: number | string; border: string; bg: string
}) {
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
  )
}

function Badge({ color, children }: { color: "blue" | "green"; children: string }) {
  const cls = color === "blue" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>
      {children}
    </span>
  )
}

function OptionRow({ opt, selectedId, correctId }: {
  opt: ReportOption
  selectedId?: string | number | null
  correctId?: string | number | null
}) {
  const optId        = opt.id   ?? opt.Id
  const optText      = opt.text ?? opt.Text
  const isSelected   = Boolean(selectedId && optId === selectedId)
  const isCorrectOpt = Boolean(correctId  && optId === correctId)

  return (
    <div className={`rounded-lg border px-4 py-2 text-sm flex items-center justify-between
      ${isSelected   ? "border-blue-500 bg-blue-50"  : "border-gray-300"}
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

function QuestionCard({ q }: { q: ReportQuestion }) {
  const questionId = q.questionId ?? q.QuestionId
  const order      = q.order      ?? q.Order
  const text       = q.text       ?? q.Text
  const selectedId = q.selectedOptionId ?? q.SelectedOptionId
  const correctId  = q.correctOptionId  ?? q.CorrectOptionId
  const isCorrect  = q.isCorrect  ?? q.IsCorrect
  const options    = (q.options   ?? q.Options ?? []) as ReportOption[]

  const statusLabel = selectedId ? (isCorrect ? "correct" : "wrong") : "skipped"
  const statusCls   = isCorrect  ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"

  return (
    <div className="rounded-xl border border-gray-300 p-4 mb-4 bg-white shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Question {order}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCls}`}>
          {statusLabel}
        </span>
      </div>
      <p className="my-2 text-gray-800 font-semibold">{text}</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => (
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

// ─── Image source resolver ────────────────────────────────────────────────────
// imageUrl is now always a full Supabase public URL — constructed in snapShot.ts.
// If it's empty the image failed / was never stored.
function useImageSrc(snap: SnapshotRecord): { src: string | null; failed: boolean } {
  const src    = snap.imageUrl || null
  const failed = !src
  return { src, failed }
}

// ─── Broken-image placeholder ─────────────────────────────────────────────────
function BrokenImage({ small = false }: { small?: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-50">
      <svg
        className={`${small ? "w-5 h-5" : "w-8 h-8"} text-gray-300`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 15l5-5 4 4 3-3 4 4" />
      </svg>
      <span className={`${small ? "text-[8px]" : "text-xs"} text-gray-400`}>No preview</span>
    </div>
  )
}

// ─── Snapshot thumbnail ───────────────────────────────────────────────────────
function SnapshotThumb({ snap, onClick }: { snap: SnapshotRecord; onClick: () => void }) {
  const { src, failed } = useImageSrc(snap)
  const time = new Date(snap.capturedAt).toLocaleTimeString()

  return (
    <button
      onClick={onClick}
      disabled={failed}
      className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:border-blue-400 transition disabled:cursor-default"
      title={new Date(snap.capturedAt).toLocaleString()}
    >
      {failed && <BrokenImage small />}
      {src && (
        <img
          src={src}
          alt={`Snapshot at ${time}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
        {time}
      </span>
    </button>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  snap, total, index, onClose, onPrev, onNext,
}: {
  snap: SnapshotRecord; total: number; index: number
  onClose: () => void; onPrev: () => void; onNext: () => void
}) {
  const { src, failed } = useImageSrc(snap)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose()
      if (e.key === "ArrowLeft")  onPrev()
      if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl"
            >‹</button>
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl"
            >›</button>
          </>
        )}

        <div className="min-h-48 flex items-center justify-center bg-black">
          {failed && <BrokenImage />}
          {src && (
            <img src={src} alt="Snapshot" className="w-full max-h-[70vh] object-contain" />
          )}
        </div>

        <div className="bg-white px-4 py-2 text-xs text-gray-600 flex justify-between items-center">
          <span>{index + 1} / {total} — {new Date(snap.capturedAt).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-base"
          >✕</button>
        </div>
      </div>
    </div>
  )
}

// ─── Snapshot gallery ─────────────────────────────────────────────────────────
function SnapshotGallery({ snapshots, loading }: { snapshots: SnapshotRecord[]; loading: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selected = selectedIndex !== null ? snapshots[selectedIndex] : null

  const prev = () => setSelectedIndex((i) => i !== null ? (i - 1 + snapshots.length) % snapshots.length : null)
  const next = () => setSelectedIndex((i) => i !== null ? (i + 1) % snapshots.length : null)

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        Captured Snapshots
        {!loading && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({snapshots.length} captured)
          </span>
        )}
      </h2>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 text-center">
          Loading snapshots…
        </div>
      )}

      {!loading && snapshots.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          No proctoring snapshots found for this test.
        </div>
      )}

      {!loading && snapshots.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {snapshots.map((snap, i) => (
              <SnapshotThumb key={snap.id} snap={snap} onClick={() => setSelectedIndex(i)} />
            ))}
          </div>
        </div>
      )}

      {selected !== null && selectedIndex !== null && (
        <Lightbox
          snap={selected}
          total={snapshots.length}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HrTestPreview() {
  const { testId } = useParams<{ testId: string }>()
  const navigate   = useNavigate()

  const [loading,          setLoading]      = useState(true)
  const [report,           setReport]       = useState<HrTestReport | null>(null)
  const [snapshots,        setSnapshots]    = useState<SnapshotRecord[]>([])
  const [loadingSnapshots, setLoadingSnaps] = useState(false)
  const [isRejected,       setIsRejected]   = useState(false)
  const [rejecting,        setRejecting]    = useState(false)
  const [showRejectModal,  setShowRejectModal] = useState(false)

  const goBack = () => {
    if (window.history.length > 1) { navigate(-1); return }
    navigate("/admin", { replace: true })
  }

  const handleRejectConfirm = async () => {
    if (!testId) return
    try {
      setRejecting(true)
      await rejectHrTest(testId)
      setIsRejected(true)
      setShowRejectModal(false)
      toast.success("Candidate result has been rejected.")
    } catch (e: any) {
      toast.error(e?.message || "Failed to reject the result.")
    } finally {
      setRejecting(false)
    }
  }

  useEffect(() => {
    if (!testId) return
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setLoadingSnaps(true)

        const [res, snaps] = await Promise.allSettled([
          getHrTestReport(testId),
          getSnapshots(testId),
        ])

        if (!mounted) return

        if (res.status === "fulfilled") {
          const raw   = res.value as any
          const outer = raw?.data ?? raw
          const r: HrTestReport = outer?.isSuccess !== undefined ? outer.data : outer
          setReport(r)
          setIsRejected(r?.isRejected ?? r?.IsRejected ?? false)
        } else {
          toast.error((res as PromiseRejectedResult).reason?.message || "Failed to load report")
        }
        

        if (snaps.status === "fulfilled") {
          setSnapshots((snaps.value as SnapshotRecord[]) ?? [])
        }

      } finally {
        if (mounted) { setLoading(false); setLoadingSnaps(false) }
      }
    })()

    return () => { mounted = false }
  }, [testId])

  if (loading) return <div className="min-h-screen p-6 text-gray-600">Loading report...</div>
  if (!report)  return <div className="min-h-screen p-6 text-gray-600">No report found.</div>

  const questions  = (report.questions  ?? report.Questions  ?? []) as ReportQuestion[]
  const techStacks = (report.techStacks ?? report.TechStacks ?? []) as string[]
  const level      = report.level ?? report.Level
  const isPassed   = report.isPassed ?? report.IsPassed ?? false

  return (
    <div className="min-h-screen bg-blue-50">

      <div className="max-w-6xl mx-auto py-8 px-4">
        <button
          onClick={goBack}
          className="bg-blue-100 border border-blue-200 hover:bg-blue-200 cursor-pointer text-xs py-1 px-3 rounded-lg text-blue-600 font-semibold"
        >
          ← Go back
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8">

        {/* ── Header card ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Test Preview</h1>
              <p className="text-sm text-gray-500">
                TestId: <span className="font-mono">{report.testId ?? report.TestId}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {level && (
                <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                  {level}
                </span>
              )}
              <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize">
                {report.status ?? report.Status ?? "-"}
              </span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                (isPassed && !isRejected)
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                {isRejected ? "Rejected" : isPassed ? "Passed" : "Failed"}
              </span>
              {isPassed && !isRejected && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full cursor-pointer px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border border-red-700 transition"
                >
                  ✕ Reject Result
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 mt-4 gap-3">
            <StatCard label="Total Questions" value={report.totalQuestions ?? report.TotalQuestions ?? 0} border="border-yellow-100" bg="bg-yellow-50" />
            <StatCard label="Duration (min)"  value={report.durationMinutes ?? report.DurationMinutes ?? 0} border="border-blue-100"   bg="bg-blue-50" />
            <StatCard label="Answered"        value={report.answeredCount   ?? report.AnsweredCount   ?? 0} border="border-red-100"    bg="bg-red-50" />
            <StatCard label="Correct"         value={report.correctCount    ?? report.CorrectCount    ?? 0} border="border-green-100"  bg="bg-green-50" />
          </div>

          <CandidateInfo report={report} />

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

        {/* ── Questions ── */}
        <div className="mt-6 space-y-4">
          {questions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              No questions found for this test.
            </div>
          ) : (
            questions.map((q) => (
              <QuestionCard key={q.questionId ?? q.QuestionId} q={q} />
            ))
          )}
        </div>

        {/* ── Proctoring snapshots ── */}
        <SnapshotGallery snapshots={snapshots} loading={loadingSnapshots} />

      </div>

      {/* ── Reject confirmation modal ── */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !rejecting && setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Reject Candidate Result?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              This will override the <span className="font-semibold text-green-700">Passed</span> result
              and mark the candidate as <span className="font-semibold text-red-700">Rejected</span>. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                disabled={rejecting}
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm rounded-lg cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={rejecting}
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-sm rounded-lg cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-60"
              >
                {rejecting ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}