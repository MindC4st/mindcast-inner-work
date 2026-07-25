// batch-generate-coloring-pages.mjs
// 🎨 Batch generate all 52 child coloring pages via Google Imagen 3 API
//
// PREREQUISITES:
//   1. supabase CLI linked (already done)
//   2. Set env vars:
//      $env:GOOGLE_AI_API_KEY = "AIza..."
//      $env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
//   3. Run: node scripts/batch-generate-coloring-pages.mjs
//
// WHAT IT DOES:
//   - Reads coloring prompts from the child CSV
//   - First seeds prompts into the DB (skips if already set)
//   - For each week: calls Imagen → saves PNG → builds PDF → uploads to Storage → updates DB
//   - Respects rate limits (2s delay between calls)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; // optional — only needed for gen step
const SUPABASE_URL = "https://pjyelgogdsuiugaudecc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional — only needed for upload

const supabase = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Gemini models to try for image generation (first success wins)
const GEMINI_MODELS = ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"];

// ── 1. Parse the child CSV ──────────────────────────────────────────────
function parseCsv(text) {
  const rows = [];
  const re = /("(?:[^"]|"")*"|[^",\n\r]+)(,|\r?\n|\r|$)/g;
  let row = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    let val = m[1];
    if (val.startsWith('"') && val.endsWith('"'))
      val = val.slice(1, -1).replace(/""/g, '"');
    row.push(val);
    if (m[2] !== ",") {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}

const csvPath = "./exports/mindcast-child-lessons.csv";
const csvContent = readFileSync(csvPath, "utf-8");
const rows = parseCsv(csvContent);

const header = rows[0];
const weekIdx = header.indexOf("Week");
const themeIdx = header.indexOf("Weekly Theme");
const metaphorIdx = header.indexOf("Signal Metaphor");
let promptIdx = header.indexOf("Coloring Page Prompt");

// If no coloring prompt column, build from theme + metaphor
const getPrompt = (row) => {
  if (promptIdx >= 0 && row[promptIdx]?.trim()) return row[promptIdx].trim();
  const theme = row[themeIdx] || "";
  const metaphor = row[metaphorIdx] || "";
  return `Black and white coloring page for children, simple clear outlines, large open spaces, no shading, no text. Theme: "${theme}". Topic: "${metaphor}". Clean line art suitable for crayons.`;
};

// ── 2. STEP A: Seed prompts into DB ─────────────────────────────────────
async function seedPrompts() {
  if (!supabase) {
    console.log(
      "⚠️  SUPABASE_SERVICE_ROLE_KEY not set — skipping DB seed.",
    );
    return;
  }

  console.log("\n📦 Seeding coloring prompts to DB...\n");

  for (let i = 1; i < rows.length; i++) {
    const week = parseInt(rows[i][weekIdx]);
    const prompt = getPrompt(rows[i]);

    // Check if prompt already set
    const { data: existing } = await supabase
      .from("mindcast_live_sessions")
      .select("coloring_prompt")
      .eq("week_number", week)
      .eq("audience", "Child")
      .single();

    if (existing?.coloring_prompt) {
      console.log(`  Week ${week}: ✅ prompt already set`);
      continue;
    }

    const { error } = await supabase
      .from("mindcast_live_sessions")
      .update({ coloring_prompt: prompt })
      .eq("week_number", week)
      .eq("audience", "Child");

    if (error) {
      console.error(`  Week ${week}: ❌ ${error.message}`);
    } else {
      console.log(`  Week ${week}: ✅ prompt seeded`);
    }
  }
}

// ── 3. STEP B: Generate all coloring pages ──────────────────────────────
async function generateAll() {
  if (!GOOGLE_AI_API_KEY) {
    console.log(
      "\n⚠️  GOOGLE_AI_API_KEY not set — skipping generation.",
    );
    console.log("   Set it with: $env:GOOGLE_AI_API_KEY = 'AIza...'");
    return;
  }

  console.log("\n🎨 Generating coloring pages for all 52 weeks...\n");

  const tmpDir = "./tmp-coloring";
  if (!existsSync(tmpDir)) mkdirSync(tmpDir);

  for (let i = 1; i < rows.length; i++) {
    const week = parseInt(rows[i][weekIdx]);
    const prompt = getPrompt(rows[i]);

    // Check if already generated in DB
    if (supabase) {
      const { data: existing } = await supabase
        .from("mindcast_live_sessions")
        .select("coloring_page_url, coloring_prompt")
        .eq("week_number", week)
        .eq("audience", "Child")
        .single();

      if (existing?.coloring_prompt && existing?.coloring_page_url) {
        console.log(`  Week ${week}: ✅ already generated → ${existing.coloring_page_url}`);
        continue;
      }
    }

    process.stdout.write(`  Week ${week}: generating... `);

    try {
      // Try Gemini models for image generation (fallback chain)
      const geminiBody = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["Text", "Image"] },
      });

      let imageB64 = null;
      let lastError = "";

      for (const model of GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: geminiBody,
        });

        if (!res.ok) {
          lastError = `${model}: ${res.status} ${(await res.text()).substring(0, 100)}`;
          continue;
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("image/")) {
              imageB64 = part.inlineData.data;
              break;
            }
          }
        }
        if (imageB64) break;
        lastError = `${model}: no image in response`;
      }

      if (!imageB64) {
        console.log(`❌ All Gemini models failed: ${lastError.substring(0, 150)}`);
        continue;
      }

      const imgBuf = Buffer.from(imageB64, "base64");
      const pngFile = `${tmpDir}/week-${week}.png`;

      // Save PNG locally
      writeFileSync(pngFile, imgBuf);

      // Upload to Supabase Storage
      if (supabase) {
        const pngPath = `coloring/week-${week}/coloring-page.png`;
        const { error: upErr } = await supabase.storage
          .from("worksheets")
          .upload(pngPath, imgBuf, {
            contentType: "image/png",
            upsert: true,
          });

        if (upErr) {
          console.log(`❌ upload failed: ${upErr.message}`);
          continue;
        }

        const { data: pngPub } = supabase.storage
          .from("worksheets")
          .getPublicUrl(pngPath);

        // Update DB
        const { error: dbErr } = await supabase
          .from("mindcast_live_sessions")
          .update({
            coloring_page_url: pngPub.publicUrl,
            coloring_prompt: prompt,
          })
          .eq("week_number", week)
          .eq("audience", "Child");

        if (dbErr) {
          console.log(`⚠️  uploaded but DB update failed: ${dbErr.message}`);
        } else {
          console.log(`✅ → ${pngPub.publicUrl.substring(0, 60)}...`);
        }
      } else {
        console.log(`✅ PNG saved to ${pngFile} (no Supabase upload)`);
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }

    // Rate limit: 2s between calls
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Batch complete!");
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const step = process.argv[2] || "seed";

  if (step === "seed") {
    await seedPrompts();
  } else if (step === "generate") {
    await generateAll();
  } else if (step === "all") {
    await seedPrompts();
    await generateAll();
  } else {
    console.log(
      "Usage: node scripts/batch-generate-coloring-pages.mjs [seed|generate|all]",
    );
    console.log("  seed      — import CSV prompts into DB");
    console.log("  generate  — call Imagen API for all 52 weeks");
    console.log("  all       — do both");
  }

  if (supabase) supabase.auth.signOut();
}

main();
