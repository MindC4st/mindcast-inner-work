#!/usr/bin/env node
/**
 * verify-video-urls.mjs — check every lesson video before it reaches a room.
 *
 * For each track's export CSV this:
 *   1. resolves the YouTube ID,
 *   2. calls YouTube's public oEmbed endpoint to confirm the video EXISTS and is
 *      embeddable, and reports its real title + channel,
 *   3. flags any video used by more than one week.
 *
 * Why this exists: a wrong-but-valid YouTube ID doesn't error — it silently
 * plays a completely different video. In a children's session that is a
 * safeguarding problem, not a typo. Never ship a video you haven't seen
 * resolved here.
 *
 * Usage:
 *   node scripts/verify-video-urls.mjs                 # all tracks
 *   node scripts/verify-video-urls.mjs adult           # one track
 *   node scripts/verify-video-urls.mjs --json          # machine-readable
 *
 * Exit code is non-zero if anything is dead or duplicated, so it can gate CI.
 */

import { readFileSync, existsSync } from "node:fs";

const FILES = {
  adult: "exports/mindcast-adult-lessons.csv",
  teen: "exports/mindcast-teen-lessons.csv",
  child: "exports/mindcast-child-lessons.csv",
};

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const only = args.find((a) => !a.startsWith("--"));

/** Minimal CSV parser that respects quoted fields and embedded newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.replace(/^﻿+/, "").trim());
  return rows
    .filter((r) => r.length > 1)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const videoId = (url) => {
  const m = (url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
};

async function checkId(id) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`)}&format=json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.status === 404) return { ok: false, reason: "not found / private / deleted" };
    if (res.status === 401) return { ok: false, reason: "embedding disabled" };
    // 403 from a proxy is a NETWORK problem, not a dead video. Distinguish it —
    // otherwise a blocked network reports every video as broken.
    if (res.status === 403) return { ok: false, network: true, reason: "blocked (proxy/network)" };
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const j = await res.json();
    return { ok: true, title: j.title, channel: j.author_name };
  } catch (e) {
    return { ok: false, network: true, reason: `unreachable: ${e.message}` };
  }
}

const tracks = only ? [only.toLowerCase()] : Object.keys(FILES);
const report = {};
let problems = 0;

for (const track of tracks) {
  const path = FILES[track];
  if (!path || !existsSync(path)) { console.error(`skip ${track}: ${path} not found`); continue; }
  const rows = parseCsv(readFileSync(path, "utf8")).filter((r) => /^\d+$/.test((r.Week || "").trim()));

  const seen = new Map();   // id -> [weeks]
  const results = [];

  for (const r of rows) {
    const week = r.Week.trim();
    const theme = (r["Weekly Theme"] || "").trim();
    const raw = (r["Video Link (YouTube)"] || "").trim();
    const id = videoId(raw);

    if (!id) {
      results.push({ week, theme, status: "MISSING", detail: raw || "(empty)" });
      problems++;
      continue;
    }
    seen.set(id, [...(seen.get(id) || []), week]);

    const check = await checkId(id);
    if (!check.ok) {
      results.push({ week, theme, id, status: check.network ? "UNVERIFIED" : "DEAD", detail: check.reason });
      problems++;
    } else {
      results.push({ week, theme, id, status: "OK", title: check.title, channel: check.channel });
    }
  }

  // Flag reuse — the thing we're trying to eliminate.
  const dupes = [...seen.entries()].filter(([, w]) => w.length > 1);
  for (const [id, weeks] of dupes) problems++;

  report[track] = { results, dupes: Object.fromEntries(dupes) };

  if (!asJson) {
    console.log(`\n${"=".repeat(70)}\n${track.toUpperCase()} — ${rows.length} weeks`);
    for (const r of results) {
      if (r.status === "OK") {
        console.log(`  ✓ wk${r.week.padStart(2)}  ${r.title}  ·  ${r.channel}`);
      } else {
        console.log(`  ✗ wk${r.week.padStart(2)}  ${r.status}: ${r.detail}   [${r.theme}]`);
      }
    }
    if (dupes.length) {
      console.log(`\n  REUSED (${dupes.length}):`);
      for (const [id, weeks] of dupes) console.log(`    ${id} → weeks ${weeks.join(", ")}`);
    } else {
      console.log("\n  No reuse. ✓");
    }
  }
}

const allResults = Object.values(report).flatMap((r) => r.results);
const unverified = allResults.filter((r) => r.status === "UNVERIFIED").length;
const networkDown = allResults.length > 0 && unverified === allResults.length;

if (asJson) console.log(JSON.stringify(report, null, 2));
else if (networkDown) {
  console.log(
    "\n⚠  Could not reach YouTube — every video came back UNVERIFIED.\n" +
    "   This says nothing about your videos; it means this machine cannot\n" +
    "   contact youtube.com (proxy, firewall or offline). Re-run somewhere\n" +
    "   with open network access before trusting any result.");
} else {
  console.log(`\n${problems === 0 ? "All clear." : `${problems} problem(s) found.`}`);
}

process.exit(problems === 0 ? 0 : 1);
