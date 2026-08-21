// familyTrial.ts — adult-led family free trial rules, pure and testable.
//
// The DATABASE is the authority for the one-free-trial and check-in rules
// (partial unique index + redeem_trial_family). This module mirrors the
// age-group and email-normalisation semantics exactly so the /try form can
// decide Child vs Teen and validate before submitting. If this file and the
// server ever disagree, the server wins.

export const TEEN_MIN_AGE = 12;

export type AgeGroup = "child" | "teen";

export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

export const isValidEmail = (raw: string): boolean =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizeEmail(raw));

/**
 * Child vs Teen from the existing Mindcast age-group rule: the Sunday rooms are
 * Little Ones (4–11) and Teens (12+). Boundary = 12th birthday.
 */
export const ageGroupForDob = (dob: string, today = new Date()): AgeGroup | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  let age = today.getUTCFullYear() - d.getUTCFullYear();
  const m = today.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < d.getUTCDate())) age--;
  if (age < 0) return null;
  return age >= TEEN_MIN_AGE ? "teen" : "child";
};

/** "sarah@example.com" -> "s****@example.com" for the success screen. */
export const maskEmail = (email: string): string => {
  const [local, domain] = normalizeEmail(email).split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"*".repeat(Math.max(4, local.length - 1))}@${domain}`;
};

export interface MinorDraft {
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
}

/** True when this minor draft is a teen and therefore needs an email. */
export const minorNeedsEmail = (m: MinorDraft): boolean => ageGroupForDob(m.dob) === "teen";

export const minorFullName = (m: MinorDraft): string =>
  [m.first_name, m.last_name].filter(Boolean).join(" ").trim();

// ── Check-in decision (pure mirror of the redeem_trial_family SQL) ─────────
// The DATABASE enforces these rules; this module mirrors them so they are
// unit-testable. A minor may only be admitted when the linked adult is checked
// into the SAME session, or is being checked in now. Idempotent — already-used
// tickets are skipped, never double-admitted.

export interface FamilyTicket {
  id: string;
  name: string;
  isAdult: boolean;
  alreadyUsed: boolean;
}

export type FamilyCheckinResult =
  | { ok: true; admitted: string[]; alreadyIn: boolean }
  | { ok: false; reason: "parent_required" | "already_used" };

export const decideFamilyCheckin = (opts: {
  selected: FamilyTicket[];
  adultAlreadyInSameSession: boolean;
}): FamilyCheckinResult => {
  const hasMinor = opts.selected.some((t) => !t.isAdult);
  const adultPresent = opts.selected.some((t) => t.isAdult) || opts.adultAlreadyInSameSession;

  if (hasMinor && !adultPresent) {
    return { ok: false, reason: "parent_required" };
  }

  const fresh = opts.selected.filter((t) => !t.alreadyUsed);
  if (fresh.length === 0) {
    return { ok: true, admitted: [], alreadyIn: true };
  }
  return { ok: true, admitted: fresh.map((t) => t.name), alreadyIn: false };
};
