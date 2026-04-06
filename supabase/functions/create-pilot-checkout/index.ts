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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { firstName, lastName, email, phone, canAttendTuesdays } = await req.json();

    if (!firstName || !lastName || !email) {
      throw new Error("First name, last name, and email are required");
    }

    // Check remaining spots
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { count } = await supabaseAdmin
      .from("pilot_registrations")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid");

    const spotsRemaining = 15 - (count || 0);
    if (spotsRemaining <= 0) {
      throw new Error("All pilot spots have been filled");
    }

    // Get user if authenticated
    let userId = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userId = data.user?.id || null;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create registration record
    const { data: registration, error: regError } = await supabaseAdmin
      .from("pilot_registrations")
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        can_attend_tuesdays: canAttendTuesdays,
        payment_status: "pending",
      })
      .select()
      .single();

    if (regError) throw new Error(regError.message);

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
        registration_id: registration.id,
        pilot: "founding",
      },
    });

    // Update registration with stripe session id
    await supabaseAdmin
      .from("pilot_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", registration.id);

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
