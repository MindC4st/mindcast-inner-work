import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRACTICE_SLOTS, practiceText, practiceEntries } from "@/lib/practiceCadence";

const root = resolve(__dirname, "../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20260822120000_practice_cadence_sun_midweek_fri.sql"), "utf8");

describe("weekly practice cadence", () => {
  it("is SUN (TODAY) → MIDWEEK → FRI, in that order", () => {
    expect(PRACTICE_SLOTS.map((s) => s.printLabel)).toEqual(["SUN (TODAY)", "MIDWEEK", "FRI"]);
  });

  it("uses MIDWEEK, never a specific weekday", () => {
    // Life Groups run Tuesday AND Wednesday, and not every member is in one.
    // A weekday label would be wrong for half the room on every printed sheet.
    const labels = PRACTICE_SLOTS.map((s) => `${s.label} ${s.printLabel}`).join(" ").toLowerCase();
    for (const day of ["mon", "tues", "wed", "thur"]) {
      expect(labels, `cadence should not name ${day}`).not.toContain(day);
    }
  });

  it("every slot key is a column the migration creates", () => {
    for (const slot of PRACTICE_SLOTS) {
      expect(migration, `migration missing ${slot.key}`).toContain(slot.key);
    }
  });

  it("all three slots serve one commitment", () => {
    // The old cadence held three unrelated activities, so by the next Sunday
    // there was nothing to return to. Sunday writes it; midweek and Friday
    // check in on the same thing.
    expect(migration).toMatch(/practice_sun_today\s*=\s*\n?\s*'Write your if-then plan/);
    expect(migration).toMatch(/practice_midweek\s*=\s*\n?\s*'Check in on the plan/);
    expect(migration).toMatch(/practice_fri\s*=\s*\n?\s*'Check in again/);
  });

  it("keeps each week's authored line as the suggested cue", () => {
    expect(migration).toContain("Suggested cue this week: ");
  });

  it("rescues the third slot for weeks 1-31 before retiring the old column", () => {
    expect(migration).toMatch(/SET practice_fri = weekly_practice_sun/);
    // Non-destructive: the old column is commented as retired, never dropped.
    expect(migration).not.toMatch(/DROP COLUMN\s+weekly_practice/i);
  });

  it("falls back to the old column names during the deploy window", () => {
    // Code ships before or with the migration; three empty boxes in front of a
    // room is worse than reading a legacy column for one deploy.
    const legacy = { weekly_practice_mon: "old sunday", weekly_practice_wed: "old midweek" };
    expect(practiceText(legacy, "practice_sun_today")).toBe("old sunday");
    expect(practiceText(legacy, "practice_midweek")).toBe("old midweek");
  });

  it("prefers the new column when both are present", () => {
    const both = { practice_sun_today: "new", weekly_practice_mon: "old" };
    expect(practiceText(both, "practice_sun_today")).toBe("new");
  });

  it("drops empty slots rather than rendering blank boxes", () => {
    const partial = { practice_sun_today: "write it", practice_midweek: "", practice_fri: "   " };
    expect(practiceEntries(partial).map((e) => e.key)).toEqual(["practice_sun_today"]);
  });
});
