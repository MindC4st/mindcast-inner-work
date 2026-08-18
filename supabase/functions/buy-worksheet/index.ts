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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userResult, error: userError } = await supa.auth.getUser();
    if (userError || !userResult.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profileError } = await supa
      .from("profiles")
      .select("id, email")
      .eq("user_id", userResult.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { week_number, audience } = await req.json();
    const week = Number(week_number);
    if (!Number.isInteger(week) || week < 1 || week > 52 || !AUDIENCES.includes(audience)) {
      return new Response(JSON.stringify({ error: "week_number (1-52) and audience (Adult|Teen|Child) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    const priceId = DEFAULT_PRICE;
    const customerEmail = profile.email || userResult.user.email || undefined;

    const origin = safeOrigin(req.headers.get("origin"));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${origin}/mindcast-live/lesson/${week}?purchase=success`,
      cancel_url: `${origin}/mindcast-live/lesson/${week}?purchase=cancelled`,
      metadata: {
        kind: "shop",
        profile_id: profile.id,
        product_slug: `worksheet-week-${week}-${String(audience).toLowerCase()}`,
        product_name: `Printed ${audience} worksheet · Week ${week}`,
        quantity: "1",
        unit_price_cents: "500",
        fulfilment: "counter",
        order_note: `Worksheet for Week ${week} (${audience})`,
        week_number: String(week),
        audience,
      },
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
