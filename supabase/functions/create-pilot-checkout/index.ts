import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
        full_name: fullName,
        email,
        phone: phone || null,
        age_range: ageRange || null,
        current_work: currentWork || null,
        what_led_you_here: whatLedYouHere || null,
        hoped_outcome: hopedOutcome || null,
        past_achievement: pastAchievement || null,
        current_obstacles: currentObstacles || null,
        confirmed_attendance: confirmedAttendance || false,
        agreed_terms: agreedTerms || false,
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
      success_url: `${req.headers.get("origin")}/pilot?success=true`,
      cancel_url: `${req.headers.get("origin")}/pilot?canceled=true`,
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
