// Generates the lesson-flow-v3 data migration from the three rebuilt CSVs
// (adult / teen / child), mapping columns by their S1-S11 prefix + name.
// Usage: node scripts/build-lesson-v3-migration.mjs <csv-dir>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = process.argv[2] || "C:/Users/grant/Downloads/files (15)";

// Minimal robust CSV parser (quoted fields may contain commas + newlines).
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ""; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const esc = (s) => (s == null ? "" : String(s)).replace(/'/g, "''");
const col = (header, key) => header.indexOf(key);

const files = [
  { audience: "Adult", file: "mindcast-adult-lessons-v3.csv" },
  { audience: "Teen", file: "mindcast-teen-lessons-v3.csv" },
  { audience: "Child", file: "mindcast-child-lessons-v3.csv" },
];

const sql = [];
sql.push("-- Lesson flow v3 data import (adult/teen/child, 52 weeks each).");
sql.push("-- Idempotent: ON CONFLICT DO UPDATE by (week_number) and (week_number, audience).");

for (const { audience, file } of files) {
  const p = path.join(dir, file);
  if (!existsSync(p)) { console.error("missing", p); process.exit(1); }
  const rows = parseCsv(readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
  const header = rows[0];

  const get = (r, key) => (col(header, key) >= 0 ? r[col(header, key)] : "");

  for (const r of rows.slice(1)) {
    const week = parseInt(get(r, "Week"), 10);
    if (!week) continue;

    const shared = {
      block_number: parseInt(get(r, "Phase"), 10) || 1,
      block_theme: get(r, "Phase Name"),
      weekly_theme: get(r, "Weekly Theme"),
      movement_theme: get(r, "Movement Theme"),
      the_territory: get(r, "The Territory"),
      opening_question: get(r, "Opening Question"),
      spiral_thread: get(r, "Spiral Thread"),
      spiral_depth: get(r, "Spiral Depth"),
      revisits_weeks: get(r, "Revisits Weeks"),
      week_type: get(r, "Week Type") || "Standard",
    };

    const heavy = get(r, "S11 Heavy Week Flag").trim().toUpperCase() === "YES";

    sql.push(`INSERT INTO public.curriculum_weeks (week_number, block_number, block_theme, weekly_theme, movement_theme, the_territory, opening_question, spiral_thread, spiral_depth, revisits_weeks, week_type) VALUES (${week}, ${shared.block_number}, '${esc(shared.block_theme)}', '${esc(shared.weekly_theme)}', '${esc(shared.movement_theme)}', '${esc(shared.the_territory)}', '${esc(shared.opening_question)}', '${esc(shared.spiral_thread)}', '${esc(shared.spiral_depth)}', '${esc(shared.revisits_weeks)}', '${esc(shared.week_type)}') ON CONFLICT (week_number) DO UPDATE SET block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme, weekly_theme = EXCLUDED.weekly_theme, movement_theme = EXCLUDED.movement_theme, the_territory = EXCLUDED.the_territory, opening_question = EXCLUDED.opening_question, spiral_thread = EXCLUDED.spiral_thread, spiral_depth = EXCLUDED.spiral_depth, revisits_weeks = EXCLUDED.revisits_weeks, week_type = EXCLUDED.week_type;`);

    const cols = {
      theme_title: get(r, "Weekly Theme"),
      session_title: get(r, "Session Title"),
      ancient_wisdom_reframe: get(r, "S3 Ancient Wisdom (full text)"),
      ancient_wisdom_vo_script: get(r, "S3 Ancient Wisdom VO Script (10s, <=28 words)"),
      ancient_wisdom_video_url: get(r, "S3 Video URL"),
      ancient_wisdom_captions_url: get(r, "S3 Captions URL"),
      signal_metaphor: get(r, "S4 In Today's World (full text)"),
      todays_world_vo_script: get(r, "S4 In Today's World VO Script (10s, <=28 words)"),
      todays_world_video_url: get(r, "S4 Video URL"),
      todays_world_captions_url: get(r, "S4 Captions URL"),
      todays_theme: get(r, "S5 Today's Theme (write from transcript)"),
      s5_source_opening_hook: get(r, "S5 Source: Opening Hook (legacy)"),
      s5_source_core_concept: get(r, "S5 Source: Core Concept (legacy)"),
      video_link: get(r, "S6 Video URL"),
      video_description: get(r, "S6 Video Title/Description"),
      video_transcript: get(r, "S6 Video Transcript"),
      video_question_1: get(r, "S6 Reflective Question 1"),
      video_question_2: get(r, "S6 Reflective Question 2"),
      private_write_prompt: get(r, "S7 Private Write Prompt (90 sec)"),
      experiential_exercise: get(r, "S7 Experiential Exercise"),
      journaling_prompt: get(r, "S8 Reflection Prompt"),
      intention_prompt: get(r, "S9 Intention Prompt"),
      weekly_practice_mon: get(r, "S9 Practice (Mon)"),
      weekly_practice_wed: get(r, "S9 Practice (Wed)"),
      weekly_practice_sun: get(r, "S9 Practice (Sun)"),
      closing_quote: get(r, "S10 Closing Quote"),
      closing_quote_attribution: get(r, "S10 Quote Attribution"),
      core_affirmation: get(r, "S10 Core Affirmation"),
      facilitator_prep_notes: get(r, "S11 Facilitator Prep Notes"),
      watch_for: get(r, "S11 Watch For"),
      first_time_note: get(r, "S11 First Time Note"),
      previous_week_callback: get(r, "S2 Voices Callback Intro"),
    };

    const setLines = Object.entries(cols).map(([k, v]) => `${k} = '${esc(v)}'`).join(", ");
    const keys = Object.keys(cols).join(", ");
    const vals = Object.values(cols).map((v) => `'${esc(v)}'`).join(", ");

    sql.push(`INSERT INTO public.mindcast_live_sessions (week_number, audience, heavy_week_flag, ${keys}) VALUES (${week}, '${audience}', ${heavy ? "true" : "false"}, ${vals}) ON CONFLICT (week_number, audience) DO UPDATE SET heavy_week_flag = EXCLUDED.heavy_week_flag, ${Object.entries(cols).map(([k]) => `${k} = EXCLUDED.${k}`).join(", ")};`);
  }
}

const out = path.join(root, "supabase", "migrations", "20260816150000_curriculum_content_v3.sql");
writeFileSync(out, sql.join("\n") + "\n");
console.log(`wrote ${path.relative(root, out)} (${sql.length} statements)`);
