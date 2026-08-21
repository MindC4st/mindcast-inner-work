// Shared validation for pilot application form

export interface DobParts {
  day: string;
  month: string;
  year: string;
}

export interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  gender_self_described?: string;
  q1?: string;
  q2?: string;
  q3?: string;
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("64")) return "+" + digits;
  if (digits.startsWith("0")) return "+64" + digits.slice(1);
  return "+64" + digits;
}

export function parseDob(parts: DobParts): Date | null {
  const d = parseInt(parts.day, 10);
  const m = parseInt(parts.month, 10) - 1;
  const y = parseInt(parts.year, 10);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  const date = new Date(Date.UTC(y, m, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m || date.getUTCDate() !== d) return null;
  return date;
}

export function ageAtStart(dob: Date): number {
  const start = new Date("2026-10-13");
  let age = start.getFullYear() - dob.getFullYear();
  const m = start.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && start.getDate() < dob.getDate())) age--;
  return age;
}

export function formatDateNZ(dob: Date): string {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dob);
}

export function validateForm(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: DobParts;
  gender: string;
  gender_self_described: string;
  q1: string;
  q2: string;
  q3: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.first_name.trim() || data.first_name.length > 60) {
    errors.first_name = "First name required (1–60 characters)";
  }
  if (!data.last_name.trim() || data.last_name.length > 60) {
    errors.last_name = "Last name required (1–60 characters)";
  }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email required";
  }
  if (!data.phone.trim()) {
    errors.phone = "Phone number required";
  }

  const dob = parseDob(data.dob);
  if (!dob) {
    errors.dob = "Please enter a valid date (DD MM YYYY)";
  } else {
    const age = ageAtStart(dob);
    if (age < 30 || age > 45) {
      errors.dob = "You must be aged 30–45 on 13 October 2026";
    }
  }

  const validGenders = ["female", "male", "another", "undisclosed"];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.gender = "Invalid gender value";
  }
  if (data.gender === "another" && !data.gender_self_described.trim()) {
    errors.gender_self_described = "Please specify";
  }

  if (!data.q1.trim() || data.q1.trim().length < 40) {
    errors.q1 = "At least 40 characters required";
  }
  if (!data.q2.trim() || data.q2.trim().length < 40) {
    errors.q2 = "At least 40 characters required";
  }
  if (!data.q3.trim() || data.q3.trim().length < 40) {
    errors.q3 = "At least 40 characters required";
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}