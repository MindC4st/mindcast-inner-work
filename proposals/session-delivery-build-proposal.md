# Session Delivery Build — Proposal (GATE)

Response to the Session Delivery Build spec. **Proposal only — no application
code written.** Migration SQL is inline below for review; it lands as a
migration file only after sign-off.

Repo survey findings that shape everything:

- The deck is data-driven: `lesson_slides` rows (seeded by
  `20260819210000_lesson_flow_v3_schema.sql`, **11 rows**) mapped through
  `SLIDE_KEY_TO_KIND` in `src/pages/mindcast-live/FacilitatorView.tsx`, with a
  hard-coded fallback deck `buildDeck()` in the same file.
- The room-roll/safeguarding layer already exists and is strong
  (`20260819110000_room_roll_child_safety.sql`): `roll_events` (append-only,
  idempotent via `client_event_id`), `room_roster`, `room_staffing`,
  `authorised_collectors`, `room_alerts` + `raise_room_alert()`,
  `notification_outbox` + `queue_notification()`, `record_departure()` with
  collection-by-approved-collector constraints.
- **The spec's `child_movement` table is redundant** — `roll_events` already
  distinguishes temporary absence (`departed` + `returned`, reason required)
  from collection (`departed` with `collected_by_profile_id` /
  `collected_by_collector_id`). Proposal extends `roll_events` with alert
  functions instead of a parallel table.
- `door-scan` already resolves a **household** per scan and admits an array of
  `profile_ids` — the household-level door model exists.
- `life_groups` + `life_group_members` exist (20260726000001) but lack night,
  track, area, second adult, cycle year, attendance.

---

## 1 · The migration (in full)

```sql
-- 20260824120000_session_delivery_build.sql

-- ─────────────────────────────────────────────────────────────────────────
-- A. Practice cadence: MON/WED/SUN → SUN (TODAY) / YOUR LIFE GROUP / FRI
-- Rename, not add: three days stays the rule, only the days change.
-- Order matters: the legacy weekly_practice_fri column (added 20260821,
-- empty) must drop before weekly_practice_sun takes the fri name.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.mindcast_live_sessions DROP COLUMN IF EXISTS weekly_practice_fri;
ALTER TABLE public.mindcast_live_sessions RENAME COLUMN weekly_practice_mon TO weekly_practice_sun_today;
ALTER TABLE public.mindcast_live_sessions RENAME COLUMN weekly_practice_wed TO weekly_practice_midweek;
ALTER TABLE public.mindcast_live_sessions RENAME COLUMN weekly_practice_sun TO weekly_practice_fri;

-- Content note (Notion-side, not SQL): SUN (TODAY) = write the if-then
-- intention; midweek = YOUR LIFE GROUP check-in (Notice/Name/Do); FRI =
-- second check-in. All 156 lessons re-written in Notion, then synced.

-- ─────────────────────────────────────────────────────────────────────────
-- B. Awareness check-ins — the 4-point scale, stored per member per week.
-- Adults only in code (RLS below + journal_adult_only convention); under-18
-- rooms are paper and hold no digital records.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.awareness_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week int NOT NULL CHECK (week BETWEEN 1 AND 52),
  cycle_year int NOT NULL,
  -- the lesson the INTENTION came from (week N's check-in references the
  -- intention set in week N's session, written during week N+1's Slide 2):
  intention_week int NOT NULL CHECK (intention_week BETWEEN 1 AND 52),

  level int NOT NULL CHECK (level BETWEEN 1 AND 4),
  reflection text,                    -- "what I noticed was…"
  intention_recalled text,            -- "the intention I set was…"

  submitted_to_screen boolean NOT NULL DEFAULT false,
  moderation_status text NOT NULL DEFAULT 'private'
    CHECK (moderation_status IN ('private','pending','approved','held','flagged')),
  display_anonymously boolean NOT NULL DEFAULT true,
  moderated_by uuid REFERENCES auth.users(id),
  moderated_at timestamptz,
  flagged_for uuid REFERENCES auth.users(id),   -- named facilitator follow-up
  follow_up_note text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week, cycle_year)
);
CREATE INDEX IF NOT EXISTS awareness_checkins_user_idx
  ON public.awareness_checkins (user_id, cycle_year, week);
CREATE INDEX IF NOT EXISTS awareness_checkins_moderation_idx
  ON public.awareness_checkins (moderation_status)
  WHERE moderation_status IN ('pending','flagged');

ALTER TABLE public.awareness_checkins ENABLE ROW LEVEL SECURITY;

-- The member owns their check-ins. No household clause, ever.
CREATE POLICY "awareness_own" ON public.awareness_checkins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Moderators see ONLY what was explicitly submitted to screen.
CREATE POLICY "awareness_moderators_submitted" ON public.awareness_checkins
  FOR SELECT USING (
    submitted_to_screen = true
    AND public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- Dashboard helper: coverage, never score. Returns weeks checked in and
-- weeks elapsed; the app renders "31 of 34 weeks", never an average.
CREATE OR REPLACE FUNCTION public.my_awareness_coverage(p_cycle_year int)
RETURNS TABLE (checked_in int, elapsed int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::int FROM public.awareness_checkins ac
      WHERE ac.user_id = auth.uid() AND ac.cycle_year = p_cycle_year),
    (SELECT count(*)::int FROM public.unlocked_lessons ul
      WHERE ul.unlocked_at::int >= 0)  -- replaced by calendar calc in app
$$;
-- (App computes elapsed weeks from the programme calendar; the function
-- exists so the member-side read stays a single owner-scoped query.)

-- ─────────────────────────────────────────────────────────────────────────
-- C. Session submissions — Slide 1 opening question + Slide 6 shares.
-- Same moderation states as check-ins; separate table because these are
-- per-session, not per-week, and carry no scale level.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  week int NOT NULL,
  slide text NOT NULL CHECK (slide IN ('opening_question','reflect_share')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- null = facilitator-typed (teen rooms)
  body text NOT NULL,
  display_anonymously boolean NOT NULL DEFAULT true,
  moderation_status text NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending','approved','held','flagged')),
  flagged_for uuid REFERENCES auth.users(id),
  moderated_by uuid REFERENCES auth.users(id),
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS session_submissions_queue_idx
  ON public.session_submissions (session_date, slide, moderation_status);

ALTER TABLE public.session_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_own" ON public.session_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "submissions_staff_queue" ON public.session_submissions
  FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'::app_role));
CREATE POLICY "submissions_staff_update" ON public.session_submissions
  FOR UPDATE USING (public.has_role(auth.uid(), 'facilitator'::app_role));
-- Facilitator-typed contributions (teen/child rooms): inserted by staff.
CREATE POLICY "submissions_staff_insert" ON public.session_submissions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'facilitator'::app_role));

-- ─────────────────────────────────────────────────────────────────────────
-- D. Life Groups — extend existing tables; add night/track/area/second-adult
-- and midweek attendance. Acacia Bay Community Hall, Tues/Weds 6-7pm,
-- all groups simultaneous, split by area. Starts week 3 or 4.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.life_groups
  ADD COLUMN IF NOT EXISTS night text CHECK (night IN ('tuesday','wednesday')),
  ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'adult'
    CHECK (track IN ('adult','teen')),
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS second_adult_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cycle_year int NOT NULL DEFAULT 2026;

-- Enforced, not documented: no teen group runs with one adult.
ALTER TABLE public.life_groups
  ADD CONSTRAINT teen_groups_need_two_adults
  CHECK (track <> 'teen' OR (lead_user_id IS NOT NULL AND second_adult_id IS NOT NULL));

-- Teens are never in adult groups (application-level too; belt and braces).
ALTER TABLE public.life_group_members
  ADD COLUMN IF NOT EXISTS cycle_year int NOT NULL DEFAULT 2026;

CREATE TABLE IF NOT EXISTS public.life_group_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  life_group_id uuid NOT NULL REFERENCES public.life_groups(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  present boolean NOT NULL DEFAULT true,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (life_group_id, profile_id, session_date)
);
-- Two consecutive absences surface to the group lead as a nudge (app logic
-- reads this; never a compliance flag, always a check-in with a person).
CREATE INDEX IF NOT EXISTS lga_group_date_idx
  ON public.life_group_attendance (life_group_id, session_date);

ALTER TABLE public.life_group_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lga_member_read_own" ON public.life_group_attendance
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.life_groups lg
      WHERE lg.id = life_group_id AND lg.lead_user_id = auth.uid()
    )
  );
CREATE POLICY "lga_staff_manage" ON public.life_group_attendance
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'facilitator'::app_role));

-- ─────────────────────────────────────────────────────────────────────────
-- E. Roll events — alert functions on the existing append-only table.
-- No child_movement table: roll_events already covers stepped-out/returned/
-- collected via departed/returned + collected_by_*.
-- ─────────────────────────────────────────────────────────────────────────

-- Signed in at the door but not marked present in the room within 10
-- minutes: the gap worth catching. Called by a scheduled sweep (cron or
-- facilitator-device poll) during the first 15 minutes of a session.
CREATE OR REPLACE FUNCTION public.sweep_signed_in_gaps(p_date date, p_room text)
RETURNS TABLE (subject_profile_id uuid, display_name text, signed_in_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT re.subject_profile_id, p.display_name, min(re.occurred_at) AS signed_in_at
  FROM public.roll_events re
  JOIN public.profiles p ON p.id = re.subject_profile_id
  WHERE re.session_date = p_date AND re.room = p_room
    AND re.event = 'signed_in'
    AND re.occurred_at < now() - interval '10 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM public.roll_events r2
      WHERE r2.session_date = p_date AND r2.room = p_room
        AND r2.subject_profile_id = re.subject_profile_id
        AND r2.event IN ('present','moved_in','departed','correction')
    )
  GROUP BY re.subject_profile_id, p.display_name
$$;
REVOKE ALL ON FUNCTION public.sweep_signed_in_gaps(date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sweep_signed_in_gaps(date, text) TO authenticated;

-- Non-return alert: departed (stepped out) and not back within 5 minutes.
-- The alert that matters — not the leaving, the not-coming-back.
CREATE OR REPLACE FUNCTION public.sweep_non_returns(p_date date, p_room text)
RETURNS TABLE (subject_profile_id uuid, display_name text, departed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT re.subject_profile_id, p.display_name, max(re.occurred_at) AS departed_at
  FROM public.roll_events re
  JOIN public.profiles p ON p.id = re.subject_profile_id
  WHERE re.session_date = p_date AND re.room = p_room
    AND re.event = 'departed'
    AND re.occurred_at < now() - interval '5 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM public.roll_events r2
      WHERE r2.session_date = p_date AND r2.room = p_room
        AND r2.subject_profile_id = re.subject_profile_id
        AND r2.event IN ('returned','room_closed')
        AND r2.occurred_at > re.occurred_at
    )
    AND re.collected_by_profile_id IS NULL
    AND re.collected_by_collector_id IS NULL
  GROUP BY re.subject_profile_id, p.display_name
$$;
REVOKE ALL ON FUNCTION public.sweep_non_returns(date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sweep_non_returns(date, text) TO authenticated;

-- Caregiver push on collection goes through the existing queue_notification()
-- at the moment record_departure() writes a collected event (application
-- logic). Caregivers without the app: fall back to SMS on a stored contact.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS caregiver_sms text;
-- notify_channel already exists ('email'|'push'|'none'); 'none' renders as
-- "no notification channel" on the roll screen rather than assuming a
-- message went out.

-- ─────────────────────────────────────────────────────────────────────────
-- F. Teen room staffing: two vetted adults, enforced.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.room_staffing
  ADD CONSTRAINT teen_room_two_adults
  CHECK (room <> 'Teen' OR staffed_adults >= 2);

-- ─────────────────────────────────────────────────────────────────────────
-- G. Deck: 11 slides → 8. Deactivate retired keys, insert the new eight.
-- applies_to_tracks carries the per-track variant; component_key drives the
-- renderer; titles are the running-order names from the spec.
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.lesson_slides SET is_active = false
  WHERE slide_key IN ('welcome','voices','ancient','todays_world','theme',
                      'video','exercise','reflection','intention','affirmation','notes');

INSERT INTO public.lesson_slides
  (slide_key, position, beat, title, component_key, default_duration_seconds, applies_to_tracks)
VALUES
  ('arrival',          1, 'notice', 'Arrival',                  'Arrival',          120, '{Adult,Teen,Child}'),
  ('intention_return', 2, 'notice', 'Return to Your Intention', 'IntentionReturn',  300, '{Adult,Teen}'),
  ('last_week_learnt', 2, 'notice', 'Last Week We Learnt',      'LastWeekLearnt',   180, '{Child}'),
  ('wisdom_today',     3, 'notice', 'Ancient Wisdom / Today''s World', 'WisdomToday', 300, '{Adult,Teen,Child}'),
  ('listen',           4, 'name',   'This Week''s Listen',      'Listen',           1200, '{Adult,Teen}'),
  ('picture_book',     4, 'name',   'This Week''s Story',       'PictureBook',      600, '{Child}'),
  ('go_deeper',        5, 'name',   'Go Deeper',                'GoDeeper',         900, '{Adult,Teen}'),
  ('colouring',        5, 'name',   'Colouring',                'Colouring',        900, '{Child}'),
  ('reflect_share',    6, 'name',   'Reflect & Share',          'ReflectShare',     480, '{Adult,Teen,Child}'),
  ('intention_set',    7, 'do',     'Your Intention',           'IntentionSet',     420, '{Adult,Teen,Child}'),
  ('closing',          8, 'do',     'Closing',                  'Closing',          120, '{Adult,Teen,Child}')
ON CONFLICT (slide_key) DO UPDATE SET
  position = EXCLUDED.position, beat = EXCLUDED.beat, title = EXCLUDED.title,
  component_key = EXCLUDED.component_key,
  default_duration_seconds = EXCLUDED.default_duration_seconds,
  applies_to_tracks = EXCLUDED.applies_to_tracks,
  is_active = true;

-- Child Slide 8 runs the group game — game notes live in the facilitator
-- view only (pulled from the lesson record), never on screen.
```

**Not in this migration (deliberately):** the Notion content sync (Notion
stays source of truth; sync script reads pages directly — database-query cap
permitting), the Life Group sheet generator (derived from Sunday lessons),
and anything Gemini/colouring-generation (admin pipeline, separate change).

---

## 2 · `slideOrder.ts` and the file list

`src/config/slideOrder.ts` — single source for the running order. One entry
per slide per track: key, title source, component, input mode, data fields.
Nothing hardcodes slide order in a component after this.

| File | Why |
|---|---|
| `src/config/slideOrder.ts` | The 8-position order × 3 track variants; input mode per slide (none / moderated-digital / facilitator-written); the only place order is defined |
| `src/components/session-runner/slides/Arrival.tsx` | Slide 1: join code (Adult) / bracelet-tap wall (Teen) / roll call with names appearing as marked (Child) |
| `…/IntentionReturn.tsx` | Slide 2 Adult/Teen: callback line, finish-the-sentence inputs, 4-point scale, moderated submissions; level 1 presented as a normal week |
| `…/LastWeekLearnt.tsx` | Slide 2 Child: one-sentence recap + one spoken question |
| `…/WisdomToday.tsx` | Slide 3: the two quotes side by side; optional pre-approved Gemini clip; core concept + teaching points NOT rendered here |
| `…/Listen.tsx` | Slide 4 Adult/Teen: video + reflective questions beneath |
| `…/PictureBook.tsx` | Slide 4 Child: approved read-aloud of the week's book only, or "read live" placeholder |
| `…/GoDeeper.tsx` | Slide 5: thought-provoking question as subheading + interactive whiteboard T-chart (modelling mode) |
| `…/Colouring.tsx` | Slide 5 Child: approved image only; prompt + "while they colour" question to facilitator view |
| `…/ReflectShare.tsx` | Slide 6: three questions; moderated submissions read aloud (Adult), facilitator-written whiteboard (Teen), talk-about-your-picture (Child) |
| `…/IntentionSet.tsx` | Slide 7: intention_prompt verbatim + 3-minute timer + weekly practice table SUN (TODAY)/YOUR LIFE GROUP/FRI |
| `…/Closing.tsx` | Slide 8: affirmation displayed (never chanted) + next Sunday date/venue; Child: game runs from facilitator notes |
| `…/FacilitatorPanel.tsx` | Separate-device facilitator view: session notes drawer + SAY/DO slide notes + persistent safety strip; no payment/attendance/score data |
| `src/lib/awarenessScale.ts` | The 4 levels + coverage calc; never exports an average or trend |
| `src/lib/moderationQueue.ts` | approve / hold / flag-for-follow-up against both submission tables |

**Fidelity tags drive rendering:** Notion `— VERBATIM` suffix → SAY style
(large, read aloud); `— STRUCTURED` → DO style (smaller, stage direction).
The sync stores the tag per section; the renderer never decides.

---

## 3 · Offline queue strategy for roll call

The schema was built for this: `roll_events.client_event_id UNIQUE` exists
precisely for idempotent replay.

1. **Local-first writes.** Every roll action (present, stepped out, returned,
   collected) writes to an IndexedDB queue with a client-generated UUID and a
   device timestamp, and updates the local UI immediately.
2. **Sync when possible.** A background sync loop posts queued events to
   `record_departure()` / the roll insert path with `client_event_id`; the
   UNIQUE constraint makes replays idempotent — a hall wifi drop and recover
   never double-records.
3. **Ordering.** Events carry `occurred_at` from the device; the server keeps
   append-only order by receipt, and `correction` events annotate rather than
   edit, so late-arriving out-of-order events don't corrupt history.
4. **Degradation.** If offline at session start, the roll runs entirely local
   (the roster is cached when the session opens); alerts
   (`sweep_signed_in_gaps`, `sweep_non_returns`) compute locally against the
   local queue and fire server-side alerts on reconnect.
5. **Never blocked.** The one thing that cannot depend on connectivity is
   knowing which children are in the building — roll state is always readable
   from the device, synced or not.

---

## 4 · Where the 12-slide structure lives, and what breaks at 8

**Defined in two places:**
- `supabase/migrations/20260819210000_lesson_flow_v3_schema.sql` — the
  `lesson_slides` seed, 11 rows (`welcome` … `notes`). The deployed database
  reads 12 on screen; the twelfth is either an extra row in the deployed DB
  or the counter including the facilitator `notes` row — needs reconciling
  against the live DB before the teen reformat, since everything downstream
  indexes off the count.
- `src/pages/mindcast-live/FacilitatorView.tsx` — `SLIDE_KEY_TO_KIND`
  (slide_key → render kind) and `buildDeck()` (hardcoded 11-kind fallback).

**What breaks when it becomes 8:**
- `SLIDE_KEY_TO_KIND` maps retired keys (`voices` currently maps to the
  intention kind) — every mapping must be re-pointed to the new keys.
- `buildDeck()` fallback must match the new 8 or the offline path renders the
  old shape.
- `live_session_state.current_slide` is an index — any in-progress session
  mid-migration maps to the wrong slide; ship the deck change between
  sessions, never mid-session.
- Slide-specific components keyed by name (WelcomeWall, Voices, GeneratedVideo,
  TodaysTheme) lose their data source when their slide_key deactivates — the
  new components replace them per §2.
- Anything that addresses "the video slide" by position (worksheets, join
  flow, display wall) must move to key-based addressing.

---

## 5 · Where check-in assumes one person per scan

- **`nfc-checkin`** — one bracelet tap = one profile check-in. This is the
  one that breaks the new door model: an adult bracelet tap must sign in the
  **household** (adults present + young people flagged EXPECTED, not present).
  Needs a household mode; `door-scan` already shows the pattern (it resolves
  a household and admits an array).
- **`door-scan`** — already household-level (`profile_ids` array); compliant.
- **`bracelet-signin`** — one account per bracelet token; this is an auth
  unlock, not attendance — fine as-is, but note the new model gives one
  household bracelet to the adult, so the token→household resolution must
  exist before teen/child roll call can key off the same scan.
- **Welcome Wall** subscribes to `check_ins` over Realtime — the teen
  bracelet-tap wall (names appear on tap) and child roll-call wall (names
  appear when marked present) both need the household-expected distinction:
  an expected-but-not-present young person must not appear as "in".

**Conflicts with spec §2/§3 in the current build (flagged per GATE):**
- Colouring slide carries a REGENERATE control with no approval gate — one
  tap puts an unreviewed AI image in front of children. Moves to admin with
  `pending` status before any session use.
- Deployed deck serves stale video assignments (pre-restructure content).
- Child Slide 1 shows bracelet/join-code text; child Slide 2 shows the adult
  fallback text — both wrong per the track variants.

---

## Decisions still open (block build order)

1. Teen deck: video stays at Slide 4 (per the track table) — confirm.
2. Store the Slide 5 T-chart in the journal, or only the final line?
   (Privacy policy wording depends on it.)
3. Under-18 Life Groups: venue-only at Acacia Bay with two vetted adults —
   the migration enforces this; confirm no private-home groups at all.
4. Life Group start week (3 or 4) — configuration, not schema.
5. Notion query cap: sync script uses page-level fetches until the cap
   resets; full database-query sync afterwards. No CSV at any point.
