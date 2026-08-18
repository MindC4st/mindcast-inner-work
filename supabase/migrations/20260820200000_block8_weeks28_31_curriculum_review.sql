-- Block 8 curriculum review rewrite (Weeks 28-31, all three tracks).
-- Source: mindcast-block8-weeks-28-31.md. Phase: Rebuild.
--
-- Headline items:
--   * The popular-author pattern handled as a rule: Duhigg (wk12), Brown
--     (wk22), Kessler (wk23) already corrected; this block fixes James Clear
--     (wk29 — 'atomic habits research' does not exist; he is a writer) and
--     Matthew Walker (wk30 — Why We Sleep has documented factual errors;
--     cite the field, not the book). Standing rule for the training manual:
--     cite RESEARCH or cite WRITERS, never confuse the two.
--   * Wk30 safeguarding: numerical food self-rating removed from teen and
--     child tracks (recognised route into disordered eating); the food rules
--     are added verbatim to all three tracks and apply curriculum-wide.
--     Food-insecurity surfacing via 'is there usually food around'.
--     'Nervous system regulation' phrase dropped in favour of what breathing
--     actually does.
--   * Wk31: Jim Rohn's 'average of five people' has no empirical basis —
--     the clearest fabrication found in the curriculum — corrected; the
--     Christakis/Fowler support withdrawn (contested); 'attract into your
--     life' removed from both journaling prompts (law-of-attraction
--     vocabulary, MC-BRD-002 forbidden list).

-- ===========================================================================
-- WEEK 28 — VALUES
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%SCHWARTZ''S VALUES THEORY%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w28$

--- WEEK 28 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. SCHWARTZ'S VALUES THEORY is genuinely good work — ten value dimensions validated across a large number of cultures, with a reliable structure showing which values sit in tension with which. That tension is the useful part: security and self-direction genuinely pull against each other, and most people's stated-versus-lived gap sits exactly on one of those tensions.

ON THE "VALUES CLARITY REDUCES ANXIETY" CLAIM in the teen track: the underlying work is the self-affirmation literature, where effects are real but modest and context-dependent. Say "helps people decide under pressure" rather than listing outcomes.

WE DELIBERATELY DON'T CLAIM. That there is a correct set of values. That inherited values are automatically wrong — a member who examines a value from their upbringing and chooses to keep it has done the exercise perfectly.$b8w28$
  END,
  updated_at = now()
WHERE week_number = 28;

UPDATE public.mindcast_live_sessions
SET signal_metaphor = $b8w28c$A compass always points the same way, no matter which way you turn it — so you can always find your way home. The things that matter most to you work like that. Today we find out which way yours points.$b8w28c$,
    updated_at = now()
WHERE week_number = 28 AND audience = 'Child';

-- ===========================================================================
-- WEEK 29 — HABITS (James Clear correction; Week 12 material carried through)
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b8w29a$1. IDENTITY-BASED HABITS — framing a habit as "I'm the kind of person who reads" rather than "I want to read more" — hold up better than outcome-based framing. James Clear popularised this in Atomic Habits; he's a writer synthesising research rather than a researcher, and the idea has reasonable support independent of the book.
2. The "1% better every day compounds" line is a nice piece of arithmetic and not a finding. Nothing about you compounds at a fixed daily rate. What's actually true is duller and more reliable: REPETITION IN A STABLE CONTEXT BUILDS AUTOMATICITY, AND IT TAKES LONGER THAN YOU THINK. Lally et al. (2010): median 66 DAYS, range 18 TO 254 — and missing a single day did not break the curve.
3. So make the habit small enough that a bad week doesn't end it. The smallness isn't a compromise. It's the mechanism.
4. And name the cue. Gollwitzer & Sheeran (2006), 94 tests, over 8,000 people: an if-then plan specifying WHEN, WHERE AND HOW produced a medium-to-large improvement in follow-through (d = 0.65) over intention alone. "I'll read more" is an intention. "After I put my phone on the charger at night, I read one page" is a plan.$b8w29a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE EVIDENCE, PROPERLY THIS TIME%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w29a$

--- WEEK 29 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE, PROPERLY THIS TIME. Lally (66 days, 18-254, one missed day doesn't reset) and Gollwitzer & Sheeran (d = 0.65 for if-then plans). This is the Week 12 material carried through, as it should have been. Do not let anyone leave with a resolution instead of a cue.

THE MINIMUM VIABLE HABIT IS THE WHOLE TECHNIQUE. People are surprised by how small it should be. Frame the smallness as the mechanism, not a compromise — a habit that survives a bad week is worth more than one that's impressive for nine days.

WE DELIBERATELY DON'T CLAIM. That 1% compounds. That James Clear conducted research — he's a writer; the idea has support independent of the book. That habits take any particular number of days.$b8w29a$
  END,
  updated_at        = now()
WHERE week_number = 29 AND audience = 'Adult';

-- TEEN — plain-language mirror of points 2-4
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    replace(
      replace(
        teaching_points,
        'The minimum viable habit concept: the smallest version of a habit that still moves in the right direction is more valuable than the ideal version that never happens. 2 minutes of meditation every day beats 30-minute sessions twice a month.',
        'The "1% better every day" line is nice arithmetic, not a finding — nothing about you compounds at a fixed daily rate. What''s true is duller and more reliable: repetition in a stable context builds automaticity, and it takes longer than you think. Researchers tracked 96 people building a daily habit — the median was about 66 days before it felt automatic, some people took more than 250, and missing ONE day didn''t reset any of it.'
      ),
      'Habit stacking (anchoring a new habit to an existing one) is the most reliable trigger system. ''After I [existing habit], I will [new habit].'' No new decision required — just a new follow-on.',
      'So make the habit small enough that a bad week doesn''t end it. Two minutes every day beats thirty minutes twice a month. The smallness isn''t a compromise — it''s the mechanism.'
    ),
    'Environment design is more powerful than motivation. Put the guitar on the stand in your room, not in the case in the wardrobe. Put the book on your desk, not the shelf. Make the desired behaviour the easiest option.',
    'And name the cue: "After I [existing habit], I will [new habit]." In one big review of 94 studies, people who made a specific when-where-how plan were far more likely to actually follow through than people who just intended to. Put the guitar on the stand, not in the case — make the next step the easy step.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE EVIDENCE, PROPERLY THIS TIME%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w29t$

--- WEEK 29 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE, PROPERLY THIS TIME. Same as the adult track, plainer: 66 days median (18-254 range, missing a day doesn't reset it), and specific when-where-how plans beat vague intentions. Do not let anyone leave with a resolution instead of a cue.

THE MINIMUM VIABLE HABIT IS THE WHOLE TECHNIQUE. The smallness is the mechanism, not a compromise.

WE DELIBERATELY DON'T CLAIM. That 1% a day compounds. That James Clear conducted research. That habits take any particular number of days.$b8w29t$
  END,
  updated_at        = now()
WHERE week_number = 29 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b8w29c$Nobody ever grew a sunflower by shouting at it once. You water it a little bit, every single day, and one morning it's taller than you. Habits are exactly the same.$b8w29c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE EVIDENCE, PROPERLY THIS TIME%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w29c$

--- WEEK 29 REVIEW (child track, appended by curriculum review) ---
The child arithmetic is correct and worth keeping: five minutes of reading every day adds up to over 30 hours in a year (30.4). Somebody checked — keep checking. The sunflower carries the week: a little bit, every day.$b8w29c$
  END,
  updated_at        = now()
WHERE week_number = 29 AND audience = 'Child';

-- ===========================================================================
-- WEEK 30 — BODY (food safeguarding rules; Walker correction)
-- ===========================================================================

-- Food rules — verbatim, all three tracks, curriculum-wide from here on.
UPDATE public.mindcast_live_sessions
SET facilitator_notes = facilitator_notes || $b8w30food$

--- WEEK 30 REVIEW: FOOD RULES (appended by curriculum review — apply to EVERY session for the rest of the year) ---
FOOD, IN THIS SESSION AND EVERY SESSION:
- No numbers. No calories, no portions, no weights, no "servings per day".
- No good foods and bad foods. No clean eating, no treats-as-rewards, no naming any food as something to cut down.
- NO SELF-RATING ON NOURISHMENT FOR THE TEEN OR CHILD TRACKS. The score has been replaced with a single non-numeric question: "do you usually eat breakfast?" and move on.
- No comments on any member's body, food, or appearance — including positive ones. "You look well" is a comment about a body.
- No facilitator discussing their own eating or exercise.

IF A YOUNG PERSON DISCLOSES RESTRICTING, PURGING, OR DISTRESS ABOUT FOOD OR THEIR BODY: do not advise, do not reassure them about their appearance, and do not weigh in on what they should eat. Follow MC-SAF-001 and refer. The Eating Disorders Association of New Zealand is the appropriate signpost; keep the number with the wellbeing resources.

THE SAME APPLIES TO MOVEMENT. This session is about energy and function, never about fitness, weight or appearance. A member who does no exercise is not failing at anything.$b8w30food$,
    updated_at = now()
WHERE week_number = 30;

-- ADULT — Walker corrected; 'nervous system regulation' phrase dropped
UPDATE public.mindcast_live_sessions
SET
  teaching_points     = replace(
    replace(
      teaching_points,
      'Nervous system regulation — the capacity to move between arousal states with some degree of volition — is trainable.',
      'Settling yourself on purpose — the capacity to move between arousal states with some degree of volition — is trainable.'
    ),
    'Sleep is the highest-leverage item on this list',
    'Sleep is the highest-leverage thing on this list, and the underlying science is genuinely strong: insufficient sleep degrades emotional regulation, attention, memory consolidation and judgment, and most people underestimate how much it''s costing them. You may have read Why We Sleep — we''d note that Matthew Walker''s book has had a number of specific claims challenged and corrected since publication, so we''re citing the field rather than the book. NOTE (curriculum review): if the surrounding text still presents Walker''s book as "unequivocal", that word goes — cite the field, not the book. Sleep "clearing waste from the brain" is an active research area and is not settled; the everyday effects are enough of an argument'
  ),
  signal_metaphor     = replace(signal_metaphor, 'nourishment, and nervous system regulation', 'food, and knowing how to get calm again'),
  opening_hook        = replace(opening_hook, 'nervous system regulation (capacity to return to calm after stress)', 'settling yourself (capacity to return to calm after stress)'),
  guided_reflection   = replace(guided_reflection, 'tools available for nervous system regulation', 'tools available for settling yourself down — and you can feel it in thirty seconds'),
  facilitator_notes   = CASE
    WHEN facilitator_notes LIKE '%SLEEP IS THE STRONGEST CLAIM AVAILABLE%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w30a$

--- WEEK 30 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE FOOD RULES BEFORE FACILITATING. They are not guidance; they are requirements, and they apply to every session for the rest of the year.

THE EVIDENCE. SLEEP IS THE STRONGEST CLAIM AVAILABLE and it doesn't need a popular book behind it — cite the field, not Why We Sleep. Adults broadly need seven to nine hours; teenagers genuinely need more — eight to ten — and their body clocks genuinely run later, which is biology, not laziness. Slow breathing with an extended exhale has good support as an immediate self-regulation tool: it settles you down, and you can feel it in thirty seconds. Keep the breathing practice; keep the child version's three breaths to open every session.

TONE. The adult note's instruction — warmth and zero judgment, because most adults are chronically under-resourced and ashamed of it — is exactly right and should be read before every delivery.

STRUCTURAL HONESTY. Shift work, night feeds, chronic pain, a second job, and no money for food are not habit problems. Name that. A session that implies otherwise loses the room's trust permanently and deserves to.

WE DELIBERATELY DON'T CLAIM. That sleep clears brain waste — unsettled. That Walker's book is authoritative. Anything at all about weight, diet, or what anyone should eat.$b8w30a$
  END,
  updated_at          = now()
WHERE week_number = 30 AND audience = 'Adult';

-- TEEN — food scoring removed; food-insecurity surfacing; Walker note
UPDATE public.mindcast_live_sessions
SET
  experiential_exercise = $b8w30t$BODY AUDIT (revised by curriculum review). Rate yourself 1-10 on three things: SLEEP, MOVEMENT, and BEING ABLE TO SETTLE YOURSELF WHEN YOU'RE STRESSED.

Then, separately and without a score: is there usually food around when you're hungry? That one isn't about you — it's about your situation, and some situations are harder than others.

Pick your lowest score. What's one small change that's actually available to you this week? Not the perfect change. The available one.$b8w30t$,
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%SLEEP IS THE STRONGEST CLAIM AVAILABLE%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w30t$

--- WEEK 30 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE FOOD RULES BEFORE FACILITATING — requirements, not guidance, every session for the rest of the year. The teen track no longer scores food at all; a session that has adolescents numerically rate their eating is a recognised route into disordered eating, and in a room of thirty teens some will already be struggling.

FOOD INSECURITY: the "is there usually food around when you're hungry?" phrasing is deliberate — it surfaces household food insecurity, which is real in Taupo, without asking a teenager to rate their own eating. IF A YOUNG PERSON INDICATES THERE OFTEN ISN'T FOOD, THAT IS A WELFARE MATTER, NOT A HABITS MATTER. Note it and follow MC-SAF-001. Do not raise it in the room.

THE EVIDENCE. SLEEP IS THE STRONGEST CLAIM AVAILABLE — teens genuinely need eight to ten hours and their body clocks genuinely run later; that's biology, not laziness. Cite the field, not Why We Sleep. Keep the breathing practice: slow breathing with a longer exhale settles you down and you can feel it in thirty seconds.

STRUCTURAL HONESTY. Night feeds, a second job, shift work, and no money for food are not habit problems. Name that.

WE DELIBERATELY DON'T CLAIM. That sleep clears brain waste — unsettled. That Walker's book is authoritative. Anything at all about weight, diet, or what anyone should eat.$b8w30t$
  END,
  updated_at            = now()
WHERE week_number = 30 AND audience = 'Teen';

-- CHILD — superhero-suit chargers metaphor
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b8w30c$Even a superhero suit needs charging. Yours has four chargers: sleep, moving about, food, and knowing how to get calm again. Today we check which one's running low.$b8w30c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%SLEEP IS THE STRONGEST CLAIM AVAILABLE%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w30c$

--- WEEK 30 REVIEW (child track, appended by curriculum review) ---
READ THE FOOD RULES BEFORE FACILITATING. The child traffic-light food rating has been retired with the rest of the food scoring — the four chargers do the work without any child rating their own eating. Keep the three breaths to open the session: it settles children down and they can feel it in thirty seconds.$b8w30c$
  END,
  updated_at        = now()
WHERE week_number = 30 AND audience = 'Child';

-- ===========================================================================
-- WEEK 31 — THE PEOPLE YOU CHOOSE (Rohn fabrication corrected)
-- ===========================================================================

UPDATE public.mindcast_live_sessions
SET
  teaching_points   = $b8w31a$1. You will have heard that you're "the average of the five people you spend the most time with". It's a good line from a motivational speaker and there is no research behind it — no study, no five, no average. We mention it because you've heard it, and because this session doesn't need it.
2. What is reasonably established is plainer: people's habits, moods and norms do influence the people around them. How much, and how far through a network, is genuinely argued about — separating real influence from the fact that similar people cluster together is hard and not settled.
3. One finding does deserve its place here: relationship quality (not quantity) is among the strongest predictors of health, happiness and longevity in the Harvard Study of Adult Development — over eighty years of longitudinal data. The quality of your close relationships matters more than almost anything else for long-term wellbeing.
4. The claim we're actually making is modest and you can test it yourself: NOTICE HOW YOU FEEL AFTER TIME WITH PARTICULAR PEOPLE. That's data you already have.$b8w31a$,
  journaling_prompt = $b8w31a$Write about the community you're building — the relationships already here that you want to invest more in, and the kind of people you want to seek out and become useful to as you grow.$b8w31a$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE AVERAGE OF FIVE PEOPLE%LINE IS NOT RESEARCH%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w31a$

--- WEEK 31 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE CORRECTION FIRST. "THE AVERAGE OF FIVE PEOPLE" LINE IS NOT RESEARCH and must not be presented as such — Jim Rohn was a motivational speaker; there is no study, no five, and no average. The Christakis/Fowler network work once used to prop it up is real but substantially criticised (separating contagion from homophily is unresolved) and does not address the aphorism anyway.

THE EVIDENCE. The honest position is that social influence is real, its magnitude is contested, and the member's own felt experience after time with someone is better data than any of it. The Harvard Study of Adult Development's relationship-quality finding is the one that earns its citation.

DEPLETING IS NOT BAD — the single most important framing in the session and the one most likely to be missed. This is not a licence to discard people. Most members will put a family member in the depleting column, and some will put someone they are obligated to care for. Depleting is not the same as bad, and choosing to keep showing up for a person who costs you something is frequently the most values-consistent thing anyone in this room does. Say that out loud.

IN A TOWN THIS SIZE, members will also recognise each other's descriptions. Contexts, not names.

WE DELIBERATELY DON'T CLAIM. That you become an average of anybody. That you can attract people by becoming a certain way — "attract into your life" has been removed from the journaling prompts (law-of-attraction vocabulary, MC-BRD-002 forbidden list). That relationships which cost you something should be ended.$b8w31a$
  END,
  updated_at        = now()
WHERE week_number = 31 AND audience = 'Adult';

-- TEEN — journaling prompt de-manifested; evidence notes
UPDATE public.mindcast_live_sessions
SET
  journaling_prompt = $b8w31t$Write about the social environment you are actively building — who you want to seek out and become useful to as you grow, and what you offer to the people who choose to be close to you.$b8w31t$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE AVERAGE OF FIVE PEOPLE%LINE IS NOT RESEARCH%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w31t$

--- WEEK 31 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
"THE AVERAGE OF FIVE PEOPLE" LINE IS NOT RESEARCH — if it comes up, say so plainly; teens have heard the line and will respect the correction. The honest position: social influence is real, its size is argued about, and how you feel after time with someone is better data than any of it.

DEPLETING IS NOT BAD. Most teens will sort a family member into the hard column, and some are caring for someone. Choosing to keep showing up for a person who costs you something is frequently the most grown-up thing in the room. Say that out loud. Contexts, not names — in a town this size they know each other.

WE DELIBERATELY DON'T CLAIM. That you become an average of anybody. That you can attract people by becoming a certain way. That a relationship which costs you something should end.$b8w31t$
  END,
  updated_at        = now()
WHERE week_number = 31 AND audience = 'Teen';

-- CHILD — companion-plants metaphor; evidence notes
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b8w31c$Some plants grow better next to certain other plants — gardeners have known that for hundreds of years. People are a bit like that too. Today we think about who helps us grow.$b8w31c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%THE AVERAGE OF FIVE PEOPLE%LINE IS NOT RESEARCH%' THEN facilitator_notes
    ELSE facilitator_notes || $b8w31c$

--- WEEK 31 REVIEW (child track, appended by curriculum review) ---
Keep the companion-plants framing gentle: who helps us grow, not who is bad for us. If a child's "hard to grow next to" answer is someone at home and it sounds harmful, do not explore it in the room. Note it and follow MC-SAF-001.$b8w31c$
  END,
  updated_at        = now()
WHERE week_number = 31 AND audience = 'Child';
