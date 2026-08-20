# Notion → App Pull: Weeks 1–39 — Report

Pulled 2026-08-23 from the Notion track databases (source of truth per the
Curriculum Lesson Specification & Verification Pass). 117 lessons (39 weeks ×
adult/teen/child) read in full.

**Deliverable:** `supabase/migrations/20260823120000_weeks1_39_notion_pull.sql`
— 156 updates (39 `curriculum_weeks` + 117 `mindcast_live_sessions`),
dollar-quote balanced, typecheck clean. Supersedes the review-doc migrations
for weeks 1–31 and the earlier weeks 32–52 pull for weeks 32–39.

Generator kept at `scripts/build-weeks1-39-migration.mjs` (re-runnable).

---

## 1 · Week 1 — changes with before/after (GATE item 1)

Week 1 was already substantially correct in the app (from the review-doc
migration). The Notion version differs in these fields:

### Adult — "What Are You Actually Receiving?"

| Field | Before (app) | After (Notion) |
|---|---|---|
| Hook | (none stored — v3 seed) | "Ask people to write a number from 1–10 privately: How much of yesterday felt chosen, and how much felt reactive?…" — STRUCTURED |
| Opening question | curriculum_weeks only | "What is one thing that has taken up more of your attention this week than you intended? Passing is fine." |
| Core concept | shared concept only | Full section: "Today the adult room works with attention as a limited resource…" + shared concept + Adult translation |
| Teaching points | 5 points (Eurich-led) | 5 points, reordered: attention selective → Eurich 95%/10–15% ("treat those as…") → social influence → not-therapy → what-before-why |
| Video | kJ_Gg5DPCQU + description | Same URL; description now "TO BE REPLACED — …belongs to Week 19" (pulled as-is; report-only) |
| In today's world | (empty) | Theme = DRAFT placeholder (report-only) + VO script: "Your attention can be occupied before you have consciously decided what matters…" |
| Ancient wisdom | navigator reframe | Reframe + VO script (both navigator material, VO script new) |
| Signal metaphor | browser tabs | "Your attention is like a browser with too many tabs making noise at once…" (refined) |
| Private write | (new column) | "What reached you yesterday that you never deliberately chose to give attention to?" |
| Exercise | SIGNAL AUDIT (same) | SIGNAL AUDIT — wording tightened, opt-out explicit |
| Guided reflection | eyes-open written | Eyes open, three questions, "If nothing comes, leave it" |
| Journaling prompt | "What repeatedly won your attention…" | "Looking across this week, what repeatedly won your attention — and what would you like to make easier to notice next week?" |
| Intention | (new column) | if-then plan template |
| Practices | MON/WED/SUN | Same three days; SUN = "Find the quiet channel…" |
| Affirmation | "Beneath the noise there is a signal…" | "I can notice what is reaching me and choose what deserves my attention." |
| Facilitator notes | evidence block | Full structure: Aim / Run the room / Evidence (Eurich, Gollwitzer, Maltz anchor) / Evidence quality (Moderate) / Do-not-claim (5 bullets) / Source trail (4 citations) |
| previous_week_callback | (column existed, empty) | "" (Week 1 has no previous week) |

### Teen — "Who's Actually Talking?"
Same pattern. Notable: safeguarding line retained in Run the room ("Nothing in
this session means keeping things from parents, caregivers or trusted
adults"); mirror-neurons do-not-claim retained; video Thlbqg2sKEM flagged TO
BE REPLACED (report-only). Callback: "pick one belief off your MINE / NOT MINE
list that someone else gave you, and work out how old you were when you got
it".

### Child — "Finding Your Station"
Same pattern. Notable: affirmation now present ("I can notice my body's
signals without having to know exactly what they mean" — previously missing,
§4.7 resolved in Notion); Story = The Quiet Book (Deborah Underwood) +
Aotearoa alternative Titiro Look (Gavin Bishop, Tainui, Ngāti Awa); game
SIGNAL IN THE STATIC with equipment + under-5s; colouring prompt pulled to
`curriculum_weeks.kids_colouring_prompt`. Callback: "give yourself a butterfly
hug if you like, notice what your body says back, and tell a trusted grown-up
only if you want to".

### Week 2 wiring (voices slide)
`previous_week_callback` for every week 2–39 row is set from the previous
week's callback line, same track — this is what the "Voices from Last Week"
slide renders. Week 2 examples now live:
- Adult: "find the quiet channel — five minutes with no input at all, and notice what was still there underneath"
- Teen: "pick one belief off your MINE / NOT MINE list…"
- Child: "give yourself a butterfly hug if you like…"

No hand-typed "Voices of last week" text was found in any Week 2 body (already
removed in Notion).

---

## 2 · Week 1 §5 checklist results (GATE item 2)

| Check | Adult | Teen | Child |
|---|---|---|---|
| Sections present, tagged | ⚠ order (see below) | ⚠ order | ✓ ("Story" not "Picture book") |
| Shared core concept identical | ✓ | ✓ | ✓ |
| Exactly MON/WED/SUN | ✓ | ✓ | ✓ |
| Callback line populated, from SUN | ✓ | ✓ | ✓ |
| No contamination markers | ✓ | ✓ | ✓ |
| No banned claims; caveats present | ✓ | ✓ | ✓ |
| Evidence quality + do-not-claim | ✓ | ✓ | ✓ |
| Real-world anchor | ✓ Maltz | ✓ Maltz | ✓ Maltz (facilitator-facing) |
| Body complies with do-not-claim | ✓ | ✓ | ✓ |
| No eyes-closed narrated recall | ✓ "Keep your eyes open" | ✓ | ✓ |
| No ceremonial staging | ✓ | ✓ | ✓ |
| Costless opt-out on every share | ✓ "Passing is fine" | ✓ | ✓ "answer, point or pass" |
| Signal metaphor track-specific | ✓ tabs | ✓ phone apps | ✓ lighthouse |
| Child notes address child room only | n/a | n/a | ✓ |
| Title matches content | ✓ | ✓ | ✓ |
| No forbidden vocabulary | ✓ | ✓ | ✓ |
| Macrons | ✓ | ✓ | ✓ (Ngāti Awa) |

**Order caveat (all three tracks):** actual page order is Opening → Core
concept → Teaching points → Video → In today's world → Ancient wisdom →
Signal metaphor → In the room → … while §1 lists Ancient wisdom and Signal
metaphor before In today's world and Video. Teen differs again (Video before
Core concept). Content is complete; only heading sequence diverges — see §4
ambiguity 1.

---

## 3 · Pull-time transformations (fix-directly category)

1. **Adult wk28 journaling prompt** — review-document contamination removed:
   everything from ` Reason: "attract into your life"…` onward (~1,900 chars
   including "4.1 One more thing about Week 31", "--- 5. Signal Metaphor
   rewrites", child metaphor drafts). Clean prompt retained verbatim.
2. **wk30 all tracks, facilitator notes** — removed `Read §3 before
   facilitating.` (review-doc reference meaningless outside the review doc).
3. **FRI → WED merges (18 lessons):** Adult 33/35/36/38/39, Teen
   33/34/35/37/38/39, Child 33/34/35/36/37/38/39. Friday content appended to
   Wednesday as one instruction; Sunday untouched (callback source). The
   `weekly_practice_fri` column is cleared for weeks 1–39.

---

## 4 · Report — don't fix (GATE item 3)

### Videos (§4.4) — full list of flagged slots
| Lesson | Current video | Flag |
|---|---|---|
| Adult wk1 | kJ_Gg5DPCQU — Emotional Labour | belongs to Week 19 |
| Teen wk1 | Thlbqg2sKEM — 7 Hard Truths for Teens | source of the removed "nobody is coming to save you" line |
| Teen wk20 | RZWf2_2L2v8 | description carries workflow note: "Assignment requires review because the lesson rejects abundance-mindset claims" |

Pulled as-is (Notion is source of truth; descriptions carry the flags).

### DRAFT placeholders (§4.3) — 69 instances of "DRAFT — rewrite from the
video transcript once the video is chosen" in `In today's world / Theme`:
- Adult: wk1–32, wk34 (33 lessons)
- Teen: wk1–32, wk36 (33 lessons)
- Child: wk28, wk29, wk30 (3 lessons)

### Missing callback lines — 64 (left blank, never invented)
Weeks 18–36 all tracks; wk37 Teen+Child; wk38–39 all tracks. (Weeks 1–17 are
complete except Adult wk26 present / Child wk26 missing.) Weeks 40–52 outside
this pull.

### Shared core concept drift
- wk34: Adult callout has no "Shared core concept" line (Teen/Child have it).
- wk36: Teen callout has no "Shared core concept" line (Adult/Child have it).
- wk37: Adult version is 307 chars; Teen/Child 281 — not word-for-word.

### Forbidden vocabulary — one real use
- Adult wk30 Core concept (VERBATIM): "The body is not the vehicle that
  carries you through your personal development journey — it IS the journey."
  "Journey" ×2 used for the product. All other vocab hits (15) are
  mentions-inside-do-not-claim blocks or ordinary language ("limited time and
  energy") — compliant.

### Titles contradicting content (§4.6)
- Teen wk23 "What Deserved a Ceremony" — content removes ceremony; notes say
  "No ceremony despite the legacy page title". Title still contradicts.
- (Adult wk52 / Teen wk26 retitles already done; wk51 outside this pull.)

### Structure observations
- wk30 all tracks: facilitator notes are a single flattened "Prep" section
  (Aim/Run-the-room/evidence structure lost in an earlier sync).
- Weeks 33–39 still use retired `OPEN` fidelity tags in Notion (tags are
  Notion-side metadata; not stored in the app — no app impact).

---

## 5 · Where the spec itself is wrong or ambiguous (GATE item 4)

1. **Section order.** §1's order doesn't match the pages (Video / In today's
   world placement), and adult vs teen pages differ from each other. Which is
   canonical — the spec order, or the pages?
2. **"Picture book" vs "Story".** §1 says `## Picture book`; every child page
   uses `## Story`. Spec should adopt the page heading.
3. **Child sections the spec doesn't list:** Colouring page (Prompt + While
   they colour), and "Draw or tell" / "Draw it" in place of Private write /
   Journaling prompt. Pulled to `kids_colouring_prompt`,
   `private_write_prompt`, `journaling_prompt` respectively — confirm mapping.
4. **Callback word limit.** "10–25 words" — Teen wk1's live example is 27
   words. Minor; limit or example should give.
5. **Fidelity tags on containers.** "Video" and "Weekly practice" H2s carry
   tags inconsistently (Weekly practice — VERBATIM, Video untagged). No app
   impact; cosmetic in Notion.
6. **Worksheet/slide scope.** The spec doesn't say whether VO scripts and
   "In today's world" themes belong on member worksheets. Current worksheet
   generator renders: signal metaphor, private write, reflection, practices
   (3-day), exercise, intention, affirmation — VO scripts excluded. Confirm.

---

## 6 · Worksheets & slides status

- **Worksheets:** `scripts/batch-generate-worksheets.mjs` already renders
  private write, intention and the practice grid from these exact columns;
  weeks 1–39 now carry MON/WED/SUN only, so regenerated PDFs match Notion.
  Run after `supabase db push` with `SUPABASE_SERVICE_ROLE_KEY`.
- **Slides:** the v3 deck (`lesson_slides`: welcome, voices, ancient,
  todays_world, theme, video, exercise, reflection, intention, affirmation)
  already maps to the Notion structure; "Voices from Last Week" renders from
  `previous_week_callback`, now populated for weeks 2–39. No slide code
  changes required for this pull.

## 7 · Not done
- Weeks 40–52 re-pull (awaiting Notion completion — user will confirm).
- No Notion pages were edited (this pass is Notion → app only).
- Migration not applied anywhere (`supabase db push` pending).
