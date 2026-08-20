import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "content-type": "application/json" } });

const BLOCKED_WORDS = [
  "fuck", "shit", "cunt", "bitch", "asshole", "bastard", "piss", "wank",
  "nigger", "faggot", "retard", "slut", "whore", "dick", "cock", "pussy",
];

function basicProfanityCheck(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((w) => lower.includes(w));
}

// Fail closed: when no screener can run, the submission is HELD for a human,
// never auto-approved. The facilitator's pending queue is the safety net.
const holdForReview = (reason: string) =>
  json({ approved: false, flagged: true, reason, requires_manual_review: true });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, context = "live session response" } = await req.json();
    if (typeof text !== "string" || text.trim().length === 0) {
      return holdForReview("Empty submission");
    }

    if (basicProfanityCheck(text)) {
      return json({ approved: false, flagged: true, reason: "Contains profanity", requires_manual_review: true });
    }

    // AI moderation via Gemini (same key as the metaphor-video pipeline).
    const GOOGLE_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (GOOGLE_KEY) {
      const model = Deno.env.get("GEMINI_TEXT_MODEL") || "gemini-2.5-flash";
      const systemPrompt = `You are a content moderator for a community wellness platform called Mindcast. Members submit short responses during live sessions (reflections, activity answers, word-cloud words). Review the submission for:
1. Threats of violence or harm to self or others — ALWAYS flag these
2. Profanity or offensive language
3. Personal attacks or insults directed at anyone
4. Private personal information (full names, addresses, phone numbers)
5. Harassment or hate speech
6. Sexual content involving minors — ALWAYS flag

A submission is acceptable if it is a genuine personal reflection, even if it involves difficult emotions. Mentioning a struggle is not the same as a threat.

Reply ONLY with valid JSON: {"safe": true/false, "reason": "brief reason if not safe, null if safe", "requires_manual": true/false}`;

      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_KEY}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `Context: ${context}\nSubmission: "${text}"` }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0, responseMimeType: "application/json" },
            }),
          },
        );
        if (r.ok) {
          const data = await r.json();
          const raw = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            const result = JSON.parse(match[0]);
            return json({
              approved: result.safe === true && !result.requires_manual,
              flagged: result.safe !== true,
              reason: result.reason || null,
              requires_manual_review: result.requires_manual === true || result.safe !== true,
            });
          }
        } else {
          console.error("moderate-content: Gemini error", r.status);
        }
      } catch (e) {
        console.error("moderate-content: Gemini call failed", e);
      }
      // Gemini configured but unusable — do NOT fall through to auto-approve.
      return holdForReview("AI screener unavailable — held for human review");
    }

    // Legacy path (kept for parity): Lovable AI Gateway if its key is present.
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a content moderator. Reply ONLY with valid JSON: {\"safe\": true/false, \"reason\": string|null, \"requires_manual\": true/false}" },
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
          return json({
            approved: result.safe === true && !result.requires_manual,
            flagged: result.safe !== true,
            reason: result.reason || null,
            requires_manual_review: result.requires_manual === true || result.safe !== true,
          });
        }
      }
      return holdForReview("AI screener unavailable — held for human review");
    }

    // No screener configured at all — hold for a human, never auto-approve.
    return holdForReview("No moderation backend configured — held for human review");
  } catch (err) {
    console.error("moderate-content: unhandled error", err);
    return holdForReview("Moderation service unavailable");
  }
});
