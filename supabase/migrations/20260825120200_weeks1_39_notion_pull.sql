-- Weeks 1-39 curriculum content pulled from Notion (source of truth per
-- MC-MEM-106 v2.1 + Curriculum Lesson Specification). Replaces the review-doc
-- migrations (weeks 1-31) and the earlier weeks 32-52 pull for weeks 32-39.
--
-- Pull-time transformations applied (all reported):
--   CLEANED  Adult wk28: journaling_prompt — removed review-document contamination (1730 chars from " Reason:" onward)
--   CLEANED  Adult wk30: facilitator notes — removed "Read §3 before facilitating" review reference
--   CLEANED  Teen wk30: facilitator notes — removed "Read §3 before facilitating" review reference
--   CLEANED  Child wk30: facilitator notes — removed "Read §3 before facilitating" review reference
--   MERGED   Adult wk33: FRI practice merged into WED
--   MERGED   Adult wk35: FRI practice merged into WED
--   MERGED   Adult wk36: FRI practice merged into WED
--   MERGED   Adult wk38: FRI practice merged into WED
--   MERGED   Adult wk39: FRI practice merged into WED
--   MERGED   Teen wk33: FRI practice merged into WED
--   MERGED   Teen wk34: FRI practice merged into WED
--   MERGED   Teen wk35: FRI practice merged into WED
--   MERGED   Teen wk37: FRI practice merged into WED
--   MERGED   Teen wk38: FRI practice merged into WED
--   MERGED   Teen wk39: FRI practice merged into WED
--   MERGED   Child wk33: FRI practice merged into WED
--   MERGED   Child wk34: FRI practice merged into WED
--   MERGED   Child wk35: FRI practice merged into WED
--   MERGED   Child wk36: FRI practice merged into WED
--   MERGED   Child wk37: FRI practice merged into WED
--   MERGED   Child wk38: FRI practice merged into WED
--   MERGED   Child wk39: FRI practice merged into WED
--
-- Report-only (NOT fixed here — see proposals/notion-pull-weeks1-39-report.md):
--   * 69 "DRAFT — rewrite from the video transcript" placeholders in In today's world
--   * Adult wk1 + Teen wk1 videos flagged TO BE REPLACED (wrong videos, pulled as-is)
--   * 64 missing callback lines (weeks 18-39 mostly) — left blank, never invented
--   * Shared core concept drift: wk34 adult callout line missing, wk36 teen missing,
--     wk37 adult version 26 chars longer than teen/child
--   * Adult wk30 core concept uses forbidden vocabulary ("journey" x2)
--   * Weeks 33-39 still carry OPEN fidelity tags in Notion (retired per spec; tags are
--     Notion-side metadata and are not stored in the app)

-- Week 1 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw1_theme$$cw1_theme$,
  the_territory        = $cw1_terr$Noticing what's going on inside you when everything is noisy$cw1_terr$,
  opening_question     = $cw1_oq$What is one thing that has taken up more of your attention this week than you intended? Passing is full participation.$cw1_oq$,
  week_type            = $cw1_wt$Movement opener$cw1_wt$,
  reflective_question  = $cw1_rq$Looking across this week, what repeatedly won your attention — and what would you like to make easier to notice or protect next week?$cw1_rq$,
  interactive_activity = $cw1_ia$SIGNAL AUDIT — 24 HOURS. Draw a line down the middle of a page. On the left, list inputs that reached you yesterday: notifications, conversations, feeds, news, somebody's mood, a comment that stuck. On the right, write the likely origin: you, another person, an algorithm, a habit, a memory, or "not sure".
Circle the three that took up the most room in your attention. Then choose one you would be comfortable discussing. Sharing is optional; listening or keeping the page private is full participation.$cw1_ia$,
  kids_picture_book    = $cw1_bk$The Quiet Book$cw1_bk$,
  kids_picture_book_author = $cw1_bka$Deborah Underwood$cw1_bka$,
  kids_picture_book_note = $cw1_bkn$WHY THIS BOOK: It gives children lots of concrete examples of "quiet" and invites noticing without telling them what they should feel.
READ-ALOUD: Read live from a purchased copy.$cw1_bkn$,
  kids_picture_book_question = $cw1_bkq$What kind of quiet do you like best? You can answer, point to a picture or pass.$cw1_bkq$,
  kids_nz_alternative = $cw1_nz$Titiro Look$cw1_nz$,
  kids_nz_alternative_author = $cw1_nza$Gavin Bishop (Tainui, Ngāti Awa)$cw1_nza$,
  kids_nz_alternative_note = $cw1_nzn$Use it as a noticing exercise: look closely at what is already in front of you before deciding what it means.$cw1_nzn$,
  kids_colouring_prompt = $cw1_col$Colour a lighthouse shining through wind and waves. Add one small signal somewhere in the picture — a tummy rumble, tired eyes, hot cheeks, wiggly legs or your own idea.$cw1_col$,
  kids_game = $cw1_g$SIGNAL IN THE STATIC. The group makes safe, ordinary noise — humming, gentle chatter or shuffling. Hide a beeping timer or shaker somewhere visible and safe. Gradually lower the noise until the group can hear and locate it. Repeat once.
Frame it simply: the signal did not become stronger; we made enough room to notice it. Children may watch instead of joining the noise.$cw1_g$,
  kids_game_equipment = $cw1_ge$Kitchen timer or shaker; safe place to set or hide it.$cw1_ge$,
  kids_game_under5 = $cw1_g5$Hide it in plain sight. Use only three levels: loud, whisper, quiet. Let children move and point rather than wait in silence.$cw1_g5$,
  updated_at = now()
WHERE week_number = 1;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s1a_st$What Are You Actually Receiving?$s1a_st$,
  theme_title            = $s1a_tt$$s1a_tt$,
  phase                  = 1,
  phase_name             = $s1a_pn$See Clearly$s1a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s1a_hk$Ask people to write a number from 1–10 privately: How much of yesterday felt chosen, and how much felt reactive? No show of hands and no explanation required. Then ask: What tends to grab your attention before you have decided it deserves it?$s1a_hk$,
  s5_source_core_concept = $s1a_cc$Today the adult room works with attention as a limited resource. We are not trying to discover a perfectly pure "inner signal". We are practising three moves: notice what has captured us, locate where it came from as best we can, then decide whether it deserves more attention.$s1a_cc$,
  core_concept           = $s1a_cco$$s1a_cco$,
  teaching_points        = $s1a_tp$1. Attention is selective. You cannot process every input equally, so some things become foreground and others background. The useful skill is not perfect control; it is noticing what has captured you.
2. Roughly 95% of people believe they are self-aware while only 10–15% meet the criteria. Treat those as a well-supported estimate rather than a measurement of anyone in this room — the point is not the number, it's that nearly everyone starts out overconfident, including us.
3. Social influence is normal. Other people's moods, expectations, language and repeated messages can shape what feels familiar or important. Influence does not make a thought false; it makes its origin worth checking.
4. Mindcast is a personal-development programme, not therapy. We practise observation, language and choice; we do not diagnose thoughts, feelings or people.
5. One useful move is to ask what before why. "What happened just before I reacted?" usually gives you something observable to work with. "Why am I like this?" can turn quickly into a story about your character.$s1a_tp$,
  video_link             = $s1a_vl$https://www.youtube.com/watch?v=kJ_Gg5DPCQU$s1a_vl$,
  video_description      = $s1a_vd$TO BE REPLACED — this slot currently points at an Emotional Labour video, which belongs to Week 19, not Week 1. Choose a clip on attention, information overload or self-awareness. Suggested search: 'Tasha Eurich self-awareness' or 'Ethan Kross chatter attention'. Runtime target ~10–15 min.$s1a_vd$,
  todays_theme           = $s1a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Most of us live with more incoming information than we deliberately choose. The practical question is not how to eliminate noise, but how to notice what has captured attention before it starts running the day.$s1a_tdt$,
  todays_world_vo_script = $s1a_tdv$Your attention can be occupied before you have consciously decided what matters. Week 1 is about noticing that moment.$s1a_tdv$,
  ancient_wisdom_reframe = $s1a_aw$Before satellite navigation, navigators repeatedly checked stars, landmarks and bearings because drift is hard to notice from inside the boat. The useful analogy is not that an inner voice is always right. It is that when inputs are noisy, you need to check your heading against something you have deliberately chosen: your values and the facts in front of you.$s1a_aw$,
  ancient_wisdom_vo_script = $s1a_awv$When the sea gave you no obvious road, you checked a reference point. The practice was not certainty; it was checking your heading.$s1a_awv$,
  signal_metaphor        = $s1a_sm$Your attention is like a browser with too many tabs making noise at once. The aim is not to delete every tab. It is to notice which one you are actually using and which ones opened themselves.$s1a_sm$,
  private_write_prompt   = $s1a_pw$What reached you yesterday that you never deliberately chose to give attention to?$s1a_pw$,
  experiential_exercise  = $s1a_ex$SIGNAL AUDIT — 24 HOURS. Draw a line down the middle of a page. On the left, list inputs that reached you yesterday: notifications, conversations, feeds, news, somebody's mood, a comment that stuck. On the right, write the likely origin: you, another person, an algorithm, a habit, a memory, or "not sure".
Circle the three that took up the most room in your attention. Then choose one you would be comfortable discussing. Sharing is optional; listening or keeping the page private is full participation.$s1a_ex$,
  guided_reflection      = $s1a_gr$Keep your eyes open and look at your page. Pick one input you circled.
Ask three questions: What happened? Where did this input come from? What did I do next?
Do not decide whether the input was good, bad, "really you" or "not you". Just separate the observable sequence from the story about it.
Now write one final line: What deserves more of my attention than this did? If nothing comes, leave it blank.$s1a_gr$,
  journaling_prompt      = $s1a_jp$Looking across this week, what repeatedly won your attention — and what would you like to make easier to notice or protect next week?$s1a_jp$,
  intention_prompt       = $s1a_ip$Write one small if-then plan for the next seven days: When I notice [a specific cue] capturing my attention, I will [take one small action]. Keep the action small enough to do on a bad day.$s1a_ip$,
  core_affirmation       = $s1a_ca$I can notice what is reaching me and choose what deserves my attention.$s1a_ca$,
  weekly_practice_mon    = $s1a_pm$Catch one input. Once today, notice something that arrived before you chose it — a notification, someone's mood, a comment that stuck. Write down where it came from, or write "not sure".$s1a_pm$,
  weekly_practice_wed    = $s1a_pw2$Ask what, not why. Next time you react to something, ask yourself "what happened just before that?" Write one observable answer before you add an explanation.$s1a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s1a_ps$Find the quiet channel. Before you come back, take five minutes with no input at all — no phone, no music, no list. Notice what is still there underneath and bring one sentence about it, if you want to.$s1a_ps$,
  previous_week_callback = $s1a_pwc$$s1a_pwc$,
  facilitator_notes      = $s1a_fn$## Aim
Introduce notice → locate the source → choose without asking people to reveal private material or treating the facilitator as the authority on what is "really theirs".
## Run the room
Keep Week 1 light, specific and observable. Do not reward one answer more warmly than another. Do not interpret someone's list for them. Never tell a member that a thought is "not really yours". If silence follows a question, leave it alone for seven seconds. Passing, writing privately and listening all count as participation.
## Why this week exists — the evidence
Self-observation feels easier than it is. Eurich's work on self-awareness found a substantial gap between people's confidence in their self-awareness and performance against external criteria. The headline estimate — roughly 95% believing they are self-aware while only 10–15% meet the study criteria — is useful as a reminder of overconfidence, not as a diagnostic score for anyone in the room.
The strongest behavioural mechanism used today is simpler: make the sequence observable. Gollwitzer and Sheeran's meta-analysis of 94 tests found that specific if-then plans improved follow-through compared with intention alone. That is why the session ends with a cue and a small action rather than a general promise to "be more aware".
Real-world anchor: the popular "21 days to form a habit" claim traces back to Maxwell Maltz's 1960 observation about post-surgical adjustment, not a habit experiment. When habit formation was measured directly by Lally and colleagues, the median time to near-automaticity was 66 days, with wide variation, and one missed opportunity did not reset the process. Week 1 uses that story because it demonstrates the method: repetition can make an unsupported claim feel like knowledge.
## Evidence quality
Moderate overall. Implementation-intention and habit-formation findings are strong enough to use operationally. The self-awareness-gap estimate is useful but depends on how self-awareness is defined and measured. The navigation metaphor is illustrative only.
## We deliberately do not claim
- We do not claim that an internal feeling or thought is true simply because it feels like "your signal".
- We do not claim that a facilitator can tell you which thoughts are authentically yours.
- We do not claim that more information automatically causes anxiety or disconnection.
- We do not teach a 21-day habit rule, learning styles, left/right-brain personality types, power posing, ego depletion, decision fatigue or the 7-38-55 rule.
- We do not claim that one week of noticing changes personality or mental health.
## Source trail
- Eurich, T. (2018). What Self-Awareness Really Is (and How to Cultivate It). Harvard Business Review.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes. Advances in Experimental Social Psychology, 38, 69–119.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.
- Maltz, M. (1960). Psycho-Cybernetics. Included as the documented origin of the popular 21-day claim, not as habit research.$s1a_fn$,
  updated_at = now()
WHERE week_number = 1 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s1t_st$Who's Actually Talking?$s1t_st$,
  theme_title            = $s1t_tt$$s1t_tt$,
  phase                  = 1,
  phase_name             = $s1t_pn$See Clearly$s1t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s1t_hk$Offer this as an optional show of hands: Who has ever agreed, laughed, posted or stayed quiet because of who was in the room, then later thought, "that wasn't really what I wanted"? Nobody has to respond.$s1t_hk$,
  s5_source_core_concept = $s1t_cc$Today the teen room looks at how influence becomes familiar. The goal is not to reject what came from other people. It is to notice where an opinion, label or expectation may have come from, then decide whether it still fits what you know and value now.$s1t_cc$,
  core_concept           = $s1t_cco$$s1t_cco$,
  teaching_points        = $s1t_tp$1. Social influence is normal. People pick up language, moods, opinions, jokes and expectations from the people and media around them. Being influenced does not mean you are weak; it means you are human.
2. Repetition can make an idea feel familiar without making it true. That is why "everyone says it" and "I keep seeing it" are reasons to check a claim, not reasons to accept it.
3. Self-awareness is not the ability to produce the perfect explanation for yourself. It is the ability to notice what happened, name what you can actually observe, and stay open to being wrong.
4. You do not have to reject something just because you learned it from somebody else. A belief can be inherited and still fit your values. The point is to examine it, not automatically rebel against it.
5. A useful move is to ask what before why. "What happened right before I felt that?" gives you something concrete. "Why am I like this?" can become a story about your whole identity.$s1t_tp$,
  video_link             = $s1t_vl$https://www.youtube.com/watch?v=Thlbqg2sKEM$s1t_vl$,
  video_description      = $s1t_vd$TO BE REPLACED — this slot points at '7 Hard Truths for Teens', which is the source of the "nobody is coming to save you" framing removed from this session for safeguarding reasons. Do not use it. Choose a clip on self-awareness, social influence or absorbed beliefs. Runtime target ~8–12 min.$s1t_vd$,
  todays_theme           = $s1t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Opinions, trends and expectations can arrive through friends, family, school, feeds and group chats before you have consciously decided what you think about them. Week 1 is about noticing that process without treating influence as a failure.$s1t_tdt$,
  todays_world_vo_script = $s1t_tdv$Seeing something everywhere can make it feel obvious. Familiar is not the same as true, and influenced is not the same as fake.$s1t_tdv$,
  ancient_wisdom_reframe = $s1t_aw$Navigators did not assume the direction they were already travelling was correct. They checked a reference point. That is the useful idea here: not "trust every inner voice", but check your heading before you keep going.$s1t_aw$,
  ancient_wisdom_vo_script = $s1t_awv$A direction can feel normal simply because you have been moving that way for a while. Checking the heading is what gives you a choice.$s1t_awv$,
  signal_metaphor        = $s1t_sm$Your phone can have a dozen apps asking for attention at once. Your head can feel similar. The skill is noticing which one you chose to open and which one started making noise on its own.$s1t_sm$,
  private_write_prompt   = $s1t_pw$Write one belief, label or expectation you have heard often enough that it feels familiar. You do not need to decide whether it is true yet, and nobody else will see what you write unless you choose to show them.$s1t_pw$,
  experiential_exercise  = $s1t_ex$MINE / NOT MINE. Take two minutes and list, fast and without editing, ten things you believe about yourself. They can be small: I'm bad at maths. I'm the funny one. I'm not a morning person. I'm too much.
Mark each one: M if you remember deciding it for yourself, T if somebody told you, ? if you honestly cannot tell. These marks describe origin, not truth.
Circle one T or ?. Ask: Where did this come from? How old was I when I first remember hearing it? Does it still fit what I know now? Sharing is optional. Keeping your list private is full participation.$s1t_ex$,
  guided_reflection      = $s1t_gr$Keep your eyes open. Think of one small moment when who was around you affected what you said, liked, laughed at or stayed quiet about.
Write only what you can observe: What happened? Who was there? What did I do? What did I actually think or want, if I can tell?
If you cannot tell, write not sure. That is a complete answer. The point is not to discover a hidden "real you" in five minutes. It is to notice influence clearly enough that you have more choice next time.$s1t_gr$,
  journaling_prompt      = $s1t_jp$Across this week, where did you notice yourself adapting to other people — and which of those choices still felt like choices you were comfortable making?$s1t_jp$,
  intention_prompt       = $s1t_ip$Write one small if-then plan: When I notice [specific pressure or cue], I will [small action that gives me a moment to choose].$s1t_ip$,
  core_affirmation       = $s1t_ca$I can notice what I picked up from other people and decide what still fits me.$s1t_ca$,
  weekly_practice_mon    = $s1t_pm$Catch one absorbed thing. Once today, notice an opinion or reaction that came out quickly and ask: mine, picked up, or not sure? You do not need to change it.$s1t_pm$,
  weekly_practice_wed    = $s1t_pw2$Ask what, not why. Next time something gets to you, ask "what happened right before I felt that?" Write one observable answer before you explain it.$s1t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s1t_ps$Bring back one T. Pick one belief from your MINE / NOT MINE list that someone else gave you. Work out roughly how old you were when you first remember getting it, and whether it still fits. Bring it back only if you want to.$s1t_ps$,
  previous_week_callback = $s1t_pwc$$s1t_pwc$,
  facilitator_notes      = $s1t_fn$## Aim
Teach notice → locate the source → choose without encouraging secrecy, rebellion or disclosure. A teen who examines an inherited belief and decides to keep it has completed the exercise properly.
## Run the room
Do not ask what is on anyone's MINE / NOT MINE list. Do not praise "independent" answers more than family- or community-aligned answers. Code-switching, adapting to context and valuing whānau expectations are not evidence that a young person is being fake. Ask whether something feels chosen, forced or uncertain, and accept all three.
Safeguarding — VERBATIM: Nothing in this session means keeping things from parents, caregivers or trusted adults. If anyone uses language about "finding the real you" or "thinking for yourself" to pressure a young person into secrecy — including someone connected with Mindcast — the correct response is to tell a trusted adult. If a young person indicates they may be unsafe, stop exploring the lesson content and follow MC-SAF-001.
## Why this week exists — the evidence
Social influence is well established as a human phenomenon; the session does not need a speculative brain mechanism to explain it. In particular, do not attribute absorbed beliefs or moods to "mirror neurons".
Eurich's work on self-awareness supports the narrower idea that confidence in knowing ourselves can exceed accuracy. We use that as a reason for curiosity, not as a score for teenagers.
Gollwitzer and Sheeran's meta-analysis of 94 tests found that specific if-then plans improved follow-through compared with intention alone. That is why the session ends with one cue and one small response rather than "be more yourself".
Real-world anchor: the "21 days to build a habit" claim began with Maxwell Maltz's observation about post-surgical adjustment and was repeated for decades as though it were habit science. Lally and colleagues later measured habit formation directly and found a median of 66 days with wide variation; missing one opportunity did not reset the process. The example demonstrates the week's method: repeated is not the same as verified.
## Evidence quality
Moderate overall. Social influence and implementation-intention findings are well supported. The exact self-awareness-gap estimate depends on definitions and is not a teen-specific finding. The MINE / NOT MINE exercise is a teaching tool, not a validated diagnostic instrument.
## We deliberately do not claim
- We do not claim that mirror neurons transmit moods, beliefs or identity.
- We do not claim that an algorithm "knows you better than you know yourself".
- We do not claim that something learned from family, culture or whānau is automatically a belief to discard.
- We do not claim that code-switching is fake or unhealthy.
- We do not claim that independence from caregivers is the goal of this session.
- We do not teach the 21-day habit rule, decision fatigue or any other banned neuroscience or self-development myth.
## Source trail
- Eurich, T. (2018). What Self-Awareness Really Is (and How to Cultivate It). Harvard Business Review.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes. Advances in Experimental Social Psychology, 38, 69–119.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.
- Maltz, M. (1960). Psycho-Cybernetics. Included only as the documented origin of the popular 21-day claim, not as habit research.$s1t_fn$,
  updated_at = now()
WHERE week_number = 1 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s1c_st$Finding Your Station$s1c_st$,
  theme_title            = $s1c_tt$$s1c_tt$,
  phase                  = 1,
  phase_name             = $s1c_pn$See Clearly$s1c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s1c_hk$Invite children to notice their body right now without changing it: quiet, wiggly, warm, cold, hungry, tight, loose, something else? They can point, draw, say a word or pass.$s1c_hk$,
  s5_source_core_concept = $s1c_cc$Today the child room practises noticing one concrete signal at a time. We do not have to decide exactly what a tummy, face, heart or pair of wiggly legs means. We notice it, name what we can, and choose whether to keep noticing, take a break or ask a trusted grown-up for help.$s1c_cc$,
  core_concept           = $s1c_cco$$s1c_cco$,
  teaching_points        = $s1c_tp$1. Bodies give us information: hungry, thirsty, tired, warm, cold, fast heart, tight tummy, wiggly legs and lots of other signals.
2. A body signal is information, not an instruction. A fast heart can happen because you are excited, scared, running, surprised or something else. We do not have to guess perfectly.
3. Feelings can be named in more than one way. If a grown-up guesses a feeling and the child says "no", the child is allowed to correct the guess.
4. We do not need to make a feeling disappear before we can notice it. First we notice; then we decide whether we need a pause, movement, water, comfort, space or help from a trusted grown-up.
5. Nobody has to explain a private feeling or thought to the group. Drawing privately, watching and passing all count as taking part.$s1c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s1c_sm$A lighthouse does not stop a storm. The wind can be loud, the waves can be big and the light can still give you one steady thing to notice. Your body has signals too — a tummy rumble, tired eyes, hot cheeks or wiggly legs. Today we practise noticing one signal at a time, without pretending it tells us the whole story.$s1c_sm$,
  private_write_prompt   = $s1c_pw$Draw one body signal you notice right now. It can be a colour, shape, scribble or picture. If you want, tell a partner or facilitator what you noticed. You do not have to show or tell anyone; keeping it private is full participation.$s1c_pw$,
  experiential_exercise  = $s1c_ex$BODY DETECTIVE. Rub your hands together for about 15 seconds. Ask: What changed — warm, tingly, sweaty, something else? Then, if movement is comfortable, do ten gentle jumps or marches and notice what changes. Children who do not want to jump can squeeze and release their hands instead.
Do not interpret a child's signal for them. The aim is noticing, not guessing the cause.
DRAW IT
Draw two pictures: my body when it feels settled and my body when it wants my attention. Add one thing you could try when your body wants your attention — a pause, movement, quiet, comfort or asking a trusted grown-up. You can leave any part blank if you are not sure.$s1c_ex$,
  guided_reflection      = $s1c_gr$Keep your eyes open or look down at your drawing.
Notice one place in your body: hands, tummy, face, legs or chest. You do not need to change it.
Ask yourself: What do I notice? Warm? Cold? Tight? Loose? Wiggly? Quiet? Something else?
If you do not know, I don't know is a good answer. You do not have to decide what the signal means.$s1c_gr$,
  journaling_prompt      = $s1c_jp$Draw two pictures: my body when it feels settled and my body when it wants my attention. Add one thing you could try when your body wants your attention — a pause, movement, quiet, comfort or asking a trusted grown-up. You can leave any part blank if you are not sure.$s1c_jp$,
  intention_prompt       = $s1c_ip$Choose one small plan: When I notice [a body signal], I will [name it, pause, move, or tell a trusted grown-up].$s1c_ip$,
  core_affirmation       = $s1c_ca$I can notice my body's signals without having to know exactly what they mean.$s1c_ca$,
  weekly_practice_mon    = $s1c_pm$Be a body detective. Notice one signal — hungry, wiggly, warm, tired, tight, loose or something else. Name it or show a trusted grown-up if you want to.$s1c_pm$,
  weekly_practice_wed    = $s1c_pw2$Try one reset when a feeling gets big: slow breathing, a stretch, a drink of water, quiet space or asking a trusted grown-up for help. Notice whether anything changes; it is okay if nothing does.$s1c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s1c_ps$Give yourself a butterfly hug if you like — wrap your arms around yourself and squeeze gently. Notice what your body says back, then tell a trusted grown-up only if you want to.$s1c_ps$,
  previous_week_callback = $s1c_pwc$$s1c_pwc$,
  facilitator_notes      = $s1c_fn$## Aim
Build a simple noticing vocabulary through movement, drawing and concrete body signals. The goal is observation, not emotional disclosure, diagnosis or calming every child down.
## Run the room
Keep reflection short, especially for younger children. Offer words as guesses, never labels: "Could that be frustrated?" rather than "You are frustrated." Accept correction immediately. Never ask a child to explain a private thought, name who caused a feeling, or disclose something in front of the group. Do not share your own vulnerable story; use only ordinary scripted examples.
If a child says something that suggests they may be unsafe, do not investigate in the room. Follow MC-SAF-001.
## Why this week exists — the evidence
The curriculum uses body noticing as the child-track translation of Week 1 because body sensations are concrete and observable. This is a teaching design choice, not a claim that every child can accurately identify the cause of a sensation or regulate emotion by noticing it.
Lieberman and colleagues' affect-labelling study supports the narrower principle that putting emotional experience into words can measurably change the response to it. We do not turn that laboratory finding into a promise that naming a feeling will calm every child.
Real-world anchor: the "21 days to build a habit" story is useful for facilitators even though it is not taught to the children. Maxwell Maltz described post-surgical adjustment; the claim was later repeated as habit science. Lally and colleagues measured habit formation directly and found a median of 66 days with wide variation. The lesson for the adult leading the room is the same as the lesson for the children: notice what is actually there before repeating a story about it.
## Evidence quality
Moderate overall. Affect-labelling has experimental support, but the study is not a child-specific treatment trial. The use of body signals, drawings and movement is an age-matched teaching method rather than a clinical intervention. The lighthouse is illustrative only.
## We deliberately do not claim
- We do not claim that body sensations always reveal the correct cause or tell a child what to do.
- We do not claim that every big feeling should be calmed down.
- We do not claim that naming a feeling works every time.
- We do not tell children that a private feeling must be shared with the group.
- We do not diagnose anxiety, trauma, sensory conditions or any other clinical issue from a child's behaviour or body signals.
- We do not teach the 21-day habit rule, learning styles, left/right-brain personality types, power posing, ego depletion or decision fatigue.
## Source trail
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words: Affect Labeling Disrupts Amygdala Activity in Response to Affective Stimuli. Psychological Science, 18(5), 421–428.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.
- Maltz, M. (1960). Psycho-Cybernetics. Included only as the documented origin of the popular 21-day claim, not as habit research.$s1c_fn$,
  updated_at = now()
WHERE week_number = 1 AND audience = 'Child';

-- Week 2 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw2_theme$$cw2_theme$,
  the_territory        = $cw2_terr$The things people say about you, and whether they're true$cw2_terr$,
  opening_question     = $cw2_oq$What is one description of you that other people have repeated over the years? You can answer generally or pass.$cw2_oq$,
  week_type            = $cw2_wt$Standard$cw2_wt$,
  reflective_question  = $cw2_rq$Across the week, notice when this story becomes active. What situations seem to trigger it, and what evidence do you notice when you deliberately look for both confirming and disconfirming examples?$cw2_rq$,
  interactive_activity = $cw2_ia$STORY AUDIT. Write three recurring self-descriptions. For each one, note: Where did I first hear or infer this? What experiences seem to support it? What experiences do not fit it? Circle the least threatening one. If you want to discuss it with another person, share only the process you used; keeping the content private is full participation.$cw2_ia$,
  kids_picture_book    = $cw2_bk$Chrysanthemum$cw2_bk$,
  kids_picture_book_author = $cw2_bka$Kevin Henkes$cw2_bka$,
  kids_picture_book_note = $cw2_bkn$WHY THIS BOOK: It shows how repeated comments from other people can affect how a child feels about part of themselves without making those comments the whole truth.
READ-ALOUD: Read live from a purchased copy.$cw2_bkn$,
  kids_picture_book_question = $cw2_bkq$What did Chrysanthemum start believing after hearing the same comments again and again? What else was still true about her?$cw2_bkq$,
  kids_nz_alternative = $cw2_nz$Not yet selected$cw2_nz$,
  kids_nz_alternative_author = $cw2_nza$use the main book until an Aotearoa title has been reviewed for this exact theme.$cw2_nza$,
  kids_nz_alternative_note = $cw2_nzn$Do not substitute a book simply because it is locally authored; the story needs to support labels, identity and the idea that one description is never the whole child.$cw2_nzn$,
  kids_colouring_prompt = $cw2_col$Colour a backpack with three removable-looking cards on it. On one blank card, draw a symbol for something good, interesting or important about you that one label might miss.$cw2_col$,
  kids_game = $cw2_g$MORE THAN ONE CARD. Place a stack of neutral action cards face down: likes drawing, helps tidy, sometimes quiet, asks questions, likes running, needs time, makes people laugh. Draw three cards and ask whether those three could ever tell the whole story of one person. Add and remove cards to show that people change across situations. Nobody wears a label and nobody is instructed to treat another child according to one.$cw2_g$,
  kids_game_equipment = $cw2_ge$Paper backpack sheets; pencils/crayons; neutral action cards.$cw2_ge$,
  kids_game_under5 = $cw2_g5$Use picture cards instead of words. Ask only: Is this the whole person or just one thing about them?$cw2_g5$,
  updated_at = now()
WHERE week_number = 2;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s2a_st$Reading the Code You Were Given$s2a_st$,
  theme_title            = $s2a_tt$$s2a_tt$,
  phase                  = 1,
  phase_name             = $s2a_pn$See Clearly$s2a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s2a_hk$Complete this sentence privately and quickly: People like me don't… Then ask yourself: Where might that sentence have come from? No sharing required.$s2a_hk$,
  s5_source_core_concept = $s2a_cc$Today the adult room treats self-stories as interpretations rather than verdicts. We are not trying to replace every difficult belief with a positive one. We are practising three moves: name the story, locate where it may have come from, and ask what evidence supports or challenges it now.$s2a_cc$,
  core_concept           = $s2a_cco$$s2a_cco$,
  teaching_points        = $s2a_tp$1. Psychology uses terms such as core beliefs and schemas for relatively stable assumptions that shape how we interpret ourselves, other people and events. They can form early, but they are not fixed at a particular age and they can change across life.
2. A self-story is not the same thing as a fact. It is an interpretation built from selected experiences, repeated messages and later evidence.
3. Existing beliefs can influence what we notice. If a story says I'm bad at this, failures may stand out more than counterexamples. That does not mean every belief is false; it means the belief is worth examining rather than treating as a neutral recording.
4. Seeing a story does not automatically dissolve it. The useful first step is simpler: get enough distance to describe it, its likely origin and what it currently does.
5. Examining an inherited story does not require rejecting family, culture or whānau. If you look at a story carefully and choose to keep it, that is still a completed piece of work.$s2a_tp$,
  video_link             = $s2a_vl$https://www.youtube.com/watch?v=D9Ihs241zeg$s2a_vl$,
  video_description      = $s2a_vd$Current assignment: Brené Brown, The Power of Vulnerability. Keep the assignment under review because Brown is a writer and speaker synthesising research, not the source of every finding discussed in the talk. Runtime ~20 min.$s2a_vd$,
  todays_theme           = $s2a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Labels arrive quickly in ordinary life: the reliable one, the difficult one, the clever one, the person who is bad with money, relationships or change. Repetition can make a description feel settled long before anyone checks it.$s2a_tdt$,
  todays_world_vo_script = $s2a_tdv$A description can become familiar without becoming complete. Week 2 is about making one story visible enough to examine.$s2a_tdv$,
  ancient_wisdom_reframe = $s2a_aw$Many traditions use stories to organise identity and belonging. The useful lesson here is not that inherited stories are cages. It is that a story can be respected and still examined: Where did this come from? What does it protect or make possible? Does it still fit?$s2a_aw$,
  ancient_wisdom_vo_script = $s2a_awv$A story can carry history and meaning without being the only possible description of you.$s2a_awv$,
  signal_metaphor        = $s2a_sm$A self-story is like a background process on a device: usually quiet, often useful, sometimes using resources without you noticing. Today we open one process and see what it is actually doing.$s2a_sm$,
  private_write_prompt   = $s2a_pw$Write one ordinary sentence you seem to operate from about yourself — something like I'm the kind of person who… or I've always been someone who… Keep it specific enough to examine in ninety seconds.$s2a_pw$,
  experiential_exercise  = $s2a_ex$STORY AUDIT. Write three recurring self-descriptions. For each one, note: Where did I first hear or infer this? What experiences seem to support it? What experiences do not fit it? Circle the least threatening one. If you want to discuss it with another person, share only the process you used; keeping the content private is full participation.$s2a_ex$,
  guided_reflection      = $s2a_gr$Keep your eyes open and look at the story you circled.
Write three short lines:
The story says:
I first remember it becoming familiar when:
One thing it does not fully explain is:
Do not argue with the story or force a replacement. The task is to make the story more specific and less total.$s2a_gr$,
  journaling_prompt      = $s2a_jp$Across the week, notice when this story becomes active. What situations seem to trigger it, and what evidence do you notice when you deliberately look for both confirming and disconfirming examples?$s2a_jp$,
  intention_prompt       = $s2a_ip$Write one small if-then plan: When I notice this story making a decision for me, I will pause long enough to name one fact before I act.$s2a_ip$,
  core_affirmation       = $s2a_ca$I can examine a story about myself without treating it as the whole truth.$s2a_ca$,
  weekly_practice_mon    = $s2a_pm$Catch one moment where an old story seems to be making a decision for you. Name the story in one sentence.$s2a_pm$,
  weekly_practice_wed    = $s2a_pw2$Check the evidence. Write one example that fits the story and one example it does not fully explain.$s2a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s2a_ps$Bring one insight from the week about a story you noticed running — however small. Sharing the content is optional.$s2a_ps$,
  previous_week_callback = $s2a_pwc$find the quiet channel — five minutes with no input at all, and notice what was still there underneath$s2a_pwc$,
  facilitator_notes      = $s2a_fn$## Aim
Help members separate story, origin and evidence without turning the room into therapy, confession or peer interpretation.
## Run the room
Keep examples ordinary. Do not ask members to identify a childhood wound, diagnose a parent or explain why they became who they are. Do not debate someone else's belief or tell them a story is false. Sharing is optional and private writing counts fully. If material becomes clinically significant, referral is a successful boundary, not a failure.
## Why this week exists — the evidence
Cognitive models use concepts such as schemas and core beliefs to describe assumptions that influence interpretation. Narrative approaches likewise distinguish the person from the story being told about the person. Mindcast borrows the narrow, non-clinical move of making a belief observable and examinable; it is not delivering cognitive or narrative therapy.
Real-world anchor: growth mindset became one of the most repeated stories in modern education after early studies suggested that beliefs about intelligence affected persistence. A later meta-analysis of 129 studies found that mindset explained only a small amount of variation in achievement, with benefits concentrated more in some struggling students than others. The lesson is not that mindset is fake. It is that a compelling idea can become broader and stronger in public retelling than the evidence supports.
## Evidence quality
Moderate overall. The existence of schemas and the influence of prior beliefs on interpretation are well established. Narrative externalising is clinically derived and useful here as an illustrative teaching move, not evidence that this group exercise treats mental-health conditions. Growth-mindset effects are real but modest and context-dependent.
## We deliberately do not claim
- We do not claim beliefs are fixed by age seven.
- We do not claim every difficult self-story is false or inherited from somebody else.
- We do not claim noticing a story makes it disappear.
- We do not claim Mindcast is providing cognitive therapy or narrative therapy.
- We do not claim growth mindset produces large universal achievement gains.
- We do not use rewiring, brain-region explanations or other neuroscience garnish.
## Source trail
- Beck, A. T. — cognitive models of schemas and core beliefs; clinical source lineage only.
- White, M., & Epston, D. (1990). Narrative Means to Therapeutic Ends. Clinical source lineage only.
- Sisk, V. F., et al. (2018). To What Extent and Under Which Circumstances Are Growth Mind-Sets Important to Academic Achievement? Psychological Science.$s2a_fn$,
  updated_at = now()
WHERE week_number = 2 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s2t_st$The Playlist You Didn't Choose$s2t_st$,
  theme_title            = $s2t_tt$$s2t_tt$,
  phase                  = 1,
  phase_name             = $s2t_pn$See Clearly$s2t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s2t_hk$Finish this sentence silently: I'm just not the kind of person who… Notice how quickly an answer appears. You do not have to share it.$s2t_hk$,
  s5_source_core_concept = $s2t_cc$Today the teen room looks at one label or self-story as a hypothesis, not a verdict. The goal is not to reject what other people have said or become "independent" from whānau. It is to notice where a story came from, what evidence fits it, what evidence does not, and whether it still feels useful or accurate now.$s2t_cc$,
  core_concept           = $s2t_cco$$s2t_cco$,
  teaching_points        = $s2t_tp$1. People build mental shortcuts about themselves and the world. Psychology often calls these schemas: patterns that help organise experience but can also make some evidence stand out more than other evidence.
2. A label can come from family, school, culture, friends, social media or one memorable event. Its origin does not tell you whether it is true.
3. A belief can collect supporting examples because you are already looking through it. That is one reason to check both what fits and what does not.
4. You are not being asked to delete an inherited belief. If you examine it and decide it still fits your values, that is a complete answer.
5. Growth mindset is a useful example of why we check popular claims carefully: the idea has evidence behind it, but later large reviews found smaller and more context-dependent effects than the public story often suggests.$s2t_tp$,
  video_link             = $s2t_vl$https://www.youtube.com/watch?v=pN34FNbOKXc$s2t_vl$,
  video_description      = $s2t_vd$Current assignment: an explainer on growth mindset and Carol Dweck's work. Assignment retained pending video review. If used, do not present growth mindset as a large universal effect; the evidence is modest and context-dependent.$s2t_vd$,
  todays_theme           = $s2t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Labels travel fast through school, group chats, sport, family and feeds. Smart, lazy, awkward, dramatic, gifted, not sporty, the funny one — repetition can make a description feel like identity before anyone checks how complete it is.$s2t_tdt$,
  todays_world_vo_script = $s2t_tdv$Something being repeated about you can make it familiar. Familiar does not mean complete, and it does not mean false either. It means worth checking.$s2t_tdv$,
  ancient_wisdom_reframe = $s2t_aw$Use the image of a path you have walked many times. A familiar path is easy to follow because it has been used before. That does not make it the only path, and it does not make it a bad one. The skill is noticing that you are on it before assuming you have no choice.$s2t_aw$,
  ancient_wisdom_vo_script = $s2t_awv$A familiar path can feel automatic. Seeing the path is what lets you decide whether to keep walking it.$s2t_awv$,
  signal_metaphor        = $s2t_sm$A playlist can start automatically because you have played it so many times. A self-story can do the same. Today we listen closely to one track and decide whether it still belongs on repeat.$s2t_sm$,
  private_write_prompt   = $s2t_pw$Write one label, expectation or story about yourself that has become familiar through repetition. Nobody else needs to see it.$s2t_pw$,
  experiential_exercise  = $s2t_ex$TRACK LISTING. Write three self-stories you notice yourself using. For each one mark: where I first remember hearing or learning it; what seems to support it; one example it does not fully explain. Circle the least threatening one. Sharing is optional; describing the method without revealing the story is full participation.$s2t_ex$,
  guided_reflection      = $s2t_gr$Keep your eyes open and look at the story you circled.
Write four short answers:
Where did I first notice this story?
What makes it feel true?
What does it leave out?
Do I want to keep it, change it, or stay unsure for now?
There is no correct final answer. Not sure is complete.$s2t_gr$,
  journaling_prompt      = $s2t_jp$Over the next week, where do you notice this story affecting what you attempt, avoid, say or expect — and where do you find examples that do not fit it?$s2t_jp$,
  intention_prompt       = $s2t_ip$Write one if-then plan: When I notice this story making a choice for me, I will pause and name one observable fact before deciding what to do.$s2t_ip$,
  core_affirmation       = $s2t_ca$I can examine a story about myself without having to obey it or reject it.$s2t_ca$,
  weekly_practice_mon    = $s2t_pm$Notice one moment when a familiar story seems to make a choice before you have thought about it. Name the story privately.$s2t_pm$,
  weekly_practice_wed    = $s2t_pw2$Check both sides. Write one example that fits the story and one example it does not fully explain.$s2t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s2t_ps$Bring back one moment where you caught a story running and notice what happened when you saw it. Sharing the story itself is optional.$s2t_ps$,
  previous_week_callback = $s2t_pwc$pick one belief off your MINE / NOT MINE list that someone else gave you, and work out how old you were when you got it$s2t_pwc$,
  facilitator_notes      = $s2t_fn$## Aim
Teach story ≠ verdict while protecting cultural belonging, privacy and caregiver relationships.
## Run the room
Do not ask teens to identify a traumatic origin, disclose family material or "break" a belief. Do not reward rejection of family or culture as more authentic than choosing to retain an inherited value. Nobody has to share the content of their list. If a young person suggests they may be unsafe, stop exploring the lesson material and follow MC-SAF-001.
## Why this week exists — the evidence
Schemas are a standard cognitive concept describing patterns that organise interpretation. The practical teaching move is to make one story explicit enough to compare against evidence rather than letting it operate as an unquestioned verdict.
Real-world anchor: growth mindset spread widely through schools after early findings suggested that beliefs about intelligence affected persistence. Later meta-analytic work across 129 studies found much smaller overall associations with achievement than the public story often implied, with more benefit in some struggling students and contexts than others. That makes it a useful Week 2 example: a real finding can become a much bigger story through repetition.
## Evidence quality
Moderate overall. Schema-based interpretation is well established. The specific TRACK LISTING exercise is a teaching tool, not a validated assessment. Growth-mindset effects are modest and context-dependent rather than universal.
## We deliberately do not claim
- We do not claim your beliefs were fixed in early childhood.
- We do not claim something learned from family, culture or whānau should be discarded.
- We do not claim a story is false because somebody else gave it to you.
- We do not claim growth mindset has a large universal effect on achievement.
- We do not use rewiring, mirror-neuron explanations or other neuroscience garnish.
- We do not encourage secrecy from caregivers or trusted adults.
## Source trail
- Beck, A. T. — cognitive schema/core-belief source lineage; clinical context only.
- Sisk, V. F., et al. (2018). To What Extent and Under Which Circumstances Are Growth Mind-Sets Important to Academic Achievement? Psychological Science.$s2t_fn$,
  updated_at = now()
WHERE week_number = 2 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s2c_st$What's in Your Backpack?$s2c_st$,
  theme_title            = $s2c_tt$$s2c_tt$,
  phase                  = 1,
  phase_name             = $s2c_pn$See Clearly$s2c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s2c_hk$Hold up an empty backpack. Put in three cards with ordinary labels such as helpful, shy, fast. Ask: If these three cards were in the backpack, would they tell us everything about the person carrying it? Children can answer, point or pass.$s2c_hk$,
  s5_source_core_concept = $s2c_cc$Today the child room treats labels like things that can be carried in a backpack. A label might be kind, unkind, partly true or not true at all. We can notice where it came from and remember that one word or one story never tells everything about a person.$s2c_cc$,
  core_concept           = $s2c_cco$$s2c_cco$,
  teaching_points        = $s2c_tp$1. People say things about us, and we also say things about ourselves. Those words can become stories we carry.
2. A label can describe one moment or one part of us without describing everything.
3. A story being old or repeated does not automatically make it true, and somebody else saying it does not automatically make it false.
4. We are allowed to say I'm not sure about a label. We do not have to replace a tricky story with a big positive statement we do not believe.
5. Nobody has to tell the group a private or upsetting label. Drawing privately, choosing an ordinary example and passing all count as taking part.$s2c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s2c_sm$Imagine a backpack you have carried for a long time. People may have put cards into it with words about you. Some cards are useful, some are heavy, and some no longer fit. Today we look at one card without letting it decide the whole picture.$s2c_sm$,
  private_write_prompt   = $s2c_pw$Pick one safe, ordinary card from your backpack. Draw another picture that shows something the card leaves out. You may tell someone what you drew, or keep it private.$s2c_pw$,
  experiential_exercise  = $s2c_ex$BACKPACK ACTIVITY. Give each child a paper backpack outline. Inside, draw or write two ordinary things they sometimes think about themselves. Around the outside, draw or write where each idea may have come from: school, home, a friend, something that happened, me, not sure. Children choose their own level of privacy. Do not ask what a hard item says.
DRAW IT
Draw yourself doing something this week that your chosen label does not fully explain. It can be tiny: trying, helping, resting, asking, learning, changing your mind or doing something in your own way.$s2c_ex$,
  guided_reflection      = $s2c_gr$Keep your eyes open and look at your backpack page.
Point to one card or idea.
Ask yourself: Where did I get this? Does it tell the whole story about me? What is one thing it leaves out?
If you do not know, I don't know is a good answer. You do not have to take any card out today.$s2c_gr$,
  journaling_prompt      = $s2c_jp$Draw yourself doing something this week that your chosen label does not fully explain. It can be tiny: trying, helping, resting, asking, learning, changing your mind or doing something in your own way.$s2c_jp$,
  intention_prompt       = $s2c_ip$Choose one small plan: When I hear a label about me this week, I will remember one other thing that is also true.$s2c_ip$,
  core_affirmation       = $s2c_ca$One story about me is never the whole story.$s2c_ca$,
  weekly_practice_mon    = $s2c_pm$Notice one kind or useful thing about yourself. Draw it or tell a trusted grown-up if you want to.$s2c_pm$,
  weekly_practice_wed    = $s2c_pw2$Notice one label you hear about yourself. Ask quietly: Is that the whole story? You do not have to answer out loud.$s2c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s2c_ps$Bring your backpack drawing back and choose one thing from it to share only if you want to. Keeping it private is okay.$s2c_ps$,
  previous_week_callback = $s2c_pwc$give yourself a butterfly hug if you like, notice what your body says back, and tell a trusted grown-up only if you want to$s2c_pwc$,
  facilitator_notes      = $s2c_fn$## Aim
Externalise labels without creating new ones, encouraging disclosure or positioning the facilitator as the person who removes a child's burden.
## Run the room
Never ask a child to reveal a painful label or identify who said it. Do not use the previous Label Tag activity; children must not be instructed to treat one another according to labels. Keep examples ordinary and reversible. If a child discloses something suggesting harm, do not investigate in the room; follow MC-SAF-001.
## Why this week exists — the evidence
Externalising a problem or story — putting it on paper rather than treating it as the child's identity — has a clear lineage in narrative approaches. Mindcast uses that narrow teaching move without delivering narrative therapy.
Real-world anchor: growth mindset is a useful example for the adult facilitator. Early studies about beliefs and persistence became a much larger public story about what mindset could achieve. Later meta-analytic work across 129 studies found smaller and more context-dependent effects. The point for Week 2 is simple: repeated ideas can become bigger than the evidence, so children are taught to hold labels lightly rather than replace them with another absolute label.
## Evidence quality
Moderate overall. Externalising is clinically derived and developmentally useful as a teaching device, but this specific backpack activity is not a validated treatment. Growth-mindset evidence is modest and context-dependent. The backpack metaphor is illustrative only.
## We deliberately do not claim
- We do not claim that a label is false because another person said it.
- We do not claim children should reject family or caregiver descriptions.
- We do not claim a child can simply remove a painful belief by imagining it leaving a backpack.
- We do not ask children to disclose secrets, upsetting labels or who caused them.
- We do not use rewiring, brain-region explanations or other neuroscience garnish.
## Source trail
- White, M., & Epston, D. (1990). Narrative Means to Therapeutic Ends. Clinical source lineage only.
- Sisk, V. F., et al. (2018). To What Extent and Under Which Circumstances Are Growth Mind-Sets Important to Academic Achievement? Psychological Science.$s2c_fn$,
  updated_at = now()
WHERE week_number = 2 AND audience = 'Child';

-- Week 3 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw3_theme$$cw3_theme$,
  the_territory        = $cw3_terr$The little gap between feeling something and doing something$cw3_terr$,
  opening_question     = $cw3_oq$Where in daily life do you most notice yourself reacting before you have really chosen a response? You can answer generally or pass.$cw3_oq$,
  week_type            = $cw3_wt$Standard$cw3_wt$,
  reflective_question  = $cw3_rq$Across the week, which cues did you notice earliest, which did you notice only afterwards, and what changed when you named the cue without trying to fix the whole pattern?$cw3_rq$,
  interactive_activity = $cw3_ia$TRIGGER MAP. Trace one sequence: What was the cue? What did I do? What did the reaction give me immediately? What did it cost later? Then choose the smallest possible interrupt: one breath, putting the phone down, naming the feeling, asking for ten seconds, or another safe action. Sharing the cue is optional; keeping the map private is full participation.$cw3_ia$,
  kids_picture_book    = $cw3_bk$When Sophie Gets Angry$cw3_bk$,
  kids_picture_book_author = $cw3_bka$Really, Really Angry — Molly Bang$cw3_bka$,
  kids_picture_book_note = $cw3_bkn$WHY THIS BOOK: Sophie has a big feeling and takes time and space before deciding what to do next.
READ-ALOUD: Read live from a purchased copy.$cw3_bkn$,
  kids_picture_book_question = $cw3_bkq$What did Sophie do before she went back? Did the feeling disappear straight away, or did she give herself time?$cw3_bkq$,
  kids_nz_alternative = $cw3_nz$Finding My Calm$cw3_nz$,
  kids_nz_alternative_author = $cw3_nza$Rebekah Lipp & Craig Phillips$cw3_nza$,
  kids_nz_alternative_note = $cw3_nzn$Use the practical examples as options, not rules. Different children may need different kinds of pauses.$cw3_nzn$,
  kids_colouring_prompt = $cw3_col$Colour a big PAUSE button. Around it draw three safe pause choices: breathe, count, move, ask for space or ask a trusted grown-up for help.$cw3_col$,
  kids_game = $cw3_g$FREEZE IN THE GAP. Play music while children move. When it stops, everyone freezes and chooses one pause: a breath, count to three or hands squeeze-and-release. Restart the music. Keep the game about noticing the stop cue, not acting out anger or distress.$cw3_g$,
  kids_game_equipment = $cw3_ge$Speaker; PAUSE cards.$cw3_ge$,
  kids_game_under5 = $cw3_g5$Use simple stop-and-go with one breath at each stop. No feeling labels are required.$cw3_g5$,
  updated_at = now()
WHERE week_number = 3;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s3a_st$Finding the Gap$s3a_st$,
  theme_title            = $s3a_tt$$s3a_tt$,
  phase                  = 1,
  phase_name             = $s3a_pn$See Clearly$s3a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s3a_hk$Think of one ordinary pattern you repeat and later wish had gone differently. Keep the content private. Ask: What usually happens immediately before it?$s3a_hk$,
  s5_source_core_concept = $s3a_cc$Today the adult room maps one automatic sequence: cue → reaction → short-term payoff → later cost. The aim is not to suppress emotion or guarantee a pause. It is to notice the cue early enough to practise one small alternative response when that option is available.$s3a_cc$,
  core_concept           = $s3a_cco$$s3a_cco$,
  teaching_points        = $s3a_tp$1. Automatic responses are useful because they reduce decision load. The problem is not automaticity itself; it is when an old response no longer fits the current situation.
2. Response inhibition is the behavioural capacity to stop or delay a prepotent response. We use the concept without assigning it to one brain region or promising a training timeline.
3. A cue can be external — a person, place, notification, time — or internal — a thought, sensation or emotion. Mapping the cue makes a vague goal more specific.
4. Naming what is happening can create useful distance. The claim we need is narrow: affect-labelling studies show that putting emotional experience into words can measurably change the response to it; this is not a guarantee that naming will calm every situation.
5. The highest-evidence move in this lesson is an if-then plan: When X happens, I will do Y. A specific cue plus a small action is more workable than I'll be more aware.$s3a_tp$,
  video_link             = $s3a_vl$https://www.youtube.com/watch?v=ZizdB0TgAVM$s3a_vl$,
  video_description      = $s3a_vd$Current assignment: Lisa Feldman Barrett, You Aren't at the Mercy of Your Emotions. Retain pending video review. Do not turn a speaker's synthesis into claims about a single settled theory of emotion.$s3a_vd$,
  todays_theme           = $s3a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
The phone buzzes, the same comment lands badly, the meeting runs late, somebody leaves a message on read. Many reactions begin with ordinary cues that become visible only after we start looking for them.$s3a_tdt$,
  todays_world_vo_script = $s3a_tdv$The practical question is not why am I like this? It is what happened just before this started?$s3a_tdv$,
  ancient_wisdom_reframe = $s3a_aw$Many philosophical traditions value a pause before action. Use that only as a cultural lens: deliberation can widen choice. Do not present ancient traditions as neuroscience or proof of a universal inner state.$s3a_aw$,
  ancient_wisdom_vo_script = $s3a_awv$A pause does not make you perfectly calm. It can simply give you one more option than the first reaction.$s3a_awv$,
  signal_metaphor        = $s3a_sm$Think of an automatic door: the sensor detects a cue and the door moves. Week 3 is about finding the sensor in one pattern, then placing a tiny pause between detection and movement.$s3a_sm$,
  private_write_prompt   = $s3a_pw$Write one recent, low-stakes reaction you wish had gone differently. Under it write only what happened immediately before it.$s3a_pw$,
  experiential_exercise  = $s3a_ex$TRIGGER MAP. Trace one sequence: What was the cue? What did I do? What did the reaction give me immediately? What did it cost later? Then choose the smallest possible interrupt: one breath, putting the phone down, naming the feeling, asking for ten seconds, or another safe action. Sharing the cue is optional; keeping the map private is full participation.$s3a_ex$,
  guided_reflection      = $s3a_gr$Keep your eyes open and look at the sequence you wrote.
Complete four lines:
The cue I can actually observe is:
My usual reaction is:
The short-term payoff is:
One small pause I could test is:
Do not explain the pattern as trauma, personality or hidden meaning. If you do not know why it happens, leave why unanswered.$s3a_gr$,
  journaling_prompt      = $s3a_jp$Across the week, which cues did you notice earliest, which did you notice only afterwards, and what changed when you named the cue without trying to fix the whole pattern?$s3a_jp$,
  intention_prompt       = $s3a_ip$Write one if-then plan: When I notice [specific cue], I will [one small pause or safe alternative].$s3a_ip$,
  core_affirmation       = $s3a_ca$I can practise noticing a cue and creating one more option before I respond.$s3a_ca$,
  weekly_practice_mon    = $s3a_pm$When you notice a familiar cue, name it silently: there it is. You do not have to change the reaction.$s3a_pm$,
  weekly_practice_wed    = $s3a_pw2$Test your if-then plan once. Record only whether you noticed the cue and whether you attempted the pause.$s3a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s3a_ps$Bring one example of a moment you caught a trigger before or as the pattern ran, and notice what happened. Sharing details is optional.$s3a_ps$,
  previous_week_callback = $s3a_pwc$bring one insight about a story you noticed running during the week, however small$s3a_pwc$,
  facilitator_notes      = $s3a_fn$## Aim
Make one automatic sequence observable and convert a vague wish into a specific cue-and-response plan.
## Run the room
Keep examples low-stakes. Do not ask what a pattern is protecting, invite trauma narratives or interpret reactions for members. A missed pause is data, not failure. If a pattern involves harm, addiction, trauma or another clinical issue, refer rather than deepen the exercise.
## Why this week exists — the evidence
Implementation intentions are the strongest evidence base used here. Gollwitzer and Sheeran's meta-analysis of 94 tests found that specific if-then plans improved goal attainment compared with intention alone. Affect-labelling research supports the narrower use of naming as an observable tool, without requiring claims about one brain region controlling emotion.
Real-world anchor: the sentence Between stimulus and response there is a space is routinely attributed to Viktor Frankl, yet it has not been located in his published writing and appears to have entered wider circulation through later authors. The misattribution is useful here because it demonstrates the curriculum's method: a line can be repeated so confidently that people stop checking the source.
## Evidence quality
Moderate to strong for the practical mechanisms. Implementation intentions have strong meta-analytic support. Response inhibition is well established as a behavioural construct. Affect-labelling has experimental support but is not a universal calming technique. The philosophical pause metaphor is illustrative only.
## We deliberately do not claim
- We do not present the Frankl quote as his verified wording.
- We do not claim one brain region is the controller of automatic reactions.
- We do not use amygdala hijack, millisecond timing or rewiring as technical facts.
- We do not claim every pattern has a hidden protective function.
- We do not promise the pause will be available when it matters most, especially at first.
## Source trail
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes.
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words. Psychological Science.
- Frankl attribution: treated as unverified; use only as a source-checking example.$s3a_fn$,
  updated_at = now()
WHERE week_number = 3 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s3t_st$The Chat You're Not Reading$s3t_st$,
  theme_title            = $s3t_tt$$s3t_tt$,
  phase                  = 1,
  phase_name             = $s3t_pn$See Clearly$s3t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s3t_hk$Think of a low-stakes moment when you sent, said, posted or did something and almost immediately wished you had paused first. You do not have to tell anyone what it was.$s3t_hk$,
  s5_source_core_concept = $s3t_cc$Today the teen room maps one automatic sequence without turning it into a personality diagnosis. We look for what happened just before, name the reaction, and test one tiny pause. Catching the cue after the reaction still counts as learning.$s3t_cc$,
  core_concept           = $s3t_cco$$s3t_cco$,
  teaching_points        = $s3t_tp$1. Automatic reactions are part of normal behaviour. The goal is not to become slow or calm all the time.
2. A cue can be outside you — a person, message, place or time — or inside you — a thought, sensation or feeling.
3. Naming a feeling or cue can help make it more observable. Research on affect labelling supports a measurable effect, but it does not mean one word will switch off every big emotion.
4. A useful plan is specific: When this cue happens, I will do this small thing. That is stronger than I'll try harder or I'll stay calm.
5. Missing the pause does not mean you failed. Sometimes the first thing you notice is the reaction afterwards. That is still information you can use next time.$s3t_tp$,
  video_link             = $s3t_vl$https://www.youtube.com/watch?v=RcGyVTAoXEU$s3t_vl$,
  video_description      = $s3t_vd$Current assignment: a practical video on pausing before reaction. Keep the assignment pending video review; do not treat a speaker's advice as research evidence unless the underlying source is named.$s3t_vd$,
  todays_theme           = $s3t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
A notification, an annoying comment, a message left on read or a joke in a group chat can trigger a reaction before you have worked out what you want to do. Week 3 makes that sequence visible.$s3t_tdt$,
  todays_world_vo_script = $s3t_tdv$Fast reactions are normal. The useful skill is noticing the cue early enough to create one more option.$s3t_tdv$,
  ancient_wisdom_reframe = $s3t_aw$Use the idea of a beat in music: a tiny space can change what comes next. This is a metaphor for deliberate timing, not a claim that every reaction can be controlled.$s3t_aw$,
  ancient_wisdom_vo_script = $s3t_awv$Sometimes one beat is enough to give you another option. Sometimes you notice the beat only after it passed. Both are useful.$s3t_awv$,
  signal_metaphor        = $s3t_sm$A message notification lights up before you have decided whether to open it. A trigger can work the same way. Week 3 is about noticing the light before your usual response runs.$s3t_sm$,
  private_write_prompt   = $s3t_pw$Write one low-stakes reaction you would like to notice earlier. Under it write only the cue you can actually observe.$s3t_pw$,
  experiential_exercise  = $s3t_ex$TRIGGER INVENTORY. Map one sequence: cue → reaction → what it gives me right now → what happens later. Pick one small interrupt: one breath, putting the phone down, saying give me a second, naming the feeling, or another safe action. Sharing your trigger word or pause idea is optional; keeping the pattern private is full participation.$s3t_ex$,
  guided_reflection      = $s3t_gr$Keep your eyes open and look at the sequence.
Complete four lines:
The cue is:
My usual reaction is:
One word I could use to name what is happening is:
One pause I could test is:
Do not decide what the reaction secretly means. If you are unsure, write not sure.$s3t_gr$,
  journaling_prompt      = $s3t_jp$During the week, which reactions did you notice before they happened, which only afterwards, and what helped you notice the cue sooner?$s3t_jp$,
  intention_prompt       = $s3t_ip$Write one if-then plan: When I notice [specific cue], I will [one small pause or safe alternative].$s3t_ip$,
  core_affirmation       = $s3t_ca$I can practise noticing my reactions earlier and give myself another option.$s3t_ca$,
  weekly_practice_mon    = $s3t_pm$Use your trigger word once today, even if the reaction still runs. Noticing is enough.$s3t_pm$,
  weekly_practice_wed    = $s3t_pw2$Test your if-then plan once. Record whether you noticed the cue before, during or after the reaction.$s3t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s3t_ps$Bring one moment where you tried to interrupt a pattern and notice what happened, even if it did not go perfectly. Sharing details is optional.$s3t_ps$,
  previous_week_callback = $s3t_pwc$bring back one moment where you caught a story running and notice what happened when you saw it$s3t_pwc$,
  facilitator_notes      = $s3t_fn$## Aim
Teach a concrete cue-and-pause skill without framing normal teen emotion as brain malfunction or requiring personal disclosure.
## Run the room
Keep examples low-risk. Do not ask teens to explain what a pattern is protecting, search childhood memories or disclose the pattern itself. Never imply that a teen should have perfect emotional control. If a young person raises harm, abuse, addiction or another clinical issue, stop the exercise and follow safeguarding/referral procedures.
## Why this week exists — the evidence
Implementation intentions provide the strongest evidence base here: specific cue-response plans outperform general intentions in meta-analytic research. Affect-labelling studies support the narrower use of naming as a way to make emotional experience more explicit, without requiring claims that a single word regulates every response.
Real-world anchor: the popular sentence Between stimulus and response there is a space is often attributed to Viktor Frankl, but it has not been located in his published work. That makes it a useful example for teens: something can be shared thousands of times and still have a shaky source.
## Evidence quality
Moderate to strong for the practical mechanisms. Implementation intentions are strongly supported. Affect labelling has experimental evidence but is not a universal emotion-control method. The pause metaphor is illustrative.
## We deliberately do not claim
- We do not claim a threat-detection brain region acts before a thinking region in a fixed sequence.
- We do not use amygdala hijack, millisecond timing, rewiring or mirror-neuron explanations.
- We do not claim every large reaction is an old reaction arriving late.
- We do not claim naming a feeling automatically calms it.
- We do not promise a pause will always be available.
## Source trail
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes.
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words. Psychological Science.
- Frankl attribution: treated as unverified; use only as a source-checking example.$s3t_fn$,
  updated_at = now()
WHERE week_number = 3 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s3c_st$The Pause Button$s3c_st$,
  theme_title            = $s3c_tt$$s3c_tt$,
  phase                  = 1,
  phase_name             = $s3c_pn$See Clearly$s3c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s3c_hk$Show a large paper PAUSE symbol. Ask: Where have you seen this symbol before? What does it mean? Then say: Today we practise a pause for our bodies too. Children may answer, point or pass.$s3c_hk$,
  s5_source_core_concept = $s3c_cc$Today the child room practises one simple idea: sometimes a feeling or cue arrives and our body wants to act fast. We can practise noticing the cue and trying a small pause. A pause might help, and sometimes we will notice only after the reaction. Both count as learning.$s3c_cc$,
  core_concept           = $s3c_cco$$s3c_cco$,
  teaching_points        = $s3c_tp$1. Big feelings can make our bodies want to move, yell, hide, cry, freeze or do something quickly.
2. Those reactions are not proof that a child is bad. They are things bodies sometimes do when feelings are strong.
3. A pause can be one breath, counting slowly, stepping back, asking for space or telling a trusted grown-up you need help.
4. A pause does not guarantee that a feeling goes away or that we always make the perfect choice.
5. If we notice only afterwards, we can still say that was the cue and learn something for next time.$s3c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s3c_sm$Imagine a big PAUSE button on a remote control. It does not erase the show and it does not make every feeling disappear. It gives us a tiny moment to notice what is happening before the next part.$s3c_sm$,
  private_write_prompt   = $s3c_pw$Draw one body clue that might tell you a big feeling has arrived. If you want, draw your pause beside it. You may tell someone about it or keep it private.$s3c_pw$,
  experiential_exercise  = $s3c_ex$PAUSE BUTTON PRACTICE. Give each child a card with a large PAUSE symbol. Clap once as the cue. Children choose one pause: take one breath, count 1–2–3, squeeze and release their hands, or say I need a second. Repeat with playful, non-personal cues. Nobody is role-played as upsetting another child.
DRAW IT
Draw a three-picture comic: something happens → I notice a clue → I try a pause. The last picture does not have to show everything fixed.$s3c_ex$,
  guided_reflection      = $s3c_gr$Keep your eyes open and look at your pause card.
Notice your hands, face, tummy or legs.
Ask: What do I notice right now?
Now choose one pause to practise once: a breath, a slow count, a stretch or asking for help.
You do not have to remember a hard moment to do this exercise.$s3c_gr$,
  journaling_prompt      = $s3c_jp$Draw a three-picture comic: something happens → I notice a clue → I try a pause. The last picture does not have to show everything fixed.$s3c_jp$,
  intention_prompt       = $s3c_ip$Choose one small plan: When I notice [my cue], I will try [my pause].$s3c_ip$,
  core_affirmation       = $s3c_ca$I can practise a pause when I notice a big feeling, and I do not have to get it right every time.$s3c_ca$,
  weekly_practice_mon    = $s3c_pm$When a big or fast feeling shows up, try your pause once if you remember. If you remember afterwards, that still counts.$s3c_pm$,
  weekly_practice_wed    = $s3c_pw2$Show a trusted grown-up your pause button and practise one pause together if you want to.$s3c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s3c_ps$Bring your pause-button drawing and one story about trying it, only if you want to share.$s3c_ps$,
  previous_week_callback = $s3c_pwc$bring your backpack drawing back and choose one thing from it to share only if you want to$s3c_pwc$,
  facilitator_notes      = $s3c_fn$## Aim
Teach a concrete cue-and-pause skill without making children responsible for perfectly controlling strong emotion.
## Run the room
Use only neutral, playful cues. Do not ask children to remember a painful event or explain what a reaction is protecting them from. Avoid hand-on-heart staging or eyes-closed imagery. A child who notices after the fact has succeeded at noticing. If a child discloses harm or danger, do not investigate in the activity; follow MC-SAF-001.
## Why this week exists — the evidence
Implementation-intention research supports the general structure when X happens, I will do Y. For young children, Mindcast translates that into a concrete cue and a small observable response. Affect-labelling research supports the narrower use of naming a feeling or cue, but it does not establish that naming will calm every child.
Real-world anchor: the phrase Between stimulus and response there is a space is often credited to Viktor Frankl even though it has not been located in his published writing. Facilitators can use that as an adult-facing reminder: even useful ideas need their sources checked. The children do not need the attribution story.
## Evidence quality
Moderate overall. Implementation intentions have strong general evidence, but this specific PAUSE-card activity is an age-matched teaching adaptation rather than a validated treatment. Affect-labelling evidence is experimental and not a universal calming rule. The remote-control metaphor is illustrative only.
## We deliberately do not claim
- We do not claim a child's brain sends a simple fire-alarm signal that explains every reaction.
- We do not claim the pause is a superpower or guarantees control.
- We do not claim a child is responsible for stopping every big reaction.
- We do not ask children to recall distressing events to practise the skill.
- We do not use rewiring, brain-region explanations or amygdala hijack language.
## Source trail
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes.
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words. Psychological Science.
- Frankl attribution: treated as unverified; adult facilitator note only.$s3c_fn$,
  updated_at = now()
WHERE week_number = 3 AND audience = 'Child';

-- Week 4 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw4_theme$$cw4_theme$,
  the_territory        = $cw4_terr$What your body tells you before your words do$cw4_terr$,
  opening_question     = $cw4_oq$Which body signal do you tend to notice earliest when you are under pressure — jaw, shoulders, chest, stomach, hands, breathing, something else? Passing is full participation.$cw4_oq$,
  week_type            = $cw4_wt$Standard$cw4_wt$,
  reflective_question  = $cw4_rq$Across the week, which sensations appeared repeatedly, in what contexts, and where did your first interpretation turn out to be incomplete or uncertain?$cw4_rq$,
  interactive_activity = $cw4_ia$BODY MAP. Keep eyes open. Move attention slowly from head to feet for about two minutes. On a body outline, mark only observable sensations: tension, warmth, coolness, pressure, movement, numbness or ease. Do not assign emotions or meanings unless the member chooses to privately. Pair discussion is optional; keeping the map private is full participation.$cw4_ia$,
  kids_picture_book    = $cw4_bk$Listening to My Body$cw4_bk$,
  kids_picture_book_author = $cw4_bka$Gabi Garcia$cw4_bka$,
  kids_picture_book_note = $cw4_bkn$WHY THIS BOOK: It gives children concrete words for sensations and feelings without requiring them to know exactly what every sensation means.
READ-ALOUD: Read live from a purchased copy.$cw4_bkn$,
  kids_picture_book_question = $cw4_bkq$Can the same tummy feeling happen when you are excited and when you are nervous?$cw4_bkq$,
  kids_nz_alternative = $cw4_nz$Let It Go: Emotions Are Energy in Motion$cw4_nz$,
  kids_nz_alternative_author = $cw4_nza$Rebekah Lipp & Craig Phillips$cw4_nza$,
  kids_nz_alternative_note = $cw4_nzn$Use only the parts that support noticing and naming. Do not teach energy in motion as a scientific explanation of emotion.$cw4_nzn$,
  kids_colouring_prompt = $cw4_col$Colour a little weather station with four signs: sunny, windy, rainy and still. Add one body signal beside any sign.$cw4_col$,
  kids_game = $cw4_g$BODY WEATHER REPORT. Call only safe, ordinary scenarios such as just ran outside, waiting for a turn, heard good news, feeling sleepy. Children freeze and point to a place they might notice a sensation. Then ask: Could somebody else feel it somewhere different? No child is required to demonstrate an emotion or disclose a real situation.$cw4_g$,
  kids_game_equipment = $cw4_ge$Body-outline sheets; crayons.$cw4_ge$,
  kids_game_under5 = $cw4_g5$Use only physical scenarios such as running, being cold, stretching or resting. Ask children to point rather than explain.$cw4_g5$,
  updated_at = now()
WHERE week_number = 4;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s4a_st$Turning the Diagnostics Back On$s4a_st$,
  theme_title            = $s4a_tt$$s4a_tt$,
  phase                  = 1,
  phase_name             = $s4a_pn$See Clearly$s4a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s4a_hk$Keep your eyes open. Notice three neutral sensations right now: contact with the chair or floor, temperature on your skin, and one area of tension or ease. No explanation required.$s4a_hk$,
  s5_source_core_concept = $s4a_cc$Today the adult room treats body sensation as data, not verdict. We practise noticing what is physically present before adding an explanation. A tight chest may matter; it does not by itself tell us whether the situation is dangerous, exciting, exhausting or something else.$s4a_cc$,
  core_concept           = $s4a_cco$$s4a_cco$,
  teaching_points        = $s4a_tp$1. Interoception is the sensing of internal bodily states such as heartbeat, breathing, temperature, fullness and tension. It is a legitimate research field connected with emotion and self-regulation.
2. People differ in how accurately and comfortably they notice internal signals. More noticing is not automatically better, and some people find body attention difficult or distressing.
3. Models such as polyvagal theory are popular in some therapeutic settings but remain contested. This lesson does not need them. We can teach observable changes in arousal and settling without claiming one disputed mechanism.
4. A body signal is not an instruction. Anxiety, excitement, exertion and uncertainty can produce overlapping sensations. The useful move is notice first, interpret second.
5. This is a diagnostic practice, not treatment. We are increasing descriptive accuracy, not processing trauma or promising that body awareness will resolve distress.$s4a_tp$,
  video_link             = $s4a_vl$https://www.youtube.com/watch?v=OidBsNLjD1Q$s4a_vl$,
  video_description      = $s4a_vd$CURRENT ASSIGNMENT — REVIEW REQUIRED. This slot points to Bessel van der Kolk material associated with The Body Keeps the Score. The lesson itself does not use trauma-processing claims or that phrase as a scientific mechanism. Keep the assignment unchanged pending video review.$s4a_vd$,
  todays_theme           = $s4a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Ordinary days contain physical signals long before we name them: shoulders rising during an email, a breath held during a difficult conversation, a jaw tightening in traffic, or a sense of ease after leaving a noisy room.$s4a_tdt$,
  todays_world_vo_script = $s4a_tdv$The skill is not believing every sensation. It is noticing the sensation clearly enough to decide what information, if any, it adds.$s4a_tdv$,
  ancient_wisdom_reframe = $s4a_aw$Movement, breath and contemplative traditions have long used attention to bodily experience. Treat that as a cultural lens, not scientific validation. The modern claim stays narrow: people can practise noticing present-moment sensation.$s4a_aw$,
  ancient_wisdom_vo_script = $s4a_awv$Many traditions practise attention through the body. We borrow the practice of noticing, not a claim that the body is always wise or always right.$s4a_awv$,
  signal_metaphor        = $s4a_sm$Think of a dashboard light. It tells you something changed; it does not diagnose the cause. Body sensations can work the same way: useful information that still needs context.$s4a_sm$,
  private_write_prompt   = $s4a_pw$Without explaining why, write three sensations you can notice right now using concrete words: warm, tight, heavy, light, fast, slow, tingling, numb, relaxed, something else.$s4a_pw$,
  experiential_exercise  = $s4a_ex$BODY MAP. Keep eyes open. Move attention slowly from head to feet for about two minutes. On a body outline, mark only observable sensations: tension, warmth, coolness, pressure, movement, numbness or ease. Do not assign emotions or meanings unless the member chooses to privately. Pair discussion is optional; keeping the map private is full participation.$s4a_ex$,
  guided_reflection      = $s4a_gr$Keep your eyes open and choose one mark on your map.
Write:
What I can observe:
The story I am tempted to add:
What else could this sensation mean:
What information would I need before acting on it:
If body attention becomes uncomfortable, stop and orient to the room: feet on the floor, name five things you can see.$s4a_gr$,
  journaling_prompt      = $s4a_jp$Across the week, which sensations appeared repeatedly, in what contexts, and where did your first interpretation turn out to be incomplete or uncertain?$s4a_jp$,
  intention_prompt       = $s4a_ip$Write one if-then plan: When I notice [specific body signal], I will pause and describe it in neutral words before deciding what it means.$s4a_ip$,
  core_affirmation       = $s4a_ca$I can notice what my body is reporting without treating the signal as the whole answer.$s4a_ca$,
  weekly_practice_mon    = $s4a_pm$Three times today, take 30 seconds to notice one neutral body sensation. No interpretation required.$s4a_pm$,
  weekly_practice_wed    = $s4a_pw2$Choose one recurring sensation and note the context around it: where you were, what was happening and what changed next.$s4a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s4a_ps$Bring one observation from this week's body-scan practice and notice what you learned. Sharing details is optional.$s4a_ps$,
  previous_week_callback = $s4a_pwc$bring one example of a moment you caught a trigger before or as the pattern ran and notice what happened$s4a_pwc$,
  facilitator_notes      = $s4a_fn$## Aim
Build descriptive interoceptive awareness while keeping the session non-clinical and explicitly separating sensation from interpretation.
## Run the room
Eyes stay open. Never ask what is your body trying to tell you? as though the body has one hidden message. Use what do you notice? and what are several possible explanations? Allow members to opt out of body scanning entirely. If someone becomes distressed, orient to the room and follow MC-SAF-001 if needed; do not explore trauma content.
## Why this week exists — the evidence
Interoception is a well-established research area describing perception of internal bodily states. Research links interoceptive processes with emotional experience, but the relationship is complex: sensitivity, accuracy and interpretation are not the same thing, and more attention is not universally beneficial.
Real-world anchor: wearable devices now put heart rate, sleep estimates and recovery scores on millions of wrists. The useful lesson is not that the number knows how you feel; it is that a signal becomes meaningful only when interpreted in context. Week 4 teaches the same discipline without requiring a device.
## Evidence quality
Moderate overall. Interoception as a construct is well supported. Claims linking better interoception to specific emotional outcomes are more variable. Polyvagal theory is contested and is not used as the mechanism here. The dashboard metaphor is illustrative only.
## We deliberately do not claim
- We do not claim the body is always right.
- We do not use the body keeps the score as a mechanism or imply this session processes trauma.
- We do not claim polyvagal theory is settled science.
- We do not call the gut a second brain or use neuron-count comparisons as meaning.
- We do not claim one sensation identifies one emotion or one correct action.
- We do not provide somatic therapy.
## Source trail
- Khalsa, S. S., et al. (2018). Interoception and Mental Health: A Roadmap. Biological Psychiatry: Cognitive Neuroscience and Neuroimaging.
- Garfinkel, S. N., et al. — interoceptive accuracy/awareness research; used for the distinction between sensing and interpretation.
- Polyvagal theory: treated as contested and not required for the lesson mechanism.$s4a_fn$,
  updated_at = now()
WHERE week_number = 4 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s4t_st$Reading the Data Your Body Collects$s4t_st$,
  theme_title            = $s4t_tt$$s4t_tt$,
  phase                  = 1,
  phase_name             = $s4t_pn$See Clearly$s4t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s4t_hk$Without changing anything, notice one physical signal right now: warm hands, tight shoulders, fast breathing, tired eyes, a steady chest, something else. You can keep it private.$s4t_hk$,
  s5_source_core_concept = $s4t_cc$Today the teen room practises describing body sensations without treating them as automatic truth. We notice the signal, name it in neutral words, and stay open to more than one explanation before deciding what to do.$s4t_cc$,
  core_concept           = $s4t_cco$$s4t_cco$,
  teaching_points        = $s4t_tp$1. Interoception means sensing internal body states such as heartbeat, breathing, temperature, fullness and tension.
2. The same body signal can occur in different situations. A fast heart might happen with excitement, anxiety, exercise, surprise or caffeine. Sensation is data, not a diagnosis.
3. The gut has its own nervous system, but calling it a second brain is a metaphor that easily becomes an overclaim. We do not need that story to teach body awareness.
4. Heart-rate and recovery measurements can be useful in some contexts, but no wearable or body signal can tell you exactly what you are feeling or what you should do.
5. You are allowed to stop a body-awareness exercise if it feels uncomfortable. More attention is not always better for every person.$s4t_tp$,
  video_link             = $s4t_vl$https://www.youtube.com/watch?v=Ks-_Mh1QhMc$s4t_vl$,
  video_description      = $s4t_vd$CURRENT ASSIGNMENT — DO NOT USE UNTIL REVIEWED. This is Amy Cuddy's body-language/power-posing talk. Power posing is a banned claim in the curriculum because the stronger causal claims did not hold up reliably. Keep the URL unchanged pending video reassignment.$s4t_vd$,
  todays_theme           = $s4t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Body signals show up in ordinary teen life: before speaking in class, checking a result, walking into a room, waiting for a reply or competing in sport. The same sensation can have more than one explanation.$s4t_tdt$,
  todays_world_vo_script = $s4t_tdv$A fast heart is information. It might be nerves, excitement, movement or something else. The signal matters; the interpretation still needs context.$s4t_tdv$,
  ancient_wisdom_reframe = $s4t_aw$Yoga, martial arts, dance and other traditions use attention to posture, breath and movement. Use that as a cultural example of practising awareness through the body, not as proof of a biological claim.$s4t_aw$,
  ancient_wisdom_vo_script = $s4t_awv$People have practised noticing through movement and breath for a long time. The useful skill is attention, not a promise that the body always knows best.$s4t_awv$,
  signal_metaphor        = $s4t_sm$Your body is like a weather app that reports conditions, not a command centre. It can tell you something is happening without telling you the whole reason or what choice to make.$s4t_sm$,
  private_write_prompt   = $s4t_pw$Write three neutral words for physical sensations you notice right now. Do not attach an emotion or explanation yet.$s4t_pw$,
  experiential_exercise  = $s4t_ex$SENSATION MAP. Use ordinary scenarios such as waiting for a result, entering a new room, getting good news or facing a deadline. Teens mark where they might notice sensation and then list at least two possible explanations. Nobody comments on another person's body, and sharing is optional.$s4t_ex$,
  guided_reflection      = $s4t_gr$Keep your eyes open.
Choose one sensation you notice now or noticed during the exercise.
Write:
The physical signal is:
One possible explanation is:
Another possible explanation is:
What would help me know more:
If you do not know, not sure is complete.$s4t_gr$,
  journaling_prompt      = $s4t_jp$Across the week, which body signals showed up in more than one kind of situation, and how did the meaning change with the context?$s4t_jp$,
  intention_prompt       = $s4t_ip$Write one if-then plan: When I notice [specific body signal], I will describe it before deciding what it means.$s4t_ip$,
  core_affirmation       = $s4t_ca$I can notice what my body is doing without assuming I already know what it means.$s4t_ca$,
  weekly_practice_mon    = $s4t_pm$Do three brief check-ins today. Write one neutral sensation word each time.$s4t_pm$,
  weekly_practice_wed    = $s4t_pw2$Pick one recurring signal and note two different situations where it appeared.$s4t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s4t_ps$Bring back one observation from your body-scan practice this week. Sharing details is optional.$s4t_ps$,
  previous_week_callback = $s4t_pwc$bring one moment where you tried to interrupt a pattern and notice what happened even if it did not go perfectly$s4t_pwc$,
  facilitator_notes      = $s4t_fn$## Aim
Teach concrete interoceptive noticing without body-image content, clinical interpretation or contested nervous-system storytelling.
## Run the room
Never comment on a teen's appearance, posture, weight or body positively or negatively. Keep attention on internal sensation and neutral observation. Do not ask teens to disclose what their body is "trying to tell them." Eyes remain open. If body attention becomes distressing, stop and orient to the room; follow MC-SAF-001 where necessary.
## Why this week exists — the evidence
Interoception is a legitimate research area concerning perception of internal bodily states. The curriculum uses a narrow skill: noticing and describing sensations with less immediate interpretation.
Real-world anchor: consumer wearables can produce heart-rate, sleep and recovery numbers that look objective, yet those signals still require context and are imperfect estimates. Week 4 teaches the same discipline: a data point is useful, but it is not a verdict about how you feel or what you should do.
## Evidence quality
Moderate overall. Interoception is well established as a construct. Relationships between interoceptive skill and emotional outcomes are complex. Power-posing claims are not used. The weather-app metaphor is illustrative only.
## We deliberately do not claim
- We do not claim the gut is a thinking second brain.
- We do not claim heart-rate variability tells a teen exactly how regulated they are.
- We do not claim body sensations are always accurate or should be obeyed.
- We do not use power posing as an evidence-based intervention.
- We do not claim polyvagal theory is settled science.
- We do not use food, weight, body-rating or appearance material.
## Source trail
- Khalsa, S. S., et al. (2018). Interoception and Mental Health: A Roadmap.
- Power posing: treated as a failed/unstable claim and excluded from teaching.$s4t_fn$,
  updated_at = now()
WHERE week_number = 4 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s4c_st$Your Feelings Weather Station$s4c_st$,
  theme_title            = $s4c_tt$$s4c_tt$,
  phase                  = 1,
  phase_name             = $s4c_pn$See Clearly$s4c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s4c_hk$Ask children to make a weather shape with their hands: sunny, windy, rainy, stormy, still. Then ask: Can our bodies have different kinds of weather too? They may answer, copy a shape or pass.$s4c_hk$,
  s5_source_core_concept = $s4c_cc$Today the child room practises noticing body signals like a weather report. A signal can tell us that something is happening without telling us exactly why. We can notice it, name it and ask a trusted grown-up for help if we need more information.$s4c_cc$,
  core_concept           = $s4c_cco$$s4c_cco$,
  teaching_points        = $s4c_tp$1. Bodies give us signals such as a fast heart, tight tummy, warm face, heavy eyes or wiggly legs.
2. The same signal can happen for different reasons. A wobbly tummy can happen with excitement, nerves, hunger, illness or something else.
3. We do not have to guess perfectly. I don't know yet is a good answer.
4. A body signal is information, not an order. We can pause before deciding what it means or what to do.
5. Nobody has to talk about a private feeling or body signal in the group. Drawing, pointing and passing all count.$s4c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s4c_sm$Your body is like a little weather station. It can tell you windy, warm, stormy or still, but it cannot always tell you why the weather changed. We look at the signal and the whole situation together.$s4c_sm$,
  private_write_prompt   = $s4c_pw$Draw one signal your body gives you sometimes. Next to it draw two different things that could be happening when you feel that signal. You may tell someone or keep it private.$s4c_pw$,
  experiential_exercise  = $s4c_ex$FEELINGS WEATHER MAP. Give each child a body outline. Use safe, ordinary scenarios: running fast, waiting for a turn, hearing good news, feeling tired, walking into a new room. Children colour or mark where they might notice sensations. Ask for more than one possible meaning. Nobody comments on another child's body.
DRAW IT
Draw your body as a weather station on two different days. Use the same body signal in both pictures but give it two different possible reasons.$s4c_ex$,
  guided_reflection      = $s4c_gr$Keep your eyes open.
Notice one place in your body: hands, tummy, face, legs or chest.
Ask: What do I notice?
Then ask: Could there be more than one reason?
If you do not know, say I don't know yet. You do not have to solve the signal.$s4c_gr$,
  journaling_prompt      = $s4c_jp$Draw your body as a weather station on two different days. Use the same body signal in both pictures but give it two different possible reasons.$s4c_jp$,
  intention_prompt       = $s4c_ip$Choose one small plan: When I notice [a body signal], I will name it before I decide what it means.$s4c_ip$,
  core_affirmation       = $s4c_ca$My body gives me clues, and I do not have to know exactly what every clue means.$s4c_ca$,
  weekly_practice_mon    = $s4c_pm$Notice one body signal three times today. Use one word or picture each time.$s4c_pm$,
  weekly_practice_wed    = $s4c_pw2$Ask a trusted grown-up where they notice excitement or nerves. Different answers are okay.$s4c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s4c_ps$Bring back your feelings body map and choose one new thing you noticed to share only if you want to.$s4c_ps$,
  previous_week_callback = $s4c_pwc$bring your pause-button drawing and one story about trying it only if you want to share$s4c_pwc$,
  facilitator_notes      = $s4c_fn$## Aim
Teach sensation as data rather than truth, while keeping the child room away from appearance, food, weight and clinical interpretation.
## Run the room
Do not say your body always knows or your body is trying to tell you X. Offer neutral words and multiple possible explanations. No comments on any child's body or appearance. Keep eyes open. If a child becomes distressed, stop the exercise and orient to the room; follow MC-SAF-001 if needed.
## Why this week exists — the evidence
Interoception is the perception of internal bodily states. For children, concrete noticing of sensation is an age-matched way to build vocabulary for internal experience. The curriculum deliberately stops short of teaching that sensations reveal one true emotion or one correct action.
Real-world anchor: a weather forecast reports conditions but still needs interpretation. The same logic applies to body signals: fast heart can happen after running, before speaking, when excited or when worried. Children can understand that one signal may have several causes without needing neuroscience language.
## Evidence quality
Moderate overall. Interoception is well established as a construct. This weather-station activity is a teaching adaptation, not a clinical treatment. The weather metaphor is illustrative only.
## We deliberately do not claim
- We do not claim the body always knows the truth.
- We do not claim one sensation equals one emotion.
- We do not claim children should obey every body signal.
- We do not use food, weight, appearance or body-rating material.
- We do not claim polyvagal theory is settled science.
- We do not use second brain, rewiring or brain-region explanations.
## Source trail
- Khalsa, S. S., et al. (2018). Interoception and Mental Health: A Roadmap.
- Child activities are age-matched teaching adaptations, not clinical interventions.$s4c_fn$,
  updated_at = now()
WHERE week_number = 4 AND audience = 'Child';

-- Week 5 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw5_theme$$cw5_theme$,
  the_territory        = $cw5_terr$Seeing yourself kindly and honestly$cw5_terr$,
  opening_question     = $cw5_oq$Which is easier for you to name accurately: a genuine strength or a genuine limitation? Passing is full participation.$cw5_oq$,
  week_type            = $cw5_wt$Standard$cw5_wt$,
  reflective_question  = $cw5_rq$What changed this week when you described yourself in specific behaviours and evidence rather than global labels? Which description became more accurate or more nuanced?$cw5_rq$,
  interactive_activity = $cw5_ia$HONEST INVENTORY. Make three columns: strengths with evidence; limitations with evidence; questions or possible blind spots. For the third column, use only repeated, specific feedback or genuine uncertainty. Nobody is required to ask another person for feedback or disclose their list.$cw5_ia$,
  kids_picture_book    = $cw5_bk$I Like Myself!$cw5_bk$,
  kids_picture_book_author = $cw5_bka$Karen Beaumont$cw5_bka$,
  kids_picture_book_note = $cw5_bkn$WHY THIS BOOK: Use the story to talk about liking and accepting yourself without turning appearance into the measure of worth.
READ-ALOUD: Read live from a purchased copy.$cw5_bkn$,
  kids_picture_book_question = $cw5_bkq$What are some things about a person that a mirror cannot show?$cw5_bkq$,
  kids_nz_alternative = $cw5_nz$Not yet selected$cw5_nz$,
  kids_nz_alternative_author = $cw5_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw5_nza$,
  kids_nz_alternative_note = $cw5_nzn$Choose any future alternative for character, interests, effort and relationships rather than appearance or body confidence.$cw5_nzn$,
  kids_colouring_prompt = $cw5_col$Colour a mirror frame with three spaces: I can, I'm learning, I'm not sure yet. Add one symbol to any space you choose.$cw5_col$,
  kids_game = $cw5_g$MIRROR MOVES. In pairs, one child makes slow simple movements and the other mirrors, then swap. No judgments or compliments about bodies. Finish by asking: What helped you copy accurately — watching carefully, going slowly, checking? Link that back to accurate self-description.$cw5_g$,
  kids_game_equipment = $cw5_ge$Paper mirror sheets; crayons.$cw5_ge$,
  kids_game_under5 = $cw5_g5$Use an adult or facilitator as the movement partner. Keep movements large and slow.$cw5_g5$,
  updated_at = now()
WHERE week_number = 5;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s5a_st$Recalibrating the Lens$s5a_st$,
  theme_title            = $s5a_tt$$s5a_tt$,
  phase                  = 1,
  phase_name             = $s5a_pn$See Clearly$s5a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s5a_hk$Write three words you use to describe yourself. Beside each, mark evidence, other people's words, or not sure. No sharing required.$s5a_hk$,
  s5_source_core_concept = $s5a_cc$Today the adult room practises calibration rather than confidence. We are not trying to think more positively or more negatively. We are building a self-description that can hold strengths, limitations, uncertainty and feedback at the same time.$s5a_cc$,
  core_concept           = $s5a_cco$$s5a_cco$,
  teaching_points        = $s5a_tp$1. People are not perfectly objective judges of themselves. Self-enhancing biases, selective memory and blind spots are well documented.
2. The correction is not harsher self-criticism. Accuracy improves when claims become specific and testable: What evidence supports this? What evidence does not?
3. Outside feedback can reveal information we miss, but another person's view is still data rather than a verdict. One comment matters less than repeated, specific feedback across contexts.
4. A calibrated self-view includes strengths without performative modesty and limitations without turning them into identity.
5. We do not teach depressive realism. Depression is not a privileged route to clearer self-knowledge, and framing it that way is both scientifically contested and unsafe.$s5a_tp$,
  video_link             = $s5a_vl$https://www.youtube.com/watch?v=haLsNaHmBhE$s5a_vl$,
  video_description      = $s5a_vd$Current assignment: Tasha Eurich on self-awareness. Retain pending routine video review. Use the talk as a synthesis of her work, while keeping headline self-awareness percentages attached to their caveat rather than treating them as individual diagnoses.$s5a_vd$,
  todays_theme           = $s5a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Performance reviews, social feeds, family roles and old school labels all offer mirrors. None is neutral and none is complete. The practical skill is comparing several sources without handing any one of them total authority.$s5a_tdt$,
  todays_world_vo_script = $s5a_tdv$A useful mirror does not flatter or attack. It gives you enough information to adjust.$s5a_tdv$,
  ancient_wisdom_reframe = $s5a_aw$Beginner's mind can be used as a cultural lens for approaching familiar things without assuming we already know them completely. Applied here: treat your own self-description as revisable rather than final.$s5a_aw$,
  ancient_wisdom_vo_script = $s5a_awv$You are familiar with yourself, but familiarity is not the same as complete knowledge.$s5a_awv$,
  signal_metaphor        = $s5a_sm$Think of a mirror that can be slightly warped in either direction. Calibration means checking the reflection against other evidence instead of assuming the mirror is perfect.$s5a_sm$,
  private_write_prompt   = $s5a_pw$Write one specific strength you can support with examples and one specific limitation you can support with examples. Avoid global labels such as good person or failure.$s5a_pw$,
  experiential_exercise  = $s5a_ex$HONEST INVENTORY. Make three columns: strengths with evidence; limitations with evidence; questions or possible blind spots. For the third column, use only repeated, specific feedback or genuine uncertainty. Nobody is required to ask another person for feedback or disclose their list.$s5a_ex$,
  guided_reflection      = $s5a_gr$Keep your eyes open and choose one item from your inventory.
Write:
The claim:
Evidence that supports it:
Evidence that complicates it:
What I still do not know:
Do not force a final verdict. Calibration can end in uncertainty.$s5a_gr$,
  journaling_prompt      = $s5a_jp$What changed this week when you described yourself in specific behaviours and evidence rather than global labels? Which description became more accurate or more nuanced?$s5a_jp$,
  intention_prompt       = $s5a_ip$Write one if-then plan: When I notice myself using a global self-label, I will replace it with one specific observation I can actually support.$s5a_ip$,
  core_affirmation       = $s5a_ca$I can describe myself with evidence, compassion and room to be wrong.$s5a_ca$,
  weekly_practice_mon    = $s5a_pm$Catch one global self-label and rewrite it as a specific observation.$s5a_pm$,
  weekly_practice_wed    = $s5a_pw2$Optional feedback check: ask one trusted person for one specific strength they see in you, or use a past piece of repeated feedback instead.$s5a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s5a_ps$Bring one piece of evidence that changed, sharpened or complicated how you described yourself this week. Sharing is optional.$s5a_ps$,
  previous_week_callback = $s5a_pwc$bring one observation from this week's body-scan practice and notice what you learned$s5a_pwc$,
  facilitator_notes      = $s5a_fn$## Aim
Shift self-perception from global labels toward specific, evidence-based descriptions without making group approval the authority.
## Run the room
Do not make feedback-seeking mandatory. Do not ask members to publicly list flaws or strengths. Never interpret someone's blind spot for them. Keep discussion behavioural and specific. If self-criticism becomes clinically significant, do not turn the session into treatment.
## Why this week exists — the evidence
Self-evaluation biases, including better-than-average effects in many domains, show that people are imperfect judges of themselves. The useful curriculum move is calibration: compare a claim with observable evidence and, optionally, multiple sources of specific feedback.
Real-world anchor: online profiles and performance ratings can present highly selected views of a person. A feed may contain hundreds of polished examples while omitting ordinary failures, boredom and recovery. The same selection problem happens in memory. Week 5 teaches members to ask what evidence was included and what was left out.
## Evidence quality
Moderate overall. Self-evaluation biases are well replicated, though their size and direction vary by trait and context. Trusted feedback can add information but is not automatically accurate. The mirror metaphor is illustrative only.
## We deliberately do not claim
- We do not teach depressive realism as a reliable fact.
- We do not claim a group can reveal someone's true self.
- We do not claim social media causes low self-esteem; associations are generally small and causality is contested.
- We do not claim another person's feedback is automatically more accurate than self-perception.
- We do not use brain-region explanations for comparison or status.
## Source trail
- Alicke, M. D., & Govorun, O. — better-than-average effect research lineage.
- Eurich, T. (2018). What Self-Awareness Really Is (and How to Cultivate It). Harvard Business Review; synthesis of her research programme.$s5a_fn$,
  updated_at = now()
WHERE week_number = 5 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s5t_st$The Comparison Trap and the Real Mirror$s5t_st$,
  theme_title            = $s5t_tt$$s5t_tt$,
  phase                  = 1,
  phase_name             = $s5t_pn$See Clearly$s5t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s5t_hk$Think about the last time your view of yourself changed after seeing somebody else's post, result, achievement or photo. You do not need to say whether it changed up or down.$s5t_hk$,
  s5_source_core_concept = $s5t_cc$Today the teen room separates comparison from evidence. We are not trying to stop noticing other people. We are practising a more accurate self-description that can include strengths, limits and uncertainty without using somebody else's highlight reel as the measuring stick.$s5t_cc$,
  core_concept           = $s5t_cco$$s5t_cco$,
  teaching_points        = $s5t_tp$1. Social comparison is a normal human process, not a modern defect created by phones.
2. Research often finds associations between some patterns of social-media use and lower wellbeing or self-esteem, but effects are usually small, vary between people and do not support a simple phones cause low self-esteem story.
3. A self-image built from one failure, one comment or one comparison is a selected sample, not a complete record.
4. Accurate self-description is specific: I struggled with this task is more useful than I'm useless; I handled this well is more useful than I'm amazing at everything.
5. Feedback from trusted people can add information, but it is still one source. Nobody else gets final authority over who you are.$s5t_tp$,
  video_link             = $s5t_vl$https://www.youtube.com/watch?v=Lp7E973zozc$s5t_vl$,
  video_description      = $s5t_vd$Current assignment: Jonathan Haidt on social media and teen mental health. Retain pending video review. Any use must distinguish association from causation and avoid presenting contested population-level claims as the explanation for an individual teen's wellbeing.$s5t_vd$,
  todays_theme           = $s5t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Comparison existed long before phones, but feeds can put edited examples of other people's appearance, achievement and social life in front of you repeatedly. The useful question is not is social media bad? but what happens to my self-view after this kind of comparison?$s5t_tdt$,
  todays_world_vo_script = $s5t_tdv$Comparison is normal. The data you compare against may still be incomplete.$s5t_tdv$,
  ancient_wisdom_reframe = $s5t_aw$Use the idea of a clear mirror as a cultural metaphor: a mirror is useful when it reflects what is there rather than flattering or distorting. We apply that to specific evidence, not to appearance or a claim that one person can see your "real self".$s5t_aw$,
  ancient_wisdom_vo_script = $s5t_awv$A useful mirror gives information. It does not decide your worth.$s5t_awv$,
  signal_metaphor        = $s5t_sm$A feed is a highlight reel, not a full camera roll. Comparing your ordinary Tuesday with somebody else's selected moment is a data-quality problem before it is a confidence problem.$s5t_sm$,
  private_write_prompt   = $s5t_pw$Write one specific strength you can support with a real example and one thing you are still learning. No appearance, weight or body ratings.$s5t_pw$,
  experiential_exercise  = $s5t_ex$REAL MIRROR / COMPARE MIRROR. Column A: specific evidence about yourself — strengths, limits, things still uncertain. Column B: comparisons you notice making. For each comparison ask: What information about the other person is missing? What information about me is missing? Sharing is optional and anonymous examples are fine.$s5t_ex$,
  guided_reflection      = $s5t_gr$Keep your eyes open and choose one self-description from Column A.
Write:
The evidence I have is:
The comparison that distorts it is:
A more specific description is:
If you cannot make the description more accurate yet, write not sure rather than forcing a positive statement.$s5t_gr$,
  journaling_prompt      = $s5t_jp$During the week, which comparisons changed how you described yourself, and what happened when you checked the comparison against fuller evidence?$s5t_jp$,
  intention_prompt       = $s5t_ip$Write one if-then plan: When I catch myself turning a comparison into a global label, I will name one specific fact about the situation instead.$s5t_ip$,
  core_affirmation       = $s5t_ca$I can compare less globally and describe myself more accurately.$s5t_ca$,
  weekly_practice_mon    = $s5t_pm$After one ordinary scrolling session, note whether your self-view changed and in what direction. No streak or app deletion required.$s5t_pm$,
  weekly_practice_wed    = $s5t_pw2$Optional feedback check: ask one trusted person for one specific strength they see, or use a piece of feedback you already have.$s5t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s5t_ps$Bring one observation about a comparison that changed when you checked the missing information. Sharing details is optional.$s5t_ps$,
  previous_week_callback = $s5t_pwc$bring back one observation from your body-scan practice this week and notice what the context changed$s5t_pwc$,
  facilitator_notes      = $s5t_fn$## Aim
Teach calibration and media-literacy around comparison without moralising about phones, appearance or teen behaviour.
## Run the room
No body, food, weight or appearance discussion. Do not ask who teens compare themselves with if that would identify peers. Do not tell teens to delete apps or frame social media as the cause of distress. Feedback activities remain optional.
## Why this week exists — the evidence
Social-comparison theory predates social media and describes a common process of evaluating ourselves relative to others. Research on digital media and teen wellbeing is mixed and generally shows small average associations with substantial individual variation.
Real-world anchor: a single social-media profile can show hundreds of selected successes while revealing almost nothing about boring, difficult or failed moments. That makes feeds a concrete example of sampling bias: the comparison may be emotionally powerful while the dataset is incomplete.
## Evidence quality
Moderate overall. Social comparison is well established. Digital-media effects on wellbeing are contested in size, direction and causality. The highlight-reel metaphor is illustrative.
## We deliberately do not claim
- We do not claim social media causes low self-esteem or poor mental health in every teen.
- We do not teach depressive realism.
- We do not claim likes, followers or other people's feedback measure worth.
- We do not use body, weight, food or appearance rating exercises.
- We do not use brain-region explanations for comparison or status.
## Source trail
- Festinger, L. (1954). A Theory of Social Comparison Processes.
- Digital-media/teen wellbeing literature: treated as mixed, with small average effects and contested causality.$s5t_fn$,
  updated_at = now()
WHERE week_number = 5 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s5c_st$The True Mirror$s5c_st$,
  theme_title            = $s5c_tt$$s5c_tt$,
  phase                  = 1,
  phase_name             = $s5c_pn$See Clearly$s5c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s5c_hk$Show a funhouse-mirror drawing that stretches and squashes a simple shape. Ask: Does the mirror change the real shape, or only the picture we see? Children may answer, point or pass.$s5c_hk$,
  s5_source_core_concept = $s5c_cc$Today the child room practises being a true mirror: noticing things we can actually show with examples. We can be good at some things, still learning others and unsure about plenty. None of those descriptions tells the whole story of who we are.$s5c_cc$,
  core_concept           = $s5c_cco$$s5c_cco$,
  teaching_points        = $s5c_tp$1. A true description uses examples: I helped my friend or I practised my reading tells us more than a giant label such as I'm perfect or I'm terrible.
2. Everyone has skills and everyone has things they are still learning.
3. One mistake does not make a whole-person label true, and one success does not mean we are good at everything.
4. Other people can notice things about us that we miss, but their opinion is not the final answer.
5. We do not need to say positive things we do not believe. I'm still learning and I'm not sure yet are honest answers.$s5c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s5c_sm$A funny mirror can make a picture look stretched or squashed. Our self-picture can get stretched by one mistake, one compliment or one comparison too. A true mirror checks more than one example.$s5c_sm$,
  private_write_prompt   = $s5c_pw$Choose one part of your mirror and draw a real moment that shows it. You may tell someone about the moment or keep it private.$s5c_pw$,
  experiential_exercise  = $s5c_ex$TRUE MIRROR. On a paper mirror, draw or write two things you can support with examples: one thing you do well or enjoy, and one thing you are learning. Add a third space labelled not sure yet. Nobody has to show the page.
DRAW IT
Draw one picture of yourself doing something you are proud of and one picture of yourself learning something that is still hard. Both pictures belong in the same mirror.$s5c_ex$,
  guided_reflection      = $s5c_gr$Keep your eyes open and look at your mirror.
Ask:
What example shows this?
Is there anything the label leaves out?
Would I say this about myself every single day, or only sometimes?
You can change a label into a smaller, more accurate sentence.$s5c_gr$,
  journaling_prompt      = $s5c_jp$Draw one picture of yourself doing something you are proud of and one picture of yourself learning something that is still hard. Both pictures belong in the same mirror.$s5c_jp$,
  intention_prompt       = $s5c_ip$Choose one plan: When I call myself a big label, I will try to name one real example instead.$s5c_ip$,
  core_affirmation       = $s5c_ca$I can describe myself with true examples and keep learning new things about me.$s5c_ca$,
  weekly_practice_mon    = $s5c_pm$Notice one thing you did today and describe the action instead of using a big label.$s5c_pm$,
  weekly_practice_wed    = $s5c_pw2$Ask a trusted grown-up for one specific thing they have seen you do well, if you want to.$s5c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s5c_ps$Bring your mirror drawing back and add one new example you discovered about yourself. Sharing is optional.$s5c_ps$,
  previous_week_callback = $s5c_pwc$bring back your feelings body map and choose one new thing you noticed to share only if you want to$s5c_pwc$,
  facilitator_notes      = $s5c_fn$## Aim
Build specific, evidence-based self-description without appearance content, compulsory praise or peer evaluation.
## Run the room
No comments on children's bodies, appearance, weight or attractiveness, including positive comments. Do not require each child to name a strength publicly. Never tell a child what their "real self" is. Keep feedback specific to observable actions and make all feedback-seeking optional.
## Why this week exists — the evidence
People use selective information when judging themselves. For children, the safest translation is not a lesson on bias statistics; it is learning the difference between a global label and a specific example.
Real-world anchor: a funhouse mirror changes the picture without changing the person standing in front of it. Children already understand this visually. The activity uses that concrete idea to show why one mistake, one compliment or one comparison should not become a whole-person conclusion.
## Evidence quality
Moderate overall. Self-evaluation biases are well established in adults, but this child activity is an age-matched teaching adaptation rather than a validated assessment. The funhouse-mirror metaphor is illustrative only.
## We deliberately do not claim
- We do not claim children must feel positive about themselves all the time.
- We do not ask children to make affirmations they do not believe.
- We do not teach depressive realism.
- We do not use appearance, weight, food or body-rating exercises.
- We do not claim another person's view reveals a child's true identity.
## Source trail
- Self-evaluation/better-than-average research: adult evidence informs the general calibration principle.
- Child activities are concrete teaching adaptations, not diagnostic tools.$s5c_fn$,
  updated_at = now()
WHERE week_number = 5 AND audience = 'Child';

-- Week 6 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw6_theme$$cw6_theme$,
  the_territory        = $cw6_terr$Wishing you were like someone else$cw6_terr$,
  opening_question     = $cw6_oq$In which area does comparison show up most often for you — work, money, relationships, parenting, appearance, status, ability, something else? Passing is full participation.$cw6_oq$,
  week_type            = $cw6_wt$Standard$cw6_wt$,
  reflective_question  = $cw6_rq$Across the week, when did comparison give you useful information, and when did it create a moving target that was not relevant to your own goal?$cw6_rq$,
  interactive_activity = $cw6_ia$COMPARISON AUDIT. Make four columns: context; what I compared; information I had; information I did not have. Then add one possible alternative measure tied to your own goal or value. Use roles rather than names. Sharing is optional.$cw6_ia$,
  kids_picture_book    = $cw6_bk$Giraffes Can't Dance$cw6_bk$,
  kids_picture_book_author = $cw6_bka$Giles Andreae$cw6_bka$,
  kids_picture_book_note = $cw6_bkn$WHY THIS BOOK: Gerald notices what other animals can do and eventually finds a way of moving that fits him. Use it to discuss difference and practice, not everyone has one hidden special talent.
READ-ALOUD: Read live from a purchased copy.$cw6_bkn$,
  kids_picture_book_question = $cw6_bkq$What changed when Gerald stopped trying to move exactly like the other animals?$cw6_bkq$,
  kids_nz_alternative = $cw6_nz$Not yet selected$cw6_nz$,
  kids_nz_alternative_author = $cw6_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw6_nza$,
  kids_nz_alternative_note = $cw6_nzn$A future alternative should show different skills or ways of learning without ranking children.$cw6_nzn$,
  kids_colouring_prompt = $cw6_col$Colour a six-piece puzzle. Make every piece different. Leave one piece blank for something you have not discovered or learned yet.$cw6_col$,
  kids_game = $cw6_g$PUZZLE TEAM. Give small groups mixed cardboard puzzle pieces from several simple puzzles and let them sort which pieces belong together. Link it back: one piece only makes sense in context. Do not compare children's speed or performance.$cw6_g$,
  kids_game_equipment = $cw6_ge$Paper puzzle sheets; crayons; simple cardboard puzzles.$cw6_ge$,
  kids_game_under5 = $cw6_g5$Use large picture puzzle pieces and focus only on matching pieces to the right whole.$cw6_g5$,
  updated_at = now()
WHERE week_number = 6;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s6a_st$Getting Off the Loop$s6a_st$,
  theme_title            = $s6a_tt$$s6a_tt$,
  phase                  = 1,
  phase_name             = $s6a_pn$See Clearly$s6a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s6a_hk$Complete privately: I would feel like I'd made it if… Then ask: What standard did I just use, and where did I learn it?$s6a_hk$,
  s5_source_core_concept = $s6a_cc$Today the adult room treats comparison as information rather than a moral failure. We ask what we are measuring, whether the comparison is fair, and whether a value- or progress-based measure would be more relevant to the decision in front of us.$s6a_cc$,
  core_concept           = $s6a_cco$$s6a_cco$,
  teaching_points        = $s6a_tp$1. Social comparison is a normal human process, especially when objective standards are unclear.
2. Upward comparison can sometimes motivate and sometimes discourage; downward comparison can reassure and sometimes distort. The effect depends on context, interpretation and the person.
3. Modern feeds can increase the number and selectivity of available comparison targets, but the comparison instinct is much older than social media.
4. The useful question is not How do I stop comparing? It is What am I measuring, against whom, and is that the right measure for this decision?
5. Personal progress and values can provide alternative reference points, but they are not magic antidotes and should stay specific rather than becoming another performance standard.$s6a_tp$,
  video_link             = $s6a_vl$https://www.youtube.com/watch?v=SuF_mdyVNdM$s6a_vl$,
  video_description      = $s6a_vd$Current assignment: Johann Hari on social drivers of anxiety. Retain pending video review. Treat Hari as a writer synthesising research, not as the source of the studies he discusses, and do not use the video to claim comparison causes anxiety.$s6a_vd$,
  todays_theme           = $s6a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
LinkedIn, property values, school results, social feeds and conversations can turn other people's visible outcomes into instant benchmarks. The benchmark may be emotionally powerful while still missing most of the context.$s6a_tdt$,
  todays_world_vo_script = $s6a_tdv$Comparison can tell you what you care about. It cannot automatically tell you whether the standard is fair or useful.$s6a_tdv$,
  ancient_wisdom_reframe = $s6a_aw$Use enough as a philosophical question rather than a doctrine: Enough for what? According to which value? The aim is not resignation or an anti-ambition message; it is choosing a stopping rule rather than letting the benchmark move indefinitely.$s6a_aw$,
  ancient_wisdom_vo_script = $s6a_awv$A useful measure needs a stopping point. Otherwise the finish line can keep moving no matter how far you go.$s6a_awv$,
  signal_metaphor        = $s6a_sm$Comparison is like using somebody else's dashboard to decide whether your own trip is going well. Their speed may be visible; their route, destination and fuel are not.$s6a_sm$,
  private_write_prompt   = $s6a_pw$Write one comparison you noticed this week and the exact thing being measured: income, recognition, fitness, parenting, skill, freedom, relationships, something else.$s6a_pw$,
  experiential_exercise  = $s6a_ex$COMPARISON AUDIT. Make four columns: context; what I compared; information I had; information I did not have. Then add one possible alternative measure tied to your own goal or value. Use roles rather than names. Sharing is optional.$s6a_ex$,
  guided_reflection      = $s6a_gr$Keep your eyes open and choose one comparison.
Write:
The standard I used was:
Why that standard matters to me:
What the comparison leaves out:
A measure more relevant to my own goal might be:
You do not have to stop caring about the original standard.$s6a_gr$,
  journaling_prompt      = $s6a_jp$Across the week, when did comparison give you useful information, and when did it create a moving target that was not relevant to your own goal?$s6a_jp$,
  intention_prompt       = $s6a_ip$Write one if-then plan: When I notice comparison in [specific context], I will ask what measure actually fits my goal before I act on it.$s6a_ip$,
  core_affirmation       = $s6a_ca$I can notice comparison and choose a measure that fits what I actually care about.$s6a_ca$,
  weekly_practice_mon    = $s6a_pm$Catch one comparison and name the exact measure being used.$s6a_pm$,
  weekly_practice_wed    = $s6a_pw2$For one recurring comparison, write one piece of missing context and one personal measure that may be more relevant.$s6a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s6a_ps$Bring back your comparison audit and one pattern you noticed about when comparison appeared. Sharing details is optional.$s6a_ps$,
  previous_week_callback = $s6a_pwc$bring one piece of evidence that changed sharpened or complicated how you described yourself this week$s6a_pwc$,
  facilitator_notes      = $s6a_fn$## Aim
Turn comparison into a measurable process rather than telling members to stop doing a normal human behaviour.
## Run the room
Use contexts, not names. Do not let the room discuss absent people's lives or turn comparison into moral judgment. Avoid claims that social media is uniquely harmful or that self-comparison always improves wellbeing.
## Why this week exists — the evidence
Festinger's social-comparison theory established the broad idea that people use others as reference points, particularly when objective standards are unavailable. Subsequent work shows comparison effects vary by direction, target, interpretation and context.
Real-world anchor: Festinger published social-comparison theory in 1954, decades before social media. That matters because it prevents a shallow phones created comparison story. Digital platforms changed the quantity and selectivity of comparison targets; they did not invent the process.
## Evidence quality
Moderate overall. Social comparison is well established, while claims that one direction of comparison uniformly improves or harms wellbeing are too broad. Digital-platform effects vary substantially. The dashboard metaphor is illustrative only.
## We deliberately do not claim
- We do not claim upward comparison always lowers wellbeing.
- We do not claim self-referential comparison reliably improves wellbeing for everyone.
- We do not claim social media created comparison or should be deleted.
- We do not use a single small screen-time study as a universal rule.
- We do not claim imposter feelings affect high achievers in one simple or disproportionate way without context.
## Source trail
- Festinger, L. (1954). A Theory of Social Comparison Processes.
- Digital comparison research: treated as context-dependent rather than a single causal story.$s6a_fn$,
  updated_at = now()
WHERE week_number = 6 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s6t_st$The Race With the Moving Finish Line$s6t_st$,
  theme_title            = $s6t_tt$$s6t_tt$,
  phase                  = 1,
  phase_name             = $s6t_pn$See Clearly$s6t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s6t_hk$Think of one recent comparison — grades, sport, friends, gaming, clothes, followers, ability, something else. Keep the person private. Ask: What was I actually measuring?$s6t_hk$,
  s5_source_core_concept = $s6t_cc$Today the teen room does not try to stop comparison. We practise checking the measure: What am I comparing? What information is missing? Does this comparison help me make a useful choice about my own goal?$s6t_cc$,
  core_concept           = $s6t_cco$$s6t_cco$,
  teaching_points        = $s6t_tp$1. Social comparison is normal and existed long before phones.
2. A feed can make comparison targets more numerous and more selected, but it does not follow that every scrolling session harms wellbeing.
3. One experiment found benefits when a small sample of university students limited social-media use, but one study is a signal rather than a law and should not be generalised to every teen.
4. Comparison sometimes shows what you care about. It becomes less useful when the benchmark keeps moving or has little to do with your own goal.
5. A personal measure can be what did I practise, learn, finish or act on? rather than did I beat somebody else? It is an option, not a rule.$s6t_tp$,
  video_link             = $s6t_vl$https://www.youtube.com/watch?v=P6FORpg0KVo$s6t_vl$,
  video_description      = $s6t_vd$Current assignment: Cal Newport, Quit Social Media. Retain pending video review. Newport is a writer making an argument, not the source of a settled scientific finding. Do not turn the talk into an instruction to quit or delete apps.$s6t_vd$,
  todays_theme           = $s6t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Feeds, school, sport and group chats make other people's outcomes easy to see while hiding most of the context. Comparison can be useful or unhelpful depending on what is being measured and why.$s6t_tdt$,
  todays_world_vo_script = $s6t_tdv$The comparison may be real. The dataset may still be incomplete.$s6t_tdv$,
  ancient_wisdom_reframe = $s6t_aw$Use the image of a moving finish line: if the finish line changes every time somebody else gets ahead, the race cannot end. The point is not to stop ambition; it is to know what your own finish line is for this task.$s6t_aw$,
  ancient_wisdom_vo_script = $s6t_awv$A race only makes sense if you know what finish line you are actually running toward.$s6t_awv$,
  signal_metaphor        = $s6t_sm$Comparing your ordinary day with somebody else's selected post is like comparing a full match with someone else's highlight clip. The clip is real; it is still incomplete.$s6t_sm$,
  private_write_prompt   = $s6t_pw$Write one comparison from the last week and the exact thing being measured. Do not write the other person's name.$s6t_pw$,
  experiential_exercise  = $s6t_ex$EXIT INTERVIEW. For one comparison, write: what it promises; what information it gives; what it leaves out; whether it helps your own goal. Then design one alternative measure you could actually track. Sharing is optional.$s6t_ex$,
  guided_reflection      = $s6t_gr$Keep your eyes open.
Write:
I compared:
The measure was:
The missing information was:
A measure that fits my own goal better might be:
You can decide the original comparison is still useful. The exercise is about checking, not banning it.$s6t_gr$,
  journaling_prompt      = $s6t_jp$During the week, which comparisons helped you learn something useful and which created a finish line that moved as soon as you reached it?$s6t_jp$,
  intention_prompt       = $s6t_ip$Write one if-then plan: When I notice comparison in [specific context], I will ask what I am actually measuring before I decide what it means.$s6t_ip$,
  core_affirmation       = $s6t_ca$I can notice comparison without letting it choose the finish line for me.$s6t_ca$,
  weekly_practice_mon    = $s6t_pm$Notice one comparison thought and name the measure without judging yourself for having it.$s6t_pm$,
  weekly_practice_wed    = $s6t_pw2$Pick one comparison and write one piece of missing context plus one personal measure you could use instead.$s6t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s6t_ps$Bring back one pattern you noticed in your comparisons this week and whether the measure was useful. Sharing details is optional.$s6t_ps$,
  previous_week_callback = $s6t_pwc$bring one observation about a comparison that changed when you checked the missing information$s6t_pwc$,
  facilitator_notes      = $s6t_fn$## Aim
Teach comparison literacy without moralising about social media or turning personal values into another performance contest.
## Run the room
No names of peers, no appearance/body comparisons, and no instructions to delete apps. Do not ask teens to publicly state who they envy or wish they were like. Keep the focus on the measure and missing context.
## Why this week exists — the evidence
Social-comparison theory is longstanding and well established. Digital environments can change exposure to selected comparison targets, but average wellbeing effects are small and heterogeneous.
Real-world anchor: Hunt et al. (2018) randomly assigned about 140 university students to limit several social platforms or use them as usual and reported reductions in loneliness and depression over three weeks in the limited-use group. It is worth knowing and worth limiting: one small university sample is not a law for every teenager.
## Evidence quality
Moderate overall. Social comparison is well established. The specific 2018 social-media experiment is limited by sample, age group, duration and setting. The moving-finish-line metaphor is illustrative only.
## We deliberately do not claim
- We do not claim comparison never pays off.
- We do not claim social media has turned comparison to a universal maximum or causes poor mental health.
- We do not tell teens to quit, delete or mute accounts as a programme rule.
- We do not treat a single 30-minutes-per-day study as settled science.
- We do not use appearance, weight, food or body comparisons.
## Source trail
- Festinger, L. (1954). A Theory of Social Comparison Processes.
- Hunt, M. G., et al. (2018). No More FOMO: Limiting Social Media Decreases Loneliness and Depression. Journal of Social and Clinical Psychology.$s6t_fn$,
  updated_at = now()
WHERE week_number = 6 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s6c_st$Your Own Puzzle$s6c_st$,
  theme_title            = $s6c_tt$$s6c_tt$,
  phase                  = 1,
  phase_name             = $s6c_pn$See Clearly$s6c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s6c_hk$Hold up two different puzzle pieces and ask: Which one is better? After answers, show that they belong to different puzzles. Can we decide which is better without knowing what job each piece has?$s6c_hk$,
  s5_source_core_concept = $s6c_cc$Today the child room notices that comparing one part of ourselves with one part of somebody else can leave out most of both pictures. We can still admire, learn and practise while using our own progress as one useful measure.$s6c_cc$,
  core_concept           = $s6c_cco$$s6c_cco$,
  teaching_points        = $s6c_tp$1. Comparing is something people naturally do. It is not naughty or bad.
2. We often compare one thing — who runs faster, reads sooner, draws differently or gets picked first — while forgetting everything else about both people.
3. Seeing somebody do something well can help us learn if we turn the comparison into a question: What could I practise?
4. Our own progress is another useful measure: What can I do now that I could not do before?
5. Different does not mean better or worse, and nobody has to find something they are "amazing" at today.$s6c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s6c_sm$You are a puzzle with lots of pieces. Looking at one bright piece in somebody else's puzzle cannot tell you whether your puzzle is good. You need the whole picture and the job each piece is doing.$s6c_sm$,
  private_write_prompt   = $s6c_pw$Choose one puzzle piece and draw a small before / now picture showing something that changed through time or practice. You may tell someone or keep it private.$s6c_pw$,
  experiential_exercise  = $s6c_ex$YOUR PUZZLE. Give each child a large puzzle outline. Pieces can show: something I enjoy; something I practise; someone or something I care about; something I have learned; something I'm still learning; a blank piece for not sure yet. No ranking and no requirement that anything be unique.
DRAW IT
Draw yourself learning something in three tiny steps: starting, practising, now. The final picture does not need to show mastery.$s6c_ex$,
  guided_reflection      = $s6c_gr$Keep your eyes open and look at one puzzle piece.
Ask:
What am I comparing?
What do I know about the other person's whole picture?
What is one thing I can notice about my own progress instead?
If comparison still feels important, that is okay. We are checking it, not banning it.$s6c_gr$,
  journaling_prompt      = $s6c_jp$Draw yourself learning something in three tiny steps: starting, practising, now. The final picture does not need to show mastery.$s6c_jp$,
  intention_prompt       = $s6c_ip$Choose one plan: When I wish I could do what somebody else can do, I will ask what one small thing I could practise.$s6c_ip$,
  core_affirmation       = $s6c_ca$I can learn from other people and still pay attention to my own puzzle.$s6c_ca$,
  weekly_practice_mon    = $s6c_pm$Notice one comparison. Ask: What am I actually comparing?$s6c_pm$,
  weekly_practice_wed    = $s6c_pw2$Pick one thing you want to learn and practise one tiny step, if you want to.$s6c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s6c_ps$Bring your puzzle back and add one new piece about something you noticed or learned about yourself.$s6c_ps$,
  previous_week_callback = $s6c_pwc$bring your mirror drawing back and add one new example you discovered about yourself$s6c_pwc$,
  facilitator_notes      = $s6c_fn$## Aim
Normalise comparison while shifting children toward context, learning and progress without ranking or forced uniqueness.
## Run the room
Do not ask who children wish they were like or compare ability, appearance, bodies, food or family resources. Avoid everyone is amazing at something because some children will experience that as a test they cannot pass. Use different, learning and not sure yet.
## Why this week exists — the evidence
Social comparison is a normal human process. For children, the useful translation is concrete: one visible skill is only one piece of a much larger person, and comparison can be turned into information about what they might want to practise.
Real-world anchor: children already see rankings everywhere — fastest runner, reading groups, game scores, who gets picked first. The curriculum does not pretend these differences are unreal. It teaches that one ranking answers one narrow question and cannot measure a whole person.
## Evidence quality
Moderate overall. Social comparison is well established, but the puzzle activity is an age-matched teaching adaptation. Claims that self-comparison automatically improves wellbeing are not used. The puzzle metaphor is illustrative only.
## We deliberately do not claim
- We do not claim comparison is bad or should stop.
- We do not claim every child has one unique hidden talent.
- We do not claim comparing with a past self always improves motivation or wellbeing.
- We do not use appearance, weight, food or body comparisons.
- We do not rank children inside the activity.
## Source trail
- Festinger, L. (1954). A Theory of Social Comparison Processes. Adult evidence informs the general principle.
- Child activities are concrete teaching adaptations, not assessments.$s6c_fn$,
  updated_at = now()
WHERE week_number = 6 AND audience = 'Child';

-- Week 7 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw7_theme$$cw7_theme$,
  the_territory        = $cw7_terr$The unkind voice that says you're not good enough$cw7_terr$,
  opening_question     = $cw7_oq$What is the difference, for you, between useful self-correction and self-attack? Passing is full participation.$cw7_oq$,
  week_type            = $cw7_wt$Standard$cw7_wt$,
  reflective_question  = $cw7_rq$Across the week, which self-critical phrases repeated most often, and what changed when you translated one of them into specific behaviour, context and next action?$cw7_rq$,
  interactive_activity = $cw7_ia$CRITIC / COACH. Under the sentence, mark any global words: always, never, useless, failure, everyone, nobody. Rewrite it as three parts: what happened; what matters; one next action. Sharing the original sentence is optional; sharing only the rewritten structure is full participation.$cw7_ia$,
  kids_picture_book    = $cw7_bk$The Bad Seed$cw7_bk$,
  kids_picture_book_author = $cw7_bka$Jory John$cw7_bka$,
  kids_picture_book_note = $cw7_bkn$WHY THIS BOOK: It shows a character who has taken on a big negative label and begins making different choices without needing to prove the label was his whole identity.
READ-ALOUD: Read live from a purchased copy.$cw7_bkn$,
  kids_picture_book_question = $cw7_bkq$Was bad the whole story about the seed? What other things did we learn about him?$cw7_bkq$,
  kids_nz_alternative = $cw7_nz$Not yet selected$cw7_nz$,
  kids_nz_alternative_author = $cw7_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw7_nza$,
  kids_nz_alternative_note = $cw7_nzn$Choose a future alternative that separates behaviour from identity and does not require children to disclose criticism from home.$cw7_nzn$,
  kids_colouring_prompt = $cw7_col$Colour two speech bubbles: one labelled grumble and one labelled coach. Add a small symbol showing which bubble gives you something useful to do next.$cw7_col$,
  kids_game = $cw7_g$COACH IT. Facilitator reads neutral task statements such as I dropped the block tower or I forgot one word. Children choose from prepared coach cards: try again, ask for help, slow down, take a break, not sure yet. Nobody says insults or negative labels about another child.$cw7_g$,
  kids_game_equipment = $cw7_ge$Paper; crayons; prepared coach cards.$cw7_ge$,
  kids_game_under5 = $cw7_g5$Use only pictures for help, again, break, slow. Skip gremlin wording if it confuses or upsets the child.$cw7_g5$,
  updated_at = now()
WHERE week_number = 7;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s7a_st$Naming the Judge$s7a_st$,
  theme_title            = $s7a_tt$$s7a_tt$,
  phase                  = 1,
  phase_name             = $s7a_pn$See Clearly$s7a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s7a_hk$Read privately: You're probably not as good as you think. Other people are doing this better. Notice whether the wording feels familiar. Do not search for where it came from yet.$s7a_hk$,
  s5_source_core_concept = $s7a_cc$Today the adult room treats the inner critic as a pattern of self-talk, not a separate hidden person and not proof of damaged wiring. We practise noticing global, shaming or predictive language and translating it into specific information that could actually help.$s7a_cc$,
  core_concept           = $s7a_cco$$s7a_cco$,
  teaching_points        = $s7a_tp$1. Self-criticism and self-compassion are not opposites of accountability. The useful distinction is whether the language produces specific information and workable action or only global attack.
2. I'm a failure is global. I missed the deadline and need a different plan is specific. The second can still be uncomfortable without turning one event into identity.
3. Self-compassion research generally links a less punitive response to setbacks with adaptive coping and motivation, but effects vary and kindness is not a performance guarantee.
4. We do not need hormone stories to teach this. Popular claims that self-criticism simply raises cortisol and compassion switches on a settling system are more specific than the lesson requires.
5. The critic may persist. Success this week means recognising one pattern and answering it more usefully, not silencing it.$s7a_tp$,
  video_link             = $s7a_vl$https://www.youtube.com/watch?v=IvtZBUSplr4$s7a_vl$,
  video_description      = $s7a_vd$Current assignment: Kristin Neff on self-compassion. Retain pending routine video review. Use Neff's research as a source where appropriate; do not turn self-compassion into a guarantee of resilience, motivation or performance.$s7a_vd$,
  todays_theme           = $s7a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Self-criticism often borrows the language of performance: should, always, never, everyone else, not good enough. The practical question is whether the sentence gives you information you can use.$s7a_tdt$,
  todays_world_vo_script = $s7a_tdv$A harsh sentence can sound serious without being precise. Week 7 turns attack into information.$s7a_tdv$,
  ancient_wisdom_reframe = $s7a_aw$Compassion traditions distinguish recognising suffering from adding more suffering to it. Use that as a cultural lens: acknowledgment does not require indulgence or attack.$s7a_aw$,
  ancient_wisdom_vo_script = $s7a_awv$You can name a mistake clearly without making yourself the mistake.$s7a_awv$,
  signal_metaphor        = $s7a_sm$Think of two commentators: one heckles the player; one gives usable coaching. Both may notice a mistake, but only one tells you what to do next.$s7a_sm$,
  private_write_prompt   = $s7a_pw$Write one recurring self-critical sentence exactly as it appears. Choose something safe enough to work with in a group setting and keep it private.$s7a_pw$,
  experiential_exercise  = $s7a_ex$CRITIC / COACH. Under the sentence, mark any global words: always, never, useless, failure, everyone, nobody. Rewrite it as three parts: what happened; what matters; one next action. Sharing the original sentence is optional; sharing only the rewritten structure is full participation.$s7a_ex$,
  guided_reflection      = $s7a_gr$Keep your eyes open and compare the two versions.
Ask:
Which words are observations?
Which words are judgments or predictions?
What action does the critic make easier or harder?
What is the most accurate sentence I can write without pretending everything is fine?$s7a_gr$,
  journaling_prompt      = $s7a_jp$Across the week, which self-critical phrases repeated most often, and what changed when you translated one of them into specific behaviour, context and next action?$s7a_jp$,
  intention_prompt       = $s7a_ip$Write one if-then plan: When I notice [specific critic phrase], I will rewrite it as what happened, what matters and one next step.$s7a_ip$,
  core_affirmation       = $s7a_ca$I can correct what needs correcting without turning the correction into an attack on who I am.$s7a_ca$,
  weekly_practice_mon    = $s7a_pm$Notice one critic phrase and name it without arguing with it.$s7a_pm$,
  weekly_practice_wed    = $s7a_pw2$Rewrite one critic sentence into specific feedback and one next action.$s7a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s7a_ps$Bring one moment where you caught self-critical language and tried a more specific response. Sharing the original content is optional.$s7a_ps$,
  previous_week_callback = $s7a_pwc$bring back your comparison audit and one pattern you noticed about when comparison appeared$s7a_pwc$,
  facilitator_notes      = $s7a_fn$## Aim
Distinguish useful self-evaluation from global self-attack and give members a practical translation method.
## Run the room
Do not ask whose voice the critic sounds like, invite childhood sourcing or tell members criticism is secretly protective. Keep work in current language and behaviour. Do not frame self-compassion as softness, cure or performance hack.
## Why this week exists — the evidence
Self-compassion is a substantial research area associated with adaptive responses to failure and distress. The curriculum uses a narrow application: replacing global self-condemnation with accurate, humane and actionable language.
Real-world anchor: performance feedback works best when it identifies a behaviour and an adjustment. You're hopeless contains almost no actionable information; the first paragraph does not answer the question yet does. Week 7 applies the same information-quality test to internal feedback.
## Evidence quality
Moderate overall. Self-compassion has a broad evidence base, though causal effects and outcomes vary by design. The critic/coach exercise is a teaching translation rather than a validated treatment. The commentator metaphor is illustrative.
## We deliberately do not claim
- We do not name cortisol or other hormones as the mechanism of self-criticism.
- We do not claim the inner critic always formed in childhood or exists to protect you.
- We do not claim self-compassion always improves performance or motivation.
- We do not promise the critic will disappear.
- We do not diagnose self-critical thoughts as a clinical condition.
## Source trail
- Neff, K. D. — self-compassion research programme.
- Gilbert, P. — compassion-focused clinical framework; source lineage only, not a claim that Mindcast delivers CFT.$s7a_fn$,
  updated_at = now()
WHERE week_number = 7 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s7t_st$Introducing the Heckler$s7t_st$,
  theme_title            = $s7t_tt$$s7t_tt$,
  phase                  = 1,
  phase_name             = $s7t_pn$See Clearly$s7t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s7t_hk$Ask privately: If somebody coached your best friend using the exact words you sometimes use on yourself, would the feedback help them improve? No sharing required.$s7t_hk$,
  s5_source_core_concept = $s7t_cc$Today the teen room treats the inner critic as a style of self-talk. We do not need to prove where it came from. We learn to spot global attack and rewrite it as specific feedback that leaves room for action.$s7t_cc$,
  core_concept           = $s7t_cco$$s7t_cco$,
  teaching_points        = $s7t_tp$1. Self-critical thoughts are common and do not mean something is wrong with you.
2. The useful difference is attack versus information: I'm a loser is global; I avoided asking for help and I want to try earlier next time is specific.
3. Self-compassion research supports responding to mistakes without adding global self-condemnation, but it is not a guarantee that difficult feelings disappear.
4. The critic does not need a dramatic origin story. Sometimes a phrase comes from other people; sometimes it develops through repetition and expectation; sometimes we do not know.
5. You can notice a harsh thought without believing it, fighting it or replacing it with an unbelievable positive statement.$s7t_tp$,
  video_link             = $s7t_vl$https://www.youtube.com/watch?v=IvtZBUSplr4$s7t_vl$,
  video_description      = $s7t_vd$Current assignment: Kristin Neff on self-compassion. Retain pending routine review. Do not present self-compassion as a guaranteed way to increase performance, resilience or confidence.$s7t_vd$,
  todays_theme           = $s7t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
The heckler can sound like comments, rankings and jokes people hear online or at school: cringe, useless, everyone is better, you'll fail. Repetition makes the sentence familiar; it does not make it useful feedback.$s7t_tdt$,
  todays_world_vo_script = $s7t_tdv$A roast can be loud and still contain almost no information about what to do next.$s7t_tdv$,
  ancient_wisdom_reframe = $s7t_aw$Use the shadow image carefully: fighting a shadow is not useful, but neither is pretending the shadow contains hidden wisdom. The practical point is simply that attention can move from the attack to what is actually happening.$s7t_aw$,
  ancient_wisdom_vo_script = $s7t_awv$You do not have to win an argument with every harsh thought. You can notice it and choose a more useful sentence.$s7t_awv$,
  signal_metaphor        = $s7t_sm$A heckler shouts you're terrible. A coach says your timing was late; try again here. One attacks identity; the other gives information.$s7t_sm$,
  private_write_prompt   = $s7t_pw$Write one critic sentence you hear often enough to recognise. Keep it private and choose something safe enough for today.$s7t_pw$,
  experiential_exercise  = $s7t_ex$HECKLER / COACH. Under the sentence write: What actually happened? What part can I change? What would a useful coach say next? Do not require a positive reframe. Sharing the critic sentence is optional; sharing only the coaching structure is full participation.$s7t_ex$,
  guided_reflection      = $s7t_gr$Keep your eyes open.
Read the critic sentence once.
Then write:
The fact inside it, if any:
The exaggeration or prediction:
The next useful action:
If there is no useful fact, write none yet.$s7t_gr$,
  journaling_prompt      = $s7t_jp$Which critic phrases showed up this week, and which ones became easier to handle when you separated facts from insults and predictions?$s7t_jp$,
  intention_prompt       = $s7t_ip$Write one if-then plan: When I notice [critic phrase], I will ask what the useful coach version would say next.$s7t_ip$,
  core_affirmation       = $s7t_ca$I can notice a harsh thought and choose feedback that actually helps me.$s7t_ca$,
  weekly_practice_mon    = $s7t_pm$Count or notice critic moments without trying to stop them.$s7t_pm$,
  weekly_practice_wed    = $s7t_pw2$Rewrite one critic sentence into one specific piece of feedback and one next step.$s7t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s7t_ps$Bring back one moment where you noticed the heckler and tried a coach response. Sharing the original sentence is optional.$s7t_ps$,
  previous_week_callback = $s7t_pwc$bring back one pattern you noticed in your comparisons this week and whether the measure was useful$s7t_pwc$,
  facilitator_notes      = $s7t_fn$## Aim
Teach self-talk discrimination without inviting teens to disclose family material, painful origins or private criticism.
## Run the room
Never ask who taught you that? or require teens to share what the heckler says. Keep examples low-stakes. Do not describe the critic as a separate identity or tell teens the voice is not really you. If criticism echoes possible abuse or harm, do not explore it; follow MC-SAF-001.
## Why this week exists — the evidence
Self-compassion research provides support for a less punitive response to mistakes and setbacks. The curriculum translates that into a concrete distinction between global self-attack and specific actionable feedback.
Real-world anchor: sports, gaming and school feedback all become more useful when they point to an observable behaviour. You're bad is almost impossible to act on; you rushed the last step gives a target. The same information rule can be applied to internal language.
## Evidence quality
Moderate overall. Self-compassion has substantial research support, although outcomes and effect sizes vary. The heckler/coach exercise is a teaching tool rather than a clinical intervention.
## We deliberately do not claim
- We do not claim every inner critic formed as childhood protection.
- We do not claim self-criticism always decreases performance or self-compassion always increases it.
- We do not name cortisol or specific brain systems as the mechanism.
- We do not promise the heckler will disappear.
- We do not encourage disclosure of private or unsafe family material.
## Source trail
- Neff, K. D. — self-compassion research programme.
- Gilbert, P. — compassion-focused clinical source lineage; not a Mindcast treatment model.$s7t_fn$,
  updated_at = now()
WHERE week_number = 7 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s7c_st$Meeting the Gremlin$s7c_st$,
  theme_title            = $s7c_tt$$s7c_tt$,
  phase                  = 1,
  phase_name             = $s7c_pn$See Clearly$s7c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s7c_hk$Use two puppets or cards. One says You'll never get it. The other says That was hard; you can ask for help or try one more step. Ask: Which one gives useful information? Children may point or pass.$s7c_hk$,
  s5_source_core_concept = $s7c_cc$Today the child room notices grumpy or mean self-talk without treating it as truth. We can give the pattern a playful name, then ask whether the sentence is useful, specific and kind enough to help us know what to do next.$s7c_cc$,
  core_concept           = $s7c_cco$$s7c_cco$,
  teaching_points        = $s7c_tp$1. People sometimes have thoughts such as I can't do this, I'm bad at this or everyone else is better.
2. Having a mean thought does not make a child bad, and the thought does not automatically tell the truth.
3. A helpful sentence can still admit something is hard: I don't know this yet, I made a mistake, I need help.
4. We do not have to fight, defeat or get rid of every grumpy thought. We can notice it and choose what to do next.
5. Nobody has to tell the group what their mean self-talk says or who they have heard similar words from.$s7c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s7c_sm$Imagine a little heckler at the side of a playground shouting you can't do it. A useful coach stands nearby and says slow down, try this step, ask for help. We practise hearing the difference.$s7c_sm$,
  private_write_prompt   = $s7c_pw$Draw one made-up gremlin sentence about a safe task, such as You'll never finish that puzzle. Then draw a coach sentence that is honest and useful. You may keep both private.$s7c_pw$,
  experiential_exercise  = $s7c_ex$MEET THE GREMLIN. Children may draw a silly character for unhelpful self-talk and give it a non-person name such as Doubty or Grumble. Then draw a coach bubble beside it with one accurate, kind response. Do not ask children to identify who the gremlin sounds like. Sharing names or drawings is optional.
DRAW IT
Draw a three-panel comic: gremlin talks → I notice → coach gives one useful next step. The last panel does not need a perfect ending.$s7c_ex$,
  guided_reflection      = $s7c_gr$Keep your eyes open and look at the two speech bubbles.
Ask:
Does the gremlin tell me what actually happened?
Does it tell me what I can try next?
What would the coach say that is both true and kind?
You do not have to make the grumpy voice disappear.$s7c_gr$,
  journaling_prompt      = $s7c_jp$Draw a three-panel comic: gremlin talks → I notice → coach gives one useful next step. The last panel does not need a perfect ending.$s7c_jp$,
  intention_prompt       = $s7c_ip$Choose one plan: When I notice a grumpy thought, I will ask what a useful coach would say.$s7c_ip$,
  core_affirmation       = $s7c_ca$I can notice a grumpy thought and choose words that help me know what to do next.$s7c_ca$,
  weekly_practice_mon    = $s7c_pm$Notice one grumpy thought if it appears. You do not have to argue with it.$s7c_pm$,
  weekly_practice_wed    = $s7c_pw2$Try one coach sentence for a safe, ordinary mistake or hard task.$s7c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s7c_ps$Bring your gremlin-and-coach drawing back if you want to and choose one coach sentence you tried this week.$s7c_ps$,
  previous_week_callback = $s7c_pwc$bring your puzzle back and add one new piece about something you noticed or learned about yourself$s7c_pwc$,
  facilitator_notes      = $s7c_fn$## Aim
Externalise unhelpful self-talk lightly while protecting children from disclosure pressure and from the idea that adults know what their thoughts really mean.
## Run the room
Never ask who says that to you? If a child's gremlin independently repeats language suggesting harm from a caregiver or other adult, do not ask follow-up questions in the room; follow MC-SAF-001. Do not make children generate insults for a game. Use fixed, banal task examples only.
## Why this week exists — the evidence
Self-compassion research supports responding to mistakes without global self-condemnation. For children, the curriculum translates that into specific coach language rather than claims about hormones, brain systems or a hidden protective critic.
Real-world anchor: teachers and coaches give more usable feedback when they name the task rather than label the child. The tower fell because the base moved can guide another attempt; you're bad at building cannot. The child lesson makes that difference visible.
## Evidence quality
Moderate overall. Self-compassion has a meaningful research base, but the gremlin activity is a teaching adaptation rather than a validated treatment. The coach metaphor is illustrative only.
## We deliberately do not claim
- We do not claim the critic always formed in childhood or is always trying to protect the child.
- We do not claim the critic can or should be removed.
- We do not use cortisol, threat-system or brain-region explanations.
- We do not ask children to disclose harsh words from caregivers.
- We do not require children to believe a positive statement that feels untrue.
## Source trail
- Neff, K. D. — self-compassion research programme.
- Child coach/gremlin activities are teaching adaptations, not clinical interventions.$s7c_fn$,
  updated_at = now()
WHERE week_number = 7 AND audience = 'Child';

-- Week 8 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw8_theme$$cw8_theme$,
  the_territory        = $cw8_terr$The feeling hiding under the big feeling$cw8_terr$,
  opening_question     = $cw8_oq$Which emotion words do you use as catch-alls when the experience is actually more specific? Passing is full participation.$cw8_oq$,
  week_type            = $cw8_wt$Standard$cw8_wt$,
  reflective_question  = $cw8_rq$Across the week, which broad emotion labels became more specific, and did the more precise description change what you wanted to do next?$cw8_rq$,
  interactive_activity = $cw8_ia$EMOTION INVENTORY. For one low- to moderate-intensity recent emotion, write: word; body sensations; situation; first interpretation; one alternative interpretation; what action urge appeared. If a second emotion also fits, add it without ranking which is "real." Sharing is optional.$cw8_ia$,
  kids_picture_book    = $cw8_bk$The Colour Monster$cw8_bk$,
  kids_picture_book_author = $cw8_bka$Anna Llenas$cw8_bka$,
  kids_picture_book_note = $cw8_bkn$WHY THIS BOOK: It gives children a concrete way to sort and name different feelings while making room for more than one feeling at once.
READ-ALOUD: Read live from a purchased copy.$cw8_bkn$,
  kids_picture_book_question = $cw8_bkq$Can two colours or feelings show up together? What might that look like?$cw8_bkq$,
  kids_nz_alternative = $cw8_nz$How Do I Feel? A Dictionary of Emotions for Children$cw8_nz$,
  kids_nz_alternative_author = $cw8_nza$Rebekah Lipp, illustrated by Craig Phillips$cw8_nza$,
  kids_nz_alternative_note = $cw8_nzn$Use it as a vocabulary resource. Do not teach every definition as a rule about what an emotion is "really" telling a child.$cw8_nzn$,
  kids_colouring_prompt = $cw8_col$Colour an iceberg with several blank bubbles around it. Put a feeling word, colour or symbol in any bubbles you choose.$cw8_col$,
  kids_game = $cw8_g$FEELING SORT. Put feeling-word or face cards around the room. Read safe, made-up situations and let children stand near any card that might fit. More than one card can be correct and children may stay seated. Avoid racing or implying one hidden answer.$cw8_g$,
  kids_game_equipment = $cw8_ge$Feeling cards; iceberg sheets; crayons.$cw8_ge$,
  kids_game_under5 = $cw8_g5$Use four or five simple face/colour cards and allow pointing instead of moving.$cw8_g5$,
  updated_at = now()
WHERE week_number = 8;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s8a_st$Reading the Data Stream$s8a_st$,
  theme_title            = $s8a_tt$$s8a_tt$,
  phase                  = 1,
  phase_name             = $s8a_pn$See Clearly$s8a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s8a_hk$Write three emotion words from the last 48 hours. If you wrote bad, stressed or fine, see whether a more precise word fits. No sharing required.$s8a_hk$,
  s5_source_core_concept = $s8a_cc$Today the adult room treats emotions as data, not verdicts. We practise naming experience with more precision and asking what information the feeling might add, while staying open to the possibility that the first interpretation is incomplete or old.$s8a_cc$,
  core_concept           = $s8a_cco$$s8a_cco$,
  teaching_points        = $s8a_tp$1. Emotional granularity describes how specifically people distinguish and label emotional states rather than collapsing them into broad categories.
2. More precise naming can support more differentiated responses, but an emotion is not proof that an interpretation is correct.
3. Lisa Feldman Barrett's constructed-emotion account is one influential theory among competing models. We can use the practical idea that context and past experience shape emotion without presenting the theory as settled.
4. Primary/secondary emotion language can be a useful clinical heuristic, but anger is not always covering hurt, fear or shame. Sometimes anger is simply the best available label.
5. The task is not to dig until you find a "real" feeling. It is to improve description and then choose a response that fits the evidence and context.$s8a_tp$,
  video_link             = $s8a_vl$https://www.youtube.com/watch?v=HJSK3HpgFdM$s8a_vl$,
  video_description      = $s8a_vd$Current assignment: Lisa Feldman Barrett on constructed emotion. Retain pending routine video review. Present constructed-emotion theory as influential and debated, not as the settled neuroscience of emotion.$s8a_vd$,
  todays_theme           = $s8a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Messages, meetings and family conversations often produce broad labels such as stressed, annoyed or overwhelmed. A more precise word can change the range of responses available without claiming the feeling contains one hidden message.$s8a_tdt$,
  todays_world_vo_script = $s8a_tdv$The better question is not what is the emotion secretly telling me? It is what exactly am I feeling, and what evidence goes with it?$s8a_tdv$,
  ancient_wisdom_reframe = $s8a_aw$Use water as a cultural metaphor for movement and change, not as a claim that suppressed emotions inevitably build pressure. Feelings can change, return, fade or remain; the practice is noticing without requiring a particular outcome.$s8a_aw$,
  ancient_wisdom_vo_script = $s8a_awv$An emotion can move and change without needing to be forced away or treated as a command.$s8a_awv$,
  signal_metaphor        = $s8a_sm$Think of an emotion label as a folder name. Stressed may contain several different files — rushed, uncertain, disappointed, tired, worried. Opening the folder does not guarantee one hidden file; it gives you a better inventory.$s8a_sm$,
  private_write_prompt   = $s8a_pw$Choose one recent emotion and write the most precise word you can find for it. Then write the observable situation beside it without explaining why you felt that way.$s8a_pw$,
  experiential_exercise  = $s8a_ex$EMOTION INVENTORY. For one low- to moderate-intensity recent emotion, write: word; body sensations; situation; first interpretation; one alternative interpretation; what action urge appeared. If a second emotion also fits, add it without ranking which is "real." Sharing is optional.$s8a_ex$,
  guided_reflection      = $s8a_gr$Keep your eyes open and look at the emotion word.
Write:
What I felt:
What I know happened:
What I am assuming:
Another emotion or interpretation that might also fit:
What response would make sense even if I am still unsure:$s8a_gr$,
  journaling_prompt      = $s8a_jp$Across the week, which broad emotion labels became more specific, and did the more precise description change what you wanted to do next?$s8a_jp$,
  intention_prompt       = $s8a_ip$Write one if-then plan: When I notice myself using [broad emotion word], I will pause and name one more precise possibility before acting.$s8a_ip$,
  core_affirmation       = $s8a_ca$I can name what I feel more precisely without treating the feeling as the whole truth.$s8a_ca$,
  weekly_practice_mon    = $s8a_pm$Name one emotion more precisely than good, bad, fine or stressed.$s8a_pm$,
  weekly_practice_wed    = $s8a_pw2$For one feeling, separate what happened from what I think it means.$s8a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s8a_ps$Bring one moment where you named an emotion more precisely and notice whether that changed your response. Sharing details is optional.$s8a_ps$,
  previous_week_callback = $s8a_pwc$bring one moment where you caught self-critical language and tried a more specific response$s8a_pwc$,
  facilitator_notes      = $s8a_fn$## Aim
Train emotional vocabulary and interpretation discipline without doing trauma exploration or claiming every emotion hides another one.
## Run the room
Keep examples current and moderate. Do not ask members to trace emotion patterns to childhood or hidden wounds. Avoid what is underneath? as a demand; use what else might fit? Nobody shares private content unless they choose.
## Why this week exists — the evidence
Research on emotion differentiation/granularity suggests that distinguishing emotional states more precisely is associated with more flexible regulation and coping. Affect-labelling studies support the narrower claim that putting emotional experience into words changes how it is processed.
Real-world anchor: weather reports become more useful when bad weather becomes heavy rain, strong wind and low visibility. The increased precision does not tell you what to do automatically; it gives you better data for a decision. Week 8 applies the same logic to emotion words.
## Evidence quality
Moderate overall. Emotional differentiation has a meaningful evidence base, though much of it is correlational. Affect labelling has experimental support. Constructed-emotion theory is influential and contested. Primary/secondary emotion structures are useful heuristics, not universal laws.
## We deliberately do not claim
- We do not claim emotions are always accurate or always point to a true need.
- We do not claim anger always covers fear, hurt, shame or exhaustion.
- We do not claim constructed-emotion theory is settled science.
- We do not claim there are exactly six, eight or another fixed number of basic emotions.
- We do not use emotion naming as trauma processing.
## Source trail
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words.
- Barrett, L. F. — theory of constructed emotion; presented as debated.
- Emotion differentiation/granularity literature — used for the precision principle, not a clinical promise.$s8a_fn$,
  updated_at = now()
WHERE week_number = 8 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s8t_st$Optimising the Notification System$s8t_st$,
  theme_title            = $s8t_tt$$s8t_tt$,
  phase                  = 1,
  phase_name             = $s8t_pn$See Clearly$s8t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s8t_hk$Ask teens to choose privately between fine, stressed, annoyed, tired, left out, nervous, disappointed, excited or another word for how the last day has felt. No show of hands.$s8t_hk$,
  s5_source_core_concept = $s8t_cc$Today the teen room practises emotional precision. We do not dig until we find a supposedly "real" hidden emotion. We name what fits, separate feeling from interpretation, and stay open to more than one possible explanation.$s8t_cc$,
  core_concept           = $s8t_cco$$s8t_cco$,
  teaching_points        = $s8t_tp$1. Emotional granularity means distinguishing emotions with more precision instead of collapsing everything into broad labels.
2. More precise naming is associated with more flexible emotion regulation, but it does not mean people with less precise vocabulary have poor mental health.
3. Anger can occur alongside hurt, fear, embarrassment, tiredness or none of those. Anger is always secondary is too strong.
4. Naming a feeling can be useful; it does not guarantee the feeling gets smaller or that the interpretation behind it is correct.
5. You do not have to tell another person what you are feeling for the skill to count. Private naming is full participation.$s8t_tp$,
  video_link             = $s8t_vl$https://www.youtube.com/watch?v=tGdsOXZpyWE$s8t_vl$,
  video_description      = $s8t_vd$Current assignment: Marc Brackett on emotional intelligence / RULER. Retain pending routine video review. Treat the speaker as a researcher where discussing his own work, and avoid turning any framework into a universal model of emotion.$s8t_vd$,
  todays_theme           = $s8t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Group chats and school conversations often compress a lot of experience into fine, whatever, mad or stressed. More precise language can make the next decision clearer without requiring public disclosure.$s8t_tdt$,
  todays_world_vo_script = $s8t_tdv$A better emotion word gives you more information. It does not prove your first interpretation is right.$s8t_tdv$,
  ancient_wisdom_reframe = $s8t_aw$Use zanshin only as a cultural example of sustained awareness in Japanese martial traditions, not as a claim that samurai practised modern emotional intelligence or that awareness equals mastery.$s8t_aw$,
  ancient_wisdom_vo_script = $s8t_awv$Awareness can include noticing your own state. That does not require pretending emotion is weakness or a problem to defeat.$s8t_awv$,
  signal_metaphor        = $s8t_sm$A notification saying something happened is useful, but you still have to open the message and check the context. Emotion words work similarly: they alert you without giving the whole story.$s8t_sm$,
  private_write_prompt   = $s8t_pw$Choose one recent feeling and write the most specific word you can. Beside it write only what happened, not why you think it happened.$s8t_pw$,
  experiential_exercise  = $s8t_ex$EMOTION ARCHAEOLOGY — WITHOUT THE DIG. Write a broad label, then list up to three more specific feelings that might fit. For each, mark fits, maybe, or not sure. Add one observable fact from the situation. Do not require a deepest level or a hidden primary emotion. Sharing is optional.$s8t_ex$,
  guided_reflection      = $s8t_gr$Keep your eyes open.
Write:
The emotion word I chose:
What actually happened:
The story I'm adding:
Another word or interpretation that could also fit:
You can leave the last line blank.$s8t_gr$,
  journaling_prompt      = $s8t_jp$Which broad emotion words became more specific this week, and did a different word change the action you wanted to take?$s8t_jp$,
  intention_prompt       = $s8t_ip$Write one if-then plan: When I notice myself saying [fine/stressed/mad/other broad word], I will try one more precise word before I respond.$s8t_ip$,
  core_affirmation       = $s8t_ca$I can name what I feel without letting one feeling decide the whole story.$s8t_ca$,
  weekly_practice_mon    = $s8t_pm$Name one strong or noticeable feeling with one more precise word.$s8t_pm$,
  weekly_practice_wed    = $s8t_pw2$Separate one feeling into what happened and what I think it means. Keep it private if you want.$s8t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s8t_ps$Bring one time you practised more precise emotion naming and notice what changed, if anything. Sharing details is optional.$s8t_ps$,
  previous_week_callback = $s8t_pwc$bring back one moment where you noticed the heckler and tried a coach response$s8t_pwc$,
  facilitator_notes      = $s8t_fn$## Aim
Improve emotion vocabulary without hidden-depth assumptions, clinical processing or forced sharing.
## Run the room
Do not require Levels 2 or 3, ask what an emotion is protecting, or make underneath the goal. Keep examples current and safe. No eyes-closed recall. Private work counts fully.
## Why this week exists — the evidence
Emotion differentiation research supports the practical value of using more precise labels, and affect-labelling research supports naming as a measurable process. Neither requires the claim that one emotion always hides another.
Real-world anchor: a student saying school is bad has fewer options than a student who can distinguish bored in this class, nervous about the test and frustrated by the group project. Precision changes the problem definition before it changes the feeling.
## Evidence quality
Moderate overall. Emotional differentiation has meaningful but substantially correlational evidence. Affect labelling has experimental support. Primary/secondary emotion models are useful heuristics rather than universal structures.
## We deliberately do not claim
- We do not claim emotions always point to a true need or value.
- We do not claim anger always hides another emotion.
- We do not claim emotional flooding simply shuts down rational processing.
- We do not claim constructed-emotion or basic-emotion models are uniquely settled.
- We do not require disclosure of hidden feelings.
## Source trail
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words.
- Brackett, M. — emotion-labeling / RULER research programme; framework is not treated as universal.$s8t_fn$,
  updated_at = now()
WHERE week_number = 8 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s8c_st$The Feelings Iceberg$s8c_st$,
  theme_title            = $s8c_tt$$s8c_tt$,
  phase                  = 1,
  phase_name             = $s8c_pn$See Clearly$s8c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s8c_hk$Show three cards: grumpy, worried, left out. Ask: Could a person feel more than one of these at the same time? Children may point or pass.$s8c_hk$,
  s5_source_core_concept = $s8c_cc$Today the child room learns that feelings can have lots of names. A big feeling such as grumpy or angry might happen beside tired, worried, disappointed or left out — or it might not. We practise finding words without hunting for one secret feeling underneath.$s8c_cc$,
  core_concept           = $s8c_cco$$s8c_cco$,
  teaching_points        = $s8c_tp$1. Feelings can be named with lots of different words.
2. More than one feeling can happen at the same time.
3. A big feeling does not always hide a smaller or sadder one.
4. Naming a feeling can help us explain what is happening, but it does not always make the feeling smaller.
5. Nobody has to tell the group a private feeling. Not sure and passing are good answers.$s8c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s8c_sm$Imagine a box of coloured pencils. Saying I feel bad is like saying give me a colour. Finding a more exact feeling word is like choosing dark blue, orange or green. More detail helps, but there is no one secret colour underneath.$s8c_sm$,
  private_write_prompt   = $s8c_pw$Choose one broad feeling word and draw two other feelings that could happen beside it. You may tell someone, point or keep the page private.$s8c_pw$,
  experiential_exercise  = $s8c_ex$FEELINGS ICEBERG — MANY POSSIBILITIES. Use an iceberg sheet with one broad feeling above the water and several blank spaces below labelled might also be. Children may add words or colours such as tired, worried, disappointed, embarrassed or not sure. Make clear that the lower spaces are possibilities, not hidden truths. Facilitator uses a fixed banal example, never personal disclosure.
DRAW IT
Draw today's feelings using as many or as few colours as you want. Add one word if you know it. Not sure is allowed.$s8c_ex$,
  guided_reflection      = $s8c_gr$Keep your eyes open and look at the feeling words.
Ask:
Which word fits best right now, if any?
Could another word fit too?
Am I sure, maybe, or not sure?
You do not have to dig for a deeper feeling.$s8c_gr$,
  journaling_prompt      = $s8c_jp$Draw today's feelings using as many or as few colours as you want. Add one word if you know it. Not sure is allowed.$s8c_jp$,
  intention_prompt       = $s8c_ip$Choose one plan: When I notice a big feeling, I will try one more feeling word before I decide what to do.$s8c_ip$,
  core_affirmation       = $s8c_ca$I can learn more words for my feelings, and I do not have to know the perfect word every time.$s8c_ca$,
  weekly_practice_mon    = $s8c_pm$Try one more precise feeling word when you notice a big feeling.$s8c_pm$,
  weekly_practice_wed    = $s8c_pw2$Ask a trusted grown-up for a feeling word you do not know yet, if you want to.$s8c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s8c_ps$Bring a new feelings drawing and one feeling word you noticed this week. Sharing is optional.$s8c_ps$,
  previous_week_callback = $s8c_pwc$bring your gremlin-and-coach drawing back if you want and choose one coach sentence you tried$s8c_pwc$,
  facilitator_notes      = $s8c_fn$## Aim
Expand feeling vocabulary without teaching children that anger or grumpiness always conceals one truer emotion.
## Run the room
Do not ask what is really underneath or reward children for finding sadness/fear. Use might also be and not sure. Never use personal facilitator disclosures. Do not screen copyrighted film clips; Story is read live from a purchased copy.
## Why this week exists — the evidence
Emotion differentiation describes the ability to use more specific emotion labels. For children, the curriculum translates that into vocabulary practice and permission for multiple or uncertain labels.
Real-world anchor: a child saying I feel bad may need very different support if the better word is tired, left out, worried or disappointed. More precise language improves the description even when it does not change the feeling.
## Evidence quality
Moderate overall. Emotion differentiation has a meaningful evidence base, much of it correlational. This iceberg activity is a teaching adaptation, not a clinical assessment. The colour/iceberg metaphors are illustrative.
## We deliberately do not claim
- We do not claim anger or grumpiness always hides fear, hurt or sadness.
- We do not claim a feeling always contains a true message.
- We do not claim naming a feeling always makes it easier or smaller.
- We do not claim one fixed number of basic emotions.
- We do not require children to disclose private feelings.
## Source trail
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words.
- Emotion differentiation/granularity literature informs the vocabulary principle.$s8c_fn$,
  updated_at = now()
WHERE week_number = 8 AND audience = 'Child';

-- Week 9 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw9_theme$$cw9_theme$,
  the_territory        = $cw9_terr$Noticing an old strategy without reopening the event behind it$cw9_terr$,
  opening_question     = $cw9_oq$Which kinds of strategies can help in one situation and become costly in another — avoiding, over-preparing, pleasing, withdrawing, controlling, staying hyper-independent, something else? Talk generally or pass.$cw9_oq$,
  week_type            = $cw9_wt$Standard$cw9_wt$,
  reflective_question  = $cw9_rq$During the week, where did this strategy help, where did it create a cost, and what present-day information helped you decide whether to use it?$cw9_rq$,
  interactive_activity = $cw9_ia$STRATEGY MAP. On one page write: strategy; situations where it helps; situations where it costs me; what signal tells me it has switched on; one safer or more flexible option I could test. Do not identify the original hurt. Sharing is optional; keeping the map private is full participation.$cw9_ia$,
  kids_picture_book    = $cw9_bk$The Rabbit Listened$cw9_bk$,
  kids_picture_book_author = $cw9_bka$Cori Doerrfeld$cw9_bka$,
  kids_picture_book_note = $cw9_bkn$WHY THIS BOOK: The story shows several responses to a child's upset and makes room for listening without forcing the child to explain or fix the feeling immediately.
READ-ALOUD: Read live from a purchased copy.$cw9_bkn$,
  kids_picture_book_question = $cw9_bkq$What did the rabbit do that was different from the other animals? Did Taylor have to tell everything straight away?$cw9_bkq$,
  kids_nz_alternative = $cw9_nz$Not yet selected$cw9_nz$,
  kids_nz_alternative_author = $cw9_nza$use the main book until an Aotearoa title has been reviewed for this high-safeguarding theme.$cw9_nza$,
  kids_nz_alternative_note = $cw9_nzn$Any future alternative must support safe help-seeking without secrecy, disclosure pressure or the idea that the programme replaces caregivers.$cw9_nzn$,
  kids_colouring_prompt = $cw9_col$Colour a pocket with a small stone and three helper symbols nearby — a trusted grown-up, a speech bubble saying I need help, and one calm place.$cw9_col$,
  kids_game = $cw9_g$SAFE HANDOVER. Children carry a soft toy or block across a short space and hand it to a clearly identified safe adult at the end. The task is the handover, not speed. Say: When something is hard to carry, asking a safe grown-up for help is one option. No child is asked to name a real problem.$cw9_g$,
  kids_game_equipment = $cw9_ge$Smooth stones or paper stones; crayons; soft toys/blocks.$cw9_ge$,
  kids_game_under5 = $cw9_g5$Use only the helper side. Children choose a helper picture and practise the words help please.$cw9_g5$,
  updated_at = now()
WHERE week_number = 9;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s9a_st$The Kintsugi Audit$s9a_st$,
  theme_title            = $s9a_tt$$s9a_tt$,
  phase                  = 1,
  phase_name             = $s9a_pn$See Clearly$s9a_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s9a_hk$Write privately: Is there one way you handle trust, conflict, help, closeness or control that sometimes feels older than the situation in front of you? Do not write what happened to create it.$s9a_hk$,
  s5_source_core_concept = $s9a_cc$Today the adult room looks at strategies, not wounds. Some ways of coping may have made sense in an earlier environment and may still be useful in some situations. We practise noticing one strategy, what it currently does, and whether we want to keep, adapt or seek qualified support around it.$s9a_cc$,
  core_concept           = $s9a_cco$$s9a_cco$,
  teaching_points        = $s9a_tp$1. The original Adverse Childhood Experiences study found population-level associations between categories of childhood adversity and later health outcomes. An ACE score is not a diagnosis, an individual prediction or a measure of destiny.
2. The original sample was specific — insured, largely middle-class adults in one health system — and later research has broadened the evidence base while also showing the limits of using a simple count as an individual risk tool.
3. Past experience can shape present expectations and coping patterns, but no group session can infer the cause of a member's current behaviour from a childhood story.
4. Developmental trauma is used in some clinical literature, but it is not a formal DSM diagnosis. Mindcast does not diagnose trauma or ask members to identify whether they have it.
5. Referral is success. If a current strategy is connected with distress, danger, trauma symptoms or material that needs treatment, the correct next step is qualified support rather than deeper group exploration.$s9a_tp$,
  video_link             = $s9a_vl$https://www.youtube.com/watch?v=95ovIJ3dsNk$s9a_vl$,
  video_description      = $s9a_vd$Current assignment: Nadine Burke Harris on ACEs. Retain pending video review. If used, the facilitator must explicitly state that ACE research describes population associations and that an ACE score does not predict an individual's future.$s9a_vd$,
  todays_theme           = $s9a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Old strategies often appear in ordinary situations: reading a room before speaking, avoiding asking for help, over-preparing, keeping distance or taking responsibility for everything. The strategy can be visible without retelling the event that shaped it.$s9a_tdt$,
  todays_world_vo_script = $s9a_tdv$You can examine what a strategy does today without reopening why you first needed it.$s9a_tdv$,
  ancient_wisdom_reframe = $s9a_aw$Kintsugi can be used only as a cultural image of visible repair. Do not romanticise injury, imply damage creates beauty, or ask members to display their "cracks". Repair is not owed to the room and suffering does not need to become meaningful.$s9a_aw$,
  ancient_wisdom_vo_script = $s9a_awv$A repaired object does not erase its history. The useful lesson is simply that history and present function are not the same thing.$s9a_awv$,
  signal_metaphor        = $s9a_sm$Think of an old software setting that once solved a real problem. The question is not who installed it? today. It is what does this setting do now, and is it still the right setting for this context?$s9a_sm$,
  private_write_prompt   = $s9a_pw$Choose one present-day strategy you are willing to examine: I learned to keep distance / do it myself / stay quiet / prepare for everything / please people / stay in control / something else. Do not write the event behind it.$s9a_pw$,
  experiential_exercise  = $s9a_ex$STRATEGY MAP. On one page write: strategy; situations where it helps; situations where it costs me; what signal tells me it has switched on; one safer or more flexible option I could test. Do not identify the original hurt. Sharing is optional; keeping the map private is full participation.$s9a_ex$,
  guided_reflection      = $s9a_gr$Eyes open. You're going to write, not visualise, and you're writing only for yourself.
Choose one strategy from your page. You do not need to write down what happened in the past or bring it to mind in detail.
Write:
I learned to:
This strategy can help when:
It can cost me when:
One option I have now is:
If your mind moves toward the event itself, return to the present-day strategy. You do not need to finish every line.$s9a_gr$,
  journaling_prompt      = $s9a_jp$During the week, where did this strategy help, where did it create a cost, and what present-day information helped you decide whether to use it?$s9a_jp$,
  intention_prompt       = $s9a_ip$Write one if-then plan: When I notice [specific cue] switching this strategy on, I will pause and check whether the current situation still requires it.$s9a_ip$,
  core_affirmation       = $s9a_ca$I can respect why a strategy may exist without assuming I need it in every situation now.$s9a_ca$,
  weekly_practice_mon    = $s9a_pm$Notice one moment when the strategy appears. Name only the strategy and the current cue.$s9a_pm$,
  weekly_practice_wed    = $s9a_pw2$Write one situation where the strategy is useful and one where you might want another option. No disclosure required.$s9a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s9a_ps$Bring one observation about how the strategy worked this week, or simply whether you noticed it more clearly. Sharing details is optional.$s9a_ps$,
  previous_week_callback = $s9a_pwc$bring one moment where you named an emotion more precisely and notice whether that changed your response$s9a_pwc$,
  facilitator_notes      = $s9a_fn$## Aim
Keep a high-risk theme firmly in present-day pattern awareness and outside trauma processing.
## Run the room
No eyes-closed recall, no hand-on-heart staging, no childhood-event prompts, no "what happened to you?", no asking members to name a wound. Do not interpret strategies as trauma responses. Have referral resources physically available. If distress escalates beyond ordinary grounding, stop and refer; do not deepen the exercise.
## Why this week exists — the evidence
Felitti et al. (1998) established an important population-level association between categories of childhood adversity and later health outcomes. The study is foundational and frequently overextended. ACE scores do not tell a specific person what will happen to them and should not be used here as screening, diagnosis or prediction.
Real-world anchor: online ACE questionnaires often return a single number that looks individual and precise even though the original research was designed to examine population associations. Week 9 uses that mismatch as the lesson: a useful research tool can become misleading when its purpose changes.
## Evidence quality
Moderate overall. Associations between childhood adversity and later health are strong at population level. Individual prediction from a simple ACE count is weak and incomplete. The present-day strategy map is a non-clinical teaching exercise, not trauma assessment or treatment. Kintsugi is illustrative only.
## We deliberately do not claim
- We do not claim an ACE score predicts an individual's future.
- We do not claim awareness or support automatically modifies ACE-related outcomes.
- We do not claim developmental trauma is a formal DSM diagnosis.
- We do not claim a current strategy proves a particular past event occurred.
- We do not claim naming, acknowledging or sharing a wound heals it.
- We do not provide trauma therapy or trauma processing.
## Source trail
- Felitti, V. J., et al. (1998). Relationship of Childhood Abuse and Household Dysfunction to Many of the Leading Causes of Death in Adults. American Journal of Preventive Medicine.
- ACE research is used at population level here; individual scores are not treated as diagnoses or predictions.$s9a_fn$,
  updated_at = now()
WHERE week_number = 9 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s9t_st$The Update Nobody Installed on Purpose$s9t_st$,
  theme_title            = $s9t_tt$$s9t_tt$,
  phase                  = 1,
  phase_name             = $s9t_pn$See Clearly$s9t_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s9t_hk$Write privately: Is there one way you react now that sometimes feels automatic — stay quiet, joke, leave, over-prepare, please, avoid asking, keep control? Do not write why it started.$s9t_hk$,
  s5_source_core_concept = $s9t_cc$Today the teen room works with present-day coping strategies, not trauma stories. A strategy may have made sense in an earlier situation and may still help sometimes. We notice where it helps, where it costs us and whether another option is available now.$s9t_cc$,
  core_concept           = $s9t_cco$$s9t_cco$,
  teaching_points        = $s9t_tp$1. Difficult experiences in childhood and adolescence are associated at population level with later health and wellbeing outcomes. They do not determine what will happen to one young person.
2. An ACE score is not a diagnosis, a destiny score or something teens need to calculate in this programme.
3. Current behaviour can have many causes. We do not infer trauma, abuse or a hidden wound from avoidance, people-pleasing, anger, independence or any other strategy.
4. A strategy can be both understandable and costly. It made sense then does not mean I must keep doing it, and I want to change it does not mean the original strategy was stupid.
5. If something from the past needs support beyond this exercise, telling a trusted adult and getting qualified help is the correct outcome.$s9t_tp$,
  video_link             = $s9t_vl$https://www.youtube.com/watch?v=95ovIJ3dsNk$s9t_vl$,
  video_description      = $s9t_vd$Current assignment: Nadine Burke Harris on ACEs. Retain pending video review. If shown to teens, the facilitator must state that ACE research describes population patterns, not individual destiny, diagnosis or a score teens should calculate for themselves.$s9t_vd$,
  todays_theme           = $s9t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Present-day strategies can show up in ordinary places: leaving a group chat before anyone can exclude you, pretending not to care, over-preparing, staying quiet, making a joke, or never asking for help. You can notice the pattern without telling anyone the private history behind it.$s9t_tdt$,
  todays_world_vo_script = $s9t_tdv$You do not owe the room the story. Today we only look at what the strategy does now.$s9t_tdv$,
  ancient_wisdom_reframe = $s9t_aw$Use repair as a simple metaphor: something can have a history and still function differently now. Do not romanticise hurt, frame suffering as character-building or imply teens should be grateful for difficult experiences.$s9t_aw$,
  ancient_wisdom_vo_script = $s9t_awv$History matters, but it does not write every next move for you.$s9t_awv$,
  signal_metaphor        = $s9t_sm$An old phone setting can keep switching on because it was useful once. You can check what the setting does now without opening every old file that explains why it was installed.$s9t_sm$,
  private_write_prompt   = $s9t_pw$Choose one present-day strategy you are comfortable examining: stay quiet / joke / leave / over-prepare / please / avoid asking / keep control / something else. Do not write the event behind it.$s9t_pw$,
  experiential_exercise  = $s9t_ex$STRATEGY CHECK. Make four boxes: when this strategy helps; when it costs me; the cue that switches it on; one other safe option I could try. Do not write or share the event that may have shaped it. Sharing is optional; keeping the page private is full participation.$s9t_ex$,
  guided_reflection      = $s9t_gr$Keep your eyes open and look at your strategy page.
Write:
The strategy is:
It can help when:
It can cost me when:
One option I have now is:
You do not need to remember, explain or disclose where the strategy came from. If your mind goes there, come back to what the strategy does today.$s9t_gr$,
  journaling_prompt      = $s9t_jp$Across the week, when did this strategy help you, when did it get in the way, and what current information helped you decide whether to use it?$s9t_jp$,
  intention_prompt       = $s9t_ip$Write one if-then plan: When I notice [specific cue] switching this strategy on, I will check whether the current situation still needs it.$s9t_ip$,
  core_affirmation       = $s9t_ca$I can notice a strategy without telling anyone my private story, and I can choose what fits the situation now.$s9t_ca$,
  weekly_practice_mon    = $s9t_pm$Notice the strategy once and name only what is happening now.$s9t_pm$,
  weekly_practice_wed    = $s9t_pw2$Write one situation where the strategy helps and one where another option might work better. Keep it private if you want.$s9t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s9t_ps$Bring one observation about the strategy from this week, or simply whether you noticed it sooner. Sharing details is optional.$s9t_ps$,
  previous_week_callback = $s9t_pwc$bring one time you practised more precise emotion naming and notice what changed if anything$s9t_pwc$,
  facilitator_notes      = $s9t_fn$## Aim
Make Week 9 safe enough for non-clinical youth facilitation by keeping all work in present-day strategy and away from trauma disclosure.
## Run the room
No what happened to you, no something you've never told anyone, no private trauma journaling, no eyes-closed recall and no encouraging teens to tell someone a small truth about a wound as homework. Explicitly remind the room that private history does not need to be shared. If a teen indicates they are unsafe or discloses harm, stop lesson exploration and follow MC-SAF-001.
## Why this week exists — the evidence
ACE research shows meaningful population associations between childhood adversity and later outcomes, but an ACE count is not an individual prediction. The lesson uses that evidence only to justify the modest idea that earlier experience can matter; it does not ask teens to classify their own history.
Real-world anchor: online ACE quizzes can make a population research instrument look like a personal risk score. A teen can easily interpret a number as this is what my future will be. That interpretation is not supported and is exactly why the curriculum keeps the focus on current strategies and available support.
## Evidence quality
Moderate overall. Population-level adversity associations are robust. Individual prediction from simple ACE counts is limited. The strategy-check activity is a non-clinical teaching exercise, not trauma screening or treatment.
## We deliberately do not claim
- We do not claim difficult experiences have a uniquely greater impact during adolescence or that adolescence is a special window for healing neural pathways.
- We do not claim avoidance is always a predictor of long-term psychological difficulty or that acknowledgment is always better.
- We do not claim awareness and support determine outcomes.
- We do not diagnose trauma or infer it from current behaviour.
- We do not encourage secrecy from caregivers or disclosure to Mindcast facilitators.
## Source trail
- Felitti, V. J., et al. (1998). ACE study; population association, not individual prediction.
- Youth safeguarding governed by MC-SAF-001; referral is success when material exceeds scope.$s9t_fn$,
  updated_at = now()
WHERE week_number = 9 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s9c_st$The Stone in Your Pocket$s9c_st$,
  theme_title            = $s9c_tt$$s9c_tt$,
  phase                  = 1,
  phase_name             = $s9c_pn$See Clearly$s9c_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s9c_hk$Hold a smooth stone and say: Sometimes a feeling can stay with us for a while, a bit like noticing a stone in your pocket. We do not need to tell the room why it is there. Today we practise noticing and choosing help.$s9c_hk$,
  s5_source_core_concept = $s9c_cc$Today the child room learns that a hard feeling can stay around after a hard moment. We do not need to tell the group what happened. We can notice the feeling, choose a safe grown-up or helpful action, and remember that asking for help is allowed.$s9c_cc$,
  core_concept           = $s9c_cco$$s9c_cco$,
  teaching_points        = $s9c_tp$1. Some hard feelings go away quickly and some stay for longer. Neither makes a child bad or broken.
2. We do not need to work out exactly why a feeling is there in this room.
3. Children do not have to carry hard things alone. Trusted caregivers and other safe adults can help.
4. A child never has to keep a difficult or unsafe thing secret because an adult told them to — including a Mindcast facilitator.
5. If a child is not sure who feels safe, they can tell a caregiver or another trusted adult that they need help choosing someone.$s9c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s9c_sm$A small stone in a pocket can remind you it is there. You do not need to write the hard story on the stone. The lesson is simply: I notice something feels heavy, and I can choose help.$s9c_sm$,
  private_write_prompt   = $s9c_pw$Draw one helper, place or action that can support you when a feeling is hard. You do not need to draw or tell anyone what happened. You may share the helper side only, or keep everything private.$s9c_pw$,
  experiential_exercise  = $s9c_ex$STONE AND HELPER. Give each child a smooth stone or paper stone. One side gets a simple symbol for a hard feeling — a cloud, scribble or colour, with no event written. The other side gets a symbol for a safe helper or helpful action — trusted grown-up, quiet space, asking for help, drawing, breathing, something else. Use a fixed fictional example only: Imagine a child dropped a birthday cake they helped make in front of everyone. Years later they still remember feeling embarrassed. They could draw a red face on one side and a trusted grown-up on the other. Never present this as the facilitator's personal story.
DRAW IT
Draw a path from hard feeling to safe help. Add two different safe choices along the path. You may leave the hard-feeling end as a colour or symbol.$s9c_ex$,
  guided_reflection      = $s9c_gr$Keep your eyes open and look at the helper side of your stone or drawing.
Ask:
Who could I tell if I needed help?
What words could I use? — I need help, Can I talk to you?, Something feels hard.
You do not have to practise the private story. Only practise the help words.$s9c_gr$,
  journaling_prompt      = $s9c_jp$Draw a path from hard feeling to safe help. Add two different safe choices along the path. You may leave the hard-feeling end as a colour or symbol.$s9c_jp$,
  intention_prompt       = $s9c_ip$Choose one plan: When something feels hard and I need help, I will tell or show a trusted grown-up.$s9c_ip$,
  core_affirmation       = $s9c_ca$I can ask a safe grown-up for help, and I do not have to tell the group my private story.$s9c_ca$,
  weekly_practice_mon    = $s9c_pm$Practise saying I need help or another help phrase with a trusted grown-up when things are calm.$s9c_pm$,
  weekly_practice_wed    = $s9c_pw2$Show a trusted caregiver the helper side of your stone or drawing if you want to. You do not have to explain a private story.$s9c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s9c_ps$Bring the stone or drawing back only if you want to. You may share one helper you chose, not the hard thing.$s9c_ps$,
  previous_week_callback = $s9c_pwc$bring a new feelings drawing and one feeling word you noticed this week$s9c_pwc$,
  facilitator_notes      = $s9c_fn$## Aim
Teach safe help-seeking while removing trauma recall, secrecy prompts and facilitator-centred emotional disclosure.
## Run the room
Caregiver notice is mandatory before this session. The notice must explain that children will discuss hard feelings only in general terms, will not be asked to disclose events, and may opt out without explanation. No child attends without the notice having been sent. Never ask what happened, who caused the feeling, or whether there is something they have never told anyone. Children choose privately whether their stone/drawing goes home or stays in a named venue box; never decide by show of hands. If a child discloses possible harm, do not investigate; follow MC-SAF-001.
## Why this week exists — the evidence
Research on adversity supports the modest idea that difficult experiences can matter over time, but ACE scores and trauma concepts are not appropriate teaching tools for children in this room. The developmentally appropriate skill is safe help-seeking and naming that support is available.
Real-world anchor: children already use handover systems in ordinary life — taking a problem to a teacher, caregiver or coach. The lesson makes the handover visible and practises the words for help without requiring the child to explain the private content in front of peers.
## Evidence quality
Moderate overall. Reliable supportive relationships are associated with better outcomes across many child-development contexts, but this activity is not treatment and does not claim one relationship prevents harm. The stone/handover metaphors are illustrative only.
## We deliberately do not claim
- We do not ask children to identify trauma, wounds or ACEs.
- We do not claim hard feelings always remain in the body or mean a past event is unresolved.
- We do not claim telling or naming a hard thing heals it.
- We do not encourage secrecy from caregivers.
- We do not position Mindcast or its facilitators as replacement attachment figures, counsellors or rescuers.
## Source trail
- Felitti, V. J., et al. (1998). ACE study; facilitator background only, not child-facing material.
- Child safeguarding and referral: MC-SAF-001.$s9c_fn$,
  updated_at = now()
WHERE week_number = 9 AND audience = 'Child';

-- Week 10 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw10_theme$$cw10_theme$,
  the_territory        = $cw10_terr$The different versions of ourselves we use in different places$cw10_terr$,
  opening_question     = $cw10_oq$When does adapting yourself to a context feel useful, and when does it feel costly? Passing is full participation.$cw10_oq$,
  week_type            = $cw10_wt$Standard$cw10_wt$,
  reflective_question  = $cw10_rq$Across the week, which adaptations felt like useful competence, which felt draining or compulsory, and where did privacy itself feel like a healthy choice?$cw10_rq$,
  interactive_activity = $cw10_ia$CONTEXT MAP. Make four columns: context; what I change; what the adaptation helps; what it costs. Mark each adaptation chosen / partly chosen / feels required. Do not assume "less adapted" means healthier. Sharing is optional.$cw10_ia$,
  kids_picture_book    = $cw10_bk$Perfectly Norman$cw10_bk$,
  kids_picture_book_author = $cw10_bka$Tom Percival$cw10_bka$,
  kids_picture_book_note = $cw10_bkn$WHY THIS BOOK: Use the story to discuss hiding something because of fear of judgment, while making clear that children are allowed privacy and do not owe the group personal disclosure.
READ-ALOUD: Read live from a purchased copy.$cw10_bkn$,
  kids_picture_book_question = $cw10_bkq$When did Norman's coat help him, and when did it start getting in his way?$cw10_bkq$,
  kids_nz_alternative = $cw10_nz$Not yet selected$cw10_nz$,
  kids_nz_alternative_author = $cw10_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw10_nza$,
  kids_nz_alternative_note = $cw10_nzn$Any future alternative should support belonging and choice without teaching one single "real self".$cw10_nzn$,
  kids_colouring_prompt = $cw10_col$Colour three weather outfits for different situations — raincoat, sunhat, warm jersey — and one comfortable everyday outfit.$cw10_col$,
  kids_game = $cw10_g$VOLUME SWITCH. Facilitator holds cards for library voice / conversation voice / outside voice and children practise changing volume safely. Link it back: changing behaviour for context can be skill, not pretending.$cw10_g$,
  kids_game_equipment = $cw10_ge$Context sheets; crayons; volume cards.$cw10_ge$,
  kids_game_under5 = $cw10_g5$Use simple picture cards for quiet/loud and let children copy the volume change.$cw10_g5$,
  updated_at = now()
WHERE week_number = 10;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s10a_st$Frontend and Backend$s10a_st$,
  theme_title            = $s10a_tt$$s10a_tt$,
  phase                  = 1,
  phase_name             = $s10a_pn$See Clearly$s10a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s10a_hk$Think of three contexts — work, home, friends, online, extended whānau. Write one way your behaviour changes in each. Do not label any version more "real" yet.$s10a_hk$,
  s5_source_core_concept = $s10a_cc$Today the adult room treats self-presentation as normal social adaptation. We are not searching for one pure self underneath every role. We ask whether a particular adaptation is chosen, fits our values and context, and leaves enough room for privacy, disagreement and genuine needs.$s10a_cc$,
  core_concept           = $s10a_cco$$s10a_cco$,
  teaching_points        = $s10a_tp$1. People routinely change language, tone, disclosure and behaviour across roles and settings. Context-sensitive behaviour is not inherently inauthentic.
2. Jung's persona is a useful historical frame, not an empirical finding that there is one hidden face beneath a social mask.
3. The cost rises when self-presentation feels compulsory, unsafe to change or chronically disconnected from what a person values or needs.
4. Privacy is not dishonesty. Nobody owes every context the same level of disclosure.
5. The goal is choice: I know why I'm adapting here, and I can decide whether this version still works.$s10a_tp$,
  video_link             = $s10a_vl$https://www.youtube.com/watch?v=iCvmsMzlF7o$s10a_vl$,
  video_description      = $s10a_vd$Current assignment: Brené Brown, The Power of Vulnerability. Retain pending video review. Brown is a writer/researcher speaking from a body of work; do not turn vulnerability into a universal prescription or imply more disclosure is always healthier.$s10a_vd$,
  todays_theme           = $s10a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Work calls, family gatherings, online profiles and friendships all ask for different levels of formality, privacy and openness. The question is not whether a person changes across settings, but whether the change is chosen and sustainable.$s10a_tdt$,
  todays_world_vo_script = $s10a_tdv$Different contexts can call for different versions of your behaviour without requiring a different value system underneath.$s10a_tdv$,
  ancient_wisdom_reframe = $s10a_aw$Theatre masks can be used as a cultural image of role and context. A mask is a tool for a role; that does not prove a single hidden face is the only authentic one.$s10a_aw$,
  ancient_wisdom_vo_script = $s10a_awv$Roles can be useful. The question is whether you are choosing the role or trapped in it.$s10a_awv$,
  signal_metaphor        = $s10a_sm$Think of software with different user modes: work mode, family mode, private mode. Different interfaces can serve the same system. Trouble starts when one mode becomes compulsory everywhere.$s10a_sm$,
  private_write_prompt   = $s10a_pw$Choose one context where you noticeably adapt your tone, needs, disclosure or behaviour. Write what changes and what purpose the change serves.$s10a_pw$,
  experiential_exercise  = $s10a_ex$CONTEXT MAP. Make four columns: context; what I change; what the adaptation helps; what it costs. Mark each adaptation chosen / partly chosen / feels required. Do not assume "less adapted" means healthier. Sharing is optional.$s10a_ex$,
  guided_reflection      = $s10a_gr$Keep your eyes open and choose one adaptation.
Write:
What this adaptation helps me do:
What it costs me, if anything:
Whether it feels chosen:
One adjustment I might test, or “no change needed”:$s10a_gr$,
  journaling_prompt      = $s10a_jp$Across the week, which adaptations felt like useful competence, which felt draining or compulsory, and where did privacy itself feel like a healthy choice?$s10a_jp$,
  intention_prompt       = $s10a_ip$Write one if-then plan: When I notice [specific context] pushing me into an automatic role, I will check whether the role still fits what I need and value there.$s10a_ip$,
  core_affirmation       = $s10a_ca$I can adapt to context without giving any one role authority over my whole identity.$s10a_ca$,
  weekly_practice_mon    = $s10a_pm$Notice one context switch and name what changed without judging it.$s10a_pm$,
  weekly_practice_wed    = $s10a_pw2$Choose one adaptation and ask whether it feels chosen, partly chosen or required.$s10a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s10a_ps$Bring one observation about a role that felt useful, costly or worth adjusting. Sharing details is optional.$s10a_ps$,
  previous_week_callback = $s10a_pwc$bring one observation about how the strategy worked this week or whether you noticed it more clearly$s10a_pwc$,
  facilitator_notes      = $s10a_fn$## Aim
Move from simplistic mask = fake framing to choice, context, privacy and cost.
## Run the room
Do not push vulnerability or ask members to reveal what is "behind the mask." Do not imply identical behaviour everywhere is healthy. Treat code-switching and professional/social roles as possible competence, not pathology.
## Why this week exists — the evidence
Research on self-presentation and identity shows that people manage impressions and roles across social contexts. Costs are more plausibly linked to felt pressure, concealment and lack of choice than to adaptation itself.
Real-world anchor: most people speak differently in a job interview, with a close friend and with a child. The variation is not evidence of three fake selves; it is ordinary social competence. Week 10 asks when the same flexibility stops feeling chosen.
## Evidence quality
Moderate overall. Context-sensitive self-presentation is well established. Broad claims that "authenticity" always improves wellbeing depend heavily on definition and context. Jung's persona and the theatre metaphor are illustrative frames.
## We deliberately do not claim
- We do not claim Jung's persona is an empirical finding.
- We do not claim authenticity means behaving identically everywhere.
- We do not claim vulnerability or disclosure is always healthy.
- We do not claim one private, unperformed self is the uniquely real self.
- We do not treat privacy, professionalism or code-switching as a mask to remove.
## Source trail
- Goffman, E. (1959). The Presentation of Self in Everyday Life. Sociological frame, not a clinical model.
- Self-presentation/authenticity literature: used cautiously around choice and context.$s10a_fn$,
  updated_at = now()
WHERE week_number = 10 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s10t_st$Which One Is Actually You?$s10t_st$,
  theme_title            = $s10t_tt$$s10t_tt$,
  phase                  = 1,
  phase_name             = $s10t_pn$See Clearly$s10t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s10t_hk$Rate privately how different your behaviour is across home / close friends / school / online. A big range is not automatically a problem.$s10t_hk$,
  s5_source_core_concept = $s10t_cc$Today the teen room rejects the idea that there is one "real you" that must look identical everywhere. We map adaptations and ask whether they feel chosen, protective, useful, experimental or forced.$s10t_cc$,
  core_concept           = $s10t_cco$$s10t_cco$,
  teaching_points        = $s10t_tp$1. Adolescence normally includes trying out roles, interests, identities and ways of presenting. Experimentation is developmentally appropriate.
2. Code-switching can be competence and sometimes protection, especially for Māori and Pasifika young people moving between cultural settings. It is not automatically a mask.
3. Privacy is not dishonesty. Teens do not owe friends, peers, facilitators or online audiences full access to themselves.
4. The concern is not difference across settings; it is when a presentation feels compulsory, unsafe to change or persistently costly.
5. If an adaptation feels chosen and consistent with your values, chosen is a complete answer. There is no requirement to remove it.$s10t_tp$,
  video_link             = $s10t_vl$https://www.youtube.com/watch?v=IVlU-2OBdts$s10t_vl$,
  video_description      = $s10t_vd$Current assignment: Shane Koyczan, To This Day. Retain pending video review. This is spoken-word art, not research evidence; use it as an experience or discussion prompt only.$s10t_vd$,
  todays_theme           = $s10t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Different friend groups, classrooms, teams, whānau settings and online spaces can call for different language, humour, privacy and confidence. Adaptation can be skill, safety or pressure depending on the context.$s10t_tdt$,
  todays_world_vo_script = $s10t_tdv$Changing how you show up does not automatically mean you're fake. The useful question is whether the change feels chosen.$s10t_tdv$,
  ancient_wisdom_reframe = $s10t_aw$Use theatre roles as a simple metaphor for context. Actors change roles deliberately; the metaphor stops there. Do not teach one hidden self as the only authentic identity.$s10t_aw$,
  ancient_wisdom_vo_script = $s10t_awv$Different roles can be real parts of you. Choice matters more than sameness.$s10t_awv$,
  signal_metaphor        = $s10t_sm$Your phone can switch between school mode, sleep mode and normal mode without becoming a different phone. People can shift modes too. The question is whether you control the setting or feel trapped in it.$s10t_sm$,
  private_write_prompt   = $s10t_pw$Choose one context where you act differently. Write what changes and whether it feels chosen / partly chosen / forced / not sure. Keep it private.$s10t_pw$,
  experiential_exercise  = $s10t_ex$CONTEXT MAP. Put yourself in the centre and add home, school, friends, team, online or other contexts. For each, note one adaptation and what it helps. Then mark any cost. Do not rank which context contains the "real you." Sharing is optional.$s10t_ex$,
  guided_reflection      = $s10t_gr$Keep your eyes open.
Choose one context and write:
What I change there:
What it helps me do:
Whether it feels chosen:
One thing I want to keep, change or stay unsure about:
If no change needed is your answer, that is complete.$s10t_gr$,
  journaling_prompt      = $s10t_jp$During the week, which context shifts felt like skill or choice, and which felt like pressure to hide something important or perform something you did not want to perform?$s10t_jp$,
  intention_prompt       = $s10t_ip$Write one if-then plan: When I notice myself shifting in [context], I will check whether the shift feels chosen and useful before judging it.$s10t_ip$,
  core_affirmation       = $s10t_ca$I can adapt to different spaces and still choose what fits my values and safety.$s10t_ca$,
  weekly_practice_mon    = $s10t_pm$Notice one context switch and name what changed.$s10t_pm$,
  weekly_practice_wed    = $s10t_pw2$Choose one shift and ask chosen, forced, or not sure? No disclosure required.$s10t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s10t_ps$Bring one observation about an adaptation you want to keep, change or understand better. Sharing details is optional.$s10t_ps$,
  previous_week_callback = $s10t_pwc$bring one observation about the strategy from this week or simply whether you noticed it sooner$s10t_pwc$,
  facilitator_notes      = $s10t_fn$## Aim
Protect teen identity exploration, cultural code-switching and privacy while helping teens notice compelled self-presentation.
## Run the room
Do not use real you underneath language, ask teens to reveal something hidden, or reward vulnerability. Never frame code-switching as fake. Ask whether adaptation feels chosen or forced and accept chosen without further probing.
## Why this week exists — the evidence
Adolescent identity exploration and context-dependent self-presentation are normal developmental processes. Psychological cost is more plausibly linked to concealment under pressure, discrimination or loss of choice than to simply behaving differently across settings.
Real-world anchor: a Māori or Pasifika teenager may shift language and register between home, kura/school, sport and town. Calling that a mask can misread cultural competence as pathology. Week 10 explicitly prevents that error.
## Evidence quality
Moderate overall. Identity exploration and self-presentation are well established. Specific claims about "masked connection" or one presentation becoming identity over time are too broad to teach as laws. The phone-mode metaphor is illustrative.
## We deliberately do not claim
- We do not claim code-switching is inauthentic or unhealthy.
- We do not claim teens should already know one stable true identity.
- We do not claim acting differently across contexts means loneliness or identity loss.
- We do not encourage disclosure of hidden/private material.
- We do not claim authenticity requires behaving identically everywhere.
## Source trail
- Adolescent identity-development literature; used for exploration as normal development.
- Code-switching framed through cultural/context competence rather than pathology.$s10t_fn$,
  updated_at = now()
WHERE week_number = 10 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s10c_st$The Real Face and the Pretend Faces$s10c_st$,
  theme_title            = $s10c_tt$$s10c_tt$,
  phase                  = 1,
  phase_name             = $s10c_pn$See Clearly$s10c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s10c_hk$Ask: Do you use the same voice in the library, at the playground and when playing at home? Let children demonstrate safe volume differences if they want. Explain: changing for a place can be a skill.$s10c_hk$,
  s5_source_core_concept = $s10c_cc$Today the child room learns that people can act differently in different places and still be themselves. We might be quiet somewhere, silly somewhere else and private about some feelings. The useful question is whether the change feels safe and chosen.$s10c_cc$,
  core_concept           = $s10c_cco$$s10c_cco$,
  teaching_points        = $s10c_tp$1. People use different voices and behaviours in different places. That can be a helpful skill.
2. Being private about a feeling is not the same as lying.
3. Children never have to show a "real face" or tell private things to prove they are being themselves.
4. Sometimes acting a certain way feels tiring or forced. A child can talk to a trusted grown-up if a situation feels unsafe or too hard.
5. There is no single expression, mood or behaviour that is the "real you" all the time.$s10c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s10c_sm$Think of clothes for different weather: a raincoat, sunhat or warm jersey. Different things fit different situations. Wearing a raincoat does not make you fake; the question is whether it helps and whether you can take it off when you want.$s10c_sm$,
  private_write_prompt   = $s10c_pw$Choose one place and draw something you do there that helps the situation work. You may tell someone why, or keep it private.$s10c_pw$,
  experiential_exercise  = $s10c_ex$CONTEXT FACES — WITHOUT THE MASK. Give children a page with three ordinary places: library, playground, home/whānau. Draw or write how voice, movement or behaviour might change in each. Add a fourth space: a place where I can ask for help if I feel I have to pretend. No child draws hidden/private feelings on the back of a mask.
DRAW IT
Draw yourself in two different places doing two different things. Add one thing that matters to you in both pictures.$s10c_ex$,
  guided_reflection      = $s10c_gr$Keep your eyes open and look at the places.
Ask:
Does changing here help me?
Does it feel chosen?
If it feels hard or unsafe, who could I tell?
You do not have to show anyone a private feeling.$s10c_gr$,
  journaling_prompt      = $s10c_jp$Draw yourself in two different places doing two different things. Add one thing that matters to you in both pictures.$s10c_jp$,
  intention_prompt       = $s10c_ip$Choose one plan: When I notice I act differently somewhere, I will ask whether it feels helpful and safe.$s10c_ip$,
  core_affirmation       = $s10c_ca$I can act differently in different places and still choose what feels safe and right for me.$s10c_ca$,
  weekly_practice_mon    = $s10c_pm$Notice one place where you change how you act. Ask whether the change helps.$s10c_pm$,
  weekly_practice_wed    = $s10c_pw2$Tell a trusted grown-up one place where you feel comfortable being yourself, if you want to.$s10c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s10c_ps$Bring your context drawing back and add one thing that helps you feel safe and comfortable in a place. Sharing is optional.$s10c_ps$,
  previous_week_callback = $s10c_pwc$bring the stone or drawing back if you want and share one helper you chose not the hard thing$s10c_pwc$,
  facilitator_notes      = $s10c_fn$## Aim
Replace "real face/pretend face" with context, choice, privacy and safety.
## Run the room
Do not ask what children hide, when they pretend they are fine, or what is "really" underneath. Do not make smiling masks or ask children to reveal backs of masks. Privacy is legitimate. If a child indicates they are unsafe because they must behave a certain way, do not investigate in front of peers; follow MC-SAF-001.
## Why this week exists — the evidence
Context-dependent behaviour is normal. For children, the lesson is best taught through simple examples such as voice level and setting rather than abstract authenticity. The safety distinction is whether an adaptation feels chosen/helpful or compelled by fear.
Real-world anchor: children already switch behaviour between a library, playground, classroom and home. That familiar competence shows why "different in different places" cannot automatically mean fake.
## Evidence quality
Moderate overall. Context-sensitive self-presentation is well established. The weather/clothing metaphor is illustrative, and the activity is a teaching adaptation rather than an assessment.
## We deliberately do not claim
- We do not claim one version of a child is the real one and others are masks.
- We do not claim the right people always want to see every private part of a child.
- We do not encourage children to reveal feelings or information they prefer to keep private.
- We do not claim behaving differently across places is unhealthy.
- We do not require public vulnerability.
## Source trail
- Developmental/contextual self-presentation literature informs the general principle.
- Child safeguarding and privacy rules follow MC-SAF-001 and the Master Agent Specification.$s10c_fn$,
  updated_at = now()
WHERE week_number = 10 AND audience = 'Child';

-- Week 11 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw11_theme$$cw11_theme$,
  the_territory        = $cw11_terr$What might be going on for someone else$cw11_terr$,
  opening_question     = $cw11_oq$What is the difference between understanding someone and excusing them? Passing is full participation.$cw11_oq$,
  week_type            = $cw11_wt$Standard$cw11_wt$,
  reflective_question  = $cw11_rq$Across the week, where did separating behaviour from motive change your response, and where did the original interpretation remain the most plausible one?$cw11_rq$,
  interactive_activity = $cw11_ia$FACT / STORY / ALTERNATIVES. Make three columns: observable facts; my interpretation; two other plausible interpretations. Add a fourth line: What boundary or response would still make sense across all three interpretations? Sharing is optional.$cw11_ia$,
  kids_picture_book    = $cw11_bk$The Invisible Boy$cw11_bk$,
  kids_picture_book_author = $cw11_bka$Trudy Ludwig$cw11_bka$,
  kids_picture_book_note = $cw11_bkn$WHY THIS BOOK: It supports noticing another child's experience without asking children to identify a real classmate who may be excluded.
READ-ALOUD: Read live from a purchased copy.$cw11_bkn$,
  kids_picture_book_question = $cw11_bkq$What changed when somebody noticed Brian? What could the other children see once they paid attention?$cw11_bkq$,
  kids_nz_alternative = $cw11_nz$Colour the Stars$cw11_nz$,
  kids_nz_alternative_author = $cw11_nza$Dawn McMillan$cw11_nza$,
  kids_nz_alternative_note = $cw11_nzn$Use it to explore different experiences of the same world without ranking whose view is better.$cw11_nzn$,
  kids_colouring_prompt = $cw11_col$Colour a simple picture that can be seen in two ways, or two children standing on opposite sides of one large object.$cw11_col$,
  kids_game = $cw11_g$WALK AROUND THE PICTURE. Put a large object or picture in the centre. Children stand at different safe positions and name one thing visible from where they are. Rotate positions. Link the game to perspective, not to guessing personal motives.$cw11_g$,
  kids_game_equipment = $cw11_ge$Perspective image; large object or picture; crayons.$cw11_ge$,
  kids_game_under5 = $cw11_g5$Use a simple object with obvious different sides. Ask only what can you see from here?$cw11_g5$,
  updated_at = now()
WHERE week_number = 11;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s11a_st$Calibrating the Sensor$s11a_st$,
  theme_title            = $s11a_tt$$s11a_tt$,
  phase                  = 1,
  phase_name             = $s11a_pn$See Clearly$s11a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s11a_hk$Think of one recent moment when you decided what another person meant. Write two lines: what they did and what I concluded.$s11a_hk$,
  s5_source_core_concept = $s11a_cc$Today the adult room practises separating observation from attribution. We can ask what else might explain a behaviour while still taking the behaviour seriously, holding boundaries and accepting that sometimes our first interpretation is correct.$s11a_cc$,
  core_concept           = $s11a_cco$$s11a_cco$,
  teaching_points        = $s11a_tp$1. Confirmation bias can make existing judgments about a person self-reinforcing: evidence that fits stands out and evidence that complicates the judgment is easier to miss.
2. Projection is a psychoanalytic concept and a useful question, not a settled experimental mechanism. Is this partly about me? can legitimately be answered no.
3. Perspective-taking can widen the set of possible explanations, but imagining another person's motives is still imagination unless the person tells us or evidence supports it.
4. Empathy does not require agreement, reconciliation, continued contact or staying in a harmful situation.
5. Clear perception includes both uncertainty and boundaries: I may not know why you did that, and I still know what happened and what I will accept.$s11a_tp$,
  video_link             = $s11a_vl$https://www.youtube.com/watch?v=baHrcC8B4WM$s11a_vl$,
  video_description      = $s11a_vd$Current assignment: Brené Brown RSA animation on empathy. Retain pending video review. Use as an illustration; do not treat Brown's synthesis as the source of every empirical claim in the lesson.$s11a_vd$,
  todays_theme           = $s11a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
An unanswered message, abrupt email, traffic mistake or tense conversation can acquire a motive in seconds. The interpretation may be plausible; it is still different from the observable event.$s11a_tdt$,
  todays_world_vo_script = $s11a_tdv$What happened and why you think it happened are two different lines of data.$s11a_tdv$,
  ancient_wisdom_reframe = $s11a_aw$Deep-listening traditions can be used as a cultural lens for suspending immediate judgment long enough to hear another account. Do not frame "putting yourself aside completely" as the goal; self-protection and perspective can coexist.$s11a_aw$,
  ancient_wisdom_vo_script = $s11a_awv$Listening for another perspective does not require abandoning your own.$s11a_awv$,
  signal_metaphor        = $s11a_sm$Think of a photograph with no caption. The image is real; the caption can still be wrong. Behaviour is the photograph. Motive is often the caption we add.$s11a_sm$,
  private_write_prompt   = $s11a_pw$Choose one low- to moderate-stakes interaction. Write exactly what the other person did, then separately write the motive or story you attached to it.$s11a_pw$,
  experiential_exercise  = $s11a_ex$FACT / STORY / ALTERNATIVES. Make three columns: observable facts; my interpretation; two other plausible interpretations. Add a fourth line: What boundary or response would still make sense across all three interpretations? Sharing is optional.$s11a_ex$,
  guided_reflection      = $s11a_gr$Keep your eyes open.
Write:
What I actually know:
What I am inferring:
What else could be true:
What boundary or action still fits regardless:
You do not have to choose the most generous interpretation.$s11a_gr$,
  journaling_prompt      = $s11a_jp$Across the week, where did separating behaviour from motive change your response, and where did the original interpretation remain the most plausible one?$s11a_jp$,
  intention_prompt       = $s11a_ip$Write one if-then plan: When I catch myself assigning motive in [specific context], I will name the observable behaviour before deciding what it means.$s11a_ip$,
  core_affirmation       = $s11a_ca$I can stay curious about another person's perspective without giving up what I know, need or will accept.$s11a_ca$,
  weekly_practice_mon    = $s11a_pm$Catch one judgment and separate what happened from why I think it happened.$s11a_pm$,
  weekly_practice_wed    = $s11a_pw2$Generate one alternative explanation without requiring yourself to believe it.$s11a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s11a_ps$Bring one example where checking an assumption changed, sharpened or did not change your view. Sharing details is optional.$s11a_ps$,
  previous_week_callback = $s11a_pwc$bring one observation about a role that felt useful costly or worth adjusting$s11a_pwc$,
  facilitator_notes      = $s11a_fn$## Aim
Teach attribution discipline and perspective-taking without victim-blaming, forced empathy or boundary erosion.
## Run the room
Do not ask members to imagine abusers as children, understand why someone hurt them or find their own contribution to harm. Keep examples ordinary. If a relationship is coercive or unsafe, empathy is not the intervention; safety and support are.
## Why this week exists — the evidence
Confirmation bias and attribution processes show why judgments about others can become sticky. Perspective-taking can sometimes reduce rigid interpretations, but imagined motives remain hypotheses.
Real-world anchor: an abrupt message saying Fine. can be read as anger, haste, distraction, exhaustion or simply brevity. The text is observable; the motive is not. Week 11 makes that distinction explicit.
## Evidence quality
Moderate overall. Confirmation bias is strongly established. Perspective-taking effects vary by context. Projection is an illustrative psychoanalytic question, not a proven general mechanism. The photo/caption metaphor is illustrative.
## We deliberately do not claim
- We do not claim projection is a proven mechanism or that irritation reveals a denied trait in ourselves.
- We do not claim understanding another person's history excuses harmful behaviour.
- We do not claim perspective-taking requires reconciliation or continued contact.
- We do not claim the most generous interpretation is necessarily correct.
- We do not ask members to empathise with someone who is harming them.
## Source trail
- Confirmation-bias research lineage in cognitive psychology.
- Perspective-taking literature; treated as context-dependent.
- Projection: psychoanalytic frame only, not presented as established mechanism.$s11a_fn$,
  updated_at = now()
WHERE week_number = 11 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s11t_st$Turning Down the Projector$s11t_st$,
  theme_title            = $s11t_tt$$s11t_tt$,
  phase                  = 1,
  phase_name             = $s11t_pn$See Clearly$s11t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s11t_hk$Think of a message, comment or action that annoyed you this week. Write privately: what happened / what I decided it meant.$s11t_hk$,
  s5_source_core_concept = $s11t_cc$Today the teen room practises fact before motive. We can imagine another perspective without pretending we know it, and we can understand context without excusing disrespect, coercion or harm.$s11t_cc$,
  core_concept           = $s11t_cco$$s11t_cco$,
  teaching_points        = $s11t_tp$1. Once we expect someone to be selfish, rude or unreliable, confirmation bias can make matching examples easier to notice.
2. Perspective-taking means considering another possible point of view; it does not mean mind-reading.
3. Projection is not a fact that whatever annoys you in someone else exists in you. It is a question you can choose to ask, and no is a valid answer.
4. Empathy does not require forgiving, staying friends, replying, or keeping contact with someone who treats you badly.
5. A useful sentence is: I don't know why they did it. I do know what they did and what I want to do next.$s11t_tp$,
  video_link             = $s11t_vl$https://www.youtube.com/watch?v=cDDWvj_q-o8$s11t_vl$,
  video_description      = $s11t_vd$Current assignment: Cleveland Clinic empathy film. Retain pending video review. Use it as an illustration of unseen context, not evidence that everyone who behaves badly is secretly suffering or deserves access to you.$s11t_vd$,
  todays_theme           = $s11t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Seen messages, short replies, group-chat jokes and school interactions can acquire motives almost instantly. The motive may be right, wrong or partly right; checking the difference is the skill.$s11t_tdt$,
  todays_world_vo_script = $s11t_tdv$A behaviour is something you observed. A motive is usually something you inferred.$s11t_tdv$,
  ancient_wisdom_reframe = $s11t_aw$Use the image of walking around a sculpture: another angle can show information you could not see from the first position. It does not erase what you saw first.$s11t_aw$,
  ancient_wisdom_vo_script = $s11t_awv$Another angle can add information without making your own view disappear.$s11t_awv$,
  signal_metaphor        = $s11t_sm$A screenshot shows what was written, not the entire conversation in somebody's head. Week 11 separates the screenshot from the story you add around it.$s11t_sm$,
  private_write_prompt   = $s11t_pw$Choose one low-stakes interaction. Write the exact behaviour you observed and the motive you assumed. Do not use names.$s11t_pw$,
  experiential_exercise  = $s11t_ex$DEFENCE BRIEF — AS A POSSIBILITY. Write the strongest plausible explanation for the other person's behaviour, then the strongest plausible explanation for your own view. Finish with what I actually know. You are not deciding who is right. Sharing is optional.$s11t_ex$,
  guided_reflection      = $s11t_gr$Keep your eyes open.
Write:
What happened:
What I think it meant:
One other possible explanation:
What boundary or response still makes sense:
You do not have to feel more sympathetic when you finish.$s11t_gr$,
  journaling_prompt      = $s11t_jp$During the week, when did checking your assumption help you understand an interaction better, and when did your original reading still look most likely?$s11t_jp$,
  intention_prompt       = $s11t_ip$Write one if-then plan: When I catch myself deciding why somebody did something, I will name what I actually observed first.$s11t_ip$,
  core_affirmation       = $s11t_ca$I can consider another point of view without giving up my own boundaries or pretending I know their mind.$s11t_ca$,
  weekly_practice_mon    = $s11t_pm$Separate one interaction into what happened and what I assumed.$s11t_pm$,
  weekly_practice_wed    = $s11t_pw2$Generate one alternative explanation without requiring yourself to believe it.$s11t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s11t_ps$Bring one example where you checked an assumption and notice whether your view changed. Sharing details is optional.$s11t_ps$,
  previous_week_callback = $s11t_pwc$bring one observation about an adaptation you want to keep change or understand better$s11t_pwc$,
  facilitator_notes      = $s11t_fn$## Aim
Teach perspective-taking without victim-blaming or turning empathy into an obligation.
## Run the room
No asking teens to imagine why somebody harmful acted that way, no pressure to forgive, and no what about your part? in situations involving coercion or abuse. Use low-stakes examples and keep names out.
## Why this week exists — the evidence
Confirmation bias and attribution processes make person judgments sticky. Perspective-taking can loosen fixed interpretations in some contexts, but it is not mind-reading and is not appropriate as a safety intervention.
Real-world anchor: a short reply such as k may signal irritation, hurry, distraction, habit or nothing at all. The text exists; the motive is inferred. Teens encounter that distinction every day.
## Evidence quality
Moderate overall. Confirmation bias is strongly established. Perspective-taking effects vary by context and target. Projection is not treated as an established mechanism.
## We deliberately do not claim
- We do not claim whatever irritates you in another person is something you suppress in yourself.
- We do not claim empathy fixes conflict or improves every relationship.
- We do not claim understanding why someone behaved badly means you should stay, forgive or reconnect.
- We do not ask teens to take the perspective of someone harming them.
## Source trail
- Confirmation-bias and attribution research in cognitive/social psychology.
- Perspective-taking literature; context-dependent.$s11t_fn$,
  updated_at = now()
WHERE week_number = 11 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s11c_st$Walking Around the Picture$s11c_st$,
  theme_title            = $s11c_tt$$s11c_tt$,
  phase                  = 1,
  phase_name             = $s11c_pn$See Clearly$s11c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s11c_hk$Show a duck/rabbit or another safe perspective illusion. Ask: What do you see? Can two answers both fit the same picture?$s11c_hk$,
  s5_source_core_concept = $s11c_cc$Today the child room practises maybe. We can know what somebody did without always knowing why they did it. We can think of another possible reason and still say that unkind or unsafe behaviour is not okay.$s11c_cc$,
  core_concept           = $s11c_cco$$s11c_cco$,
  teaching_points        = $s11c_tp$1. People can see the same picture or situation differently.
2. We sometimes guess why somebody did something, and our guess can be wrong.
3. Thinking of another possible reason is called taking another perspective. It is a possibility, not mind-reading.
4. Understanding another person's situation does not mean letting them hurt, scare or bully you.
5. If behaviour feels unsafe, the job is to tell a trusted grown-up, not to work harder to understand the person doing it.$s11c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s11c_sm$Imagine walking around a big picture or sculpture. From another side you can notice something new, but the first side did not disappear. We can add perspectives without pretending one view explains everything.$s11c_sm$,
  private_write_prompt   = $s11c_pw$Draw one simple situation from two sides — for example two children wanting the same seat or seeing different parts of a picture. You may explain it or keep it private.$s11c_pw$,
  experiential_exercise  = $s11c_ex$PERSPECTIVE DETECTIVE. Use three fixed, low-stakes scenarios with no abuse or bullying themes. For each ask: What happened? What might Person A think? What might Person B think? What do we still not know? Then show one perspective illusion. Do not ask children to analyse a real person who upset them.
DRAW IT
Draw a picture with a speech bubble for what I know and another for what I might be guessing.$s11c_ex$,
  guided_reflection      = $s11c_gr$Keep your eyes open and look at the two pictures.
Ask:
What does each person know?
What might each person be guessing?
What do neither of them know yet?
You do not have to make either person right.$s11c_gr$,
  journaling_prompt      = $s11c_jp$Draw a picture with a speech bubble for what I know and another for what I might be guessing.$s11c_jp$,
  intention_prompt       = $s11c_ip$Choose one plan: When I am guessing why someone did something, I will remember I might not know yet.$s11c_ip$,
  core_affirmation       = $s11c_ca$I can remember that my guess about someone is not the same as knowing what is in their mind.$s11c_ca$,
  weekly_practice_mon    = $s11c_pm$Once today when you guess why someone did something, add the word maybe.$s11c_pm$,
  weekly_practice_wed    = $s11c_pw2$Tell a trusted grown-up about one ordinary situation that could have more than one explanation, if you want to.$s11c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s11c_ps$Bring one safe example of using your perspective-detective skill this week. Sharing is optional.$s11c_ps$,
  previous_week_callback = $s11c_pwc$bring your context drawing back and add one thing that helps you feel safe and comfortable in a place$s11c_pwc$,
  facilitator_notes      = $s11c_fn$## Aim
Teach perspective-taking concretely without asking children to empathise with people who harm them or identify real vulnerable peers.
## Run the room
Do not ask who in your class is invisible?, use real bullying examples, or ask children to explain why somebody was unkind to them. No loaded backpack with hidden adversities. If a child describes unsafe behaviour, move to safety/help, not perspective-taking, and follow MC-SAF-001 where required.
## Why this week exists — the evidence
Perspective-taking and confirmation-bias principles support the idea that our first interpretation is not always complete. For children, visual perspective tasks make the distinction concrete without requiring emotional disclosure.
Real-world anchor: optical illusions such as duck/rabbit images allow two genuine readings of the same picture. That is a clean demonstration that perception can differ without either child lying or being foolish.
## Evidence quality
Moderate overall. Perspective-taking develops across childhood and can be practised, though effects on behaviour vary. The visual-illusion exercise is illustrative, not evidence that every interpersonal conflict has two equally valid sides.
## We deliberately do not claim
- We do not claim understanding another person's perspective excuses unkind or unsafe behaviour.
- We do not ask children to imagine the hidden suffering of someone who hurts them.
- We do not claim every conflict has equally valid sides.
- We do not present projection as a fact.
- We do not ask children to identify classmates who may be lonely or excluded.
## Source trail
- Perspective-taking / theory-of-mind development literature informs the age-matched principle.
- Confirmation-bias research informs facilitator framing.$s11c_fn$,
  updated_at = now()
WHERE week_number = 11 AND audience = 'Child';

-- Week 12 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw12_theme$$cw12_theme$,
  the_territory        = $cw12_terr$The things you do without deciding to$cw12_terr$,
  opening_question     = $cw12_oq$Which daily behaviours feel most automatic to you? Passing is full participation.$cw12_oq$,
  week_type            = $cw12_wt$Standard$cw12_wt$,
  reflective_question  = $cw12_rq$Across the week, which cues were reliable, which varied, and what did you learn about the immediate payoff that keeps the behaviour easy to repeat?$cw12_rq$,
  interactive_activity = $cw12_ia$HABIT LOOP AUDIT. Map: cue; action; immediate payoff; later effect; one alternative action. Payoff means what happens immediately — convenience, stimulation, relief, completion, connection, escape, something else — not a claim about a deep underlying need. Sharing is optional.$cw12_ia$,
  kids_picture_book    = $cw12_bk$Interrupting Chicken$cw12_bk$,
  kids_picture_book_author = $cw12_bka$David Ezra Stein$cw12_bka$,
  kids_picture_book_note = $cw12_bkn$WHY THIS BOOK: The repeated interrupting pattern is easy for children to notice without turning a habit into a character flaw.
READ-ALOUD: Read live from a purchased copy.$cw12_bkn$,
  kids_picture_book_question = $cw12_bkq$What happened just before the chicken interrupted? What could she try next time?$cw12_bkq$,
  kids_nz_alternative = $cw12_nz$Not yet selected$cw12_nz$,
  kids_nz_alternative_author = $cw12_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw12_nza$,
  kids_nz_alternative_note = $cw12_nzn$A future alternative should show repeated everyday behaviour without food/body content or moralising.$cw12_nzn$,
  kids_colouring_prompt = $cw12_col$Colour two paths through long grass — one familiar path and one small new branch.$cw12_col$,
  kids_game = $cw12_g$HABIT PATH. Children walk a taped route with three stations: cue, action, next. On the second round, the facilitator offers a different neutral action at the middle station. The game is about noticing the choice point, not speed or performance.$cw12_g$,
  kids_game_equipment = $cw12_ge$Floor tape; station signs; paper; crayons.$cw12_ge$,
  kids_game_under5 = $cw12_g5$Use picture signs and one simple routine such as coat → shoes → door.$cw12_g5$,
  updated_at = now()
WHERE week_number = 12;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s12a_st$Mapping the Loops$s12a_st$,
  theme_title            = $s12a_tt$$s12a_tt$,
  phase                  = 1,
  phase_name             = $s12a_pn$See Clearly$s12a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s12a_hk$Choose one repeated behaviour that is ordinary and safe to examine. Write: When does it usually start? What happens immediately before it?$s12a_hk$,
  s5_source_core_concept = $s12a_cc$Today the adult room treats habits as repeated cue-linked behaviours rather than moral strengths or failures. We map what reliably comes before an action, what the action delivers immediately, and one small alternative we can attach to the same cue.$s12a_cc$,
  core_concept           = $s12a_cco$$s12a_cco$,
  teaching_points        = $s12a_tp$1. In one well-known experience-sampling study, around 40% of reported behaviours were repeated in similar contexts. That is not a universal percentage of every person's day; it illustrates how much everyday behaviour can become context-linked.
2. Cue → routine/action → reward/payoff is a useful working model popularised by writer Charles Duhigg from research conducted by others. It is not the only scientific model of habit.
3. Repetition in stable contexts can increase automaticity. Lally et al. tracked 96 people and found a median of 66 days to near-asymptotic automaticity, with a wide range of 18–254 days. One missed opportunity did not reset the process.
4. There is no universal 21-day, 30-day or 66-day rule. The time depends on behaviour, person and context.
5. Implementation intentions have strong support: a specific when X happens, I will do Y plan improves follow-through more reliably than a general resolution.$s12a_tp$,
  video_link             = $s12a_vl$https://www.youtube.com/watch?v=-moW9jvvMr4$s12a_vl$,
  video_description      = $s12a_vd$Current assignment: Charles Duhigg / The Power of Habit. Retain pending video review. State clearly that Duhigg is a writer synthesising research rather than the researcher who established the underlying findings.$s12a_vd$,
  todays_theme           = $s12a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Unlocking a phone after a notification, checking email after opening a laptop, or starting the same routine after getting home can become tightly linked to context. Mapping the cue is more useful than calling the behaviour a lack of discipline.$s12a_tdt$,
  todays_world_vo_script = $s12a_tdv$Automatic behaviour is efficient. Change gets easier to design when you can see what starts the loop.$s12a_tdv$,
  ancient_wisdom_reframe = $s12a_aw$Use wu wei cautiously as a cultural lens for working with conditions rather than forcing. Do not claim Daoist philosophy predicts modern habit science or that willpower always fails.$s12a_aw$,
  ancient_wisdom_vo_script = $s12a_awv$Instead of fighting the terrain, first understand the terrain.$s12a_awv$,
  signal_metaphor        = $s12a_sm$A familiar route can become the turn you make without thinking. Habit mapping puts road signs back on the route so you can see where another turn is possible.$s12a_sm$,
  private_write_prompt   = $s12a_pw$Write one repeated behaviour and the most reliable cue you can observe immediately before it. Avoid explaining the behaviour as personality or hidden need.$s12a_pw$,
  experiential_exercise  = $s12a_ex$HABIT LOOP AUDIT. Map: cue; action; immediate payoff; later effect; one alternative action. Payoff means what happens immediately — convenience, stimulation, relief, completion, connection, escape, something else — not a claim about a deep underlying need. Sharing is optional.$s12a_ex$,
  guided_reflection      = $s12a_gr$Keep your eyes open and look at the map.
Write:
The cue I can observe:
The action:
The immediate payoff:
One alternative I could test at the same cue:
Do not search for when the habit began unless that information is already obvious and useful.$s12a_gr$,
  journaling_prompt      = $s12a_jp$Across the week, which cues were reliable, which varied, and what did you learn about the immediate payoff that keeps the behaviour easy to repeat?$s12a_jp$,
  intention_prompt       = $s12a_ip$Write one if-then plan: When [specific cue] happens, I will [small alternative action].$s12a_ip$,
  core_affirmation       = $s12a_ca$I can understand a repeated pattern and test one small change without treating a missed day as failure.$s12a_ca$,
  weekly_practice_mon    = $s12a_pm$Catch one habit loop and record cue, action and immediate payoff.$s12a_pm$,
  weekly_practice_wed    = $s12a_pw2$Test your if-then alternative once. A missed attempt does not reset anything.$s12a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s12a_ps$Bring back your habit map and one thing you learned about the cue or payoff. Sharing details is optional.$s12a_ps$,
  previous_week_callback = $s12a_pwc$bring one example where checking an assumption changed sharpened or did not change your view$s12a_pwc$,
  facilitator_notes      = $s12a_fn$## Aim
Turn behaviour change into observable cue/action design rather than motivation, identity or hidden-need analysis.
## Run the room
Do not say willpower is useless, demand an underlying emotional need, or ask members to trace a habit to past hurt. Avoid clinically significant behaviours that require specialist treatment. Push vague resolutions toward a small cue-linked action, not toward disclosure.
## Why this week exists — the evidence
Wood, Quinn and Kashy found substantial repetition of everyday behaviour in stable contexts. Lally et al. demonstrated wide variation in habit automaticity and showed that one missed opportunity did not materially derail the curve. Gollwitzer and Sheeran's meta-analysis supports implementation intentions as a practical planning tool.
Real-world anchor: the 21-day habit rule began as a distorted retelling of Maxwell Maltz's observation about post-surgical adjustment. Direct measurement later produced a much wider range. Week 12 uses that contrast to make missed days and individual variation explicit.
## Evidence quality
Strong for implementation intentions; moderate for habit-timing/generalisation. The cue/action/payoff model is useful but simplified. The exact percentage of daily habitual behaviour varies by study and definition.
## We deliberately do not claim
- We do not claim Duhigg conducted the habit research he popularised.
- We do not claim around 40% is a universal share of everyone's daily behaviour.
- We do not claim habits take 21, 30, 66 or any fixed number of days.
- We do not claim willpower is a depleting muscle; ego depletion is not used.
- We do not claim every habit serves a hidden emotional need.
## Source trail
- Wood, W., Quinn, J. M., & Kashy, D. A. (2002). Habits in Everyday Life.
- Lally, P., et al. (2010). How are habits formed: Modelling habit formation in the real world.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation-intention meta-analysis.$s12a_fn$,
  updated_at = now()
WHERE week_number = 12 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s12t_st$Understanding Autopilot$s12t_st$,
  theme_title            = $s12t_tt$$s12t_tt$,
  phase                  = 1,
  phase_name             = $s12t_pn$See Clearly$s12t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s12t_hk$Name privately one thing you do most days without much thought. Ask: What usually happens right before it?$s12t_hk$,
  s5_source_core_concept = $s12t_cc$Today the teen room maps one ordinary repeated behaviour as cue → action → immediate payoff. We do not treat habits as laziness or identity. We choose one tiny alternative and attach it to a specific cue.$s12t_cc$,
  core_concept           = $s12t_cco$$s12t_cco$,
  teaching_points        = $s12t_tp$1. In one well-known study, around 40% of sampled everyday behaviours repeated in similar contexts. That does not mean exactly half of every teen's life is habit.
2. Cue–action–reward/payoff is a useful simplified model. Charles Duhigg popularised it; he did not run the foundational studies.
3. Lally et al. found a median of 66 days to near-automaticity, but the range was 18–254 days. There is no 66-day rule.
4. Missing one opportunity did not reset the habit-formation curve.
5. Specific if-then plans have strong evidence: When X happens, I will do Y is more useful than I'll try harder.$s12t_tp$,
  video_link             = $s12t_vl$https://www.youtube.com/watch?v=W1eYrhGeffc$s12t_vl$,
  video_description      = $s12t_vd$Current assignment: animated Power of Habit material. Retain pending video review. Duhigg is a writer synthesising research, not the researcher who established the underlying habit findings.$s12t_vd$,
  todays_theme           = $s12t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Opening an app after a notification, checking something after sitting down, or doing the same thing when bored can become linked to the cue. Autopilot is efficient; the skill is seeing where it starts.$s12t_tdt$,
  todays_world_vo_script = $s12t_tdv$A repeated action becomes easier to change when you can see the cue that launches it.$s12t_tdv$,
  ancient_wisdom_reframe = $s12t_aw$Use a path through grass: repeated walking makes a route easier to follow. The image explains repetition without claiming the brain is literally carving one pathway.$s12t_aw$,
  ancient_wisdom_vo_script = $s12t_awv$A familiar path gets easier to follow. Seeing the turn gives you a place to test another step.$s12t_awv$,
  signal_metaphor        = $s12t_sm$Autoplay starts the next track because the setting is already on. A habit can feel similar: cue arrives, action starts. Today we find one autoplay setting.$s12t_sm$,
  private_write_prompt   = $s12t_pw$Choose one ordinary habit and write the most reliable cue immediately before it. Keep the content private if you want.$s12t_pw$,
  experiential_exercise  = $s12t_ex$MY HABIT LOOP. Map cue; action; immediate payoff; later effect; one alternative action. Do not require a deep emotional need. Sharing the cue or alternative is optional.$s12t_ex$,
  guided_reflection      = $s12t_gr$Keep your eyes open.
Write:
Cue:
Action:
Immediate payoff:
Alternative I could test:
You do not need to know when or why the habit first started.$s12t_gr$,
  journaling_prompt      = $s12t_jp$During the week, which cues were easiest to spot and what did the immediate payoff explain about why the behaviour keeps repeating?$s12t_jp$,
  intention_prompt       = $s12t_ip$Write one if-then plan: When [specific cue] happens, I will [small alternative action].$s12t_ip$,
  core_affirmation       = $s12t_ca$I can notice autopilot and test one small change without needing a perfect streak.$s12t_ca$,
  weekly_practice_mon    = $s12t_pm$Catch one habit and note cue, action and payoff.$s12t_pm$,
  weekly_practice_wed    = $s12t_pw2$Test the if-then alternative once; a missed attempt does not restart anything.$s12t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s12t_ps$Bring your habit map and one thing you learned about the cue or payoff. Sharing is optional.$s12t_ps$,
  previous_week_callback = $s12t_pwc$bring one example where you checked an assumption and notice whether your view changed$s12t_pwc$,
  facilitator_notes      = $s12t_fn$## Aim
Teach behaviour design without moralising, deep sourcing or fixed habit timelines.
## Run the room
Avoid clinically significant habits, food/body topics, and disclosure of private coping behaviour. Do not say willpower is useless. Require specificity in the plan, not vulnerability.
## Why this week exists — the evidence
Lally et al. show wide individual variation in automaticity and that one missed opportunity did not reset progress. Gollwitzer and Sheeran provide strong support for if-then planning.
Real-world anchor: the famous 21-day habit rule did not come from a habit experiment. Direct measurement found wide variation, making it a useful example of why catchy advice should be checked.
## Evidence quality
Strong for implementation intentions; moderate for habit timing and simplified loop models.
## We deliberately do not claim
- We do not claim half of every day is habit.
- We do not claim habits take 21, 30 or 66 days.
- We do not claim Duhigg conducted the research.
- We do not use ego depletion or willpower-as-muscle claims.
- We do not claim every habit hides a deep need.
## Source trail
- Wood, W., Quinn, J. M., & Kashy, D. A. (2002).
- Lally, P., et al. (2010).
- Gollwitzer, P. M., & Sheeran, P. (2006).$s12t_fn$,
  updated_at = now()
WHERE week_number = 12 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s12c_st$The Habit Path$s12c_st$,
  theme_title            = $s12c_tt$$s12c_tt$,
  phase                  = 1,
  phase_name             = $s12c_pn$See Clearly$s12c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s12c_hk$Ask children to show one everyday action they can do almost without thinking — putting on shoes, packing a bag, washing hands, opening a favourite game. Explain that automatic can be useful.$s12c_hk$,
  s5_source_core_concept = $s12c_cc$Today the child room learns a simple habit path: what happens first → what I do → what happens straight after. We notice the path and choose one small different step to practise. Missing a day does not mean starting again.$s12c_cc$,
  core_concept           = $s12c_cco$$s12c_cco$,
  teaching_points        = $s12c_tp$1. A habit is something we do repeatedly until it can become easy to start without much thinking.
2. A simple habit map has a cue, an action and an immediate payoff.
3. Automatic habits can be helpful; automatic does not mean bad.
4. Changing a habit takes different amounts of time for different people and behaviours. There is no magic number of days.
5. A useful plan names the cue and the new step: When this happens, I will try this.$s12c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s12c_sm$A habit is like a path through grass. Each time you walk it, the route becomes familiar. To try a new route, first notice where the path begins.$s12c_sm$,
  private_write_prompt   = $s12c_pw$Draw three boxes showing one habit path. In a fourth box draw one small different action you could try after the same cue. You may tell someone or keep it private.$s12c_pw$,
  experiential_exercise  = $s12c_ex$LOOP TRACK. Put three floor signs: WHAT HAPPENS FIRST / WHAT I DO / WHAT HAPPENS NEXT. Use only fixed, neutral examples such as coat goes on → shoes go on → ready to leave or bell rings → pack away → ready for next activity. Then children map one safe everyday habit on paper. No food examples and no disclosure of coping behaviours.
DRAW IT
Draw your old path and a tiny new path branching off at the cue. The new path can be one small step, not a perfect new habit.$s12c_ex$,
  guided_reflection      = $s12c_gr$Keep your eyes open and look at the first box.
Ask:
What is the cue?
What do I usually do next?
What happens straight after?
What is one other safe thing I could try?$s12c_gr$,
  journaling_prompt      = $s12c_jp$Draw your old path and a tiny new path branching off at the cue. The new path can be one small step, not a perfect new habit.$s12c_jp$,
  intention_prompt       = $s12c_ip$Choose one plan: When [my cue] happens, I will try [my small new action].$s12c_ip$,
  core_affirmation       = $s12c_ca$I can notice where a habit starts and practise one small different step.$s12c_ca$,
  weekly_practice_mon    = $s12c_pm$Notice one habit cue and say there it is.$s12c_pm$,
  weekly_practice_wed    = $s12c_pw2$Try your new action once when the cue appears. If you forget, nothing resets.$s12c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s12c_ps$Bring your habit-path drawing and one thing you noticed about where the path starts. Sharing is optional.$s12c_ps$,
  previous_week_callback = $s12c_pwc$bring one safe example of using your perspective-detective skill this week$s12c_pwc$,
  facilitator_notes      = $s12c_fn$## Aim
Teach cue/action/payoff concretely without shame, food/body material or fixed-day promises.
## Run the room
Use neutral examples. Do not ask what do you always do when upset?, use biscuit/food examples, or explore private coping habits. Keep the exercise about ordinary routines. A missed attempt is normal.
## Why this week exists — the evidence
Habit research supports the basic idea that repetition in stable contexts increases automaticity and that timing varies widely. If-then planning provides a simple age-matched structure for a child to link one cue with one action.
Real-world anchor: brushing teeth, packing a school bag and putting shoes on can become easier through repeated context. Children can see useful automaticity before discussing a habit they may want to change.
## Evidence quality
Moderate overall. Adult habit research supports the general mechanism; this child activity is a teaching adaptation. No exact habit timeline is taught.
## We deliberately do not claim
- We do not claim a habit takes 21, 30 or 66 days.
- We do not claim a child's brain literally saves a fixed amount of energy through habits.
- We do not use growth mindset as the mechanism for habit change.
- We do not use food, weight or body examples.
- We do not treat repeated behaviour as a character flaw.
## Source trail
- Lally, P., et al. (2010).
- Gollwitzer, P. M., & Sheeran, P. (2006).
- Child activity is an age-matched teaching adaptation.$s12c_fn$,
  updated_at = now()
WHERE week_number = 12 AND audience = 'Child';

-- Week 13 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw13_theme$$cw13_theme$,
  the_territory        = $cw13_terr$Looking back at what we've noticed$cw13_terr$,
  opening_question     = $cw13_oq$Which question or tool from this phase has been most useful, least useful or still uncertain for you? Passing is full participation.$cw13_oq$,
  week_type            = $cw13_wt$Integration$cw13_wt$,
  reflective_question  = $cw13_rq$Looking across the phase, what evidence do you have for what helped, what did not help, and what would you test differently over the next few weeks?$cw13_rq$,
  interactive_activity = $cw13_ia$PHASE 1 AUDIT. Make four columns: USED / HELPED / CHANGED OR CLARIFIED / NEXT. Put any Week 1–12 tool into the columns. Tools can be absent, repeated, modified or retired. Optional sharing: one item only; listening or keeping the page private is full participation.$cw13_ia$,
  kids_picture_book    = $cw13_bk$The Wonderful Things You Will Be$cw13_bk$,
  kids_picture_book_author = $cw13_bka$Emily Winfield Martin$cw13_bka$,
  kids_picture_book_note = $cw13_bkn$WHY THIS BOOK: Use it to discuss possibility without telling children who they will become or requiring a growth story.
READ-ALOUD: Read live from a purchased copy.$cw13_bkn$,
  kids_picture_book_question = $cw13_bkq$Can we learn things and still be the same person in lots of ways?$cw13_bkq$,
  kids_nz_alternative = $cw13_nz$Not yet selected$cw13_nz$,
  kids_nz_alternative_author = $cw13_nza$use the main book until an Aotearoa title has been reviewed for this integration theme.$cw13_nza$,
  kids_nz_alternative_note = $cw13_nzn$Any future alternative should support reflection without destiny, transformation or rite-of-passage framing.$cw13_nzn$,
  kids_colouring_prompt = $cw13_col$Colour a simple toolbox with spaces for a pause button, feeling word, mirror, path and question mark.$cw13_col$,
  kids_game = $cw13_g$TOOL STATIONS. Set up a few quiet stations with familiar tools: pause card, feeling-word cards, perspective picture, habit path. Children visit any stations they want; no stamps, completion requirement or public performance.$cw13_g$,
  kids_game_equipment = $cw13_ge$Tool picture cards; colouring sheets; familiar activity materials.$cw13_ge$,
  kids_game_under5 = $cw13_g5$Offer three picture stations only and let children choose freely.$cw13_g5$,
  updated_at = now()
WHERE week_number = 13;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s13a_st$The Audit Is Complete$s13a_st$,
  theme_title            = $s13a_tt$$s13a_tt$,
  phase                  = 1,
  phase_name             = $s13a_pn$See Clearly$s13a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s13a_hk$Look back at one note or memory from Week 1. Ask privately: What do I notice now that I did not notice then? No change is a valid answer.$s13a_hk$,
  s5_source_core_concept = $s13a_cc$Today the adult room reviews evidence from our own participation: what we noticed, what we used, what changed if anything, and what we want to keep. Mindcast does not declare transformation, neurological change or a completed identity shift.$s13a_cc$,
  core_concept           = $s13a_cco$$s13a_cco$,
  teaching_points        = $s13a_tp$1. Repeated practice can improve skill, but we have not measured a standardised outcome from thirteen weeks in this programme.
2. Self-monitoring can change behaviour in some contexts, but awareness itself is an intervention is too broad to teach as a universal rule.
3. Different approaches such as CBT, ACT, mindfulness and psychodynamic therapies are not reducible to one shared integration fulcrum. Mindcast borrows practical noticing tools without claiming therapeutic equivalence.
4. Integration can include keep, modify, retire, not sure. A tool does not become mandatory because it appeared in the curriculum.
5. Nobody is required to share evidence of growth, read a letter aloud or perform a milestone for the room.$s13a_tp$,
  video_link             = $s13a_vl$https://www.youtube.com/watch?v=sPOuCd6cBao$s13a_vl$,
  video_description      = $s13a_vd$Current assignment: David Foster Wallace, This Is Water. Retain pending video review. It is a commencement speech and cultural text, not research evidence for programme effects.$s13a_vd$,
  todays_theme           = $s13a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Reflection is useful when it improves the next decision, not when it becomes a requirement to produce an inspiring before-and-after story. Week 13 takes stock without demanding a transformation narrative.$s13a_tdt$,
  todays_world_vo_script = $s13a_tdv$The useful question is not how much have I changed? It is what can I now notice or use that is worth keeping?$s13a_tdv$,
  ancient_wisdom_reframe = $s13a_aw$Cycles and returns appear in many traditions. Use that only as a cultural lens for review and continuation; do not stage a rite of passage or claim a threshold has been crossed.$s13a_aw$,
  ancient_wisdom_vo_script = $s13a_awv$Looking back can help you choose what to carry forward without turning review into ceremony.$s13a_awv$,
  signal_metaphor        = $s13a_sm$Open a toolbox and check the tools: used, useful, needs modification, not for me yet. A full toolbox is not the goal; knowing which tool fits is.$s13a_sm$,
  private_write_prompt   = $s13a_pw$Write one thing you now notice more easily than in Week 1, one thing that has not changed, and one question you still have.$s13a_pw$,
  experiential_exercise  = $s13a_ex$PHASE 1 AUDIT. Make four columns: USED / HELPED / CHANGED OR CLARIFIED / NEXT. Put any Week 1–12 tool into the columns. Tools can be absent, repeated, modified or retired. Optional sharing: one item only; listening or keeping the page private is full participation.$s13a_ex$,
  guided_reflection      = $s13a_gr$Keep your eyes open and scan your audit.
Write:
One thing I can support with examples:
One tool I want to keep or modify:
One thing I am not claiming:
One question I am carrying forward:
No statement of transformation is required.$s13a_gr$,
  journaling_prompt      = $s13a_jp$Looking across the phase, what evidence do you have for what helped, what did not help, and what would you test differently over the next few weeks?$s13a_jp$,
  intention_prompt       = $s13a_ip$Write one if-then plan using a tool you choose to keep: When [specific cue] happens, I will test [specific tool/action].$s13a_ip$,
  core_affirmation       = $s13a_ca$I can keep what is useful, question what is not, and let my own evidence guide what comes next.$s13a_ca$,
  weekly_practice_mon    = $s13a_pm$Revisit one earlier note and compare it with what you notice now.$s13a_pm$,
  weekly_practice_wed    = $s13a_pw2$Use one tool you chose to keep and record whether it was useful in that context.$s13a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s13a_ps$Bring one observation about a tool you are keeping, modifying or retiring. Sharing is optional.$s13a_ps$,
  previous_week_callback = $s13a_pwc$bring back your habit map and one thing you learned about the cue or payoff$s13a_pwc$,
  facilitator_notes      = $s13a_fn$## Aim
Close Phase 1 with ordinary review rather than ceremony, testimony or claims of transformation.
## Run the room
No circle-and-witness staging, candles, darkened room, hand-on-heart, silence as spectacle, letters read aloud by expectation, applause for vulnerability or before/after storytelling. A member may report no change and be treated as fully participating.
## Why this week exists — the evidence
Practice generally improves practised skills, but Mindcast has not run a controlled evaluation showing what thirteen weeks causes. The evidence this session uses is participant-level observation: what did they actually use and what examples support their own conclusion?
Real-world anchor: product and safety reviews work by checking what was used, what failed and what should be changed next rather than declaring success because a scheduled period ended. Week 13 applies that same review discipline to personal-development tools.
## Evidence quality
Illustrative to moderate. General skill-practice evidence is strong, but programme-specific effects are unmeasured. The integration audit is a structured reflection tool, not a validated outcome measure.
## We deliberately do not claim
- We do not claim thirteen weeks changed anyone's brain or produced transformation.
- We do not claim awareness itself reliably changes behaviour.
- We do not claim CBT, ACT, psychodynamic therapy and mindfulness all converge on one Mindcast mechanism.
- We do not claim every participant should feel different.
- We do not require testimony, public sharing or ceremonial acknowledgment.
## Source trail
- Programme-specific outcomes: not yet established by controlled evaluation.
- General behaviour/self-monitoring literature informs review, with no universal causal claim.$s13a_fn$,
  updated_at = now()
WHERE week_number = 13 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s13t_st$The Diagnostic Is Complete$s13t_st$,
  theme_title            = $s13t_tt$$s13t_tt$,
  phase                  = 1,
  phase_name             = $s13t_pn$See Clearly$s13t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s13t_hk$Think back to Week 1 and choose one thing that is easier to notice now — or write nothing obvious yet. Both answers count.$s13t_hk$,
  s5_source_core_concept = $s13t_cc$Today the teen room reviews Phase 1 without declaring anyone transformed, braver, more authentic or neurologically changed. You decide which tools were useful, which were not and which still need testing.$s13t_cc$,
  core_concept           = $s13t_cco$$s13t_cco$,
  teaching_points        = $s13t_tp$1. Thirteen weeks is meaningful practice time, but Mindcast has not measured a standardised programme effect for individual teens.
2. Growth mindset is a real research area, but average effects on achievement are modest and concentrated in some contexts. It is not evidence that believing harder changes everything.
3. A useful review asks what did I use, what happened, what will I try next? rather than am I a different person?
4. A tool can be kept, modified, ignored or retired. Choosing not to use one is legitimate.
5. Nobody has to read a letter, disclose personal insight or show progress publicly.$s13t_tp$,
  video_link             = $s13t_vl$https://www.youtube.com/watch?v=jqONINYF17M$s13t_vl$,
  video_description      = $s13t_vd$Current assignment: Carol Dweck on growth mindset. Retain pending video review. Any use must include the required caveat that average academic effects are modest and context-dependent; the video is not evidence that Phase 1 transformed participants.$s13t_vd$,
  todays_theme           = $s13t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
People are often pushed to turn learning into a before-and-after story. Week 13 does something simpler: check what you actually noticed, used and want to carry forward.$s13t_tdt$,
  todays_world_vo_script = $s13t_tdv$You do not owe anyone a dramatic change story. Your own examples are enough data for today.$s13t_tdv$,
  ancient_wisdom_reframe = $s13t_aw$Many learning traditions pause to review before beginning new material. Use that as a simple cultural lens for reflection, not a rite of passage or threshold ceremony.$s13t_aw$,
  ancient_wisdom_vo_script = $s13t_awv$Review helps you decide what to keep. It does not need a ceremony or a dramatic ending.$s13t_awv$,
  signal_metaphor        = $s13t_sm$Think of an app folder after a term: keep the apps you use, move the ones you might need, delete the ones that do nothing for you. The phone does not need every tool installed.$s13t_sm$,
  private_write_prompt   = $s13t_pw$Write one thing you notice more easily now, one thing that has not changed, and one tool you are unsure about.$s13t_pw$,
  experiential_exercise  = $s13t_ex$PHASE 1 TOOL AUDIT. Make four boxes: USED / HELPED / DIDN'T HELP OR NOT SURE / KEEP-CHANGE-DROP. Add any Week 1–12 tools. No public ranking and no required sharing.$s13t_ex$,
  guided_reflection      = $s13t_gr$Keep your eyes open.
Write:
One example I can actually support:
One tool I want to keep or change:
One thing I am not claiming about myself:
One thing I want to test next:$s13t_gr$,
  journaling_prompt      = $s13t_jp$Looking across the phase, what evidence do you have for which tools fit you, which did not, and what would you test differently next time?$s13t_jp$,
  intention_prompt       = $s13t_ip$Write one if-then plan using a tool you choose: When [specific cue] happens, I will test [specific tool/action].$s13t_ip$,
  core_affirmation       = $s13t_ca$I can keep what helps, question what doesn't, and decide what I want to test next.$s13t_ca$,
  weekly_practice_mon    = $s13t_pm$Look at one old note or drawing and notice what you think about it now.$s13t_pm$,
  weekly_practice_wed    = $s13t_pw2$Test one tool you chose to keep and record whether it helped in that specific situation.$s13t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s13t_ps$Bring one observation about a tool you are keeping, changing or dropping. Sharing is optional.$s13t_ps$,
  previous_week_callback = $s13t_pwc$bring your habit map and one thing you learned about the cue or payoff$s13t_pwc$,
  facilitator_notes      = $s13t_fn$## Aim
Integrate without ceremony, growth pressure or transformation claims.
## Run the room
No eyes-closed retrospective, rites of passage, public letters, mandatory sharing or statements such as you are not the same person. Treat nothing changed as a valid observation. Keep growth-mindset claims modest.
## Why this week exists — the evidence
Review and retrieval can support learning, but no study establishes that this 13-week programme causes identity transformation. The session therefore uses participants' own examples rather than a programme claim.
Real-world anchor: after a sports season or school term, useful review separates what worked, what didn't and what to practise next. That is more actionable than insisting the person has become a new version of themselves.
## Evidence quality
Illustrative to moderate. Reflection/retrieval principles are broadly supported. Programme-specific transformation is unmeasured. Growth-mindset effects are modest and context-dependent.
## We deliberately do not claim
- We do not claim a transformative experience occurred.
- We do not claim thirteen weeks changed anyone's brain or identity.
- We do not claim growth mindset has a large universal effect.
- We do not require a progress story, letter reading or public insight.
- We do not use ceremonial threshold language.
## Source trail
- Sisk, V. F., et al. (2018). Growth-mindset meta-analysis.
- Programme-specific outcomes: not established by controlled evaluation.$s13t_fn$,
  updated_at = now()
WHERE week_number = 13 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s13c_st$Looking at Our Full Backpack$s13c_st$,
  theme_title            = $s13c_tt$$s13c_tt$,
  phase                  = 1,
  phase_name             = $s13c_pn$See Clearly$s13c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s13c_hk$Lay out picture cards from Weeks 1–12. Children may point to one they remember, one they liked, one they did not like, or pass.$s13c_hk$,
  s5_source_core_concept = $s13c_cc$Today the child room looks back at the tools we tried. You can keep a tool, change it, forget it for now or decide it was not useful. Nobody has to be braver, better or different because thirteen weeks have passed.$s13c_cc$,
  core_concept           = $s13c_cco$$s13c_cco$,
  teaching_points        = $s13c_tp$1. We have practised noticing body signals, feelings, stories, habits, self-talk and other people's perspectives.
2. Different tools help different people in different situations.
3. A tool that did not help is useful information, not failure.
4. Learning can mean remembering something, noticing sooner or simply knowing another option exists.
5. Nobody has to share a private lesson or prove how much they changed.$s13c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s13c_sm$Think of a toolbox. Some tools get used often, some only sometimes, and some may not fit the job. A good toolbox is not the one with the most tools; it is the one where you can find what helps.$s13c_sm$,
  private_write_prompt   = $s13c_pw$Choose one tool and draw a safe example of when it could help. Or draw a tool you would change. You may tell someone or keep it private.$s13c_pw$,
  experiential_exercise  = $s13c_ex$TOOLBOX REVIEW. Give children a toolbox/backpack page with picture icons from the phase. They mark each I used it / maybe later / not for me / don't remember. No scoring and no public ranking.
DRAW IT
Draw your toolbox with one tool you want near the top and one you can put away for now.$s13c_ex$,
  guided_reflection      = $s13c_gr$Keep your eyes open and look at your page.
Ask:
Which tool do I understand best?
Which one am I unsure about?
Is there one I want to try again?
No favourite is a good answer.$s13c_gr$,
  journaling_prompt      = $s13c_jp$Draw your toolbox with one tool you want near the top and one you can put away for now.$s13c_jp$,
  intention_prompt       = $s13c_ip$Choose one plan: When [a safe, ordinary cue] happens, I will try [one tool I choose].$s13c_ip$,
  core_affirmation       = $s13c_ca$I can keep the tools that help me and leave the others for another time.$s13c_ca$,
  weekly_practice_mon    = $s13c_pm$Choose one tool to notice or use once this week, if you want to.$s13c_pm$,
  weekly_practice_wed    = $s13c_pw2$Show a trusted grown-up one tool you remember, or simply tell them which one you liked or did not like.$s13c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s13c_ps$Bring your toolbox drawing back and choose one tool you want to keep nearby for now. Sharing is optional.$s13c_ps$,
  previous_week_callback = $s13c_pwc$bring your habit-path drawing and one thing you noticed about where the path starts$s13c_pwc$,
  facilitator_notes      = $s13c_fn$## Aim
Finish Phase 1 through ordinary review, choice and independence rather than celebration pressure or ceremony.
## Run the room
No treasure-map rite, circle testimony, braver than before, adventure/hero framing, eyes-closed retrospective or applause for personal disclosure. Children may say they do not remember or did not like a tool.
## Why this week exists — the evidence
Review and retrieval can strengthen learning, but Mindcast has not measured a standardised Phase 1 effect in children. The honest task is simply to help children recognise available tools and choose which, if any, they want to reuse.
Real-world anchor: a classroom pencil case contains tools for different jobs. A child does not need to use every pencil every day. The same principle makes the curriculum's tools optional and practical.
## Evidence quality
Illustrative to moderate. Retrieval and review principles are broadly supported. This toolbox activity is a teaching adaptation, not an outcome measure.
## We deliberately do not claim
- We do not claim children are braver, transformed or neurologically changed after thirteen weeks.
- We do not claim every tool works for every child.
- We do not require public sharing or a favourite tool.
- We do not use rite-of-passage, hero or product-journey language.
## Source trail
- General learning/retrieval principles inform the review structure.
- Programme-specific child outcomes: not established by controlled evaluation.$s13c_fn$,
  updated_at = now()
WHERE week_number = 13 AND audience = 'Child';

-- Week 14 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw14_theme$$cw14_theme$,
  the_territory        = $cw14_terr$Waiting for someone to say you're allowed$cw14_terr$,
  opening_question     = $cw14_oq$When is waiting wise rather than avoidant? Passing is full participation.$cw14_oq$,
  week_type            = $cw14_wt$Movement opener$cw14_wt$,
  reflective_question  = $cw14_rq$Across the week, where did you notice yourself seeking approval you did not need, and where did consultation or waiting turn out to be the more responsible choice?$cw14_rq$,
  interactive_activity = $cw14_ia$PERMISSION / CONSULTATION / WAIT. Put delayed actions into three columns: mine to decide / involves other people / more information or safety needed. Choose one item from mine to decide and shrink it to the smallest useful step. Sharing is optional.$cw14_ia$,
  kids_picture_book    = $cw14_bk$What Do You Do With an Idea?$cw14_bk$,
  kids_picture_book_author = $cw14_bka$Kobi Yamada$cw14_bka$,
  kids_picture_book_note = $cw14_bkn$WHY THIS BOOK: It supports looking after an idea while allowing adults to keep responsibility for safety, resources and boundaries.
READ-ALOUD: Read live from a purchased copy.$cw14_bkn$,
  kids_picture_book_question = $cw14_bkq$What could the child start doing with the idea by themselves? When might they still ask a grown-up for help?$cw14_bkq$,
  kids_nz_alternative = $cw14_nz$Not yet selected$cw14_nz$,
  kids_nz_alternative_author = $cw14_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw14_nza$,
  kids_nz_alternative_note = $cw14_nzn$Any future alternative must support curiosity without secrecy or "nobody can tell you what to do" messaging.$cw14_nzn$,
  kids_colouring_prompt = $cw14_col$Colour a green GO button and a blue ASK button with one safe example beside each.$cw14_col$,
  kids_game = $cw14_g$GO / ASK CORNERS. Two corners are labelled GO and ASK; children move or point after a fixed scenario. Add a middle NOT SURE option and reinforce that NOT SURE goes to a trusted adult. Never remove the adult caller as a trick about "permission that isn't coming."$cw14_g$,
  kids_game_equipment = $cw14_ge$GO/ASK/NOT SURE cards; crayons.$cw14_ge$,
  kids_game_under5 = $cw14_g5$Use only GO and ASK with very obvious safe examples.$cw14_g5$,
  updated_at = now()
WHERE week_number = 14;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s14a_st$You Are the Authority$s14a_st$,
  theme_title            = $s14a_tt$$s14a_tt$,
  phase                  = 2,
  phase_name             = $s14a_pn$Unlearn$s14a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s14a_hk$Write one low-risk action you have delayed partly because you were waiting for approval, readiness or reassurance. Then ask: Does this decision actually belong only to me?$s14a_hk$,
  s5_source_core_concept = $s14a_cc$Today the adult room distinguishes permission, consultation and responsibility. Some choices are ours alone; some affect partners, whānau, workplaces or safety and should involve other people. We practise one small action where authority genuinely sits with us.$s14a_cc$,
  core_concept           = $s14a_cco$$s14a_cco$,
  teaching_points        = $s14a_tp$1. Approval-seeking can persist beyond situations where formal permission is required, but not all waiting is fear. Waiting can reflect safety, judgment, resources, obligations or care for others.
2. Bandura's self-efficacy describes belief in one's capacity to carry out a specific action. It predicts behaviour in many domains, but it is not a claim that we are entitled to act without consent or consequences.
3. Action can generate information and confidence, but action always precedes readiness is too strong. Sometimes preparation before action is exactly right.
4. Autonomy does not mean isolation. Consulting people who are affected by a choice can be part of acting responsibly.
5. The output this week is deliberately small and reversible where possible — not a pressured decision about a job, relationship, finances or other major commitment.$s14a_tp$,
  video_link             = $s14a_vl$https://www.youtube.com/watch?v=iG9CE55wbtY$s14a_vl$,
  video_description      = $s14a_vd$Current assignment: Tim Ferriss on fear-setting. Retain pending video review. Ferriss is a writer/entrepreneur presenting a decision tool, not the source of a settled research finding about readiness or self-authorisation.$s14a_vd$,
  todays_theme           = $s14a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Sending a draft, starting a hobby, applying for something or expressing a preference can get delayed while we wait for certainty or approval. Other choices genuinely affect other people and should not be reframed as "permission you don't need."$s14a_tdt$,
  todays_world_vo_script = $s14a_tdv$Before giving yourself a green light, check that the decision is actually yours to make.$s14a_tdv$,
  ancient_wisdom_reframe = $s14a_aw$Daoist ideas of naturalness can be used as a cultural lens for less forced action, not as evidence that "authentic nature" should override responsibility, consent or consultation.$s14a_aw$,
  ancient_wisdom_vo_script = $s14a_awv$Self-directed action can be quiet and responsible; it does not need to be rebellious.$s14a_awv$,
  signal_metaphor        = $s14a_sm$Think of traffic lights you control and traffic lights you do not. The skill is knowing which intersection you are actually responsible for.$s14a_sm$,
  private_write_prompt   = $s14a_pw$Write one low-risk action you have delayed and list who, if anyone, is genuinely affected by the decision.$s14a_pw$,
  experiential_exercise  = $s14a_ex$PERMISSION / CONSULTATION / WAIT. Put delayed actions into three columns: mine to decide / involves other people / more information or safety needed. Choose one item from mine to decide and shrink it to the smallest useful step. Sharing is optional.$s14a_ex$,
  guided_reflection      = $s14a_gr$Keep your eyes open.
Write:
The decision:
Who is affected:
What authority is actually mine:
The smallest responsible next step:
What would make waiting sensible:$s14a_gr$,
  journaling_prompt      = $s14a_jp$Across the week, where did you notice yourself seeking approval you did not need, and where did consultation or waiting turn out to be the more responsible choice?$s14a_jp$,
  intention_prompt       = $s14a_ip$Write one if-then plan: When I notice myself waiting for approval on [specific low-risk action], I will check whether the decision is mine and take [small next step] if it is.$s14a_ip$,
  core_affirmation       = $s14a_ca$I can recognise the choices that are mine while respecting consent, responsibility and good reasons to wait.$s14a_ca$,
  weekly_practice_mon    = $s14a_pm$Catch one permission-seeking moment and classify it: mine / consult / wait.$s14a_pm$,
  weekly_practice_wed    = $s14a_pw2$Take one small, responsible action from the mine column.$s14a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s14a_ps$Bring one observation about a time you acted, consulted or waited more deliberately. Sharing is optional.$s14a_ps$,
  previous_week_callback = $s14a_pwc$bring one observation about a tool you are keeping modifying or retiring$s14a_pwc$,
  facilitator_notes      = $s14a_fn$## Aim
Build calibrated autonomy without urgency or permission-as-pressure.
## Run the room
Do not celebrate impulsive resignations, breakups, spending or other consequential decisions. Never imply consulting a partner or whānau is weakness. Keep the output small, low-risk and specific.
## Why this week exists — the evidence
Self-efficacy research supports the importance of perceived capability for action. It does not establish that external approval is the main barrier to change or that readiness follows action in every case.
Real-world anchor: sending a first enquiry about a course is reversible; signing a large financial contract is not. Week 14 teaches members to distinguish self-authorisation from responsible decision-making rather than treating all hesitation alike.
## Evidence quality
Moderate overall. Self-efficacy is well established as a domain-specific construct. Broad claims about waiting, readiness and permission are more contextual. The traffic-light metaphor is illustrative.
## We deliberately do not claim
- We do not claim waiting is always fear or self-sabotage.
- We do not claim self-efficacy is the single strongest predictor of all change.
- We do not claim autonomy means ignoring people affected by a decision.
- We do not claim any important decision needs to be made today.
- We do not use urgency or pressure as motivation.
## Source trail
- Bandura, A. — self-efficacy research programme.
- Decision/autonomy claims kept contextual rather than universal.$s14a_fn$,
  updated_at = now()
WHERE week_number = 14 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s14t_st$Admin Access Granted$s14t_st$,
  theme_title            = $s14t_tt$$s14t_tt$,
  phase                  = 2,
  phase_name             = $s14t_pn$Unlearn$s14t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s14t_hk$Think privately of one small thing you want to try. Ask: Is this mine to decide, something I should talk through with a caregiver, or something that needs permission for safety or rules?$s14t_hk$,
  s5_source_core_concept = $s14t_cc$Today the teen room practises calibrated autonomy. We do not tell young people that permission from caregivers is obsolete or that the "real you" should act without approval. We sort choices into mine / talk it through / permission or safety required and take one low-risk step from the first category.$s14t_cc$,
  core_concept           = $s14t_cco$$s14t_cco$,
  teaching_points        = $s14t_tp$1. Growing autonomy is a normal part of adolescence, and legitimate caregiver responsibility remains real.
2. Some decisions are personal preferences; others involve transport, money, safety, school requirements, legal rules or another person's consent.
3. Self-efficacy means believing you can perform a specific action. It does not mean you are entitled to ignore boundaries or rules.
4. Waiting is not always fear. It can be planning, safety, respect or not having enough information yet.
5. Mindcast never encourages a young person to keep a plan secret from caregivers or to treat a facilitator as the person granting permission.$s14t_tp$,
  video_link             = $s14t_vl$https://www.youtube.com/watch?v=8CrOL-ydFMI$s14t_vl$,
  video_description      = $s14t_vd$Current assignment: Ken Robinson, Do Schools Kill Creativity? Retain pending video review. Robinson was a writer/speaker making an argument; do not use the talk as evidence that school systems suppress an authentic self or that teens should disregard legitimate authority.$s14t_vd$,
  todays_theme           = $s14t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Teens move between choices that are genuinely theirs — interests, style, creative work, many preferences — and choices involving safety, law, family resources, school rules or another person's consent. Week 14 practises telling the difference.$s14t_tdt$,
  todays_world_vo_script = $s14t_tdv$Independence is not doing everything alone. It includes knowing when the choice is yours and when other people are genuinely part of it.$s14t_tdv$,
  ancient_wisdom_reframe = $s14t_aw$Use a gate metaphor: some gates are yours to open; some belong to shared spaces and need agreement. Wisdom includes knowing which is which.$s14t_aw$,
  ancient_wisdom_vo_script = $s14t_awv$Being able to choose includes knowing when a choice is shared.$s14t_awv$,
  signal_metaphor        = $s14t_sm$Admin access lets you change your own settings; it does not give you control of somebody else's account. Autonomy has boundaries too.$s14t_sm$,
  private_write_prompt   = $s14t_pw$Write one small thing you would like to try. Mark it mine / talk with a trusted adult / permission or safety required / not sure. Keep it private.$s14t_pw$,
  experiential_exercise  = $s14t_ex$DRAFT / CHECK / SEND. Use fixed scenarios first, then one personal low-risk example. Sort: can start myself; talk with caregiver/affected person; needs permission/safety check. For a can start myself item, choose one tiny reversible step. Sharing is optional.$s14t_ex$,
  guided_reflection      = $s14t_gr$Keep your eyes open.
Write:
What I want to try:
Who is genuinely affected:
Which category it belongs in:
One safe next step, if it is mine:
If you are unsure, ask a trusted adult is a complete next step.$s14t_gr$,
  journaling_prompt      = $s14t_jp$During the week, where did you notice a choice was more yours than you thought, and where did talking with a caregiver or another affected person make the decision better?$s14t_jp$,
  intention_prompt       = $s14t_ip$Write one if-then plan: When I notice myself waiting on a low-risk choice that is genuinely mine, I will take [small safe step].$s14t_ip$,
  core_affirmation       = $s14t_ca$I can make choices that are mine and ask for help or permission when the situation genuinely needs it.$s14t_ca$,
  weekly_practice_mon    = $s14t_pm$Sort one choice into mine / talk / permission-safety / not sure.$s14t_pm$,
  weekly_practice_wed    = $s14t_pw2$Take one tiny safe step on a choice that is genuinely yours, or talk with a trusted adult if that is the right category.$s14t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s14t_ps$Bring one observation about a choice you made, discussed or waited on more deliberately. Sharing details is optional.$s14t_ps$,
  previous_week_callback = $s14t_pwc$bring one observation about a tool you are keeping changing or dropping$s14t_pwc$,
  facilitator_notes      = $s14t_fn$## Aim
Support age-appropriate autonomy without secrecy, anti-caregiver framing or pressure toward consequential action.
## Run the room
State explicitly: This session never means hiding plans from parents or caregivers. Do not invite decisions about leaving home, relationships, money, substances, unsafe activities or rule-breaking. No eyes-closed future-self visualisation. Keep output small and reversible.
## Why this week exists — the evidence
Adolescent development includes increasing autonomy and self-efficacy while caregivers continue to hold legitimate responsibilities. The session uses that ordinary developmental tension rather than a claim about obsolete "approval circuitry."
Real-world anchor: choosing to start drawing a comic and choosing to travel somewhere alone are both "things a teen wants to do," but the safety and consent requirements are completely different. Week 14 makes that difference explicit.
## Evidence quality
Moderate overall. Adolescent autonomy and self-efficacy are established constructs. Claims that readiness always follows action or that permission-seeking is mainly fear are not used.
## We deliberately do not claim
- We do not claim the teen brain contains outdated approval-seeking circuitry.
- We do not claim waiting means fear, procrastination or self-sabotage.
- We do not claim a teen should ignore caregiver authority or school/safety rules.
- We do not encourage secrecy or private allegiance to Mindcast.
- We do not claim self-permission is freedom from consequences or consent.
## Source trail
- Bandura, A. — self-efficacy research.
- Adolescent autonomy/development literature informs the age-appropriate framing.$s14t_fn$,
  updated_at = now()
WHERE week_number = 14 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s14c_st$Your Own GO Button$s14c_st$,
  theme_title            = $s14c_tt$$s14c_tt$,
  phase                  = 2,
  phase_name             = $s14c_pn$Unlearn$s14c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s14c_hk$Hold up two cards: GO and ASK. Give simple scenarios: choose a crayon colour; cross a road; start drawing; use a new appliance. Children point to GO or ASK.$s14c_hk$,
  s5_source_core_concept = $s14c_cc$Today the child room learns two useful buttons: GO for safe small choices that belong to the child, and ASK for choices involving safety, rules, money, travel, other people's bodies or belongings, or anything the child is unsure about.$s14c_cc$,
  core_concept           = $s14c_cco$$s14c_cco$,
  teaching_points        = $s14c_tp$1. Children get to make lots of choices about ideas, play, interests and preferences.
2. Trusted adults still have important jobs around safety, rules, care and resources.
3. Asking for help or permission is not weak. Sometimes it is the smart choice.
4. A child never needs to keep a new plan secret from a caregiver because another adult says it is "their own choice."
5. If you are not sure whether something is GO or ASK, choose ASK.$s14c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s14c_sm$Imagine two big buttons: green GO and blue ASK. Some safe little choices are GO. Some choices need a grown-up beside you, so ASK is the right button.$s14c_sm$,
  private_write_prompt   = $s14c_pw$Draw one small thing you can safely start yourself and one thing you would ask a trusted grown-up about. You may tell someone or keep the page private.$s14c_pw$,
  experiential_exercise  = $s14c_ex$GO / ASK / NOT SURE. Use 8–10 fixed scenarios: choose a book, draw a picture, cross a road, borrow someone's thing, try a new playground activity, use scissors, send a message, start a craft. Children sort cards. Then each child may draw one personal safe GO choice and one ASK choice. No secrets.
DRAW IT
Draw your GO and ASK buttons. Add one picture under each.$s14c_ex$,
  guided_reflection      = $s14c_gr$Keep your eyes open.
Look at one choice and ask:
Is anyone else affected?
Is there a safety or rule question?
Do I know enough?
If you are not sure, choose ASK.$s14c_gr$,
  journaling_prompt      = $s14c_jp$Draw your GO and ASK buttons. Add one picture under each.$s14c_jp$,
  intention_prompt       = $s14c_ip$Choose one plan: When I have a new idea, I will decide GO, ASK or NOT SURE — and if I'm not sure, I will ask a trusted grown-up.$s14c_ip$,
  core_affirmation       = $s14c_ca$I can make safe choices for myself and ask a trusted grown-up when I need help or permission.$s14c_ca$,
  weekly_practice_mon    = $s14c_pm$Make one small safe GO choice yourself.$s14c_pm$,
  weekly_practice_wed    = $s14c_pw2$Ask a trusted grown-up about one choice where their help or permission is useful.$s14c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s14c_ps$Bring your GO/ASK drawing back and add one new example you noticed this week. Sharing is optional.$s14c_ps$,
  previous_week_callback = $s14c_pwc$bring your toolbox drawing back and choose one tool you want to keep nearby for now$s14c_pwc$,
  facilitator_notes      = $s14c_fn$## Aim
Teach age-appropriate autonomy with explicit caregiver, consent and safety boundaries.
## Run the room
Never use nobody is coming to say go, secrecy, leap/fly metaphors that reward acting without adults, or examples involving unsafe independence. Do not ask children for an idea they have never told anyone. Reinforce ASK and NOT SURE as successful choices.
## Why this week exists — the evidence
Developing autonomy means gradually increasing appropriate choice while adults retain responsibility for safety and care. The curriculum translates that into concrete categories rather than abstract self-authorisation.
Real-world anchor: choosing a crayon colour and crossing a road are both choices, but only one belongs entirely to a young child. The GO/ASK distinction makes autonomy practical instead of absolute.
## Evidence quality
Moderate overall. Child autonomy develops gradually and contextually. This GO/ASK activity is a teaching adaptation, not an assessment of maturity.
## We deliberately do not claim
- We do not claim children already have permission for everything that feels "most them."
- We do not frame adult permission as an obstacle to authentic identity.
- We do not encourage secrecy or acting without caregiver knowledge.
- We do not claim waiting or asking means fear.
- We do not use urgency or risk-taking as evidence of growth.
## Source trail
- Developmental autonomy literature informs the gradual-choice principle.
- Safeguarding and caregiver boundaries follow MC-SAF-001.$s14c_fn$,
  updated_at = now()
WHERE week_number = 14 AND audience = 'Child';

-- Week 15 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw15_theme$$cw15_theme$,
  the_territory        = $cw15_terr$Trying to be who everyone expects$cw15_terr$,
  opening_question     = $cw15_oq$Which expectations become hardest to notice because they are treated as obvious? Passing is full participation.$cw15_oq$,
  week_type            = $cw15_wt$Standard$cw15_wt$,
  reflective_question  = $cw15_rq$Across the week, which inherited expectations felt more chosen once examined, and which became less convincing or needed modification?$cw15_rq$,
  interactive_activity = $cw15_ia$SCRIPT AUDIT. For one expectation write: source; what it gives me; what it costs; what values it serves; keep / modify / question / not sure. Do not require a rebellious answer. Sharing is optional.$cw15_ia$,
  kids_picture_book    = $cw15_bk$Red: A Crayon's Story$cw15_bk$,
  kids_picture_book_author = $cw15_bka$Michael Hall$cw15_bka$,
  kids_picture_book_note = $cw15_bkn$WHY THIS BOOK: The story shows a label not fitting well, but use it carefully: the lesson is exploration and observation, not that family or adults are wrong about a child.
READ-ALOUD: Read live from a purchased copy.$cw15_bkn$,
  kids_picture_book_question = $cw15_bkq$What helped the crayon find something that worked better? Did everybody who guessed wrong mean harm?$cw15_bkq$,
  kids_nz_alternative = $cw15_nz$Not yet selected$cw15_nz$,
  kids_nz_alternative_author = $cw15_nza$use the main book until an Aotearoa title has been reviewed for this theme.$cw15_nza$,
  kids_nz_alternative_note = $cw15_nzn$A future alternative should support curiosity and whānau connection rather than individualist separation.$cw15_nzn$,
  kids_colouring_prompt = $cw15_col$Colour a picture with some finished shapes and some blank shapes. Add your own colour or pattern to one blank shape.$cw15_col$,
  kids_game = $cw15_g$CHOICE TABLES. Set out several safe activity stations — drawing, building, simple puzzle, movement card. Children choose one, switch if they want, or watch. There is no first lap where adults assign an identity or costume.$cw15_g$,
  kids_game_equipment = $cw15_ge$Simple activity materials; crayons.$cw15_ge$,
  kids_game_under5 = $cw15_g5$Offer two choices and allow watching as a third choice.$cw15_g5$,
  updated_at = now()
WHERE week_number = 15;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s15a_st$Default Settings and Custom Configuration$s15a_st$,
  theme_title            = $s15a_tt$$s15a_tt$,
  phase                  = 2,
  phase_name             = $s15a_pn$Unlearn$s15a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s15a_hk$Complete privately: By this age I thought I was supposed to… Then mark the expectation mine / inherited / shared / not sure.$s15a_hk$,
  s5_source_core_concept = $s15a_cc$Today the adult room examines expectations without assuming inherited means wrong. Family, culture, whānau, institutions and earlier versions of ourselves all contribute scripts. The task is to make one script visible enough to choose knowingly.$s15a_cc$,
  core_concept           = $s15a_cco$$s15a_cco$,
  teaching_points        = $s15a_tp$1. Research on possible selves and self-discrepancy shows that people carry imagined futures and standards about who they might, should or fear becoming. These models can guide action and can also create distress when treated as rigid requirements.
2. Hochschild's feeling rules describe social expectations about appropriate emotion. The concept can help us notice norms without claiming every life choice is simply a feeling rule.
3. Identity-status models describe exploration and commitment as useful dimensions, but they are descriptive frameworks rather than instructions to reject inherited identities.
4. Collective identity and obligation are legitimate. For many Māori and Pasifika whānau, a choice can be deeply personal and relational at the same time.
5. Grief may occur when a long-held future changes, but grief is not required and does not prove the old script was wrong.$s15a_tp$,
  video_link             = $s15a_vl$https://www.youtube.com/watch?v=NiuDFBNDoSk$s15a_vl$,
  video_description      = $s15a_vd$Current assignment: Emily Esfahani Smith. Retain pending video review. Treat the talk as a writer's synthesis and perspective, not direct evidence that meaning is superior to happiness or inherited expectations.$s15a_vd$,
  todays_theme           = $s15a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Career milestones, housing, parenting, relationships and family roles often arrive with invisible timelines. The useful question is not whose script should I reject? but which expectations am I consciously choosing now?$s15a_tdt$,
  todays_world_vo_script = $s15a_tdv$An inherited expectation becomes more workable when you can see it clearly enough to choose it rather than merely obey or rebel against it.$s15a_tdv$,
  ancient_wisdom_reframe = $s15a_aw$Use the uncarved block only as a Daoist image of simplicity, not evidence that there was a pure pre-social self before family and culture. Human identity is relational from the beginning.$s15a_aw$,
  ancient_wisdom_vo_script = $s15a_awv$The aim is not to return to an untouched self. It is to notice what has shaped you and choose what still belongs.$s15a_awv$,
  signal_metaphor        = $s15a_sm$Think of default settings on a device. Defaults can be useful; customising everything is not automatically better. The skill is knowing which settings you have actually reviewed.$s15a_sm$,
  private_write_prompt   = $s15a_pw$Write one expectation about work, relationships, success, emotion, family or lifestyle that has felt like a should. Note where it came from as best you can.$s15a_pw$,
  experiential_exercise  = $s15a_ex$SCRIPT AUDIT. For one expectation write: source; what it gives me; what it costs; what values it serves; keep / modify / question / not sure. Do not require a rebellious answer. Sharing is optional.$s15a_ex$,
  guided_reflection      = $s15a_gr$Keep your eyes open.
Write:
The expectation:
What I value inside it:
What feels imposed or outdated, if anything:
My current choice: keep / modify / question / not sure.
No decision needs to be made today.$s15a_gr$,
  journaling_prompt      = $s15a_jp$Across the week, which inherited expectations felt more chosen once examined, and which became less convincing or needed modification?$s15a_jp$,
  intention_prompt       = $s15a_ip$Write one if-then plan: When I hear myself say “I should” about [specific domain], I will name whose expectation it is and check whether I still choose it.$s15a_ip$,
  core_affirmation       = $s15a_ca$I can examine what I inherited and choose consciously what I want to carry.$s15a_ca$,
  weekly_practice_mon    = $s15a_pm$Catch one should and identify its source.$s15a_pm$,
  weekly_practice_wed    = $s15a_pw2$Review one expectation using keep / modify / question / not sure.$s15a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s15a_ps$Bring one observation about an expectation that became clearer after you examined it. Sharing is optional.$s15a_ps$,
  previous_week_callback = $s15a_pwc$bring one observation about a time you acted consulted or waited more deliberately$s15a_pwc$,
  facilitator_notes      = $s15a_fn$## Aim
Make inherited expectations visible without privileging individualism or framing family/culture as obstacles.
## Run the room
Do not urge members to leave careers, relationships, religion or whānau expectations. Do not use body sensations as verdicts about which future is correct. Allow grief, relief, loyalty and uncertainty without ranking them.
## Why this week exists — the evidence
Possible-selves and self-discrepancy research supports the idea that imagined standards and futures shape motivation and emotion. Identity-development models support exploration as one process among many, not as a command to reject inherited commitments.
Real-world anchor: many people carry age-based milestones such as married by 30, own a house by 35 or stay in the family profession. Naming the source turns an invisible benchmark into a choice that can be retained or revised.
## Evidence quality
Moderate overall. Possible-selves and self-discrepancy constructs are established. Identity-status models are useful descriptive frameworks. Claims that releasing a script necessarily requires grief are not used.
## We deliberately do not claim
- We do not claim the expected life is automatically the wrong one.
- We do not claim individual self-definition is the only healthy endpoint.
- We do not claim family or cultural obligations are inauthentic.
- We do not claim the body knows which future is correct.
- We do not require grief, rupture or a decision today.
## Source trail
- Markus, H., & Nurius, P. (1986). Possible Selves.
- Higgins, E. T. — self-discrepancy theory.
- Hochschild, A. R. — feeling-rules framework.
- Marcia, J. E. — identity-status framework.$s15a_fn$,
  updated_at = now()
WHERE week_number = 15 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s15t_st$Default Settings$s15t_st$,
  theme_title            = $s15t_tt$$s15t_tt$,
  phase                  = 2,
  phase_name             = $s15t_pn$Unlearn$s15t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s15t_hk$Write privately: People around me probably expect me to… Then mark it I want this too / not sure / maybe not.$s15t_hk$,
  s5_source_core_concept = $s15t_cc$Today the teen room looks at one expected path without deciding it is wrong. The question is have I looked at this choice, and what parts do I want to carry knowingly? Keeping an inherited path can be a real choice.$s15t_cc$,
  core_concept           = $s15t_cco$$s15t_cco$,
  teaching_points        = $s15t_tp$1. Adolescence commonly includes identity exploration. Erikson's identity-versus-role-confusion model is a famous description, not a law that every teen follows in the same sequence.
2. People inherit expectations from family, culture, school, peers and media. Inherited does not mean false.
3. For Māori and Pasifika whānau and many other cultures, identity may be relational and collective. Family obligation can be meaningful rather than evidence of being controlled.
4. Disappointing someone you love can have real consequences and emotions. The curriculum does not treat independence as automatically worth that cost.
5. Not sure yet is a developmentally appropriate answer. No teen needs to decide a career, identity or future direction in this session.$s15t_tp$,
  video_link             = $s15t_vl$https://www.youtube.com/watch?v=NiuDFBNDoSk$s15t_vl$,
  video_description      = $s15t_vd$Current assignment: Emily Esfahani Smith. Retain pending video review. Treat as a writer's synthesis, not proof that one future is more meaningful or authentic.$s15t_vd$,
  todays_theme           = $s15t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
School subjects, career ideas, family roles and social expectations can start sounding like facts about a teenager's future. Week 15 turns one expectation back into something that can be examined.$s15t_tdt$,
  todays_world_vo_script = $s15t_tdv$An expectation can come from people who love you and still be worth checking consciously.$s15t_tdv$,
  ancient_wisdom_reframe = $s15t_aw$Use a map as a metaphor: a map handed down by whānau can contain knowledge and routes worth keeping. Looking at the map does not require throwing it away or following every line.$s15t_aw$,
  ancient_wisdom_vo_script = $s15t_awv$You can study a map you inherited and choose which routes still make sense to you.$s15t_awv$,
  signal_metaphor        = $s15t_sm$Default settings can be kept, changed or left alone. The point is not to customise everything; it is to know which settings you have actually looked at.$s15t_sm$,
  private_write_prompt   = $s15t_pw$Write one expectation about your future or identity. Note where you learned it and whether your current answer is choose / unsure / don't choose.$s15t_pw$,
  experiential_exercise  = $s15t_ex$EXPECTATION MAP. Two columns: what people around me seem to expect and what I currently want or am curious about. Circle overlaps as well as differences. Add not sure anywhere. Sharing is optional; nobody has to reveal a divergence.$s15t_ex$,
  guided_reflection      = $s15t_gr$Keep your eyes open.
Choose one expectation and write:
What I respect or value about it:
What I question, if anything:
What I choose right now: choose / unsure / don't choose.
No future decision is required today.$s15t_gr$,
  journaling_prompt      = $s15t_jp$During the week, which expectations felt more like your own once you examined them, and which became less certain or more open to alternatives?$s15t_jp$,
  intention_prompt       = $s15t_ip$Write one if-then plan: When I hear a “should” about my future, I will check whether it is something I currently choose, question or remain unsure about.$s15t_ip$,
  core_affirmation       = $s15t_ca$I can examine what people expect for me and take time to decide what I want to carry.$s15t_ca$,
  weekly_practice_mon    = $s15t_pm$Notice one future expectation and name its source.$s15t_pm$,
  weekly_practice_wed    = $s15t_pw2$Talk with a trusted caregiver or other appropriate person about one expectation if that conversation feels safe and useful; secrecy is not the task.$s15t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s15t_ps$Bring one observation about an expectation that became clearer after you looked at it. Sharing details is optional.$s15t_ps$,
  previous_week_callback = $s15t_pwc$bring one observation about a choice you made discussed or waited on more deliberately$s15t_pwc$,
  facilitator_notes      = $s15t_fn$## Aim
Normalise exploration without individualist pressure, secrecy or premature identity decisions.
## Run the room
Do not ask teens to announce how they diverge from family, tell a trusted adult something secret, or treat body relaxation as evidence of the correct future. Code family/whānau expectations as potentially meaningful and chosen. Keep all sharing optional.
## Why this week exists — the evidence
Identity-development research supports exploration and commitment as useful dimensions while also showing substantial variation. Collective identity is legitimate and should not be treated as a failure of autonomy.
Real-world anchor: subject selection at school can carry expectations from family, teachers, friends and the teen themselves. Looking at all those influences is useful without requiring an immediate decision to reject any of them.
## Evidence quality
Moderate overall. Identity-development frameworks are useful but not universal stage laws. Claims that one path is more authentic are not evidence-based.
## We deliberately do not claim
- We do not claim the expected path is automatically wrong.
- We do not claim individual independence is the only healthy endpoint.
- We do not claim inherited family or cultural obligations are inauthentic.
- We do not use body sensations as a decision oracle.
- We do not require disclosure or a future decision today.
## Source trail
- Erikson, E. H. — identity development stage model; descriptive framework.
- Marcia, J. E. — identity-status framework.
- Collective/cultural identity considerations retained explicitly.$s15t_fn$,
  updated_at = now()
WHERE week_number = 15 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s15c_st$My Own Picture$s15c_st$,
  theme_title            = $s15c_tt$$s15c_tt$,
  phase                  = 2,
  phase_name             = $s15c_pn$Unlearn$s15c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s15c_hk$Show three blank cards labelled I LIKE / I'M CURIOUS ABOUT / NOT SURE YET. Ask children to draw or point to one thing for any card. No secrets or surprises required.$s15c_hk$,
  s5_source_core_concept = $s15c_cc$Today the child room practises discovering likes, interests and ways of doing things. Other people may have ideas about us, and some of those ideas may fit. We can notice, try things and say yes, no or not sure yet without needing to pull away from people who care for us.$s15c_cc$,
  core_concept           = $s15c_cco$$s15c_cco$,
  teaching_points        = $s15c_tp$1. People who care about children often have hopes and ideas for them.
2. A child can enjoy a family tradition or follow a whānau path because they genuinely want to.
3. Children can also discover new interests that nobody expected.
4. Not sure yet is a good answer; children do not need a fixed identity.
5. A child never has to tell the group something private or surprising to prove they are being themselves.$s15c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s15c_sm$Imagine a picture with some parts already coloured by family stories and some spaces still blank. You can appreciate the colours already there and still discover what belongs in the blank spaces.$s15c_sm$,
  private_write_prompt   = $s15c_pw$Choose one thing from your picture and draw where you learned about it — from whānau, school, a friend, yourself, somewhere else, or not sure. You may tell someone or keep it private.$s15c_pw$,
  experiential_exercise  = $s15c_ex$MY PICTURE. Give a blank page with only three small prompts in the corner: I like / I'm curious about / not sure yet. Children draw anything ordinary they choose. Do not provide personality examples or ask what would surprise caregivers.
DRAW IT
Add one thing you already share with your family or whānau and one thing you are curious to explore. Either space can stay blank.$s15c_ex$,
  guided_reflection      = $s15c_gr$Keep your eyes open and look at your page.
Ask:
Do I enjoy this now?
Did someone introduce me to it?
Do I want to keep exploring it?
Any answer, including not sure, is okay.$s15c_gr$,
  journaling_prompt      = $s15c_jp$Add one thing you already share with your family or whānau and one thing you are curious to explore. Either space can stay blank.$s15c_jp$,
  intention_prompt       = $s15c_ip$Choose one plan: When I notice something I'm curious about, I will ask a trusted grown-up how I can safely try or learn more.$s15c_ip$,
  core_affirmation       = $s15c_ca$I can keep discovering what I like while staying connected to the people and stories that matter to me.$s15c_ca$,
  weekly_practice_mon    = $s15c_pm$Do one thing you enjoy and notice where you first learned about it.$s15c_pm$,
  weekly_practice_wed    = $s15c_pw2$Ask a trusted grown-up about something they loved learning when they were young, if you want to.$s15c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s15c_ps$Bring your picture back and add one thing you enjoyed, shared with whānau or became curious about. Sharing is optional.$s15c_ps$,
  previous_week_callback = $s15c_pwc$bring your GO ASK drawing back and add one new example you noticed this week$s15c_pwc$,
  facilitator_notes      = $s15c_fn$## Aim
Support exploration without parent-blaming, fixed identity, secrecy or individualist separation.
## Run the room
Do not ask has anyone expected you to be something you're not?, who are you trying to make happy?, or what would surprise people who think they know the child. Never imply caregiver expectations are automatically wrong. A child choosing a whānau path has completed the lesson fully.
## Why this week exists — the evidence
Child identity is developing and exploratory. The safest translation is giving children permission to notice preferences and curiosity without requiring a stable "true self" or opposition to family expectations.
Real-world anchor: children often discover interests because someone in their whānau introduced them — music, sport, kapa haka, crafts, cooking, building. An inherited interest can become genuinely theirs; origin does not make it less authentic.
## Evidence quality
Moderate overall. Identity exploration is developmentally normal. This drawing activity is a teaching adaptation, not an assessment of authenticity.
## We deliberately do not claim
- We do not claim family expectations are automatically wrong.
- We do not claim being yourself means being different from whānau.
- We do not claim a child has one fixed authentic identity already waiting to be found.
- We do not ask children to disclose something they have not told caregivers.
- We do not reward separation or surprise as evidence of growth.
## Source trail
- Developmental identity/exploration literature informs the age-appropriate framing.
- Cultural/collective identity rule from the Master Agent Specification.$s15c_fn$,
  updated_at = now()
WHERE week_number = 15 AND audience = 'Child';

-- Week 16 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw16_theme$$cw16_theme$,
  the_territory        = $cw16_terr$What we keep replaying after someone has hurt us$cw16_terr$,
  opening_question     = $cw16_oq$What is the difference between forgiveness, reconciliation and accountability? Passing is full participation.$cw16_oq$,
  week_type            = $cw16_wt$Standard$cw16_wt$,
  reflective_question  = $cw16_rq$Across the week, when did the memory or resentment replay, what triggered it, and did you want to respond differently or leave it alone?$cw16_rq$,
  interactive_activity = $cw16_ia$REPLAY AUDIT. Map what happened; what I still need to protect or remember; what the replay currently costs or provides; my choice today: keep / loosen / not ready / not applicable. No details need to be shared.$cw16_ia$,
  kids_picture_book    = $cw16_bk$Enemy Pie$cw16_bk$,
  kids_picture_book_author = $cw16_bka$Derek Munson$cw16_bka$,
  kids_picture_book_note = $cw16_bkn$WHY THIS BOOK: Use it as one story where feelings change after spending time together, not as a rule that children should become friends with someone they dislike or who harmed them.
READ-ALOUD: Read live from a purchased copy.$cw16_bkn$,
  kids_picture_book_question = $cw16_bkq$Did the boy have to become friends? What other safe choices could a child make if someone had been seriously unkind?$cw16_bkq$,
  kids_nz_alternative = $cw16_nz$Not yet selected$cw16_nz$,
  kids_nz_alternative_author = $cw16_nza$use the main book until a reviewed title fits the safety rules.$cw16_nza$,
  kids_nz_alternative_note = $cw16_nzn$Any alternative must preserve forgiveness optional / safety first / no reconciliation requirement.$cw16_nzn$,
  kids_colouring_prompt = $cw16_col$Colour four choice symbols: shield, trusted grown-up, play/activity, question mark.$cw16_col$,
  kids_game = $cw16_g$CHOICE CORNERS. Use only fictional minor scenarios and corners labelled ASK FOR HELP / TAKE SPACE / DO SOMETHING ELSE / NOT SURE. Children may stay seated. Do not include a FORGIVE corner as the expected answer.$cw16_g$,
  kids_game_equipment = $cw16_ge$Paper choice rocks; choice signs; crayons.$cw16_ge$,
  kids_game_under5 = $cw16_g5$Use two options only: help and space, plus sitting out.$cw16_g5$,
  updated_at = now()
WHERE week_number = 16;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s16a_st$Completing the Process$s16a_st$,
  theme_title            = $s16a_tt$$s16a_tt$,
  phase                  = 2,
  phase_name             = $s16a_pn$Unlearn$s16a_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s16a_hk$Before we start: forgiveness is not required, and it is not a test you can fail. If the harm is ongoing, serious, or you are not ready, use a small example, write about the process generally, or listen. Nobody will ask why.$s16a_hk$,
  s5_source_core_concept = $s16a_cc$Today the adult room examines repetitive resentment without prescribing forgiveness. You may choose to forgive, not forgive, not yet, or simply reduce how often a past event gets your attention. Boundaries and accountability remain separate decisions.$s16a_cc$,
  core_concept           = $s16a_cco$$s16a_cco$,
  teaching_points        = $s16a_tp$1. Forgiveness interventions have shown reductions in self-reported anger and distress in some studies, but effects vary and do not make forgiveness universally healthy or necessary.
2. Forgiveness does not require reconciliation, contact, trust, forgetting, apology or removal of consequences.
3. Ongoing harm is not a forgiveness exercise. Safety and support come first.
4. Physiological claims are often stronger than the evidence supports; we do not promise blood-pressure, cortisol or other health improvements.
5. Choosing not to forgive can be a legitimate adult decision. The useful question is what relationship you want with the memory and the person now.$s16a_tp$,
  video_link             = $s16a_vl$https://www.youtube.com/watch?v=Ik_V3UIqoQ0$s16a_vl$,
  video_description      = $s16a_vd$Current assignment: Fred Luskin / forgiveness material. Retain pending video review. Use psychological outcomes cautiously and do not present physical-health benefits as established or forgiveness as required.$s16a_vd$,
  todays_theme           = $s16a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Resentment can replay in messages, imagined conversations and repeated retellings. A person can choose to change that replay without changing their judgment that the behaviour was wrong.$s16a_tdt$,
  todays_world_vo_script = $s16a_tdv$Reducing the replay is one option. It is not the same as saying the harm was acceptable.$s16a_tdv$,
  ancient_wisdom_reframe = $s16a_aw$Forgiveness appears in many traditions, but traditions differ in meaning and obligation. Do not claim universal convergence. Use only the narrow idea that people can choose how much present attention to give a past harm.$s16a_aw$,
  ancient_wisdom_vo_script = $s16a_awv$You can loosen your relationship with a memory without rewriting what happened.$s16a_awv$,
  signal_metaphor        = $s16a_sm$Think of a notification that keeps resurfacing. You may silence it, leave it on, or decide you are not ready to change it. The original message remains in the record.$s16a_sm$,
  private_write_prompt   = $s16a_pw$Choose a low- to moderate-stakes resentment only if you want to. Write the observable event and how often it currently replays. You may instead write about forgiveness as a general concept.$s16a_pw$,
  experiential_exercise  = $s16a_ex$REPLAY AUDIT. Map what happened; what I still need to protect or remember; what the replay currently costs or provides; my choice today: keep / loosen / not ready / not applicable. No details need to be shared.$s16a_ex$,
  guided_reflection      = $s16a_gr$Keep your eyes open.
Write:
What I am not excusing:
What boundary remains:
What I would like to reduce, if anything:
My choice today: forgive / not forgive / not yet / not applicable.
Every answer is valid.$s16a_gr$,
  journaling_prompt      = $s16a_jp$Across the week, when did the memory or resentment replay, what triggered it, and did you want to respond differently or leave it alone?$s16a_jp$,
  intention_prompt       = $s16a_ip$If you choose to work on this: When I notice [specific replay cue], I will [ground, redirect attention, write one fact, or another safe action]. If not, write no practice this week.$s16a_ip$,
  core_affirmation       = $s16a_ca$I decide what forgiveness, boundaries and distance mean for me; none of them is owed to this room.$s16a_ca$,
  weekly_practice_mon    = $s16a_pm$Notice one replay without forcing a change.$s16a_pm$,
  weekly_practice_wed    = $s16a_pw2$If you chose an alternative response, test it once. Otherwise no practice is required.$s16a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s16a_ps$Bring one observation about what you chose to do with the replay, including leave it alone. Sharing is optional.$s16a_ps$,
  previous_week_callback = $s16a_pwc$bring one observation about an expectation that became clearer after you examined it$s16a_pwc$,
  facilitator_notes      = $s16a_fn$## Aim
Make forgiveness genuinely optional and keep harm, reconciliation, safety and accountability distinct.
## Run the room
Deliver the opt-out before any personal prompt. No eyes-closed recall, hot-coal imagery, pressure to release, public forgiveness, letters to offenders or discussion of ongoing abuse. Refer where trauma or safety issues exceed scope.
## Why this week exists — the evidence
Forgiveness interventions can reduce self-reported anger and distress for some participants. The evidence does not establish forgiveness as universally beneficial, medically protective or necessary for recovery.
Real-world anchor: blocking a phone number, maintaining a boundary and feeling less preoccupied can occur together. Reduced mental replay does not require restored contact or a changed moral judgment.
## Evidence quality
Moderate overall. Psychological outcomes are supported in some intervention studies; physical-health claims are less secure. The replay metaphor is illustrative.
## We deliberately do not claim
- We do not claim forgiveness is required, healthier or a marker of progress.
- We do not claim forgiveness improves physical health, cortisol or blood pressure.
- We do not claim reconciliation, contact or trust should follow forgiveness.
- We do not claim resentment is "poison" or that the harmed person is the only one paying.
- We do not use forgiveness for ongoing harm.
## Source trail
- Forgiveness-intervention literature including Luskin's Stanford work; psychological outcomes interpreted cautiously.$s16a_fn$,
  updated_at = now()
WHERE week_number = 16 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s16t_st$Closing the Background Apps$s16t_st$,
  theme_title            = $s16t_tt$$s16t_tt$,
  phase                  = 2,
  phase_name             = $s16t_pn$Unlearn$s16t_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s16t_hk$Say verbatim: Forgiveness is not required and it is not a test. If something is still happening, was serious, or you are not ready, use a small fictional example, write generally, or listen. Nobody will ask why.$s16t_hk$,
  s5_source_core_concept = $s16t_cc$Today the teen room separates forgiveness / boundaries / contact / replay. They are different choices. A teen may forgive, not forgive, not yet, or simply practise giving a replay less attention.$s16t_cc$,
  core_concept           = $s16t_cco$$s16t_cco$,
  teaching_points        = $s16t_tp$1. Forgiveness is optional and should never be used as a measure of maturity or recovery.
2. Forgiveness does not mean friendship, contact, trust, forgetting or removing consequences.
3. Social rejection can hurt strongly, but the claim that social pain is literally the same as physical pain in the brain comes from contested interpretations and is not needed here.
4. We do not teach cortisol or nervous-system stories as the reason resentment feels difficult.
5. If harm is ongoing or safety is involved, tell a trusted adult and follow safeguarding; do not practise forgiveness with the person causing harm.$s16t_tp$,
  video_link             = $s16t_vl$https://www.youtube.com/watch?v=Ik_V3UIqoQ0$s16t_vl$,
  video_description      = $s16t_vd$Current assignment: forgiveness research material. Retain pending review. Do not select videos by claims about physiological benefits, cortisol or forgiveness being necessary.$s16t_vd$,
  todays_theme           = $s16t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
A hurt can replay through messages, screenshots, repeated stories or imagined conversations. You can decide what to do with the replay without deciding that the harm was okay.$s16t_tdt$,
  todays_world_vo_script = $s16t_tdv$Less replay does not mean more contact, trust or forgiveness.$s16t_tdv$,
  ancient_wisdom_reframe = $s16t_aw$Different cultures and traditions understand forgiveness differently. Use no universal moral rule. The room supports boundaries and not yet as legitimate choices.$s16t_aw$,
  ancient_wisdom_vo_script = $s16t_awv$You are allowed to decide what distance, contact and forgiveness mean for you.$s16t_awv$,
  signal_metaphor        = $s16t_sm$A background app can keep reopening. You can close it for now, leave it open, or decide you need help with what it contains. Closing it does not delete the record.$s16t_sm$,
  private_write_prompt   = $s16t_pw$Choose a small hurt, a fictional example, or the general topic. Write how often the event or thought replays. No names or details are required.$s16t_pw$,
  experiential_exercise  = $s16t_ex$BACKGROUND APP AUDIT. Write what I know happened; what boundary I need; what keeps replaying; my choice today: leave alone / reduce replay / forgive / not yet. Private work is full participation.$s16t_ex$,
  guided_reflection      = $s16t_gr$Keep your eyes open.
Write:
What I am not saying was okay:
What boundary stays:
What I want to do with the replay:
My choice today:
No choice is more mature than another.$s16t_gr$,
  journaling_prompt      = $s16t_jp$During the week, when did a replay appear, what triggered it, and what response — including doing nothing — felt safest and most useful?$s16t_jp$,
  intention_prompt       = $s16t_ip$If you choose: When [replay cue] appears, I will [ground, redirect, write one fact, or another safe action]. Otherwise write no practice.$s16t_ip$,
  core_affirmation       = $s16t_ca$I can keep my boundaries and decide for myself whether forgiveness belongs here at all.$s16t_ca$,
  weekly_practice_mon    = $s16t_pm$Notice one replay without judging yourself.$s16t_pm$,
  weekly_practice_wed    = $s16t_pw2$Test your chosen response once, or skip this practice if you chose not to work on it.$s16t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s16t_ps$Bring one observation about what you did with a replay, including leaving it alone. Sharing details is optional.$s16t_ps$,
  previous_week_callback = $s16t_pwc$bring one observation about an expectation that became clearer after you looked at it$s16t_pwc$,
  facilitator_notes      = $s16t_fn$## Aim
Remove forgiveness pressure and all pseudo-neuroscience while protecting current safety.
## Run the room
No personal hurt details, no eyes-closed recall, no release language, no pressure to tell someone or forgive. If harm is current or serious, follow MC-SAF-001 rather than continuing the exercise.
## Why this week exists — the evidence
Some forgiveness interventions reduce self-reported anger or distress, but that does not make forgiveness universally helpful or required. Social-pain neuroscience claims are contested and unnecessary to the lesson.
Real-world anchor: muting or blocking an account can reduce repeated exposure while leaving the original judgment and boundary unchanged. That distinction makes replay management concrete.
## Evidence quality
Moderate overall. Forgiveness-intervention evidence is mixed by outcome and context. Physical-health and cortisol claims are not used.
## We deliberately do not claim
- We do not claim social pain is simply the same as physical pain in the brain.
- We do not claim forgiveness lowers cortisol or improves health.
- We do not claim forgiving is more mature than not forgiving.
- We do not claim contact or reconciliation should follow.
- We do not use forgiveness where harm is ongoing.
## Source trail
- Forgiveness-intervention research, interpreted cautiously.
- Social-pain-equals-physical-pain claim treated as contested.$s16t_fn$,
  updated_at = now()
WHERE week_number = 16 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s16c_st$Putting Down the Hot Rock$s16c_st$,
  theme_title            = $s16c_tt$$s16c_tt$,
  phase                  = 2,
  phase_name             = $s16c_pn$Unlearn$s16c_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s16c_hk$Say: Today nobody has to forgive anybody. If something is big, still happening or private, you can use a made-up small example, just listen, or talk to a trusted grown-up later.$s16c_hk$,
  s5_source_core_concept = $s16c_cc$Today the child room learns that forgiveness is one possible choice, not a job children have to complete. Children can stay cross, keep distance, ask for help, or decide a small hurt does not need as much attention anymore.$s16c_cc$,
  core_concept           = $s16c_cco$$s16c_cco$,
  teaching_points        = $s16c_tp$1. Feeling angry or hurt after someone is unkind is normal.
2. Forgiving does not mean saying the behaviour was okay or becoming friends again.
3. A child never has to forgive someone who is still hurting, scaring or pressuring them.
4. For a small past hurt, a child might choose to think about it less or focus on something else. That is optional.
5. Trusted grown-ups help with big, repeated or unsafe problems.$s16c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s16c_sm$Use a soft paper "hot rock" only as a pretend example: you can hold it, put it on the table or leave it alone. Never write a real hurt on it. The child chooses what to do.$s16c_sm$,
  private_write_prompt   = $s16c_pw$Draw one safe choice a child could make after a small hurt. You may use a made-up example and you do not have to tell anyone a real story.$s16c_pw$,
  experiential_exercise  = $s16c_ex$CHOICE ROCK. Give each child a paper stone with four picture choices: keep distance / ask for help / think about it less / not sure. Use only fictional minor scenarios. Children circle any safe option; no option is labelled better.
DRAW IT
Draw a child with a boundary bubble and a trusted grown-up nearby. Add one optional "move on with my day" activity.$s16c_ex$,
  guided_reflection      = $s16c_gr$Keep your eyes open.
Look at the choices and ask:
Do I need help?
Do I need distance?
Do I want to think about this less?
Am I not sure?
All four answers are okay.$s16c_gr$,
  journaling_prompt      = $s16c_jp$Draw a child with a boundary bubble and a trusted grown-up nearby. Add one optional "move on with my day" activity.$s16c_jp$,
  intention_prompt       = $s16c_ip$Choose one plan: When a small old hurt pops into my mind, I will choose help, distance, another activity or not sure.$s16c_ip$,
  core_affirmation       = $s16c_ca$I do not have to forgive to be good. I can choose safety, help, distance or letting a small hurt take less space.$s16c_ca$,
  weekly_practice_mon    = $s16c_pm$If a small old hurt pops up, notice it and choose one safe option.$s16c_pm$,
  weekly_practice_wed    = $s16c_pw2$Practise telling a trusted grown-up I need help or I need space when things are calm.$s16c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s16c_ps$Bring your choice-rock drawing back if you want and add one safe option you remembered this week.$s16c_ps$,
  previous_week_callback = $s16c_pwc$bring your picture back and add one thing you enjoyed shared with whānau or became curious about$s16c_pwc$,
  facilitator_notes      = $s16c_fn$## Aim
Remove forgiveness coercion from the child track and replace personal hurt disclosure with safe choice-making.
## Run the room
No child writes a real hurt on a stone, squeezes a stone while recalling harm, closes eyes to revisit hurt, names who they are cross with or is praised for "letting go." If a child discloses current or serious harm, stop and follow MC-SAF-001.
## Why this week exists — the evidence
Forgiveness interventions in adults do not justify prescribing forgiveness to children. The child-facing lesson therefore focuses on safe choices after hurt and on the fact that reconciliation and forgiveness are not required.
Real-world anchor: a child can stop playing with someone, tell a teacher and later think about the event less; those choices can coexist without a formal act of forgiveness.
## Evidence quality
Illustrative to moderate. Adult forgiveness research is background only. The child choice activity is a safeguarding-oriented teaching adaptation, not therapy.
## We deliberately do not claim
- We do not claim forgiveness is brave, strong or healthier.
- We do not claim a child should put down or release a real hurt.
- We do not ask children to recall or disclose harm.
- We do not claim friendship or reconciliation should follow.
- We do not use physiological or cortisol claims.
## Source trail
- Adult forgiveness-intervention literature informs facilitator caution only.
- Child safeguarding governed by MC-SAF-001.$s16c_fn$,
  updated_at = now()
WHERE week_number = 16 AND audience = 'Child';

-- Week 17 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw17_theme$$cw17_theme$,
  the_territory        = $cw17_terr$Being kind to yourself when you get it wrong$cw17_terr$,
  opening_question     = $cw17_oq$What is the difference between accountability and punishment? Passing is full participation.$cw17_oq$,
  week_type            = $cw17_wt$Standard$cw17_wt$,
  reflective_question  = $cw17_rq$Across the week, when did guilt point toward a useful action and when did global self-attack simply repeat a verdict without adding repair?$cw17_rq$,
  interactive_activity = $cw17_ia$ACCOUNTABILITY CHECK. Four boxes: what happened; impact; repair already made or still possible; behaviour I want to change. Add a fifth: self-attack that adds no new information. Sharing is optional.$cw17_ia$,
  kids_picture_book    = $cw17_bk$The Girl Who Never Made Mistakes$cw17_bk$,
  kids_picture_book_author = $cw17_bka$Mark Pett & Gary Rubinstein$cw17_bka$,
  kids_picture_book_note = $cw17_bkn$WHY THIS BOOK: It normalises mistakes without asking children to disclose something they feel ashamed about.
READ-ALOUD: Read live from a purchased copy.$cw17_bkn$,
  kids_picture_book_question = $cw17_bkq$What changed after Beatrice made a mistake? Did the mistake tell us everything about her?$cw17_bkq$,
  kids_nz_alternative = $cw17_nz$Not yet selected$cw17_nz$,
  kids_nz_alternative_author = $cw17_nza$use the main book until a reviewed title fits this theme.$cw17_nza$,
  kids_nz_alternative_note = $cw17_nzn$Any future alternative should separate behaviour from identity and avoid compulsory apology or forgiveness.$cw17_nzn$,
  kids_colouring_prompt = $cw17_col$Colour a pencil, eraser and repaired block tower. Add one speech bubble: I can fix what I can and learn.$cw17_col$,
  kids_game = $cw17_g$DO-OVER STATION. Use beanbags or blocks. Everyone gets unlimited ordinary retries and the facilitator models neutral language: that one missed; try another way. No score and no deliberate humiliation.$cw17_g$,
  kids_game_equipment = $cw17_ge$Blocks or beanbags; crayons.$cw17_ge$,
  kids_game_under5 = $cw17_g5$Use simple spill/rebuild scenarios and the words oops / help / again.$cw17_g5$,
  updated_at = now()
WHERE week_number = 17;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s17a_st$Clearing the Cache$s17a_st$,
  theme_title            = $s17a_tt$$s17a_tt$,
  phase                  = 2,
  phase_name             = $s17a_pn$Unlearn$s17a_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s17a_hk$Choose a low- to moderate-stakes mistake. Write two sentences: what I did and what I call myself because of it. Notice whether the second sentence is broader than the first.$s17a_hk$,
  s5_source_core_concept = $s17a_cc$Today the adult room separates I did something I regret from I am permanently defined by it. Self-compassion does not erase impact or repair. It asks what accountability still requires and whether continued self-attack adds anything useful.$s17a_cc$,
  core_concept           = $s17a_cco$$s17a_cco$,
  teaching_points        = $s17a_tp$1. Research commonly distinguishes guilt focused on behaviour from shame focused on the whole self. Guilt can support repair; shame is often associated with withdrawal and defensiveness, though neither emotion has one guaranteed outcome.
2. Self-compassion is associated with adaptive coping and motivation in many studies. It is not self-exoneration or a guarantee of better behaviour.
3. Self-forgiveness research emphasises acknowledging responsibility and harm rather than minimising them. Forgiving oneself does not resolve what another person needs or feels.
4. Repair may involve apology, restitution, changed behaviour or accepting consequences. Sometimes no further repair is possible or appropriate.
5. Continued self-punishment is not automatically accountability. The practical question is what useful responsibility remains?$s17a_tp$,
  video_link             = $s17a_vl$https://www.youtube.com/watch?v=IvtZBUSplr4$s17a_vl$,
  video_description      = $s17a_vd$Current assignment: Kristin Neff on self-compassion. Retain pending routine video review. Use her research carefully; do not present self-compassion as guaranteed resilience, motivation or relationship improvement.$s17a_vd$,
  todays_theme           = $s17a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Mistakes can remain searchable in memory long after the immediate consequences are over. Replaying them may feel like responsibility even when the useful repair work has already been completed.$s17a_tdt$,
  todays_world_vo_script = $s17a_tdv$Accountability asks what still needs doing. Shame often keeps issuing the same verdict after the useful work is done.$s17a_tdv$,
  ancient_wisdom_reframe = $s17a_aw$Humaneness and compassion appear across philosophical traditions. Use them as moral lenses, not proof that self-compassion is the foundation of contribution or that one tradition says self-kindness must come first.$s17a_aw$,
  ancient_wisdom_vo_script = $s17a_awv$You can be honest about harm and still refuse to turn one behaviour into your entire identity.$s17a_awv$,
  signal_metaphor        = $s17a_sm$Think of an invoice: once you know what is genuinely owed, pay what can be paid and record the lesson. Adding imaginary charges forever does not improve the account.$s17a_sm$,
  private_write_prompt   = $s17a_pw$Choose one manageable mistake. Write what happened in observable terms and one impact you can reasonably identify. Avoid trauma, abuse or serious legal material in this room.$s17a_pw$,
  experiential_exercise  = $s17a_ex$ACCOUNTABILITY CHECK. Four boxes: what happened; impact; repair already made or still possible; behaviour I want to change. Add a fifth: self-attack that adds no new information. Sharing is optional.$s17a_ex$,
  guided_reflection      = $s17a_gr$Keep your eyes open.
Write:
What I am responsible for:
What I am not able to undo:
What useful repair remains, if any:
What I want to practise differently:
What self-punishment I can stop confusing with accountability:$s17a_gr$,
  journaling_prompt      = $s17a_jp$Across the week, when did guilt point toward a useful action and when did global self-attack simply repeat a verdict without adding repair?$s17a_jp$,
  intention_prompt       = $s17a_ip$Write one if-then plan: When the mistake replay begins, I will ask what useful accountability remains and take that action — or name that no new action is available.$s17a_ip$,
  core_affirmation       = $s17a_ca$I can be accountable for what I did without making the mistake my entire identity.$s17a_ca$,
  weekly_practice_mon    = $s17a_pm$Catch one global self-label and rewrite it as the behaviour that actually occurred.$s17a_pm$,
  weekly_practice_wed    = $s17a_pw2$Complete one appropriate repair or behaviour-change step, if one remains.$s17a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s17a_ps$Bring one observation about the difference between accountability and self-punishment. Sharing details is optional.$s17a_ps$,
  previous_week_callback = $s17a_pwc$bring one observation about what you chose to do with the replay including leave it alone$s17a_pwc$,
  facilitator_notes      = $s17a_fn$## Aim
Support accountability plus self-compassion without absolution, public confession or forced self-forgiveness.
## Run the room
Keep examples manageable. Do not ask members to confess to the group or contact someone as homework. If serious harm, abuse, legal issues or trauma emerge, refer to appropriate support. Do not tell members they have "paid their debt" when another person's needs remain unknown.
## Why this week exists — the evidence
Tangney and colleagues' work supports a useful distinction between behaviour-focused guilt and global shame. Neff's self-compassion research supports less punitive responses to failure. Self-forgiveness literature emphasises responsibility as part of the process.
Real-world anchor: a workplace error can require correction, disclosure and a changed process. Calling yourself incompetent for months is not an additional corrective action. Week 17 separates those two functions.
## Evidence quality
Moderate overall. Shame/guilt associations and self-compassion evidence are substantial but not deterministic. Self-forgiveness is heterogeneous and context-dependent.
## We deliberately do not claim
- We do not claim self-forgiveness resolves harm done to others.
- We do not claim guilt is bad or shame always causes harmful behaviour.
- We do not claim self-compassion guarantees motivation, resilience or relationship outcomes.
- We do not claim every mistake can or should be "released."
- We do not require public confession or contact with anyone harmed.
## Source trail
- Tangney, J. P., et al. — shame/guilt research programme.
- Neff, K. D. — self-compassion research programme.
- Hall & Fincham — self-forgiveness research.$s17a_fn$,
  updated_at = now()
WHERE week_number = 17 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s17t_st$Closing the 2am Replay$s17t_st$,
  theme_title            = $s17t_tt$$s17t_tt$,
  phase                  = 2,
  phase_name             = $s17t_pn$Unlearn$s17t_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s17t_hk$Think privately of one ordinary mistake or embarrassing moment you replay. Write what happened and, separately, what I call myself because of it.$s17t_hk$,
  s5_source_core_concept = $s17t_cc$Today the teen room separates I did something wrong from I am wrong. We check whether an apology, repair, changed behaviour or consequence is still needed. If not, endless replay is not an extra payment the mistake requires.$s17t_cc$,
  core_concept           = $s17t_cco$$s17t_cco$,
  teaching_points        = $s17t_tp$1. Guilt focused on behaviour and shame focused on the whole self are useful distinctions, not perfect categories. Guilt can support repair; shame is often associated with hiding and defensiveness.
2. Self-compassion means responding to difficulty without global self-attack. It does not mean pretending the behaviour was okay.
3. The claim that a 2am replay means the brain is trying to find resolution is too specific; rumination can persist for many reasons.
4. Accountability can include apology, repair, accepting consequences and changing future behaviour. The other person does not have to forgive you.
5. You do not need to confess private mistakes to the group or to a peer for this lesson to work.$s17t_tp$,
  video_link             = $s17t_vl$https://www.youtube.com/watch?v=IvtZBUSplr4$s17t_vl$,
  video_description      = $s17t_vd$Current assignment: Kristin Neff on self-compassion. Retain pending routine video review. Do not turn self-compassion into a promise of motivation, resilience or improved performance.$s17t_vd$,
  todays_theme           = $s17t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Old messages, screenshots and memories can make one mistake replay long after anything useful is happening. Week 17 asks what responsibility remains and what is just repeat punishment.$s17t_tdt$,
  todays_world_vo_script = $s17t_tdv$A replay can feel like accountability while adding no new repair.$s17t_tdv$,
  ancient_wisdom_reframe = $s17t_aw$Use repair after error as a broad ethical theme rather than claiming all traditions practise confession for freedom. The useful sequence is honesty, responsibility and a next action.$s17t_aw$,
  ancient_wisdom_vo_script = $s17t_awv$A mistake can require repair without becoming a permanent identity sentence.$s17t_awv$,
  signal_metaphor        = $s17t_sm$A closed tab can be reopened if new action is needed. Replaying the same tab all night does not change the page.$s17t_sm$,
  private_write_prompt   = $s17t_pw$Choose one low- to moderate-stakes mistake. Write only what happened and one impact you can reasonably identify. Keep it private.$s17t_pw$,
  experiential_exercise  = $s17t_ex$ACCOUNTABILITY AUDIT. Four boxes: what happened; what repair is appropriate; what I learned; what self-attack adds no useful information. Do not contact anyone during the session. Sharing is optional.$s17t_ex$,
  guided_reflection      = $s17t_gr$Keep your eyes open.
Write:
What I did:
What repair is still useful, if any:
What I will do differently:
What global label I can stop using:
You do not have to decide you have forgiven yourself.$s17t_gr$,
  journaling_prompt      = $s17t_jp$During the week, which replays pointed toward a real action and which simply repeated a judgment after the useful action was already clear?$s17t_jp$,
  intention_prompt       = $s17t_ip$Write one if-then plan: When the replay starts, I will ask what useful action remains. If none remains, I will name the lesson and return to what I am doing.$s17t_ip$,
  core_affirmation       = $s17t_ca$I can own what I did, repair what I can, and refuse to make one mistake my whole identity.$s17t_ca$,
  weekly_practice_mon    = $s17t_pm$Rewrite one I am judgment as I did plus the specific behaviour.$s17t_pm$,
  weekly_practice_wed    = $s17t_pw2$Take one appropriate repair or learning step if one genuinely remains.$s17t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s17t_ps$Bring one observation about what changed when you separated accountability from replay. Sharing details is optional.$s17t_ps$,
  previous_week_callback = $s17t_pwc$bring one observation about what you did with a replay including leaving it alone$s17t_pwc$,
  facilitator_notes      = $s17t_fn$## Aim
Teach accountability without confession pressure, rumination myths or forced self-forgiveness.
## Run the room
No eyes-closed replay, no tell one person your mistake, no public confession and no requirement to contact anyone harmed. Keep examples low-risk. Follow MC-SAF-001/referral if serious harm, abuse or safety issues emerge.
## Why this week exists — the evidence
Research on shame/guilt and self-compassion supports distinguishing behaviour-focused responsibility from global self-condemnation. It does not show that continued self-punishment is a necessary part of accountability.
Real-world anchor: correcting a wrong answer, apologising for a comment and changing the next behaviour are actions. Replaying I'm an idiot afterwards does not add another repair step.
## Evidence quality
Moderate overall. Shame/guilt and self-compassion findings are substantial but context-dependent. Rumination does not have one universal purpose.
## We deliberately do not claim
- We do not claim rumination means the brain is seeking resolution.
- We do not claim self-compassion always improves motivation or resilience.
- We do not claim self-forgiveness resolves another person's harm.
- We do not require confession, apology homework or contact.
- We do not claim guilt is unhealthy; it can be useful information.
## Source trail
- Tangney, J. P., et al. — shame/guilt research.
- Neff, K. D. — self-compassion research.$s17t_fn$,
  updated_at = now()
WHERE week_number = 17 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s17c_st$Say Sorry and Keep Going$s17c_st$,
  theme_title            = $s17c_tt$$s17c_tt$,
  phase                  = 2,
  phase_name             = $s17c_pn$Unlearn$s17c_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s17c_hk$Knock over a block tower on purpose and say: I knocked it over. I can help rebuild it. That doesn't make me a bad person. Ask children what the useful next step is.$s17c_hk$,
  s5_source_core_concept = $s17c_cc$Today the child room learns: I made a mistake is different from I am bad. If we hurt or inconvenience someone, we can name what happened, repair what we safely can and learn for next time. We do not have to keep punishing ourselves.$s17c_cc$,
  core_concept           = $s17c_cco$$s17c_cco$,
  teaching_points        = $s17c_tp$1. Everyone makes mistakes, including adults.
2. A mistake can need repair without becoming a label about the whole child.
3. A useful apology says what happened and, where possible, what the child will do differently. An apology should never be forced to someone who is unsafe.
4. The other person does not have to forgive or feel better straight away.
5. After useful repair, a child is allowed to keep learning and doing ordinary life; ongoing shame is not a requirement.$s17c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s17c_sm$Think of an eraser beside a pencil. An eraser cannot remove every mark or consequence, but it helps us correct what can be corrected and keep working on the page.$s17c_sm$,
  private_write_prompt   = $s17c_pw$Draw a made-up mistake and one repair step. You may tell someone about the made-up example or keep the page private.$s17c_pw$,
  experiential_exercise  = $s17c_ex$REPAIR STEPS. Use fixed safe scenarios only: spill blocks, interrupt, forget a turn, knock something over. Practise: say what happened / ask what would help / repair if possible / try differently next time. Do not make children role-play serious harm or personal shame.
DRAW IT
Draw a four-panel comic: mistake → notice → repair/help → try again. The other person does not have to smile in the last panel.$s17c_ex$,
  guided_reflection      = $s17c_gr$Keep your eyes open.
Look at the picture and ask:
What happened?
What can be repaired?
What can be learned?
What label do I not need to put on the whole person?$s17c_gr$,
  journaling_prompt      = $s17c_jp$Draw a four-panel comic: mistake → notice → repair/help → try again. The other person does not have to smile in the last panel.$s17c_jp$,
  intention_prompt       = $s17c_ip$Choose one plan: When I make an ordinary mistake, I will say what happened and choose one safe repair step.$s17c_ip$,
  core_affirmation       = $s17c_ca$I can make a mistake, repair what I can and keep learning without calling myself bad.$s17c_ca$,
  weekly_practice_mon    = $s17c_pm$If you make an ordinary mistake, describe what happened instead of using a mean label about yourself.$s17c_pm$,
  weekly_practice_wed    = $s17c_pw2$Practise one repair step with a trusted grown-up using a made-up example.$s17c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s17c_ps$Bring your repair comic back and add one thing you learned about mistakes this week. Sharing is optional.$s17c_ps$,
  previous_week_callback = $s17c_pwc$bring your choice-rock drawing back if you want and add one safe option you remembered this week$s17c_pwc$,
  facilitator_notes      = $s17c_fn$## Aim
Teach repair plus self-compassion without forced apology, disclosure or absolution.
## Run the room
Do not ask what children are still cross with themselves about, ask them to recall harm, close eyes, or tell a caregiver's mistake story. Never force an apology or contact with someone unsafe. If a child discloses serious harm, follow MC-SAF-001.
## Why this week exists — the evidence
The shame/guilt distinction supports separating behaviour from global identity, while self-compassion research supports responding to mistakes without unnecessary self-condemnation. For children, the practical translation is repair and specific language.
Real-world anchor: rebuilding knocked-over blocks shows a child can correct part of an outcome without becoming "bad" and without pretending the mistake never happened.
## Evidence quality
Moderate overall. Adult shame/guilt and self-compassion evidence informs the general principle; the child repair activity is a teaching adaptation.
## We deliberately do not claim
- We do not claim every child should apologise in every situation.
- We do not claim repair guarantees forgiveness from another person.
- We do not claim guilt is always bad or should disappear quickly.
- We do not ask children to disclose shameful or private mistakes.
- We do not tell children they must feel okay after repair.
## Source trail
- Tangney, J. P., et al. — shame/guilt research.
- Neff, K. D. — self-compassion research.$s17c_fn$,
  updated_at = now()
WHERE week_number = 17 AND audience = 'Child';

-- Week 18 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw18_theme$$cw18_theme$,
  the_territory        = $cw18_terr$Swapping global attack for useful coaching$cw18_terr$,
  opening_question     = $cw18_oq$What makes self-feedback demanding without becoming destructive? Passing is full participation.$cw18_oq$,
  week_type            = $cw18_wt$Standard$cw18_wt$,
  reflective_question  = $cw18_rq$Across the week, which critic statements became more useful when translated into specific feedback, and which situations needed a different standard rather than more effort?$cw18_rq$,
  interactive_activity = $cw18_ia$CRITIC → COACH. Rewrite the sentence in four parts: what happened; what standard matters; what evidence of capacity remains; one next action. Do not force confidence if evidence is uncertain — I can test this is enough. Sharing is optional.$cw18_ia$,
  kids_picture_book    = $cw18_bk$I Am Enough$cw18_bk$,
  kids_picture_book_author = $cw18_bka$Grace Byers$cw18_bka$,
  kids_picture_book_note = $cw18_bkn$WHY THIS BOOK: Use it for kind self-language while making clear children never have to repeat a statement they do not believe.
READ-ALOUD: Read live from a purchased copy.$cw18_bkn$,
  kids_picture_book_question = $cw18_bkq$Can kind words also be honest about something being difficult?$cw18_bkq$,
  kids_nz_alternative = $cw18_nz$Not yet selected$cw18_nz$,
  kids_nz_alternative_author = $cw18_nza$use the main book until a reviewed title fits this theme.$cw18_nza$,
  kids_nz_alternative_note = $cw18_nzn$Any future alternative should model truthful encouragement rather than magical positive thinking.$cw18_nzn$,
  kids_colouring_prompt = $cw18_col$Colour a coach signpost with arrows for try, help, break, another way and not sure yet.$cw18_col$,
  kids_game = $cw18_g$COACH RELAY — NO RACE. Move through simple task stations. At each, draw one coach card before trying. Nobody is timed and nobody gives negative feedback to another child.$cw18_g$,
  kids_game_equipment = $cw18_ge$Coach cards; simple activity materials; crayons.$cw18_ge$,
  kids_game_under5 = $cw18_g5$Use picture cards for help, again, break and slow.$cw18_g5$,
  updated_at = now()
WHERE week_number = 18;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s18a_st$Building the Better Architecture$s18a_st$,
  theme_title            = $s18a_tt$$s18a_tt$,
  phase                  = 2,
  phase_name             = $s18a_pn$Unlearn$s18a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s18a_hk$Think of effective feedback you have received. What made it useful — specificity, standard, confidence, next step? Keep names private.$s18a_hk$,
  s5_source_core_concept = $s18a_cc$Today the adult room builds a practical inner-coach script. The goal is not a softer lie or a louder positive voice. It is feedback that names what happened, keeps the standard visible, assumes capacity is not settled by one result, and points toward a workable next action.$s18a_cc$,
  core_concept           = $s18a_cco$$s18a_cco$,
  teaching_points        = $s18a_tp$1. Research on wise feedback shows that, in some educational contexts, criticism can land differently when high standards are paired with explicit confidence that the person can meet them. The finding is useful and context-specific, not a universal coaching law.
2. Specific feedback is more actionable than global judgment: this approach missed the requirement gives more information than I always ruin things.
3. Growth mindset is relevant only modestly: beliefs about capacity can matter, but average outcome effects are small and concentrated in some contexts. We do not use it as a promise.
4. Repeating a coach script is practice, not literal neural rewiring. It may feel artificial for a while and that does not mean it is failing.
5. A useful coach can say stop, change course, ask for help or this standard is unrealistic. Coaching is not permanent optimism.$s18a_tp$,
  video_link             = $s18a_vl$https://www.youtube.com/watch?v=pN34FNbOKXc$s18a_vl$,
  video_description      = $s18a_vd$Current assignment: Carol Dweck / growth-mindset material. Retain pending video review. Any use must describe growth-mindset effects as modest and context-dependent rather than a broad performance mechanism.$s18a_vd$,
  todays_theme           = $s18a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Performance reviews, sport, parenting and work all demonstrate the difference between an insult and useful correction. Week 18 applies the same information test to internal language.$s18a_tdt$,
  todays_world_vo_script = $s18a_tdv$A useful coach does not avoid standards; it makes the standard and next action clearer.$s18a_tdv$,
  ancient_wisdom_reframe = $s18a_aw$Teacher and mentor traditions can be used as cultural examples of challenge paired with guidance. Do not claim one ancient model predicts modern feedback research or that becoming your own "master" is the goal.$s18a_aw$,
  ancient_wisdom_vo_script = $s18a_awv$Good guidance can be demanding without diminishing the learner.$s18a_awv$,
  signal_metaphor        = $s18a_sm$A heckler says terrible. A coach says your timing was late; reset here. Same event, very different information value.$s18a_sm$,
  private_write_prompt   = $s18a_pw$Write one critic sentence you hear repeatedly and the specific situation where it appears. Keep it private.$s18a_pw$,
  experiential_exercise  = $s18a_ex$CRITIC → COACH. Rewrite the sentence in four parts: what happened; what standard matters; what evidence of capacity remains; one next action. Do not force confidence if evidence is uncertain — I can test this is enough. Sharing is optional.$s18a_ex$,
  guided_reflection      = $s18a_gr$Keep your eyes open and compare the two versions.
Write:
The observation:
The standard:
What I know about my capacity — including uncertainty:
The next action:
Which version gives you more information? That is the test.$s18a_gr$,
  journaling_prompt      = $s18a_jp$Across the week, which critic statements became more useful when translated into specific feedback, and which situations needed a different standard rather than more effort?$s18a_jp$,
  intention_prompt       = $s18a_ip$Write one if-then plan: When I notice [critic phrase], I will translate it into observation, standard and one next action.$s18a_ip$,
  core_affirmation       = $s18a_ca$I can give myself honest feedback that is specific enough to act on and humane enough to keep using.$s18a_ca$,
  weekly_practice_mon    = $s18a_pm$Rewrite one global critic sentence as one specific observation.$s18a_pm$,
  weekly_practice_wed    = $s18a_pw2$Use the full coach script once in a real situation and record whether it produced a clearer next action.$s18a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s18a_ps$Bring one example of using the coach script and notice which part made the feedback more useful. Sharing details is optional.$s18a_ps$,
  previous_week_callback = $s18a_pwc$bring one observation about the difference between accountability and self-punishment$s18a_pwc$,
  facilitator_notes      = $s18a_fn$## Aim
Convert criticism into actionable feedback without neuroplasticity theatre or compulsory positivity.
## Run the room
Do not say neurons that fire together wire together, critic pathways weaken, coach pathways strengthen, or any variant of rewiring. Do not make members read critic material aloud. A realistic conclusion can be this is beyond my current capacity and I need support or a different plan.
## Why this week exists — the evidence
Wise-feedback research by Yeager, Cohen and colleagues provides evidence that pairing high standards with expressed confidence can improve responses to feedback in specific educational settings. Self-compassion research supports less globally punitive self-evaluation. Neither body of work proves a universal internal-coach mechanism.
Real-world anchor: a skilled editor writes the argument is unclear in paragraph three; add the missing evidence rather than you are a bad writer. The difference is not softness; it is usable information.
## Evidence quality
Moderate overall. Wise-feedback findings are meaningful but context-specific. Self-compassion has a broader evidence base. Growth-mindset effects are modest and heterogeneous. The coach metaphor is illustrative.
## We deliberately do not claim
- We do not claim this practice rewires the brain or builds new neural pathways.
- We do not claim the critic pathway weakens through disuse.
- We do not claim growth mindset produces large universal gains.
- We do not claim a coach voice should always be positive or feel natural quickly.
- We do not claim self-compassion removes the need for standards or consequences.
## Source trail
- Yeager, D. S., Cohen, G. L., et al. — wise-feedback research.
- Neff, K. D. — self-compassion research programme.
- Sisk, V. F., et al. (2018). Growth-mindset meta-analysis.$s18a_fn$,
  updated_at = now()
WHERE week_number = 18 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s18t_st$Building the Track$s18t_st$,
  theme_title            = $s18t_tt$$s18t_tt$,
  phase                  = 2,
  phase_name             = $s18t_pn$Unlearn$s18t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s18t_hk$Think of a coach, teacher or game tutorial that actually helps when you get something wrong. What does useful feedback tell you that you're terrible does not?$s18t_hk$,
  s5_source_core_concept = $s18t_cc$Today the teen room builds an inner-coach response that is specific rather than global. We do not replace every harsh thought with hype. We name what happened, what standard matters and one next action we can realistically test.$s18t_cc$,
  core_concept           = $s18t_cco$$s18t_cco$,
  teaching_points        = $s18t_tp$1. Wise-feedback studies show benefits in some educational settings when high standards are paired with clear confidence in a learner's ability to meet them. It is a useful finding, not a universal formula.
2. That approach didn't work is information; you always mess this up is a global judgment.
3. Growth mindset is a real research area, but average academic effects are modest and vary by student and setting.
4. Practising a new sentence does not mean the brain is literally laying down a coach pathway. We do not need that claim.
5. A useful coach can recommend effort, another strategy, help, rest, stopping or changing the goal.$s18t_tp$,
  video_link             = $s18t_vl$https://www.youtube.com/watch?v=pN34FNbOKXc$s18t_vl$,
  video_description      = $s18t_vd$Current assignment: growth-mindset explainer. Retain pending review. Any use must state that growth-mindset effects are modest and context-dependent; it is not a brain-rewiring mechanism.$s18t_vd$,
  todays_theme           = $s18t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
School, sport, gaming and social spaces all contain feedback. Useful feedback identifies something you can actually change; insults and global labels usually do not.$s18t_tdt$,
  todays_world_vo_script = $s18t_tdv$A coach can be demanding and still give you information instead of a verdict.$s18t_tdv$,
  ancient_wisdom_reframe = $s18t_aw$Use a training-partner metaphor: a good partner helps you see what needs adjustment without needing to humiliate you. Keep it practical, not heroic or mystical.$s18t_aw$,
  ancient_wisdom_vo_script = $s18t_awv$Useful challenge gives you something to work with.$s18t_awv$,
  signal_metaphor        = $s18t_sm$A hater comments trash. A coach says you rushed that step; slow it down on the next try. One is louder; the other is usable.$s18t_sm$,
  private_write_prompt   = $s18t_pw$Write one safe critic sentence that comes up around school, sport, hobbies or another ordinary challenge. Keep it private.$s18t_pw$,
  experiential_exercise  = $s18t_ex$HATER → COACH. Rewrite it using: what happened; what standard matters; what I can test next. Add confidence only if you genuinely believe it; I can test another approach is enough. Sharing the original sentence is optional.$s18t_ex$,
  guided_reflection      = $s18t_gr$Keep your eyes open.
Write:
What happened:
What the hater adds that is not a fact:
What a useful coach would say:
One next action:
The coach does not have to sound cheerful.$s18t_gr$,
  journaling_prompt      = $s18t_jp$During the week, which harsh thoughts became more useful when you made them specific, and when did the better answer turn out to be asking for help, changing strategy or stopping?$s18t_jp$,
  intention_prompt       = $s18t_ip$Write one if-then plan: When I notice [critic phrase], I will ask what a useful coach would tell me to do next.$s18t_ip$,
  core_affirmation       = $s18t_ca$I can be honest with myself without turning one problem into a verdict about who I am.$s18t_ca$,
  weekly_practice_mon    = $s18t_pm$Turn one global self-judgment into one specific observation.$s18t_pm$,
  weekly_practice_wed    = $s18t_pw2$Use the coach script once and notice whether it creates a clearer next step.$s18t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s18t_ps$Bring one moment where you used a coach response and notice whether it gave you a clearer next step. Sharing details is optional.$s18t_ps$,
  previous_week_callback = $s18t_pwc$bring one observation about what changed when you separated accountability from replay$s18t_pwc$,
  facilitator_notes      = $s18t_fn$## Aim
Teach useful self-feedback without rewiring claims, hype or mandatory disclosure.
## Run the room
No eyes-closed critic exercise, no reading private lines aloud and no neural-pathway language. Growth mindset stays modest. Let teens conclude I need help, I need another strategy or this goal isn't worth it.
## Why this week exists — the evidence
Wise-feedback research supports a specific combination of standards and confidence in some educational contexts. Self-compassion research supports less global self-condemnation after difficulty. Neither establishes a literal inner-coach pathway.
Real-world anchor: a game tutorial says move earlier before the obstacle rather than you're bad at games. The first statement gives a testable adjustment; the second does not.
## Evidence quality
Moderate overall. Wise feedback is context-specific; self-compassion is broader. Growth-mindset effects are modest and heterogeneous.
## We deliberately do not claim
- We do not claim adolescence is a special window where coach thoughts physically build new pathways.
- We do not claim this rewires anything.
- We do not claim growth mindset causes large gains.
- We do not claim the coach voice should feel natural quickly.
- We do not require positive statements teens do not believe.
## Source trail
- Yeager, D. S., Cohen, G. L., et al. — wise-feedback research.
- Neff, K. D. — self-compassion research.
- Sisk, V. F., et al. (2018). Growth-mindset meta-analysis.$s18t_fn$,
  updated_at = now()
WHERE week_number = 18 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s18c_st$Making the Kind Voice Louder$s18c_st$,
  theme_title            = $s18c_tt$$s18c_tt$,
  phase                  = 2,
  phase_name             = $s18c_pn$Unlearn$s18c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s18c_hk$Use two cards. One says You'll never do it. The other says That part was hard; try one smaller step or ask for help. Ask: Which card tells us what to do next?$s18c_hk$,
  s5_source_core_concept = $s18c_cc$Today the child room practises a helper voice. The helper does not say everything is easy or that we are amazing at everything. It says what happened, reminds us that one mistake is not the whole person, and suggests one safe next step.$s18c_cc$,
  core_concept           = $s18c_cco$$s18c_cco$,
  teaching_points        = $s18c_tp$1. Mean self-talk can be loud without being useful.
2. Helpful self-talk can still say that was hard, I made a mistake or I need help.
3. A good coach gives a next step instead of a whole-person label.
4. Practising a coach sentence can make it easier to remember; we do not need to say it makes a brain pathway stronger.
5. Children do not have to believe a big positive sentence. I'm learning, not sure yet and I can ask for help are honest options.$s18c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s18c_sm$A gremlin says bad! and stops there. A coach gives a signpost: slow down, try another way, ask for help, take a break. We choose the signpost that fits.$s18c_sm$,
  private_write_prompt   = $s18c_pw$Draw a made-up tricky task. Add one unhelpful speech bubble and one coach bubble that is true and gives a next step. You may keep it private.$s18c_pw$,
  experiential_exercise  = $s18c_ex$COACH CARDS. Facilitator reads fixed, neutral task examples. Children choose a coach response card: try one step / ask for help / slow down / take a break / try another way / not sure yet. Nobody plays the mean voice toward another child.
DRAW IT
Draw your coach as a simple helper symbol, animal or sign. Add one sentence you could honestly use this week.$s18c_ex$,
  guided_reflection      = $s18c_gr$Keep your eyes open and look at the coach bubble.
Ask:
Is it true?
Is it kind enough to use?
Does it give me something I can do next?
If not, change it.$s18c_gr$,
  journaling_prompt      = $s18c_jp$Draw your coach as a simple helper symbol, animal or sign. Add one sentence you could honestly use this week.$s18c_jp$,
  intention_prompt       = $s18c_ip$Choose one plan: When I notice a mean self-thought, I will choose one true coach sentence or ask for help.$s18c_ip$,
  core_affirmation       = $s18c_ca$I can use words that are true, kind and helpful about what to do next.$s18c_ca$,
  weekly_practice_mon    = $s18c_pm$Try one true coach sentence during a small challenge.$s18c_pm$,
  weekly_practice_wed    = $s18c_pw2$Show a trusted grown-up one coach sentence you like, if you want to.$s18c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s18c_ps$Bring your coach drawing back and add one true helpful sentence you used this week. Sharing is optional.$s18c_ps$,
  previous_week_callback = $s18c_pwc$bring your repair comic back and add one thing you learned about mistakes this week$s18c_pwc$,
  facilitator_notes      = $s18c_fn$## Aim
Build constructive self-talk without brain-rewiring stories, forced positivity or peer criticism.
## Run the room
Never let one child play the mean voice toward another. Do not require children to say I am enough, I am amazing or any statement they reject. No hero/guru characters, copyrighted character lists or vulnerable facilitator stories.
## Why this week exists — the evidence
Feedback research supports specific actionable guidance over global judgment, and self-compassion research supports less punitive responses to mistakes. The child translation is simply truthful coaching language.
Real-world anchor: instructions such as put the big block on the bottom help a child rebuild a tower; you're bad at blocks does not. The same information rule applies to self-talk.
## Evidence quality
Moderate overall. Adult feedback and self-compassion research inform the principle. The coach-card activity is an age-matched teaching adaptation.
## We deliberately do not claim
- We do not claim repeated coach thoughts rewire the brain or strengthen neural pathways.
- We do not claim positive self-talk works because it gets louder like a muscle.
- We do not require children to believe positive statements they find untrue.
- We do not claim a coach response guarantees success or confidence.
## Source trail
- Yeager, D. S., Cohen, G. L., et al. — wise-feedback research.
- Neff, K. D. — self-compassion research.$s18c_fn$,
  updated_at = now()
WHERE week_number = 18 AND audience = 'Child';

-- Week 19 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw19_theme$$cw19_theme$,
  the_territory        = $cw19_terr$What you carry, why you carry it, and whether it was actually chosen$cw19_terr$,
  opening_question     = $cw19_oq$What is the difference between generosity and compliance? Passing is full participation.$cw19_oq$,
  week_type            = $cw19_wt$Standard$cw19_wt$,
  reflective_question  = $cw19_rq$Across the week, which invisible tasks stayed genuinely chosen, which looked more like silent defaults, and what practical conversation or structural constraint became clearer?$cw19_rq$,
  interactive_activity = $cw19_ia$MAKE THE INVISIBLE VISIBLE. Two columns. Visible: tasks anyone could see — dishes, drop-offs, bills, reports. Invisible: remembering, anticipating, planning, checking, following up, holding the whole picture so nothing is dropped. Be specific. For each invisible item mark: C — I chose this and I'd choose it again; D — this defaulted to me and nobody really decided; F — I do this because I'm afraid of what happens if I don't. Then write: what surprised me on my own list? Share only the surprise, not the list or another person's share. Sharing is optional.$cw19_ia$,
  kids_picture_book    = $cw19_bk$Don't Hug Doug$cw19_bk$,
  kids_picture_book_author = $cw19_bka$Carrie Finison$cw19_bka$,
  kids_picture_book_note = $cw19_bkn$WHY THIS BOOK: It shows that care and friendliness do not require saying yes to every request, especially around personal boundaries.
READ-ALOUD: Read live from a purchased copy.$cw19_bkn$,
  kids_picture_book_question = $cw19_bkq$Can Doug be kind and still say no to a hug? What could a friend do instead?$cw19_bkq$,
  kids_nz_alternative = $cw19_nz$Not yet selected$cw19_nz$,
  kids_nz_alternative_author = $cw19_nza$use the main book until a reviewed title fits the theme.$cw19_nza$,
  kids_nz_alternative_note = $cw19_nzn$Any future alternative must support consent and helping without making children responsible for adult feelings.$cw19_nzn$,
  kids_colouring_prompt = $cw19_col$Colour a small basket with three light helping items and a big item being handed to a trusted grown-up.$cw19_col$,
  kids_game = $cw19_g$HELPING CHOICES. Facilitator reads fixed low-stakes scenarios. Children hold up YES / NO / ASK A GROWN-UP cards. There is no correct requirement to say yes. Avoid food-sharing prompts and never ask children to disclose real family work.$cw19_g$,
  kids_game_equipment = $cw19_ge$Choice cards; paper; crayons.$cw19_ge$,
  kids_game_under5 = $cw19_g5$Use picture cards for help, no, grown-up.$cw19_g5$,
  updated_at = now()
WHERE week_number = 19;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s19a_st$Reorienting the Function$s19a_st$,
  theme_title            = $s19a_tt$$s19a_tt$,
  phase                  = 2,
  phase_name             = $s19a_pn$Unlearn$s19a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s19a_hk$Write one thing you routinely remember, anticipate or manage that another person may never see. Then mark chosen / defaulted / fear-driven / not sure.$s19a_hk$,
  s5_source_core_concept = $s19a_cc$Today the adult room looks at people-pleasing and invisible load as questions of choice, default and consequence. The point is not to prove that somebody else is failing. It is to see what you carry, why it became yours, and what conversation or boundary — if any — would make the arrangement more deliberate.$s19a_cc$,
  core_concept           = $s19a_cco$$s19a_cco$,
  teaching_points        = $s19a_tp$1. People-pleasing is not one clinical diagnosis and is not always trauma. Compliance can be shaped by fear of rejection, learned roles, practical dependency, culture, conflict history or ordinary habit.
2. Fawn response is language used in some trauma discourse, not a settled neuroscience term. Polyvagal theory is contested and is not needed for this lesson.
3. The useful distinction is not kind versus people-pleaser as personality types. It is whether a specific action was chosen, defaulted, fear-driven or constrained.
4. Invisible labour includes remembering, anticipating, coordinating and monitoring work that may not look like a discrete task. Unequal load can be real; the session still cannot determine fairness without the other people and full context.
5. Boundaries do not automatically improve relationships. They can clarify a workable relationship, trigger negotiation, or reveal that a relationship was conditional. Structural constraints such as caregiving, poverty, disability or job power also limit choice.$s19a_tp$,
  video_link             = $s19a_vl$https://www.youtube.com/watch?v=MIte_1vcOqs$s19a_vl$,
  video_description      = $s19a_vd$Current assignment: people-pleasing/boundary material. Retain pending review. If the clip uses fawn/polyvagal claims or presents boundaries as universally relationship-improving, those claims require correction before use.$s19a_vd$,
  todays_theme           = $s19a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
The work of remembering appointments, anticipating needs, following up and keeping the whole picture in mind can be substantial even when nobody sees a task happening. Week 19 makes that load visible without turning the room into a trial of absent people.$s19a_tdt$,
  todays_world_vo_script = $s19a_tdv$The useful question is not who failed me? It is what am I carrying, how did it become mine, and what choice is available now?$s19a_tdv$,
  ancient_wisdom_reframe = $s19a_aw$Use reciprocity as a broad relational lens: healthy contribution includes giving, receiving and negotiating obligations. Do not use natural true self language to imply care for others is inauthentic.$s19a_aw$,
  ancient_wisdom_vo_script = $s19a_awv$Care can be freely chosen and deeply relational. Choice becomes clearer when the load itself is visible.$s19a_awv$,
  signal_metaphor        = $s19a_sm$Think of background processes using battery. Some are essential, some were deliberately installed, and some simply accumulated. The first job is to see what is running before closing anything.$s19a_sm$,
  private_write_prompt   = $s19a_pw$List three things you carry that are easy for other people to see and three things you carry that are mostly invisible. Do not write who should be doing them instead.$s19a_pw$,
  experiential_exercise  = $s19a_ex$MAKE THE INVISIBLE VISIBLE. Two columns. Visible: tasks anyone could see — dishes, drop-offs, bills, reports. Invisible: remembering, anticipating, planning, checking, following up, holding the whole picture so nothing is dropped. Be specific. For each invisible item mark: C — I chose this and I'd choose it again; D — this defaulted to me and nobody really decided; F — I do this because I'm afraid of what happens if I don't. Then write: what surprised me on my own list? Share only the surprise, not the list or another person's share. Sharing is optional.$s19a_ex$,
  guided_reflection      = $s19a_gr$Before you interpret the list, write:
What I chose freely:
What defaulted:
What feels constrained or fear-driven:
What needs a conversation, boundary, support or no change:
Do not decide fairness for absent people. Work only with your own load and choices.$s19a_gr$,
  journaling_prompt      = $s19a_jp$Across the week, which invisible tasks stayed genuinely chosen, which looked more like silent defaults, and what practical conversation or structural constraint became clearer?$s19a_jp$,
  intention_prompt       = $s19a_ip$Write one if-then plan: When I notice [specific default or fear-driven responsibility], I will [name it, ask for a conversation, set a small boundary, seek support, or consciously choose to keep it].$s19a_ip$,
  core_affirmation       = $s19a_ca$I can care for people without pretending every responsibility was freely chosen or automatically unfair.$s19a_ca$,
  weekly_practice_mon    = $s19a_pm$Notice one invisible task and mark it C, D, F or not sure.$s19a_pm$,
  weekly_practice_wed    = $s19a_pw2$Take one low-stakes step toward making a default more explicit, or consciously choose to leave it as it is.$s19a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s19a_ps$Bring one observation about something you carried by choice, by default or from fear and what you want to do next. Sharing details is optional.$s19a_ps$,
  previous_week_callback = $s19a_pwc$$s19a_pwc$,
  facilitator_notes      = $s19a_fn$## Aim
Make invisible load and fear-driven compliance visible while keeping the focus on the member's agency rather than absent people's guilt.
## Run the room
Say before the exercise: This exercise is not about your partner, your boss, your mother or your flatmate. None of them are here to give their version, and a room where absent people get tried is not a room anybody is safe in. You're looking at what you carry and why — not at what someone else has failed to carry. If discussion becomes a grievance case, return to C/D/F. Do not gender the pattern or imply a boundary is always safe/easy.
## Why this week exists — the evidence
Research on cognitive and emotional labour documents substantial planning, monitoring and relationship-management work that can remain less visible than discrete tasks. Approval-related personality constructs and assertiveness research support the broader idea that fear of disapproval can shape behaviour, but people-pleasing itself is not one settled mechanism.
Real-world anchor: remembering that a car warrant expires next month is work even though no physical task is happening at that moment. Making that item visible creates a concrete basis for choice or negotiation rather than a vague argument about who cares more.
## Evidence quality
Moderate overall. Invisible/cognitive labour is well documented, though distribution and fairness are context-specific. Fear-driven compliance is plausible and measurable in several constructs, but fawn is not used as a neuroscience explanation.
## We deliberately do not claim
- We do not claim people-pleasing is always trauma or a fawn response.
- We do not claim polyvagal theory is settled science.
- We do not claim a boundary always improves the relationship.
- We do not claim an unequal-looking list proves another person is at fault.
- We do not treat caregiving, financial dependence or structural constraints as simple mindset problems.
## Source trail
- Invisible/cognitive labour research in household and organisational contexts.
- Assertiveness/approval-dependence literature informs the choice-versus-fear distinction.
- Polyvagal/fawn language explicitly excluded as settled mechanism.$s19a_fn$,
  updated_at = now()
WHERE week_number = 19 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s19t_st$The Battery Drain$s19t_st$,
  theme_title            = $s19t_tt$$s19t_tt$,
  phase                  = 2,
  phase_name             = $s19t_pn$Unlearn$s19t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s19t_hk$Think privately of one thing you often do to make life easier for other people. Mark it I choose this / it just became mine / I worry what happens if I don't / not sure.$s19t_hk$,
  s5_source_core_concept = $s19t_cc$Today the teen room separates chosen care, silent default and fear-driven compliance. None is a diagnosis. We look at one pattern and ask what is safe and realistic now. If the fear is about genuine harm or safety, the answer is trusted-adult support, not a boundary experiment.$s19t_cc$,
  core_concept           = $s19t_cco$$s19t_cco$,
  teaching_points        = $s19t_tp$1. Caring, helping and adapting can be genuine choices. The same behaviour can also happen because of fear, habit, power or family circumstance.
2. Adolescents can be highly sensitive to peer evaluation and rejection, but the claim that social pain is simply the same as physical pain in the brain is contested and unnecessary here.
3. Fawn response is not settled neuroscience and people-pleasing is not automatically trauma.
4. Saying no is one relationship skill, not a universal solution. Sometimes the safest or most responsible choice is yes, negotiation, delay or asking a trusted adult for help.
5. Teens are not responsible for managing adult emotions or carrying adult responsibilities. If the list suggests that is happening in an unsafe way, facilitators follow safeguarding rather than exploring it in the room.$s19t_tp$,
  video_link             = $s19t_vl$https://www.youtube.com/watch?v=MIte_1vcOqs$s19t_vl$,
  video_description      = $s19t_vd$Current assignment: people-pleasing/boundary material. Retain pending review. Do not use clips that tell teens fawn is settled neuroscience, that social rejection is literally physical pain, or that saying no automatically earns respect.$s19t_vd$,
  todays_theme           = $s19t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Being the easy one, translating, helping siblings, keeping track of a parent's mood, organising friends or always agreeing can become invisible work. Some of it may be chosen and meaningful; some may feel defaulted or unsafe to stop.$s19t_tdt$,
  todays_world_vo_script = $s19t_tdv$The point is not to stop caring. It is to notice what you are carrying and how much choice you actually have.$s19t_tdv$,
  ancient_wisdom_reframe = $s19t_aw$Use battery as an ordinary resource metaphor: caring uses time and attention, and different obligations have different reasons. The goal is not to keep a full battery at all times; it is to understand what is using it.$s19t_aw$,
  ancient_wisdom_vo_script = $s19t_awv$Some energy is spent on things you choose and value. Some drains happen by default. Seeing the difference gives you more information.$s19t_awv$,
  signal_metaphor        = $s19t_sm$Background apps can be useful, accidental or hard to close. First check what is running before deciding what to change.$s19t_sm$,
  private_write_prompt   = $s19t_pw$Write three things you do for other people that may not be obvious. Do not write names. Mark each C — chosen / D — defaulted / F — worried what happens if I don't / ? — not sure.$s19t_pw$,
  experiential_exercise  = $s19t_ex$THE STUFF NOBODY CLOCKS. Consider things such as reading the room, being the easy one, keeping peace, translating, watching a younger sibling, remembering plans or checking someone's mood before asking for something. Write only items that fit your life and keep the page private. Mark C/D/F/?. Then ask: what surprised me? If an F item involves fear of harm or an unsafe home, do not turn it into a boundary exercise; tell a trusted adult or use MC-SAF-001 support.$s19t_ex$,
  guided_reflection      = $s19t_gr$Keep your eyes open.
Choose one item and write:
What I do:
Why I think I do it: chosen / defaulted / fear / not sure.
What choice is actually safe for me: keep it / talk about it / ask for help / not sure.
You do not have to practise saying no.$s19t_gr$,
  journaling_prompt      = $s19t_jp$During the week, which things you did for other people felt genuinely chosen, which felt like defaults, and where did you notice a real limit on your choice?$s19t_jp$,
  intention_prompt       = $s19t_ip$Write one if-then plan: When I notice [specific low-risk default], I will check whether I choose it, want to discuss it, or need help.$s19t_ip$,
  core_affirmation       = $s19t_ca$I can care about people and still notice what is chosen, what defaulted to me and when I need support.$s19t_ca$,
  weekly_practice_mon    = $s19t_pm$Notice one thing you do for someone else and mark C, D, F or ?.$s19t_pm$,
  weekly_practice_wed    = $s19t_pw2$For one low-risk D item, either make the choice explicit or talk with a trusted person if that feels safe.$s19t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s19t_ps$Bring one observation about something you did by choice, by default or because you were worried what would happen if you did not. Sharing details is optional.$s19t_ps$,
  previous_week_callback = $s19t_pwc$$s19t_pwc$,
  facilitator_notes      = $s19t_fn$## Aim
Teach discernment around helping and invisible labour without blaming caregivers, pushing no, or asking teens to disclose unsafe family dynamics.
## Run the room
No eyes-closed recall. Do not ask who the teen is afraid of. If F suggests harm, coercion or adult responsibilities beyond normal support, stop exploration and follow MC-SAF-001. Do not tell teens to confront caregivers. Keep peer/family names out.
## Why this week exists — the evidence
Approval sensitivity and social-evaluation processes are developmentally relevant in adolescence, while household and emotional labour can be uneven or invisible. The useful curriculum move is to make behaviour and perceived choice observable without treating one mechanism as universal.
Real-world anchor: translating a message for a family member can be a valued contribution, a silent default, or an overwhelming responsibility depending on context. The behaviour alone cannot tell you which.
## Evidence quality
Moderate overall. Social-evaluation sensitivity is well supported, while simple brain-equivalence claims are contested. Invisible labour is real but context-specific. C/D/F is a teaching tool, not a diagnostic test.
## We deliberately do not claim
- We do not claim fawn is settled neuroscience or people-pleasing is always trauma.
- We do not claim social rejection is simply physical pain in the brain.
- We do not claim saying no always increases respect or improves relationships.
- We do not claim a teen should challenge a caregiver when doing so may be unsafe.
- We do not make teens responsible for adult emotions.
## Source trail
- Adolescent social-evaluation research.
- Invisible/emotional labour literature used cautiously around context.
- Social-pain equivalence treated as contested.$s19t_fn$,
  updated_at = now()
WHERE week_number = 19 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s19c_st$Kind vs. People-Pleasing$s19c_st$,
  theme_title            = $s19c_tt$$s19c_tt$,
  phase                  = 2,
  phase_name             = $s19c_pn$Unlearn$s19c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s19c_hk$Show two cards: I WANT TO HELP and I NEED A GROWN-UP. Read simple scenarios and let children point. No personal examples required.$s19c_hk$,
  s5_source_core_concept = $s19c_cc$Today the child room learns that helping can be lovely when it is safe and chosen. Children do not have to pretend to like something, accept unwanted touch, keep everybody happy or take responsibility for adult jobs and adult feelings.$s19c_cc$,
  core_concept           = $s19c_cco$$s19c_cco$,
  teaching_points        = $s19c_tp$1. Kindness can include helping, sharing, listening and saying no thank you.
2. A child can choose to do something for somebody even when it is not their favourite activity. Choice matters more than whether the activity feels exciting.
3. Personal boundaries around touch need consent. A child can say no to a hug and still be kind.
4. Some household jobs are normal ways children contribute; adult responsibilities remain with adults.
5. If a child is worried something bad will happen if they say no or stop helping, they should talk to a trusted grown-up rather than solve it alone.$s19c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s19c_sm$Imagine a small helping basket. Children can carry some light jobs by choice. If the basket gets too heavy or contains a grown-up job, the right move is to hand it to a trusted grown-up for help.$s19c_sm$,
  private_write_prompt   = $s19c_pw$Draw one small helping job you like or choose sometimes, and one job a trusted grown-up should help with or own. You may tell someone or keep it private.$s19c_pw$,
  experiential_exercise  = $s19c_ex$CHOICE / HELP / GROWN-UP. Use fixed cards: tidy toys, choose to help set the table, let someone borrow a pencil, hug someone, remember an adult appointment, calm an upset adult, watch a younger child alone. Sort into child can choose / ask first or respect no / grown-up responsibility. No child describes their real home duties.
DRAW IT
Draw a helping basket with one light child-sized job and a trusted grown-up beside any heavy job.$s19c_ex$,
  guided_reflection      = $s19c_gr$Keep your eyes open and look at the two pictures.
Ask:
Did I choose this?
Is it safe for a child?
Does a grown-up need to help or take responsibility?
If you are worried about what happens when you say no, talk to a trusted grown-up.$s19c_gr$,
  journaling_prompt      = $s19c_jp$Draw a helping basket with one light child-sized job and a trusted grown-up beside any heavy job.$s19c_jp$,
  intention_prompt       = $s19c_ip$Choose one plan: When a helping job feels too big, unsafe or scary to stop, I will tell a trusted grown-up.$s19c_ip$,
  core_affirmation       = $s19c_ca$I can be kind, make safe choices and ask a grown-up when a job or feeling is too big for me.$s19c_ca$,
  weekly_practice_mon    = $s19c_pm$Notice one small helping thing you chose to do.$s19c_pm$,
  weekly_practice_wed    = $s19c_pw2$Practise saying no thank you or I need help with a trusted grown-up using a made-up example.$s19c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s19c_ps$Bring your choice-and-help drawing back and add one thing you noticed about helping this week. Sharing is optional.$s19c_ps$,
  previous_week_callback = $s19c_pwc$$s19c_pwc$,
  facilitator_notes      = $s19c_fn$## Aim
Teach choice and boundaries without making children responsible for adult emotions or household fairness.
## Run the room
Do not ask children to list unseen jobs at home, who is sad, who needs managing, or whether chores are fair. If a child independently describes adult-level caregiving or fear of consequences, do not explore it publicly; follow MC-SAF-001. No body-feeling test is used to decide whether kindness is genuine.
## Why this week exists — the evidence
Children benefit from age-appropriate autonomy and clear consent/boundary teaching. Household contribution can be developmentally appropriate, while adult emotional regulation and adult responsibilities should not be assigned to children.
Real-world anchor: setting the table can be a normal family contribution; remembering an adult's medical appointment or keeping an adult calm is a different category of responsibility. Concrete examples make that distinction visible.
## Evidence quality
Moderate overall. Autonomy and consent principles are well established. This sorting activity is a safeguarding-oriented teaching adaptation, not a family assessment.
## We deliberately do not claim
- We do not claim saying no is always the right answer.
- We do not claim children can determine fairness in adult household workloads.
- We do not make children responsible for adult feelings.
- We do not use body sensations as a truth test for kindness versus people-pleasing.
- We do not ask children to disclose home responsibilities.
## Source trail
- Child autonomy/consent literature informs the general principle.
- Safeguarding boundaries follow MC-SAF-001.$s19c_fn$,
  updated_at = now()
WHERE week_number = 19 AND audience = 'Child';

-- Week 20 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw20_theme$$cw20_theme$,
  the_territory        = $cw20_terr$Telling a real limit from a story about not-enough$cw20_terr$,
  opening_question     = $cw20_oq$What changes when a limit is real rather than a mindset? Passing is full participation.$cw20_oq$,
  week_type            = $cw20_wt$Standard$cw20_wt$,
  reflective_question  = $cw20_rq$Across the week, which not enough thoughts described real constraints, which described moving comparisons, and what different response did each type need?$cw20_rq$,
  interactive_activity = $cw20_ia$SCARCITY AUDIT. Write: what feels scarce; is it objectively limited here; evidence; what is comparison or uncertainty; what practical action or support is available; what cannot currently be changed. Do not turn financial hardship into a mindset challenge. Sharing is optional.$cw20_ia$,
  kids_picture_book    = $cw20_bk$Stone Soup$cw20_bk$,
  kids_picture_book_author = $cw20_bka$Jon J Muth$cw20_bka$,
  kids_picture_book_note = $cw20_bkn$WHY THIS BOOK: Use it to show that combining finite contributions can create a shared result, not that families always have enough to give.
READ-ALOUD: Read live from a purchased copy.$cw20_bkn$,
  kids_picture_book_question = $cw20_bkq$Did each person have an endless supply? What happened when small real contributions were combined?$cw20_bkq$,
  kids_nz_alternative = $cw20_nz$Not yet selected$cw20_nz$,
  kids_nz_alternative_author = $cw20_nza$use the main book until a reviewed title fits this theme.$cw20_nza$,
  kids_nz_alternative_note = $cw20_nzn$Avoid The Giving Tree: it can blur generosity with depletion. Future alternatives should respect real limits.$cw20_nzn$,
  kids_colouring_prompt = $cw20_col$Colour a biscuit split into pieces beside two speech bubbles sharing the same idea.$cw20_col$,
  kids_game = $cw20_g$SORT THE SUPPLY. Teams sort picture cards into limited / can copy or repeat / not sure. No sweets or real food are distributed and nobody is praised for giving away limited belongings.$cw20_g$,
  kids_game_equipment = $cw20_ge$Counters; picture cards; crayons.$cw20_ge$,
  kids_game_under5 = $cw20_g5$Use four obvious cards only: biscuit, battery, song, idea.$cw20_g5$,
  updated_at = now()
WHERE week_number = 20;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s20a_st$Uninstalling the Scarcity Operating System$s20a_st$,
  theme_title            = $s20a_tt$$s20a_tt$,
  phase                  = 2,
  phase_name             = $s20a_pn$Unlearn$s20a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s20a_hk$Complete privately: I do not have enough… Then classify it: finite resource / time-capacity / comparison-status / relationship-attention / not sure.$s20a_hk$,
  s5_source_core_concept = $s20a_cc$Today the adult room removes scarcity mindset as an explanation for material hardship. Money, housing, time, energy and access can be genuinely insufficient. We practise identifying the kind of constraint and asking what action, support or acceptance fits it.$s20a_cc$,
  core_concept           = $s20a_cco$$s20a_cco$,
  teaching_points        = $s20a_tp$1. Mullainathan and Shafir's work argues that genuine scarcity can capture attention and reduce cognitive bandwidth. The burden is not solved by thinking more abundantly.
2. Some resources are finite or rivalrous in a given situation: money, hours, seats, food, physical capacity and attention all have limits.
3. Other comparisons are not simple zero-sum systems: another person's skill, recognition or friendship does not automatically remove an equal amount from you, though opportunities can still be structurally limited.
4. Enough needs a reference: enough for what requirement, time period or goal? Without that, the word can become either panic or empty reassurance.
5. When scarcity is real, practical support, redistribution, prioritisation or changed expectations may matter more than mindset work.$s20a_tp$,
  video_link             = $s20a_vl$https://www.youtube.com/watch?v=iCvmsMzlF7o$s20a_vl$,
  video_description      = $s20a_vd$Current assignment conflicts with the evidence emphasis and requires review. The lesson should use Mullainathan/Shafir scarcity research rather than abundance-mindset material. Assignment left unchanged pending video reassignment.$s20a_vd$,
  todays_theme           = $s20a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
A shift worker short on time, a family short on money and a professional comparing status are all experiencing different problems. Calling all three scarcity thinking hides the difference.$s20a_tdt$,
  todays_world_vo_script = $s20a_tdv$First ask what actually runs out. Then ask what can realistically change.$s20a_tdv$,
  ancient_wisdom_reframe = $s20a_aw$Traditions that discuss sufficiency can be used as philosophical lenses for defining enough, not as claims that nature is abundant or that trust creates resources.$s20a_aw$,
  ancient_wisdom_vo_script = $s20a_awv$Enough is a practical question: enough for what, for whom and for how long?$s20a_awv$,
  signal_metaphor        = $s20a_sm$A resource monitor shows different limits separately: storage, battery, memory, network. Low resource is useful only when you know which resource is low.$s20a_sm$,
  private_write_prompt   = $s20a_pw$Choose one not enough concern and name the actual resource, requirement or comparison involved.$s20a_pw$,
  experiential_exercise  = $s20a_ex$SCARCITY AUDIT. Write: what feels scarce; is it objectively limited here; evidence; what is comparison or uncertainty; what practical action or support is available; what cannot currently be changed. Do not turn financial hardship into a mindset challenge. Sharing is optional.$s20a_ex$,
  guided_reflection      = $s20a_gr$Keep your eyes open.
Write:
The resource or need:
What is genuinely limited:
What I may be adding through comparison or uncertainty:
One practical response, support or acceptance step:$s20a_gr$,
  journaling_prompt      = $s20a_jp$Across the week, which not enough thoughts described real constraints, which described moving comparisons, and what different response did each type need?$s20a_jp$,
  intention_prompt       = $s20a_ip$Write one if-then plan: When I notice [specific scarcity cue], I will identify the resource and choose one practical response before calling it a mindset problem.$s20a_ip$,
  core_affirmation       = $s20a_ca$I can respect real limits without turning every feeling of not-enough into a truth about my worth.$s20a_ca$,
  weekly_practice_mon    = $s20a_pm$Classify one not-enough thought by the resource involved.$s20a_pm$,
  weekly_practice_wed    = $s20a_pw2$Take one practical step on a real constraint or deliberately stop treating a comparison as a resource shortage.$s20a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s20a_ps$Bring one example where separating a real resource limit from a comparison or uncertainty changed the question. Sharing is optional.$s20a_ps$,
  previous_week_callback = $s20a_pwc$$s20a_pwc$,
  facilitator_notes      = $s20a_fn$## Aim
Repudiate abundance metaphysics and distinguish material scarcity from comparison and uncertainty.
## Run the room
If a member is in financial or material hardship, acknowledge the constraint and surface practical access/support privately where available. Do not ask what they would do if they believed there was enough. No manifestation, abundance or worthiness framing.
## Why this week exists — the evidence
Mullainathan and Shafir's scarcity research describes how genuine resource constraint can consume attention and impair decision capacity. That evidence argues against moralising scarcity as attitude.
Real-world anchor: having $40 for a $60 bill is a real shortfall; feeling behind because a peer earns more is a comparison. Both can feel like not enough, but they require different responses.
## Evidence quality
Moderate overall. Scarcity/bandwidth findings are influential and supported across several contexts, though effect sizes and replication vary by paradigm. The resource-monitor metaphor is illustrative.
## We deliberately do not claim
- We do not claim scarcity is a mindset.
- We do not claim believing in abundance produces abundance.
- We do not claim material circumstances reflect thinking or worthiness.
- We do not claim kindness, love or opportunity are literally unlimited.
- We do not give financial advice in this lesson.
## Source trail
- Mullainathan, S., & Shafir, E. (2013). Scarcity. Writer/researcher synthesis of a broader programme; specific findings should trace to underlying studies where used.$s20a_fn$,
  updated_at = now()
WHERE week_number = 20 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s20t_st$The Resource Monitor$s20t_st$,
  theme_title            = $s20t_tt$$s20t_tt$,
  phase                  = 2,
  phase_name             = $s20t_pn$Unlearn$s20t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s20t_hk$Think privately: I never have enough… Mark it money/stuff / time-energy / friends-attention / achievement-status / not sure.$s20t_hk$,
  s5_source_core_concept = $s20t_cc$Today the teen room separates real resource limits from comparison and uncertainty. Real scarcity deserves practical support and honest acknowledgment. Comparison deserves a different question. Neither is solved by pretending everything is abundant.$s20t_cc$,
  core_concept           = $s20t_cco$$s20t_cco$,
  teaching_points        = $s20t_tp$1. Real scarcity can take up attention and make planning harder. That is a load problem, not proof somebody has the wrong attitude.
2. Money, time, places and physical resources can genuinely be limited.
3. Friendship and attention can also have practical limits; saying love never runs out is too simple when people still have finite time and capacity.
4. Another person's success does not automatically reduce your ability or worth, even when competitions and opportunities themselves can be limited.
5. Enough means enough for a particular need or goal, not a magical feeling you are supposed to produce.$s20t_tp$,
  video_link             = $s20t_vl$https://www.youtube.com/watch?v=RZWf2_2L2v8$s20t_vl$,
  video_description      = $s20t_vd$Current assignment: scarcity-versus-abundance material. Assignment requires review because the lesson rejects abundance-mindset claims. Do not use any clip that says believing you have enough creates more resources.$s20t_vd$,
  todays_theme           = $s20t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
A limited number of team places, a family's money and a school deadline are real constraints. Somebody else's talent or friendship is not automatically a unit taken out of your supply. The category matters.$s20t_tdt$,
  todays_world_vo_script = $s20t_tdv$Before arguing with a not-enough thought, check whether the thing really has a limit.$s20t_tdv$,
  ancient_wisdom_reframe = $s20t_aw$Use a water-bottle metaphor: some containers have a real amount in them. The skill is checking the level, not pretending the bottle is endless.$s20t_aw$,
  ancient_wisdom_vo_script = $s20t_awv$A real limit needs a real plan. A comparison needs a different question.$s20t_awv$,
  signal_metaphor        = $s20t_sm$A resource monitor tells you whether storage, battery or data is actually low. Low is useful only when you know what resource it refers to.$s20t_sm$,
  private_write_prompt   = $s20t_pw$Choose one not-enough thought and write exactly what you think is limited. Keep it private.$s20t_pw$,
  experiential_exercise  = $s20t_ex$RESOURCE CHECK. Four boxes: what feels limited; evidence it is actually limited; what comparison/uncertainty adds; what practical action or support is available. If the issue is money or family resources, do not ask teens to solve adult finances.$s20t_ex$,
  guided_reflection      = $s20t_gr$Keep your eyes open.
Write:
The resource:
The real limit, if any:
The comparison or guess:
One safe practical response:
If the problem belongs to adults, tell/ask a trusted adult can be the response.$s20t_gr$,
  journaling_prompt      = $s20t_jp$During the week, which not-enough thoughts turned out to be real constraints and which were comparisons or guesses? What did each one actually need?$s20t_jp$,
  intention_prompt       = $s20t_ip$Write one if-then plan: When I notice [specific not-enough thought], I will identify the resource before deciding what it means about me.$s20t_ip$,
  core_affirmation       = $s20t_ca$I can take real limits seriously without turning them into a verdict about whether I am enough.$s20t_ca$,
  weekly_practice_mon    = $s20t_pm$Classify one not-enough thought by the resource involved.$s20t_pm$,
  weekly_practice_wed    = $s20t_pw2$Take one small safe action on a real limit or question one comparison that was acting like a shortage.$s20t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s20t_ps$Bring one example where you worked out whether something was actually limited or just felt limited. Sharing details is optional.$s20t_ps$,
  previous_week_callback = $s20t_pwc$$s20t_pwc$,
  facilitator_notes      = $s20t_fn$## Aim
Protect teens from abundance-mindset messaging and distinguish structural scarcity from comparison.
## Run the room
No financial disclosure, food insecurity discussion in front of peers, or what would abundance look like? prompts. Do not tell a teen a friendship worry is imaginary; people have finite time and social situations have real constraints. Keep adult financial responsibility with adults.
## Why this week exists — the evidence
Scarcity research supports the idea that real constraints can capture attention and reduce available cognitive bandwidth. That makes structural honesty essential rather than optional.
Real-world anchor: there may be twelve spots on a team and twenty people trying out — a real limit. A teammate being skilled does not remove your existing skills. Those two facts can coexist.
## Evidence quality
Moderate overall. Scarcity research is meaningful; abundance-mindset claims are not supported. The resource-monitor metaphor is illustrative.
## We deliberately do not claim
- We do not claim scarcity is mostly a mindset.
- We do not claim kindness, love, attention or opportunity are literally unlimited.
- We do not claim believing you are enough creates more resources.
- We do not make teens responsible for solving family financial scarcity.
- We do not use manifestation or abundance language.
## Source trail
- Mullainathan, S., & Shafir, E. — scarcity research programme and synthesis.$s20t_fn$,
  updated_at = now()
WHERE week_number = 20 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s20c_st$The Things That Don't Run Out$s20c_st$,
  theme_title            = $s20c_tt$$s20c_tt$,
  phase                  = 2,
  phase_name             = $s20c_pn$Unlearn$s20c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s20c_hk$Show five counters and share them between two cups. Ask: Did the number change? Then share an idea or a smile and ask: Did telling you my idea make me lose the idea?$s20c_hk$,
  s5_source_core_concept = $s20c_cc$Today the child room sorts things that really have limits from things that work differently. Snacks, money, time and seats can run out. An idea can be shared without disappearing from your head. Kindness can be repeated, but people still have limited time and energy. We do not pretend every family has plenty.$s20c_cc$,
  core_concept           = $s20c_cco$$s20c_cco$,
  teaching_points        = $s20c_tp$1. Some things really run out: food in a packet, money, time, batteries and places in a game.
2. Some things can be shared without losing the original, such as an idea, a story or information.
3. Kind actions can be repeated, but people still need rest and cannot give forever.
4. If a family does not have enough of something important, that is a real problem for adults and community support — not a child's thinking problem.
5. Another child having a skill or good idea does not use up your ability to learn.$s20c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s20c_sm$If you share a biscuit, you have less biscuit — biscuits run out. If you share a good idea, you still know the idea. Today we work out which things follow which rule.$s20c_sm$,
  private_write_prompt   = $s20c_pw$Draw one thing that really runs out and one thing you can share without losing the original. You may tell someone or keep it private.$s20c_pw$,
  experiential_exercise  = $s20c_ex$RUNS OUT / WORKS DIFFERENTLY. Sort fixed picture cards: water bottle, coins, time clock, seats, battery, idea, story, compliment, drawing technique. Discuss limits carefully. Do not ask children about food or money at home.
DRAW IT
Draw two boxes labelled LIMITED and WORKS DIFFERENTLY and add two safe examples to each.$s20c_ex$,
  guided_reflection      = $s20c_gr$Keep your eyes open and look at the two pictures.
Ask:
Does this have a real limit?
If I share it, what changes?
Do I need a grown-up's help when there is not enough?$s20c_gr$,
  journaling_prompt      = $s20c_jp$Draw two boxes labelled LIMITED and WORKS DIFFERENTLY and add two safe examples to each.$s20c_jp$,
  intention_prompt       = $s20c_ip$Choose one plan: When I worry there is not enough, I will first ask whether the thing really has a limit and tell a trusted grown-up if I need help.$s20c_ip$,
  core_affirmation       = $s20c_ca$I can learn what has real limits and ask a trusted grown-up for help when there is not enough.$s20c_ca$,
  weekly_practice_mon    = $s20c_pm$Notice one thing today that really has a limit.$s20c_pm$,
  weekly_practice_wed    = $s20c_pw2$Share one idea, story or kind word if you want to and notice what happens to the original.$s20c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s20c_ps$Bring your runs-out drawing back and add one new thing you noticed about what is limited and what can be shared. Sharing is optional.$s20c_ps$,
  previous_week_callback = $s20c_pwc$$s20c_pwc$,
  facilitator_notes      = $s20c_fn$## Aim
Teach resource categories without abundance mythology, food insecurity disclosure or child responsibility for scarcity.
## Run the room
Do not ask what don't you have enough of?, use snacks as actual sharing props, or require children to list things their family has plenty of. If scarcity emerges, respond privately through appropriate adult/support channels.
## Why this week exists — the evidence
Real scarcity is load-bearing. The child lesson uses concrete resource categories rather than asking children to think their way out of material limits.
Real-world anchor: five counters remain five counters when divided. One idea can be told to five people without leaving the first person's memory. Children can observe the difference directly.
## Evidence quality
Illustrative to moderate. Scarcity research is adult/background evidence; the sorting task is a concrete teaching adaptation.
## We deliberately do not claim
- We do not claim love, kindness or attention are literally infinite.
- We do not claim sharing always makes more.
- We do not claim a child's brain falsely creates material scarcity.
- We do not ask children to disclose food, money or housing scarcity.
- We do not use abundance or manifestation language.
## Source trail
- Mullainathan/Shafir scarcity research informs structural-honesty framing.$s20c_fn$,
  updated_at = now()
WHERE week_number = 20 AND audience = 'Child';

-- Week 21 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw21_theme$$cw21_theme$,
  the_territory        = $cw21_terr$What relationships can teach us about what to expect from people$cw21_terr$,
  opening_question     = $cw21_oq$Which relationship expectations can be useful in one context and inaccurate in another? Passing is full participation.$cw21_oq$,
  week_type            = $cw21_wt$Standard$cw21_wt$,
  reflective_question  = $cw21_rq$Across the week, which relationship expectations were confirmed by current evidence, which were contradicted, and which remained uncertain?$cw21_rq$,
  interactive_activity = $cw21_ia$RELATIONSHIP EXPECTATION MAP. Write: expectation; where I may have learned it; present evidence that fits; present evidence that does not; one response I could test now. Use not sure freely. Sharing is optional.$cw21_ia$,
  kids_picture_book    = $cw21_bk$Wilfrid Gordon McDonald Partridge$cw21_bk$,
  kids_picture_book_author = $cw21_bka$Mem Fox$cw21_bka$,
  kids_picture_book_note = $cw21_bkn$WHY THIS BOOK: It shows care, memory and reciprocity across generations without asking children to evaluate their own caregivers.
READ-ALOUD: Read live from a purchased copy.$cw21_bkn$,
  kids_picture_book_question = $cw21_bkq$What did Wilfrid learn from the people around him, and what did he give back?$cw21_bkq$,
  kids_nz_alternative = $cw21_nz$Not yet selected$cw21_nz$,
  kids_nz_alternative_author = $cw21_nza$use the main book until a reviewed title fits the theme.$cw21_nza$,
  kids_nz_alternative_note = $cw21_nzn$Any future alternative must avoid asking children to decide which caregiver lessons were harmful in a group setting.$cw21_nzn$,
  kids_colouring_prompt = $cw21_col$Colour a toolbox with pictures for listening, asking, helping, space and taking turns.$cw21_col$,
  kids_game = $cw21_g$FOLLOW AND CHOOSE. A facilitator demonstrates a neutral movement, then children may copy it or choose another safe movement. Discuss that learning from someone does not mean copying everything they do.$cw21_g$,
  kids_game_equipment = $cw21_ge$Paper; crayons; simple relationship-skill cards.$cw21_ge$,
  kids_game_under5 = $cw21_g5$Use picture cards and simple turn-taking examples.$cw21_g5$,
  updated_at = now()
WHERE week_number = 21;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s21a_st$Structural Assessment$s21a_st$,
  theme_title            = $s21a_tt$$s21a_tt$,
  phase                  = 2,
  phase_name             = $s21a_pn$Unlearn$s21a_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s21a_hk$Write one relationship expectation you notice in yourself: people leave / conflict is dangerous / I should handle it alone / people usually help / closeness feels easy / something else. Keep origin private.$s21a_hk$,
  s5_source_core_concept = $s21a_cc$Today the adult room maps one learned expectation without turning it into an attachment label. Early and later relationships can influence what we anticipate from people. The practical question is whether that expectation fits the person and situation in front of us now.$s21a_cc$,
  core_concept           = $s21a_cco$$s21a_cco$,
  teaching_points        = $s21a_tp$1. Bowlby's attachment theory and Ainsworth's infant research established that early caregiving relationships matter for expectations and behaviour. The evidence is strongest in child-caregiver attachment.
2. Adult attachment styles are much weaker and more heterogeneous than popular quizzes suggest. They are not fixed identities or reliable relationship predictions.
3. Relationships throughout life can reinforce, complicate or change expectations. We do not claim one caregiver installed a permanent template.
4. Family-systems ideas can be useful lenses for recurring interaction patterns, but they are clinical/theoretical frameworks rather than proof of unconscious multigenerational mechanisms in a particular family.
5. Mapping is not blame. A relationship expectation can make sense, remain useful, need updating, or be too important to explore in a non-clinical group.$s21a_tp$,
  video_link             = $s21a_vl$https://www.youtube.com/watch?v=WjOowWxOXCg$s21a_vl$,
  video_description      = $s21a_vd$Current assignment: attachment explainer. Retain pending review. Any use must distinguish strong infant-caregiver evidence from weaker adult-style claims and reject quiz-style diagnosis.$s21a_vd$,
  todays_theme           = $s21a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
An unanswered message, a disagreement or a request for help can activate expectations learned across many relationships. Noticing the expectation gives us a chance to compare it with present evidence.$s21a_tdt$,
  todays_world_vo_script = $s21a_tdv$History can influence what you expect without deciding what this person will do next.$s21a_tdv$,
  ancient_wisdom_reframe = $s21a_aw$Relational traditions can be used as cultural lenses for reciprocity, obligation and care. Do not reduce healthy relationships to individual self-sufficiency or claim one ancient system anticipated attachment science.$s21a_aw$,
  ancient_wisdom_vo_script = $s21a_awv$Relationships shape us, and we continue learning from relationships throughout life.$s21a_awv$,
  signal_metaphor        = $s21a_sm$Think of predictive text: it suggests what usually came next before. The suggestion can be useful, but you still check the sentence you are actually writing now.$s21a_sm$,
  private_write_prompt   = $s21a_pw$Choose one current, manageable relationship expectation. Write the expectation and one present-day situation where it appears. Do not identify a traumatic origin.$s21a_pw$,
  experiential_exercise  = $s21a_ex$RELATIONSHIP EXPECTATION MAP. Write: expectation; where I may have learned it; present evidence that fits; present evidence that does not; one response I could test now. Use not sure freely. Sharing is optional.$s21a_ex$,
  guided_reflection      = $s21a_gr$Keep your eyes open.
Write:
What I expect:
What this person has actually shown:
What may belong to older experience:
What response fits the current evidence:
If the relationship is unsafe, the response is safety/support rather than experimentation.$s21a_gr$,
  journaling_prompt      = $s21a_jp$Across the week, which relationship expectations were confirmed by current evidence, which were contradicted, and which remained uncertain?$s21a_jp$,
  intention_prompt       = $s21a_ip$Write one if-then plan: When [specific relationship cue] activates this expectation, I will check one current fact before responding.$s21a_ip$,
  core_affirmation       = $s21a_ca$I can respect what relationships taught me and still check what is true in the relationship in front of me.$s21a_ca$,
  weekly_practice_mon    = $s21a_pm$Notice one relationship expectation without trying to change it.$s21a_pm$,
  weekly_practice_wed    = $s21a_pw2$Compare one expectation with one piece of current evidence.$s21a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s21a_ps$Bring one observation about a relationship expectation you noticed and whether it still fit the current situation. Sharing details is optional.$s21a_ps$,
  previous_week_callback = $s21a_pwc$$s21a_pwc$,
  facilitator_notes      = $s21a_fn$## Aim
Map learned expectations without attachment typing, family blame or trauma processing.
## Run the room
No attachment quizzes, labels, eyes-closed caregiver recall or public family histories. If recognition of harm emerges, acknowledge and refer rather than explore. Unsafe relationships are not experiments in responding fresh.
## Why this week exists — the evidence
Attachment research strongly supports the significance of early caregiver relationships, particularly in infancy and childhood. Popular adult-style typologies extend the evidence beyond what can be confidently inferred for an individual.
Real-world anchor: predictive text uses prior patterns to suggest a next word; sometimes it is right and sometimes the current sentence differs. Learned relationship expectations can be treated similarly — as predictions to check, not destiny.
## Evidence quality
Strong for early attachment; moderate to contested for broad adult-style claims. The relationship-map exercise is a non-clinical teaching tool.
## We deliberately do not claim
- We do not claim four adult attachment styles reliably define or predict a person.
- We do not claim a quiz can diagnose attachment.
- We do not claim early relationships permanently install adult relationship behaviour.
- We do not claim conscious awareness or a secure friend literally rewires attachment.
- We do not use this session to resolve parental harm.
## Source trail
- Bowlby, J.; Ainsworth, M. — foundational attachment research.
- Adult attachment literature treated with explicit limits relative to infant evidence.$s21a_fn$,
  updated_at = now()
WHERE week_number = 21 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s21t_st$Auditing the Relationship Code$s21t_st$,
  theme_title            = $s21t_tt$$s21t_tt$,
  phase                  = 2,
  phase_name             = $s21t_pn$Unlearn$s21t_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s21t_hk$Think privately of one sentence such as people always leave / I have to fix conflict / asking for help is risky / good friends reply fast / something else. No origin story required.$s21t_hk$,
  s5_source_core_concept = $s21t_cc$Today the teen room treats relationship expectations like predictions, not types. We notice one prediction, check what the current relationship actually shows and decide what response fits now. Nobody is asked to label their attachment style or analyse a caregiver.$s21t_cc$,
  core_concept           = $s21t_cco$$s21t_cco$,
  teaching_points        = $s21t_tp$1. Early caregiving relationships matter, but popular adult/teen attachment-style labels are much less precise than infant attachment research.
2. A teenager cannot reliably diagnose themselves or a friend from a quiz, texting pattern or one relationship.
3. Expectations about closeness and conflict can change through new experience; that does not mean a friend literally rewires your attachment system.
4. Family and cultural patterns can be resources as well as difficulties. We do not begin from blame.
5. If a relationship is unsafe, the priority is a trusted adult and safeguarding, not trying a more open attachment response.$s21t_tp$,
  video_link             = $s21t_vl$https://www.youtube.com/watch?v=WjOowWxOXCg$s21t_vl$,
  video_description      = $s21t_vd$Current assignment: attachment-style explainer. Retain pending review. Any use must avoid typing teens as secure/anxious/avoidant/disorganised or claiming adolescence is a rewiring window for attachment.$s21t_vd$,
  todays_theme           = $s21t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Replies, disagreements, closeness and exclusion can activate expectations built from earlier relationships. The expectation is worth noticing; it is not proof of what the current person means.$s21t_tdt$,
  todays_world_vo_script = $s21t_tdv$Old experience can shape what you predict. Current evidence still matters.$s21t_tdv$,
  ancient_wisdom_reframe = $s21t_aw$Use a map with old route suggestions: some routes remain useful, some roads have changed. You check the current road rather than throwing the whole map away.$s21t_aw$,
  ancient_wisdom_vo_script = $s21t_awv$What you learned before can guide you without deciding every relationship now.$s21t_awv$,
  signal_metaphor        = $s21t_sm$Predictive text guesses the next word from past patterns. You can read the suggestion without automatically sending it.$s21t_sm$,
  private_write_prompt   = $s21t_pw$Write one safe relationship expectation and one current situation where it shows up. No names or childhood history.$s21t_pw$,
  experiential_exercise  = $s21t_ex$EXPECTATION CHECK. Four boxes: what I expect; current evidence for it; current evidence against it; what I still do not know. Add one safe response based on current evidence. Sharing is optional.$s21t_ex$,
  guided_reflection      = $s21t_gr$Keep your eyes open.
Write:
The prediction:
What this person actually did:
What I may be adding from older experience:
What I want to do next:
Not sure is complete.$s21t_gr$,
  journaling_prompt      = $s21t_jp$During the week, which relationship predictions matched what actually happened, which did not, and where did you realise you needed more information?$s21t_jp$,
  intention_prompt       = $s21t_ip$Write one if-then plan: When [specific relationship cue] triggers this prediction, I will check one current fact before acting.$s21t_ip$,
  core_affirmation       = $s21t_ca$I can learn from past relationships without letting them predict every person I meet now.$s21t_ca$,
  weekly_practice_mon    = $s21t_pm$Notice one relationship prediction.$s21t_pm$,
  weekly_practice_wed    = $s21t_pw2$Check one prediction against what the person actually did.$s21t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s21t_ps$Bring one observation about a relationship expectation you noticed and whether current evidence matched it. Sharing details is optional.$s21t_ps$,
  previous_week_callback = $s21t_pwc$$s21t_pwc$,
  facilitator_notes      = $s21t_fn$## Aim
Teach relationship prediction-checking without attachment labels, caregiver disclosure or amateur therapy.
## Run the room
No attachment quizzes, no which type are you, no eyes-closed relationship recall and no asking where a pattern came from. If a teen discloses harm, follow MC-SAF-001.
## Why this week exists — the evidence
Attachment evidence is strongest for early child-caregiver relationships; adult-style constructs are more variable. The defensible teaching principle is simply that experience shapes expectations and current evidence can update them.
Real-world anchor: a friend who once replied slowly because they were busy can create an expectation that slow replies mean rejection. The observable reply time and the inferred motive remain separate data.
## Evidence quality
Strong for early attachment; weaker for broad teen/adult style labels. The expectation check is a teaching tool.
## We deliberately do not claim
- We do not claim four styles define teens or their future relationships.
- We do not claim friends or therapists literally rewire attachment patterns.
- We do not claim a quiz can reveal a teen's attachment style.
- We do not blame caregivers or ask teens to disclose private family history.
## Source trail
- Bowlby/Ainsworth foundational attachment research.
- Adult/teen attachment extensions treated with caution.$s21t_fn$,
  updated_at = now()
WHERE week_number = 21 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s21c_st$The Gifts People Give Us$s21c_st$,
  theme_title            = $s21c_tt$$s21c_tt$,
  phase                  = 2,
  phase_name             = $s21c_pn$Unlearn$s21c_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s21c_hk$Ask children to name or point to helpful relationship skills in made-up examples: listening, taking turns, helping, saying sorry, giving space, asking first.$s21c_hk$,
  s5_source_core_concept = $s21c_cc$Today the child room notices helpful relationship lessons such as listening, taking turns, asking, helping and giving space. Children may also have confusing experiences; they do not have to explain those here. A trusted grown-up can help with anything that feels unsafe or too hard.$s21c_cc$,
  core_concept           = $s21c_cco$$s21c_cco$,
  teaching_points        = $s21c_tp$1. Children learn relationship skills from many people — whānau, caregivers, teachers, friends and others.
2. People can teach helpful things without being perfect.
3. One relationship does not decide how every future relationship will work.
4. Children do not need a relationship type or label.
5. If something a child learned from a relationship feels unsafe or confusing, the group does not analyse it; a trusted grown-up can help.$s21c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s21c_sm$People can give us "relationship tools" such as listening, asking, taking turns and giving space. We can practise useful tools without deciding that every person taught us the same thing.$s21c_sm$,
  private_write_prompt   = $s21c_pw$Choose one safe relationship skill and draw a made-up example of somebody using it. You may tell someone or keep it private.$s21c_pw$,
  experiential_exercise  = $s21c_ex$RELATIONSHIP GIFTS BOX. Children draw a gift box and add only safe, positive or neutral skills learned from relationships: listening, humour, patience, asking first, helping, trying again, giving space. Outside the box add something I am still learning. No names are required and no child lists harmful lessons.
DRAW IT
Draw one relationship tool you already use and one you are still learning.$s21c_ex$,
  guided_reflection      = $s21c_gr$Keep your eyes open and look at the skill.
Ask:
Who can teach this skill?
Where could I practise it?
What can I do if a relationship feels unsafe or confusing? — tell a trusted grown-up.$s21c_gr$,
  journaling_prompt      = $s21c_jp$Draw one relationship tool you already use and one you are still learning.$s21c_jp$,
  intention_prompt       = $s21c_ip$Choose one plan: When I notice a chance to practise [safe relationship skill], I will try it once.$s21c_ip$,
  core_affirmation       = $s21c_ca$I can learn helpful relationship skills and ask a trusted grown-up when something feels unsafe or confusing.$s21c_ca$,
  weekly_practice_mon    = $s21c_pm$Notice one helpful relationship skill somebody uses.$s21c_pm$,
  weekly_practice_wed    = $s21c_pw2$Practise one safe skill such as asking, listening or giving space.$s21c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s21c_ps$Bring your relationship-gifts drawing back and add one good lesson or one thing you are still learning. Sharing is optional.$s21c_ps$,
  previous_week_callback = $s21c_pwc$$s21c_pwc$,
  facilitator_notes      = $s21c_fn$## Aim
Keep relationship learning concrete and safe without asking children to evaluate caregivers, recall unsafe relationships or choose which lessons to discard.
## Run the room
No who made you feel safe/loved, what confusing thing did a caregiver teach you, eyes-closed caregiver recall, or hero/wise-elder framing. If a child discloses harm, do not explore; follow MC-SAF-001.
## Why this week exists — the evidence
Children learn social expectations and behaviour through relationships and observation. The child lesson uses observable relationship skills rather than attachment labels or caregiver analysis.
Real-world anchor: learning to wait for a turn can happen through repeated games with many people. The skill can be carried forward without needing a story about one formative relationship.
## Evidence quality
Moderate overall. Social learning and child-caregiver relationship research are substantial. This gifts-box activity is a teaching adaptation, not an attachment assessment.
## We deliberately do not claim
- We do not claim caregivers install fixed relationship templates.
- We do not ask children to analyse attachment or family patterns.
- We do not claim one person determines how a child will love or trust later.
- We do not ask children to disclose confusing or harmful relationship experiences.
## Source trail
- Bowlby/Ainsworth child attachment research informs facilitator context only.
- Social-learning principles inform the observable-skill focus.$s21c_fn$,
  updated_at = now()
WHERE week_number = 21 AND audience = 'Child';

-- Week 22 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw22_theme$$cw22_theme$,
  the_territory        = $cw22_terr$What protects you, what it costs, and when it is still correct$cw22_terr$,
  opening_question     = $cw22_oq$When is guardedness sensible rather than a problem? Passing is full participation.$cw22_oq$,
  week_type            = $cw22_wt$Standard$cw22_wt$,
  reflective_question  = $cw22_rq$Across the week, where did your protective strategy fit the situation well, and where did it activate more broadly than you wanted?$cw22_rq$,
  interactive_activity = $cw22_ia$PROTECTION AUDIT. Write: strategy; what it protects now; what it costs now; where it is useful; where it may be overgeneralised; keep / adjust / test / not sure. Sharing is optional.$cw22_ia$,
  kids_picture_book    = $cw22_bk$Ruby Finds a Worry$cw22_bk$,
  kids_picture_book_author = $cw22_bka$Tom Percival$cw22_bka$,
  kids_picture_book_note = $cw22_bkn$WHY THIS BOOK: Use it to show that talking to a safe person can be one option when worry grows, not a rule that every private feeling must be spoken aloud.
READ-ALOUD: Read live from a purchased copy.$cw22_bkn$,
  kids_picture_book_question = $cw22_bkq$What choices did Ruby have? Could a child also draw, wait, ask for space or choose another trusted grown-up?$cw22_bkq$,
  kids_nz_alternative = $cw22_nz$Aroha's Way$cw22_nz$,
  kids_nz_alternative_author = $cw22_nza$Rebekah Lipp & Craig Phillips$cw22_nza$,
  kids_nz_alternative_note = $cw22_nzn$Use coping choices without implying every worry should be disclosed to the group.$cw22_nzn$,
  kids_colouring_prompt = $cw22_col$Colour a shield with three door signs: closed, help, choose.$cw22_col$,
  kids_game = $cw22_g$DOOR CHOICES. Use fixed scenarios and children hold up CLOSED / HELP / CHOOSE cards. No fortress-building around children and no cheering for knocking walls down.$cw22_g$,
  kids_game_equipment = $cw22_ge$Shield sheets; door-choice cards; crayons.$cw22_ge$,
  kids_game_under5 = $cw22_g5$Use two cards only: no/closed and grown-up help, with sharing always optional.$cw22_g5$,
  updated_at = now()
WHERE week_number = 22;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s22a_st$Updating the Security System$s22a_st$,
  theme_title            = $s22a_tt$$s22a_tt$,
  phase                  = 2,
  phase_name             = $s22a_pn$Unlearn$s22a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s22a_hk$Choose one protective strategy you recognise: humour, distance, over-preparing, control, privacy, intellectualising, agreeing quickly, something else. Mark useful / costly / both / not sure.$s22a_hk$,
  s5_source_core_concept = $s22a_cc$Today the adult room removes the assumption that armour must come down. A protective strategy may be appropriate, outdated, partly useful or necessary in one relationship and unnecessary in another. We evaluate current function and choice, not hidden origin.$s22a_cc$,
  core_concept           = $s22a_cco$$s22a_cco$,
  teaching_points        = $s22a_tp$1. Brené Brown's armour language is a qualitative framework and useful vocabulary, not a measured taxonomy of defensive mechanisms.
2. Clinical traditions describe many forms of defence and avoidance, but a non-clinical group cannot infer the original threat or protective function of one behaviour.
3. Vulnerability is context-dependent. Disclosure can deepen some relationships and create risk in others.
4. Privacy, professionalism, caution and boundaries can be healthy protective strategies.
5. A good outcome can be keep it, adjust it, use it selectively, not sure, or seek qualified support.$s22a_tp$,
  video_link             = $s22a_vl$https://www.youtube.com/watch?v=iCvmsMzlF7o$s22a_vl$,
  video_description      = $s22a_vd$Current assignment: Brené Brown on vulnerability. Retain pending review. Use as qualitative perspective, not evidence that vulnerability is the birthplace of all connection/courage or that defences create a measurable chronic stress state.$s22a_vd$,
  todays_theme           = $s22a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Professionalism, humour, privacy and distance can protect concentration, dignity or safety. The same strategy can also become expensive when it runs automatically in settings where a different response would work better.$s22a_tdt$,
  todays_world_vo_script = $s22a_tdv$Protection is not the problem. Automatic protection that no longer fits is the thing to examine.$s22a_tdv$,
  ancient_wisdom_reframe = $s22a_aw$Softness/yielding can be used as a Daoist cultural lens for flexibility, not as a claim that softness is always stronger or openness is morally superior to defence.$s22a_aw$,
  ancient_wisdom_vo_script = $s22a_awv$Flexibility includes being able to protect yourself and being able to relax protection when you choose.$s22a_awv$,
  signal_metaphor        = $s22a_sm$A firewall should block some traffic and allow some traffic. Turning it off completely is not security; the useful question is which rules fit the current network.$s22a_sm$,
  private_write_prompt   = $s22a_pw$Choose one manageable protective strategy and one current context where it appears. Do not write the original hurt or threat.$s22a_pw$,
  experiential_exercise  = $s22a_ex$PROTECTION AUDIT. Write: strategy; what it protects now; what it costs now; where it is useful; where it may be overgeneralised; keep / adjust / test / not sure. Sharing is optional.$s22a_ex$,
  guided_reflection      = $s22a_gr$Keep your eyes open.
Write:
The strategy:
What it does for me now:
What it costs, if anything:
My current choice: keep / adjust / test / not sure.
No lowering or disclosure is required.$s22a_gr$,
  journaling_prompt      = $s22a_jp$Across the week, where did your protective strategy fit the situation well, and where did it activate more broadly than you wanted?$s22a_jp$,
  intention_prompt       = $s22a_ip$Write one if-then plan only if useful: When [low-risk cue] appears, I will check whether [strategy] fits before using it automatically.$s22a_ip$,
  core_affirmation       = $s22a_ca$I can protect myself when protection fits and choose flexibility when it is safe and useful.$s22a_ca$,
  weekly_practice_mon    = $s22a_pm$Notice one protective strategy without changing it.$s22a_pm$,
  weekly_practice_wed    = $s22a_pw2$In one low-risk situation, decide deliberately whether to keep, adjust or not use it.$s22a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s22a_ps$Bring one observation about a protective strategy you noticed and whether keeping, changing or leaving it alone fit the situation. Sharing is optional.$s22a_ps$,
  previous_week_callback = $s22a_pwc$$s22a_pwc$,
  facilitator_notes      = $s22a_fn$## Aim
Replace vulnerability pressure with functional assessment and genuine choice.
## Run the room
Say aloud: Nobody is lowering anything today. We're looking at what is up and whether it still fits. No eyes-closed vulnerability imagery, origin stories or disclosure tasks. Facilitators never model personal vulnerability. Unsafe contexts stay protected.
## Why this week exists — the evidence
Avoidance and defensive strategies are widely recognised across psychological models, but specific origins and costs vary. Brown's qualitative work supplies accessible vocabulary rather than effect-size evidence.
Real-world anchor: a firewall that blocks every connection makes a computer unusable; one that blocks nothing is unsafe. Useful protection is selective and context-sensitive.
## Evidence quality
Moderate for broad avoidance/protection principles; illustrative for Brown's armour taxonomy.
## We deliberately do not claim
- We do not claim vulnerability is always the right choice or a strong predictor of life satisfaction.
- We do not claim defences maintain a constant stress response.
- We do not claim a protective strategy was necessarily built by past trauma.
- We do not require disclosure or lowering protection.
- We do not claim softness is always stronger than defence.
## Source trail
- Brown, B. — qualitative/synthesis work on vulnerability and armour; not treated as a universal mechanism.
- Avoidance/defence concepts appear across clinical traditions; Mindcast does not diagnose them.$s22a_fn$,
  updated_at = now()
WHERE week_number = 22 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s22t_st$Firewall Settings$s22t_st$,
  theme_title            = $s22t_tt$$s22t_tt$,
  phase                  = 2,
  phase_name             = $s22t_pn$Unlearn$s22t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s22t_hk$Think privately of one defence teens commonly use: joke, sarcasm, silence, don't care, avoid, agree, leave. No one has to choose their own.$s22t_hk$,
  s5_source_core_concept = $s22t_cc$Today the teen room looks at one protective response without asking why it began. We check what it protects, what it costs and whether it feels chosen. Nobody has to lower a defence or reveal something real to prove growth.$s22t_cc$,
  core_concept           = $s22t_cco$$s22t_cco$,
  teaching_points        = $s22t_tp$1. Protective behaviour can be adaptive, habitual or both.
2. Sarcasm, detachment, avoidance and perfectionism are examples, not a fixed list of teen defences.
3. Privacy is a legitimate boundary. You do not owe a group or friend full access to your feelings.
4. Vulnerability can be useful in some safe relationships and risky in others.
5. A valid outcome is keep, adjust, not sure, or ask a trusted adult for help.$s22t_tp$,
  video_link             = $s22t_vl$https://www.youtube.com/watch?v=iCvmsMzlF7o$s22t_vl$,
  video_description      = $s22t_vd$Current assignment: Brené Brown on vulnerability. Retain pending review. Do not use it to pressure disclosure or claim vulnerability universally predicts connection, courage or wellbeing.$s22t_vd$,
  todays_theme           = $s22t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Sarcasm, silence, detachment and humour can protect someone from embarrassment or conflict. Sometimes that is useful; sometimes it keeps running when the risk is low.$s22t_tdt$,
  todays_world_vo_script = $s22t_tdv$A defence is not automatically fake or unhealthy. Check whether it fits the situation.$s22t_tdv$,
  ancient_wisdom_reframe = $s22t_aw$Use a door rather than a wall: a door can be open, closed or partly open depending on who is there and what is happening. The person controls the door where safely possible.$s22t_aw$,
  ancient_wisdom_vo_script = $s22t_awv$Safety is not keeping every door open. It is knowing you are allowed to choose.$s22t_awv$,
  signal_metaphor        = $s22t_sm$A firewall blocks some traffic and allows other traffic. Turning it off is not the goal.$s22t_sm$,
  private_write_prompt   = $s22t_pw$Choose one low-risk defence or use a made-up example. Write the context where it appears. Keep it private.$s22t_pw$,
  experiential_exercise  = $s22t_ex$FIREWALL AUDIT. Write: defence; what it helps; what it costs; where it feels chosen; keep / adjust / not sure. Do not write the original hurt. Sharing is optional.$s22t_ex$,
  guided_reflection      = $s22t_gr$Keep your eyes open.
Write:
The defence:
It helps when:
It costs when:
My choice now: keep / adjust / not sure.
No disclosure is required.$s22t_gr$,
  journaling_prompt      = $s22t_jp$During the week, where did a defence genuinely protect you and where did it run automatically when you might have preferred another response?$s22t_jp$,
  intention_prompt       = $s22t_ip$If useful: When [low-risk cue] appears, I will check whether [defence] fits before using it automatically.$s22t_ip$,
  core_affirmation       = $s22t_ca$I can protect myself and decide when openness is safe, useful or not wanted.$s22t_ca$,
  weekly_practice_mon    = $s22t_pm$Notice one defence without changing it.$s22t_pm$,
  weekly_practice_wed    = $s22t_pw2$In one safe low-risk situation, deliberately choose whether to keep or adjust it.$s22t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s22t_ps$Bring one observation about a defence you noticed and whether it helped, cost something or was best left alone. Sharing details is optional.$s22t_ps$,
  previous_week_callback = $s22t_pwc$$s22t_pwc$,
  facilitator_notes      = $s22t_fn$## Aim
Protect privacy and safety while building choice around automatic defences.
## Run the room
Say aloud that nobody is lowering anything. No eyes-closed relationship recall, no let something real show, and no asking what a defence protects from. If safety concerns emerge, follow MC-SAF-001.
## Why this week exists — the evidence
Protective and avoidant behaviours are recognised across psychological models, while the value of disclosure depends strongly on context and safety.
Real-world anchor: privacy settings exist because not every audience needs the same access. Human boundaries are also allowed to vary by context.
## Evidence quality
Moderate for broad protection/avoidance principles; illustrative for armour/firewall language.
## We deliberately do not claim
- We do not claim vulnerability is required for genuine connection.
- We do not claim defences are installed by a brain threat system or past hurt in every case.
- We do not claim being appropriately vulnerable is one of the strongest predictors of wellbeing.
- We do not require teens to disclose or lower a defence.
## Source trail
- Brown, B. — qualitative/synthesis vulnerability work, used cautiously.
- General avoidance/protective-behaviour literature informs function-over-label framing.$s22t_fn$,
  updated_at = now()
WHERE week_number = 22 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s22c_st$The Shield With a Door$s22c_st$,
  theme_title            = $s22c_tt$$s22c_tt$,
  phase                  = 2,
  phase_name             = $s22c_pn$Unlearn$s22c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s22c_hk$Show a toy shield with three symbols: CLOSED / ASK A GROWN-UP / OPEN IF I WANT. Explain that a good shield does not have to come down.$s22c_hk$,
  s5_source_core_concept = $s22c_cc$Today the child room learns that protection and privacy can be good. A child can keep a door closed, ask a trusted grown-up for help, or open it a little when they want and feel safe. Nobody has to show what is behind their shield.$s22c_cc$,
  core_concept           = $s22c_cco$$s22c_cco$,
  teaching_points        = $s22c_tp$1. Children are allowed privacy and boundaries.
2. A shield can help in a situation that feels unsafe or too much.
3. A shield does not always need to come down for friendship or connection to be real.
4. If a child is unsure whether something is safe, asking a trusted grown-up is the right move.
5. Nobody in Mindcast gets to ask for a secret, a hidden feeling or proof of trust.$s22c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s22c_sm$A shield with a door can stay closed, open a little, or ask a trusted grown-up to help with the door. The child never has to knock the shield down.$s22c_sm$,
  private_write_prompt   = $s22c_pw$Choose one safe example and draw which door choice fits. You may tell someone or keep the drawing private.$s22c_pw$,
  experiential_exercise  = $s22c_ex$SHIELD WITH CHOICES. Children draw a shield with three door signs: closed / ask a grown-up / open if I choose. Around it draw safe general examples such as personal space, joining a game, telling a joke, sharing a drawing. Do not draw what the shield protects from.
DRAW IT
Draw your shield somewhere safe and add a trusted grown-up nearby for times when you are unsure.$s22c_ex$,
  guided_reflection      = $s22c_gr$Keep your eyes open.
Look at the three choices and ask:
Do I want this private?
Do I want help deciding?
Do I want to share?
All three can be good answers.$s22c_gr$,
  journaling_prompt      = $s22c_jp$Draw your shield somewhere safe and add a trusted grown-up nearby for times when you are unsure.$s22c_jp$,
  intention_prompt       = $s22c_ip$Choose one plan: When I am not sure whether to share or open up, I will ask a trusted grown-up or keep it private until I decide.$s22c_ip$,
  core_affirmation       = $s22c_ca$I am allowed privacy, boundaries and help deciding who gets access to me.$s22c_ca$,
  weekly_practice_mon    = $s22c_pm$Notice one small boundary or privacy choice you make.$s22c_pm$,
  weekly_practice_wed    = $s22c_pw2$Practise saying no thank you, not now or can you help me decide? with a trusted grown-up.$s22c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s22c_ps$Bring your shield drawing back and add one example of when a door should stay closed, open or ask a grown-up. Sharing is optional.$s22c_ps$,
  previous_week_callback = $s22c_pwc$$s22c_pwc$,
  facilitator_notes      = $s22c_fn$## Aim
Teach boundaries without vulnerability pressure, secrecy or disclosure prompts.
## Run the room
No what does your shield protect you from?, no closed-eye hurt recall, no who deserves to see behind it, no secrets as evidence of trust and no wall-knockdown game. If a child indicates harm, follow MC-SAF-001.
## Why this week exists — the evidence
Children need age-appropriate boundaries, consent and safe help-seeking. Protective behaviour is not inherently a problem, and disclosure must remain voluntary.
Real-world anchor: a bedroom door, bathroom door or device privacy setting can appropriately limit access without meaning the person does not love or trust anyone.
## Evidence quality
Moderate for autonomy/consent principles; illustrative for shield language.
## We deliberately do not claim
- We do not claim walls always keep out good things.
- We do not claim children should lower defences to build connection.
- We do not ask children to reveal hidden feelings or secrets.
- We do not claim a shield exists because of past hurt.
## Source trail
- Child autonomy/consent and safeguarding principles.$s22c_fn$,
  updated_at = now()
WHERE week_number = 22 AND audience = 'Child';

-- Week 23 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw23_theme$$cw23_theme$,
  the_territory        = $cw23_terr$Making room for loss without prescribing how grief should work$cw23_terr$,
  opening_question     = $cw23_oq$What makes support useful when somebody is grieving without trying to make them finish? Passing is full participation.$cw23_oq$,
  week_type            = $cw23_wt$Standard$cw23_wt$,
  reflective_question  = $cw23_rq$Across the week, what made an ending easier or harder to carry, and what support or space did you actually want rather than what you thought grief was supposed to look like?$cw23_rq$,
  interactive_activity = $cw23_ia$LOSS / SUPPORT / NOW. Three boxes: what ended; what matters about it now; what support, boundary or practical adaptation is useful now. A fourth optional box is meaning, if any. Leave it blank freely. No sharing required.$cw23_ia$,
  kids_picture_book    = $cw23_bk$The Memory Tree$cw23_bk$,
  kids_picture_book_author = $cw23_bka$Britta Teckentrup$cw23_bka$,
  kids_picture_book_note = $cw23_bkn$WHY THIS BOOK: Use it as one possible story about remembering after death, not as a rule that memories grow into something positive.
READ-ALOUD: Read live from a purchased copy.$cw23_bkn$,
  kids_picture_book_question = $cw23_bkq$Did every animal have to feel the same thing at the same time?$cw23_bkq$,
  kids_nz_alternative = $cw23_nz$Finding Monkey Moon$cw23_nz$,
  kids_nz_alternative_author = $cw23_nza$Elizabeth Pulford, illustrated by Kate Wilkinson$cw23_nza$,
  kids_nz_alternative_note = $cw23_nzn$Use for a gentle experience of loss/search without promising that every loss is restored or creates growth.$cw23_nzn$,
  kids_colouring_prompt = $cw23_col$Colour four seasons in any order and add a question mark to show feelings do not follow a fixed map.$cw23_col$,
  kids_game = $cw23_g$WEATHER MIX. Facilitator shows weather cards in random order; children choose a movement or stay seated. Explain that feelings can also arrive in no fixed order. No leaves with real losses, no dropping/releasing ritual.$cw23_g$,
  kids_game_equipment = $cw23_ge$Season sheets; weather cards; crayons.$cw23_ge$,
  kids_game_under5 = $cw23_g5$Use only weather faces and the idea feelings can change.$cw23_g5$,
  updated_at = now()
WHERE week_number = 23;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s23a_st$Completing the Close$s23a_st$,
  theme_title            = $s23a_tt$$s23a_tt$,
  phase                  = 2,
  phase_name             = $s23a_pn$Unlearn$s23a_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s23a_hk$Say first: You do not need to work on a recent or major bereavement today. You may use a small ending, write generally, listen, or opt out. Nobody will ask why.$s23a_hk$,
  s5_source_core_concept = $s23a_cc$Today the adult room removes the idea that grief has a correct path. Some losses remain painful, some become less central, some acquire meaning and some do not. The task is to notice what support, acknowledgment or practical adaptation is useful now.$s23a_cc$,
  core_concept           = $s23a_cco$$s23a_cco$,
  teaching_points        = $s23a_tp$1. Kübler-Ross described reactions among people facing their own deaths; the popular five stages of grief are not an evidence-based sequence for bereavement.
2. Grief varies substantially by person, relationship, culture and time. There is no required order or endpoint.
3. David Kessler's meaning is a writer/clinician's extension, not a scientifically established sixth stage.
4. Post-traumatic growth is reported by some people, but much evidence relies on retrospective self-report and does not mean loss reliably makes people stronger.
5. Prolonged grief disorder is a clinical diagnosis with specific criteria. Mindcast does not diagnose grief or tell someone they are stuck because they continue to miss what was lost.$s23a_tp$,
  video_link             = $s23a_vl$https://www.youtube.com/watch?v=khkJkR-ipfw$s23a_vl$,
  video_description      = $s23a_vd$Current assignment: David Kessler on meaning. Retain pending review. If shown, frame meaning-making as one possible response and explicitly reject a sixth-stage model.$s23a_vd$,
  todays_theme           = $s23a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Grief advice often arrives as a timetable or sequence. Week 23 does the opposite: acknowledge the loss, check what support is useful, and do not demand progress or meaning.$s23a_tdt$,
  todays_world_vo_script = $s23a_tdv$There is no correct stage to be in and no lesson you owe anyone.$s23a_tdv$,
  ancient_wisdom_reframe = $s23a_aw$Mourning rituals vary enormously across cultures. Use that diversity to show there is no single correct container for loss; do not create a Mindcast ritual or ceremony.$s23a_aw$,
  ancient_wisdom_vo_script = $s23a_awv$Communities have many ways to mark loss. None gives a universal timetable for grief.$s23a_awv$,
  signal_metaphor        = $s23a_sm$Weather changes unpredictably after a front passes. A forecast can describe conditions without ordering them into stages.$s23a_sm$,
  private_write_prompt   = $s23a_pw$If you choose, write one manageable ending and one thing you miss, value or notice about it now. You may instead write not working on a loss today.$s23a_pw$,
  experiential_exercise  = $s23a_ex$LOSS / SUPPORT / NOW. Three boxes: what ended; what matters about it now; what support, boundary or practical adaptation is useful now. A fourth optional box is meaning, if any. Leave it blank freely. No sharing required.$s23a_ex$,
  guided_reflection      = $s23a_gr$Keep your eyes open.
Write:
What I know about this loss now:
What I need or do not need from other people:
What I am allowed not to solve:
Meaning, if any:
Blank is a complete answer.$s23a_gr$,
  journaling_prompt      = $s23a_jp$Across the week, what made an ending easier or harder to carry, and what support or space did you actually want rather than what you thought grief was supposed to look like?$s23a_jp$,
  intention_prompt       = $s23a_ip$If you choose: When grief or an ending shows up, I will [name what I need / contact someone / take space / do nothing specific]. No practice is also valid.$s23a_ip$,
  core_affirmation       = $s23a_ca$I do not owe grief a timetable, a stage or a lesson; I can respond to what is actually here.$s23a_ca$,
  weekly_practice_mon    = $s23a_pm$Notice one grief-related feeling without ranking where it belongs.$s23a_pm$,
  weekly_practice_wed    = $s23a_pw2$If useful, ask one safe person for the kind of support you actually want; otherwise no task is required.$s23a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s23a_ps$Bring one observation about what support or space helped with an ending this week, or choose not to work on one. Sharing is optional.$s23a_ps$,
  previous_week_callback = $s23a_pwc$$s23a_pwc$,
  facilitator_notes      = $s23a_fn$## Aim
Correct grief myths and protect participants from guided processing or growth pressure.
## Run the room
No eyes-closed loss recall, goodbye letters, public witness, ceremony, compulsory grief moment or what did the loss make possible? Anyone recently bereaved can opt out without explanation. Provide referral resources.
## Why this week exists — the evidence
The stages-of-grief story is one of the clearest examples of a framework escaping its original context. Kübler-Ross wrote about people facing death, not a universal sequence for bereavement. Contemporary grief research emphasises variability rather than stages.
Real-world anchor: someone can feel relatively steady one day and intensely sad months later without moving backward through a stage model. Variability is ordinary.
## Evidence quality
Strong that grief is not a fixed five-stage sequence; moderate for specific intervention claims. Post-traumatic-growth evidence is limited by self-report and interpretation.
## We deliberately do not claim
- We do not claim grief has stages, an order or an end.
- We do not claim loss makes people stronger or contains a lesson.
- We do not claim suppressed grief inevitably becomes depression, numbing or physical symptoms.
- We do not claim meaning-making is required or a sixth stage.
- We do not diagnose prolonged grief.
## Source trail
- Kübler-Ross, E. (1969). On Death and Dying — original context was dying patients.
- Contemporary bereavement research rejects a universal stage sequence.
- Post-traumatic growth literature treated cautiously as largely self-report.$s23a_fn$,
  updated_at = now()
WHERE week_number = 23 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s23t_st$What Deserved a Ceremony$s23t_st$,
  theme_title            = $s23t_tt$$s23t_tt$,
  phase                  = 2,
  phase_name             = $s23t_pn$Unlearn$s23t_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s23t_hk$Say first: If something ended recently or feels too big, you can use a fictional or small example, listen, or sit this one out. Nobody will ask why.$s23t_hk$,
  s5_source_core_concept = $s23t_cc$Today the teen room treats grief and endings as variable human responses, not stages to complete. You may want company, privacy, practical help, distraction, memory or nothing from this session. No ending needs a ceremony here.$s23t_cc$,
  core_concept           = $s23t_cco$$s23t_cco$,
  teaching_points        = $s23t_tp$1. The popular five stages came from work with people facing their own death, not a scientific sequence for bereaved people.
2. Grief can change over time without moving in order, and feeling fine is not denial by definition.
3. Post-traumatic growth is something some people report; it is not a promise that loss makes people stronger.
4. Talking can help some people and be unwanted or badly timed for others. Disclosure is never required.
5. If grief becomes overwhelming or functioning is seriously affected, qualified support is appropriate; Mindcast does not diagnose or treat grief.$s23t_tp$,
  video_link             = $s23t_vl$https://www.youtube.com/watch?v=khkJkR-ipfw$s23t_vl$,
  video_description      = $s23t_vd$Current assignment: David Kessler / meaning after grief. Retain pending review. If used, say meaning is optional and sixth stage is not an evidence-based stage model.$s23t_vd$,
  todays_theme           = $s23t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Friendships change, pets die, families change, teams end and futures do not happen as imagined. None of those losses comes with a correct timeline or a requirement to become stronger.$s23t_tdt$,
  todays_world_vo_script = $s23t_tdv$A loss can matter without becoming a lesson or a transformation story.$s23t_tdv$,
  ancient_wisdom_reframe = $s23t_aw$Cultures mark endings in many ways. Treat that diversity as evidence that one ceremony or emotional script cannot be universal. Do not create a ritual in the room.$s23t_aw$,
  ancient_wisdom_vo_script = $s23t_awv$People have many ways of marking endings, including choosing not to mark them publicly.$s23t_awv$,
  signal_metaphor        = $s23t_sm$A playlist on shuffle can bring an old song back unexpectedly. That does not mean you have returned to the start.$s23t_sm$,
  private_write_prompt   = $s23t_pw$If you choose, write one manageable ending and one thing about it you still notice. You may write not today instead.$s23t_pw$,
  experiential_exercise  = $s23t_ex$ENDING CHECK. Write: what ended; what I miss or do not miss; what I need from others; what I do not want; meaning if any. The meaning box is optional. No sharing required.$s23t_ex$,
  guided_reflection      = $s23t_gr$Keep your eyes open.
Write:
What I feel or do not feel:
What support I want, if any:
What I do not need to force:
Meaning, if any:
Blank is complete.$s23t_gr$,
  journaling_prompt      = $s23t_jp$During the week, what did you notice about how endings actually showed up for you compared with the way people say grief is supposed to work?$s23t_jp$,
  intention_prompt       = $s23t_ip$If useful: When an ending or grief feeling shows up, I will [ask for company / take space / do a normal activity / contact a trusted adult / another safe choice].$s23t_ip$,
  core_affirmation       = $s23t_ca$I do not have to grieve in the right order or turn an ending into a lesson.$s23t_ca$,
  weekly_practice_mon    = $s23t_pm$Notice one feeling about an ending without putting it into a stage.$s23t_pm$,
  weekly_practice_wed    = $s23t_pw2$If useful, ask a trusted person for the type of support you want. No disclosure task is required.$s23t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s23t_ps$Bring one observation about what support or space helped with an ending this week, or choose not to work on one. Sharing is optional.$s23t_ps$,
  previous_week_callback = $s23t_pwc$$s23t_pwc$,
  facilitator_notes      = $s23t_fn$## Aim
Correct grief myths and remove ritual, disclosure and growth pressure from a heavy youth session.
## Run the room
No ceremony despite the legacy page title, no goodbye letter, no eyes-closed recall, no tell one person, no meaning demand. Recent/major grief can be skipped. If grief or safety concerns exceed scope, follow referral/safeguarding procedures.
## Why this week exists — the evidence
The five-stage model is routinely misapplied beyond its original dying-patient context. Contemporary grief research supports variability rather than a fixed sequence.
Real-world anchor: feeling sad again after a birthday, song or anniversary does not mean someone has moved backward through grief stages; memories and context can reactivate feelings irregularly.
## Evidence quality
Strong against a universal stage model; moderate for specific coping recommendations. PTG is largely self-report and should not be promised.
## We deliberately do not claim
- We do not claim grief has stages or a correct process.
- We do not claim suppressed grief necessarily emerges as depression, anger or numbness.
- We do not claim loss generates meaning or growth.
- We do not require talking, witnessing, goodbye letters or ceremony.
## Source trail
- Kübler-Ross original dying-patient context.
- Contemporary bereavement research on variability.$s23t_fn$,
  updated_at = now()
WHERE week_number = 23 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s23c_st$The Autumn Before Spring$s23c_st$,
  theme_title            = $s23c_tt$$s23c_tt$,
  phase                  = 2,
  phase_name             = $s23c_pn$Unlearn$s23c_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s23c_hk$Say first: If something ended recently or feels too big, you can draw only weather or seasons, listen, or do another quiet activity with a grown-up. Nobody will ask why.$s23c_hk$,
  s5_source_core_concept = $s23c_cc$Today the child room learns that endings can bring lots of feelings and those feelings do not have to arrive in order. A child may feel sad, fine, angry, relieved, confused or not much at all. Nobody has to make something new grow from a loss.$s23c_cc$,
  core_concept           = $s23c_cco$$s23c_cco$,
  teaching_points        = $s23c_tp$1. Missing someone or something after an ending is normal, and not missing it all the time is normal too.
2. Grief does not move through five stages or a correct order.
3. Feelings can return after a long time without meaning a child is going backward.
4. Talking is one option; drawing, being with a trusted grown-up, playing or having privacy can also be okay.
5. Some endings are just sad. Children do not have to find a lesson or say something good came from them.$s23c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s23c_sm$Seasons change, but not on a feelings calendar. A rainy day can appear in summer and a sunny day can appear in winter. Feelings after an ending can be mixed and surprising too.$s23c_sm$,
  private_write_prompt   = $s23c_pw$Draw one kind of support that can help a child on a hard-feeling day: trusted grown-up, quiet, play, drawing, routine, something else. You may tell someone or keep it private.$s23c_pw$,
  experiential_exercise  = $s23c_ex$FEELINGS SEASONS. Children colour four season boxes with any feelings they choose or leave boxes blank. They do not write what ended. Make clear the boxes are not stages and do not have to happen in order.
DRAW IT
Draw two days that feel different after an ending — or draw two made-up weather days if you do not want to use a real ending.$s23c_ex$,
  guided_reflection      = $s23c_gr$Keep your eyes open and look at the seasons.
Ask:
Do feelings have to come in this order? No.
Do I have to feel sad all the time? No.
Do I have to find something good in an ending? No.
Who could help if feelings are too big?$s23c_gr$,
  journaling_prompt      = $s23c_jp$Draw two days that feel different after an ending — or draw two made-up weather days if you do not want to use a real ending.$s23c_jp$,
  intention_prompt       = $s23c_ip$Choose one plan: When an ending feeling feels too big, I will tell or show a trusted grown-up what support I want.$s23c_ip$,
  core_affirmation       = $s23c_ca$My feelings after an ending do not have to follow an order, and I do not have to find a lesson in something sad.$s23c_ca$,
  weekly_practice_mon    = $s23c_pm$If an ending feeling appears, notice it without trying to put it in an order.$s23c_pm$,
  weekly_practice_wed    = $s23c_pw2$If you want support, show or tell a trusted grown-up what would help.$s23c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s23c_ps$Bring your seasons drawing back if you want and add one thing you noticed about feelings changing or staying the same. Sharing is optional.$s23c_ps$,
  previous_week_callback = $s23c_pwc$$s23c_pwc$,
  facilitator_notes      = $s23c_fn$## Aim
Teach grief variability without disclosure, stage myths, release rituals or forced growth.
## Run the room
Advance caregiver notice is mandatory and opt-out is explicit. Recently bereaved children attend only where caregivers actively choose. No what have you lost, no real-loss leaves, no goodbye ritual, no spring-growth requirement and no promise that sadness moves through if expressed. Follow MC-SAF-001 for serious disclosures.
## Why this week exists — the evidence
The popular stages model came from descriptions of people facing death, not a universal child-bereavement sequence. Contemporary grief understanding emphasises wide variation.
Real-world anchor: a child may enjoy school and then feel sad at bedtime about a pet months after the death. Both moments can be ordinary and neither proves grief is being done wrong.
## Evidence quality
Strong against universal stages; moderate for broad support principles. This seasons activity is a teaching metaphor, not grief treatment.
## We deliberately do not claim
- We do not claim sadness must be expressed to move through.
- We do not claim something new always comes from loss.
- We do not claim grief has stages, an order or a finish date.
- We do not ask children to disclose what they lost.
- We do not claim loss makes children stronger.
## Source trail
- Kübler-Ross original context: people facing death, not universal bereavement stages.
- Contemporary child-bereavement understanding emphasises variation and caregiver support.$s23c_fn$,
  updated_at = now()
WHERE week_number = 23 AND audience = 'Child';

-- Week 24 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw24_theme$$cw24_theme$,
  the_territory        = $cw24_terr$What fear predicts, what actually happens, and when the alarm deserves respect$cw24_terr$,
  opening_question     = $cw24_oq$What information helps you decide whether a fear is warning about danger or predicting discomfort/uncertainty? Passing is full participation.$cw24_oq$,
  week_type            = $cw24_wt$Standard$cw24_wt$,
  reflective_question  = $cw24_rq$Across the week, where did fear predict accurately, where did it overpredict, and what evidence helped you tell the difference?$cw24_rq$,
  interactive_activity = $cw24_ia$PREDICTION / REALITY PLAN. Write: safe situation; prediction; predicted likelihood/intensity; smallest voluntary test; safety stop; actual outcome later. Do not test the largest fear in the room. Sharing is optional.$cw24_ia$,
  kids_picture_book    = $cw24_bk$Jabari Jumps$cw24_bk$,
  kids_picture_book_author = $cw24_bka$Gaia Cornwall$cw24_bka$,
  kids_picture_book_note = $cw24_bkn$WHY THIS BOOK: Jabari feels nervous about a supervised diving-board jump and chooses his timing with a supportive caregiver. Use it as one example of safe nerves, not a rule to face every fear.
READ-ALOUD: Read live from a purchased copy.$cw24_bkn$,
  kids_picture_book_question = $cw24_bkq$What made Jabari's situation safe enough to choose? What could he have done if he did not want to jump?$cw24_bkq$,
  kids_nz_alternative = $cw24_nz$Lucy and the Dark$cw24_nz$,
  kids_nz_alternative_author = $cw24_nza$Melinda Szymanik, illustrated by Vasanti Unka$cw24_nza$,
  kids_nz_alternative_note = $cw24_nzn$Use only for a supported, safe fear; do not imply children should confront unknown danger.$cw24_nzn$,
  kids_colouring_prompt = $cw24_col$Colour a smoke alarm with three arrows: danger, safe choice, grown-up help.$cw24_col$,
  kids_game = $cw24_g$CHECK THE CARD. Use a gentle chime and reveal fixed scenario cards. Children point to one of the three choices. No random loud alarms, no personal fear disclosure and no courage competition.$cw24_g$,
  kids_game_equipment = $cw24_ge$Three category cards; scenario cards; crayons.$cw24_ge$,
  kids_game_under5 = $cw24_g5$Use only STOP/GET GROWN-UP and SAFE WITH GROWN-UP examples.$cw24_g5$,
  updated_at = now()
WHERE week_number = 24;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s24a_st$Calibrating the Threat Sensor$s24a_st$,
  theme_title            = $s24a_tt$$s24a_tt$,
  phase                  = 2,
  phase_name             = $s24a_pn$Unlearn$s24a_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s24a_hk$Say first: This lesson is not an instruction to approach danger. If a situation involves abuse, unsafe driving, physical risk, coercion, serious financial risk or another genuine hazard, fear may be doing its job. Choose only a low-risk example.$s24a_hk$,
  s5_source_core_concept = $s24a_cc$Today the adult room practises fear calibration rather than fear conquest. We identify a safe, low-risk prediction, write what we think will happen and compare it with actual experience. We do not treat a body alarm as proof of danger or proof that danger is absent.$s24a_cc$,
  core_concept           = $s24a_cco$$s24a_cco$,
  teaching_points        = $s24a_tp$1. Fear and anxiety involve distributed brain/body systems; the amygdala can't tell the difference and amygdala hijack are oversimplifications and are not used as mechanisms.
2. People can overestimate the likelihood, intensity or duration of negative outcomes, especially under uncertainty. Predictions can be tested where the situation is genuinely safe.
3. Exposure-based treatments support gradual, repeated, voluntary contact with feared cues in clinical contexts. That does not mean avoidance always makes fear bigger or that self-directed exposure is appropriate for every fear.
4. The window of tolerance is a popular clinical metaphor, not a settled biological measurement, and the lesson does not need it.
5. Courage is not moving toward every fear. Sometimes the correct response is leaving, getting support, declining or reducing risk.$s24a_tp$,
  video_link             = $s24a_vl$https://www.youtube.com/watch?v=RcGyVTAoXEU$s24a_vl$,
  video_description      = $s24a_vd$Current assignment requires review. Do not use clips built around amygdala-hijack, nervous-system rewiring or feel the fear and do it anyway as a universal rule.$s24a_vd$,
  todays_theme           = $s24a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Sending a draft, speaking in a meeting or trying a new class can produce strong predictions about embarrassment or failure. Those predictions can be compared with what actually happens when the situation is safe enough to test.$s24a_tdt$,
  todays_world_vo_script = $s24a_tdv$Fear predicts. Experience supplies more data. Safety determines whether testing is appropriate.$s24a_tdv$,
  ancient_wisdom_reframe = $s24a_aw$Do not use fasting, cold exposure, death meditation or ritual endurance as evidence or recommended practice. Philosophical traditions can be mentioned only for the broad idea of acting under uncertainty.$s24a_aw$,
  ancient_wisdom_vo_script = $s24a_awv$Acting under uncertainty can be practised without manufacturing danger.$s24a_awv$,
  signal_metaphor        = $s24a_sm$A smoke alarm reports possible smoke; sometimes it is toast and sometimes it is fire. The lesson is to check context, not assume every alarm is false.$s24a_sm$,
  private_write_prompt   = $s24a_pw$Choose one genuinely low-risk fear prediction. Write what I predict will happen and what would make this unsafe to test.$s24a_pw$,
  experiential_exercise  = $s24a_ex$PREDICTION / REALITY PLAN. Write: safe situation; prediction; predicted likelihood/intensity; smallest voluntary test; safety stop; actual outcome later. Do not test the largest fear in the room. Sharing is optional.$s24a_ex$,
  guided_reflection      = $s24a_gr$Keep your eyes open.
Write:
The prediction:
Evidence of real danger, if any:
Why this is safe enough to test — or why it is not:
The smallest test:
If safety is uncertain, the answer is do not test here.$s24a_gr$,
  journaling_prompt      = $s24a_jp$Across the week, where did fear predict accurately, where did it overpredict, and what evidence helped you tell the difference?$s24a_jp$,
  intention_prompt       = $s24a_ip$If safe: When [specific low-risk cue] appears, I will take [small voluntary step] and record prediction versus outcome. Otherwise choose no exposure practice.$s24a_ip$,
  core_affirmation       = $s24a_ca$I can check fear against context and evidence without ignoring genuine danger or forcing myself toward risk.$s24a_ca$,
  weekly_practice_mon    = $s24a_pm$Write one low-risk fear prediction without acting on it yet.$s24a_pm$,
  weekly_practice_wed    = $s24a_pw2$If clearly safe, test one small prediction voluntarily and record the actual outcome.$s24a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s24a_ps$Bring one comparison between a fear prediction and what actually happened in one safe low-risk situation. Sharing is optional.$s24a_ps$,
  previous_week_callback = $s24a_pwc$$s24a_pwc$,
  facilitator_notes      = $s24a_fn$## Aim
Teach prediction calibration without pseudo-neuroscience, self-directed high-risk exposure or courage pressure.
## Run the room
Deliver the safety carve-out first. No eyes-closed fear recall, no body-flooding, no group accountability partner who calls avoidance out, and no telling members discomfort is safe merely because it is social. Exposure therapy is clinical context, not the service being delivered.
## Why this week exists — the evidence
Anxiety research supports biased threat prediction and exposure-based learning in appropriate contexts. The most useful non-clinical translation is a safe prediction-versus-outcome check, not an amygdala story.
Real-world anchor: someone may predict a short presentation will produce ten minutes of visible humiliation; afterwards they can compare the prediction with observable events. A genuine unsafe situation is not placed in the experiment.
## Evidence quality
Strong for exposure-based treatment in relevant anxiety disorders; moderate for general prediction-calibration exercises outside treatment.
## We deliberately do not claim
- We do not claim the amygdala cannot distinguish social from physical threat.
- We do not use amygdala hijack, window-of-tolerance or rewiring as settled mechanisms.
- We do not claim avoidance always increases fear or approach always decreases it.
- We do not claim fear is usually irrational.
- We do not equate courage with approaching risk.
## Source trail
- Exposure-based anxiety-treatment literature; clinical context distinguished from Mindcast.
- Affective-forecasting/threat-estimation research informs prediction checking.$s24a_fn$,
  updated_at = now()
WHERE week_number = 24 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s24t_st$Updating the Alarm System$s24t_st$,
  theme_title            = $s24t_tt$$s24t_tt$,
  phase                  = 2,
  phase_name             = $s24t_pn$Unlearn$s24t_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s24t_hk$Say first: This lesson never means walking toward unsafe people, places or risks. If safety is uncertain, tell a trusted adult rather than testing the fear. Choose only a small safe example.$s24t_hk$,
  s5_source_core_concept = $s24t_cc$Today the teen room practises safe fear calibration. We write what fear predicts, check for actual danger, and if the situation is low-risk and voluntary, test one small step. Nobody is pushed toward a fear or told discomfort cannot hurt.$s24t_cc$,
  core_concept           = $s24t_cco$$s24t_cco$,
  teaching_points        = $s24t_tp$1. Fear is not one brain alarm and the amygdala can't tell the difference is too simple.
2. People sometimes overpredict embarrassment, rejection or how long a bad outcome will feel.
3. Exposure therapy has strong clinical evidence for some anxiety problems, but that does not mean every teen should self-expose to fears.
4. Avoidance can maintain some fears; it can also be sensible when a situation is unsafe or not worth the risk.
5. If a fear involves harm, coercion, unsafe peers, substances, risky stunts or another real danger, tell a trusted adult and do not use it as practice.$s24t_tp$,
  video_link             = $s24t_vl$https://www.youtube.com/watch?v=ZizdB0TgAVM$s24t_vl$,
  video_description      = $s24t_vd$Current assignment requires review. Do not use content built on amygdala hijack, literal brain rewiring or avoidance always makes fear bigger.$s24t_vd$,
  todays_theme           = $s24t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Speaking in class, trying out for something or sending a message can create predictions that feel certain. When the situation is genuinely safe, prediction and reality can be compared.$s24t_tdt$,
  todays_world_vo_script = $s24t_tdv$Fear makes a prediction. Safety comes first; experience can test the prediction only when the situation is safe enough.$s24t_tdv$,
  ancient_wisdom_reframe = $s24t_aw$Use small brave steps only as a general cultural idea; do not use samurai death meditation, cold exposure or ritual endurance with teens.$s24t_aw$,
  ancient_wisdom_vo_script = $s24t_awv$Bravery includes knowing when to step forward and when to get help or leave.$s24t_awv$,
  signal_metaphor        = $s24t_sm$A smoke alarm can be right or over-sensitive. You check for fire before deciding it is only toast.$s24t_sm$,
  private_write_prompt   = $s24t_pw$Choose one small safe fear prediction and write what you expect will happen. Also write one reason it is safe enough to test — or not safe to test.$s24t_pw$,
  experiential_exercise  = $s24t_ex$PREDICTION / REALITY. Write: situation; prediction; evidence of safety; smallest voluntary step; stop rule; actual outcome later. No sharing of the fear itself is required.$s24t_ex$,
  guided_reflection      = $s24t_gr$Keep your eyes open.
Write:
Fear predicts:
The real safety facts are:
The smallest safe test is:
My stop rule is:
If you are not sure it is safe, do not test it.$s24t_gr$,
  journaling_prompt      = $s24t_jp$During the week, where was fear accurate, where did it overpredict, and what helped you check instead of automatically believing or dismissing it?$s24t_jp$,
  intention_prompt       = $s24t_ip$If safe: When [specific low-risk cue] appears, I will take [small voluntary step] and record what actually happened.$s24t_ip$,
  core_affirmation       = $s24t_ca$I can listen to fear, check the facts and choose safety before deciding whether to test a prediction.$s24t_ca$,
  weekly_practice_mon    = $s24t_pm$Write one prediction about a small safe fear.$s24t_pm$,
  weekly_practice_wed    = $s24t_pw2$Test it only if the situation is clearly safe and voluntary.$s24t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s24t_ps$Bring one safe example where you compared a fear prediction with what actually happened. Sharing details is optional.$s24t_ps$,
  previous_week_callback = $s24t_pwc$$s24t_pwc$,
  facilitator_notes      = $s24t_fn$## Aim
Teach fear-prediction checking without amateur exposure therapy or brain myths.
## Run the room
No eyes-closed fear recall, no pushing a teen to approach, no accountability partner and no none of these will kill me script. Safety uncertainty goes to trusted-adult support and MC-SAF-001 where needed.
## Why this week exists — the evidence
Exposure-based treatment and threat-estimation research support learning from safe prediction-versus-outcome experiences. Mindcast uses only the lowest-risk planning principle, not treatment.
Real-world anchor: a teen can predict that asking one classroom question will lead to everyone laughing, then compare the prediction with what actually happened if they voluntarily choose to ask.
## Evidence quality
Strong for exposure treatment in clinical contexts; moderate for generalised safe prediction checking.
## We deliberately do not claim
- We do not claim social fear uses the same brain response as physical danger in one simple way.
- We do not use amygdala hijack or rewiring language.
- We do not claim avoidance always worsens fear or approach always reduces it.
- We do not tell teens to push through genuine danger.
## Source trail
- Exposure-based anxiety-treatment literature.
- Threat-estimation/affective-forecasting research.$s24t_fn$,
  updated_at = now()
WHERE week_number = 24 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s24c_st$The Toast Alarm vs. The Real Fire$s24c_st$,
  theme_title            = $s24c_tt$$s24c_tt$,
  phase                  = 2,
  phase_name             = $s24c_pn$Unlearn$s24c_pn$,
  heavy_week_flag        = true,
  s5_source_opening_hook = $s24c_hk$Show three cards: REAL DANGER / SCARY BUT SAFE / NOT SURE — ASK A GROWN-UP. Use only fixed examples.$s24c_hk$,
  s5_source_core_concept = $s24c_cc$Today the child room learns three answers to a fear alarm: real danger — get safe and tell a grown-up; scary but safe — choose whether to try a small step; not sure — ask a trusted grown-up. Fear is a clue, not a perfect safety detector.$s24c_cc$,
  core_concept           = $s24c_cco$$s24c_cco$,
  teaching_points        = $s24c_tp$1. Fear can help children notice possible danger.
2. Fear can also show up when something is new, uncertain or embarrassing.
3. Children do not have to decide safety alone. Not sure means ask a trusted grown-up.
4. Scary-but-safe activities are still optional. Bravery is not doing a stunt or copying friends.
5. A slow breath may help someone pause; it does not prove the situation is safe.$s24c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s24c_sm$A smoke alarm means check. Sometimes there is fire, sometimes toast, and sometimes you need a grown-up to work it out. Never assume every alarm is toast.$s24c_sm$,
  private_write_prompt   = $s24c_pw$Draw one made-up safe-nerves example and one ask a grown-up example. You do not have to draw a real fear.$s24c_pw$,
  experiential_exercise  = $s24c_ex$ALARM CHECK. Sort fixed picture cards into danger / safe nerves / ask a grown-up: stranger asks child to leave, supervised class talk, friends suggest a high jump, trying a new supervised sport, unknown situation. The correct answer can be ASK when context is missing. No child classifies a personal fear.
DRAW IT
Draw three alarm buttons: GET SAFE / CHOOSE A SMALL STEP / ASK A GROWN-UP.$s24c_ex$,
  guided_reflection      = $s24c_gr$Keep your eyes open.
Look at a made-up alarm and ask:
Is there a real safety risk?
Is a trusted grown-up supervising?
Do I want to try?
Am I not sure? — ask for help.$s24c_gr$,
  journaling_prompt      = $s24c_jp$Draw three alarm buttons: GET SAFE / CHOOSE A SMALL STEP / ASK A GROWN-UP.$s24c_jp$,
  intention_prompt       = $s24c_ip$Choose one plan: When I feel scared and I am not sure about safety, I will ask a trusted grown-up before I act.$s24c_ip$,
  core_affirmation       = $s24c_ca$My fear can help me notice something, and a trusted grown-up can help me decide what is safe.$s24c_ca$,
  weekly_practice_mon    = $s24c_pm$If a fear alarm appears, remember danger / safe choice / ask a grown-up.$s24c_pm$,
  weekly_practice_wed    = $s24c_pw2$Practise the three choices with a trusted grown-up using made-up examples.$s24c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s24c_ps$Bring your alarm drawing back and add one safe example where a grown-up helped you check what the alarm meant. Sharing is optional.$s24c_ps$,
  previous_week_callback = $s24c_pwc$$s24c_pwc$,
  facilitator_notes      = $s24c_fn$## Aim
Teach safety discrimination without instructing children to override fear or practise exposure.
## Run the room
No personal fear inventory, eyes-closed fear recall, just burnt toast scripts, high-risk examples children must classify alone, or pressure to be brave. When uncertain, reinforce adult help.
## Why this week exists — the evidence
Fear predictions can overestimate some safe outcomes, while fear also supports safety. For children, the defensible translation is a three-way safety check rather than exposure or neuroscience.
Real-world anchor: a smoke alarm is designed to trigger before it knows the exact cause. A responsible adult checks whether the source is toast or fire; children are not expected to make every safety decision alone.
## Evidence quality
Moderate for fear-prediction principles; child activity is a safety-oriented teaching adaptation.
## We deliberately do not claim
- We do not claim fear alarms are usually false.
- We do not claim the body calms down once you show it everything is okay.
- We do not claim bravery means doing the feared thing.
- We do not use brain-region, rewiring or exposure-therapy claims with children.
## Source trail
- Anxiety/threat-prediction research informs facilitator framing.
- Child safeguarding rules take precedence over any approach exercise.$s24c_fn$,
  updated_at = now()
WHERE week_number = 24 AND audience = 'Child';

-- Week 25 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw25_theme$$cw25_theme$,
  the_territory        = $cw25_terr$Updating a self-story when the old version no longer fits the evidence$cw25_terr$,
  opening_question     = $cw25_oq$What makes a revised story more accurate rather than merely more positive? Passing is full participation.$cw25_oq$,
  week_type            = $cw25_wt$Standard$cw25_wt$,
  reflective_question  = $cw25_rq$Across the week, where did new evidence make an old self-story less global, more current or more complicated?$cw25_rq$,
  interactive_activity = $cw25_ia$STORY UPDATE. Write: old version; evidence it captured; evidence it omitted; what has changed; what remains true; fuller current version. The update may still contain difficulty and uncertainty. Sharing is optional.$cw25_ia$,
  kids_picture_book    = $cw25_bk$Not Quite Narwhal$cw25_bk$,
  kids_picture_book_author = $cw25_bka$Jessie Sima$cw25_bka$,
  kids_picture_book_note = $cw25_bkn$WHY THIS BOOK: Kelp discovers that an old description was incomplete. Use it to support exploration without saying everyone has a hidden true identity.
READ-ALOUD: Read live from a purchased copy.$cw25_bkn$,
  kids_picture_book_question = $cw25_bkq$Was the old story completely made up, or did it leave something out?$cw25_bkq$,
  kids_nz_alternative = $cw25_nz$Not yet selected$cw25_nz$,
  kids_nz_alternative_author = $cw25_nza$use the main book until a reviewed title fits this theme.$cw25_nza$,
  kids_nz_alternative_note = $cw25_nzn$A future alternative should support updated evidence without redemption or fixed identity.$cw25_nzn$,
  kids_colouring_prompt = $cw25_col$Colour a four-page photo album with one old picture, one new picture and two blank pages for things still unknown.$cw25_col$,
  kids_game = $cw25_g$OLD / NEW / BOTH. Use fixed cards about a fictional character: used to need help tying shoes / can do it now; always liked drawing / still likes it; used to dislike swimming / not sure now. Children sort into old, new, both or not sure. No dress-up coat that children must publicly "outgrow."$cw25_g$,
  kids_game_equipment = $cw25_ge$Photo-album sheets; fictional update cards; crayons.$cw25_ge$,
  kids_game_under5 = $cw25_g5$Use simple then / now picture pairs.$cw25_g5$,
  updated_at = now()
WHERE week_number = 25;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s25a_st$Writing the Upgrade$s25a_st$,
  theme_title            = $s25a_tt$$s25a_tt$,
  phase                  = 2,
  phase_name             = $s25a_pn$Unlearn$s25a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s25a_hk$Write one sentence about yourself that feels older than the evidence now. Mark still true / partly true / out of date / not sure.$s25a_hk$,
  s5_source_core_concept = $s25a_cc$Today the adult room practises narrative updating, not reinvention. Events cannot be rewritten and meanings are not completely under voluntary control. We can, however, notice when a global story leaves out current evidence, context, contradiction or change.$s25a_cc$,
  core_concept           = $s25a_cco$$s25a_cco$,
  teaching_points        = $s25a_tp$1. McAdams' narrative-identity research shows that people organise life experience through evolving stories. Narrative patterns are associated with agency and wellbeing, but association does not prove that deliberately rewriting a story causes those outcomes.
2. Redemptive narratives are one observed pattern, not the correct endpoint. Some harmful events were simply harmful and do not need a gift, lesson or growth arc.
3. Pennebaker's expressive-writing research has found modest psychological and some health-related effects across studies, but results vary. We do not promise immune, physical-health or life-satisfaction improvements from reframing.
4. A good update adds evidence and context: I failed once may become I failed that attempt, later learned X, and still find Y difficult.
5. Meaning can be chosen partly, discovered gradually or remain unresolved. I don't know what this means yet is legitimate.$s25a_tp$,
  video_link             = $s25a_vl$https://www.youtube.com/watch?v=D9Ihs241zeg$s25a_vl$,
  video_description      = $s25a_vd$Current assignment: Brené Brown / narrative material. Retain pending review. Brown is not the source of narrative-identity research; if narrative findings are cited, trace them to McAdams or the relevant primary work.$s25a_vd$,
  todays_theme           = $s25a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
CVs, biographies, family stories and self-descriptions all compress years into a few sentences. Compression is useful and can also leave old conclusions running after the evidence has changed.$s25a_tdt$,
  todays_world_vo_script = $s25a_tdv$Updating a story means making it more complete, not making it more flattering.$s25a_tdv$,
  ancient_wisdom_reframe = $s25a_aw$Change and impermanence can be used as philosophical lenses. Do not claim a living system must transform or die, or that change itself proves growth.$s25a_aw$,
  ancient_wisdom_vo_script = $s25a_awv$A description can change because new evidence arrives; it does not need a dramatic rebirth.$s25a_awv$,
  signal_metaphor        = $s25a_sm$A map route can become outdated after roads change. You update the map to current conditions; you do not pretend the old road never existed.$s25a_sm$,
  private_write_prompt   = $s25a_pw$Choose one manageable old self-story and write the specific evidence it was based on. Do not choose trauma material for this exercise.$s25a_pw$,
  experiential_exercise  = $s25a_ex$STORY UPDATE. Write: old version; evidence it captured; evidence it omitted; what has changed; what remains true; fuller current version. The update may still contain difficulty and uncertainty. Sharing is optional.$s25a_ex$,
  guided_reflection      = $s25a_gr$Keep your eyes open.
Write:
What the old story got right:
What it left out:
What current evidence adds:
The most accurate version I can write today:
No redemption ending is required.$s25a_gr$,
  journaling_prompt      = $s25a_jp$Across the week, where did new evidence make an old self-story less global, more current or more complicated?$s25a_jp$,
  intention_prompt       = $s25a_ip$Write one if-then plan: When I notice [old story phrase], I will check it against one piece of current evidence before acting from it.$s25a_ip$,
  core_affirmation       = $s25a_ca$I can update my self-story when the evidence changes without denying what happened or forcing a positive ending.$s25a_ca$,
  weekly_practice_mon    = $s25a_pm$Notice one old story phrase and mark what still fits.$s25a_pm$,
  weekly_practice_wed    = $s25a_pw2$Add one piece of current evidence the old version misses.$s25a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s25a_ps$Bring one example where new evidence made an old self-story more specific, current or complicated. Sharing details is optional.$s25a_ps$,
  previous_week_callback = $s25a_pwc$$s25a_pwc$,
  facilitator_notes      = $s25a_fn$## Aim
Use narrative updating without redemption pressure, health promises or claims that meaning is fully chosen.
## Run the room
No trauma story revision, what did it make possible?, public sharing of a new story, or instruction to tell another person the rewrite. Keep events and harm intact. Still unresolved is valid.
## Why this week exists — the evidence
Narrative-identity research documents links between how people organise life stories and psychological outcomes. Expressive-writing research shows small-to-moderate and variable effects. Neither establishes that deliberately writing a redemptive story reliably improves wellbeing.
Real-world anchor: an old CV can truthfully say no management experience and later become outdated after years of leading projects. Updating the description does not rewrite the earlier period; it incorporates new evidence.
## Evidence quality
Moderate overall. Narrative-identity associations are substantial; causal effects of intentional narrative rewriting are less certain. Expressive-writing effects are variable.
## We deliberately do not claim
- We do not claim narrative repair is one of the most evidence-based routes to lasting change.
- We do not claim reframing improves immune function or physical health for everyone.
- We do not claim hard events contain growth, gifts or lessons.
- We do not claim people are fully in control of the meaning of their lives.
- We do not claim changing a story changes what happened.
## Source trail
- McAdams, D. P. — narrative-identity research programme.
- Pennebaker, J. W. — expressive-writing research programme; effects presented cautiously.$s25a_fn$,
  updated_at = now()
WHERE week_number = 25 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s25t_st$Writing the Update$s25t_st$,
  theme_title            = $s25t_tt$$s25t_tt$,
  phase                  = 2,
  phase_name             = $s25t_pn$Unlearn$s25t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s25t_hk$Write privately one sentence that used to fit you better than it does now. Mark still / partly / not now / not sure.$s25t_hk$,
  s5_source_core_concept = $s25t_cc$Today the teen room updates one self-story by adding evidence the old version leaves out. The old story may remain partly true. We do not rewrite painful events, require a growth lesson or announce a new identity to anyone.$s25t_cc$,
  core_concept           = $s25t_cco$$s25t_cco$,
  teaching_points        = $s25t_tp$1. Narrative identity describes how people organise experiences into stories about themselves; these stories evolve over time.
2. Research links some narrative patterns with wellbeing and agency, but that does not prove rewriting a story causes those outcomes.
3. A fuller story can include that was bad and it still affected me without turning the event into a gift.
4. The events are not completely separate from meaning, and meaning is not completely voluntary. Not sure what it means is allowed.
5. Current evidence matters: one old label cannot fairly summarise every later example.$s25t_tp$,
  video_link             = $s25t_vl$https://www.youtube.com/watch?v=D9Ihs241zeg$s25t_vl$,
  video_description      = $s25t_vd$Current assignment: Brené Brown / story material. Retain pending review. Do not attribute narrative-identity findings to Brown; use primary narrative research when making evidence claims.$s25t_vd$,
  todays_theme           = $s25t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
School labels and old social roles can keep sounding current after skills, friendships and circumstances change. Week 25 compares the old sentence with current evidence.$s25t_tdt$,
  todays_world_vo_script = $s25t_tdv$The update is not I am amazing now. It is what does the evidence say now?$s25t_tdv$,
  ancient_wisdom_reframe = $s25t_aw$Use a photo album: an old photo can be real without being a complete picture of the person now. You add newer pages; you do not rip out the old one.$s25t_aw$,
  ancient_wisdom_vo_script = $s25t_awv$The old picture can be true and incomplete at the same time.$s25t_awv$,
  signal_metaphor        = $s25t_sm$An old Maps route may no longer match the roads. Updating it uses current information, not wishful thinking.$s25t_sm$,
  private_write_prompt   = $s25t_pw$Choose one safe old self-story and write one example that originally made it feel true. Keep it private.$s25t_pw$,
  experiential_exercise  = $s25t_ex$STORY UPDATE. Write old version / what it got right / what it left out / current evidence / fuller version now. No what strength came from the hard part requirement. Sharing is optional.$s25t_ex$,
  guided_reflection      = $s25t_gr$Keep your eyes open.
Write:
The old story says:
Evidence it captured:
Evidence it misses now:
A fuller current sentence:
It can still contain uncertainty or difficulty.$s25t_gr$,
  journaling_prompt      = $s25t_jp$During the week, where did old labels appear and what current evidence made them more accurate, less global or more complicated?$s25t_jp$,
  intention_prompt       = $s25t_ip$Write one if-then plan: When [old story phrase] shows up, I will check one current fact before I decide what it means.$s25t_ip$,
  core_affirmation       = $s25t_ca$I can update a story about myself without pretending the past was different or forcing a positive ending.$s25t_ca$,
  weekly_practice_mon    = $s25t_pm$Catch one old story and mark what still fits.$s25t_pm$,
  weekly_practice_wed    = $s25t_pw2$Add one current fact the old story does not include.$s25t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s25t_ps$Bring one example where current evidence made an old story about yourself more accurate or more complicated. Sharing details is optional.$s25t_ps$,
  previous_week_callback = $s25t_pwc$$s25t_pwc$,
  facilitator_notes      = $s25t_fn$## Aim
Teach evidence-based narrative updating without redemption, trauma processing or social disclosure.
## Run the room
No eyes-closed old-story recall, what did you survive, what strength emerged, or telling one person the new story. Keep the content low-risk and private. Refer clinical material.
## Why this week exists — the evidence
Narrative-identity research supports the idea that self-stories evolve and are associated with agency/wellbeing. Causal claims from a single rewriting exercise are much weaker.
Real-world anchor: a school report saying struggles with maths can remain a real historical document after a student later becomes competent. Current evidence changes the summary without changing the old report.
## Evidence quality
Moderate overall. Narrative associations are meaningful; effects of intentional rewriting are less certain.
## We deliberately do not claim
- We do not claim rewriting a narrative measurably improves mental health or life satisfaction in this session.
- We do not claim every hard event contains resilience, growth or a lesson.
- We do not claim you are the sole author of what events mean.
- We do not require telling anyone the new story.
## Source trail
- McAdams, D. P. — narrative-identity research.
- Expressive-writing literature interpreted cautiously.$s25t_fn$,
  updated_at = now()
WHERE week_number = 25 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s25c_st$Updating the Photo Album$s25c_st$,
  theme_title            = $s25c_tt$$s25c_tt$,
  phase                  = 2,
  phase_name             = $s25c_pn$Unlearn$s25c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s25c_hk$Show a baby photo and a current photo of a fictional character. Ask: Was the baby photo wrong? Does it show everything true now?$s25c_hk$,
  s5_source_core_concept = $s25c_cc$Today the child room learns that old stories about us can become out of date or incomplete. We do not have to say old me was wrong or new me is better. We add current evidence to the picture.$s25c_cc$,
  core_concept           = $s25c_cco$$s25c_cco$,
  teaching_points        = $s25c_tp$1. An old story may have been true in one moment and still leave out what happened later.
2. Children learn skills, change interests and discover new things about themselves.
3. Some things stay the same, and that is okay too.
4. A hard event does not have to become a gift or lesson.
5. Nobody has to make a new identity statement or share a private old story.$s25c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s25c_sm$A photo album needs more than one picture to show a whole life. A new page adds information; it does not erase the old page.$s25c_sm$,
  private_write_prompt   = $s25c_pw$Choose one page and draw a real safe example that supports it. You may tell someone or keep it private.$s25c_pw$,
  experiential_exercise  = $s25c_ex$UPDATED PHOTO ALBUM. Four pages: an old safe description / what was true about it / something current evidence adds / a fuller picture now. Children may use neutral examples such as skills, hobbies or confidence with a task. No celebrate every difference requirement.
DRAW IT
Add one new page called What is true about me now using a specific example rather than a big label.$s25c_ex$,
  guided_reflection      = $s25c_gr$Keep your eyes open and compare the pages.
Ask:
Was the old page real?
What does the new page add?
What might still be the same?
You do not need a dramatic growth story.$s25c_gr$,
  journaling_prompt      = $s25c_jp$Add one new page called What is true about me now using a specific example rather than a big label.$s25c_jp$,
  intention_prompt       = $s25c_ip$Choose one plan: When an old label about me appears, I will remember one current example that adds to the picture.$s25c_ip$,
  core_affirmation       = $s25c_ca$Old stories can be real and incomplete; I can add new pages as I learn more.$s25c_ca$,
  weekly_practice_mon    = $s25c_pm$Notice one old label and one thing current evidence adds.$s25c_pm$,
  weekly_practice_wed    = $s25c_pw2$Ask a trusted grown-up for one specific thing they have noticed you learn or change, if you want to.$s25c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s25c_ps$Bring your photo album back and add one new page showing something current evidence says about you now. Sharing is optional.$s25c_ps$,
  previous_week_callback = $s25c_pwc$$s25c_pwc$,
  facilitator_notes      = $s25c_fn$## Aim
Teach story updating without forced growth celebration, hero identity or redemption.
## Run the room
Do not ask what old belief is no longer true? in a way that demands personal disclosure, or say the child is taller/smarter/more capable as a universal progression. No journey, remarkable, or public Page 4 share requirement.
## Why this week exists — the evidence
Narrative identity supports the broad idea that self-stories evolve. For children, current evidence and concrete then/now examples are safer than encouraging redemptive life narratives.
Real-world anchor: a baby photo is accurate and obviously incomplete as a description of the child years later. That direct example demonstrates updating without saying the earlier picture was false.
## Evidence quality
Illustrative to moderate. Narrative-identity evidence is mostly adult; the child activity is a concrete teaching adaptation.
## We deliberately do not claim
- We do not claim children should narrate hard events as growth.
- We do not claim a new story changes what happened.
- We do not claim every child is constantly becoming more capable in every domain.
- We do not require public sharing or a positive new identity.
## Source trail
- McAdams narrative-identity research informs the general principle.$s25c_fn$,
  updated_at = now()
WHERE week_number = 25 AND audience = 'Child';

-- Week 26 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw26_theme$$cw26_theme$,
  the_territory        = $cw26_terr$Reviewing what no longer needs to run automatically$cw26_terr$,
  opening_question     = $cw26_oq$What have you learned about the difference between letting go and simply making a pattern visible? Passing is full participation.$cw26_oq$,
  week_type            = $cw26_wt$Integration$cw26_wt$,
  reflective_question  = $cw26_rq$Looking across Unlearn, which patterns became more visible, which remained useful, and which lost some automatic authority?$cw26_rq$,
  interactive_activity = $cw26_ia$UNLEARN AUDIT. Four columns: pattern; what it once/currently helps; what it costs; current choice. Add one cue that may make it return. Sharing is optional.$cw26_ia$,
  kids_picture_book    = $cw26_bk$What Do You Do With a Problem?$cw26_bk$,
  kids_picture_book_author = $cw26_bka$Kobi Yamada$cw26_bka$,
  kids_picture_book_note = $cw26_bkn$WHY THIS BOOK: Use it only as a story about looking at a problem differently; do not teach that every problem contains a gift.
READ-ALOUD: Read live from a purchased copy.$cw26_bkn$,
  kids_picture_book_question = $cw26_bkq$Did the problem have to disappear for the child to have another choice?$cw26_bkq$,
  kids_nz_alternative = $cw26_nz$Not yet selected$cw26_nz$,
  kids_nz_alternative_author = $cw26_nza$use the main book until a reviewed title fits this integration theme.$cw26_nza$,
  kids_nz_alternative_note = $cw26_nzn$Any future alternative should support sorting and choice without rite-of-passage or hero framing.$cw26_nzn$,
  kids_colouring_prompt = $cw26_col$Colour a toolbox with four drawers: keep, change, put away, not sure.$cw26_col$,
  kids_game = $cw26_g$TOOL SORT. Children move tool-picture cards into four baskets. No threshold crossing, treasure map, release object or ceremony.$cw26_g$,
  kids_game_equipment = $cw26_ge$Tool cards; baskets; crayons.$cw26_ge$,
  kids_game_under5 = $cw26_g5$Use two baskets: keep nearby / put away for now plus adult help.$cw26_g5$,
  updated_at = now()
WHERE week_number = 26;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s26a_st$Cleared Ground$s26a_st$,
  theme_title            = $s26a_tt$$s26a_tt$,
  phase                  = 2,
  phase_name             = $s26a_pn$Unlearn$s26a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s26a_hk$Look back over Weeks 14–25. Mark one idea keep, one modify, one put down for now, or write not sure.$s26a_hk$,
  s5_source_core_concept = $s26a_cc$Today the adult room reviews Unlearn without claiming anyone is cleared, reset or finished. Old strategies can remain available; inherited expectations can still be chosen. We decide what deserves less automatic authority going forward.$s26a_cc$,
  core_concept           = $s26a_cco$$s26a_cco$,
  teaching_points        = $s26a_tp$1. Behaviour change is rarely a clean removal process. Old responses can reappear under familiar cues without erasing learning.
2. Integration can mean improved recognition rather than disappearance.
3. A pattern can be kept deliberately if it still serves a real value, relationship or constraint.
4. There is no evidence that thirteen weeks of this block produces a clean slate or measurable neural reset.
5. Independence is part of the design: the tools belong to the participant, not the programme.$s26a_tp$,
  video_link             = $s26a_vl$https://www.youtube.com/watch?v=sPOuCd6cBao$s26a_vl$,
  video_description      = $s26a_vd$Current assignment retained pending review. Use any integration clip as reflection material only, not evidence that a threshold, transformation or new identity has been achieved.$s26a_vd$,
  todays_theme           = $s26a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Deleting an old rule from a notes app does not prevent it appearing again in a stressful week. Useful integration is knowing what to do when it returns.$s26a_tdt$,
  todays_world_vo_script = $s26a_tdv$The old pattern can show up again without becoming the boss again.$s26a_tdv$,
  ancient_wisdom_reframe = $s26a_aw$Use seasonal clearing only as a metaphor for review. Do not create a release rite, threshold or purification story.$s26a_aw$,
  ancient_wisdom_vo_script = $s26a_awv$Review can make room without pretending the ground is permanently cleared.$s26a_awv$,
  signal_metaphor        = $s26a_sm$An archive keeps old files without letting every file open automatically at startup.$s26a_sm$,
  private_write_prompt   = $s26a_pw$Write one rule, strategy or expectation from this block that you now recognise more quickly. Mark keep / modify / put down for now / not sure.$s26a_pw$,
  experiential_exercise  = $s26a_ex$UNLEARN AUDIT. Four columns: pattern; what it once/currently helps; what it costs; current choice. Add one cue that may make it return. Sharing is optional.$s26a_ex$,
  guided_reflection      = $s26a_gr$Keep your eyes open.
Write:
What I see more clearly:
What I choose to keep:
What I may change or set down:
What I will do when an old pattern returns:$s26a_gr$,
  journaling_prompt      = $s26a_jp$Looking across Unlearn, which patterns became more visible, which remained useful, and which lost some automatic authority?$s26a_jp$,
  intention_prompt       = $s26a_ip$Write one if-then plan: When [old pattern] appears, I will notice it and choose [keep / modify / alternative action] based on the current situation.$s26a_ip$,
  core_affirmation       = $s26a_ca$I can recognise an old pattern, understand why it exists and decide what authority it gets now.$s26a_ca$,
  weekly_practice_mon    = $s26a_pm$Notice one old pattern without treating its return as failure.$s26a_pm$,
  weekly_practice_wed    = $s26a_pw2$Deliberately choose whether to keep, modify or not use it in one context.$s26a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s26a_ps$Bring one observation about a rule, strategy or expectation you are keeping, modifying or putting down for now. Sharing is optional.$s26a_ps$,
  previous_week_callback = $s26a_pwc$$s26a_pwc$,
  facilitator_notes      = $s26a_fn$## Aim
Close Unlearn with review and independence rather than ceremony, release or clean-slate claims.
## Run the room
No candles, circles, burning/tearing rituals, threshold statements, hand-on-heart, witnessed silence or testimony. Not sure and keeping it are valid outcomes.
## Why this week exists — the evidence
Maintenance research across behaviour domains shows lapses and context-triggered returns are common. The defensible integration message is recognition and flexible response, not permanent removal.
Real-world anchor: archived software can still be reopened; the change is that it no longer launches automatically. That is a more realistic model than deleting an old self.
## Evidence quality
Moderate overall. Behaviour-maintenance principles are well established; programme-specific integration effects are unmeasured.
## We deliberately do not claim
- We do not claim a clean slate, reset, cleared nervous system or new identity.
- We do not claim old patterns should never return.
- We do not claim setting something down requires ceremony or public acknowledgment.
- We do not claim keeping an inherited rule means the work failed.
## Source trail
- Behaviour-maintenance/relapse literature informs flexible-return framing.
- Programme-specific outcomes remain unestablished.$s26a_fn$,
  updated_at = now()
WHERE week_number = 26 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s26t_st$What You've Put Down$s26t_st$,
  theme_title            = $s26t_tt$$s26t_tt$,
  phase                  = 2,
  phase_name             = $s26t_pn$Unlearn$s26t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s26t_hk$Pick one Week 14–25 idea and mark keep / change / put down for now / not sure. No explanation required.$s26t_hk$,
  s5_source_core_concept = $s26t_cc$Today the teen room reviews Unlearn without a ceremony or before-and-after story. You choose what to keep, change, ignore or test later. Old patterns can return and you are not required to be a different person now.$s26t_cc$,
  core_concept           = $s26t_cco$$s26t_cco$,
  teaching_points        = $s26t_tp$1. Learning does not erase old responses on command.
2. A strategy can still be useful in some contexts even if you used it automatically before.
3. Not sure and keep it are valid decisions.
4. Lapses do not reset progress; they can show which cues remain strong.
5. Mindcast does not own the tools or require you to keep using them.$s26t_tp$,
  video_link             = $s26t_vl$https://www.youtube.com/watch?v=sPOuCd6cBao$s26t_vl$,
  video_description      = $s26t_vd$Current assignment retained pending review. Do not use it to frame this week as a threshold, rite, transformation or new identity.$s26t_vd$,
  todays_theme           = $s26t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
An old joke, avoidance pattern, people-pleasing move or self-story can return under pressure. Noticing it sooner is still different from having no choice.$s26t_tdt$,
  todays_world_vo_script = $s26t_tdv$A pattern returning is information, not proof that nothing changed.$s26t_tdv$,
  ancient_wisdom_reframe = $s26t_aw$Use a backpack after a trip only as a sorting metaphor: keep, store, remove, not sure. Do not call the programme itself a journey or use a threshold ritual.$s26t_aw$,
  ancient_wisdom_vo_script = $s26t_awv$You can sort what you carry without proving you have become somebody new.$s26t_awv$,
  signal_metaphor        = $s26t_sm$Archived apps can still be opened, but they do not need to run automatically in the background.$s26t_sm$,
  private_write_prompt   = $s26t_pw$Choose one rule, strategy or expectation from this block. Mark keep / change / put down / not sure and one reason based on current evidence.$s26t_pw$,
  experiential_exercise  = $s26t_ex$UNLEARN SORT. Four boxes: keep / change / put down for now / not sure. Add tools or patterns privately. Then write one cue that could make an old pattern return and one option you have then. Sharing is optional.$s26t_ex$,
  guided_reflection      = $s26t_gr$Keep your eyes open.
Write:
Something I see more clearly:
Something I am keeping:
Something I may change or put down:
If it comes back, I can:$s26t_gr$,
  journaling_prompt      = $s26t_jp$Looking across the block, which patterns lost some power simply because you could see them earlier, and which still make sense to keep?$s26t_jp$,
  intention_prompt       = $s26t_ip$Write one if-then plan: When [old pattern] appears, I will notice it before deciding whether to use it.$s26t_ip$,
  core_affirmation       = $s26t_ca$I can put something down without promising it will never appear again.$s26t_ca$,
  weekly_practice_mon    = $s26t_pm$Notice one old pattern without calling it failure.$s26t_pm$,
  weekly_practice_wed    = $s26t_pw2$Deliberately choose to use or not use one familiar strategy.$s26t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s26t_ps$Bring one observation about something you put down, kept or changed and what happened when it showed up again. Sharing is optional.$s26t_ps$,
  previous_week_callback = $s26t_pwc$$s26t_pwc$,
  facilitator_notes      = $s26t_fn$## Aim
Close Phase 2 without ceremony, purity or transformation pressure.
## Run the room
No threshold crossing, release statement, witness circle, candles, darkening, silence-as-ritual or who you are now language. Do not hand-write Voices of last week.
## Why this week exists — the evidence
Behaviour change is context-sensitive and old responses commonly recur. The useful message is flexible recovery rather than clean removal.
Real-world anchor: an old autocomplete suggestion can return after months. Seeing it does not force you to send it.
## Evidence quality
Moderate overall. Maintenance/lapse principles are well supported; programme-specific outcomes are not measured.
## We deliberately do not claim
- We do not claim a reset, threshold or transformed identity.
- We do not claim old patterns disappearing is the measure of success.
- We do not claim a returning pattern means failure.
- We do not require public sharing or ceremony.
## Source trail
- Behaviour-maintenance/lapse literature informs the return-and-choose framing.$s26t_fn$,
  updated_at = now()
WHERE week_number = 26 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s26c_st$Putting Down the Heavy Things$s26c_st$,
  theme_title            = $s26c_tt$$s26c_tt$,
  phase                  = 2,
  phase_name             = $s26c_pn$Unlearn$s26c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s26c_hk$Show a toy box with cards labelled KEEP / CHANGE / PUT AWAY / NOT SURE. Let children sort neutral objects or tool pictures.$s26c_hk$,
  s5_source_core_concept = $s26c_cc$Today the child room sorts what we tried in Unlearn. A child can keep a tool, change it, put it away or say not sure. Old habits and thoughts can come back; that does not mean the child failed or went back to the beginning.$s26c_cc$,
  core_concept           = $s26c_cco$$s26c_cco$,
  teaching_points        = $s26c_tp$1. We have practised choices, expectations, forgiveness options, self-talk, helping, scarcity, relationships, protection, endings, fear and stories.
2. Different tools fit different situations.
3. A tool can be put away without being bad.
4. An old pattern can return and still be noticed earlier next time.
5. Nobody has to prove they changed or share a private lesson.$s26c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s26c_sm$A toolbox can hold tools you use often, tools you store and tools you are not sure about. The goal is not an empty toolbox or a brand-new child.$s26c_sm$,
  private_write_prompt   = $s26c_pw$Draw one thing you want to keep and one thing you want to put away or change for now. You may use tool pictures rather than personal stories.$s26c_pw$,
  experiential_exercise  = $s26c_ex$UNLEARN TOOLBOX. Children sort familiar picture cards into keep / change / put away / not sure. Add one picture showing what to do if an old habit returns: notice / ask for help / try another tool. No personal disclosure required.
DRAW IT
Draw your toolbox with one keep, one change/away, and one help symbol.$s26c_ex$,
  guided_reflection      = $s26c_gr$Keep your eyes open.
Ask:
What do I want near the top of my toolbox?
What can I put away for now?
What can I do if an old habit comes back?
Not sure is a good answer.$s26c_gr$,
  journaling_prompt      = $s26c_jp$Draw your toolbox with one keep, one change/away, and one help symbol.$s26c_jp$,
  intention_prompt       = $s26c_ip$Choose one plan: When an old habit or thought comes back, I will notice it and choose a tool or trusted grown-up.$s26c_ip$,
  core_affirmation       = $s26c_ca$I can keep learning even when old habits come back sometimes.$s26c_ca$,
  weekly_practice_mon    = $s26c_pm$Notice one old habit or thought without calling it bad.$s26c_pm$,
  weekly_practice_wed    = $s26c_pw2$Choose one familiar tool if you need it.$s26c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s26c_ps$Bring your toolbox drawing back and add one thing you want to keep, change or put away for now. Sharing is optional.$s26c_ps$,
  previous_week_callback = $s26c_pwc$$s26c_pwc$,
  facilitator_notes      = $s26c_fn$## Aim
Finish Unlearn through ordinary sorting and choice, not ceremony or claims of a cleared identity.
## Run the room
No threshold, release statements, circle witness, candles, symbolic crossing or public growth story. Do not say children have cleared space for a new self.
## Why this week exists — the evidence
Old patterns often recur under familiar cues. The age-matched skill is noticing recurrence and choosing among available supports rather than expecting permanent disappearance.
Real-world anchor: a toy put back in a cupboard can still be taken out later. Putting something away changes access; it does not erase its existence.
## Evidence quality
Illustrative to moderate. Behaviour-maintenance principles support recurrence; this toolbox activity is a teaching adaptation.
## We deliberately do not claim
- We do not claim a clean slate, reset or new identity.
- We do not claim old patterns should disappear permanently.
- We do not use ceremonial staging or threshold language.
- We do not require children to share what they put down.
## Source trail
- Behaviour-maintenance principles inform recurrence framing.$s26c_fn$,
  updated_at = now()
WHERE week_number = 26 AND audience = 'Child';

-- Week 27 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw27_theme$$cw27_theme$,
  the_territory        = $cw27_terr$Turning a chosen direction into one thing you can actually do$cw27_terr$,
  opening_question     = $cw27_oq$What is the difference between an identity statement and evidence of behaviour? Passing is full participation.$cw27_oq$,
  week_type            = $cw27_wt$Movement opener$cw27_wt$,
  reflective_question  = $cw27_rq$Across the week, what did the behaviour teach you about the direction you chose — including whether the behaviour or direction needs changing?$cw27_rq$,
  interactive_activity = $cw27_ia$IDENTITY → BEHAVIOUR. Write: direction; smallest observable behaviour; cue/context; likely obstacle; easier version. Make the behaviour small enough to do on a difficult week. Sharing is optional.$cw27_ia$,
  kids_picture_book    = $cw27_bk$The Most Magnificent Thing$cw27_bk$,
  kids_picture_book_author = $cw27_bka$Ashley Spires$cw27_bka$,
  kids_picture_book_note = $cw27_bkn$WHY THIS BOOK: It shows repeated attempts, frustration and adjustment without teaching that persistence always guarantees success.
READ-ALOUD: Read live from a purchased copy.$cw27_bkn$,
  kids_picture_book_question = $cw27_bkq$What small thing did the character change after noticing the first plan was not working?$cw27_bkq$,
  kids_nz_alternative = $cw27_nz$Not yet selected$cw27_nz$,
  kids_nz_alternative_author = $cw27_nza$use the main book until a reviewed title fits this theme.$cw27_nza$,
  kids_nz_alternative_note = $cw27_nzn$Any future alternative should support small practice and revision rather than fixed identity or destiny.$cw27_nzn$,
  kids_colouring_prompt = $cw27_col$Colour a small wall with one labelled first brick and several blank bricks above it.$cw27_col$,
  kids_game = $cw27_g$ONE SMALL STEP. Set up simple non-competitive tasks and demonstrate how each can be made easier: fewer blocks, shorter distance, one piece at a time. Children choose whether to try or watch.$cw27_g$,
  kids_game_equipment = $cw27_ge$Toy bricks; paper; crayons; simple task materials.$cw27_ge$,
  kids_game_under5 = $cw27_g5$Use one cue picture and one action picture only.$cw27_g5$,
  updated_at = now()
WHERE week_number = 27;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s27a_st$Configuration Begins$s27a_st$,
  theme_title            = $s27a_tt$$s27a_tt$,
  phase                  = 3,
  phase_name             = $s27a_pn$Rebuild$s27a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s27a_hk$Complete privately: I want to be someone who more often… Then underline the observable verb.$s27a_hk$,
  s5_source_core_concept = $s27a_cc$Today the adult room starts Rebuild with behaviour, not reinvention. A value or identity direction can help organise choices, but the practical unit is one observable action in one context. We build evidence gradually and leave room to revise the direction.$s27a_cc$,
  core_concept           = $s27a_cco$$s27a_cco$,
  teaching_points        = $s27a_tp$1. Identity can influence behaviour, but every action is a vote for the person you wish to become is James Clear's useful synthesis, not a research finding he generated.
2. Self-perception research suggests people sometimes infer attitudes or identity from observing their own behaviour, but the relationship is not a one-way law.
3. Implementation intentions have strong evidence: specific cue-response plans improve follow-through compared with intentions alone.
4. One behaviour does not prove an identity. Repetition provides evidence, not destiny.
5. Structural constraints still matter. A behaviour must fit time, money, health, caring roles and current capacity.$s27a_tp$,
  video_link             = $s27a_vl$https://www.youtube.com/watch?v=PZ7lDrwYdZc$s27a_vl$,
  video_description      = $s27a_vd$Current assignment: James Clear / identity-based habits. Retain pending review. Present Clear as a writer synthesising research, not as the source of habit or identity findings.$s27a_vd$,
  todays_theme           = $s27a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Goals such as be healthier, be present or be a better leader become easier to test when translated into a small action in a specific situation.$s27a_tdt$,
  todays_world_vo_script = $s27a_tdv$Direction helps. Behaviour gives you evidence.$s27a_tdv$,
  ancient_wisdom_reframe = $s27a_aw$Aristotelian practice can be used as a philosophical lens for character expressed through repeated action. Do not claim ancient philosophy proves a modern habit mechanism.$s27a_aw$,
  ancient_wisdom_vo_script = $s27a_awv$A direction becomes visible through what you repeatedly practise, not through one declaration.$s27a_awv$,
  signal_metaphor        = $s27a_sm$A blueprint points toward a building; the first brick is still just one brick. You need both direction and construction.$s27a_sm$,
  private_write_prompt   = $s27a_pw$Write one direction you choose for this phase and one observable behaviour that would express it. Avoid grand identity labels.$s27a_pw$,
  experiential_exercise  = $s27a_ex$IDENTITY → BEHAVIOUR. Write: direction; smallest observable behaviour; cue/context; likely obstacle; easier version. Make the behaviour small enough to do on a difficult week. Sharing is optional.$s27a_ex$,
  guided_reflection      = $s27a_gr$Keep your eyes open.
Write:
Direction I choose:
Behaviour that would count as evidence:
Cue:
Minimum version:
What would make this unrealistic right now:$s27a_gr$,
  journaling_prompt      = $s27a_jp$Across the week, what did the behaviour teach you about the direction you chose — including whether the behaviour or direction needs changing?$s27a_jp$,
  intention_prompt       = $s27a_ip$Write one if-then plan: When [specific cue] happens, I will [small observable behaviour].$s27a_ip$,
  core_affirmation       = $s27a_ca$I can choose a direction and build evidence through small actions without needing to declare a finished identity.$s27a_ca$,
  weekly_practice_mon    = $s27a_pm$Perform or notice the smallest version once when the cue appears.$s27a_pm$,
  weekly_practice_wed    = $s27a_pw2$Check whether the behaviour is still realistic and shrink or modify it if needed.$s27a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s27a_ps$Bring one observation about whether your smallest chosen behaviour happened and what the cue or context taught you. Sharing is optional.$s27a_ps$,
  previous_week_callback = $s27a_pwc$$s27a_pwc$,
  facilitator_notes      = $s27a_fn$## Aim
Start Rebuild with chosen direction plus observable behaviour, not identity hype.
## Run the room
Do not push I am statements, transformation language or behaviours that ignore structural constraints. A participant may revise the direction after testing it.
## Why this week exists — the evidence
Implementation intentions offer strong support for linking a cue to a behaviour. Identity-based habit language is popular because it organises motivation, but writers such as James Clear synthesise rather than originate the relevant evidence.
Real-world anchor: be more present with my child becomes testable as when I walk in after work, phone stays in my bag for the first ten minutes. The behaviour creates information the identity slogan cannot.
## Evidence quality
Strong for implementation intentions; moderate/illustrative for identity-based framing.
## We deliberately do not claim
- We do not claim every action casts a literal vote that rewires identity.
- We do not claim Clear conducted the underlying habit research.
- We do not claim one repeated behaviour creates a permanent identity.
- We do not treat structural constraints as excuses or mindset failures.
## Source trail
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation-intention meta-analysis.
- Bem, D. J. — self-perception theory lineage.
- Clear, J. — writer/synthesis, not primary research source.$s27a_fn$,
  updated_at = now()
WHERE week_number = 27 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s27t_st$The First Brick$s27t_st$,
  theme_title            = $s27t_tt$$s27t_tt$,
  phase                  = 3,
  phase_name             = $s27t_pn$Rebuild$s27t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s27t_hk$Complete privately: I want to be someone who more often… Then underline the action word. If the sentence feels too big, shrink it.$s27t_hk$,
  s5_source_core_concept = $s27t_cc$Today the teen room starts Rebuild with one small behaviour, not a declaration about who you now are. A chosen direction can guide action, but the action is simply evidence to learn from and can be changed if it does not fit.$s27t_cc$,
  core_concept           = $s27t_cco$$s27t_cco$,
  teaching_points        = $s27t_tp$1. Identity-based habit language is useful as motivation, but every action is a vote for who you become is James Clear's synthesis, not a scientific law.
2. People can infer things about themselves from their own behaviour, but one action does not prove a stable identity.
3. Implementation intentions have strong evidence: When X happens, I will do Y is more actionable than I'll try harder.
4. Small actions can be scaled down further when time, energy, health or other constraints make the original version unrealistic.
5. A good test can end with keep, change, make easier or not for me.$s27t_tp$,
  video_link             = $s27t_vl$https://www.youtube.com/watch?v=PZ7lDrwYdZc$s27t_vl$,
  video_description      = $s27t_vd$Current assignment: James Clear / identity-based habits. Retain pending video review. Clear is a writer synthesising research, not the source of the underlying habit or identity findings.$s27t_vd$,
  todays_theme           = $s27t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Goals such as be more confident, be healthier or be better at school are hard to act on until they become one behaviour in one situation.$s27t_tdt$,
  todays_world_vo_script = $s27t_tdv$Direction is useful. A tiny behaviour gives you evidence.$s27t_tdv$,
  ancient_wisdom_reframe = $s27t_aw$Use a first-brick metaphor: a brick is evidence of building activity, not proof the whole building is finished or fixed forever.$s27t_aw$,
  ancient_wisdom_vo_script = $s27t_awv$One small action is one brick. It gives you something real to learn from.$s27t_awv$,
  signal_metaphor        = $s27t_sm$A draft setting is not a permanent profile. You can test a behaviour before deciding how much it belongs in your life.$s27t_sm$,
  private_write_prompt   = $s27t_pw$Write one direction you care about and one tiny behaviour that would express it. Keep it private if you want.$s27t_pw$,
  experiential_exercise  = $s27t_ex$FIRST BRICK. Write: direction / tiny behaviour / cue / easiest version / likely obstacle. Make the behaviour small enough to do on an ordinary difficult day. Sharing is optional.$s27t_ex$,
  guided_reflection      = $s27t_gr$Keep your eyes open.
Write:
Direction:
Behaviour:
Cue:
Minimum version:
What would make me change the plan:$s27t_gr$,
  journaling_prompt      = $s27t_jp$During the week, what did the tiny action teach you about the direction, the cue and whether the plan needs changing?$s27t_jp$,
  intention_prompt       = $s27t_ip$Write one if-then plan: When [specific cue] happens, I will [tiny observable action].$s27t_ip$,
  core_affirmation       = $s27t_ca$I can choose a direction and test it through small actions without needing to become a finished version of myself.$s27t_ca$,
  weekly_practice_mon    = $s27t_pm$Try the minimum version once when the cue appears.$s27t_pm$,
  weekly_practice_wed    = $s27t_pw2$Check whether the behaviour is realistic and make it easier if needed.$s27t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s27t_ps$Bring one observation about whether your smallest chosen action happened and what made it easier or harder. Sharing is optional.$s27t_ps$,
  previous_week_callback = $s27t_pwc$come back with one thing from your Phase 2 stocktake you were willing to say out loud$s27t_pwc$,
  facilitator_notes      = $s27t_fn$## Aim
Translate direction into behaviour without identity pressure or habit mythology.
## Run the room
Do not require I am affirmations or treat one missed action as evidence about character. Keep goals age-appropriate and within teen control. Structural constraints are real.
## Why this week exists — the evidence
Implementation-intention research strongly supports cue-linked planning. Identity-based habit language is a useful popular synthesis rather than a primary empirical finding.
Real-world anchor: be better at maths becomes testable as when I sit down after dinner on Tuesday, I will do one practice problem. The behaviour can then be evaluated rather than admired as a slogan.
## Evidence quality
Strong for implementation intentions; moderate/illustrative for identity-based framing.
## We deliberately do not claim
- We do not claim every action is literally a vote that builds identity.
- We do not claim James Clear conducted the underlying research.
- We do not claim one behaviour rewires the brain or creates a permanent self.
- We do not claim missing the action resets progress.
## Source trail
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation-intention meta-analysis.
- Bem, D. J. — self-perception theory lineage.
- Clear, J. — writer/synthesis, not primary research source.$s27t_fn$,
  updated_at = now()
WHERE week_number = 27 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s27c_st$Who Are You Building?$s27c_st$,
  theme_title            = $s27c_tt$$s27c_tt$,
  phase                  = 3,
  phase_name             = $s27c_pn$Rebuild$s27c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s27c_hk$Show one toy brick. Ask: Is this a whole house? Can it still be the first piece of something we are building?$s27c_hk$,
  s5_source_core_concept = $s27c_cc$Today the child room chooses one small thing to practise. We connect it to a simple cue, try the tiniest version and see what happens. One action does not decide who a child is.$s27c_cc$,
  core_concept           = $s27c_cco$$s27c_cco$,
  teaching_points        = $s27c_tp$1. Big goals can be made smaller so they are easier to practise.
2. A cue is something that reminds us when to try the action.
3. One try gives information; it does not prove a child is good or bad at something.
4. Plans can be made easier or changed when they do not fit.
5. Missing a practice does not reset anything.$s27c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s27c_sm$One brick is not a whole building. It is one small piece you can place, look at and decide what comes next.$s27c_sm$,
  private_write_prompt   = $s27c_pw$Draw the cue and the tiny action you want to try. You may tell someone or keep it private.$s27c_pw$,
  experiential_exercise  = $s27c_ex$FIRST BRICK. Children choose one safe skill such as packing a bag, drawing, reading, asking for help, tidying one item or practising a movement. Draw: cue / tiny action / easier version. Avoid food/body goals and adult responsibilities.
DRAW IT
Draw one brick with your tiny action on it and a second blank brick for whatever you learn next.$s27c_ex$,
  guided_reflection      = $s27c_gr$Keep your eyes open and look at your plan.
Ask:
Is the action small enough?
What will remind me?
What can I do if it feels too hard? — make it smaller or ask for help.$s27c_gr$,
  journaling_prompt      = $s27c_jp$Draw one brick with your tiny action on it and a second blank brick for whatever you learn next.$s27c_jp$,
  intention_prompt       = $s27c_ip$Choose one plan: When [simple cue] happens, I will try [tiny action].$s27c_ip$,
  core_affirmation       = $s27c_ca$I can practise one small action and learn what to try next.$s27c_ca$,
  weekly_practice_mon    = $s27c_pm$Try your tiny action once when the cue appears.$s27c_pm$,
  weekly_practice_wed    = $s27c_pw2$Make the action smaller or ask for help if the plan is too hard.$s27c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s27c_ps$Bring your first-brick drawing back and add one tiny action you tried this week. Sharing is optional.$s27c_ps$,
  previous_week_callback = $s27c_pwc$$s27c_pwc$,
  facilitator_notes      = $s27c_fn$## Aim
Teach cue-linked action without fixed-identity, growth-mindset or rewiring claims.
## Run the room
No this is who you are becoming, no public commitments, no food/body goals and no adult responsibilities. Let children change or abandon a plan.
## Why this week exists — the evidence
Implementation intentions support linking a cue to a small action. For children, this is translated into simple visual cue-action planning rather than identity-based habit claims.
Real-world anchor: putting a schoolbag beside the door can cue checking it before leaving. The environment can remind the action without needing more motivation.
## Evidence quality
Strong for implementation-intention principles; child activity is an age-matched adaptation.
## We deliberately do not claim
- We do not claim actions are votes that create identity.
- We do not claim repetition rewires the brain.
- We do not claim a child must become a new version of themselves.
- We do not claim missing a day resets progress.
## Source trail
- Gollwitzer, P. M., & Sheeran, P. (2006).
- Child cue/action activity is a teaching adaptation.$s27c_fn$,
  updated_at = now()
WHERE week_number = 27 AND audience = 'Child';

-- Week 28 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw28_theme$$cw28_theme$,
  the_territory        = $cw28_terr$What matters most to you$cw28_terr$,
  opening_question     = $cw28_oq$What's the most important thing to you?$cw28_oq$,
  week_type            = $cw28_wt$Standard$cw28_wt$,
  reflective_question  = $cw28_rq$Write about the community you're building - the relationships already here that you want to invest more in, and the kind of people you want to seek out and become useful to as you grow.$cw28_rq$,
  interactive_activity = $cw28_ia$VALUES EXCAVATION: In your journal, work through these steps. First, list everything that you would say you value. Then: for each item, ask — is this genuinely mine, or inherited? Is it a means (to get something else) or an end (valuable in itself)? Narrow to your top 5 genuine, chosen values. For each, write: how would my life look different if I lived this value fully? Where am I most and least aligned with it right now? Finally: rank them. When they conflict — and they will — which wins? Share: your top three values and one place they currently show up in your life.$cw28_ia$,
  kids_game = $cw28_g$Rescue the Treasures — Ten objects scattered in the hall, a rope 'river' across the middle. Teams may only carry three across. They must decide together which three matter most, and say why. WHY IT FITS: When you can't have everything, what do you choose?$cw28_g$,
  kids_game_equipment = $cw28_ge$Assorted objects, rope$cw28_ge$,
  kids_game_under5 = $cw28_g5$Under-5s rescue one object each and say why they picked it. Skip the group decision.$cw28_g5$,
  updated_at = now()
WHERE week_number = 28;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s28a_st$Setting the Priority Hierarchy$s28a_st$,
  theme_title            = $s28a_tt$$s28a_tt$,
  phase                  = 3,
  phase_name             = $s28a_pn$Rebuild$s28a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s28a_hk$Make a quick list: what do you say your values are? Now check: how much of your time, energy, and money last week actually reflected those values? The gap between stated and lived values is the most important diagnostic tool available.$s28a_hk$,
  s5_source_core_concept = $s28a_cc$Values are not what we say we believe — they are what we demonstrate through our choices, our time, and our energy. Most people have never explicitly identified their core values. Most people's lives are organised around values they absorbed — approval, security, success — rather than values they chose. This week we get explicit.$s28a_cc$,
  core_concept           = $s28a_cco$$s28a_cco$,
  teaching_points        = $s28a_tp$1. 1. You will have heard that you're "the average of the five people you spend the most time with". It's a good line from a motivational speaker and there is no research behind it - no study, no five, no average. We mention it because you've heard it, and because this session doesn't need it. 2. What is reasonably established is plainer: people's habits, moods and norms do influence the people around them. How much, and how far through a network, is genuinely argued about - separating real influence from the fact that similar people cluster together is hard and not settled. 3. The claim we're actually making is modest and you can test it yourself: notice how you feel after time with particular people. That's data you already have. Also replace "attract into your life" - flagged in the Block 6 charter scan, present in both the adult and teen journaling prompts.$s28a_tp$,
  video_link             = $s28a_vl$https://www.youtube.com/watch?v=jHeeHg_MXNE$s28a_vl$,
  video_description      = $s28a_vd$YouTube: Search 'values clarification ACT therapy Steven Hayes' or 'knowing your values psychology' for evidence-based content on values-based living. Also: search 'Russ Harris ACT values talk' for highly accessible content. Runtime ~15 min.$s28a_vd$,
  todays_theme           = $s28a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Values are not what we say we believe — they are what we demonstrate through our choices, our time, and our energy. Most people have never explicitly identified their core values. Most people's lives are organised around values they absorbed — approval, security, success — rather than values they chose. This week we get explicit.$s28a_tdt$,
  todays_world_vo_script = $s28a_tdv$Values are your GPS 'home' setting — every turn is easier once it's locked in. Today: name your true-north value and check one recent decision against it.$s28a_tdv$,
  ancient_wisdom_reframe = $s28a_aw$The Confucian tradition placed values — ren (benevolence), yi (righteousness), li (ritual propriety), zhi (wisdom), xin (integrity) — at the centre of the well-lived life. Not as abstract ideals but as living practices, tested and refined daily. The Daoist tradition added: values that are genuine arise naturally from the person's authentic nature. Forced values are performance. Chosen values are life.$s28a_aw$,
  ancient_wisdom_vo_script = $s28a_awv$The Confucian tradition placed values — ren (benevolence), yi (righteousness), li (ritual propriety), zhi (wisdom), xin (integrity) — at the centre of the well-lived life.$s28a_awv$,
  signal_metaphor        = $s28a_sm$Values are your GPS 'home' setting — every turn is easier once it's locked in. Today: name your true-north value and check one recent decision against it.$s28a_sm$,
  private_write_prompt   = $s28a_pw$What would you not trade, whatever you were offered for it?$s28a_pw$,
  experiential_exercise  = $s28a_ex$VALUES EXCAVATION: In your journal, work through these steps. First, list everything that you would say you value. Then: for each item, ask — is this genuinely mine, or inherited? Is it a means (to get something else) or an end (valuable in itself)? Narrow to your top 5 genuine, chosen values. For each, write: how would my life look different if I lived this value fully? Where am I most and least aligned with it right now? Finally: rank them. When they conflict — and they will — which wins? Share: your top three values and one place they currently show up in your life.$s28a_ex$,
  guided_reflection      = $s28a_gr$Sit quietly. Ask yourself: if my life were a clear expression of my most important values — what would it look like? Not a fantasy — a realistic, lived expression. What is present in that life that isn't fully present now? What is absent from that life that is currently consuming energy? The gap between where you are and that life is the design brief for Phase 3.$s28a_gr$,
  journaling_prompt      = $s28a_jp$Write about the community you're building - the relationships already here that you want to invest more in, and the kind of people you want to seek out and become useful to as you grow.$s28a_jp$,
  intention_prompt       = $s28a_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s28a_ip$,
  core_affirmation       = $s28a_ca$My values are mine — chosen, explicit, lived. They are the architecture of how I build.$s28a_ca$,
  weekly_practice_mon    = $s28a_pm$Make one decision today explicitly from your top value — not habit, not fear, not approval-seeking. Just the value. Notice what it feels like.$s28a_pm$,
  weekly_practice_wed    = $s28a_pw2$Share your top three values with someone who knows you well. Ask them if they see those values in how you currently live. Receive the answer honestly.$s28a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s28a_ps$Bring back: where did you live most fully from your values this week — and where did you notice the gap?$s28a_ps$,
  previous_week_callback = $s28a_pwc$$s28a_pwc$,
  facilitator_notes      = $s28a_fn$## Prep
The evidence. Schwartz's values theory is genuinely good work - ten value dimensions validated across a large number of cultures, with a reliable structure showing which values sit in tension with which. That tension is the useful part: security and self-direction genuinely pull against each other, and most people's stated-versus-lived gap sits exactly on one of those tensions. On the "values clarity reduces anxiety" claim in the teen track: the underlying work is the self-affirmation literature, where effects are real but modest and context-dependent. Say "helps people decide under pressure" rather than listing outcomes. We deliberately don't claim. That there is a correct set of values. That inherited values are automatically wrong - a member who examines a value from their upbringing and chooses to keep it has done the exercise perfectly.$s28a_fn$,
  updated_at = now()
WHERE week_number = 28 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s28t_st$Opening the Settings Menu$s28t_st$,
  theme_title            = $s28t_tt$$s28t_tt$,
  phase                  = 3,
  phase_name             = $s28t_pn$Rebuild$s28t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s28t_hk$Quick: what are your values? If you can list them confidently — what actually determines your choices day to day? If it's harder than expected, that's completely normal. Most people haven't done this work. Today we do.$s28t_hk$,
  s5_source_core_concept = $s28t_cc$Values aren't what you say you believe — they're what you demonstrate with your time, energy, and choices. Most people have never actually thought about what their values are. And most people are living primarily from absorbed values — other people's ideas about what matters — rather than ones they actually chose. This week we get explicit.$s28t_cc$,
  core_concept           = $s28t_cco$$s28t_cco$,
  teaching_points        = $s28t_tp$1. 1. Research shows that people who have clearly identified their values make better decisions under pressure, have less anxiety, experience more meaning, and report higher life satisfaction — because they have an internal compass rather than relying on external signals.
2. Values aren't the same as rules ('I should be kind'). They're directional — they describe how you want to move through the world, regardless of outcome. 'I am the kind of person who treats people with respect, even when it costs me something.'
3. Most teens' values are heavily influenced by social media, peer culture, and family — making it hard to distinguish what you actually value from what you've absorbed. The clarification practice is distinguishing the two.
4. Living from your values doesn't mean you're always consistent. It means you have a compass to return to when you drift. The compass is what Phase 3 is about building.$s28t_tp$,
  video_link             = $s28t_vl$https://www.youtube.com/watch?v=jHeeHg_MXNE$s28t_vl$,
  video_description      = $s28t_vd$YouTube: Search 'values clarification teen psychology' or 'knowing your values animated' for accessible content. Russ Harris on ACT values is excellent and accessible. Runtime ~10–15 min.$s28t_vd$,
  todays_theme           = $s28t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Values aren't what you say you believe — they're what you demonstrate with your time, energy, and choices. Most people have never actually thought about what their values are. And most people are living primarily from absorbed values — other people's ideas about what matters — rather than ones they actually chose. This week we get explicit.$s28t_tdt$,
  todays_world_vo_script = $s28t_tdv$Values are your GPS 'home' setting — every turn is easier once it's locked in. Today: name your true-north value and check one recent decision against it.$s28t_tdv$,
  ancient_wisdom_reframe = $s28t_aw$There's a powerful question from philosophy: 'How do you want to live?' Not what do you want to have or achieve — but how do you want to live? What qualities do you want to be true of how you show up every day? That question is the beginning of values. Today we answer it.$s28t_aw$,
  ancient_wisdom_vo_script = $s28t_awv$There's a powerful question from philosophy: 'How do you want to live?' Not what do you want to have or achieve — but how do you want to…$s28t_awv$,
  signal_metaphor        = $s28t_sm$Your values are your GPS 'home' setting — lock it in and choices get easier. Today: name your top one.$s28t_sm$,
  private_write_prompt   = $s28t_pw$What would you not give up, whatever you were offered?$s28t_pw$,
  experiential_exercise  = $s28t_ex$Rate yourself 1-10 on three things: sleep, movement, and being able to settle yourself when you're stressed. Then, separately and without a score: is there usually food around when you're hungry? That one isn't about you - it's about your situation, and some situations are harder than others. Pick your lowest score. What's one small change that's actually available to you this week? Not the perfect change. The available one. The "is there usually food around" phrasing is deliberate. It surfaces household food insecurity - which is real in Taupō - without asking a teenager to rate their own eating.$s28t_ex$,
  guided_reflection      = $s28t_gr$Close your eyes. Imagine living a day completely from your top values — every significant decision filtered through them. What does that day look like? How does it feel different from a typical day? Where are the biggest differences? That gap is the design brief for Phase 3.$s28t_gr$,
  journaling_prompt      = $s28t_jp$Write your personal values as 'I am the kind of person who...' statements — one for each of your top values. Read them back to yourself. Notice which ones feel true already and which ones are aspirational.$s28t_jp$,
  intention_prompt       = $s28t_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s28t_ip$,
  core_affirmation       = $s28t_ca$My values are mine — chosen, not absorbed. They are the compass I build from.$s28t_ca$,
  weekly_practice_mon    = $s28t_pm$Make one decision today explicitly from your top value. Notice what changes.$s28t_pm$,
  weekly_practice_wed    = $s28t_pw2$Share your top values with one person who knows you well. Ask: do you actually see these in me? Receive the answer.$s28t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s28t_ps$Bring back: where did you live most clearly from your values this week?$s28t_ps$,
  previous_week_callback = $s28t_pwc$$s28t_pwc$,
  facilitator_notes      = $s28t_fn$## Prep
The evidence. Schwartz's values theory is genuinely good work - ten value dimensions validated across a large number of cultures, with a reliable structure showing which values sit in tension with which. That tension is the useful part: security and self-direction genuinely pull against each other, and most people's stated-versus-lived gap sits exactly on one of those tensions. On the "values clarity reduces anxiety" claim in the teen track: the underlying work is the self-affirmation literature, where effects are real but modest and context-dependent. Say "helps people decide under pressure" rather than listing outcomes. We deliberately don't claim. That there is a correct set of values. That inherited values are automatically wrong - a member who examines a value from their upbringing and chooses to keep it has done the exercise perfectly.$s28t_fn$,
  updated_at = now()
WHERE week_number = 28 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s28c_st$Your Inner Compass$s28c_st$,
  theme_title            = $s28c_tt$$s28c_tt$,
  phase                  = 3,
  phase_name             = $s28c_pn$Rebuild$s28c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s28c_hk$What is the most important rule YOU have made for yourself — something you believe about how to treat people or how to live? Not a rule from school or home — something that feels most like yours.$s28c_hk$,
  s5_source_core_concept = $s28c_cc$Values are like the most important rules you make for yourself — not rules from other people, but the things YOU decide are most important about how you live and treat others. Today we find out what YOUR most important values are.$s28c_cc$,
  core_concept           = $s28c_cco$$s28c_cco$,
  teaching_points        = $s28c_tp$1. 1. Values are the things that matter most to us — what we believe is important about how we live and treat others.
2. Everyone's values are a little different — and that's what makes the world rich and interesting.
3. Some common values are: kindness, honesty, courage, fairness, creativity, friendship, family, fun, learning, helping others.
4. Knowing your values helps you make good decisions — when something feels wrong, it usually means it goes against one of your values.$s28c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s28c_sm$A compass points the way. Your kindness and honesty are like your own compass inside.$s28c_sm$,
  private_write_prompt   = $s28c_pw$What's the most important thing to you?$s28c_pw$,
  experiential_exercise  = $s28c_ex$THE VALUES COMPASS: Each child gets a large compass drawn on paper (pointing N, S, E, W). In the four directions, they write or draw their four most important values. Facilitator shares examples and helps with vocabulary. Then: present dilemmas and ask children to use their compass: 'Your friend asks you to keep a secret that worries you — which value guides you?' / 'Someone is being left out — which value helps you decide what to do?' Share: your compass and your most important direction.$s28c_ex$,
  guided_reflection      = $s28c_gr$Close your eyes. Think about the value that feels MOST important to you. When have you lived it really well? How did it feel? Now think: when did you NOT live it and felt bad afterwards? What happened? Your compass was trying to guide you. Today we make it stronger.$s28c_gr$,
  journaling_prompt      = $s28c_jp$Draw your inner compass. Write your four most important values in the four directions. Decorate it so it looks like YOU.$s28c_jp$,
  intention_prompt       = $s28c_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s28c_ip$,
  core_affirmation       = $s28c_ca$My values are my compass. They help me know who I am and how to treat others.$s28c_ca$,
  weekly_practice_mon    = $s28c_pm$When you face a choice today, use your compass: 'Which of my values guides me here?' Tell someone about it.$s28c_pm$,
  weekly_practice_wed    = $s28c_pw2$Show your compass to a grown-up. Tell them about the values you chose. Ask them what their compass points to.$s28c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s28c_ps$Bring your compass back! Did you use it this week? What happened?$s28c_ps$,
  previous_week_callback = $s28c_pwc$$s28c_pwc$,
  facilitator_notes      = $s28c_fn$## Prep
The evidence. Schwartz's values theory is genuinely good work - ten value dimensions validated across a large number of cultures, with a reliable structure showing which values sit in tension with which. That tension is the useful part: security and self-direction genuinely pull against each other, and most people's stated-versus-lived gap sits exactly on one of those tensions. On the "values clarity reduces anxiety" claim in the teen track: the underlying work is the self-affirmation literature, where effects are real but modest and context-dependent. Say "helps people decide under pressure" rather than listing outcomes. We deliberately don't claim. That there is a correct set of values. That inherited values are automatically wrong - a member who examines a value from their upbringing and chooses to keep it has done the exercise perfectly.$s28c_fn$,
  updated_at = now()
WHERE week_number = 28 AND audience = 'Child';

-- Week 29 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw29_theme$$cw29_theme$,
  the_territory        = $cw29_terr$Making the behaviour you chose easier to remember and easier to start$cw29_terr$,
  opening_question     = $cw29_oq$When has changing the setup helped more than trying to motivate yourself? Passing is full participation.$cw29_oq$,
  week_type            = $cw29_wt$Standard$cw29_wt$,
  reflective_question  = $cw29_rq$Across the week, which setup changes affected behaviour and which problems turned out not to be environmental?$cw29_rq$,
  interactive_activity = $cw29_ia$FRICTION AUDIT. Write: behaviour / current cue / friction / one environmental change / possible downside / how I will know whether it helped. Sharing is optional.$cw29_ia$,
  kids_game = $cw29_g$One Brick at a Time — Every child adds one block to a shared tower each time they complete a small action — ten star jumps, one kind word, tying a lace. Fast building is not allowed. One brick, one action. WHY IT FITS: Small things done again and again build something.$cw29_g$,
  kids_game_equipment = $cw29_ge$Building blocks or cups$cw29_ge$,
  kids_game_under5 = $cw29_g5$Under-5s add a block for every star jump. Big blocks, low tower, lots of cheering.$cw29_g5$,
  updated_at = now()
WHERE week_number = 29;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s29a_st$Installing the New Architecture$s29a_st$,
  theme_title            = $s29a_tt$$s29a_tt$,
  phase                  = 3,
  phase_name             = $s29a_pn$Rebuild$s29a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s29a_hk$Look at one behaviour from Weeks 27–28 and ask: What in my environment currently reminds, enables or blocks it?$s29a_hk$,
  s5_source_core_concept = $s29a_cc$Today the adult room works with environmental design. We identify one cue or friction point and change it enough to create a fairer test of the behaviour. The environment influences action; it does not make people puppets or erase structural constraints.$s29a_cc$,
  core_concept           = $s29a_cco$$s29a_cco$,
  teaching_points        = $s29a_tp$1. Habit research supports the role of stable cues and contexts in repeated behaviour.
2. Make it obvious/easy is James Clear's practical synthesis, not research he personally conducted.
3. Friction matters: adding or removing steps can change the likelihood that a behaviour starts, though effect size depends on the behaviour and context.
4. Environment is not everything. Money, health, caring responsibilities, access and motivation still matter.
5. The best experiment changes one thing and observes rather than redesigning an entire life at once.$s29a_tp$,
  video_description      = $s29a_vd$Retain the current Week 29 assignment pending review. If it features James Clear, identify him as a writer synthesising habit research rather than the source of the findings.$s29a_vd$,
  todays_theme           = $s29a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Notifications, object placement, login steps, default settings and preparation all change how easy a behaviour is to start.$s29a_tdt$,
  todays_world_vo_script = $s29a_tdv$A better setup can reduce the amount of remembering required.$s29a_tdv$,
  ancient_wisdom_reframe = $s29a_aw$Use the idea of arranging conditions before action as a practical lens, not proof that ancient traditions anticipated behavioural science.$s29a_aw$,
  ancient_wisdom_vo_script = $s29a_awv$Preparation can make the next useful action easier without guaranteeing it.$s29a_awv$,
  signal_metaphor        = $s29a_sm$A well-placed sign does not drive the car; it makes the turn easier to notice.$s29a_sm$,
  private_write_prompt   = $s29a_pw$Choose one behaviour and list the cue, first step and one friction point in the current setup.$s29a_pw$,
  experiential_exercise  = $s29a_ex$FRICTION AUDIT. Write: behaviour / current cue / friction / one environmental change / possible downside / how I will know whether it helped. Sharing is optional.$s29a_ex$,
  guided_reflection      = $s29a_gr$Keep your eyes open.
Write:
What I want to make easier:
What currently gets in the way:
One setup change:
What this change cannot solve:$s29a_gr$,
  journaling_prompt      = $s29a_jp$Across the week, which setup changes affected behaviour and which problems turned out not to be environmental?$s29a_jp$,
  intention_prompt       = $s29a_ip$When I prepare [context], I will place/remove/change [specific cue or friction] to support [behaviour].$s29a_ip$,
  core_affirmation       = $s29a_ca$I can shape some conditions around my behaviour without pretending the setup controls everything.$s29a_ca$,
  weekly_practice_mon    = $s29a_pm$Change one cue or friction point.$s29a_pm$,
  weekly_practice_wed    = $s29a_pw2$Observe the behaviour without adding another change.$s29a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s29a_ps$Bring one observation about an environment change that made a chosen behaviour easier, harder or unchanged. Sharing is optional.$s29a_ps$,
  previous_week_callback = $s29a_pwc$$s29a_pwc$,
  facilitator_notes      = $s29a_fn$## Aim
Teach practical environmental design while keeping writer/researcher attribution clean and constraints visible.
## Run the room
Do not say motivation is useless, environment is destiny or successful people simply design better systems. Keep experiments small and reversible.
## Why this week exists — the evidence
Habit and behavioural-economics research shows that cues, defaults and friction can influence action. James Clear popularises these principles but is not the primary empirical source.
Real-world anchor: putting medication beside a morning routine cue can make remembering easier; it still does not solve access, side effects or medical decisions. Setup helps one part of the problem.
## Evidence quality
Moderate to strong for context/cue effects; variable by behaviour for specific friction interventions.
## We deliberately do not claim
- We do not claim James Clear discovered or tested the underlying habit mechanisms.
- We do not claim environment beats motivation in every case.
- We do not claim making something easy guarantees repetition or identity change.
- We do not treat structural constraints as poor design choices.
## Source trail
- Wood and colleagues — habit/context research.
- Behavioural-economics/default/friction literature.
- Clear, J. — writer and synthesis source only.$s29a_fn$,
  updated_at = now()
WHERE week_number = 29 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s29t_st$Designing the Practice$s29t_st$,
  theme_title            = $s29t_tt$$s29t_tt$,
  phase                  = 3,
  phase_name             = $s29t_pn$Rebuild$s29t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s29t_hk$Think of one quality from your identity builder in Week 27. Now: what's the smallest daily habit that would actually express that quality? Not a big commitment — the tiniest version that still counts.$s29t_hk$,
  s5_source_core_concept = $s29t_cc$We mapped habits in Phase 1 and cleared some in Phase 2. Now we build the ones that actually express who you're choosing to be. Not willpower-based habits that burn out — identity-based ones that compound quietly. This is where Phase 3 gets real.$s29t_cc$,
  core_concept           = $s29t_cco$$s29t_cco$,
  teaching_points        = $s29t_tp$1. 1. Research on habit formation shows that the most durable habits are identity-based ('I am the kind of person who reads every day') rather than outcome-based ('I want to read 20 books this year'). The identity determines the action; the outcome follows.
2. The minimum viable habit concept: the smallest version of a habit that still moves in the right direction is more valuable than the ideal version that never happens. 2 minutes of meditation every day beats 30-minute sessions twice a month.
3. Habit stacking (anchoring a new habit to an existing one) is the most reliable trigger system. 'After I [existing habit], I will [new habit].' No new decision required — just a new follow-on.
4. Environment design is more powerful than motivation. Put the guitar on the stand in your room, not in the case in the wardrobe. Put the book on your desk, not the shelf. Make the desired behaviour the easiest option.$s29t_tp$,
  video_link             = $s29t_vl$https://www.youtube.com/watch?v=W1eYrhGeffc$s29t_vl$,
  video_description      = $s29t_vd$YouTube: James Clear on atomic habits — search 'James Clear atomic habits summary' for short accessible versions. Also: BJ Fogg 'Tiny Habits' for the minimum viable approach. Runtime ~10–15 min.$s29t_vd$,
  todays_theme           = $s29t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
We mapped habits in Phase 1 and cleared some in Phase 2. Now we build the ones that actually express who you're choosing to be. Not willpower-based habits that burn out — identity-based ones that compound quietly. This is where Phase 3 gets real.$s29t_tdt$,
  todays_world_vo_script = $s29t_tdv$You don't get fit from one epic gym session — you get fit from showing up small and often; identity works the same.$s29t_tdv$,
  ancient_wisdom_reframe = $s29t_aw$Small consistent practice beats large inconsistent effort every time. Not dramatic. Just regular. The river doesn't carve the canyon in one rush — it does it through constant, patient movement in one direction. That's the practice.$s29t_aw$,
  ancient_wisdom_vo_script = $s29t_awv$Small consistent practice beats large inconsistent effort every time. Not dramatic. Just regular.$s29t_awv$,
  signal_metaphor        = $s29t_sm$You don't level up in one epic session — you grind small and daily. Today: pick one 1% habit to repeat.$s29t_sm$,
  private_write_prompt   = $s29t_pw$What do you do every day that's quietly making you someone?$s29t_pw$,
  experiential_exercise  = $s29t_ex$HABIT DESIGN: Choose two habits to build — one for your inner life (mind, reflection, learning) and one for your outer life (body, relationships, creative expression). For each: Write the identity it expresses ('I am the kind of person who...'). Define the SMALLEST possible daily version. Identify the habit stack anchor. Design one environmental change to support it. Share: your two minimum viable habits.$s29t_ex$,
  guided_reflection      = $s29t_gr$Close your eyes. Imagine your daily life in six months if you consistently showed up for these two habits. Not dramatically transformed — just quietly, consistently yourself. What compounds? What becomes automatic? What does that version of you feel like? That's available. Six months from today. Starting now.$s29t_gr$,
  journaling_prompt      = $s29t_jp$Write your two-habit design out in full — identity statement, minimum version, anchor, environment change.$s29t_jp$,
  intention_prompt       = $s29t_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s29t_ip$,
  core_affirmation       = $s29t_ca$I build the person I'm becoming one small, consistent habit at a time.$s29t_ca$,
  weekly_practice_mon    = $s29t_pm$Start your first minimum habit TODAY. Doesn't have to be perfect. Just has to happen.$s29t_pm$,
  weekly_practice_wed    = $s29t_pw2$Tell one person your identity-based habit and the minimum version. Ask them to check in with you next week.$s29t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s29t_ps$Bring back: how many days did you show up? What helped? What got in the way?$s29t_ps$,
  previous_week_callback = $s29t_pwc$$s29t_pwc$,
  facilitator_notes      = $s29t_fn$## Prep
The evidence, properly this time. Lally (66 days, 18-254, one missed day doesn't reset) and Gollwitzer & Sheeran (d = 0.65 for if-then plans). See §2.1. Do not let anyone leave with a resolution instead of a cue. The minimum viable habit is the whole technique. The existing notes are right that people are surprised by how small it should be. Frame the smallness as the mechanism, not a compromise - a habit that survives a bad week is worth more than one that's impressive for nine days. We deliberately don't claim. That 1% compounds. That James Clear conducted research. That habits take any particular number of days.$s29t_fn$,
  updated_at = now()
WHERE week_number = 29 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s29c_st$Watering Your Garden$s29c_st$,
  theme_title            = $s29c_tt$$s29c_tt$,
  phase                  = 3,
  phase_name             = $s29c_pn$Rebuild$s29c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s29c_hk$What is something you already do every day that has made you better at something or made you feel good about yourself? (Reading, practising a sport, being kind, helping someone.) How did that habit start?$s29c_hk$,
  s5_source_core_concept = $s29c_cc$Habits are things we practise so often they become automatic — we do them without even thinking. Today we think about the habits that GROW us — the small things we do every day that make us more of who we want to be.$s29c_cc$,
  core_concept           = $s29c_cco$$s29c_cco$,
  teaching_points        = $s29c_tp$1. 1. A habit is something you do so regularly that it becomes almost automatic.
2. The habits we practise build who we are — a little bit at a time.
3. Even tiny habits matter! Five minutes of reading every day adds up to over 30 hours in a year.
4. The best habits are ones that help us grow into the person we want to be.$s29c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s29c_sm$A tiny seed watered every day grows big. Small good habits grow YOU big too.$s29c_sm$,
  private_write_prompt   = $s29c_pw$What do you do every day that makes you a bit better at something?$s29c_pw$,
  experiential_exercise  = $s29c_ex$THE HABIT GARDEN: Each child gets a garden template with 3 plant pots. In each pot, they draw or write a small daily habit they want to grow — something that will help them build one of their quality-bricks from Week 27. Then they write: what's the SMALLEST daily version? (E.g. 'I will read for 5 minutes before bed' / 'I will say one kind thing to someone every day' / 'I will draw something for 3 minutes.'). Share: their three habit seeds and the smallest daily version of each.$s29c_ex$,
  guided_reflection      = $s29c_gr$Close your eyes. Imagine watering your three habit plants every single day for three months. Picture them growing — slowly, steadily. What does your garden look like after three months? How do YOU feel? That garden is available to you. Starting today.$s29c_gr$,
  journaling_prompt      = $s29c_jp$Draw your habit garden in full — name the plants, draw how they might look when they've grown!$s29c_jp$,
  intention_prompt       = $s29c_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s29c_ip$,
  core_affirmation       = $s29c_ca$Small daily habits grow into big wonderful things. I water my garden every day.$s29c_ca$,
  weekly_practice_mon    = $s29c_pm$Start ONE of your habit plants today — the tiniest version. Just begin. Tell someone about it tonight.$s29c_pm$,
  weekly_practice_wed    = $s29c_pw2$Show a grown-up your habit garden. Ask them what habit they wish they had started when they were your age.$s29c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s29c_ps$Bring back: how many days did you water your habit plant? What happened?$s29c_ps$,
  previous_week_callback = $s29c_pwc$$s29c_pwc$,
  facilitator_notes      = $s29c_fn$## Prep
The evidence, properly this time. Lally (66 days, 18-254, one missed day doesn't reset) and Gollwitzer & Sheeran (d = 0.65 for if-then plans). See §2.1. Do not let anyone leave with a resolution instead of a cue. The minimum viable habit is the whole technique. The existing notes are right that people are surprised by how small it should be. Frame the smallness as the mechanism, not a compromise - a habit that survives a bad week is worth more than one that's impressive for nine days. We deliberately don't claim. That 1% compounds. That James Clear conducted research. That habits take any particular number of days.$s29c_fn$,
  updated_at = now()
WHERE week_number = 29 AND audience = 'Child';

-- Week 30 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw30_theme$$cw30_theme$,
  the_territory        = $cw30_terr$Sleep, food, moving, resting$cw30_terr$,
  opening_question     = $cw30_oq$What does your body need more of?$cw30_oq$,
  week_type            = $cw30_wt$Standard$cw30_wt$,
  reflective_question  = $cw30_rq$Write a 'body foundation protocol' — your non-negotiable minimums for sleep, movement, nourishment, and regulation this week. Make it realistic, not aspirational.$cw30_rq$,
  interactive_activity = $cw30_ia$BODY FOUNDATION AUDIT: For each of the four areas (sleep, movement, nourishment, nervous system), write: current state honestly, what the gap is between current and what you know you need, and one specific, small change that would most move the needle. Prioritise — which of the four is most foundational for everything else? That one comes first. Share: your highest-leverage body foundation change and the specific small version of it.$cw30_ia$,
  kids_game = $cw30_g$Foundation Wobble — Teams build the tallest tower they can on a wobbly base (a cushion). Then rebuild on a firm one. Same blocks, different base. WHY IT FITS: What you build sits on how you sleep, eat and move.$cw30_g$,
  kids_game_equipment = $cw30_ge$Blocks, cushions, firm boards$cw30_ge$,
  kids_game_under5 = $cw30_g5$Under-5s build on the cushion and knock it over. Then build on the floor. Compare heights with them.$cw30_g5$,
  updated_at = now()
WHERE week_number = 30;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s30a_st$The Hardware Layer$s30a_st$,
  theme_title            = $s30a_tt$$s30a_tt$,
  phase                  = 3,
  phase_name             = $s30a_pn$Rebuild$s30a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s30a_hk$Rate yourself honestly in four areas on a scale of 1–10: sleep (quantity and quality), movement (frequency and variety), nourishment (how well you actually feed yourself), nervous system regulation (capacity to return to calm after stress). What does this tell you about the foundation you're building on?$s30a_hk$,
  s5_source_core_concept = $s30a_cc$The body is not the vehicle that carries you through your personal development journey — it IS the journey. Sleep, movement, nourishment, and breath are not the lifestyle habits you'll get to once the important work is done. They are the substrate of every other capacity: attention, emotional regulation, resilience, creativity, and connection all run on physiological hardware.$s30a_cc$,
  core_concept           = $s30a_cco$$s30a_cco$,
  teaching_points        = $s30a_tp$1. 1. Sleep research (Matthew Walker) is unequivocal: insufficient sleep impairs every human faculty — emotional regulation, decision-making, memory consolidation, immune function, and longevity. It is the single highest-leverage physiological intervention available, and the most commonly neglected.
2. Movement research shows that regular physical activity is as effective as antidepressants for mild-to-moderate depression, significantly improves cognitive function and neuroplasticity, and is one of the strongest predictors of healthy ageing. The dose needed is remarkably low — 150 minutes of moderate activity per week produces most of the benefit.
3. The gut microbiome research (Mayer, Cryan) is demonstrating bidirectional gut-brain communication that influences mood, anxiety, and cognitive function. What we eat shapes how we think and feel at a physiological level that most people dramatically underestimate.
4. Nervous system regulation — the capacity to move between arousal states with some degree of volition — is trainable. Breath practices (particularly extended exhale breathing) have the strongest evidence base for directly modulating the autonomic nervous system toward parasympathetic (rest and recover) activation.$s30a_tp$,
  video_link             = $s30a_vl$https://www.youtube.com/watch?v=5MuIMqhT8oY$s30a_vl$,
  video_description      = $s30a_vd$YouTube: 'Sleep is Your Superpower' by Matthew Walker — the most important sleep research available, presented accessibly. Runtime ~19 min. Also: search 'exercise antidepressant research' for the movement evidence base.$s30a_vd$,
  todays_theme           = $s30a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
The body is not the vehicle that carries you through your personal development journey — it IS the journey. Sleep, movement, nourishment, and breath are not the lifestyle habits you'll get to once the important work is done. They are the substrate of every other capacity: attention, emotional regulation, resilience, creativity, and connection all run on physiological hardware.$s30a_tdt$,
  todays_world_vo_script = $s30a_tdv$Your body is the phone the whole day runs on, and sleep, movement, food and calm are the four charging cables.$s30a_tdv$,
  ancient_wisdom_reframe = $s30a_aw$The ancient mind-body traditions were never body practices with a spiritual dimension, or spiritual practices with a physical component. They were one thing: the understanding that consciousness and physicality are not separate. Qigong, yoga, tai chi, meditation — all are practices of the integrated whole. The rebuild honours the whole.$s30a_aw$,
  ancient_wisdom_vo_script = $s30a_awv$The ancient mind-body traditions were never body practices with a spiritual dimension, or spiritual practices with a physical component.$s30a_awv$,
  signal_metaphor        = $s30a_sm$Your body is the phone the whole day runs on, and sleep, movement, food and calm are the four charging cables. Today: plug in the one that's most drained.$s30a_sm$,
  private_write_prompt   = $s30a_pw$What does your body need that you have been overriding?$s30a_pw$,
  experiential_exercise  = $s30a_ex$BODY FOUNDATION AUDIT: For each of the four areas (sleep, movement, nourishment, nervous system), write: current state honestly, what the gap is between current and what you know you need, and one specific, small change that would most move the needle. Prioritise — which of the four is most foundational for everything else? That one comes first. Share: your highest-leverage body foundation change and the specific small version of it.$s30a_ex$,
  guided_reflection      = $s30a_gr$Sit quietly. Take three slow breaths — longer exhale than inhale. Notice what shifts in your body in 30 seconds of deliberate breathing. This is one of the most direct tools available for nervous system regulation — and it costs nothing, takes 30 seconds, and works immediately. The body is more responsive than we've been taught.$s30a_gr$,
  journaling_prompt      = $s30a_jp$Write a 'body foundation protocol' — your non-negotiable minimums for sleep, movement, nourishment, and regulation this week. Make it realistic, not aspirational.$s30a_jp$,
  intention_prompt       = $s30a_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s30a_ip$,
  core_affirmation       = $s30a_ca$My body is not separate from my growth. It is the ground it grows from.$s30a_ca$,
  weekly_practice_mon    = $s30a_pm$Implement one body foundation habit today — the smallest possible version. If it's sleep: go to bed 15 minutes earlier. If it's movement: take a 10-minute walk. If it's regulation: three extended exhale breaths before any stressful moment.$s30a_pm$,
  weekly_practice_wed    = $s30a_pw2$Tell one person about your body foundation priority. Ask them about theirs — and share what you each notice about the connection between physical state and everything else.$s30a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s30a_ps$Bring back: what happened when you prioritised your body foundation this week? What changed in your energy, mood, or capacity?$s30a_ps$,
  previous_week_callback = $s30a_pwc$$s30a_pwc$,
  facilitator_notes      = $s30a_fn$## Prep
The food rules are not guidance; they are requirements, and they apply to every session for the rest of the year. The evidence. Sleep is the strongest claim available and it doesn't need a popular book behind it. Slow breathing with an extended exhale has good support as an immediate self-regulation tool and is the best thirty-second intervention in the curriculum. Tone. The adult note's instruction - warmth and zero judgment, because most adults are chronically under-resourced and ashamed of it - is exactly right and should be read before every delivery. Structural honesty. Shift work, night feeds, chronic pain, a second job, and no money for food are not habit problems. Name that. A session that implies otherwise loses the room's trust permanently and deserves to. We deliberately don't claim. That sleep clears brain waste - unsettled. That Walker's book is authoritative. Anything at all about weight, diet, or what anyone should eat.$s30a_fn$,
  updated_at = now()
WHERE week_number = 30 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s30t_st$Charging the Hardware$s30t_st$,
  theme_title            = $s30t_tt$$s30t_tt$,
  phase                  = 3,
  phase_name             = $s30t_pn$Rebuild$s30t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s30t_hk$Honest check-in: How many hours of sleep did you get last night? When did you last move your body in a way that felt good? How did you fuel yourself today? No judgment — just data. What does this baseline tell you?$s30t_hk$,
  s5_source_core_concept = $s30t_cc$Everything we've been building — self-awareness, emotional intelligence, identity, values — runs on your physical hardware. Sleep, movement, and how you fuel yourself are not separate from personal development. They ARE personal development. This week we treat the body like the foundation it is.$s30t_cc$,
  core_concept           = $s30t_cco$$s30t_cco$,
  teaching_points        = $s30t_tp$1. 1. Sleep science is unambiguous for teens specifically: the teenage brain requires 8–10 hours of sleep per night for optimal function. During sleep, the brain consolidates learning, regulates emotion, clears metabolic waste, and builds new neural connections. Chronic sleep deprivation in teens is associated with higher rates of depression, anxiety, impulsivity, and academic difficulty.
2. Movement of any kind — walking, sport, dance, cycling — increases brain-derived neurotrophic factor (BDNF), literally fertiliser for the brain. Research shows regular movement improves mood, reduces anxiety, enhances learning and memory, and builds resilience more reliably than almost any other intervention.
3. The gut-brain axis research shows that what you eat directly affects mood and cognitive function — not as metaphor but as neurochemistry. High-fibre, diverse, minimally processed food genuinely produces a different brain chemistry to ultra-processed food.
4. Breath is the only autonomic function you can consciously control — which means it's one of the most direct levers available for stress regulation. Extended exhale breathing (exhale longer than inhale) activates the parasympathetic nervous system within seconds.$s30t_tp$,
  video_link             = $s30t_vl$https://www.youtube.com/watch?v=5MuIMqhT8oY$s30t_vl$,
  video_description      = $s30t_vd$YouTube: 'Sleep is Your Superpower' by Matthew Walker — directly relevant to teens and highly engaging. Runtime ~19 min. Also: search 'exercise and teen mental health research' for movement evidence.$s30t_vd$,
  todays_theme           = $s30t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Everything we've been building — self-awareness, emotional intelligence, identity, values — runs on your physical hardware. Sleep, movement, and how you fuel yourself are not separate from personal development. They ARE personal development. This week we treat the body like the foundation it is.$s30t_tdt$,
  todays_world_vo_script = $s30t_tdv$Your body is the phone the whole day runs on, and sleep, movement, food and calm are the four charging cables.$s30t_tdv$,
  ancient_wisdom_reframe = $s30t_aw$Ancient warriors, scholars, and sages all had one thing in common: they treated the body with deliberate respect. Not vanity. Not performance. Foundation. The body carries the mind carries the soul — and they cannot be separated. What you do for your body, you do for everything else.$s30t_aw$,
  ancient_wisdom_vo_script = $s30t_awv$Ancient warriors, scholars, and sages all had one thing in common: they treated the body with deliberate respect. Not vanity. Not performance. Foundation.$s30t_awv$,
  signal_metaphor        = $s30t_sm$Your body's the console everything runs on — sleep, food, moving and chill are the charge cables. Today: plug in the one that's flat.$s30t_sm$,
  private_write_prompt   = $s30t_pw$What does your body need that you keep ignoring?$s30t_pw$,
  experiential_exercise  = $s30t_ex$BODY AUDIT: Rate yourself 1–10 in four areas: sleep, movement, nourishment, ability to calm down when stressed. For your lowest score: what one small change would most move the needle? Not the perfect change — the most accessible one. Design the minimum viable version and the environment change that supports it. Share: your lowest area and your one small upgrade.$s30t_ex$,
  guided_reflection      = $s30t_gr$Three slow breaths right now — breathe in for 4 counts, out for 6 counts. Notice what shifts in 30 seconds. That's your nervous system responding to direct input. You have more control than you realise — and you don't need an app or a programme. Just your breath.$s30t_gr$,
  journaling_prompt      = $s30t_jp$Write your minimum body foundation protocol for this week — what you commit to for sleep, movement, nourishment, and one stress regulation practice.$s30t_jp$,
  intention_prompt       = $s30t_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s30t_ip$,
  core_affirmation       = $s30t_ca$My body is the foundation everything else grows from. I take care of it like it matters — because it does.$s30t_ca$,
  weekly_practice_mon    = $s30t_pm$Implement your lowest-score area change today — the smallest possible version. Track it for seven days.$s30t_pm$,
  weekly_practice_wed    = $s30t_pw2$Tell one person about your body foundation goal. Ask them what they've noticed about the connection between their physical state and how they show up mentally and emotionally.$s30t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s30t_ps$Bring back: what changed in your mood, energy, or capacity when you prioritised your body this week?$s30t_ps$,
  previous_week_callback = $s30t_pwc$$s30t_pwc$,
  facilitator_notes      = $s30t_fn$## Prep
The food rules are not guidance; they are requirements, and they apply to every session for the rest of the year. The evidence. Sleep is the strongest claim available and it doesn't need a popular book behind it. Slow breathing with an extended exhale has good support as an immediate self-regulation tool and is the best thirty-second intervention in the curriculum. Tone. The adult note's instruction - warmth and zero judgment, because most adults are chronically under-resourced and ashamed of it - is exactly right and should be read before every delivery. Structural honesty. Shift work, night feeds, chronic pain, a second job, and no money for food are not habit problems. Name that. A session that implies otherwise loses the room's trust permanently and deserves to. We deliberately don't claim. That sleep clears brain waste - unsettled. That Walker's book is authoritative. Anything at all about weight, diet, or what anyone should eat.$s30t_fn$,
  updated_at = now()
WHERE week_number = 30 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s30c_st$Charging Your Superhero Suit$s30c_st$,
  theme_title            = $s30c_tt$$s30c_tt$,
  phase                  = 3,
  phase_name             = $s30c_pn$Rebuild$s30c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s30c_hk$Can you tell when your body needs more sleep? How do you feel? What about when you haven't moved around enough — how does that feel? What about when you've eaten mostly sugary things all day? Your body sends signals — let's learn to read them.$s30c_hk$,
  s5_source_core_concept = $s30c_cc$Our bodies are the most amazing machines — they need certain things to work really well: good sleep, movement, healthy food, and ways to calm down when we feel stressed. Today we learn how to take care of our bodies so they can help us feel and be our best.$s30c_cc$,
  core_concept           = $s30c_cco$$s30c_cco$,
  teaching_points        = $s30c_tp$1. 1. Your body needs four things to work really well: SLEEP (to grow, learn, and feel okay), MOVEMENT (to feel energised and happy), GOOD FOOD (to have energy and think clearly), and CALM (ways to settle down when things feel overwhelming).
2. When we don't get enough of these, everything gets harder — it's harder to concentrate, control our feelings, and be kind to others.
3. The good news: even small improvements in any of these four things can make a big difference.
4. Taking care of your body is one of the kindest things you can do for yourself AND for everyone around you.$s30c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s30c_sm$Your body is like a superhero suit — sleep, food, moving and calm keep it charged up!$s30c_sm$,
  private_write_prompt   = $s30c_pw$What does your body need more of?$s30c_pw$,
  experiential_exercise  = $s30c_ex$SUPERHERO SUIT CHECK: Each child rates their four areas with a simple traffic light (red/orange/green): Sleep, Movement, Food, Calm-Down Skills. Then for their most orange or red area: 'What is ONE small thing I could do to give this area a bit more green?' Facilitator works through examples: sleep (same bedtime every night, dark room), movement (playing outside, dancing, walking), food (one more piece of fruit, water before lunch), calm (three deep breaths, a favourite calming activity). Share: one upgrade they're committing to.$s30c_ex$,
  guided_reflection      = $s30c_gr$Let's practise charging our suits right now. Everyone: sit up tall, put both feet on the floor, take three slow deep breaths. Breathe in while I count to 4 — and out while I count to 6. Did you feel something shift? That's your calm-down power — and it works any time, any place.$s30c_gr$,
  journaling_prompt      = $s30c_jp$Draw your superhero suit charged up and ready. Label the four charging stations around it.$s30c_jp$,
  intention_prompt       = $s30c_ip$Given what you noticed today, what is one thing you will do differently before next Sunday?$s30c_ip$,
  core_affirmation       = $s30c_ca$When I take care of my body, I can be the best version of me. Sleep, movement, food, and calm — my four superchargers.$s30c_ca$,
  weekly_practice_mon    = $s30c_pm$Try ONE of your charging habits today — and notice how it affects how you feel.$s30c_pm$,
  weekly_practice_wed    = $s30c_pw2$Tell a grown-up about the four charging areas. Ask them which one they find hardest to keep charged. Compare answers!$s30c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s30c_ps$Bring back your superhero suit drawing — has anything changed in your charging levels?$s30c_ps$,
  previous_week_callback = $s30c_pwc$$s30c_pwc$,
  facilitator_notes      = $s30c_fn$## Prep
The food rules are not guidance; they are requirements, and they apply to every session for the rest of the year. The evidence. Sleep is the strongest claim available and it doesn't need a popular book behind it. Slow breathing with an extended exhale has good support as an immediate self-regulation tool and is the best thirty-second intervention in the curriculum. Tone. The adult note's instruction - warmth and zero judgment, because most adults are chronically under-resourced and ashamed of it - is exactly right and should be read before every delivery. Structural honesty. Shift work, night feeds, chronic pain, a second job, and no money for food are not habit problems. Name that. A session that implies otherwise loses the room's trust permanently and deserves to. We deliberately don't claim. That sleep clears brain waste - unsettled. That Walker's book is authoritative. Anything at all about weight, diet, or what anyone should eat.$s30c_fn$,
  updated_at = now()
WHERE week_number = 30 AND audience = 'Child';

-- Week 31 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw31_theme$$cw31_theme$,
  the_territory        = $cw31_terr$How social settings can make some behaviours easier to repeat$cw31_terr$,
  opening_question     = $cw31_oq$What is the difference between social influence and social destiny? Passing is full participation.$cw31_oq$,
  week_type            = $cw31_wt$Standard$cw31_wt$,
  reflective_question  = $cw31_rq$Across the week, which social settings genuinely changed the ease of a behaviour, and which outcomes turned out to depend more on your own capacity, resources or choices?$cw31_rq$,
  interactive_activity = $cw31_ia$SOCIAL CONTEXT MAP. Write: behaviour / setting / norm or cue / practical support / friction / one modest change. Possible changes: ask for an accountability reminder, move a routine, join an additional group, change a notification pattern, or keep the setting unchanged. Sharing is optional.$cw31_ia$,
  kids_picture_book    = $cw31_bk$Swimmy$cw31_bk$,
  kids_picture_book_author = $cw31_bka$Leo Lionni$cw31_bka$,
  kids_picture_book_note = $cw31_bkn$WHY THIS BOOK: Use it to show how group organisation can change what is possible without teaching that everyone must conform or that one leader controls the group.
READ-ALOUD: Read live from a purchased copy.$cw31_bkn$,
  kids_picture_book_question = $cw31_bkq$What became easier when the fish worked together? Did every fish have to be exactly the same?$cw31_bkq$,
  kids_nz_alternative = $cw31_nz$Not yet selected$cw31_nz$,
  kids_nz_alternative_author = $cw31_nza$use the main book until a reviewed Aotearoa title fits.$cw31_nza$,
  kids_nz_alternative_note = $cw31_nzn$Future alternatives should emphasise cooperation without ranking people as positive or negative influences.$cw31_nzn$,
  kids_colouring_prompt = $cw31_col$Colour three places with one helpful reminder sign in each.$cw31_col$,
  kids_game = $cw31_g$ROOM ROUTINE. Create one new neutral group routine together, such as returning crayons to a labelled tray. Practise twice. No competition and no praise for conformity beyond the task.$cw31_g$,
  kids_game_equipment = $cw31_ge$Place sheets; cue signs; crayons.$cw31_ge$,
  kids_game_under5 = $cw31_g5$Use two settings and one simple cue in each.$cw31_g5$,
  updated_at = now()
WHERE week_number = 31;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s31a_st$Designing the Social Environment$s31a_st$,
  theme_title            = $s31a_tt$$s31a_tt$,
  phase                  = 3,
  phase_name             = $s31a_pn$Rebuild$s31a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s31a_hk$Choose one behaviour from Rebuild and write where it is easiest and hardest to do. Focus on settings and routines before judging people.$s31a_hk$,
  s5_source_core_concept = $s31a_cc$Today the adult room maps how social contexts affect a chosen behaviour. We look at norms, invitations, routines, access and support without using motivational slogans as science or treating friends as inputs to optimise.$s31a_cc$,
  core_concept           = $s31a_cco$$s31a_cco$,
  teaching_points        = $s31a_tp$1. Social norms and modelling can influence behaviour, but effect sizes and mechanisms vary by behaviour and network.
2. You are the average of the five people you spend the most time with is a motivational line, not a research finding. There is no scientific five-person formula for identity, income, health or success.
3. Christakis and Fowler reported associations spreading across social networks, including several degrees of separation. Those observational findings are debated and do not establish simple causal friends' friends' friends influence you rules.
4. Long-running relationship research, including the Harvard Study of Adult Development, supports associations between relationship quality and wellbeing/health. It does not prove relationship quality is the single strongest predictor of life outcomes or outweighs nearly everything else.
5. Improving a social environment can mean changing a routine, asking for support, joining an additional setting or protecting boundaries. It does not require cutting off people who differ from your goals.$s31a_tp$,
  video_description      = $s31a_vd$Retain the current Week 31 assignment pending review. Do not use any clip that presents the average of five quote or three-degrees network effects as established causal laws.$s31a_vd$,
  todays_theme           = $s31a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Workplaces, sports clubs, whānau routines, group chats and friendship groups can normalise certain behaviours through repetition and opportunity. Influence is real and still context-specific.$s31a_tdt$,
  todays_world_vo_script = $s31a_tdv$The room can change what is easy without deciding who you become.$s31a_tdv$,
  ancient_wisdom_reframe = $s31a_aw$Community and relational traditions can be used as cultural lenses for mutual influence and responsibility. Do not reduce relationships to productivity or self-improvement assets.$s31a_aw$,
  ancient_wisdom_vo_script = $s31a_awv$People shape one another through shared life; they are not tools to optimise.$s31a_awv$,
  signal_metaphor        = $s31a_sm$A current can make rowing easier or harder without deciding the destination. Social settings can change friction without taking over the steering.$s31a_sm$,
  private_write_prompt   = $s31a_pw$Choose one behaviour and write two social settings where it becomes easier or harder. Describe the context, not the character of the people.$s31a_pw$,
  experiential_exercise  = $s31a_ex$SOCIAL CONTEXT MAP. Write: behaviour / setting / norm or cue / practical support / friction / one modest change. Possible changes: ask for an accountability reminder, move a routine, join an additional group, change a notification pattern, or keep the setting unchanged. Sharing is optional.$s31a_ex$,
  guided_reflection      = $s31a_gr$Keep your eyes open.
Write:
The behaviour:
The setting that helps or hinders:
The specific mechanism I can observe:
One adjustment within my control:
What I am not blaming another person for:$s31a_gr$,
  journaling_prompt      = $s31a_jp$Across the week, which social settings genuinely changed the ease of a behaviour, and which outcomes turned out to depend more on your own capacity, resources or choices?$s31a_jp$,
  intention_prompt       = $s31a_ip$When I am in [specific setting], I will use [support/cue/boundary] to make [chosen behaviour] easier to carry out.$s31a_ip$,
  core_affirmation       = $s31a_ca$I can shape some social conditions around my behaviour without reducing people to influences I need to manage.$s31a_ca$,
  weekly_practice_mon    = $s31a_pm$Notice one social cue or norm around a chosen behaviour.$s31a_pm$,
  weekly_practice_wed    = $s31a_pw2$Test one modest environment or support adjustment without changing the relationship itself unless you genuinely want to.$s31a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s31a_ps$Bring one observation about a setting, relationship or routine that made one chosen behaviour easier, harder or unchanged. Sharing is optional.$s31a_ps$,
  previous_week_callback = $s31a_pwc$$s31a_pwc$,
  facilitator_notes      = $s31a_fn$## Aim
Teach social-context design while explicitly removing pseudo-facts and relationship optimisation.
## Run the room
Never say average of five, friends' friends' friends determine you, or tell members to upgrade their circle. Do not encourage cutting people off because they are less ambitious, healthy or positive.
## Why this week exists — the evidence
Social norms, modelling and relationship quality are meaningful influences on behaviour and wellbeing. The evidence is far more nuanced than popular network slogans suggest.
Real-world anchor: the average of five people line is widely repeated but does not come from a study. It is a clean example of Week 1's signal/noise method applied inside the curriculum itself.
## Evidence quality
Moderate overall. Social-norm and relationship-quality evidence is substantial. Network-contagion claims across multiple degrees are observational and contested. The five-person rule has no empirical basis.
## We deliberately do not claim
- We do not claim people become the average of five others.
- We do not claim Christakis/Fowler established causal influence through three degrees of separation.
- We do not claim relationship quality is the single strongest predictor of health or happiness.
- We do not tell members to remove people who do not support a self-improvement goal.
- We do not make other people responsible for a member's behaviour.
## Source trail
- Social norms/modelling literature.
- Waldinger/Harvard Study of Adult Development — relationship associations interpreted modestly.
- Christakis & Fowler network studies — observational and debated.
- Average of five — motivational speaker line, not research.$s31a_fn$,
  updated_at = now()
WHERE week_number = 31 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s31t_st$Your Operating Environment$s31t_st$,
  theme_title            = $s31t_tt$$s31t_tt$,
  phase                  = 3,
  phase_name             = $s31t_pn$Rebuild$s31t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s31t_hk$Choose one behaviour and think of one group or setting where it is easier and one where it is harder. Keep names private.$s31t_hk$,
  s5_source_core_concept = $s31t_cc$Today the teen room maps social context rather than ranking friends. We identify one norm, cue or practical support that affects a chosen behaviour and test one modest adjustment within our control.$s31t_cc$,
  core_concept           = $s31t_cco$$s31t_cco$,
  teaching_points        = $s31t_tp$1. People learn and adapt partly through social norms and modelling.
2. You become the average of the five people around you is not a research result and should not be used as a rule for choosing friends.
3. Network studies suggesting influence across friends-of-friends are observational and debated; they do not prove a simple causal chain.
4. Relationship quality matters for wellbeing, but there is no single formula that says certain friends make you successful or healthy.
5. A useful social-environment change can be adding support, changing a routine, joining another setting or setting a boundary — not rejecting people who are different from you.$s31t_tp$,
  video_description      = $s31t_vd$Retain the current Week 31 assignment pending review. Do not use clips presenting you are the average of five people or multi-degree network effects as settled causal science.$s31t_vd$,
  todays_theme           = $s31t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Teams, classes, friend groups, online spaces and whānau routines create norms about what gets noticed, joked about, practised or ignored. Norms influence behaviour without deciding identity.$s31t_tdt$,
  todays_world_vo_script = $s31t_tdv$A group can make one choice easier or harder without making the choice for you.$s31t_tdv$,
  ancient_wisdom_reframe = $s31t_aw$Use whanaungatanga carefully as an Aotearoa relational lens: relationships and belonging involve mutual connection and responsibility, not optimisation of people as performance inputs.$s31t_aw$,
  ancient_wisdom_vo_script = $s31t_awv$People are relationships, not productivity tools.$s31t_awv$,
  signal_metaphor        = $s31t_sm$A multiplayer lobby can make certain moves common without forcing every player to copy them. Norms change the environment, not the whole person.$s31t_sm$,
  private_write_prompt   = $s31t_pw$Choose one behaviour and one setting where it gets easier or harder. Write the specific cue or norm, not a judgment about the people.$s31t_pw$,
  experiential_exercise  = $s31t_ex$GROUP CONTEXT MAP. Write: setting / behaviour / norm or cue / support / friction / one small adjustment. Adjustments may include asking someone to join you, moving a routine, muting one notification source or doing nothing. Sharing is optional.$s31t_ex$,
  guided_reflection      = $s31t_gr$Keep your eyes open.
Write:
The setting:
The behaviour:
What in the setting affects it:
One adjustment I control:
What is still my responsibility:$s31t_gr$,
  journaling_prompt      = $s31t_jp$During the week, which group settings genuinely changed the ease of a behaviour and which things stayed mostly about your own choices, resources or energy?$s31t_jp$,
  intention_prompt       = $s31t_ip$When I am in [specific setting], I will use [specific cue/support/boundary] to support [chosen behaviour].$s31t_ip$,
  core_affirmation       = $s31t_ca$I can notice social influence without blaming my friends or treating people as tools for who I want to become.$s31t_ca$,
  weekly_practice_mon    = $s31t_pm$Notice one group norm or cue.$s31t_pm$,
  weekly_practice_wed    = $s31t_pw2$Test one modest adjustment without judging or changing the people themselves.$s31t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s31t_ps$Bring one observation about a group setting or routine that made one chosen behaviour easier, harder or unchanged. Sharing is optional.$s31t_ps$,
  previous_week_callback = $s31t_pwc$$s31t_pwc$,
  facilitator_notes      = $s31t_fn$## Aim
Teach social norms without peer-ranking, cutting-off advice or pseudo-network science.
## Run the room
No upgrade your circle, five closest people, or naming friends who hold a teen back. Do not turn different goals, cultures or lifestyles into negative influence labels.
## Why this week exists — the evidence
Social norms and modelling influence behaviour, while popular network claims are often oversimplified. The lesson keeps the mechanism observable at the setting level.
Real-world anchor: a team where everyone arrives ten minutes early can make early arrival feel normal. That does not prove the same teammates determine grades, identity or future success.
## Evidence quality
Moderate overall. Social-norm evidence is substantial. Multi-degree social-contagion claims are observational and contested. The five-person rule has no empirical basis.
## We deliberately do not claim
- We do not claim teens become the average of five friends.
- We do not claim friends-of-friends causally determine behaviour.
- We do not claim relationship quality is the single strongest predictor of wellbeing.
- We do not encourage cutting off friends who have different goals.
## Source trail
- Social norms/modelling literature.
- Christakis & Fowler network claims treated as observational/debated.
- Average of five — not research.$s31t_fn$,
  updated_at = now()
WHERE week_number = 31 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s31c_st$Growing Friends$s31c_st$,
  theme_title            = $s31c_tt$$s31c_tt$,
  phase                  = 3,
  phase_name             = $s31c_pn$Rebuild$s31c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s31c_hk$Show two pictures: a library and playground. Ask: Do the same behaviours feel normal in both places?$s31c_hk$,
  s5_source_core_concept = $s31c_cc$Today the child room learns that places and groups can remind us what people usually do there. A group can make a helpful action easier, but nobody becomes the average of their friends and children do not need to change who they spend time with for this lesson.$s31c_cc$,
  core_concept           = $s31c_cco$$s31c_cco$,
  teaching_points        = $s31c_tp$1. People notice and learn from what others do around them.
2. Different places have different routines and expectations.
3. A friend doing something does not make a child copy it automatically.
4. There is no rule that five friends decide who a child becomes.
5. A child can ask a trusted grown-up to help set up a useful routine or supportive place.$s31c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s31c_sm$A classroom sign can remind everyone where bags go. The sign and group routine make the action easier to remember; they do not control the children.$s31c_sm$,
  private_write_prompt   = $s31c_pw$Draw one place where a helpful action is easy to remember and one thing in the setting that helps. You may tell someone or keep it private.$s31c_pw$,
  experiential_exercise  = $s31c_ex$PLACES MAP. Children draw three safe settings — home/whānau, school, activity/play — and one helpful action that feels easier in each. Add one trusted-grown-up support cue. No naming children as good/bad influences.
DRAW IT
Draw one small change a trusted grown-up could help make in a place to support a helpful action.$s31c_ex$,
  guided_reflection      = $s31c_gr$Keep your eyes open.
Ask:
What do people usually do here?
What helps me remember?
What choice is still mine?$s31c_gr$,
  journaling_prompt      = $s31c_jp$Draw one small change a trusted grown-up could help make in a place to support a helpful action.$s31c_jp$,
  intention_prompt       = $s31c_ip$When I am in [safe place], I will use [cue/support] to help me remember [small action].$s31c_ip$,
  core_affirmation       = $s31c_ca$I can learn from people and places while still making my own safe choices.$s31c_ca$,
  weekly_practice_mon    = $s31c_pm$Notice one group or place cue.$s31c_pm$,
  weekly_practice_wed    = $s31c_pw2$Ask a trusted grown-up to help with one useful reminder if you want to.$s31c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s31c_ps$Bring your places drawing back and add one place where a helpful action felt easier to remember. Sharing is optional.$s31c_ps$,
  previous_week_callback = $s31c_pwc$$s31c_pwc$,
  facilitator_notes      = $s31c_fn$## Aim
Teach social/context cues without peer ranking, contagion myths or advice to change friends.
## Run the room
No five people, no good/bad influences, no asking which friend holds a child back and no advice about friendship changes.
## Why this week exists — the evidence
Social learning and norms shape behaviour, but influence is probabilistic and contextual. Children can observe routines directly without receiving deterministic social-network claims.
Real-world anchor: a labelled classroom tray makes putting crayons away common and easy to remember; the setting supports the behaviour without defining the child.
## Evidence quality
Moderate overall. Social-learning principles are established; this places-map activity is a teaching adaptation.
## We deliberately do not claim
- We do not claim children become the average of their friends.
- We do not claim friends-of-friends determine behaviour.
- We do not rank peers as good or bad influences.
- We do not make children responsible for changing other people.
## Source trail
- Social-learning and social-norm research informs the general principle.$s31c_fn$,
  updated_at = now()
WHERE week_number = 31 AND audience = 'Child';

-- Week 32 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw32_theme$$cw32_theme$,
  the_territory        = $cw32_terr$The sentences that repeat in the background$cw32_terr$,
  opening_question     = $cw32_oq$What makes self-talk useful rather than merely positive? Passing is full participation.$cw32_oq$,
  week_type            = $cw32_wt$Standard$cw32_wt$,
  reflective_question  = $cw32_rq$Across the week, which repeated phrases became more believable or actionable when you made them more specific?$cw32_rq$,
  interactive_activity = $cw32_ia$FOUR-TEST REWRITE. Ask: Is it accurate? specific? compassionate enough to keep using? useful for the next action? Rewrite until it meets as many tests as realistically possible. Sharing is optional.$cw32_ia$,
  kids_picture_book    = $cw32_bk$The Dot$cw32_bk$,
  kids_picture_book_author = $cw32_bka$Peter H. Reynolds$cw32_bka$,
  kids_picture_book_note = $cw32_bkn$WHY THIS BOOK: Use it for trying one next step without telling children that believing in themselves guarantees talent or success.
READ-ALOUD: Read live from a purchased copy.$cw32_bkn$,
  kids_picture_book_question = $cw32_bkq$What small action did Vashti actually take?$cw32_bkq$,
  kids_nz_alternative = $cw32_nz$Not yet selected$cw32_nz$,
  kids_nz_alternative_author = $cw32_nza$use the main book until a reviewed title fits.$cw32_nza$,
  kids_nz_alternative_note = $cw32_nzn$Future alternatives should support truthful encouragement rather than magical affirmations.$cw32_nzn$,
  kids_colouring_prompt = $cw32_col$Colour three speech bubbles labelled TRUE / KIND / HELPFUL.$cw32_col$,
  kids_game = $cw32_g$PICK THE HELPFUL BUBBLE. Facilitator reads fixed safe situations and children point to the most useful speech bubble. Watching is full participation.$cw32_g$,
  kids_game_equipment = $cw32_ge$Speech-bubble cards; crayons.$cw32_ge$,
  kids_game_under5 = $cw32_g5$Use picture bubbles for help, again, break and not sure.$cw32_g5$,
  updated_at = now()
WHERE week_number = 32;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s32a_st$The Daily Soundtrack$s32a_st$,
  theme_title            = $s32a_tt$$s32a_tt$,
  phase                  = 3,
  phase_name             = $s32a_pn$Rebuild$s32a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s32a_hk$Write one phrase you say to yourself often. Mark what it contains: fact / judgment / prediction / instruction / not sure.$s32a_hk$,
  s5_source_core_concept = $s32a_cc$Today the adult room evaluates self-talk by four tests: accurate, specific, compassionate, useful. A sentence can be uncomfortable and still pass. We are not replacing every negative thought with an affirmation.$s32a_cc$,
  core_concept           = $s32a_cco$$s32a_cco$,
  teaching_points        = $s32a_tp$1. Global self-judgments contain less actionable information than specific descriptions of behaviour and context.
2. Self-compassion research supports a less punitive response to setbacks, but it does not guarantee confidence, motivation or performance.
3. Positive self-statements can backfire for some people when the statement feels implausible. Believability matters.
4. A useful sentence can include uncertainty: I don't know yet, this is difficult, I need help.
5. The desired outcome is a better next response, not a permanently positive internal soundtrack.$s32a_tp$,
  video_description      = $s32a_vd$Retain the current Week 32 assignment pending review. Do not use videos claiming affirmations rewire the brain or positive thinking creates outcomes.$s32a_vd$,
  todays_theme           = $s32a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Short self-labels travel quickly through work, relationships and performance contexts. Precision slows the jump from one event to a whole-person verdict.$s32a_tdt$,
  todays_world_vo_script = $s32a_tdv$Better self-talk is not louder praise; it is better information.$s32a_tdv$,
  ancient_wisdom_reframe = $s32a_aw$Compassion traditions can be used as ethical lenses for non-cruel self-response. Do not present them as scientific proof of a mechanism.$s32a_aw$,
  ancient_wisdom_vo_script = $s32a_awv$Kindness and honesty do not have to compete.$s32a_awv$,
  signal_metaphor        = $s32a_sm$A useful dashboard reports the actual problem and the next check; it does not flash everything is terrible or everything is amazing.$s32a_sm$,
  private_write_prompt   = $s32a_pw$Choose one recurring phrase and the situation where it appears. Keep it private.$s32a_pw$,
  experiential_exercise  = $s32a_ex$FOUR-TEST REWRITE. Ask: Is it accurate? specific? compassionate enough to keep using? useful for the next action? Rewrite until it meets as many tests as realistically possible. Sharing is optional.$s32a_ex$,
  guided_reflection      = $s32a_gr$Keep your eyes open.
Write:
Original phrase:
What is actually true:
What is too global or predictive:
A more useful sentence:
Next action, if any:$s32a_gr$,
  journaling_prompt      = $s32a_jp$Across the week, which repeated phrases became more believable or actionable when you made them more specific?$s32a_jp$,
  intention_prompt       = $s32a_ip$When I notice [recurring phrase], I will run the four tests and use the most accurate useful version I can.$s32a_ip$,
  core_affirmation       = $s32a_ca$I can speak to myself in ways that are honest enough to believe and useful enough to act on.$s32a_ca$,
  weekly_practice_mon    = $s32a_pm$Catch one recurring self-talk phrase.$s32a_pm$,
  weekly_practice_wed    = $s32a_pw2$Rewrite one phrase using the four tests.$s32a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s32a_ps$Bring one example where you made self-talk more accurate, specific, compassionate or useful. Sharing is optional.$s32a_ps$,
  previous_week_callback = $s32a_pwc$$s32a_pwc$,
  facilitator_notes      = $s32a_fn$## Aim
Build credible self-talk rather than affirmations or positive-thinking pressure.
## Run the room
Do not require members to say statements they do not believe. No manifestation, vibration, rewiring or subconscious-programming claims.
## Why this week exists — the evidence
Self-compassion and cognitive-reappraisal research support less globally punitive and more context-sensitive responses to setbacks. Research on positive self-statements also cautions that implausible affirmations can be unhelpful for some people.
Real-world anchor: I'm useless at presentations gives almost no next step; I lost my place twice because my notes were too dense identifies something testable.
## Evidence quality
Moderate overall. Self-compassion and cognitive approaches have substantial evidence; effects of stand-alone self-talk exercises vary.
## We deliberately do not claim
- We do not claim affirmations rewire the brain.
- We do not claim positive self-talk creates external outcomes.
- We do not claim negative thoughts should disappear.
- We do not ask members to state something they do not believe.
## Source trail
- Neff, K. D. — self-compassion research.
- Cognitive-reappraisal/self-talk literature.
- Wood, J. V., et al. — caution on positive self-statements for low self-esteem.$s32a_fn$,
  updated_at = now()
WHERE week_number = 32 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s32t_st$Redesigning the Soundtrack$s32t_st$,
  theme_title            = $s32t_tt$$s32t_tt$,
  phase                  = 3,
  phase_name             = $s32t_pn$Rebuild$s32t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s32t_hk$Write privately one common self-comment. Mark fact / insult / prediction / useful instruction / not sure.$s32t_hk$,
  s5_source_core_concept = $s32t_cc$Today the teen room tests self-talk for accurate, specific, compassionate, useful. The replacement does not need to sound positive. It needs to be more truthful and give you more choice about what happens next.$s32t_cc$,
  core_concept           = $s32t_cco$$s32t_cco$,
  teaching_points        = $s32t_tp$1. I failed that test describes an event; I'm stupid turns the event into a whole-person label.
2. Self-compassion does not mean pretending mistakes do not matter.
3. Very positive self-statements can feel worse for some people when they strongly conflict with existing beliefs.
4. Not yet, not sure, I need help and this was hard can all be useful sentences.
5. Nobody needs a perfect inner voice; the skill is catching one phrase and improving its information quality.$s32t_tp$,
  video_description      = $s32t_vd$Retain the current Week 32 assignment pending review. Reject content claiming affirmations reprogram the subconscious or literally rewire the brain.$s32t_vd$,
  todays_theme           = $s32t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
School, sport and social media produce fast labels such as cringe, failure, genius, ugly, perfect. Useful self-talk is slower and more specific than those labels.$s32t_tdt$,
  todays_world_vo_script = $s32t_tdv$A believable sentence is more useful than hype you immediately argue with.$s32t_tdv$,
  ancient_wisdom_reframe = $s32t_aw$Use a coach/editor metaphor rather than a mystical inner voice: good guidance is honest and specific.$s32t_aw$,
  ancient_wisdom_vo_script = $s32t_awv$Useful words help you see the next move without insulting the player.$s32t_awv$,
  signal_metaphor        = $s32t_sm$Autocorrect can suggest a bad replacement. You are allowed to reject the suggestion and type a more accurate sentence.$s32t_sm$,
  private_write_prompt   = $s32t_pw$Write one safe self-comment and the situation where it appears. Keep it private.$s32t_pw$,
  experiential_exercise  = $s32t_ex$SOUNDTRACK EDIT. Run the phrase through four checks: true? specific? kind enough to use? gives a next step? Rewrite. No one reads the original aloud.$s32t_ex$,
  guided_reflection      = $s32t_gr$Keep your eyes open.
Write:
Original:
What happened:
What the phrase adds that I cannot prove:
A believable useful version:$s32t_gr$,
  journaling_prompt      = $s32t_jp$During the week, which harsh or vague self-comments became easier to handle when you made them more specific and believable?$s32t_jp$,
  intention_prompt       = $s32t_ip$When [phrase] appears, I will rewrite it using what happened plus one useful next step.$s32t_ip$,
  core_affirmation       = $s32t_ca$I can use self-talk that is honest enough to believe and useful enough to help.$s32t_ca$,
  weekly_practice_mon    = $s32t_pm$Catch one soundtrack phrase.$s32t_pm$,
  weekly_practice_wed    = $s32t_pw2$Edit one phrase using the four checks.$s32t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s32t_ps$Bring one example where you changed a harsh or vague self-comment into something more accurate and useful. Sharing is optional.$s32t_ps$,
  previous_week_callback = $s32t_pwc$$s32t_pwc$,
  facilitator_notes      = $s32t_fn$## Aim
Teach credible self-talk without hype, identity labels or affirmation pressure.
## Run the room
No body/appearance content, public reading, I am unstoppable, subconscious programming or rewiring claims.
## Why this week exists — the evidence
Self-compassion and cognitive approaches support less global self-condemnation, while research on positive self-statements shows that implausible affirmations may backfire for some people.
Real-world anchor: I'm terrible at maths becomes more actionable as I got stuck on simultaneous equations and need another example or help.
## Evidence quality
Moderate overall. Evidence is meaningful but context-dependent.
## We deliberately do not claim
- We do not claim affirmations rewire the brain or manifest outcomes.
- We do not claim positive wording is always better.
- We do not require any statement a teen does not believe.
- We do not claim difficult thoughts should disappear.
## Source trail
- Neff self-compassion research.
- Cognitive-reappraisal/self-talk literature.
- Wood et al. on positive self-statements.$s32t_fn$,
  updated_at = now()
WHERE week_number = 32 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s32c_st$Finding Your Power Phrases$s32c_st$,
  theme_title            = $s32c_tt$$s32c_tt$,
  phase                  = 3,
  phase_name             = $s32c_pn$Rebuild$s32c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s32c_hk$Show two bubbles: I can do anything! and This is hard; I can try one step or ask for help. Ask which is easier to believe when something really is hard.$s32c_hk$,
  s5_source_core_concept = $s32c_cc$Today the child room practises words that are true, kind and helpful. The sentence does not need to say everything is easy. It should help us understand what happened or what we can try next.$s32c_cc$,
  core_concept           = $s32c_cco$$s32c_cco$,
  teaching_points        = $s32c_tp$1. Mean labels such as I'm bad do not give much information.
2. A helpful sentence can say I made a mistake, I need help, not yet or I want a break.
3. Children do not have to say big positive statements they do not believe.
4. One helpful sentence does not make a problem disappear.
5. We can change the sentence when new information arrives.$s32c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s32c_sm$A signpost works when it points somewhere real. A helpful phrase should point toward a real next step, not an imaginary destination.$s32c_sm$,
  private_write_prompt   = $s32c_pw$Draw a made-up tricky task and one true, kind, helpful sentence beside it. You may tell someone or keep it private.$s32c_pw$,
  experiential_exercise  = $s32c_ex$TRUE / KIND / HELPFUL. Use fixed task examples and several speech bubbles. Children choose or create the bubble that best passes the three tests. No body/appearance examples.
DRAW IT
Draw three speech bubbles: what happened / what I can say / what I can try next.$s32c_ex$,
  guided_reflection      = $s32c_gr$Keep your eyes open.
Ask:
Is this sentence true?
Is it kind enough to use?
Does it help me know what to do next?$s32c_gr$,
  journaling_prompt      = $s32c_jp$Draw three speech bubbles: what happened / what I can say / what I can try next.$s32c_jp$,
  intention_prompt       = $s32c_ip$When I notice a mean or unhelpful thought, I will choose one true, kind, helpful sentence.$s32c_ip$,
  core_affirmation       = $s32c_ca$I can use words that are true, kind and helpful when something is hard.$s32c_ca$,
  weekly_practice_mon    = $s32c_pm$Notice one unhelpful sentence if it appears.$s32c_pm$,
  weekly_practice_wed    = $s32c_pw2$Try one true, kind, helpful sentence.$s32c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s32c_ps$Bring your speech-bubble drawing back and add one true helpful sentence you used this week. Sharing is optional.$s32c_ps$,
  previous_week_callback = $s32c_pwc$$s32c_pwc$,
  facilitator_notes      = $s32c_fn$## Aim
Teach believable self-talk without forced affirmation or magical-thinking claims.
## Run the room
Do not make children chant affirmations or use appearance/body statements. Accept I need help and not sure as successful phrases.
## Why this week exists — the evidence
Self-compassion and feedback research support specific, non-global responses to mistakes. Very positive statements are not universally helpful.
Real-world anchor: after dropping a block tower, I'm terrible gives no next step; the bottom moved; I can rebuild or ask for help does.
## Evidence quality
Moderate overall. Child activity is an age-matched teaching adaptation.
## We deliberately do not claim
- We do not claim affirmations rewire the brain or create outcomes.
- We do not require statements children do not believe.
- We do not claim positive words remove difficult feelings.
- We do not use body or appearance content.
## Source trail
- Neff self-compassion research.
- Feedback/self-talk literature.$s32c_fn$,
  updated_at = now()
WHERE week_number = 32 AND audience = 'Child';

-- Week 33 — Creating Structure That Serves You
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw33_theme$Creating Structure That Serves You$cw33_theme$,
  the_territory        = $cw33_terr$Giving important things somewhere to live in the week.$cw33_terr$,
  opening_question     = $cw33_oq$What is one part of your week that already works reliably — and what makes it reliable?$cw33_oq$,
  week_type            = $cw33_wt$Standard$cw33_wt$,
  reflective_question  = $cw33_rq$Write your three anchors as complete if-then plans. Under each, write: minimum version / recovery rule / what this protects.$cw33_rq$,
  interactive_activity = $cw33_ia$MINIMUM VIABLE WEEK — 20 minutes
Draw seven columns. Do not fill every hour.
Mark fixed reality first: work, school runs, care, existing commitments, sleep opportunity.
Choose no more than three anchors for things that matter and are currently left to chance.
Turn each anchor into an implementation intention:
IF / WHEN [cue], THEN I will [small specific action] at/in [place].
Write the minimum version beside it — what still counts on a difficult week?
Add a recovery rule: if the anchor is missed, when is the next normal opportunity? No punishment, no doubling up.
Stress-test the plan against one realistic disruption.
Optional share: the design of one anchor, not the personal reason behind it.$cw33_ia$,
  kids_game = $cw33_g$MIXED-UP MORNING
Use picture cards: wake up / get dressed / breakfast / shoes / school bag / leave. First put them in a silly mixed order. Let children identify what feels awkward. Then arrange a workable sequence.
Next, remove one card unexpectedly: “The bus is early!” Ask: Can we change the plan without the whole day being ruined?$cw33_g$,
  kids_game_under5 = $cw33_g5$Use only three picture cards and repeat the sequence with actions.$cw33_g5$,
  updated_at = now()
WHERE week_number = 33;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s33a_st$Designing the Container$s33a_st$,
  theme_title            = $s33a_tt$Creating Structure That Serves You$s33a_tt$,
  phase                  = 3,
  phase_name             = $s33a_pn$Rebuild$s33a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s33a_hk$Look at last week, not your ideal life. Which things mattered to you but happened only if there was time left over? Which things got a protected slot whether you consciously chose them or not?$s33a_hk$,
  s5_source_core_concept = $s33a_cc$Structure is not automatically good. A packed calendar can be badly designed structure. A completely open week can also work for some people.
The useful question is narrower: which actions matter enough that you do not want to renegotiate them from zero every day?
This week turns values into architecture. We build a minimum viable rhythm: a few anchors that make important behaviour easier to begin, visible enough to protect, and flexible enough to survive a bad week.$s33a_cc$,
  core_concept           = $s33a_cco$Structure works when it converts what matters into a reliable cue, time or place for action — while leaving enough flexibility for real life.
Adult translation: Stop asking your future self to decide everything again. Pre-decide a small number of anchors that protect what matters.$s33a_cco$,
  teaching_points        = $s33a_tp$1. An intention is not yet a plan. “I want to exercise more” describes a direction. “After I finish work on Tuesday and Thursday, I change clothes and walk for twenty minutes” specifies a cue and an action.
2. If-then plans are unusually well supported. A large meta-analysis of implementation intentions found that specifying when, where and how improved goal attainment compared with intention alone. The mechanism is practical: the situation becomes a cue for a preselected action.
3. Stable context helps repetition become easier to initiate. Habit research shows automaticity tends to develop through repetition in a consistent context. There is no universal number of days. Lally et al. found wide variation; the important variable is repeated behaviour, not a magic deadline.
4. Structure should reduce friction, not maximise output. A useful system can protect sleep, connection, medication, parenting, creative work or rest just as legitimately as paid work. Productivity is not the moral measure of a well-designed week.
5. Design for the week you actually have. Shift work, children, illness, care responsibilities and variable income can make fixed routines unrealistic. Use anchors tied to events (“after school drop-off”) rather than exact clock times when that fits better.
6. Build a floor before a ceiling. Your minimum version matters most: ten minutes, one page, one call, one meal plan, one protected hour. A structure that works only on a perfect week is not structure; it is a wish.
7. Review the structure, not your character. When an anchor repeatedly fails, ask whether the cue, timing, environment or size is wrong before concluding you lack discipline.$s33a_tp$,
  video_description      = $s33a_vd$$s33a_vd$,
  todays_theme           = $s33a_tdt$$s33a_tdt$,
  todays_world_vo_script = $s33a_tdv$$s33a_tdv$,
  ancient_wisdom_reframe = $s33a_aw$$s33a_aw$,
  ancient_wisdom_vo_script = $s33a_awv$$s33a_awv$,
  signal_metaphor        = $s33a_sm$A trellis does not tell a plant what to become. It gives growth something to climb on. Good structure supports direction without deciding your whole life for you.$s33a_sm$,
  private_write_prompt   = $s33a_pw$List the five things you say matter most in an ordinary week. Beside each, write: protected / usually happens / left to chance / currently unrealistic.$s33a_pw$,
  experiential_exercise  = $s33a_ex$MINIMUM VIABLE WEEK — 20 minutes
Draw seven columns. Do not fill every hour.
Mark fixed reality first: work, school runs, care, existing commitments, sleep opportunity.
Choose no more than three anchors for things that matter and are currently left to chance.
Turn each anchor into an implementation intention:
IF / WHEN [cue], THEN I will [small specific action] at/in [place].
Write the minimum version beside it — what still counts on a difficult week?
Add a recovery rule: if the anchor is missed, when is the next normal opportunity? No punishment, no doubling up.
Stress-test the plan against one realistic disruption.
Optional share: the design of one anchor, not the personal reason behind it.$s33a_ex$,
  guided_reflection      = $s33a_gr$Look at your three anchors.
Does each protect something you genuinely value, or something you think a good person is supposed to do?
Is the cue specific enough that you will recognise it?
Is the action small enough to survive an ordinary bad week?
What will you do after a miss?
Edit until your plan is usable rather than impressive.$s33a_gr$,
  journaling_prompt      = $s33a_jp$Write your three anchors as complete if-then plans. Under each, write: minimum version / recovery rule / what this protects.$s33a_jp$,
  intention_prompt       = $s33a_ip$Choose one anchor to test first. Do not launch a whole new life on Monday.$s33a_ip$,
  core_affirmation       = $s33a_ca$My structure is here to serve what matters. I build small anchors, leave room for life, and redesign the system when it stops helping.$s33a_ca$,
  weekly_practice_mon    = $s33a_pm$Run one anchor. Notice whether the cue was clear.$s33a_pm$,
  weekly_practice_wed    = $s33a_pw2$Friction audit. If it failed, change the environment, timing or size — not your self-respect. Protect something non-productive. Use structure for rest, connection or play at least once.$s33a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s33a_ps$Bring back data: what survived real life and what needs redesign?$s33a_ps$,
  previous_week_callback = $s33a_pwc$$s33a_pwc$,
  facilitator_notes      = $s33a_fn$## Aim
Members leave with one tested anchor, not a colour-coded fantasy schedule.
## Run the room
- Do not prescribe wake times, morning routines, productivity systems or a specific number of habits.
- Do not assume everyone controls their calendar.
- Push back gently on over-design: three anchors maximum for the exercise.
- Keep health, food and exercise examples neutral; no weight-loss framing.
## Why this week exists — the evidence
Implementation intentions: Gollwitzer & Sheeran's meta-analysis of 94 tests and more than 8,000 participants reported a medium-to-large average improvement in goal attainment when people formed specific if-then plans compared with intentions alone.
Habit formation: Lally et al. (2010) showed automaticity develops gradually with repeated behaviour in a stable context and varies substantially between people and behaviours. Their median of 66 days is a description of one sample, not a rule.
Important correction: Mindcast does not need the popular “decision fatigue” story to justify structure. Findings around ego depletion and broad claims that every decision drains a finite mental resource have had substantial replication problems. The practical case for structure stands without it.
## Evidence quality
Strong: implementation intentions; repeated behaviour in stable contexts.
Moderate/context-dependent: calendar blocking or particular productivity systems.
## We deliberately do not claim
- routines make everybody calmer or more successful;
- there is a perfect morning routine;
- it takes 21, 30 or 66 days to “make a habit”;
- missed routines should be compensated for;
- structure is a substitute for resources, childcare, treatment or sleep.
## Source trail
Gollwitzer & Sheeran (2006) · Lally et al. (2010) · implementation-intention review literature.$s33a_fn$,
  updated_at = now()
WHERE week_number = 33 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s33t_st$Designing the Container$s33t_st$,
  theme_title            = $s33t_tt$Creating Structure That Serves You$s33t_tt$,
  phase                  = 3,
  phase_name             = $s33t_pn$Rebuild$s33t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s33t_hk$Think about yesterday. Which parts happened because you chose them? Which happened because school, work, family or somebody else's schedule decided them? Which important thing got pushed until “later” and then disappeared?$s33t_hk$,
  s5_source_core_concept = $s33t_cc$You do not control your whole timetable, and you are not supposed to. School times, family rules, sport, work and other people's needs are real.
But inside that reality, a few well-designed anchors can make things you care about easier to do.
The skill this week is not “be disciplined.” It is: choose a cue, make the action small, and know what happens if the plan gets interrupted.$s33t_cc$,
  core_concept           = $s33t_cco$Structure works when it converts what matters into a reliable cue, time or place for action — while leaving enough flexibility for real life.
Teen translation: Build a few anchors around the parts of your day you can control instead of trying to become a perfectly organised person.$s33t_cco$,
  teaching_points        = $s33t_tp$1. Wanting to do something is different from deciding when it happens. “I should study more” is vague. “When I get home on Tuesday, I put my phone in the kitchen and do fifteen minutes of maths before gaming” is a plan.
2. Specific if-then plans work better than intention alone. Research on implementation intentions shows that linking a clear situation to a clear action improves follow-through on average.
3. You do not need a perfect streak. Habits build through repetition, and the time it takes varies a lot. Missing once does not erase anything. Restart at the next normal opportunity.
4. Make the first version almost too easy. Ten minutes of study, packing the bag before bed, one page, one stretch, setting out equipment. Small is useful because small still happens on a messy day.
5. Use structure for things you value, not just things adults praise. Sleep, time with friends, music, sport, creativity and being offline can deserve protection too.
6. Some parts of your day are not yours to redesign. If your home is chaotic, you work after school, share a room, care for siblings or do not control transport, the answer is not “try harder.” Build around the control you actually have.
7. A failed plan is information. Change the cue, size or environment before deciding you are lazy.$s33t_tp$,
  video_description      = $s33t_vd$$s33t_vd$,
  todays_theme           = $s33t_tdt$$s33t_tdt$,
  todays_world_vo_script = $s33t_tdv$$s33t_tdv$,
  ancient_wisdom_reframe = $s33t_aw$$s33t_aw$,
  ancient_wisdom_vo_script = $s33t_awv$$s33t_awv$,
  signal_metaphor        = $s33t_sm$Think of a routine as a shortcut button. It does not do the task for you; it gets you to the starting screen faster.$s33t_sm$,
  private_write_prompt   = $s33t_pw$Choose one thing you genuinely want more reliably in your week. Write why you want it — not why a parent, teacher or coach wants it.$s33t_pw$,
  experiential_exercise  = $s33t_ex$BUILD ONE ANCHOR — 15 minutes
Complete:
- THING I WANT TO PROTECT: …
- CUE I WILL NOTICE: when/after/where …
- SMALL ACTION: …
- MINIMUM VERSION ON A BAD DAY: …
- IF I MISS IT: I restart at …
- ONE THING IN THE ENVIRONMENT THAT WILL HELP: …
Then stress-test it with: late bus / extra homework / bad mood / friend calls / family plan changes.
Optional share: your anchor, not the private reason behind it.$s33t_ex$,
  guided_reflection      = $s33t_gr$Is this plan something you actually chose?
Will you know exactly when it starts?
Is the minimum version small enough to do on a rough day?
If you miss it, have you written a normal restart instead of a punishment?
If not, redesign it now.$s33t_gr$,
  journaling_prompt      = $s33t_jp$Write one if-then plan for this week: When [cue], I will [small action]. If that gets interrupted, I will restart at [next normal opportunity].$s33t_jp$,
  intention_prompt       = $s33t_ip$Test one anchor for seven days. You are running an experiment, not proving your character.$s33t_ip$,
  core_affirmation       = $s33t_ca$I do not need a perfect routine. I can build one small structure that makes what matters easier to do.$s33t_ca$,
  weekly_practice_mon    = $s33t_pm$First run: notice whether the cue actually worked.$s33t_pm$,
  weekly_practice_wed    = $s33t_pw2$Change one piece: if the plan failed, make it easier or move the cue. Protect something enjoyable: use one small structure for time you genuinely care about.$s33t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s33t_ps$Bring back: what did the experiment teach you?$s33t_ps$,
  previous_week_callback = $s33t_pwc$$s33t_pwc$,
  facilitator_notes      = $s33t_fn$## Aim
This must not become a “teen productivity” session. The learning is plan design and self-efficacy, not optimising every hour.
## Run the room
- Never shame scrolling, gaming or social media. Ask whether it matches what the teen intended, not whether it is morally good.
- Avoid advice about food, weight or exercise targets.
- Do not imply teens control family conditions they plainly do not control.
- If a plan depends on caregiver support, tell the teen to take it home as a proposal, not a rule Mindcast has assigned.
## Why this week exists — the evidence
Implementation-intention research shows that specific if-then planning improves follow-through on average. Habit-formation research shows repeated behaviour in a stable context becomes easier and more automatic over time, but with wide variation between people and behaviours.
The evidence supports specific cues + small repeatable behaviour. It does not support a universal routine, a magic number of days, or the idea that teenagers simply need more willpower.
## We deliberately do not claim
- a fixed routine is best for every teenager;
- it takes 21, 30 or 66 days to make a habit;
- missing once breaks a habit;
- structure eliminates stress or procrastination;
- a teen can organise their way out of difficult family or socioeconomic conditions.
## Source trail
Gollwitzer & Sheeran (2006) · Lally et al. (2010).$s33t_fn$,
  updated_at = now()
WHERE week_number = 33 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s33c_st$Your Personal Rhythm$s33c_st$,
  theme_title            = $s33c_tt$Creating Structure That Serves You$s33c_tt$,
  phase                  = 3,
  phase_name             = $s33c_pn$Rebuild$s33c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s33c_hk$What happens in your house when everyone is trying to remember everything at once? What helps you know what comes next?$s33c_hk$,
  s5_source_core_concept = $s33c_cc$A routine is a set of steps we often do in the same order. It can help us remember things and make starting easier.
But a routine is a helper, not a boss. If the day changes, we can change the routine too.
This week children build one tiny helpful rhythm around something they already need or want to do.$s33c_cc$,
  core_concept           = $s33c_cco$Structure works when it converts what matters into a reliable cue, time or place for action — while leaving enough flexibility for real life.
Child translation: A small routine can help your brain remember what comes next, but routines should help you — not make you feel bad when plans change.$s33c_cco$,
  teaching_points        = $s33c_tp$1. Doing something in the same place or after the same cue can help you remember it. “After I brush my teeth, I put my school bag by the door” gives your brain a clear reminder.
2. A routine should make something easier. If it makes the whole family stressed, it may need changing.
3. Small routines are easier to practise. One or two steps are enough. You do not need to plan your whole day.
4. Plans sometimes change. Missing a routine once does not mean you failed. You simply use it again next time it fits.
5. Children are not responsible for organising the whole family. Some routines need a grown-up's help, and some parts of the day are decided by adults.
6. Rest and fun can have a place in a rhythm too. A helpful day is not just a list of jobs.$s33c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s33c_sm$A routine is like a little path through the grass. Walking the same path can make it easier to find — but you can still take another path when you need to.$s33c_sm$,
  private_write_prompt   = $s33c_pw$Draw one part of your day that sometimes feels rushed, forgetful or messy. Keep it ordinary — getting ready, packing something, homework, bedtime, tidying up.$s33c_pw$,
  experiential_exercise  = $s33c_ex$MY TWO-STEP RHYTHM — 15 minutes
Each child chooses one ordinary moment and fills in:
WHEN THIS HAPPENS: after breakfast / when I get home / after bath / when my alarm goes.
I WILL DO THIS: put bag by door / put shoes away / read one page / choose clothes / pack sports gear with a grown-up.
IF THE DAY CHANGES: what can I do instead?
Children draw the cue and action as two linked pictures.
Facilitator checks that the routine is age-appropriate and does not assign adult responsibility to the child.$s33c_ex$,
  guided_reflection      = $s33c_gr$Look at your two pictures.
Will you know when the first thing happens?
Is the next step small enough to remember?
Does it help you?
If the day changes, can you try again another time?
That is a helpful routine.$s33c_gr$,
  journaling_prompt      = $s33c_jp$Draw your two-step routine and finish: When  happens, I will .$s33c_jp$,
  intention_prompt       = $s33c_ip$Choose one routine to practise with your caregiver this week.$s33c_ip$,
  core_affirmation       = $s33c_ca$A little routine can help me remember. If plans change, I can change with them and try again next time.$s33c_ca$,
  weekly_practice_mon    = $s33c_pm$Try it once. Did the cue remind you?$s33c_pm$,
  weekly_practice_wed    = $s33c_pw2$Ask a grown-up. Is there anything they can change to make the routine easier? Flexible day. Notice one time the plan changed and you were able to adjust.$s33c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s33c_ps$Bring back: what helped and what needs changing?$s33c_ps$,
  previous_week_callback = $s33c_pwc$$s33c_pwc$,
  facilitator_notes      = $s33c_fn$## Aim
Teach cue → small action → flexible restart. Do not teach compliance, rigid scheduling or “good children are organised.”
## Run the room
- Avoid telling children what bedtime, food, exercise or family schedule should be.
- Do not make a child responsible for waking siblings, preparing meals, managing a parent's time, or other adult tasks.
- Send the routine home as a family experiment, not homework the caregiver must enforce.
- Celebrate noticing and redesign, not streaks.
## Why this week exists — the evidence
The broader evidence base comes from implementation intentions and habit formation: behaviour is easier to repeat when linked to a recognisable cue and practised in a stable context. For children, Mindcast translates this into simple visual sequences and caregiver-supported routines without pretending there is a specific scientifically proven “best routine.”
Predictable routines are often associated with positive child and family outcomes, but family-routine research is largely observational. Therefore we teach the practical tool without claiming the routine itself causes broad emotional or academic benefits.
## We deliberately do not claim
- routines make every child calm;
- strict schedules are better parenting;
- a child who forgets is lazy;
- there is a universal morning or bedtime routine;
- a disrupted routine damages progress.
## Source trail
Gollwitzer & Sheeran (2006) · Lally et al. (2010); family-routine literature used cautiously as contextual support.$s33c_fn$,
  updated_at = now()
WHERE week_number = 33 AND audience = 'Child';

-- Week 34 — 
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw34_theme$$cw34_theme$,
  the_territory        = $cw34_terr$Matching recovery to the kind of load you are carrying$cw34_terr$,
  opening_question     = $cw34_oq$Why can doing nothing fail to feel restorative? Passing is full participation.$cw34_oq$,
  week_type            = $cw34_wt$Standard$cw34_wt$,
  reflective_question  = $cw34_rq$Across the week, which forms of rest helped the load you actually had, and which problems remained because the demand itself needed changing?$cw34_rq$,
  interactive_activity = $cw34_ia$LOAD / RECOVERY MATCH. Write: load / current demand / what I have been calling rest / what might fit better / structural or medical constraint / one small test. Sharing is optional.$cw34_ia$,
  kids_game = $cw34_g$WHAT KIND OF TIRED?
Place four signs around the room: BODY TIRED / BRAIN TIRED / TOO MUCH PEOPLE / NEED SOMEONE.
Read ordinary scenarios: “You played sport for an hour,” “You did a hard puzzle,” “There was lots of noise and people,” “You have been alone and miss your friend.” Children choose the sign that might fit, then suggest several possible ways to recover.
Make the point: different people may choose different signs.$cw34_g$,
  kids_game_under5 = $cw34_g5$Use two choices only: body tired and brain tired, with pictures.$cw34_g5$,
  updated_at = now()
WHERE week_number = 34;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s34a_st$Scheduled Maintenance$s34a_st$,
  theme_title            = $s34a_tt$$s34a_tt$,
  phase                  = 3,
  phase_name             = $s34a_pn$Rebuild$s34a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s34a_hk$Write what feels most depleted right now: sleep / attention / social capacity / physical effort / decision load / emotional effort / not sure.$s34a_hk$,
  s5_source_core_concept = $s34a_cc$Today the adult room treats rest as a match between load and recovery, not a virtue or productivity hack. Sometimes the useful move is rest; sometimes it is removing a demand, getting help, changing workload or seeking medical assessment.$s34a_cc$,
  core_concept           = $s34a_cco$$s34a_cco$,
  teaching_points        = $s34a_tp$1. Sleep is biologically distinct from other forms of rest and cannot be fully replaced by quiet time or relaxation.
2. Recovery needs depend on the load: physical exertion, sustained attention, social demands, shift work and caregiving create different constraints.
3. The popular seven types of rest framework is a writer's synthesis, not a validated scientific taxonomy.
4. Claims that screens create one specific cortisol state or that certain rest activities reset the nervous system are too broad for this lesson.
5. Chronic exhaustion from poverty, illness, disability, caring responsibilities or excessive workload is not a failure to schedule rest correctly.$s34a_tp$,
  video_description      = $s34a_vd$Retain the current Week 34 assignment pending review. If it uses a rest taxonomy, describe it as a practical framework rather than established biological categories.$s34a_vd$,
  todays_theme           = $s34a_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
A person can sleep enough and still be overloaded by decisions, care or work; another person may mainly need more sleep opportunity. The intervention should match the load.$s34a_tdt$,
  todays_world_vo_script = $s34a_tdv$Rest works better when it answers the demand that actually depleted you.$s34a_tdv$,
  ancient_wisdom_reframe = $s34a_aw$Traditions of Sabbath, retreat and rhythm can be cultural lenses for limits and recovery. Do not treat them as evidence for one physiological mechanism.$s34a_aw$,
  ancient_wisdom_vo_script = $s34a_awv$Limits can be acknowledged without turning rest into another performance target.$s34a_awv$,
  signal_metaphor        = $s34a_sm$Maintenance depends on the fault: low fuel, overheating and worn brakes require different responses.$s34a_sm$,
  private_write_prompt   = $s34a_pw$Choose one current load and write what type of recovery or demand reduction it may actually need.$s34a_pw$,
  experiential_exercise  = $s34a_ex$LOAD / RECOVERY MATCH. Write: load / current demand / what I have been calling rest / what might fit better / structural or medical constraint / one small test. Sharing is optional.$s34a_ex$,
  guided_reflection      = $s34a_gr$Keep your eyes open.
Write:
What is depleted:
What demand is causing it:
What recovery might match:
What needs support or demand reduction rather than a rest technique:$s34a_gr$,
  journaling_prompt      = $s34a_jp$Across the week, which forms of rest helped the load you actually had, and which problems remained because the demand itself needed changing?$s34a_jp$,
  intention_prompt       = $s34a_ip$When I notice [specific depletion cue], I will test [matching rest/support/demand reduction] rather than automatically using my usual form of rest.$s34a_ip$,
  core_affirmation       = $s34a_ca$I can respect limits and match recovery to the load without treating exhaustion as a personal failure.$s34a_ca$,
  weekly_practice_mon    = $s34a_pm$Identify the load before choosing the recovery.$s34a_pm$,
  weekly_practice_wed    = $s34a_pw2$Test one matching form of rest or demand reduction.$s34a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s34a_ps$Bring one observation about which kind of rest or reduction in demand actually helped this week. Sharing is optional.$s34a_ps$,
  previous_week_callback = $s34a_pwc$$s34a_pwc$,
  facilitator_notes      = $s34a_fn$## Aim
Broaden recovery while keeping sleep distinct and structural causes visible.
## Run the room
Do not prescribe sleep, diagnose burnout, use cortisol/nervous-system reset claims or tell overloaded people they simply need better rest habits.
## Why this week exists — the evidence
Recovery research supports the importance of sleep, breaks, psychological detachment and workload management, while popular rest taxonomies are practical syntheses rather than validated biological categories.
Real-world anchor: a parent awake repeatedly with a child may need sleep opportunity and support; a worker cognitively saturated after meetings may benefit from lower-demand time. Calling both rest deficit hides useful differences.
## Evidence quality
Moderate overall; strong for sleep and work-recovery principles, illustrative for popular rest-type taxonomies.
## We deliberately do not claim
- We do not claim seven rest types are established science.
- We do not claim screens, cortisol or the nervous system explain all fatigue.
- We do not claim rest can compensate for unsafe workloads, illness or structural exhaustion.
- We do not claim quiet time replaces sleep.
## Source trail
- Sleep and occupational-recovery research.
- Popular rest frameworks treated as writer synthesis only.$s34a_fn$,
  updated_at = now()
WHERE week_number = 34 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s34t_st$The Recovery Protocol$s34t_st$,
  theme_title            = $s34t_tt$Rest as a Practice, Not a Reward$s34t_tt$,
  phase                  = 3,
  phase_name             = $s34t_pn$Rebuild$s34t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s34t_hk$When you say “I need a break,” what do you usually do first? Scroll? Game? Sleep? Talk to someone? Go outside? Watch something? Lie there? And how do you normally feel afterwards?$s34t_hk$,
  s5_source_core_concept = $s34t_cc$Rest is not one thing, and teenagers are often told contradictory stories: “work harder,” “sleep more,” “get off your phone,” “be social,” “take time for yourself.”
This week is about replacing slogans with data.
The question is not “Is this activity officially healthy?” It is “What kind of load am I carrying, and does this choice actually help with it?”$s34t_cc$,
  core_concept           = $s34t_cco$Recovery is a legitimate part of functioning, not something that must be earned. Different forms of rest do different jobs; the useful question is whether a pause leaves you more resourced for what matters.
Teen translation: Learn the difference between being entertained, being switched off, and actually recovering — without turning any one activity into “good” or “bad.”$s34t_cco$,
  teaching_points        = $s34t_tp$1. Sleep is not optional recovery. Teen sleep is affected by biology, school schedules, family life, work, social life and technology. If you are not getting enough sleep, a relaxation technique cannot substitute for it.
2. A break can help without being magical. Research on short breaks suggests they can reduce fatigue and improve energy on average. Whether they help performance depends on the task, the person and the break.
3. Different tired needs different recovery. Too much people-time can make solitude useful. Too much isolation can make connection useful. Hours of mental work may make simple movement feel good. Hard physical activity may make stillness useful.
4. Do not judge an activity by its category. Gaming, TikTok, YouTube, reading, sport or lying on your bed can be restorative sometimes and draining sometimes. Look at what happens to you before and after.
5. “I can't rest until I finish everything” is a trap because everything rarely finishes. A short planned pause can happen while there are still unfinished tasks.
6. Being exhausted is not always a personal failure. Early school starts, work, family stress, mental health, caring responsibilities, illness and unsafe or noisy environments can all reduce recovery options.
7. If a break makes you feel worse every time, that is useful information — not proof you are weak. Change the activity, length, timing or environment and test again.$s34t_tp$,
  video_description      = $s34t_vd$$s34t_vd$,
  todays_theme           = $s34t_tdt$$s34t_tdt$,
  todays_world_vo_script = $s34t_tdv$$s34t_tdv$,
  ancient_wisdom_reframe = $s34t_aw$$s34t_aw$,
  ancient_wisdom_vo_script = $s34t_awv$$s34t_awv$,
  signal_metaphor        = $s34t_sm$Your battery icon tells you the level, not the right charger. Different kinds of tired need different chargers.$s34t_sm$,
  private_write_prompt   = $s34t_pw$Write three things you normally do when you need a break. Beside each: usually restores me / usually doesn't / depends. No answer is wrong.$s34t_pw$,
  experiential_exercise  = $s34t_ex$RECOVERY LAB — 15 minutes
Choose one common state:
- brain fried from school/work;
- socially overloaded;
- lonely or flat;
- physically tired;
- restless and wired.
Complete:
WHAT I NOTICE: …
WHAT I USUALLY DO: …
HOW I FEEL 20 MINUTES LATER: …
ONE DIFFERENT THING I COULD TEST: …
HOW LONG IS REALISTIC: …
Then choose a low-stakes recovery experiment for this week.
TWO-MINUTE EXPERIMENT
Offer four options in the room: quiet sitting, doodling, slow walking, or simple conversation with a partner. Participants choose one. Before and after, rate energy / mental noise / mood from 0–10.
The lesson is that responses differ. Do not announce a winner.$s34t_ex$,
  guided_reflection      = $s34t_gr$Ask:
What kind of tired am I?
What usually helps this kind?
What am I choosing because I actually want it, and what am I choosing automatically?
What problem here needs more than a break — sleep, help, safety, treatment, a conversation, or a change in conditions?$s34t_gr$,
  journaling_prompt      = $s34t_jp$Build your recovery menu: one two-minute option, one ten-minute option, one social option, one alone option, and one option that requires asking someone for help.$s34t_jp$,
  intention_prompt       = $s34t_ip$Test one option this week before you are completely wiped out.$s34t_ip$,
  core_affirmation       = $s34t_ca$Rest is not something I have to deserve. I can notice what kind of tired I am and choose a recovery option that actually helps.$s34t_ca$,
  weekly_practice_mon    = $s34t_pm$Name the tired: mental / social / physical / emotional / mixed.$s34t_pm$,
  weekly_practice_wed    = $s34t_pw2$Test one different recovery option. Compare before and after. Take a break with unfinished work still existing. Notice what comes up.$s34t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s34t_ps$Bring back: what actually worked for you?$s34t_ps$,
  previous_week_callback = $s34t_pwc$$s34t_pwc$,
  facilitator_notes      = $s34t_fn$## Aim
Teach functional recovery literacy, not screen abstinence or performance optimisation.
## Run the room
- Do not say phones raise cortisol, destroy dopamine, or prevent “real rest.” Those claims are too broad.
- Do not tell teens how many hours they personally must sleep in the session; if sleep education is needed, use approved health guidance and involve caregivers appropriately.
- Do not praise the teen who chooses meditation over gaming. The exercise is about observed effect.
- Persistent severe fatigue, insomnia, depression or major anxiety belongs outside curriculum facilitation and may need professional support.
## Why this week exists — the evidence
Research on microbreaks suggests modest average improvements in fatigue and vigour. Occupational recovery literature supports the value of psychological detachment from demanding tasks, but much of it is adult workplace research and should not be over-translated to teenagers.
Adolescents also face genuine biological and structural sleep constraints. That is why this lesson avoids “you are tired because you choose screens” as a simplistic explanation.
## We deliberately do not claim
- one rest practice works for everyone;
- a two-minute break resets the brain or nervous system;
- social media is never restorative;
- meditation is superior to entertainment;
- tired teens simply need more discipline;
- rest cures depression, anxiety or sleep disorders.
## Source trail
Albulescu et al. (2022) microbreak meta-analysis · Sonnentag recovery literature · established adolescent sleep literature used only for the broad distinction between sleep and leisure recovery.$s34t_fn$,
  updated_at = now()
WHERE week_number = 34 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s34c_st$Rest Is a Superpower$s34c_st$,
  theme_title            = $s34c_tt$Rest as a Practice, Not a Reward$s34c_tt$,
  phase                  = 3,
  phase_name             = $s34c_pn$Rebuild$s34c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s34c_hk$Have you ever stopped playing because you were tired — and then later wanted to play again? What helped you feel ready?$s34c_hk$,
  s5_source_core_concept = $s34c_cc$Rest is not a prize you get for being “good enough.” Bodies and brains need pauses.
And rest does not always mean lying still. Sometimes it means quiet. Sometimes connection. Sometimes gentle play. Sometimes sleep. Sometimes asking a grown-up to help make things less busy.
The skill is: notice → choose → check.$s34c_cc$,
  core_concept           = $s34c_cco$Recovery is a legitimate part of functioning, not something that must be earned. Different forms of rest do different jobs; the useful question is whether a pause leaves you more resourced for what matters.
Child translation: Rest is one of the things bodies and brains need. Different kinds of tired can need different kinds of help.$s34c_cco$,
  teaching_points        = $s34c_tp$1. Your body and brain give clues when they need a pause. You might yawn, get grumpy, lose focus, feel wiggly, want space, or find everything harder. Those clues do not mean you are bad.
2. Different kinds of tired can need different things. A tired body may want stillness. A busy brain may like drawing or quiet play. Feeling lonely may need connection.
3. Rest does not have to be earned. You do not need to finish every job or win a game before your body is allowed a break.
4. No activity is automatically the “right” rest for everybody. A story, music, a screen, being outside, cuddling a pet, talking, drawing or lying down can feel different for different people.
5. Sleep is special. Quiet play does not replace sleep. Grown-ups help children make sure there is enough chance to sleep.
6. Children are not responsible for fixing an exhausting home or schedule. If you are very tired a lot, telling a trusted grown-up is an important next step.$s34c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s34c_sm$Different tired feelings are like different warning lights. They all say “notice me,” but they do not all need the same thing.$s34c_sm$,
  private_write_prompt   = $s34c_pw$Draw yourself when you are starting to need a break. What clues show up in your face, body or behaviour?$s34c_pw$,
  experiential_exercise  = $s34c_ex$MY REST MENU — 15 minutes
Create four boxes:
- QUIET: something calm I like;
- MOVE: something gentle that feels good;
- CONNECT: someone safe I can be with;
- ASK: something a grown-up can help me with.
Children draw one option in each box.
Then ask: “Which one would help after lots of noise? Which after sitting for a long time? Which when lonely?” There may be several answers.
MINI EXPERIMENT
Offer two minutes of choice: quiet drawing, sitting, stretching/walking, or looking at a book. Afterwards ask: Do you feel more ready, the same, or less ready? No option is declared best.$s34c_ex$,
  guided_reflection      = $s34c_gr$Notice your body right now.
Do you feel ready, tired, wiggly, quiet, or something else?
If you needed a little recovery, what could you choose from your menu?
And if the tired feeling was big or kept happening, which grown-up could you tell?$s34c_gr$,
  journaling_prompt      = $s34c_jp$Draw three things that can help you recover, and finish: When I notice I need a break, I can .$s34c_jp$,
  intention_prompt       = $s34c_ip$Choose one rest-menu option to practise with your caregiver this week.$s34c_ip$,
  core_affirmation       = $s34c_ca$My body and brain are allowed to rest. I can notice what I need, choose something helpful, and ask a grown-up when I need help.$s34c_ca$,
  weekly_practice_mon    = $s34c_pm$Notice a clue. What told you a break might help?$s34c_pm$,
  weekly_practice_wed    = $s34c_pw2$Try a different kind. If you usually choose quiet, try connection or gentle movement once. Tell a grown-up. Show them your rest menu.$s34c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s34c_ps$Bring back: what made you feel more ready afterwards?$s34c_ps$,
  previous_week_callback = $s34c_pwc$$s34c_pwc$,
  facilitator_notes      = $s34c_fn$## Aim
Teach recovery as notice → choose → check, not “screens bad / stillness good.”
## Run the room
- Never tell children that a screen is “fake rest.” Keep the question functional and family-neutral.
- Do not conduct eyes-closed guided relaxation. Children may keep eyes open and choose how to sit or stand.
- Do not advise families on exact sleep schedules in this lesson.
- If a child reports persistent exhaustion, unsafe nighttime conditions, fear, or inability to sleep because of something concerning, follow safeguarding/support procedures.
## Why this week exists — the evidence
There is strong evidence that sleep matters for child health and functioning, but this lesson is broader than sleep. Evidence on breaks and recovery supports the modest idea that pauses can reduce fatigue, while the exact restorative activity is person- and context-dependent.
We therefore teach children to observe effects, not to memorise a hierarchy of “healthy” leisure activities.
## We deliberately do not claim
- rest makes children perform better every time;
- screens “damage dopamine” or are never restorative;
- two minutes of calm resets the nervous system;
- children can self-manage chronic sleep or health problems.
## Source trail
Broad sleep science plus break/recovery literature translated conservatively for children; no cortisol or “brain reset” claim.$s34c_fn$,
  updated_at = now()
WHERE week_number = 34 AND audience = 'Child';

-- Week 35 — Creativity and Expression
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw35_theme$Creativity and Expression$cw35_theme$,
  the_territory        = $cw35_terr$Making something before deciding whether it is any good.$cw35_terr$,
  opening_question     = $cw35_oq$What kind of making absorbs you enough that you temporarily stop grading yourself?$cw35_oq$,
  week_type            = $cw35_wt$Standard$cw35_wt$,
  reflective_question  = $cw35_rq$Design a ten-minute private making practice for this week. Specify what you will make, the constraint you will use, and the point at which evaluation is allowed.$cw35_rq$,
  interactive_activity = $cw35_ia$MAKE FIRST — 20 minutes
Provide several low-stakes options: write 100 words, sketch an object, create a six-line poem, arrange a small collage, design a ridiculous product, make a mini playlist with explanations, build something from simple materials, or create your own equivalent.
Rules for the first 12 minutes:
No deleting, erasing or restarting.
No showing anybody.
No rating the output. If judgment appears, write the word “judge” in the margin and keep making.
A constraint applies: one page / one object / one theme / one small time box.
After 12 minutes, switch modes. For five minutes ask: What do I like? What would I change? What surprised me? Now evaluation is allowed.
Final three minutes: decide whether this object stays private, gets revised, gets shared, or gets discarded. All four choices are legitimate.$cw35_ia$,
  kids_game = $cw35_g$ONE BOX, TEN IDEAS
Show a plain cardboard box. In pairs, children have two minutes to think of as many things as the box could become: spaceship, shop, drum, cave, robot, bed for a toy, stage, etc.
Rule: during idea time, nobody may say “that won't work” or “that's silly.” After idea time, choose one idea and decide how you would actually make it.$cw35_g$,
  kids_game_under5 = $cw35_g5$Give three options and let them act each one out.$cw35_g5$,
  updated_at = now()
WHERE week_number = 35;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s35a_st$Restoring the Output Channel$s35a_st$,
  theme_title            = $s35a_tt$Creativity and Expression$s35a_tt$,
  phase                  = 3,
  phase_name             = $s35a_pn$Rebuild$s35a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s35a_hk$What did you make when nobody was asking whether it was productive? Drawings, stories, playlists, gardens, jokes, recipes, furniture, photos, clothes, games, code, music, spaces, inventions — anything. What happened to that part of your life?$s35a_hk$,
  s5_source_core_concept = $s35a_cc$Creativity is often treated as an identity: “creative person” or “not creative.” This week treats it as behaviour.
You generate possibilities, make choices, produce something, notice what happened, and sometimes revise it.
The central skill is separating generation from evaluation. Evaluation has a job, especially when quality matters. But if the judge arrives before there is anything to judge, very little gets made.
Mindcast is not asking anyone to become an artist. It is creating one protected experience of making before grading.$s35a_cc$,
  core_concept           = $s35a_cco$Creativity is a process of generating, combining and expressing ideas. It becomes easier to practise when creating and judging are separated long enough for something to exist before it is evaluated.
Adult translation: Make before you assess. Recover a form of expression that does not need to become useful, profitable, impressive or public.$s35a_cco$,
  teaching_points        = $s35a_tp$1. Creativity is broader than art. Generating a new route, recipe, solution, joke, arrangement, story, design or way of explaining something all involve producing something that was not there in that form before.
2. Motivation changes the quality of engagement. Teresa Amabile's research programme found that intrinsic motivation — doing a task because it is interesting, enjoyable or personally meaningful — is often supportive of creativity. External rewards and evaluation are not always harmful, but controlling evaluation can narrow attention toward “what will score well?”
3. Generation and evaluation are different cognitive jobs. Brainstorming research is messy and many group-brainstorming claims are overstated, but one useful design principle survives: allowing ideas to be generated before immediately filtering them can increase the pool available for later judgment.
4. Constraints can help. A blank page with infinite options can be harder than a clear boundary: five minutes, three materials, one paragraph, one photograph, one chord progression. Constraint can reduce the number of decisions required to start.
5. Comparison changes the task. The moment the question becomes “Is mine as good as theirs?” attention shifts from expression toward ranking. Comparison is not immoral; it is simply a different task. For this session, we postpone it.
6. Not every creative practice needs an audience. Private making can be legitimate even if it is never monetised, posted, displayed or improved.
7. Creativity is not therapy by default. Creative activities can be meaningful and enjoyable, but Mindcast does not claim they treat depression, trauma or other clinical conditions.$s35a_tp$,
  video_description      = $s35a_vd$$s35a_vd$,
  todays_theme           = $s35a_tdt$$s35a_tdt$,
  todays_world_vo_script = $s35a_tdv$$s35a_tdv$,
  ancient_wisdom_reframe = $s35a_aw$$s35a_aw$,
  ancient_wisdom_vo_script = $s35a_awv$$s35a_awv$,
  signal_metaphor        = $s35a_sm$Do not invite the building inspector onto an empty section. Put something up first. Inspection comes later.$s35a_sm$,
  private_write_prompt   = $s35a_pw$Finish three lines:
- Something I used to enjoy making was…
- I stopped or reduced it when…
- The part I miss, if any, is…
You do not need to identify a wound or explain why you stopped.$s35a_pw$,
  experiential_exercise  = $s35a_ex$MAKE FIRST — 20 minutes
Provide several low-stakes options: write 100 words, sketch an object, create a six-line poem, arrange a small collage, design a ridiculous product, make a mini playlist with explanations, build something from simple materials, or create your own equivalent.
Rules for the first 12 minutes:
No deleting, erasing or restarting.
No showing anybody.
No rating the output. If judgment appears, write the word “judge” in the margin and keep making.
A constraint applies: one page / one object / one theme / one small time box.
After 12 minutes, switch modes. For five minutes ask: What do I like? What would I change? What surprised me? Now evaluation is allowed.
Final three minutes: decide whether this object stays private, gets revised, gets shared, or gets discarded. All four choices are legitimate.$s35a_ex$,
  guided_reflection      = $s35a_gr$Notice the difference between the making phase and the judging phase.
Which one arrived more easily for you?
What happened when judgment had to wait?
Did a constraint help you start or make you feel boxed in?
There is no correct creative state to reach. The experiment is simply to notice what conditions help you produce something.$s35a_gr$,
  journaling_prompt      = $s35a_jp$Design a ten-minute private making practice for this week. Specify what you will make, the constraint you will use, and the point at which evaluation is allowed.$s35a_jp$,
  intention_prompt       = $s35a_ip$Make something once this week that does not need to become useful, public or profitable.$s35a_ip$,
  core_affirmation       = $s35a_ca$I can make before I judge. Something does not have to be impressive, useful or public to be worth creating.$s35a_ca$,
  weekly_practice_mon    = $s35a_pm$Ten minutes, generation only. No editing until the timer ends.$s35a_pm$,
  weekly_practice_wed    = $s35a_pw2$Change the constraint. Smaller canvas, fewer materials, shorter time or one theme. Choose the audience deliberately: nobody / one person / public. Notice how the choice changes the experience.$s35a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s35a_ps$Bring back: what conditions helped you make rather than just think about making?$s35a_ps$,
  previous_week_callback = $s35a_pwc$$s35a_pwc$,
  facilitator_notes      = $s35a_fn$## Aim
Give adults a direct experience of separating generation from evaluation. Do not turn the session into “everyone is secretly an artist.”
## Run the room
- Never require participants to show what they made.
- Do not praise outputs. Ask process questions: “What was it like to make that?”
- Do not interpret creative choices psychologically.
- Facilitator should not display their own polished work or tell a story about being “a creative person.”
## Why this week exists — the evidence
Intrinsic motivation and creativity: Amabile's componential theory and decades of experimental/organisational research support the idea that intrinsic motivation and autonomy can support creative performance, while controlling evaluation can sometimes undermine it. Effects depend heavily on context; not all feedback or rewards reduce creativity.
Evaluation: Experimental work including Amabile and colleagues has shown expected evaluation can alter creative performance in some settings. Present this as a design consideration, not a law.
Constraints: Research on constraints is mixed: too much constraint suppresses exploration, while moderate constraints can support focus and reduce option overload. Therefore the session tests constraints rather than prescribing them.
## Evidence quality
Good: intrinsic motivation/autonomy as contributors to creative engagement.
Context-dependent: effects of rewards, deadlines and evaluation.
Do not claim: a particular exercise “unlocks” creativity neurologically.
## We deliberately do not claim
- everybody has hidden artistic genius;
- creativity requires trauma, flow or a special personality;
- making art heals trauma or treats mental illness;
- external rewards always damage creativity;
- the right brain is the “creative brain.”
## Source trail
Amabile (1983; 1996) componential model and experimental creativity literature · Deci & Ryan self-determination literature as supporting context.$s35a_fn$,
  updated_at = now()
WHERE week_number = 35 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s35t_st$Making Without Judging$s35t_st$,
  theme_title            = $s35t_tt$Creativity and Expression$s35t_tt$,
  phase                  = 3,
  phase_name             = $s35t_pn$Rebuild$s35t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s35t_hk$Think of something you make or used to make when there was no grade and nobody had to see it: edits, beats, drawings, outfits, jokes, Minecraft builds, writing, baking, photos, code, dance, playlists, crafts, ideas. When did “is it good?” start showing up?$s35t_hk$,
  s5_source_core_concept = $s35t_cc$Creativity is not a personality badge. It is something you do: combine ideas, try possibilities, make choices and produce a version.
Social media, school and competition can make evaluation arrive very early. That is not automatically bad — feedback can help — but if every idea is graded before it exists, making gets harder.
This week the experiment is simple: generation first, judgment second.$s35t_cc$,
  core_concept           = $s35t_cco$Creativity is a process of generating, combining and expressing ideas. It becomes easier to practise when creating and judging are separated long enough for something to exist before it is evaluated.
Teen translation: Make something before the likes, grades, comparison and self-judgment arrive.$s35t_cco$,
  teaching_points        = $s35t_tp$1. Creativity is not just drawing or music. A joke, game strategy, video edit, hairstyle, solution, recipe, explanation, build or piece of code can all involve creative thinking.
2. Wanting to make something for its own sake matters. Research on intrinsic motivation suggests people often engage more creatively when the task itself is interesting or meaningful to them, rather than feeling completely controlled by an external reward or score.
3. Feedback is not the enemy. Timing matters. Helpful feedback after a first version can improve work. Constant imagined judgment before you start can make you play safe or not start at all.
4. Create mode and edit mode are different. In create mode, your job is to produce options. In edit mode, your job is to choose, improve or remove. Trying to do both every second can stall you.
5. A small constraint can make starting easier. Ten minutes, one colour, three ingredients, four bars, one photo theme, 100 words. Less choice can sometimes create more momentum.
6. Comparison is information, not a verdict. Looking at skilled people can teach you. Using their finished work as proof that your first attempt is embarrassing usually teaches you very little.
7. Private making counts. You do not have to post, submit, monetise or show what you create.$s35t_tp$,
  video_description      = $s35t_vd$$s35t_vd$,
  todays_theme           = $s35t_tdt$$s35t_tdt$,
  todays_world_vo_script = $s35t_tdv$$s35t_tdv$,
  ancient_wisdom_reframe = $s35t_aw$$s35t_aw$,
  ancient_wisdom_vo_script = $s35t_awv$$s35t_awv$,
  signal_metaphor        = $s35t_sm$Do not open the comments section while the post is still an empty draft.$s35t_sm$,
  private_write_prompt   = $s35t_pw$Finish: I would probably make more  if I knew nobody was going to rate it.
Do not explain your answer unless you want to.$s35t_pw$,
  experiential_exercise  = $s35t_ex$CREATE MODE / EDIT MODE — 18 minutes
Choose one option: six-line poem, tiny design, beat/rhythm, sketch, ridiculous invention, short scene, mini comic, playlist concept, one-page game idea, or another approved format.
CREATE MODE — 10 minutes
- no deleting;
- no starting over;
- no showing it;
- if you think “this is bad,” write a tiny J in the margin and continue;
- use one clear constraint.
EDIT MODE — 5 minutes
Now ask:
- What part has energy?
- What is confusing?
- What one change would make it more like what I intended?
CHOICE MODE — 3 minutes
Keep private / revise / share with one person / discard. Every option is valid.
GROUP DISCUSSION
What changed when you knew judgment was delayed rather than banned forever?$s35t_ex$,
  guided_reflection      = $s35t_gr$You are allowed to care about quality.
You are also allowed to create something before it deserves a score.
Notice whether your best next step is more freedom, more constraint, more feedback, or less audience.
The answer may be different for different things you make.$s35t_gr$,
  journaling_prompt      = $s35t_jp$Plan one ten-minute create-mode session this week. Write the thing you will make, your constraint, and when edit mode is allowed to begin.$s35t_jp$,
  intention_prompt       = $s35t_ip$Make one thing that nobody is required to see.$s35t_ip$,
  core_affirmation       = $s35t_ca$I can make a first version before I judge it. My work is allowed to exist before it earns a score.$s35t_ca$,
  weekly_practice_mon    = $s35t_pm$Create mode: ten minutes with editing delayed.$s35t_pm$,
  weekly_practice_wed    = $s35t_pw2$Use one constraint: time, materials, length or theme. Choose feedback intentionally: if you want feedback, ask for one specific kind instead of “is this good?”$s35t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s35t_ps$Bring back: what made starting easier or harder?$s35t_ps$,
  previous_week_callback = $s35t_pwc$$s35t_pwc$,
  facilitator_notes      = $s35t_fn$## Aim
Help teens separate expression from evaluation without pretending evaluation, skill or standards do not matter.
## Run the room
- Nobody has to display their output.
- Do not hold a competition or vote.
- Avoid “you're all creative geniuses.”
- Respond to sharing with curiosity about process, not quality judgments.
- Be especially careful not to push a teen to turn a hobby into a career, side hustle or public identity.
## Why this week exists — the evidence
Research associated with Teresa Amabile and broader self-determination theory supports the role of intrinsic motivation and autonomy in creative engagement. Expected controlling evaluation can reduce creativity in some experimental settings, though feedback and rewards are not universally harmful.
This is why the session does not teach “feedback kills creativity.” It teaches control the timing and purpose of evaluation.
## We deliberately do not claim
- creativity is located in the right side of the brain;
- social media destroys creativity;
- art is therapy by default;
- everybody should share their creative work;
- external motivation is always harmful;
- flow is necessary for good creative work.
## Source trail
Amabile creativity research · Deci & Ryan self-determination literature.$s35t_fn$,
  updated_at = now()
WHERE week_number = 35 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s35c_st$The Joy of Making$s35c_st$,
  theme_title            = $s35c_tt$Creativity and Expression$s35c_tt$,
  phase                  = 3,
  phase_name             = $s35c_pn$Rebuild$s35c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s35c_hk$Have you ever started drawing or building something and then stopped because it did not look right straight away? What if the first job was just to make a version?$s35c_hk$,
  s5_source_core_concept = $s35c_cc$When we make something, two different jobs can happen:
- MAKER: tries, combines, experiments and gets something onto the page or into the world.
- CHECKER: looks later and decides what to keep or change.
Both jobs are useful. The problem is when the checker keeps stopping the maker before anything gets made.
This week we practise letting the maker go first.$s35c_cc$,
  core_concept           = $s35c_cco$Creativity is a process of generating, combining and expressing ideas. It becomes easier to practise when creating and judging are separated long enough for something to exist before it is evaluated.
Child translation: Make something first. You can decide what you think about it later.$s35c_cco$,
  teaching_points        = $s35c_tp$1. There are lots of ways to be creative. Drawing, building, making up games, dancing, telling stories, cooking with a grown-up, inventing jokes, arranging things and solving problems can all use creativity.
2. A first try does not need to be a final try. The first version gives you something to look at and change.
3. Ideas do not need to be sensible while you are collecting them. Sometimes a silly idea helps you find a useful one later.
4. Making and checking are different jobs. While making, try not to stop every few seconds to decide whether it is “good.” Check afterwards.
5. A small rule can make creating easier. One colour, five blocks, three shapes, one piece of paper. A little limit can turn “make anything” into something easier to start.
6. You do not have to show your work. Private making still counts.
7. Adults should be curious, not judges, during this exercise. “Tell me about it” is more useful than deciding whose is best.$s35c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s35c_sm$The maker plants seeds. The checker comes later to see what grew. If the checker digs every seed up immediately, nothing gets a chance.$s35c_sm$,
  private_write_prompt   = $s35c_pw$Draw or write one thing you would like to make if you knew nobody was going to mark it.$s35c_pw$,
  experiential_exercise  = $s35c_ex$THE MAKER FIRST CHALLENGE — 18 minutes
Set out several simple stations: drawing, collage, blocks/construction, story cards, rhythm instruments, modelling material.
Children choose one.
MAKER TIME — 10 minutes
- make continuously;
- no competitions;
- no erasing unless needed for the activity itself;
- facilitator does not say “good,” “beautiful,” “best,” or compare outputs;
- if a child gets stuck, ask: “What could you try next?”
CHECKER TIME — 5 minutes
Children look at their own work and choose:
- one part they enjoyed making;
- one part they might change;
- one thing that surprised them.
CHOICE TIME — 3 minutes
Keep private / show someone / keep working / take it apart. All choices count.$s35c_ex$,
  guided_reflection      = $s35c_gr$Think about when you were making.
Did your checker show up early and say “that's wrong” or “mine is bad”?
What happened when the maker got more time?
You do not have to love everything you create. The skill is letting yourself make something before deciding.$s35c_gr$,
  journaling_prompt      = $s35c_jp$Make one tiny thing this week using only three materials or three colours. When you finish, write or tell a grown-up what you enjoyed about the making.$s35c_jp$,
  intention_prompt       = $s35c_ip$Choose one thing you want to make at home just for fun.$s35c_ip$,
  core_affirmation       = $s35c_ca$I can make a first version before I decide what I think of it. Making is something I am allowed to enjoy.$s35c_ca$,
  weekly_practice_mon    = $s35c_pm$Maker first: five minutes of making with no judging.$s35c_pm$,
  weekly_practice_wed    = $s35c_pw2$Tiny constraint: use only three materials, colours or shapes. Curious sharing: if you show someone, ask them to say “tell me about it” instead of rating it.$s35c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s35c_ps$Bring back: what did you enjoy about the process?$s35c_ps$,
  previous_week_callback = $s35c_pwc$$s35c_pwc$,
  facilitator_notes      = $s35c_fn$## Aim
Protect playful generation before evaluation. The session must not become an art contest or a confidence exercise.
## Run the room
- Do not rank work or offer “best drawing” praise.
- Replace evaluation with specific curiosity: “You used three different shapes — tell me about that.”
- Do not insist a reluctant child create in a visual-art medium; offer building, movement, rhythm, story or design choices.
- Never interpret a child's drawing as revealing hidden psychological meaning.
## Why this week exists — the evidence
The adult evidence base comes from creativity and intrinsic-motivation research: autonomy and interest often support creative engagement, while controlling evaluation can sometimes narrow it. For children, the safest translation is to create a low-evaluation environment where experimenting is permitted.
This does not mean praise is harmful or that children should never receive feedback. It means this particular exercise separates making from judging so children can experience both jobs distinctly.
## We deliberately do not claim
- every child is an artistic genius;
- praise destroys creativity;
- art reveals a child's subconscious;
- creative play treats mental-health problems;
- children should never learn technique or receive feedback.
## Source trail
Amabile creativity/intrinsic-motivation literature translated developmentally; no neurological or therapeutic claim.$s35c_fn$,
  updated_at = now()
WHERE week_number = 35 AND audience = 'Child';

-- Week 36 — Purpose — What You're Here For
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw36_theme$Purpose — What You're Here For$cw36_theme$,
  the_territory        = $cw36_terr$Choosing a direction without pretending there is one predetermined answer.$cw36_terr$,
  opening_question     = $cw36_oq$When have you recently finished something and thought: “That mattered to me,” even if nobody else noticed?$cw36_oq$,
  week_type            = $cw36_wt$Standard$cw36_wt$,
  reflective_question  = $cw36_rq$Write one current purpose hypothesis:
For this season, I want to invest more of myself in  because . I will test that by  this week.
Call it a hypothesis, not a vow.$cw36_rq$,
  interactive_activity = $cw36_ia$PURPOSE AS DIRECTION — 20 minutes
Create four columns:
MATTERS: people, issues, activities or qualities I care about.
ENERGY: things I am often drawn toward or willing to persist with.
CAPACITY: skills I already have or would genuinely like to develop.
CONTRIBUTION: places where my effort could be useful to someone or something beyond immediate reward.
Now look for two or three plausible directions, not one perfect centre.
For each direction, complete:
- “For the next six months, I am curious about becoming someone who…”
- “A small test of that direction would be…”
- “Evidence that this direction fits me would look like…”
Choose one experiment that can be completed within seven days.
REALITY CHECK
Ask: Is this direction genuinely mine, or mostly inherited pressure?
Sources of pressure can include family expectations, status, income, culture, social media, age milestones and the wish to look impressive. Do not assume externally encouraged goals are bad; simply identify the source.$cw36_ia$,
  kids_game = $cw36_g$MANY WAYS TO HELP
Give the group one simple challenge: prepare a pretend community picnic / build a tower / create a welcome poster. Offer many roles: drawing, carrying, counting, checking, encouraging, organising, building, explaining.
Afterwards ask: Did one person have the only important job? Could people swap roles? Could they learn a new role?$cw36_g$,
  kids_game_under5 = $cw36_g5$Use three visible roles and swap halfway through.$cw36_g5$,
  updated_at = now()
WHERE week_number = 36;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s36a_st$Orienting Toward What Is Genuinely Yours$s36a_st$,
  theme_title            = $s36a_tt$Purpose — What You're Here For$s36a_tt$,
  phase                  = 3,
  phase_name             = $s36a_pn$Rebuild$s36a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s36a_hk$Imagine nobody could see your job title, income, qualifications or achievements. What activities, relationships or contributions would still feel worth doing?$s36a_hk$,
  s5_source_core_concept = $s36a_cc$Purpose is often marketed as a single calling sitting somewhere inside you waiting to be uncovered. That framing creates unnecessary anxiety.
A more defensible view is that people build purpose through chosen commitments: directions that feel personally meaningful, connect with their values, and often extend beyond immediate self-interest.
You may have several purposes at once — parent, friend, builder, learner, neighbour, creator, caregiver, worker — and the mix can change.
This week does not produce a life mission statement. It produces a current direction worth testing in behaviour.$s36a_cc$,
  core_concept           = $s36a_cco$Purpose is not a hidden destiny to discover. It is a direction built from what matters to you, the capacities you can develop, and the ways you choose to contribute. It can change across a lifetime.
Adult translation: Replace “What is my one purpose?” with “What directions feel worth investing this season of my life in?”$s36a_cco$,
  teaching_points        = $s36a_tp$1. Purpose is not the same as a career. Work can express purpose, but so can parenting, friendship, volunteering, craft, culture, learning, care and community participation.
2. Goals tend to function differently when they are self-concordant. Research by Sheldon, Elliot and others suggests people are more likely to sustain goals that fit their interests and values than goals pursued mainly from pressure, guilt or external approval.
3. Meaning is not the same as pleasure. Something can matter deeply and still be tiring, frustrating or difficult. “This is hard” does not automatically mean “this is not my purpose.”
4. Contribution can strengthen motivation, but it is not a moral requirement. Research on self-transcendent motives suggests that connecting effort to benefits beyond oneself can support persistence in some settings. That does not mean every hobby, job or goal must serve humanity.
5. Strengths are developable, not destiny. What comes easily can provide clues, but purpose should not trap you inside what you are already good at. Skills can be learned, interests can change, and circumstances matter.
6. A direction becomes more informative when tested. Thinking about purpose forever produces theories. Small real-world experiments — helping, making, teaching, learning, joining, building — produce data about what actually feels worth continuing.
7. Uncertainty is allowed. Not having a clear purpose is not a psychological defect. During grief, illness, transition, caregiving or survival pressure, a perfectly ordinary short-term purpose may be enough.$s36a_tp$,
  video_description      = $s36a_vd$$s36a_vd$,
  todays_theme           = $s36a_tdt$$s36a_tdt$,
  todays_world_vo_script = $s36a_tdv$$s36a_tdv$,
  ancient_wisdom_reframe = $s36a_aw$$s36a_aw$,
  ancient_wisdom_vo_script = $s36a_awv$$s36a_awv$,
  signal_metaphor        = $s36a_sm$Purpose is more like a compass heading than a hidden treasure map. You choose a direction, travel for a while, gather information, and adjust.$s36a_sm$,
  private_write_prompt   = $s36a_pw$Write three moments from the last year when you felt one of these:
- this matters to me;
- I want to get better at this;
- I was useful here;
- I would do some version of this even without applause.
Keep the examples ordinary. They do not need to be profound.$s36a_pw$,
  experiential_exercise  = $s36a_ex$PURPOSE AS DIRECTION — 20 minutes
Create four columns:
MATTERS: people, issues, activities or qualities I care about.
ENERGY: things I am often drawn toward or willing to persist with.
CAPACITY: skills I already have or would genuinely like to develop.
CONTRIBUTION: places where my effort could be useful to someone or something beyond immediate reward.
Now look for two or three plausible directions, not one perfect centre.
For each direction, complete:
- “For the next six months, I am curious about becoming someone who…”
- “A small test of that direction would be…”
- “Evidence that this direction fits me would look like…”
Choose one experiment that can be completed within seven days.
REALITY CHECK
Ask: Is this direction genuinely mine, or mostly inherited pressure?
Sources of pressure can include family expectations, status, income, culture, social media, age milestones and the wish to look impressive. Do not assume externally encouraged goals are bad; simply identify the source.$s36a_ex$,
  guided_reflection      = $s36a_gr$You do not need the sentence that explains your entire life.
Ask instead:
What direction feels worth moving toward now?
What would I still value if nobody applauded it?
What am I willing to practise rather than merely admire?
What small action could teach me more than another hour of thinking?$s36a_gr$,
  journaling_prompt      = $s36a_jp$Write one current purpose hypothesis:
For this season, I want to invest more of myself in  because . I will test that by  this week.
Call it a hypothesis, not a vow.$s36a_jp$,
  intention_prompt       = $s36a_ip$Run one small experiment before next Sunday.$s36a_ip$,
  core_affirmation       = $s36a_ca$I do not need to discover one destiny. I can choose a direction that matters, test it in real life, and change course as I learn.$s36a_ca$,
  weekly_practice_mon    = $s36a_pm$One aligned action. Do the smallest version of the experiment.$s36a_pm$,
  weekly_practice_wed    = $s36a_pw2$Check ownership. Ask: “Would I still want some version of this without recognition?” Collect contrary evidence. Notice what feels flat, forced or less meaningful than expected.$s36a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s36a_ps$Bring back: did the direction become clearer, weaker or simply more complicated?$s36a_ps$,
  previous_week_callback = $s36a_pwc$$s36a_pwc$,
  facilitator_notes      = $s36a_fn$## Aim
Reduce purpose anxiety and move members from identity declaration to behavioural experimentation.
## Run the room
- Never tell someone “what their purpose is.”
- Do not equate purpose with paid work, entrepreneurship or service.
- Do not reward grand statements over ordinary ones.
- Avoid asking bereaved, ill or overwhelmed people to find the “meaning” in suffering.
## Why this week exists — the evidence
Self-concordant goals: Sheldon & Elliot's work found that goals pursued for more autonomous, personally endorsed reasons were associated with greater sustained effort and wellbeing when attained. This is not proof of a single true self; it supports checking whether a goal feels personally owned.
Purpose and wellbeing: Purpose-in-life measures are repeatedly associated with wellbeing and health outcomes, but much of that literature is observational. Do not turn correlation into “purpose makes you live longer.”
Self-transcendent purpose: Yeager and colleagues found that connecting learning to a self-transcendent purpose could improve persistence or academic behaviour in some student samples. Effects are context-specific and do not justify telling adults every goal must help others.
## We deliberately do not claim
- everyone has one unique calling;
- purpose is discovered rather than constructed;
- your natural strengths reveal what you were “meant” to do;
- purposeful people are happier or healthier because of purpose alone;
- suffering happens for a reason;
- paid work should fulfil every source of meaning.
## Source trail
Sheldon & Elliot (1999) self-concordance model · Yeager et al. (2014) self-transcendent purpose for learning · purpose-in-life literature used as association, not causal proof.
## Cultural accuracy
The four-circle “ikigai Venn diagram” is not a traditional Japanese model. Do not use it as ancient wisdom or evidence.$s36a_fn$,
  updated_at = now()
WHERE week_number = 36 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s36t_st$Finding the Direction$s36t_st$,
  theme_title            = $s36t_tt$$s36t_tt$,
  phase                  = 3,
  phase_name             = $s36t_pn$Rebuild$s36t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s36t_hk$Complete privately: Right now I care about becoming more involved in… or choose not sure yet.$s36t_hk$,
  s5_source_core_concept = $s36t_cc$Today the teen room chooses one current direction and one small experiment. Purpose can come from several parts of life and can change. Not sure yet is a complete answer.$s36t_cc$,
  core_concept           = $s36t_cco$$s36t_cco$,
  teaching_points        = $s36t_tp$1. Purpose and meaning can support motivation, but there is no evidence everyone has one discoverable calling.
2. Meaning can come from whānau, friendship, learning, work, creativity, culture, community, faith or many other places.
3. The four-circle ikigai diagram is not a traditional Japanese model and should not be used as a career test.
4. A teen can explore without committing to a permanent identity or career.
5. Real constraints such as money, location, family responsibilities and access affect available options.$s36t_tp$,
  video_description      = $s36t_vd$Retain the current Week 36 assignment pending review. Reject one-calling, destiny and simplified ikigai claims.$s36t_vd$,
  todays_theme           = $s36t_tdt$DRAFT — rewrite from the video transcript once the video is chosen.
Subject choices and career questions often get framed as if they decide a whole life. A direction for the next season is enough for this lesson.$s36t_tdt$,
  todays_world_vo_script = $s36t_tdv$You can choose a direction without promising it will be yours forever.$s36t_tdv$,
  ancient_wisdom_reframe = $s36t_aw$Explain ikigai carefully as an everyday sense of what makes life worth living, not a four-circle formula.$s36t_aw$,
  ancient_wisdom_vo_script = $s36t_awv$Meaning can be ordinary, changing and spread across more than one part of life.$s36t_awv$,
  signal_metaphor        = $s36t_sm$A map can show the next direction without showing every road you will ever take.$s36t_sm$,
  private_write_prompt   = $s36t_pw$Write one direction you are curious about for now and one reason it matters. Keep it private.$s36t_pw$,
  experiential_exercise  = $s36t_ex$DIRECTION EXPERIMENT. Write: direction / tiny action / support needed / real constraint / what I will learn from trying it. Sharing is optional.$s36t_ex$,
  guided_reflection      = $s36t_gr$Keep your eyes open.
Write:
Direction:
One small experiment:
What I hope to learn:
What could make me change direction:$s36t_gr$,
  journaling_prompt      = $s36t_jp$During the week, what did one small action teach you about whether this direction fits you now?$s36t_jp$,
  intention_prompt       = $s36t_ip$When [specific opportunity/cue] appears, I will try [small action] toward [current direction].$s36t_ip$,
  core_affirmation       = $s36t_ca$I can choose a direction for now without having my whole future decided.$s36t_ca$,
  weekly_practice_mon    = $s36t_pm$Notice one source of meaning already in your life.$s36t_pm$,
  weekly_practice_wed    = $s36t_pw2$Try one small direction experiment.$s36t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s36t_ps$Bring one observation about a direction you tried and whether you want to keep, change or pause it. Sharing is optional.$s36t_ps$,
  previous_week_callback = $s36t_pwc$$s36t_pwc$,
  facilitator_notes      = $s36t_fn$## Aim
Protect exploration and uncertainty while removing one-calling and career-destiny pressure.
## Run the room
No career prophecy, purpose scores, body-feeling truth tests or pressure to reject family expectations.
## Why this week exists — the evidence
Meaning/purpose are associated with wellbeing and motivation, but adolescent exploration is normal and purpose need not be singular or fixed.
Real-world anchor: choosing one subject next year is a decision, not a permanent identity contract.
## Evidence quality
Moderate overall. Purpose associations are meaningful; individual causal claims are limited.
## We deliberately do not claim
- We do not claim everyone has one true calling.
- We do not claim the ikigai Venn diagram is traditional Japanese wisdom.
- We do not claim a teen should know their life purpose now.
- We do not claim purpose guarantees success or wellbeing.
## Source trail
- Meaning/purpose research.
- Ikigai cultural scholarship.$s36t_fn$,
  updated_at = now()
WHERE week_number = 36 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s36c_st$Your Special Puzzle Piece$s36c_st$,
  theme_title            = $s36c_tt$Purpose — What You're Here For$s36c_tt$,
  phase                  = 3,
  phase_name             = $s36c_pn$Rebuild$s36c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s36c_hk$Grown-ups sometimes ask children, “What will you be when you grow up?” But you do not need one answer yet. What are some things you enjoy doing now?$s36c_hk$,
  s5_source_core_concept = $s36c_cc$Purpose for a child does not mean choosing a future career.
It means noticing:
- things you care about;
- things you enjoy learning or practising;
- ways you can take part and contribute today.
Those things can change. You do not need one “special gift,” and nobody else gets to decide your whole future for you.$s36c_cc$,
  core_concept           = $s36c_cco$Purpose is not a hidden destiny to discover. It is a direction built from what matters to you, the capacities you can develop, and the ways you choose to contribute. It can change across a lifetime.
Child translation: You do not need one special job or one special gift. You can notice what you care about, what you like learning, and small ways you can be helpful.$s36c_cco$,
  teaching_points        = $s36c_tp$1. You can care about more than one thing. Animals, sport, stories, whānau, building, nature, friends, numbers, music — there is no one correct interest.
2. Being good at something is not fixed. Some things are easy now. Other things can grow with teaching and practice.
3. Helping can be small. Listening, including someone, carrying something, explaining, making, tidying, creating or asking a good question can all be useful.
4. You do not need to know your future job. Childhood is a time to learn, play, explore and try things.
5. Other people can notice strengths, but they do not own your identity. A grown-up can say “you seem patient with younger kids” without deciding “therefore you must become a teacher.”
6. Interests can change. Changing your mind is part of learning about yourself.
7. You do not have to make every hobby useful to other people. Some things are worth doing because you enjoy them.$s36c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s36c_sm$Purpose is like trying different paths in a park. You can walk one for a while, turn around, try another, and learn what you enjoy along the way.$s36c_sm$,
  private_write_prompt   = $s36c_pw$Draw three boxes:
- I CARE ABOUT…
- I LIKE LEARNING OR DOING…
- I SOMETIMES HELP BY…
Put at least one thing in each box. They do not have to match.$s36c_pw$,
  experiential_exercise  = $s36c_ex$TRY-A-DIRECTION MAP — 15 minutes
Children choose one item from any box and turn it into a tiny experiment:
- care about animals → help refill a pet's water with a caregiver;
- like drawing → make a card or comic;
- like building → build something new;
- like helping younger kids → read one story with an adult nearby;
- care about nature → pick up litter with a caregiver.
Then complete:
I am curious about . This week I could try .
No child writes “I am here to…” or a permanent purpose statement.$s36c_ex$,
  guided_reflection      = $s36c_gr$You do not need one special answer about who you are going to become.
You can notice what matters to you today.
You can try things.
You can learn new skills.
You can change your mind.
And you can be useful without being responsible for fixing everything.$s36c_gr$,
  journaling_prompt      = $s36c_jp$Draw one thing you are curious about trying this week and finish: I want to learn more about  by trying .$s36c_jp$,
  intention_prompt       = $s36c_ip$Choose one small experiment with a caregiver.$s36c_ip$,
  core_affirmation       = $s36c_ca$I do not need to know exactly who I will become. I can care, learn, help, try things and change as I grow.$s36c_ca$,
  weekly_practice_mon    = $s36c_pm$Try one thing. Notice what part you enjoyed.$s36c_pm$,
  weekly_practice_wed    = $s36c_pw2$Ask a grown-up: “What is something you've seen me getting better at?” Try another role: help or participate in a different way.$s36c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s36c_ps$Bring back: what did you learn about what you like?$s36c_ps$,
  previous_week_callback = $s36c_pwc$$s36c_pwc$,
  facilitator_notes      = $s36c_fn$## Aim
Replace the old “unique gift the world needs” message with curiosity, skill development and contribution without destiny language.
## Run the room
- Never label a child as “the artist,” “the helper,” “the leader,” “the smart one,” etc.
- Avoid asking children what they will be when they grow up as the main exercise.
- Do not imply their worth depends on usefulness to others.
- Keep contribution age-appropriate and never assign adult care responsibilities.
## Why this week exists — the evidence
Purpose research in adults and adolescents supports exploring personally meaningful, self-endorsed directions, but there is no evidence that each child has one innate purpose or gift to discover.
For children, the developmentally safer translation is interest exploration, competence-building, agency and prosocial participation. These align with broader self-determination research around autonomy, competence and relatedness without requiring a grand purpose statement.
## We deliberately do not claim
- every child has one special gift;
- the world “needs” a particular contribution from them;
- strengths are fixed traits;
- childhood hobbies reveal future careers;
- children must be useful to be worthy.
## Source trail
Self-determination and self-concordance literature translated developmentally; no “unique destiny” evidence claim.$s36c_fn$,
  updated_at = now()
WHERE week_number = 36 AND audience = 'Child';

-- Week 37 — Money, Resources and Choice
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw37_theme$Money, Resources and Choice$cw37_theme$,
  the_territory        = $cw37_terr$What money can do, what it cannot do, and the stories we attach to it.$cw37_terr$,
  opening_question     = $cw37_oq$What do you want money to make possible in your life — rather than what amount do you want?
No one shares balances, income, debt or other private financial details.$cw37_oq$,
  week_type            = $cw37_wt$Standard$cw37_wt$,
  reflective_question  = $cw37_rq$Complete:
When I have genuine financial choice, I want my decisions to protect . When I do not have genuine choice, I will not turn constraint into a character judgment.$cw37_rq$,
  interactive_activity = $cw37_ia$FACT / STORY / VALUE / OPTION — 20 minutes
Use one ordinary decision and create four boxes:
FACT: What are the actual numbers or constraints I know?
STORY: What am I telling myself about what this choice says about me?
VALUE: What matters here — convenience, security, enjoyment, generosity, family, autonomy, future flexibility?
OPTION: Is there a real alternative? If yes, what is it? If no, write NO MEANINGFUL CHOICE rather than inventing one.
Then ask: Would I make the same choice if the shame/status story disappeared?
Optional share is limited to the pattern, never amounts.
INHERITED-MESSAGE AUDIT
Write three money messages you remember hearing or observing. Beside each:
- still useful;
- partly useful;
- does not fit my life;
- I need more evidence.
Do not diagnose yourself with a “money script” category.$cw37_ia$,
  kids_game = $cw37_g$TEN TOKENS, MANY CHOICES
Each child receives ten large counters. Offer fictional choices with prices: snack for a pretend picnic, craft supplies, save for a bigger item later, ticket for an activity, small gift, etc.
Children make a choice, then change the prices or the situation: “Now you need a raincoat for the trip.” Discuss how priorities can change when circumstances change.
Do not ask what children actually have at home.$cw37_g$,
  kids_game_under5 = $cw37_g5$Use three large counters and two simple fictional choices.$cw37_g5$,
  updated_at = now()
WHERE week_number = 37;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s37a_st$Rebuilding the Resource Relationship$s37a_st$,
  theme_title            = $s37a_tt$Money, Resources and Choice$s37a_tt$,
  phase                  = 3,
  phase_name             = $s37a_pn$Rebuild$s37a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s37a_hk$Finish privately, without overthinking: “Money means…” “People with more money are…” “People who struggle with money are…” “When I spend on myself I…”
Now mark each sentence: fact / opinion / family message / social message / unsure.$s37a_hk$,
  s5_source_core_concept = $s37a_cc$Money conversations often slide between two different things:
financial reality — what is available, owed, required and possible;
financial meaning — what money has come to represent: safety, freedom, status, shame, generosity, control, success, fear.
Both matter, but confusing them can turn practical problems into identity judgments.
This week is not budgeting, investing or financial advice. It is learning to notice trade-offs, socialisation and values without pretending a better mindset creates resources that are not there.$s37a_cc$,
  core_concept           = $s37a_cco$Money is a limited, flexible resource used to make trade-offs. Our attitudes toward it are shaped by experience and social learning, while our actual options are strongly constrained by income, debt, housing, health, family responsibilities and access. Neither wealth nor hardship is a measure of character.
Adult translation: Separate the financial facts you need to deal with from the moral stories you attach to yourself and other people.$s37a_cco$,
  teaching_points        = $s37a_tp$1. Money is a resource, not a personality test. Having more or less money can reflect income, inheritance, housing, health, discrimination, family obligations, opportunity, luck, decisions and many other factors. A bank balance does not reveal virtue, intelligence or worth.
2. We learn money attitudes socially. Research on financial socialisation finds that family modelling, conversations and opportunities to handle money are associated with later financial attitudes, confidence and behaviour. That influence is real, but it is not destiny.
3. Every use of a limited resource has a trade-off. Spending, saving, giving, borrowing and investing all use resources that then cannot be used in exactly the same way elsewhere. This is opportunity cost, not a moral rule that one choice is always superior.
4. People mentally label money. Behavioural economics describes “mental accounting”: we often treat money differently depending on where it came from or what mental bucket it sits in. Those categories can be useful for organisation and can also produce inconsistent choices.
5. Context matters more than slogans. “Just save more,” “money is energy,” “abundance attracts abundance,” and “stop buying coffee” can all hide the difference between discretionary spending and genuine shortage. Financial strain is not cured by reframing.
6. Values can guide choices only inside real constraints. When there is genuine choice, asking “what does this purchase or saving decision protect?” can make priorities clearer. When there is no meaningful choice, do not manufacture one.
7. Generosity must stay voluntary. Some studies suggest prosocial spending can feel rewarding, but replication evidence is mixed and the effect depends on context and autonomy. Giving is not a requirement for being a good person, especially under financial pressure.
8. Practical financial problems need practical expertise. Debt, tax, investing, insolvency, benefits and legal obligations belong with qualified financial/legal services, not a Mindcast facilitator.$s37a_tp$,
  video_description      = $s37a_vd$$s37a_vd$,
  todays_theme           = $s37a_tdt$$s37a_tdt$,
  todays_world_vo_script = $s37a_tdv$$s37a_tdv$,
  ancient_wisdom_reframe = $s37a_aw$$s37a_aw$,
  ancient_wisdom_vo_script = $s37a_awv$$s37a_awv$,
  signal_metaphor        = $s37a_sm$Money is a multi-tool. It can buy time, safety, access, convenience, experiences and options. A tool can matter enormously without telling you what kind of person is holding it.$s37a_sm$,
  private_write_prompt   = $s37a_pw$Choose one low-stakes money decision you make repeatedly — subscription, convenience purchase, gift, saving transfer, takeaway, hobby spend, transport choice. Do not choose rent, food security, medical care or a crisis expense.
Write:
- What does this purchase/resource choice give me?
- What does it cost besides the dollar amount — time, flexibility, another option?
- What story do I attach to making it?$s37a_pw$,
  experiential_exercise  = $s37a_ex$FACT / STORY / VALUE / OPTION — 20 minutes
Use one ordinary decision and create four boxes:
FACT: What are the actual numbers or constraints I know?
STORY: What am I telling myself about what this choice says about me?
VALUE: What matters here — convenience, security, enjoyment, generosity, family, autonomy, future flexibility?
OPTION: Is there a real alternative? If yes, what is it? If no, write NO MEANINGFUL CHOICE rather than inventing one.
Then ask: Would I make the same choice if the shame/status story disappeared?
Optional share is limited to the pattern, never amounts.
INHERITED-MESSAGE AUDIT
Write three money messages you remember hearing or observing. Beside each:
- still useful;
- partly useful;
- does not fit my life;
- I need more evidence.
Do not diagnose yourself with a “money script” category.$s37a_ex$,
  guided_reflection      = $s37a_gr$What is the actual financial fact?
What meaning have I added?
Which part is genuinely in my control?
Which part is structural or constrained?
What value do I want money to serve when I do have a choice?
And where do I need practical advice rather than more self-reflection?$s37a_gr$,
  journaling_prompt      = $s37a_jp$Complete:
When I have genuine financial choice, I want my decisions to protect . When I do not have genuine choice, I will not turn constraint into a character judgment.$s37a_jp$,
  intention_prompt       = $s37a_ip$Make one low-stakes resource choice consciously this week and note the trade-off without judging yourself.$s37a_ip$,
  core_affirmation       = $s37a_ca$Money is a resource, not a measure of my worth. I can face the facts, respect my constraints, and use genuine choices in service of what matters.$s37a_ca$,
  weekly_practice_mon    = $s37a_pm$Spot one money judgment. Change "responsible/irresponsible person" into a description of the actual behaviour and context.$s37a_pm$,
  weekly_practice_wed    = $s37a_pw2$Notice a mental account, then ask the value question. Do you treat a refund, bonus, cash gift or savings bucket differently from other money? Observe it, then ask: what is this purchase or saving choice protecting?$s37a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s37a_ps$Bring back: what became clearer when fact and story were separated?$s37a_ps$,
  previous_week_callback = $s37a_pwc$$s37a_pwc$,
  facilitator_notes      = $s37a_fn$## Aim
De-shame money while avoiding pseudo-financial advice and “abundance mindset” claims.
## Run the room
- Never ask members to reveal income, debt, benefits, net worth, bankruptcy, family wealth or spending totals.
- Do not praise saving over spending or generosity over self-protection.
- Do not use “scarcity mindset” to explain the behaviour of someone in actual scarcity.
- Have a referral list for NZ financial mentoring/budgeting services if participants request practical help; facilitators do not recommend products or investments.
## Why this week exists — the evidence
Financial socialisation: A large 2024 study of 5,370 New Zealand adolescents found family financial openness/socialisation was associated with financial confidence and behaviours, while also showing a gap between confidence, intention and action. This supports the modest claim that money attitudes develop socially, not that childhood determines adult finances.
Mental accounting: Thaler's behavioural-economics work documents how people organise money into mental categories and evaluate spending relative to those accounts. The categories can help self-control or create inconsistencies; do not label them universally irrational.
Prosocial spending: A 2022 close replication of the influential Dunn et al. experiment failed to reproduce the original effect on the original composite outcome, while an exploratory direct happiness measure did show a small effect. So Mindcast does not teach “giving money makes you happier.”
## We deliberately do not claim
- money is “energy” or follows mindset;
- poverty reflects limiting beliefs;
- wealth proves good choices;
- one money-script typology clinically explains behaviour;
- spending on others reliably creates more happiness;
- values reflection is a substitute for financial advice or adequate income.
## Source trail
Thaler (1999), Mental Accounting Matters · Agnew & Sotardi (2024/2025), NZ adolescent financial socialisation study · Kim et al. (2022), prosocial spending replication.$s37a_fn$,
  updated_at = now()
WHERE week_number = 37 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s37t_st$What You've Inherited About Resources$s37t_st$,
  theme_title            = $s37t_tt$Money, Resources and Choice$s37t_tt$,
  phase                  = 3,
  phase_name             = $s37t_pn$Rebuild$s37t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s37t_hk$Privately finish: “People with lots of money are…” “People who struggle with money are…” “Spending money on myself feels…” “Saving money feels…”
Now label each answer: fact / opinion / message I learned / not sure.$s37t_hk$,
  s5_source_core_concept = $s37t_cc$Money lets people exchange resources and make choices. It also picks up a huge amount of meaning: popularity, security, freedom, generosity, embarrassment, success, fear.
Some of those meanings come from family and culture. Some come from what you have actually experienced.
The skill this week is not “have a good money mindset.” It is to separate facts, learned messages, values and real options.$s37t_cc$,
  core_concept           = $s37t_cco$Money is a limited, flexible resource used to make trade-offs. Our attitudes toward it are shaped by experience and social learning, while our actual options are strongly constrained by income, family circumstances and access. Neither wealth nor hardship is a measure of character.
Teen translation: Learn to separate what money actually does from the status, shame and family stories that can get attached to it.$s37t_cco$,
  teaching_points        = $s37t_tp$1. How much money somebody has does not tell you what kind of person they are. Wealth and hardship are shaped by opportunity, family resources, health, jobs, housing, luck, decisions and many other factors.
2. You learn about money before anybody gives you a formal lesson. Research with New Zealand adolescents shows family openness and financial socialisation are associated with young people's confidence and financial behaviour. What you observe matters, but it does not lock in your future.
3. Money choices involve trade-offs. If the same $20 is spent on one thing, it cannot also be spent on something else. That does not make spending bad; it simply means choices have alternatives.
4. Needs and wants are not always obvious. A phone can be a want for one person and essential for another person's safety, school or work. Context matters.
5. Status pressure is real. Brands, phones, clothes, cars, trips and experiences can become social signals. Wanting to fit in is human; noticing that pressure gives you more choice about whether to follow it.
6. Saving is delayed choice, not moral superiority. Saving can preserve future options. Spending can solve a current need or create enjoyment. Neither makes you a better person by itself.
7. Generosity must be voluntary. You are not required to give away money or possessions to prove you are kind.
8. Family financial stress is not yours to fix. If money is tight at home, that is not evidence you failed, and a teenager should not be made responsible for solving adult financial problems.$s37t_tp$,
  video_description      = $s37t_vd$$s37t_vd$,
  todays_theme           = $s37t_tdt$$s37t_tdt$,
  todays_world_vo_script = $s37t_tdv$$s37t_tdv$,
  ancient_wisdom_reframe = $s37t_aw$$s37t_aw$,
  ancient_wisdom_vo_script = $s37t_awv$$s37t_awv$,
  signal_metaphor        = $s37t_sm$Money is like tokens in a game with real consequences: using one token opens one option and closes another. But the number of tokens each player starts with is not equal, and that matters.$s37t_sm$,
  private_write_prompt   = $s37t_pw$Choose one ordinary spending decision you have actually made or might make: food out, game purchase, clothes, event, saving for something, gift. Do not choose a family bill or disclose household finances.
Write what the choice gives you besides the object itself: convenience / belonging / fun / independence / future option / kindness / something else.$s37t_pw$,
  experiential_exercise  = $s37t_ex$FACT / PRESSURE / VALUE / CHOICE — 18 minutes
For the ordinary decision:
FACT: What does it cost and what are the realistic alternatives?
PRESSURE: Is anyone else's opinion influencing me — friends, ads, family, influencers, status?
VALUE: What do I actually care about here?
CHOICE: What option fits me best, given the resources I really have?
Then compare two scenarios with the same item but different contexts to show why “need versus want” can change.
FAMILY-MESSAGE AUDIT
Write two money messages you have heard growing up. Beside each: useful / partly useful / not sure / does not fit me.
Nobody has to say where the message came from.$s37t_ex$,
  guided_reflection      = $s37t_gr$What is the actual money fact?
What story or status pressure have I added?
What part is my genuine choice?
What part is decided by my family's circumstances?
What option protects something I care about?$s37t_gr$,
  journaling_prompt      = $s37t_jp$Complete:
Money does not tell me what I am worth. When I have a genuine choice, I want to use resources in ways that protect .$s37t_jp$,
  intention_prompt       = $s37t_ip$Make one small money/resource choice this week and name the trade-off without calling yourself good or bad.$s37t_ip$,
  core_affirmation       = $s37t_ca$Money is a resource, not a score of my worth. I can notice pressure, understand trade-offs and make choices that fit my real life.$s37t_ca$,
  weekly_practice_mon    = $s37t_pm$Spot a status cue: notice one ad, post or peer signal designed to make an object mean something about identity.$s37t_pm$,
  weekly_practice_wed    = $s37t_pw2$Notice a trade-off: if you choose one use of money, what alternative did you give up? Ask a trusted adult one general question: “What is one money lesson you had to unlearn?” No need to discuss family numbers.$s37t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s37t_ps$Bring back: what money message did you notice most clearly?$s37t_ps$,
  previous_week_callback = $s37t_pwc$$s37t_pwc$,
  facilitator_notes      = $s37t_fn$## Aim
Build financial critical thinking and de-shaming, not budgeting instruction or “abundance” beliefs.
## Run the room
- Never compare allowances, household income, holidays, brands or financial hardship.
- Do not ask teens whether their parents are “good with money.”
- Do not teach investment, debt or tax advice.
- If a teen reports food insecurity, housing insecurity or being pressured to carry inappropriate adult financial responsibility, follow support/safeguarding pathways.
## Why this week exists — the evidence
A 2024 study of 5,370 New Zealand adolescents found family financial socialisation and openness were associated with financial confidence, intentions and behaviours. Importantly, confidence did not automatically become action. That supports teaching money as a learned social domain rather than a fixed personality trait.
Behavioural economics also shows people use mental categories and reference points when making financial decisions. These patterns are normal enough to study; they are not evidence that a teen's brain is “bad with money.”
## We deliberately do not claim
- money beliefs determine future wealth;
- an “abundance mindset” attracts resources;
- all wants are frivolous;
- saving is always better than spending;
- generous spending reliably makes people happier;
- financial hardship can be fixed through mindset.
## Source trail
Agnew & Sotardi (2024/2025), New Zealand adolescent financial socialisation · Thaler mental-accounting literature.$s37t_fn$,
  updated_at = now()
WHERE week_number = 37 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s37c_st$What We Have and What We Share$s37c_st$,
  theme_title            = $s37c_tt$Money, Resources and Choice$s37c_tt$,
  phase                  = 3,
  phase_name             = $s37c_pn$Rebuild$s37c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s37c_hk$If you use one token to buy one thing, can you use the same token again at the same time? That is the interesting thing about money: choosing one option can mean waiting on another.$s37c_hk$,
  s5_source_core_concept = $s37c_cc$Money is one way people exchange resources. It can be used now, saved for later, or sometimes shared.
Families have different resources, needs and choices. Children do not need to know or explain their family's private financial information.
The skill today is simple: notice the options, notice the trade-off, choose for a reason.$s37c_cc$,
  core_concept           = $s37c_cco$Money is a limited, flexible resource used to make trade-offs. Our attitudes toward it are shaped by experience and social learning, while our actual options are strongly constrained by family circumstances. Neither having more nor having less says what kind of person somebody is.
Child translation: Money helps people choose between different things. Families have different amounts and different needs, and that is private — not something children compare or judge.$s37c_cco$,
  teaching_points        = $s37c_tp$1. Money is a tool. People use it for food, homes, transport, fun, saving, gifts and many other things.
2. Choosing one thing can mean not choosing another right now. That is called a trade-off. It does not mean one choice was bad.
3. A need can depend on the situation. A bus ticket may be essential for one family and unnecessary for another. We do not make a game out of deciding what other people “should” need.
4. Saving means keeping some choice for later. It is not proof that somebody is better or more responsible than someone who needs to spend now.
5. Families have different amounts of money and different costs. We never rank children or families by what they own.
6. Sharing is optional. Kindness can involve time, help, attention or possessions, but children do not have to give things away to prove they are generous.
7. Grown-ups are responsible for household money. Children can learn about choices without carrying worry about bills or fixing family finances.$s37c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s37c_sm$Money is like a set of choice cards. Using one card opens one door. Saving it keeps a door available for later.$s37c_sm$,
  private_write_prompt   = $s37c_pw$Draw three pretend things you could do with ten tokens. Circle one and finish: I chose this because…
There is no “best” answer.$s37c_pw$,
  experiential_exercise  = $s37c_ex$NOW / LATER / OTHER — 15 minutes
Use only fictional scenarios.
Give children twelve counters and three labelled bowls:
- NOW: something I choose now;
- LATER: something I save toward;
- OTHER: something involving another person — gift, shared activity, group project.
Children can divide counters however they want, including zero in a bowl.
Then change one fact: a price rises, an essential fictional need appears, or a goal changes. Let them move the counters.
Discuss: Did changing the facts change the choice?$s37c_ex$,
  guided_reflection      = $s37c_gr$What choices did you have?
What did you choose first?
What did that mean you could not choose at the same time?
Did your choice change when the situation changed?
That is how resources work: choices depend on what matters and what is actually available.$s37c_gr$,
  journaling_prompt      = $s37c_jp$Draw one pretend choice for now and one for later. Write or tell a grown-up why each one makes sense.$s37c_jp$,
  intention_prompt       = $s37c_ip$Notice one everyday resource choice this week — money, time, craft materials, snack portions — and name the trade-off without saying one person is better.$s37c_ip$,
  core_affirmation       = $s37c_ca$Money is a tool for choices. Families have different resources, and nobody's worth can be measured by what they have.$s37c_ca$,
  weekly_practice_mon    = $s37c_pm$Choice spotting: notice one time choosing one thing meant waiting on another.$s37c_pm$,
  weekly_practice_wed    = $s37c_pw2$Ask a caregiver a safe general question: “What is something you save up for?” They can answer without sharing amounts. Non-money resource: notice a choice involving time or materials.$s37c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s37c_ps$Bring back: what did you learn about trade-offs?$s37c_ps$,
  previous_week_callback = $s37c_pwc$$s37c_pwc$,
  facilitator_notes      = $s37c_fn$## Aim
Provide basic financial reasoning — finite resources, trade-offs, saving as delayed choice — without making children disclose or compare family circumstances.
## Run the room
- No real allowance amounts, home ownership, holidays, brands or family bills are discussed.
- Avoid rigid “need versus want” sorting where context is ignored.
- Do not describe sharing as morally superior to keeping or saving.
- If a child reveals financial hardship, respond without classroom discussion and use appropriate family-support pathways.
## Why this week exists — the evidence
Financial socialisation research shows children and adolescents learn from modelling, discussion and experiences with resources. A large recent New Zealand adolescent study found family financial openness/socialisation was associated with confidence and behaviour, while also showing that intentions and confidence do not automatically translate into action.
For primary-aged children, Mindcast therefore teaches concrete choices and trade-offs, not predictions about future financial success.
## We deliberately do not claim
- children can be sorted into good/bad money habits from one exercise;
- saving always beats spending;
- generosity makes people happier;
- families with fewer resources made worse choices;
- money follows an “abundance mindset.”
## Source trail
Family financial-socialisation research, including Agnew & Sotardi's New Zealand adolescent study, translated conservatively for children.$s37c_fn$,
  updated_at = now()
WHERE week_number = 37 AND audience = 'Child';

-- Week 38 — The Community You Build
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw38_theme$The Community You Build$cw38_theme$,
  the_territory        = $cw38_terr$Belonging without disappearing into the group.$cw38_terr$,
  opening_question     = $cw38_oq$What makes a group feel safe enough for you to participate honestly?$cw38_oq$,
  week_type            = $cw38_wt$Standard$cw38_wt$,
  reflective_question  = $cw38_rq$Write one sentence for each:
I want more of… / I want to protect… / I want less pressure to… / One relationship or community I will gently invest in is…$cw38_rq$,
  interactive_activity = $cw38_ia$SOCIAL ECOLOGY MAP — 20 minutes
Draw yourself in the centre and create categories around you:
- people I can call for practical help;
- people I can relax/play with;
- people I can think honestly with;
- people connected to culture/place/identity;
- groups where I contribute;
- relationships I would like to gently strengthen.
A person may appear in several categories. Empty categories are information, not failure.
Now choose one low-pressure investment:
- send a message;
- accept or offer a specific invitation;
- attend an existing group once;
- ask someone a genuine question;
- follow up on something they told you;
- offer practical help;
- let someone help you.
Do not choose “share something deeply personal.”
BOUNDARY CHECK
Before making the commitment, ask:
- Can I do this without expecting a particular response?
- Am I respecting their time and boundaries?
- Am I strengthening a connection rather than forcing closeness?$cw38_ia$,
  kids_game = $cw38_g$BUILD IT TOGETHER
Small groups receive a simple building challenge. Each child gets a different role: builder, materials finder, checker, encourager, idea-giver. Halfway through, swap roles.
Debrief:
- Did every role matter?
- Did everyone have to do the same thing?
- What helped people join in?
- What made it harder?$cw38_g$,
  kids_game_under5 = $cw38_g5$Use pairs with two simple roles and swap once.$cw38_g5$,
  updated_at = now()
WHERE week_number = 38;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s38a_st$Building the Ecology of Growth$s38a_st$,
  theme_title            = $s38a_tt$The Community You Build$s38a_tt$,
  phase                  = 3,
  phase_name             = $s38a_pn$Rebuild$s38a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s38a_hk$Think of three rooms you have been part of: one where you felt included, one where you felt known, and one where you felt you had to perform to stay accepted. They may be different rooms.$s38a_hk$,
  s5_source_core_concept = $s38a_cc$Social relationships are associated with health and wellbeing, but “community” is not automatically good. Groups can support, challenge, exclude, pressure, control or simply stay superficial.
This week defines useful belonging as four things:
I can show up → I can contribute → I can receive → I can remain myself.
The goal is not to build the largest network or make Mindcast central. It is to strengthen a plural social ecology: friends, whānau, neighbours, work, sport, culture, faith or non-faith groups, hobbies, online communities and other places that genuinely fit.$s38a_cc$,
  core_concept           = $s38a_cco$Social connection matters, but healthy belonging is not simply being around people. It involves enough safety, reciprocity, recognition and freedom to be yourself — including freedom to disagree, leave and belong elsewhere.
Adult translation: Audit the quality and diversity of your connections, then make one small reciprocal investment without turning any single group into your whole social world.$s38a_cco$,
  teaching_points        = $s38a_tp$1. Social connection is associated with important health outcomes. A major meta-analysis of 148 prospective studies found stronger social relationships were associated with lower mortality risk. That is a population-level association across many kinds of relationships, not proof that joining a group will make an individual healthier.
2. Quality and function matter, not only headcount. A person can have many contacts and feel lonely, or a small network and feel deeply supported. Connection, support, integration and loneliness are related but not identical.
3. Belonging does not require agreement. In a healthy group you can differ, decline, change your mind and keep other relationships. Conformity may produce smoothness without genuine belonging.
4. Reciprocity matters, but it is not a ledger. Healthy communities contain giving and receiving over time. Some seasons you contribute more; some seasons you need more. Dependence during illness, parenting, disability or crisis is not failure.
5. Repeated small contact is how many relationships deepen. Showing up, remembering, initiating, responding, sharing ordinary activity and following through give people evidence of reliability. Intensity is not the same as closeness.
6. Vulnerability should be earned, not demanded. Being known does not require immediate disclosure of private pain. Trust can grow through ordinary, low-risk interactions.
7. One group should not become your entire world. Diverse social ties can provide different forms of support and reduce the pressure on any single relationship or community to meet every need.
8. Loneliness is not solved by “putting yourself out there” in every case. Social anxiety, depression, disability, discrimination, relocation, caregiving and lack of accessible spaces can all make connection harder. Sometimes support or structural change is needed.$s38a_tp$,
  video_description      = $s38a_vd$$s38a_vd$,
  todays_theme           = $s38a_tdt$$s38a_tdt$,
  todays_world_vo_script = $s38a_tdv$$s38a_tdv$,
  ancient_wisdom_reframe = $s38a_aw$$s38a_aw$,
  ancient_wisdom_vo_script = $s38a_awv$$s38a_awv$,
  signal_metaphor        = $s38a_sm$A healthy social life is less like one lifeboat and more like an ecosystem. Different relationships do different jobs, and resilience comes partly from not asking one organism to become the whole environment.$s38a_sm$,
  private_write_prompt   = $s38a_pw$List up to six places or relationships where you currently have social contact. For each, rate privately:
- I can be honest here 0–3;
- I contribute here 0–3;
- I can ask/receive here 0–3;
- I can say no or disagree here 0–3.
This is not a score of whether a person or group is “good.” It is a map of function.$s38a_pw$,
  experiential_exercise  = $s38a_ex$SOCIAL ECOLOGY MAP — 20 minutes
Draw yourself in the centre and create categories around you:
- people I can call for practical help;
- people I can relax/play with;
- people I can think honestly with;
- people connected to culture/place/identity;
- groups where I contribute;
- relationships I would like to gently strengthen.
A person may appear in several categories. Empty categories are information, not failure.
Now choose one low-pressure investment:
- send a message;
- accept or offer a specific invitation;
- attend an existing group once;
- ask someone a genuine question;
- follow up on something they told you;
- offer practical help;
- let someone help you.
Do not choose “share something deeply personal.”
BOUNDARY CHECK
Before making the commitment, ask:
- Can I do this without expecting a particular response?
- Am I respecting their time and boundaries?
- Am I strengthening a connection rather than forcing closeness?$s38a_ex$,
  guided_reflection      = $s38a_gr$Where am I connected?
Where do I feel known?
Where can I disagree?
Where am I mostly performing?
What kind of connection is missing — if any?
What is one small action I can take without making another person responsible for fixing my loneliness?$s38a_gr$,
  journaling_prompt      = $s38a_jp$Write one sentence for each:
I want more of… / I want to protect… / I want less pressure to… / One relationship or community I will gently invest in is…$s38a_jp$,
  intention_prompt       = $s38a_ip$Make one low-pressure social investment this week, preferably in an existing relationship or community.$s38a_ip$,
  core_affirmation       = $s38a_ca$I can build connection through small, reciprocal acts. I belong without surrendering my boundaries, my other relationships or my right to disagree.$s38a_ca$,
  weekly_practice_mon    = $s38a_pm$Initiate once. Make a specific, ordinary contact rather than “we should catch up sometime.”$s38a_pm$,
  weekly_practice_wed    = $s38a_pw2$Receive once. Let someone contribute to you if an appropriate opportunity arises. Notice freedom. In one group, observe whether you can disagree or decline without fear of losing belonging.$s38a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s38a_ps$Bring back: what happened when you invested without trying to manufacture intimacy?$s38a_ps$,
  previous_week_callback = $s38a_pwc$separate the fact from the story on one ordinary money decision, and notice what became clearer$s38a_pwc$,
  facilitator_notes      = $s38a_fn$## Aim
Teach healthy social ecology, not loyalty to Mindcast. This is a high-risk week for accidental organisational dependency if facilitated poorly.
## Run the room
- Never say the Mindcast group is “family,” “your tribe,” or the community participants have been missing.
- Do not celebrate 38 weeks together as evidence members should deepen commitment to Mindcast.
- Do not ask participants to identify their “most important person” publicly.
- No facilitated disclosure as a shortcut to closeness.
- Encourage investment in outside relationships and community institutions.
## Why this week exists — the evidence
Holt-Lunstad et al. (2010) pooled 148 prospective studies involving more than 300,000 participants and found stronger social relationships were associated with better survival. The studies were heterogeneous and largely observational, so the responsible claim is social relationships matter at population level, not that relationships are “the single strongest predictor of happiness.”
Belonging, loneliness, social support and network size are distinct constructs. Intervention evidence is much thinner than association evidence, which is why the session focuses on low-risk behaviours rather than promising health effects.
## We deliberately do not claim
- humans are “designed” for a particular community structure;
- relationships are the single strongest predictor of happiness or health;
- more friends are better;
- Mindcast itself is necessary for belonging;
- vulnerability creates closeness automatically;
- lonely people simply need to try harder.
## Source trail
Holt-Lunstad, Smith & Layton (2010) meta-analysis of social relationships and mortality · broader social-support/belonging literature.$s38a_fn$,
  updated_at = now()
WHERE week_number = 38 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s38t_st$Building Real Connection$s38t_st$,
  theme_title            = $s38t_tt$The Community You Build$s38t_tt$,
  phase                  = 3,
  phase_name             = $s38t_pn$Rebuild$s38t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s38t_hk$Think of three different social spaces you are in: school/class, team/club, group chat/online space, whānau, friends, work, community. Where do you feel most relaxed? Where do you edit yourself the most? Where can you disagree without thinking the relationship is over?$s38t_hk$,
  s5_source_core_concept = $s38t_cc$Having lots of people around you is not the same as feeling connected.
A useful community is one where you can participate, contribute, receive support and still remain yourself.
This week is not about increasing your friend count or making Mindcast your “real tribe.” It is about understanding the different roles relationships play and making one small, respectful investment in connection.$s38t_cc$,
  core_concept           = $s38t_cco$Social connection matters, but healthy belonging is not simply being around people. It involves enough safety, reciprocity, recognition and freedom to be yourself — including freedom to disagree, leave and belong elsewhere.
Teen translation: Build connections where you can be known without having to perform, while keeping your boundaries and more than one place to belong.$s38t_cco$,
  teaching_points        = $s38t_tp$1. Connection matters for wellbeing, but there is no magic number of friends. Research consistently links stronger social connection with better mental and physical health outcomes at population level. That does not mean one particular social life is correct.
2. Online connection can be real connection. A digital friendship can involve support, shared interests and genuine closeness. The useful question is not “online or real?” but what the relationship actually provides and costs.
3. Belonging does not mean copying the group. If acceptance disappears the moment you disagree, say no, change interests or spend time elsewhere, that is important information about the relationship.
4. Closeness usually grows through repeated ordinary contact. Showing up, replying, remembering, inviting, sharing activity and following through often matter more than one intense conversation.
5. You do not owe anyone personal disclosure to prove trust. You can become closer gradually and choose what stays private.
6. Different people can meet different needs. The friend you game with does not have to be the person you talk to about everything. A coach, cousin, classmate and online friend can each matter in different ways.
7. Social rejection hurts, and not every group is fixable. Sometimes the healthier move is to invest elsewhere, involve a trusted adult, or get support for bullying or exclusion rather than trying harder to win a group's approval.
8. Being lonely is not a personal failure. Social anxiety, depression, discrimination, moving, family circumstances and accessibility can all make connection harder.$s38t_tp$,
  video_description      = $s38t_vd$$s38t_vd$,
  todays_theme           = $s38t_tdt$$s38t_tdt$,
  todays_world_vo_script = $s38t_tdv$$s38t_tdv$,
  ancient_wisdom_reframe = $s38t_aw$$s38t_aw$,
  ancient_wisdom_vo_script = $s38t_awv$$s38t_awv$,
  signal_metaphor        = $s38t_sm$Your social world is a playlist, not one song on repeat. Different tracks do different things, and one track does not have to carry the whole album.$s38t_sm$,
  private_write_prompt   = $s38t_pw$List up to five relationships or groups. For each privately mark:
- I can be myself here: 0–3
- I can say no/disagree here: 0–3
- I contribute something here: 0–3
- I can ask for help here: 0–3
No scores are shared.$s38t_pw$,
  experiential_exercise  = $s38t_ex$CONNECTION MAP — 18 minutes
Draw categories around yourself:
- people I have fun with;
- people I can ask for practical help;
- people I can be honest with;
- people connected to my interests/culture/identity;
- people I would like to know a little better.
Then choose one low-pressure move:
- send a specific message;
- invite someone to do an ordinary activity;
- follow up on something they told you;
- sit with or talk to someone you already know;
- attend one existing group/event;
- let somebody help you.
Do not choose “tell them my deepest secret.”
BOUNDARY TEST
Ask:
- Am I okay if they say no or respond slowly?
- Am I trying to connect, or trying to force a particular outcome?
- Can I keep my other friendships too?$s38t_ex$,
  guided_reflection      = $s38t_gr$Where do I feel most able to be myself?
Where do I feel pressure to perform?
What kind of connection would I like more of?
What small move can I make without expecting somebody else to fix my loneliness?
And if a group makes me feel unsafe or repeatedly excluded, who can help me?$s38t_gr$,
  journaling_prompt      = $s38t_jp$Complete:
One connection I want to protect is… One connection I might gently strengthen is… One boundary I want to keep is…$s38t_jp$,
  intention_prompt       = $s38t_ip$Make one small social investment this week that respects both people's choice.$s38t_ip$,
  core_affirmation       = $s38t_ca$I can build real connection without performing or forcing closeness. I am allowed to keep boundaries, disagree, and belong in more than one place.$s38t_ca$,
  weekly_practice_mon    = $s38t_pm$Specific invite/message: replace “we should hang” with something concrete and low-pressure.$s38t_pm$,
  weekly_practice_wed    = $s38t_pw2$Follow up: remember one thing someone told you and ask about it. Notice freedom: where can you disagree and still feel okay?$s38t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s38t_ps$Bring back: what did you learn about connection rather than popularity?$s38t_ps$,
  previous_week_callback = $s38t_pwc$$s38t_pwc$,
  facilitator_notes      = $s38t_fn$## Aim
Build relationship literacy, not group loyalty or forced vulnerability.
## Run the room
- Never call Mindcast a teen's “family” or “tribe.”
- Do not suggest group members exchange private contact details as part of the exercise.
- Do not tell teens to move people into an “inner circle.”
- If bullying, coercion, exploitation or unsafe online contact is disclosed, use safeguarding pathways.
## Why this week exists — the evidence
A systematic review of 34 longitudinal and two intervention studies found higher school connectedness was generally associated with fewer depressive and anxiety symptoms, while noting limited intervention evidence and uncertainty about remission or causality.
Adult social-relationship meta-analyses also show robust population-level health associations, but they do not prove that simply increasing contact causes better health for every individual.
This supports the modest message: connection matters; quality, safety and context matter too.
## We deliberately do not claim
- relationships are the single strongest predictor of happiness;
- more friends are better;
- online friendships are inherently inferior;
- one intense disclosure creates trust;
- Mindcast should become a teen's main social community;
- loneliness is solved by effort alone.
## Source trail
Raniti et al. (2022) systematic review of school connectedness and youth depression/anxiety · Holt-Lunstad et al. social-relationship meta-analysis as broader context.$s38t_fn$,
  updated_at = now()
WHERE week_number = 38 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s38c_st$Being Part of Something Bigger$s38c_st$,
  theme_title            = $s38c_tt$The Community You Build$s38c_tt$,
  phase                  = 3,
  phase_name             = $s38c_pn$Rebuild$s38c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s38c_hk$Think of a group you enjoy: class, whānau, team, club, friends, neighbourhood, cultural group. What tells you, “I am welcome here”?$s38c_hk$,
  s5_source_core_concept = $s38c_cc$Belonging does not mean everyone is identical.
A healthy group can make room for different ideas, abilities, cultures, personalities and ways of joining in.
Children also do not have to be friends with everybody or solve every person's loneliness. The skill is to practise welcoming behaviour, fair participation and safe boundaries.$s38c_cc$,
  core_concept           = $s38c_cco$Social connection matters, but healthy belonging is not simply being around people. It involves enough safety, reciprocity, recognition and freedom to be yourself — including freedom to disagree, leave and belong elsewhere.
Child translation: A good group helps people feel included and safe without making everyone be the same.$s38c_cco$,
  teaching_points        = $s38c_tp$1. Belonging means feeling accepted enough to take part. It can come from family, school, sport, culture, neighbours, friends and many other places.
2. People can belong and still be different. Different opinions, interests, abilities and ways of communicating do not automatically mean somebody does not fit.
3. Including someone is made of small behaviours. Make space, explain the game, use their name, take turns, listen, invite without forcing.
4. An invitation still allows “no.” If somebody does not want to join, we respect that. Inclusion is not dragging someone into an activity.
5. Children are not responsible for making everybody feel okay. You can be kind without becoming another child's counsellor or protector.
6. You are allowed boundaries too. You do not have to share private information, possessions, physical affection or contact details to prove friendship.
7. Tell a trusted adult when exclusion becomes bullying, threats or unsafe behaviour. That is bigger than a child should manage alone.$s38c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s38c_sm$A community is like a team bench with different positions. You do not all play the same role, but everybody should know whether and how they can join the game.$s38c_sm$,
  private_write_prompt   = $s38c_pw$Draw one group where you feel comfortable taking part. Add small clues that make it feel welcoming — a person who listens, a rule that is fair, space to join, something familiar.
You do not need to draw a group where you feel left out.$s38c_pw$,
  experiential_exercise  = $s38c_ex$WELCOME LAB — 15 minutes
Give each group an ordinary scenario:
- a new child joins a game;
- someone does not know the rules;
- a child wants to watch before joining;
- two children disagree about the game;
- somebody communicates more quietly or needs extra time.
For each, practise three moves:
INVITE: “Do you want to join?”
EXPLAIN: give enough information to participate.
RESPECT: accept yes, no, or “not yet.”
Then switch roles so everyone practises being inviter and newcomer.
BOUNDARY ROUND
Read examples and children answer KIND TO OFFER / OKAY TO SAY NO / TELL AN ADULT.
Examples: joining a game, sharing a pencil, giving a hug, keeping a dangerous secret, someone threatening you, giving away a favourite toy.$s38c_ex$,
  guided_reflection      = $s38c_gr$What helps you know you are welcome?
What can you do to make joining easier for someone else?
How can you be kind if they say no?
And what kinds of problems should go straight to a trusted adult?$s38c_gr$,
  journaling_prompt      = $s38c_jp$Draw one small thing you can do to make a group easier to join, and finish: I can invite without forcing by .$s38c_jp$,
  intention_prompt       = $s38c_ip$Practise one welcoming behaviour this week in a group you are already part of.$s38c_ip$,
  core_affirmation       = $s38c_ca$I can help people feel welcome without making them be the same as me. I can be kind, keep my boundaries, and ask an adult when something is too big.$s38c_ca$,
  weekly_practice_mon    = $s38c_pm$Make space: one small invitation or turn-taking action.$s38c_pm$,
  weekly_practice_wed    = $s38c_pw2$Respect a no: notice a moment when someone chooses differently and let that be okay. Ask a grown-up: “What makes a group feel safe and welcoming to you?”$s38c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s38c_ps$Bring back: what welcoming action did you notice or try?$s38c_ps$,
  previous_week_callback = $s38c_pwc$$s38c_pwc$,
  facilitator_notes      = $s38c_fn$## Aim
Teach inclusion + autonomy + boundaries, not “every child is responsible for community harmony.”
## Run the room
- Do not ask “Who is left out in your class?” or identify isolated children publicly.
- Do not require children to include someone in private playdates or friendships; focus on fair group behaviour in shared settings.
- Never tell a child they are essential to the Mindcast group or that the group needs them to keep attending.
- Respect neurodivergent participation: watching, parallel activity or slower entry can all be valid.
## Why this week exists — the evidence
Research on school connectedness generally finds that children and adolescents who feel cared for, valued and connected at school report better wellbeing outcomes, although causal intervention evidence is more limited than the associations.
The curriculum therefore teaches observable inclusion behaviours rather than promising that a group activity will improve mental health.
## We deliberately do not claim
- every group must include every child in every private activity;
- a child can fix another child's loneliness;
- belonging requires disclosure, hugging or sharing possessions;
- Mindcast should become a child's primary community;
- connectedness guarantees mental-health protection.
## Source trail
School-connectedness literature translated developmentally; Raniti et al. (2022) systematic review used cautiously.$s38c_fn$,
  updated_at = now()
WHERE week_number = 38 AND audience = 'Child';

-- Week 39 — Integration — What Is Actually Working
UPDATE public.curriculum_weeks SET
  weekly_theme         = $cw39_theme$Integration — What Is Actually Working$cw39_theme$,
  the_territory        = $cw39_terr$Turning thirteen weeks of material into a smaller set of tools you can actually use.$cw39_terr$,
  opening_question     = $cw39_oq$Which Phase 3 practice have you actually used outside this room?$cw39_oq$,
  week_type            = $cw39_wt$Integration$cw39_wt$,
  reflective_question  = $cw39_rq$Write a one-page Phase 3 operating note:
When  happens, I want to remember . My three carry-forward tools are  because I have evidence that .$cw39_rq$,
  interactive_activity = $cw39_ia$KEEP / MODIFY / PARK — 25 minutes
Review Weeks 27–38. For each, mark:
- KEEP: useful enough to continue;
- MODIFY: useful idea, wrong size/timing/context;
- PARK: not useful or not relevant now.
For every KEEP, require one concrete piece of evidence: “I used this when…”
For every MODIFY, write the redesign.
Then choose your THREE CARRY-FORWARD TOOLS.
For each tool complete:
CUE: When do I need this?
ACTION: What exactly do I do?
MINIMUM VERSION: What counts on a difficult day?
EVIDENCE: How will I know it helped?
BEFORE
Choose one item you wrote at the start of Phase 3, if available. Compare it with now using only specific behaviour. Avoid “I am more evolved/confident/authentic.” Prefer “I now do X in situation Y.”$cw39_ia$,
  kids_game = $cw39_g$TOOLBOX RELAY
Place picture cards around the room representing Phase 3 tools: values compass, tiny habit, kind self-talk, helpful routine, rest menu, maker-first creativity, curiosity/purpose experiment, welcoming behaviour.
Call out an ordinary scenario and children collect one tool that might help. More than one answer can be correct.
Example: “You made a mistake” → kind self-talk; “you keep forgetting your sports bag” → tiny routine.$cw39_g$,
  kids_game_under5 = $cw39_g5$Use only four visual tools and simple scenarios.$cw39_g5$,
  updated_at = now()
WHERE week_number = 39;
UPDATE public.mindcast_live_sessions SET
  session_title          = $s39a_st$The Foundation Is Laid$s39a_st$,
  theme_title            = $s39a_tt$Integration — What Is Actually Working$s39a_tt$,
  phase                  = 3,
  phase_name             = $s39a_pn$Rebuild$s39a_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s39a_hk$Without looking at notes, write down every Phase 3 idea or practice you can remember in two minutes. Then open your notes and compare. What stayed available in memory — and what disappeared?$s39a_hk$,
  s5_source_core_concept = $s39a_cc$A curriculum can create the feeling of progress simply because ideas are fresh and emotionally resonant. That is not the same as durable change.
Week 39 is an audit.
We look for behavioural evidence:
- Did I use it?
- Did it help in the situation it was designed for?
- What got in the way?
- Should I keep, modify or drop it?
Integration means selection, not accumulation. You do not need to carry thirteen new practices into Phase 4.$s39a_cc$,
  core_concept           = $s39a_cco$Integration is not declaring that you have become a new person. It is reviewing evidence from real behaviour, deciding which practices are useful, and carrying forward a small number deliberately.
Adult translation: Replace “look how transformed I am” with “what did I actually use, what changed, what did not, and what deserves another experiment?”$s39a_cco$,
  teaching_points        = $s39a_tp$1. Remembering is part of learning. Research on retrieval practice shows that actively recalling material strengthens later access more effectively than simply rereading it. That is why we began by trying to remember before looking back.
2. Use is better evidence than inspiration. A lesson can feel profound and never alter behaviour. A boring tool used three times in real life may be more valuable.
3. Monitoring progress can improve follow-through. Meta-analytic evidence suggests that regularly checking progress toward a goal tends to improve goal attainment, especially when progress is recorded or made visible. Monitoring is a tool, not a moral scorecard.
4. Not every practice should survive. A tool may not fit your context, may solve a problem you do not have, or may simply be less useful than another approach. Dropping it is not failure.
5. Look for conditions, not personality explanations. If something worked only when you slept well, had childcare, prepared the environment or used a smaller version, that context is part of the learning.
6. Separate change from memory bias. It is easy to rewrite the past as “I used to be completely different.” Use concrete examples where possible: a conversation handled differently, a routine repeated, a boundary stated, a recovery break taken.
7. Carry fewer things forward. Choosing two or three practices increases the chance you can recognise when to use them. A giant personal operating system is difficult to retrieve under pressure.$s39a_tp$,
  video_description      = $s39a_vd$$s39a_vd$,
  todays_theme           = $s39a_tdt$$s39a_tdt$,
  todays_world_vo_script = $s39a_tdv$$s39a_tdv$,
  ancient_wisdom_reframe = $s39a_aw$$s39a_aw$,
  ancient_wisdom_vo_script = $s39a_awv$$s39a_awv$,
  signal_metaphor        = $s39a_sm$You have been testing tools in a workshop. Integration is the moment you decide what actually belongs in the toolbox you carry, not when you nail every tool to your belt.$s39a_sm$,
  private_write_prompt   = $s39a_pw$Before reviewing any pages, list:
- three ideas you remember;
- three practices you remember;
- one moment you used something outside Mindcast.
If you cannot remember much, write that honestly. Memory is data.$s39a_pw$,
  experiential_exercise  = $s39a_ex$KEEP / MODIFY / PARK — 25 minutes
Review Weeks 27–38. For each, mark:
- KEEP: useful enough to continue;
- MODIFY: useful idea, wrong size/timing/context;
- PARK: not useful or not relevant now.
For every KEEP, require one concrete piece of evidence: “I used this when…”
For every MODIFY, write the redesign.
Then choose your THREE CARRY-FORWARD TOOLS.
For each tool complete:
CUE: When do I need this?
ACTION: What exactly do I do?
MINIMUM VERSION: What counts on a difficult day?
EVIDENCE: How will I know it helped?
BEFORE
Choose one item you wrote at the start of Phase 3, if available. Compare it with now using only specific behaviour. Avoid “I am more evolved/confident/authentic.” Prefer “I now do X in situation Y.”$s39a_ex$,
  guided_reflection      = $s39a_gr$What did I actually practise?
What worked in the life I really have?
What did I like but never use?
What am I willing to stop carrying?
Which three tools do I most want available under pressure?$s39a_gr$,
  journaling_prompt      = $s39a_jp$Write a one-page Phase 3 operating note:
When  happens, I want to remember . My three carry-forward tools are  because I have evidence that .$s39a_jp$,
  intention_prompt       = $s39a_ip$Use one of the three tools once before next Sunday — no new technique added.$s39a_ip$,
  core_affirmation       = $s39a_ca$I do not need to prove that I have transformed. I can look at the evidence, keep what works, change what does not, and carry forward only what is useful.$s39a_ca$,
  weekly_practice_mon    = $s39a_pm$Retrieval: without opening notes, write your three tools from memory.$s39a_pm$,
  weekly_practice_wed    = $s39a_pw2$Use one: apply it in the situation it was designed for. Review honestly: keep, modify or park after use.$s39a_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s39a_ps$Bring back: one tool you are carrying forward and one you are leaving behind.$s39a_ps$,
  previous_week_callback = $s39a_pwc$$s39a_pwc$,
  facilitator_notes      = $s39a_fn$## Aim
This is a learning-integration session, not a graduation ceremony designed to heighten attachment to the programme.
## Run the room
- No requirement to read letters aloud or publicly testify to change.
- Do not say “look who you've become” or imply 39 weeks of attendance itself is evidence of growth.
- Do not frame Phase 4 as a higher level of membership/status.
- Participants are allowed to say a week did nothing for them.
## Why this week exists — the evidence
Retrieval practice: Experimental learning research consistently shows that trying to retrieve information improves later retention compared with additional study alone.
Progress monitoring: Harkin et al. (2016) meta-analysed goal-monitoring interventions and found monitoring progress increased goal attainment, with stronger effects when outcomes were recorded or reported. This supports periodic review, not obsessive tracking.
Transfer: Knowing a concept in the room does not guarantee using it in a new context. Explicit cue/action planning is included to improve transfer.
## We deliberately do not claim
- thirteen weeks create a new identity;
- emotional intensity proves integration;
- public sharing consolidates change;
- everyone should keep the same practices;
- Phase 4 represents a superior stage of personal development.
## Source trail
Roediger & Karpicke retrieval-practice literature · Harkin et al. (2016) meta-analysis of goal progress monitoring · implementation-intention literature for cue/action transfer.$s39a_fn$,
  updated_at = now()
WHERE week_number = 39 AND audience = 'Adult';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s39t_st$What Has Been Built$s39t_st$,
  theme_title            = $s39t_tt$Integration — What Is Actually Working$s39t_tt$,
  phase                  = 3,
  phase_name             = $s39t_pn$Rebuild$s39t_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s39t_hk$Without opening your notes, write every Phase 3 idea you can remember in ninety seconds. Do not worry about getting the names right. Then look back and see what stuck.$s39t_hk$,
  s5_source_core_concept = $s39t_cc$A session can feel powerful because it is new, because people around you are engaged, or because the topic hits at the right moment. That does not automatically mean it became a skill.
This week checks real-world use.
For each tool we ask:
Did I remember it? Did I use it? Did it help? Should I keep, change or drop it?
You do not get points for keeping everything.$s39t_cc$,
  core_concept           = $s39t_cco$Integration is not declaring that you have become a new person. It is reviewing evidence from real behaviour, deciding which practices are useful, and carrying forward a small number deliberately.
Teen translation: Figure out what you actually used, what only sounded good in the room, and which few tools are worth keeping.$s39t_cco$,
  teaching_points        = $s39t_tp$1. Trying to remember is part of learning. Retrieval-practice research shows that actively recalling material improves later memory better than simply rereading it again.
2. Using a tool once in real life tells you more than liking the lesson. The goal is transfer — remembering the skill when the actual situation appears.
3. Progress works better when you look at evidence. Research on progress monitoring suggests checking what you actually did can improve follow-through. The point is data, not judging yourself.
4. A tool that did not fit is allowed to go. Maybe the situation never came up. Maybe another method worked better. Maybe the exercise was annoying. “Park it” is a valid answer.
5. Change can be specific and small. “I paused before replying twice” is better evidence than “I became calmer.”
6. Your environment is part of the result. A habit that only worked when your phone was away or a parent helped with the setup tells you something useful about design.
7. Three tools you can remember beat twelve you cannot. Under stress, simple retrieval matters.$s39t_tp$,
  video_description      = $s39t_vd$$s39t_vd$,
  todays_theme           = $s39t_tdt$$s39t_tdt$,
  todays_world_vo_script = $s39t_tdv$$s39t_tdv$,
  ancient_wisdom_reframe = $s39t_aw$$s39t_aw$,
  ancient_wisdom_vo_script = $s39t_awv$$s39t_awv$,
  signal_metaphor        = $s39t_sm$Your phone is full of apps. You do not need every app open all the time. Keep the few that actually do a job for you.$s39t_sm$,
  private_write_prompt   = $s39t_pw$Before looking back, write:
- three ideas you remember;
- one exercise you remember;
- one moment you used something outside the session;
- one thing you cannot remember well at all.
No answer is embarrassing.$s39t_pw$,
  experiential_exercise  = $s39t_ex$KEEP / TWEAK / DELETE-FROM-HOME-SCREEN — 20 minutes
Review Weeks 27–38.
For each mark:
- KEEP: I used it or clearly want to test it more;
- TWEAK: good idea, but the original version did not fit;
- PARK: not useful to me now.
Then choose three tools.
For each complete:
- WHEN: what situation should remind me?
- DO: what is the actual action?
- TINY VERSION: what counts on a bad day?
- PROOF: what would show me it helped?
REALITY CHECK
Compare one thing you wrote early in Phase 3 with now. Only count behaviour you can point to. “I am a better person” does not count; “I did X differently in Y situation” does.$s39t_ex$,
  guided_reflection      = $s39t_gr$What did I actually use?
What did I only agree with?
Which tool fits the real life I have?
Which one can I stop pretending I should use?
What three things do I want to remember when Phase 4 gets busy?$s39t_gr$,
  journaling_prompt      = $s39t_jp$Write your three-tool card:
When  happens, I will remember . My three tools are  /  / .$s39t_jp$,
  intention_prompt       = $s39t_ip$Use one tool once this week. Do not add a fourth.$s39t_ip$,
  core_affirmation       = $s39t_ca$I do not have to prove I changed. I can keep the tools that work, change the ones that almost work, and leave the rest behind.$s39t_ca$,
  weekly_practice_mon    = $s39t_pm$Memory check: write the three tools without looking.$s39t_pm$,
  weekly_practice_wed    = $s39t_pw2$Use one in context. Decide: keep, tweak or park after the test.$s39t_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s39t_ps$Bring back: one thing staying and one thing going.$s39t_ps$,
  previous_week_callback = $s39t_pwc$$s39t_pwc$,
  facilitator_notes      = $s39t_fn$## Aim
Make the phase ending feel useful and grounded, not emotionally engineered.
## Run the room
- No public testimony about transformation.
- No “we've been together 39 weeks, look at our bond” messaging.
- Do not require letters to the past self.
- Teens can openly say a lesson did not help.
- Phase 4 is simply the next curriculum phase, not a higher status.
## Why this week exists — the evidence
Retrieval-practice research supports trying to recall material rather than relying only on rereading. Progress-monitoring meta-analysis also supports periodic review of behaviour and outcomes.
The practical lesson is modest: review improves access to what was learned and makes it easier to choose what to keep testing.
## We deliberately do not claim
- attendance equals growth;
- a phase creates a new identity;
- public sharing makes learning permanent;
- every teen should show visible change after 13 weeks.
## Source trail
Roediger & Karpicke retrieval-practice research · Harkin et al. (2016) goal-monitoring meta-analysis.$s39t_fn$,
  updated_at = now()
WHERE week_number = 39 AND audience = 'Teen';
UPDATE public.mindcast_live_sessions SET
  session_title          = $s39c_st$Look What We've Built!$s39c_st$,
  theme_title            = $s39c_tt$Integration — What Is Actually Working$s39c_tt$,
  phase                  = 3,
  phase_name             = $s39c_pn$Rebuild$s39c_pn$,
  heavy_week_flag        = false,
  s5_source_opening_hook = $s39c_hk$How many things from the last few weeks can you remember without looking? We are going to see what our brains kept — and choose what is worth keeping close.$s39c_hk$,
  s5_source_core_concept = $s39c_cc$Learning is not about collecting the most worksheets.
A tool matters when you can remember it and use it in a real situation.
This week children practise three jobs:
REMEMBER → TEST → CHOOSE.
Some tools will stay. Some may need changing. Some can be left for later.$s39c_cc$,
  core_concept           = $s39c_cco$Integration is not declaring that you have become a new person. It is reviewing evidence from real behaviour, deciding which practices are useful, and carrying forward a small number deliberately.
Child translation: Look back, remember what you tried, and choose a few tools that actually help you.$s39c_cco$,
  teaching_points        = $s39c_tp$1. Trying to remember helps learning. Looking away from the answer and pulling it from memory is useful practice for the brain.
2. A tool is useful when it helps in a real moment. Liking a picture or activity is different from remembering it when you need it.
3. You do not have to keep every tool. Different children need different things at different times.
4. Small examples count. Remembering to say “I can try again,” taking a break, or putting your bag by the door is real practice.
5. If a tool did not work, we can change it. Make it smaller, use a picture reminder, ask a grown-up for help, or choose another tool.
6. You are not being graded on how much you changed. The goal is to learn what is helpful.$s39c_tp$,
  ancient_wisdom_reframe = '',
  ancient_wisdom_vo_script = '',
  todays_theme           = '',
  todays_world_vo_script = '',
  signal_metaphor        = $s39c_sm$A real toolbox does not need every tool in the hardware shop. It needs the few tools you know how to use.$s39c_sm$,
  private_write_prompt   = $s39c_pw$Before looking at any old pages, draw or write three things you remember from Phase 3. If you only remember one, write one. That is okay.$s39c_pw$,
  experiential_exercise  = $s39c_ex$MY THREE-TOOL TOOLBOX — 20 minutes
Lay out picture cards from Weeks 27–38.
Children sort each into:
- I USE THIS;
- I MIGHT TRY THIS;
- NOT FOR ME RIGHT NOW.
Then choose exactly three cards for a paper toolbox.
For each card complete with words or pictures:
- WHEN: when might I need it?
- DO: what do I do?
- HELP: who can help me remember or use it?
Children may choose different tools from one another.
TEST ROUND
Read ordinary scenarios and children hold up a toolbox card if one fits. They may also say NONE OF MY TOOLS FITS.
That answer is important: not every problem is solved by a Mindcast technique.$s39c_ex$,
  guided_reflection      = $s39c_gr$Which tool did you remember by yourself?
Which tool have you really used?
Which tool might be useful later but not now?
Which three do you want in your toolbox?
And when is the best tool simply tell a grown-up?$s39c_gr$,
  journaling_prompt      = $s39c_jp$Draw your three-tool toolbox and finish: My tools can help with some problems. When a problem is too big, I can ask  for help.$s39c_jp$,
  intention_prompt       = $s39c_ip$Use one toolbox tool once this week if the right situation appears.$s39c_ip$,
  core_affirmation       = $s39c_ca$I can remember the tools that help me. I do not need every tool, and I can always ask a trusted grown-up when I need more help.$s39c_ca$,
  weekly_practice_mon    = $s39c_pm$Name your three tools without looking.$s39c_pm$,
  weekly_practice_wed    = $s39c_pw2$Try one if it fits a real situation. Ask a caregiver: “Which tool have you seen me use?”$s39c_pw2$,
  weekly_practice_fri    = '',
  weekly_practice_sun    = $s39c_ps$Bring back: keep it, change it or swap it?$s39c_ps$,
  previous_week_callback = $s39c_pwc$$s39c_pwc$,
  facilitator_notes      = $s39c_fn$## Aim
Make integration concrete and non-performative. Children leave with three retrievable tools, not a celebration of how much Mindcast has changed them.
## Run the room
- Avoid balloons/ceremony that frames progression as membership status.
- Do not tell children “the world needs what you've built.”
- Never ask a child to publicly describe how they have become better.
- Photograph work only under the existing consent policy; participation in a display is optional.
## Why this week exists — the evidence
Retrieval-practice research supports actively trying to remember material as a way to strengthen later access. For children, the developmental translation is repeated scenario-to-tool matching rather than abstract reflection on identity.
Progress review can also help people notice what they actually used, but this is not a validated test of personal development.
## We deliberately do not claim
- a child has become a new person after 13 weeks;
- remembering more lessons means greater growth;
- every problem has a Mindcast tool;
- public celebration strengthens learning.
## Source trail
Retrieval-practice literature translated developmentally; Harkin et al. progress-monitoring research as broader context.$s39c_fn$,
  updated_at = now()
WHERE week_number = 39 AND audience = 'Child';
