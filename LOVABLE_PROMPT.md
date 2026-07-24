# Lovable Build Brief — Mindcast (current state + what's left)

Paste everything below the line into Lovable. It describes what is **already
built and merged** (do not redo or undo it) and the **remaining work** to
finish the 52-week membership experience. Test in the live preview as you go.

---

## What Mindcast is
A facilitated, in-theatre, **52-week** membership journey with three tracks
(Adult / Teen / Child), a Sunday live session and a midweek Life Group. Three
surfaces, and only these three:
- **Admin** (`/admin`, `/admin/*`) — staff monitor & track members, households,
  billing, moderation, scheduling, kiosk check-in, and launch facilitation.
- **Member portal** (`/portal/*`) — members see the current week's lesson, keep
  a private journal, check in, and join the live session.
- **Mindcast Live** (`/mindcast-live/*`) — where facilitated lessons live: the
  coursebook Library, the big-screen FacilitatorView, and the in-app lesson
  editor. Display walls (`/display*`) are the audience screens.

## Hard content rules (apply everywhere)
- **No deity language.** Never use "God", "the Lord", "the divine", etc. Reframe
  all source material (Dao, A Course in Miracles) as one's own **inner self,
  inner spirit, internal dialogue and belief system**. Fix any that remain.
- **Journals are private.** `lesson_journal` is owner read/write only, plus a
  linked-guardian **read** for a child/teen. Never let facilitators/admins read
  member journals. Do not weaken this RLS.
- **Access is paid.** Non-members see titles + descriptions only (padlocked).
- **No new tables** unless truly needed; **don't re-add** any removed page.

---

## ALREADY BUILT — do not redo (it's on `main`)

**Database (migrations applied):**
- `curriculum_weeks` extended with the full 52-week lesson content:
  `core_learning, youtube_url/title/runtime, reflective_question,
  interactive_activity, kids_picture_book(+_note), kids_colouring_prompt,
  inner_wisdom_alignment`. This is the **single source of truth** for lessons.
- `lesson_journal` (`profile_id, week_number, track` + `reflection_answer,
  activity_response, personal_notes, life_group_notes`) — private, owner-only,
  guardian-read.
- `app_settings` (`program_start_date`, `program_timezone`) + the SQL function
  `lesson_unlocked(week_number)` — week N opens 09:30 (program tz) on
  `start_date + (N-1)*7 days` and stays open.
- Membership tiers: `profiles.membership_tier` ('none'|'adult'|'teen'),
  `profiles.kids_addon` (bool), `subscriptions.tier`
  ('adult'|'teen'|'kids_addon'). All **service-role-only** (Stripe webhook
  writes them); the profile escalation-guard blocks self-granting.

**App:**
- Legacy admin session runner **removed** and consolidated onto Mindcast Live
  (old `/admin/sessions`, `/admin/live`, `/admin/session-runner`, etc. redirect
  to `/mindcast-live/library`). Display walls kept.
- Sibling product pages **removed** (Signal, Connect, Little Minds). `/pilot` is
  now the **Membership** page.
- **In-app lesson editor** at `/mindcast-live/edit/:weekNumber` (facilitator) —
  edits all 14 slides' text per track and swaps the YouTube video, saving to
  `mindcast_live_sessions` (upsert on week+audience). Reached from each Library
  card. Mobile-first + PWA.
- **FacilitatorView** merges the `curriculum_weeks` row over
  `mindcast_live_sessions` (video, reflective question, interactive activity,
  inner-wisdom alignment) as fallbacks.
- **Portal home** is an adaptive tile launcher (Check-In, Today's Session,
  Session History, Life Group, Downloads, My Progress + conditional **Kid
  Sessions** when `kids_addon`). Settings is the header gear, not a tile.
- **`/portal/checkin`** — member marks attendance → `check_ins` row → their name
  streams onto the display Welcome Wall (opening slide) in real time.

---

## REMAINING WORK — please build & test

### 1. Program schedule wiring
- Add an admin field (in `/admin/scheduling` or `/admin/membership`) to set
  `app_settings.program_start_date` — **the first Sunday = lesson 1** — plus
  `program_timezone` (default `Pacific/Auckland`). Admin-only write.
- Use `lesson_unlocked(week)` for all gating and to compute the **current week**
  (highest unlocked week). Replace the old `scheduled_sessions` unlock lookup in
  `useCurrentCurriculumWeek`; the portal home should open on the current week.

### 2. Paywall + membership tiers
- **Everyone** (incl. logged-out) sees the lesson **title + description**;
  everything else is padlocked with a "Become a member" CTA to `/pilot`.
- **Full lesson** (video, slides, reflective questions, interactive activity,
  journal) unlocks only when ALL: `membership_status` active/trialing, the
  member's tier covers their track (`profiles.age_group`), and
  `lesson_unlocked(week)`.
- **Teen tier → teen track only.** Enforce server-side via RLS on content reads,
  not just hidden UI.
- **Stripe:** extend `create-subscription-checkout` to take a tier (adult/teen)
  + optional kids add-on line item; in `stripe-webhook` set `subscriptions.tier`
  and mirror `profiles.membership_tier` / `kids_addon` (service role only).

### 3. Member journal + interactive activities
- Portal week pages: private journal panel per week writing to `lesson_journal`
  (reflection_answer, activity_response, personal_notes, life_group_notes) with
  autosave/upsert on `(profile_id, week_number, track)`. Guardian read for a
  linked child.
- **Live input → journal:** `/live/:code` (LiveJoin) currently writes to
  `session_responses`; also upsert answers into `lesson_journal` so they persist
  to **Session History**.
- Drive each week's **interactive activity** (word cloud / poll / open Q&A) off
  `curriculum_weeks.interactive_activity`, reusing `session_responses` +
  `featured_callbacks` (no new responses table). Verify the join code + activity
  round-trip for all 52 weeks.

### 4. Kids
- Build the **Kid Sessions** view for a paying adult with `kids_addon` (the tile
  is a placeholder pointing at Downloads): list the **Child-track** lessons and
  the downloadable colouring PDFs from storage. Kids never log in.

### 5. Portal lesson content per track
- Week pages surface the new `curriculum_weeks` fields for the member's track:
  YouTube embed (`youtube_url`), `reflective_question`, `interactive_activity`,
  an inner-wisdom callout (`inner_wisdom_alignment`); **Child track** shows
  `kids_picture_book` (+ note) and the colouring page.

### 6. Content sweep
- Remove any remaining deity language app-wide (reframe to inner self).
- Rewrite `/marketing` (admin-only) outreach templates — they still say
  "12-week pilot / 15 founding members" — to 52-week membership copy.
- Remove the "Little Minds Big Questions app" references in `KidsWorkbook`.

## Acceptance checklist
- [ ] Admin sets the program start date; weeks unlock 09:30 Sun and stay open;
      portal opens on the current week.
- [ ] Non-members see title + description under a padlock; full lesson unlocks
      only when active + tier covers track + week unlocked.
- [ ] Teen tier = teen only; kids add-on gives an adult the kids lessons +
      colouring PDFs; kids don't log in; tiers written only by the webhook.
- [ ] Journals persist (portal + live) to `lesson_journal`, private + guardian
      read; interactive activities round-trip for all 52 weeks.
- [ ] No deity / founding-pilot language; no removed pages re-added; RLS intact.
