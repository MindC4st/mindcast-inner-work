#!/usr/bin/env node
// analyze-reviews.mjs — extract structured (week, track, field) changes from the
// review markdown docs and print a compact summary (not the full content).

import { readFileSync } from "node:fs";
import { join } from "node:path";

const DOWNLOADS = join("C:", "Users", "grant", "Downloads");
const FILES = [
  [1,     join(DOWNLOADS, "files (20)", "mindcast-week1-curriculum-review.md")],
  [2, 3,  join(DOWNLOADS, "files (20)", "mindcast-weeks-2-3-curriculum-review.md")],
  [4,5,6,7, join(DOWNLOADS, "files (21)", "mindcast-block2-weeks-4-7.md")],
  [8,9,10,11, join(DOWNLOADS, "mindcast-block3-weeks-8-11.md")],
  [12,13,14,15, join(DOWNLOADS, "mindcast-block4-weeks-12-15.md")],
  [16,17,18,19, join(DOWNLOADS, "mindcast-block5-weeks-16-19.md")],
  [20,21,22,23, join(DOWNLOADS, "mindcast-block6-weeks-20-23.md")],
  [24,25,26,27, join(DOWNLOADS, "mindcast-block7-weeks-24-27.md")],
  [28,29,30,31, join(DOWNLOADS, "mindcast-block8-weeks-28-31.md")],
];

// Known field labels (case-insensitive) -> normalized field key
const FIELD_ALIASES = [
  ["signal metaphor", "signal_metaphor"],
  ["teaching points", "teaching_points"],
  ["core concept", "core_concept"],
  ["opening hook", "opening_hook"],
  ["ancient wisdom reframe", "ancient_wisdom_reframe"],
  ["ancient wisdom", "ancient_wisdom_reframe"],
  ["experiential exercise", "experiential_exercise"],
  ["guided reflection", "guided_reflection"],
  ["journaling prompt", "journaling_prompt"],
  ["core affirmation", "core_affirmation"],
  ["facilitator note", "facilitator_notes"],
  ["intention", "intention_prompt"],
  ["weekly practice", "weekly_practice"],
  ["closing", "closing"],
  ["reframe", "ancient_wisdom_reframe"],
  ["todays world", "todays_world"],
  ["in today", "todays_world"],
  ["picture book", "picture_book"],
  ["game", "game"],
  ["colouring", "colouring"],
  ["video", "video"],
];

function normalizeField(label) {
  const l = label.toLowerCase();
  for (const [pat, key] of FIELD_ALIASES) {
    if (l.includes(pat)) return key;
  }
  return l.trim().replace(/\s+/g, "_");
}

function summarize(field) {
  // strip markdown, collapse whitespace, first 100 chars
  let s = field.replace(/[*_>`#]/g, "").replace(/\s+/g, " ").trim();
  if (s.length > 100) s = s.slice(0, 100) + "…";
  return s;
}

// Parse a section into { header, content } where header is like
// "2.1 ADULT — `Title`" or "WEEK 4 · Title" or "**ADULT — Teaching Points** — VERBATIM ..."
function run() {
  const out = [];
  for (const entry of FILES) {
    const weeks = entry.slice(0, -1);
    const file = entry[entry.length - 1];
    const content = readFileSync(file, "utf8");

    // Split into lines and walk; track current week + track context.
    // We detect:
    //   - "WEEK N · Title"          -> sets week context
    //   - "N.M TRACK — `Title`"     -> sets track + session title context
    //   - "**TRACK — Field** — ..."  -> field header
    //   - "**Field** (...)"          -> field header (week1/2-3 format)
    const lines = content.split("\n");
    let week = null;
    let track = null;
    let curField = null;
    let curBuf = [];
    const flush = () => {
      if (curField && curBuf.join("\n").trim()) {
        const text = curBuf.join("\n").trim();
        const was = /(?:^|\n)>?\s*\*?Was:?\*?\s*(.+?)(?:\n|$)/s.exec(text);
        const hasNow = /\*?Now:?\*?/.test(text);
        out.push({
          week, track,
          field: curField,
          isReplace: !!(was || hasNow),
          wasText: was ? summarize(was[1]) : null,
          newText: summarize(text),
          len: text.length,
        });
      }
      curField = null;
      curBuf = [];
    };

    for (const line of lines) {
      // week header
      const wm = /^#*\s*WEEK\s+(\d+)\s*[·•—-]/.exec(line) || /^\*\*WEEK\s+(\d+)/.exec(line);
      if (wm) {
        flush();
        week = parseInt(wm[1], 10);
        track = null;
        continue;
      }
      // track+title header like "2.1 ADULT — `Title`"
      const tm = /^\d+\.\d+\s+(ADULT|TEEN|CHILD)\s*[—-]\s*`?([^`\n]*)`?/.exec(line);
      if (tm) {
        flush();
        track = tm[1].toLowerCase() === "adult" ? "Adult" : tm[1].toLowerCase() === "teen" ? "Teen" : "Child";
        // session title may carry on
        continue;
      }
      // field header: "**ADULT — Field** — VERBATIM" or "**Field** (...)"
      const fm = /^\s*\*\*(ADULT|TEEN|CHILD)?\s*[—-]?\s*([A-Za-z][A-Za-z /'’-]*?)\*\*\s*(?:[—-]\s*([^(\n]*))?/.exec(line);
      if (fm && line.includes("**")) {
        const t = fm[1];
        const label = (fm[2] || "").trim();
        if (t) track = t === "Adult" ? "Adult" : t === "Teen" ? "Teen" : "Child";
        const key = normalizeField(label);
        if (["Adult", "Teen", "Child"].includes(label)) continue;
        flush();
        curField = key;
        continue;
      }
      if (curField) curBuf.push(line);
    }
    flush();
  }
  // Group and print summary
  const byField = {};
  for (const o of out) {
    const k = `${o.week}|${o.track}|${o.field}`;
    if (!byField[k]) byField[k] = o;
  }
  const rows = Object.values(byField).sort((a, b) => a.week - b.week || (a.track || "").localeCompare(b.track || "") || a.field.localeCompare(b.field));
  for (const r of rows) {
    const tag = r.isReplace ? "REPLACE" : "ADD";
    console.log(`W${r.week} ${r.track?.padEnd(5)} ${r.field.padEnd(24)} ${tag.padEnd(7)} len=${String(r.len).padEnd(5)} now="${r.newText}"`);
    if (r.wasText) console.log(`            was="${r.wasText}"`);
  }
  console.log(`\nTotal unique field-changes: ${rows.length}`);
}

run();
