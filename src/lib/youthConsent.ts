export const YOUTH_CONSENT_NOTICE_VERSION = "2026-08-30";
export const YOUTH_REFERENCE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const YOUTH_REFERENCE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const currentProgrammeYear = (now = new Date()) =>
  Number(new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
  }).format(now));

/** Annual consent is renewed at the start of each calendar programme year. */
export const youthConsentExpiresAt = (programmeYear: number) =>
  `${programmeYear + 1}-01-31T10:59:59.999Z`;

export type YouthConsentDraft = {
  guardianName: string;
  guardianRelationship: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  safeParticipationNotes: string;
  attendanceConsent: boolean;
  operationalDataConsent: boolean;
  nfcBraceletConsent: boolean;
  promotionalPhotoConsent: boolean;
  hasReferencePhoto: boolean;
};

export const validateYouthConsentDraft = (draft: YouthConsentDraft): string | null => {
  if (draft.guardianName.trim().length < 2) return "Enter the parent or legal guardian's name.";
  if (draft.guardianRelationship.trim().length < 2) return "Enter their relationship to the young person.";
  if (draft.emergencyContactName.trim().length < 2) return "Enter an emergency contact name.";
  if (draft.emergencyContactRelationship.trim().length < 2) return "Enter the emergency contact's relationship.";
  if (draft.emergencyContactPhone.trim().length < 6) return "Enter a valid emergency contact phone number.";
  if (!draft.attendanceConsent || !draft.operationalDataConsent) {
    return "Attendance and essential operational-data consent are required before participation.";
  }
  if (!draft.promotionalPhotoConsent && !draft.hasReferencePhoto) {
    return "Upload a current reference photo so staff can protect the no-photo choice.";
  }
  return null;
};

export const isYouthConsentCurrent = (
  consent: { programme_year: number; expires_at: string; revoked_at: string | null } | null | undefined,
  now = new Date(),
) => Boolean(
  consent &&
  consent.programme_year === currentProgrammeYear(now) &&
  !consent.revoked_at &&
  Date.parse(consent.expires_at) > now.getTime()
);
