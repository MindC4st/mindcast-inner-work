import { describe, expect, it } from "vitest";
import { currentUnlockedWeek, isWeekUnlocked, unlockInstant } from "@/lib/schedule";

// Program start Sunday 2 Aug 2026, Pacific/Auckland (UTC+12 in winter).
const START = "2026-08-02";
const TZ = "Pacific/Auckland";
// Week 1 unlock = 09:30 NZT on 2 Aug = 2026-08-01T21:30:00Z
const W1 = Date.parse("2026-08-01T21:30:00Z");

describe("unlockInstant", () => {
  it("unlocks week 1 at 09:30 program time on the start Sunday", () => {
    expect(unlockInstant(START, 1, TZ)?.getTime()).toBe(W1);
  });

  it("spaces weeks 7 days apart", () => {
    const w2 = unlockInstant(START, 2, TZ)!.getTime();
    expect(w2 - W1).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("returns null for an invalid start date", () => {
    expect(unlockInstant("not-a-date", 1, TZ)).toBeNull();
  });
});

describe("isWeekUnlocked", () => {
  it("is locked one second before 09:30 and open at 09:30", () => {
    expect(isWeekUnlocked(START, 1, TZ, W1 - 1000)).toBe(false);
    expect(isWeekUnlocked(START, 1, TZ, W1)).toBe(true);
  });

  it("stays open once unlocked", () => {
    expect(isWeekUnlocked(START, 1, TZ, W1 + 400 * 24 * 3600 * 1000)).toBe(true);
  });

  it("week 2 stays locked while week 1 is open", () => {
    expect(isWeekUnlocked(START, 2, TZ, W1 + 3600 * 1000)).toBe(false);
  });

  it("no start date means nothing unlocks", () => {
    expect(isWeekUnlocked(null, 1, TZ, W1 + 10_000)).toBe(false);
  });
});

describe("currentUnlockedWeek", () => {
  it("is null before the program starts", () => {
    expect(currentUnlockedWeek(START, TZ, W1 - 1)).toBeNull();
  });

  it("tracks the highest unlocked week", () => {
    const w3 = unlockInstant(START, 3, TZ)!.getTime();
    expect(currentUnlockedWeek(START, TZ, w3 + 60_000)).toBe(3);
  });
});
