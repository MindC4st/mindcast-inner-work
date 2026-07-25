/**
 * batch-generate-worksheets.mjs
 *
 * Generates branded worksheet PDFs for ALL weeks (1-52) × ALL audiences
 * (Adult, Teen, Child) and uploads them to the `worksheets` bucket under
 * `worksheet-pdfs/` subfolder.
 *
 * Usage:
 *   node scripts/batch-generate-worksheets.mjs
 *
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in the environment
 *     (or you can edit the inline defaults below)
 *   - The lesson data already exists in mindcast_live_sessions (seeded)
 *   - jsPDF dependency available (it's in the project's package.json)
 */

import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";

// ── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || "https://pjyelgogdsuiugaudecc.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY must be set in the environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Brand palette ───────────────────────────────────────────────────────────

const NAVY = "#0a1120";
const NAVY_MID = "#3b4660";
const BRONZE = "#b8895a";
const BLUE = "#3585af";
const BLUE_LIGHT = "#5ba0c9";
const IVORY = "#fffaf6";
const WARM_BORDER = "#e5dfd6";

// ── PDF generation (mirrors generateWorksheetPdf.ts but uses jsPDF in Node) ──

function generateWorksheetPdf(s) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;
  let y = M;

  function ensure(need) {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  }

  function sectionLabel(text) {
    ensure(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(BRONZE);
    doc.text(text.toUpperCase(), M, y, { charSpace: 2 });
    doc.setDrawColor(BRONZE);
    doc.setLineWidth(0.5);
    doc.line(M, y + 2, M + 40, y + 2);
    y += 16;
  }

  // ── Header bar ──
  doc.setFillColor(NAVY);
  doc.rect(0, 0, W, 72, "F");

  // Logo mark
  doc.setFillColor(BRONZE);
  doc.roundedRect(M, 14, 22, 22, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(IVORY);
  doc.text("M", M + 6, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(IVORY);
  doc.text("MINDCAST", M + 32, 23, { charSpace: 1.5 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(IVORY);
  doc.text("notice. name. rewire.", M + 32, 33);

  // Audience badge
  doc.setFillColor(BLUE);
  doc.roundedRect(W - M - 48, 12, 48, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(IVORY);
  doc.text((s.audience || "Adult").toUpperCase(), W - M - 24, 24, { align: "center", charSpace: 1.5 });

  // Week badge
  doc.setFillColor(NAVY_MID);
  doc.roundedRect(W - M - 48, 34, 48, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRONZE);
  doc.text(`WEEK ${s.week_number}`, W - M - 24, 46, { align: "center", charSpace: 1.5 });

  if (s.phase_name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(IVORY);
    doc.text((s.phase_name || "").toUpperCase(), W - M - 24, 63, { align: "center", charSpace: 1.2 });
  }

  // ── Title area ──
  y = 92;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  const themeLines = doc.splitTextToSize((s.theme_title || "").toUpperCase(), W - M * 2);
  doc.text(themeLines, M, y);
  y += themeLines.length * 22 + 2;

  if (s.session_title) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(NAVY_MID);
    doc.text(s.session_title, M, y);
    y += 16;
  }

  // ── The Signal ──
  if (s.signal_metaphor) {
    sectionLabel("The Signal");
    doc.setDrawColor(BLUE_LIGHT);
    doc.setLineWidth(2);
    doc.line(M, y, M, y + 40);
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(NAVY);
    const lines = doc.splitTextToSize(`"${s.signal_metaphor}"`, W - M * 2 - 20);
    doc.text(lines, M + 14, y + 6);
    y += Math.max(40, lines.length * 13 + 6);
  }

  // ── Reflection ──
  if (s.journaling_prompt) {
    sectionLabel("Reflection");
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    const lines = doc.splitTextToSize(`"${s.journaling_prompt}"`, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 13 + 6;

    const lineCount = y + 100 > H - M ? 3 : 4;
    doc.setDrawColor(WARM_BORDER);
    doc.setLineWidth(0.5);
    for (let i = 0; i < lineCount; i++) {
      y += 18;
      doc.line(M, y, W - M, y);
    }
    y += 10;
  }

  // ── Weekly Practice ──
  if (s.weekly_practice_mon || s.weekly_practice_wed || s.weekly_practice_sun) {
    if (y + 90 > H - M) {
      doc.addPage();
      y = M;
    }
    sectionLabel("This Week's Practice");

    const colW = (W - M * 2) / 3;
    const boxSize = 10;
    const items = [
      ["Mon", s.weekly_practice_mon || ""],
      ["Wed", s.weekly_practice_wed || ""],
      ["Sun", s.weekly_practice_sun || ""],
    ];

    let maxH = 0;
    const cellY = y;
    items.forEach(([day, text], i) => {
      const cx = M + i * colW;
      doc.setDrawColor(BLUE);
      doc.setLineWidth(0.8);
      doc.rect(cx, cellY, boxSize, boxSize);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(BLUE);
      doc.text(day.toUpperCase(), cx + boxSize + 6, cellY + 7, { charSpace: 1.2 });
      if (text) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(NAVY);
        const tLines = doc.splitTextToSize(text, colW - boxSize - 6);
        doc.text(tLines, cx + boxSize + 6, cellY + 20);
        const h = 20 + tLines.length * 10 + 6;
        if (h > maxH) maxH = h;
      } else if (20 > maxH) maxH = 20;
    });
    y = cellY + maxH + 4;
  }

  // ── Exercise / Activity ──
  if (s.experiential_exercise) {
    if (y + 80 > H - M) {
      doc.addPage();
      y = M;
    } else {
      y += 6;
    }
    sectionLabel("Activity");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(NAVY);
    const exLines = doc.splitTextToSize(s.experiential_exercise, W - M * 2);
    doc.text(exLines, M, y);
    y += exLines.length * 11 + 6;

    const noteLines = Math.min(3, Math.floor(50 / 18));
    doc.setDrawColor(WARM_BORDER);
    doc.setLineWidth(0.5);
    for (let i = 0; i < noteLines; i++) { y += 18; doc.line(M, y, W - M, y); }
    y += 10;
  }

  // ── Notes ──
  {
    const remaining = H - M - y;
    if (remaining > 40) {
      sectionLabel("Notes");
      const noteLines = Math.max(2, Math.min(8, Math.floor((remaining - 30) / 18)));
      doc.setDrawColor(WARM_BORDER);
      doc.setLineWidth(0.5);
      for (let i = 0; i < noteLines; i++) { y += 18; doc.line(M, y, W - M, y); }
    }
  }

  // ── Footer ──
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(WARM_BORDER);
    doc.setLineWidth(0.3);
    doc.line(M, ph - 30, W - M, ph - 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(NAVY_MID);
    doc.text("mindcast.co.nz  |  notice. name. rewire.", M, ph - 18, { charSpace: 1.2 });
    doc.text(`${i} / ${pages}`, W - M, ph - 18, { align: "right" });
  }

  return doc;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("📄 Mindcast Worksheet Batch Generator");
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log("");

  // 1. Fetch all sessions
  const { data: sessions, error } = await supabase
    .from("mindcast_live_sessions")
    .select(
      "week_number, audience, phase_name, theme_title, session_title, " +
      "signal_metaphor, journaling_prompt, experiential_exercise, " +
      "weekly_practice_mon, weekly_practice_wed, weekly_practice_sun, " +
      "core_affirmation"
    )
    .order("week_number", { ascending: true });

  if (error) {
    console.error("❌ Failed to query sessions:", error.message);
    process.exit(1);
  }

  if (!sessions || sessions.length === 0) {
    console.log("⚠️  No sessions found in mindcast_live_sessions.");
    console.log("   Make sure data has been seeded first.");
    process.exit(0);
  }

  console.log(`📦 Found ${sessions.length} sessions to process.`);

  let success = 0;
  let failed = 0;

  for (const session of sessions) {
    const filename = `week-${String(session.week_number).padStart(2, "0")}-${(session.audience || "adult").toLowerCase()}-worksheet.pdf`;
    const storagePath = `worksheet-pdfs/${filename}`;

    try {
      // Generate PDF
      const doc = generateWorksheetPdf(session);
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("worksheets")
        .upload(storagePath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        // Bucket policy might not allow service_role — try via REST upload
        console.warn(`   ⚠️  Upload failed for W${session.week_number} ${session.audience}: ${uploadError.message}`);
        failed++;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("worksheets")
        .getPublicUrl(storagePath);

      // Update the worksheets table with the PDF URL
      const { error: updateError } = await supabase
        .from("worksheets")
        .upsert({
          week_number: session.week_number,
          audience_type: session.audience,
          worksheet_pdf_url: urlData?.publicUrl || "",
        }, { onConflict: "week_number,audience_type" });

      if (updateError) {
        console.warn(`   ⚠️  Table update failed for W${session.week_number} ${session.audience}: ${updateError.message}`);
      }

      console.log(`   ✅ W${String(session.week_number).padStart(2, "0")} ${(session.audience || "?").padEnd(6)} — ${filename}`);
      success++;
    } catch (err) {
      console.error(`   ❌ Error on W${session.week_number} ${session.audience}:`, err.message);
      failed++;
    }
  }

  console.log("");
  console.log(`✅ Done. ${success} worksheets generated, ${failed} failed.`);
  if (failed > 0) console.log("   Failed uploads may need a storage policy update or manual upload.");
}

main().catch(console.error);
