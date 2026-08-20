# Stripe Products & Entitlements — PROPOSAL (MC-MEM-106 v2.1)

Status: **PROPOSAL — nothing live.** Test mode only. No price goes live until
the founder and accountant confirm GST treatment.

## Delivered files

| File | Gate item |
|---|---|
| `scripts/seed-stripe-products.ts` | 1 — seed script with assertions |
| `supabase/migrations/20260822120000_session_credits_free_trials_attendance.sql` | 2 — migration |
| `src/lib/resolveEntitlement.ts` | 3 — entitlement resolution, all branches |
| `supabase/functions/_shared/youth-requires-adult.ts` + `src/lib/youthPlaceGuard.ts` | 4 — youth-requires-adult guard |
| This document, §3 | 5 — one-user-per-customer assumptions |
| This document, §4 | 6 — dry run results |

## 1 · What the migration creates

- `attendees` — the person who attends; links to `profiles` where an account
  exists (guests get rows without one). **New table** — the spec's FKs need
  it; door-scan/nfc-checkin keep using `check_ins` until a follow-up change
  wires them through `resolveEntitlement`.
- `session_credits` — visitor cards and one-offs, household-owned, per-phase
  column, atomic `trips_used` accounting.
- `free_trials` — `UNIQUE(attendee_id)`: once-for-life enforced by the
  database, not application logic.
- `attendance` — who attended, when, and which entitlement paid.
- `households.concession_granted` — concession is a flag, granted on request,
  no means testing; resolves before any credit burns.
- RLS: household members read their own data; staff manage; **no payment
  status is ever exposed to a room-visible surface.**

One deliberate deviation: `subscriptions.adult_membership_price_id` (a text
column the webhook maintains) is referenced by `resolveEntitlement` but not
created in this migration — it belongs in the webhook change below so schema
and writer land together. Add when wiring:

```sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS adult_membership_price_id text;
```

## 2 · Youth-requires-adult — all three layers

**Layer 1 — UI** (`src/lib/youthPlaceGuard.ts`): `canAddYoungPerson()` gates
the add-a-young-person flow; `removalOrphansYouthPlaces()` forces explicit
confirmation before removing the last adult seat when youth places exist.
Membership page wiring: hide the youth-place CTA unless
`householdHasActiveAdultMembership` (read via a small RPC or the household
query the page already makes).

**Layer 2 — server** (proposed change to `create-subscription-checkout`):

```ts
import { assertYouthPlaceAllowed, subscriptionHasYouthPlace } from "../_shared/youth-requires-adult.ts";

// after resolving the household from the payer profile:
if (requestedYouthPlaces > 0) {
  const guard = await assertYouthPlaceAllowed(admin, householdId);
  if (!guard.allowed) return json({ error: guard.reason }, 403);
}
```

Checkout for a NEW household must not accept youth places at all (no adult
membership exists yet); the flow is adult membership first, youth places as a
quantity change on the existing subscription with proration.

**Layer 3 — webhook** (proposed change to `stripe-webhook`,
`customer.subscription.created`):

```ts
if (subscriptionHasYouthPlace(sub)) {
  const guard = await assertYouthPlaceAllowed(admin, householdId);
  if (!guard.allowed) {
    await stripe.subscriptions.cancel(sub.id, { proration_behavior: "none" });
    await admin.from("security_review_flags").insert({   // or log + notify
      kind: "orphan_youth_place", stripe_subscription_id: sub.id,
      household_id: householdId, reason: guard.reason,
    });
    return; // do not provision seats
  }
}
```

## 3 · Where the current integration assumes one user per customer

The assumption most likely to break, in order of blast radius:

1. **Customer identity is the payer's profile, not the household.**
   `create-subscription-checkout` resolves `profiles.stripe_customer_id` by
   the authenticated `user_id` and creates a customer from the payer's email.
   Two adults in one household with separate accounts become two Stripe
   customers — the spec requires one customer per household. Fix: resolve
   customer by `households.id` (store `stripe_customer_id` on `households`,
   fall back to the payer profile only for legacy rows).
2. **Bundle composition lives in metadata, not subscription items.**
   `syncSubscription.parseBundle` reads `bundle_adults/teens/children` from
   metadata written at checkout and stores `quantity: 1`. The new model is
   real items (`adult_membership_weekly × N`, `young_person_place_weekly × M`)
   with mid-cycle quantity changes. `parseBundle` must read items by lookup
   key and the webhook must maintain `adult_membership_price_id`; otherwise a
   proration quantity change never reaches entitlements.
3. **Seat allocation is tier-partitioned.** `refresh_membership_entitlements`
   ranks household members into adult/teen/child seats. "Young person place"
   spans teen AND child members — the seat pool for youth places must be
   teen+child combined, and a youth place must never grant app access
   (currently seat → `membership_tier` → `useEntitlement`; the new
   `appAccess` rule is adult_membership_weekly only).
4. **One-offs are per-user, not per-household.** `buy-worksheet` and shop
   checkout key off `user_id`; visitor cards/one-offs in the new model are
   household credits with an optional attendee binding.
5. **Free trial already exists as `trial_tickets`** (issued invites, redeemed
   by door-scan, guest seated with `profile_id: null`). `free_trials` is the
   consumption record per attendee. Reconciliation: door-scan redemption
   should create the `attendees` row + `free_trials` row; existing unissued
   tickets keep working.
6. **`invoice.payment_failed`** currently has a handler; the spec adds: grace
   period → suspend app access; attendance is never blocked on failed
   payment; journal entries are never deleted on cancellation
   (`lesson_journal` is untouched by the webhook today — keep it that way).

## 4 · Test-mode dry run

`node scripts/seed-stripe-products.ts` (no Stripe key required):

```
Assertions passed:
  ✓ visitor-card per-session > weekly membership (adult $24 > $19, youth $12 > $9)
  ✓ one-off > visitor-card per-session (adult $30 > $24, youth $15 > $12)
  ✓ young_person_place_weekly carries requires_adult_membership=true
  ✓ no youth / visitor-card / one-off product grants app_access
  ✓ worksheet included on every product
```

Catalogue plan printed for all six products with lookup keys and metadata.
The full test-mode create (`--apply` with `sk_test_...`) was **not run** —
no Stripe test key is available in this environment. With a key:
`STRIPE_SECRET_KEY=sk_test_... node scripts/seed-stripe-products.ts --apply`,
then list products/prices by lookup key to confirm. `--live` refuses without
GST confirmation by design.

## 5 · Not done (deliberately)

- No live-mode anything. No member-facing pricing copy (MC-MEM-106 /
  MC-BRD-002, founder decision).
- `membershipPricing.ts` not rewritten — that's the GST-confirmation step;
  the six lookup keys are in the seed script until then.
- Edge functions not modified — the guard code above is proposed, to land
  with the webhook wiring change.
- Door-scan/nfc-checkin still use `check_ins`; wiring them through
  `resolveEntitlement` is the follow-up once this schema is deployed.

## 6 · Open questions for the founder

1. GST treatment confirmation (blocks everything live).
2. Concession: who grants it (facilitator? founder?) — the flag has
   `concession_granted_by`; `concession_requests` already exists as the
   request path.
3. Phase definition for the visitor-card cap: confirm 13-week phases align
   with curriculum blocks.
