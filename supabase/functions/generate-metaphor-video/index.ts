// generate-metaphor-video — per-week 10s metaphor video (Gate D).
//
// Two slides carry a generated clip: Ancient Wisdom (S3) and In Today's World
// (S4). Both use the same pipeline: take the text field, hash it, and only
// regenerate when the text changes. Stores the MP4 + a WebVTT captions file
// (generated from the voiceover script) in Supabase Storage and writes the
// URLs + approval state back to the lesson row. New generations are marked
// `unapproved`; the admin approve/regenerate flow gates them from the room.
//
// POST { week_number, audience, slide: 'ancient' | 'todays_world' }
// Response: { video_url, captions_url, approval, cached }
//
// Required env: GOOGLE_AI_API_KEY, GEMINI_VIDEO_MODEL (optional), SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });

const requireEnv = (name: string) => {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

// djb2 hash — stable across runs, enough for change detection.
function hashText(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function makeVtt(text: string, seconds: number): string {
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.000`;
  return `WEBVTT\n\n${fmt(0)} --> ${fmt(seconds)}\n${text}\n`;
}

const PROMPT_TEMPLATE = (metaphor: string, theme: string) =>
  `Create a short, calm, cinematic visual metaphor (~10 seconds) for a contemplative weekly gathering called Mindcast.

Theme: ${theme || "the signal beneath the noise"}
The idea to visualise: ${metaphor || "a clear signal rising out of static"}

Rules:
- No talking heads, no people speaking on camera, no guru figures, no religious or new-age imagery (no lotus flowers, mandalas, chakras, glowing brains, sunrise-over-mountain, meditating silhouettes).
- Abstract and atmospheric: light, water, weather, radio dials, tuning needles, quiet landscapes.
- Text-free. Suitable as a wordless, looping backdrop on a room screen.
- Brand feel: ink navy and ivory, one restrained blue signal. Calm, deliberate, never shouting.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { week_number, audience, slide } = await req.json();
    if (!week_number || !audience || (slide !== "ancient" && slide !== "todays_world")) {
      return json({ error: "week_number, audience and slide ('ancient'|'todays_world') required" }, 400);
    }

    const SUPABASE_URL = requireEnv("SUPABASE_URL");
    const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const authHeader = req.headers.get("Authorization") || "";
    const { data: userResp } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userResp?.user?.id) return json({ error: "Unauthorised" }, 401);
    const { data: roleRow } = await supa
      .from("user_roles").select("role").eq("user_id", userResp.user.id).in("role", ["facilitator", "admin"]).limit(1);
    if (!roleRow || roleRow.length === 0) return json({ error: "Facilitators and admins only" }, 403);

    const { data: lesson, error: lErr } = await supa
      .from("mindcast_live_sessions")
      .select("theme_title, ancient_wisdom_reframe, ancient_wisdom_vo_script, ancient_wisdom_video_url, ancient_wisdom_captions_url, ancient_wisdom_hash, signal_metaphor, todays_world_vo_script, todays_world_video_url, todays_world_captions_url, todays_world_hash")
      .eq("week_number", week_number).eq("audience", audience).maybeSingle();
    if (lErr) throw lErr;
    if (!lesson) return json({ error: "Session not found" }, 404);

    const isAncient = slide === "ancient";
    const fullText = (isAncient ? lesson.ancient_wisdom_reframe : lesson.signal_metaphor) || "";
    const voScript = (isAncient ? lesson.ancient_wisdom_vo_script : lesson.todays_world_vo_script) || fullText;
    if (!fullText.trim()) return json({ error: `No ${slide} text set for this week + audience` }, 400);

    const hash = hashText(fullText);
    const existingUrl = isAncient ? lesson.ancient_wisdom_video_url : lesson.todays_world_video_url;
    const existingHash = isAncient ? lesson.ancient_wisdom_hash : lesson.todays_world_hash;

    // Cache hit: text unchanged and an asset already exists.
    if (existingUrl && existingHash === hash) {
      return json({ video_url: existingUrl, captions_url: isAncient ? lesson.ancient_wisdom_captions_url ?? null : lesson.todays_world_captions_url ?? null, approval: "cached", cached: true });
    }

    // Generate.
    const model = Deno.env.get("GEMINI_VIDEO_MODEL") || "gemini-3.7-flash";
    const key = requireEnv("GOOGLE_AI_API_KEY");
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: PROMPT_TEMPLATE(voScript, lesson.theme_title || "") }] }],
        generationConfig: { responseModalities: ["Text", "Video", "Image"], temperature: 0.7 },
      }),
    });
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 400)}`);
    const data = await r.json();
    const parts = data?.candidates?.[0]?.content?.parts as Array<{ inlineData?: { mimeType: string; data: string } }> | undefined;
    const inline = (parts ?? []).find((p) => p.inlineData?.data && (p.inlineData.mimeType.startsWith("video/") || p.inlineData.mimeType.startsWith("image/")));
    if (!inline?.inlineData) throw new Error("Gemini returned no video or image in this response");

    const ext = inline.inlineData.mimeType.startsWith("video/") ? "mp4" : "png";
    const stamp = `${week_number}-${audience.toLowerCase()}-${isAncient ? "ancient" : "world"}-${hash}`;
    const bytes = Uint8Array.from(atob(inline.inlineData.data), (c) => c.charCodeAt(0));
    const videoPath = `metaphor/${stamp}.${ext}`;
    const vttPath = `metaphor/${stamp}.vtt`;

    const upVideo = await supa.storage.from("worksheets").upload(videoPath, bytes, { contentType: inline.inlineData.mimeType, upsert: true });
    if (upVideo.error) throw upVideo.error;
    const upVtt = await supa.storage.from("worksheets").upload(vttPath, new TextEncoder().encode(makeVtt(voScript, 10)), { contentType: "text/vtt", upsert: true });
    if (upVtt.error) throw upVtt.error;

    const videoUrl = supa.storage.from("worksheets").getPublicUrl(videoPath).data.publicUrl;
    const captionsUrl = supa.storage.from("worksheets").getPublicUrl(vttPath).data.publicUrl;

    const patch = isAncient
      ? { ancient_wisdom_video_url: videoUrl, ancient_wisdom_captions_url: captionsUrl, ancient_wisdom_hash: hash, ancient_wisdom_approval: "unapproved" }
      : { todays_world_video_url: videoUrl, todays_world_captions_url: captionsUrl, todays_world_hash: hash, todays_world_approval: "unapproved" };
    const { error: uErr } = await supa.from("mindcast_live_sessions").update(patch).eq("week_number", week_number).eq("audience", audience);
    if (uErr) throw uErr;

    return json({ video_url: videoUrl, captions_url: captionsUrl, approval: "unapproved", cached: false });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
