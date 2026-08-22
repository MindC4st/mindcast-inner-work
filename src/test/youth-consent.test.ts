import { describe, expect, it } from "vitest";
import {
  currentProgrammeYear,
  isYouthConsentCurrent,
  validateYouthConsentDraft,
  youthConsentExpiresAt,
} from "@/lib/youthConsent";

const complete = {
  guardianName: "Alex Guardian",
  guardianRelationship: "Parent",
  emergencyContactName: "Morgan Guardian",
  emergencyContactRelationship: "Parent",
  emergencyContactPhone: "021 555 0123",
  safeParticipationNotes: "",
  attendanceConsent: true,
  operationalDataConsent: true,
  nfcBraceletConsent: false,
  promotionalPhotoConsent: true,
  hasReferencePhoto: false,
};

describe("annual youth participation consent", () => {
  it("uses the New Zealand calendar programme year", () => {
    expect(currentProgrammeYear(new Date("2026-12-31T11:30:00Z"))).toBe(2027);
    expect(youthConsentExpiresAt(2027)).toContain("2028-01-31");
  });

  it("requires attendance and operational-data consent", () => {
    expect(validateYouthConsentDraft({ ...complete, attendanceConsent: false })).toContain("required");
    expect(validateYouthConsentDraft({ ...complete, operationalDataConsent: false })).toContain("required");
  });

  it("requires a private reference image when promotional photography is declined", () => {
    expect(validateYouthConsentDraft({
      ...complete,
      promotionalPhotoConsent: false,
      hasReferencePhoto: false,
    })).toContain("reference photo");
    expect(validateYouthConsentDraft({
      ...complete,
      promotionalPhotoConsent: false,
      hasReferencePhoto: true,
    })).toBeNull();
  });

  it("recognises only the current unrevoked programme-year record", () => {
    const now = new Date("2026-08-30T00:00:00Z");
    expect(isYouthConsentCurrent({ programme_year: 2026, expires_at: "2027-01-31T10:59:59Z", revoked_at: null }, now)).toBe(true);
    expect(isYouthConsentCurrent({ programme_year: 2025, expires_at: "2027-01-31T10:59:59Z", revoked_at: null }, now)).toBe(false);
    expect(isYouthConsentCurrent({ programme_year: 2026, expires_at: "2027-01-31T10:59:59Z", revoked_at: "2026-08-29T00:00:00Z" }, now)).toBe(false);
  });
});
