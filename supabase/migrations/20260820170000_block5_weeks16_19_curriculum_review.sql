-- Block 5 curriculum review rewrite (Weeks 16-19, all three tracks).
-- Source: mindcast-block5-weeks-16-19.md. Phase: Unlearn.
--
-- Headline items:
--   * Wk16: 'nobody has to forgive' opt-out added verbatim to all three
--     tracks before the exercise; teen cortisol claim fixed; teen
--     physical-health claims softened to match the evidence note; child
--     hot-rock goes home only by private choice, never with a name on it.
--   * Wk17: self-forgiveness-is-not-absolution warning added (adult/teen);
--     adult reflection gains eyes-open/write option.
--   * Wk18: teen 'brain training' note replaced with skill-with-reps
--     framing (no rewiring); growth mindset held at the Block 1 line.
--   * Wk19: the emotional-labour lesson removed from Week 1 lands here —
--     MAKE THE INVISIBLE VISIBLE (adult), THE STUFF NOBODY CLOCKS (teen,
--     surfaces young carers), THE JOBS NOBODY SEES (child). The fawn/
--     polyvagal/trauma-informed triple error in adult point 1 is corrected.
--     Teen 'social pain = physical pain' claim caveated (Eisenberger &
--     Lieberman 2003 contested).

-- ===========================================================================
-- WEEK 16 — FORGIVENESS
-- ===========================================================================

-- Opt-out, verbatim, delivered before the exercise — all three tracks.
UPDATE public.mindcast_live_sessions
SET experiential_exercise = $b5opt$Before we start: forgiveness is not required, and it is not a test you can fail. If what happened to you is still happening, or if it was serious, or if you're simply not ready — sit this one out, write about something small instead, or just listen. Nobody will ask. Choosing not to forgive someone is a legitimate, adult decision and this room supports it. What we are letting go of is the grip, not the standard.

$b5opt$ || experiential_exercise,
    updated_at = now()
WHERE week_number = 16;

-- TEEN — cortisol claim fixed; health claims softened
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    replace(
      teaching_points,
      'Neuroscience shows that resentment and anger, when repeatedly replayed, keep the stress response activated — cortisol remains elevated, the threat-detection system stays on alert. You''re not just remembering the hurt — your body is re-experiencing it every time.',
      'Replaying a hurt keeps the body in the state it was in when the hurt happened — tense, watchful, braced. You are not only remembering it; you are running it again. You don''t need the hormone names to notice that, and most of what''s written about them online is wrong anyway.'
    ),
    'Research shows people who practise forgiveness have better immune function, lower blood pressure, less depression, and higher life satisfaction. This is not spiritual advice. It is physiology.',
    'Research on forgiveness interventions — Luskin''s Stanford work is the most cited — shows reductions in self-reported anger and distress. The physical-health claims (blood pressure, immune function) are weaker than the popular write-ups suggest: small samples, mostly self-reported outcomes. The psychological benefit is the defensible claim; the health benefit is a maybe.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%LUSKIN%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w16t$

--- WEEK 16 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE OPT-OUT RULE FIRST. The verbatim opt-out comes before the exercise, every track. Some people should not forgive, and some should not forgive yet: in a room of sixty, someone is being harmed currently, and someone was abused as a child. A session presenting forgiveness as the healthy outcome — with everyone else visibly doing it — is coercive for that person even though nobody intends it.

IF A MEMBER DISCLOSES ONGOING HARM DURING THIS SESSION, forgiveness is not the topic and must not be pursued. Safety is. Follow MC-SAF-001 and refer. Never respond to a disclosure of current abuse with anything that sounds like it belongs to this week's material.

THE EVIDENCE. Forgiveness interventions — LUSKIN's Stanford work is the most cited — do show reductions in self-reported anger and distress. Treat the physiological claims with more caution than the popular write-ups do. The psychological benefit is the defensible claim. The health benefit is a maybe, and we say maybe.

WE DELIBERATELY DON'T CLAIM. That forgiveness is required, healthy for everyone, or a marker of progress. That it improves your physical health. That reconciliation is any part of it — every track already says this and it should be said twice.$b5w16t$
  END,
  updated_at        = now()
WHERE week_number = 16 AND audience = 'Teen';

-- ADULT / CHILD — week 16 facilitator notes (opt-out + disclosure handling)
UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%LUSKIN%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w16a$

--- WEEK 16 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
READ THE OPT-OUT RULE FIRST. The verbatim opt-out comes before the exercise. Some people should not forgive, and some should not forgive yet. In a room this size, someone is being harmed currently, and someone was abused as a child. Presenting forgiveness as the healthy outcome — with everyone else visibly doing it — is coercive for that person even though nobody intends it.

IF A MEMBER DISCLOSES ONGOING HARM DURING THIS SESSION, forgiveness is not the topic and must not be pursued. Safety is. Follow MC-SAF-001 and refer. Never respond to a disclosure of current abuse with anything that sounds like it belongs to this week's material.

THE EVIDENCE. Forgiveness interventions (Luskin's Stanford work is the most cited) show reductions in self-reported anger and distress. The psychological benefit is the defensible claim; the physical-health benefit is a maybe, and we say maybe.

WE DELIBERATELY DON'T CLAIM. That forgiveness is required, healthy for everyone, or a marker of progress. That it improves your physical health. That reconciliation is any part of it.$b5w16a$
  END,
  updated_at = now()
WHERE week_number = 16 AND audience IN ('Adult','Child');

-- CHILD — signal metaphor replaced; hot-rock handling
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b5w16c$Imagine holding a stone so tightly your hand aches. The stone doesn't mind. It's your hand that hurts. Today we practise opening our hands.$b5w16c$,
  facilitator_notes = facilitator_notes || $b5w16c$

CHILD TRACK — THE HOT ROCK GOES HOME, OR IT DOESN'T, BY CHOICE. Same handling as the Week 9 stone: children choose PRIVATELY whether the rock travels home or stays in a named box at the venue — one-to-one, never by show of hands. And children must not write a person's name on it: feelings only, no names. A caregiver may find the rock; in the families this session most needs to reach, that may not be a safe conversation.$b5w16c$,
  updated_at        = now()
WHERE week_number = 16 AND audience = 'Child';

-- ===========================================================================
-- WEEK 17 — SELF-FORGIVENESS
-- ===========================================================================

-- ADULT — eyes-open/write option; absolution warning; evidence
UPDATE public.mindcast_live_sessions
SET
  guided_reflection = $b5w17a$Eyes open or closed, whichever you prefer — and if picturing it doesn't work for you, write the conversation instead.

$b5w17a$ || guided_reflection,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%MINDCAST IS NOT A CONFESSIONAL%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w17a$

--- WEEK 17 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THIS SESSION CAN BE MISUSED. Self-forgiveness is available AFTER accountability, not instead of it — and it is not ours to grant. If a member is carrying something involving serious harm to another person, particularly a child, or something criminal, this session does not resolve it and must not be offered as though it could. Do not explore the content, do not reassure, and follow MC-SAF-001 immediately afterwards. MINDCAST IS NOT A CONFESSIONAL and facilitators hold no privilege.

THE EVIDENCE. Two solid bodies of work carry this week. NEFF's self-compassion research — self-compassion is associated with better resilience and, counter-intuitively for most of the room, MORE motivation rather than less. And the SHAME/GUILT DISTINCTION (Tangney and colleagues): guilt is about behaviour and predicts repair; shame is about self and predicts hiding, defensiveness and repetition. That distinction is among the more robust findings in this area and it is the whole session.

Expect resistance. The belief that self-criticism drives standards is deeply held, and someone will say "if I go easy on myself I'll get worse." Don't argue. Ask them whether it has worked yet.

WE DELIBERATELY DON'T CLAIM. That self-forgiveness resolves harm done to others. That guilt is bad — it isn't; it's the useful one.$b5w17a$
  END,
  updated_at        = now()
WHERE week_number = 17 AND audience = 'Adult';

-- TEEN — absolution warning + evidence
UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%MINDCAST IS NOT A CONFESSIONAL%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w17t$

--- WEEK 17 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THIS SESSION CAN BE MISUSED. Self-forgiveness is available AFTER accountability, not instead of it — and it is not ours to grant. If a young person is carrying something involving serious harm to another person, or something criminal, this session does not resolve it and must not be offered as though it could. Do not explore the content, do not reassure, and follow MC-SAF-001 immediately afterwards. MINDCAST IS NOT A CONFESSIONAL and facilitators hold no privilege.

THE EVIDENCE. Neff's self-compassion research (self-compassion is associated with MORE motivation, not less) and the shame/guilt distinction (Tangney and colleagues): guilt is about behaviour and predicts repair; shame is about self and predicts hiding and repetition. That distinction is the whole session.

WE DELIBERATELY DON'T CLAIM. That self-forgiveness resolves harm done to others. That guilt is bad — it's the useful one.$b5w17t$
  END,
  updated_at        = now()
WHERE week_number = 17 AND audience = 'Teen';

-- CHILD — signal metaphor: closing the account
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b5w17c$If a friend paid you back money they owed, you wouldn't keep asking them for it. So when you've said sorry and made it right, you don't have to keep making yourself pay. Today we close the account.$b5w17c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%MINDCAST IS NOT A CONFESSIONAL%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w17c$

--- WEEK 17 REVIEW (child track, appended by curriculum review) ---
Keep the acknowledge → say sorry → make it right → let it go sequence concrete and short. If a child's "sorry" involves something an adult should know about (harm to another child, something done to them), do not handle it in the room: note it and follow MC-SAF-001. The session is for small, child-sized debts — not for carrying anything an adult needs to pick up.$b5w17c$
  END,
  updated_at        = now()
WHERE week_number = 17 AND audience = 'Child';

-- ===========================================================================
-- WEEK 18 — THE INNER COACH
-- ===========================================================================

-- TEEN — note replaced (no rewiring); evidence + growth mindset line
UPDATE public.mindcast_live_sessions
SET
  facilitator_notes = replace(
    facilitator_notes,
    'Reinforce: this is brain training, not positive thinking.',
    'Reinforce: this is a skill with reps, like anything else you practise. It feels fake for the first dozen goes. That''s normal and it''s not a sign it isn''t working.'
  ),
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%WISE FEEDBACK (YEAGER, COHEN AND COLLEAGUES)%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w18t$

--- WEEK 18 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. WISE FEEDBACK (YEAGER, COHEN AND COLLEAGUES) is a good finding and directly applicable: feedback that pairs a high standard with explicit confidence in the person's ability to meet it outperforms both harsh criticism and reassurance alone. The coach template is that finding turned into a script — acknowledge the difficulty, state the standard, express confidence, name the next specific action.

GROWTH MINDSET APPEARS IN THIS WEEK. Hold the Block 1 line: examining beliefs about your own capacity is worth an hour; the effect on outcomes is much smaller than the popular version claims (Sisk et al. 2018 meta-analysis: ~1% of variance, d = 0.08 across intervention studies; benefits concentrated in people currently struggling); no numbers, no promises. If challenged: "Growth mindset got oversold. The big replication work found the effect is real but around a tenth the size the popular version claims, and it helps people who are struggling more than people who aren't. We still think examining your beliefs about your own capacity is worth an hour — we just won't tell you it'll change your life."

WE DELIBERATELY DON'T CLAIM. That this rewires anything. That the coach voice will feel natural quickly — it won't, and saying so prevents people concluding they've failed at week 18.$b5w18t$
  END,
  updated_at        = now()
WHERE week_number = 18 AND audience = 'Teen';

-- ADULT — evidence + growth mindset line
UPDATE public.mindcast_live_sessions
SET facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%WISE FEEDBACK (YEAGER, COHEN AND COLLEAGUES)%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w18a$

--- WEEK 18 REVIEW: EVIDENCE BASE (appended by curriculum review) ---
THE EVIDENCE. WISE FEEDBACK (YEAGER, COHEN AND COLLEAGUES): feedback pairing a high standard with explicit confidence in the person's ability to meet it outperforms both harsh criticism and reassurance alone. The coach template is that finding turned into a script — acknowledge the difficulty, state the standard, express confidence, name the next specific action.

GROWTH MINDSET APPEARS IN THIS WEEK. Hold the Block 1 line: examining beliefs about your own capacity is worth an hour; the effect on outcomes is much smaller than the popular version claims (Sisk et al. 2018: ~1% of variance, d = 0.08; benefits concentrated in people currently struggling); no numbers, no promises. The facilitator line if challenged is in the Block 1 material — use it verbatim.

WE DELIBERATELY DON'T CLAIM. That this rewires anything. That the coach voice will feel natural quickly — it won't, and saying so prevents people concluding they've failed at week 18.$b5w18a$
  END,
  updated_at        = now()
WHERE week_number = 18 AND audience = 'Adult';

-- CHILD — signal metaphor: gremlin vs coach
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor   = $b5w18c$A gremlin says "you'll never do it". A good coach says "that bit was tricky — let's try it another way". Same honesty, completely different voice. Today we practise the coach voice.$b5w18c$,
  facilitator_notes = CASE
    WHEN facilitator_notes LIKE '%WISE FEEDBACK (YEAGER, COHEN AND COLLEAGUES)%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w18c$

--- WEEK 18 REVIEW (child track, appended by curriculum review) ---
THE EVIDENCE (for facilitators). The coach template comes from the wise-feedback finding (Yeager, Cohen and colleagues): high standard + explicit confidence beats harshness and beats empty praise. With children, keep it in one sentence: "That was tricky. You can do hard things. Let's try it this way."

WE DELIBERATELY DON'T CLAIM. That the coach voice feels real straight away. Tell the children it feels pretend at first — that's how every new voice starts.$b5w18c$
  END,
  updated_at        = now()
WHERE week_number = 18 AND audience = 'Child';

-- ===========================================================================
-- WEEK 19 — PEOPLE-PLEASING + EMOTIONAL LABOUR INTEGRATION
-- ===========================================================================

-- ADULT — fawn/polyvagal correction; boundaries point aligned with
-- don't-claim; MAKE THE INVISIBLE VISIBLE replaces the audit.
UPDATE public.mindcast_live_sessions
SET
  teaching_points   = replace(
    replace(
      replace(
        teaching_points,
        'People-pleasing (also called ''fawn'' response in polyvagal theory) is typically a trauma-informed behaviour — it develops in environments where approval was conditional, conflict was dangerous, or the child''s needs were secondary to adult emotions. It is not a character flaw. It is a survival strategy.',
        'Chronic people-pleasing usually has a history. It tends to develop where approval was conditional, conflict was unsafe, or a child''s needs came reliably second. You will see it called the "fawn" response — a term from the complex-trauma literature, not from any neuroscience finding, and we''d rather you knew that. The label isn''t the point. The pattern is: you learned that managing other people''s feelings kept you safe, and the learning outlasted the situation.'
      ),
      'Research on ''sociotropy'' — the excessive valuing of social approval — shows strong correlations with depression, anxiety, and identity confusion. When selfhood is contingent on approval, the loss of approval becomes existential, not just uncomfortable.',
      'It is not a character flaw and it is not the same as kindness. Kindness chooses. People-pleasing complies and calls it choosing.'
    ),
    'The cost of chronic people-pleasing: inauthenticity in relationships (others don''t know the real you), resentment buildup (unacknowledged needs accumulate), loss of self-knowledge (you stop knowing what you actually want), and paradoxically, lower respect from others (people-pleasers are often taken for granted).',
    'The distinction this week rests on: DID I WANT TO, OR WAS I AFRAID NOT TO? That question does all the work.'
  ) || $b5w19a$

Note on boundaries (curriculum review): a boundary doesn't guarantee the relationship improves — sometimes it reveals the relationship was conditional, and that is painful and worth naming.$b5w19a$,
  experiential_exercise = $b5w19ax$MAKE THE INVISIBLE VISIBLE.

Two columns. VISIBLE: the tasks anyone could see you doing — the dishes, the drop-offs, the bills, the reports. INVISIBLE: the remembering, the anticipating, the planning, the checking whether someone else is okay, the following up, the holding of the whole picture in your head so nothing gets dropped.

Be specific. "Admin" is not an entry. "Remembering that the car warrant expires in March" is.

Now, for each item on the invisible list, mark it:
C — I chose this and I'd choose it again.
D — This just defaulted to me and nobody decided anything.
F — I do this because I'm afraid of what happens if I don't.

Then one question, in writing, for yourself: WHAT SURPRISED YOU ON YOUR OWN LIST?

Share only that — what surprised you. Not the list, not the totals, and not anybody else's share of it.$b5w19ax$,
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%COMPLIANCE DRIVEN BY FEAR OF CONSEQUENCE%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w19a$

--- WEEK 19 REVIEW: EMOTIONAL LABOUR INTEGRATION (appended by curriculum review) ---
MANDATORY FRAMING — SAY THIS BEFORE PEOPLE START, IN THESE WORDS:
"This exercise is not about your partner. It is not about your boss, your mother, or your flatmate. None of them are here to give their version, and a room where absent people get tried is not a room anybody's safe in. You're looking at what you carry and why — not at what someone else has failed to carry."

WATCH FOR THE DRIFT. Invisible-load discussion tips into grievance faster than almost any other topic, and the tip is usually gendered. If the room starts building a case, name it once, warmly, and return to the C/D/F marks — those are about the member's own agency, which is the point.

THE THREE MARKS ARE THE ACTUAL LESSON. Most people expect their list to be mostly F. It usually isn't. It's mostly D — things that defaulted silently because nobody ever had the conversation. That is a much more tractable problem than resentment, and it is the finding to steer toward.

THE FAWN/POLYVAGAL CORRECTION IS MANDATORY. "Fawn" comes from Pete Walker's complex-trauma writing, not from polyvagal theory; polyvagal theory is contested (see Week 4); and "trauma-informed" describes an approach, not a behaviour. The teaching point now says this plainly — do not reintroduce the old wording.

THE EVIDENCE. The session works on a distinction rather than a finding, and the distinction is sound: COMPLIANCE DRIVEN BY FEAR OF CONSEQUENCE and generosity driven by choice produce different internal states and different costs over time.

TONE. This must not read as permission to be selfish. Many members — and most of the women in the room — were raised to treat self-erasure as virtue. The target is discernment, not withdrawal.

WE DELIBERATELY DON'T CLAIM. That "fawn" is a neuroscience term. That polyvagal theory is settled. That people-pleasing is always trauma. That boundaries fix relationships — sometimes a boundary reveals that a relationship was conditional, and that is painful and worth naming.$b5w19a$
  END,
  updated_at            = now()
WHERE week_number = 19 AND audience = 'Adult';

-- TEEN — social pain claim caveated; STUFF NOBODY CLOCKS added; young carers
UPDATE public.mindcast_live_sessions
SET
  teaching_points       = replace(
    teaching_points,
    'People-pleasing in teens is often linked to social threat sensitivity — the adolescent brain is particularly alert to social rejection, which activates the same brain regions as physical pain. Saying no feels genuinely dangerous, not just uncomfortable.',
    'Your brain in adolescence is unusually tuned to social rejection. That''s not weakness or vanity — it''s developmental, and it''s why saying no to a friend can feel genuinely dangerous rather than just awkward. You may have heard that social pain "is the same as physical pain in the brain". That was one influential study and it''s been argued about ever since. What isn''t argued about is that it HURTS, and that you''re not being dramatic.'
  ),
  experiential_exercise = experiential_exercise || $b5w19t$

THE STUFF NOBODY CLOCKS (added by curriculum review — emotional labour integration).
Some of what you do at home doesn't look like a job, so nobody counts it. Reading the room when you walk in. Being the easy one. Keeping the peace. Translating for someone. Watching a younger sibling. Knowing which topics not to raise. Checking a parent's mood before you ask for anything.
Write down anything you do that fits. Nobody reads this.
Then mark: C if you chose it, D if it just became yours, F if you do it because you're worried about what happens if you don't.$b5w19t$,
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%COMPLIANCE DRIVEN BY FEAR OF CONSEQUENCE%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w19t$

--- WEEK 19 REVIEW: YOUNG CARERS + EVIDENCE (appended by curriculum review) ---
THE STUFF NOBODY CLOCKS CAN SURFACE YOUNG CARERS — teenagers doing substantial caregiving or emotional management at home, often invisibly and often without anyone having named it. That is not automatically a safeguarding issue; plenty of young people carry real responsibility in loving families and are fine. But it can be, and this exercise may be the first time anyone has asked.
Do not probe in the room. If a young person's list suggests they're carrying an adult's role, or if the F column describes fear of a PERSON rather than fear of letting someone down, note it and follow MC-SAF-001 afterwards. In New Zealand there is real support available for young carers and a referral may be the single most useful thing Mindcast ever does for that young person.

THE EVIDENCE. The session works on a distinction rather than a finding: COMPLIANCE DRIVEN BY FEAR OF CONSEQUENCE and generosity driven by choice produce different internal states and different costs over time. Adolescent sensitivity to social rejection is well documented — state it plainly, with the caveat now in the teaching point (the social-pain overlap claim is contested).

WE DELIBERATELY DON'T CLAIM. That social pain is literally physical pain in the brain. That people-pleasing is always trauma. That saying no ruins friendships — a real yes is worth more than a fear yes.$b5w19t$
  END,
  updated_at            = now()
WHERE week_number = 19 AND audience = 'Teen';

-- CHILD — JOBS NOBODY SEES added; torch metaphor
UPDATE public.mindcast_live_sessions
SET
  signal_metaphor       = $b5w19c$If you say yes to absolutely everything, you run out — like a torch that's been left on all night. Saying "no thanks" sometimes is how you keep the light on for the things you really want to do.$b5w19c$,
  experiential_exercise = experiential_exercise || $b5w19cx$

THE JOBS NOBODY SEES (added by curriculum review — emotional labour integration).
Some jobs everyone notices — like doing the dishes, or tidying your room. Some jobs nobody notices at all. Who remembers the library books are due? Who notices when the dog's water bowl is empty? Who's the one who checks if someone's sad?
Draw or write three jobs in your house that nobody really notices. They can be yours or somebody else's.
Then: circle one that's yours. How does it feel to have it noticed now?$b5w19cx$,
  facilitator_notes     = CASE
    WHEN facilitator_notes LIKE '%COMPLIANCE DRIVEN BY FEAR OF CONSEQUENCE%' THEN facilitator_notes
    ELSE facilitator_notes || $b5w19c$

--- WEEK 19 REVIEW (child track, appended by curriculum review) ---
KEEP THE JOBS NOBODY SEES light and about noticing, never about fairness or who does more. The point is that unseen work exists and that seeing it feels good — not that anyone is being short-changed. If a child describes doing something that sounds like an adult's responsibility, don't explore it in the room. Note it and follow MC-SAF-001.

The distinction for this age stays simple: KIND (you chose it, it feels warm) vs PEOPLE-PLEASING (you did it because you were scared, it feels heavy). The torch metaphor carries it — saying no sometimes is how you keep your light on.$b5w19c$
  END,
  updated_at            = now()
WHERE week_number = 19 AND audience = 'Child';
