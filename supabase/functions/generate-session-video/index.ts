// generate-session-video
// Pipeline: Claude builds an 8-shot storyboard JSON from `film_script_2min`,
// ElevenLabs synthesises a narration MP3 from the script,
// both are uploaded to the `worksheets` storage bucket, and the public URLs
// are written back to `public.worksheets.video_url` (PDF storyboard) + a
// sibling row for the MP3.
//
// Required env (set in Supabase project secrets — do NOT hardcode):
//   ANTHROPIC_API_KEY    — Claude API key
//   ELEVENLABS_API_KEY   — your ElevenLabs key
//   ELEVENLABS_VOICE_ID  — optional; defaults to Rachel
//   SUPABASE_URL         — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected (server-only, never exposed)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import jsPDF from "npm:jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-sonnet-4-5"; // bump as newer models become GA
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel"

type Scene = {
  scene: number;
  narration: string;
  visuals: string;
  duration_sec: number;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const requireEnv = (name: string) => {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

const callClaudeStoryboard = async (filmScript: string, themeTitle: string): Promise<Scene[]> => {
  const ANTHROPIC_API_KEY = requireEnv("ANTHROPIC_API_KEY");
  const systemPrompt =
    "You are a film storyboard generator for a contemplative mental-wellness podcast called Mindcast. " +
    "Given a 2-minute spoken-word script, return an 8-shot storyboard as valid JSON with the schema: " +
    `{ "scenes": [{ "scene": int, "narration": str, "visuals": str, "duration_sec": int }] }. ` +
    "Total duration must sum to ~120 seconds. Visuals must be evocative, cinematic, and respect a calm/serious tone — no people speaking on camera. Return JSON only, no prose.";
  const userPrompt = `THEME: ${themeTitle}\n\nSCRIPT:\n${filmScript}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!r.ok) {
    throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  }
  const data = await r.json();
  const text: string = data?.content?.[0]?.text ?? "";
  // Strip markdown code fences if Claude wraps the JSON.
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  let parsed: { scenes?: Scene[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Storyboard JSON parse failed: ${(e as Error).message}. Raw: ${cleaned.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
    throw new Error("Storyboard JSON missing scenes array");
  }
  return parsed.scenes;
};

const callElevenLabsNarration = async (script: string): Promise<Uint8Array> => {
  const ELEVENLABS_API_KEY = requireEnv("ELEVENLABS_API_KEY");
  const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID") || DEFAULT_VOICE;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: script,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.7 },
    }),
  });
  if (!r.ok) {
    throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  }
  const buf = new Uint8Array(await r.arrayBuffer());
  if (buf.length < 1024) throw new Error("ElevenLabs returned empty/short audio");
  return buf;
};

const renderStoryboardPDF = (themeTitle: string, week: number, audience: string, scenes: Scene[]): Uint8Array => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  doc.setFillColor(10, 17, 32);
  doc.rect(0, 0, W, 80, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text(`MINDCAST · WEEK ${week} · ${audience.toUpperCase()} · STORYBOARD`, M, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 250, 246);
  doc.text(themeTitle.toUpperCase(), M, 58);
  y = 110;

  scenes.forEach((s) => {
    if (y > H - 140) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(53, 133, 175);
    doc.text(`SCENE ${s.scene}  ·  ${s.duration_sec}s`, M, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(184, 137, 90);
    doc.text("VISUALS", M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(10, 17, 32);
    const vis = doc.splitTextToSize(s.visuals || "", W - M * 2);
    doc.text(vis, M, y);
    y += vis.length * 12 + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(184, 137, 90);
    doc.text("NARRATION", M, y);
    y += 12;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(10, 17, 32);
    const nar = doc.splitTextToSize(`"${s.narration || ""}"`, W - M * 2);
    doc.text(nar, M, y);
    y += nar.length * 12 + 18;
  });

  const out = doc.output("arraybuffer");
  return new Uint8Array(out);
};

const stripScriptForNarration = (text: string) =>
  (text || "")
    // Strip stage directions in [..], (...) ; keep spoken lines
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\(([^)]+)\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { week_number, audience } = await req.json();
    if (!week_number || !audience) return json({ error: "week_number and audience required" }, 400);

    const SUPABASE_URL = requireEnv("SUPABASE_URL");
    const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Auth + role gate: only facilitators
    const authHeader = req.headers.get("Authorization") || "";
    const { data: userResp } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    const uid = userResp?.user?.id;
    if (!uid) return json({ error: "Unauthorised" }, 401);
    const { data: roleRow } = await supa
      .from("user_roles").select("role").eq("user_id", uid).eq("role", "facilitator").maybeSingle();
    if (!roleRow) return json({ error: "Facilitators only" }, 403);

    // Load lesson
    const { data: session, error: sErr } = await supa
      .from("mindcast_live_sessions")
      .select("week_number, theme_title, film_script_2min")
      .eq("week_number", week_number).eq("audience", audience).maybeSingle();
    if (sErr) throw sErr;
    if (!session) return json({ error: "Session not found" }, 404);
    if (!session.film_script_2min) return json({ error: "film_script_2min is empty" }, 400);

    // 1. Storyboard from Claude
    const scenes = await callClaudeStoryboard(session.film_script_2min, session.theme_title || "Mindcast");

    // 2. Render storyboard PDF
    const pdfBytes = renderStoryboardPDF(session.theme_title || "Mindcast", week_number, audience, scenes);

    // 3. Narration MP3 from ElevenLabs
    const narrationText = stripScriptForNarration(session.film_script_2min);
    const mp3Bytes = await callElevenLabsNarration(narrationText);

    const stamp = Date.now();
    const pdfPath = `videos/week-${week_number}/${audience.toLowerCase()}/storyboard-${stamp}.pdf`;
    const mp3Path = `videos/week-${week_number}/${audience.toLowerCase()}/narration-${stamp}.mp3`;

    const pdfUp = await supa.storage.from("worksheets").upload(pdfPath, pdfBytes, {
      contentType: "application/pdf", upsert: true,
    });
    if (pdfUp.error) throw pdfUp.error;

    const mp3Up = await supa.storage.from("worksheets").upload(mp3Path, mp3Bytes, {
      contentType: "audio/mpeg", upsert: true,
    });
    if (mp3Up.error) throw mp3Up.error;

    const pdfUrl = supa.storage.from("worksheets").getPublicUrl(pdfPath).data.publicUrl;
    const mp3Url = supa.storage.from("worksheets").getPublicUrl(mp3Path).data.publicUrl;

    // 4. Persist URLs against worksheets table (upsert by week + audience).
    const { error: wErr } = await supa.from("worksheets")
      .upsert({
        week_number,
        audience_type: audience,
        video_url: mp3Url,
        pdf_url: pdfUrl,
      }, { onConflict: "week_number,audience_type" });
    if (wErr) {
      // Table may not have that unique key — fall back to insert.
      await supa.from("worksheets").insert({
        week_number, audience_type: audience, video_url: mp3Url, pdf_url: pdfUrl,
      });
    }

    return json({ ok: true, storyboard_pdf_url: pdfUrl, narration_mp3_url: mp3Url, scenes });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
