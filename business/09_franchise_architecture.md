# 09 · Franchise Architecture — Licensing Mindcast to Other Cities

*Written from the perspective of a senior engineer who has taken a single-tenant
product multi-tenant. Covers how to structure the platform so the content and
software can be licensed, how to organise the code, and what security and
analytics to build.*

---

## The headline judgement first

**Do not build multi-tenancy before you launch location #1.** Every hour spent on
franchise plumbing is an hour not spent getting one room full in Taupō, and a
franchise model you design before running a single session will be wrong in ways
you cannot yet predict.

**But three decisions are expensive to reverse, and you should make them now:**

1. **Put `org_id` in the schema early.** Retrofitting a tenant key across 69
   migrations and every RLS policy later is a genuinely painful, bug-prone job.
   Adding a nullable `org_id` now — defaulted to your own org — costs almost
   nothing and saves a rewrite.
2. **Separate *canonical content* from *tenant data*, starting today.** This is
   the single most important line in the whole model (see below). Get it wrong
   and you cannot licence the content without giving it away.
3. **Never let a franchise own the curriculum.** They read it under licence. The
   moment a franchise's database physically contains an editable master copy of
   your 52 weeks, your leverage is gone.

Everything else can wait until you have a second location asking for it.

---

## 1. The core architectural line: content vs tenant data

This is what makes the business licensable.

| | Owned by | Lives where | Franchise can |
|---|---|---|---|
| **Canonical curriculum** — the 52 weeks, wisdom, metaphors, activities, colouring prompts | **Mindcast HQ (you)** | One global table set, read-only to tenants | **Read** while licensed. Never edit, never export |
| **Tenant overrides** — local video swap, a reworded prompt | The franchise | `org_curriculum_overrides` | Create/edit their own layer only |
| **Member data** — profiles, journals, attendance, check-ins | The franchise (as data controller) | Tenant-scoped tables with `org_id` | Only ever see their own |
| **Brand + software** | Mindcast HQ | The app itself | Use under licence |

The franchise gets a *view* of your content composed at read time:
`canonical week → apply that org's overrides → render`. Kill the licence and the
canonical layer stops resolving. Their local overrides are worthless without it.

**Why this matters commercially:** it is the difference between licensing a
*service* (renewable, revocable, recurring revenue) and selling a *copy* (one
payment, then they are a competitor with your material).

---

## 2. Multi-tenancy model — pooled, with `org_id` + RLS

Three options, and why one wins for you:

| Model | Isolation | Ops cost | Verdict |
|---|---|---|---|
| **Database per tenant** | Strongest | High — 30 databases, 30 migration runs, 30 backups | ❌ Overkill; you are bootstrapped and solo |
| **Schema per tenant** | Strong | Medium, awkward in Supabase | ❌ Fights the platform |
| **Pooled: one DB, `org_id` + RLS** | Strong *if RLS is right* | Low — one migration, one backup | ✅ **This one** |

You are already doing pooled isolation successfully for **members** (a member sees
only their own journal, enforced in the database). A franchise is the same
pattern one level up.

**The shape:**
```sql
organisations (
  id, name, city, country,
  licence_status,        -- 'trial' | 'active' | 'suspended' | 'terminated'
  licence_expires_at,
  plan,                  -- what they pay
  created_at
)

organisation_members (org_id, profile_id, role)   -- staff of that franchise
```
Then every tenant table gains `org_id uuid NOT NULL`, and RLS becomes
`org_id = public.current_org_id()`, where `current_org_id()` is a
`SECURITY DEFINER` helper resolving the caller's org — exactly the pattern
`current_profile_id()` already uses.

**Licence status gates content in the database, not the UI:**
```sql
CREATE POLICY "curriculum_read_licensed" ON public.curriculum_weeks
  FOR SELECT USING (
    public.has_role(auth.uid(), 'hq_admin'::app_role)
    OR public.org_licence_active()      -- false when suspended/expired
  );
```
If a franchise stops paying, content access stops — automatically, in Postgres.
No invoice chasing, no manual switch, nothing to forget. This is the same
enforcement lesson from the member paywall: **UI gating is decoration; RLS is the
lock.**

**Migration path (cheap now, no rewrite later):**
1. Create `organisations`, insert one row for Taupō.
2. Add nullable `org_id` to tenant tables, backfill to the Taupō org, then set
   `NOT NULL`.
3. Leave RLS as-is for now — single tenant, so it changes nothing.
4. When franchise #2 signs, switch the policies to include `org_id` and you are
   done. That is a day of work instead of a month.

---

## 3. Code organisation — how I would restructure it

**Current state:** 52 files in `pages/`, 89 in `components/`, organised by *type*.
That is fine at this size and genuinely painful past it — to change "the live
session", you currently touch `pages/mindcast-live/`, `components/mindcast-live/`,
`components/whiteboard/`, `hooks/`, and `lib/`.

**Target: organise by *feature*, not by file type.** A senior team would aim for:

```
src/
  app/                    # shell: routing, providers, layout
  features/
    live-session/         # everything for the Sunday room
      components/  hooks/  api/  types.ts  index.ts
    member-portal/
    curriculum/           # lesson content, editor, coursebook print
    attendance/           # check-in, kiosk, guardian notifications
    membership/           # Stripe, entitlements, paywall
    admin/
    org/                  # NEW: franchise management (when you get there)
  shared/
    ui/                   # shadcn primitives
    lib/  hooks/  types/
supabase/
  migrations/  functions/
docs/
  product/  business/  legal/  runbooks/
```

Two rules that matter more than the folder names:
- **A feature owns its data access.** `features/curriculum/api/` is the *only*
  place that queries `curriculum_weeks`. Today those queries are scattered across
  pages, which is why the paywall had to be fixed in four files.
- **Cross-feature imports go through `index.ts`.** It makes the seams visible,
  and later makes it possible to extract a feature into a package.

**How to get there — do NOT big-bang it.** Refactoring 141 files pre-launch buys
you nothing a member can see and risks breaking a working app. Instead:
- New features go in `features/` from now on.
- When you touch an old area substantially, move it then.
- Do the `curriculum/` extraction first — it is the thing you will licence, so it
  benefits most from a clean boundary.

---

## 4. Security to build

You already have the hard parts: RLS-enforced privacy, service-role-only
entitlements, signed URLs, approve-before-show moderation, signature-verified
webhooks. For a franchise platform, add these — roughly in priority order:

**Tier 1 — before franchise #1**
1. **Cross-org isolation tests.** The single most important test suite you will
   ever write: *org A can never read org B's members, journals, attendance or
   analytics.* Automated, run on every deploy. A single leak here ends the
   business.
2. **Audit log.** Append-only: who did what, when, to whom. Non-negotiable for
   safeguarding (who viewed a child's record?), disputes, and franchise trust.
   Never deletable by the org being audited.
3. **MFA for all staff/admin accounts.** They can see member lists and run
   sessions. Supabase supports TOTP.
4. **Rate limiting on edge functions.** You already had one function that any
   user could call to spend money on image generation. Apply per-user and
   per-org limits generally, not case by case.

**Tier 2 — as you scale**
5. **Secret rotation + least privilege** — separate keys per environment; no
   service-role key ever reaching the browser.
6. **Backups + tested restore.** Enable PITR before you hold real member data,
   and *actually practise a restore* — an untested backup is a hope, not a plan.
7. **Data residency + processing agreements.** Each franchise is a data
   controller for its own members; you are the processor. That needs a written
   DPA in the licence agreement (see [L2](legal/02_content_ip_and_licensing.md)).
8. **Content anti-exfiltration.** Accept you cannot stop a determined screenshot.
   Do the cheap, high-value things: no bulk export endpoint for tenants,
   watermark generated PDFs with the org name, rate-limit content reads, and put
   the real teeth in the *contract*, not the code.
9. **Incident response runbook** — who to call, how to revoke, how to notify.
   Required under the NZ Privacy Act for notifiable breaches.

---

## 5. Analytics to build

Two principles first, because they are easy to get wrong in a wellbeing product:

- **Aggregate, never read.** You may count that a journal entry exists; you may
  never read its content, and neither may a franchise. Bake that into the schema
  (metrics tables hold counts, not text), not just into policy.
- **Self-host or EU-host.** Plausible or PostHog, not Google Analytics — for a
  product built on privacy and trust, the analytics stack is part of the promise.

**The one metric that matters most:** **intention completion rate** — of the
members who set an intention, how many say they did it the following Sunday? That
is the closest thing to a direct measurement of whether Mindcast *works*. Almost
nothing else you can measure tells you that. The data model already supports it
(`weekly_intention` + `intention_outcome`); you just need the Sunday question and
the chart. **Make this your north-star metric.**

**Member health (per org)**
- Weekly active members; attendance rate vs enrolled.
- **Week-by-week drop-off across the 52** — which specific weeks lose people.
  This is how the curriculum improves: if 40% churn at week 9, week 9 has a
  problem, and you will never learn that from a gut feel.
- Retention curves by join cohort; journal + activity participation rate.
- Life Group attachment (do members who join a Life Group retain better? almost
  certainly yes — prove it, then sell it).

**Business (per org + HQ roll-up)**
- MRR, churn, LTV, and **months-to-breakeven against the hall cost** — the number
  from [02](02_financial_forecast.md) that decides whether a location survives.
- Free → paid conversion; workbook/product attach rate.

**Franchise health scorecard (HQ view)** — the thing you actually sell renewals on:
attendance trend, retention, NPS, safeguarding incidents, licence payment status,
content fidelity. A red franchise gets support before it gets terminated.

**Operational**
- Session fill rate, no-show rate, check-in success rate (NFC failures are a
  door-experience problem), notification delivery rate.

---

## 6. What the licensing product actually is

Worth being clear, because it changes what you build:

1. **Content licence** — the 52 weeks, three tracks, coursebook masters. The core.
2. **Software licence** — the platform, hosted by you (SaaS), *not* installed by
   them. Hosting it yourself is what keeps the content protected and the updates
   central.
3. **Brand licence** — name, marks, standards.
4. **Training + certification** — facilitator accreditation. A revenue stream and
   a quality gate.
5. **Standards enforcement** — safeguarding, vetting, the anti-cult charter. Your
   brand dies if one franchise runs a bad room, so this is protection, not
   bureaucracy.

**Pricing shapes:** a joining fee (covers onboarding + training), then either a
monthly platform fee per location or a revenue share (typically 5–10%). Revenue
share aligns incentives better but needs visibility into their numbers — which
the platform gives you, since they run on it.

---

## Decisions to confirm
- Are you willing to **host every franchise yourself** (strongly recommended — it
  is what protects the content), or will some want their own instance?
- Does a franchise get their **own Stripe account** (they own the member
  relationship) or do you collect and remit? This changes the whole billing
  architecture, so decide before building it.
- What is the **minimum standard** a location must meet to keep the licence —
  and who audits it?
- Charitable arm vs commercial licensing entity — see
  [01](01_vision_and_strategy.md). This affects who can even hold the licence.
