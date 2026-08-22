import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The deck has two sources of truth: the lesson_slides rows in the migration
// chain, and SLIDE_KEY_TO_KIND in FacilitatorView. They have drifted apart
// before — v3 put the video after Go Deeper in the DB while the hard-coded
// fallback still had it before — and nothing caught it, because both halves
// compile fine on their own.
//
// These tests read the actual files and assert they agree.

const root = resolve(__dirname, "../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20260820120001_lesson_flow_v4_eight_slides.sql"), "utf8");
const childMigration = readFileSync(
  resolve(root, "supabase/migrations/20260823130000_child_track_variants.sql"), "utf8");
// Restores the nine-slide child sequence (colouring before Go Deeper).
const parityMigration = readFileSync(
  resolve(root, "supabase/migrations/20260829120000_child_nine_slide_workbook_parity.sql"), "utf8");
const view = readFileSync(
  resolve(root, "src/pages/mindcast-live/FacilitatorView.tsx"), "utf8");

/** slide_key -> position, for rows the v4 migration activates. */
const slidesFromMigration = () => {
  const block = migration.slice(migration.indexOf("INSERT INTO public.lesson_slides"));
  const rows = [...block.matchAll(/\('([a-z_]+)',\s*(\d+),\s*'(?:notice|name|do)',[^)]*'\{([^}]*)\}'\)/g)];
  return rows.map(([, key, pos, tracks]) => ({
    key, position: Number(pos), tracks: tracks.split(",").map(t => t.trim()),
  }));
};

/** Apply later `UPDATE ... applies_to_tracks` statements (child variants). */
const applyTrackUpdates = (slides: { key: string; position: number; tracks: string[] }[]) => {
  for (const source of [childMigration, parityMigration]) {
    for (const [, tracks, key] of source.matchAll(
      /SET\s+applies_to_tracks\s*=\s*'\{([^}]*)\}'[\s\S]*?WHERE\s+slide_key\s*=\s*'([a-z_]+)'/g)) {
      const slide = slides.find(s => s.key === key);
      if (slide) slide.tracks = tracks.split(",").map(t => t.trim());
    }
  }
  return slides;
};

/** The client's slide_key -> render kind map. */
const kindMap = () => {
  const block = view.slice(
    view.indexOf("const SLIDE_KEY_TO_KIND"), view.indexOf("const buildDeck"));
  const out: Record<string, string | null> = {};
  for (const [, key, val] of block.matchAll(/^\s*([a-z_]+):\s*(null|"[a-z]+")/gm)) {
    out[key] = val === "null" ? null : val.replace(/"/g, "");
  }
  return out;
};

describe("lesson flow v4", () => {
  const slides = applyTrackUpdates(slidesFromMigration());
  const map = kindMap();

  it("every slide the migration activates is known to the client", () => {
    for (const s of slides) {
      expect(Object.prototype.hasOwnProperty.call(map, s.key), `unmapped slide_key: ${s.key}`).toBe(true);
    }
  });

  it("projects exactly 8 slides for Adult and Teen", () => {
    for (const track of ["Adult", "Teen"]) {
      const projected = slides
        .filter(s => s.tracks.includes(track) && map[s.key] !== null)
        .sort((a, b) => a.position - b.position);
      expect(projected.map(s => s.key), `${track} deck`).toEqual([
        "welcome", "voices", "ancient", "video", "deeper", "reflection", "intention", "affirmation",
      ]);
    }
  });

  it("Child runs nine positions with colouring before Go Deeper", () => {
    const projected = slides
      .filter(s => s.tracks.includes("Child") && map[s.key] !== null)
      .sort((a, b) => a.position - b.position)
      .map(s => s.key);
    expect(projected).toEqual([
      "welcome", "voices", "ancient", "video", "coloring", "deeper", "reflection", "intention", "affirmation",
    ]);
  });

  it("the video lands straight after In Today's World, not after Go Deeper", () => {
    const pos = (k: string) => slides.find(s => s.key === k)!.position;
    // This is the ordering that was signed off for coursebook printing: the
    // video is EVIDENCE for the idea just taught, so it cannot drift behind it.
    expect(pos("ancient")).toBeLessThan(pos("video"));
    expect(pos("video")).toBeLessThan(pos("deeper"));
  });

  it("merged-away slides are mapped to null so they can never reappear", () => {
    for (const retired of ["todays_world", "theme", "exercise"]) {
      expect(map[retired], `${retired} should map to null`).toBeNull();
    }
    expect(migration).toMatch(/SET is_active = false[\s\S]*todays_world/);
  });

  it("the intention ladder has all four Notice/Name/Do rungs", () => {
    for (const rung of ["didnt_notice", "noticed_unnamed", "noticed_named", "noticed_named_did"]) {
      expect(migration).toContain(rung);
    }
  });

  it("facilitator notes are never projected", () => {
    expect(map["notes"]).toBeNull();
  });
});
