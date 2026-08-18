-- Block 2 curriculum review rewrite (Weeks 4-7, all three tracks).
-- Source: mindcast-block2-weeks-4-7.md.
--
-- Weeks 4-7 are properly aligned; the work here is evidence correction in
-- VERBATIM-tier teaching points plus age-appropriate child signal metaphors:
--   * wk4 adult: polyvagal presented as settled + van der Kolk trauma frame
--     removed (both contested/off-container); 'body keeps the score' phrase
--     removed from core concept (trauma-text title, imported frame).
--   * wk4 teen: 'gut has as many neurons as a cat's brain' removed (twice —
--     overstated comparison); Amy Cuddy posture-hormone point removed
--     (power posing failed replication; on the Week 1 do-not-claim list).
--   * wk5 adult: depressive realism removed (contested, poorly replicated,
--     unsafe to state in a room where someone may be depressed).
--   * wk5 teen: orbitofrontal-cortex-as-settled-fact removed; social media
--     claim given its correlational caveats.
--   * wk6 teen: Hunt et al. 2018 presented with its limits (one study,
--     ~140 students, one country).
--   * wk7 adult: cortisol/oxytocin hormone claims replaced with Gilbert's
--     threat/settle framing that needs no hormones.
--   * Child signal metaphors replaced with age-appropriate versions (wk4-7).
-- Facilitator notes appended (idempotent marker guards) with the evidence
-- base, the 'what we deliberately do not claim' lists, and safeguarding
-- notes for somatic work (wk4) and child inner-critic work (wk7).

-- ---------------------------------------------------------------------------
-- WEEK 4 — ADULT
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  core_concept    = regexp_replace(
    core_concept,
    '^The body keeps the score',
    'Your body registers what''s happening before your thinking mind catches up'
  ),
  teaching_points = $b2w4a$1. INTEROCEPTION — the brain's ability to sense the body's internal state — is well established as relevant to emotional processing and decision-making. People with higher interoceptive accuracy tend to identify their own emotions more precisely.
2. Your nervous system shifts state constantly between mobilised and settled, and those shifts happen faster than conscious thought. You will hear this described as "polyvagal theory" — we'd rather tell you that model is popular in therapy circles but genuinely contested among physiologists, and that you don't need it. The observable fact stands on its own: your body changes state before you notice, and you can learn to catch it.
3. Most of us were trained out of this. Push through, don't make a fuss, you're fine. The signal didn't stop; the listening did.
4. This week is a diagnostic, not a treatment. You are turning the instrument back on, not fixing what it reports.$b2w4a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%POLYVAGAL THEORY. WIDELY USED IN THERAPY%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w4a$

--- WEEK 4 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the body scan is deeply unfamiliar for adults who live in their heads. Go slowly. Strong emotional responses are normal in somatic work — have a grounding tool ready: feet on the floor, slow breath, name five things you can see. TEEN AND CHILD TRACKS: KEEP THIS ENTIRELY ABOUT SIGNALS AND INTELLIGENCE, NEVER APPEARANCE OR FITNESS.

THE EVIDENCE. Interoceptive awareness is well supported as relevant to emotional processing — people who read their internal state more accurately tend to name their emotions more precisely. That is the whole claim this week needs.

WHAT WE DELIBERATELY DO NOT CLAIM.
- POLYVAGAL THEORY. Widely used in therapy, genuinely contested among physiologists. We describe what a person can observe in themselves and skip the mechanism. If a member raises it: "it's popular, it's disputed, and the practical bit works either way."
- "THE BODY KEEPS THE SCORE." That's the title of a trauma book. We are not doing trauma work and we don't borrow its language.
- "YOUR GUT IS A SECOND BRAIN." The 100 million enteric neurons are real. The comparison to a cat's brain is not, and has been removed.
- We do not claim the body is always right. It isn't. Panic feels identical to danger and often isn't. The body is data, not verdict — say this explicitly if anyone starts treating sensation as instruction.

SAFEGUARDING. Somatic attention can surface trauma responses without warning. If a member dissociates, freezes, or becomes distressed beyond what grounding settles, stop the exercise, do not explore it, and follow MC-SAF-001. You are not a somatic therapist and this session is not treatment.$b2w4a$
  END,
  updated_at      = now()
WHERE week_number = 4 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 4 — TEEN
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points        = $b2w4t$1. Your gut has its own nervous system — roughly 100 million neurons — and it talks to your brain constantly. That's real, and it's part of why anxiety shows up in your stomach. What it does NOT mean is that your gut is thinking. "Gut feeling" is a useful phrase, not a second brain.
2. Heart rate variability is a measurable indicator of how flexibly your nervous system moves between stress and recovery. Athletes and clinicians use it. You don't need a device to use the underlying idea.
3. Your body gives you information earlier than your thoughts do. This week is about learning to read it.$b2w4t$,
  ancient_wisdom_reframe = regexp_replace(
    ancient_wisdom_reframe,
    '\s*Modern science confirms what these traditions knew.*$',
    ''
  ),
  facilitator_notes      = CASE
    WHEN facilitator_notes LIKE '%POLYVAGAL THEORY. WIDELY USED IN THERAPY%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w4t$

--- WEEK 4 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: keep this entirely about signals and intelligence — NEVER appearance or fitness. Teens are at peak body-image vulnerability; a body-awareness session that drifts toward looks or weight has done harm.

THE EVIDENCE. Interoceptive awareness is well supported as relevant to emotional processing — people who read their internal state more accurately tend to name their emotions more precisely. That is the whole claim this week needs.

WHAT WE DELIBERATELY DO NOT CLAIM.
- POLYVAGAL THEORY as settled mechanism. "It's popular, it's disputed, and the practical bit works either way."
- "YOUR GUT IS A SECOND BRAIN." The 100 million enteric neurons are real; the cat's-brain comparison was overstated and has been removed.
- Posture-changes-hormones claims (removed from this lesson; the underlying studies failed replication).
- We do not claim the body is always right. Panic feels identical to danger and often isn't. The body is data, not verdict.

SAFEGUARDING. Somatic attention can surface trauma responses without warning. If a young person dissociates, freezes, or becomes distressed beyond what grounding settles, stop the exercise, do not explore it, and follow MC-SAF-001.$b2w4t$
  END,
  updated_at             = now()
WHERE week_number = 4 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 4 — CHILD
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b2w4c$Your body is like a friend who taps you on the shoulder when something's up — a wobbly tummy, hot cheeks, tight shoulders. Most of the time we're too busy to turn around. Today we turn around and see what it wants.$b2w4c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%POLYVAGAL THEORY. WIDELY USED IN THERAPY%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w4c$

--- WEEK 4 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: keep this entirely about signals and intelligence — never appearance or fitness. Keep the body scan SHORT and playful for 5-7s.

THE EVIDENCE (for facilitators). Interoceptive awareness — noticing the body's internal state — is well supported as a foundation for emotional processing, and it is the same skill Week 1's child track started with (body detective). This week deepens it: signals carry information.

WHAT WE DELIBERATELY DO NOT CLAIM. We do not claim the body is always right. Sometimes a wobbly tummy is just lunch. Teach: your body is a friend who tells you things, and sometimes friends get it wrong — we check together.

SAFEGUARDING. If a child becomes distressed during body-noticing, do not explore it. Ground them (feet on the floor, look around the room, name five things you can see), and follow MC-SAF-001 afterwards if anything surfaces.$b2w4c$
  END,
  updated_at        = now()
WHERE week_number = 4 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 5 — ADULT (depressive realism removed)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b2w5a$1. The BETTER-THAN-AVERAGE EFFECT: across many traits, most people rate themselves above average — which cannot be true for most people. We are not objective observers of ourselves.
2. The correction for this isn't harsher self-judgment. It's other people. You cannot see your own blind spot by looking harder; that's what makes it a blind spot. This is the strongest practical argument for doing this work in a room rather than alone.
3. Accurate self-perception means seeing strengths AND limits without flinching at either. Most people are lopsided — fluent about their faults and mute about their strengths, or the reverse.$b2w5a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%DEPRESSIVE REALISM — THAT DEPRESSED PEOPLE%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w5a$

--- WEEK 5 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: people may discover uncomfortable things. Reinforce repeatedly: self-awareness is not self-criticism; it's self-honesty in the service of growth. Any exercise involving asking another person for feedback must be genuinely voluntary. TEENS: DO NOT MORALISE ABOUT SOCIAL MEDIA. The facilitator note already says this and it's the single most important line in the session.

THE EVIDENCE. The better-than-average effect is one of the most replicated findings in social psychology: across a wide range of traits, most people place themselves above the midpoint. It's the empirical foundation for the entire week, and for Eurich's 95%/10-15% self-awareness gap from Week 1 — same phenomenon, measured differently.

WHY THE ROOM IS THE METHOD. You cannot see your blind spot by introspecting harder. This is the strongest evidence-based argument for a group rather than an app, and it's worth saying out loud in this session specifically — members will feel it landing.

WHAT WE DELIBERATELY DO NOT CLAIM.
- DEPRESSIVE REALISM — that depressed people see themselves more accurately. Contested, poorly replicated, and unsafe to say in a room where someone may be depressed. It has been removed. Do not reintroduce it.
- We do not claim social media causes low self-esteem. The association is real; the effect sizes are mostly small and the causal direction is disputed. Say "goes together with", never "causes".
- No brain-region attributions for comparison or status.$b2w5a$
  END,
  updated_at        = now()
WHERE week_number = 5 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 5 — TEEN
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b2w5t$1. Comparing yourself to other people is a normal, automatic human thing — Leon Festinger described it in 1954, long before phones. What's changed is that you now compare against an edited highlight reel, all day, at scale. The instinct is old. The data it's running on is rigged.
2. Social media use and lower self-esteem do go together in the research. Be careful how you read that: most of it is correlational, the effects are generally small, and which way the causation runs is genuinely still debated. We're not going to tell you your phone is ruining your life. We're going to ask you to notice how you feel after twenty minutes of it.
3. Your self-image is built from evidence you selected. This week is about auditing the selection.$b2w5t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%DEPRESSIVE REALISM — THAT DEPRESSED PEOPLE%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w5t$

--- WEEK 5 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: DO NOT MORALISE ABOUT SOCIAL MEDIA — teens disengage the moment they sense a lecture, and they already know the adult world's anxieties about phones. The session's own teaching point models the stance: notice, don't preach.

THE EVIDENCE. Festinger's social comparison theory (1954) is foundational and uncontroversial. The social-media/self-esteem association is real but correlational, mostly small, and causally unresolved — teach it exactly that way. Teens who have heard the counter-argument will test you on it; the caveated version passes the test.

WHAT WE DELIBERATELY DO NOT CLAIM.
- DEPRESSIVE REALISM — removed from the adult track this week; do not reintroduce it here either.
- We do not claim social media CAUSES low self-esteem. "Goes together with", never "causes".
- No brain-region attributions for comparison or status (the orbitofrontal-cortex framing was removed as settled-fact overclaim).$b2w5t$
  END,
  updated_at        = now()
WHERE week_number = 5 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 5 — CHILD
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b2w5c$Some mirrors at fairgrounds make you look super tall or squishy or wobbly. They're funny, but they're not true. Today we're looking for the true mirror — the one that shows the real you.$b2w5c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%DEPRESSIVE REALISM — THAT DEPRESSED PEOPLE%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w5c$

--- WEEK 5 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the fairground mirror is physical and funny — lean into play. The existing lion cub parable is a good story and stays. Keep every framing about the REAL you, never the BEST you — this week is accuracy, not improvement.

WHAT WE DELIBERATELY DO NOT CLAIM. We do not tell children they are perfect or that every thought about themselves is wrong. The claim this week teaches: some pictures of yourself are true, some are funhouse mirrors, and it's worth checking which is which.$b2w5c$
  END,
  updated_at        = now()
WHERE week_number = 5 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 6 — TEEN (Hunt et al. 2018 caveated; points 2-4 untouched)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'A 2018 study found that limiting social media to 30 minutes per day led to significant reductions in depression and loneliness in university students — within just three weeks.',
    'In one 2018 study, university students who limited social media to 30 minutes a day reported less depression and loneliness after three weeks. Worth knowing — and worth knowing it was one study, with about 140 students, in one country. It''s a signal, not a law. Test it on yourself rather than believing it.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%SOCIAL COMPARISON THEORY (1954) IS FOUNDATIONAL%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w6t$

--- WEEK 6 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the comparison audit works best when people track CONTEXT rather than names. Enforce that — "a colleague", not "Dave". This protects people who aren't present and keeps the room from becoming a place where absent people get discussed.

THE EVIDENCE. Festinger's SOCIAL COMPARISON THEORY (1954) IS FOUNDATIONAL and uncontroversial: in the absence of objective measures, people evaluate themselves against others. Adolescent sensitivity to social standing is also well documented — the teen track can state this plainly.

REAL-WORLD CASE STUDY. Festinger described this in 1954 — before television was universal, four decades before the internet. The instinct isn't new and it isn't a modern weakness. What's new is the sample size: a person in 1954 compared themselves to perhaps a few dozen people they actually knew, most of whom they'd seen on a bad day. Comparison didn't change. The denominator did.
That reframe does more work than any amount of telling people to stop comparing — which does not work and which we should not attempt.

WHAT WE DELIBERATELY DO NOT CLAIM. The 30-minutes-of-social-media study is one study of about 140 students. Cite it with its limits or not at all. We do not tell anyone to delete their apps.$b2w6t$
  END,
  updated_at        = now()
WHERE week_number = 6 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 6 — CHILD
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b2w6c$Imagine trying to work out if you're a good swimmer by watching a bird fly. It doesn't work — you're not the same animal. Comparing only makes sense when you're comparing the same thing, and mostly we don't.$b2w6c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%SOCIAL COMPARISON THEORY (1954) IS FOUNDATIONAL%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w6c$

--- WEEK 6 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the PUZZLE activity is the mechanism this week — protect it. The swimmer-and-bird metaphor is the verbal hook; the puzzle is what they take home. Keep both.

THE EVIDENCE (for facilitators). Comparing yourself to others is a normal human default (Festinger, 1954) — children do it from a young age. This week teaches the check: are we comparing the same kind of thing? That check is the whole skill.

WHAT WE DELIBERATELY DO NOT CLAIM. We do not tell children comparison is bad or that they should never do it. We teach: comparing only makes sense when you're comparing the same thing — and mostly we aren't.$b2w6c$
  END,
  updated_at        = now()
WHERE week_number = 6 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 7 — ADULT (cortisol/oxytocin claims replaced; points 1, 3, 4 untouched)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'Kristin Neff''s research shows self-criticism activates the threat system (cortisol, defensive arousal), while self-compassion activates the care system (oxytocin, felt safety). Harsh self-talk is literally physiologically threatening to the organism.',
    'Self-criticism engages the same threat response the body uses for external danger — you tense, narrow and defend. Self-compassion engages the settling response instead. You don''t need to know the hormones involved to feel the difference between the two, and the popular writing about specific hormones is often wrong.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%SELF-COMPASSION IS ASSOCIATED WITH BETTER OUTCOMES THAN SELF-CRITICISM%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w7a$

--- WEEK 7 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the critic must be met with curiosity, never combat. "Fight your inner critic" framing tends to increase self-attack. The exercises are all about RESPONSE, not DEFEAT — hold that line if the room starts turning it into a battle.

THE EVIDENCE. Kristin Neff's self-compassion research is among the better-supported bodies of work in this area, and the practical finding is the one that matters here: SELF-COMPASSION IS ASSOCIATED WITH BETTER OUTCOMES THAN SELF-CRITICISM on motivation and persistence. People resist this — the belief that self-criticism drives performance is deeply held. Expect pushback and welcome it; the room arguing about this IS the session.

Gilbert's compassion-focused model — that we run a threat system and a settling system, and self-criticism engages the first — gives the room a usable structure without needing any hormone claims.

NAMING, AGAIN. Lieberman et al. (2007). Giving the critic a name and a voice is affect labelling applied to a thought rather than a feeling. This is why the child track names the gremlin: it's not a craft activity, it's the mechanism.

WHAT WE DELIBERATELY DO NOT CLAIM.
- No cortisol. Popular cortisol writing is usually wrong and the claim adds nothing the threat/settle framing doesn't already carry.
- We do not claim the critic can be removed. It can be recognised, sourced, and answered. Promising its removal sets members up to conclude they've failed.
- We do not claim self-criticism is a character flaw. It was a strategy that made sense somewhere. Say so.$b2w7a$
  END,
  updated_at        = now()
WHERE week_number = 7 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 7 — CHILD
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b2w7c$There's a grumpy little voice most people have that says "you'll be rubbish at this" right before you try something new. It thinks it's helping. It isn't very good at its job. Today we're going to meet it.$b2w7c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%SELF-COMPASSION IS ASSOCIATED WITH BETTER OUTCOMES THAN SELF-CRITICISM%' THEN facilitator_notes
    ELSE facilitator_notes || $b2w7c$

--- WEEK 7 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the gremlin must be met with curiosity, never combat — a child "fighting" their gremlin tends to feel worse, not better. Naming it, drawing it, and noticing when it shows up IS the work.

THE EVIDENCE (for facilitators). Giving the critic a name and a voice is affect labelling (Lieberman et al., 2007) applied to a thought rather than a feeling. The comic-strip journaling prompt is the mechanism, not a craft activity.

WHAT WE DELIBERATELY DO NOT CLAIM. We do not promise the gremlin goes away. It can be noticed, named, and answered. Say so — a child who thinks the gremlin should have left by now will conclude they've failed.

SAFEGUARDING — CHILD TRACK. Some children's inner critics are the repeated words of a living adult in their household. If a child's gremlin quotes a parent or caregiver in a way that suggests harm, do not explore it in the room and do not ask follow-up questions. Note it and follow MC-SAF-001 immediately afterwards.$b2w7c$
  END,
  updated_at        = now()
WHERE week_number = 7 AND audience = 'Child';
