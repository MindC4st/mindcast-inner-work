#!/usr/bin/env node
/**
 * pull-notion-lessons.mjs — pull the Notion lesson-plan exports into the app.
 *
 * The Notion boards (52-Week Curriculum — Lessons) are the working source for
 * lesson content. When the founder edits a lesson there and re-exports, this
 * script regenerates two things:
 *
 *   1. A migration that syncs curriculum_weeks with the latest per-track
 *      lesson TITLES (what the public curriculum page lists) plus the shared
 *      weekly theme where the export provides one.
 *   2. src/lib/lessonOnePreview.ts — the PUBLIC, safety-filtered Week 1
 *      lesson content for all three tracks, rendered on /curriculum so a
 *      visitor can see what each room actually covers.
 *
 * What never leaves this script for the public surface: Slide Notes,
 * facilitator notes (aim, run the room, safeguarding, evidence, source
 * trail), join codes, and anything else marked STRUCTURED for the room only.
 * If you add fields to the public preview, justify them against the
 * curriculum_public rules in src/lib/curriculumPublic.ts first.
 *
 * Usage:
 *   node scripts/pull-notion-lessons.mjs \
 *     --adult <dir-with-adult-mds> \
 *     --teen  <dir-with-teen-mds> \
 *     --child <dir-with-child-mds>
 *
 * Each directory is the extracted Notion "Markdown & CSV" export for one
 * track board (the folder containing "Week N — Title <hash>.md" files).
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* ── CLI ────────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const DIRS = {
  adult: flag("--adult"),
  teen: flag("--teen"),
  child: flag("--child"),
};

if (!DIRS.adult || !DIRS.teen || !DIRS.child) {
  console.error(
    "Usage: node scripts/pull-notion-lessons.mjs --adult <dir> --teen <dir> --child <dir>",
  );
  process.exit(1);
}

/* ── Parsing ────────────────────────────────────────────────────────────── */

/** Strip Notion export artefacts (hashes in links, <aside> tags, emoji). */
const cleanText = (s) =>
  s
    .replace(/<aside>[\s\S]*?<\/aside>/g, "") // handled separately
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[💡🧭🎯🛡️📌🔍🪞🎧✍️🌱]/gu, "")
    .replace(/\s+\n/g, "\n")
    .trim();

/** Parse one exported lesson MD into a structured object. */
function parseLesson(raw) {
  const lesson = {
    week: null,
    title: "",
    blockTheme: "",
    callbackLine: "",
    heavyWeek: false,
    phase: "",
    phaseName: "",
    weekType: "",
    weeklyTheme: "",
    sharedCoreConcept: "",
    trackTranslation: "",
    territory: "",
    sections: new Map(), // "Slide 3/Ancient Wisdom Quote" -> text
  };

  // H1: "# Week 1 — Who's Actually Talking?"
  const h1 = raw.match(/^#\s+Week\s+(\d+)\s*[—–-]\s*(.+)$/m);
  if (!h1) throw new Error("No 'Week N — Title' heading found");
  lesson.week = Number(h1[1]);
  lesson.title = h1[2].trim();

  // Metadata lines
  const meta = (key) => {
    const m = raw.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };
  lesson.blockTheme = meta("Block theme");
  lesson.callbackLine = meta("Callback line");
  lesson.heavyWeek = /^yes/i.test(meta("Heavy week"));
  lesson.phase = meta("Phase");
  lesson.phaseName = meta("Phase name");
  lesson.weekType = meta("Week type");

  // <aside> block: weekly theme, shared core concept, track translation
  const aside = raw.match(/<aside>([\s\S]*?)<\/aside>/);
  if (aside) {
    const body = aside[1];
    const field = (label) => {
      const m = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*|\\n\\s*$)`, "m"));
      return m ? m[1].replace(/\s+/g, " ").trim() : "";
    };
    lesson.weeklyTheme = field("Weekly theme");
    lesson.sharedCoreConcept = field("Shared core concept");
    lesson.trackTranslation =
      field("Adult translation") || field("Teen translation") || field("Child translation");
  }

  // "> THE TERRITORY: ..."
  const terr = raw.match(/^>\s*THE TERRITORY:\s*(.+)$/m);
  if (terr) lesson.territory = terr[1].trim();

  // Section tree: split on ## and ### headings, keep full paths.
  const lines = raw.split("\n");
  let h2 = "";
  let h3 = "";
  let buf = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text) {
      const key = h3 ? `${h2}/${h3}` : h2;
      lesson.sections.set(key, cleanText(text));
    }
    buf = [];
  };
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)$/);
    const m3 = line.match(/^###\s+(.+)$/);
    if (m2 && !line.startsWith("###")) {
      flush();
      h2 = m2[1].trim();
      h3 = "";
    } else if (m3) {
      flush();
      h3 = m3[1].trim();
    } else if (h2) {
      buf.push(line);
    }
  }
  flush();

  return lesson;
}

/** Find a section by fuzzy heading match (Notion headings drift a little). */
const section = (lesson, h2Pattern, h3Pattern = null) => {
  for (const [key, value] of lesson.sections) {
    const [h2, h3] = key.split("/");
    if (!h2Pattern.test(h2)) continue;
    if (h3Pattern && (!h3 || !h3Pattern.test(h3))) continue;
    if (!h3Pattern && h3) continue; // exact h2-only section
    return value;
  }
  // Fallback: h3 under any h2
  if (h3Pattern) {
    for (const [key, value] of lesson.sections) {
      const [, h3] = key.split("/");
      if (h3 && h3Pattern.test(h3)) return value;
    }
  }
  return "";
};

/** The public-safe Week 1 preview for one track. Nothing facilitator-facing. */
function publicPreview(lesson) {
  return {
    week: lesson.week,
    title: lesson.title,
    blockTheme: lesson.blockTheme,
    weeklyTheme: lesson.weeklyTheme,
    sharedCoreConcept: lesson.sharedCoreConcept,
    trackTranslation: lesson.trackTranslation,
    territory: lesson.territory,
    openingQuestion: section(lesson, /^Opening$/, /^Opening Question$/),
    ancientWisdom: section(lesson, /^Slide 3/, /^Ancient Wisdom Quote$/),
    todaysWorld: section(lesson, /^Slide 3/, /^In Today.s World Quote$/),
    coreConcept: section(lesson, /^Core concept/),
    videoDescription: section(lesson, /^Slide 4/, /^Video Description/),
    reflectiveQuestions: section(lesson, /^Reflective Questions/),
    intentionPrompt: section(lesson, /^Slide 7/, /^Intention/),
    weeklyPractice: section(lesson, /^Weekly practice/),
    affirmation: section(lesson, /^Slide 8/, /^Affirmation/),
  };
}

/* ── Load all tracks ────────────────────────────────────────────────────── */

const loadTrack = (dir) => {
  const files = readdirSync(dir).filter(
    (f) => /^Week \d+/.test(f) && f.endsWith(".md"),
  );
  const lessons = files.map((f) =>
    parseLesson(readFileSync(join(dir, f), "utf8")),
  );
  lessons.sort((a, b) => a.week - b.week);
  return lessons;
};

const tracks = {
  adult: loadTrack(DIRS.adult),
  teen: loadTrack(DIRS.teen),
  child: loadTrack(DIRS.child),
};

for (const [name, lessons] of Object.entries(tracks)) {
  const weeks = lessons.map((l) => l.week);
  const missing = [];
  for (let w = 1; w <= 52; w++) if (!weeks.includes(w)) missing.push(w);
  console.log(
    `${name}: ${lessons.length} lessons (weeks ${weeks[0]}–${weeks[weeks.length - 1]})${
      missing.length ? ` — MISSING: ${missing.join(", ")}` : ""
    }`,
  );
}

/* ── Emit 1: titles migration ───────────────────────────────────────────── */

const sqlQuote = (s) => `'${(s || "").replace(/'/g, "''")}'`;

const L = [];
L.push("-- Notion lesson pull — per-track lesson titles + weekly themes.");
L.push("--");
L.push("-- Generated by scripts/pull-notion-lessons.mjs from the 52-Week");
L.push("-- Curriculum Notion exports (the founder's working source). Re-run the");
L.push("-- script after each Notion edit pass and commit the new migration.");
L.push("--");
L.push("-- Titles only: the full lesson bodies stay in mindcast_live_sessions /");
L.push("-- the per-week lesson pulls. The public curriculum page lists these");
L.push("-- per-track titles, so this is the fix for stale room titles.");
L.push("");

for (let w = 1; w <= 52; w++) {
  const a = tracks.adult.find((l) => l.week === w);
  const t = tracks.teen.find((l) => l.week === w);
  const c = tracks.child.find((l) => l.week === w);
  if (!a || !t || !c) {
    L.push(`-- week ${w}: skipped (missing export)`);
    continue;
  }
  const weeklyTheme = a.weeklyTheme || t.weeklyTheme || c.weeklyTheme || "";
  L.push(`UPDATE public.curriculum_weeks SET`);
  L.push(`  adult_video_title = ${sqlQuote(a.title)},`);
  L.push(`  teen_video_title  = ${sqlQuote(t.title)},`);
  L.push(`  kids_title        = ${sqlQuote(c.title)}${weeklyTheme ? "," : ""}`);
  if (weeklyTheme) {
    L.push(`  weekly_theme      = ${sqlQuote(weeklyTheme)}`);
  }
  L.push(`WHERE week_number = ${w};`);
  L.push("");
}

const ts = flag("--stamp") || "20260828120000";
const migrationPath = join(
  "supabase",
  "migrations",
  `${ts}_notion_lesson_titles.sql`,
);
writeFileSync(migrationPath, L.join("\n"), "utf8");
console.log(`wrote ${migrationPath}`);

/* ── Emit 2: public Week 1 preview module ───────────────────────────────── */

const tsQuote = (s) => JSON.stringify(s || "");

const previewFor = (name) => {
  const lesson = tracks[name].find((l) => l.week === 1);
  if (!lesson) throw new Error(`no week 1 in ${name} export`);
  const p = publicPreview(lesson);
  return `  ${name}: {
    title: ${tsQuote(p.title)},
    blockTheme: ${tsQuote(p.blockTheme)},
    weeklyTheme: ${tsQuote(p.weeklyTheme)},
    sharedCoreConcept: ${tsQuote(p.sharedCoreConcept)},
    trackTranslation: ${tsQuote(p.trackTranslation)},
    territory: ${tsQuote(p.territory)},
    openingQuestion: ${tsQuote(p.openingQuestion)},
    ancientWisdom: ${tsQuote(p.ancientWisdom)},
    todaysWorld: ${tsQuote(p.todaysWorld)},
    coreConcept: ${tsQuote(p.coreConcept)},
    videoDescription: ${tsQuote(p.videoDescription)},
    reflectiveQuestions: ${tsQuote(p.reflectiveQuestions)},
    intentionPrompt: ${tsQuote(p.intentionPrompt)},
    weeklyPractice: ${tsQuote(p.weeklyPractice)},
    affirmation: ${tsQuote(p.affirmation)},
  }`;
};

const P = [];
P.push("// GENERATED by scripts/pull-notion-lessons.mjs — do not edit by hand.");
P.push("// Source: the 52-Week Curriculum Notion boards (Week 1, each track).");
P.push("//");
P.push("// Public-safety filter: this file carries ONLY what a visitor may see —");
P.push("// the idea, the questions and the practice. Slide notes, facilitator");
P.push("// notes, safeguarding material, evidence/source trails and join codes are");
P.push("// never parsed into here. See src/lib/curriculumPublic.ts for the rule.");
P.push("");
P.push("export interface LessonOneTrackPreview {");
P.push("  title: string;");
P.push("  blockTheme: string;");
P.push("  weeklyTheme: string;");
P.push("  sharedCoreConcept: string;");
P.push("  trackTranslation: string;");
P.push("  territory: string;");
P.push("  openingQuestion: string;");
P.push("  ancientWisdom: string;");
P.push("  todaysWorld: string;");
P.push("  coreConcept: string;");
P.push("  videoDescription: string;");
P.push("  reflectiveQuestions: string;");
P.push("  intentionPrompt: string;");
P.push("  weeklyPractice: string;");
P.push("  affirmation: string;");
P.push("}");
P.push("");
P.push("export const LESSON_ONE_PREVIEW: Record<");
P.push('  "adult" | "teen" | "child",');
P.push("  LessonOneTrackPreview");
P.push("> = {");
P.push(previewFor("adult") + ",");
P.push(previewFor("teen") + ",");
P.push(previewFor("child") + ",");
P.push("};");
P.push("");

const previewPath = join("src", "lib", "lessonOnePreview.ts");
writeFileSync(previewPath, P.join("\n"), "utf8");
console.log(`wrote ${previewPath}`);
