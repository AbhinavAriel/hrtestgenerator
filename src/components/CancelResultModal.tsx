import { useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CancelResultModalProps {
  open: boolean
  submitting: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

// ─── Predefined cancellation reasons ─────────────────────────────────────────

const CANCEL_REASONS = [
  "Suspicious activity detected",
  "Candidate used unfair means",
  "Technical issue during test",
  "Identity verification failed",
  "Test taken by wrong person",
  "Other",
] as const

// ─── Component ────────────────────────────────────────────────────────────────

export default function CancelResultModal({
  open,
  submitting,
  onClose,
  onConfirm,
}: CancelResultModalProps) {

  const [selectedReason, setSelectedReason] = useState<string>("")
  const [customText,     setCustomText]     = useState<string>("")

  if (!open) return null

  const isOther       = selectedReason === "Other"
  const resolvedReason = isOther ? customText.trim() : selectedReason
  const canSubmit     = Boolean(resolvedReason) && !submitting

  const handleClose = () => {
    if (submitting) return
    setSelectedReason("")
    setCustomText("")
    onClose()
  }

  const handleConfirm = () => {
    if (!canSubmit) return
    onConfirm(resolvedReason)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-start gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Cancel Candidate Result</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a reason for cancelling this test result.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-40 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-2">
          {CANCEL_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-all text-sm select-none
                ${selectedReason === reason
                  ? "border-red-400 bg-red-50 text-red-700 font-medium"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }
                ${submitting ? "pointer-events-none opacity-60" : ""}
              `}
            >
              <input
                type="radio"
                name="cancelReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => {
                  setSelectedReason(reason)
                  setCustomText("")
                }}
                disabled={submitting}
                className="accent-red-600 shrink-0"
              />
              {reason}
            </label>
          ))}
        </div>

        {isOther && (
          <div className="px-6 pb-2">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Describe the reason for cancellation..."
              rows={3}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none
                focus:border-red-400 focus:ring-1 focus:ring-red-100
                resize-none disabled:opacity-60 transition"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            disabled={submitting}
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700
              hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white
              font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>

      </div>
    </div>
  )
}