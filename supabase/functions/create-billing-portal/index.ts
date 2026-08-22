// create-billing-portal — opens the Stripe customer billing portal so a member
// can manage their own membership (update card, cancel, view invoices). A
// `flow: "cancel"` request deep-links to Stripe's hosted cancellation confirm,
// making the public two-click promise deterministic.
//
// Authenticated (verify_jwt = true). We look up the caller's stripe_customer_id
// from their profile and return a portal session URL.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
//      STRIPE_SECRET_KEY

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

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
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);

    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes, error: userErr } = await anon.auth.getUser();
    if (userErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const requestedFlow = body?.flow === "cancel" ? "cancel" : "manage";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userRes.user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return json({ error: "No billing account found" }, 404);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const origin = safeOrigin(req.headers.get("origin"));
    const params: Stripe.BillingPortal.SessionCreateParams = {
      customer: profile.stripe_customer_id,
      return_url: `${origin}/portal/billing`,
    };

    if (requestedFlow === "cancel") {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "all",
        limit: 100,
      });
      const cancellable = subscriptions.data.filter((subscription) =>
        !["canceled", "incomplete_expired"].includes(subscription.status)
      );
      if (cancellable.length === 0) {
        return json({ error: "No active membership was found to cancel." }, 404);
      }
      if (cancellable.length > 1) {
        return json({
          error: "More than one billing plan is active. Open Manage billing to choose the right plan.",
          code: "multiple_subscriptions",
        }, 409);
      }

      params.flow_data = {
        type: "subscription_cancel",
        subscription_cancel: { subscription: cancellable[0].id },
        after_completion: {
          type: "redirect",
          redirect: { return_url: `${origin}/portal/billing?membership=cancelled` },
        },
      };
    }

    const portal = await stripe.billingPortal.sessions.create(params);

    return json({ url: portal.url });
  } catch (e: any) {
    console.error("create-billing-portal:", e?.message ?? e);
    return json({ error: "We couldn't open billing. Please try again." }, 500);
  }
});
