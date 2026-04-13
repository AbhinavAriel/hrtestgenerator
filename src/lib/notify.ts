import { onlyDigits, safeTrim } from "./string";
import type { HrForm, FormErrors } from "../types/hr";

export function isValidEmail(email: string): boolean {
  const e = safeTrim(email);
  return /^\S+@\S+\.\S+$/.test(e);
}

export function validateCreateTestForm(form: HrForm): FormErrors {
  const errors: FormErrors = {};

  if (!safeTrim(form.firstName)) errors.firstName = "First name is required";
  if (!safeTrim(form.lastName)) errors.lastName = "Last name is required";

  if (!safeTrim(form.email)) errors.email = "Email is required";
  else if (!isValidEmail(form.email)) errors.email = "Enter a valid email";

  const phone = onlyDigits(form.phoneNumber);
  if (!phone) errors.phoneNumber = "Phone number is required";
  else if (phone.length < 10) errors.phoneNumber = "Enter a valid phone number";

  const tq = Number(form.totalQuestions);
  if (!Number.isFinite(tq) || tq < 1) errors.totalQuestions = "Enter valid total questions";

  const dm = Number(form.durationMinutes);
  if (!Number.isFinite(dm) || dm < 1) errors.durationMinutes = "Enter valid duration";

  if (!Array.isArray(form.techStacks) || form.techStacks.length === 0) {
    errors.techStacks = "Select at least 1 tech stack";
  }

  return errors;
}