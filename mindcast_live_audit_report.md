# Mindcast LIVE — Lovable Build Audit Report

**Date:** 2026-05-25
**Repository:** `C:\GitHub\mindcast-inner-work`
**Branch audited:** `main` (HEAD `5020cf5`)
**Scope:** Verify every feature Lovable claimed to build for the Mindcast LIVE platform.

This audit is performed against the static repo (migrations + React/TS sources). Live Supabase queries (row counts, runtime RLS, YouTube URL fetches) were not run against the production DB — checks that require live data are flagged `WARN — cannot verify statically` with the reason.

---

## AUDIT 1 — Database Schema Verification

Source migration: `supabase/migrations/20260524173848_e1e6d2f3-82a2-4825-8235-3a86c28ead7e.sql`.

### 1.1 `mindcast_live_sessions`

| Check | Status | Detail |
|---|---|---|
| Table exists | PASS | Created at line 3 |
| 23 spec columns present | PASS | All 23 columns + `id`, `created_at`, `updated_at` (extras OK) |
| Column casing matches spec | WARN | Spec uses `Week_Number`, `Phase_Name`, etc. Actual schema uses lowercase `week_number`, `phase_name`. Front-end consistently uses lowercase, so this is a spec/build naming drift — no functional impact, but every column rename in the spec must be translated. |
| `audience` CHECK in ('Adult','Teen','Child') | PASS | Line 9 |
| Row count = 156 | **FAIL** | No seed migration exists for `mindcast_live_sessions`. Only `kids_sessions` is seeded (`20260504120000_seed_session1_kids.sql`). Table is **0 rows** unless populated through the admin UI. |
| Week numbers 1–52 each ×3 | **FAIL** | Cannot satisfy with empty table. |
| All three audiences per week | **FAIL** | Cannot satisfy with empty table. |

### 1.2 `session_responses`

| Check | Status | Detail |
|---|---|---|
| Table exists | PASS | Line 41 |
| `id uuid PK` | PASS | Line 42 |
| `session_id text` | **FAIL** | Column is named **`session_code`**, not `session_id`. Front-end consistently uses `session_code` (LiveJoin.tsx:50, FacilitatorView.tsx:122) — the spec name is wrong or the migration is. Functional but mismatched. |
| `week_number int` | PASS | Line 44 |
| `audience_type text` | PASS | Line 45 (default `'Adult'`) |
| `user_id text nullable` | WARN | Column is **`uuid`** (line 46), not `text`. Nullable: yes. Closer to correct than spec. |
| `display_name text` | PASS | Default `'Anonymous'` |
| `response_text text, max 300` | WARN | Column has no length constraint at the DB level. Front-end clips with `.slice(0, 300)` (LiveJoin.tsx:54, 129) and counter shown — soft enforcement only. |
| `prompt_type text` | PASS | Default `'journaling'` |
| `is_public boolean default false` | **FAIL** | Default is **`true`** (line 50). Spec requires `false`. This means any response submitted without the toggle gets broadcast. |
| `show_name boolean default true` | PASS | Line 51 |
| `created_at timestamptz` | PASS | Line 53 |
| Extra: `hidden boolean` for moderation | INFO | Not in spec but supports Audit 3 #8 — fine. |

### 1.3 `unlocked_lessons`

| Check | Status | Detail |
|---|---|---|
| Table exists | PASS | Line 67 |
| `id uuid` | PASS | |
| `user_id uuid` | **FAIL — CRITICAL** | **Column is missing.** `UNIQUE(week_number)` (line 69) means an unlock row is **global for all users** — every member is unlocked simultaneously. Spec requires per-user unlock granularity. |
| `week_number int` | PASS | |
| `unlocked_at timestamptz` | PASS | |
| `facilitator_id uuid` | PASS | Line 71 |

### 1.4 `worksheets`

| Check | Status | Detail |
|---|---|---|
| Table exists | PASS | Line 80 |
| `id uuid` | PASS | |
| `week_number int` | PASS | |
| `audience_type text` | PASS | |
| `pdf_url text` | PASS | |
| `created_at timestamptz` | PASS | |
| Extras `video_url`, `price_nzd` | INFO | Not in spec but harmless |

### 1.5 RLS policies

| Policy | Status | Detail |
|---|---|---|
| `mindcast_live_sessions` read for authenticated | WARN | Policy `sessions_read_all USING (true)` — also exposes data to **anonymous** users. Tighten if content is gated. |
| `session_responses` insert by anyone (audience join) | PASS | `responses_insert_any FOR INSERT WITH CHECK (true)` |
| `session_responses` facilitator read | PASS | `responses_facilitator_read` + `responses_read_public` (anon reads public-only) |
| `unlocked_lessons` facilitator-only insert/update | PASS | `unlocked_facilitator_manage FOR ALL` (line 75) |
| `worksheets` read for authenticated | WARN | `worksheets_read_all USING (true)` allows anonymous read; tighten if paid asset. |

**Section 1 verdict: FAIL** — critical schema deviation (`unlocked_lessons.user_id` missing), critical default value wrong (`is_public default true`), and zero seed data for the 156 expected lesson rows.

---

## AUDIT 2 — Slideshow Component Verification

Source: `src/pages/mindcast-live/FacilitatorView.tsx` (525 lines). Route registered at `src/App.tsx:118`.

| # | Check | Status | Line(s) |
|---|---|---|---|
| 1 | Route `/mindcast-live/facilitate/:weekNumber` | PASS | App.tsx:118 (wrapped in `<AdminRoute>`) |
| 2 | 13 slides in spec order | PASS | `SLIDE_TITLES` at FacilitatorView.tsx:13–17; `SlideRenderer switch (slide)` cases 0–12 at lines 326–451 render exactly: Title → Signal Metaphor → Ancient Wisdom → Opening Hook → Core Concept → Teaching Points → Reflection 1 → Experiential Exercise → Guided Reflection → Reflection 2 → Weekly Practices → Video → Affirmation. |
| 3 | Progressive-disclosure Teaching Points | PASS | `revealCount` state at line 77, increment in `goNext` line 157–162, rendered slice at line 377; helper text at line 385. |
| 4 | Slides 7 & 10 activate live response panel | PASS | `onReflection = slide === 6 \|\| slide === 9` at line 205 — that is the 7th and 10th slide (0-indexed). Panel renders at line 246. |
| 5 | Facilitator Notes in side drawer, not main slide | PASS | Drawer at lines 302–318 (`AnimatePresence`); `session.facilitator_notes` does **not** appear in any case of `SlideRenderer`. |
| 6 | Audience selector switches data source | PASS | Buttons at lines 218–221; `audience` state in load-session effect at line 100 (`.eq("audience", audience)`); reloads on change via deps `[week, audience]` line 105. |
| 7 | "Unlock this lesson" button → Supabase | PASS | Button at line 223–226 calls `handleUnlock` at line 185; inserts into `unlocked_lessons` line 188–189. See Audit 4 for the data-model problem. |
| 8 | Arrow-key navigation | PASS | `onKey` at lines 171–176 — `ArrowRight`, `ArrowLeft`, plus `Space` and `f` for fullscreen. |
| 9 | Full-screen toggle | PASS | `toggleFs` at lines 165–168; button at line 228. |

**Section 2 verdict: PASS** — slideshow component is the strongest part of the build.

---

## AUDIT 3 — Live Response System Verification

Sources: `src/pages/mindcast-live/LiveJoin.tsx` (163 lines), `FacilitatorView.tsx`.

| # | Check | Status | Detail |
|---|---|---|---|
| 1 | 6-char alphanumeric code generator | PASS | `genCode` at FacilitatorView.tsx:54 — 6 chars from a 31-symbol unambiguous alphabet (omits `I`,`L`,`O`,`0`,`1`). |
| 2 | `/live/:sessionCode` renders without login | PASS | App.tsx:115 — not wrapped in `ProtectedRoute`. |
| 3a | Display name input | PASS | LiveJoin.tsx:73–75 |
| 3b | Response text max 300 + counter | PASS | textarea + `.slice(0, 300)` at line 129; counter at line 134 |
| 3c | "Share on screen" toggle defaults **OFF** | **FAIL** | LiveJoin.tsx:23 — `useState(true)`. Defaults ON. Combined with the DB default of `is_public=true`, every response is broadcast unless the user opts out. |
| 3d | "Show my name" toggle defaults **ON** | PASS | LiveJoin.tsx:22 — `useState(true)` |
| 3e | Submit button | PASS | line 142 |
| 4 | On submit writes `is_public` + `show_name` | PASS | LiveJoin.tsx:49–58 |
| 5 | Facilitator realtime subscription | PASS | FacilitatorView.tsx:127–135 — `postgres_changes` (INSERT + UPDATE) filtered by `session_code=eq.${code}`. **Note:** `ALTER PUBLICATION supabase_realtime ADD TABLE session_responses` is set (migration line 63), so the stream works. |
| 6 | Private responses (`is_public=false`) excluded from facilitator live feed | **FAIL** | FacilitatorView.tsx:118–125 fetches all rows by `session_code` without filtering `is_public`, and the INSERT subscription (line 129) also has no `is_public` filter. Because the facilitator passes RLS via `responses_facilitator_read`, private responses arrive in the feed. The spec says they must not. |
| 7 | `show_name=false` displays "Anonymous" | PASS | FacilitatorView.tsx:267 — `{r.show_name ? r.display_name : "Anonymous"}`. Additionally LiveJoin.tsx:53 already substitutes `"Anonymous"` for `display_name` when `showName` is false (belt-and-braces). |
| 8 | Individual moderation hide | PASS | `hideResponse` at FacilitatorView.tsx:195–198; X button at line 269. |
| 9 | QR code on reflection slides | PASS | Slide 7 (case 6, line 391) shows join URL; slide 10 (case 9, line 414) shows code; side-panel QR at line 254; full QR in notes drawer at line 313. The standalone `<QRCode>` does not appear on the slide *body* of case 6/9 — only the URL/code text is shown. The QR is on the response panel, which is co-located. WARN if you require the QR to render on the slide itself even when the panel is collapsed. |

**Section 3 verdict: FAIL** — two correctness bugs that directly affect a live session: `Share on screen` defaults ON, and the facilitator feed shows private responses.

---

## AUDIT 4 — Lesson Library Lock/Unlock

Sources: `src/pages/mindcast-live/Library.tsx`, `Lesson.tsx`.

| # | Check | Status | Detail |
|---|---|---|---|
| 1 | Route `/mindcast-live/library` | PASS | App.tsx:116 (`<ProtectedRoute>`) |
| 2 | 52 week cards rendered | PASS | Library.tsx:25–27 pads missing weeks up to 52. |
| 3 | Default state: all locked for new user | WARN | This depends on `unlocked_lessons` being empty. Since unlock rows are global (no `user_id`), a new user inherits whatever was unlocked for everyone else — they may already see lessons as unlocked. |
| 4 | Padlock + greyed styling for locked | PASS | Library.tsx:60–64 |
| 5 | Unlocked: full colour + link | PASS | Library.tsx:74–78 |
| 6 | "Unlock this lesson" inserts row | PASS | FacilitatorView.tsx:188–189 inserts `{ week_number, facilitator_id }`. |
| 7 | Library queries `unlocked_lessons` for current user | **FAIL** | Library.tsx:19 — `from("unlocked_lessons").select("week_number")` with **no** `eq("user_id", …)` filter. Consequence: unlocks are global, not per-user, matching the schema (Audit 1.3 FAIL). |
| 8 | Direct URL to locked lesson is blocked | PASS | Lesson.tsx:43–54 — if `isUnlocked === false`, renders the LOCKED screen instead of content. |
| 9 | Progress counter from completions | **FAIL** | Library.tsx:42 shows `${unlockedCount} of 52 lessons unlocked`. This counts unlocks, not worksheet submissions. No `session_responses`/completions query exists. |

**Section 4 verdict: FAIL** — global unlock model breaks the per-user gating story and progress is measured against the wrong source.

---

## AUDIT 5 — Worksheet Feature

| # | Check | Status | Detail |
|---|---|---|---|
| 1 | Printable PDF generation (jsPDF / Puppeteer / edge fn) | **FAIL** | No `jsPDF`, no `pdf-lib`, no Puppeteer dependency; no worksheet generation edge function (`supabase/functions/`: only `ai-insights`, `analyse-video`, `create-pilot-checkout`, `moderate-content`, `send-weekly-reminder`, `verify-pilot-payment`). |
| 2 | 7 required sections rendered | **FAIL** | No worksheet component exists for Mindcast LIVE weeks. The closest analogue (`src/pages/Workbook.tsx`) is the existing membership workbook and is not wired to `mindcast_live_sessions`. |
| 3 | Storage bucket `worksheets` exists | PASS | Migration line 96 — `INSERT INTO storage.buckets ('worksheets','worksheets', true)`. |
| 4 | PDF stored in bucket, URL in `worksheets` table | **FAIL** | No code writes to either. Table is created but unpopulated. |
| 5 | Download button retrieves correct PDF | **FAIL** | No download button found in `Library.tsx` or `Lesson.tsx`. |
| 6 | Stripe product/price for worksheet purchase | **FAIL** | Only `price_1TJ5p7EAvaJHDMD4hBGLHXbn` is referenced (`supabase/functions/create-pilot-checkout/index.ts:84`) and that is the pilot-membership price. No worksheet price ID and no checkout flow for worksheets. |
| 7 | Online worksheet saves to Supabase | **FAIL** | `Lesson.tsx:135–142` (`SaveTextarea`) writes to **`localStorage`** only — never reaches Supabase. |
| 8 | Returning prefills saved responses | PASS (degraded) | LocalStorage prefill works on same device/browser only — not cross-device. |

**Section 5 verdict: FAIL** — the worksheet feature is essentially unbuilt. Storage bucket and table exist as scaffolding; nothing else.

---

## AUDIT 6 — Security & Edge Cases

| # | Check | Status | Detail |
|---|---|---|---|
| 1 | Service-role key in frontend | PASS | No `service_role` / `SUPABASE_SERVICE_ROLE_KEY` references anywhere in `src/`. |
| 2 | Hardcoded env vars | PASS (with one note) | `client.ts` uses `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. No URLs, anon keys, or Stripe secrets are inlined in `src/`. **Note:** Stripe price ID `price_1TJ5p7EAvaJHDMD4hBGLHXbn` is hardcoded in the edge function (price IDs are public — acceptable, but consider moving to env for testability). |
| 3 | `/live/:sessionCode` cannot read other members' private responses | PASS | RLS policy `responses_read_public USING (is_public = true AND hidden = false)` enforces this at the DB level for anonymous joiners. The audience page does not currently render *any* other responses anyway — the facilitator broadcasts state, not the response stream. |
| 4 | Non-facilitator cannot unlock | PASS | DB enforces via `unlocked_facilitator_manage`. Client also gates at FacilitatorView.tsx:186 and route is wrapped in `<AdminRoute>` (App.tsx:118). |
| 5 | `Video_Link` URLs valid YouTube | **WARN — cannot verify statically** | Live-fetch was not run. The parser at FacilitatorView.tsx:504 and Lesson.tsx:58 accepts `youtu.be/{11-char}` and `youtube.com/{watch?v=|embed/|v/}{11-char}` — anything else silently falls back to "No video link configured". With the table empty (Audit 1.1), there are 0 URLs to check. |

**Section 6 verdict: PASS** — no critical security exposure in front-end code. Two non-secret leakages (Stripe price ID, anon RLS reads of session content and worksheets) flagged.

---

## AUDIT 7 — Video Generation Feature

| # | Check | Status | Detail |
|---|---|---|---|
| 1 | "Generate Session Video" button on facilitator dashboard | **FAIL** | No such button. Grep across `src/` for `Generate.*Video`, `Runway`, `Pika`, `claude-sonnet`, `claude-opus`, `anthropic` returns zero matches in app code (only one mention in `About.tsx`/`TermsPage.tsx` about AI imagery in marketing copy). |
| 2 | `Film_Script_2min` piped to a video API | **FAIL** | Column exists in DB (`film_script_2min`) and `Session` type (FacilitatorView.tsx). It is **never read** in any component. |
| 3 | API integrated (Runway / Pika / Anthropic fallback) | **FAIL** | None. The two AI-touching edge functions are `ai-insights` (reflection summaries) and `analyse-video` (existing video analysis), both call the **Lovable AI Gateway** (`LOVABLE_API_KEY`) — neither generates video from a script. |
| 4 | API keys in env vars | N/A | Nothing to verify. |
| 5 | Anthropic fallback uses `claude-sonnet-4-5+` | **FAIL** | Not implemented. |
| 6 | Output stored in Supabase | **FAIL** | Not implemented. (`worksheets.video_url` column exists but unused.) |
| 7 | Gap explicitly noted | **GAP** | **Feature is not implemented.** |

**Section 7 verdict: FAIL — feature absent.**

---

## SUMMARY TABLE

| Feature | Status | Critical Issues | Notes |
|---|---|---|---|
| 1. Database schema | **FAIL** | `unlocked_lessons.user_id` missing (global unlock); `is_public` default = `true`; 0 seed rows in `mindcast_live_sessions` (expected 156) | Column-name casing differs from spec but is consistently used; `session_id` is actually `session_code`. |
| 2. Slideshow component | **PASS** | None | All 13 slides, progressive disclosure, drawer notes, audience switching, keyboard nav, fullscreen all present. |
| 3. Live response system | **FAIL** | "Share on screen" toggle defaults ON instead of OFF; facilitator feed includes `is_public=false` responses | Code generator, realtime sub, moderation, anonymous display all work. |
| 4. Lesson library lock/unlock | **FAIL** | Library queries `unlocked_lessons` with no `user_id` filter (consequence of #1); progress counter counts unlocks not completions | 52-card grid, locked URL guard, and unlock action otherwise function. |
| 5. Worksheet feature | **FAIL** | PDF generation, sections, storage upload, download button, Stripe price, Supabase persistence — none implemented | Only the storage bucket and `worksheets` table scaffolding exist; online responses use `localStorage`. |
| 6. Security & edge cases | **PASS (1 WARN)** | None blocking | `mindcast_live_sessions` and `worksheets` RLS read policies allow anonymous reads — tighten if these are paid/gated. |
| 7. Video generation | **GAP** | Feature is absent end-to-end | `film_script_2min` column never read; no UI, no API integration. |

---

## CRITICAL ISSUES — Would Break a Live Session

1. **No lesson content in the database.** `mindcast_live_sessions` is empty. Every slide, every library card, every lesson page will render `LOADING…` or `TBA`. A facilitator cannot run a session. *(Audit 1.1 — must seed 156 rows before launch.)*
2. **`Share on screen` defaults ON.** Every audience submission is broadcast to the live screen unless the user toggles off — privacy promise broken. *(LiveJoin.tsx:23 + migration line 50.)*
3. **Facilitator live feed surfaces private responses.** A participant who toggled "Share on screen" OFF will still see their response appear on the facilitator's screen. *(FacilitatorView.tsx:118–135.)*
4. **Per-user unlock is not implemented.** `unlocked_lessons` has no `user_id`. Any unlock applies globally. If a facilitator unlocks Week 5 for Cohort A, every user (including those in Cohort B) instantly sees Week 5 unlocked. *(Migration line 67–72; Library.tsx:19; FacilitatorView.tsx:188.)*
5. **Worksheet feature is not built.** PDF generation, storage write, download UI, Stripe price, Supabase-backed online worksheet — all missing. Members cannot get worksheets through the app. *(Section 5.)*
6. **Video generation feature is not built.** *(Section 7.)*

---

## RECOMMENDED FIX ORDER

| # | Priority | Fix | Why first |
|---|---|---|---|
| 1 | P0 | Seed `mindcast_live_sessions` with 156 rows (52 weeks × 3 audiences) | Without data the app is dark; nothing else matters. |
| 2 | P0 | Flip `is_public` default to `false` (migration ALTER + LiveJoin.tsx:23 `useState(false)`) | One-line change that prevents accidental public sharing. |
| 3 | P0 | Filter facilitator feed by `is_public=true` (FacilitatorView.tsx:118 query + line 129 channel filter) | Honours the toggle the user just set. |
| 4 | P1 | Add `user_id uuid` to `unlocked_lessons`, drop `UNIQUE(week_number)`, add `UNIQUE(user_id, week_number)`, scope `Library.tsx:19` and `FacilitatorView.tsx:188` accordingly | Core multi-tenant safety. |
| 5 | P1 | Implement Worksheet generation: jsPDF (client) or Puppeteer edge function; persist to `worksheets` bucket; populate `worksheets` table; add Download button on `Lesson.tsx` | Largest missing feature; required for paid offering. |
| 6 | P1 | Replace `SaveTextarea`/`PracticeRow` localStorage in `Lesson.tsx:135–158` with `session_responses` writes (and rehydrate on mount) | Required for "returning to a completed worksheet pre-populates". |
| 7 | P2 | Implement progress counter from worksheet completions (new `lesson_completions` table or count distinct `session_responses.user_id + week_number`) | Updates Library counter to mean what spec says. |
| 8 | P2 | Tighten `sessions_read_all` and `worksheets_read_all` RLS to `authenticated` only | Defence in depth — don't leak content to crawlers. |
| 9 | P2 | Add Stripe price for worksheet bundle; expose `price_id` via env var; build checkout flow | Monetisation path. |
| 10 | P3 | Implement Video Generation: "Generate Session Video" button on facilitator dashboard → edge function that passes `film_script_2min` to Anthropic `claude-sonnet-4-5` for a structured storyboard fallback, store output in `worksheets.video_url` or a new `session_videos` table | Largest gap, but content can be added manually via `video_link` in the meantime. |

---

## PROMPT FOR LOVABLE

Paste this into Lovable as the next instruction:

```
Mindcast LIVE audit follow-up — please fix the following, in order, in a single PR.
Reference paths/lines are relative to repo root.

P0 — Data seeding
- Create migration `seed_mindcast_live_sessions.sql` that inserts 156 rows
  into public.mindcast_live_sessions (week_number 1..52 × audience Adult/Teen/Child).
  Use the existing curriculum source (FRAMEWORK.md / curriculumData.ts) to populate
  theme_title, phase, phase_name, signal_metaphor, ancient_wisdom_reframe,
  session_title, opening_hook, core_concept, teaching_points,
  experiential_exercise, guided_reflection, journaling_prompt,
  weekly_practice_mon/wed/sun, core_affirmation, video_link, video_description,
  video_backup_description, film_script_2min, facilitator_notes.
- Validate row count = 156, week_number ∈ [1..52] each appearing 3 times,
  three audiences per week.

P0 — Live-response privacy
- supabase/migrations: ALTER TABLE public.session_responses
  ALTER COLUMN is_public SET DEFAULT false.
- src/pages/mindcast-live/LiveJoin.tsx:23 — change
  `useState(true)` to `useState(false)` for `shareOnScreen`.
- src/pages/mindcast-live/FacilitatorView.tsx:118–125 — add
  `.eq("is_public", true)` to the initial fetch.
- FacilitatorView.tsx:129 — add `is_public=eq.true` to the postgres_changes
  filter for INSERT, and inside the UPDATE handler drop rows where
  `p.new.is_public === false`.

P1 — Per-user unlocks
- New migration:
  ALTER TABLE public.unlocked_lessons ADD COLUMN user_id uuid REFERENCES auth.users(id);
  ALTER TABLE public.unlocked_lessons DROP CONSTRAINT unlocked_lessons_week_number_key;
  ALTER TABLE public.unlocked_lessons ADD CONSTRAINT unlocked_lessons_user_week_key UNIQUE(user_id, week_number);
- Update FacilitatorView.tsx:188–189 to insert `{ week_number, facilitator_id,
  user_id: targetUserId }`. Add a cohort/user picker on the slideshow header so
  the facilitator chooses *who* to unlock for (default: all members of the
  facilitator's active cohort — bulk insert).
- Update Library.tsx:19 to `.from("unlocked_lessons").select("week_number").eq("user_id", user.id)`.
- Update Lesson.tsx:32–35 likewise.

P1 — Worksheet feature
- Install `jspdf` and `jspdf-autotable`.
- Create src/lib/worksheet.ts exporting `generateWorksheetPDF(session, audience)`
  that produces a PDF with all 7 required sections:
  1) Session header (week number, theme_title, audience, date field)
  2) Signal Metaphor
  3) Core Concept (abbreviated)
  4) Reflection prompt with lined write space
  5) Exercise notes space
  6) Weekly practice tracker (Mon/Wed/Sun with checkboxes)
  7) Core Affirmation styled box + Notes space + Footer (brand + QR to /live/{code} placeholder)
- Add a "Download worksheet (PDF)" button on Lesson.tsx beneath the Affirmation block.
- Add edge function `generate-worksheet` that does the same server-side, uploads
  the PDF to the `worksheets` storage bucket, and upserts a row into
  `public.worksheets` with the public URL.

P1 — Persist online worksheet responses
- src/pages/mindcast-live/Lesson.tsx:135–158 — replace SaveTextarea/PracticeRow
  localStorage with `session_responses` writes (prompt_type='worksheet',
  is_public=false, show_name=false) and rehydrate on mount via:
    .from("session_responses")
      .select("response_text, prompt_type")
      .eq("user_id", user.id).eq("week_number", week).eq("audience_type", audience)

P2 — Progress counter
- Create table `lesson_completions(user_id uuid, week_number int, completed_at timestamptz, PRIMARY KEY(user_id, week_number))`.
- Mark complete when the user submits the worksheet (above).
- Library.tsx:42 — replace "X of 52 lessons unlocked" with
  "X of 52 completed" sourced from lesson_completions for current user.

P2 — RLS hardening
- Change `sessions_read_all` and `worksheets_read_all` to
  `USING (auth.role() = 'authenticated')`.
- Keep `worksheets_public_read` storage policy as is (PDFs are signed-URL OK).

P2 — Stripe worksheet bundle
- Add a Stripe price ID env var `VITE_STRIPE_WORKSHEET_BUNDLE_PRICE_ID`
  (do not hardcode). Wire a "Buy worksheet bundle" CTA on /portal/downloads
  to a new edge function `create-worksheet-checkout` modelled after
  supabase/functions/create-pilot-checkout/index.ts.

P3 — Video generation
- Add `<Button>Generate Session Video</Button>` on FacilitatorView.tsx
  top-bar (visible only when role === 'facilitator').
- Create edge function `generate-session-video` that:
    a) reads session.film_script_2min for {week, audience}
    b) POSTs to Anthropic Messages API with model 'claude-sonnet-4-5' (or
       latest available), system prompt asking for a structured 8-shot
       storyboard JSON {scene, narration, visuals, duration_sec}
    c) renders the storyboard to a PDF (jsPDF, server side) and uploads
       to the `worksheets` bucket
    d) updates `worksheets.video_url` with the PDF URL.
  Use `ANTHROPIC_API_KEY` from Deno.env — never hardcode.

Acceptance criteria
- `select count(*) from mindcast_live_sessions` = 156.
- `select is_public from session_responses limit 1` default is false.
- Facilitator live feed shows zero responses with is_public=false.
- A second user does NOT see Week N unlocked just because Week N was unlocked for user 1.
- Lesson.tsx Download worksheet button produces a non-empty PDF.
- Online worksheet responses survive logout/login on a different device.
- Build passes `bun run build` with no TS errors.
```

---

*End of audit report.*
