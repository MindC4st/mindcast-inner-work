import { describe, expect, it } from "vitest";
import {
  attendanceSummary,
  eligibleAttendanceOutcomes,
  isMeaningfulResponse,
  journalCompletion,
  retentionAtDays,
  type TestSession,
} from "@/lib/adminReporting";

const sessions: TestSession[] = [
  { id: "s1", date: "2026-01-04", track: "Adult" },
  { id: "s2", date: "2026-01-11", track: "Adult" },
  { id: "s3", date: "2026-01-18", track: "Adult" },
  { id: "cancelled", date: "2026-01-25", track: "Adult", cancelled: true },
  { id: "teen", date: "2026-01-18", track: "Teen" },
  { id: "s4", date: "2026-02-01", track: "Adult" },
];

describe("admin reporting attendance definitions", () => {
  it("counts every eligible attended session and ignores cancelled/other-track sessions", () => {
    const outcomes = eligibleAttendanceOutcomes(
      { startsAt: "2026-01-01", track: "Adult" },
      sessions,
      new Set(["s1", "s2", "s3", "s4", "cancelled", "teen"]),
    );
    expect(attendanceSummary(outcomes)).toMatchObject({
      eligible: 4, attended: 4, missed: 0, rate: 1, currentStreak: 4, longestStreak: 4,
    });
  });

  it("calculates return after one miss", () => {
    const outcomes = eligibleAttendanceOutcomes(
      { startsAt: "2026-01-01", track: "Adult" }, sessions, new Set(["s1", "s3", "s4"]),
    );
    expect(attendanceSummary(outcomes).returnAfterMiss).toEqual({ denominator: 1, returned: 1, rate: 1 });
  });

  it("calculates return after two consecutive misses", () => {
    const outcomes = eligibleAttendanceOutcomes(
      { startsAt: "2026-01-01", track: "Adult" }, sessions, new Set(["s1", "s4"]),
    );
    expect(attendanceSummary(outcomes).returnAfterTwoMisses).toEqual({ denominator: 1, returned: 1, rate: 1 });
  });

  it("does not mark sessions before joining or after becoming inactive as missed", () => {
    const outcomes = eligibleAttendanceOutcomes(
      { startsAt: "2026-01-10", endsAt: "2026-01-20", track: "Adult" },
      sessions,
      new Set(["s2"]),
    );
    expect(outcomes.map((outcome) => outcome.sessionId)).toEqual(["s2", "s3"]);
    expect(attendanceSummary(outcomes)).toMatchObject({ eligible: 2, attended: 1, missed: 1 });
  });
});

describe("admin reporting retention definitions", () => {
  it("retains a member still active at eight weeks", () => {
    expect(retentionAtDays([{ startedAt: "2026-01-01" }], 56, "2026-04-01")).toEqual({
      denominator: 1, retained: 1, rate: 1,
    });
  });

  it("counts a member who churns before eight weeks as not retained", () => {
    expect(retentionAtDays([
      { startedAt: "2026-01-01", endedAt: "2026-02-01" },
    ], 56, "2026-04-01")).toEqual({ denominator: 1, retained: 0, rate: 0 });
  });

  it("excludes a member who has not existed long enough from the denominator", () => {
    expect(retentionAtDays([{ startedAt: "2026-03-01" }], 56, "2026-03-29")).toEqual({
      denominator: 0, retained: 0, rate: null,
    });
  });

  it("preserves historical retention before a later cancellation", () => {
    expect(retentionAtDays([
      { startedAt: "2026-01-01", endedAt: "2026-05-01" },
    ], 56, "2026-06-01").rate).toBe(1);
  });
});

describe("admin reporting journal definitions", () => {
  const fields = ["a", "b", "c", "d", "e", "f", "g"];

  it("handles 0/7, 3/7 and 7/7 completion", () => {
    expect(journalCompletion({}, fields)).toEqual({ available: 7, completed: 0, rate: 0 });
    expect(journalCompletion({ a: "One", b: "Two", c: "Three" }, fields)).toEqual({
      available: 7, completed: 3, rate: 3 / 7,
    });
    expect(journalCompletion(Object.fromEntries(fields.map((field) => [field, field])), fields)).toEqual({
      available: 7, completed: 7, rate: 1,
    });
  });

  it("does not count null, whitespace or placeholder defaults", () => {
    expect(isMeaningfulResponse(null)).toBe(false);
    expect(isMeaningfulResponse("   ")).toBe(false);
    expect(isMeaningfulResponse("Type here")).toBe(false);
    expect(isMeaningfulResponse("A real reflection")).toBe(true);
  });
});

