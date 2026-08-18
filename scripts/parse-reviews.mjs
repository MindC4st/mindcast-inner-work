#!/usr/bin/env node
// parse-reviews.mjs — extract structured curriculum changes from the review
// markdown docs into scripts/review-overrides.json.
//
// Entry shape: { week, track, field, was, now }
//   - was + now  -> find/replace `was` with `now` in the mapped column
//   - now only   -> replace the whole mapped column with `now`

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DOWNLOADS = join("C:", "Users", "grant", "Downloads");
const FILES = [
  [1,      join(DOWNLOADS, "files (20)", "mindcast-week1-curriculum-review.md")],
  [2, 3,   join(DOWNLOADS, "files (20)", "mindcast-weeks-2-3-curriculum-review.md")],
  [4, 5, 6, 7, join(DOWNLOADS, "files (21)", "mindcast-block2-weeks-4-7.md")],
  [8, 9, 10, 11, join(DOWNLOADS, "mindcast-block3-weeks-8-11.md")],
  [12, 13, 14, 15, join(DOWNLOADS, "mindcast-block4-weeks-12-15.md")],
  [16, 17, 18, 19, join(DOWNLOADS, "mindcast-block5-weeks-16-19.md")],
  [20, 21, 22, 23, join(DOWNLOADS, "mindcast-block6-weeks-20-23.md")],
  [24, 25, 26, 27, join(DOWNLOADS, "mindcast-block7-weeks-24-27.md")],
  [28, 29, 30, 31, join(DOWNLOADS, "mindcast-block8-weeks-28-31.md")],
];

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
];

const normTrack = (t) => (t === "ADULT" ? "Adult" : t === "TEEN" ? "Teen" : "Child");

function normField(label) {
  const l = label.toLowerCase().replace(/[’']/g, "'");
  for (const [pat, key] of FIELD_ALIASES) if (l.includes(pat)) return key;
  return null;
}

function cleanText(s) {
  return s
    .replace(/[*_`>#]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function stripQuotes(s) {
  let t = s.trim();
  while (t && (t[0] === '"' || t[0] === "'" || t[0] === "“" || t[0] === "‘") &&
         (t[t.length - 1] === '"' || t[t.length - 1] === "'" || t[t.length - 1] === "”" || t[t.length - 1] === "’")) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

// Extract was/now from accumulated content lines. Handles:
//   *Was:* "..."  / *Now:* "..."          (replace)
//   *Cut entirely:* "..." / *Replace with:* "..."  (replace)
//   plain content (full replace)
// Markers REQUIRE a colon so prose "Now"/"was" is never misread.
function extractWasNow(buf) {
  const text = buf.join("\n");
  const find = (re) => { const m = re.exec(text); return m ? { idx: m.index, end: m.index + m[0].length } : null; };

  const wasM = find(/(?:^|\n)\s*\*?(?:Was|Cut entirely):\*?\s*/i);
  const nowM = find(/(?:^|\n)\s*\*?(?:Now|Replace with):\*?\s*/i);
  const reasonM = find(/(?:^|\n)\s*\*?Reason:\*?\s*/i);

  let was = null, now = null;
  if (wasM) {
    const start = wasM.end;
    const end = nowM ? nowM.idx : reasonM ? reasonM.idx : text.length;
    was = text.slice(start, end).trim();
  }
  if (nowM) {
    const start = nowM.end;
    const end = reasonM && reasonM.idx > nowM.idx ? reasonM.idx : text.length;
    now = text.slice(start, end).trim();
  }
  if (!wasM && !nowM) now = text.trim();

  if (was) was = stripQuotes(cleanText(was));
  if (now) now = stripQuotes(cleanText(now));
  return { was, now };
}

const changes = [];
const warnings = [];
const push = (week, track, field, was, now) => {
  if (!week || !field) return;
  if (!track && field !== "facilitator_notes") return;
  if (was && !now) { warnings.push({ week, track, field, was }); return; }
  if (!was && !now) return;
  changes.push({ week, track, field, was, now });
};

for (const entry of FILES) {
  const fileWeeks = entry.slice(0, -1);
  const file = entry[entry.length - 1];
  const lines = readFileSync(file, "utf8").split("\n");

  let week = fileWeeks[0];
  let track = null;
  let field = null;
  let buf = [];

  const flush = () => {
    if (field && buf.length) {
      const { was, now } = extractWasNow(buf);
      if (was || now) push(week, track, field, was, now);
    }
    field = null;
    buf = [];
  };

  for (const line of lines) {
    const isHeading = /^#{1,4}\s/.test(line);
    const bare = line.replace(/^#{1,4}\s*/, ""); // strip markdown heading prefix

    // Week header (field sections): "### WEEK 8 · Emotions as Data" / "## Part 2 — WEEK 2 · Title"
    const wm = isHeading && /^(?:Part\s+\d+\s*[—-]\s*)?WEEK\s+(\d+)\s*[·•—-]\s*(.+)$/.exec(bare);
    if (wm) { flush(); week = parseInt(wm[1], 10); track = null; continue; }

    // Facilitator notes per week: "### Week 20 — Scarcity" / "### Week 12" (title-case "Week")
    const fn = isHeading && /^Week\s+(\d+)\b/.exec(bare);
    if (fn && !/^WEEK\s+\d/.test(bare)) {
      flush(); week = parseInt(fn[1], 10); track = null; field = "facilitator_notes"; buf = [];
      continue;
    }

    // Facilitator notes all-tracks: "3.4 Facilitator Notes — Week 3, all tracks"
    const fan = isHeading && /^\d+\.\d+\s*Facilitator Notes\s*[—-]\s*Week\s+(\d+)/i.exec(bare);
    if (fan) { flush(); week = parseInt(fan[1], 10); track = null; field = "facilitator_notes"; buf = []; continue; }

    // Track + session title: "2.1 ADULT — `Title`"
    const tm = isHeading && /^\d+\.\d+\s+(ADULT|TEEN|CHILD)\s*[—-]\s*`([^`]+)`/.exec(bare);
    if (tm) {
      flush();
      track = normTrack(tm[1]);
      const title = tm[2].trim();
      if (title && !/facilitator notes/i.test(title)) push(week, track, "session_title", null, title);
      continue;
    }

    // Track-specific facilitator notes: "3.1 ADULT — Facilitator Notes (Week 1)"
    const tfn = isHeading && /^\d+\.\d+\s+(ADULT|TEEN|CHILD)\s*[—-]\s*Facilitator Notes/i.exec(bare);
    if (tfn) { flush(); track = normTrack(tfn[1]); field = "facilitator_notes"; buf = []; continue; }

    // "### 4.1 ADULT — Experiential Exercise ..." (block 5 H3 field header)
    const hf = isHeading && /^\d+\.\d+\s+(ADULT|TEEN|CHILD)\s*[—-]\s*([^*#\n]+)$/.exec(bare);
    if (hf) {
      const key = normField(hf[2]);
      if (key) { flush(); track = normTrack(hf[1]); field = key; buf = []; continue; }
    }

    // "**WK 16 CHILD — Signal Metaphor** — STRUCTURED" (block 5, also signal rewrites)
    const wk = /^\*\*WK\s+(\d+)\s+(ADULT|TEEN|CHILD)\s*[—-]\s*([^*\n]+)\*\*/.exec(bare);
    if (wk) {
      const key = normField(wk[3]);
      flush();
      week = parseInt(wk[1], 10); track = normTrack(wk[2]);
      if (key) { field = key; buf = []; }
      continue;
    }

    // "**ADULT — Field Label** — VERBATIM" (block 2/3/4 field header)
    const bf = /^\*\*(ADULT|TEEN|CHILD)\s*[—-]\s*([^*\n]+)\*\*/.exec(bare);
    if (bf) {
      const key = normField(bf[2]);
      if (key) { flush(); track = normTrack(bf[1]); field = key; buf = []; continue; }
    }

    // "**Field Label**" (week1/2-3 field header, current track)
    const sf = /^\*\*([A-Za-z][^*\n]*?)\*\*/.exec(bare);
    if (sf) {
      const key = normField(sf[1]);
      if (key) { flush(); field = key; buf = []; continue; }
      if (field) buf.push(line);
      continue;
    }

    // accumulate
    if (field) {
      let l = line.replace(/^\s*>\s?/, "");
      buf.push(l);
    }
  }
  flush();
}

// Expand all-tracks facilitator notes into three entries.
const expanded = [];
for (const c of changes) {
  if (c.field === "facilitator_notes" && !c.track) {
    for (const t of ["Adult", "Teen", "Child"]) expanded.push({ ...c, track: t });
  } else {
    expanded.push(c);
  }
}

// Dedupe by (week, track, field) keeping the last occurrence.
const final = [];
const seen = new Set();
for (const c of [...expanded].reverse()) {
  const k = `${c.week}|${c.track}|${c.field}`;
  if (seen.has(k)) continue;
  seen.add(k);
  final.push(c);
}
final.reverse();

writeFileSync(join(process.cwd(), "scripts", "review-overrides.json"), JSON.stringify(final, null, 2));
console.error(`Wrote ${final.length} overrides. Warnings (removal-only): ${warnings.length}`);
for (const w of warnings) console.error(`  W${w.week} ${w.track} ${w.field}: "${(w.was || "").slice(0, 70)}"`);
console.log(JSON.stringify(final));
