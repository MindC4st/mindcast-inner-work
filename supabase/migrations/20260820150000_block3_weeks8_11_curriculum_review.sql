-- Block 3 curriculum review rewrite (Weeks 8-11, all three tracks).
-- Source: mindcast-block3-weeks-8-11.md.
--
-- Weeks 8, 10, 11 are well constructed; changes are evidence caveats and
-- age-appropriate child signal metaphors. WEEK 9 is the safety-critical one:
--   * Adult guided reflection was facilitator-narrated, eyes-closed imagery
--     on personal wound material — structurally trauma processing regardless
--     of the session's disclaimer. Replaced with an eyes-open, written,
--     strategy-focused exercise (same insight, no exposure).
--   * Teen reflection loses 'close your eyes'.
--   * ACEs claim corrected: population association, not individual
--     prediction; 'modifiable with awareness' hope-claim removed;
--     'developmental trauma' removed as an established condition (proposed
--     for DSM-5, not accepted).
--   * Child stone activity: facilitator self-disclosure replaced with a
--     fixed scripted example; children choose privately whether the stone
--     goes home; advance parental notice becomes a gate with opt-out.
-- Escalated items for MC-SAF-001 / training manual (decision, not migration):
--   curriculum-wide prohibition on eyes-closed facilitator-narrated
--   visualisation of distressing material; Week 9 parental notice gate.

-- ---------------------------------------------------------------------------
-- WEEK 8 — ADULT (constructed emotion caveated; affirmation corrected)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points    = replace(
    teaching_points,
    'Lisa Feldman Barrett''s theory of constructed emotion challenges the idea that emotions are just reactions to the world — they are predictions, built by the brain based on past experience, physiology, and context. This means emotions are interpretations which can be worked with.',
    'One influential account — Lisa Feldman Barrett''s theory of constructed emotion — holds that emotions aren''t simple reactions but predictions your brain assembles from past experience, body state and context. It is a serious theory and it is genuinely debated against older "basic emotion" models. We use it because it is USEFUL: if an emotion is partly constructed, it can be examined and worked with rather than only endured.'
  ),
  core_affirmation   = $b3w8a$My emotions are data, not drama. They are always worth reading — even when what they're reporting turns out to be old news.$b3w8a$,
  facilitator_notes  = CASE
    WHEN facilitator_notes LIKE '%EMOTIONAL GRANULARITY — THE ABILITY TO DISTINGUISH%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w8a$

--- WEEK 8 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. EMOTIONAL GRANULARITY — THE ABILITY TO DISTINGUISH emotional states precisely rather than reporting everything as "good" or "bad" — is associated with better regulation and better outcomes under stress. This is the strongest claim in the week and it is directly actionable: the whole session is granularity training. The primary/secondary emotion structure (anger sitting on top of hurt, fear or exhaustion) is long-standing clinical practice and reliably produces recognition in a room.

NAMING, AGAIN. Lieberman et al. (2007). Weeks 1, 2, 7 and 8 all rest on the same finding. Say so out loud — members noticing that the curriculum keeps returning to one mechanism is a feature, not repetition.

WE DELIBERATELY DON'T CLAIM. That emotions are always accurate — they aren't, and anxiety is the standing counter-example. That constructed emotion theory is settled — it's contested against basic-emotion models. That there are exactly six or eight "basic" emotions.

CHILD TRACK NOTE: the existing note references Inside Out. Fine to mention by name as a shared reference, but do not screen clips, reproduce characters, or use its imagery in printed worksheets. Same rule as the rest of the brand.$b3w8a$
  END,
  updated_at         = now()
WHERE week_number = 8 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 8 — CHILD (signal metaphor: lid on the box)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b3w8c$Grumpy is like the lid on a box. It's the bit you see. But the real feeling is inside the box, underneath — and it's usually something smaller and sadder, like being left out, or tired, or scared. Today we lift the lid.$b3w8c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%EMOTIONAL GRANULARITY — THE ABILITY TO DISTINGUISH%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w8c$

--- WEEK 8 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE (for facilitators). Helping children distinguish feelings precisely (granularity) supports regulation — "grumpy" is almost always a lid on something smaller. Lifting the lid gently IS the skill.

NAMING, AGAIN. Lieberman et al. (2007) — offering the word for a feeling turns the volume down. Weeks 1, 2, 7 and 8 all rest on the same finding.

WE DELIBERATELY DON'T CLAIM. That feelings are always right. Sometimes the box says "scared" when nothing dangerous is there — that's still useful information.

INSIDE OUT NOTE: fine to mention by name as a shared reference; do not screen clips, reproduce characters, or use its imagery in printed worksheets. Same rule as the rest of the brand.$b3w8c$
  END,
  updated_at        = now()
WHERE week_number = 8 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 9 — ADULT (trauma-exposure reflection replaced; ACEs corrected)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    replace(
      teaching_points,
      'Adverse childhood experiences (ACEs) research (Felitti et al., 1998) demonstrated a strong relationship between childhood trauma and adult health outcomes — physical and mental. Importantly: these outcomes are significantly modifiable with awareness and support.',
      'The Adverse Childhood Experiences study (Felitti et al., 1998) found that difficult childhood experiences were associated, at population level, with worse adult health outcomes. Two things about that finding matter here. It is a POPULATION association, not an individual prediction — an ACE score cannot tell any particular person what their life will be like, and it is routinely misused as though it can. And the original sample was a specific one: insured, largely middle-class adults at a single health provider. The pattern is real. The determinism people attach to it is not.'
    ),
    'Developmental trauma — the cumulative impact of prolonged adverse experiences including neglect, emotional unavailability, chronic stress — does not require a dramatic single event. It requires sustained patterns that exceeded a child''s capacity to cope.',
    'What we take from it is narrow and defensible: early experience shapes later patterns, those patterns are visible if you look, and looking is not the same as being defined.'
  ),
  guided_reflection = $b3w9a$Eyes open. You're going to write, not visualise, and you're writing only for yourself.

Somewhere in your history is something that shaped how you handle trust, or conflict, or asking for help. You don't need to write down what happened. You don't need to bring it to mind in detail. In fact, please don't.

Write one sentence about the STRATEGY, not the event: "I learned to ______." Keep somebody at arm's length. Get there first. Never need anything. Read the room before I speak.

Now one more sentence: "That made sense because ______." You do not have to finish it truthfully or at all.

That's the whole exercise. We are looking at the strategy you built, not reopening the thing you built it for. If your mind goes to the event itself, that's normal — bring it back to the strategy.$b3w9a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THIS IS THE SESSION MOST LIKELY TO HARM SOMEONE%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w9a$

--- WEEK 9 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THIS IS THE SESSION MOST LIKELY TO HARM SOMEONE. The three hard rules:
1. No eyes-closed, facilitator-narrated recall of a specific hurt. Ever. (This rule should also live in MC-SAF-001 and the training manual — it applies curriculum-wide.)
2. Nobody is asked to describe what happened — only the strategy it left.
3. Facilitators do not share their own wounds. The child track uses the fixed scripted example only.

THE EVIDENCE, STATED CAREFULLY. The ACE study (Felitti et al., 1998) established a population-level association between adverse childhood experience and adult health outcomes. It is foundational and it is widely misused: an ACE score is not a diagnosis, not a prediction, and not a destiny. If a member arrives having scored themselves online and concluded something fatalistic, gently correct it — that correction may be the most useful thing you do all year.

WHAT ACTUALLY PREDICTS DOING WELL IS NOT IN THE ACE SCORE. The protective factor with the best support is straightforward and is the thing this room is: reliable, non-judgmental relationships over time. You do not need to treat anything. You need to keep turning up, which is the one intervention you are qualified to deliver.

REFERRAL IS SUCCESS, NOT FAILURE. If this session surfaces something beyond its scope, the correct outcome is a warm handover to someone qualified. Have the printed resource list in the room, not in a folder somewhere. Follow MC-SAF-001 for anything involving a young person.

WE DELIBERATELY DON'T CLAIM. That we do trauma work — we explicitly do not. That naming a wound heals it. That "developmental trauma" is a recognised diagnosis — it was proposed for DSM-5 and not accepted. That an ACE score predicts an individual's future.$b3w9a$
  END,
  updated_at        = now()
WHERE week_number = 9 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 9 — TEEN (eyes-open reflection)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  guided_reflection = replace(
    guided_reflection,
    'Close your eyes. Think about something you''ve been carrying.',
    'Eyes open or looking down. Think about something you''ve been carrying.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THIS IS THE SESSION MOST LIKELY TO HARM SOMEONE%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w9t$

--- WEEK 9 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THIS IS THE SESSION MOST LIKELY TO HARM SOMEONE. The three hard rules:
1. No eyes-closed, facilitator-narrated recall of a specific hurt. Ever.
2. Nobody is asked to describe what happened — only what it left them carrying.
3. Facilitators do not share their own wounds.

THE EVIDENCE, STATED CAREFULLY. The ACE study established a population-level association between adverse childhood experience and adult health outcomes. An ACE score is not a diagnosis, not a prediction, and not a destiny. Teens who have scored themselves online and concluded something fatalistic need that correction delivered plainly.

WHAT ACTUALLY PREDICTS DOING WELL: reliable, non-judgmental relationships over time. This room is the intervention. You do not need to treat anything; you need to keep turning up.

REFERRAL IS SUCCESS, NOT FAILURE. Have the printed resource list in the room. Follow MC-SAF-001 for anything that suggests a young person is unsafe.

WE DELIBERATELY DON'T CLAIM. That we do trauma work. That naming a wound heals it. That an ACE score predicts anybody's life.$b3w9t$
  END,
  updated_at        = now()
WHERE week_number = 9 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 9 — CHILD (scripted example; stone choice; parental notice gate)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  experiential_exercise = replace(
    experiential_exercise,
    'Facilitator shares their own gentle example first.',
    'Facilitator shares the FIXED SCRIPTED EXAMPLE — the same one every time, never personal: "When I was about your age I dropped a birthday cake I''d helped make, in front of everybody. It was years ago and it''s completely fine now. But I still remember exactly how my face felt. That''s the kind of thing I mean."'
  ),
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%THIS IS THE SESSION MOST LIKELY TO HARM SOMEONE%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w9c$

--- WEEK 9 REVIEW: SAFEGUARDING CHANGES (appended by curriculum review) ---
THIS IS THE SESSION MOST LIKELY TO HARM SOMEONE. Hard rules for the child track:
1. Facilitators do NOT share their own wounds. Use the fixed scripted example (the birthday cake) — the same one every time, never personal. An adult telling children about a hurt from their own life models disclosure to a room of children and puts the facilitator at the emotional centre; both are against our written commitments.
2. THE STONE GOES HOME — OR IT DOESN'T, BY CHOICE. A child returns with a physical object with something hard written on it; a caregiver may find it. In most families that's a good conversation; in the families this session most needs to reach, it may not be. Children choose whether the stone goes home or stays in a named box at the venue, and that choice is offered PRIVATELY — one-to-one at the door, never by show of hands.
3. ADVANCE PARENTAL NOTICE IS A GATE, NOT A RECOMMENDATION. No child attends Week 9 without a caregiver having received the advance notice stating what will be asked, with an opt-out that requires no explanation. (Operationalise with the programme lead before the session.)
4. Never ask children to share what is on their stone unless they choose to. Quiet corner available. Children's programme lead available for any disclosures. Follow MC-SAF-001 immediately for anything suggesting harm.$b3w9c$
  END,
  updated_at            = now()
WHERE week_number = 9 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 10 — ADULT (Jung's persona as frame, not finding)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'Carl Jung introduced the concept of ''persona'' — the social mask we construct to navigate the world''s expectations. This is developmentally necessary and adaptive. The problem arises when the persona becomes so rigid that the authentic self is no longer accessible.',
    'Jung''s idea of the PERSONA — the face we build to meet the world''s expectations — is a frame, not a finding. It''s useful because it''s recognisable, and we use it that way. Building a social face is normal and necessary. The question this week asks is narrower: is yours still a choice, or has it become the only setting available?'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE COSTS OF COMPELLED SELF-PRESENTATION%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w10a$

--- WEEK 10 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. THE COSTS OF COMPELLED SELF-PRESENTATION are reasonably well documented — the cost isn't adapting to context, it's adapting under pressure with no choice about it. That distinction is the entire session.

TEEN TRACK — A CULTURAL NOTE THAT MATTERS IN TAUPO. Code-switching is in the teaching points, and it must not be taught as a mask. For Maori and Pasifika young people, shifting register between home, school and town is frequently competence and sometimes protection — not inauthenticity, and not something to be cured. If a young person describes code-switching, the facilitator's job is to ask whether it feels chosen or forced, and to accept "chosen" as a complete answer. Do not imply that a single undifferentiated self is the healthy target. It isn't, and for some young people in this room it would be actively unsafe.

WE DELIBERATELY DON'T CLAIM. That Jung's persona is an empirical finding — it's a frame. That authenticity means behaving identically everywhere. That teens should already know who they are; trying on identities is developmentally appropriate and the existing facilitator note is right to say so.$b3w10a$
  END,
  updated_at        = now()
WHERE week_number = 10 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 10 — CHILD (signal metaphor: the pretend face)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b3w10c$You know how you might be loud and silly with your best friend, and quieter at a new place? That's normal — everyone does it. But some people wear a pretend face nearly all the time, and it gets very tiring. Today we look at ours.$b3w10c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE COSTS OF COMPELLED SELF-PRESENTATION%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w10c$

--- WEEK 10 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE (for facilitators). Changing how we act in different places is normal and healthy — the problem is a pretend face that never comes off, or one that feels forced. Keep every framing about TIRED vs RESTED, never good vs bad faces.

WE DELIBERATELY DON'T CLAIM. That being yourself means acting the same everywhere. Children (and adults) rightly shift register between contexts; the question this week asks is only whether the face is still a choice.$b3w10c$
  END,
  updated_at        = now()
WHERE week_number = 10 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 11 — ADULT (confirmation bias leads; projection caveated)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b3w11a$1. CONFIRMATION BIAS is the well-evidenced one, and it applies to people as much as to ideas. Once you've decided someone is careless or unkind, you notice every instance that fits and skim past the ones that don't. You are not being unfair on purpose. You are filtering.
2. You will also hear the word PROJECTION — criticising in others what you can't acknowledge in yourself. It comes from psychoanalysis rather than from experimental work, and the evidence for it as a formal mechanism is mixed. We keep it because it's a useful question to ask yourself, not because it's proven. If the answer is no, that's a legitimate answer.
3. Everyone in your life is running a story you can't see. Empathy is not agreeing with it. It's remembering it exists.$b3w11a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%CONFIRMATION BIAS IS AMONG THE MOST REPLICATED FINDINGS%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w11a$

--- WEEK 11 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. CONFIRMATION BIAS IS AMONG THE MOST REPLICATED FINDINGS in cognitive psychology and it carries this week on its own. The teen "defence brief" exercise is a well-designed application: constructing the strongest case FOR someone is a documented technique for loosening a fixed interpretation, and it works better than being told to be fairer.

THE CHILD PERSPECTIVE ILLUSIONS ARE THE REAL LESSON. The duck/rabbit and the young woman/old woman work because both readings are genuinely present in the image — nobody is wrong. That's the point, and it lands physically for children in a way an explanation never will.

WE DELIBERATELY DON'T CLAIM. That projection is a proven mechanism — it's a useful question from psychoanalysis with mixed empirical support. That understanding someone's story excuses their behaviour: say this explicitly, because in a room of sixty someone is currently being harmed by a person whose difficult childhood they already know about. Empathy is not a reason to stay.$b3w11a$
  END,
  updated_at        = now()
WHERE week_number = 11 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 11 — CHILD (signal metaphor: the painting from two sides)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b3w11c$Imagine two people looking at the same big painting from opposite sides of the room. They both see it properly — but they don't see the same thing. People are like that too. Today we walk around to the other side.$b3w11c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%CONFIRMATION BIAS IS AMONG THE MOST REPLICATED FINDINGS%' THEN facilitator_notes
    ELSE facilitator_notes || $b3w11c$

--- WEEK 11 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE (for facilitators). The duck/rabbit and young-woman/old-woman illusions are the mechanism: both readings are genuinely present, so nobody is wrong. Let children discover the second reading themselves — being TOLD defeats the lesson.

WE DELIBERATELY DON'T CLAIM. That seeing someone's side means agreeing with them, or staying near them. Say it plainly, in child terms: understanding why someone was mean doesn't mean it was okay, and you can still keep your distance.$b3w11c$
  END,
  updated_at        = now()
WHERE week_number = 11 AND audience = 'Child';
