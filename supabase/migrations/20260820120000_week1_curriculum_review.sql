-- Week 1 curriculum review rewrite (all three tracks).
-- Source: mindcast-week1-curriculum-review.md (parallel adult/teen/child review).
--
-- What the review found:
--   * Adult track fractured: front half taught signal/noise, back half was the
--     emotional-labour patch (20260814140000). Emotional labour is a good
--     lesson but belongs in Unlearn, not Week 1 — it is gender-coded content
--     dropped into a mixed room of strangers in hour one.
--   * Teen track fractured the same way around the 'SEVEN TRUTHS' video, and
--     carried a safeguarding hazard: "nobody is coming to save you" (and the
--     affirmation "I stop waiting for rescue"), delivered to 12-17s the
--     facilitator does not yet know. Both removed.
--   * Child track drifted to interoception — developmentally CORRECT for 5-11s;
--     kept, with the link to the adult theme made explicit.
--   * The copy-pasted 'phone with 47 tabs' metaphor is meaningless to a
--     five-year-old; the child track's lighthouse (from its ancient wisdom
--     reframe) is promoted instead.
--   * Teen teaching point on mirror neurons overclaimed: social contagion of
--     mood/behaviour is well evidenced, human mirror-neuron transmission of
--     BELIEFS is not. Finding kept, neuro gloss removed.
--
-- Video handling: the adult video reverts to the Cal Newport 'Slow
-- Productivity' selection from 20260814130000 (the emotional-labour video
-- leaves Week 1 with the lesson). Teen keeps '7 Hard Truths' but the exercise
-- no longer depends on having seen it. Child video/picture book/game untouched.
--
-- Facilitator notes are APPENDED (idempotent marker guard) with the
-- evidence base: Eurich (self-awareness gap), Lieberman et al. 2007 (affect
-- labelling), Gollwitzer & Sheeran 2006 (implementation intentions), and the
-- Maltz-to-Lally 21-day/66-day correction, plus the Week 1 'we deliberately
-- do not claim' list.

-- ---------------------------------------------------------------------------
-- mindcast_live_sessions — ADULT week 1
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  video_link               = $w1a$https://www.youtube.com/watch?v=0HMjTxKRbaI$w1a$,
  video_description        = $w1a$Cal Newport (Big Think): 'Slow Productivity — The Lost Art of Accomplishment Without Burnout'. Pseudo-productivity vs. outcomes: do fewer things at once, work at a natural pace, obsess over quality. Runtime ~10 min.$w1a$,
  video_backup_description = $w1a$Search: 'Cal Newport slow productivity Big Think' if link unavailable.$w1a$,
  teaching_points          = $w1a$1. We live in the most information-dense era in human history — and yet chronic disconnection and anxiety are at record highs. More input hasn't produced more clarity. It's produced more noise.
2. Almost everyone believes they already see themselves clearly. Research across thousands of people finds that around 95% of us think we're self-aware, while only 10–15% meet the criteria. The gap isn't stupidity — it's that self-observation is a skill nobody teaches, and we mistake familiarity with ourselves for accuracy about ourselves.
3. The work of this year is not about adding more. It's about discernment — learning to distinguish what is genuinely yours from what has been installed by environment, experience, and expectation.
4. This is not a self-help programme. It is a practice of honest self-inquiry, supported by evidence, grounded in ancient wisdom, and held in community.
5. One practical tool, starting today: when you examine your own behaviour, ask WHAT, not WHY. "Why did I snap at her?" produces a story. "What was happening in me just before I snapped?" produces information.$w1a$,
  experiential_exercise    = $w1a$SIGNAL AUDIT — 24 HOURS. On one page, draw a line down the middle. Left: INPUTS — everything that reached you yesterday. Notifications, conversations, feeds, news, someone's mood, a comment that stuck. Right: ORIGIN — for each one, write where it actually came from. You? Someone else? An algorithm? A voice from years ago?

Now circle the three that took up the most room in your head. How many did you choose?

Turn to the person beside you and share ONE — just one, and only the one you'd be comfortable saying out loud to a stranger. You are not required to share anything. Listening is full participation.$w1a$,
  guided_reflection        = $w1a$Sit quietly. Let the noise of the last day come up — the pings, the half-conversations, the thing you're still turning over. Don't push it away. Just notice how much of it arrived without your permission.

Now, underneath it, find the one thing that was already there this morning before any of it started. Not a thought about your day. The one that was doing the noticing.

Ask it a WHAT question: What matters to me that I haven't been making room for? Don't answer it now. Just let the question sit where the noise was.$w1a$,
  journaling_prompt        = $w1a$What reached you this week that you never chose to let in — and what got crowded out because of it?$w1a$,
  core_affirmation         = $w1a$Beneath the noise there is a signal, and it was here before the first thought. I am learning to hear it.$w1a$,
  weekly_practice_mon      = $w1a$Catch one moment of 'visible activity' today — a meeting, an email, a task that's motion without meaning. Name it: 'This is noise, not the work.'$w1a$,
  weekly_practice_wed      = $w1a$Do fewer things. Pick one important task and give it a single, uninterrupted 90-minute block — no email, no Slack, no switching. Notice the quality of your attention.$w1a$,
  weekly_practice_sun      = $w1a$Work at a natural pace. Intentionally take one thing off your plate — a commitment, a meeting, a 'should' — and let yourself have a genuinely slower day. Notice what it feels like not to redline.$w1a$,
  facilitator_notes        = CASE
    WHEN facilitator_notes LIKE '%THE SELF-AWARENESS GAP IS MEASURED%' THEN facilitator_notes
    ELSE facilitator_notes || $w1a$

--- WEEK 1 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: keep loose and welcoming. Goal is connection and curiosity, not depth. Everyone leaves knowing the signal/noise framework and feeling the room is safe. Resist the urge to go deep too fast. Nobody is required to speak.

WHY THIS WEEK EXISTS — THE EVIDENCE.

1. THE SELF-AWARENESS GAP IS MEASURED, NOT ASSERTED. Organisational psychologist Tasha Eurich's research programme, drawing on a review of over a thousand studies plus original surveys, found that roughly 95% of people believe they are self-aware while only 10–15% actually meet the criteria. Her work also distinguishes INTERNAL self-awareness (seeing your own values and reactions clearly) from EXTERNAL self-awareness (knowing how others actually experience you) — and finds most people develop one and neglect the other. Week 1 exists because the starting position for almost everyone in the room is overconfidence, and saying so out loud is more respectful than pretending otherwise. (Eurich, T. (2017) Insight; HBR, "What Self-Awareness Really Is".)

2. "WHAT" BEATS "WHY". Eurich's research found that WHY questions tend to produce rumination and confident-sounding false explanations, while WHAT questions produce usable information. This is why the reflection and journaling prompts in this curriculum are phrased as WHAT. If a member asks a WHY question in discussion, gently re-ask it as WHAT — that single move is one of the most reliable things you will do all year.

3. NAMING HAS A MEASURABLE EFFECT. Lieberman et al. (2007), "Putting Feelings Into Words", UCLA — an fMRI study finding that labelling an emotion reduced amygdala activity and increased activity in right ventrolateral prefrontal cortex, a region associated with regulation. Naming is not a poetic flourish; it does something. This is the evidence under the second word of Notice it. Name it. Do it. (Psychological Science, 18(5), 421–428.)

4. WHY THIS IS 52 WEEKS AND NOT A WEEKEND. Gollwitzer & Sheeran (2006) meta-analysed 94 independent tests, over 8,000 participants, and found that forming an IMPLEMENTATION INTENTION — a specific if-then plan naming when, where and how — produced a medium-to-large effect on goal attainment (d = 0.65) over holding a goal alone. Intention plus a plan plus a return date is the mechanism. Every Sunday you ask people what they will do, and the following Sunday you ask whether they did. That structure is the intervention. (Advances in Experimental Social Psychology, 38, 69–119.)

REAL-WORLD CASE STUDY — USE THIS ONE ALOUD, IT IS ON-THEME.
In 1960 a plastic surgeon named Maxwell Maltz published Psycho-Cybernetics, in which he observed that patients took about 21 days to adjust to seeing their new face in the mirror. He was describing post-surgical psychological adjustment. He never studied habits. That observation became "it takes 21 days to form a habit" and was repeated for fifty years by the entire self-improvement industry. When it was finally measured — Lally et al. (2010), University College London, 96 people tracked daily for 12 weeks — the median time to reach 95% of automaticity was 66 days, with a range of 18 to 254 days depending on the person and the behaviour. The study also found that missing a single day did not break the curve. (European Journal of Social Psychology, 40(6), 998–1009.)
Tell the room this. It is the cleanest possible demonstration of the week's theme: an anecdote about post-surgery patients became global common knowledge because it was short and repeatable, not because it was true. That is what noise looks like. It also sets an honest expectation for the year ahead — this is slow, it varies enormously between people, and missing a week does not undo you.

WHAT WE DELIBERATELY DO NOT CLAIM. Do not use: the 21-day rule; "we only use 10% of our brains"; left-brain/right-brain personality types; learning styles; Mehrabian's 7-38-55 rule; power posing; ego depletion. These are either debunked or failed replication. If a member raises one, the honest answer is "that one didn't hold up when it was tested" — and that answer builds more trust than agreeing would.$w1a$
  END,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- mindcast_live_sessions — TEEN week 1
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor          = $w1t$Your phone has a dozen apps talking at once and one you actually opened. Your head is the same. Today is about noticing which one you opened.$w1t$,
  teaching_points          = $w1t$1. You absorb the people around you. Moods, opinions, what's funny, what's embarrassing, what's worth wanting — a lot of what feels like "you" arrived from somewhere else. That's not weakness and it's not a flaw in you; it's how humans work in groups. But it means it's worth checking.
2. The algorithm knows your patterns better than you do — because most of us have never been taught to examine them.
3. Self-awareness isn't about being selfish or navel-gazing. It's about knowing which thoughts and reactions are actually yours — so you can choose what to do with them.
4. This year, we're building that skill. Not perfectly. Just honestly.
5. A tool you can use today: ask WHAT, not WHY. "Why am I like this?" goes in circles. "What just happened right before I felt that?" gives you something you can actually use.$w1t$,
  experiential_exercise    = $w1t$MINE / NOT MINE. Take two minutes and list, fast and without editing, ten things you believe about yourself. Anything: I'm bad at maths. I'm the funny one. I'm not a morning person. I'm too much.

Now go back through and mark each one: M if it's genuinely yours, T if someone told you, ? if you honestly can't tell.

Most people's lists come back mostly T and ?. That's the point — it's not a failure, it's the starting position.

Circle one T. Ask yourself: who said it, how old was I, and is it still true? You don't have to share it. If you want to share how many were T, that's plenty.$w1t$,
  guided_reflection        = $w1t$Close your eyes if that's comfortable. Otherwise just look down.

Think about the last time you changed your mind about something because of who was in the room. Not a big thing. Something small — what you said you liked, whether you laughed, whether you spoke up.

That's the noise. It's not evil, and it's not something to feel bad about. It's just loud.

Underneath it, there was something you actually thought. See if you can find it. That's the signal. You don't have to act on it today. Just notice that it's in there.$w1t$,
  journaling_prompt        = $w1t$What's one thing you believe about yourself that you're not sure you ever actually decided?$w1t$,
  core_affirmation         = $w1t$Some of what I think is mine, and some of it I picked up. I'm learning to tell the difference.$w1t$,
  weekly_practice_mon      = $w1t$Catch one T in action. One time today you catch yourself doing or saying something because it was taught to you, name it silently: 'That one's a T.' You don't have to change it. Just see it.$w1t$,
  weekly_practice_wed      = $w1t$Run a phone audit. Check your screen time, multiply it by 365, and look at the number. Then set one boundary for today — one app deleted, or notifications off except for real people.$w1t$,
  weekly_practice_sun      = $w1t$Ask what, not why. One time today you react to something — a mood, an annoyance, a laugh — ask: 'What just happened right before I felt that?' Write down what you find.$w1t$,
  facilitator_notes        = CASE
    WHEN facilitator_notes LIKE '%SAFEGUARDING NOTE — READ BEFORE FACILITATING%' THEN facilitator_notes
    ELSE facilitator_notes || $w1t$

--- WEEK 1 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: psychological safety first. Don't push sharing. Honesty with yourself is the point — not performance. Keep it real and slightly light in tone, but let the content be genuine.

SAFEGUARDING NOTE — READ BEFORE FACILITATING. Earlier drafts of this session included the line "nobody is coming to save you." It has been removed and must not be reintroduced. In a room of 12–17 year olds you do not know who is unsafe at home, and a trusted adult telling them rescue isn't coming is the wrong message from the wrong person at the wrong time. If a young person raises something that suggests they are unsafe, stop the exercise and follow MC-SAF-001. You are not their counsellor and you are not expected to be.

WHY THIS WEEK EXISTS — THE EVIDENCE.

1. THE BELIEF AUDIT IS THE AGE-APPROPRIATE FORM OF THE SELF-AWARENESS GAP. Eurich's finding — 95% think they're self-aware, 10–15% are — holds for adults. Adolescence is when the beliefs being audited are actively being installed, which makes this the highest-leverage moment to teach the skill. The MINE / NOT MINE exercise is a concrete version of Eurich's internal/external distinction.

2. SOCIAL INFLUENCE IS REAL; THE NEUROSCIENCE GLOSS IS NOT. People reliably absorb the moods, norms and behaviours of those around them — this is among the better-evidenced findings in social psychology. DO NOT ATTRIBUTE IT TO MIRROR NEURONS. Human mirror-neuron function is contested, and the claim that they transmit BELIEFS is not supported. Teach the behaviour, not the mechanism. If a teen asks about the brain science, "we know it happens, we're honestly still arguing about how" is a true and much more interesting answer.

3. NAMING WORKS. Lieberman et al. (2007) — putting a feeling into words reduced amygdala activity and raised activity in a regulatory prefrontal region. Worth stating plainly to teens, who are often told to "just calm down": naming it IS the calming down.

4. PLANS BEAT INTENTIONS. Gollwitzer & Sheeran (2006), 94 tests, d = 0.65. "I'll try harder" doesn't work. "When X happens, I'll do Y" does. This is why they leave every session with one specific thing rather than a general resolution.

REAL-WORLD CASE STUDY. Tell them the 21-day story: a 1960 plastic surgeon noticed his patients took about three weeks to get used to their new face. That's it. That's the whole origin. It turned into "21 days to build a habit" and got repeated by basically everyone for fifty years. When someone finally measured it, the real answer was a median of 66 days, ranging from 18 to 254, and missing one day didn't wreck it.
Ask them: how many things do you currently believe because they got repeated a lot? That's the session in one question.$w1t$
  END,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- mindcast_live_sessions — CHILD week 1
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor          = $w1c$Imagine a lighthouse in a storm. The wind is loud, the waves are big, the rain is everywhere — that's the noisy part. But the light keeps shining, steady, right through it. You have a light like that inside you. Today we practise finding it.$w1c$,
  teaching_points          = $w1c$1. Everyone has big feelings and busy thoughts — that's normal and okay.
2. Some feelings are like signals — they tell us something true about what we need or want.
3. Some feelings are like static — messy and confusing, usually when we're tired or scared or trying too hard to fit in.
4. Today we just start noticing the difference — and that's a superpower.
5. Your grown-ups are in the other room learning exactly the same thing today. They're doing it with words and you're doing it with your body, but it's the same idea. You can ask them about it in the car.$w1c$,
  guided_reflection        = $w1c$Hand on your belly. Five slow breaths. Is your belly soft, or tight? Now one quiet question: what does my body need right now? You don't need to say it out loud. Your body already knows.$w1c$,
  facilitator_notes        = CASE
    WHEN facilitator_notes LIKE '%WHY THIS WEEK TEACHES THE BODY AND NOT THE MIND%' THEN facilitator_notes
    ELSE facilitator_notes || $w1c$

--- WEEK 1 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: use visuals and movement wherever possible. Keep reflection time SHORT — 30 seconds maximum for the youngest. Story time recommended: ask children to bring a book about feelings for next week.

WHY THIS WEEK TEACHES THE BODY AND NOT THE MIND. For 5–11 year olds, abstract observation of one's own thinking is largely not yet available. INTEROCEPTION — the sense of the body's internal state: hunger, thirst, tiredness, a fast heart, a tight tummy — is the developmentally appropriate entry point, and interoceptive awareness is well established as a foundation for later emotion regulation. A child who can notice "my tummy feels tight" has taken the same first step an adult takes when they notice a thought that isn't theirs. Same skill, different instrument.

IF A PARENT ASKS WHETHER THE CHILDREN ARE LEARNING THE SAME THING AS THE ADULTS: yes, and here is the honest version. Adults are practising noticing the difference between their own thinking and absorbed noise. Children are practising noticing what their body is telling them. Both are the first step of Notice it. The adult room could not start where the children start, and the children's room could not start where the adults start. The theme is identical; the instrument is age-matched.

NAMING WORKS FOR CHILDREN TOO. Lieberman et al. (2007) found that putting a feeling into words reduced activity in the brain's threat-detection region. In practice: when a child is overwhelmed, helping them name the feeling ("that looks like frustrated — is it?") is more effective than instructing them to stop feeling it. Offer the word, let them accept or reject it. A child correcting your guess is doing the exercise perfectly.

NEVER: tell a child a feeling is wrong, or that they shouldn't feel it. The whole curriculum rests on feelings being information.$w1c$
  END,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- curriculum_weeks — week 1 portal / coursebook fields
-- ---------------------------------------------------------------------------
UPDATE public.curriculum_weeks
SET
  youtube_url          = $w1w$https://www.youtube.com/watch?v=0HMjTxKRbaI$w1w$,
  youtube_title        = $w1w$Cal Newport: Slow Productivity — The Lost Art of Accomplishment Without Burnout$w1w$,
  youtube_runtime      = $w1w$~10 min$w1w$,
  adult_source         = $w1w$https://www.youtube.com/watch?v=0HMjTxKRbaI$w1w$,
  adult_video_title    = $w1w$Cal Newport: Slow Productivity$w1w$,
  reflective_question  = $w1w$What reached you this week that you never chose to let in — and what got crowded out because of it?$w1w$,
  interactive_activity = $w1w$SIGNAL AUDIT — 24 HOURS. On one page, draw a line down the middle. Left: INPUTS — everything that reached you yesterday. Notifications, conversations, feeds, news, someone's mood, a comment that stuck. Right: ORIGIN — for each one, write where it actually came from. You? Someone else? An algorithm? A voice from years ago? Now circle the three that took up the most room in your head. How many did you choose? Share ONE — just one, and only the one you'd be comfortable saying out loud to a stranger. You are not required to share anything. Listening is full participation.$w1w$,
  updated_at           = now()
WHERE week_number = 1;
