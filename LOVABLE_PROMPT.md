# Lovable Prompt — Wire the 52-Week Lesson Content, Interactive Activities & Member Journals

Paste everything below the line into Lovable. It is written to be run against the
current Mindcast codebase after the two new migrations
(`20260711160000_curriculum_content_v2.sql` and `20260711160100_lesson_journal.sql`)
have been applied to Supabase.

---

## Context you need to know before making changes

Mindcast is a facilitated, in-theatre, 52-week membership journey with three tracks
(Adult / Teen / Child). Every week has a Sunday live session (facilitated on a big
screen) and a midweek "Life Group". We have just extended the database with the full
updated lesson content and a private member journal. Your job is to wire the app to
that content — **do not invent new content or new tables.**

**Important content rule — no deity language.** Mindcast never uses or references
"God", "the Lord", "the divine", or any external deity. Where source teachings (Dao,
A Course in Miracles) use those words, they are always reframed as *one's own inner
self, inner spirit, internal dialogue, and belief system.* Keep all copy, prompts,
and generated text consistent with this. If you find any deity language in existing
components or seed content, reframe it.

### Consolidation already done — mindcast-live is the ONE live system
The legacy admin session runner has been retired: `AdminSessions`,
`AdminSessionEditor`, `AdminPresenter`, `AdminSessionRunner`, `AdminLive`,
`SessionSlideshow`, and the portal-admin "Sessions"/"Live Mode" tabs are removed,
and their old routes redirect to `/mindcast-live/library`. **Do not re-add them.**
All live facilitation now runs through `mindcast-live` (`FacilitatorView` at
`/mindcast-live/facilitate/:weekNumber`, reached from the coursebook Library). The
display walls (`/display`, `/display/goals`, `/display/wordcloud`) are kept.

`FacilitatorView` now already merges the `curriculum_weeks` lesson row over
`mindcast_live_sessions` (YouTube URL, reflective question, interactive activity,
inner-wisdom alignment) as fallbacks. Your job is to deepen that wiring per below.

### There are currently TWO content sources — reconcile them

1. **`curriculum_weeks`** — the 52-week source of truth used by the **member portal**
   (`useCurriculumWeeks` hook → `PortalWeek`, `PortalWeeks`, `PortalDashboard`).
   The new migration just added these columns to it:
   - `core_learning`
   - `youtube_url`, `youtube_title`, `youtube_runtime`
   - `reflective_question`
   - `interactive_activity`
   - `kids_picture_book`, `kids_picture_book_note`
   - `kids_colouring_prompt`
   - `inner_wisdom_alignment`  (the Dao/ACIM reframe, no deity language)

2. **`mindcast_live_sessions`** — the older 156-row table the **FacilitatorView**
   (`src/pages/mindcast-live/FacilitatorView.tsx`) reads from for the live slides
   (columns like `theme_title`, `core_concept`, `signal_metaphor`, `teaching_points`,
   `video_link`, `guided_reflection`, `core_affirmation`).

**These duplicate the same lessons.** Make `curriculum_weeks` the single source of
truth. Update FacilitatorView (and any live view) to read the lesson body from
`curriculum_weeks` joined on `week_number` + track, using the new columns
(`youtube_url` for the video, `reflective_question`, `interactive_activity`,
`inner_wisdom_alignment`, and for the child track `kids_picture_book` +
`kids_colouring_prompt`). Keep `mindcast_live_sessions` only for the slide-specific
fields that don't exist in `curriculum_weeks` yet (e.g. `signal_metaphor`,
`opening_hook`, slide ordering) — or migrate those into `curriculum_weeks` too if you
prefer one table. Do not break the existing 14-slide flow in `SLIDE_TITLES`.

---

## What to build

### 1. Portal lesson pages — surface the new fields
In `PortalWeek` (and the week list in `PortalWeeks`), for the member's track show:
- the weekly theme + `core_learning`
- an embedded YouTube player from `youtube_url` (with `youtube_title` /
  `youtube_runtime` shown), only when the field is non-empty
- the `reflective_question`
- a description of that week's `interactive_activity`
- the `inner_wisdom_alignment` note as a short "inner wisdom" callout
- **Child track only:** `kids_picture_book` (+ `kids_picture_book_note`) and a button
  to view/download the `kids_colouring_prompt` (this is a Google-flow image-gen prompt
  that produces an A4 colouring page for that week's theme)

### 2. Live session — join codes + interactive activities
The live join flow already works: FacilitatorView generates a 6-char `code`
(`genCode`), writes slide state to `live_session_state` (keyed by `session_code`),
and members join via `LiveJoin` and submit to `session_responses`
(filtered by `session_code`, streamed back via `postgres_changes`).

For each week's `interactive_activity`, render the matching in-session input on the
member's `LiveJoin` screen and the aggregate on the facilitator screen. Support these
activity types (drive them off a simple `activity_type` you parse from
`interactive_activity`, defaulting to open text):
- **word cloud** — members submit a word/phrase; facilitator sees a live cloud
- **poll** — members pick an option; facilitator sees live tallies
- **open reflection / Q&A** — members submit text; facilitator can feature responses
  (this already exists via `featured_callbacks` — reuse it)

Reuse `session_responses` for all of these (it already has `display_name`,
`response_text`, `is_public`, `hidden`, `moderation_status`). Do **not** create a new
responses table. Keep the existing moderation + hide logic.

**Verify per lesson:** for every one of the 52 weeks, confirm the facilitator can
start a session, a member can join with the code / QR, and the week's interactive
activity round-trips (submit → appears on the facilitator wall). Add a lightweight
facilitator "test this lesson" affordance if one doesn't exist.

### 3. Member journals — the new `lesson_journal` table
A new table `lesson_journal` now exists, keyed `(profile_id, week_number, track)`
with columns `reflection_answer`, `activity_response`, `personal_notes`,
`life_group_notes`. **RLS is already set: owner read/write only, plus linked-guardian
READ (no write). Do not weaken these policies — journals are private and must never be
readable by facilitators or admins.**

Wire it into the portal:
- On `PortalWeek`, give the member a private journal panel for that week:
  - their answer to the `reflective_question` → `reflection_answer`
  - what they took from the `interactive_activity` → `activity_response`
  - free Sunday journaling → `personal_notes`
  - a separate "Life Group notes" box (midweek) → `life_group_notes`
- Autosave / upsert on `(profile_id, week_number, track)`.
- On `PortalProgress` / `PortalDashboard`, show which weeks have journal entries as a
  progress signal (count only — never expose another member's journal content).
- If a member is a linked guardian of a child/teen, let them **read** (not edit) that
  child's journal for a week, matching the existing guardian-read model.

### 4. Don't break these
- The 14-slide `SLIDE_TITLES` flow and slide sync via `live_session_state`.
- Existing RLS on `session_responses`, `lesson_journal`, and the workbook tables.
- The no-deity content rule everywhere.

---

## Acceptance checklist
- [ ] `curriculum_weeks` is the single lesson source; FacilitatorView reads its body
      from it (video, reflective question, activity, alignment; child book + colouring).
- [ ] Portal week pages show the new fields per track, child track shows book +
      colouring page.
- [ ] Join code + QR work; each week's interactive activity round-trips to the
      facilitator wall using `session_responses`.
- [ ] `lesson_journal` is wired with private autosave; guardian can read a linked
      child's entries but not write.
- [ ] No "God"/deity language anywhere; alignment notes use inner-self framing.
- [ ] No new tables created; existing RLS untouched.

---
---

# PART 2 — Page Tidy-Up, Scheduling, Paywall & Membership Tiers

This part builds on the three migrations now applied
(`20260711160000_curriculum_content_v2`, `20260711160100_lesson_journal`,
`20260711170000_program_schedule_membership_tiers`). Some of the cleanup below
is already done in code on the `claude/mindcast-content-cleanup` branch — if
you're working on `main` before that merges, apply anything not yet present;
never re-add a page listed under REMOVE.

## The app has exactly three surfaces — keep it that way
1. **Admin dashboard** (`/admin`, `/admin/*`) — staff monitor & track members,
   households, membership/billing, moderation, scheduling, kiosk check-in, and
   launch facilitation. Admins do NOT edit lesson content here anymore.
2. **Member portal** (`/portal/*`) — a member logs in, sees the current week's
   lesson, keeps their private journal (reflective questions + activities), and
   joins the live session via code.
3. **Mindcast Live** (`/mindcast-live/*`) — where the facilitated lessons live:
   the coursebook Library and the big-screen FacilitatorView. Display walls
   (`/display*`) are the audience-facing screens.

## Page inventory — REMOVE / KEEP / UPDATE

### REMOVE (delete page + route + nav links + SEO title; add a redirect to `/`)
- `/signal` (SignalLanding), `/connect` (ConnectLanding), `/little-minds`
  (LittleMindsLanding) — the retired sibling products.
- Legacy admin session runner (already removed on the branch): `/admin/sessions`,
  `/admin/sessions/:id`, `/admin/live`, `/admin/present/:id`,
  `/admin/session-runner`, `/admin/curriculum`, plus `AdminSessions`,
  `AdminSessionEditor`, `AdminPresenter`, `AdminSessionRunner`, `AdminLive`,
  `AdminCurriculum`, `SessionSlideshow`, and the portal-admin "Sessions" /
  "Live Mode" tabs. Redirect the old routes to `/mindcast-live/library`.
- Any `PilotSuccess` page and remaining founding-pilot copy.

### UPDATE (keep the route, fix the content)
- `/pilot` — this is now the **Membership** page (52-week journey), not the
  founding pilot. Relabel any nav that still says "Pilot" to "Membership".
  `/membership` should resolve here.
- `/marketing` (admin-only) — rewrite the outreach templates: they still say
  "12-week pilot / 15 founding members". Make them 52-week membership copy.
- `KidsWorkbook` — remove the "Little Minds Big Questions app" references; kids
  content now lives in the Mindcast kids track.
- Remove all remaining "God / the Lord / the divine" language app-wide; reframe
  as one's own inner self, inner spirit, internal dialogue and belief system.

### KEEP
- Portal: dashboard, week/:weekNumber, weeks, group, insights, downloads,
  settings, progress, billing, admin.
- Admin: landing, history, framework, kids, members, applications, emails,
  kiosk, scheduling, moderation, households, membership.
- Mindcast Live: library, lesson/:weekNumber, facilitate/:weekNumber.
- Live join: `/live`, `/live/:code`, `/b/:token` (bracelet tap).
- Display walls: `/display`, `/display/goals`, `/display/wordcloud`.
- Legal: terms, privacy, refund, safeguarding. Public: home, demo, about, auth,
  onboarding.

## Program schedule — one start date drives everything
The migration added `app_settings` (`program_start_date`, `program_timezone`)
and a `lesson_unlocked(week_number)` SQL function. Wire it:

1. **Admin portal → set the start date.** Add a field (in `/admin/scheduling` or
   `/admin/membership`) where an admin sets `program_start_date` — this must be
   the **first Sunday**; that Sunday is **lesson 1**. Also expose
   `program_timezone` (default `Pacific/Auckland`). Write via the admin-only
   `app_settings` RLS.
2. **Unlock rule (already encoded in `lesson_unlocked`):** week N opens at
   **09:30 in the program timezone** on `start_date + (N-1)*7 days`, and stays
   open forever after (so Life Groups can reference back). Before the start date
   is set, nothing is unlocked.
3. **Current week** = the highest week whose unlock time has passed. The portal
   dashboard should open on that week. Replace the old `scheduled_sessions`
   per-week lookup in `useCurrentCurriculumWeek` with this computed value (you
   can keep `scheduled_sessions` for room/time logistics, but unlock timing now
   comes from `lesson_unlocked`).

## Paywall + membership tiers
The migration added `profiles.membership_tier` ('none'|'adult'|'teen'),
`profiles.kids_addon` (boolean), and `subscriptions.tier`
('adult'|'teen'|'kids_addon'). `profiles.membership_status` remains the coarse
active/lapsed gate. These are **service-role only** (Stripe webhook writes them);
never let a member set their own tier.

Gating rules for a given week + track:
- **Visible to everyone (incl. non-members / logged-out):** the lesson **title
  and description**. Everything else shows a **padlock** with a "Become a member"
  CTA to `/pilot`.
- **Unlocks the full lesson** (video, session slides, reflective questions,
  interactive activities, journal) only when ALL are true: (a)
  `membership_status = 'active'` (or 'trialing'), (b) the member's tier covers
  the track, and (c) `lesson_unlocked(week)` is true.
- **Adult tier** → adult track. **Teen tier** → **teen track only** (a teen
  membership must not unlock adult sessions). A member's track comes from
  `profiles.age_group`.
- **Kids add-on** (`kids_addon = true`, bought by a paying adult): kids do NOT
  log in. The paying adult gets access to the **kids lessons** and the
  **downloadable colouring PDFs** (once uploaded to storage). Surface kids
  content + colouring downloads under the adult's account (e.g. a "Kids" section
  in the portal), gated on `kids_addon`.

### Stripe wiring
- Extend the existing subscription Checkout (`create-subscription-checkout`) to
  take a **tier** (adult / teen) and an optional **kids add-on** line item.
- In the `stripe-webhook`, set `subscriptions.tier` and mirror
  `profiles.membership_tier` / `profiles.kids_addon` from the purchased
  price(s). Keep all writes service-role.
- Non-payment must never grant access — verify gating server-side via RLS on the
  lesson_journal / content reads, not just hidden UI.

## Acceptance checklist (Part 2)
- [ ] Signal / Connect / Little Minds pages gone; `/pilot` reads as Membership.
- [ ] No founding-pilot or deity language anywhere.
- [ ] Admin can set the program start date (first Sunday) + timezone.
- [ ] Portal opens on the current week; weeks unlock 09:30 Sun and stay open.
- [ ] Non-members see title + description under a padlock; members see the full
      lesson only when tier covers track AND the week has unlocked.
- [ ] Teen membership unlocks teen track only; kids add-on gives a paying adult
      the kids lessons + colouring PDFs; kids don't log in.
- [ ] Tier/entitlement is written only by the Stripe webhook (service role).
