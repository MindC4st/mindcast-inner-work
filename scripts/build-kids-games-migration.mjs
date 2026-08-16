// Generates a migration filling curriculum_weeks.kids_game from the kids games
// handbook (52 games, one per week). Usage:
//   node scripts/build-kids-games-migration.mjs <handbook.md>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = process.argv[2] || "C:/Users/grant/Downloads/files (16)/mindcast-kids-games-handbook.md";
const text = readFileSync(file, "utf8");

const esc = (s) => (s || "").replace(/'/g, "''");

// Split into week blocks on "### Week N — Title".
const blocks = text.split(/\n(?=### Week \d+\b)/);
const games = [];
for (const b of blocks) {
  const m = b.match(/^### Week (\d+)\s*[—–-]\s*(.+)$/m);
  if (!m) continue;
  const week = parseInt(m[1], 10);
  const title = m[2].trim();
  const how = b.match(/\*\*How to play\.\*\*\s*([\s\S]*?)(?=\n\*\*Why it fits)/);
  const howText = (how ? how[1] : "").replace(/\s+/g, " ").trim();
  games.push({ week, title, how: howText });
}

const sql = ["-- Kids games handbook -> curriculum_weeks.kids_game (52 weeks, one game each)."];
for (const g of games) {
  const kidsGame = `${g.title} — ${g.how}`;
  sql.push(`UPDATE public.curriculum_weeks SET kids_game = '${esc(kidsGame)}' WHERE week_number = ${g.week};`);
}

const out = path.join(root, "supabase", "migrations", "20260819260000_kids_games.sql");
writeFileSync(out, sql.join("\n") + "\n");
console.log(`wrote ${games.length} kids games to ${path.relative(root, out)}`);
if (games.length !== 52) console.warn(`expected 52, got ${games.length}`);
