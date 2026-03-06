export const onlyDigits = (value) => (value || "").toString().replace(/\D/g, "");

export const safeTrim = (value) => (value ?? "").toString().trim();

export function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}