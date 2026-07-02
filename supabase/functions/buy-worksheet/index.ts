import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_PRICE = "price_1TagGLEAvaJHDMD4kFa902WP"; // $5 NZD Mindcast Worksheet

const AUDIENCES = ["Adult", "Teen", "Child"];

// Stripe redirects the customer to success_url after payment — only ever
// send them back to an origin we own.
const safeOrigin = (raw: string | null): string => {
  const fallback = "https://mindcast.co.nz";
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    const ok =
      u.hostname === "mindcast.co.nz" ||
      u.hostname.endsWith(".mindcast.co.nz") ||
      u.hostname.endsWith(".lovable.app") ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1";
    return ok ? u.origin : fallback;
  } catch {
    return fallback;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { week_number, audience } = await req.json();
    const week = Number(week_number);
    if (!Number.isInteger(week) || week < 1 || week > 52 || !AUDIENCES.includes(audience)) {
      return new Response(JSON.stringify({ error: "week_number (1-52) and audience (Adult|Teen|Child) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Try to read a custom price from worksheets table if present
    let priceId = DEFAULT_PRICE;
    try {
      const supa = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
      const { data } = await supa.from("worksheets").select("price_nzd").eq("week_number", week).eq("audience_type", audience).maybeSingle();
      // (price_nzd is just informational; we always use the Stripe price for now)
      void data;
    } catch (_) { /* ignore */ }

    // Optional: attach user email if logged in
    let customerEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supa = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
        const { data } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
        customerEmail = data.user?.email ?? undefined;
      } catch (_) { /* guest checkout */ }
    }

    const origin = safeOrigin(req.headers.get("origin"));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${origin}/mindcast-live/lesson/${week}?purchase=success`,
      cancel_url: `${origin}/mindcast-live/lesson/${week}?purchase=cancelled`,
      metadata: { week_number: String(week), audience },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
