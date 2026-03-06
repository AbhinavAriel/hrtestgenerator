import Modal from "./Modal";
import Field from "./Field";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { onlyDigits } from "../lib/hrUtils";

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
}) {
  const levelOptions = (() => {
    const raw = meta?.levels?.length ? meta.levels : ["Beginner", "Intermediate", "Professional"];
    return raw.map((l) => {
      if (typeof l === "string") return { value: l, label: l };
      return { value: l?.value ?? l?.label ?? "", label: l?.label ?? l?.value ?? "" };
    });
  })();

  const techOptions = (() => {
    const raw = Array.isArray(techOptionsNormalized) ? techOptionsNormalized : [];
    return raw
      .map((t) => {
        if (!t) return null;

        // already normalized
        if (t.value != null && t.label != null) return { value: String(t.value), label: String(t.label) };

        // backend shape
        if (t.id != null && t.name != null) return { value: String(t.id), label: String(t.name) };

        return null;
      })
      .filter(Boolean);
  })();

  return (
    <Modal
      open={open}
      title={editRow ? "Edit Test" : "Create Test"}
      onClose={onClose}
      disableClose={submitting}
    >
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-bold tracking-wide text-black">CANDIDATE DETAILS</p>
          </div>

          <Field label="First Name" error={errors.firstName}>
            <input
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="e.g. John"
              disabled={submitting}
            />
          </Field>

          <Field label="Last Name" error={errors.lastName}>
            <input
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="e.g. Doe"
              disabled={submitting}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="name@company.com"
              disabled={submitting}
            />
          </Field>

          <Field label="Phone Number" hint="10 digits" error={errors.phoneNumber}>
            <input
              value={form.phoneNumber}
              onChange={(e) => setField("phoneNumber", onlyDigits(e.target.value))}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="e.g. 9876543210"
              disabled={submitting}
              maxLength={10}
            />
          </Field>

          <div className="sm:col-span-2 pt-4 border-dashed border-t border-gray-300">
            <p className="text-xs font-bold tracking-wide text-black">TEST DETAILS</p>
          </div>

          <Field label="Total Questions"  error={errors.totalQuestions}>
            <input
              value={form.totalQuestions}
              onChange={(e) => setField("totalQuestions", e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              disabled={submitting}
            />
          </Field>

          <Field label="Duration" hint="minutes" error={errors.durationMinutes}>
            <input
              value={form.durationMinutes}
              onChange={(e) => setField("durationMinutes", e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              disabled={submitting}
            />
          </Field>

          <Field label="Level" error={errors.level}>
            <select
              value={form.level || ""}
              onChange={(e) => setField("level", e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              disabled={submitting}
            >
              <option value="">Select level</option>
              {levelOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tech Stack" hint="multi-select dropdown" error={errors.techStackIds}>
            <MultiSelectDropdown
              options={techOptions}                
              value={form.techStackIds || []}      
              onChange={(v) => setField("techStackIds", v)}
              getOptionLabel={(o) => o.label}      
              getOptionValue={(o) => o.value}   
              disabled={submitting}
              placeholder="Search & select tech..."
              error={!!errors.techStackIds}
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3 items-center">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (editRow ? "Updating..." : "Creating...") : (editRow ? "Update Test" : "Create Test")}
          </button>
        </div>
      </form>
    </Modal>
  );
}