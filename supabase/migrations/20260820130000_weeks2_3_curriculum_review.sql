-- Weeks 2-3 curriculum review rewrite (all three tracks).
-- Source: mindcast-weeks-2-3-curriculum-review.md.
--
-- Week 2 'The Stories We Carry': alignment good; corrections only.
--   * Adult teaching points 1 & 3 corrected (core beliefs / predictive brain).
--   * Teen gets its own signal metaphor + corrected teaching points (schemas).
--   * Child gets the backpack metaphor (app metaphor meaningless at 5-11),
--     the elephant story reframed AS A STORY (not a fact), and a room-link
--     teaching point.
-- Week 3 'The Pattern Interrupt':
--   * The Frankl quotation is not verifiable (never located in his published
--     work; popularised via Covey). Adult teaching points rewritten to say so
--     out loud — the attribution honesty IS the lesson.
--   * Teen 'amygdala hijack in literally milliseconds' softened: Goleman's
--     coinage is not a technical term and the timing overstates the evidence.
--     (Same softening applies to adult wk24 — handled in that block's
--     migration.)
--   * Child gets the pause-button metaphor.
-- Facilitator notes appended (idempotent marker guards) with the evidence
-- base and the 'what we do not claim' lines.

-- ---------------------------------------------------------------------------
-- WEEK 2 — ADULT
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $w2a$1. Cognitive psychology calls these CORE BELIEFS — deeply held assumptions about self, others and the world. Many form early, though not exclusively so, and they often run beneath conscious awareness. They are not memories; they are conclusions.
2. Narrative therapy shows the stories we tell about ourselves are not facts — they are interpretations, shaped by which experiences we've selected as evidence.
3. Your brain works largely by prediction: it interprets new experience through the template of old experience. This is efficient and mostly useful. It also means a belief tends to recruit its own evidence — you notice what fits and pass over what doesn't.
4. A story you can see is a story you can question. That's the whole of this week — not replacing the story with a better one, just getting far enough outside it to look at it.$w2a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%WHAT CHANGES A BELIEF IS EVIDENCE YOU GENERATE%' THEN facilitator_notes
    ELSE facilitator_notes || $w2a$

--- WEEK 2 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: this session can surface real vulnerability. Have tissues available. Say explicitly: "You don't have to share anything you're not ready to share." Watch for anyone who seems deeply activated — follow up individually, and refer per MC-SAF-001 if it's beyond a conversation.

WHY THIS WEEK EXISTS — THE EVIDENCE.

1. THE RE-AUTHORING PREMISE HAS A CLINICAL LINEAGE. The idea that self-narratives are interpretations rather than facts, and can be examined and revised, is the shared core of cognitive therapy and narrative therapy — two of the better-evidenced talking approaches in existence. We are not doing therapy and must not say we are. We are borrowing one idea from it: that a belief and a fact are different objects.

2. NAMING IS THE MECHANISM, AGAIN. Lieberman et al. (2007) — labelling reduced amygdala activity and raised right ventrolateral prefrontal activity. Writing the belief down is not busywork. Getting it out of your head and onto paper is the intervention.

3. WHAT CHANGES A BELIEF IS EVIDENCE YOU GENERATE, NOT ARGUMENT. This is why the exercise asks HOW OLD WERE YOU rather than IS IT TRUE. Arguing with a core belief tends to entrench it; dating it tends to loosen it. Do not let the room turn into people debating each other's beliefs.

REAL-WORLD CASE STUDY. In 1998 an experiment found that praising children for effort rather than intelligence changed how they responded to difficulty. It became one of the most influential findings in modern education, reshaping curricula in thousands of schools. Twenty years later, a meta-analysis of 129 studies covering over 360,000 people found the mindset–achievement relationship accounted for about 1% of the variance. Not zero. About a tenth of what everyone had been told.
Tell the room this, because it is the week's lesson performed on the week's own material: a story got repeated until it felt like a fact, and the people repeating it were sincere. That is how core beliefs work too. Yours were installed by people who meant well and believed what they were saying.

WHAT WE DO NOT CLAIM. We do not claim beliefs are "formed by age 7" — that number is folk psychology, not a finding. We do not claim you can "rewire" anything. And we do not promise that seeing a story dissolves it. Seeing it is genuinely the whole of this week.$w2a$
  END,
  updated_at        = now()
WHERE week_number = 2 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 2 — TEEN
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $w2t$There's an app running in the background of your phone right now that you never opened and can't remember installing. It's using battery. Your head has a few of those. Today we open one and look at it.$w2t$,
  teaching_points   = $w2t$1. A lot of what you believe about yourself formed early, while things were happening you couldn't fully make sense of. Your brain drew conclusions because that's what brains do. Those conclusions felt like discoveries. Mostly they were guesses.
2. Psychology calls these SCHEMAS — mental templates that filter what you notice and how you read situations. Not facts. Old software that's still running.
3. Here's the tricky part: a belief collects its own evidence. If your story is I'm bad at this, you'll clock every failure and skim past every success. It's not that you're lying to yourself — you're filtering.
4. You are not being asked to delete anything today. Just to find one and look at where it came from.$w2t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THIS ONE LANDS WELL WITH TEENS%' THEN facilitator_notes
    ELSE facilitator_notes || $w2t$

--- WEEK 2 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: some teens may become emotional accessing early memories. Normalise it: "noticing is brave." Never ask anyone to share traumatic content publicly. The written exercise keeps it private — protect that. If something suggests a young person is unsafe, stop and follow MC-SAF-001.

WHY THIS WEEK EXISTS — THE EVIDENCE. Same lineage as the adult track: the belief-versus-fact distinction is the shared core of cognitive and narrative therapy. We borrow the idea, not the practice. Say plainly to any teen who asks: this isn't therapy, and if you need that we'll help you find it.

NAMING WORKS. Lieberman et al. (2007), UCLA — putting a feeling into words reduced activity in the brain's threat centre and increased activity in a regulatory region. Writing the belief down does something measurable.

REAL-WORLD CASE STUDY — THIS ONE LANDS WELL WITH TEENS. In the 1990s, researchers found that praising kids for effort instead of being "smart" changed how they handled hard problems. It exploded. Schools everywhere rebuilt around it, and you've almost certainly been told a version of it. Twenty years later, when someone pooled 129 studies covering 360,000 people, the actual effect was about a tenth of what everybody believed.
Ask them: that's a story that got repeated so much it turned into a fact — what have you got in your head that got there the same way?

DO NOT SAY "your brain is wired that way", "you can rewire your brain", or attribute anything to mirror neurons.$w2t$
  END,
  updated_at        = now()
WHERE week_number = 2 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 2 — CHILD
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor        = $w2c$Imagine you've been carrying a backpack since you were very little. People put things in it along the way — some helpful, some heavy. You've carried it so long you forgot it was there. Today we take it off and look inside.$w2c$,
  ancient_wisdom_reframe = $w2c$There's an old story people tell about a baby elephant tied to a small post. As a baby it pulled and pulled and couldn't get free, so eventually it stopped trying. The story says that years later, when the elephant is huge and strong enough to pull the post straight out of the ground, it stands quietly beside it and never tries.

It's a story, not something scientists have proven about elephants. But it's a very good story about people. Sometimes we stop trying because of something that happened when we were small — and we never check whether it's still true.$w2c$,
  teaching_points        = $w2c$1. Everyone has an inner voice — the thoughts we have about ourselves.
2. Some of those thoughts come from things that happened to us — things people said, or times we felt embarrassed or not good enough.
3. Those thoughts aren't always true. They're just old stories we started carrying.
4. Just because a thought is old and loud doesn't mean it's right.
5. Your grown-ups are in the other room today looking at their old stories too. Grown-ups have backpacks as well. You can ask them what's in theirs on the way home.$w2c$,
  facilitator_notes      = CASE
    WHEN facilitator_notes LIKE '%WHY THE BACKPACK WORKS%' THEN facilitator_notes
    ELSE facilitator_notes || $w2c$

--- WEEK 2 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: use physical props — a real small backpack to put cards in works wonderfully. Children must know they don't have to share private thoughts. Have a quiet corner available.

WHY THE BACKPACK WORKS. Externalising — putting the problem outside the child and looking at it together, rather than treating it as something wrong WITH them — is a core narrative practice with good support in child work. The backpack isn't decoration. It's the mechanism. Always talk about "the heavy thing in the backpack", never "your problem".

NAMING WORKS FOR CHILDREN TOO. Lieberman et al. (2007) found that putting a feeling into words reduced activity in the brain's alarm centre. In practice: offer the word, let them accept or reject it. A child correcting your guess is doing the exercise perfectly.

IN THE GUIDED REFLECTION, DO NOT BE THE WISE GROWN-UP WHO REMOVES THE HEAVY THING. The script says "imagine a kind, wise grown-up" — keep it imagined. A facilitator who positions themselves as the one who lifts a child's burden is doing something this organisation has committed in writing not to do. Let the child picture whoever they picture.

NEVER tell a child a feeling is wrong or that they shouldn't feel it.$w2c$
  END,
  updated_at             = now()
WHERE week_number = 2 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 3 — ADULT (Frankl attribution fix)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $w3a$1. There is a widely repeated line — usually credited to Viktor Frankl, though it has never been found in his writing — that between stimulus and response there is a space, and in that space lies our freedom. We use it because it's a good description, and we tell you the attribution is shaky because that's the sort of thing this room does.
2. The underlying capacity is real and has a name: RESPONSE INHIBITION — the ability to hold off an automatic reaction long enough to choose a different one. It is measurable, it varies between people, and it improves with practice.
3. Most patterns you'd like to change are not character failures. They are well-practised responses that were useful once and are now running on a trigger you haven't identified.
4. This week you are not changing the behaviour. You are finding the trigger and inserting one breath. That's all.$w3a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%RESPONSE INHIBITION IS TRAINABLE%' THEN facilitator_notes
    ELSE facilitator_notes || $w3a$

--- WEEK 3 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: keep this practical and non-shaming. Patterns exist for good reasons. Nobody's patterns are shameful. The work is curious, not critical. Do not push into trauma territory — if a member's pattern is clearly rooted in trauma, that is a referral, not an exercise.

WHY THIS WEEK EXISTS — THE EVIDENCE.

1. RESPONSE INHIBITION IS TRAINABLE. This is the least controversial claim in the week. The capacity to interrupt an automatic response is well studied and improves with deliberate practice. Note what we are NOT saying: we are not claiming a specific brain region does it, and we are not promising a timeline.

2. THE IF-THEN STRUCTURE IS THE HIGHEST-EVIDENCE THING IN THE WHOLE CURRICULUM. Gollwitzer & Sheeran (2006), 94 independent tests, over 8,000 participants, d = 0.65 on goal attainment. The exercise's final step — WHEN I NOTICE THE TRIGGER, I WILL TAKE ONE BREATH — is a textbook implementation intention. This is why the exercise insists on a specific cue rather than a general resolution. If a member says "I'll just be more aware", that's a goal intention and the evidence says it won't work. Push them to WHEN X HAPPENS, I WILL DO Y.

3. NAMING AGAIN. Lieberman et al. (2007). The trigger word is affect labelling with a job.

REAL-WORLD CASE STUDY. The line at the top of this session — between stimulus and response there is a space — is quoted constantly, printed on office walls, and attributed to a Holocaust survivor and psychiatrist. It is very likely not his. It appears to have entered circulation through Stephen Covey and has never been located in Frankl's writing.
Say this to the room. It is a live demonstration of the pattern the whole phase is about: something repeated confidently enough stops being checked. It also models the standard we hold ourselves to — we would rather tell you the source is shaky than let you repeat it and be caught out.

WHAT WE DO NOT CLAIM. No "amygdala hijack" as a technical fact. No claims about millisecond timing. No "rewiring". And we do not promise the pause will be available when it matters most — it often isn't at first, and saying so prevents people concluding they've failed in week three.$w3a$
  END,
  updated_at        = now()
WHERE week_number = 3 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 3 — TEEN (amygdala hijack softening)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $w3t$1. Part of your brain is a threat detector, and it's fast — faster than the part that thinks things through. That's why you can be halfway through reacting before you've decided to.
2. It's often not responding to what's actually in front of you. Big reactions to small things are usually old reactions arriving late.
3. There's good evidence that naming a feeling turns the volume down on it. Lieberman's team at UCLA scanned people's brains while they labelled emotions and found the threat-detection region got quieter and the regulating region got busier. So "I'm angry right now" isn't weak. It's the actual technique.
4. This week: find the trigger, pick one word, use the word before the reaction runs.$w3t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%RESPONSE INHIBITION IS TRAINABLE%' THEN facilitator_notes
    ELSE facilitator_notes || $w3t$

--- WEEK 3 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: keep this practical and non-shaming. Patterns exist for good reasons. Nobody's patterns are shameful. The work is curious, not critical. Do not push into trauma territory — if a member's pattern is clearly rooted in trauma, that is a referral, not an exercise.

WHY THIS WEEK EXISTS — THE EVIDENCE.

1. RESPONSE INHIBITION IS TRAINABLE. This is the least controversial claim in the week. The capacity to interrupt an automatic response is well studied and improves with deliberate practice. Note what we are NOT saying: we are not claiming a specific brain region does it, and we are not promising a timeline.

2. THE IF-THEN STRUCTURE IS THE HIGHEST-EVIDENCE THING IN THE WHOLE CURRICULUM. Gollwitzer & Sheeran (2006), 94 independent tests, over 8,000 participants, d = 0.65 on goal attainment. The exercise's final step — WHEN I NOTICE THE TRIGGER, I WILL TAKE ONE BREATH — is a textbook implementation intention. This is why the exercise insists on a specific cue rather than a general resolution. If a member says "I'll just be more aware", that's a goal intention and the evidence says it won't work. Push them to WHEN X HAPPENS, I WILL DO Y.

3. NAMING AGAIN. Lieberman et al. (2007). The trigger word is affect labelling with a job.

REAL-WORLD CASE STUDY. The line at the top of this session — between stimulus and response there is a space — is quoted constantly, printed on office walls, and attributed to a Holocaust survivor and psychiatrist. It is very likely not his. It appears to have entered circulation through Stephen Covey and has never been located in Frankl's writing.
Say this to the room. It is a live demonstration of the pattern the whole phase is about: something repeated confidently enough stops being checked. It also models the standard we hold ourselves to — we would rather tell you the source is shaky than let you repeat it and be caught out.

WHAT WE DO NOT CLAIM. No "amygdala hijack" as a technical fact. No claims about millisecond timing. No "rewiring". And we do not promise the pause will be available when it matters most — it often isn't at first, and saying so prevents people concluding they've failed in week three.$w3t$
  END,
  updated_at        = now()
WHERE week_number = 3 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 3 — CHILD (pause-button metaphor)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $w3c$You know when a song is playing and someone hits pause? Everything stops, right in the middle, and waits. You have a pause button too. It's harder to find than the one on a speaker, but it's in there, and it works.$w3c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%RESPONSE INHIBITION IS TRAINABLE%' THEN facilitator_notes
    ELSE facilitator_notes || $w3c$

--- WEEK 3 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: keep this practical and non-shaming. Patterns exist for good reasons. The work is curious, not critical. With children, keep the pause physical and playful — the PAUSE BUTTON ACTIVITY is the mechanism; protect rehearsal time for it.

WHY THIS WEEK EXISTS — THE EVIDENCE (age-matched summary for facilitators).

1. RESPONSE INHIBITION IS TRAINABLE. The capacity to interrupt an automatic response is well studied and improves with deliberate practice. For 5-11s the training IS the game: practising stopping on cue builds exactly this capacity.

2. THE IF-THEN STRUCTURE IS THE HIGHEST-EVIDENCE THING IN THE WHOLE CURRICULUM. Gollwitzer & Sheeran (2006), 94 independent tests, over 8,000 participants, d = 0.65 on goal attainment. The child version is the same shape: WHEN I FEEL THE BIG FEELING, I PRESS MY PAUSE BUTTON. Keep the cue specific.

3. NAMING AGAIN. Lieberman et al. (2007). Offering a child the word for a feeling is the technique, not a distraction.

WHAT WE DO NOT CLAIM. No "amygdala hijack" as a technical fact. No claims about millisecond timing. No "rewiring". And we do not promise the pause will be available when it matters most — it often isn't at first, and saying so (to parents especially) prevents anyone concluding the child has failed in week three.$w3c$
  END,
  updated_at        = now()
WHERE week_number = 3 AND audience = 'Child';
