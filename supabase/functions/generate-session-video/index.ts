// generate-session-video — Hybrid video pipeline
//
// Pipeline:
//   1. Gemini builds an 8-shot storyboard JSON from `film_script_2min`,
//      enriched with imagery from `signal_metaphor`.
//   2. ElevenLabs synthesises a narration MP3 from the film script.
//   3. Storyboard PDF (jsPDF) and narration MP3 are uploaded to the
//      `worksheets` storage bucket (public URLs).
//   4. Pexels Video API is queried per scene for a matching stock clip.
//      The `signal_metaphor` guides the visual search so scenes reflect
//      metaphorical imagery, not just generic stock footage.
//   5. A Shotstack render job is submitted asynchronously with a webhook
//      pointing back to the `shotstack-webhook` function. We return
//      immediately with the render id; the webhook finalises the row.
//
// Why webhook (not poll): Shotstack renders take 1–5 minutes, longer than the
// Supabase edge function timeout. The webhook handler picks up the finished
// MP4 and writes it back to `public.worksheets.video_mp4_url`.
//
// Required env (set via Supabase Edge Function secrets):
//   GOOGLE_AI_API_KEY       — Gemini API (storyboard generation)
//   ELEVENLABS_API          — ElevenLabs (narration)
//   ELEVENLABS_VOICE_ID     — optional, defaults to Kylee (NZ accent)
//   PEXELS_API              — Pexels stock video search (free key)
//   SHOTSTACK_API           — Shotstack render
//   SHOTSTACK_ENV           — optional: "stage" (default) or "v1" (prod)
//   SHOTSTACK_WEBHOOK_URL   — optional: override; otherwise derived from SUPABASE_URL
//   SUPABASE_URL            — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
// Deno's npm: interop doesn't reliably expose jspdf's default export as a
// callable constructor (`jsPDF is not a constructor` at runtime). Pull the
// named export instead — works in both ESM and CJS interop paths.
import { jsPDF } from "npm:jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_VOICE = "pcKdPWtbF6bM9o7NHjCI"; // ElevenLabs "Kylee" — English (NZ accent)

type Scene = {
  scene: number;
  narration: string;
  visuals: string;
  duration_sec: number;
  search_keywords?: string;
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

const callGeminiStoryboard = async (filmScript: string, themeTitle: string, signalMetaphor?: string): Promise<Scene[]> => {
  const GOOGLE_AI_API_KEY = requireEnv("GOOGLE_AI_API_KEY");
  const systemPrompt =
    "You are a film storyboard generator for a contemplative mental-wellness podcast called Mindcast. " +
    "Given a 2-minute spoken-word script, return an 8-shot storyboard as valid JSON with the schema: " +
    `{ "scenes": [{ "scene": int, "narration": str, "visuals": str, "duration_sec": int, "search_keywords": str }] }. ` +
    "Total duration must sum to ~120 seconds. `visuals` is a one-sentence cinematic description. " +
    "`search_keywords` is 2–4 concrete, filmable nouns suitable for searching a stock video library (Pexels). " +
    "Tone: calm, serious, evocative. No people speaking on camera. Return JSON only, no prose.";
  const metaphorGuidance = signalMetaphor
    ? `\nThe session has a SIGNAL METAPHOR — a vivid, everyday image that embodies the lesson's core insight. Use this metaphor to inform the visual direction of each scene in a subtle, atmospheric way.\n\nSIGNAL METAPHOR:\n${signalMetaphor}\n\nFor each scene's \`search_keywords\`, include concrete nouns from the signal metaphor (e.g. broadcast tower, compass, river, phone, stars) blended with the script's literal content — so the video carries the metaphorical thread visually.`
    : '';
  const userPrompt = `THEME: ${themeTitle}\n\nSCRIPT:\n${filmScript}${metaphorGuidance}`;

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    },
  );

  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned empty response");
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
  const ELEVENLABS_API_KEY = requireEnv("ELEVENLABS_API");
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
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
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

  return new Uint8Array(doc.output("arraybuffer"));
};

const stripScriptForNarration = (text: string) =>
  (text || "")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\(([^)]+)\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type PexelsVideo = { url: string; width: number; height: number };

const searchPexelsVideo = async (query: string): Promise<PexelsVideo | null> => {
  const PEXELS_API_KEY = requireEnv("PEXELS_API");
  // Trim aggressive punctuation, keep first ~6 words for relevance.
  const q = query.replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 6).join(" ");
  const url = `https://api.pexels.com/videos/search?per_page=3&orientation=landscape&query=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!r.ok) return null;
  const data = await r.json();
  const first = data?.videos?.[0];
  if (!first) return null;
  // Pexels returns several quality variants. Pick the smallest >=720p mp4 to keep
  // Shotstack render time/cost down — we don't need 4K for 720p output.
  const files: { link: string; width: number; height: number; file_type: string }[] = first.video_files || [];
  const candidates = files
    .filter(f => (f.file_type === "video/mp4" || f.link.endsWith(".mp4")) && f.height >= 540)
    .sort((a, b) => a.height - b.height);
  const pick = candidates[0] || files[0];
  return pick ? { url: pick.link, width: pick.width, height: pick.height } : null;
};

type ShotstackResp = { success: boolean; response: { id: string; message: string }; message?: string };

const submitShotstackRender = async (params: {
  themeTitle: string;
  weekNumber: number;
  audience: string;
  affirmation: string;
  narrationMp3Url: string;
  scenes: Scene[];
  brollUrls: (string | null)[];
  webhookUrl: string;
}): Promise<string> => {
  const SHOTSTACK_API_KEY = requireEnv("SHOTSTACK_API");
  const SHOTSTACK_ENV = Deno.env.get("SHOTSTACK_ENV") || "stage";
  const totalDuration = params.scenes.reduce((s, sc) => s + sc.duration_sec, 0);

  // Build the Shotstack timeline:
  //  - audio track: ElevenLabs narration MP3 (full length)
  //  - video track: title card, B-roll clips with crossfades, outro affirmation card
  //  - title overlay on each scene with the narration text (for accessibility)
  const TITLE_DUR = 4;
  const OUTRO_DUR = 6;

  // Title clip
  const titleClip = {
    asset: {
      type: "title",
      text: params.themeTitle.toUpperCase(),
      style: "minimal",
      color: "#fffaf6",
      background: "#0a1120",
      size: "x-large",
      position: "center",
    },
    start: 0,
    length: TITLE_DUR,
    transition: { in: "fade", out: "fade" },
  };

  // Per-scene B-roll
  let cursor = TITLE_DUR;
  const brollClips: any[] = [];
  params.scenes.forEach((s, i) => {
    const url = params.brollUrls[i];
    if (url) {
      brollClips.push({
        asset: { type: "video", src: url, trim: 0 },
        start: cursor,
        length: s.duration_sec,
        fit: "cover",
        effect: "zoomIn",
        transition: { in: "fade", out: "fade" },
      });
    } else {
      // No B-roll found → fallback to a soft branded slate
      brollClips.push({
        asset: {
          type: "title",
          text: s.visuals || "",
          style: "minimal",
          color: "#fffaf6",
          background: "#0a1120",
          size: "medium",
          position: "center",
        },
        start: cursor,
        length: s.duration_sec,
        transition: { in: "fade", out: "fade" },
      });
    }
    cursor += s.duration_sec;
  });

  // Outro affirmation
  const outroClip = {
    asset: {
      type: "title",
      text: `"${params.affirmation || params.themeTitle}"`,
      style: "minimal",
      color: "#fffaf6",
      background: "#0a1120",
      size: "large",
      position: "center",
    },
    start: cursor,
    length: OUTRO_DUR,
    transition: { in: "fade", out: "fade" },
  };

  const audioTrack = {
    clips: [
      {
        asset: { type: "audio", src: params.narrationMp3Url, volume: 1 },
        // Narration starts after the title card so the room can settle.
        start: TITLE_DUR,
        length: Math.max(totalDuration, 1),
      },
    ],
  };

  const timeline = {
    background: "#0a1120",
    tracks: [
      { clips: [titleClip, ...brollClips, outroClip] },
      audioTrack,
    ],
  };

  const body = {
    timeline,
    output: { format: "mp4", resolution: "hd", aspectRatio: "16:9", fps: 25 },
    callback: params.webhookUrl,
  };

  const r = await fetch(`https://api.shotstack.io/${SHOTSTACK_ENV}/render`, {
    method: "POST",
    headers: {
      "x-api-key": SHOTSTACK_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const respJson = (await r.json()) as ShotstackResp;
  if (!r.ok || !respJson?.success) {
    throw new Error(`Shotstack ${r.status}: ${respJson?.message || JSON.stringify(respJson)}`);
  }
  return respJson.response.id;
};

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
      .select("week_number, theme_title, film_script_2min, signal_metaphor, core_affirmation")
      .eq("week_number", week_number).eq("audience", audience).maybeSingle();
    if (sErr) throw sErr;
    if (!session) return json({ error: "Session not found" }, 404);
    if (!session.film_script_2min) return json({ error: "film_script_2min is empty for this week + audience" }, 400);

    // 1. Storyboard from Gemini (signal_metaphor guides visual direction)
    const scenes = await callGeminiStoryboard(
      session.film_script_2min,
      session.theme_title || "Mindcast",
      session.signal_metaphor
    );

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

    // 4. Pexels B-roll per scene (best-effort — null is fine, Shotstack falls
    //    back to a branded slate for that scene).
    const brollUrls = await Promise.all(
      scenes.map((s) => searchPexelsVideo(s.search_keywords || s.visuals).catch(() => null).then(v => v?.url ?? null))
    );

    // 5. Submit Shotstack render with webhook back to shotstack-webhook fn.
    // SHOTSTACK_WEBHOOK_SECRET (when set) is checked by shotstack-webhook,
    // so unauthenticated callers can't spoof render callbacks.
    let webhookUrl =
      Deno.env.get("SHOTSTACK_WEBHOOK_URL") ||
      `${SUPABASE_URL}/functions/v1/shotstack-webhook`;
    const webhookSecret = Deno.env.get("SHOTSTACK_WEBHOOK_SECRET");
    if (webhookSecret) {
      webhookUrl += `${webhookUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(webhookSecret)}`;
    }
    const renderId = await submitShotstackRender({
      themeTitle: session.theme_title || "Mindcast",
      weekNumber: week_number,
      audience,
      affirmation: session.core_affirmation || "",
      narrationMp3Url: mp3Url,
      scenes,
      brollUrls,
      webhookUrl,
    });

    // 6. Persist render_id + 'processing' status. The webhook will fill
    //    video_mp4_url + flip render_status when the render completes.
    const { error: wErr } = await supa.from("worksheets")
      .upsert({
        week_number,
        audience_type: audience,
        pdf_url: pdfUrl,
        video_url: mp3Url, // legacy: keep MP3 URL accessible here
        render_id: renderId,
        render_status: "processing",
      }, { onConflict: "week_number,audience_type" });
    if (wErr) throw wErr;

    return json({
      ok: true,
      render_id: renderId,
      render_status: "processing",
      storyboard_pdf_url: pdfUrl,
      narration_mp3_url: mp3Url,
      scenes,
    });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
