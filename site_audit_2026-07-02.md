# Mindcast — Site Audit, Optimization & Security Review

**Date:** 2026-07-02
**Branch:** `claude/site-audit-optimization-0tn5oy`
**Method:** Full static code review + live browser audit (Chromium/Playwright against a production build: 16 routes, desktop + mobile viewports, console/network capture) + edge-function and RLS security review.

---

## 1. What the browser audit found

| Finding | Evidence | Status |
|---|---|---|
| Every page shipped the entire app: **2,023 KB JS (597 KB gzip)** on first load, even legal pages | build output + network capture on all 16 routes (1,977 KB JS each) | **Fixed** — route-level code splitting |
| Render-blocking Google Fonts request (4 families) on every page; `@fontsource/montserrat` installed but unused | `src/index.css:1` | **Fixed** — all fonts self-hosted |
| Horizontal scroll on mobile (page could be dragged 40 px sideways) | GSAP entrance offsets (`x: ±60`) on below-the-fold Home sections widen the page before their scroll-trigger fires | **Fixed** — `overflow-x: clip` on `html`/`body` |
| Page title identical on every route (bad for tabs, history, SEO) | `document.title` never changed | **Fixed** — per-route titles |
| Broken video reference: About page requested `/videos/waves_pulsating.mp4` which does not exist (404 every visit) | About.tsx:133 | **Fixed** — points at existing `hero-loop.mp4` |
| ~40 MB of oversized images (hero JPGs 2.4 MB each, gallery PNGs ~2 MB each, one 3 MB PNG) | `src/assets`, `public/images` | **Fixed** — recompressed/converted (see below) |
| 134 MB of unreferenced videos deployed with every build (`one-eleven.mov` 77 MB, `one-eleven.mp4` 42 MB, `adults-watching.mp4`, `hand-writing.mp4`) | zero references in `src/` | **Fixed** — removed |
| Stale/leftover `<!-- TODO -->` in `index.html` head | index.html:12 | **Fixed** |

### Course/portal content notes (from code + earlier audit cross-check)
The P0/P1 items from the May audit (`mindcast_live_audit_report.md`) are confirmed fixed in current code: `mindcast_live_sessions` is seeded, `is_public` defaults to `false` (DB + `LiveJoin.tsx`), the facilitator feed filters `is_public=true`, and `unlocked_lessons` is per-user.

## 2. Optimization changes

### Route-level code splitting (`src/App.tsx`)
All ~60 pages are now `React.lazy` chunks behind a single `Suspense` boundary that reuses the existing LOADING screen. Heavy dependencies (tldraw ≈1.5 MB, jsPDF ≈400 KB, recharts, gsap, framer-motion) now only download on the pages that use them. Four dead page imports (`SubAppLanding`, `Live`, `Resources`, `EcosystemPage`, `Membership`, `Curriculum`) no longer ship at all.

**Result (production build, measured in-browser):**

| Metric | Before | After |
|---|---|---|
| Entry JS bundle | 2,023 KB (597 KB gzip) | 516 KB (153 KB gzip) |
| JS downloaded on a legal/auth page | 1,977 KB | ~518 KB |
| JS downloaded on Home | 1,977 KB | ~777 KB (includes gsap/framer, Home-only) |

### Self-hosted fonts (`src/index.css`, `package.json`)
Replaced the Google Fonts CSS import with `@fontsource` packages (Montserrat, Cormorant Garamond, Inter, Bebas Neue — same weights). No third-party request, no render-blocking cross-origin CSS, fonts cached with the app. Console showed zero font errors after the change.

### Image optimization
- Photographic JPGs recompressed in place (max 1920 px, mozjpeg q80): e.g. `hero-couple.jpg` 2,322→127 KB, `hero-portrait.jpg` 2,357→82 KB.
- Photos-exported-as-PNG converted to WebP (q82) with code references updated: e.g. `littleminds-garden` 3,006→72 KB, gallery images ~2,000→50–110 KB each.
- Total media payload for these files: **~41 MB → ~2.3 MB** with no visible quality loss (screenshot-verified).

### Misc
- React Query defaults: `staleTime: 60s`, `retry: 1` — stops every portal navigation refetching identical data.
- Per-route `document.title` map in `App.tsx`.
- Verified after rebuild in-browser: all 16 audited routes render, titles correct, no console errors, mobile horizontal scroll gone (`scrollX` stays 0).

## 3. Security review & fixes

### Fixed in this branch

1. **Publicly triggerable member email/push blasts.** `send-practice-reminder` has `verify_jwt = false`, so anyone could POST and fire reminder emails/web-pushes to every opted-in member (idempotency limited it to once per day/slot, but an attacker could burn each day's send at the wrong time). The pg_cron schedule already authenticates with the service-role key, so the function now **requires that bearer** and returns 401 otherwise. Same fix on `select-weekly-callbacks` (early trigger could snapshot an incomplete reflections pool).
2. **Unsigned Shotstack webhook could publish arbitrary content.** `shotstack-webhook` (public, service-role client) fetched any `url` in the payload and mirrored it into the public `worksheets` bucket. Now: (a) only `https` URLs on Shotstack-owned hosts are mirrored, and (b) an optional `SHOTSTACK_WEBHOOK_SECRET` is enforced as a `?token=` query param — `generate-session-video` appends it to the callback URL automatically when the secret is set. **Action: add `SHOTSTACK_WEBHOOK_SECRET` to the function secrets.**
3. **Open redirect via Stripe checkout.** `buy-worksheet` and `create-pilot-checkout` used the attacker-controllable `Origin` header verbatim for `success_url`/`cancel_url`, so a checkout could bounce a paying customer to any site. Both now validate against an allowlist (`mindcast.co.nz`, `*.mindcast.co.nz`, `*.lovable.app`, localhost) and fall back to `https://mindcast.co.nz`.
4. **Unvalidated input in payment functions.** `buy-worksheet` now requires `week_number` ∈ 1–52 and audience ∈ {Adult, Teen, Child}; `create-pilot-checkout` (public form, service-role insert) now validates email shape and caps all free-text fields, preventing junk-data flooding of `pilot_applications` with megabyte payloads.
5. **HTML injection into reminder emails.** `send-practice-reminder` interpolated DB text (`theme_title`, practice copy) into email HTML unescaped; now escaped.
6. **Anonymous read of member attendance history.** RLS on `check_ins` (member display names + timestamps) was `USING (true)`. New migration `20260702100000_security_hardening.sql` limits anonymous/member reads to the last 24 hours (all the public Welcome/Goal walls need) while facilitators keep full history.

### Reviewed, no change needed
- No hardcoded secrets anywhere in `src/` or functions (grep for Stripe/API key patterns clean); all secrets via `Deno.env` / `import.meta.env`.
- `.env` in git contains only the Supabase URL + anon (publishable) key — public by design; RLS is the enforcement boundary.
- `ai-insights` correctly verifies the caller's JWT and only reads the caller's own rows.
- Only one `dangerouslySetInnerHTML` (shadcn `chart.tsx` theme CSS — not user-controlled).
- `nfc-checkin` is public by design (door kiosk); NFC ids are opaque tokens and unknown ids 404 without leaking. Acceptable; rate-limiting at the edge would be belt-and-braces.
- Old-audit P0 privacy items (share-on-screen default, facilitator private-response leak) verified fixed.

### Known gaps / recommendations (not code-fixable here)
1. **Set `SHOTSTACK_WEBHOOK_SECRET`** in Supabase function secrets to activate webhook authentication (fix #2 above enforces it once present).
2. ~~**`moderate-content` AI path is silently broken**~~ **Fixed in this branch**: it POSTed `{ prompt }` to `ai-insights`, which ignores that field, so moderation silently degraded to the static word-list. It now calls the Lovable AI Gateway directly with the moderation prompt (word-list pre-check and fail-safe fallbacks unchanged).
3. **Supabase advisors**: the MCP connection available during this review didn't have permission for project `gjkhkaywozuobhbcdysi`. Run Dashboard → Advisors → Security once and clear anything flagged (e.g. leaked-password protection, OTP expiry).
4. `word_submissions` remains anonymously readable — fine while the word cloud is a public display; revisit if words become attributable.
5. Consider Stripe webhooks (checkout.session.completed) instead of client-initiated `verify-pilot-payment` for payment truth.

## 4. Files changed
- `src/App.tsx` — lazy routes, Suspense loader, per-route titles, query defaults, dead imports removed
- `src/index.css` — self-hosted fonts, `overflow-x: clip`
- `src/pages/Home.tsx`, `src/pages/SignalLanding.tsx`, `src/pages/LittleMindsLanding.tsx` — WebP references
- `src/pages/About.tsx` — broken video reference fixed
- `index.html` — head cleanup
- `src/assets/*`, `public/images/*` — recompressed media; `public/videos/*` — 4 unused files removed
- `package.json` — `@fontsource/{inter,bebas-neue,cormorant-garamond}` added
- `supabase/functions/{send-practice-reminder,select-weekly-callbacks,shotstack-webhook,generate-session-video,buy-worksheet,create-pilot-checkout}/index.ts` — hardening above
- `supabase/migrations/20260702100000_security_hardening.sql` — `check_ins` RLS

Build, tests and lint verified: `vite build` clean, vitest 1/1 passing, eslint problem count unchanged from `main` (281 pre-existing, none added).
