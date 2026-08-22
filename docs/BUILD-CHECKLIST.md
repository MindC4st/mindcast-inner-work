# Mindcast — Build Checklist & App Review

Verified: `npm run build` ✓ (28s, 4310 modules) · `npm test` ✓ (275/275) · `npm run typecheck` ✓ **after clearing `*.tsbuildinfo`** · `npm run lint` → 5 errors / 15 warnings.

---

## What I like

1. **Route-level code splitting** — every page is `lazy()`, so first paint ships only the shell (router + auth). Heavy deps (gsap, recharts, tldraw, jspdf) stay inside page chunks. (`App.tsx:15–62`)
2. **Auth is defensively coded** — `setTimeout(0)` inside the auth callback to avoid deadlocking the Supabase auth client (commented); ephemeral session mode (`localStorage["mindcast_ephemeral_session"]`) for the "stay signed in unticked" bracelet flow; `PASSWORD_RECOVERY` routes to `/reset-password`. (`AuthContext.tsx:59–72`)
3. **Role resolution picks the highest privilege** correctly, with a comment explaining why `.limit(1)` would be wrong. (`AuthContext.tsx:42–51`)
4. **Session runner is data-driven** from `lesson_slides`, and retired v3 slide kinds are kept in the union but mapped to `null` in `SLIDE_KEY_TO_KIND` so they can never re-project — clean evolution path. (`FacilitatorView.tsx:38–79`)
5. **Safeguarding taken seriously** — `WelcomeWall` is first-name-only for minors with no membership-tier leakage; room roll has an offline queue (`rollOffline.ts`) for connectivity loss with 23505-dedupe swallowing; child sign-out gating.
6. **No `TODO`/`FIXME`/`HACK` markers anywhere** in `src/` — unusually clean.
7. **Env validated with zod at boot**, renders the error into `#root` if invalid instead of a blank screen. (`env.ts:25–43`)
8. **275 tests pass**, covering the tricky bits: worksheet PDF layout (162), welcome wall safeguarding (33), check-in dedupe (3), lesson-flow v4 (7).
9. **NFC abstraction handles 3 platforms** (capacitor / webnfc / unsupported) with a dynamic `@vite-ignore` import so the web build never resolves the native plugin. (`nfc.ts:45–46`)
10. **`/auth` is the canonical sign-in entry** — protected pages retain their intended destination, while old `/portal/login` links preserve query/hash state as they forward to `/auth`.

## What I dislike

1. **`as never` type-escape hatches** on staff-training tables and two admin RPCs (`AdminInsights.tsx:41`, `AdminProgress.tsx:34`; across `TrainingHome/ModuleRunner/TrainingTeam/TrainingPolicies/TrainingDocuments`). These suppress type-checking — a column rename breaks at runtime instead of compile time. Leftover from before types were regenerated; the tables/RPCs are now in `types.ts`, so the casts should go.
2. **Auth routing is consolidated** — the current member login now lives in `Auth.tsx`; the duplicate portal-login page has been removed.
3. **5 lint errors (`any`)** — 1 in `Onboarding.tsx:105` (user-facing), 4 in `scripts/seed-stripe-products.ts`.
4. **15 `exhaustive-deps` warnings**, several in `FacilitatorView` — real stale-closure risks, not style nits.
5. **`FacilitatorView` is 2194 lines** — a god component. `components/session-runner/` contains only `SlideTimer.tsx`; the real deck orchestration is jammed into one page file. Hard to maintain and test.
6. **No discrete "safeguarding lead" app role** — the `app_role` enum is only `member | facilitator | admin`, yet the schema has `profiles.is_safeguarding_lead` (migration `20260819210000`) and `session_evaluations` restricted fields gated on it. The app roles don't reflect the safeguarding-lead concept that the DB models.
7. **Stale `.tsbuildinfo` makes typecheck look broken** — `tsc -b` reported 2 phantom errors (`practice_sun_today does not exist`) from a cached incremental build; a clean run passes. CI / devs must `tsc -b --force` or clear cache, or they'll chase ghosts.
8. **Migration drift** — `practice_sun_today` / `practice_midweek` / `practice_fri` are on `mindcast_live_sessions` in `types.ts` (so in the live DB) but **no tracked migration adds them**. Live schema not captured in the repo.

## What's not functioning (honest answer: very little)

- **Build, tests, and clean typecheck all pass.** Nothing is runtime-broken in the bundle.
- **`/live` renders `ComingSoon`** — the Sunday-live landing is an intentional placeholder (`App.tsx:172`), not a bug.
- **`Auth.tsx` is dead code** — not rendered anywhere.
- **5 lint `any` errors** — real but don't break the build.
- **The stale-cache typecheck gotcha** — a dev-ex trap; not a runtime issue.
- **No native mobile shells** — `ios/` and `android/` don't exist in the repo (Capacitor config + JS NFC abstraction are wired; Web NFC works on Android Chrome PWA). Shipping iOS/Android needs `npx cap add ios/android` + `@capacitor-community/nfc` + Xcode/Android Studio work out of repo.

---

## Build checklist

### Pre-flight (before every merge/deploy)
- [ ] Clear incremental cache: `Remove-Item *.tsbuildinfo` then `npm run typecheck` → **0 errors** (avoids phantom errors from stale cache)
- [ ] `npm run lint` → 0 errors (currently 5 `any`)
- [ ] `npm test` → 275/275 pass
- [ ] `npm run build` → succeeds (≈28s)
- [ ] `npm run verify` (typecheck + build) green

### Type-layer hygiene
- [ ] Regenerate Supabase types: `supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts`
- [ ] Remove `as never` casts after regen: `TrainingHome`, `ModuleRunner`, `TrainingTeam`, `TrainingPolicies`, `TrainingDocuments`, `AdminInsights.tsx:41`, `AdminProgress.tsx:34`
- [ ] Capture `practice_sun_today` / `practice_midweek` / `practice_fri` in a tracked migration (close the migration drift)
- [ ] Confirm `mindcast_live_sessions` Row in `types.ts` includes the practice columns

### Code hygiene
- [x] Consolidate sign-in on `src/pages/Auth.tsx` and retain `/portal/login` as a compatibility redirect
- [ ] Fix `Onboarding.tsx:105` `any` (user-facing)
- [ ] Fix `scripts/seed-stripe-products.ts` ×4 `any`
- [ ] Resolve `exhaustive-deps` warnings in `FacilitatorView.tsx:333,366,494`

### Architecture
- [ ] Split `FacilitatorView` (2194 lines) — move deck orchestration + slide renderers into `components/session-runner/`
- [ ] Decide on safeguarding-lead role: add to `app_role` enum (align with `is_safeguarding_lead` + `session_evaluations` gating) **or** document why it's folded into facilitator
- [ ] Wire `/live` landing (replace `ComingSoon`) when ready

### Runtime / navigation smoke test
- [ ] **Public:** `/`, `/about`, `/membership`, `/try`, `/shop`, `/terms`, `/privacy`, `/refund`, `/safeguarding`, `/display`
- [ ] **Auth:** `/auth` (email + Google OAuth), legacy `/portal/login` redirect, `/reset-password`, `/onboarding` (age gate, under-13 block, teen guardian consent)
- [ ] **Member portal:** `/portal/dashboard`, `/weeks`, `/week/:n`, `/group`, `/insights`, `/downloads`, `/settings`, `/progress`, `/checkin`, `/kids`, `/family`, `/pass`, `/billing`, `/orders`
- [ ] **Staff:** `/admin` (all console tabs), `/admin/framework`, `/admin/kiosk`, `/admin/scan`, `/admin/handbook`, `/admin/staff-training/*`, `/facilitate/roll/:room`
- [ ] **Live:** `/mindcast-live/library`, `/lesson/:n`, `/facilitate/:n`, `/edit/:n`, `/coursebook`, `/live/:code`, `/b/:token`
- [ ] `/live` → `ComingSoon` (expected)

### Mobile (when shipping native)
- [ ] `npx cap add ios` + `npx cap add android`
- [ ] Add `@capacitor-community/nfc` dependency
- [ ] iOS: `Info.plist` NFC entitlement + `NFCReaderUsageDescription`
- [ ] Build in Xcode / Android Studio
- [ ] Verify NFC bracelet check-in (`/b/:token` flow) on native
