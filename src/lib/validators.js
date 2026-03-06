import { onlyDigits, safeTrim } from "./strings";

export function isValidEmail(email) {
  const v = safeTrim(email);
  return /^\S+@\S+\.\S+$/.test(v);
}

export function validateHrTestForm(form) {
  const next = {};

  const firstName = safeTrim(form.firstName);
  const lastName = safeTrim(form.lastName);
  const email = safeTrim(form.email);
  const phone = onlyDigits(form.phoneNumber);
  const tq = Number(form.totalQuestions);
  const dm = Number(form.durationMinutes);

  if (!firstName) next.firstName = "First name is required";
  if (!lastName) next.lastName = "Last name is required";

  if (!email) next.email = "Email is required";
  else if (!isValidEmail(email)) next.email = "Enter a valid email";

  if (!phone) next.phoneNumber = "Phone number is required";
  else if (phone.length !== 10) next.phoneNumber = "Enter a valid 10-digit phone number";

  if (!Number.isFinite(tq) || tq < 1 || tq > 200) {
    next.totalQuestions = "Total questions must be between 1 and 200";
  }

  if (!Number.isFinite(dm) || dm < 1 || dm > 240) {
    next.durationMinutes = "Duration must be between 1 and 240 minutes";
  }

  if (!safeTrim(form.level)) next.level = "Level is required";

  if (!Array.isArray(form.techStackIds) || form.techStackIds.length === 0) {
    next.techStackIds = "Select at least 1 tech stack";
  }

  return next;
}

export function validateCandidateDetails(candidate) {
  const next = {};
  const name = safeTrim(candidate?.name);
  const email = safeTrim(candidate?.email);
  const phone = onlyDigits(candidate?.phone);

  if (!name) next.name = "Name is missing";
  if (!email) next.email = "Email is missing";
  else if (!isValidEmail(email)) next.email = "Invalid email format";

  if (!phone) next.phone = "Phone number is missing";
  else if (phone.length !== 10) next.phone = "Phone must be 10 digits";

  return next;
}