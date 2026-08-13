# 08 · Launch Readiness — Content Audit & Go/No-Go

*A pre-launch check that every one of the 52 weeks, across all three tracks, has
the content the live deck actually reads. A week with an empty field doesn't fail
quietly — it fails in front of a room.*

**Audited:** the three per-track lesson exports (`exports/mindcast-*-lessons.csv`),
which mirror `mindcast_live_sessions`, plus the `activity_type` / `activity_options`
seeds that drive the live widgets.

---

## Result: content is launch-ready ✅

Every slide in the deck has its source field populated for **all 52 weeks × 3
tracks**:

| Deck slide | Source field | Adult | Teen | Child |
|---|---|---|---|---|
| Title | Weekly Theme / Session Title | 52/52 | 52/52 | 52/52 |
| Return to Your Intention | previous_week_callback | 51/52 ✳ | 51/52 ✳ | 51/52 ✳ |
| Inner Wisdom | Ancient Wisdom Reframe | 52/52 | 52/52 | 52/52 |
| In Today's World | Signal Metaphor | 52/52 | 52/52 | 52/52 |
| Video | Video Link | 52/52 | 52/52 | 52/52 |
| Go Deeper | Core Concept | 52/52 | 52/52 | 52/52 |
| Reflect & Share | Journaling Prompt | 52/52 | 52/52 | 52/52 |
| Together | Experiential Exercise | 52/52 | 52/52 | 52/52 |
| Guided Reflection | Guided Reflection | 52/52 | 52/52 | 52/52 |
| This Week's Practice | Weekly Practice Mon/Wed/Sun | 52/52 | 52/52 | 52/52 |

✳ **Week 1 has no previous intention by design** — there is nothing to return to
in the first session, and the Intention slide has an explicit Week-1 branch that
invites an introduction instead. Correct, not a gap.

**Also clean:**
- **0 malformed video links** — every one is a well-formed YouTube URL.
- **0 placeholders** — no TBA / TODO / TBC / lorem left anywhere.
- **0 deity or ACIM references** — the IP remediation held across all three tracks.

---

## One gap found and fixed 🔧
**Five poll weeks had no options.** Twelve weeks are set to `activity_type = 'poll'`
(3, 4, 6, 10, 19, 23, 28, 30, 34, 37, 42, 43) but only seven had `activity_options`.
The other five — **weeks 3, 4, 28, 37, 43** — would have *silently* fallen back to
the plain exercise slide instead of running a poll. Nothing would have looked
broken; the room would just never have seen the poll.

Fixed in `20260726140000_poll_options_gap.sql`, with options written from each
week's own activity. Verify after `db push`:
```sql
SELECT week_number FROM public.curriculum_weeks
WHERE activity_type = 'poll' AND COALESCE(activity_options,'') = '';  -- expect 0 rows
```

---

## Worth knowing (not blockers)

**Video reuse.** Distinct videos per track: **Adult 39**, **Teen 39**, **Child 20**
— across 52 weeks each. Some repetition is fine (a talk that genuinely serves two
themes), but the **Child track reuses heavily** — one video appears 6 times, two
others 5 times each. Worth a look if you want each children's week to feel
distinct. Adult's most-reused appears 5 times.

**Confirm the videos are official uploads.** Flagged in the [IP review](legal/05_ip_review_52_weeks.md)
and still outstanding: embedding is only clean if the source video is legitimately
hosted (TED, RSA, the creator's own channel — not a re-upload). There are ~39
distinct URLs to check.

---

## Go / No-Go

**Content: GO.** Nothing blocks a first session.

**Remaining blockers are configuration, not content:**
1. `supabase db push` — turns on the paywall RLS, tiers, schedule, intention loop,
   widgets and attendance schema.
2. **Stripe** products/prices + env vars.
3. **Program start date** at `/admin/program` — until this is set, nothing unlocks.
4. **Lovable → your Supabase + Vercel** move.
5. **Twilio** env vars + the scheduled absence sweep (attendance texts).
6. **Colouring PDFs** uploaded to the private `colouring` bucket.

**Still needs a human, not a machine:**
- A **live run-through** of the deck with a couple of phones — the closing
  intention → next-week read-back, and the word cloud / poll legibility from the
  back of the room.
- A **print preview** of one phase of the coursebook before a full run.
- One **colouring-page regeneration** to confirm the signed-URL path.

## A note on verification
`npx tsc --noEmit` checks **nothing** in this repo — the root tsconfig is
solution-style (`"files": []` + project references), so it always exits 0. Use
**`npm run verify`** (added for this: `tsc -b` + `vite build`). The real
typecheck immediately surfaced live-widget type errors that the old command had
been passing over.
