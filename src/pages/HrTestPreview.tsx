import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"

import { getHrTestReport, rejectHrTest } from "../api/hrApi"
import { getSnapshots, SnapshotRecord } from "../api/snapShot"
import type { HrTestReport as BaseReport, ReportQuestion } from "../types/report"

import { ReportHeader } from "../components/report/ReportHeader"
import { ReportQuestionCard } from "../components/report/ReportQuestionCard"
import { SnapshotGallery } from "../components/report/SnapshotGallery"
import CancelResultModal from "../components/CancelResultModal"

// Extend base type with fields the API returns that aren't in the shared type yet
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HrTestPreview() {
  const { testId } = useParams<{ testId: string }>()
  const navigate   = useNavigate()

  const [loading,          setLoading]      = useState(true)
  const [report,           setReport]       = useState<HrTestReport | null>(null)
  const [snapshots,        setSnapshots]    = useState<SnapshotRecord[]>([])
  const [loadingSnapshots, setLoadingSnaps] = useState(false)
  const [isRejected,       setIsRejected]   = useState(false)
  const [showCancelModal,  setShowCancelModal] = useState(false)
  const [cancelling,       setCancelling]   = useState(false)

  // ── Go back ──────────────────────────────────────────────────────────────────
  const goBack = () => {
    if (window.history.length > 1) { navigate(-1); return }
    navigate("/admin", { replace: true })
  }

  // ── Cancel confirm ───────────────────────────────────────────────────────────
  const handleCancelConfirm = async (reason: string) => {
    if (!testId) return
    try {
      setCancelling(true)
      await rejectHrTest(testId, reason)
      setIsRejected(true)
      setShowCancelModal(false)
      // Patch the local report so the banner shows the reason immediately
      setReport((prev) => prev ? { ...prev, cancellationReason: reason, isRejected: true } : prev)
      toast.success("Candidate result has been cancelled.")
    } catch (e: any) {
      toast.error(e?.message || "Failed to cancel the result.")
    } finally {
      setCancelling(false)
    }
  }

  // ── Load data ────────────────────────────────────────────────────────────────
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

  // ── Render guards ─────────────────────────────────────────────────────────────
  if (loading) return <div className="min-h-screen p-6 text-gray-600">Loading report...</div>
  if (!report)  return <div className="min-h-screen p-6 text-gray-600">No report found.</div>

  const questions = (report.questions ?? report.Questions ?? []) as ReportQuestion[]

  // ── Page ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-50">

      {/* Back button */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <button
          onClick={goBack}
          className="bg-blue-100 border border-blue-200 hover:bg-blue-200 cursor-pointer text-xs py-1 px-3 rounded-lg text-blue-600 font-semibold"
        >
          ← Go back
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8">

        {/* Header card — title, badges, cancel button, stats, candidate, tech stacks */}
        <ReportHeader
          report={report}
          isRejected={isRejected}
          onCancelClick={() => setShowCancelModal(true)}
        />

        {/* Questions */}
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

        {/* Proctoring snapshots */}
        <SnapshotGallery snapshots={snapshots} loading={loadingSnapshots} />

      </div>

      {/* Cancel result modal */}
      <CancelResultModal
        open={showCancelModal}
        submitting={cancelling}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
      />

    </div>
  )
}