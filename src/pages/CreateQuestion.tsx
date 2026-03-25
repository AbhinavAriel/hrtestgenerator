import { useNavigate } from "react-router-dom"
import EditableOptionCard from "../components/EditableOptionCard"
import { useCreateQuestion } from "../hooks/Usecreatequestion"

export default function CreateQuestion() {
  const navigate = useNavigate()
  const {
    form,
    errors,
    techOptions,
    levelOptions,
    submitting,
    setField,
    setOptionText,
    setCorrectOption,
    resetForm,
    handleSubmit,
  } = useCreateQuestion()

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
              Create Question
            </h1>
            <p className="text-sm text-blue-600">
              Add new MCQ questions for different tech stacks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded-xl border cursor-pointer hover:shadow-xl border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Back to Admin
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Question Text ── */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setField("text", e.target.value)}
                rows={4}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${errors.text
                    ? "border-red-400 focus:border-red-400 ring-1 ring-red-200"
                    : "border-gray-300 focus:border-blue-400"
                  }`}
                placeholder="Enter the question"
                disabled={submitting}
              />
              {errors.text && (
                <p className="mt-1 text-xs text-red-500">{errors.text}</p>
              )}
            </div>

            {/* ── Tech Stack + Level ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Tech Stack <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.techStackId}
                  onChange={(e) => setField("techStackId", e.target.value)}
                  className={`w-full rounded-xl border cursor-pointer bg-white px-3 py-2.5 text-sm outline-none transition
                    ${errors.techStackId
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-gray-300 focus:border-blue-400"
                    }`}
                  disabled={submitting}
                >
                  <option value="">Select tech stack</option>
                  {techOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.techStackId && (
                  <p className="mt-1 text-xs text-red-500">{errors.techStackId}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setField("level", e.target.value)}
                  className={`w-full rounded-xl border cursor-pointer bg-white px-3 py-2.5 text-sm outline-none transition
                    ${errors.level
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-gray-300 focus:border-blue-400"
                    }`}
                  disabled={submitting}
                >
                  <option value="">Select level</option>
                  {levelOptions.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {errors.level && (
                  <p className="mt-1 text-xs text-red-500">{errors.level}</p>
                )}
              </div>

            </div>

            {/* ── Options ── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Options <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-gray-500">
                  Click the radio button to mark the correct answer
                </p>
              </div>

              <div className="space-y-3">
                {form.options.map((opt, index) => (
                  <div key={index}>
                    <EditableOptionCard
                      index={index}
                      value={opt.text}
                      selected={opt.isCorrect}
                      disabled={submitting}
                      onSelect={() => setCorrectOption(index)}
                      onChange={(val) => setOptionText(index, val)}
                      error={!!(errors.optionTexts?.[index])}
                    />
                    {errors.optionTexts?.[index] && (
                      <p className="mt-1 ml-1 text-xs text-red-500">
                        {errors.optionTexts[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* General options error (e.g. no correct marked) */}
              {errors.options && !errors.optionTexts?.some((e) => e) && (
                <p className="mt-2 text-xs text-red-500">{errors.options}</p>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-xl border border-gray-300 cursor-pointer bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-2.5 cursor-pointer text-sm font-medium text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Create Question"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}