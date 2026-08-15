#!/usr/bin/env node
// rls-smoke.mjs — proves the anonymous role cannot read personal data.
//
//   node scripts/rls-smoke.mjs
//
// Env: SUPABASE_URL, SUPABASE_ANON_KEY (the public pair — nothing secret).
//
// This is the outermost RLS tripwire: every table below holds personal or
// safeguarding data and must return ZERO rows (or an error) to an
// unauthenticated client. A single leaked row fails the run. It complements,
// not replaces, per-role pgTAP tests — but it runs anywhere in seconds and
// catches the classic AI-migration failure mode (table created, RLS forgotten).

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL || !ANON) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_ANON_KEY");
  process.exit(1);
}

const PERSONAL_TABLES = [
  "profiles",
  "households",
  "household_members",
  "check_ins",
  "trial_tickets",
  "roll_events",
  "room_alerts",
  "authorised_collectors",
  "guardian_consents",
  "concession_requests",
  "notification_outbox",
  "attendance_notifications",
  "staff_document_signatures",
  "staff_training_progress",
  "staff_training_responses",
  "staff_compliance_records",
  "membership_subscriptions",
  "lesson_journal",
];

const supa = createClient(URL, ANON);
let failures = 0;

for (const table of PERSONAL_TABLES) {
  const { data, error } = await supa.from(table).select("*").limit(1);
  if (error) {
    // Denied or not visible: exactly what anon should experience.
    console.log(`  PASS  ${table} (error: ${error.code ?? error.message})`);
  } else if ((data ?? []).length === 0) {
    console.log(`  PASS  ${table} (0 rows)`);
  } else {
    console.error(`  FAIL  ${table} — anon read ${data.length} row(s) of personal data`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures} table(s) leak to anon. Fix RLS before anything else.`);
  process.exit(1);
}
console.log("\nAnon leaks: none. RLS smoke passed.");
