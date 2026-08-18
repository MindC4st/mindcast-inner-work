# review-overrides.json — gap report (weeks 1–31 curriculum review)

Generated 2026-08-20 while applying the weeks 1–31 curriculum review to the
app code (Supabase migrations `20260820120000`–`20260820210000`).

`scripts/review-overrides.json` (173 entries) feeds the Notion lesson sync
(`scripts/update-lessons-from-reviews.mjs`). The Supabase migrations are
**complete** against the nine review documents; the overrides JSON is **not**.
If the Notion sync runs from the JSON as-is, the entries below will be missed.
The migration files contain the full `now` text for every item.

## Missing entries (week · track · field)

| Week | Missing |
|---|---|
| 3 | Adult.teaching_points (Frankl attribution fix) · Teen.teaching_points (amygdala softening) · Child.signal_metaphor (pause button) |
| 9 | Adult.teaching_points (ACEs correction) · Adult.guided_reflection (eyes-open written replacement — safeguarding) · Teen.guided_reflection (eyes-open) · Child.experiential_exercise (scripted birthday-cake example; stone goes home by private choice) |
| 14 | **Teen.teaching_points — safeguarding point 0 prepended (no-secrecy-from-carers preamble). Highest-priority gap.** |
| 16 | Adult/Teen/Child.experiential_exercise (verbatim forgiveness opt-out prepended) · Teen.teaching_points (cortisol + health-claim softening) |
| 19 | Adult.teaching_points (fawn/polyvagal correction) · Adult.experiential_exercise (MAKE THE INVISIBLE VISIBLE) · Teen.teaching_points (social-pain caveat) · Teen.experiential_exercise (THE STUFF NOBODY CLOCKS added) · Child.experiential_exercise (THE JOBS NOBODY SEES added) |
| 21 | Adult.teaching_points (attachment caveat) · Child.signal_metaphor |
| 22 | Adult.teaching_points (Brown taxonomy caveat) · Child.signal_metaphor (shield) — note Adult.facilitator_notes disclosure replacement IS a content change, not only an append |
| 23 | Adult.teaching_points (stages-of-grief correction) · Adult.guided_reflection (eyes-open written — safeguarding) · Teen.guided_reflection (eyes-open written) · Child.guided_reflection (seasons tree) · Child.signal_metaphor (autumn tree) |
| 25 | Child.signal_metaphor (old photo) |
| 26 | Adult.experiential_exercise (RELEASE CEREMONY → PHASE 2 STOCKTAKE) · Teen.experiential_exercise (same) · Teen.teaching_points (no prescribed milestone feeling) · Child.signal_metaphor (heavy bag) |
| 29 | Adult.teaching_points (James Clear correction + Lally/Gollwitzer carry-through) · Teen.teaching_points (plain mirror) · Child.signal_metaphor (sunflower) |
| 30 | Adult.teaching_points (Walker correction) · Adult.signal_metaphor + Adult.opening_hook + Adult.guided_reflection ("nervous system regulation" phrase dropped) · Teen.experiential_exercise (food scoring removed — safeguarding) · Child.signal_metaphor (superhero chargers). Food-rules facilitator note present in JSON — verify it is the full verbatim block. |
| 31 | Adult.teaching_points (Rohn fabrication corrected) · Adult.journaling_prompt + Teen.journaling_prompt ("attract into your life" removed) · Child.signal_metaphor (companion plants) |

## Weeks that appear fully covered (verify per-track)

1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 18, 20, 24, 27, 28

## Not in scope of the review docs

- **Weeks 32–34**: no review document exists yet (Block 9, weeks 32–35, is
  unwritten). Nothing to apply anywhere.
- `adult wk35` YouTube-URL-in-affirmation corruption: flagged by the QA scan,
  lives in Block 9 territory.
- `teen wk50` "rewires the brain": Block 12/13 territory.

## Standing rules awaiting sign-off (from the review docs — belong in
MC-SAF-001 and MC-TRN-001, not in lesson files)

1. No eyes-closed facilitator-narrated recall of distressing material (Block 3).
2. No encouraging secrecy from caregivers, any youth session (Block 4).
3. No ceremonial staging — candles, darkened rooms, circle-and-symbol (Block 4).
4. Research vs writers citation rule (Block 8).
5. Curriculum-wide food rules — no numbers, no good/bad foods, no body
   comments, no self-rating for teen/child tracks (Block 8).
