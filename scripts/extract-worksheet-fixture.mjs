// Extracts the 52-week curriculum (per track) for the worksheet layout test.
// Source of truth: the timestamp-ordered migration chain (per AGENTS.md) —
// base content from curriculum_content_v2, signal metaphors + later overrides
// from the follow-up migrations. Offline + deterministic; no Supabase access.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const migDir = path.join(root, "supabase", "migrations");
const files = readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();

const read = (f) => readFileSync(path.join(migDir, f), "utf8");

// Split a VALUES (...) tuple into fields, honouring ''-escaped strings.
function splitFields(inner) {
  const out = [];
  let cur = "";
  let inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inStr) {
      if (c === "'") {
        if (inner[i + 1] === "'") { cur += "'"; i++; }
        else inStr = false;
      } else cur += c;
    } else if (c === "'") { inStr = true; }
    else if (c === ",") { out.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseInsertTuples(sql) {
  const tuples = [];
  const re = /INSERT INTO public\.curriculum_weeks\s*\([^)]*\)\s*VALUES\s*\(/g;
  let m;
  while ((m = re.exec(sql))) {
    // scan from after the opening paren, tracking depth and strings
    let i = m.index + m[0].length - 1; // index of the '('
    let depth = 0;
    let inStr = false;
    const start = i + 1;
    for (let j = i; j < sql.length; j++) {
      const c = sql[j];
      if (inStr) {
        if (c === "'") { if (sql[j + 1] === "'") j++; else inStr = false; }
      } else if (c === "'") inStr = true;
      else if (c === "(") depth++;
      else if (c === ")") { depth--; if (depth === 0) { tuples.push(splitFields(sql.slice(start, j))); break; } }
    }
  }
  return tuples;
}

function parseUpdates(sql, column) {
  const map = new Map();
  const re = new RegExp(`SET\\s+${column}\\s*=\\s*'((?:[^']|'')*)'[\\s\\S]*?week_number\\s*=\\s*(\\d+)`, "g");
  let m;
  while ((m = re.exec(sql))) {
    map.set(parseInt(m[2], 10), m[1].replace(/''/g, "'").trim());
  }
  return map;
}

const COLUMNS = [
  "week_number", "block_number", "block_theme", "weekly_theme", "core_learning",
  "youtube_url", "youtube_title", "youtube_runtime", "adult_source", "adult_video_title",
  "teen_source", "teen_video_title", "reflective_question", "interactive_activity",
  "kids_picture_book", "kids_picture_book_note", "kids_colouring_prompt", "inner_wisdom_alignment",
];

// Base content (52 weeks).
const base = parseInsertTuples(read("20260711160000_curriculum_content_v2.sql"))
  .filter((t) => t.length >= COLUMNS.length)
  .map((t) => {
    const o = {};
    COLUMNS.forEach((c, i) => { o[c] = t[i] ?? ""; });
    return o;
  });

// Signal metaphors + later overrides, applied in timestamp order (newest wins).
const signal = new Map();
const question = new Map();
const activity = new Map();
const workbookActivity = new Map();
const activityType = new Map();
const activityOptions = new Map();
for (const f of files) {
  const sql = read(f);
  for (const [w, v] of parseUpdates(sql, "signal_metaphor")) signal.set(w, v);
  for (const [w, v] of parseUpdates(sql, "teen_signal_metaphor")) signal.set(`teen-${w}`, v);
  for (const [w, v] of parseUpdates(sql, "kids_signal_metaphor")) signal.set(`kids-${w}`, v);
  for (const [w, v] of parseUpdates(sql, "reflective_question")) question.set(w, v);
  for (const [w, v] of parseUpdates(sql, "interactive_activity")) activity.set(w, v);
  for (const [w, v] of parseUpdates(sql, "workbook_activity")) workbookActivity.set(w, v);
  for (const [w, v] of parseUpdates(sql, "activity_type")) activityType.set(w, v);
  for (const [w, v] of parseUpdates(sql, "activity_options")) activityOptions.set(w, v);
}

const pick = (a, b) => (a && String(a).trim() ? String(a) : b || "");

const sessions = [];
for (const cur of base) {
  const week = parseInt(cur.week_number, 10);
  if (!week) continue;
  const tracks = [
    { audience: "Adult", title: cur.weekly_theme, signal: signal.get(week) ?? cur.core_learning },
    { audience: "Teen", title: cur.teen_video_title || cur.weekly_theme, signal: signal.get(`teen-${week}`) ?? signal.get(week) ?? cur.core_learning },
    { audience: "Child", title: cur.kids_picture_book || cur.weekly_theme, signal: signal.get(`kids-${week}`) ?? signal.get(week) ?? cur.core_learning },
  ];
  for (const t of tracks) {
    sessions.push({
      week_number: week,
      phase_name: cur.block_theme || "",
      theme_title: cur.weekly_theme || `Week ${week}`,
      session_title: pick(t.title, cur.weekly_theme),
      audience: t.audience,
      signal_metaphor: t.signal || "",
      video_question_1: "",
      video_question_2: "",
      journaling_prompt: question.get(week) ?? cur.reflective_question ?? "",
      experiential_exercise: activity.get(week) ?? cur.interactive_activity ?? "",
      workbook_activity: workbookActivity.get(week) ?? "",
      activity_type: activityType.get(week) ?? "reflection",
      activity_options: activityOptions.get(week) ?? "",
      weekly_practice_mon: "",
      weekly_practice_wed: "",
      weekly_practice_sun: "",
    });
  }
}

const out = path.join(root, "src", "test", "fixtures", "worksheet-curriculum.json");
writeFileSync(out, JSON.stringify(sessions, null, 2));
console.log(`wrote ${sessions.length} sessions to ${out}`);
