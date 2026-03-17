import { onlyDigits, safeTrim } from "./string";

export interface CreateTestForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  level: string;
  totalQuestions: number | string;
  durationMinutes: number | string;
  techStackIds: string[];
}

export type FormErrors = Partial<Record<keyof CreateTestForm, string>>;

export function isValidEmail(email: string): boolean {
  const e = safeTrim(email);
  return /^\S+@\S+\.\S+$/.test(e);
}

export function validateCreateTestForm(form: CreateTestForm): FormErrors {
  const errors: FormErrors = {};

  if (!safeTrim(form.firstName)) errors.firstName = "First name is required";
  if (!safeTrim(form.lastName)) errors.lastName = "Last name is required";

  if (!safeTrim(form.email)) errors.email = "Email is required";
  else if (!isValidEmail(form.email)) errors.email = "Enter a valid email";

  const phone = onlyDigits(form.phoneNumber);
  if (!phone) errors.phoneNumber = "Phone number is required";
  else if (phone.length < 10) errors.phoneNumber = "Enter a valid phone number";

  const tq = Number(form.totalQuestions);
  if (!Number.isFinite(tq) || tq < 1) {
    errors.totalQuestions = "Enter valid total questions";
  }

  const dm = Number(form.durationMinutes);
  if (!Number.isFinite(dm) || dm < 1) {
    errors.durationMinutes = "Enter valid duration";
  }

  if (!Array.isArray(form.techStackIds) || form.techStackIds.length === 0) {
    errors.techStackIds = "Select at least 1 tech";
  }

  return errors;
}