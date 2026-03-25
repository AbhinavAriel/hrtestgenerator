import { EditableOptionCardProps } from "../types/question"

export default function EditableOptionCard({
  value,
  index,
  selected,
  onSelect,
  onChange,
  disabled,
  error = false,
}: EditableOptionCardProps) {

  const letters = ["A", "B", "C", "D", "E", "F"]

  const borderClass = selected
    ? "border-blue-500 bg-blue-50 shadow-sm"
    : error
    ? "border-red-400 bg-red-50"
    : "border-gray-200 bg-white hover:border-blue-400"

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-4 rounded-xl border p-4 transition-all text-xs ${borderClass}`}
    >
      <div
        className={`
          flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold
          ${selected
            ? "bg-blue-600 text-white"
            : error
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-600 group-hover:bg-blue-100"
          }
        `}
      >
        {letters[index]}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Type option ${letters[index]}...`}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
      />

      <div
        className={`
          flex h-5 w-5 items-center justify-center rounded-full border-2 transition
          ${selected
            ? "border-blue-600"
            : error
            ? "border-red-400"
            : "border-gray-400 group-hover:border-blue-400"
          }
        `}
      >
        {selected && (
          <div className="h-3 w-3 rounded-full bg-blue-600" />
        )}
      </div>
    </div>
  )
}