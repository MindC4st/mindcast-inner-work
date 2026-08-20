#!/usr/bin/env node
// export-lessons-to-notion.mjs — build the 52-week curriculum (Adult, Teen,
// Child) as editable Notion pages.
//
//   node scripts/export-lessons-to-notion.mjs [--dry-run] [--force]
//                                               [--weeks=1,2,3] [--tracks=Adult,Child]
//
// Source of truth: the migration chain (see AGENTS.md). The remote DB is not
// consulted — content is reconstructed by replaying the content migrations in
// timestamp order, last write wins:
//
//   20260711160000_curriculum_content_v2.sql        base curriculum_weeks
//   20260724060000_curriculum_alignment_reflow.sql  alignment copy
//   20260724070000_signal_metaphor_modern.sql       adult metaphors
//   20260724080000_signal_metaphor_teen_child.sql   teen/child metaphors
//   20260814130000_week1_video_content_update.sql   week 1 per-track videos
//   20260814140000_week1_adult_emotional_labour.sql week 1 adult session
//   20260819220000_curriculum_content_v3.sql        lesson flow v3 (156 sessions)
//   20260819260000_kids_games.sql                   kids games
//   20260819280000_kids_content.sql                 picture books, NZ alts, games v2
//   20260819290000_kids_colouring_prompt_to_live.sql  (join update, replayed in JS)
//   20260819300000_signal_metaphor_per_audience_restore.sql (join update, replayed in JS)
//
// Env:
//   NOTION_API_KEY             Notion integration token
//   NOTION_LESSONS_PARENT      parent page id for the hub (default: MINDCAST — Home)
//
// Idempotent: existing lesson pages (matched by Week number inside each track
// database) are skipped unless --force is passed (archive + recreate).

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const MIG = (f) => join(ROOT, "supabase", "migrations", f);

const NOTION_KEY = process.env.NOTION_API_KEY;
const PARENT = process.env.NOTION_LESSONS_PARENT || "3bc0d85f-784c-8096-bea1-e686ed52614b"; // MINDCAST — Home
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const WEEKS = (process.argv.find((a) => a.startsWith("--weeks="))?.split("=")[1] ?? "")
  .split(",").map((s) => parseInt(s, 10)).filter(Boolean);
const TRACKS = (process.argv.find((a) => a.startsWith("--tracks="))?.split("=")[1] ?? "Adult,Teen,Child")
  .split(",").map((s) => s.trim()).filter(Boolean);

const OVERRIDES_PATH = process.argv.find((a) => a.startsWith("--overrides="))?.split("=")[1];
const OVERRIDES = OVERRIDES_PATH ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8")) : [];

// Review field -> session column. teaching_points / guided_reflection live on the
// original (non-destructive) columns and are rendered as their own sections.
const FIELD_TO_COL = {
  session_title: "session_title",
  signal_metaphor: "signal_metaphor",
  core_concept: "s5_source_core_concept",
  opening_hook: "s5_source_opening_hook",
  ancient_wisdom_reframe: "ancient_wisdom_reframe",
  experiential_exercise: "experiential_exercise",
  guided_reflection: "guided_reflection",
  journaling_prompt: "journaling_prompt",
  teaching_points: "teaching_points",
  core_affirmation: "core_affirmation",
  facilitator_notes: "facilitator_prep_notes",
  intention_prompt: "intention_prompt",
};

const CHAIN = [
  "20260526180000_seed_phase1_to_4_lesson_content.sql",
  "20260711160000_curriculum_content_v2.sql",
  "20260724060000_curriculum_alignment_reflow.sql",
  "20260724070000_signal_metaphor_modern.sql",
  "20260724080000_signal_metaphor_teen_child.sql",
  "20260814130000_week1_video_content_update.sql",
  "20260814140000_week1_adult_emotional_labour.sql",
  "20260819220000_curriculum_content_v3.sql",
  "20260819260000_kids_games.sql",
  "20260819280000_kids_content.sql",
];

// ---------------------------------------------------------------------------
// SQL replay
// ---------------------------------------------------------------------------

function splitStatements(sql) {
  const out = [];
  let buf = "";
  let inStr = false;
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (inStr) {
      if (ch === "'") {
        if (sql[i + 1] === "'") { buf += "''"; i += 2; continue; }
        inStr = false; buf += ch; i++; continue;
      }
      buf += ch; i++; continue;
    }
    if (ch === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    if (ch === "'") { inStr = true; buf += ch; i++; continue; }
    const dq = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i));
    if (dq) {
      const end = sql.indexOf(dq[0], i + dq[0].length);
      const stop = end === -1 ? sql.length : end + dq[0].length;
      buf += sql.slice(i, stop); i = stop; continue;
    }
    if (ch === ";") { if (buf.trim()) out.push(buf.trim()); buf = ""; i++; continue; }
    buf += ch; i++;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

class Reader {
  constructor(s) { this.s = s; this.i = 0; }
  ws() { while (this.i < this.s.length && /\s/.test(this.s[this.i])) this.i++; }
  peek() { return this.s[this.i]; }
  expect(str) {
    this.ws();
    if (this.s.slice(this.i, this.i + str.length).toLowerCase() !== str.toLowerCase()) {
      throw new Error(`expected '${str}' at ${this.i}: ...${this.s.slice(this.i, this.i + 40)}`);
    }
    this.i += str.length;
  }
  ident() {
    this.ws();
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.s.slice(this.i));
    if (!m) throw new Error(`expected identifier at ${this.i}: ...${this.s.slice(this.i, this.i + 40)}`);
    this.i += m[0].length;
    return m[0];
  }
  stringLit() {
    this.ws();
    if (this.peek() !== "'") throw new Error(`expected string at ${this.i}`);
    this.i++;
    let out = "";
    while (this.i < this.s.length) {
      const ch = this.s[this.i];
      if (ch === "'") {
        if (this.s[this.i + 1] === "'") { out += "'"; this.i += 2; continue; }
        this.i++;
        return out;
      }
      out += ch; this.i++;
    }
    throw new Error("unterminated string literal");
  }
  value() {
    this.ws();
    const ch = this.peek();
    if (ch === "'") return this.stringLit();
    const dq = /^\$[A-Za-z0-9_]*\$/.exec(this.s.slice(this.i));
    if (dq) {
      const start = this.i + dq[0].length;
      const end = this.s.indexOf(dq[0], start);
      if (end === -1) throw new Error("unterminated dollar-quoted string");
      const v = this.s.slice(start, end);
      this.i = end + dq[0].length;
      return v;
    }
    const m = /^(true|false|null)\b/i.exec(this.s.slice(this.i));
    if (m) { this.i += m[0].length; return m[1].toLowerCase() === "null" ? null : m[1].toLowerCase() === "true"; }
    const n = /^-?\d+(\.\d+)?/.exec(this.s.slice(this.i));
    if (n) { this.i += n[0].length; return Number(n[0]); }
    const fn = /^[A-Za-z_][A-Za-z0-9_]*\s*\(/.exec(this.s.slice(this.i));
    if (fn) {
      let depth = 0;
      while (this.i < this.s.length) {
        const ch = this.s[this.i];
        if (ch === "'") { this.i++; while (this.i < this.s.length && this.s[this.i] !== "'") this.i++; }
        else if (ch === "(") depth++;
        else if (ch === ")") { depth--; if (depth === 0) { this.i++; break; } }
        this.i++;
      }
      return undefined;
    }
    throw new Error(`unsupported value at ${this.i}: ...${this.s.slice(this.i, this.i + 40)}`);
  }
}

function parseInsert(stmt) {
  const r = new Reader(stmt);
  r.expect("INSERT INTO");
  r.ws();
  const table = r.ident() === "public" ? (r.expect("."), r.ident()) : (() => { throw new Error("expected public schema"); })();
  r.ws();
  if (r.peek() !== "(") throw new Error("expected column list");
  r.i++;
  const cols = [];
  for (;;) {
    cols.push(r.ident());
    r.ws();
    if (r.peek() === ",") { r.i++; continue; }
    r.expect(")");
    break;
  }
  r.expect("VALUES");
  const rows = [];
  for (;;) {
    r.ws();
    r.expect("(");
    const vals = [];
    for (;;) {
      vals.push(r.value());
      r.ws();
      if (r.peek() === ",") { r.i++; continue; }
      r.expect(")");
      break;
    }
    if (vals.length !== cols.length) throw new Error(`column/value count mismatch (${cols.length}/${vals.length})`);
    rows.push(Object.fromEntries(cols.map((c, ix) => [c, vals[ix]]).filter(([, v]) => v !== undefined)));
    r.ws();
    if (r.peek() === ",") { r.i++; continue; }
    break;
  }
  return { table, rows };
}

function parseUpdate(stmt) {
  const r = new Reader(stmt);
  r.expect("UPDATE");
  r.ws();
  const table = r.ident() === "public" ? (r.expect("."), r.ident()) : (() => { throw new Error("expected public schema"); })();
  r.expect("SET");
  const sets = {};
  for (;;) {
    const col = r.ident();
    r.ws();
    r.expect("=");
    const v = r.value();
    if (v !== undefined) sets[col] = v;
    r.ws();
    if (r.peek() === ",") { r.i++; continue; }
    break;
  }
  r.expect("WHERE");
  const where = {};
  for (;;) {
    const col = r.ident();
    r.ws();
    r.expect("=");
    where[col] = r.value();
    r.ws();
    const rest = r.s.slice(r.i).trimStart();
    if (/^and\s/i.test(rest)) { r.i = r.s.length - rest.length; r.expect("AND"); continue; }
    break;
  }
  return { table, sets, where };
}

const weeks = new Map();
const sessions = new Map();

function applyRow(table, row, key) {
  const target = table === "curriculum_weeks" ? weeks : sessions;
  const k = key;
  target.set(k, { ...(target.get(k) ?? {}), ...row });
}

let applied = { inserts: 0, updates: 0 };
for (const file of CHAIN) {
  const sql = readFileSync(MIG(file), "utf8");
  for (const stmt of splitStatements(sql)) {
    if (/^INSERT INTO/i.test(stmt)) {
      const { table, rows } = parseInsert(stmt);
      for (const row of rows) {
        const key = table === "curriculum_weeks" ? row.week_number : `${row.week_number}|${row.audience}`;
        applyRow(table, row, key);
        applied.inserts++;
      }
    } else if (/^UPDATE/i.test(stmt)) {
      if (/\bFROM\s+public\./i.test(stmt)) continue; // join update; replayed by hand at the end
      const { table, sets, where } = parseUpdate(stmt);
      const matches =
        table === "curriculum_weeks"
          ? [weeks.get(where.week_number)]
          : where.audience
            ? [sessions.get(`${where.week_number}|${where.audience}`)]
            : [...sessions.values()].filter((s) => s.week_number === where.week_number);
      for (const row of matches) {
        if (!row) continue;
        Object.assign(row, sets);
        applied.updates++;
      }
    }
  }
}

// 20260819290000: copy curated colouring prompt onto Child sessions.
for (const [k, s] of sessions) {
  if (s.audience !== "Child") continue;
  const w = weeks.get(s.week_number);
  if (w?.kids_colouring_prompt && !(s.coloring_prompt)) s.coloring_prompt = w.kids_colouring_prompt;
}
// 20260819300000: restore per-audience signal metaphor from curriculum_weeks.
for (const s of sessions.values()) {
  const w = weeks.get(s.week_number);
  if (!w) continue;
  const v =
    s.audience === "Teen" ? w.teen_signal_metaphor :
    s.audience === "Child" ? w.kids_signal_metaphor :
    w.signal_metaphor;
  if (v) s.signal_metaphor = v;
}

// Apply review overrides (find/replace `was`->`now`, or full replace when no `was`).
const normForMatch = (s) => String(s ?? "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, "-");

// Return {start,end} of `was` within `current`, using ellipsis-aware fuzzy match
// when `was` abbreviates the source with "…" / "...". Null when not found.
function locateWas(current, was) {
  const cN = normForMatch(current);
  const wN = normForMatch(was);
  const exact = cN.indexOf(wN);
  if (exact !== -1) return { start: exact, end: exact + wN.length };
  const parts = String(was).split(/…|\.\.\./).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const first = normForMatch(parts[0]);
    const last = normForMatch(parts[parts.length - 1]);
    const s = cN.indexOf(first);
    if (s !== -1) {
      const e = cN.indexOf(last, s + first.length);
      if (e !== -1) return { start: s, end: e + last.length };
    }
  }
  return null;
}

function applyOverride(o) {
  const s = sessions.get(`${o.week}|${o.track}`);
  if (!s) return `no session ${o.week}/${o.track}`;
  const col = FIELD_TO_COL[o.field];
  if (!col) return `unknown field ${o.field}`;
  if (o.field === "session_title" && s[col] === o.now) return "title-unchanged";
  const current = s[col] ?? "";
  if (o.was) {
    const loc = locateWas(current, o.was);
    if (loc) {
      let now = o.now;
      // Drop a duplicate numbered-list prefix ("1. ") if the matched text is
      // already preceded by that same prefix.
      const lead = /^(\d+\.)\s/.exec(now);
      if (lead) {
        const before = current.slice(Math.max(0, loc.start - lead[0].length), loc.start);
        if (before === lead[0]) now = now.slice(lead[0].length);
      }
      s[col] = current.slice(0, loc.start) + now + current.slice(loc.end);
      return "replaced";
    }
    // not found: fall back to full replace
    s[col] = o.now;
    return "was-not-found(full-set)";
  }
  s[col] = o.now;
  return "set";
}
const overrideReport = [];
for (const o of OVERRIDES) overrideReport.push({ ...o, result: applyOverride(o) });

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const problems = [];
if (weeks.size !== 52) problems.push(`expected 52 curriculum weeks, got ${weeks.size}`);
if (sessions.size !== 156) problems.push(`expected 156 sessions, got ${sessions.size}`);
for (let wk = 1; wk <= 52; wk++) {
  for (const aud of ["Adult", "Teen", "Child"]) {
    const s = sessions.get(`${wk}|${aud}`);
    if (!s) { problems.push(`missing session week ${wk} ${aud}`); continue; }
    if (!s.session_title) problems.push(`week ${wk} ${aud}: no session_title`);
    if (!s.s5_source_opening_hook) problems.push(`week ${wk} ${aud}: no opening hook`);
  }
}
console.log(`Parsed: ${weeks.size} weeks, ${sessions.size} sessions (${applied.inserts} inserts, ${applied.updates} updates replayed)`);
if (problems.length) {
  console.error(problems.slice(0, 20).join("\n"));
  process.exit(1);
}

const videoFor = (aud, s, w) =>
  s.video_link ||
  (aud === "Adult" ? (w.adult_source || w.youtube_url) :
   aud === "Teen" ? (w.teen_source || w.youtube_url) :
   (w.kids_source || w.youtube_url)) || "";

// ---------------------------------------------------------------------------
// Notion
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;
async function notion(path, init = {}) {
  const wait = lastCall + 350 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${NOTION_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 429) {
    const retry = Number(res.headers.get("retry-after") ?? "2");
    console.warn(`Rate limited; retrying in ${retry}s`);
    await sleep(retry * 1000);
    return notion(path, init);
  }
  if (!res.ok) throw new Error(`Notion ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

function rt(content, opts = {}) {
  const out = [];
  let rest = content;
  while (rest.length > 1900) {
    let cut = rest.lastIndexOf("\n", 1900);
    if (cut < 200) cut = 1900;
    out.push({ text: { content: rest.slice(0, cut) }, ...opts });
    rest = rest.slice(cut).replace(/^\n/, "");
  }
  if (rest) out.push({ text: { content: rest }, ...opts });
  return out;
}

const h2 = (t) => ({ object: "block", type: "heading_2", heading_2: { rich_text: rt(t) } });
const h3 = (t) => ({ object: "block", type: "heading_3", heading_3: { rich_text: rt(t) } });
const para = (t, opts = {}) => ({ object: "block", type: "paragraph", paragraph: { rich_text: rt(t, opts) } });
const bullet = (t) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(t) } });
const quote = (t) => ({ object: "block", type: "quote", quote: { rich_text: rt(t) } });
const divider = () => ({ object: "block", type: "divider", divider: {} });
const callout = (t, emoji) => ({ object: "block", type: "callout", callout: { icon: { type: "emoji", emoji }, rich_text: rt(t) } });
const linkPara = (label, url) => ({
  object: "block", type: "paragraph",
  paragraph: { rich_text: [{ text: { content: label + " ", link: null } }, { text: { content: url, link: { url } }, annotations: { color: "blue" } }] },
});

function sectionBlocks(title, items) {
  const filled = items.filter(([, v]) => v && String(v).trim());
  if (!filled.length) return [];
  const blocks = [h2(title)];
  for (const [label, v] of filled) {
    if (label) blocks.push(h3(label));
    if (/^https?:\/\//.test(String(v).trim())) blocks.push(linkPara(label ? "Link:" : "Video:", String(v).trim()));
    else blocks.push(para(String(v)));
  }
  return blocks;
}

function lessonBlocks(aud, s, w) {
  const blocks = [];
  blocks.push(callout(
    `Block ${w.block_number} — ${w.block_theme} · Weekly theme: ${w.weekly_theme} · Movement: ${w.movement_theme} · ${w.week_type}` +
    (w.spiral_thread ? ` · Spiral: ${w.spiral_thread} (${w.spiral_depth})` : ""), "🧭"));
  if (w.the_territory) blocks.push(quote(`THE TERRITORY: ${w.the_territory}`));

  if (aud === "Child") {
    blocks.push(...sectionBlocks("Picture book", [
      ["Book", [w.kids_picture_book, w.kids_picture_book_author].filter(Boolean).join(" — ")],
      ["Why this book", w.kids_picture_book_note],
      ["Ask the children", w.kids_picture_book_question],
      ["Aotearoa alternative", [w.kids_nz_alternative, w.kids_nz_alternative_author].filter(Boolean).join(" — ")],
      ["Alternative note", w.kids_nz_alternative_note],
    ]));
    blocks.push(...sectionBlocks("Video", [
      ["", videoFor(aud, s, w)],
      ["Description", s.video_description],
    ]));
    blocks.push(...sectionBlocks("Group game", [
      ["Game", w.kids_game],
      ["Equipment", w.kids_game_equipment],
      ["Under-5s", w.kids_game_under5],
    ]));
    blocks.push(...sectionBlocks("Colouring", [["Prompt", s.coloring_prompt || w.kids_colouring_prompt]]));
  }

  blocks.push(...sectionBlocks("Opening", [
    ["Hook", s.s5_source_opening_hook],
    ["Opening question", w.opening_question],
  ]));
  blocks.push(...sectionBlocks("Core concept", [["", s.s5_source_core_concept]]));
  blocks.push(...sectionBlocks("Teaching points", [["", s.teaching_points]]));
  blocks.push(...sectionBlocks("Ancient wisdom", [
    ["Reframe", s.ancient_wisdom_reframe],
    ["VO script", s.ancient_wisdom_vo_script],
    ["Video", s.ancient_wisdom_video_url],
  ]));
  blocks.push(...sectionBlocks("Signal metaphor", [["", s.signal_metaphor]]));
  blocks.push(...sectionBlocks("In today's world", [
    ["Theme", s.todays_theme],
    ["VO script", s.todays_world_vo_script],
    ["Video", s.todays_world_video_url],
  ]));
  if (aud !== "Child") {
    blocks.push(...sectionBlocks("Video", [
      ["", videoFor(aud, s, w)],
      ["Description", s.video_description],
      ["Question 1", s.video_question_1],
      ["Question 2", s.video_question_2],
    ]));
    if (s.video_transcript) blocks.push(...sectionBlocks("Video transcript", [["", s.video_transcript]]));
  }
  blocks.push(...sectionBlocks("In the room", [
    ["Private write", s.private_write_prompt],
    ["Experiential exercise", s.experiential_exercise],
    ["Guided reflection", s.guided_reflection],
    ["Journaling prompt", s.journaling_prompt],
    ["Intention", s.intention_prompt],
  ]));
  const practices = [s.weekly_practice_mon, s.weekly_practice_wed, s.weekly_practice_sun]
    .map((p, i) => p ? `${["MON", "WED", "SUN"][i]} — ${p}` : null).filter(Boolean);
  if (practices.length) {
    blocks.push(h2("Weekly practice"));
    blocks.push(...practices.map(bullet));
  }
  blocks.push(...sectionBlocks("Closing", [
    ["Quote", s.closing_quote ? `${s.closing_quote}${s.closing_quote_attribution ? ` — ${s.closing_quote_attribution}` : ""}` : ""],
    ["Affirmation", s.core_affirmation],
    ["Previous week callback", s.previous_week_callback],
  ]));
  blocks.push(divider());
  blocks.push(...sectionBlocks("Facilitator notes", [
    ["Prep", s.facilitator_prep_notes],
    ["Watch for", s.watch_for],
    ["First-time note", s.first_time_note],
  ]));
  return blocks;
}

const DB_PROPS = {
  title: { title: {} },
  Week: { number: {} },
  Phase: { select: { options: [1, 2, 3, 4].map((n) => ({ name: `Phase ${n}` })) } },
  "Phase name": { rich_text: {} },
  "Block theme": { rich_text: {} },
  "Week type": { select: { options: [] } },
  "Heavy week": { checkbox: {} },
};

async function findOrCreateHub() {
  let cursor;
  do {
    const j = await notion(`blocks/${PARENT}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`);
    const hit = j.results.find((b) => b.type === "child_page" && b.child_page?.title === "52-Week Curriculum — Lessons");
    if (hit) return hit.id;
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  const page = await notion("pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { page_id: PARENT },
      icon: { type: "emoji", emoji: "📚" },
      properties: { title: { title: rt("52-Week Curriculum — Lessons") } },
    }),
  });
  return page.id;
}

async function findOrCreateDb(hubId, title, emoji) {
  let cursor;
  do {
    const j = await notion(`blocks/${hubId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`);
    const hit = j.results.find((b) => b.type === "child_database" && b.child_database?.title === title);
    if (hit) return hit.id;
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  const db = await notion("databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: hubId },
      title: rt(title),
      icon: { type: "emoji", emoji },
      properties: { ...DB_PROPS },
    }),
  });
  return db.id;
}

async function existingPage(dbId, week) {
  const j = await notion(`databases/${dbId}/query`, {
    method: "POST",
    body: JSON.stringify({ filter: { property: "Week", number: { equals: week } }, page_size: 5 }),
  });
  return j.results[0] ?? null;
}

async function createLessonPage(dbId, aud, s, w) {
  const title = `Week ${s.week_number} — ${s.session_title}`;
  const blocks = lessonBlocks(aud, s, w);
  const first = blocks.slice(0, 100);
  const rest = blocks.slice(100);
  const page = await notion("pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        title: { title: rt(title) },
        Week: { number: s.week_number },
        Phase: { select: { name: `Phase ${s.phase}` } },
        "Phase name": { rich_text: rt(s.phase_name ?? "") },
        "Block theme": { rich_text: rt(w.block_theme ?? "") },
        "Week type": w.week_type ? { select: { name: w.week_type } } : undefined,
        "Heavy week": { checkbox: Boolean(s.heavy_week_flag) },
      },
      children: first,
    }),
  });
  for (let i = 0; i < rest.length; i += 100) {
    await notion(`blocks/${page.id}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: rest.slice(i, i + 100) }),
    });
  }
  return page.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const TRACK_META = { Adult: ["Adult track", "🧭"], Teen: ["Teen track", "🎧"], Child: ["Child track", "🧸"] };

const INSPECT = process.argv.find((a) => a.startsWith("--inspect="));
if (INSPECT) {
  const wk = parseInt(INSPECT.split("=")[1], 10);
  const dump = { week: weeks.get(wk) };
  for (const aud of ["Adult", "Teen", "Child"]) dump[aud] = sessions.get(`${wk}|${aud}`);
  console.log(JSON.stringify(dump, null, 1));
  process.exit(0);
}

if (process.argv.includes("--dump-weeks")) {
  const out = [];
  for (let wk = 1; wk <= 52; wk++) {
    const w = weeks.get(wk);
    out.push({
      week: wk,
      phase: sessions.get(`${wk}|Adult`)?.phase,
      phase_name: sessions.get(`${wk}|Adult`)?.phase_name,
      block: w?.block_number,
      block_theme: w?.block_theme,
      weekly_theme: w?.weekly_theme,
      movement_theme: w?.movement_theme,
      adult: sessions.get(`${wk}|Adult`)?.session_title,
      teen: sessions.get(`${wk}|Teen`)?.session_title,
      child: sessions.get(`${wk}|Child`)?.session_title,
    });
  }
  console.log(JSON.stringify(out));
  process.exit(0);
}

if (DRY_RUN) {
  if (OVERRIDES.length) {
    const byResult = {};
    for (const r of overrideReport) byResult[r.result] = (byResult[r.result] || 0) + 1;
    console.log("Override results:", JSON.stringify(byResult));
    for (const r of overrideReport.filter((r) => r.result !== "set" && r.result !== "replaced")) {
      console.log(`  !! W${r.week} ${r.track} ${r.field}: ${r.result}`);
    }
  }
  let nonEmpty = 0, total = 0;
  for (const aud of TRACKS) for (let wk = 1; wk <= 52; wk++) {
    if (WEEKS.length && !WEEKS.includes(wk)) continue;
    const s = sessions.get(`${wk}|${aud}`);
    const w = weeks.get(wk);
    const blocks = lessonBlocks(aud, s, w);
    total += blocks.length;
    nonEmpty++;
  }
  console.log(`DRY RUN: would create ${nonEmpty} pages (~${total} blocks) under parent ${PARENT}`);
  process.exit(0);
}

if (!NOTION_KEY) {
  console.error("Missing env: NOTION_API_KEY");
  process.exit(1);
}

const hubId = await findOrCreateHub();
console.log(`Hub page: ${hubId}`);
for (const aud of TRACKS) {
  const [dbTitle, emoji] = TRACK_META[aud];
  const dbId = await findOrCreateDb(hubId, dbTitle, emoji);
  console.log(`${dbTitle}: ${dbId}`);
  let created = 0, skipped = 0;
  for (let wk = 1; wk <= 52; wk++) {
    if (WEEKS.length && !WEEKS.includes(wk)) continue;
    const s = sessions.get(`${wk}|${aud}`);
    const w = weeks.get(wk);
    const existing = await existingPage(dbId, wk);
    if (existing && !FORCE) { skipped++; continue; }
    if (existing && FORCE) await notion(`pages/${existing.id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) });
    await createLessonPage(dbId, aud, s, w);
    created++;
    process.stdout.write(`\r${dbTitle}: week ${wk} (${created} created, ${skipped} skipped)   `);
  }
  console.log(`\n${dbTitle} done: ${created} created, ${skipped} skipped`);
}
console.log("Export complete.");
