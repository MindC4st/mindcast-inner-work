# Overhaul — senior pass, August 2026

Branch: `overhaul/senior-pass`. Eleven commits, each one concern. This file is
the honest ledger: what changed and why, what was wrong in prior work, the
creative calls, what was deliberately left alone, and what comes next.

---

## What changed and why

### Safeguarding (the bulk of the pass, on purpose)

- **Room roll system** (`20260819110000`, `/facilitate/roll/:room`). The child
  safety invariants live in Postgres, not React: the event log is append-only
  (UPDATE/DELETE blocked by trigger — corrections are new events referencing
  the original); a departure **cannot** be recorded without a reason, and
  reasons that involve a person cannot be recorded without the person (CHECK
  constraints — "left early" is structurally impossible); `close_room()`
  raises until every signed-in child has a terminal event. Rolls are readable
  only by facilitators rostered to that room, the Safeguarding Lead and
  admins (`can_access_room_roll`), so an adult-room facilitator cannot browse
  the kids roll.
- **Offline-first roll UI**. Every action queues locally with a client uuid
  and the true `occurred_at`, then flushes idempotently
  (`client_event_id` unique). Venue wifi failing does not stop the room; a
  printable roll (one tap) is the paper fallback. Closing the room requires a
  connection because the reconciliation check must run server-side — stated
  on the button, not hidden.
- **Two-layer notifications**. Layer 1: `room_alerts` + realtime to the
  adult-room facilitator's open device (members' phones are away — a push to
  a parent mid-session is theatre). Layer 2: `notification_outbox` drained by
  the `notify-outbox` function (Resend adapter). The layer is
  channel-agnostic: `profiles.notify_channel` exists now; push is a new
  adapter, not a rewrite. Guardian emails carry what/when/who-with, never
  another child's name; a routine collection reads calmly; an unaccompanied
  departure says a call is coming.
- **Kiosk → roll wiring**. `door-scan` admit writes `signed_in` (expected)
  roll events for teen/child admits. Failures there log and never block entry.
- **Age gating** (`20260819130000`, Onboarding rewrite). Previously anyone
  could self-select any age group with no DOB. Now: DOB required; under-13s
  cannot self-register (routed to guardian/household); 13–17s record guardian
  consent (`guardian_consents`, revocable) before the account completes.
- **Trial under-18 consent**. `/try` and `issue-trial-ticket` require and
  record guardian consent when any under-18 is on the ticket.
- **Welcome wall consent**. `check_ins.wall_hidden` is resolved from
  guardian consent + opt-out **at write time** by the service-role check-in
  paths, so revocation is honoured on the next scan. Minor rooms project a
  first name only, even if the stored display name carries more.

### Commercial

- **`/membership` rebuilt** from a "coming soon" shell into the charter page:
  what you are joining before any price; the trial pass in the same grid as
  the paid tiers; concession presented as a tier with a one-tap request and
  **no explanation field** — the `concession_requests` schema has no reason
  column, so a UI that asked would have nowhere to put the answer; the
  includes/excludes table; cancellation stated before anyone pays. No
  countdowns, no spots-left, no strikethrough anchors, no steering badges.
- **Annual report counters** (`annual_report_counters()`): trial passes
  issued/redeemed and concession places active, aggregate-only, admin-only —
  built now so the number exists when the charter needs it published.

### Operations

- **Notion document sync** (`scripts/notion-sync-documents.mjs`). One-way,
  idempotent, rate-limited, paginated. Version-aware: newer Notion versions
  snapshot the old body to `staff_document_versions` then update; an app copy
  that is ahead (or a same-version content conflict with a built document)
  gets `sync_flag='manual_review'` and is **not** touched. First live run:
  100 created, 1 updated, 5 correctly flagged (including MC-TRN-001, whose
  built version differs). Charter, Brand Guidelines, HR, safeguarding,
  security and finance policies are now present and assignable through the
  existing staff_documents/signatures flow.
- **Operations handbook** (`/admin/handbook`, printable from the same
  source). Admin handbook (door, trial passes, rolls, walls, desk, failure
  modes — every section states its fallback) and facilitator guide (loading
  the week, flow and timings, distress and escalation, when to stop, who to
  call). Written for the nervous volunteer, not for us.

### Engineering

- **Env validation at boot** (`src/lib/env.ts`, zod): missing Supabase config
  fails visibly in the page at startup instead of as an opaque network error.
- **CI** (`.github/workflows/ci.yml`): typecheck, lint, 194 unit tests,
  build, and a grep proving `service_role` never appears in the built bundle
  (verified in `dist/`, per the brief — not by reading source).
- **RLS smoke test** (`scripts/rls-smoke.mjs`): 18 personal-data tables
  probed as anon against production — zero leaks.
- **Lint to zero errors** by scoping ESLint correctly: Deno edge functions
  and the generated types file are not lintable with the browser config and
  were producing 54 of the 55 errors; `tailwind.config.ts` require() fixed.
- Supabase types regenerated after every migration; all new UI is strictly
  typed against them.

### Brand

- Retired signal-bar assets deleted; the old `NOTICE. NAME. REWIRE.` purged
  from `docs/IMAGE_GUIDELINES.md` (the only live instance left —
  curriculum copy using "rewire" as a verb is language, not the tagline, and
  was left alone).
- **The ripple exists now** (`src/components/brand/Ripple.tsx` + `mc-ripple`
  keyframes): a filled point, then arcs expanding and fading. Used on
  /membership, the welcome walls and the handbook; the email marker variant
  (`●)))`) is in the shared email layout inside `notify-outbox`.

---

## What prior work got wrong (and what was done about it)

1. **No age gating at all.** Onboarding let a nine-year-old register as an
   adult. Fixed in code (above), not just noted.
2. **The welcome wall was a dashboard.** A 6xl attendance counter ("with us
   tonight"), a 4-column card grid, a QR footer — and no consent filtering
   whatsoever: every check-in name was projected. Rebuilt as three per-room
   walls, consent-gated at write time, counters removed.
3. **Trial tickets ignored minors.** Guests could be listed as Child/Teen
   with no guardian consent anywhere. Fixed at issuance and at the wall.
4. **`profiles.is_admin` still participates in role checks.** Server-side it
   is deliberately folded into `has_role()` (migration `20260726090000`) and
   is write-protected by the privilege-escalation trigger, so it is not
   exploitable — but three portal pages carry a duplicated `adminFallback`
   query. Left functional; queued for removal (next steps) because deleting a
   working access path deserves its own careful commit.
5. **Verified clean, contrary to expectation:** Stripe webhook does verify
   signatures and handles both `checkout.session.completed` and
   `customer.subscription.deleted`; no `sk_live_`/`sk_test_` anywhere in the
   repo; no service-role key in the bundle; the old tagline and signal bar
   were already largely purged by earlier passes.

---

## Source-of-truth conflict (flagged, not blocked on)

The brief states the Company Charter v1.2 removes free Sunday attendance and
commits to three permanent access mechanisms. **Both the repo copy and the
live Notion page of MC-GOV-001 v1.2 still contain the old §8** ("The live
Sunday session is open to attend free…"), as does MC-MEM-106. The brief
itself is the founder's explicit, newer decision, so the member-only model
was built as specified — but the charter document needs its actual §8 update,
and this sync will (correctly) flag it when that lands with a version bump.
**Action for the founder: update MC-GOV-001 §8 in Notion and bump to v1.3.**

Pricing figures shown on /membership come from MC-MEM-106 working launch
pricing ($29 founding / $35 standard / teen $22 / kids $15 / family $79 /
concession $19), single-sourced in `src/lib/membershipPricing.ts`. Actual
billing remains governed by the `STRIPE_PRICE_*` env on
`create-subscription-checkout`. **Verify the Stripe dashboard amounts match
before launch** — the page file says the same thing in its header comment.

---

## Creative-director decisions

- **The membership page reads like an invitation, not a pricing table.** The
  room is described before any number appears; the trial pass and concession
  sit in the same grid, same card, same type scale as paid tiers; the
  cancellation promise is a full navy section with the ripple, not a footnote.
- **The walls are arrival.** Navy, grain, Bebas names, the newest arrival
  marked with an animating ripple, a serif line ("The room is ready.") when
  empty. No counts anywhere — a number on a wall is a leaderboard.
- **The roll UI is one-handed.** 56px minimum touch targets, names at
  text-xl, the dangerous action (unaccompanied) styled differently, placed
  after a divider, and requiring a full-sentence confirm; the common action
  (HERE) is one tap with no confirmation.
- **Voice**: every new surface passes the no-urgency rule; the founding rate
  is stated as a fact of the offer with no live counter and no "left".

## Deliberately left alone

- **The feature-first repo restructure** (`src/features/…`). Moving ~90 files
  while shipping this much new safety-critical surface in one pass maximises
  merge pain for zero user value this week. Do it as a dedicated
  moves-only PR where `git log --follow` stays legible.
- **`journal_privacy` guardian-read of child journals** (product decision
  2026-07-11). The brief says teen journals stay invisible to guardians
  regardless — verify the existing policy excludes teens before touching a
  privacy boundary; changing it blind is exactly the class of error this
  audit exists to catch.
- The existing `/portal/billing` checkout flow (works, correctly shaped);
  Stripe price configuration (hard stop 2 territory); the curriculum content
  and migrations chain; `exports/` stale CSVs (documented as stale in
  AGENTS.md).
- `ui-ux-pro-max-skill`: not fetched this pass; the brand tokens and voice
  rules governed every visual call made here. Where that guide would push
  toward gradient-mesh/glass patterns it loses to the brand anyway.

## Three things to do next

1. **Per-role RLS tests (pgTAP or JWT-based)** — the anon smoke test proves
   the outer wall; the valuable next layer is member-token and
   facilitator-token probes of roll_events, guardian_consents and
   concession_requests, wired into CI against a shadow database.
2. **Finish the member-only copy sweep + retire `profiles.is_admin`** — audit
   every FAQ/onboarding/marketing string against the member-only model, then
   remove the three `adminFallback` blocks and the `has_role()` is_admin
   fallback in one deliberate migration once every admin has a `user_roles`
   row.
3. **Trial pass email delivery + one follow-up send** — the pass currently
   renders as QR on screen; deliver it through the shared email layout in
   `notify-outbox` (template exists to extend), with the single no-pressure
   follow-up after the session, honouring unsubscribe.
