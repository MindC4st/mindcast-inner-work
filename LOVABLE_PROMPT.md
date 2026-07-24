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
