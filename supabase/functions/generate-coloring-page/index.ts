// generate-coloring-page — on-demand coloring page generation
// POST { week_number }  →  generates PNG + PDF, stores in Supabase Storage
//
// Uses Gemini 2.0 Flash with native image generation (inline image output).
// PDF is built by wrapping the PNG into a single-page PDF (pdf-lib on Deno).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "npm:pdf-lib";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
// Use Gemini 2.0 Flash with native image generation (inline image output)
// Try multiple model names for image generation — fall back gracefully
// Gemini-native image models accessible via Gemini API key (AIza...)
// gemini-2.5-flash-image (Nano Banana) — ~500 free images/day
// gemini-3.1-flash-image-preview (Nano Banana 2) — newest, same API
const GEMINI_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
];

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

  try {
    const { week_number } = await req.json();
    if (!week_number || typeof week_number !== "number") {
      return new Response(JSON.stringify({ error: "week_number is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Fetch the child lesson for this week
    const { data: lesson, error: lessonError } = await supabase
      .from("mindcast_live_sessions")
      .select("*")
      .eq("week_number", week_number)
      .eq("audience", "Child")
      .single();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: "Lesson not found for week " + week_number }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Build the coloring prompt — use stored prompt or derive from theme
    let prompt = lesson.coloring_prompt || "";
    if (!prompt) {
      prompt = `Black and white coloring page for children, simple clear outlines, large open spaces, no shading. Theme: "${lesson.theme_title}". Topic: "${lesson.signal_metaphor}". Clean line art suitable for crayons.`;
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
      return new Response(
        JSON.stringify({
          error: "No image generated — all Gemini models failed",
          detail: lastError,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const imageBytes = Uint8Array.from(atob(imageB64), (c) => c.charCodeAt(0));

    // 4. Upload PNG to storage
    const pngPath = `coloring/week-${week_number}/coloring-page.png`;
    const { error: pngUploadError } = await supabase.storage
      .from("worksheets")
      .upload(pngPath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (pngUploadError) {
      console.error("PNG upload error:", pngUploadError);
      return new Response(JSON.stringify({ error: "Failed to upload PNG" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: pngPublic } = supabase.storage
      .from("worksheets")
      .getPublicUrl(pngPath);
    const coloringPageUrl = pngPublic.publicUrl;

    // 5. Build PDF from the PNG image — LANDSCAPE A4, full-bleed
    const pdfDoc = await PDFDocument.create();
    // A4 landscape: 297mm × 210mm → 841.89 × 595.28 points
    const page = pdfDoc.addPage([841.89, 595.28]);

    // Embed the PNG
    let pngImage;
    try {
      pngImage = await pdfDoc.embedPng(imageBytes);
    } catch {
      // If pdf-lib can't embed the PNG directly (e.g. CMYK), return PNG URL
      return new Response(
        JSON.stringify({
          error: "PDF generation from PNG failed — image format may be incompatible",
          png_url: coloringPageUrl,
          week_number,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Scale image to fill the full landscape page (minimal margin)
    const margin = 16;
    const maxW = page.getWidth() - margin * 2;
    const maxH = page.getHeight() - margin * 2;
    // Use Math.max() so the image fills as much of the page as possible
    // while still being fully visible (contain, not cover)
    const scale = Math.min(maxW / pngImage.width, maxH / pngImage.height);
    const scaledW = pngImage.width * scale;
    const scaledH = pngImage.height * scale;
    const x = (page.getWidth() - scaledW) / 2;
    const y = (page.getHeight() - scaledH) / 2;

    page.drawImage(pngImage, {
      x,
      y,
      width: scaledW,
      height: scaledH,
    });

    // Footer label
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(
      `Coloring Page — Week ${week_number}: ${lesson.theme_title || ""}`,
      {
        x: margin,
        y: margin - 6,
        size: 8,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      },
    );

    const pdfBytes = await pdfDoc.save();

    // 6. Upload PDF to storage
    const pdfPath = `coloring/week-${week_number}/coloring-page.pdf`;
    const { error: pdfUploadError } = await supabase.storage
      .from("worksheets")
      .upload(pdfPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (pdfUploadError) {
      console.error("PDF upload error:", pdfUploadError);
      return new Response(JSON.stringify({ error: "Failed to upload PDF" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: pdfPublic } = supabase.storage
      .from("worksheets")
      .getPublicUrl(pdfPath);
    const coloringPdfUrl = pdfPublic.publicUrl;

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

    return new Response(
      JSON.stringify({
        success: true,
        week_number,
        coloring_page_url: coloringPageUrl,
        coloring_pdf_url: coloringPdfUrl,
        prompt,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
