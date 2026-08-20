-- Block 6 curriculum review rewrite (Weeks 20-23, all three tracks).
-- Source: mindcast-block6-weeks-20-23.md. Phase: Unlearn.
--
-- Headline items:
--   * Wk20: the session inverted its own citation (Mullainathan & Shafir
--     showed REAL scarcity taxes bandwidth — the lesson taught scarcity is a
--     story) and its affirmation was a manifestation claim (Charter s7
--     breach; 'abundance' is forbidden vocabulary per MC-BRD-002). Both
--     fixed. The concession-pathway line is now in the facilitator notes.
--   * Wk21: adult attachment 'styles' caveated (strong for infants, weak
--     for the four-box adult quiz version).
--   * Wk22: Brown's armour reframed as taxonomy not measurement; facilitator
--     self-disclosure instruction replaced with the steadiness rule.
--   * Wk23: grief session brought under the Week 9 standing rule — eyes
--     open, written, no narrated descent, all three tracks. Stages of grief
--     corrected (Kubler-Ross described dying patients; ordered stages never
--     held up). Post-traumatic growth softened to the defensible version.
--     Child track: advance caregiver notice becomes a gate.

-- ===========================================================================
-- WEEK 20 — SCARCITY (citation un-inverted; manifestation removed)
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b6w20a$1. Mullainathan and Shafir's SCARCITY research found that genuinely having too little — of money, of time — CONSUMES MENTAL BANDWIDTH. It narrows attention onto the immediate shortage and measurably reduces the capacity available for everything else. Read that carefully, because it is the opposite of what the self-development industry usually says: REAL SCARCITY IS NOT A MINDSET, AND IT CANNOT BE THOUGHT AWAY.
2. So we are drawing a line tonight. If money is genuinely short, or time genuinely is, that is a resource problem and it deserves a resource response — not a reframe. Nobody in this room will be told that their financial situation is an attitude.
3. What we ARE examining is narrower and worth examining: the places where the accounting has stopped matching reality. Some things behave like a finite pot when they aren't — attention given to one child does not subtract from another; another person's success does not consume yours. Scarcity logic applied to non-finite things is where it costs you for nothing.
4. The question is not "is there enough?" It is "is this one of the things that actually runs out?"$b6w20a$,
  core_affirmation  = $b6w20a$I check whether it actually runs out before I guard it.$b6w20a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%REAL SCARCITY IS NOT A MINDSET%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w20a$

--- WEEK 20 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE REWRITE BEFORE FACILITATING. The old version of this session taught the opposite of its own citation and ended on a manifestation claim (a Charter s7 breach). It has been rewritten.

THE EVIDENCE. Mullainathan and Shafir: genuine scarcity taxes cognitive bandwidth. This is a serious body of work and it is PROTECTIVE of members who are struggling — it says their difficulty is real and load-bearing, not attitudinal. Use it that way.

THE LINE YOU MUST HOLD. If a member is in genuine financial hardship, this session offers them nothing except the acknowledgement that it's real — and it should offer them the concession pathway on the way out, quietly and without discussion in the room.

WE DELIBERATELY DON'T CLAIM. That believing in abundance produces abundance. That scarcity is a mindset. That anyone's material circumstances are a reflection of their thinking. The child track already models the correct distinction — things that run out, things that don't.$b6w20a$
  END,
  updated_at        = now()
WHERE week_number = 20 AND audience = 'Adult';

-- TEEN — manifestation claims removed; comparison logic + 'not good enough' kept
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b6w20t$1. There's a version of this idea that gets sold a lot — BELIEVE YOU HAVE ENOUGH AND YOU'LL HAVE MORE. That isn't true and we're not going to teach it. If you don't have enough money, that's real, and no amount of feeling differently changes it.
2. What is worth checking is where you're applying "not enough" to things that don't work that way. Somebody else being good at something doesn't use up the supply. A friend having other friends doesn't reduce what's available to you.
3. "Not good enough" is the most common and most damaging form of scarcity thinking in adolescence. It drives perfectionism, procrastination, people-pleasing, and avoidance — all in the name of protecting against the imagined disaster of being "found out" as insufficient. That one is worth examining, because it runs on a pot that was never finite.$b6w20t$,
  core_affirmation  = $b6w20t$Some things run out. Most of the things I worry about don't. I'm learning to tell which is which.$b6w20t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%REAL SCARCITY IS NOT A MINDSET%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w20t$

--- WEEK 20 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. Mullainathan and Shafir: genuine scarcity taxes cognitive bandwidth. REAL SCARCITY IS NOT A MINDSET — do not teach the sold version ("believe you have enough and you'll have more"). It isn't true, and a teen who doesn't have enough money will know it isn't true the moment you say it.

THE LINE YOU MUST HOLD. If a young person is in genuine hardship, the session offers acknowledgement, not a reframe — and any practical help (concession pathway, school supports) is offered privately afterwards, never in the room.

WE DELIBERATELY DON'T CLAIM. That believing in abundance produces abundance. That scarcity is a mindset. That anyone's circumstances are a reflection of their thinking.$b6w20t$
  END,
  updated_at        = now()
WHERE week_number = 20 AND audience = 'Teen';

-- CHILD — biscuit metaphor; bucket-filling IP note
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b6w20c$If you share a biscuit, you've got less biscuit — biscuits run out. But if you share a smile, or a good idea, or being kind, you don't have less. You might even have more. Today we work out which is which.$b6w20c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%REAL SCARCITY IS NOT A MINDSET%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w20c$

--- WEEK 20 REVIEW (child track, appended by curriculum review) ---
The child track got this week right before the review — things that DO run out vs things that DON'T is exactly the distinction. The child version is the model the adult room should be teaching toward.

IP NOTE: the "bucket filling" concept is from Carol McCloud's book Have You Filled a Bucket Today? Fine to use the idea and name the book; do not photocopy pages or reproduce its illustrations in Mindcast worksheets.

WE DELIBERATELY DON'T CLAIM (at any age). That believing in abundance produces abundance. Biscuits run out. Kindness doesn't. Keep it that simple.$b6w20c$
  END,
  updated_at        = now()
WHERE week_number = 20 AND audience = 'Child';

-- ===========================================================================
-- WEEK 21 — THE RELATIONSHIPS THAT SHAPED YOU
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    replace(
      teaching_points,
      'Attachment theory (John Bowlby, Mary Ainsworth, later Mary Main) shows that early attachment experiences create ''internal working models'' — mental templates for how relationships work, how trustworthy others are, and what we must do to maintain connection. These templates run automatically in adult relationships.',
      'Attachment research — Bowlby, Ainsworth, later Main — established that early caregiving experience shapes expectations about closeness, safety and whether people can be relied on. That work is well supported for infant–caregiver relationships. The extension to ADULT ATTACHMENT "STYLES" — the four-box quiz version you''ll have seen online — is a much weaker literature, and styles are considerably less fixed and less predictive than the popular version suggests.'
    ),
    'The four attachment styles (secure, anxious, avoidant, disorganised) were formed in response to our caregivers'' availability and responsiveness. They are not destiny — research consistently shows that attachment style can shift toward security through conscious relationships, therapy, and self-awareness.',
    'So: use it as a lens, not a label. "I notice I brace when someone gets close" is useful. "I''m an anxious-avoidant" is a horoscope.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%KEEP IT MAPPING, NOT BLAME%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w21a$

--- WEEK 21 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. Attachment research is genuinely strong for early caregiving and much weaker for adult "styles" — the caveat now in the teaching points is mandatory. The useful and defensible claim: early relationships build expectations, expectations run automatically, and noticing one running is the work.

KEEP IT MAPPING, NOT BLAME. The existing note says this and it's correct. Add: some members will realise mid-session that a parent did real harm. That recognition is not the session's business to resolve, and a room of sixty is not where it should be processed. Acknowledge, don't explore, refer if needed.

WE DELIBERATELY DON'T CLAIM. That attachment style is fixed, that it predicts your relationships, or that a quiz can tell you yours.$b6w21a$
  END,
  updated_at        = now()
WHERE week_number = 21 AND audience = 'Adult';

-- TEEN / CHILD — evidence notes; child metaphor
UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%KEEP IT MAPPING, NOT BLAME%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w21t$

--- WEEK 21 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. Attachment research is strong for early caregiving, weaker for the four-box adult "styles" quiz. Teach it as a lens, not a label: "I notice I brace when someone gets close" is useful; "I'm an anxious-avoidant" is a horoscope.

KEEP IT MAPPING, NOT BLAME. Some teens will realise mid-session that someone at home did real harm. That recognition is not the session's business to resolve. Acknowledge, don't explore, and follow MC-SAF-001 afterwards if anything suggests current harm.

WE DELIBERATELY DON'T CLAIM. That attachment style is fixed, that it predicts your relationships, or that a quiz can tell you yours.$b6w21t$
  END,
  updated_at = now()
WHERE week_number = 21 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b6w21c$Everyone who's important to you teaches you something about what being close to someone is like — without ever meaning to. Today we look at what we've been taught, and which bits we want to keep.$b6w21c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%KEEP IT MAPPING, NOT BLAME%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w21c$

--- WEEK 21 REVIEW (child track, appended by curriculum review) ---
KEEP IT MAPPING, NOT BLAME — at this age that means: we notice what we learned, we don't score the people who taught us. If a child says something that suggests harm at home, do not explore it in the room. Note it and follow MC-SAF-001.$b6w21c$
  END,
  updated_at        = now()
WHERE week_number = 21 AND audience = 'Child';

-- ===========================================================================
-- WEEK 22 — SETTING DOWN THE ARMOUR
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'Brené Brown''s research on ''vulnerability armour'' identified the most common defensive strategies: perfectionism (if I''m perfect, they can''t criticise me), numbing (if I don''t feel, I can''t be hurt), cynicism (if I expect nothing, I won''t be disappointed), and ''cool'' detachment (if I don''t care, it can''t hurt me). Each of these once served a protective function.',
    'Brené Brown''s account of "vulnerability armour" — perfectionism, numbing, cynicism, and the rest — comes from qualitative research: thousands of interviews, coded for patterns. That is genuine research and it generates a useful vocabulary. It is not a measurement, and there are no effect sizes attached to it. We use it because people recognise themselves in it immediately, which is exactly what a good taxonomy is for.'
  ),
  facilitator_notes = replace(
    facilitator_notes,
    'Model the approach yourself as a facilitator: let something real show in how you hold the room.',
    'DO NOT MODEL VULNERABILITY BY DISCLOSING YOUR OWN. In a room where you hold the floor, your disclosure sets the depth everyone else feels they should match, and it moves you to the emotional centre of a session that is supposed to be theirs. What you model instead is STEADINESS: you don''t flinch when someone else says something hard, you don''t fill silences, and you don''t reward the most dramatic share. If a member asks whether you''ve done this work, "yes, and not in this room" is a complete answer.'
  ),
  updated_at        = now()
WHERE week_number = 22 AND audience = 'Adult';

-- Split from the statement above: Postgres forbids assigning the same column
-- twice in one SET, so the evidence-base append runs as its own UPDATE.
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%NOBODY IS LOWERING ANYTHING TODAY%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w22a$

--- WEEK 22 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
FACILITATORS DO NOT DISCLOSE THEIR OWN VULNERABILITY in this session or any other — the note above is the standing position wherever a session invites disclosure (consistent with the Week 9 child-track rule).

THE EVIDENCE. Brown's armour taxonomy is qualitative and useful; treat it as vocabulary rather than measurement. The underlying observation — defences built for a real past threat persisting past their usefulness — is uncontroversial across therapeutic traditions.

NEVER PUSH. All three existing notes say this. It is the most important instruction in the session and it should be said aloud to the room, not only held by the facilitator: NOBODY IS LOWERING ANYTHING TODAY. We're just looking at what's up and why.

WE DELIBERATELY DON'T CLAIM. That vulnerability is always the right choice — sometimes armour is correct and the person wearing it knows something you don't. That there are effect sizes behind any of this.$b6w22a$
  END,
  updated_at        = now()
WHERE week_number = 22 AND audience = 'Adult';

-- TEEN / CHILD — notes; child shield metaphor
UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%NOBODY IS LOWERING ANYTHING TODAY%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w22t$

--- WEEK 22 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
NEVER PUSH — say it aloud to the room: NOBODY IS LOWERING ANYTHING TODAY. We're just looking at what's up and why. Defences were built for a reason; the session is noticing, not removing.

Facilitators do not disclose their own vulnerability in this session or any other. What you model is steadiness: you don't flinch at hard shares, you don't fill silences, you don't reward the most dramatic share.

WE DELIBERATELY DON'T CLAIM. That vulnerability is always the right choice — sometimes armour is correct and the person wearing it knows something you don't.$b6w22t$
  END,
  updated_at = now()
WHERE week_number = 22 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b6w22c$A shield is brilliant when something's coming at you. But if you never put it down, nobody can get close enough to hug you either. The good news: it's your shield, and you decide.$b6w22c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%NOBODY IS LOWERING ANYTHING TODAY%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w22c$

--- WEEK 22 REVIEW (child track, appended by curriculum review) ---
The shield-with-a-door is the mechanism: children keep agency over their own defences — nobody tells them to drop the shield. NOBODY IS LOWERING ANYTHING TODAY; we're just looking at the shield and what it was built for. If a child's shield description suggests real danger at home, do not explore it in the room. Note it and follow MC-SAF-001.$b6w22c$
  END,
  updated_at        = now()
WHERE week_number = 22 AND audience = 'Child';

-- ===========================================================================
-- WEEK 23 — GRIEF (standing rule applied; stages corrected)
-- ===========================================================================

-- All three tracks: recent-bereavement notice delivered at the start.
UPDATE public.mindcast_live_sessions
SET facilitator_notes = facilitator_notes || $b6w23opt$

--- WEEK 23 STANDING NOTICE (appended by curriculum review, all tracks) ---
SAY THIS AT THE START, EVERY TRACK: if anyone has been bereaved in the last three months, sitting this one out is the sensible choice, not a failure — and you're welcome to come and just be in the room without doing the exercise. Nobody will ask which applies to you.$b6w23opt$,
    updated_at = now()
WHERE week_number = 23;

-- ADULT — reflection replaced; stages corrected; PTG softened
UPDATE public.mindcast_live_sessions
SET
  guided_reflection = $b6w23a$Eyes open. Writing, not picturing.

Somewhere in the last few years something ended that you moved straight past. A relationship, a version of your life, a plan, a person, a place, a body that worked differently. You didn't skip it because you're cold. You skipped it because there was a Tuesday, and then another one.

Write one line: "I never really stopped for ______."

That's it. You are not going to feel it now, here, on a chair, with strangers. You are naming that it went unmarked. Naming it is the session.

If the thing that comes up is recent or very heavy, write something else. There is no version of this where you owe this room your grief.$b6w23a$,
  teaching_points   = $b6w23a$1. You have almost certainly heard about the "stages of grief" — denial, anger, bargaining, depression, acceptance, sometimes with meaning-making added as a sixth. It is worth knowing where that came from: Elisabeth Kubler-Ross was describing what she observed in DYING PATIENTS, not in bereaved ones, and the idea that grief moves through ordered stages has never held up as a description of how people actually grieve. Most people don't go in order, don't hit all of them, and don't finish.
2. We mention it because you'll have absorbed it, and because "I'm not doing this right" is a common and unnecessary source of extra pain. There is no right order.
3. What is better supported is simpler: losses that go unacknowledged tend to keep asking for attention. Naming an ending is not the same as being finished with it. It's just marking that it happened.
4. What helps is not a model, it's a witness: grief shared with people who know what happened and don't need you to be finished. Some people find meaning after loss, and it helps them — that is real as a report. But meaning is found, not guaranteed, and "some losses are just losses" is a complete and correct thing to say.$b6w23a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE STAGES OF GRIEF ARE NOT A FINDING%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w23a$

--- WEEK 23 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE MOST CAREFUL SESSION OF PHASE 2. Eyes open, written, no narrated descent — the standing rule from Week 9 applies here in full. Anyone bereaved in the last three months is told at the start that sitting out is the sensible choice (see the standing notice).

THE EVIDENCE, STATED HONESTLY. THE STAGES OF GRIEF ARE NOT A FINDING — Kubler-Ross described dying patients, not bereaved people, and grief does not proceed in stages. Saying this out loud is a genuine gift to anyone in the room who has concluded they're grieving wrong. Post-traumatic growth is real as a self-report and shakier as a measured outcome; "some people find meaning and it helps them" is the defensible version.

THE ONE THING THAT RELIABLY HELPS is not in any model: being with people who know what happened and don't need you to be finished. That is what a Life Group is. Say so.

WE DELIBERATELY DON'T CLAIM. That grief has stages, an order, or an end. That loss makes you stronger. That there is a lesson in it — some losses are just losses, and a member saying so should be met with agreement, not a reframe.$b6w23a$
  END,
  updated_at        = now()
WHERE week_number = 23 AND audience = 'Adult';

-- TEEN — reflection replaced (same treatment); PTG softened in notes
UPDATE public.mindcast_live_sessions
SET
  guided_reflection = $b6w23t$Eyes open. Writing, not picturing.

Somewhere in the last few years something ended that you pushed straight through — a friendship, a version of your life, a place, a person, a team you were part of. You didn't skip it because you don't care. You skipped it because there was a Monday, and then another one.

Write one line: "I never really stopped for ______."

That's it. You are not going to feel it all now, here, in a room with people. You are naming that it went unmarked. Naming it is the session.

If the thing that comes up is recent or very heavy, write something else. There is no version of this where you owe this room your grief.$b6w23t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE STAGES OF GRIEF ARE NOT A FINDING%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w23t$

--- WEEK 23 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE MOST CAREFUL SESSION OF THE YEAR FOR THIS AGE GROUP. Eyes open, written, no narrated descent. Teens grieve not just deaths but identity losses, friendship breakdowns, and changes in family structure — often without acknowledgement. The standing notice about recent bereavement applies, verbatim.

THE EVIDENCE, STATED HONESTLY. THE STAGES OF GRIEF ARE NOT A FINDING — say so plainly; plenty of teens have been told they're "doing grief wrong" by an internet quiz. The defensible claims: unacknowledged loss keeps asking for attention, and witness helps — grief shared is lighter than grief carried alone.

IF A YOUNG PERSON'S WRITING OR BEHAVIOUR SUGGESTS RECENT OR UNRESOLVED LOSS BEYOND THE ROOM'S SCOPE, do not explore it. Follow MC-SAF-001 and refer.

WE DELIBERATELY DON'T CLAIM. That grief has stages, an order, or an end. That loss makes you stronger. That there is a lesson in every loss.$b6w23t$
  END,
  updated_at        = now()
WHERE week_number = 23 AND audience = 'Teen';

-- CHILD — reflection replaced; autumn metaphor; parental notice gate
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b6w23c$In autumn a tree drops all its leaves and looks completely bare. It isn't dead — it's resting, and the new leaves are already on the way. Endings can look like that too.$b6w23c$,
  guided_reflection = $b6w23c$Look at your tree. You don't have to close your eyes for this one. Autumn is real — things do end, and it's okay to feel sad about it. But look at the spring part of your tree. That's real too. Both parts are on the same tree. That's the whole idea.$b6w23c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE STAGES OF GRIEF ARE NOT A FINDING%' THEN facilitator_notes
    ELSE facilitator_notes || $b6w23c$

--- WEEK 23 REVIEW (child track, appended by curriculum review) ---
ADVANCE CAREGIVER NOTICE IS A GATE, NOT A RECOMMENDATION. No child attends Week 23 without a caregiver having received advance notice naming the topic, with an opt-out that requires no explanation. A recently bereaved child should be attending only if their caregiver has actively chosen it. (Operationalise with the programme lead before the session, same handling as Week 9.)

The seasons tree already does the work — keep the reflection short and eyes open. If a child's tree or words suggest recent loss or harm, do not explore it in the room. Note it and follow MC-SAF-001.$b6w23c$
  END,
  updated_at        = now()
WHERE week_number = 23 AND audience = 'Child';
