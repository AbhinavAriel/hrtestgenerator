export function formatDateTime(value?: string | number | Date | null): string {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString();
}

export function formatTimeLeft(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.max(0, seconds % 60);

  return `${m}:${String(s).padStart(2, "0")}`;
}

export const formatTime = (sec?: number | string | null): string => {
  const s = Math.max(0, Number(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;

  return `${m}:${r < 10 ? "0" : ""}${r}`;
};