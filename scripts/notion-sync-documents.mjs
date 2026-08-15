#!/usr/bin/env node
// notion-sync-documents.mjs — one-way sync: Notion document hub -> staff_documents.
//
//   node scripts/notion-sync-documents.mjs [--dry-run]
//
// Env (server-side only — never expose these to the client):
//   NOTION_API_KEY               Notion integration token
//   SUPABASE_URL                 project URL
//   SUPABASE_SERVICE_ROLE_KEY    service role key (writes bypass RLS)
//   NOTION_DOCS_DB               document hub database id (optional; defaults below)
//
// Behaviour, by design:
//   - ONE-WAY. This script never writes to Notion.
//   - IDEMPOTENT. Re-running with unchanged content changes nothing.
//   - VERSION-AWARE. A newer Notion version snapshots the old body into
//     staff_document_versions before updating; an OLDER or conflicting Notion
//     version flags the row (sync_flag='manual_review') and touches nothing —
//     a legally-reviewed built document is never overwritten by a draft.
//   - POLITE. Notion allows ~3 requests/second; every request is throttled
//     and every list is paginated.

import { createClient } from "@supabase/supabase-js";

const NOTION_KEY = process.env.NOTION_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DOCS_DB = process.env.NOTION_DOCS_DB || "29d0d85f-784c-802e-a23a-d7a0a1dc65d5";
const DRY_RUN = process.argv.includes("--dry-run");

if (!NOTION_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env: NOTION_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastCall = 0;
async function notion(path, init = {}) {
  // >= 350ms between calls keeps us under Notion's rate limit with margin.
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

async function queryAllPages(dbId) {
  const pages = [];
  let cursor;
  do {
    const body = { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    const j = await notion(`databases/${dbId}/query`, { method: "POST", body: JSON.stringify(body) });
    pages.push(...j.results);
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return pages;
}

async function allBlocks(blockId, depth = 0) {
  const out = [];
  let cursor;
  do {
    const j = await notion(
      `blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`,
    );
    for (const b of j.results) {
      out.push({ block: b, depth });
      if (b.has_children && depth < 5) out.push(...(await allBlocks(b.id, depth + 1)));
    }
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return out;
}

const richText = (b) => (b[b.type]?.rich_text ?? []).map((t) => t.plain_text).join("");

function toMarkdown(blocks) {
  const lines = [];
  for (const { block: b, depth } of blocks) {
    const t = richText(b);
    const pad = "  ".repeat(Math.max(0, depth - 1));
    switch (b.type) {
      case "heading_1": lines.push(`# ${t}`); break;
      case "heading_2": lines.push(`## ${t}`); break;
      case "heading_3": lines.push(`### ${t}`); break;
      case "bulleted_list_item": lines.push(`${pad}- ${t}`); break;
      case "numbered_list_item": lines.push(`${pad}1. ${t}`); break;
      case "to_do": lines.push(`${pad}- [${b.to_do?.checked ? "x" : " "}] ${t}`); break;
      case "quote": lines.push(`> ${t}`); break;
      case "callout": if (t) lines.push(`> **${t}**`); break;
      case "code": lines.push("```\n" + t + "\n```"); break;
      case "divider": lines.push("---"); break;
      case "table_row":
        lines.push(`| ${(b.table_row?.cells ?? []).map((c) => c.map((x) => x.plain_text).join("")).join(" | ")} |`);
        break;
      default: if (t) lines.push(t);
    }
  }
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

const prop = (page, name) => page.properties?.[name];
const propText = (page, name) => {
  const p = prop(page, name);
  if (!p) return "";
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name ?? "";
  if (p.type === "date") return p.date?.start ?? "";
  return "";
};

// "1.10" > "1.9" > "1.2" — numeric, segment-wise; non-numeric compares as text.
function compareVersions(a, b) {
  const as = String(a ?? "0").split(".").map((x) => parseInt(x, 10) || 0);
  const bs = String(b ?? "0").split(".").map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const d = (as[i] ?? 0) - (bs[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

async function main() {
  console.log(`Notion → staff_documents sync${DRY_RUN ? " (dry run)" : ""}`);
  const pages = await queryAllPages(DOCS_DB);
  console.log(`Found ${pages.length} documents in the hub.`);

  const summary = { created: 0, updated: 0, unchanged: 0, flagged: 0, skipped: 0 };

  for (const page of pages) {
    const title = propText(page, "Doc name") || propText(page, "Name");
    const codeMatch = (propText(page, "Document ID") || title).match(/MC-[A-Z]+-\d+/);
    if (!codeMatch) {
      console.warn(`  skip (no MC- code): ${title}`);
      summary.skipped++;
      continue;
    }
    const code = codeMatch[0];
    const version = propText(page, "Version") || "1.0";
    const category = propText(page, "Domain") || "General";
    const status = (propText(page, "Document Status") || "live").toLowerCase();
    const issued = propText(page, "Review Date") || null;
    const cleanTitle = title.replace(/^MC-[A-Z]+-\d+\s*[—-]\s*/, "").trim() || title;

    const { data: existing } = await supa
      .from("staff_documents")
      .select("id, version, source, body_md, sync_flag")
      .eq("code", code)
      .maybeSingle();

    const cmp = existing ? compareVersions(version, existing.version) : 1;

    if (existing && cmp < 0) {
      // Built/app copy is ahead of Notion: never overwrite; flag for a human.
      console.warn(`  FLAG ${code}: app has v${existing.version}, Notion has v${version}`);
      if (!DRY_RUN) {
        await supa.from("staff_documents").update({ sync_flag: "manual_review" }).eq("id", existing.id);
      }
      summary.flagged++;
      continue;
    }

    // Fetch content only when we might write it.
    const body = toMarkdown(await allBlocks(page.id));

    if (existing && cmp === 0) {
      if ((existing.body_md ?? "") === body) {
        summary.unchanged++;
        continue;
      }
      if (existing.source === "built") {
        // Same version number, different content, and ours went through
        // review: that is a conflict, not an update.
        console.warn(`  FLAG ${code}: v${version} content differs from the built document`);
        if (!DRY_RUN) {
          await supa.from("staff_documents").update({ sync_flag: "manual_review" }).eq("id", existing.id);
        }
        summary.flagged++;
        continue;
      }
    }

    if (DRY_RUN) {
      console.log(`  would ${existing ? "update" : "create"} ${code} v${version} (${category})`);
      existing ? summary.updated++ : summary.created++;
      continue;
    }

    if (existing) {
      if (cmp > 0 && existing.body_md) {
        await supa.from("staff_document_versions").upsert(
          { document_id: existing.id, version: existing.version, body_md: existing.body_md },
          { onConflict: "document_id,version" },
        );
      }
      await supa
        .from("staff_documents")
        .update({
          title: cleanTitle,
          version,
          category,
          status: status === "live" ? "live" : "draft",
          body_md: body,
          source: "notion",
          notion_page_id: page.id,
          issued_date: issued,
          synced_at: new Date().toISOString(),
          sync_flag: null,
        })
        .eq("id", existing.id);
      console.log(`  updated ${code} → v${version}`);
      summary.updated++;
    } else {
      await supa.from("staff_documents").insert({
        code,
        title: cleanTitle,
        version,
        category,
        status: status === "live" ? "live" : "draft",
        summary: "",
        body_md: body,
        source: "notion",
        notion_page_id: page.id,
        issued_date: issued,
        synced_at: new Date().toISOString(),
      });
      console.log(`  created ${code} v${version}`);
      summary.created++;
    }
  }

  console.log(
    `Done. created=${summary.created} updated=${summary.updated} unchanged=${summary.unchanged} flagged=${summary.flagged} skipped=${summary.skipped}`,
  );
  if (summary.flagged > 0) {
    console.log("Flagged documents need a human decision — see sync_flag='manual_review'.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
