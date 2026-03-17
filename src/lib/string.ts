export const onlyDigits = (value?: unknown): string => {
  return (value || "").toString().replace(/\D/g, "");
};

export const safeTrim = (value?: unknown): string => {
  return (value ?? "").toString().trim();
};

export function classNames(
  ...xs: Array<string | false | null | undefined>
): string {
  return xs.filter(Boolean).join(" ");
}