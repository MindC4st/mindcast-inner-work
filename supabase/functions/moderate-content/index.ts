import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

const BLOCKED_WORDS = [
  "fuck","shit","cunt","bitch","asshole","bastard","piss","wank",
  "nigger","faggot","retard","slut","whore","dick","cock","pussy"
];

function basicProfanityCheck(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some(w => lower.includes(w));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, context = "community success story" } = await req.json();

    if (basicProfanityCheck(text)) {
      return new Response(JSON.stringify({
        approved: false,
        flagged: true,
        reason: "Contains profanity",
        requires_manual_review: true,
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // AI moderation via the Lovable AI Gateway. (Previously this POSTed a
    // `prompt` field to the ai-insights function, which ignores it — so the
    // AI check never ran and everything fell through to the word list.)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      const systemPrompt = `You are a content moderator for a community wellness platform called Mindcast. Members share personal success stories about goals they set the previous week. Review the submission for:
1. Profanity or offensive language
2. Personal attacks or insults directed at anyone
3. Private personal information (full names, addresses, phone numbers)
4. Harassment, threats, or hate speech
5. Content completely unrelated to personal growth or goal-setting (spam, advertising)

A submission is acceptable if it is a genuine personal success story, even if it involves difficult emotions.

Reply ONLY with valid JSON: {"safe": true/false, "reason": "brief reason if not safe, null if safe", "requires_manual": true/false}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Context: ${context}\nSubmission: "${text}"` },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          const result = JSON.parse(match[0]);
          return new Response(JSON.stringify({
            approved: result.safe === true && !result.requires_manual,
            flagged: result.safe !== true,
            reason: result.reason || null,
            requires_manual_review: result.requires_manual === true,
          }), { headers: { ...corsHeaders, "content-type": "application/json" } });
        }
      } else {
        console.error("moderate-content: AI gateway error", response.status);
      }
    } else {
      console.warn("moderate-content: LOVABLE_API_KEY not set — word-list check only");
    }

    // Fallback: auto-approve if AI unavailable but no profanity detected
    return new Response(JSON.stringify({
      approved: true,
      flagged: false,
      reason: null,
      requires_manual_review: false,
    }), { headers: { ...corsHeaders, "content-type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({
      approved: false,
      flagged: false,
      reason: "Moderation service unavailable",
      requires_manual_review: true,
    }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  }
});
