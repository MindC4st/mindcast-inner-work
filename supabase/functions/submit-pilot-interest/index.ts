// submit-pilot-interest — Edge function for pilot interest registrations
// Public, no auth. Stores email in pilot_interest table.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { email?: string; age_band?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  const ageBand = body.age_band || "after_close";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Valid email required" }, 400);
  }

  const validAgeBands = ["under_30", "over_45", "after_close"];
  if (!validAgeBands.includes(ageBand)) {
    return json({ error: "Invalid age band" }, 400);
  }

  const supa = createClient(SUPABASE_URL, SERVICE_KEY);

  const { error } = await supa.from("pilot_interest").upsert(
    { email, age_band: ageBand },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Insert error:", error);
    return json({ error: "Failed to save interest" }, 500);
  }

  return json({ ok: true });
});