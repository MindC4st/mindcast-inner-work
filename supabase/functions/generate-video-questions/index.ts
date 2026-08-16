// generate-video-questions — transcript → two theme-tied reflective questions
// POST { week_number, audience }  →  fetches the YouTube transcript for the
// week's video, generates exactly TWO open-ended reflective questions tied to
// the week's theme, and stores them (plus the transcript) on the lesson row.
//
// The questions are shown under the video on the facilitator slide and are
// answered in the digital journal + printable worksheet. Staff-only: this
// spends AI credits and writes with the service-role key.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Pull the caption track straight off the YouTube watch page (same approach as
// analyse-video) so we don't need a YouTube Data API key.
async function fetchTranscript(videoUrl: string): Promise<{ transcript: string; title: string }> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
  });
  const html = await response.text();

  const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
  const title = titleMatch ? titleMatch[1] : "Untitled";

  const captionMatch = html.match(/"captionTracks":(\[.*?\])/);
  if (!captionMatch) return { transcript: "", title };

  const tracks = JSON.parse(captionMatch[1]);
  const track = tracks.find((t: any) => t.languageCode?.startsWith("en")) || tracks[0];
  if (!track) return { transcript: "", title };

  const captionRes = await fetch(track.baseUrl);
  const xml = await captionRes.text();
  const transcript = xml
    .replace(/<[^>]*>/g, " ")
    .replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();

  return { transcript: transcript.slice(0, 12000), title };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // --- Authorisation (staff-only) ------------------------------------------
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.replace("Bearer ", "");
  const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .in("role", ["facilitator", "admin"])
    .maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Facilitators only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // -------------------------------------------------------------------------

  try {
    const { week_number, audience = "Adult", transcript: providedTranscript } = await req.json();
    if (!week_number || typeof week_number !== "number") {
      return new Response(JSON.stringify({ error: "week_number is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lesson, error: lessonError } = await supabase
      .from("mindcast_live_sessions")
      .select("*")
      .eq("week_number", week_number)
      .eq("audience", audience)
      .maybeSingle();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: `Lesson not found for week ${week_number} (${audience})` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!lesson.video_link) {
      return new Response(JSON.stringify({ error: "No video link set for this lesson" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Transcript — a pasted one wins, else reuse a stored one, else fetch.
    let transcript = (lesson.video_transcript || "").trim();
    if (typeof providedTranscript === "string" && providedTranscript.trim()) {
      transcript = providedTranscript.trim();
      // Persist the pasted transcript so the next generation (or the lesson
      // editor) reuses it without needing the YouTube caption fetch.
      await supabase
        .from("mindcast_live_sessions")
        .update({ video_transcript: transcript })
        .eq("week_number", week_number)
        .eq("audience", audience);
    }
    let videoTitle = lesson.video_description || "";
    if (!transcript) {
      const fetched = await fetchTranscript(lesson.video_link);
      transcript = fetched.transcript;
      videoTitle = fetched.title || videoTitle;
    }
    if (!transcript) {
      return new Response(
        JSON.stringify({ error: "No transcript available for this video — paste one in the lesson editor and try again." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Generate exactly two theme-tied questions.
    const ageVoice: Record<string, string> = {
      Adult: "Thoughtful adults 18+. Questions can explore complexity, contradiction, and lived experience. Be direct and substantive.",
      Teen: "Teenagers 13-24. Keep questions honest and grounded. Avoid being preachy. Connect to identity, relationships, social pressure, and finding their path. No condescension.",
      Child: "Children 6-12. Simple language. Concrete examples. Connect to feelings, friendships, family, and fairness. Warm and curious tone.",
    };

    const systemPrompt = `You are the Mindcast session facilitator. Mindcast is a secular community gathering built around curated videos and personal reflection — Notice it. Name it. Do it.

This week's session:
- Phase: ${lesson.phase_name || ""}
- Theme: ${lesson.theme_title || ""}
- Session title: ${lesson.session_title || ""}
- The Signal (week's metaphor): ${lesson.signal_metaphor || ""}
- Core concept: ${(lesson.core_concept || "").slice(0, 600)}

Your job: generate EXACTLY TWO reflective questions that members answer WHILE watching the video, so they engage actively instead of consuming passively.

Audience: ${ageVoice[audience] || ageVoice.Adult}

Rules:
- Question 1 must be answerable from the video itself — it references a specific idea, moment, or phrase from the transcript.
- Question 2 must connect the video's idea to the member's own life this week (the theme in action).
- Both questions must tie back to the week's theme ("${lesson.theme_title || ""}").
- Open-ended only (no yes/no). Warm and curious, not academic.
- Each question under 30 words.

Return ONLY valid JSON:
{
  "question_1": "...",
  "question_2": "..."
}`;

    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!DEEPSEEK_API_KEY && !GOOGLE_AI_API_KEY) {
      throw new Error("Neither DEEPSEEK_API_KEY nor GOOGLE_AI_API_KEY is configured");
    }

    const userContent = `Video title: ${videoTitle}\n\nTranscript:\n${transcript}\n\nGenerate the two reflective questions.`;

    // ── Generation with resilience ─────────────────────────────────────────
    // DeepSeek first (retry once on transient failures). DeepSeek's output
    // content-inspection (data_inspection_failed) rejects some perfectly
    // legitimate Mindcast transcripts — that is a hard no, not a transient
    // fault, so it goes straight to the Gemini fallback instead of retrying.
    let raw = "";
    let usedModel = "";
    const failures: string[] = [];

    const tryDeepSeek = async (): Promise<boolean> => {
      if (!DEEPSEEK_API_KEY) return false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
              ],
              response_format: { type: "json_object" },
              temperature: 0.7,
              max_tokens: 512,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const content = data?.choices?.[0]?.message?.content || "";
            if (content) {
              raw = content;
              usedModel = "deepseek-chat";
              return true;
            }
            failures.push("deepseek: empty completion");
          } else {
            const body = await res.text();
            const inspectionFailed = body.includes("data_inspection_failed");
            failures.push(`deepseek (${res.status}): ${body.slice(0, 180)}`);
            // Content moderation won't change its mind on retry.
            if (inspectionFailed) return false;
            if (res.status >= 400 && res.status < 500 && res.status !== 429) return false;
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          }
        } catch (e) {
          failures.push(`deepseek: ${String(e).slice(0, 120)}`);
          await new Promise((r) => setTimeout(r, 800));
        }
      }
      return false;
    };

    const tryGemini = async (): Promise<boolean> => {
      if (!GOOGLE_AI_API_KEY) return false;
      // Newest first; fall down the list if a model name has rotated out.
      for (const model of ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: userContent }] }],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.7,
                  maxOutputTokens: 512,
                },
              }),
            },
          );
          if (!res.ok) {
            const body = await res.text();
            failures.push(`${model} (${res.status}): ${body.slice(0, 180)}`);
            if (res.status === 404) continue; // model name rotated; try next
            if (res.status === 429) { await new Promise((r) => setTimeout(r, 1200)); continue; }
            return false;
          }
          const data = await res.json();
          const content = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
          if (content) {
            raw = content;
            usedModel = model;
            return true;
          }
          failures.push(`${model}: empty completion`);
        } catch (e) {
          failures.push(`${model}: ${String(e).slice(0, 120)}`);
        }
      }
      return false;
    };

    const ok = (await tryDeepSeek()) || (await tryGemini());
    if (!ok) {
      return new Response(
        JSON.stringify({
          error: "AI generation failed on every provider",
          detail: failures.slice(0, 4),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`${usedModel} returned no parseable questions`);
    const parsed = JSON.parse(jsonMatch[0]);
    const q1 = (parsed.question_1 || "").trim();
    const q2 = (parsed.question_2 || "").trim();
    if (!q1 || !q2) throw new Error(`${usedModel} returned fewer than two questions`);

    // 3. Store transcript + questions on the lesson row.
    const { error: updateError } = await supabase
      .from("mindcast_live_sessions")
      .update({
        video_transcript: transcript,
        video_question_1: q1,
        video_question_2: q2,
      })
      .eq("week_number", week_number)
      .eq("audience", audience);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Could not save questions", detail: updateError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        week_number,
        audience,
        model: usedModel,
        video_title: videoTitle,
        video_transcript: transcript,
        video_question_1: q1,
        video_question_2: q2,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-video-questions error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
