// trial-unsubscribe — one-click opt-out for trial guests.
//
// Trial guests have no account, so unsubscribe cannot live behind a login.
// The ticket token is the identity: 12 chars from a 31-symbol alphabet is not
// guessable, and the ONLY thing this endpoint can do with it is flip
// marketing_opt_out to true. It reads nothing back, reveals nothing, and is
// idempotent. Public (verify_jwt = false) by design.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const html = (title: string, body: string) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#FFFAF5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFAF5;padding:48px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
  <tr><td style="padding:0 8px 24px;">
    <span style="font-family:Georgia,serif;color:#3585AF;font-size:18px;letter-spacing:2px;">&#9679;)))</span>
    <span style="font-family:Arial,Helvetica,sans-serif;color:#102438;font-size:14px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;">&nbsp;Mindcast</span>
  </td></tr>
  <tr><td style="background:#FFFFFF;border:1px solid #E1E7EF;padding:32px;">
    <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;color:#102438;">${title}</h1>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#102438;">${body}</p>
  </td></tr>
  <tr><td style="padding:20px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:#307191;text-align:center;">
    NOTICE IT, NAME IT, DO IT
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

serve(async (req) => {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();

  if (!token || !/^[A-Z2-9]{12}$/.test(token)) {
    return new Response(html("That link doesn't look right", "Check the link in your email, or reply to it and we'll sort it."), {
      status: 400, headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supa
    .from("trial_tickets")
    .update({ marketing_opt_out: true })
    .eq("token", token);

  if (error) {
    return new Response(html("Something went wrong", "We couldn't update that. Reply to any email from us and we'll remove you by hand."), {
      status: 500, headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Same response whether the token existed or not — never reveal which.
  return new Response(html("You're unsubscribed", "You won't get any more from us. If you ever want to come back, the door's open — mindcast.co.nz."), {
    status: 200, headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
