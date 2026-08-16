// Generates a migration filling the child-specific curriculum columns from the
// child lessons v3 CSV (picture books, NZ alternatives, games, colouring).
// Usage: node scripts/build-kids-content-migration.mjs <child-v3.csv>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = process.argv[2] || "C:/Users/grant/Downloads/files (19)/mindcast-child-lessons-v3.csv";
const text = readFileSync(file, "utf8").replace(/^\uFEFF/, "");

const esc = (s) => (s == null ? "" : String(s)).replace(/'/g, "''");
const bool = (s) => /^(yes|true|y)$/i.test(String(s || "").trim());

function parseCsv(t) {
  const rows = []; let row = [], field = "", inQ = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) { if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ""; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === '\r') { }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCsv(text);
const header = rows[0];
const col = (k) => header.indexOf(k);
const get = (r, k) => (col(k) >= 0 ? r[col(k)] : "");

const sql = ["-- Child lesson v3 content: picture books, NZ alternatives, games, colouring."];
for (const r of rows.slice(1)) {
  const week = parseInt(get(r, "Week"), 10);
  if (!week) continue;
  sql.push(
    `UPDATE public.curriculum_weeks SET ` +
    `kids_picture_book = '${esc(get(r, "Picture Book"))}', ` +
    `kids_picture_book_author = '${esc(get(r, "Picture Book Author"))}', ` +
    `kids_picture_book_question = '${esc(get(r, "Picture Book Question"))}', ` +
    `kids_picture_book_note = '${esc(get(r, "Picture Book Note"))}', ` +
    `kids_nz_alternative = '${esc(get(r, "NZ Alternative (Aotearoa)"))}', ` +
    `kids_nz_alternative_author = '${esc(get(r, "NZ Alternative Author"))}', ` +
    `kids_nz_alternative_note = '${esc(get(r, "NZ Alternative Note"))}', ` +
    `kids_nz_alternative_verified = ${bool(get(r, "NZ Alternative Verified"))}, ` +
    `kids_read_aloud_source_check = '${esc(get(r, "Read-Aloud Source Check"))}', ` +
    `kids_source = '${esc(get(r, "Kids Video Source"))}', ` +
    `kids_game = '${esc(get(r, "Kids Game"))}', ` +
    `kids_game_equipment = '${esc(get(r, "Kids Game Equipment"))}', ` +
    `kids_game_under5 = '${esc(get(r, "Kids Game Under-5 Adaptation"))}', ` +
    `kids_colouring_prompt = '${esc(get(r, "Colouring Prompt"))}' ` +
    `WHERE week_number = ${week};`
  );
}

const out = path.join(root, "supabase", "migrations", "20260819280000_kids_content.sql");
writeFileSync(out, sql.join("\n") + "\n");
console.log(`wrote ${sql.length - 1} week updates to ${path.relative(root, out)}`);
