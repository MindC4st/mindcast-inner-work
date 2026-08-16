# 12 · Phase 0 Discovery & Gap Matrix

*Response to `MINDCAST_VSCODE_APP_BUILD_TODO.md`. Phase 0 asks for a discovery
pass before any building; this is that pass, plus the defects fixed in the same
branch.*

---

## Read this first: the source-of-truth problem

The TODO names **25 controlled documents** (`MC-GOV-001`, `MC-BRD-001`,
`MC-TRN-001`, `MC-SAF-001/002`, `MC-SEC-*`, `MC-MEM-*`, `MC-FIN-*`) as the
authority, and forbids implementing from anything Legacy or Superseded.

**None of those documents are in this repository.** A repo-wide search for their
identifiers returns nothing. They live in Notion.

So any item whose correctness depends on their content — pricing model,
safeguarding thresholds, retention periods, accessibility targets, the exact
training module text, brand rules beyond the tokens already in `index.css` —
**cannot be implemented faithfully from here**. Doing so would mean inventing
policy, which the TODO explicitly prohibits.

What *can* be worked from: the code, the schema, `AGENTS.md`, and the explicit
new founder requirements written into the TODO itself.

**Founder decision needed:** export the controlled documents into the repo (e.g.
`docs/controlled/`) with their version stamps, or accept that policy-derived
items stay open.

---

## What exists today (discovery)

| Area | State |
|---|---|
| Routes | 43 rendering routes + 34 legacy redirect aliases |
| Roles | `member` / `facilitator` / `admin` in `AuthContext`; `isStaff = admin \|\| facilitator` |
| Route guards | `ProtectedRoute`, `AdminRoute` (staff), `AdminOnlyRoute` (admin only) |
| Migrations | 80 |
| Edge functions | 23 |
| Tests | 6 files (`checkin-dedupe`, `training`, `schedule`, `worksheet`, `functionError`, `example`) |
| Verify | `npm run verify` = `tsc -b tsconfig.app.json` + `vite build` — passes |

**Integrations found:** Stripe, Resend, Sentry, PostHog, Twilio, NFC/Web NFC,
Google OAuth, and for AI: **Google Gemini, DeepSeek, ElevenLabs, Pexels,
Shotstack**.

> The TODO's Phase 7 assumes Gemini is the AI surface. It is not the only one.
> ElevenLabs (voice synthesis), Pexels (stock video) and Shotstack (rendering)
> are also production processors and belong in the vendor/data-flow register.

---

## Gap matrix

Only rows where the answer is decidable from the repo. Anything gated on a
controlled document is marked **Blocked (doc)**.

| Requirement | State | Files / tables | Action |
|---|---|---|---|
| **P1** Roles server-controlled, no self-escalation | Existing | `user_roles`, `AuthContext` | — |
| **P1** Admin gets full admin functions | **Broken** | `generate-session-video`, `bulk-generate-videos` | **Fixed** — gates were `role = facilitator` only, so admins got 403 on their own AI tools |
| **P1** Password / Google / recovery | Partial | `PortalLogin`, `AuthContext` | Recovery routing fixed in `f033e55`; **still blocked on Supabase config** (below) |
| **P2** `Notice it. Name it. Do it.` | **Fixed** | 7 files | Replaced everywhere incl. both worksheet-PDF lines |
| **P2** `UNCONSCIOUS → CONSCIOUS → CHANGED` | Existing | `Home.tsx` manifesto | — |
| **P2** SEO/meta/OG/manifest | Existing | `index.html`, `manifest.json` | Consistent; canonical domain still broken (below) |
| **P2** 320px width | Not verified | — | Measured 0 horizontal overflow at **390px**; 320px untested |
| **P3** Portal surfaces reachable | Existing | `PortalLayout`, `PortalDashboard` | Insights/Progress/Kids **are** linked — an earlier report of mine said otherwise and was wrong |
| **P5** `/admin/training` reachable by staff | **Broken** | `App.tsx`, `PortalLayout` | **Fixed** — route was `/training` with **zero inbound links**; added `/admin/training`, kept `/training` as a redirect, added a staff nav item |
| **P5** Modules, checkpoints, server-side grading | Partial | `staff-training/*`, `TrainingPage` | UI + `training.test.ts` exist; module content is **Blocked (doc)** on `MC-TRN-001` |
| **P6** Session Content Studio | Existing | `LessonEditor` | Slide + YouTube editing exists; draft→publish states and revision history **Missing** |
| **P6** Transcript → reflection questions | Existing | `generate-video-questions` | Human-triggered, staff-gated |
| **P7** AI keys server-side only | Existing | 3 edge functions | Verified: no provider key in any `VITE_*` |
| **P7** No member PII to AI | Existing | see below | Verified by reading every AI function's inputs |
| **P7** Gemini video metaphor, 10s | **Missing** | — | Existing pipeline is a ~2-min Shotstack render, not a 10s metaphor clip; a different feature |
| **P9** Bracelet host correct | **Fixed** earlier | `BraceletStudio` | Was hardcoded to a non-resolving apex domain |
| **P9** Check-in failure legible | **Fixed** | `functionError.ts`, `BraceletTap`, `Kiosk` | Every non-2xx previously rendered as one opaque SDK string |
| **P11** No bronze/gold | **Fixed** | `generate-session-video`, `WelcomeWall` | Literal `184,137,90` in the staff storyboard PDF → Signal Blue. **Note:** the `--bronze` *token* is already `200 50% 45%` — a blue — so the name is stale, not the colour |
| **P12** 2px Signal Blue focus ring | Existing | `index.css:100` | `:focus-visible { outline: 2px solid hsl(var(--blue)); outline-offset: 2px }` |
| **P12** Reduced motion respected | Partial | `AmbientVideo` | Honoured for background video; not audited app-wide |
| **P13** Service-role key never in client | Existing | — | Verified: zero `SERVICE_ROLE` references under `src/` |
| **P13** Public endpoints don't leak internals | **Fixed** | `nfc-checkin` | Unauthenticated endpoint returned raw Postgres errors |
| **P13** Sentry/PostHog PII scrubbing | **Missing** | `observability.ts` | No `beforeSend` scrubber, no explicit autocapture/masking config |
| **P14** Canonical domain / DNS | **Broken** | Supabase + DNS | Apex `mindcast.co.nz` is NXDOMAIN; Supabase Site URL and Redirect URLs point at it, so recovery links resolve to a dead host |

---

## Fixed in this branch

1. **Admins locked out of AI tooling** — `generate-session-video` and
   `bulk-generate-videos` gated on `role = facilitator` only.
2. **Staff Training Hub unreachable** — added `/admin/training` (the path the
   TODO specifies), kept `/training` as a query-preserving redirect, and added a
   staff-only nav item.
3. **Bronze reintroduced in generated assets** — three literal bronze fills in
   the storyboard PDF and one glow on the Welcome Wall.
4. **Public endpoint leaked internals** — `nfc-checkin`'s catch-all.
5. **Opaque check-in failures** — `describeFunctionError` + per-status copy.
6. **Stale triad copy** — `Notice. Name. Rewire.` → `Notice it. Name it. Do it.`

---

## AI data-flow register (TODO report items 7–10)

| Function | Provider(s) | Receives | Trigger |
|---|---|---|---|
| `generate-video-questions` | DeepSeek | `transcript` (pasted), week, audience | Human button |
| `generate-coloring-page` | Gemini | `coloring_prompt` from the week's curriculum | Human button |
| `generate-session-video` | Gemini, ElevenLabs, Pexels, Shotstack | `film_script_2min`, `theme_title`, `signal_metaphor`, `core_affirmation` | Human button |

**Confirmed:** no member reflection, journal, safeguarding, complaint or
personnel data reaches any AI provider — every input is curriculum content or
staff-pasted source text. All three are human-triggered; none run on save, open
or publish.

---

## Not done, and why

- **Everything gated on the controlled documents** — not in the repo (see top).
- **Anything needing Supabase, Stripe, DNS, email or Sentry consoles** —
  Phases 10 and 14 almost entirely, plus the auth fix. No access from here; the
  Supabase MCP in this session authenticates to a different account.
- **Real-device and live-rehearsal QA** (P8, P15) — needs the room and the kit.
- **Accessibility audit at 320px / 200% zoom / screen reader** (P12) — needs a
  real assistive-tech pass, not a headless browser.
- **Phase 7's 10-second Gemini video metaphor** — a new feature, not a fix.
- **~2,300 lines of dead code** catalogued in the previous audit — deliberately
  left in place; deleting it is a founder call.

---

## Founder decisions still required

1. Export the controlled documents into the repo, or accept policy items stay open.
2. Apex DNS record vs switching the canonical host to `www` — this also decides
   whether already-written NFC bracelets keep working.
3. Whether the 2-minute Shotstack pipeline is replaced by, or kept alongside,
   the 10-second metaphor clip in Phase 7.
4. Delete the dead `session/` and `portal/` component sets, or keep them.
