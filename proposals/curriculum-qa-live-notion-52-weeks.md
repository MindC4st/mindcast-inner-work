# Mindcast Curriculum QA — Live Notion, Weeks 1–52 (rerun)

Run 2026-08-23 against the live Notion track databases (source of truth).
156 pages read in full (52 × Adult/Teen/Child), recursive block trees +
properties. No CSV exports used. No pages created or edited. No video chosen
or replaced.

---

## 1 · Executive summary

**93 of 156 lessons pass clean. 63 carry at least one defect.** The defects
cluster in two places:

1. **Weeks 28–30 and 33–48 (all or some tracks)** — the pre-40s material has
   not been brought to the completed 40–52 standard: flattened "Prep"
   facilitator-note blobs (wk28–30), a missing `Evidence quality` subsection
   across most Teen/Child lessons wk33–48, retired `## Picture book` headings
   and missing Colouring-page sections (Child wk28–30, 33–48), missing
   `Shared core concept` callout lines (wk28–30), and 25 retired `— OPEN`
   tags in weeks 40–48.
2. **Weeks 40–48 specifically** — the newly completed block has real defects
   of its own: shared core concepts are **not** word-for-word identical across
   tracks in any of wk40–48 (rule 6), callback lines are missing for all of
   wk40–48 (27 pages), and wk52's callback property contains a description
   ("none — the 52-week curriculum is complete…") instead of being blank.

**Verified fixed** (fresh check confirms the reported cleanups held):
callbacks wk18–39 populated and rule-compliant · wk34/36/37 shared-core drift
corrected · Adult wk30 `journey` language removed · Adult wk30 notes structure
restored · Teen wk23 retitled "Making Space for an Ending" · retired OPEN tags
removed from wk33–39 · Child wk1 affirmation present · no hand-typed "Voices
of last week" in any Week 2 body.

**Safety (G):** no eyes-closed distress recall, no caregiver-secrecy
encouragement, no ceremonial staging, no forced disclosure, no clinical-role
claims found in any lesson body. Week 52 carries no ongoing practice
requirement (clean exit) in all three tracks.

**Evidence (H):** all 26 flagged claim-hits were manually reviewed; 25 are
compliant refusal-context mentions (myth-tested anchors and do-not-claim
bullets quoting banned claims to reject them). The only genuine vocabulary
issues are three titles/themes using banned words: wk18 "Rewiring the Critic",
wk24 "Rewiring Fear" (theme lines; lesson bodies explicitly disclaim rewiring)
and Teen wk51 page title "The Journey Is the Point" (forbidden `journey`).

---

## 2 · Pass/fail counts

| | Adult | Teen | Child | Total |
|---|---|---|---|---|
| Pass | 35 | 29 | 29 | **93** |
| Fail | 17 | 23 | 23 | **63** |

Failing weeks by track:
- **Adult (17):** 18, 24, 28, 29, 30, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48 (note: 18/24 are theme-vocab only)
- **Teen (23):** 18, 24, 28, 29, 30, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 51, 52
- **Child (23):** 18, 24, 28, 29, 30, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 52

Weeks 1–17, 19–23, 25–27, 31–32 (Adult), 49–51 (Adult/Child) pass clean.

---

## 3 · Exact remaining defects

### 3.1 Flattened facilitator-note "Prep" blobs (structure lost)

| Week | Track | Page ID | Section | Current | Expected | Correction |
|---|---|---|---|---|---|---|
| 28 | Adult | 3c00d85f-784c-8120-9198-e73013985bcc | Facilitator notes | single `### Prep` blob | Aim / Run the room / evidence / Evidence quality / do-not-claim / Source trail | Rebuild subsections from blob content (human) |
| 28 | Teen | 3c00d85f-784c-8151-9621-c78fcc7e47d8 | Facilitator notes | single `### Prep` blob | as above | as above |
| 28 | Child | 3c00d85f-784c-81c9-9fca-fd101cb6d31d | Facilitator notes | single `### Prep` blob | as above | as above |
| 29 | Teen | 3c00d85f-784c-816d-b71c-f905564e62f0 | Facilitator notes | single `### Prep` blob | as above | as above |
| 29 | Child | 3c00d85f-784c-8107-8b89-ea900c59486d | Facilitator notes | single `### Prep` blob | as above | as above |
| 30 | Teen | 3c00d85f-784c-8132-9b7c-f4b4abf675d4 | Facilitator notes | single `### Prep` blob | as above | as above |
| 30 | Child | 3c00d85f-784c-81fe-947f-f93ee84201e8 | Facilitator notes | single `### Prep` blob | as above | as above |

(Adult wk30 was restored — verified — but see 3.2 for its remaining marker.)

### 3.2 Editorial markers leaking into live lessons

| Week | Track | Page ID | Section | Current text | Correction |
|---|---|---|---|---|---|
| 30 | Adult | 3c00d85f-784c-8134-be56-dee2c880c811 | Run the room | starts "Read §3 before facilitating." | Delete the sentence (deterministic — review-doc reference) |
| 30 | Teen | 3c00d85f-784c-8132-9b7c-f4b4abf675d4 | Prep blob | contains "Read §3 before facilitating" | Remove during 3.1 rebuild |
| 30 | Child | 3c00d85f-784c-81fe-947f-f93ee84201e8 | Prep blob | contains "Read §3 before facilitating" | Remove during 3.1 rebuild |

### 3.3 Missing `Evidence quality` subsection (spec §1/F requires it)

31 pages lack the `### Evidence quality` heading under Facilitator notes
(content not found inline either):
- Teen: 33, 34, 35, 37, 38, 39, 40, 41, 44, 47
- Child: 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48
- Adult: 36, 37, 38, 39, 48

Correction: grade the existing evidence block (strong / moderate / contested /
illustrative only) and add the subsection — human judgement per lesson.

### 3.4 Missing `Shared core concept` callout lines

| Week | Missing on | Page IDs (A/T/C) |
|---|---|---|
| 28 | Adult + Teen + Child | 3c00d85f-784c-8120-9198-e73013985bcc / …8151-9621-c78fcc7e47d8 / …81c9-9fca-fd101cb6d31d |
| 29 | Teen + Child | 3c00d85f-784c-816d-b71c-f905564e62f0 / …8107-8b89-ea900c59486d |
| 30 | Adult + Teen + Child | 3c00d85f-784c-8134-be56-dee2c880c811 / …8132-9b7c-f4b4abf675d4 / …81fe-947f-f93ee84201e8 |

Correction: author the shared line once, add word-for-word to all three
tracks' callouts (human — deterministic text once authored).

### 3.5 Retired `— OPEN` delivery tags (rule 5: leave untagged instead)

25 headings in weeks 40–48:
- `Opening question — OPEN`: Adult 43, 44, 48 · Teen 40, 41, 44, 47 · Child 40–48 (9)
- `Ask the children — OPEN`: Child 40–48 (9)

Correction: remove the `— OPEN` suffix, leave heading untagged (deterministic).

### 3.6 Child terminology — retired `## Picture book` heading (rule 2)

19 pages use `## Picture book` instead of canonical `## Story`:
Child wk28, 29, 30, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48.
(Child wk1–27, 31–32, 49–52 correctly use `## Story`; all Story sections
carry the six required subheadings.)
Correction: rename heading (deterministic); also reposition per 3.7.

### 3.7 Child architecture deviations vs canonical (wk49–51 pattern)

- Child wk28–30, 33–48: Group game sits **before Opening** and there is **no
  Colouring page section** (canonical: Story after Opening; Colouring page +
  Group game after In the room). 19 pages.
- Child wk28–30 additionally carry Ancient wisdom + In today's world sections
  absent from the canonical child backbone.
- Child wk52: top-level `Journaling prompt` H2 and no Signal metaphor —
  minor, likely intentional for the closing lesson; confirm.

Correction: move/rename sections to the canonical child layout (human —
content exists, placement is mechanical).

### 3.8 Banned vocabulary in themes/titles (the only genuine H/I findings)

| Week | Track | Location | Current | Rule | Correction |
|---|---|---|---|---|---|
| 18 | all 3 | Weekly theme line | "Rewiring the Critic — Building the Inner Coach" | §2.2 no "rewiring" (bodies correctly disclaim it) | Retitle — human decision (e.g. "Retraining the Critic") |
| 24 | all 3 | Weekly theme line | "Rewiring Fear — From Threat to Signal" | same | Retitle — human decision |
| 51 | Teen | Page title | "Week 51 — The Journey Is the Point" | §2.3 forbidden `journey`; §4.6 outstanding | Retitle — human decision; also update the video search term quoting the old title |

All other claim/vocab hits (26 scanned) verified as compliant refusal-context
quotes — including the wk12/wk31 myth-tested anchors, the wk33 decision-fatigue
correction, the wk24 amygdala oversimplification disclaimer, and the wk41
teen Overclaim challenge exercise quoting "This rewires your brain" as the
overclaim to challenge.

### 3.9 Week 52 callback property should be blank

All three wk52 pages carry callback text "none — the 52-week curriculum is
complete and no return task is required". Rule: Week 52 stays empty; the app
renders this property as "Last Sunday you were asked to ___".
Correction: clear the property on all three wk52 pages (deterministic).
Page IDs: 3c00d85f-784c-8107-aec9-fa2e582fac8c (Adult) ·
3c00d85f-784c-8133-9659-df395b60c52f (Teen) ·
3c00d85f-784c-81a9-8150-dc067dc35c5d (Child).

---

## 4 · REPORT-ONLY — video section (no selection made)

- **All 156 lessons currently carry "Video: No licensed URL selected."** with
  an `OPEN-LICENCE SEARCH BRIEF` in the description (STATUS / WHY / WHAT THE
  VIDEO SHOULD DO / SEARCH TERMS / LICENCE GATE / CONTENT GATE / RUNTIME /
  REGISTER). This is internal workflow text, correct while video work is
  underway — participant surfaces must not render it.
- The two previous `TO BE REPLACED` flags (Adult wk1 Emotional Labour, Teen
wk1 7 Hard Truths) are **gone** — both descriptions now state the previous
URL was removed from active use. Verified resolved.
- No obviously wrong-week assignments remain in any description.
- Note for the video pass: Teen wk51's search terms still quote the old page
  title "The Journey Is the Point" (see 3.8) — update when retitling.

---

## 5 · Shared Core Concept mismatch report (rule 6 — exact strings on file)

Weeks 40–48 all violate word-for-word identity (wk49–52 pass; wk1–27 pass;
wk28–30 covered in 3.4):

| Week | Adult | Teen | Child | Pattern |
|---|---|---|---|---|
| 40 | "Helpful service begins with noticing, asking and offering rather than…" | "Prosocial action can strengthen relationships and sometimes…" | = Teen | Adult differs |
| 41 | "Explaining an idea in your own words, retrieving it without…" | "Preparing to explain and actually explaining material to another…" | = Teen | Adult differs |
| 42 | "Authenticity does not require full disclosure or behaving the same…" | = Adult | "Authenticity is not total disclosure. It is acting in ways that…" | Child differs |
| 43 | "Values are directions, not moral purity tests. Under pressure…" | "Values are hardest to use under pressure. Pre-planning a cue…" | = Adult | Teen differs |
| 44 | "Conflict becomes more workable when people separate observable…" | = Adult | "Conflict becomes more workable when people separate what happened…" | Child differs |
| 45 | "Generosity is voluntary and bounded. Giving, receiving and declining…" | = Adult | "Generosity is voluntary sharing when we genuinely have something…" | Child differs |
| 46 | "Sufficiency is a reference question: enough of what, for whom…" | = Adult | "'Enough' depends on what we need something for. Some things…" | Child differs |
| 47 | "Persistence is useful when paired with feedback and the option to…" | "Persistence is useful when the goal still matters, the method…" | "Practice can help skills grow, especially when we notice what…" | all three differ |
| 48 | "You cannot be responsible for how another person feels after…" | "Relationship quality is built partly through observable micro…" | "Children are not responsible for making other people happy…" | all three differ |

Correction: for each week, choose ONE of the existing versions (or author a
fresh shared line) and set it identically on all three tracks; keep the three
translation lines as the only per-track text. Human decision per week.

---

## 6 · Callback QA report

- **Weeks 1–17, 18–39, 49–51: present and rule-compliant** — lowercase start,
  no final full stop, no leading "you" (Adult/Teen), derived from the same
  week's SUN practice (keyword-derivation check passed), ≤180 chars. The
  previously blank wk18–39 callbacks are confirmed populated and well-formed.
- **Weeks 40–48: missing entirely (27 pages).** Deterministic correction
  available: each can be derived from that lesson's SUN practice per the
  schema (e.g. wk40 Adult SUN: "Practise one specific offer of help that
  leaves the other person in charge of their own outcome" → callback such as
  "practise one specific offer of help that leaves the other person in charge
  of their own outcome"). Recommend human review of auto-derived wording.
- **Week 52: should be blank** — see 3.9.
- Soft 140-char target: no callback exceeds 180; a small number sit between
  140–180 and are faithful to their SUN practice — left as-is per the
  resolved rule.

---

## 7 · Retired-tag / heading report

- `— OPEN` delivery tags: **25 remaining, all in weeks 40–48** (list in 3.5).
  Weeks 33–39 confirmed clean of OPEN tags (previous cleanup held).
- `## Picture book` retired heading: **19 pages** (Child wk28–30, 33–48) — see 3.6.
- No `OPEN-LICENCE SEARCH BRIEF` text was treated as a delivery tag (workflow
  phrase correctly ignored per resolved rule 5).
- `Draw or tell` / `Draw it` child reflections: accepted as correct
  child-specific equivalents of Private write — not flagged anywhere.

---

## 8 · Weeks 40–52 QA results (reference implementation — audited fully)

**Canonical backbones observed (majority patterns):**
- Adult: Opening > Core concept > Teaching points > Video > In the room >
  Weekly practice > Closing > Facilitator notes (10 of 13 weeks; wk43/44/48
  additionally carry Ancient wisdom + Signal metaphor)
- Teen: Opening > Video > In the room > Weekly practice > Closing >
  Facilitator notes (9 of 13 weeks; wk40/41/44/47 additionally carry Core
  concept + Teaching points + Signal metaphor)
- Child: canonical per resolved rule 2 = Opening > Story > Core concept >
  Teaching points > Signal metaphor > Video > In the room > Colouring page >
  Group game > Weekly practice > Closing > Facilitator notes (wk49–51; wk52
  adds a top-level Journaling prompt and drops Signal metaphor)

**Defects found inside 40–52:**
1. Shared core concept drift in every week 40–48 (§5) — rule 6 violation.
2. Callbacks missing for all of 40–48 (§6).
3. 25 `— OPEN` tags in 40–48 (3.5).
4. Child 40–48: retired `Picture book` heading + pre-Opening game placement +
   no Colouring page section (3.6/3.7).
5. `Evidence quality` subsection missing in Teen 40/41/44/47, Child
   40–48, Adult 48 (3.3).
6. Teen wk51 title "The Journey Is the Point" (3.8).
7. wk52 callback property should be blank (3.9).
8. **Architecture inconsistency (human decision):** Teen's majority pattern
   (9 of 13 weeks) omits Core concept and Teaching points entirely, while the
   Adult majority keeps them and resolved rule 1 says Adult and Teen share the
   same backbone. Either the 9 lean Teen weeks are missing two content
   sections, or the backbone genuinely narrows for Teen — the spec says
   otherwise. Flagged for decision; content cannot be invented if missing.
9. Adult minority pattern (wk43/44/48 with Ancient wisdom + Signal metaphor)
   is inconsistent with the Adult majority — confirm intended.

**Clean within 40–52:** safety checks (all G items), evidence hygiene, vocab
(except wk51 title), fidelity tags except OPEN, notes structure except
Evidence-quality gaps, wk52 clean exit (no practice obligation, hand-back
script present).

---

## 9 · Blockers for Supabase push / PDF regeneration

Content-level blockers (must be fixed in Notion before the next app pull):

1. **Shared core concepts wk40–48** (9 weeks × 3 tracks) — the app stores one
   shared concept per week; divergent source text means whichever track is
   pulled last wins arbitrarily.
2. **Callbacks wk40–48 missing + wk52 non-blank** — the app renders
   `previous_week_callback` on the Voices slide; missing values render blank
   (acceptable but wrong per spec), and wk52's description text would render
   as a nonsense "Last Sunday you were asked to none — …" prompt.
3. **Flattened Prep blobs wk28–30** (6 pages) — facilitator notes would pull
   as unstructured blobs into the app's notes drawer.
4. **wk30 "Read §3" marker** (3 pages) — editorial text would surface to
   facilitators.

Non-blocking for the push (fix when convenient): Evidence-quality subsections
(3.3), OPEN tags (3.5 — tags aren't stored in the app), Picture-book headings
and child section placement (3.6/3.7 — content still pulls, structure affects
Notion-side consistency), theme/title vocabulary (3.8 — human retitling),
video search briefs (report-only until video work lands).

**Worksheets/slides:** no deck/worksheet code changes needed — the v3 deck and
worksheet generator already render from these fields. Regenerate PDFs after
the source fixes above are pushed to Supabase.

---

## Appendix — method

- Fetched 2026-08-23 via Notion API (database query + recursive block
  children), all 156 pages, page IDs preserved (listed in §3).
- Automated checks: section-order vs 40–52 majority backbone, callout
  shared-concept string equality, callback schema + SUN-derivation keyword
  overlap, heading-tag scan, child Story subheading completeness, facilitator
  notes subsection presence + editorial-marker scan, 27 banned-claim patterns
  and 7 vocab patterns with refusal-context filtering, safety heuristics
  (eyes-closed recall, caregiver secrecy, staging, forced disclosure,
  clinical roles), video status scan.
- Every automated H/I hit (31) manually reviewed against surrounding text;
  28 reclassified as compliant refusal-context quotes, 3 confirmed (3.8).
- QA engine kept at `mirofish/qa-52.mjs` (temp workspace) and results JSON at
  `mirofish/qa-52-results.json` for reruns.

---

## Addendum — video update verification (re-fetch, later same day)

All 156 pages re-fetched fresh after the video update and audited separately
(`video-audit.mjs`). Results:

- **156/156 lessons carry a suggested video.** The `Video:` line is a live
  hyperlink to the intended URL on every page (verified via rich-text hrefs,
  not just visible text). Zero `No licensed URL selected`, zero
  `OPEN-LICENCE SEARCH BRIEF`, zero `TO BE REPLACED` placeholders remain.
- **Every entry carries the full metadata block:** STATUS (SUGGESTED VIDEO —
  UNVERIFIED, REQUIRES FULL HUMAN VIEWING) · Title · Channel · Runtime ·
  "Why it may fit" rationale · Licence note (rights not established; confirm
  platform/rights-holder terms) · "Review before use" guidance.
- **Teen 52/52 and Child 52/52 carry the extra safeguarding checks:**
  - Teen: age fit + reject secrecy from caregivers, discouraging trusted-adult
    help, food/weight/body-image material, or content making a young person
    responsible for fixing somebody else.
  - Child: child age fit + ads/suggested-content context, and additionally
    reject frightening content, diagnosis/therapy framing, and unofficial
    copyrighted-book read-alouds.
- **No wrong-week assignments** detected in any description; no leftover
  search-brief workflow text (STATUS/SEARCH TERMS/LICENCE GATE/CONTENT GATE).
- All videos remain explicitly **UNVERIFIED pending full human viewing** — as
  stated. The licence note correctly flags that reuse/commercial-display
  rights are not yet established for any of them.

**Report-only note for the video pass:** these are suggestions, not approved
assets. The app must not render the description metadata (STATUS/Licence/
Review blocks) on participant-facing surfaces, and no video should go into a
live session or worksheet until the human viewing pass clears it and the
licence position is confirmed.

**Everything else in this report is unchanged by the video update.** The §9
blockers for the Supabase push / PDF regeneration (wk40–48 shared-core drift,
wk40–48 callbacks + wk52 non-blank, wk28–30 Prep blobs, wk30 "Read §3"
marker) all still stand and still need Notion-side fixes before the next pull.

---

## Addendum 2 — corrections after live page-level re-verification

The original 93/63 pass/fail count is **stale and withdrawn**. A follow-up
fix pass was made directly in Notion, then verified via direct page fetches
(database query endpoint at workspace usage cap; page fetch/update still
available). Verified status:

### Confirmed FIXED (live page fetches)

| Finding | Status |
|---|---|
| Callbacks wk40–48 (27 pages) | ✓ all populated, rule-compliant lengths (37–141 chars) |
| Week 52 callbacks | ✓ genuinely blank on all three tracks |
| Shared core concept wk40–48 | ✓ word-for-word identical across all three tracks, all 9 weeks |
| 25 retired `— OPEN` tags | ✓ zero remaining in wk40–52 |
| Prep blobs wk28–30 (6 pages) | ✓ all rebuilt into the six standard subsections |
| "Read §3 before facilitating" | ✓ gone from all wk28–30 pages incl. Adult wk30 |
| Teen backbone (wk42, 43, 45, 46, 48, 49, 50, 51, 52) | ✓ Core concept + Teaching points present on all nine |
| Teen wk51 title | ✓ now "Week 51 — The Practice That Keeps Practising" |
| Adult wk24 theme | ✓ retitled "Calibrating Fear — From Threat to Signal" (§3.8 finding for wk24 stale) |

### Confirmed STILL OPEN (verified live)

1. **FRI practice lines — rule is exactly MON/WED/SUN.** Confirmed live on
   Teen wk40, Child wk40, Teen wk47, Child wk47 (4-day MON/WED/FRI/SUN
   blocks). **Engine miss:** the original QA run had no practice-day check;
   weeks 40–52 were never scanned for FRI. A full rerun must enumerate every
   FRI/TUE/THU/SAT line across all 52 weeks. Correction: merge FRI into WED.
2. **Adult wk30 Teaching Points overclaim** (page
   3c00d85f-784c-8134-be56-dee2c880c811). Verified live — four claims
   materially stronger than the same page's own refusal language:
   - "Sleep research (Matthew Walker) is unequivocal… the single
     highest-leverage physiological intervention available" — Walker is a
     writer, the book has documented errors, and the page's own do-not-claim
     says "We do not treat Matthew Walker's popular book as the evidence
     authority."
   - "regular physical activity is as effective as antidepressants for
     mild-to-moderate depression" — contested clinical-strength claim on a
     page whose notes say the discussion stays within educational scope.
   - Gut microbiome "influences mood, anxiety, and cognitive function… at a
     physiological level that most people dramatically underestimate" —
     human mood/anxiety effects are preliminary and contested.
   - Extended-exhale breathing "directly modulating the autonomic nervous
     system" / "works immediately" — stronger than the modest framing the
     page's Evidence quality line itself uses.
   Correction: soften each to the strength the page's own Evidence quality /
   do-not-claim blocks already state. **Engine miss:** no overclaim patterns
   existed for intervention-strength claims.
3. **Adult wk28 Journaling Prompt contamination — still live in Notion**
   (page 3c00d85f-784c-8120-9198-e73013985bcc). The prompt still carries
   "Reason: 'attract into your life' is the vocabulary of the law of
   attraction…" followed by "4.1 One more thing about Week 31", "--- 5.
   Signal Metaphor rewrites WK 28 CHILD…" and "--- 6. Evidence-backed
   facilitator notes". Note: the earlier app pull (migration
   20260823120000) stripped this at pull time, so the app copy is clean —
   but the Notion source page still carries it. **Engine miss:** the
   editorial-marker scan only looked inside Facilitator notes.
4. **wk28 callout has no Shared core concept line at all** (Adult + Teen
   verified; Child per original §3.4). The wk28 callout format is also
   non-canonical ("Block 3 — Rebuild · Weekly theme: … · Movement: … ·
   Spiral: …" with no Week N / Week type / shared-concept / translation
   lines). wk29 Teen/Child and wk30 all tracks likewise (§3.4 still open).
5. **Adult wk18 theme "Rewiring the Critic"** — still live (§3.8 stands for
   wk18; wk24 now fixed).
6. **Child architecture wk28–30 + 33–48** — retired `## Picture book`
   headings, Group game before Opening, no Colouring page section (§3.6/3.7
   stand; Child wk40 and wk47 re-confirmed live).
7. **Evidence quality subsection gaps** — still open on the 31 pages listed
   in §3.3 (Child wk40 and wk47 re-confirmed live).

### Engine corrections applied for the next full run

`qa-52.mjs` patched to add: practice-day check (only MON/WED/SUN; wk52 none),
editorial-marker scan across ALL sections, overclaim pattern set
(unequivocal / antidepressant-equivalence / highest-leverage / microbiome-mood
/ breathing-immediate / direct-ANS-modulation), and a callout-format check
(shared core concept line required). Rerun blocked only by the Notion
database-query usage cap; page-level spot verification remains available.

### Revised position

The Supabase push blockers from §9 are resolved. What remains is real QA work
but non-blocking for a pull: FRI merges (full enumeration below), wk30
teaching-point overclaims, wk28 journaling-prompt contamination (Notion
source), wk28–30 callout gaps, wk18 theme vocab, child architecture 28–48,
and the Evidence-quality subsection gaps. The "safety/evidence clean"
conclusion in §1 is withdrawn pending the overclaim cleanup and a full rerun.

### FRI practice lines — full enumeration (all 52 weeks × 3 tracks scanned)

**34 pages carry a FRI line**, all with the identical MON/WED/FRI/SUN
pattern. No TUE/THU/SAT anywhere, no duplicate days, wk52 carries none, and
every other lesson is exactly MON/WED/SUN.

- **Adult (8):** wk33, 35, 36, 38, 39, 43, 44, 48
- **Teen (10):** wk33, 34, 35, 37, 38, 39, 40, 41, 44, 47
- **Child (16):** wk33–48 inclusive

Correction for all 34: merge the FRI content into WED as one natural
instruction; never into SUN (the callback derives from SUN).

### Agreed priority order for the remaining curriculum QA

1. FRI merges (34 pages above) — every non-wk52 lesson ends exactly MON/WED/SUN.
2. Rewrite Adult wk30 Teaching Points down to the cautious standard the same
   page's facilitator notes already use (Walker "unequivocal",
   exercise-equals-antidepressants, microbiome mood claims, breathing
   "works immediately" / direct ANS modulation).
3. Clean Adult wk28 journaling-prompt contamination (delete the review text
   after the prompt sentence) and normalise wk28–30 callouts: one shared-core
   sentence per week, identical across tracks, with the track translation
   beneath.
4. Rename wk18 theme — e.g. "Retraining the Critic — Building the Inner
   Coach" (keeps meaning, drops literal rewiring).
5. Normalise Child wk28–48 architecture mechanically: ## Story after Opening
   with the six subheadings, Colouring Page after In the Room, Group Game in
   canonical position. No substantive activity rewrites unless necessary.
6. Fill the remaining Evidence quality subsections from each lesson's own
   evidence — labels Strong / Moderate / Contested / Illustrative, never
   applied automatically.

The patched checks (practice-day validation, whole-page contamination scan,
intervention-strength overclaims, callout-format validation) are now
permanent in `scripts/curriculum-qa-notion.mjs` (self-contained: fetches all
156 live pages and runs the full rule set; needs the Notion database-query
endpoint). Once the workspace query cap resets, one clean 156-page rerun
becomes the new baseline; the old 93/156 figure is retired, not adjusted.
