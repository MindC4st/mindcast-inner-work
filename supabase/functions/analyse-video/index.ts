import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

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
  if (!captionMatch) return { transcript: `No transcript found for: ${title}`, title };

  const tracks = JSON.parse(captionMatch[1]);
  const track = tracks.find((t: any) => t.languageCode?.startsWith("en")) || tracks[0];
  if (!track) return { transcript: `No English transcript for: ${title}`, title };

  const captionRes = await fetch(track.baseUrl);
  const xml = await captionRes.text();
  const transcript = xml
    .replace(/<[^>]*>/g, " ")
    .replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();

  return { transcript: transcript.slice(0, 10000), title };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.slice("Bearer ".length),
    );
    if (userError || !userResult.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const { data: role, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userResult.user.id)
      .in("role", ["facilitator", "admin"])
      .limit(1)
      .maybeSingle();
    if (roleError) throw roleError;
    if (!role) {
      return new Response(JSON.stringify({ error: "Staff authorisation required" }), {
        status: 403,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const session_id = typeof body.session_id === "string" ? body.session_id : null;
    const video_url = typeof body.video_url === "string" ? body.video_url.trim() : "";
    const requestedAgeGroup = typeof body.age_group === "string" ? body.age_group.toLowerCase() : "adult";
    const age_group = ["adult", "teen", "child"].includes(requestedAgeGroup)
      ? requestedAgeGroup
      : "adult";
    if (!video_url || !extractVideoId(video_url)) {
      return new Response(JSON.stringify({ error: "A valid YouTube URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const { transcript, title } = await fetchTranscript(video_url);

    const ageVoice: Record<string, string> = {
      adult: "Thoughtful adults 18+. Questions can explore complexity, contradiction, and lived experience. Be direct and substantive.",
      teen: "Teenagers 13–24. Keep questions honest and grounded. Avoid being preachy. Connect to identity, relationships, social pressure, and finding their path. No condescension.",
      child: "Children 6–12. Simple language. Concrete examples. Connect to feelings, friendships, family, and fairness. Warm and curious tone.",
    };

    const systemPrompt = `You are the Mindcast session facilitator creating a weekly reflection workbook. Mindcast is a secular community gathering built around curated videos and personal reflection.

The workbook template has these sections:
1. Arriving word (one word for how they arrived)
2. First impression (what caught their attention)
3. Key idea (the one idea that landed most)
4. Question 1 — specific to this video's content
5. Question 2 — connecting the video's ideas to their personal life
6. Question 3 — about action, change, or decision
7. Personal application (how could this apply to their life this week?)
8. Weekly goal
9. Action step
10. Leaving word

Your job: generate questions 4, 5, and 6 that are IMPOSSIBLE to answer without having watched THIS specific video. They must reference specific themes, ideas, moments, or phrases from the content.

Audience: ${ageVoice[age_group] || ageVoice.adult}

Rules:
- Questions must be open-ended (not yes/no)
- Questions must be specific to this video — not generic
- Do not repeat ideas across questions
- Warm and curious tone — not academic or interrogative
- Also generate: session_title (punchy, 3–6 words), key_idea_prompt (a frame to help them identify their takeaway), application_prompt (a frame for the application section)

Return ONLY valid JSON:
{
  "session_title": "...",
  "key_idea_prompt": "...",
  "question_1": "...",
  "question_2": "...",
  "question_3": "...",
  "application_prompt": "..."
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Video URL: ${video_url}\n\nTranscript:\n${transcript}\n\nGenerate the workbook questions.` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.choices?.[0]?.message?.content || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON");
    const questions = JSON.parse(jsonMatch[0]);

    if (session_id) {
      const { error: updateError } = await supabaseAdmin.from("sessions").update({
        video_title: title,
        title: questions.session_title || title,
        video_transcript: transcript,
        ai_questions: questions,
      }).eq("id", session_id);
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ questions, video_title: title }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("analyse-video error:", err);
    return new Response(JSON.stringify({ error: "Video analysis failed" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
