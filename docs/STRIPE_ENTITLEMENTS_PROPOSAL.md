# Stripe Products & Entitlements — proposal

Against **MC-MEM-106 v2.1**. Nothing in this branch is live, nothing is
wired in, and no existing member's billing changes. This is the GATE
deliverable: propose, then stop.

**No price goes live until the founder and accountant confirm GST treatment.**

---

## What is in the branch

| # | GATE item | File | State |
|---|---|---|---|
| 1 | Seed script + assertions | `scripts/seed-stripe-products.ts`, `scripts/stripe-catalogue.ts` | Written, dry run verified, 19 tests |
| 2 | Migration | `supabase/migrations/20260823120000_session_credits_and_entitlements.sql` | Written, not pushed |
| 3 | `resolveEntitlement` | `supabase/functions/_shared/entitlement.ts` | Written, 30 tests |
| 4 | Youth-requires-adult guard, three layers | `supabase/functions/_shared/youthGuard.ts` | Written, 20 tests |
| 5 | One-user-per-customer audit | this document, §3 | Six findings, one blocking |
| 6 | Test-mode dry run | — | **Not done — see §4** |

Total 69 new tests. `npm run verify` passes. No existing file is modified.

---

## 1 · Four decisions I made that you should overturn if I read them wrong

**a. Youth-requires-adult is not a door rule.** The brief puts it in §4.1
*Checkout rules*, and §3's resolution order does not mention it. So
`resolveEntitlement` never blocks a young person over it. A household whose
adult membership lapses mid-phase would otherwise have its teenager bounced at
the door — the turned-away family the brief exists to prevent. What the
resolver does instead is decline to *offer* the weekly youth place when there
is no adult membership to attach it to, and set
`youthWithoutActiveAdult: true` on the decision so the office can follow up.

**b. Rule 2 covers the subscription, not casual access.** "Under-18 places
cannot be bought standalone" is about `young_person_place_weekly`. Visitor
cards, one-offs and the trial pass are one-time purchases and are not gated —
the trial pass copy says "bring the family", and a grandparent buying a
one-off for a grandchild is a sale you want. If you meant *all* youth access,
say so and it is a one-line change.

**c. Concession does not open the app.** The migration models it as a
household flag — a door pathway, not a subscription — so it resolves ahead of
every credit branch and never burns a card trip, exactly as §4.4 asks. But the
pricing sheet says concession is "Same membership. Everything included," which
would mean app and journal access. Those are two different products. A flag
cannot grant app access without breaking rule 3's single enforcement point; if
concession is a membership, it should be a fourth Stripe price at $19 resolved
on branch 1 and the flag should disappear. **I have not guessed.** The
`OPEN QUESTION FOR THE FOUNDER` comment is in the code at the branch.

**d. There is no `--live` flag.** The brief asks for one plus a typed
confirmation. I did not build it. GST treatment is unconfirmed, and a flag
that exists is a flag that gets used, usually by someone in a hurry. The
script refuses any key not starting with `sk_test_`. Adding live mode is a
two-line change that should be made by whoever is standing behind the GST
decision.

---

## 2 · What I did not touch, deliberately

- **`src/lib/membershipPricing.ts`** — §6 asks for it to be updated to the six
  lookup keys. That file feeds the live membership page. Editing it changes
  what visitors are quoted, from $29 to $19, with no founder sign-off and no
  GST confirmation. That is member-facing pricing copy, which the brief
  forbids me to write. It stays as-is; the change is a five-minute edit once
  you have decided.
- **The membership page** — same reason.
- **`create-subscription-checkout`, `stripe-webhook`** — still on the old
  bundle model. Rewriting them is the migration in §3, not the proposal.
- **Anything in live mode.** No Stripe API call has been made from this branch.

---

## 3 · Where the existing integration assumes one user per customer

This is GATE item 5, and the brief is right that it is the thing most likely
to break. §4.2 requires **one Stripe customer per household**, with the adult
membership and each young person place as **items on one subscription**.
Today every one of these assumes one customer per *profile*.

### 3.1 BLOCKING — deleting one account cancels the whole household

`supabase/functions/delete-account/index.ts:73`

```ts
const subs = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: "all", limit: 100 });
for (const s of subs.data) {
  if (s.status !== "canceled") await stripe.subscriptions.cancel(s.id).catch(() => {});
}
```

Correct today: the customer belongs to one person, so cancelling everything on
it cancels only their own membership. Under a household customer, **one adult
deleting their account cancels the other adult's membership and every child's
place**, silently, inside a `catch {}` that swallows the failure. The family
finds out at the door.

This must be fixed *before* any household customer exists, not after. The fix
is to remove only that person's subscription *items* and cancel the
subscription only when the last item goes — which is the same code path as
§4.2's "removing the last adult membership must not silently orphan youth
places", already modelled in `describeAdultRemoval()`.

### 3.2 BLOCKING — the subscription row keeps only the first price

`supabase/functions/stripe-webhook/index.ts:139`

```ts
price_id: sub.items?.data?.[0]?.price?.id ?? null,
quantity: 1,
```

A household subscription with `adult_membership_weekly × 2` and
`young_person_place_weekly × 2` records **one** price ID and a hardcoded
quantity of 1. `resolveEntitlement` branch 1 asks "is this person's product
`adult_membership_weekly`?" — and there is no per-person product to read,
because four items collapsed into one row.

This needs a `subscription_items` table keyed on the Stripe item ID, with a
`profile_id` per item. Without it, the entitlement model has nothing to
resolve against and rule 3 cannot be enforced. It is not in the migration
because it belongs with the checkout rewrite, and I would rather flag the gap
than ship half of it.

### 3.3 Two adults in a household get two customers and two subscriptions

`supabase/functions/create-subscription-checkout/index.ts:133`

```ts
let customerId = profile?.stripe_customer_id || undefined;
```

Per-profile. Two adults in one household each get their own customer, their
own subscription, and two separate invoices — instead of one subscription with
`quantity: 2` on the adult item. The family discount coupon is applied per
checkout, so whichever adult pays second may not get it.

### 3.4 Customer lookup by email picks an arbitrary match

`create-subscription-checkout/index.ts:136`

```ts
const existing = email ? await stripe.customers.list({ email, limit: 1 }) : { data: [] };
```

Two failure modes. A couple sharing one email address — common in this
demographic — collide onto the same Stripe customer, so the second person's
membership attaches to the first person's billing. And `limit: 1` on an
unordered list means that when duplicates already exist, which one you get is
arbitrary and can change between runs.

### 3.5 Household resolved with `.limit(1).maybeSingle()`

`create-subscription-checkout/index.ts:122`

```ts
.eq("profile_id", profile?.id ?? "").limit(1).maybeSingle()
```

Someone in two households — a child across separated parents is the realistic
case — gets an arbitrary one, and the subscription's `household_id` metadata
is then wrong for the rest of its life. Under a household-keyed customer that
arbitrary choice decides who is billed.

### 3.6 Worksheet purchases attach to the personal customer

`create-shop-checkout/index.ts:137` uses `profile.stripe_customer_id`. If
memberships move to a household customer and shop purchases do not, a member
has two customers and the billing portal shows them half their history.

### 3.7 The billing portal opens on the caller's own customer

`create-billing-portal/index.ts:76`. Under a household customer, **any adult
in the household can cancel the household's subscription** from the portal
with no confirmation step. That may be fine — they are both paying adults —
but it is a decision, not a detail, and right now nobody has made it.

---

## 4 · The test-mode dry run — not done, and why

GATE item 6 asks for a test-mode run that seeds the catalogue and confirms
every assertion passed. **I cannot do this.** This session has no Stripe
credentials and no access to your Stripe account, test mode included. I am not
going to describe a run I did not perform.

What I *did* verify, locally, with no network:

- `node --experimental-strip-types scripts/seed-stripe-products.ts` — the dry
  run prints the full catalogue and reports `✓ 6 products, all assertions passed`.
- All four required assertions were made to fail on purpose and observed
  failing, in `src/test/stripe-catalogue.test.ts`. An assertion nobody has
  watched fail is an assertion nobody knows works.
- The structural cases too: a missing product no longer makes a price
  comparison pass by omission, a duplicate lookup key is caught, and a card
  repriced by changing `trips` from 10 to 20 — same $240, half the per-session
  rate — is caught, which comparing headline prices would miss.

To complete item 6, run this yourself with a test key:

```sh
export STRIPE_SECRET_KEY=sk_test_...
node --experimental-strip-types scripts/seed-stripe-products.ts --apply
```

It is idempotent and matches on lookup key, so a second run reports `=` on
every line and creates nothing.

---

## 5 · Order of work, if this is approved

1. Fix §3.1 (`delete-account`). It is dangerous the moment a household
   customer exists, and harmless to fix now.
2. Add `subscription_items` (§3.2). Everything else depends on being able to
   read a per-person product.
3. Push the migration; regenerate `src/integrations/supabase/types.ts`.
4. Seed the test-mode catalogue; confirm item 6.
5. Rewrite `create-subscription-checkout` onto the household customer, with
   `guardCheckoutCart` before the session is created.
6. Rewrite the webhook: `guardSubscriptionItems` on
   `customer.subscription.created`, credits on `checkout.session.completed`.
7. Gate app and journal routes on `appAccess`, not on subscription existence.
8. **Founder decision** on §1c (concession) and on the pricing copy in §2.
9. GST sign-off. Only then, live mode.
