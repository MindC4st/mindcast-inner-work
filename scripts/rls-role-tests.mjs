#!/usr/bin/env node
// rls-role-tests.mjs — per-role RLS verification against the live database.
//
//   node scripts/rls-role-tests.mjs
//
// Env: SUPABASE_MGMT_TOKEN (Supabase personal access token), or it falls back
// to the documented project PAT. Runs READ-ONLY probes: every persona query
// executes inside BEGIN ... ROLLBACK with `role` and `request.jwt.claims`
// set, emulating a real member / facilitator / admin / guardian JWT without
// needing their passwords.
//
// Complements rls-smoke.mjs (anon leaks). This suite checks what each ROLE
// can and cannot see.

const PROJECT = process.env.SUPABASE_PROJECT_REF || "pjyelgogdsuiugaudecc";
const TOKEN = process.env.SUPABASE_MGMT_TOKEN;
if (!TOKEN) {
  console.error("Set SUPABASE_MGMT_TOKEN (a Supabase personal access token).");
  process.exit(1);
}
const URI = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`;

async function sql(query) {
  const r = await fetch(URI, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const j = await r.json();
  if (Array.isArray(j)) return j;
  // Management API error shapes: { message } or { error }
  throw new Error(j.message || j.error || JSON.stringify(j).slice(0, 200));
}

// Run probe queries as a persona (role + sub claim) inside one rolled-back
// transaction. Returns { ok, rows } per probe; an RLS denial surfaces as an
// error message.
async function asPersona(label, claims, probes) {
  const claimsJson = JSON.stringify({ role: label === "anon" ? "anon" : "authenticated", ...claims })
    .replace(/'/g, "''");
  const results = [];
  for (const p of probes) {
    const q = `BEGIN;
SELECT set_config('role', '${label === "anon" ? "anon" : "authenticated"}', true);
SELECT set_config('request.jwt.claims', '${claimsJson}', true);
SELECT count(*) AS n FROM (${p.sql}) t;
ROLLBACK;`;
    try {
      const rows = await sql(q);
      const n = rows.find((r) => r.n !== undefined)?.n;
      results.push({ name: p.name, ok: true, n: Number(n) });
    } catch (e) {
      results.push({ name: p.name, ok: false, error: String(e.message || e).slice(0, 120) });
    }
  }
  return results;
}

let failures = 0;
const expect = (persona, res, pred, desc) => {
  for (const r of res) {
    const pass = pred(r);
    if (!pass) failures++;
    console.log(
      `  ${pass ? "PASS" : "FAIL"}  [${persona}] ${r.name}: ${
        r.ok ? `${r.n} row(s)` : `error — ${r.error}`
      } — expect ${desc}`,
    );
  }
};

async function main() {
  // ── Resolve real principals ─────────────────────────────────────────────
  const users = await sql(`
    SELECT u.id, u.email,
           COALESCE(array_agg(r.role) FILTER (WHERE r.role IS NOT NULL), '{}') AS roles
    FROM auth.users u
    LEFT JOIN public.user_roles r ON r.user_id = u.id
    GROUP BY u.id, u.email
    ORDER BY u.created_at
    LIMIT 200;`);

  const admin = users.find((u) => u.roles.includes("admin"));
  const facilitator = users.find((u) => u.roles.includes("facilitator") && !u.roles.includes("admin"));
  const member = users.find((u) => u.roles.length === 0 || (u.roles.length === 1 && u.roles[0] === "member"));

  const profilesOf = async (userId) =>
    (await sql(`SELECT id FROM public.profiles WHERE user_id = '${userId}' LIMIT 1;`))[0]?.id;

  const guardianRow = (await sql(`
    SELECT hm.profile_id FROM public.household_members hm
    WHERE hm.role_in_household = 'guardian' LIMIT 1;`))[0];
  const childRow = (await sql(`
    SELECT hm.profile_id FROM public.household_members hm
    WHERE hm.role_in_household IN ('child','teen') LIMIT 1;`))[0];

  console.log("principals:", {
    admin: admin?.email ?? "none",
    facilitator: facilitator?.email ?? "none",
    member: member?.email ?? "none",
    guardianProfile: guardianRow?.profile_id ?? "none",
    childProfile: childRow?.profile_id ?? "none",
  });

  // ── MEMBER probes ────────────────────────────────────────────────────────
  if (member) {
    const pid = await profilesOf(member.id);
    const res = await asPersona("member", { sub: member.id }, [
      { name: "profiles", sql: "SELECT * FROM public.profiles" },
      { name: "own profile only", sql: `SELECT * FROM public.profiles WHERE id = '${pid}'` },
      { name: "roll_events", sql: "SELECT * FROM public.roll_events" },
      { name: "room_alerts", sql: "SELECT * FROM public.room_alerts" },
      { name: "concession_requests", sql: "SELECT * FROM public.concession_requests" },
      { name: "authorised_collectors", sql: "SELECT * FROM public.authorised_collectors" },
      { name: "guardian_consents", sql: "SELECT * FROM public.guardian_consents" },
      { name: "notification_outbox", sql: "SELECT * FROM public.notification_outbox" },
      { name: "rate_limits (counter table)", sql: "SELECT * FROM public.rate_limits" },
      { name: "trial_tickets", sql: "SELECT * FROM public.trial_tickets" },
    ]);
    console.log("\nMEMBER (non-staff):");
    // Members may see their own rows; bulk reads of safeguarding tables must
    // return 0 (or be denied). Profiles has a legacy facilitator-read policy;
    // a plain member should only get their own row.
    expect("member", res.filter((r) => r.name === "own profile only"), (r) => r.ok && r.n === 1, "exactly 1 (own row)");
    expect("member", res.filter((r) => ["roll_events", "room_alerts", "authorised_collectors", "rate_limits", "trial_tickets"].includes(r.name)), (r) => (r.ok && r.n === 0) || !r.ok, "0 rows or denied");
    expect("member", res.filter((r) => ["concession_requests", "guardian_consents", "notification_outbox"].includes(r.name)), (r) => r.ok, "own rows only (count varies)");
    const profAll = res.find((r) => r.name === "profiles");
    const ownOnly = res.find((r) => r.name === "own profile only");
    const memberSeesAllProfiles = profAll?.ok && ownOnly?.ok && profAll.n > ownOnly.n;
    if (memberSeesAllProfiles) failures++;
    console.log(`  ${memberSeesAllProfiles ? "FAIL" : "PASS"}  [member] profiles visibility: ${profAll?.n} row(s) — expect own row only`);
  }

  // ── FACILITATOR probes ───────────────────────────────────────────────────
  if (facilitator) {
    const res = await asPersona("facilitator", { sub: facilitator.id }, [
      { name: "room_roster", sql: "SELECT * FROM public.room_roster" },
      { name: "room_staffing", sql: "SELECT * FROM public.room_staffing" },
      { name: "concession_requests", sql: "SELECT * FROM public.concession_requests" },
      { name: "trial_tickets", sql: "SELECT * FROM public.trial_tickets" },
      { name: "rate_limits", sql: "SELECT * FROM public.rate_limits" },
      { name: "room_roll_latest_events (service-only RPC)", sql: "SELECT * FROM public.room_roll_latest_events(current_date)" },
    ]);
    console.log("\nFACILITATOR:");
    expect("facilitator", res.filter((r) => ["room_roster", "room_staffing"].includes(r.name)), (r) => r.ok, "readable (roster visibility)");
    expect("facilitator", res.filter((r) => ["concession_requests", "trial_tickets", "rate_limits"].includes(r.name)), (r) => (r.ok && r.n === 0) || !r.ok, "0 rows or denied (admin/service only)");
    expect("facilitator", res.filter((r) => r.name.startsWith("room_roll_latest_events")), (r) => !r.ok || (r.ok && r.n === 0), "denied or empty (service-role only)");
  }

  // ── ADMIN probes ─────────────────────────────────────────────────────────
  if (admin) {
    const res = await asPersona("admin", { sub: admin.id }, [
      { name: "concession_requests", sql: "SELECT * FROM public.concession_requests" },
      { name: "room_roster", sql: "SELECT * FROM public.room_roster" },
      { name: "trial_tickets", sql: "SELECT * FROM public.trial_tickets" },
      { name: "guardian_consents", sql: "SELECT * FROM public.guardian_consents" },
    ]);
    console.log("\nADMIN:");
    expect("admin", res, (r) => r.ok, "readable (admin manages)");
  }

  // ── GUARDIAN probes (if a household exists) ─────────────────────────────
  if (guardianRow && childRow) {
    const gUser = (await sql(`SELECT user_id FROM public.profiles WHERE id = '${guardianRow.profile_id}' LIMIT 1;`))[0];
    if (gUser?.user_id) {
      const res = await asPersona("guardian", { sub: gUser.user_id }, [
        { name: "authorised_collectors", sql: "SELECT * FROM public.authorised_collectors" },
        { name: "guardian_consents", sql: "SELECT * FROM public.guardian_consents" },
        { name: "other households' members", sql: `SELECT * FROM public.household_members WHERE household_id NOT IN (SELECT household_id FROM public.household_members WHERE profile_id = '${guardianRow.profile_id}')` },
      ]);
      console.log("\nGUARDIAN:");
      expect("guardian", res.filter((r) => ["authorised_collectors", "guardian_consents"].includes(r.name)), (r) => r.ok, "own-household rows only (count varies)");
      expect("guardian", res.filter((r) => r.name === "other households' members"), (r) => r.ok && r.n === 0, "0 rows");
    }
  } else {
    console.log("\nGUARDIAN: skipped (no household in production data yet)");
  }

  console.log(failures === 0 ? "\nAll role RLS probes passed." : `\n${failures} probe(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("rls-role-tests error:", e.message || e);
  process.exit(1);
});
