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

    // Use Lovable AI for moderation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-insights`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `You are a content moderator for a community wellness platform called Mindcast. Members share personal success stories about goals they set the previous week. Review the following submission for:
1. Profanity or offensive language
2. Personal attacks or insults directed at anyone
3. Private personal information (full names, addresses, phone numbers)
4. Harassment, threats, or hate speech
5. Content completely unrelated to personal growth or goal-setting (spam, advertising)

A submission is acceptable if it is a genuine personal success story, even if it involves difficult emotions.

Reply ONLY with valid JSON: {"safe": true/false, "reason": "brief reason if not safe, null if safe", "requires_manual": true/false}

Context: ${context}
Submission: "${text}"`,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const raw = data.content || data.text || JSON.stringify(data);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        return new Response(JSON.stringify({
          approved: result.safe && !result.requires_manual,
          flagged: !result.safe,
          reason: result.reason || null,
          requires_manual_review: result.requires_manual || false,
        }), { headers: { ...corsHeaders, "content-type": "application/json" } });
      }
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
