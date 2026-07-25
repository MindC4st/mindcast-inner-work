// Strip the Coloring Page Prompt column (idx 18) from child CSV for Airtable import
import { readFileSync, writeFileSync } from "fs";

const content = readFileSync(
  "C:\\Users\\grant\\.openclaw\\workspace\\airtable-import\\mindcast-child-lessons.csv",
  "utf8"
);
const lines = content.split("\n").filter((l) => l.trim());

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function writeRow(cells) {
  return cells
    .map((c) => {
      if (c.includes(",") || c.includes('"') || c.includes("\n")) {
        return '"' + c.replace(/"/g, '""') + '"';
      }
      return c;
    })
    .join(",");
}

const rows = lines.map((l) => parseCSVLine(l));

// Verify column counts
const bad = rows.filter((r, i) => r.length !== 23);
if (bad.length > 0) {
  console.error("❌ Rows with wrong column count:", bad.length);
  bad.forEach((r) => console.error("  Row", rows.indexOf(r) + 1, ":", r.length, "cols"));
  process.exit(1);
}
console.log("✅ All", rows.length, "rows have 23 columns");

// Drop Coloring Page Prompt (index 18)
const stripped = rows.map((r) => [...r.slice(0, 18), ...r.slice(19)]);

console.log("Header cols:", stripped[0].length);
console.log("Data row 1 cols:", stripped[1].length);

const output = "\uFEFF" + stripped.map((r) => writeRow(r)).join("\n");

const path =
  "C:\\Users\\grant\\.openclaw\\workspace\\airtable-import\\mindcast-child-lessons-no-coloring.csv";
writeFileSync(path, output, "utf8");
console.log("✅ Written:", path);
console.log("   Size:", (stripped.length - 1) + " data rows, 22 columns");
