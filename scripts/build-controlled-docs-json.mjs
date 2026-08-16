// Bundles the controlled documents (docs/controlled/*.md) into a JSON the
// staff-training UI can import, so module lessons can link to the referenced
// documents as in-app "read" links without a network call.
// Usage: node scripts/build-controlled-docs-json.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "docs", "controlled");
const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();

const docs = [];
for (const f of files) {
  const text = readFileSync(path.join(dir, f), "utf8");
  const codeMatch = text.match(/^#\s*(MC-[A-Z]{2,3}-\d{3,4})\b/m);
  const code = codeMatch ? codeMatch[1] : f.split("_")[0];
  // Title: the heading line, minus the code prefix.
  const titleMatch = text.match(/^#\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/^MC-[A-Z]{2,3}-\d{3,4}\s*[—\-–]\s*/, "").trim() : code;
  // Body: everything after the leading "# " line and the "> Source:" line.
  const lines = text.split("\n");
  const bodyStart = lines.findIndex((l, i) => i > 0 && !/^#\s/.test(l) && !/^> Source:/.test(l) && !/^> Regenerate/.test(l) && l.trim() !== "");
  const body = lines.slice(Math.max(0, bodyStart)).join("\n").replace(/^>\s?Source:[^\n]*\n/gm, "").replace(/^>\s?Regenerate[^\n]*\n/gm, "").trim();
  docs.push({ code, title, body });
}

const out = path.join(root, "src", "data", "controlledDocs.json");
writeFileSync(out, JSON.stringify(docs, null, 2) + "\n");
console.log(`wrote ${docs.length} documents to ${path.relative(root, out)}`);
