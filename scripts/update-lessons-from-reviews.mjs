#!/usr/bin/env node
// update-lessons-from-reviews.mjs — apply curriculum review updates to Notion pages
// for weeks 1-34 across Adult, Teen, Child tracks.
//
//   node scripts/update-lessons-from-reviews.mjs [--dry-run] [--force]
//
// Reads the review markdown files from Downloads, extracts rewritten fields,
// and updates the corresponding Notion lesson pages.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const DOWNLOADS = join("C:", "Users", "grant", "Downloads");
const REVIEW_FILES = [
  join(DOWNLOADS, "files (20)", "mindcast-week1-curriculum-review.md"),
  join(DOWNLOADS, "files (20)", "mindcast-weeks-2-3-curriculum-review.md"),
  join(DOWNLOADS, "files (21)", "mindcast-block2-weeks-4-7.md"),
  join(DOWNLOADS, "mindcast-block3-weeks-8-11.md"),
  join(DOWNLOADS, "mindcast-block4-weeks-12-15.md"),
  join(DOWNLOADS, "mindcast-block5-weeks-16-19.md"),
  join(DOWNLOADS, "mindcast-block6-weeks-20-23.md"),
  join(DOWNLOADS, "mindcast-block7-weeks-24-27.md"),
  join(DOWNLOADS, "mindcast-block8-weeks-28-31.md"),
];

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const NOTION_KEY = process.env.NOTION_API_KEY;
const HUB_ID = "3c00d85f-784c-818a-9b2b-d9c21a0504ce"; // 52-Week Curriculum — Lessons
const DB_IDS = {
  Adult: "3c00d85f-784c-8198-bf71-f1e07bb3721a",
  Teen:  "3c00d85f-784c-8194-aa6c-d8a89bcf6802",
  Child: "3c00d85f-784c-8142-9211-d73956219c93",
};

if (!NOTION_KEY) {
  console.error("Missing NOTION_API_KEY in environment");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Notion API
// ---------------------------------------------------------------------------
let lastCall = 0;
async function notion(path, init = {}) {
  const wait = lastCall + 350 - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
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
    await new Promise(r => setTimeout(r, retry * 1000));
    return notion(path, init);
  }
  if (!res.ok) throw new Error(`Notion ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

function rt(content) {
  const out = [];
  let rest = String(content ?? "");
  while (rest.length > 1900) {
    let cut = rest.lastIndexOf("\n", 1900);
    if (cut < 200) cut = 1900;
    out.push({ text: { content: rest.slice(0, cut) } });
    rest = rest.slice(cut).replace(/^\n/, "");
  }
  if (rest) out.push({ text: { content: rest } });
  return out;
}

const h2 = (t) => ({ object: "block", type: "heading_2", heading_2: { rich_text: rt(t) } });
const h3 = (t) => ({ object: "block", type: "heading_3", heading_3: { rich_text: rt(t) } });
const para = (t) => ({ object: "block", type: "paragraph", paragraph: { rich_text: rt(t) } });
const bullet = (t) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(t) } });
const quote = (t) => ({ object: "block", type: "quote", quote: { rich_text: rt(t) } });
const divider = () => ({ object: "block", type: "divider", divider: {} });

async function findPage(dbId, week) {
  const j = await notion(`databases/${dbId}/query`, {
    method: "POST",
    body: JSON.stringify({ filter: { property: "Week", number: { equals: week } }, page_size: 1 }),
  });
  return j.results[0] ?? null;
}

async function getPageBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const j = await notion(`blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`);
    blocks.push(...j.results);
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return blocks;
}

async function replaceBlocks(pageId, newBlocks) {
  // Archive all existing blocks first
  const existing = await getPageBlocks(pageId);
  for (const b of existing) {
    if (!b.archived) {
      await notion(`blocks/${b.id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) });
    }
  }
  // Append new blocks in chunks of 100
  for (let i = 0; i < newBlocks.length; i += 100) {
    await notion(`blocks/${pageId}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: newBlocks.slice(i, i + 100) }),
    });
  }
}

// ---------------------------------------------------------------------------
// Parse review documents
// ---------------------------------------------------------------------------

function extractSection(content, startMarker, endMarker) {
  const start = content.indexOf(startMarker);
  if (start === -1) return null;
  const end = endMarker ? content.indexOf(endMarker, start) : content.length;
  return content.slice(start, end === -1 ? content.length : end).trim();
}

function parseTrackContent(section, track) {
  // Find the subsection for this track: e.g., "2.1 ADULT — `What Are You Actually Receiving?`"
  const trackHeader = new RegExp(`${track}\\s*[—-]\\s*\`([^\`]+)\``, 'i');
  const match = section.match(trackHeader);
  if (!match) return null;
  const title = match[1];
  // Extract content after the header until next track header or section end
  const start = match.index + match[0].length;
  const nextHeader = section.slice(start).search(/\d+\.\d+\s+(ADULT|TEEN|CHILD)\s*[—-]/i);
  const end = nextHeader === -1 ? section.length : start + nextHeader;
  const content = section.slice(start, end).trim();
  return { title, content };
}

function parseRewrittenFields(docContent, week, track) {
  // Look for "WEEK N · Title" or "WEEK N — Title" sections
  const weekPattern = new RegExp(`WEEK\\s+${week}\\s*[·•—-]\\s*([^\n]+)`, 'i');
  const match = docContent.match(weekPattern);
  if (!match) return null;
  const sectionStart = match.index;
  const nextWeek = docContent.slice(sectionStart + 1).match(/WEEK\s+\d+\s*[·•—-]/i);
  const sectionEnd = nextWeek ? sectionStart + 1 + nextWeek.index : docContent.length;
  const weekSection = docContent.slice(sectionStart, sectionEnd);
  return parseTrackContent(weekSection, track);
}

function parseFacilitatorNotes(docContent, week, track) {
  // Look for "Week N — all tracks" or "Week N" facilitator notes
  const patterns = [
    new RegExp(`Week\\s+${week}\\s*[—-]\\s*all tracks`, 'i'),
    new RegExp(`Week\\s+${week}\\s*[—-]`, 'i'),
    new RegExp(`${track}\\s*[—-]\\s*Facilitator Notes\\s*\\(Week\\s+${week}\\)`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = docContent.match(pattern);
    if (match) {
      const sectionStart = match.index;
      const nextHeader = docContent.slice(sectionStart + 1).match(/Week\s+\d+|Facilitator Notes/i);
      const sectionEnd = nextHeader ? sectionStart + 1 + nextHeader.index : docContent.length;
      const section = docContent.slice(sectionStart, sectionEnd);
      const parsed = parseTrackContent(section, track);
      if (parsed) return parsed.content;
    }
  }
  return null;
}

function parseSignalMetaphor(docContent, week, track) {
  // Look for signal metaphor rewrites
  const pattern = new RegExp(`WEEK\\s+${week}.*?signal metaphor`, 'i');
  const match = docContent.match(pattern);
  if (!match) return null;
  // Find the track-specific rewrite
  const sectionStart = match.index;
  const nextWeek = docContent.slice(sectionStart + 1).match(/WEEK\s+\d+/i);
  const sectionEnd = nextWeek ? sectionStart + 1 + nextWeek.index : docContent.length;
  const section = docContent.slice(sectionStart, sectionEnd);
  // Look for track-specific bullet
  const trackPattern = new RegExp(`${track}.*?[—-]\\s*([^\\n]+)`, 'i');
  const tm = section.match(trackPattern);
  return tm ? tm[1].trim() : null;
}

// Build updates map: week -> track -> { field: content }
const updates = { week: {}, track: {}, field: {} };

// Parse all review files
for (const file of REVIEW_FILES) {
  try {
    const content = readFileSync(file, "utf8");
    // Determine week range from filename
    const weeks = [];
    if (file.includes("week1")) weeks.push(1);
    else if (file.includes("weeks-2-3")) weeks.push(2, 3);
    else if (file.includes("block2-weeks-4-7")) weeks.push(4, 5, 6, 7);
    else if (file.includes("block3-weeks-8-11")) weeks.push(8, 9, 10, 11);
    else if (file.includes("block4-weeks-12-15")) weeks.push(12, 13, 14, 15);
    else if (file.includes("block5-weeks-16-19")) weeks.push(16, 17, 18, 19);
    else if (file.includes("block6-weeks-20-23")) weeks.push(20, 21, 22, 23);
    else if (file.includes("block7-weeks-24-27")) weeks.push(24, 25, 26, 27);
    else if (file.includes("block8-weeks-28-31")) weeks.push(28, 29, 30, 31);

    for (const week of weeks) {
      for (const track of ["Adult", "Teen", "Child"]) {
        const key = `${week}|${track}`;
        if (!updates[key]) updates[key] = {};

        // Parse rewritten fields
        const rewritten = parseRewrittenFields(content, week, track);
        if (rewritten) {
          updates[key].rewritten = rewritten.content;
          updates[key].session_title = rewritten.title;
        }

        // Parse facilitator notes
        const facilitator = parseFacilitatorNotes(content, week, track);
        if (facilitator) updates[key].facilitator_notes = facilitator;

        // Parse signal metaphor
        const metaphor = parseSignalMetaphor(content, week, track);
        if (metaphor) updates[key].signal_metaphor = metaphor;
      }
    }
  } catch (e) {
    console.warn(`Failed to parse ${file}:`, e.message);
  }
}

console.log(`Parsed updates for ${Object.keys(updates).filter(k => Object.keys(updates[k]).length > 0).length} lesson-track combinations`);

// ---------------------------------------------------------------------------
// Build Notion page content from updates
// ---------------------------------------------------------------------------

function buildUpdatedPage(existingBlocks, update) {
  // For now, we'll replace the entire page content with rebuilt blocks
  // In production, you might want to surgically replace specific sections
  // This is a simplified approach: rebuild the page from the update data
  
  const blocks = [];
  
  // Add session title if changed
  if (update.session_title) {
    blocks.push(h2(update.session_title));
  }
  
  // Add rewritten content as a section
  if (update.rewritten) {
    blocks.push(h2("Updated Lesson Content"));
    // Parse the rewritten content into blocks (it's markdown-like)
    const lines = update.rewritten.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("### ")) blocks.push(h3(trimmed.slice(4)));
      else if (trimmed.startsWith("## ")) blocks.push(h2(trimmed.slice(3)));
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) blocks.push(bullet(trimmed.slice(2)));
      else if (trimmed.startsWith("> ")) blocks.push(quote(trimmed.slice(2)));
      else blocks.push(para(trimmed));
    }
  }
  
  // Add facilitator notes
  if (update.facilitator_notes) {
    blocks.push(h2("Facilitator Notes (Updated)"));
    const lines = update.facilitator_notes.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("### ")) blocks.push(h3(trimmed.slice(4)));
      else if (trimmed.startsWith("## ")) blocks.push(h2(trimmed.slice(3)));
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) blocks.push(bullet(trimmed.slice(2)));
      else if (trimmed.startsWith("> ")) blocks.push(quote(trimmed.slice(2)));
      else blocks.push(para(trimmed));
    }
  }
  
  // Add signal metaphor
  if (update.signal_metaphor) {
    blocks.push(h2("Signal Metaphor (Updated)"));
    blocks.push(para(update.signal_metaphor));
  }
  
  return blocks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let updated = 0, skipped = 0, errors = 0;
  
  for (const [key, update] of Object.entries(updates)) {
    if (Object.keys(update).length === 0) continue;
    
    const [weekStr, track] = key.split("|");
    const week = parseInt(weekStr, 10);
    if (week < 1 || week > 34) continue; // Only weeks 1-34
    
    const dbId = DB_IDS[track];
    if (!dbId) continue;
    
    console.log(`\nProcessing Week ${week} ${track}...`);
    
    const page = await findPage(dbId, week);
    if (!page) {
      console.log(`  Page not found, skipping`);
      skipped++;
      continue;
    }
    
    if (DRY_RUN) {
      console.log(`  DRY RUN: would update page ${page.id}`);
      console.log(`  Fields to update: ${Object.keys(update).join(", ")}`);
      updated++;
      continue;
    }
    
    try {
      const newBlocks = buildUpdatedPage([], update);
      if (newBlocks.length === 0) {
        console.log(`  No blocks to update, skipping`);
        skipped++;
        continue;
      }
      
      await replaceBlocks(page.id, newBlocks);
      console.log(`  ✓ Updated page ${page.id} (${newBlocks.length} blocks)`);
      updated++;
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });