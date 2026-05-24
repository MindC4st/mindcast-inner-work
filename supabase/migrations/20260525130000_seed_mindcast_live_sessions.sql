-- Seed mindcast_live_sessions: 156 rows (52 weeks × 3 audiences).
-- Source: src/data/curriculumData.ts for weeks 1–20, FRAMEWORK.md for 21–28.
-- Weeks 29–52 are inserted as stub rows so the row count is exactly 156;
-- their copy is intentionally blank for content team to fill in.
--
-- Re-running this migration is idempotent — UNIQUE(week_number, audience)
-- guards against duplicates; ON CONFLICT skips existing rows.

WITH lesson_source AS (
  SELECT * FROM (VALUES
    -- (week, phase, phase_name, theme_title, themeSummary, dig_q1, dig_q2,
    --  teen_track, kids_track, facilitator_notes, edge_prompt, episode_title)

    -- ===== Movement I: Ground =====
    (1, 1, 'I — Ground', 'The Question Underneath the Question',
      'Before we can do any real inner work, we need to get honest about what we''re actually asking. Most of us walk around with surface-level questions ("How do I fix this?" "Why do I feel stuck?") when the real work lives underneath. This session is about finding the deeper question our soul is actually asking.',
      'What question have you been asking yourself on repeat? (e.g. "Why am I like this?" "When will I feel better?")',
      'What do you think might be the question underneath that question?',
      'Use the Dig Questions directly — they''re accessible for teens. No alternative resource needed. Focus on the question "What have you been asking yourself?" and help them name it without needing an answer yet.',
      '',
      'This is the first session — tone matters. Keep it warm, grounded, not too heavy. Plant the seed: this is not about fixing. This is about understanding. Let people sit with the discomfort of not having an answer yet. The goal of this session is loosening, not solving.',
      'What would it mean to stop trying to fix yourself for a moment, and instead just listen?',
      ''),

    (2, 1, 'I — Ground', 'The Stories We Inherited',
      'We don''t show up as blank slates. We carry stories — from our families, our cultures, our religions, our wounds. Some of these stories were told to us directly. Others we absorbed without anyone saying a word. This session is about separating the stories we were given from the ones we actually want to live by.',
      'What was the dominant story in your family about who you were supposed to be?',
      'Is there a story you''ve been carrying that you''re ready to question?',
      'Direct questions work for teens. Frame as: "What have people always told you about who you are?" and "Do you think that''s true?"',
      '',
      'This can stir up family loyalty conflicts — people may feel disloyal examining inherited stories. Remind the group: examining a story is not rejecting it. We''re just looking at it. Some stories are worth keeping. The goal is choice, not rejection.',
      'What''s one story you''ve been telling yourself that you''re not even sure you believe anymore?',
      ''),

    (3, 1, 'I — Ground', 'Performance vs. Person',
      'Many of us learned early that love, approval, and safety were conditional on how well we performed. We became good at doing instead of good at being. This session explores the gap between the version of us that shows up to perform and the person we actually are underneath.',
      'Where did you learn that your value was tied to what you did or achieved?',
      'What would it feel like to be loved for just being you — not for what you produce?',
      'Teens connect quickly to this. Use: "Do you ever feel like you have to be a certain version of yourself to be accepted?" Keep it concrete with school, friends, social media.',
      '',
      'This is a tender one for high achievers and people-pleasers. Watch for minimising ("It wasn''t that bad"). Normalise the grief of realising love may have been conditional. This is often where tears come.',
      'What would you lose if you stopped performing?',
      ''),

    (4, 1, 'I — Ground', 'Body Wisdom',
      'We spend most of our lives in our heads, but the body carries wisdom we''ve learned to ignore. This session is about coming back into the body — not as a concept, but as a real practice. Learning to feel, to regulate, and to trust the signals your body has been sending all along.',
      'When was the last time you felt truly at home in your body?',
      'What is your body trying to tell you that you''ve been too busy to hear?',
      'Use the two Dig Questions directly. Frame body awareness as "learning your body''s language" rather than "healing trauma" — less intimidating.',
      '',
      'This session may trigger dissociation for some — give permission to keep eyes open, move, or step out. Regulate before you educate. Consider a grounding exercise early. Don''t push anyone into body awareness; invite, don''t demand.',
      'When''s the last time you listened to your body instead of overriding it?',
      ''),

    (5, 1, 'I — Ground', 'The Parts That Don''t Fit the Story',
      'We all have parts of ourselves that don''t fit the neat story we''ve constructed — the anger that surprises us, the sadness that won''t leave, the desires we''re ashamed of. This session is about welcoming those parts instead of pathologising them. What if every part of you is trying to protect you?',
      'What''s a part of you that you''ve tried to hide, suppress, or disown?',
      'If that part of you could speak, what would it say it''s trying to protect you from?',
      'Direct Dig Questions work. Normalise having "different versions" of yourself. Use language like: "The version of you at school might be different from the version at home — and that''s okay."',
      '',
      'IFS-adjacent work — be careful not to pathologise any part. Every part has good intent. Watch for the inner critic dominating. Some people will have strong reactions to naming disowned parts. Keep it curious, not clinical.',
      'What would it feel like to stop fighting a part of yourself?',
      ''),

    (6, 1, 'I — Ground', 'A Portrait Not a Blueprint',
      'We spend so much time trying to become someone we''re supposed to be. But what if the goal isn''t transformation into a blueprint — but the slow, loving work of painting a portrait of who you actually are? This session closes Movement I by celebrating the person already here.',
      'If you stopped trying to be a better version of yourself, who might you discover you already are?',
      'What''s one thing you already love about the person you''re becoming?',
      'Dig Questions are accessible. Frame as: "If there was no pressure to be anyone different, what would stay the same about you?"',
      'Same approach as teen track — focus on self-appreciation.',
      'End of Movement I — let this land as a soft landing. This should feel like a breath after the preceding work. Encourage appreciation of progress, not critique of remaining work. Celebration is part of the curriculum.',
      'What if you''re already enough, right now, exactly as you are?',
      ''),

    -- ===== Movement II: Wound =====
    (7, 2, 'II — Wound', 'What Are You Carrying?',
      'Before we can do any wound work, we need to name what we''re actually carrying. This session asks: what''s in your emotional backpack? Not to dump it all out at once — just to acknowledge the weight you''ve been quietly holding.',
      'What are you carrying right now that you haven''t fully acknowledged?',
      'If you could set down one thing today — just for a moment — what would it be?',
      '',
      '',
      'This opens Movement II — set the container carefully. This movement will be the hardest. Remind them: we name the weight not to be crushed by it, but so we know what we''re working with. Go slowly. Validate without fixing.',
      'What would it feel like to admit how much you''re actually carrying?',
      ''),

    (8, 2, 'II — Wound', 'Smart Ways We Avoid',
      'We''ve all developed clever strategies to avoid feeling the hard stuff. Productivity, busyness, people-pleasing, numbing, intellectualising — these are smart ways we avoid. This session is about recognising our avoidance patterns with compassion, not judgement.',
      'What''s your smartest avoidance strategy — the one that looks the most productive?',
      'If you stopped avoiding for one day, what might you feel?',
      'Use: "What do you do when you don''t want to feel something?" Teens will recognise doom-scrolling, gaming, overworking. Normalise it.',
      '',
      'This can feel confrontational ("my coping is BAD?"). Reframe: avoidance kept you safe. These strategies worked. We''re just noticing them now so we can choose differently. Avoidance is not failure — it''s survival.',
      'What would you have to feel if you stopped your favourite distraction?',
      ''),

    (9, 2, 'II — Wound', 'The Wound You Didn''t Choose',
      'Some of our deepest wounds weren''t chosen — they were given to us before we had any say. This session looks at the wound you didn''t choose, with honesty but without blame. Not to stay in the pain, but to finally see it clearly.',
      'Van der Kolk says trauma doesn''t require catastrophe — chronic experiences of being unseen or unsafe shape us just as deeply. Is there something in your upbringing that you''ve minimised as "not that bad" that might have left more of a mark than you''ve acknowledged?',
      'What did you most need as a child that you didn''t consistently receive? You can be honest here — this is not about blame. It''s about accuracy.',
      'Diary of a CEO: Bessel van der Kolk — use the section on childhood nervous system development (accessible). Alternative: Dr. Nadine Burke Harris TED Talk "How Childhood Trauma Affects Health Across a Lifetime" (15 min, very accessible for teens).',
      '',
      'This is potentially the most emotionally charged session in the movement. Go slow. Let silence sit. Van der Kolk''s framing ("accuracy, not blame") is crucial — return to it. Watch for participants shutting down or dissociating. Have grounding resources ready.',
      'What did you need that you didn''t get — and what did you tell yourself instead?',
      'The Body Trauma Expert: Bessel van der Kolk'),

    (10, 2, 'II — Wound', 'The Wound You Keep Reopening',
      'We all have patterns we keep repeating. The same fight. The same type of person. The same wall we run into. This session is about the wound you keep reopening — not because you''re broken, but because something inside is still trying to be healed.',
      'What''s a pattern you keep repeating — in relationships, work, or how you treat yourself?',
      'What might that pattern be trying to show you about an older wound?',
      'Teens feel this in friendships. Use: "Do you find yourself in the same type of friendship conflict over and over?"',
      '',
      'This can feel hopeless ("I keep doing the same thing!"). Reframe: repetition is not failure — it''s information. The pattern is pointing somewhere. This week is about following the breadcrumbs, not judging yourself for the loop.',
      'What if the pattern you hate most is actually pointing you toward what still needs healing?',
      ''),

    (11, 2, 'II — Wound', 'Grief as Love',
      'Grief is not the opposite of love — it''s love with nowhere to go. This session re-frames grief not as something to get over, but as evidence of how deeply we''ve loved. For everything we''ve lost, everything we never had, and everything we''re still mourning.',
      'What are you still grieving — a loss, a relationship, a version of yourself, a childhood you wish you''d had?',
      'If grief is love with nowhere to go, what does your grief say about what you''ve loved?',
      'Gentle framing: "What''s something or someone you miss?" Let them lead. Don''t push. Grief in teens can show as anger or withdrawal.',
      '',
      'Hold this session with care. Grief is not linear. Some may not have cried in years — this could unlock it. Don''t rush to comfort. Let grief be grieved. Consider having tissues and a moment of silence available.',
      'What if your grief isn''t a problem to solve, but proof that you loved?',
      ''),

    (12, 2, 'II — Wound', 'Permission to Not Be Fine',
      'We live in a culture that demands we be okay. Positive vibes only. Keep going. Push through. This session is about giving yourself and each other radical permission to not be fine. Not as a pit of despair, but as an act of honesty.',
      'Where do you feel pressure to be fine when you''re not?',
      'What would it feel like to tell one person the truth about how you''re actually doing?',
      'Direct Dig Questions work well. Frame: "Who do you feel like you have to pretend to be okay for?" This often unlocks honest conversation.',
      '',
      'This can be freeing but also scary — some have never said "I''m not fine" aloud. Model it yourself if you can. Create space for honest answers without fixing. The goal is permission, not problem-solving.',
      'What would it cost you to stop pretending you''re fine?',
      ''),

    (13, 2, 'II — Wound', 'What Healing Looks Like',
      'We''ve spent Movement II looking at the wound honestly. Now: what does healing actually look like? Not the Instagram version — the real one. The slow one. The one that still has hard days. This session closes the wound movement with a vision of healing that is honest, compassionate, and possible.',
      'What has healing looked like in your life so far — even the small moments?',
      'What do you need to hear about healing right now?',
      '',
      '',
      'End of Movement II — this should feel like exhaling after the deep work. Validate how far they''ve come. Healing is not "I''m fixed" — it''s "I''m learning to hold myself differently." Leave them with hope, not pressure.',
      'What if healing isn''t about becoming whole, but learning to hold all of yourself?',
      ''),

    -- ===== Movement III: Tend =====
    (14, 3, 'III — Tend', 'The Voice in Your Head',
      'There''s a voice in your head that talks to you constantly. Is it kind? Is it cruel? Is it your voice, or one you absorbed? This session is about noticing the inner voice and beginning to change the channel.',
      'When you make a mistake, what does the voice in your head say to you?',
      'Whose voice do you think that really is?',
      'Direct Dig Questions. Frame as: "What do you say to yourself when things go wrong?" Teens often have a harsh inner voice — normalise it without endorsing it.',
      '',
      'This opens Movement III (Tend) — a gentler movement than II. The inner critic can be deeply ingrained. Don''t expect transformation in one session — just noticing is the work this week.',
      'Would you let someone else talk to you the way you talk to yourself?',
      ''),

    (15, 3, 'III — Tend', 'Deserving',
      'Do you believe you deserve good things? Not intellectually — in your bones. Many of us carry a deep sense of unworthiness that no achievement can fix. This session sits with the question of deserving — not as a concept, but as a felt experience.',
      'Deep down, do you believe you deserve to be happy? If not, when did you decide that?',
      'What would change if you truly believed you were worthy of love and care?',
      'Frame as: "Do you feel like you have to earn good things, or can you just have them?"',
      '',
      'This can feel vulnerable. Worthiness wounds run deep. Don''t try to convince anyone they''re worthy — that''s not how it works. Just create space for the question. The shift happens slowly.',
      'What if you didn''t have to earn love?',
      ''),

    (16, 3, 'III — Tend', 'What You''d Say to Someone You Loved',
      'We are often kinder to others than we are to ourselves. This session asks: if someone you loved were going through what you''re going through, what would you say to them? And what would it mean to say that to yourself?',
      'If your best friend told you what you''ve been telling yourself, what would you say to them?',
      'What''s stopping you from saying that to yourself?',
      'Direct Dig Questions work well. Teens are great at giving advice to friends but terrible at taking their own. Use that gap.',
      '',
      'This is often where the shift from critic to compassionate self begins. The question creates distance from the inner critic. Don''t force self-compassion — just create the contrast between how we treat others vs ourselves.',
      'What would change if you treated yourself like someone you love?',
      ''),

    (17, 3, 'III — Tend', 'Rest as Value',
      'We live in a culture that equates rest with laziness and productivity with worth. This session re-frames rest not as a reward for hard work, but as a fundamental human need and a value in itself. Rest as resistance. Rest as restoration.',
      'What would it mean to believe that rest is something you deserve, not something you have to earn?',
      'What would you do with your time if you weren''t trying to be productive?',
      'Frame: "Do you ever feel guilty when you''re not doing something?" Relevant for teens in high-pressure school environments.',
      '',
      'This can be harder for high achievers than the wound work. The resistance to rest is real. Don''t shame anyone for struggling with this. Just name the conditioning and invite experimentation.',
      'What would it feel like to rest without guilt?',
      ''),

    (18, 3, 'III — Tend', 'The Need You Keep Deferring',
      'There''s something you need — and you keep putting it off. Rest, a conversation, a boundary, help, permission to stop. This session is about naming the need you keep deferring and taking one small step toward meeting it.',
      'What''s a need you keep putting off — telling yourself "later" or "when things calm down"?',
      'What''s one small thing you could do this week to honour that need?',
      'Frame as: "What''s something you know you need but keep avoiding?" Could be sleep, a conversation, a break from social media.',
      '',
      'Action-oriented session. Encourage small steps, not grand gestures. The goal is self-trust — proving to yourself that you''ll show up for your own needs. Celebrate tiny wins.',
      'What would it mean to finally take your own needs seriously?',
      ''),

    (19, 3, 'III — Tend', 'Forgiving Yourself',
      'There''s something you still hold against yourself. A mistake. A choice. A version of you that you''re ashamed of. This session is about the difficult, tender work of self-forgiveness — not as letting yourself off the hook, but as finally putting the hook down.',
      'What''s one thing you''re still holding against yourself?',
      'What would forgiveness for that look like — not as a concept, but as a real possibility?',
      'Gentle framing: "Is there something you''ve done that you still feel bad about?" Don''t push. Allow silence.',
      '',
      'This is delicate. For some, self-forgiveness feels impossible or undeserved. Never force it. The goal is not to achieve forgiveness in one session — it''s to open the door. Name the difference between guilt ("I did something bad") and shame ("I am bad").',
      'What would it mean to forgive yourself for being human?',
      ''),

    (20, 3, 'III — Tend', 'Becoming Your Own Companion',
      'What if the most important relationship you''ll ever have is the one with yourself? This session closes Movement III by exploring what it means to become your own companion — not in a lonely way, but in a way that means you''re never truly alone.',
      'What does it feel like to spend time alone with yourself?',
      'What would it take to become a companion to yourself — someone you can come back to?',
      '',
      '',
      'End of Movement III — celebrate the inward turn. Self-companionship is the foundation for everything in Movement IV. Don''t over-romanticise solitude — name that it''s an acquired taste for many.',
      'What if being alone with yourself could feel like coming home?',
      ''),

    -- ===== Movement IV: Open (from FRAMEWORK.md, content TBD) =====
    (21, 4, 'IV — Open', 'Other People Are Also Trying',
      'After three movements of turning inward, the fourth turns the gaze outward — not as an escape from the self, but as an expression of it. This session: an invitation to extend to other people the same quality of curiosity and patience we have been practising toward ourselves.',
      'Think of someone in your life you find difficult. What might they be carrying that you can''t see?',
      'What changes when you assume the people around you are also struggling?',
      '', '', '', '', ''),

    (22, 4, 'IV — Open', 'The Distance Between Us',
      'Human beings are built for connection and terrified of it simultaneously. This week is an honest look at the distances we develop — where they come from, what they protect, and what they cost.',
      'Is there someone in your life you have been keeping at arm''s length? What would it take to close the distance, even slightly?',
      'What is one small move toward someone you''ve been distant from that you could make this week?',
      '', '', '', '', ''),

    (23, 4, 'IV — Open', 'Listening as an Act of Love',
      'Most conversations are two people waiting for their turn. Genuine listening — the kind where the other person feels truly heard — is rare. This week explores what listening actually involves and what it feels like to receive.',
      'When did you last feel truly listened to? What did the other person do that made it feel that way?',
      'Who in your life would feel different if you listened to them the way you wish to be listened to?',
      '', '', '', '', ''),

    (24, 4, 'IV — Open', 'What You Project, What You Receive',
      'The way we see other people is not objective — it is filtered through everything we are carrying. This week is about those filters: how they form, how they distort, and how honest inner work makes you more accurate about others.',
      'Is there a relationship where your interpretation of the other person might be more about you than about them? What might you be projecting?',
      'What would be different if you set down one assumption you''ve been carrying about someone?',
      '', '', '', '', ''),

    (25, 4, 'IV — Open', 'Conflict as Contact',
      'Most people treat conflict as a failure. This week offers a different frame: conflict, handled with honesty and care, is one of the most direct routes to real intimacy. The question is not whether to avoid it. It is whether, when it arrives, you can stay.',
      'Think of a conflict you have been avoiding. What are you protecting yourself from by not having it? What might be on the other side of it?',
      'What would change if you stayed in the difficulty instead of leaving?',
      '', '', '', '', ''),

    (26, 4, 'IV — Open', 'Belonging vs. Fitting In',
      'There is a difference between fitting in (performing the version of yourself that earns approval) and belonging (being known and valued for who you actually are). This week examines why we settle for the first.',
      'Where in your life do you feel like you belong — not because you''re performing, but because you''re known? What made that possible?',
      'Where are you fitting in when you''re actually craving belonging?',
      '', '', '', '', ''),

    (27, 4, 'IV — Open', 'Vulnerability as the Point, Not the Risk',
      'Letting someone see you involves exposure and loss of control. This week is an honest conversation about what becomes possible on the other side: the connections that exist when you stop managing the impression you''re making and start showing up.',
      'Is there something true about you that you have never let someone else fully see? What has keeping it hidden cost you?',
      'Who in your life could you let see one more inch of you this week?',
      '', '', '', '', ''),

    (28, 4, 'IV — Open', 'The Practice of Compassion',
      'Closing the full arc. Compassion — toward yourself and toward others — is not an achievement. It is a practice you do imperfectly, repeatedly, for the rest of your life. The fact that it is never finished is not a failure. It is the whole point.',
      'What is one small thing you could do today — for yourself, or for someone else — that comes from what you''ve noticed in yourself over this journey?',
      'What does this work mean to you, now that you are here?',
      '', '', 'Closing session of the full arc. Honour what the group has done. Hold space for both the sadness of ending and the relief of having travelled. Compassion is the through-line — name it.', '', '')

  ) AS t (
    week_number, phase, phase_name, theme_title,
    theme_summary, dig_q1, dig_q2,
    teen_track, kids_track,
    facilitator_notes, edge_prompt, episode_title
  )
),

-- Pad weeks 29..52 as stub rows so total = 156.
stub_weeks AS (
  SELECT
    gs AS week_number,
    4 AS phase,
    'IV — Open' AS phase_name,
    '' AS theme_title,
    '' AS theme_summary,
    '' AS dig_q1,
    '' AS dig_q2,
    '' AS teen_track,
    '' AS kids_track,
    '' AS facilitator_notes,
    '' AS edge_prompt,
    '' AS episode_title
  FROM generate_series(29, 52) gs
),

all_lessons AS (
  SELECT * FROM lesson_source
  UNION ALL
  SELECT * FROM stub_weeks
),

audiences AS (
  SELECT unnest(ARRAY['Adult', 'Teen', 'Child']) AS audience
)

INSERT INTO public.mindcast_live_sessions (
  week_number, phase, phase_name, theme_title, audience,
  core_concept, signal_metaphor, ancient_wisdom_reframe, session_title,
  opening_hook, teaching_points, experiential_exercise,
  guided_reflection, journaling_prompt,
  weekly_practice_mon, weekly_practice_wed, weekly_practice_sun,
  core_affirmation, video_link, video_description, video_backup_description,
  film_script_2min, facilitator_notes
)
SELECT
  l.week_number,
  l.phase,
  l.phase_name,
  l.theme_title,
  a.audience,
  -- core_concept: themeSummary for Adult; teen_track for Teen (fallback to summary);
  -- kids_track for Child (fallback to teen_track / summary so the lesson isn't blank).
  CASE a.audience
    WHEN 'Adult' THEN l.theme_summary
    WHEN 'Teen'  THEN COALESCE(NULLIF(l.teen_track, ''), l.theme_summary)
    WHEN 'Child' THEN COALESCE(NULLIF(l.kids_track, ''), NULLIF(l.teen_track, ''), l.theme_summary)
  END                                                                     AS core_concept,
  ''                                                                      AS signal_metaphor,
  ''                                                                      AS ancient_wisdom_reframe,
  COALESCE(SUBSTRING(l.theme_summary FROM '^[^.]+\.'), '')                AS session_title,
  l.edge_prompt                                                           AS opening_hook,
  -- Teaching points: numbered list built from the two dig questions if present.
  TRIM(BOTH E'\n' FROM
    CONCAT_WS(E'\n',
      NULLIF(l.dig_q1, ''),
      NULLIF(l.dig_q2, '')
    )
  )                                                                       AS teaching_points,
  ''                                                                      AS experiential_exercise,
  l.dig_q2                                                                AS guided_reflection,
  l.dig_q1                                                                AS journaling_prompt,
  ''                                                                      AS weekly_practice_mon,
  ''                                                                      AS weekly_practice_wed,
  ''                                                                      AS weekly_practice_sun,
  ''                                                                      AS core_affirmation,
  ''                                                                      AS video_link,
  l.episode_title                                                         AS video_description,
  ''                                                                      AS video_backup_description,
  ''                                                                      AS film_script_2min,
  l.facilitator_notes                                                     AS facilitator_notes
FROM all_lessons l CROSS JOIN audiences a
ON CONFLICT (week_number, audience) DO NOTHING;
