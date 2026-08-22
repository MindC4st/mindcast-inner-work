import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BLOCKS,
  INTERNAL_ONLY_FIELDS,
  NOTICE_NAME_DO,
  RHYTHM,
  TRACK_ORDER,
  WEEK1_TRACKS,
  assertPublicSafe,
  blockRange,
} from "@/lib/curriculumPublic";
import type { CurriculumWeek } from "@/hooks/useCurriculumWeeks";

const root = resolve(__dirname, "../..");

/**
 * Source with comments removed.
 *
 * These tests assert on what the page can actually render, so they have to
 * read past the prose. Without this, a comment explaining *why* the page must
 * never touch `localStorage` would itself fail the test that checks the page
 * never touches `localStorage` — which would teach the next person to delete
 * the explanation rather than keep the rule.
 */
const read = (p: string) =>
  readFileSync(resolve(root, p), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");

const page = read("src/pages/Curriculum.tsx");
const preview = read("src/components/curriculum/WeekOnePreview.tsx");
const binder = read("src/components/curriculum/LifeBinder.tsx");
const demo = read("src/components/curriculum/JournalDemo.tsx");
const publicSurface = page + preview + binder + demo;

const week = (week_number: number, block_number: number): CurriculumWeek => ({
  id: String(week_number),
  week_number,
  block_number,
  block_theme: null,
  weekly_theme: null,
  title: null,
  source: null,
  notes: null,
});

describe("curriculum blocks", () => {
  it("has the four blocks in order", () => {
    expect(BLOCKS.map((b) => b.name)).toEqual(["See Clearly", "Unlearn", "Rebuild", "Live It"]);
  });

  it("covers all 52 weeks with no gap and no overlap", () => {
    const covered = BLOCKS.flatMap((b) =>
      Array.from({ length: b.weeks[1] - b.weeks[0] + 1 }, (_, i) => b.weeks[0] + i),
    );
    expect(covered).toEqual(Array.from({ length: 52 }, (_, i) => i + 1));
  });

  it("puts week 1 in See Clearly", () => {
    expect(BLOCKS[0].weeks[0]).toBe(1);
  });

  it("measures block ranges from the database when it has loaded", () => {
    // If the curriculum is re-cut, the page must show the real ranges rather
    // than the constants it shipped with.
    const weeks = [week(1, 1), week(2, 1), week(3, 1), week(20, 2)];
    expect(blockRange(BLOCKS[0], weeks)).toEqual([1, 3]);
  });

  it("falls back to the constant rather than rendering NaN", () => {
    // Called on first paint, before the RPC answers.
    expect(blockRange(BLOCKS[0], [])).toEqual([1, 13]);
    expect(blockRange(BLOCKS[3], [])).toEqual([40, 52]);
  });

  it("does not describe Unlearn as rejecting family, culture or the past", () => {
    // The block most easily misread. The brief is explicit that the emphasis
    // is examination and choice.
    const unlearn = BLOCKS[1];
    expect(unlearn.detail).toMatch(/not about rejecting/i);
    expect(unlearn.premise + unlearn.detail).toMatch(/deciding|choice|examin/i);
  });
});

describe("the weekly rhythm as the public sees it", () => {
  it("runs SUN (TODAY) → MIDWEEK → FRI → SUN", () => {
    expect(RHYTHM.map((s) => s.day)).toEqual(["SUN (TODAY)", "MIDWEEK", "FRI", "SUN"]);
  });

  it("names the midweek slot as Life Groups", () => {
    expect(RHYTHM[1].title).toMatch(/life group/i);
  });

  it("closes the loop rather than ending on a checklist", () => {
    expect(RHYTHM[RHYTHM.length - 1].returns).toBe(true);
  });

  it("never shows WED anywhere on the public page", () => {
    // The curriculum data still carries `weekly_practice_wed` from when the
    // practice days were Mon/Wed/Sun. That column name is an implementation
    // detail; a visitor is told MIDWEEK.
    expect(JSON.stringify(RHYTHM)).not.toMatch(/\bWED\b/);
    expect(publicSurface).not.toMatch(/\bweekly_practice_wed\b/);
  });

  it("uses NOTICE IT → NAME IT → DO IT for adults", () => {
    expect(NOTICE_NAME_DO).toEqual(["NOTICE IT", "NAME IT", "DO IT"]);
  });
});

describe("digital access rules", () => {
  it("gives a digital surface to adults only", () => {
    expect(WEEK1_TRACKS.adult.digital).toBe(true);
    expect(WEEK1_TRACKS.teen.digital).toBe(false);
    expect(WEEK1_TRACKS.child.digital).toBe(false);
  });

  it("shows the journal demo on the adult panel and nowhere else", () => {
    // JournalDemo is rendered once, inside AdultPanel. If it ever appears in
    // TeenPanel or ChildPanel this test fails, which is the point.
    const teenPanel = preview.slice(preview.indexOf("const TeenPanel"), preview.indexOf("const ChildPanel"));
    const childPanel = preview.slice(preview.indexOf("const ChildPanel"), preview.indexOf("const PANELS"));
    expect(teenPanel).not.toContain("JournalDemo");
    expect(childPanel).not.toContain("JournalDemo");
  });

  it("states that teen and child work is not stored", () => {
    expect(preview).toMatch(/never typed, submitted or stored/i);
    expect(preview).toMatch(/device-free/i);
  });

  it("covers all three tracks", () => {
    expect(TRACK_ORDER).toEqual(["adult", "teen", "child"]);
    for (const t of TRACK_ORDER) expect(WEEK1_TRACKS[t].title.length).toBeGreaterThan(0);
  });
});

describe("the journal demo never persists anything", () => {
  // The riskiest component on the page: an anonymous visitor, possibly a
  // minor, typing a private reflection into something shaped like a journal.
  it("imports nothing that can write", () => {
    for (const forbidden of ["supabase", "@/lib/db", "useMutation", "react-query"]) {
      expect(demo, `JournalDemo must not import ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("does not reach storage, the network, or analytics", () => {
    for (const forbidden of ["localStorage", "sessionStorage", "fetch(", "navigator.sendBeacon", "gtag", "posthog"]) {
      expect(demo, `JournalDemo must not use ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("has no form element to submit", () => {
    expect(demo).not.toMatch(/<form[\s>]/);
    expect(demo).not.toMatch(/onSubmit/);
  });

  it("tells the visitor it isn't saved", () => {
    expect(demo).toContain("this demo isn't saved");
  });
});

describe("internal curriculum material stays internal", () => {
  it("flags any internal field handed to a public component", () => {
    expect(assertPublicSafe({ week_number: 1, weekly_theme: "x" })).toEqual([]);
    expect(assertPublicSafe({ week_number: 1, facilitator_prep_notes: "…" }))
      .toEqual(["facilitator_prep_notes"]);
  });

  it("never reads an internal field anywhere on the public surface", () => {
    // Matched as a property access or a quoted key, not as a bare word.
    // `notes` is a real column on curriculum_weeks and also an ordinary
    // English noun — "a year of weekly notes" in alt text is not a leak, and
    // a test that says it is would be turned off within a week.
    for (const field of INTERNAL_ONLY_FIELDS) {
      const asFieldAccess = new RegExp(`[.\\[]\\s*["']?${field}["']?|["']${field}["']\\s*:`);
      expect(asFieldAccess.test(publicSurface), `public page reads .${field}`).toBe(false);
    }
  });

  it("reads only the anon-safe RPC, never the session tables", () => {
    // curriculum_public is SECURITY DEFINER and granted to anon; it returns
    // titles and themes. mindcast_live_sessions is where the facilitator prep
    // notes, watch-fors and source trails live.
    expect(publicSurface).not.toContain("mindcast_live_sessions");
    expect(publicSurface).not.toContain("lesson_slides");
    expect(page).toContain("useCurriculumWeeks");
  });
});

describe("no gamification", () => {
  it("has no streaks, scores, XP or completion percentages", () => {
    // "Sometimes the win is noticing something you would previously have
    // missed." A page that scored that would undo the ladder.
    for (const banned of [/\bstreak/i, /\bXP\b/, /\bleaderboard/i, /\bbadge/i, /\d+% complete/i]) {
      expect(publicSurface.match(banned)?.[0] ?? null, `found ${banned}`).toBeNull();
    }
  });

  it("presents the three ladder outcomes without ranking them", () => {
    expect(page).toMatch(/no failure state/i);
  });
});

describe("the homepage closing block is an exploration CTA", () => {
  // AboutContent is embedded on the homepage as an ivory band and also serves
  // /about, so this one block is the closing CTA on both. The redesign moved
  // the block into the AboutCta component; the rule it must keep: explore the
  // curriculum first, membership is a quiet tertiary link, never the headline.
  const about = read("src/pages/About.tsx");
  const closing = about.slice(about.indexOf("const AboutCta"));

  it("finds the closing block", () => {
    // If this fails, the landmark moved — and every assertion below would
    // pass vacuously on a near-empty slice. Fail loudly instead.
    expect(closing.length, "closing slice is empty — the AboutCta landmark moved").toBeGreaterThan(200);
  });

  it("no longer asks the visitor to become a member", () => {
    expect(closing).not.toContain("READY TO START?");
    expect(closing).not.toContain("BECOME A MEMBER");
    expect(closing).not.toContain("52 weeks of showing up");
    expect(closing).not.toContain("JOIN THE ROOM");
  });

  it("leads with the curriculum exploration CTA", () => {
    expect(closing).toContain("OPEN THE FIRST PAGE.");
    expect(closing).toContain("EXPLORE THE FULL CURRICULUM");
  });

  it("routes to /curriculum as the primary action", () => {
    expect(closing).toMatch(/to="\/curriculum"/);
    // The closing block is a pure exploration CTA — no membership ask at all.
    expect(closing).not.toContain("View membership options.");
  });
});

describe("the page's own structure", () => {
  it("keeps membership off the exploration page", () => {
    // The binder exists to look inside the curriculum, not to sell a
    // membership. Sliced on the landing page's code landmark; the guard below
    // fails loudly if the landmark moves and the slice goes empty.
    const landing = page.slice(page.indexOf("const NotesPage"), page.indexOf("const PhasesPage"));
    expect(landing.length, "landing slice is empty — the NotesPage landmark moved").toBeGreaterThan(100);
    expect(landing).not.toContain("/membership");
    expect(landing).toContain("Open phase one");
    // The redesign carries no join CTA anywhere on the page.
    expect(page).not.toContain("/membership");
  });

  it("says the visitor worksheet is included", () => {
    expect(page).toMatch(/Included for visitors/i);
    expect(page).toMatch(/Every visitor receives the worksheet/i);
  });

  it("states the journal is private", () => {
    expect(page).toMatch(/private digital journal/i);
  });
});
