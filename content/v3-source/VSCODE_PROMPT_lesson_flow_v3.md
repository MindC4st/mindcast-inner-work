# Build prompt — New lesson flow: 15 slides → 11

**Paste into Claude Code at the root of `mindcast-inner-work`.**

The session deck is being restructured. Order changes, five slides are removed, two become AI-generated video, and the video moves from near the end to the centre.

**Work in gates. Report and stop after each.** Gate B involves destructive-looking schema work on real authored content — do not proceed past it without approval.

---

## The new flow

**Arrival** — bracelets tap, membership resolves, kids and teens signed into their rooms.

### ◆ NOTICE IT

| # | Slide | Notes |
|---|---|---|
| 1 | **Welcome Wall + Session join code** | Names arriving live, plus the code members use to join the session on their phone. Replaces the old Title slide — theme and phase are shown here. |
| 2 | **Voices from Last Week** | Two or three intentions carried over from slide 9 of the previous session. Read without commentary. |
| 3 | **Ancient Wisdom** | **10-second generated video with voiceover and captions**, from the ancient-wisdom text field. |
| 4 | **In Today's World** | **10-second generated video with voiceover and captions**, from the metaphor text field. Renamed from *Signal Metaphor*. |

### ◆ NAME IT

| # | Slide | Notes |
|---|---|---|
| 5 | **Today's Theme** | Opening hook and core concept **merged into one slide**. Written as a summary of the video transcript so members know what is coming. |
| 6 | **The Video** *(~20 min)* | The curated piece, with **two reflective questions generated from the transcript** shown beneath it. |
| 7 | **Experiential Exercise** | Whole-room activity based on what members took from the video. On-screen sharing optional and moderated. |
| 8 | **Reflection** | After hearing others — what shifted, what is new. |

### ◆ DO IT

| # | Slide | Notes |
|---|---|---|
| 9 | **Intention + Weekly Practices** | One intention plus three named practices for Monday, Wednesday and Sunday, written into the workbook. **This is what slide 2 reads back next week** — the two are one loop. |
| 10 | **Closing Affirmation** | A quote from the author or speaker in the video, to cement the practice. |
| 11 | **Facilitator Notes** | Private. Now **dual-purpose**: preparation before, evaluation after. |

### What is removed

`Title` (00) · `Teaching Points` (06) · `Reflection 1` (07) · `Guided Reflection` (09) · `Reflection 2` (10, folded into new slide 8).

---

## The 90-second private write — build it, it is not optional

The old flow had members write privately **before** the room talked. The new flow puts the whole-room exercise first, and the risk is real: once three confident people have spoken, the quieter half of the room writes down a version of what they heard rather than what they actually think.

**So slide 7 opens with a 90-second private write, on a visible timer.**

- The prompt is the week's **Opening Question**, supplied in the CSV column `S7 Private Write Prompt (90 sec)`.
- **90 seconds, counting down, shown on the projected screen** — large, calm, no ticking sound, no colour change until the last 10 seconds, and nothing that reads as pressure. It ends quietly; it does not buzz.
- The facilitator starts it with one tap and **cannot skip it** — it is the one timer in the deck that must run. Everything else is a guide.
- Members write in the app (having joined with the session code) or on the printed worksheet. Both are equal; do not privilege the app.
- When it ends, the room shares. Nothing written in the 90 seconds is submitted or displayed unless the member separately chooses to share it at slide 8.

### Timers across the deck

Build one reusable `SlideTimer` component, driven by `lesson_slides.default_duration_seconds`.

| Behaviour | Rule |
|---|---|
| **Slide 7 private write** | 90s, **projected**, mandatory, cannot be skipped |
| **Video (slide 6)** | Runs on the media element; elapsed shown to the facilitator only |
| **Every other slide** | Elapsed against expected, **facilitator screen only — never projected** |
| Overrun | The facilitator's indicator goes amber, never red, and never alerts. Running long is often correct |
| Reduced motion | No animated sweep; a plain numeral countdown |
| Accessibility | Countdown announced at 60, 30 and 10 seconds via `aria-live="polite"`, not on every tick |

A countdown visible to the room on any slide other than 7 turns reflection into a test. Do not project them.

## Gate A — Discovery

Report on:

1. Where the session deck lives — the slide components, the Facilitator View, the audience/projector screen, and how a slide's content is fetched.
2. The `curriculum_weeks` schema (or equivalent): every column that maps to a slide, and which are populated across all 52 weeks × 3 tracks.
3. **Whether slide order is data-driven or hard-coded.** If order is implied by component sequence or column names, that is the first thing to fix — see Gate C.
4. How the member's live session view works today, and whether any join-code mechanism exists.
5. Existing Gemini or media-generation integration, if any, and where generated assets are stored.
6. How the two reflective questions are currently generated from the transcript (there is an existing DeepSeek-based flow) and where that runs.

---

## Gate B — Schema, and do not lose content

`teaching_points`, `reflection_1`, `guided_reflection` and `reflection_2` hold **authored content for 52 weeks across 3 tracks**. That is real editorial work.

**Do not drop those columns.** Instead:

1. Create `curriculum_weeks_archive_v2` (or an equivalent snapshot table) and copy every row **before** any change.
2. Add the new columns: `todays_theme` (merged hook + concept), `ancient_wisdom_video_url`, `ancient_wisdom_captions_url`, `todays_world_video_url`, `todays_world_captions_url`, `closing_quote`, `closing_quote_attribution`, `facilitator_prep_notes`, plus the slide-order table below.
3. **Migrate content forward where it maps.** `opening_hook` + `core_concept` → `todays_theme` with a clear separator, ready for human editing. `reflection_2` → the new slide 8 prompt.
4. Mark the removed columns deprecated in a comment; drop them only in a **later** migration, after a human confirms the content is either migrated or genuinely finished with.
5. Rename `signal_metaphor` → `todays_world_metaphor`, keeping a view or alias so nothing breaks mid-deploy.

**Report the migration SQL and the row counts before and after. Wait for approval.**

### Post-session evaluation — new

Slide 11 is now used twice, so it needs two homes.

`session_evaluations` — `session_id`, `facilitator_id`, `track`, `submitted_at`, `what_worked`, `what_didnt`, `room_energy` (a simple scale), `timing_notes`, `content_flags`, `follow_up_needed` (boolean), `follow_up_notes`, `safeguarding_flag` (boolean).

Two rules on this table:

- **`follow_up_notes` and `safeguarding_flag` are restricted.** Visible to the Safeguarding Lead and admin, not to other facilitators. A note saying a member seemed to be struggling is sensitive personal information, and it must not be readable across the whole facilitator team.
- Aggregate evaluations per week across tracks and terms, and surface them in the admin console. A week that three facilitators independently flagged as running long is a curriculum problem, and right now nothing captures it.

---

## Gate C — Data-driven slide order

**Slide order must not be hard-coded anywhere.**

Create `lesson_slides` — `id`, `slide_key`, `position int`, `beat text` (`'notice' | 'name' | 'do'`), `title`, `component_key`, `is_active bool`, `default_duration_seconds`, `applies_to_tracks text[]`.

The deck renders by querying this table ordered by `position`. Reordering, hiding or adding a slide becomes a data change, not a code change. This restructure is the second time the deck order has changed; assume it will happen again.

The kids and teens decks share the structure but not every slide — `applies_to_tracks` handles that rather than three forked components.

---

## Gate D — Generated video for slides 3 and 4

Both slides render a **10-second video with voiceover and captions**, generated from a text field.

**Pipeline** — server-side only, in an Edge Function, using `GEMINI_API_KEY`:

1. Take the text field (`ancient_wisdom` or `todays_world_metaphor`).
2. Generate the visual — abstract, calm, on-brand. **Read the brand constraints below; they are not optional.**
3. Generate the voiceover from the same text.
4. Produce **captions as a WebVTT track**, not burned in.
5. Store the video and the VTT in Supabase Storage. Write the URLs back to `curriculum_weeks`.

**Generate once, not per session.** These are per-week assets. Cache them, key by week and track and a hash of the source text, and regenerate only when the text changes. A deck that calls a generation API on Sunday afternoon will fail on Sunday afternoon.

**Non-negotiables:**

- **The text is always visible on the slide as text**, regardless of whether the video plays. Venue audio fails, projectors mute, and a member with hearing loss should never be dependent on the voiceover.
- **Fallback chain:** generated video → static branded card with the text → text on the slide. Never a broken player, never an empty slide.
- **Browsers block autoplay with sound.** The facilitator taps to play. Build the control for a projector, not a phone — large, obvious, and it does not disappear on mouse-out.
- Preload both clips when the deck opens so there is no spinner mid-session.
- **No member personal data in any generation prompt.** Ever.
- Every generated asset is reviewed by a human before the week goes live. Build an admin preview with approve/regenerate, and do not let an unapproved asset reach a room (MC-SEC-003 §2).

**Brand constraints on the generated visual.** Ink Navy, Signal Blue, Mist, Ivory. Abstract, slow, calm, textural. **Banned: lotus flowers, mandalas, chakra diagrams, glowing brains, sunrise-over-mountain motivational imagery, meditating silhouettes, any religious or new-age iconography, any recognisable person.** This is a safeguarding position, not an aesthetic one — the anti-cult charter depends on Mindcast not looking like a spiritual movement.

**Ancient Wisdom carries an extra rule.** The reframe is always toward the member's **own inner wisdom** — never toward a deity, doctrine or external authority. If the source text drifts, fix the text, not the video.

---

## Gate E — Slide 1: welcome wall and join code

The welcome wall already exists. Add the **session join code**.

- A short, human-readable code, unique per session, generated when the session opens and expiring when it closes.
- Members enter it on their phone to join the live session — this is how they submit reflections at slide 8 and their intention at slide 9.
- Displayed large enough to read from the back of the room. Test at actual projection distance.
- **Rate-limit redemption and bind it to an active membership.** A code visible on a projected screen is visible to anyone who can see the screen, so it must not be a route to member data — joining a session grants participation, nothing more.
- Theme, session title and phase move onto this slide from the retired Title slide.

---

## Gate F — Slide 6: the video and its questions

The video moves to the centre of the session and expands to roughly **20 minutes**.

- Two reflective questions generated from the transcript, shown beneath the video, and repeated in the journal and the printed worksheet. Reuse the existing generation flow; do not build a second one.
- **Questions are drafted, then human-approved.** Nothing generated reaches a room unreviewed.
- **Offline fallback.** A 20-minute video on venue wifi will fail. Support a pre-downloaded local file, and make the facilitator's pre-session checklist include confirming it plays.
- Slide 5 is written *from* the transcript, so the authoring order is now fixed: **choose the video → get the transcript → write slide 5 → generate the questions → pick the closing quote from the speaker.** Document this in the content team's runbook; it is a real change to how a week gets built.

---

## Gate G — Timing, facilitator view, tests

**Recompute the runtime.** Rough shape: arrival + 5 (voices) + 3 (two clips with framing) + 3 (theme) + 20 (video) + 15 (exercise, including the 90-second private write) + 8 (reflection) + 7 (intention) + 1 (affirmation) ≈ **65 minutes**. Put `default_duration_seconds` in `lesson_slides` and show elapsed against expected on the Facilitator View — as information, never as a countdown the room can see.

**Facilitator View** must show: current slide, next slide, private notes for the current slide, the timing indicator, and one-tap access to the escalation path. It should be usable one-handed on a phone, standing up, in a dim room.

**Tests:**

- Deck renders in the correct order purely from `lesson_slides`.
- Reordering rows in `lesson_slides` reorders the deck with no code change.
- Kids and teens decks render only their applicable slides.
- Archive table contains every pre-migration row; counts match exactly.
- Generated video failure falls back to a static card, then to text — assert all three.
- Captions load and display; the text is present on the slide with audio muted.
- Join code expires with the session and cannot be reused.
- `follow_up_notes` and `safeguarding_flag` unreadable by a facilitator who is not the Safeguarding Lead — test from a real facilitator JWT.
- Slide 9 intentions appear correctly in the following week's slide 2.

---

## Gate H — Import the rebuilt lesson CSVs

Three rebuilt CSVs are supplied in `mindcast-lessons-v3/` — adult, teen and child, 52 rows each, columns already in the new slide order.

Build an idempotent importer (`scripts/import-lessons.ts`) that maps them into `curriculum_weeks`. Notes:

- Column names are prefixed `S1`–`S11` by slide. Map on the prefix, not on position.
- **New columns to add:** `the_territory`, `opening_question`, `spiral_thread`, `spiral_depth`, `revisits_weeks`, `week_type`, `ancient_wisdom_vo_script`, `todays_world_vo_script`, `private_write_prompt`, `intention_prompt`, `closing_quote`, `quote_attribution`, `first_time_note`, `heavy_week_flag`, `watch_for`.
- `week_type` is one of `Standard`, `Movement opener`, `Integration` — the deck uses it to vary slide 8 and to promote entry points.
- `heavy_week_flag = YES` on weeks 9, 16, 17, 21, 23, 24 and 42. Surface it to the facilitator on slide 11 and never to members.
- **Fields deliberately left empty**, to be filled by a human or by the generation pipeline: `S3/S4 Video URL` and `Captions URL`, `S6 Video Transcript`, both reflective questions, `S10 Closing Quote` and attribution, `S11 Watch For`, `First Time Note`, `Post-Session Evaluation`. Do not invent values for these; leave null and make the admin UI show what is missing per week.
- `S5 Today's Theme` is prefixed `DRAFT —` on every row. Surface that in the admin content view as an unapproved state, and **block a week from going live while any slide-5 field still begins with DRAFT**.
- `S3/S4 VO Script` fields are auto-distilled drafts capped at 28 words. They feed the Gemini pipeline in Gate D, and they need human review before generation. Mark them unapproved on import.
- Preserve `S5 Source: Opening Hook (legacy)` and `S5 Source: Core Concept (legacy)` as reference columns. They are the raw material for writing slide 5 and must not be dropped.

### The spiral

`spiral_thread`, `spiral_depth` and `revisits_weeks` make the deepening structure explicit — for example *The inner voice* runs weeks 7 → 18 → 32.

Use it in three places:

1. **Facilitator view, slide 11** — "This week revisits week 7. Members who were here then have met this before, at less depth."
2. **Member portal** — when a member opens week 32, offer them their own week 7 entry alongside it. That comparison is the single most valuable artefact Mindcast can show someone, and it costs one query.
3. **Admin content view** — a thread map, so a content editor changing week 7 can see what downstream weeks depend on it.

## Definition of done

- [ ] Deck renders 11 slides in the new order, driven entirely by `lesson_slides`
- [ ] Authored content archived before migration; nothing lost
- [ ] `todays_theme` populated from hook + concept, ready for editing
- [ ] Slides 3 and 4 generate cached video with WebVTT captions, text always visible, three-step fallback
- [ ] All generated assets human-approved before going live
- [ ] Join code on slide 1, membership-bound, rate-limited, expiring
- [ ] Video at slide 6 with transcript-generated questions and an offline fallback
- [ ] 90-second projected, unskippable private write at the top of slide 7
- [ ] All other timers facilitator-only, never projected
- [ ] Lesson CSVs imported; spiral fields populated and used in all three places
- [ ] A week cannot go live while slide 5 is still DRAFT
- [ ] Post-session evaluation captured, with restricted follow-up and safeguarding fields
- [ ] Slide 9 → next week's slide 2 loop verified end to end
- [ ] No member personal data in any AI prompt; no secrets committed

**Start at Gate A. Report, then stop.**
