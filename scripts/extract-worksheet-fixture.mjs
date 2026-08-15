// Extracts the live 52-week curriculum (per track) into a test fixture so the
// worksheet template can be asserted against every real week x track combo.
// Source of truth: curriculum_public RPC + mindcast_live_sessions_public view
// (same merge order as the app). Run: node scripts/extract-worksheet-fixture.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env = Object.fromEntries(
  readFileSync(path.join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/"/g, "")]; }),
);
const URL0 = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const get = async (url) => {
  const r = await fetch(`${URL0}/rest/v1/${url}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${await r.text()}`);
  return r.json();
};

const pick = (a, b) => (a && String(a).trim() ? String(a) : b || "");

const rpcWeek = async (week) => {
  const r = await fetch(`${URL0}/rest/v1/rpc/curriculum_public`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_week: week }),
  });
  if (!r.ok) throw new Error(`curriculum_public ${week} -> ${r.status}`);
  const rows = await r.json();
  return Array.isArray(rows) ? rows[0] : null;
};

const sessions = [];
for (let week = 1; week <= 52; week++) {
  const cur = await rpcWeek(week);
  if (!cur) { console.warn(`week ${week}: no curriculum row — skipped`); continue; }

  const tracks = [
    { audience: "Adult", theme: cur.weekly_theme, title: cur.weekly_theme, signal: cur.signal_metaphor, prompt: cur.reflective_question, activity: cur.interactive_activity },
    { audience: "Teen", theme: cur.weekly_theme, title: cur.teen_title, signal: cur.teen_signal_metaphor || cur.signal_metaphor, prompt: cur.reflective_question, activity: cur.interactive_activity },
    { audience: "Child", theme: cur.weekly_theme, title: cur.kids_title, signal: cur.kids_signal_metaphor || cur.signal_metaphor, prompt: cur.reflective_question, activity: cur.interactive_activity },
  ];
  for (const t of tracks) {
    sessions.push({
      week_number: week,
      phase_name: cur.block_theme || "",
      theme_title: t.theme || `Week ${week}`,
      session_title: t.title || "",
      audience: t.audience,
      signal_metaphor: t.signal || "",
      video_question_1: "",
      video_question_2: "",
      journaling_prompt: t.prompt || "",
      experiential_exercise: t.activity || "",
      weekly_practice_mon: "",
      weekly_practice_wed: "",
      weekly_practice_sun: "",
    });
  }
}

const out = path.join(root, "src/test/fixtures/worksheet-curriculum.json");
writeFileSync(out, JSON.stringify(sessions, null, 2));
console.log(`wrote ${sessions.length} sessions to ${out}`);
