import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub;

    const { userId: reqUserId, cohortId } = await req.json();
    if (reqUserId !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Fetch all user data
    const [entriesRes, scoresRes, commitmentsRes] = await Promise.all([
      supabase.from("entries").select("*").eq("user_id", userId).eq("cohort_id", cohortId).order("week_number"),
      supabase.from("domain_scores").select("*").eq("user_id", userId).eq("cohort_id", cohortId).order("week_number"),
      supabase.from("commitments").select("*").eq("user_id", userId).eq("cohort_id", cohortId).order("week_number"),
    ]);

    const entries = entriesRes.data || [];
    const scores = scoresRes.data || [];
    const commitments = commitmentsRes.data || [];

    if (entries.length === 0) {
      return new Response(JSON.stringify({ reflection: "You haven't completed any entries yet. Start filling in your weekly worksheets and come back for insights!" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a thoughtful, warm learning companion for a group called Mindcast — a structured weekly podcast discussion group focused on self-growth. Analyse the member's entries with curiosity and care. Be specific, not generic. Reference their actual words. Never be prescriptive. Ask one open question at the end.`;

    const userPrompt = `Here is a member's journal data from their Mindcast term. Please provide a warm, insightful reflection on their journey so far.

ENTRIES (beliefs, reflections, audit notes):
${JSON.stringify(entries.map(e => ({ week: e.week_number, key: e.question_key, answer: e.answer_text })), null, 2)}

DOMAIN SCORES (1-5 across 9 life domains):
${JSON.stringify(scores.map(s => ({ week: s.week_number, domain: s.domain_name, score: s.score })), null, 2)}

COMMITMENTS:
${JSON.stringify(commitments.map(c => ({ week: c.week_number, commitment: c.commitment_text, checkin: c.checkin_sentence })), null, 2)}

Please include:
1. A belief shift summary noting how their thinking has evolved
2. Domain trend observations 
3. Language patterns you notice (recurring themes, words, concerns)
4. Commitment consistency observations
5. A warm, personal reflection paragraph
6. One open question`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const reflection = aiData.choices?.[0]?.message?.content || "Unable to generate reflection.";

    return new Response(JSON.stringify({ reflection }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
