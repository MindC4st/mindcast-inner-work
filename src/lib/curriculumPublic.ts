// Everything the public /curriculum page is allowed to say.
//
// This module exists to draw a hard line. The 52-week curriculum lives in
// `curriculum_weeks` and `mindcast_live_sessions`, and those rows carry
// facilitator prep notes, watch-fors, safeguarding guidance, source trails and
// content-approval state alongside the material a visitor may see. The public
// page reads titles and themes from the anon-safe `curriculum_public` RPC and
// takes everything else from the curated constants below.
//
// The rule, stated once so it is not re-litigated per section: a public
// section may render (a) fields returned by `curriculum_public`, or (b) a
// constant defined in this file. It may never render a row from
// `mindcast_live_sessions`. `assertPublicSafe()` at the bottom is the
// mechanical check, and it is unit tested.

import type { CurriculumWeek } from "@/hooks/useCurriculumWeeks";

/* ── The four blocks ──────────────────────────────────────────────────────
 * Names and week ranges are canonical — `curriculum_weeks.block_theme` in the
 * v3 content migration reads 'See Clearly', 'Unlearn', 'Rebuild', 'Live It'.
 * The core ideas below are the founder's public framing of each block, which
 * is not stored anywhere in the database.
 */

export interface CurriculumBlock {
  number: number;
  /** Public display name, upper-cased at the call site rather than here. */
  name: string;
  /** Fallback range, used only when the database has not loaded. */
  weeks: [number, number];
  /** One line. Shown on the block card. */
  premise: string;
  /** Two or three sentences. Shown when the block is opened. */
  detail: string;
}

export const BLOCKS: CurriculumBlock[] = [
  {
    number: 1,
    name: "See Clearly",
    weeks: [1, 13],
    premise: "Before changing something, learn to see what is actually happening.",
    detail:
      "This block builds awareness of attention, thought patterns, emotions, assumptions, habits and the signals shaping everyday behaviour. Nothing is being fixed yet. The work is learning to notice what was already going on.",
  },
  {
    number: 2,
    name: "Unlearn",
    weeks: [14, 26],
    premise:
      "Examine the rules, expectations and stories that no longer automatically deserve control.",
    // Deliberate wording. This block is the one most easily misread as
    // "reject where you came from", and that is not what it is.
    detail:
      "Some strategies were useful once and kept running long after the situation changed. This is not about rejecting family, culture or the past. It is about examining what you inherited and deciding, deliberately, what still earns a say.",
  },
  {
    number: 3,
    name: "Rebuild",
    weeks: [27, 39],
    premise: "Turn awareness into deliberate architecture.",
    detail:
      "Values, behaviour, environment, recovery, relationships, self-talk and direction — the conditions that make intentional action easier to sustain, built on purpose rather than left to chance.",
  },
  {
    number: 4,
    name: "Live It",
    weeks: [40, 52],
    premise: "Take the tools out into real life.",
    detail:
      "Practise values, communication, generosity, relationships, goals and attention, and use the tools independently — without needing the programme to keep prompting you.",
  },
];

export const blockByNumber = (n: number | null | undefined) =>
  BLOCKS.find((b) => b.number === n) ?? null;

/**
 * Real week ranges, measured from the loaded curriculum rather than assumed.
 * Falls back to the constant above while the RPC is in flight, or if a block
 * has no rows yet — the page should never render "Weeks NaN–NaN".
 */
export const blockRange = (block: CurriculumBlock, weeks: CurriculumWeek[]): [number, number] => {
  const mine = weeks.filter((w) => w.block_number === block.number).map((w) => w.week_number);
  if (mine.length === 0) return block.weeks;
  return [Math.min(...mine), Math.max(...mine)];
};

/* ── The weekly rhythm ────────────────────────────────────────────────────
 * The public page names the midweek slot MIDWEEK (LIFE GROUPS) and the end of
 * the week FRI (CHECK-IN). The curriculum data underneath still carries the
 * older `weekly_practice_wed` / `weekly_practice_sun` column names from when
 * the practice days were Mon/Wed/Sun. The labels here are the source of truth
 * for what a visitor is told; the column names are an implementation detail
 * and must not leak into the page.
 */

export interface RhythmStep {
  /** Short label — SUN (TODAY), MIDWEEK, FRI. */
  day: string;
  /** What happens then. */
  title: string;
  body: string;
  /** The last step loops back to the first. */
  returns?: boolean;
}

export const RHYTHM: RhythmStep[] = [
  {
    day: "SUN (TODAY)",
    title: "Learn + set your intention",
    body: "The session introduces the week's idea, and you leave having written down one small thing to carry into the next seven days.",
  },
  {
    day: "MIDWEEK",
    title: "Life Groups",
    body: "A smaller room, midweek. You return to the intention you set and talk about what has actually happened so far — not what was supposed to happen.",
  },
  {
    day: "FRI",
    title: "Check-in",
    body: "One short return on your own. You mark where you got to this week, in your own words, for nobody else's benefit.",
  },
  {
    day: "SUN",
    title: "Return + begin again",
    body: "You come back with something real to reflect on, and the next week builds on it rather than starting over.",
    returns: true,
  },
];

/** The adult progression, used across the rhythm and the Week 1 preview. */
export const NOTICE_NAME_DO = ["NOTICE IT", "NAME IT", "DO IT"] as const;

/* ── Week 1, in public ────────────────────────────────────────────────────
 * Titles and theme are canonical (`curriculum_public` returns them, and the
 * page prefers the live values over these). These constants are the preview
 * copy — a condensed representation of the session, not the session.
 *
 * What is deliberately NOT here, and must never be added: facilitator prep
 * notes, watch-fors, the first-time note, source trails, evidence commentary,
 * internal join codes, moderation instructions, safeguarding procedure, and
 * content-approval state.
 */

export type TrackKey = "adult" | "teen" | "child";

export interface TrackPreview {
  key: TrackKey;
  label: string;
  /** Canonical session title. Overridden by the RPC when it loads. */
  title: string;
  /** How this track translates the shared idea. */
  translation: string;
  /** Whether this track has any digital surface at all. Teen and child: no. */
  digital: boolean;
}

/** The one idea all three rooms are working on in Week 1. */
export const WEEK1_THEME = "The Signal and the Noise";

export const WEEK1_SHARED_CONCEPT =
  "We are always receiving signals — from our body, our thoughts, other people and the world around us. The skill is noticing what is arriving, working out where it came from, and choosing what deserves our attention.";

export const WEEK1_TRACKS: Record<TrackKey, TrackPreview> = {
  adult: {
    key: "adult",
    label: "ADULT",
    title: "What Are You Actually Receiving?",
    translation:
      "Notice which inputs are shaping your attention and thinking, then decide what to keep, question or set aside.",
    digital: true,
  },
  teen: {
    key: "teen",
    label: "TEEN",
    title: "Who's Actually Talking?",
    translation:
      "Notice which opinions, reactions and expectations you picked up from people, feeds or past experiences, then decide what you actually want to do with them.",
    digital: false,
  },
  child: {
    key: "child",
    label: "CHILD",
    title: "Finding Your Station",
    translation:
      "Notice body and feeling signals using movement, pictures and simple words, then choose whether to keep noticing, take a break, or ask a trusted grown-up for help.",
    digital: false,
  },
};

export const TRACK_ORDER: TrackKey[] = ["adult", "teen", "child"];

/** The adult preview: question, idea, practice. */
export const WEEK1_ADULT = {
  question:
    "What is one thing that has taken up more of your attention this week than you intended?",
  // The navigation metaphor is canonical to Week 1 — the session's ancient
  // wisdom reframe is about navigators steering by stars through cloud.
  ideaLead:
    "When you have been moving for long enough, drift is difficult to notice from inside the boat.",
  ideaBody:
    "Notifications, conversations, expectations, feeds, other people's moods and repeated messages can capture attention long before we deliberately choose them. None of that is a character flaw. It is just difficult to see from the inside.",
  practice: ["NOTICE IT", "LOCATE IT", "CHOOSE"],
  practiceShift: "Ask WHAT before WHY.",
  practiceShiftWhy:
    "“Why am I like this?” tends to produce a story. “What just happened?” produces something you can actually work with.",
  intentionTemplate: {
    lead: "When I notice",
    cuePlaceholder: "a specific cue",
    middle: "capturing my attention, I will",
    actionPlaceholder: "one small action",
    note: "Keep the action small enough to do on a bad day.",
  },
} as const;

/** The teen preview: where an opinion came from, and what to do about it. */
export const WEEK1_TEEN = {
  keyLine: "Familiar is not the same as true.",
  nuance:
    "Being influenced by other people is completely normal — it is how humans work. The goal is not rebellion, and it is not automatically rejecting your group. The skill is noticing the influence early enough to make a deliberate choice.",
  examples: [
    "trends",
    "group chats",
    "games",
    "friends",
    "school",
    "expectations",
    "social media",
    "group opinions",
  ],
  /** The sorting step. */
  sources: ["MINE", "PICKED UP", "NOT SURE"],
  /** All four outcomes are equally valid. Do not style one as the answer. */
  outcomes: ["KEEP IT", "CHANGE IT", "SET IT ASIDE", "NOT SURE YET"],
} as const;

/** The child preview: body detectives and the lighthouse. */
export const WEEK1_CHILD = {
  activity: "BODY DETECTIVES",
  // A signal is information, not an instruction. The page must never imply a
  // given sensation has one fixed emotional meaning.
  coreIdea: "A body signal is information, not an instruction.",
  signals: [
    "rumbling tummy",
    "hot cheeks",
    "fast heart",
    "tired eyes",
    "wiggly legs",
    "warm or cold",
    "something else",
  ],
  colouring: {
    title: "Colour the lighthouse",
    body: "A lighthouse shining through wind and waves — canonical to Week 1, where the light that keeps going in a storm is the child's version of the signal.",
    thenWhat:
      "Then they add one small body signal somewhere in the picture. Their own idea counts.",
  },
  learnsThrough: ["MOVE", "NOTICE", "DRAW", "TALK", "PLAY", "PRACTISE"],
} as const;

/* ── Public-safety check ──────────────────────────────────────────────────*/

/**
 * Field names on `mindcast_live_sessions` and `curriculum_weeks` that must
 * never reach a public surface. Kept as a list rather than a comment so the
 * test can assert on it — a comment does not fail a build.
 */
export const INTERNAL_ONLY_FIELDS = [
  "facilitator_prep_notes",
  "watch_for",
  "first_time_note",
  "s5_source_opening_hook",
  "s5_source_core_concept",
  "video_transcript",
  "private_write_prompt",
  "notes",
  "join_code",
  "content_status",
  "review_status",
  "safeguarding_notes",
  "moderation_notes",
] as const;

/**
 * The fields `curriculum_public` returns, and therefore the only database
 * columns the public page may render.
 */
export const PUBLIC_CURRICULUM_FIELDS = [
  "week_number",
  "block_number",
  "block_theme",
  "weekly_theme",
  "core_learning",
  "adult_video_title",
  "teen_video_title",
  "kids_title",
] as const;

/**
 * True when an object contains only fields the public page may render.
 * Used by the test suite against the shape the page actually passes down, so
 * that widening the RPC's SELECT cannot silently widen the public page.
 */
export const assertPublicSafe = (row: Record<string, unknown>): string[] =>
  Object.keys(row).filter((k) =>
    (INTERNAL_ONLY_FIELDS as readonly string[]).includes(k),
  );
