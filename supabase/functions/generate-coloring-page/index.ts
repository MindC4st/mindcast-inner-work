// generate-coloring-page — on-demand coloring page generation
// POST { week_number }  →  generates PNG + PDF, stores in Supabase Storage
//
// Uses Google Imagen 3 via the Gemini API key.
// PDF is built by wrapping the PNG into a single-page PDF (pdf-lib on Deno).

import "jsr:@std/dotenv/load";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@1.17.1?dts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const IMAGEN_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict";

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

    // 3. Call Imagen 3 API
    const imagenRes = await fetch(IMAGEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GOOGLE_AI_API_KEY,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          personGeneration: "dont_allow",
        },
      }),
    });

    if (!imagenRes.ok) {
      const errBody = await imagenRes.text();
      return new Response(
        JSON.stringify({
          error: "Imagen API error",
          status: imagenRes.status,
          body: errBody,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const imagenData = await imagenRes.json();
    const prediction = imagenData.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      return new Response(
        JSON.stringify({ error: "No image returned from Imagen", raw: imagenData }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const imageBytes = Uint8Array.from(atob(prediction.bytesBase64Encoded), (c) =>
      c.charCodeAt(0)
    );

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

    // 5. Build PDF from the PNG image
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait

    // Embed the PNG
    let pngImage;
    try {
      pngImage = await pdfDoc.embedPng(imageBytes);
    } catch {
      // If pdf-lib can't embed the PNG directly (e.g. CMYK), fall back to JPEG
      return new Response(
        JSON.stringify({
          error: "PDF generation from PNG failed — image format may be incompatible",
          png_url: coloringPageUrl,
          week_number,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Scale image to fit A4 with margins
    const margin = 40;
    const maxWidth = page.getWidth() - margin * 2;
    const maxHeight = page.getHeight() - margin * 2;
    const scale = Math.min(
      maxWidth / pngImage.width,
      maxHeight / pngImage.height,
    );
    const scaledW = pngImage.width * scale;
    const scaledH = pngImage.height * scale;
    const x = (page.getWidth() - scaledW) / 2;
    const y = (page.getHeight() - scaledH) / 2;

    page.drawImage(pngImage, { x, y, width: scaledW, height: scaledH });

    // Add footer label
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(
      `Coloring Page — Week ${week_number}: ${lesson.theme_title || ""}`,
      {
        x: margin,
        y: 20,
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
