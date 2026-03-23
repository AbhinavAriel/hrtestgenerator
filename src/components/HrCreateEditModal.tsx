import Modal from "./Modal"
import Field from "./ui/Field"
import MultiSelectDropdown from "./MultiSelectDropdown"

import { onlyDigits } from "../lib/hrUtils"
import { HrCreateEditModalProps, Option } from "../types/hr"

import {
  normalizeLevelOptions,
  normalizeTechOptions,
} from "../utils/hrOptionHelpers"

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

  const levelOptions: Option[] = normalizeLevelOptions(meta?.levels)

  const techOptions: Option[] = normalizeTechOptions(techOptionsNormalized)

  const isSubmitted = (editRow?.status ?? "").toLowerCase() === "submitted"

  const removeSpaces = (value: string) =>
    value.replace(/\s+/g, "")

  const inputStyle =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"

  return (
    <Modal
      open={open}
      title={editRow ? "Edit Test" : "Create Test"}
      onClose={onClose}
      disableClose={submitting}
    >
      <form onSubmit={onSubmit} className="space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Candidate section */}
          <div className="sm:col-span-2">
            <p className="text-xs font-bold tracking-wide text-gray-700">
              CANDIDATE DETAILS
            </p>
          </div>

          <Field label="First Name" error={errors.firstName}>
            <input
              value={form.firstName}
              onChange={(e) =>
                setField("firstName", removeSpaces(e.target.value))
              }
              className={inputStyle}
              placeholder="e.g. John"
              disabled={submitting}
            />
          </Field>

          <Field label="Last Name" error={errors.lastName}>
            <input
              value={form.lastName}
              onChange={(e) =>
                setField("lastName", removeSpaces(e.target.value))
              }
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
              onChange={(e) =>
                setField("phoneNumber", onlyDigits(e.target.value))
              }
              inputMode="numeric"
              className={inputStyle}
              placeholder="e.g. 9876543210"
              maxLength={10}
              disabled={submitting}
            />
          </Field>

          {/* Test section */}
          <div className="sm:col-span-2 pt-4 border-t border-dashed border-gray-300">
            <p className="text-xs font-bold tracking-wide text-gray-700">
              TEST DETAILS
            </p>
          </div>

          <Field label="Total Questions" error={errors.totalQuestions}>
            <input
              value={form.totalQuestions}
              onChange={(e) =>
                setField("totalQuestions", e.target.value)
              }
              inputMode="numeric"
              className={inputStyle}
              disabled={submitting || isSubmitted}
            />
          </Field>

          <Field label="Duration" hint="minutes" error={errors.durationMinutes}>
            <input
              value={form.durationMinutes}
              onChange={(e) =>
                setField("durationMinutes", e.target.value)
              }
              inputMode="numeric"
              className={inputStyle}
              disabled={submitting || isSubmitted}
            />
          </Field>

          <Field label="Level" error={errors.level}>
            <select
              value={form.level || ""}
              onChange={(e) => setField("level", e.target.value)}
              className={inputStyle}
              disabled={submitting || isSubmitted}
            >
              <option value="">Select level</option>

              {levelOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Tech Stack"
            hint="multi-select dropdown"
            error={errors.techStackIds}
          >
            <MultiSelectDropdown
              options={techOptions}
              value={form.techStackIds || []}
              onChange={(v) => setField("techStackIds", v)}
              getOptionLabel={(o: Option) => o.label}
              getOptionValue={(o: Option) => o.value}
              disabled={submitting || isSubmitted}
              placeholder="Search & select tech..."
              error={!!errors.techStackIds}
            />
          </Field>

        </div>

        {/* Buttons */}
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
            className="rounded-lg cursor-pointer bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? editRow
                ? "Updating..."
                : "Creating..."
              : editRow
              ? "Update Test"
              : "Create Test"}
          </button>

        </div>

      </form>
    </Modal>
  )
}