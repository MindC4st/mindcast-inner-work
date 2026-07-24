# Legal · IP Review of the 52-Week Curriculum (Pre-launch)

> **⚠️ Founder-level review, not a legal opinion.** This is a diligent content
> audit + remediation to remove the obvious risks before launch. A NZ IP lawyer
> should still sign off the curriculum before you distribute a printed workbook
> or **license to another city** (licensing multiplies exposure).

**Scope:** every one of the 52 weeks as seeded in the database
(`curriculum_weeks`) and the live-session seed (`mindcast_live_sessions`) —
titles, core learning, reflective questions, interactive activities, video
attributions, and the `inner_wisdom_alignment` note shown to members.

**Headline:** the curriculum is **substantially your own original writing**. The
only real exposure was concentrated in the member-facing "inner wisdom" note and
a few borrowed phrasings. All of it has been **remediated** in migration
`20260724040000_ip_review_curriculum_sanitise.sql`.

---

## Findings & actions

| # | Severity | Finding | Where | Action taken |
|---|---|---|---|---|
| 1 | 🔴 High | **"A Course in Miracles / ACIM" named in every week** ("ACIM (reframed): …"). ACIM is modern, in-copyright, **trademarked**, and its foundation has a history of aggressive enforcement. The ideas were paraphrased in your own words (ideas aren't copyrightable), but *naming* it in commercial, member-facing text invites trademark/false-association risk and is off-brand (you wanted your *own* synthesis). | `inner_wisdom_alignment`, all 52 weeks (shown in the portal "Inner Wisdom" callout + FacilitatorView) | **Rewrote all 52 weeks' note as one flowing line** — the "Dao:" / "ACIM (reframed):" labels removed entirely, the ideas kept in Mindcast's own words. (Migration `…040000` stripped the ACIM name; `…060000` reflowed the wording.) |
| 2 | 🟠 Med | **"This is water"** used as a quoted line — David Foster Wallace's signature phrase/parable (in-copyright). | 1 week's alignment note | **Reworded** in original words (no quote). The YouTube link to the actual DFW talk stays — that's a legitimate embed. |
| 3 | 🟠 Med | **"…a vote for the self you are becoming"** + activity "cast a vote for" — closely tracks James Clear's signature *Atomic Habits* line ("every action is a vote for the type of person you wish to become"). Distinctive copyrighted *expression*. | 1 week's alignment note + its interactive activity | **Reworded** the alignment and the activity ("commit to" / "one small commitment"). The *Atomic Habits* YouTube link stays. |
| 4 | 🟡 Low-Med | **"darkness within darkness, the gateway"** — tracks a specific copyrighted Tao Te Ching translation (Stephen Mitchell / Feng-English rather than a public-domain rendering). | 1 week's alignment note | **Reworded** to a public-domain-based paraphrase in your own words. |

## What is fine — no action needed (🟢)
- **YouTube embeds + attributions** (Brené Brown, David Foster Wallace, James
  Clear, Fred Luskin, Dan McAdams). Embedding a video via YouTube's player and
  naming the real talk is legitimate and permitted. *(See caveat below — confirm
  they're official uploads.)*
- **Public-domain wisdom.** The **Tao Te Ching / Daoist ideas** are ancient and
  public domain. Naming "Dao" carries no trademark issue. Your renderings are
  paraphrases, not lifts of a copyrighted translation (after fix #4).
- **Your original core content** — the 52 themes, core-learning summaries,
  reflective questions, and interactive activities are your own writing. No
  quoted book text was found in them.
- **Live-session seed** (`mindcast_live_sessions`) — scanned; carried none of the
  flagged material in its own text.

---

## Remaining recommendations (before printing / licensing)

1. **Verify the YouTube videos are official uploads.** Embedding is fine only if
   the video itself is legitimately hosted. Confirm each distinct video URL points
   to an **official/authorised channel** (TED, RSA, the creator's own channel),
   not a pirated re-upload. There are ~5 distinct videos reused across the weeks —
   quick to check.
2. **Keep the "own synthesis" framing everywhere.** Present the material as
   *"Mindcast's own synthesis, inspired by many wisdom traditions"* — never "the
   teachings of [book]". You've now removed the ACIM label; hold that line in the
   workbook, marketing, and app copy too.
3. **Update the source, not just the database.** The curriculum was generated from
   a CSV (`Mindcast_52_Lessons_Updated.csv`, column `inner_wisdom_alignment_dao_acim`)
   and the seed migration still contains the original strings in git history. The
   sanitise migration supersedes them in any live database, but if you ever
   **re-generate the seed from the CSV**, update the CSV first so the fix isn't
   undone.
4. **Optional:** attribute the public-domain lines as *"Tao Te Ching"* if you want
   scholarly transparency — not required, but nice.
5. **Lawyer sign-off before the printed workbook and before licensing.** A book
   and a licence are wider, more permanent distribution than an app — worth a
   professional read of the full 52 weeks at that point.

## How to verify the fix
After `supabase db push` to your project, run:
```sql
SELECT count(*) FROM public.curriculum_weeks WHERE inner_wisdom_alignment LIKE '%ACIM%';        -- expect 0
SELECT count(*) FROM public.curriculum_weeks WHERE inner_wisdom_alignment LIKE '%This is water%'; -- expect 0
SELECT count(*) FROM public.curriculum_weeks WHERE inner_wisdom_alignment LIKE '%vote for the self%'; -- expect 0
```

## Bottom line
The curriculum is your own work with a thin layer of borrowed attribution that has
now been cleaned. **Biggest remaining item: get a lawyer's read before the printed
workbook / licensing**, and confirm the embedded videos are official uploads.
