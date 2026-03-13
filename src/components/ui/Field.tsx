import { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export default function Field({
  label,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-gray-800">{label}</label>

        {hint ? (
          <span className="text-xs text-gray-500">{hint}</span>
        ) : null}
      </div>

      <div className="mt-1">{children}</div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}