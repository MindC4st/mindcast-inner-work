# Phases 1–5 + brand consistency pass

## Brand system (locked, applied everywhere)

From `mem://style/branding-system` + `mem://style/product-identities`:

- **Type:** `Bebas Neue` display (headings, ALL CAPS, tight tracking), `Montserrat` body. `Cormorant Garamond` reserved for editorial pull-quotes only. Never Inter/Poppins/serif defaults.
- **Core palette (HSL tokens in `index.css`):** primary `#3585af` (brand blue), backgrounds `--ivory #fffaf6` (light) / `--navy #0a1120` (dark). **Bronze/gold retired** — `--bronze` now aliases to brand blue so legacy classes stay on-brand.
- **Product identities kept as accent layers:** Signal (electric blue), Little Minds (warm peach), Connect (sage). Applied only inside their sub-app routes, never bleeding into core portal/admin.
- **Motion:** Framer Motion for page + hero, GSAP for scripted sequences. One decisive hero motion, not scattered micro-animations.
- **Iconography:** Lucide, `strokeWidth={1.5}`, muted `text-foreground/30-60`. Never emojis.
- **Mobile:** `viewport-fit=cover`, `env(safe-area-inset-*)`, bottom sheets over modals, 64px min touch targets.
- **Copy voice:** "NOTICE. NAME. REWIRE." Taupō always with macron.

## Phase 1 — identity + recurring billing (finish the wiring)

Schema/functions already scaffolded. Remaining work:

1. Regenerate `types.ts` post-migration so `households`, `household_members`, `subscriptions`, `membership_status`, `stripe_customer_id`, and the `admin` enum stop needing `as any` casts (removes the `AuthContext` cast we just added).
2. `AdminHouseholds` UI polish: convert to portal card style (ivory panels, Bebas section headers, Montserrat body, brand-blue primary buttons). Add empty state + guardian search.
3. `AdminMembership` polish: same tokenised styling; add status pills (`active`, `past_due`, `lapsed`) using `--primary` / `--muted` / destructive tokens — no ad-hoc hexes.
4. `PortalBilling` (`/portal/billing`): rebuild with the `/` + `/demo` visual language — ivory card, Bebas plan names, Montserrat body, single primary CTA, "manage in customer portal" as a text link.
5. Stripe env vars documented in the runbook; not executed here.

## Phase 2 — live-engine hardening (finish UX)

Schema, RLS, `live_session_state`, rate-limit trigger, `scheduled_sessions` already shipped.

1. `FacilitatorView` — restyle to brand tokens (remove any remaining raw hex, replace bronze accents with brand blue), add a persistent "state saved" indicator using the durable state row.
2. `LiveJoin` — brand-token pass, ensure late-join hydrate spinner matches other portal loaders.
3. `AdminModeration` — brand pass; approve/deny buttons use `--primary` / `--destructive` tokens.
4. `TodaysSessionBanner` on the member dashboard — Bebas track name, Montserrat body, brand-blue CTA, dismissible.

## Phase 3 — PWA + native (web finish; native stays scaffolded)

1. `InstallPrompt` banner — restyle to match `/` hero card (ivory panel, Bebas headline, Montserrat body, tokenised primary button, safe-area aware).
2. `Kiosk` (`/admin/kiosk`) — full-screen dark navy, giant Bebas prompt, brand-blue tap-target ring, last-scan feedback panel.
3. Member self-tap screen (`BraceletTap` → thin brand-aligned wrapper around `nfc.ts`).
4. Native (`npx cap add ios/android`) remains a dev-machine step; not run here.

## Phase 4 — Life Group portal rebuild (from the audit)

The audit flagged `PortalDashboard`, `PortalWeek`, `PortalWeeks` as REBUILD because they read hardcoded `PILOT_SESSIONS` instead of the Mindcast-Live curriculum.

1. New hook `useCurriculumWeek(track)` — pulls from `curriculum_weeks` scoped by `age_group` and the current `scheduled_sessions` row.
2. `PortalDashboard` — Bebas "This week" header, brand-blue progress ring, current-week card pulling live curriculum data, remove hardcoded array, remove `font-serif` mix.
3. `PortalWeek` — podcast player restyled to `/demo`-language (ivory card, brand-blue scrubber, Bebas title, Montserrat description), bookmarks drawer as a bottom sheet on mobile.
4. `PortalWeeks` — 52-week grid using brand tokens; completed/unlocked/locked states via `--primary`/`--muted`/`--foreground/10`.
5. Position as "life-group companion to Sunday Live" copy throughout.

## Phase 5 — retire legacy + brand consistency across KEEP/REVIEW pages

**Retire (delete routes + files):** `Index.tsx (/classic)`, `SubAppLanding`, `EcosystemPage`, `Curriculum.tsx`, `LessonDetail.tsx`, `Live.tsx` (old), `Membership.tsx`, `Resources.tsx`, `admin/AdminLessonEditor.tsx`, plus the legacy podcast stack (`Session.tsx`, `Dashboard.tsx`, `Checkin.tsx`, `JoinEntry.tsx`, `JoinSession.tsx`) and the collapsed admin trio (`AdminSessions`, `AdminSessionEditor`, `AdminPresenter`, `AdminSessionRunner`, `AdminLive` → forwarded to `FacilitatorView` / `AdminSessionRunner` kept only if the audit tagged it KEEP).

**KEEP/REVIEW brand pass — targeted fixes surfaced in the audit:**

- `Home.tsx` — replace `bg-[#3585af]` with `bg-primary`.
- `AdminMembers.tsx` — replace `#1A1725` with `bg-background` / `--navy` token.
- `Demo.tsx` — retire `--electric` custom colour; unify on `--primary`.
- `Auth.tsx` — add Bebas display on headline + section headers, keep Montserrat body (fixes 1× display / 13× body imbalance).
- `PortalDashboard` and any file mixing `font-serif` — remove Cormorant unless it's a genuine pull-quote.
- Sweep all KEEP/REVIEW files with `rg` for hardcoded `#[0-9a-f]{3,6}` and `bg-\[#`, replace with semantic tokens (`bg-background`, `bg-primary`, `text-foreground`, `border-foreground/10`, etc.).
- Sweep for `text-white`, `bg-black`, `bg-white` → tokenised equivalents.
- Sweep for emoji characters → Lucide icons.

## Technical details

- Order: types regen → Phase 1 UI → Phase 2 UI → Phase 3 web → Phase 4 rebuild → Phase 5 retire + sweep. Each phase is a discrete commit-shaped batch.
- No new migrations expected; Phases 0–3 schema is already applied. If types regen surfaces a missing column, add one migration at that point.
- Testing gate per phase: `tsc --noEmit` clean + `vite build` succeeds + visual spot-check on `/`, `/demo`, `/portal`, `/admin`, `/mindcast-live/*`.
- Retirement is code-only — no data loss; DB tables for the retired flows stay (they hold historical rows).
- Bronze token stays aliased to brand blue (already shipped) so legacy `bronze` classes render on-brand while we sweep.

## Out of scope (called out, deferred)

- Field-level encryption for child journals (Phase 1 follow-up; RLS-locked-to-owner already ships).
- Native iOS/Android builds (require Xcode/Android Studio + Apple Developer enrolment).
- Stripe live-mode price creation and webhook registration (needs your Stripe dashboard access).
- Full data migration of legacy podcast tables into curriculum tables.

## Deliverable per phase

At the end of each phase I'll report: files touched, routes changed, any deletions, and a screenshot-worthy list of pages to eyeball. Then move to the next phase in the same thread unless you say pause.
