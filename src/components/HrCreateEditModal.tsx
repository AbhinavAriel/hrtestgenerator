import Modal from "./Modal"
import Field from "./ui/Field"
import MultiSelectDropdown from "./MultiSelectDropdown"

import { onlyDigits } from "../lib/hrUtils"
import { HrCreateEditModalProps, HrTechStackEntry, Option } from "../types/hr"
import { LEVELS } from "../constants/hrConstants"
import { normalizeLevelOptions, normalizeTechOptions } from "../utils/hrOptionHelpers"

export default function HrCreateEditModal({
  open,
  onClose,
  form,
  setField,
  errors,
  submitting,
  editRow,
  meta,
  techOptionsNormalized,
  onSubmit,
}: HrCreateEditModalProps) {
  const techOptions: Option[] = normalizeTechOptions(techOptionsNormalized)

  const isSubmitted = (editRow?.status ?? "").toLowerCase() === "submitted"

  const removeSpaces = (value: string) => value.replace(/\s+/g, "")

  const inputStyle =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"

  // ── Selected tech IDs (for the MultiSelectDropdown value) ──
  const selectedTechIds = form.techStacks.map((t) => t.id)

  // ── When the multi-select changes, sync form.techStacks ──
  // New IDs → add with default level; removed IDs → drop
  const handleTechChange = (newIds: string[]) => {
    const updated: HrTechStackEntry[] = newIds.map((id) => {
      const existing = form.techStacks.find((t) => t.id === id)
      return existing ?? { id, level: "Beginner" }
    })
    setField("techStacks", updated)
  }

  // ── Update level for a single tech entry ──
  const handleLevelChange = (techId: string, level: string) => {
    const updated = form.techStacks.map((t) =>
      t.id === techId ? { ...t, level } : t
    )
    setField("techStacks", updated)
  }

  return (
    <Modal
      open={open}
      title={editRow ? "Edit Test" : "Create Test"}
      onClose={onClose}
      disableClose={submitting}
    >
      <form onSubmit={onSubmit} className="space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* ── Candidate section ── */}
          <div className="sm:col-span-2">
            <p className="text-xs font-bold tracking-wide text-gray-700">
              CANDIDATE DETAILS
            </p>
          </div>

          <Field label="First Name" error={errors.firstName}>
            <input
              value={form.firstName}
              onChange={(e) => setField("firstName", removeSpaces(e.target.value))}
              className={inputStyle}
              placeholder="e.g. John"
              disabled={submitting}
            />
          </Field>

          <Field label="Last Name" error={errors.lastName}>
            <input
              value={form.lastName}
              onChange={(e) => setField("lastName", removeSpaces(e.target.value))}
              className={inputStyle}
              placeholder="e.g. Doe"
              disabled={submitting}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className={inputStyle}
              placeholder="name@company.com"
              disabled={submitting}
            />
          </Field>

          <Field label="Phone Number" hint="10 digits" error={errors.phoneNumber}>
            <input
              value={form.phoneNumber}
              onChange={(e) => setField("phoneNumber", onlyDigits(e.target.value))}
              inputMode="numeric"
              className={inputStyle}
              placeholder="e.g. 9876543210"
              maxLength={10}
              disabled={submitting}
            />
          </Field>

          {/* ── Test section ── */}
          <div className="sm:col-span-2 pt-4 border-t border-dashed border-gray-300">
            <p className="text-xs font-bold tracking-wide text-gray-700">
              TEST DETAILS
            </p>
          </div>

          <Field label="Total Questions" error={errors.totalQuestions}>
            <input
              value={form.totalQuestions}
              onChange={(e) => setField("totalQuestions", e.target.value)}
              inputMode="numeric"
              className={inputStyle}
              disabled={submitting || isSubmitted}
            />
          </Field>

          <Field label="Duration" hint="minutes" error={errors.durationMinutes}>
            <input
              value={form.durationMinutes}
              onChange={(e) => setField("durationMinutes", e.target.value)}
              inputMode="numeric"
              className={inputStyle}
              disabled={submitting || isSubmitted}
            />
          </Field>

          {/* ── Tech Stack selector (full width) ── */}
          <div className="sm:col-span-2">
            <Field
              label="Tech Stacks"
              hint="select one or more"
              error={errors.techStacks}
            >
              <MultiSelectDropdown
                options={techOptions}
                value={selectedTechIds}
                onChange={handleTechChange}
                getOptionLabel={(o: Option) => o.label}
                getOptionValue={(o: Option) => o.value}
                disabled={submitting || isSubmitted}
                placeholder="Search & select tech stacks…"
                error={!!errors.techStacks}
              />
            </Field>
          </div>

          {/* ── Per-tech level selectors (appear once a tech is chosen) ── */}
          {form.techStacks.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs font-bold tracking-wide text-gray-700 mb-2">
                EXPERIENCE LEVEL PER TECH
              </p>

              <div className="space-y-2">
                {form.techStacks.map((entry) => {
                  // Resolve the display name from the available options
                  const techName =
                    techOptions.find((o) => o.value === entry.id)?.label ?? entry.id

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      {/* Tech name badge */}
                      <span className="flex-1 truncate text-sm font-medium text-gray-800">
                        {techName}
                      </span>

                      {/* Level dropdown */}
                      <select
                        value={entry.level}
                        onChange={(e) => handleLevelChange(entry.id, e.target.value)}
                        disabled={submitting || isSubmitted}
                        className="rounded-lg border cursor-pointer border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                      >
                        {LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── Buttons ── */}
        <div className="flex justify-end gap-3 pt-4">

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border cursor-pointer border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 cursor-pointer px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? editRow ? "Updating..." : "Creating..."
              : editRow ? "Update Test" : "Create Test"}
          </button>

        </div>

      </form>
    </Modal>
  )
}