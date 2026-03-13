import { OptionCardProps } from "../types/question"

export default function OptionCard({
  option,
  index,
  selected,
  onSelect,
  name,
}: OptionCardProps) {

  const letters = ["A", "B", "C", "D", "E", "F"]

  return (
    <label className="relative block cursor-pointer group">

      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={onSelect}
        className="absolute opacity-0 pointer-events-none"
      />

      <div
        className={`
          relative flex items-center justify-between py-3 px-5 rounded-xl
          backdrop-blur-md transition-all duration-300 border
          ${
            selected
              ? "border-blue-600 bg-linear-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.01]"
              : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
          }
        `}
      >

        <div className="flex items-center space-x-4">

          <div
            className={`
              flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
              transition-all duration-300
              ${
                selected
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100"
              }
            `}
          >
            {letters[index]}
          </div>

          <span className="text-gray-800 font-medium text-sm">
            {option}
          </span>

        </div>

        <div
          className={`
            relative w-5 h-5 rounded-full border-2 transition-all duration-300
            ${
              selected
                ? "border-blue-600"
                : "border-gray-400 group-hover:border-blue-400"
            }
          `}
        >
          <div
            className={`
              absolute inset-1 rounded-full bg-blue-600 transition-all duration-300
              ${selected ? "scale-100 opacity-100" : "scale-0 opacity-0"}
            `}
          />
        </div>

        {selected && (
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-400/10 to-indigo-400/10 pointer-events-none" />
        )}

      </div>

    </label>
  )
}