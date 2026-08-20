#!/usr/bin/env node
// stitch-generate-posters.mjs — generate MINDCAST poster images via the Stitch MCP (HTTP).
//
//   STITCH_API_KEY=... node scripts/stitch-generate-posters.mjs [--skip-download]
//
// Generates the 7 launch/posters into the project and downloads each screenshot
// to .stitch/designs/. Note: the Stitch MCP is text-only (no reference-image
// uploads), so these are concept drafts — venue/brand/fashion-faithful finals
// should still be produced in Flow with the reference photos attached.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.STITCH_API_KEY;
if (!KEY) { console.error("Missing STITCH_API_KEY env var"); process.exit(1); }

const URL = "https://stitch.googleapis.com/mcp";
const PROJECT_ID = process.env.STITCH_PROJECT_ID || "15387766798049544393";
const OUT_DIR = join(process.cwd(), ".stitch", "designs");
const SKIP_DOWNLOAD = process.argv.includes("--skip-download");

async function tool(name, args) {
  const r = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream", "X-Goog-Api-Key": KEY },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${name}: ${JSON.stringify(j.error)}`);
  const res = j.result;
  const text = res?.content?.map((c) => c.text).join("\n") ?? "";
  let data = res?.structuredContent;
  if (!data || Object.keys(data).length === 0) {
    try { data = JSON.parse(text); } catch { data = {}; }
  }
  return data;
}

const STYLE = `35mm documentary editorial photography, natural film grain, muted realistic colours, ordinary New Zealand setting, imperfect natural light. Not glossy, not HDR, not corporate stock photography, not luxury wellness advertising. Real New Zealand adults, teenagers and children in natural, unstaged poses with varied casual outfits (no matching brand-colour uniforms, no navy/blue-only dressing). No generated logos, no readable text.`;

const PANEL = `Include a blank frosted-white translucent panel (warm ivory-white, about 88-94% opacity, subtle background blur, soft feathered edge, completely empty) reserved for later text compositing.`;

const POSTERS = [
  {
    slug: "1-hero-entrance",
    prompt: `A single continuous photographic hero entrance poster. ${STYLE} The viewer stands outside a modest New Zealand community hall looking toward its real entrance on a soft Sunday morning. The front doors are open, revealing a believable glimpse of a warm foyer with a timber welcome table set with planners, journals, worksheets and pens 2-4 metres inside. Adults, teens and children arrive naturally, staggered along the path and near the entrance: two women walking in conversation, a man arriving with a child, a teen girl near the door, a parent holding a child's hand, one or two people visible inside. Tall feather flags stand near the entrance. No split-screen, no collage, one continuous photograph only. ${PANEL} Warm, premium, community-focused.`,
  },
  {
    slug: "2-adults-seminar",
    prompt: `A single poster image for an adults seminar. ${STYLE} A seminar room in a community hall with a presenter standing at the front near a TV screen, and rows of adults seated lecture-style in chairs. Every audience member clearly faces the presenter and screen — no circular seating, no clusters, no sideways turns. A mix of men and women aged 25-60, some writing on worksheets, some listening, a few glancing at the screen, natural expressions, obvious outfit variety (not a uniform). ${PANEL} Place the frosted panel on the left without covering the presenter.`,
  },
  {
    slug: "3-teens-meeting-room",
    prompt: `A single poster image for a teen session. ${STYLE} A small meeting room in a community hall with about 5-8 teenagers seated around one central table, working through worksheets. A TV in the background displays a subtle logo. Some writing, some listening, some looking at each other naturally, one leaning in engaged; pens, worksheets, a water bottle and a hoodie casually present. Authentic New Zealand teen styling — oversized tees, baggy trousers, denim, hoodies, caps, sneakers; obvious outfit variety, no coordinated dressing. Safe, social, focused and real, not childish. ${PANEL}`,
  },
  {
    slug: "4-children-foyer",
    prompt: `A single poster image for a children's session. ${STYLE} The foyer of a community hall where about 4-8 children are colouring pages and doing simple worksheets at tables. Pencils, crayons and markers are visible; one child looks at their page, one chats quietly, an adult caregiver helps gently nearby. Calm, structured and welcoming — not a noisy play-centre. Children in normal colourful kid outfits (stripes, sweatshirts, denim, casual pants, sneakers) with more colour variety than the adults. ${PANEL}`,
  },
  {
    slug: "5-tennis-family",
    prompt: `A single poster image for a family community session. ${STYLE} Children play tag-style movement games on a tennis court at a community hall. Parents stand on the sidelines watching, a few casually joining in, maybe one teen helping out. Natural movement and laughter — not competitive tennis, not staged sports poses. People naturally dressed for a Sunday family session: hoodies, tees, denim, track pants, sneakers, relaxed layers, with real outfit variety. Subtle feather flags near the court edge. ${PANEL}`,
  },
  {
    slug: "6-foyer-products",
    prompt: `A single social media image (not a collage). ${STYLE} A community hall foyer welcome environment, doors open, a welcome table set with premium but practical products — a 90-day planner, a life binder, a reflection journal, a folio, worksheets and pens, on a warm timber table. Two to four adults browse and greet each other naturally in varied casual outfits. No staff-uniform vibe. ${PANEL}`,
  },
  {
    slug: "7-entrance-arrival",
    prompt: `A single social media image. ${STYLE} A stylish, authentic Sunday arrival moment outside a real New Zealand community hall. Adults, teens and children arrive naturally, feather flags outside, the doors open with a glimpse of the foyer and a welcome table inside. No split-screen, no collage, one continuous photograph only. ${PANEL} Minimal and clean.`,
  },
];

async function generate(slug, prompt) {
  const res = await tool("generate_screen_from_text", {
    projectId: PROJECT_ID,
    prompt,
    deviceType: "AGNOSTIC",
    modelId: "GEMINI_3_FLASH",
  });
  const screens = res?.outputComponents?.find((c) => c.design)?.design?.screens ?? res?.design?.screens ?? [];
  const screen = screens[0];
  if (!screen) throw new Error(`no screen in result for ${slug}: ${JSON.stringify(res).slice(0, 300)}`);
  const url = screen.screenshot?.downloadUrl;
  const id = screen.id;
  return { slug, id, url, title: screen.title };
}

mkdirSync(OUT_DIR, { recursive: true });
const results = [];
for (const p of POSTERS) {
  process.stdout.write(`Generating ${p.slug}... `);
  const t0 = Date.now();
  try {
    const r = await generate(p.slug, p.prompt);
    results.push(r);
    console.log(`done (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  } catch (e) {
    console.log(`FAILED: ${e.message.slice(0, 200)}`);
    results.push({ slug: p.slug, error: e.message });
  }
}

const manifest = [];
for (const r of results) {
  if (!r.url) continue;
  const file = join(OUT_DIR, `${r.slug}.png`);
  try {
    const img = await fetch(r.url);
    const buf = Buffer.from(await img.arrayBuffer());
    writeFileSync(file, buf);
    manifest.push({ slug: r.slug, screenId: r.id, file: `.stitch/designs/${r.slug}.png` });
  } catch (e) {
    manifest.push({ slug: r.slug, screenId: r.id, downloadUrl: r.url, downloadError: e.message });
  }
}

writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDone. ${manifest.length} posters downloaded to ${OUT_DIR}`);
for (const m of manifest) console.log(`  ${m.file || m.downloadUrl || m.slug}`);
