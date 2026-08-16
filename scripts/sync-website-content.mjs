// Sync helper: reads the "Websites" wireframe board out of Notion and writes a
// diffable JSON (docs/website-content.json) keyed by page → section → blocks.
// The agent (or a build step) diffs this against src/components to apply edits.
//
// Usage: $env:NOTION_TOKEN=... ; node scripts/sync-website-content.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN = process.env.NOTION_TOKEN;
if (!TOKEN) { console.error("NOTION_TOKEN not set"); process.exit(1); }
const H = { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };

async function api(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

async function searchPage(title) {
  const s = await api("https://api.notion.com/v1/search", {
    method: "POST", headers: H,
    body: JSON.stringify({ query: title, filter: { value: "page", property: "object" }, page_size: 20 }),
  });
  return s.results.find((p) => {
    const t = Object.values(p.properties || {}).find((v) => v.type === "title")?.title?.map((x) => x.plain_text).join("") || "";
    return t === title;
  });
}

function pageTitle(p) {
  if (p.type === "child_page") return p.child_page?.title || "";
  return Object.values(p.properties || {}).find((v) => v.type === "title")?.title?.map((x) => x.plain_text).join("") || "";
}

async function children(id) {
  const out = [];
  let cursor;
  do {
    const r = await api(`https://api.notion.com/v1/blocks/${id}/children?page_size=100${cursor ? "&start_cursor=" + cursor : ""}`, { headers: H });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

function richText(rt) {
  return (rt || []).map((t) => t.plain_text).join("");
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
}

function toBlock(b) {
  switch (b.type) {
    case "heading_1": return { type: "h1", text: richText(b.heading_1.rich_text) };
    case "heading_2": return { type: "h2", text: richText(b.heading_2.rich_text) };
    case "heading_3": return { type: "h3", text: richText(b.heading_3.rich_text) };
    case "paragraph": return { type: "p", text: richText(b.paragraph.rich_text) };
    case "bulleted_list_item": return { type: "li", text: richText(b.bulleted_list_item.rich_text) };
    case "numbered_list_item": return { type: "li", text: richText(b.numbered_list_item.rich_text) };
    case "quote": return { type: "quote", text: richText(b.quote.rich_text) };
    case "to_do": return { type: "todo", text: richText(b.to_do.rich_text), done: b.to_do.checked };
    case "code": return { type: "code", text: richText(b.code.rich_text) };
    case "divider": return { type: "divider" };
    case "image": {
      const img = b.image;
      return { type: "image", caption: richText(img.caption), url: img.type === "external" ? img.external.url : (img.type === "file" ? img.file.url : "") };
    }
    case "callout": return { type: "callout", text: richText(b.callout.rich_text), emoji: b.callout.icon?.emoji || "" };
    default: return { type: "skip", raw: b.type };
  }
}

function toSections(blocks) {
  const sections = [];
  let cur = null;
  for (const b of blocks) {
    const blk = toBlock(b);
    if (blk.type === "h2" || (blk.type === "h1" && cur === null)) {
      cur = { slug: slug(blk.text), title: blk.text, blocks: [] };
      sections.push(cur);
    } else if (cur === null) {
      cur = { slug: "intro", title: "Intro", blocks: [] };
      sections.push(cur);
      if (blk.type !== "h1") cur.blocks.push(blk);
    } else if (blk.type !== "h1") {
      cur.blocks.push(blk);
    }
  }
  return sections;
}

const hub = await searchPage("🌐 Websites — wireframes");
if (!hub) { console.error("hub page not found"); process.exit(1); }
const hubKids = await children(hub.id);
const site = hubKids.find((p) => pageTitle(p) === "Mindcast — mindcast.co.nz");
if (!site) { console.error("Mindcast site page not found under hub"); process.exit(1); }

const pages = {};
for (const child of await children(site.id)) {
  const name = pageTitle(child).toLowerCase();
  const blocks = await children(child.id);
  pages[name] = { notionId: child.id, sections: toSections(blocks) };
}

const out = { generatedAt: new Date().toISOString(), site: "mindcast.co.nz", pages };

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, "docs", "website-content.json");
writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${path.relative(root, file)} (${Object.keys(pages).join(", ")})`);
