import type { ReportQuestion, ReportOption } from "../../types/report"

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
  const optId        = opt.id ?? opt.Id
  const isSelected   = Boolean(selectedId && optId === selectedId)
  const isCorrectOpt = Boolean(correctId && optId === correctId)

  return (
    <div className={`rounded-lg border px-4 py-2 text-sm flex items-center justify-between
      ${isSelected   ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      ${isCorrectOpt ? "border-green-500" : ""}`}
    >
      <span className="text-gray-800">{opt.text ?? opt.Text}</span>
      <div className="flex gap-2">
        {isSelected   && <Badge color="blue">Selected</Badge>}
        {isCorrectOpt && <Badge color="green">Correct</Badge>}
      </div>
    </div>
  )
}

export function ReportQuestionCard({ q }: { q: ReportQuestion }) {
  const order      = q.order ?? q.Order
  const text       = q.text ?? q.Text
  const selectedId = q.selectedOptionId ?? q.SelectedOptionId
  const correctId  = q.correctOptionId ?? q.CorrectOptionId
  const isCorrect  = q.isCorrect ?? q.IsCorrect
  const options    = (q.options ?? q.Options ?? []) as ReportOption[]

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