-- Block 7 curriculum review rewrite (Weeks 24-27, all three tracks).
-- Source: mindcast-block7-weeks-24-27.md. Unlearn closes wk26, Rebuild opens wk27.
--
-- Headline items:
--   * Wk24: the 'walk toward discomfort' session gets its verbatim carve-out
--     — for members whose fear is accurate (coercive/violent situations) and
--     for members with clinical-level anxiety, the session's instruction does
--     not apply. All three tracks. Adult teaching point 1 corrected (the
--     amygdala-can't-tell-the-difference simplification is named as such —
--     clears the outstanding adult wk24 flag); 'window of tolerance' cut.
--   * Wk26: RELEASE CEREMONY becomes PHASE 2 STOCKTAKE — the witnessed
--     silence / hand-on-heart staging is exactly what standing rule 3
--     excludes. Adult and teen tracks; child track (paper feathers, balloons)
--     is fine as written. Neuroplasticity claims corrected (old patterns
--     don't get deleted; nobody is owed a feeling at a milestone).
--   * Wk27: 'write it as if it's already true' journaling prompt replaced —
--     unbelievable self-statements make people feel worse (esp. low
--     self-esteem, who are most often told to do it). Teen neuroplasticity
--     claim corrected.

-- ===========================================================================
-- WEEK 24 — FEAR (the carve-out, all tracks, before the sorting exercise)
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET experiential_exercise = $b7w24opt$One thing before we start, and it matters more than the rest of the session.

Sometimes the alarm is right. If you are afraid of a specific person, or afraid at home, or afraid of what happens when someone drinks — that is not burnt toast, and nothing tonight applies to it. Do not put it in column two. Do not walk toward it. Fear that is tracking something real is your system working properly, and the correct response is support, not reframing. Speak to a facilitator afterwards, or don't — but please don't spend tonight talking yourself out of something true.

And if fear is something you deal with at a clinical level — panic, an anxiety disorder — the "walk toward it" instruction is one to do with someone qualified, gradually, not from a standing start on a Sunday.

$b7w24opt$ || experiential_exercise,
    updated_at = now()
WHERE week_number = 24;

-- ADULT — teaching point 1 corrected; window of tolerance cut; exposure point aligned
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    replace(
      replace(
        teaching_points,
        'The brain''s threat detection system (the amygdala) cannot effectively distinguish between actual physical danger and perceived social or psychological threat. Public speaking activates the same physiological alarm as a predator. Rejection triggers the same neural pain pathways as physical injury. The system is doing its job — but at an intensity designed for life-or-death situations, applied to lunch meetings.',
        'Your threat system responds to social and psychological threat with much of the same machinery it uses for physical danger. You''ll often hear this put as "the amygdala can''t tell the difference" — that''s a simplification; the brain isn''t running one fear centre with a broken sorting function. But the practical observation holds: standing up to speak can produce a physical alarm out of proportion to any actual risk.'
      ),
      'Fear researcher Lara Boyd''s neuroplasticity research confirms: the fear response is one of the most malleable neural patterns available. Through repeated exposure and cognitive reappraisal (deliberately reconceptualising the threatening stimulus), the amygdala''s threat response to specific stimuli can be significantly reduced.',
      'That alarm is information about INTENSITY, not about DANGER. It tells you something matters. It doesn''t tell you something is unsafe.'
    ),
    'The distinction between ''danger'' and ''discomfort'' is the core rewiring distinction: genuine danger (physical threat, serious harm) warrants the full fear response. Discomfort (uncertainty, judgment, failure, change) does not — and treating discomfort as danger prevents growth, connection, and full living.',
    'So the question isn''t "am I afraid?" It''s "what is this afraid of, and is that thing real?"'
  ) || $b7w24a$

Note on the exposure point (curriculum review): avoidance does feed fear, and gradual voluntary approach is how the alarm learns — but with the two standing exceptions from the carve-out. Fear that is tracking something real, and fear at clinical level, are not this session's territory.$b7w24a$,
  facilitator_notes = replace(
    facilitator_notes,
    'voluntarily expanding the window of tolerance',
    'moving through discomfort that isn''t danger'
  ),
  updated_at        = now()
WHERE week_number = 24 AND audience = 'Adult';

-- Split from the statement above: Postgres forbids assigning the same column
-- twice in one SET, so the evidence-base append runs as its own UPDATE.
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE ALARM CAN BE RIGHT%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w24a$

--- WEEK 24 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE CARVE-OUT FIRST. It is verbatim and it comes before the sorting exercise, every track. THE ALARM CAN BE RIGHT: a member in a coercive or violent relationship has a threat system that is working correctly, and a member with panic or an anxiety disorder needs graded exposure with a clinician, not a Sunday instruction. The carve-out exists because "fear is just a feeling" sessions have a predictable failure mode, and this room must not be it.

THE EVIDENCE. The strongest and most usable finding is the one already in the teen track: THE GAP BETWEEN WHAT FEAR PREDICTS AND WHAT ACTUALLY HAPPENS. People consistently over-forecast both the likelihood and the intensity of bad outcomes, and the fear-prediction-versus-reality exercise makes that visible using the member's own history rather than a statistic. That is more persuasive than any citation.

The child track's scenario list is the model for this session — it already teaches children that SOME alarms are real fires requiring a trusted adult. The adult and teen tracks now carry the same balance via the carve-out.

WE DELIBERATELY DON'T CLAIM. That "the amygdala can't tell the difference" — it's a simplification, and we say so. That fear is always irrational. That courage means acting despite fear regardless of context — sometimes the fear is doing its job and the brave thing is to leave.$b7w24a$
  END,
  updated_at        = now()
WHERE week_number = 24 AND audience = 'Adult';

-- TEEN / CHILD — evidence notes; child smoke-alarm metaphor
UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE ALARM CAN BE RIGHT%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w24t$

--- WEEK 24 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE CARVE-OUT FIRST — verbatim, before the exercise. Teens whose fear is tracking something real (someone at home, someone they know) must hear, in those exact words, that tonight's instruction does not apply to them and that the alarm is working properly.

THE EVIDENCE. The gap between what fear predicts and what actually happens: teens over-forecast likelihood and intensity of bad outcomes. The prediction-versus-reality exercise, using their own history, is the mechanism — more persuasive than any citation.

IF A TEEN DISCLOSES FEAR OF A PERSON OR OF HOME, do not reframe it, do not explore it in the room. Follow MC-SAF-001 afterwards.

WE DELIBERATELY DON'T CLAIM. That all fear is exaggerated. Sometimes the alarm is right, and the brave thing is to leave.$b7w24t$
  END,
  updated_at = now()
WHERE week_number = 24 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b7w24c$A smoke alarm goes off for a real fire — and also for burnt toast. It can't tell the difference, so it screams at both. Your fear does the same thing. Today we practise working out which one it is.$b7w24c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE ALARM CAN BE RIGHT%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w24c$

--- WEEK 24 REVIEW (child track, appended by curriculum review) ---
The child scenario list is the model the whole curriculum should learn from — it already includes the safeguarding-correct example ("A stranger asks you to go somewhere alone — REAL FIRE, tell a trusted adult"). Protect that example; it is the most important line in the session. If a child's sorting answers suggest real danger, do not explore in the room. Note it and follow MC-SAF-001.$b7w24c$
  END,
  updated_at        = now()
WHERE week_number = 24 AND audience = 'Child';

-- ===========================================================================
-- WEEK 25 — REWRITING THE STORY
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%NARRATIVE IDENTITY (DAN MCADAMS)%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w25$

--- WEEK 25 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. NARRATIVE IDENTITY (DAN MCADAMS) is solid: how people narrate their own lives — particularly whether hard events are narrated as redemptive or contaminating — is associated with wellbeing and sense of agency. This is one of the better-supported ideas in the curriculum and it earns its place at the centre of the session.

THE LINE THAT MATTERS MOST: the difference between a FULLER story and a FALSE one. "That was hard and I got something from it" is a fuller story. "It was actually a gift" is often a person talking themselves out of a legitimate grievance. Do not push anyone toward redemption. Some events were simply bad and the honest narrative says so.

WE DELIBERATELY DON'T CLAIM. That every hard thing contains a lesson. That reframing changes what happened.$b7w25$
  END,
  updated_at = now()
WHERE week_number = 25;

UPDATE public.mindcast_live_sessions
SET signal_metaphor = $b7w25c$Think of a photo of you from when you were little. It was true then. It isn't what you look like now. Some stories about ourselves are like that too — true once, out of date now.$b7w25c$,
    updated_at = now()
WHERE week_number = 25 AND audience = 'Child';

-- ===========================================================================
-- WEEK 26 — PHASE 2 INTEGRATION (ceremony -> stocktake)
-- ===========================================================================

-- ADULT — exercise reframed, ceremony note replaced, neuroplasticity fixed
UPDATE public.mindcast_live_sessions
SET
  experiential_exercise = $b7w26a$PHASE 2 STOCKTAKE. Write, for yourself, four things:
- What I arrived at Phase 2 still carrying
- What I've actually set down, if anything
- What I tried to set down and picked straight back up
- What I'm taking into Phase 3 on purpose

If you'd like to read one line of it aloud, you can. Nobody has to, nobody is going in order, and there's no going round the circle.$b7w26a$,
  facilitator_notes     = replace(
    facilitator_notes,
    'Create ceremony for this closing — as with Phase 1 Week 13, this deserves ritual. The release statement read aloud in witnessed silence is one of the most powerful moments of the year. Ensure the transition to Phase 3 carries genuine anticipation — the group has done extraordinary work. Honour it fully.',
    'MARK IT, DON''T STAGE IT. No hand-on-heart, no witnessed silence, no release statements read into a hush, no circle with the facilitator at the centre. Say the milestone plainly: thirteen weeks, here''s what we covered, here''s what''s next. Volunteers may read a line if they want to; keep it brisk and unsolemn and finish on time. The third prompt — WHAT I PICKED STRAIGHT BACK UP — is the important one and the one that keeps this honest. A room where everyone reports having released something is a room performing progress. Ask it directly.'
  ),
  teaching_points       = replace(
    replace(
      teaching_points,
      'The neuroscience of habit and neural pathway formation confirms: releasing old patterns is not about willpower — it is about building new pathways while allowing old ones to weaken through disuse. Phase 2 has been the dual process: identifying what no longer serves AND beginning to practise alternatives.',
      'Old patterns don''t get deleted. What happens, as far as anyone can tell, is that a new response gets practised often enough to arrive first. The old one is still there — which is why it turns up under stress, when you''re tired, or around the people you learned it with. That isn''t relapse. That''s the shape of the thing.'
    ),
    'Research on post-traumatic growth (Tedeschi and Calhoun) shows that the period of integration — when growth is consolidated and a new life narrative is emerging — is characterised by: increased appreciation for life, greater personal strength, new possibilities, improved relationships, and spiritual/existential enrichment. These are the fruits of honest unlearning.',
    'Some people find that honest unlearning brings real gains — more appreciation for life, a sense of strength, new possibilities, closer relationships. Post-traumatic growth research describes those reports. They are possible, not promised, and none of them is a test you sit at the end of Phase 2.'
  ),
  updated_at            = now()
WHERE week_number = 26 AND audience = 'Adult';

-- Split from the statement above: Postgres forbids assigning the same column
-- twice in one SET, so the evidence-base append runs as its own UPDATE.
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%DELIBERATELY THIN, AND SAY SO. THERE IS NO MEASUREMENT%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w26a$

--- WEEK 26 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
MARK IT, DON'T STAGE IT — standing rule 3 applies (no candles, no witnessed silence, no ceremonial staging; this session was a RELEASE CEREMONY before the review and has been renamed PHASE 2 STOCKTAKE).

THE EVIDENCE — DELIBERATELY THIN, AND SAY SO. THERE IS NO MEASUREMENT of what thirteen weeks of this does. Anyone claiming otherwise is selling something. What's honest: members have practised noticing and questioning for six months, and practice changes defaults.

ASK THE UNCOMFORTABLE QUESTION. WHAT DID YOU PICK STRAIGHT BACK UP? A room reporting uniform progress is performing. Naming relapse as normal at the phase boundary is more protective than celebrating.

WE DELIBERATELY DON'T CLAIM. That old patterns weaken through disuse or get overwritten. That you should feel any particular way at a milestone.$b7w26a$
  END,
  updated_at            = now()
WHERE week_number = 26 AND audience = 'Adult';

-- TEEN — exercise reframed, ceremony note replaced, feeling-prescription fixed
UPDATE public.mindcast_live_sessions
SET
  experiential_exercise = $b7w26t$PHASE 2 STOCKTAKE. In your journal, complete these four sentences:
'In Phase 2, I have released or loosened...'
'Something I see more clearly now is...'
'I arrive at Phase 3 carrying...'
'One commitment I make for the rebuild is...'
If you'd like to read one line of it aloud, you can. Nobody has to, nobody is going in order, and there's no going round the circle.$b7w26t$,
  facilitator_notes     = replace(
    facilitator_notes,
    'Create genuine ceremony — even small rituals matter deeply at this age. The release statements shared in silence are powerful. If the group has developed strong trust over Phase 2, this session can be one of the most moving of the year. Honour every share. End with genuine excitement for Phase 3.',
    'MARK IT, DON''T STAGE IT. No witnessed silence, no ceremonial staging, no facilitator at the centre of a circle — even small rituals read as rites in a photograph, and this organisation has committed in writing not to look like one. Say the milestone plainly, let volunteers read a line if they want to, keep it brisk and warm, and finish on time. Genuine excitement for Phase 3 is allowed and encouraged — that part never needed staging.'
  ),
  teaching_points       = replace(
    teaching_points,
    'The research on psychological change shows that integration — the period when new awareness becomes consolidated — is characterised by a genuine sense of relief, clearer self-perception, and increased capacity for what comes next. This is where you are.',
    'There''s no study that says how you''re supposed to feel at the end of thirteen weeks. Some people feel lighter. Some feel unsettled, because looking at things stirs them up before it settles them. Some feel nothing much today and something next month. All of those are fine and none of them means you did it wrong.'
  ),
  updated_at            = now()
WHERE week_number = 26 AND audience = 'Teen';

-- Split from the statement above: Postgres forbids assigning the same column
-- twice in one SET, so the evidence-base append runs as its own UPDATE.
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%DELIBERATELY THIN, AND SAY SO. THERE IS NO MEASUREMENT%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w26t$

--- WEEK 26 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
MARK IT, DON'T STAGE IT — standing rule 3 applies to the teen track exactly as to the adult track.

THE EVIDENCE — deliberately thin, and say so. There is no measurement of what thirteen weeks does; practice changes defaults, that's the honest claim.

ASK THE UNCOMFORTABLE QUESTION: what did you pick straight back up? Naming relapse as normal at the phase boundary is more protective than celebrating.

WE DELIBERATELY DON'T CLAIM. That old patterns get erased. That you should feel any particular way after six months.$b7w26t$
  END,
  updated_at            = now()
WHERE week_number = 26 AND audience = 'Teen';

-- CHILD — heavy-bag metaphor (feathers/balloons/wall display stay as written)
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b7w26c$Think about carrying a heavy bag up a hill, and then putting it down at the top. Your arms feel funny and light. That's what these thirteen weeks have been — and today we notice how the light bit feels.$b7w26c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%DELIBERATELY THIN, AND SAY SO. THERE IS NO MEASUREMENT%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w26c$

--- WEEK 26 REVIEW (child track, appended by curriculum review) ---
The child track's celebration — stone, feather, wall display, balloons — is fine as written; nobody reads a paper feather as a rite. Keep it exactly as light as it looks.$b7w26c$
  END,
  updated_at        = now()
WHERE week_number = 26 AND audience = 'Child';

-- ===========================================================================
-- WEEK 27 — REBUILDING IDENTITY
-- ===========================================================================

-- ADULT — journaling prompt revised (no write-it-as-already-true)
UPDATE public.mindcast_live_sessions
SET
  journaling_prompt = $b7w27a$Write a short description of the person you're building — the values, the qualities, the direction. Write it as a description of the target, not a claim about the present. "I'm someone who wants to be steadier under pressure" is honest. "I am completely calm" is a wish wearing a fact's clothes, and you'll know it's not true every time you read it.$b7w27a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%IDENTITY-BASED FRAMING — "I''M THE KIND OF PERSON WHO%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w27a$

--- WEEK 27 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. IDENTITY-BASED FRAMING — "I'M THE KIND OF PERSON WHO does X" rather than "I'm trying to do X" — has decent support for behaviour that persists, and the teen exercise is built directly on it. Practise it in the room; the phrasing does the work.

ON AFFIRMATIONS. Do not have members repeat statements they don't believe. Stating a target is fine. Asserting a falsehood in the present tense tends to make people who most need encouragement feel worse — which is the opposite of the intent and a well-known finding. The journaling prompt has been revised accordingly.

WE DELIBERATELY DON'T CLAIM. That you can become anything. That saying something in present tense makes it true.$b7w27a$
  END,
  updated_at        = now()
WHERE week_number = 27 AND audience = 'Adult';

-- TEEN — neuroplasticity claim corrected
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'Identity in adolescence is still forming — and that is an enormous advantage. Research shows the teen and young adult brain has exceptional neuroplasticity specifically for identity formation. What you practise now — what you rehearse, value, and build — becomes the foundation you live from for decades.',
    'Adolescence really is a period of unusual change in the brain — that part is well established. What isn''t established is any specific "identity formation" mechanism, so we won''t claim one. The honest version is duller and more useful: you are doing a lot of things for the first time right now, and what you practise repeatedly tends to become what you''re like. That''s true at any age. It''s just faster when more of it is new.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%IDENTITY-BASED FRAMING — "I''M THE KIND OF PERSON WHO%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w27t$

--- WEEK 27 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. Identity-based framing ("I'm the kind of person who...") has decent support for behaviour that persists — the teen exercise is built on it and the phrasing does the work. ADOLESCENT BRAIN CHANGE IS REAL; THE "IDENTITY FORMATION" MECHANISM ISN'T — the correction now in the teaching points is mandatory.

ON AFFIRMATIONS. Do not have teens repeat statements they don't believe — present-tense falsehoods tend to make the people who most need encouragement feel worse.

WE DELIBERATELY DON'T CLAIM. That you can become anything. That the teenage brain is uniquely plastic for identity. That saying something in present tense makes it true.$b7w27t$
  END,
  updated_at        = now()
WHERE week_number = 27 AND audience = 'Teen';

-- CHILD — suitcase-tags metaphor
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b7w27c$People stick labels on us the way tags get stuck on a suitcase at the airport — sometimes without asking. Today we take the tags off and pack the bag ourselves.$b7w27c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%IDENTITY-BASED FRAMING — "I''M THE KIND OF PERSON WHO%' THEN facilitator_notes
    ELSE facilitator_notes || $b7w27c$

--- WEEK 27 REVIEW (child track, appended by curriculum review) ---
The brick-wall exercise is strong as written. Keep tags concrete: children name a label they've been given, decide if it still fits, and physically remove it. If a child's "tag" is something an adult says to them at home and it sounds harmful, do not explore it in the room. Note it and follow MC-SAF-001.$b7w27c$
  END,
  updated_at        = now()
WHERE week_number = 27 AND audience = 'Child';
