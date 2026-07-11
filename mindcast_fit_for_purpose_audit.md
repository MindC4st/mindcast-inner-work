# Mindcast — Fit-for-Purpose Audit

**Date:** 2026-07-11
**Repo:** `grantashl1-commits/mindcast-inner-work`
**Stack:** Vite + TypeScript + React 18 + shadcn-ui + Tailwind + Supabase (Postgres, Auth, Realtime, Edge Functions, Storage)
**Method:** Static audit of source + migrations + edge functions. Reconciled against the two prior docs (`mindcast_live_audit_report.md` 2026-05-25, `site_audit_2026-07-02.md`). Live-DB row counts / runtime RLS were **not** executed against production — items needing that are flagged `VERIFY LIVE`.

> **Given (per brief):** Check-in = Capacitor-wrapped native apps (iOS + Android) with Core NFC / Android NFC, member taps own phone; staff NFC kiosk is the fallback. This is treated as decided, not audited as an open question. Web NFC in mobile Safari is out of scope.

---

## TL;DR — the three things that matter most

1. **Journals are readable by staff, and the ownership check is broken.** Every private table (`workbook_entries`, `teen_workbook_entries`, `kids_workbook_entries`, `entries`, `commitments`, `domain_scores`, `bookmark_responses`, `implementation_checkins`) grants **`facilitator` a blanket `SELECT`**. On top of that, the workbook tables have an **identity bug**: RLS is `profile_id = auth.uid()` and the app writes `profile_id = user.id`, but the column is a foreign key to `profiles.id` — which is a *separate random UUID*, not the auth user id. The policy and the FK cannot both be satisfied. This is the highest-priority gap and it is member-safety-critical (it includes **children's** reflection data). **No field-level encryption at rest anywhere.**
2. **The recurring membership/payment system does not exist.** What's built is a **one-time** Stripe Checkout for the founding pilot (`mode: "payment"`, hardcoded price id). No subscriptions, no webhooks, no membership-status sync, no billing portal, no household billing.
3. **The live "coursebook turns pages" engine exists and is the strongest, most modern part of the build** — Supabase Realtime **Broadcast** for slide sync + `postgres_changes` for the Q&A feed. But it's single-track, has no persistent "current slide" (late joiners get a blank follower view), and has known privacy-default bugs in the response feed.

The current architecture **can** support the target product. This is an extend-and-harden job, not a rewrite.

---

# PART 1 — Audit of the existing codebase

## 1. Feature inventory (what each route actually does)

Routes are in `src/App.tsx`. Three generations of product are layered in the same repo:

- **Gen A — Marketing site:** `/`, `/about`, `/pilot`, `/signal`, `/little-minds`, `/connect`, legal pages. Real, wired (pilot checkout works).
- **Gen B — "Portal" + legacy session runner** (podcast-discussion era): `/portal/*`, `/dashboard`, `/workbook`, `/session/:id`, `/admin/present/:id`, `/join/:code`, `/checkin`, `/display/*`. Wired to the **legacy `sessions`** table (`active_slide`, `session_code`), check-ins, word cloud / welcome wall.
- **Gen C — "Mindcast LIVE" coursebook** (the target era): `/mindcast-live/library`, `/mindcast-live/lesson/:week`, `/mindcast-live/facilitate/:week`, `/live/:code`, `/b/:token`. Wired to `mindcast_live_sessions` + `session_responses`.

| Area | Route(s) / component | What it actually does | Backend wiring |
|---|---|---|---|
| Marketing | `Home`, `About`, `Pilot`, sub-app landings | Static + pilot application form | ✅ real (Supabase insert + Stripe) |
| Pilot payment | `Pilot`→`create-pilot-checkout`→`PilotSuccess`→`verify-pilot-payment` | **One-time** Checkout | ✅ real, but one-time only |
| Member portal | `PortalDashboard/Weeks/Week/Group/Insights/Progress/Downloads/Settings` | Weekly workbook, group sharing, insights, push settings | ✅ Supabase, ⚠️ legacy `sessions`/cohort model |
| Legacy workbook | `Workbook.tsx`, `TeenWorkbook.tsx`, `KidsWorkbook.tsx` | Autosaves workbook fields | ⚠️ **RLS identity bug (see §6)** |
| Legacy live/presenter | `AdminPresenter`, `AdminSessionRunner`, `JoinSession` | Slide control via `sessions.active_slide` | ⚠️ **poll-based**, `sessions` not in realtime publication |
| **LIVE coursebook (member)** | `mindcast-live/Lesson.tsx`, `LiveJoin.tsx` | Follower slide view + per-slide Q&A input | ✅ Realtime **Broadcast** + `session_responses` |
| **LIVE coursebook (facilitator)** | `mindcast-live/FacilitatorView.tsx` | 13-slide deck, broadcasts slide, live Q&A feed, moderation, per-audience switch, unlock | ✅ real — strongest component |
| Lesson library | `mindcast-live/Library.tsx` | 52-week lock/unlock grid | ⚠️ **global unlock**, no per-user (see §2) |
| Check-in / walls | `Checkin.tsx`, `BraceletTap.tsx`, `display/WelcomeWall/GoalWall/WordCloud` | Kiosk NFC → check_ins → realtime wall | ✅ real (kiosk only; see §NFC) |
| Admin | `admin/*` (14 pages) | Session/curriculum/member/kids/email admin | ⚠️ Partial; several bound to legacy model; `AdminLessonEditor.tsx` exists but is **not routed** (orphan) |

**UI-only / stub / orphaned flags:**
- `AdminLessonEditor.tsx` — file exists, **no route** in `App.tsx`. Dead unless linked.
- Legacy slide sync (`JoinSession.tsx:281`) **polls** `sessions.active_slide` rather than subscribing — `sessions` was never added to the realtime publication.
- Worksheet **PDF generation** exists client-side (`src/lib/generateWorksheetPdf.ts`, jsPDF) but online worksheet persistence in the LIVE Lesson historically used `localStorage`; reconcile per-page before relying on it.
- Video generation (`generate-session-video`, `bulk-generate-videos`, `analyse-video`, `shotstack-webhook`) is a whole subsystem that is **tangential** to the live-gathering product.

## 2. Data model (`supabase/` — 40 migrations, `src/integrations/supabase/types.ts`)

Tables that exist (grouped against what the target needs):

| Target concept | Existing table(s) | Verdict |
|---|---|---|
| Members | `profiles` (has `nfc_id`, `age_group`, `is_admin`, `live_display_mode`*), `user_roles` | ✅ present |
| Households (parent + children) | **none** — `cohorts`/`cohort_members` are group cohorts, not families. Kids tables carry `parent_initials`/`parent_conversation_notes` text only | ❌ **Not started** |
| Sessions | `sessions` (legacy) **and** `mindcast_live_sessions` (52 wk × audience) | ⚠️ **two parallel models** |
| Tracks (adult/teen/child) | `mindcast_live_sessions.audience` (`Adult/Teen/Child`), `kids_sessions`, `profiles.age_group` | ⚠️ audience is a column, not a first-class "parallel live room" with its own live state |
| Coursebook content | `mindcast_live_sessions`, `curriculum_weeks`, `kids_sessions` | ✅ seeded (migrations `2026052513…`, `…26180000`) — reconciles the old "0 rows" finding |
| **Live slide state** | Legacy `sessions.active_slide` (poll) + LIVE **Broadcast** channel (ephemeral) | ⚠️ **no durable per-session/track current-slide row** |
| Q&A submissions | `session_responses` (realtime, moderation `hidden`) | ✅ present |
| Personal journal | `workbook_entries`, `teen_/kids_workbook_entries`, `entries`, `commitments`, `bookmark_responses`, `implementation_checkins`, `domain_scores` | ⚠️ present but **privacy broken (§6)** |
| Attendance / check-ins | `check_ins` (+ `nfc_id` on profiles) | ⚠️ kiosk only, no session/track link |
| Payments / subscriptions | `pilot_applications`, `pilot_registrations` (one-time) | ❌ no recurring/subscription table |
| Admin roles | `user_roles` enum `app_role = member \| facilitator` | ❌ no admin/child/guardian roles |

`*` `live_display_mode`/`first_name`/`last_name` are read by `nfc-checkin` but **not present in `types.ts`** → schema/type drift; regenerate types and confirm columns exist. `VERIFY LIVE`.

## 3. Auth & roles

- Supabase email/password auth via `AuthContext.tsx`. Profile + role + cohort loaded on session.
- **`app_role` enum has only `member` and `facilitator`.** "Admin" in the app === `role === 'facilitator'` (`AdminRoute`, `App.tsx:91`). There is a second, **conflicting** admin signal — `profiles.is_admin` — that routing does **not** use. Two sources of truth for privilege.
- Privilege-escalation guard added 2026-07-02 (`prevent_profile_privilege_escalation` trigger blocks self-writes to `is_admin/is_active/nfc_id`). Good.
- **No facilitator-vs-admin distinction** (a room facilitator and a super-admin are the same role — and that role can read every journal).
- **No child/guardian-linked accounts.** A parent cannot own/manage a child profile or a child's journal. Kids workbook is just an age-grouped profile. This is a gap the brief explicitly flags as needing a decision.

**Rating: Partially Built.**

## 4. Real-time capability

- **LIVE coursebook (the important one):** Supabase Realtime **Broadcast** — `FacilitatorView.tsx` broadcasts slide index on channel `live:${code}`; `LiveJoin.tsx` subscribes and follows. This is the right, low-latency primitive for "pages turn live." ✅
- **Q&A:** `session_responses` via `postgres_changes` (INSERT/UPDATE/DELETE), `ALTER PUBLICATION … ADD TABLE`, `REPLICA IDENTITY FULL`. Facilitator subscribes; members do **not** subscribe to the raw feed (good for scale). ✅
- **Walls:** `check_ins`, `word_submissions`, `story_submissions` in publication → Welcome/Goal/Word walls update live. ✅
- **Legacy runner:** `sessions.active_slide` is **polled** in `JoinSession.tsx`; `sessions` is not in the realtime publication. ⚠️ (Only matters if you keep the legacy runner.)
- **Gap:** Broadcast is ephemeral. There is no persisted "current slide per session/track," so a member who joins late or reconnects sees a blank/stale follower view until the presenter next advances. Needs a durable `live_session_state` row (see Part 2).

**Rating: Built (for LIVE), with a durability gap.**

## 5. PWA status

- `public/manifest.json`: `standalone`, theme/background colors, 192/512 + **maskable** icons. ✅
- `src/main.tsx`: registers `/sw.js` in `PROD`. ✅
- `public/sw.js`: **push-only.** `push` + `notificationclick` handlers, `skipWaiting`/`clients.claim`. **No `fetch` handler, no precache, no offline shell, no runtime caching, no offline fallback.** ❌
- No install-prompt UX (`beforeinstallprompt`) found.

**Maturity: installable + web-push works; offline/app-shell = none.** Rating: **Partially Built** (roughly 2/5 vs best practice).

## 6. Security posture on the journal/notes feature — **highest priority**

Three distinct problems:

1. **Staff can read everyone's journal.** Every private table carries a `… _facilitator_read` / "Facilitators can view all …" policy granting `has_role(auth.uid(),'facilitator')` a `SELECT` over **all rows**. Examples:
   - `workbook_entries`: `workbook_facilitator_read` (`20260405211002…:63`)
   - `teen_workbook_entries` / `kids_workbook_entries`: `*_facilitator_read` (`20260405214355…:35,73`)
   - `entries`, `commitments`, `domain_scores`, `bookmark_responses`, `implementation_checkins`: "Facilitators can view all …" (`20260330…`, `20260401013131…`).
   This directly contradicts "journals unreadable by anyone but the member." It also means children's reflections are readable by any facilitator account.
2. **The ownership check is internally inconsistent (likely broken).** `workbook_own`/`teen_workbook_own`/`kids_workbook_own` = `USING (profile_id = auth.uid())`, but `profile_id` is `REFERENCES profiles(id)` where `profiles.id = gen_random_uuid()` and `profiles.user_id = auth.uid()`. The app writes `profile_id: user.id` (`Workbook.tsx:71`, `TeenWorkbook.tsx:66`, `KidsWorkbook.tsx:83`). So the value stored is the auth uid, which **violates the FK to `profiles.id`** — while the older `entries/commitments/…` tables correctly key on `user_id = auth.uid()`. The two conventions are mixed. Net effect: workbook writes/reads are on shaky ground and must be reconciled to a single, correct owner key. `VERIFY LIVE` (row-level test as a member).
3. **No encryption at rest beyond Supabase's disk encryption.** No `pgsodium`/field-level encryption on any reflection column.

**Rating: Not airtight — treat as the #1 fix.**

## 7. Payments

- `create-pilot-checkout/index.ts`: Stripe Checkout, **`mode: "payment"`** (one-time), price id **hardcoded** (`price_1TJ5p7EAvaJHDMD4hBGLHXbn`).
- `verify-pilot-payment`: confirms the pilot session and flips `pilot_registrations.payment_status`.
- `buy-worksheet`: one-time worksheet purchase.
- **No** `mode: "subscription"`, **no** Stripe **webhook** endpoint (the only `*-webhook` fn is `shotstack-webhook`, for video), **no** subscription/entitlement table, **no** membership-status sync (active/lapsed/paused), **no** customer billing portal, **no** household billing.

**Rating: Recurring membership = Not Started; one-time pilot pay = Built.**

## 8. Admin tooling

Extensive UI exists (`src/pages/admin/*`, 14 pages + `src/components/admin/*`): `AdminSessions`, `AdminSessionEditor`, `AdminLive`, `AdminPresenter`, `AdminSessionRunner`, `AdminMembers`, `AdminCurriculum`, `AdminKids`, `AdminApplicationsPage`, `AdminEmailReminders`, `AdminFramework`, `AdminHistory`. But:
- Much of it targets the **legacy `sessions`** model, not the multi-track `mindcast_live_sessions`.
- No **household/child-linking** management, no **subscription/payment health** view, no **track scheduling** (parallel rooms), no **Q&A moderation queue** dedicated screen (moderation is inline in `FacilitatorView`).
- `AdminLessonEditor.tsx` is orphaned (unrouted).

**Rating: Partially Built.**

### Part 1 ratings summary

| Area | Rating |
|---|---|
| Feature inventory | Built but fragmented across 3 product generations |
| Data model | Partially Built (2 parallel session models; no households/subscriptions) |
| Auth & roles | Partially Built (member/facilitator only; no admin/guardian split) |
| Real-time | **Built** (LIVE broadcast + Q&A), durability gap |
| PWA | Partially Built (installable + push; no offline) |
| Journal security | **Not airtight — critical** |
| Payments | Not Started (recurring) / Built (one-time) |
| Admin tooling | Partially Built |

---

# PART 2 — Gap analysis against the target flow

| Target step | Exists today? | Smallest path on current stack | Effort | Risk |
|---|---|---|---|---|
| **1. NFC tap → check-in → welcome w/ name + track** | Partial: `nfc-checkin` edge fn (kiosk, service-role, deduped) writes `check_ins`; Welcome Wall shows names. **No app/Core-NFC path; check-in not tied to auth member, session, or track.** | Add `session_id` + `track` to `check_ins`; Capacitor Core NFC in-app path posts to the **same** `nfc-checkin` pipeline; return track/room; render an authed welcome screen. | **L** | Capacitor + Core NFC native setup; App Store review; entitlement provisioning |
| **2a. Home dashboard — check-in status + today's session** | Partial: portal dashboards exist but on legacy model; no "today's live session for my track." | Query today's `mindcast_live_sessions` by `audience` + a new schedule row; show check-in state. | **M** | Needs a real session/track schedule table |
| **2b. Live slides advancing in real time** | **Yes** — Broadcast follower view (`LiveJoin`). | Add durable `live_session_state` (current slide) so reconnect/late-join resolves; keep broadcast for latency. | **S–M** | Reconnect/state-resume correctness |
| **2c. Inline Q&A text input on slides** | **Yes** — `session_responses` insert + facilitator feed. | Fix privacy defaults; add rate limiting; add a moderation queue view. | **S** | Q&A flooding (no rate limit today) |
| **2d. Personal notes autosave → private journal** | Partial: autosave patterns exist; **privacy is broken (§6).** | Reconcile owner key, drop facilitator-read, (optionally) encrypt; wire per-slide notes → journal. | **M** | Member-safety-critical |
| **3. Journals private (member-only, maybe guardian)** | **No** — facilitator reads all; owner key inconsistent. | RLS locked to a single correct `auth.uid()` owner column; remove blanket facilitator read; guardian access only via explicit household link (needs product decision). | **M** | Highest priority; **needs your decision on guardian access** |
| **4. Native-app feel, no reloads on slide advance** | Partial: broadcast already avoids reloads; but no offline shell, no Capacitor. | PWA hardening + Capacitor shells. | **M–L** | iOS PWA limits → Capacitor is the answer |

### Realtime performance at 100+ concurrent — assessment
- **Architecture is sound for scale.** Members hold a **Broadcast** subscription (cheap, no DB fan-out) and only the presenter subscribes to the `postgres_changes` Q&A feed. So 100+ members ≈ 100+ broadcast subscribers on one channel + a handful of facilitator DB-change subscribers. This is the pattern Supabase recommends.
- **Watch items:** (a) **concurrent connection ceiling** — Supabase Free ≈ 200, Pro ≈ 500 concurrent Realtime clients; 100+ members × parallel tracks × 2 tabs can approach Pro limits → size the plan (Part 4). (b) `REPLICA IDENTITY FULL` on `session_responses` increases WAL per change; fine at Q&A volumes, revisit if responses become chatty. (c) One channel per **session/track** (not one global) to bound fan-out.

### Capacitor + Core NFC implementation risk
- **Native shell:** net-new; no `@capacitor/*` in `package.json` today. Standard Vite→Capacitor wrap is well-trodden but adds iOS/Android build pipelines.
- **NFC plugin:** `@capacitor-community/nfc` (or `capacitor-nfc`) is community-maintained — pin a version, budget for quirks. iOS **Core NFC requires the NFC entitlement + a paid Apple Developer account** and a physical-device test loop.
- **App Store review:** 1–3 week first-submission timeline; NFC usage-string + entitlement must be justified. Budget a buffer before any launch date.
- **Kiosk = same pipeline:** the staff kiosk and the member app should both `POST` to `nfc-checkin` so Supabase is the single source of truth (it already is on the kiosk side). The **kiosk needs its own authenticated staff-only mode** (a device/staff token) because it scans *other people's* bracelets, whereas the member app scans only the owner's — different trust model, same event row.

---

# PART 3 — What to add (specific, fits current schema/stack)

### A. Admin dashboard (net-new sections; extend `src/pages/admin`)
- Member CRUD + **household/child linking** (new `households`, `household_members`).
- **Track scheduling:** new `live_sessions_schedule` (date, track/room, `mindcast_live_sessions` ref, status) so parallel adult/teen/child rooms are first-class.
- Live controls (start/advance/close Q&A) writing to a durable `live_session_state`.
- **Q&A moderation queue** screen (today moderation is inline only).
- Membership/payment health view (reads the new subscription table).
- Route the orphaned `AdminLessonEditor`.

### B. Member & payment system (Stripe recurring)
- New `create-subscription-checkout` edge fn (`mode: "subscription"`, monthly/termly price ids via **env**, not hardcoded).
- **Stripe webhook** edge fn (`verify_jwt=false`, signature-verified) → upsert `subscriptions(member_id, status, current_period_end, plan)` + mirror `profiles.membership_status` (`active/lapsed/paused`).
- Customer **billing portal** (`stripe.billingPortal.sessions.create`).
- **Household billing:** one payer, multiple linked child profiles → `subscriptions.household_id`.
- Admin visibility view over `subscriptions`.

### C. Secure journal database — **recommendation stated plainly**
1. **Baseline (do first, non-negotiable):** one correct owner column per journal table (standardize on `user_id uuid = auth.uid()`; migrate the `profile_id`-keyed workbook tables). RLS `USING/WITH CHECK (user_id = auth.uid())`. **Remove blanket `facilitator` SELECT** on journal tables. Guardian read only via an explicit `household_members` join, and only if you approve it.
2. **RLS-only vs RLS + field encryption — tradeoff:**
   - *RLS alone:* protects against other members and app-level access, and correctly-scoped staff. **But a leaked `service_role` key, a DB backup, or a Postgres superuser can still read plaintext.** Simple, fast, no key management.
   - *RLS + `pgsodium`/Vault field-level encryption on reflection columns:* protects even against backup/DB-admin exposure; the tradeoff is **key management, no server-side search on encrypted text, and more complex migrations/restores.**
   - **Recommendation:** For adult reflection content, **RLS-locked-to-owner + remove staff read is sufficient and should ship first.** For **children's** journal columns specifically (safeguarding-sensitive), add **field-level encryption** — the extra key-management cost is justified there. Don't gate the whole system on encryption; ship correct RLS now, layer encryption on the child tables next.

### D. Live coursebook / slide-sync engine
- Keep **Broadcast** for latency; add durable `live_session_state(session_id, track, current_slide, qa_open, updated_at)` and have the follower **resolve current slide on mount** then follow broadcast (fixes late-join/reconnect).
- One Realtime channel **per session/track**.
- Per-slide Q&A (`session_responses`, fixed defaults) + per-slide notes writing into the member's journal.

### E. NFC check-in (Capacitor)
- Add `@capacitor/core` + iOS/Android shells around the existing web build.
- `@capacitor-community/nfc` reads bracelet → in-app path **POSTs to the same `nfc-checkin`** endpoint (single source of truth in Supabase → Welcome Wall via Realtime).
- Extend `check_ins` with `session_id`, `track`, and `source` (`member_app | kiosk`).
- **Apple:** paid Developer account + Core NFC entitlement + usage string; budget review time.
- **Android:** it can technically stay a PWA + Web NFC path, **but** for a consistent event pipeline, one codepath, one store presence, and parity of the "tap your own phone" UX, **wrap Android with Capacitor too.** Recommend Capacitor both platforms; keep the browser/PWA route only as a no-install fallback.
- **UX split to handle in-app:** member-self-scan (authed as owner, trivial) vs **staff kiosk scan of someone else's bracelet** — kiosk needs an **authenticated staff-only mode** (device/staff token, no member session), reads any `nfc_id`, and is the fallback for no-app/phone/NFC failures.

### F. PWA hardening (shared web core)
- Service worker with **app-shell precache** + **stale-while-revalidate for static assets**, but **network-first / no-store for live session + journal data** (never serve stale slide/Q&A/journal).
- Offline fallback page; `beforeinstallprompt` UX; keep push (already working).
- This shared web layer is what both Capacitor shells and the browser fallback load.

---

# PART 4 — Operational essentials (production at 100+)

| Concern | Status today | Recommendation |
|---|---|---|
| **Error/session monitoring** | None (no Sentry/PostHog) | **Both, scoped:** **Sentry** for crash/error + release health + **source maps for the Capacitor shells** — a bug in a live 100-person session is an incident, not a metric. Add **PostHog** for product analytics + session replay + feature flags (flags let you dark-launch the live engine per track). If forced to pick one first: **Sentry.** |
| **Uptime monitoring** | None | UptimeRobot/BetterStack on: web app, each Edge Function health route, and a **synthetic Realtime check** (connect to a channel, expect a heartbeat) — a channel going dark mid-broadcast must page immediately, not appear in a weekly report. |
| **Scheduled jobs** | `pg_cron` + `send-practice-reminder`/`select-weekly-callbacks` (`verify_jwt=false`, manual 401 guard present) | Extend to: session reminders, **membership renewal / lapsed-payment follow-ups**, journal backup verification. **Standardize a `CRON_SECRET`** checked on *every* scheduled endpoint (the reminder fns already 401 without it — apply the same to all). |
| **Transactional email** | **Resend wired** (`send-practice-reminder`, `send-weekly-reminder`) | Reuse Resend for welcome/receipts/failed-payment/reminders/resets. **Prerequisite: SPF + DKIM + DMARC** on the sending domain (deliverability) — flag as setup, likely not yet done. |
| **AI/content tooling** | Lovable AI Gateway → **Gemini** (`ai-insights`, `analyse-video`, `moderate-content`); **Anthropic** in `generate-session-video` | Legit uses: auto **discussion prompts** and **session summaries** from *session* content. **Do NOT send member journal content to any third-party AI without explicit consent.** `ai-insights` already summarizes reflections via the gateway → this needs **explicit consent language** and an opt-out, or restrict it to non-journal inputs. Gemini for prompt/summary generation is a fine fit; gate anything journal-derived. |
| **Backups & durability** | Supabase managed (plan-dependent) | Confirm **PITR** is on (Pro add-on); write and **test a restore** — especially for journal tables. If child columns get field-encryption, rehearse restore *with* key recovery. |
| **Secrets management** | `.env` is **committed to git** (see finding) | Move to Vercel/Supabase env + secrets. Rotate anything that was ever committed. Keep `service_role` server-side only (it already is). |
| **Rate limiting / abuse** | **None** on `session_responses` insert or public forms | Add per-IP/per-user rate limit on Q&A submit (Edge Function token bucket or DB `check` + short-window count) so one actor/bug can't flood a live Q&A. |
| **Load/capacity** | Unknown plan | 100+ concurrent Realtime clients across parallel tracks likely exceeds **Free (~200)**; provision **Pro (~500)** and load-test one channel-per-track before the first big session. `VERIFY LIVE` current plan. |

### Additional gaps I'd flag (unasked)
- **`.env` committed to git.** It currently holds only the **publishable anon key + project id/url** (public by design, so no secret has leaked *yet*), but a committed `.env` invites a `service_role`/Stripe/Resend key being added later. Add `.env` to `.gitignore`, remove from tracking, and treat the anon key as rotatable. **Finding, not yet a breach.**
- **Children's data (safeguarding):** kids journal readable by all facilitators + no encryption + no guardian-consent model. This is the sharpest compliance risk (NZ Privacy Act / GDPR-Kids equivalents). Prioritize with §6.
- **PCI:** stay on Stripe Checkout/Elements (never touch raw card data) — current one-time flow already does; keep it that way for subscriptions.
- **Two admin signals** (`user_roles` vs `profiles.is_admin`) — collapse to one to avoid a privilege-check bypass.
- **Schema/type drift** (`nfc-checkin` reads columns absent from `types.ts`) — regenerate types in CI to prevent runtime column errors.
- **Two parallel session models** (`sessions` vs `mindcast_live_sessions`) — pick one as canonical for the live product and deprecate the other to avoid split-brain bugs.

---

# PART 5 — Output

## 5.1 Gap table

| Feature | Built? | Effort | Priority | Notes |
|---|---|---|---|---|
| Journal RLS locked to owner (remove staff read; fix owner key) | ❌ broken | M | **P0** | Member-safety-critical; children included |
| Field-level encryption for **child** journal columns | ❌ | M | P1 | RLS first; encrypt child tables next |
| Recurring Stripe subscriptions + webhook + status sync | ❌ | L | **P0** | Only one-time pilot pay exists |
| Household / child-guardian model + linking | ❌ | M | P1 | Needs product decision on guardian access |
| Admin/facilitator role split | ❌ | S | P1 | Enum is member/facilitator only |
| Durable `live_session_state` (late-join/reconnect) | ❌ | S–M | P1 | Broadcast works but is ephemeral |
| Live slide broadcast follower view | ✅ | — | — | Strongest part of build |
| Q&A insert + facilitator feed | ✅ | — | — | Fix privacy defaults (below) |
| Q&A privacy defaults (`is_public` OFF; filter private from feed) | ⚠️ | S | **P0** | Per prior audit; verify current state |
| Q&A rate limiting | ❌ | S | P1 | Flood protection |
| NFC check-in — kiosk pipeline | ✅ | — | — | Service-role, deduped, realtime wall |
| NFC — link check-in to session/track/member | ❌ | S–M | P1 | `check_ins` lacks session/track |
| NFC — Capacitor Core NFC app (iOS+Android) | ❌ | L | P1 | Native shells + store review |
| PWA offline shell / caching SW | ❌ | M | P1 | SW is push-only today |
| PWA installable + push | ✅ | — | — | manifest + web-push done |
| Track scheduling (parallel rooms) | ❌ | M | P1 | No schedule table |
| Admin: member/household/payment views | ⚠️ | M | P1 | Partial admin; net-new sections |
| Sentry + PostHog | ❌ | S–M | P1 | Live-session crash visibility |
| Uptime + Realtime synthetic monitor | ❌ | S | P1 | Alert on channel going dark |
| `CRON_SECRET` on all scheduled endpoints | ⚠️ | S | P1 | Some fns guarded; standardize |
| Transactional email (Resend) | ✅ | — | — | Add SPF/DKIM/DMARC |
| Rate limiting on public forms | ❌ | S | P1 | — |
| `.env` untracked + secret hygiene | ⚠️ | S | P1 | Committed but only anon key so far |
| Plan/tier for 100+ Realtime | ❓ | S | **P0** | Verify + likely upgrade to Pro |
| Backups: PITR + tested restore | ❓ | S | P1 | Especially journals |
| Video generation subsystem | ⚠️ | — | P3 | Exists but tangential to live product |

## 5.2 Recommended build order (what unblocks what)

**Phase 0 — Safety & truth (before any new feature):**
1. Fix journal RLS (single owner key, remove blanket facilitator read). *(Unblocks every journal feature safely.)*
2. Fix Q&A privacy defaults (`is_public` OFF, filter private from facilitator feed).
3. Confirm Supabase plan/Realtime limits; upgrade to Pro if needed. *(Unblocks 100-person sessions.)*
4. Untrack `.env`, rotate anon key, add secret hygiene.

**Phase 1 — Membership & identity (unblocks "paid, multi-track"):**
5. Role split (member/facilitator/**admin**) + collapse `is_admin` duplication.
6. `households` + `household_members`; guardian access policy (**after your decision**).
7. Stripe **subscriptions** + webhook + `subscriptions` table + `membership_status` sync + billing portal + household billing. *(Unblocks admin payment views.)*

**Phase 2 — Live engine hardening (unblocks reliable live sessions):**
8. Durable `live_session_state` + follower resolve-on-mount.
9. Track scheduling table + "today's session for my track" dashboard.
10. Q&A rate limiting + moderation queue screen.
11. Per-slide notes → journal wiring.

**Phase 3 — Native + offline (unblocks the "native app" feel & NFC-app path):**
12. PWA offline/app-shell SW (shared web core).
13. Capacitor shells (iOS + Android) + Core NFC → same `nfc-checkin` pipeline; kiosk staff-mode; `check_ins` session/track link. *(Longest lead time → start Apple Developer enrolment early, in parallel with Phase 1.)*

**Phase 4 — Ops (in parallel from Phase 0):**
14. Sentry (+ source maps) → PostHog; UptimeRobot + Realtime synthetic; `CRON_SECRET` everywhere; SPF/DKIM/DMARC; PITR + tested restore.

## 5.3 Open questions (answer before building the flagged items)

1. **Guardian access to a child's journal — allowed or not?** The brief says "possibly a parent, if a deliberate policy — ask before assuming." This changes the RLS and the household model. **Recommended default: guardian can read a child's *workbook/activity* entries but NOT free-form private reflection; child sees all their own.** Confirm.
2. **What's the minimum age for a self-account** (child taps own phone) vs guardian-proxy only? Drives whether child profiles authenticate directly.
3. **Membership plans:** exact monthly vs termly prices, and does one household payment cover all linked children, or per-child pricing?
4. **Facilitator vs admin:** should a room facilitator be able to see *attendance/Q&A* but not *member journals or payments*? (Recommended: yes — this is the whole point of Phase 0 #1.)
5. **Field-level encryption scope:** child journal columns only (recommended) or all journals? Affects search, restore, and effort.
6. **Canonical session model:** deprecate legacy `sessions` runner in favor of `mindcast_live_sessions`, or keep both? (Recommended: converge to avoid split-brain.)
7. **AI on journal content:** is `ai-insights` (reflection summaries) staying? If yes, we must add explicit consent + opt-out language before any journal text touches the AI gateway.
8. **Plan/tier + concurrency target:** confirm current Supabase plan and the true peak concurrent client count (members × tracks × tabs) so we size Realtime correctly.

---

*End of audit. No application code was changed — this is a read-only assessment. Items marked `VERIFY LIVE` require a query against the production database to confirm.*
