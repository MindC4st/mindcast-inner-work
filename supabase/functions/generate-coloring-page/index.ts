// generate-coloring-page — on-demand coloring page generation
// POST { week_number, orientation? }  →  generates PNG + PDF, stores in Supabase Storage
//
// The image prompt is built from the lesson's own fields (theme, session
// title, signal metaphor) so it always reflects the current lesson content.
// The PDF is a branded A4 colouring sheet: MINDCAST wordmark, session title,
// session date, the line-art image, and a "Your Name" line — all black & white.
//
// Uses Gemini image generation (inline image output). PDF is built by wrapping
// the PNG into a single-page PDF (pdf-lib on Deno).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "npm:pdf-lib";
import { LOGO_PNG_B64 } from "./logo.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
// Gemini image models, tried in order. Overridable via GEMINI_IMAGE_MODELS
// (comma-separated) so a renamed/retired model never requires a code deploy.
const GEMINI_MODELS = (
  Deno.env.get("GEMINI_IMAGE_MODELS") ||
  "gemini-2.5-flash-image,gemini-2.0-flash-preview-image-generation,gemini-3.1-flash-image-preview"
).split(",").map((s) => s.trim()).filter(Boolean);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });

// Session date = program start Sunday + (week - 1) weeks, in the program tz.
// deno-lint-ignore no-explicit-any
async function sessionDateFor(supabase: any, week_number: number): Promise<string> {
  try {
    const { data: rows } = await supabase
      .from("app_settings").select("key, value")
      .in("key", ["program_start_date", "program_timezone"]);
    const map: Record<string, string> = {};
    (rows || []).forEach((r: any) => { map[r.key] = r.value; });
    const tz = map.program_timezone || "Pacific/Auckland";
    const start = map.program_start_date ? new Date(map.program_start_date) : new Date();
    const d = new Date(start.getTime() + (week_number - 1) * 7 * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-NZ", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz,
    }).format(d);
  } catch {
    return "";
  }
}

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // --- Authorisation -------------------------------------------------------
  // This function spends money (Gemini image generation) and writes with the
  // service-role key, so it must be staff-only. Resolve the caller from their
  // JWT and require a facilitator/admin role.
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
  const token = authHeader.replace("Bearer ", "");
  const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .in("role", ["facilitator", "admin"])
    .maybeSingle();
  if (!roleRow) return json({ error: "Facilitators only" }, 403);
  if (!GOOGLE_AI_API_KEY) return json({ error: "GOOGLE_AI_API_KEY is not configured", hint: "Set it under Supabase → Edge Functions → Secrets." }, 500);
  // -------------------------------------------------------------------------

  try {
    const { week_number, orientation: rawOrientation } = await req.json();
    if (!week_number || typeof week_number !== "number") {
      return json({ error: "week_number is required" }, 400);
    }
    const orientation = rawOrientation === "landscape" ? "landscape" : "portrait";

    // 1. Fetch the child lesson for this week
    const { data: lesson, error: lessonError } = await supabase
      .from("mindcast_live_sessions")
      .select("*")
      .eq("week_number", week_number)
      .eq("audience", "Child")
      .single();

    if (lessonError || !lesson) {
      return json({ error: "Lesson not found for week " + week_number }, 404);
    }

    // 2. Build the coloring prompt from the lesson fields. A hand-written
    //    prompt on the lesson always wins; otherwise derive one from the
    //    current theme so regeneration tracks content edits.
    const theme = (lesson.theme_title || "").trim();
    const sessionTitle = (lesson.session_title || "").trim();
    const metaphor = (lesson.signal_metaphor || "").trim().slice(0, 220);
    let prompt = (lesson.coloring_prompt || "").trim();
    if (!prompt) {
      prompt =
        `A4 ${orientation} children's colouring page. Black-and-white LINE ART ONLY: bold, clean, even outlines, ` +
        `no shading, no grey, no colour, pure white background. Large, simple, friendly shapes an under-8 can ` +
        `colour inside the lines. A warm, playful scene that illustrates the theme "${theme || "kindness"}"` +
        (sessionTitle ? ` (this week's children's lesson: ${sessionTitle})` : "") +
        (metaphor ? ` The week's idea in child-friendly terms: ${metaphor}` : "") +
        `. Cute characters, nature, and everyday objects; thick uniform line weight suited to crayons. ` +
        `Centred composition with a clear border margin. NO text, NO words, NO letters, NO numbers. ` +
        `Style: classic kids' activity-book colouring page. ` +
        (orientation === "landscape" ? "Aspect ratio 4:3 (A4 landscape)." : "Aspect ratio 3:4 (A4 portrait).");
    }

    // 3. Try Gemini models for image generation (fallback chain)
    const geminiBody = {
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    };

    let imageB64: string | null = null;
    let lastError: string = "";

    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;

      const geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!geminiRes.ok) {
        lastError = `${model}: ${geminiRes.status} ${await geminiRes.text()}`;
        continue;
      }

      const geminiData = await geminiRes.json();
      const candidate = geminiData.candidates?.[0];
      if (!candidate?.content?.parts) {
        lastError = `${model}: no parts in response`;
        continue;
      }

      // Find the inline image part
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("image/")) {
          imageB64 = part.inlineData.data;
          break;
        }
      }

      if (imageB64) break;
      lastError = `${model}: no image in response parts`;
    }

    if (!imageB64) {
      return json({ error: `No image generated — ${lastError || "all Gemini models failed"}`, detail: lastError }, 502);
    }

    const imageBytes = Uint8Array.from(atob(imageB64), (c) => c.charCodeAt(0));

    // 4. Upload PNG to storage
    const pngPath = `week-${String(week_number).padStart(2, "0")}/coloring-page.png`;
    const { error: pngUploadError } = await supabase.storage
      .from("colouring")
      .upload(pngPath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (pngUploadError) {
      console.error("PNG upload error:", pngUploadError);
      return json({ error: "Failed to upload PNG" }, 500);
    }

    // Store the storage PATH; readers mint a short-lived signed URL, which is
    // what keeps this behind the kids membership.
    const coloringPageUrl = pngPath;

    // 5. Build the branded PDF — A4 in the requested orientation.
    const sessionDate = await sessionDateFor(supabase, week_number);
    const pdfDoc = await PDFDocument.create();
    // A4 portrait: 595.28 × 841.89 pt · A4 landscape: 841.89 × 595.28 pt
    const [pageW, pageH] = orientation === "landscape" ? [841.89, 595.28] : [595.28, 841.89];
    const page = pdfDoc.addPage([pageW, pageH]);

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const BLACK = rgb(0.04, 0.07, 0.13); // Deep Signal Navy reads as black in print
    const GREY = rgb(0.56, 0.57, 0.6);

    const margin = 36;

    // Header — the MINDCAST logo (navy lockup on the white page).
    const logoBytes = Uint8Array.from(atob(LOGO_PNG_B64), (c) => c.charCodeAt(0));
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoW = 170;
    const logoH = logoW * (logo.height / logo.width);
    page.drawImage(logo, { x: margin, y: pageH - margin - logoH - 4, width: logoW, height: logoH });

    // Right side of header — week + session date.
    const weekLabel = `WEEK ${week_number}`;
    page.drawText(weekLabel, {
      x: pageW - margin - helveticaBold.widthOfTextAtSize(weekLabel, 10),
      y: pageH - margin - 12, size: 10, font: helveticaBold, color: BLACK,
    });
    if (sessionDate) {
      page.drawText(sessionDate, {
        x: pageW - margin - helvetica.widthOfTextAtSize(sessionDate, 7),
        y: pageH - margin - 24, size: 7, font: helvetica, color: GREY,
      });
    }

    // Title block under the header.
    const titleText = [theme.toUpperCase(), sessionTitle].filter(Boolean).join(" — ");
    if (titleText) {
      page.drawText(titleText.slice(0, 90), {
        x: margin, y: pageH - margin - 48, size: 11, font: helveticaBold, color: BLACK,
      });
    }

    // Embed the PNG.
    let pngImage;
    try {
      pngImage = await pdfDoc.embedPng(imageBytes);
    } catch {
      // If pdf-lib can't embed the PNG directly (e.g. CMYK), return PNG URL.
      return json({
        error: "PDF generation from PNG failed — image format may be incompatible",
        png_url: coloringPageUrl,
        week_number,
      });
    }

    // Image area: between the title block and the name line.
    const top = pageH - margin - 62;
    const bottom = margin + 58;
    const maxW = pageW - margin * 2;
    const maxH = top - bottom;
    const scale = Math.min(maxW / pngImage.width, maxH / pngImage.height);
    const scaledW = pngImage.width * scale;
    const scaledH = pngImage.height * scale;
    const x = (pageW - scaledW) / 2;
    const y = bottom + (maxH - scaledH) / 2;
    page.drawImage(pngImage, { x, y, width: scaledW, height: scaledH });

    // "Your Name" line.
    const nameY = margin + 26;
    page.drawText("Your Name:", { x: margin, y: nameY, size: 9, font: helveticaBold, color: BLACK });
    const lineStart = margin + helveticaBold.widthOfTextAtSize("Your Name:", 9) + 10;
    page.drawLine({
      start: { x: lineStart, y: nameY - 2 },
      end: { x: Math.min(lineStart + 220, pageW - margin), y: nameY - 2 },
      thickness: 0.8,
      color: BLACK,
    });

    // Footer.
    const footerText = "mindcast.co.nz  |  NOTICE IT, NAME IT, DO IT";
    page.drawText(footerText, { x: margin, y: margin - 4, size: 6, font: helvetica, color: GREY });
    const pageLabel = `${orientation === "landscape" ? "A4 landscape" : "A4 portrait"} colouring page`;
    page.drawText(pageLabel, {
      x: pageW - margin - helvetica.widthOfTextAtSize(pageLabel, 6),
      y: margin - 4, size: 6, font: helvetica, color: GREY,
    });

    const pdfBytes = await pdfDoc.save();

    // 6. Upload PDF to storage
    const pdfPath = `week-${String(week_number).padStart(2, "0")}/coloring-page.pdf`;
    const { error: pdfUploadError } = await supabase.storage
      .from("colouring")
      .upload(pdfPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (pdfUploadError) {
      console.error("PDF upload error:", pdfUploadError);
      return json({ error: "Failed to upload PDF" }, 500);
    }

    // Path, not a public URL — see the PNG note above.
    const coloringPdfUrl = pdfPath;

    // 7. Update the lesson record
    const { error: updateError } = await supabase
      .from("mindcast_live_sessions")
      .update({
        coloring_page_url: coloringPageUrl,
        coloring_pdf_url: coloringPdfUrl,
        coloring_prompt: prompt,
      })
      .eq("week_number", week_number)
      .eq("audience", "Child");

    if (updateError) {
      console.error("DB update error:", updateError);
      // Non-fatal — files are uploaded
    }

    return json({
      success: true,
      week_number,
      orientation,
      session_date: sessionDate,
      coloring_page_url: coloringPageUrl,
      coloring_pdf_url: coloringPdfUrl,
      prompt,
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
