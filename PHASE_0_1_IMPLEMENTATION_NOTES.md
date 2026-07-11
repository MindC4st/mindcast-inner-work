# Phase 0 + Phase 1 — implementation notes

Ships the safety-critical journal fix (Phase 0) and the identity + recurring-billing foundation (Phase 1). Migrations and edge functions are in the repo; **nothing has been applied to the production Supabase project** — apply/deploy steps are below.

## What shipped

### Phase 0 — journal privacy (member-safety-critical)
- `supabase/migrations/20260711120200_journal_privacy.sql`
  - Removes the blanket `facilitator` `SELECT` on every journal table (`workbook_entries`, `teen_/kids_workbook_entries`, `entries`, `commitments`, `domain_scores`, `bookmark_responses`, `implementation_checkins`). **Journals are now readable only by the owner** (+ a linked guardian for child/teen).
  - Reconciles the workbook owner-key bug: RLS now uses `profile_id = current_profile_id()` (translates `auth.uid()` → `profiles.id`), and backfills any rows that stored the auth uid.
- App coupling (required, or saves would fail the new `WITH CHECK`): `Workbook.tsx`, `TeenWorkbook.tsx`, `KidsWorkbook.tsx` now write/read `profile.id` instead of `user.id`.
- **Opt-in group sharing is preserved** (the `is_shared` cohort policies stay). Only staff snooping is removed.

### Phase 1a — roles + households
- `20260711120000_add_admin_role.sql` — adds `admin` to `app_role` (distinct from `facilitator`).
- `20260711120100_households.sql` — `households` + `household_members` tables, RLS, and helpers `current_profile_id()`, `is_guardian_of_profile()`, `is_household_member()`. **Guardian read** of a linked child/teen journal is granted here (per decision 2026-07-11: parent view = yes).
- App: `AuthContext` exposes `isAdmin`, `isStaff`, `membershipStatus`. `App.tsx` `AdminRoute` now admits admins **and** facilitators; new `AdminOnlyRoute` gates admin-only screens.

### Phase 1b — recurring membership (Stripe)
- `20260711120300_membership_subscriptions.sql` — `subscriptions` table + `profiles.membership_status` / `stripe_customer_id`; extends the privilege-escalation guard so members can't self-set billing fields.
- Edge functions: `create-subscription-checkout` (auth, `mode:"subscription"`, env prices), `stripe-webhook` (signature-verified, syncs status), `create-billing-portal` (self-service). `config.toml` updated (`verify_jwt` per function).
- App: `src/pages/portal/PortalBilling.tsx` at `/portal/billing` — pick plan → Checkout; manage/cancel via portal.

## Deploy / config steps (not yet done — require your Supabase + Stripe access)
1. **Apply migrations in order** (they are timestamped; `20260711120000` must run before the others so the `admin` enum value commits before it's referenced).
2. **Set Supabase Function secrets:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_TERMLY`, plus the standard `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY`.
3. **Create the recurring prices in Stripe** (monthly + termly) and put their price ids in the env vars above.
4. **Register the webhook** in Stripe → endpoint `…/functions/v1/stripe-webhook`, events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. **Promote an admin:** `UPDATE public.user_roles SET role='admin' WHERE user_id='<uuid>';` (or insert a row). Facilitators are unaffected.
6. Regenerate `types.ts` from the live DB after applying migrations (the hand-added `membership_status`/`stripe_customer_id`/`admin` entries will be superseded by the generated ones; new tables `households`/`household_members`/`subscriptions` will appear).

## Deliberately NOT in this pass (tracked follow-ups)
- **Admin UI** to create households / link children, and a **subscription-health** dashboard (reads `subscriptions`). Schema + RLS are ready; the screens are Phase 1 admin work.
- **Field-level encryption** for child journal columns (Phase 1 follow-up; RLS-locked-to-owner ships first, as recommended).
- Phase 2+ (durable live-session state, track scheduling, Q&A rate limiting, PWA offline shell, Capacitor NFC) — per the audit's build order.

## Phase 2 — live-engine hardening (`20260711130000_phase2_live_hardening.sql`)
- **session_responses privacy (important):** facilitators could read *every* response, including members' private `is_public=false` coursebook reflections. Replaced `responses_facilitator_read` with `responses_staff_read_public` (staff see shared rows only) and added `responses_own_read` so members can revisit their own reflections. Staff moderate/delete now includes `admin`.
- **Durable live state:** new `live_session_state` table (per `session_code`). `FacilitatorView` upserts on every slide change; `LiveJoin` resolves it on mount so late joiners / reconnects catch up without waiting for the presenter to re-emit. Broadcast still drives low-latency updates; the table is the fallback.
- **Q&A rate limiting:** `session_responses_rate_limit()` BEFORE INSERT trigger — max 1 submission / 4s per actor per session, plus a 60/10s whole-session flood cap.
- **Track scheduling:** `scheduled_sessions` (one row per date × Adult/Teen/Child track) with staff-manage / member-read RLS. Foundation for "today's session for my track" and the admin scheduler (reader UI lands with the admin dashboard).

Deferred within Phase 2: the standalone Q&A **moderation-queue** screen (inline approve/deny already works in `FacilitatorView`) and the dashboard "today's session" banner — both fold into the admin-UI pass.

## Phase 3 — native + offline
**PWA hardening (fully working web):**
- `public/sw.js` rewritten from push-only to an offline app-shell SW: navigations = network-first → cached shell → `public/offline.html`; static assets = stale-while-revalidate; **Supabase API/Realtime/Functions + all non-GET = network-only** (never serve stale live/journal data). Bump `CACHE_VERSION` to invalidate on deploy.
- Install prompt: `useInstallPrompt` hook + dismissable `InstallPrompt` banner (mounted in `App`). Android/desktop Chrome; iOS uses the native app.

**Check-in pipeline unification:**
- `20260711140000_checkin_source_track.sql` adds `track`, `source` (`kiosk|member_app|manual`), `scheduled_session_id` to `check_ins`.
- `nfc-checkin` edge fn now accepts `{ track?, source?, scheduled_session_id? }`, normalizes track from the member's `age_group`, and both the member tap and kiosk scan write through it → Realtime Welcome Wall stays the single source of truth.
- `src/lib/nfc.ts` — platform-detecting NFC read (Capacitor native plugin via computed dynamic import; Web NFC fallback; else unsupported).
- `src/pages/Kiosk.tsx` at `/admin/kiosk` — staff-only continuous-scan kiosk mode (scans *other* people's bracelets, distinct from the member self-tap).

**Capacitor scaffold (native build is out of scope for this environment):**
- `capacitor.config.ts` + deps added to `package.json` (`@capacitor/core|ios|android`, `@capacitor-community/nfc`, `@capacitor/cli`). The web build stays green because nothing imports these statically.
- **Native steps to run on a dev machine (Xcode / Android Studio):** `npm install` → `npx cap add ios` / `npx cap add android` → `npm run build && npx cap sync`. iOS: enrol in the **Apple Developer Program**, enable the **Core NFC entitlement**, add `NFCReaderUsageDescription` to `Info.plist`, submit for review (budget 1–3 weeks first time). Android: NFC permission in the manifest. The `ios/` and `android/` native projects are intentionally **not** committed here.

Deferred within Phase 3: member in-app "tap to check in" screen (kiosk + `nfc.ts` cover the pipeline; the member-facing tap UI is a thin wrapper to add during the app build).

## Verification done
- `tsc --noEmit -p tsconfig.app.json` — clean (Phase 0/1 and Phase 2).
- `vite build` — succeeds (Phase 0/1).
- Runtime RLS behaviour needs a live DB to exercise (apply to a Supabase **branch** first and test as a member vs facilitator vs guardian before production).
