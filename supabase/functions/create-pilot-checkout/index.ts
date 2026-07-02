import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stripe redirects the customer back to these URLs after checkout — only
// ever send them to an origin we own.
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

const clip = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const {
      fullName, email, phone,
      ageRange, currentWork, whatLedYouHere,
      hopedOutcome, pastAchievement, currentObstacles,
      confirmedAttendance, agreedTerms,
    } = body;

    if (!fullName || !email) {
      throw new Error("Full name and email are required");
    }
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("A valid email address is required");
    }

    // Check remaining spots
    const { count } = await supabaseAdmin
      .from("pilot_applications")
      .select("*", { count: "exact", head: true })
      .eq("application_status", "paid");

    const spotsRemaining = 15 - (count || 0);
    if (spotsRemaining <= 0) {
      throw new Error("All pilot spots have been filled");
    }

    // Save application to pilot_applications
    const { data: application, error: appError } = await supabaseAdmin
      .from("pilot_applications")
      .insert({
        full_name: clip(fullName, 200),
        email: email.trim().toLowerCase(),
        phone: clip(phone, 40),
        age_range: clip(ageRange, 40),
        current_work: clip(currentWork, 2000),
        what_led_you_here: clip(whatLedYouHere, 4000),
        hoped_outcome: clip(hopedOutcome, 4000),
        past_achievement: clip(pastAchievement, 4000),
        current_obstacles: clip(currentObstacles, 4000),
        confirmed_attendance: confirmedAttendance === true,
        agreed_terms: agreedTerms === true,
        application_status: "pending_payment",
      })
      .select()
      .single();

    if (appError) throw new Error(appError.message);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: "price_1TJ5p7EAvaJHDMD4hBGLHXbn",
          quantity: 1,
        },
      ],
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${safeOrigin(req.headers.get("origin"))}/pilot?success=true`,
      cancel_url: `${safeOrigin(req.headers.get("origin"))}/pilot?canceled=true`,
      metadata: {
        application_id: application.id,
        pilot: "founding",
      },
    });

    // Update application with stripe session id
    await supabaseAdmin
      .from("pilot_applications")
      .update({ stripe_session_id: session.id })
      .eq("id", application.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
