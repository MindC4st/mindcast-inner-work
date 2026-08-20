import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LADDER, ladderRung, ladderLabel } from "@/components/session/IntentionLadder";

const root = resolve(__dirname, "../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20260820140001_intention_ladder_and_whiteboard.sql"), "utf8");
const v4 = readFileSync(
  resolve(root, "supabase/migrations/20260820120001_lesson_flow_v4_eight_slides.sql"), "utf8");

describe("Notice → Name → Do ladder", () => {
  it("has four cumulative rungs in order", () => {
    expect(LADDER.map((r) => r.value)).toEqual([
      "didnt_notice", "noticed_unnamed", "noticed_named", "noticed_named_did",
    ]);
  });

  it("every rung the UI offers is accepted by the database", () => {
    // Two guards must agree: the CHECK constraint on the column and the
    // explicit validation inside set_intention_outcome.
    for (const r of LADDER) {
      expect(v4, `CHECK missing ${r.value}`).toContain(r.value);
      expect(migration, `RPC guard missing ${r.value}`).toContain(r.value);
    }
  });

  it("ranks rungs 0-3 for the progress chart", () => {
    expect(ladderRung("didnt_notice")).toBe(0);
    expect(ladderRung("noticed_named_did")).toBe(3);
  });

  it("treats an unrecorded week as the lowest rung, never as negative", () => {
    // findIndex returns -1 for unknown values; a negative rung would invert the
    // bar height and read as a taller result than "didn't notice".
    expect(ladderRung(null)).toBe(0);
    expect(ladderRung(undefined)).toBe(0);
    expect(ladderRung("nonsense")).toBe(0);
  });

  it("labels an unrecorded week rather than rendering blank", () => {
    expect(ladderLabel(null)).toBe("Not recorded");
  });

  it("no rung is presented as a pass or a fail", () => {
    const text = LADDER.map((r) => `${r.label} ${r.hint}`).join(" ").toLowerCase();
    for (const word of ["fail", "success", "well done", "missed out", "should have"]) {
      expect(text, `ladder copy should not contain "${word}"`).not.toContain(word);
    }
  });

  it("writes against the caller's own profile only", () => {
    // The RPC must resolve the profile server-side; accepting a profile id as
    // an argument would let any member write another member's self-assessment.
    expect(migration).toContain("public.current_profile_id()");
    expect(migration).not.toMatch(/set_intention_outcome\(\s*p_profile/);
  });

  it("keeps the history read private to the caller", () => {
    expect(migration).toMatch(/my_intention_history[\s\S]*current_profile_id\(\)/);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.my_intention_history[\s\S]*anon/);
  });
});

describe("whiteboard activity", () => {
  it("is allowed by the activity_type constraint", () => {
    expect(migration).toMatch(/activity_type IN \([^)]*'whiteboard'/);
  });

  it("is what week 1 uses", () => {
    expect(migration).toMatch(/SET activity_type = 'whiteboard'[\s\S]*week_number = 1/);
  });

  it("is registered as a canvas surface, not a tally surface", () => {
    const reg = readFileSync(resolve(root, "src/components/session/activitySurfaces.tsx"), "utf8");
    expect(reg).toMatch(/whiteboard:\s*ExerciseWhiteboard/);
    // Lazy, so tldraw (the largest chunk in the bundle) never loads for a week
    // that doesn't use it.
    expect(reg).toMatch(/lazy\(\(\) => import\("@\/components\/whiteboard\/ExerciseWhiteboard"\)\)/);
  });
});
