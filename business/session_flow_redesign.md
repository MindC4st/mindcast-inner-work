# Session Slide Flow — Current vs. Proposed Reorder

*How a live Sunday session runs on the big screen (the FacilitatorView deck), a
worked Week-1 example, and the reordered flow you proposed: wisdom → metaphor +
how-to-apply → video as supporting evidence.*

---

## Current flow (14 slides, in order)
| # | Slide | What it shows | Source field |
|---|---|---|---|
| 0 | **Title** | Theme + phase | `theme_title`, `phase_name` |
| 1 | **Voices from Last Week** | Moderator-approved reflections carried over | `featured_callbacks` |
| 2 | **Signal Metaphor** | The metaphor/analogy | `signal_metaphor` |
| 3 | **Ancient Wisdom** | The wisdom reframe | `inner_wisdom_alignment` (merged) |
| 4 | **Opening Hook** | A hook line | `opening_hook` |
| 5 | **Core Concept** | The teaching heart | `core_learning` (merged) |
| 6 | **Teaching Points** | Points revealed one-by-one | `teaching_points` |
| 7 | **Reflection 1** | First journaling prompt | `reflective_question` (merged) |
| 8 | **Experiential Exercise** | The interactive activity | `interactive_activity` (merged) |
| 9 | **Guided Reflection** | Facilitator-read reflection | `guided_reflection` |
| 10 | **Reflection 2** | Derived from slide 9 | — |
| 11 | **Weekly Practices** | Mon/Wed/Sun practices | `weekly_practice_*` |
| 12 | **Video** | The video | `youtube_url` (merged) |
| 13 | **Affirmation** | Closing line | `core_affirmation` |

**⚠️ Reality check on the current deck:** several slides are **thin or empty** for
most weeks — the live seed sets `opening_hook`, `teaching_points`,
`experiential_exercise`, `weekly_practice_*` and `core_affirmation` to blank, and
the rich content now lives in `curriculum_weeks`. So today a session leans on:
Title → (Voices) → Metaphor → Wisdom → Core learning → Reflective question →
Activity → Video. The middle "teaching points / weekly practice / affirmation"
beats are placeholders. This is a good moment to redesign rather than patch.

---

## Worked example — Week 1, "The Signal and the Noise" (current order)
- **Title:** THE SIGNAL AND THE NOISE · Phase 1 · See Clearly
- **Voices from Last Week:** *(none for Week 1 — it's the opener)*
- **Signal Metaphor:** "Your mind is a phone with 47 tabs open and notifications firing — the signal is the one tab you opened on purpose. Today: close the tabs (one breath, one thing) and hear the quiet channel underneath."
- **Ancient Wisdom:** "What can be named is never the whole of you — the deepest signal lives beneath every label; you are not the image or the username, but the awareness behind it."
- **Opening Hook:** *(thin/blank in current data)*
- **Core Concept:** "Beneath the mental noise there is a clear inner signal — your own awareness — that was here before the first thought."
- **Teaching Points:** *(thin/blank)*
- **Reflection 1 / Guided Reflection:** "What is the loudest 'noise' in your head right now — and what quiet signal is it drowning out?"
- **Experiential Exercise:** "Live word cloud: everyone submits one word for the noise they carried in; the wall builds in real time, then the facilitator asks what signal sits underneath."
- **Weekly Practices:** *(thin/blank)*
- **Video:** *How to Make Stress Your Friend* — Kelly McGonigal (YouTube)
- **Affirmation:** *(thin/blank)*

---

## Proposed reorder (your vision) ✅
Lead with the **inner wisdom** (the timeless principle), make it **concrete with
the metaphor + a how-to-apply**, then use the **video as supporting evidence** —
a how-to, or a personal-story snippet from a TED talk — *after* the idea has
landed, not as an afterthought at the end.

| # | Slide | Role in the arc | Source |
|---|---|---|---|
| 1 | **Title** | Where we are | `theme_title`, `phase_name` |
| 2 | **Voices from Last Week** | Community continuity / warm-up | `featured_callbacks` |
| 3 | **Inner Wisdom** | **The principle — the basis of the teaching** | `inner_wisdom_alignment` |
| 4 | **In Today's World** | **The metaphor + "Today: …" how to apply it** | `signal_metaphor` |
| 5 | **Video** | **Supporting evidence / how-to / personal story** | `youtube_url` |
| 6 | **Go Deeper** | Core concept — unpack the topic | `core_learning` |
| 7 | **Reflect & Share** | The reflective question (interactive) | `reflective_question` |
| 8 | **Together** | The interactive activity (word cloud / poll / Q&A) | `interactive_activity` |
| 9 | **Guided Reflection** | Facilitator-led settling | `guided_reflection` |
| 10 | **This Week's Practice** | Carry it into daily life | `weekly_practice_*` |
| 11 | **Affirmation** | Close | `core_affirmation` |

### Same Week 1, in the new order
1. **Title** — THE SIGNAL AND THE NOISE
2. **Voices from Last Week** — *(opener, skipped)*
3. **Inner Wisdom** — "What can be named is never the whole of you… you are not the image or the username, but the awareness behind it."
4. **In Today's World** — "Your mind is a phone with 47 tabs open… Today: close the tabs (one breath, one thing) and hear the quiet channel."
5. **Video (evidence)** — Kelly McGonigal, *How to Make Stress Your Friend* — the science that backs the idea.
6. **Go Deeper** — "Beneath the mental noise there is a clear inner signal that was here before the first thought."
7. **Reflect & Share** — "What is the loudest 'noise' in your head right now — and what quiet signal is it drowning out?"
8. **Together** — live word cloud of the noise people carried in.
9. **Guided Reflection** — facilitator settles the room into the signal.
10. **This Week's Practice** — one "close the tabs" moment a day.
11. **Affirmation** — "Underneath the noise, I am still here."

### Why this order works
- **Wisdom first** frames the *why* before the *how* — the teaching has a spine.
- **Metaphor immediately after** makes the abstract concrete and gives an
  action ("Today: …") while attention is highest.
- **Video as support, not filler** — it now *proves/illustrates* the point (data,
  a how-to, or a real person's story) instead of arriving after the energy has
  dropped at slide 12.
- **Reflection + activity land after the idea is understood**, so sharing is
  richer.
- It also **matches the content you actually have** (wisdom, metaphor, core
  learning, video, question, activity) and quietly retires the empty legacy beats.

---

## What this needs to ship (when you're ready)
This is a **code change to the FacilitatorView deck** (reorder `SLIDE_TITLES` +
the slide render, add an "In Today's World" metaphor slide, make the empty beats
optional so they hide when blank). The content is already in place:
`inner_wisdom_alignment`, `signal_metaphor` (+ teen/child variants), `core_learning`,
`reflective_question`, `interactive_activity`, `youtube_url`. Say the word and I'll
rebuild the deck to this order.

## Decisions to confirm
- Happy with the 11-slide proposed order above (vs. the current 14)?
- Should the **video** always sit at slide 5 (right after the metaphor), or flex
  to later for weeks where the video is a *closing* story rather than evidence?
- Keep **Voices from Last Week** at slide 2 (nice community warm-up) — confirm.
