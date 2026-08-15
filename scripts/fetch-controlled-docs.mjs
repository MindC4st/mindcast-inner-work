// Fetch the Mindcast controlled documents from the Notion Document Hub and
// write them into docs/controlled/ as Markdown. Idempotent — re-run after any
// controlled-document edit to refresh the in-repo copies.
//
// Usage:
//   $env:NOTION_TOKEN="ntn_..." ; node scripts/fetch-controlled-docs.mjs
//
// The token is read from the environment only and is never committed.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN = process.env.NOTION_TOKEN;
if (!TOKEN) { console.error("NOTION_TOKEN is not set"); process.exit(1); }

const HUB_DB = "29d0d85f-784c-802e-a23a-d7a0a1dc65d5";
const H = { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };

// The 25 controlled documents named as authorities in the build TODO. Only
// these are exported; Legacy (MC-*-90x) and non-listed docs are skipped.
const TARGETS = [
  "MC-GOV-001", "MC-BRD-001", "MC-TRN-001", "MC-SAF-001", "MC-SAF-002",
  "MC-MEM-001", "MC-MEM-002", "MC-MEM-003", "MC-MEM-006", "MC-MEM-106", "MC-MEM-107",
  "MC-SEC-001", "MC-SEC-003", "MC-SEC-101", "MC-SEC-102", "MC-SEC-103",
  "MC-SEC-104", "MC-SEC-108", "MC-SEC-109", "MC-SEC-110", "MC-SEC-112",
  "MC-FIN-103", "MC-FIN-104", "MC-FIN-105", "MC-GOV-101",
];

async function api(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${await r.text()}`);
  return r.json();
}

function richText(rt) {
  if (!rt) return "";
  return rt.map((t) => {
    let s = t.plain_text;
    if (t.annotations?.bold) s = `**${s}**`;
    if (t.annotations?.italic) s = `_${s}_`;
    if (t.annotations?.code) s = `\`${s}\``;
    if (t.href) s = `[${s}](${t.href})`;
    return s;
  }).join("");
}

async function renderBlock(block, out) {
  const t = block.type;
  const b = block[t];
  switch (t) {
    case "paragraph": out.push(richText(b.rich_text)); break;
    case "heading_1": out.push(`# ${richText(b.rich_text)}`); break;
    case "heading_2": out.push(`## ${richText(b.rich_text)}`); break;
    case "heading_3": out.push(`### ${richText(b.rich_text)}`); break;
    case "bulleted_list_item": out.push(`- ${richText(b.rich_text)}`); break;
    case "numbered_list_item": out.push(`1. ${richText(b.rich_text)}`); break;
    case "to_do": out.push(`- [${b.checked ? "x" : " "}] ${richText(b.rich_text)}`); break;
    case "quote": out.push(`> ${richText(b.rich_text)}`); break;
    case "code": out.push("```\n" + richText(b.rich_text) + "\n```"); break;
    case "divider": out.push("---"); break;
    case "callout": out.push(`> ${b.icon?.emoji ? b.icon.emoji + " " : ""}${richText(b.rich_text)}`); break;
    case "toggle": out.push(`<details><summary>${richText(b.rich_text)}</summary>`); await renderChildren(block, out); out.push("</details>"); break;
    case "table": out.push("[table]"); break;
    default: break; // child_page, child_database, image, column* handled via children
  }
  if (block.has_children && !["toggle", "table", "column_list"].includes(t)) {
    await renderChildren(block, out);
  }
  if (t === "column_list") await renderChildren(block, out);
}

async function renderChildren(block, out) {
  let cursor;
  do {
    const res = await api(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100${cursor ? "&start_cursor=" + cursor : ""}`, { headers: H });
    for (const c of res.results) await renderBlock(c, out);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
}

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "docs", "controlled");
mkdirSync(outDir, { recursive: true });

const pages = [];
let cursor;
do {
  const res = await api(`https://api.notion.com/v1/databases/${HUB_DB}/query`, {
    method: "POST", headers: H,
    body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
  });
  pages.push(...res.results);
  cursor = res.has_more ? res.next_cursor : null;
} while (cursor);

let exported = 0;
const missing = [];
for (const code of TARGETS) {
  const page = pages.find((p) => {
    const t = Object.values(p.properties).find((v) => v.type === "title")?.title?.map((x) => x.plain_text).join("") || "";
    return t.startsWith(code + " ");
  });
  if (!page) { missing.push(code); continue; }
  const title = Object.values(page.properties).find((v) => v.type === "title")?.title?.map((x) => x.plain_text).join("");
  const category = Object.values(page.properties).find((v) => v.type === "select")?.select?.name || "";
  const status = Object.values(page.properties).find((v) => v.type === "status")?.status?.name || "";
  const out = [];
  out.push(`# ${title}`);
  out.push("");
  out.push(`> Source: Notion Document Hub (controlled copy). Category: ${category || "—"}. Status: ${status || "—"}.`);
  out.push("> Regenerate with `node scripts/fetch-controlled-docs.mjs`.");
  out.push("");
  await renderChildren(page, out);
  const slug = title.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const file = path.join(outDir, `${code}_${slug}.md`);
  writeFileSync(file, out.join("\n").replace(/\n{3,}/g, "\n\n") + "\n");
  console.log(`exported ${code} -> ${path.relative(root, file)}`);
  exported++;
}

if (missing.length) console.warn("MISSING:", missing.join(", "));
console.log(`done: ${exported}/${TARGETS.length} exported`);
