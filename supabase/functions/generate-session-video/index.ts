// generate-session-video — Gemini video metaphor (replaces the Shotstack pipeline).
//
// Takes the week's central signal metaphor (the "In Today's World" slide
// script) and generates a short (~10s) visual metaphor with Google Gemini's
// native media output. Synchronous: Gemini returns inline video (or image)
// data in a single call, so there is no render webhook to wait for.
//
// Required env (set via Supabase Edge Function secrets):
//   GOOGLE_AI_API_KEY   — Gemini API key
//   GEMINI_VIDEO_MODEL  — optional; defaults to "gemini-3.7-flash"
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — auto-injected

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

type GeneratedAsset = { mimeType: string; data: string; kind: "video" | "image" };

async function generateWithGemini(model: string, prompt: string): Promise<GeneratedAsset> {
  const key = requireEnv("GOOGLE_AI_API_KEY");
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["Text", "Video", "Image"],
          temperature: 0.7,
        },
      }),
    },
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 400)}`);
  const data = await r.json();
  const parts = data?.candidates?.[0]?.content?.parts as Array<{ inlineData?: { mimeType: string; data: string } }> | undefined;
  for (const p of parts ?? []) {
    const d = p.inlineData;
    if (!d?.data) continue;
    if (d.mimeType.startsWith("video/")) return { mimeType: d.mimeType, data: d.data, kind: "video" };
    if (d.mimeType.startsWith("image/")) return { mimeType: d.mimeType, data: d.data, kind: "image" };
  }
  throw new Error("Gemini returned no video or image in this response");
}

const PROMPT_TEMPLATE = (metaphor: string, theme: string) =>
  `Create a short, calm, cinematic visual metaphor (~10 seconds) for a contemplative weekly gathering called Mindcast.

Theme: ${theme || "the signal beneath the noise"}
The idea to visualise (the week's signal metaphor): ${metaphor || "a clear signal rising out of static"}

Rules:
- No talking heads, no people speaking on camera, no guru figures, no religious or new-age imagery.
- Abstract and atmospheric: light, water, weather, radio dials, tuning needles, quiet landscapes.
- Text-free. Suitable as a wordless, looping backdrop on a room screen.
- Brand feel: navy ink and ivory, one restrained blue signal. Calm, deliberate, never shouting.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { week_number, audience } = await req.json();
    if (!week_number || !audience) return json({ error: "week_number and audience required" }, 400);

    const SUPABASE_URL = requireEnv("SUPABASE_URL");
    const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const authHeader = req.headers.get("Authorization") || "";
    const { data: userResp } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    const uid = userResp?.user?.id;
    if (!uid) return json({ error: "Unauthorised" }, 401);
    const { data: roleRow } = await supa
      .from("user_roles").select("role").eq("user_id", uid).in("role", ["facilitator", "admin"]).limit(1);
    if (!roleRow || roleRow.length === 0) return json({ error: "Facilitators and admins only" }, 403);

    const { data: session, error: sErr } = await supa
      .from("mindcast_live_sessions")
      .select("week_number, theme_title, signal_metaphor, film_script_2min")
      .eq("week_number", week_number).eq("audience", audience).maybeSingle();
    if (sErr) throw sErr;
    if (!session) return json({ error: "Session not found" }, 404);

    const metaphor = session.signal_metaphor || session.film_script_2min || "";
    if (!metaphor) return json({ error: "No signal metaphor or script set for this week + audience" }, 400);

    const model = Deno.env.get("GEMINI_VIDEO_MODEL") || "gemini-3.7-flash";
    const asset = await generateWithGemini(model, PROMPT_TEMPLATE(metaphor, session.theme_title || ""));

    const ext = asset.kind === "video" ? "mp4" : "png";
    const stamp = Date.now();
    const path = `videos/week-${week_number}/${audience.toLowerCase()}/metaphor-${stamp}.${ext}`;
    const bytes = Uint8Array.from(atob(asset.data), (c) => c.charCodeAt(0));
    const up = await supa.storage.from("worksheets").upload(path, bytes, {
      contentType: asset.mimeType, upsert: true,
    });
    if (up.error) throw up.error;
    const publicUrl = supa.storage.from("worksheets").getPublicUrl(path).data.publicUrl;

    const { error: wErr } = await supa.from("worksheets").upsert({
      week_number,
      audience_type: audience,
      video_mp4_url: publicUrl,
      render_id: model,
      render_status: "ready",
    }, { onConflict: "week_number,audience_type" });
    if (wErr) throw wErr;

    return json({ ok: true, url: publicUrl, kind: asset.kind, model, render_status: "ready" });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
