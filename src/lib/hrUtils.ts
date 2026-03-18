export const onlyDigits = (value: string): string =>
  (value || "").replace(/\D/g, "");

export function classNames(...xs: (string | undefined | null | false)[]): string {
  return xs.filter(Boolean).join(" ");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export interface ParsedName {
  firstName: string;
  lastName: string;
}

export const parseName = (fullName: string | null | undefined): ParsedName => {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};