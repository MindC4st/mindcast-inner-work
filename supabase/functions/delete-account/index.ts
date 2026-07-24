// delete-account — lets a member permanently delete their own account + data.
//
// Required by app-store policies and by the privacy policy we publish. The
// caller is authenticated (JWT); we cancel any active Stripe subscription (so a
// deleted member is never charged again), delete their personal data, then
// delete the auth user itself.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });

// Personal-data tables to clear, as (table, owner column). Best-effort: a
// missing table or column is ignored so one gap can't block deletion.
const OWNED: Array<[string, "profile" | "user" | "member"]> = [
  ["lesson_journal", "profile"],
  ["workbook_entries", "profile"],
  ["teen_workbook_entries", "profile"],
  ["kids_workbook_entries", "profile"],
  ["check_ins", "profile"],
  ["session_responses", "user"],
  ["entries", "user"],
  ["bookmark_responses", "user"],
  ["implementation_checkins", "user"],
  ["implementation_goals", "member"],
  ["unlocked_lessons", "user"],
  ["lesson_completions", "user"],
  ["push_subscriptions", "user"],
];

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
    const user = userRes.user;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: profile } = await admin
      .from("profiles").select("id, stripe_customer_id").eq("user_id", user.id).maybeSingle();
    const profileId = profile?.id ?? null;

    // 1. Cancel any active Stripe subscriptions so a deleted member is never
    //    charged again.
    try {
      const key = Deno.env.get("STRIPE_SECRET_KEY");
      if (key && profile?.stripe_customer_id) {
        const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });
        const subs = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: "all", limit: 100 });
        for (const s of subs.data) {
          if (s.status !== "canceled") await stripe.subscriptions.cancel(s.id).catch(() => {});
        }
      }
    } catch { /* billing cancel is best-effort; deletion continues */ }

    // 2. Delete personal data (best-effort per table).
    for (const [table, kind] of OWNED) {
      const col = kind === "profile" ? "profile_id" : kind === "member" ? "member_id" : "user_id";
      const val = kind === "profile" ? profileId : user.id;
      if (!val) continue;
      await admin.from(table).delete().eq(col, val).then(() => {}, () => {});
    }

    // 3. Delete the profile row (cascades anything keyed to it), then the auth user.
    if (profileId) await admin.from("profiles").delete().eq("id", profileId).then(() => {}, () => {});
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) return json({ error: `Could not delete account: ${delErr.message}` }, 500);

    return json({ ok: true });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
