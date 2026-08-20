-- Block 4 curriculum review rewrite (Weeks 12-15, all three tracks).
-- Source: mindcast-block4-weeks-12-15.md. Crosses See Clearly -> Unlearn.
--
-- Three escalations handled here:
--   * Wk14 teen: 'point 0' safeguarding preamble prepended — the session's
--     internal-authority theme is grooming-adjacent if misdelivered. Point 0
--     is mandatory and verbatim. (Companion rule for MC-SAF-001/training
--     manual: no facilitator may ever encourage secrecy from caregivers.)
--   * Wk13: candlelit threshold ceremony replaced with 'mark the threshold,
--     don't ritualise it' — brand risk (one phone photo), fire risk, venue
--     hire and insurance questions. Applies to adult and teen notes.
--   * Wk12: 'Duhigg's research' attribution corrected (Duhigg is a
--     journalist; habit-loop work is Graybiel's lab), and the curriculum's
--     two strongest findings (Lally 66 days, Gollwitzer d=0.65) are brought
--     INTO the habit week. Core concept 'up to 45%' corrected to ~40%
--     (Wood, Quinn & Kashy 2002). Teen willpower-depletion claim removed
--     (ego depletion failed replication; on the do-not-claim list).
-- Also: wk13 neuro-garnish cut ('awareness is literally structural' — no
-- such finding exists for 13 weeks of community sessions); wk15 teen
-- body-as-oracle line replaced (body reports familiarity/threat, not
-- futures); wk15 adult reflection gains eyes-open/write option per the
-- Block 3 rule; child signal metaphors replaced (wk12-15).

-- ---------------------------------------------------------------------------
-- WEEK 12 — ADULT (habit evidence corrected and cited)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  core_concept    = replace(
    core_concept,
    'researchers estimate up to 45%',
    'in one well-known study, around 40%'
  ),
  teaching_points = $b4w12a$1. The habit loop — CUE → ROUTINE → REWARD — is the standard working model. It was popularised by Charles Duhigg, drawing on neuroscience research (notably Ann Graybiel's work at MIT on the basal ganglia) rather than conducted by him. The model is useful; the attribution matters because we'd rather be accurate than impressive.
2. Repeated behaviour in a stable context becomes automatic, which is efficient and mostly good. It also means willpower is the wrong lever — you are trying to out-argue something that isn't listening.
3. HOW LONG THIS TAKES, ACTUALLY. Lally et al. (2010), UCL, tracked 96 people forming daily habits: median 66 DAYS to reach 95% of automaticity, range 18 TO 254. And — this is the part to say twice — MISSING A SINGLE DAY DID NOT BREAK THE CURVE. You are not starting over.
4. WHAT ACTUALLY WORKS. Gollwitzer & Sheeran (2006) meta-analysed 94 tests and over 8,000 participants: an if-then plan naming WHEN, WHERE AND HOW produced a medium-to-large improvement in follow-through (d = 0.65) compared with intention alone. "I'll cut down" is an intention. "When I sit down after dinner, I'll put my phone in the drawer" is a plan. Only one of those has evidence behind it.
5. So this week's output is not motivation. It's one sentence: WHEN X HAPPENS, I WILL DO Y.$b4w12a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%LALLY ET AL. (2010): MEDIAN 66 DAYS%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w12a$

--- WEEK 12 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE — THIS IS THE BEST-SUPPORTED WEEK IN THE CURRICULUM, SO USE IT. LALLY ET AL. (2010): MEDIAN 66 DAYS to automaticity, range 18-254, and one missed day does not reset it. GOLLWITZER & SHEERAN (2006): d = 0.65 across 94 tests for if-then planning over intention alone.

WHAT TO DO WITH THAT IN THE ROOM. Two things. First, tell people the 66 days and the 254, because someone in that room has already decided they've failed at something after ten days. Second, do not let anyone leave with a resolution. Make them write the sentence: WHEN X HAPPENS, I WILL DO Y. If a member writes "I'll try to be more present", that's an intention, and the evidence says it won't survive the week. Push for the cue.

CONNECT IT BACK TO WEEK 1. The 21-day story you told in Week 1 was the setup. This is the payoff — same research, now applied to their own habit. Members noticing the curriculum returning to a claim is the point.

WE DELIBERATELY DON'T CLAIM. That Duhigg conducted the research — he reported it. That habits take 21 days, 30 days, or any round number. That willpower is a muscle that depletes — that finding failed replication.$b4w12a$
  END,
  updated_at      = now()
WHERE week_number = 12 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 12 — TEEN (ego depletion removed; Lally/Gollwitzer mirrored plainly)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'The habit loop explains why willpower doesn''t work for long-term habit change. Willpower is a conscious resource that depletes. The cue-reward connection is unconscious and doesn''t deplete. Eventually, willpower loses.',
    'The habit loop explains why willpower alone is the wrong lever for long-term change. The cue-reward connection runs automatically, and you can''t out-argue something that isn''t listening. Design beats discipline.'
  ) || $b4w12t$
5. HOW LONG IT ACTUALLY TAKES: researchers tracked 96 people building a daily habit — the middle of the pack hit about 66 days before it felt automatic, and some people took more than 250. And missing ONE day didn't reset any of it. You don't start over. You just missed a day.
6. WHAT ACTUALLY WORKS: "I'll try harder" doesn't survive the week. "When X happens, I'll do Y" does — in one big review of 94 studies, people who made a specific when-where-how plan were far more likely to actually follow through.
7. So this week's output isn't motivation. It's one sentence: WHEN X HAPPENS, I WILL DO Y.$b4w12t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%LALLY ET AL. (2010): MEDIAN 66 DAYS%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w12t$

--- WEEK 12 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE — same as the adult track, plainer: Lally et al. (2010), median 66 days, range 18-254, missing a day doesn't break it. Gollwitzer & Sheeran (2006), specific if-then plans beat vague intentions (d = 0.65 across 94 studies).

IN THE ROOM: tell teens the 66 and the 254 — plenty of 15-year-olds have already decided they "can't build habits" after a failed week. Do not let anyone leave with "I'll try harder". Make them write the sentence: WHEN X HAPPENS, I WILL DO Y.

WE DELIBERATELY DON'T CLAIM. That Duhigg conducted the research — he reported it. That habits take 21 days or any round number. That willpower is a muscle that runs out — that finding failed replication (the teen teaching point that said so has been corrected).$b4w12t$
  END,
  updated_at        = now()
WHERE week_number = 12 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 12 — CHILD (signal metaphor: path through long grass)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor = $b4w12c$A habit is like a path through long grass. The more you walk it, the flatter it gets, until your feet just go that way without asking. Today we look at which paths we've worn in — and whether we want them there.$b4w12c$,
  updated_at      = now()
WHERE week_number = 12 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 13 — ADULT (neuro-garnish cut; candles out)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'Neuroscience of insight shows that genuine self-awareness produces measurable changes in neural connectivity — the prefrontal cortex forms stronger connections to the limbic system. Awareness is literally structural. What you''ve been doing for 13 weeks has changed your brain.',
    'Thirteen weeks of deliberate noticing is a real amount of practice, and practice changes what you notice by default. We''re not going to dress that up in brain scans — we can''t point to a study that measured what happened to you specifically over thirteen weeks in a hall in Taupō, and anyone who tells you otherwise is selling something. What we can say is ordinary and true: you have been asking better questions for three months, and that compounds.'
  ),
  facilitator_notes = replace(
    facilitator_notes,
    'This is a ceremonial session — treat it as such. Create intentional ritual: candles, music, a physical symbol of crossing a threshold if appropriate to your group.',
    'MARK THE THRESHOLD, DON''T RITUALISE IT. This session should feel significant. It should not feel ceremonial. No candles, no darkened room, no incense, no circle-and-symbol staging, no facilitator at the centre of a ring. A photograph of this session taken by a stranger should look like a community hall on a Sunday, because that is what it is. What works instead: name the milestone plainly, read the week numbers out, put the thirteen weekly themes up on the wall, let people read their letters aloud if they consent, and finish on time. If you want a physical object, use something ordinary and useful — a printed card of the thirteen themes.'
  ),
  updated_at        = now()
WHERE week_number = 13 AND audience = 'Adult';

-- Split from the statement above: Postgres forbids assigning the same column
-- twice in one SET, so the evidence-base append runs as its own UPDATE.
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%DELIBERATELY THIN, AND SAY SO%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w13a$

--- WEEK 13 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: MARK THE THRESHOLD, DON'T RITUALISE IT. No candles, no darkened room, no staging that puts a facilitator at the centre of a circle. A photo of this session taken by a stranger should look unremarkable. (This is a standing brand and safety rule — it recurs at the Week 26, 39 and 52 integrations.)

THE EVIDENCE. DELIBERATELY THIN, AND SAY SO. We are not claiming measured neurological change from thirteen weeks in a community hall. What we can honestly say: sustained attention to a skill improves that skill, and members have been practising noticing for three months. If someone asks "has this actually done anything?", the correct answer is "tell me — you're the only one with the data."

WE DELIBERATELY DON'T CLAIM. That awareness is "structural". That we can point to brain changes. That anyone is transformed. Thirteen weeks of honest looking is enough of a claim without inflating it — and inflating it here would undo the credibility the previous twelve weeks earned.$b4w13a$
  END,
  updated_at        = now()
WHERE week_number = 13 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 13 — TEEN (transformative-experience claim softened; candles out)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    teaching_points,
    'Psychological research on transformative experience shows that some experiences genuinely change the person having them — not just their knowledge, but their perspective, values, and identity. Phase 1 is designed to be that kind of experience.',
    'Some experiences change the person having them — not just what they know, but how they see. Philosophers call these transformative experiences. It''s an idea rather than a measurement, and whether thirteen weeks did that for you is genuinely your call, not ours to claim.'
  ),
  facilitator_notes = replace(
    facilitator_notes,
    'Create ritual and ceremony — teenagers respond powerfully to being genuinely seen and acknowledged.',
    'MARK THE THRESHOLD, DON''T RITUALISE IT — no candles, no darkened room, no staging that puts a facilitator at the centre of a circle. Teenagers respond powerfully to being genuinely seen and acknowledged; that''s what to deliver, plainly.'
  ),
  updated_at        = now()
WHERE week_number = 13 AND audience = 'Teen';

-- Split from the statement above: Postgres forbids assigning the same column
-- twice in one SET, so the evidence-base append runs as its own UPDATE.
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%DELIBERATELY THIN, AND SAY SO%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w13t$

--- WEEK 13 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: mark the threshold, don't ritualise it. A photo of this session taken by a stranger should look like a youth room on a Sunday — because that is what it is.

THE EVIDENCE. Deliberately thin, and say so. We are not claiming measured brain change from thirteen weeks. Sustained practice improves the skill practised; teens have been practising noticing for three months. If a teen asks "did this actually do anything?", the honest answer is "tell me — you're the only one with the data."

WE DELIBERATELY DON'T CLAIM. That awareness is "structural". That anyone is transformed. Thirteen weeks of honest looking is the whole claim — inflating it would undo the credibility the previous twelve weeks earned.$b4w13t$
  END,
  updated_at        = now()
WHERE week_number = 13 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 13 — CHILD (signal metaphor: the toolbox)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor = $b4w13c$Think of everything we've learned as tools in a toolbox — the pause button, the feelings iceberg, the true mirror, the gremlin's off switch. Today we open the box and look at everything we've collected.$b4w13c$,
  updated_at      = now()
WHERE week_number = 13 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 14 — TEEN (point 0 safeguarding preamble; strengthened note)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b4w14t$0. Before anything else, so nobody misunderstands this session: nothing today is about keeping things from your parents, going around trusted adults, or deciding you don't need anyone. If someone ever uses words like the ones in this session to persuade you to keep a secret from the adults who look after you — including anyone here — that is exactly the moment to tell one of them. Inner authority means knowing what YOU think. It has never meant being on your own.

$b4w14t$ || teaching_points,
  facilitator_notes = facilitator_notes || $b4w14t$

STRENGTHENED NOTE (curriculum review): some young people in the room are complying with a controlling or unsafe household because compliance is keeping them safe. "Give yourself permission" is the wrong instruction for that young person. If a teen's waiting looks like safety rather than fear, do not push it.

--- WEEK 14 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE POINT 0 RULE BEFORE FACILITATING. POINT 0 IS MANDATORY AND VERBATIM. The rule about never encouraging secrecy from caregivers applies permanently, not just this week: no Mindcast facilitator may ever encourage a young person to withhold information from a parent, caregiver or trusted adult, or frame Mindcast as a place where things are kept from them. Any facilitator who does this is to be removed immediately. This holds even where the material is genuinely about autonomy.

THE EVIDENCE. Approval-seeking as a learned and persistent pattern is well described across developmental and clinical literature; we don't need a specific citation for the observation that people trained to seek authorisation keep seeking it. Keep the claims modest here — the session works on recognition, not on research.

WE DELIBERATELY DON'T CLAIM. That waiting is always fear — sometimes waiting is judgment, or safety, or care for someone else. That autonomy means not consulting anyone. That any decision needs to be made today.$b4w14t$,
  updated_at        = now()
WHERE week_number = 14 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 14 — ADULT (hold the tone: small acts, not life decisions)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%POINT 0 IS MANDATORY AND VERBATIM%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w14a$

--- WEEK 14 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
HOLD THE TONE. The note already says "empowering rather than urgent" and that is exactly right. This session can tip into permission-as-pressure: a room of people deciding on the spot to leave a job or a marriage is not a good outcome for week 14 of 52. The output is a SMALL act, this week. Say so explicitly.

THE EVIDENCE. Approval-seeking as a learned and persistent pattern is well described across developmental and clinical literature. Keep the claims modest — the session works on recognition, not on research.

WE DELIBERATELY DON'T CLAIM. That waiting is always fear — sometimes waiting is judgment, or safety, or care for someone else. That autonomy means not consulting anyone. That any decision needs to be made today.$b4w14a$
  END,
  updated_at        = now()
WHERE week_number = 14 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 14 — CHILD (signal metaphor: which things you can already start)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b4w14c$Sometimes we sit and wait for someone to say "you can start now" — and nobody says it, so we never start. Some things really do need a grown-up's yes. But some things you can already start. Today we work out which is which.$b4w14c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%NEVER ENCOURAGE SECRECY FROM CAREGIVERS%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w14c$

--- WEEK 14 REVIEW: SAFEGUARDING NOTE (appended by curriculum review) ---
The child teaching points already handle this correctly — "It's always good to check with trusted adults before doing new things — that's smart, not weak." Leave them exactly as written; they are the model the teen track follows.

STANDING RULE FOR ALL YOUTH SESSIONS: no Mindcast facilitator may ever encourage a child to withhold information from a parent, caregiver or trusted adult, or frame Mindcast as a place where things are kept from them (NEVER ENCOURAGE SECRECY FROM CAREGIVERS). Any facilitator who does this is to be removed immediately. This holds even where the material is genuinely about autonomy.$b4w14c$
  END,
  updated_at        = now()
WHERE week_number = 14 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- WEEK 15 — TEEN (body-as-oracle line replaced)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  guided_reflection = replace(
    guided_reflection,
    'What does your body know that your head hasn''t admitted yet?',
    'Which one did you relax into, and which one did you brace for? That''s information — not an answer, and not a decision. Just information.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%POSSIBLE SELVES (1986) IS SOLID AND USEFUL%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w15t$

--- WEEK 15 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: this carries genuine grief; the work is witnessing rather than fixing. Do not rush anyone to the reframe.

THE EVIDENCE. Markus & Nurius's POSSIBLE SELVES (1986) IS SOLID AND USEFUL: we hold multiple mental models of who we might become — ideal selves, feared selves, and "ought selves", the person we think we're supposed to be. Distance between the ought self and the actual self is associated with a particular flavour of distress. Erikson's identity-versus-role-confusion stage is a stage MODEL rather than an empirical finding — say "a well-known way of describing it", not "research shows".

CULTURAL NOTE FOR THE TAUPO ROOM. For members from cultures where identity is legitimately collective rather than individual — including Maori and Pasifika whanau — "letting go of who you were supposed to be" can read as an instruction to abandon obligation to family. It isn't, and it mustn't be delivered as one. Frame it as EXAMINING the script, not discarding it. Choosing to carry an inherited obligation, knowingly, is a complete and legitimate outcome of this session.

BODY RULE (from Week 4): the body reports familiarity and threat — it does not know your future. The reflection now asks what they relaxed into vs braced for, which is defensible. Do not reintroduce body-as-oracle language.

WE DELIBERATELY DON'T CLAIM. That the expected life is always the wrong one. That the body knows your future. That individual self-definition is the only healthy endpoint.$b4w15t$
  END,
  updated_at        = now()
WHERE week_number = 15 AND audience = 'Teen';

-- ---------------------------------------------------------------------------
-- WEEK 15 — ADULT (eyes-open/write option; possible selves evidence)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  guided_reflection = $b4w15a$Eyes open or closed, your choice — and if you'd rather write this than picture it, write it.

$b4w15a$ || guided_reflection,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%POSSIBLE SELVES (1986) IS SOLID AND USEFUL%' THEN facilitator_notes
    ELSE facilitator_notes || $b4w15a$

--- WEEK 15 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
RUN THE ROOM: the existing note is right that this carries genuine grief, and that the work is witnessing rather than fixing. Do not rush anyone to the reframe.

THE EVIDENCE. Markus & Nurius's POSSIBLE SELVES (1986) IS SOLID AND USEFUL: we hold multiple mental models of who we might become — ideal selves, feared selves, and "ought selves", the person we think we're supposed to be. Distance between the ought self and the actual self is associated with a particular flavour of distress. That framework is doing real work in this session and is worth naming.

CULTURAL NOTE FOR THE TAUPO ROOM. For members from cultures where identity is legitimately collective rather than individual — including Maori and Pasifika whanau — "letting go of who you were supposed to be" can read as an instruction to abandon obligation to family. It isn't, and it mustn't be delivered as one. Frame it as EXAMINING the script, not discarding it. Choosing to carry an inherited obligation, knowingly, is a complete and legitimate outcome of this session.

WE DELIBERATELY DON'T CLAIM. That the expected life is always the wrong one. That the body knows your future. That individual self-definition is the only healthy endpoint.$b4w15a$
  END,
  updated_at        = now()
WHERE week_number = 15 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- WEEK 15 — CHILD (signal metaphor: the blank page)
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor = $b4w15c$Imagine someone else drew a picture of your life and handed it to you and said "this is you". It might be a nice picture. But it isn't yours. Today we get a blank page.$b4w15c$,
  updated_at      = now()
WHERE week_number = 15 AND audience = 'Child';
