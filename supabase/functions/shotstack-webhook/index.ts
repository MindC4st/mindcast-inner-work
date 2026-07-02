// shotstack-webhook — receives the Shotstack render-complete callback,
// downloads the finished MP4, mirrors it into the `worksheets` storage
// bucket, and writes the public URL back to the worksheets row that owns
// this render_id.
//
// Shotstack POSTs a JSON body shaped like:
//   { type: "render", id: "<render-id>", status: "done"|"failed", url: "https://..." , data: { ... } }
// (The exact keys vary slightly between stage/prod — we read defensively.)
//
// We mirror the MP4 into our own bucket so the asset persists past
// Shotstack's CDN expiry (renders are deleted after ~24h on free tier).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

// Shotstack cannot sign its callbacks, so only ever mirror files that live on
// Shotstack-owned hosts — otherwise an unauthenticated POST could make us
// publish an arbitrary URL's bytes into the public worksheets bucket.
const isShotstackUrl = (raw: string): boolean => {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    return (
      u.hostname === "cdn.shotstack.io" ||
      u.hostname.endsWith(".shotstack.io") ||
      /^shotstack-api-(v1|stage)-output\.s3(\.|-)[a-z0-9-]+\.amazonaws\.com$/.test(u.hostname)
    );
  } catch {
    return false;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    // Shared-secret gate: generate-session-video appends ?token=<secret> to
    // the callback URL it registers with Shotstack. Enforced when configured.
    const secret = Deno.env.get("SHOTSTACK_WEBHOOK_SECRET");
    if (secret) {
      const token = new URL(req.url).searchParams.get("token");
      if (token !== secret) return json({ error: "Unauthorized" }, 401);
    }

    const payload = await req.json();
    const renderId: string | undefined = payload?.id || payload?.response?.id;
    const status: string | undefined = (payload?.status || payload?.response?.status || "").toLowerCase();
    const mp4Url: string | undefined = payload?.url || payload?.response?.url || payload?.data?.url;

    if (!renderId) return json({ error: "Missing render id" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Server misconfigured" }, 500);
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Find the worksheets row that owns this render.
    const { data: row, error: rowErr } = await supa
      .from("worksheets")
      .select("id, week_number, audience_type")
      .eq("render_id", renderId)
      .maybeSingle();
    if (rowErr) throw rowErr;
    if (!row) return json({ error: `No worksheet for render ${renderId}` }, 404);

    if (status === "failed") {
      await supa.from("worksheets").update({ render_status: "failed" }).eq("id", row.id);
      return json({ ok: true, status: "failed" });
    }

    if (status !== "done" || !mp4Url) {
      // Intermediate status (e.g. "rendering", "saving") — just record it.
      await supa.from("worksheets").update({ render_status: status || "processing" }).eq("id", row.id);
      return json({ ok: true, status });
    }

    if (!isShotstackUrl(mp4Url)) {
      return json({ error: "Refusing to mirror non-Shotstack URL" }, 400);
    }

    // Download Shotstack's MP4, mirror into our bucket.
    const r = await fetch(mp4Url);
    if (!r.ok) throw new Error(`Could not fetch Shotstack MP4: ${r.status}`);
    const bytes = new Uint8Array(await r.arrayBuffer());

    const path = `videos/week-${row.week_number}/${(row.audience_type || "adult").toLowerCase()}/video-${Date.now()}.mp4`;
    const up = await supa.storage.from("worksheets").upload(path, bytes, {
      contentType: "video/mp4",
      upsert: true,
    });
    if (up.error) throw up.error;

    const publicUrl = supa.storage.from("worksheets").getPublicUrl(path).data.publicUrl;

    const { error: updErr } = await supa.from("worksheets")
      .update({ video_mp4_url: publicUrl, render_status: "done" })
      .eq("id", row.id);
    if (updErr) throw updErr;

    return json({ ok: true, video_mp4_url: publicUrl });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
