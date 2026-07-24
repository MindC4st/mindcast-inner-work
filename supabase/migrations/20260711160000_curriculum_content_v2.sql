-- Mindcast 52-week curriculum content (updated edition).
--
-- Extends curriculum_weeks with the fields the updated lesson plan needs, then
-- upserts all 52 weeks. Idempotent: ADD COLUMN IF NOT EXISTS + ON CONFLICT
-- (week_number) DO UPDATE, so it is safe to re-run after editing the CSV.
--
-- Column mapping (CSV -> curriculum_weeks):
--   phase        -> block_number      phase_name -> block_theme
--   theme_title  -> weekly_theme      youtube_url -> youtube_url (+ adult_source/teen_source)
--   childrens_book -> kids_picture_book   colouring_page_prompt -> kids_colouring_prompt

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS core_learning           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_url             text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_title           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_runtime         text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reflective_question     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS interactive_activity    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_picture_book       text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_picture_book_note  text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_colouring_prompt   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS inner_wisdom_alignment  text DEFAULT '';

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (1, 1, 'See Clearly', 'The Signal and the Noise', 'Beneath the mental noise there is a clear inner signal — your own awareness — that was here before the first thought.',
   'https://www.youtube.com/watch?v=RcGyVTAoXEU', 'Kelly McGonigal: How to Make Stress Your Friend', '~14 min', 'https://www.youtube.com/watch?v=RcGyVTAoXEU', 'Kelly McGonigal: How to Make Stress Your Friend',
   'https://www.youtube.com/watch?v=RcGyVTAoXEU', 'Kelly McGonigal: How to Make Stress Your Friend', 'What is the loudest ''noise'' in your head right now — and what quiet signal is it drowning out?', 'Live word cloud: everyone submits one word for the noise they carried in; the wall builds in real time, then the facilitator asks what signal sits underneath.',
   'The Colour Monster by Anna Llenas', 'Naming feelings by colour — sorting signal from noise.', 'A radio with two dials — one labelled SIGNAL with a calm face, one labelled NOISE with wiggly static lines. Around it, draw things that feel like clear signals (a heart, a star) and things that feel like noise (a phone, a crowded room).',
   'Dao: ''The Dao that can be told is not the eternal Dao'' — the deepest signal is prior to every label. ACIM (reframed): you are not the image/username; you are the awareness behind it.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (2, 1, 'See Clearly', 'The Stories We Carry', 'The beliefs we repeat about ourselves are stories, not facts — and stories can be re-authored.',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', '~20 min', 'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', 'Which story about yourself do you repeat most — and who first handed it to you?', 'Anonymous live submission: each person texts in one ''old story'' sentence; the facilitator reads a few aloud and the room re-writes them into a truer line together.',
   'What Do You Do With a Problem? by Kobi Yamada', 'Facing and transforming the stories we carry.', 'A child with an open backpack of labelled stones (''I''m not good enough'', ''I can''t''). Outside the backpack the child sets down a stone labelled ''I am enough'' under a warm sun.',
   'Dao: ''Before the world named you, you already existed — that original self is whole.'' ACIM (reframed): the self you have edited and defended is not the real you.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (3, 1, 'See Clearly', 'The Pattern Interrupt', 'There is a gap between trigger and response — and in that pause lives your freedom to choose.',
   'https://www.youtube.com/watch?v=ZizdB0TgAVM', 'Lisa Feldman Barrett: You Aren''t at the Mercy of Your Emotions', '~18 min', 'https://www.youtube.com/watch?v=ZizdB0TgAVM', 'Lisa Feldman Barrett: You Aren''t at the Mercy of Your Emotions',
   'https://www.youtube.com/watch?v=ZizdB0TgAVM', 'Lisa Feldman Barrett: You Aren''t at the Mercy of Your Emotions', 'Where in your week do you react on autopilot — and what would a two-second pause change?', 'Live poll + pair-share: vote on your most automatic trigger, then turn to a neighbour and script one ''pause move'' you''ll try before Sunday.',
   'When Sophie Gets Angry — Really, Really Angry by Molly Bang', 'Big feelings and finding the pause.', 'A large glowing PAUSE button in the centre of the chest. A child counts 1-2-3 on their fingers, calm. Small thought bubbles show different choices after the pause.',
   'Dao: wu wei — the space of non-forcing where right action arises on its own. ACIM (reframed): between stimulus and story there is a choice-point that is always yours.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (4, 1, 'See Clearly', 'What Your Body Is Telling You', 'The body registers truth before the thinking mind does; sensation is information.',
   'https://www.youtube.com/watch?v=Ks-_Mh1QhMc', 'Amy Cuddy: Your Body Language May Shape Who You Are', '~21 min', 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc', 'Amy Cuddy: Your Body Language May Shape Who You Are',
   'https://www.youtube.com/watch?v=Ks-_Mh1QhMc', 'Amy Cuddy: Your Body Language May Shape Who You Are', 'Where does stress live in your body — and what has it been trying to tell you?', 'Body-map spectrum: on a projected body outline, members drop a live marker where they feel tension today; the heat-map reveals the room''s shared load.',
   'In My Heart: A Book of Feelings by Jo Witek', 'Where feelings live in the body.', 'An outline of a child''s body glowing in colours — happy in the chest (gold), nervous in the tummy (blue), excited in the hands (orange), with a small legend of which colour means which feeling.',
   'Dao: ''read the sea itself'' — trust the felt current beneath the words. ACIM (reframed): the body is a messenger, not the enemy; listen without judging.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (5, 1, 'See Clearly', 'The Mirror — How We See Ourselves', 'Self-awareness is seeing yourself clearly and kindly — both strengths and edges — without flinching.',
   'https://www.youtube.com/watch?v=haLsNaHmBhE', 'Tasha Eurich: What Self-Awareness Really Is', '~20 min', 'https://www.youtube.com/watch?v=haLsNaHmBhE', 'Tasha Eurich: What Self-Awareness Really Is',
   'https://www.youtube.com/watch?v=haLsNaHmBhE', 'Tasha Eurich: What Self-Awareness Really Is', 'If you described yourself the way a loving friend sees you, what would change?', 'Two-column live board: submit one strength and one ''still-growing'' edge; the wall fills both columns so no one feels alone in either.',
   'I Am Enough by Grace Byers', 'Seeing yourself clearly and lovingly.', 'A large mirror with two sides — strengths on the left (a star, a heart, a trophy), ''still growing'' on the right (a seedling, a puzzle piece, an open book). The frame is decorated with what matters to the child.',
   'Dao: the still pool reflects clearly only when it stops being stirred. ACIM (reframed): true seeing is looking without the filter of self-attack.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (6, 1, 'See Clearly', 'The Comparison Loop', 'Comparison measures your inside against someone else''s outside — a game with no finish line.',
   'https://www.youtube.com/watch?v=P6FORpg0KVo', 'Cal Newport: Quit Social Media', '~13 min', 'https://www.youtube.com/watch?v=P6FORpg0KVo', 'Cal Newport: Quit Social Media',
   'https://www.youtube.com/watch?v=P6FORpg0KVo', 'Cal Newport: Quit Social Media', 'Whose life do you compare yours to most — and what does that comparison cost you?', 'This-or-that live poll on comparison triggers (feeds, peers, family), then a 60-second private note to phone: ''one race I''m quitting''.',
   'Giraffes Can''t Dance by Giles Andreae', 'Being yourself instead of comparing.', 'Two puzzle pieces — one labelled ''Me'' with unique shapes and colours, one labelled ''Someone Else'' with different shapes. Caption: ''Different puzzles. Both complete.''',
   'Dao: the bamboo does not envy the oak; each follows its own nature. ACIM (reframed): comparison is the ego''s arithmetic; your worth is not on the scale.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (7, 1, 'See Clearly', 'The Inner Critic', 'The critical inner voice is a learned pattern, not the truth — and it can be met with a wiser inner coach.',
   'https://www.youtube.com/watch?v=IvtZBUSplr4', 'Kristin Neff: Self-Esteem vs Self-Compassion', '~19 min', 'https://www.youtube.com/watch?v=IvtZBUSplr4', 'Kristin Neff: Self-Esteem vs Self-Compassion',
   'https://www.youtube.com/watch?v=IvtZBUSplr4', 'Kristin Neff: Self-Esteem vs Self-Compassion', 'What does your inner critic say most — and would you ever say it to someone you love?', 'Anonymous Q&A: text in your critic''s harshest line; facilitator moderates a few onto the screen and the room offers the ''coach'' reframe live.',
   'Wemberly Worried by Kevin Henkes', 'Learning she is more than her worries.', 'A small grumpy gremlin on one shoulder whispering scribbles; a warm glowing coach on the other saying kind words in gentle loops and hearts. The child in the middle chooses the coach.',
   'Dao: harshness hardens; softness endures — ''water overcomes the hard''. ACIM (reframed): the critic is the internal dialogue of fear; you can choose the voice of your own kindness.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (8, 1, 'See Clearly', 'Beneath the Surface — Emotions as Data', 'Surface emotions (anger, grumpiness) sit on top of deeper ones (fear, loneliness, hurt) that hold the real message.',
   'https://www.youtube.com/watch?v=HJSK3HpgFdM', 'Lisa Feldman Barrett: You Aren''t at the Mercy of Your Emotions', '~18 min', 'https://www.youtube.com/watch?v=HJSK3HpgFdM', 'Lisa Feldman Barrett: You Aren''t at the Mercy of Your Emotions',
   'https://www.youtube.com/watch?v=HJSK3HpgFdM', 'Lisa Feldman Barrett: You Aren''t at the Mercy of Your Emotions', 'The last time you were ''angry'', what softer feeling was hiding underneath it?', 'Iceberg reveal: members submit a ''surface'' feeling word; the facilitator drags each below the waterline to name the deeper feeling together.',
   'Grumpy Monkey by Suzanne Lang', 'Finding the feeling underneath.', 'An iceberg — above the waterline ''ANGRY''/''GRUMPY'' (what people see); below, a huge chunk labelled ''SCARED'', ''LONELY'', ''TIRED'', ''HURT''.',
   'Dao: ''darkness within darkness, the gateway'' — depth is reached by softening, not forcing. ACIM (reframed): every upset is a fear asking to be understood, not obeyed.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (9, 1, 'See Clearly', 'The Wounds We Carry', 'Old hurts shape us, but naming them in a safe circle begins to loosen their grip.',
   'https://www.youtube.com/watch?v=95ovIJ3dsNk', 'Nadine Burke Harris: How Childhood Trauma Affects Health', '~16 min', 'https://www.youtube.com/watch?v=95ovIJ3dsNk', 'Nadine Burke Harris: How Childhood Trauma Affects Health',
   'https://www.youtube.com/watch?v=95ovIJ3dsNk', 'Nadine Burke Harris: How Childhood Trauma Affects Health', 'What early hurt still quietly runs some of your reactions today?', 'Grounding first (facilitator-led breath), then private journaling to phone only (never shared to screen): ''one thing I''ve carried''. Safety over spectacle.',
   'The Invisible String by Patrice Karst', 'Connection that remains through hard times.', 'A child holding a smooth stone in an open hand, one hard thing written small on it; caring figures stand in a circle around the child, a soft glow connecting them.',
   'Dao: the valley receives all water and is not broken by it. ACIM (reframed): the wound is not who you are; healing is remembering the wholeness underneath it.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (10, 1, 'See Clearly', 'The Masks We Wear', 'We hide behind performance to feel safe; realness is what actually lets us be met.',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', '~20 min', 'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', 'Which mask do you wear most — and who gets to see behind it?', 'Live spectrum: ''how known do you feel by the people around you?'' Members place a marker on a 1-10 line; the shape of the room sparks the discussion.',
   'Stand Tall, Molly Lou Melon by Patty Lovell', 'Being courageously yourself.', 'A two-sided mask — the bright, ''perfect'' pretend face on the front; the honest, simpler real face behind. Caption: ''The right people want to see this side.''',
   'Dao: the uncarved block (pu) — natural, unpolished, whole. ACIM (reframed): the mask is the invented self; the real self needs no performance.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (11, 1, 'See Clearly', 'Seeing Others Clearly', 'Everyone is carrying an unseen story; empathy is choosing to imagine it.',
   'https://www.youtube.com/watch?v=baHrcC8B4WM', 'Brené Brown / RSA: The Power of Empathy', '~3 min', 'https://www.youtube.com/watch?v=baHrcC8B4WM', 'Brené Brown / RSA: The Power of Empathy',
   'https://www.youtube.com/watch?v=baHrcC8B4WM', 'Brené Brown / RSA: The Power of Empathy', 'Who have you misjudged this week — and what might their unseen story be?', 'Perspective flip: facilitator shows an ambiguous image/scenario; members submit what they see, then the room re-reads it from the other person''s side.',
   'We''re All Wonders by R.J. Palacio', 'Empathy and perspective (from Wonder).', 'Two children viewing the same object from opposite sides — one sees a duck, one a rabbit. Below, both have walked around to see the other''s view, thought bubbles showing understanding.',
   'Dao: the sage sees with the eyes of all people. ACIM (reframed): what you choose to see in another, you strengthen in yourself.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (12, 1, 'See Clearly', 'The Habit Loop — How We Got Here', 'Habits run on trigger → action → reward; awareness of the loop is the first lever of change.',
   'https://www.youtube.com/watch?v=-moW9jvvMr4', 'Charles Duhigg: The Power of Habit (summary)', '~10 min', 'https://www.youtube.com/watch?v=-moW9jvvMr4', 'Charles Duhigg: The Power of Habit (summary)',
   'https://www.youtube.com/watch?v=-moW9jvvMr4', 'Charles Duhigg: The Power of Habit (summary)', 'Name one habit that runs you — what''s its trigger, and what reward keeps it alive?', 'Drag-and-drop on screen: members build their own loop (trigger/action/reward) and submit one ''swap'' for the action step.',
   'The Bad Seed by Jory John', 'A seed who always did things one way — and changes.', 'Three connected circles — TRIGGER (an alarm clock), ACTION (a child doing a habit), REWARD (a smiling star). A dotted line shows an alternative healthier action from the same trigger.',
   'Dao: the river carves the canyon drop by drop — small repeated action shapes everything. ACIM (reframed): what you practise, you become; choose the loop on purpose.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (13, 1, 'See Clearly', 'Integration — What We Now See', 'Phase 1 close: you can now notice the signal, the stories, the body, and the loops — the tools of seeing clearly.',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', '~9 min', 'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', 'Of everything you''ve noticed in Phase 1, what''s the one thing you can''t un-see now?', 'Live gratitude/insight wall: each person submits one line — ''the thing I now see'' — building a shared mural to close the phase.',
   'The Journey by Francesca Sanna', 'Carrying your story forward.', 'A backpack filled with Phase 1 tools — a pause button, a feelings iceberg, a mirror, a gremlin drawing, a habit-loop diagram. The child stands at a doorway labelled ''Phase 2: Unlearn''.',
   'Dao: ''This is water'' — awareness is the medium we forget we''re swimming in. ACIM (reframed): seeing truly is the whole work; everything else follows.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (14, 2, 'Unlearn', 'The Permission You''re Still Waiting For', 'No external authority is coming to authorise your life; the permission is yours to give.',
   'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Tim Ferriss: Define Your Fears Instead of Your Goals', '~13 min', 'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Tim Ferriss: Define Your Fears Instead of Your Goals',
   'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Tim Ferriss: Define Your Fears Instead of Your Goals', 'What are you waiting for permission to begin — and who could actually give it but you?', 'Live commitment card: members type the one thing they''re permitting themselves; a curated few appear on screen as a wall of ''green lights''.',
   'What Do You Do With an Idea? by Kobi Yamada', 'Trusting and acting on your own idea.', 'A large green GO button, surrounded by small scenes of children trying new things — writing, sport, kindness. Caption: ''Some GO buttons, only you can press.''',
   'Dao: the sage acts without waiting to be told; the Way moves through willingness. ACIM (reframed): you are the author of your own permission — no outside verdict is needed.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (15, 2, 'Unlearn', 'Letting Go of Who You Were Supposed to Be', 'The inherited script of ''should'' can be set down to make room for who you actually are.',
   'https://www.youtube.com/watch?v=NiuDFBNDoSk', 'Emily Esfahani Smith: There''s More to Life Than Being Happy', '~12 min', 'https://www.youtube.com/watch?v=NiuDFBNDoSk', 'Emily Esfahani Smith: There''s More to Life Than Being Happy',
   'https://www.youtube.com/watch?v=NiuDFBNDoSk', 'Emily Esfahani Smith: There''s More to Life Than Being Happy', 'Whose expectations have you been living inside — and what would you choose without them?', 'Two-word live poll: ''the me I was told to be'' vs ''the me I''m becoming''; members submit one word for each, contrast shown side by side.',
   'The Dot by Peter Reynolds', 'The courage to make your own mark.', 'A completely blank page. A child''s hand holds a pencil, beginning something original; images around the edge show things the child uniquely loves.',
   'Dao: return to the uncarved block — drop the shape others imposed. ACIM (reframed): the false self is a costume; you are free to take it off.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (16, 2, 'Unlearn', 'The Forgiveness Loop', 'Forgiveness is releasing the grip of resentment — for your own freedom, not the other''s excuse.',
   'https://www.youtube.com/watch?v=Ik_V3UIqoQ0', 'Fred Luskin: Stanford Forgiveness Project', '~15-20 min', 'https://www.youtube.com/watch?v=Ik_V3UIqoQ0', 'Fred Luskin: Stanford Forgiveness Project',
   'https://www.youtube.com/watch?v=Ik_V3UIqoQ0', 'Fred Luskin: Stanford Forgiveness Project', 'What resentment are you still holding — and what is it costing you to keep gripping it?', 'Private release ritual: members write (to phone only) one grievance and one line of what they''d reclaim by loosening it; nothing shared publicly.',
   'Enemy Pie by Derek Munson', 'Releasing a grievance, discovering friendship.', 'A hand tightly gripping a glowing red-hot rock (resentment); next panel, the same hand open and relaxed with the rock resting in the palm, a soft blue glow around it.',
   'Dao: the soft and yielding outlasts the rigid; a clenched fist cannot receive. ACIM (reframed): forgiveness is dropping the story that keeps you in pain — a gift to yourself.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (17, 2, 'Unlearn', 'Forgiving Yourself', 'Self-forgiveness is accountability without self-attack: repair, learn, and continue.',
   'https://www.youtube.com/watch?v=IvtZBUSplr4', 'Kristin Neff: Self-Esteem vs Self-Compassion', '~19 min', 'https://www.youtube.com/watch?v=IvtZBUSplr4', 'Kristin Neff: Self-Esteem vs Self-Compassion',
   'https://www.youtube.com/watch?v=IvtZBUSplr4', 'Kristin Neff: Self-Esteem vs Self-Compassion', 'What are you still punishing yourself for — and what would repair (not punishment) look like?', 'Four-step live build: members submit their situation privately and step through ''name it / own it / make it right / do better''; facilitator models one on screen.',
   'Sorry! by Trudy Ludwig', 'What a real apology looks and feels like.', 'A four-panel comic strip — 1. SAY WHAT HAPPENED, 2. SAY SORRY, 3. MAKE IT RIGHT, 4. LEARN AND DO BETTER. The final panel: the child smiling as a grey cloud lifts.',
   'Dao: water does not war with the rock it flows past; it simply continues. ACIM (reframed): guilt is not payment; release yourself and let the lesson stay.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (18, 2, 'Unlearn', 'Rewiring the Critic — Building the Inner Coach', 'The critic can be retrained into a coach — honest and kind at the same time.',
   'https://www.youtube.com/watch?v=pN34FNbOKXc', 'RSA: Growth Mindset vs Fixed Mindset', '~10 min', 'https://www.youtube.com/watch?v=pN34FNbOKXc', 'RSA: Growth Mindset vs Fixed Mindset',
   'https://www.youtube.com/watch?v=pN34FNbOKXc', 'RSA: Growth Mindset vs Fixed Mindset', 'What would your inner coach say to you right now that your critic never would?', 'Reframe relay: facilitator posts a harsh line; members submit the ''coach'' version; the best reframes are read aloud to the room.',
   'The Girl Who Never Made Mistakes by Mark Pett', 'Learning to be your own kind witness.', 'Split screen — a dark-scribble gremlin whispering on one shoulder; a warm glowing coach saying kind, honest words on the other; the child looks toward the coach, calm.',
   'Dao: the wise gardener shapes by tending, not by scolding. ACIM (reframed): change the internal dialogue and the whole inner weather changes.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (19, 2, 'Unlearn', 'Breaking the People-Pleasing Pattern', 'Kindness from fear drains you; kindness from choice fills you. Boundaries make real generosity possible.',
   'https://www.youtube.com/watch?v=MIte_1vcOqs', 'Nedra Glover Tawwab: Boundaries', '~10-20 min', 'https://www.youtube.com/watch?v=MIte_1vcOqs', 'Nedra Glover Tawwab: Boundaries',
   'https://www.youtube.com/watch?v=MIte_1vcOqs', 'Nedra Glover Tawwab: Boundaries', 'Where do you say ''yes'' from fear — and what would an honest ''no'' protect?', 'Energy-cup live poll: rate how full your ''yes'' cup is; then submit one boundary you''ll practise this week (curated to screen).',
   'My Body Belongs to Me by Jill Starishevsky', 'Body boundaries and personal authority.', 'A cup of energy — a genuine-choice ''yes'' keeps it full (green); a fear ''yes'' empties it (red). Two scenes: a smiling child saying ''yes!'' from the heart, a worried child saying ''okay...'' while shrinking.',
   'Dao: the full cup cannot receive; empty to be useful — but choose what you pour. ACIM (reframed): people-pleasing seeks a verdict you already hold; give from wholeness, not fear.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (20, 2, 'Unlearn', 'Unlearning Scarcity — There Is Enough', 'Some things (love, kindness, attention) grow when shared; scarcity is often a story, not a fact.',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability (or Mullainathan: The Scarcity Trap)', '~20 min', 'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability (or Mullainathan: The Scarcity Trap)',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability (or Mullainathan: The Scarcity Trap)', 'Where does ''there''s not enough'' run your choices — and is it actually true?', 'Give-away demo: everyone submits one kind line for the person beside them; the wall fills, showing the room that kindness multiplied rather than ran out.',
   'Have You Filled a Bucket Today? by Carol McCloud', 'How kindness replenishes rather than depletes.', 'A jar labelled ''LOVE'' overflowing with hearts and light (grows when shared) beside a jar of ''BISCUITS'' that shrinks when shared. Caption: ''Some things grow when you give them away.''',
   'Dao: the Way is inexhaustible; the more it gives, the more it has. ACIM (reframed): what you extend, you strengthen; love is not a limited supply.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (21, 2, 'Unlearn', 'The Relationships That Shaped You', 'We carry lessons — helpful and unhelpful — from the people who raised and marked us.',
   'https://www.youtube.com/watch?v=WjOowWxOXCg', 'Attachment Theory (explainer)', '~10-20 min', 'https://www.youtube.com/watch?v=WjOowWxOXCg', 'Attachment Theory (explainer)',
   'https://www.youtube.com/watch?v=WjOowWxOXCg', 'Attachment Theory (explainer)', 'What did your earliest relationships teach you about love — and which lesson needs updating?', 'Live ''inheritance'' board: submit one line — ''from ___ I learned ___'' — the wall reveals the room''s shared and different inheritances.',
   'Wilfred Gordon McDonald Partridge by Mem Fox', 'What we carry from relationships.', 'A gift box with items inside labelled ''From [name] I learned...''; around the outside, things the child wishes they''d learned more about.',
   'Dao: the student honours the source and then walks their own path. ACIM (reframed): keep the love that was real, and gently release the fear that was taught.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (22, 2, 'Unlearn', 'Setting Down the Armour', 'The defences that once protected us now keep connection out; safety can become a cage.',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', '~20 min', 'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', 'What armour did you put on to survive — and where is it now keeping love out?', 'Live reflection: submit the name of one piece of armour (control, sarcasm, busyness) and one person you''d like to lower it with; kept private, counted anonymously.',
   'The Rabbit Listened by Cori Doerrfeld', 'Allowing someone to be with you in difficulty.', 'A shield with a door in the middle — symbols of what the child guards against on the shield; on the door, ''I open this for people who...'' with kind words inside.',
   'Dao: the yielding survives the storm that snaps the rigid. ACIM (reframed): defence is what keeps the very connection you long for at bay.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (23, 2, 'Unlearn', 'Grief and Growth — What Endings Make Possible', 'Endings are not only loss; they clear the ground for what comes next.',
   'https://www.youtube.com/watch?v=khkJkR-ipfw', 'David Kessler: Finding Meaning — The Sixth Stage of Grief', '~15-20 min', 'https://www.youtube.com/watch?v=khkJkR-ipfw', 'David Kessler: Finding Meaning — The Sixth Stage of Grief',
   'https://www.youtube.com/watch?v=khkJkR-ipfw', 'David Kessler: Finding Meaning — The Sixth Stage of Grief', 'What ending are you still grieving — and what has it quietly made room for?', 'Seasons spectrum: members place themselves on a live autumn→winter→spring→summer line for a current loss; the room sees no one is alone in any season.',
   'The Goodbye Book by Todd Parr', 'Simple, reassuring, for all kinds of loss.', 'A tree in four seasons — autumn (leaves falling), winter (bare, quiet), spring (one green bud), summer (full leaves, warm light). Caption: ''The tree never died. It was getting ready.''',
   'Dao: the ten thousand things rise and return; emptiness precedes new form. ACIM (reframed): nothing real is lost; endings reveal what was never only the form.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (24, 2, 'Unlearn', 'Rewiring Fear — From Threat to Signal', 'Most fear is ''burnt toast'', not fire; the body''s alarm can be read as information, not command.',
   'https://www.youtube.com/watch?v=RcGyVTAoXEU', 'Kelly McGonigal: How to Make Stress Your Friend', '~14 min', 'https://www.youtube.com/watch?v=RcGyVTAoXEU', 'Kelly McGonigal: How to Make Stress Your Friend',
   'https://www.youtube.com/watch?v=RcGyVTAoXEU', 'Kelly McGonigal: How to Make Stress Your Friend', 'What fear have you been treating as a fire that''s really just burnt toast?', 'Real-fire / burnt-toast sort: members submit a current fear; facilitator sorts a few live into ''genuine danger'' vs ''discomfort dressed as danger''.',
   'Jabari Jumps by Gaia Cornwall', 'Working up the courage to try.', 'A fire alarm with two labels — ''REAL FIRE'' (danger) and ''BURNT TOAST'' (scary but safe). A child breathes and says: ''This is just burnt toast. I can handle this.''',
   'Dao: meet the current without gripping; fear softens when it is not fought. ACIM (reframed): fear is a call for reassurance from your own inner voice, not a fact.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (25, 2, 'Unlearn', 'The Stories That No Longer Serve', 'An old narrative can be honoured for protecting you — and then rewritten.',
   'https://www.youtube.com/watch?v=D9Ihs241zeg', 'Brené Brown / Dan McAdams: Narrative Identity', '~20 min', 'https://www.youtube.com/watch?v=D9Ihs241zeg', 'Brené Brown / Dan McAdams: Narrative Identity',
   'https://www.youtube.com/watch?v=D9Ihs241zeg', 'Brené Brown / Dan McAdams: Narrative Identity', 'What outdated story about your life are you ready to stop telling?', 'Live rewrite: members submit an old ''I am the kind of person who...'' line; the room helps rewrite three of them into truer versions on screen.',
   'Beautiful Oops by Barney Saltzberg', 'Reinterpreting ''mistakes'' as beginnings.', 'An old faded photo beside a new, brighter one; the child holds a pen, adding new pages, each showing something they''ve grown into.',
   'Dao: the map is not the territory; drop the smaller story to see the larger one. ACIM (reframed): you are the author, not the character; the pen is in your hand.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (26, 2, 'Unlearn', 'Integration — What We Have Released', 'Phase 2 close: you have set down permission-seeking, resentment, armour, and stale stories.',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', '~9 min', 'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', 'What have you finally put down — and how does your body feel lighter for it?', 'Release wall: each person submits one word for what they''ve let go; the words rise up the screen like the feathers in the colouring page.',
   'Oh, the Places You''ll Go! by Dr Seuss', 'The bridge between phases.', 'A pile of heavy stones on the ground (things released) and feathers floating upward (things now lighter); the child stands between them, facing a doorway labelled ''Phase 3: Rebuild''.',
   'Dao: emptiness is what makes the cup useful; you have made room. ACIM (reframed): laying down the false leaves only the real — and the real was never heavy.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (27, 3, 'Rebuild', 'Who Are You Now? — Rebuilding Identity', 'Identity can be built on chosen qualities and values rather than inherited labels.',
   'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Tim Ferriss / Dan McAdams: Narrative Identity', '~13 min', 'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Tim Ferriss / Dan McAdams: Narrative Identity',
   'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Tim Ferriss / Dan McAdams: Narrative Identity', 'If you built yourself from chosen qualities, which three are the foundation?', 'Live ''brick wall'': members submit qualities they choose to build with; the wall assembles on screen and each person stars their three foundation bricks.',
   'I Am Human by Susan Verde', 'Choosing our qualities and values.', 'A brick wall of 8-10 bricks, each with a quality (kindness, courage, creativity, honesty, curiosity, perseverance...); three circled as the foundation; the child stands proudly beside it.',
   'Dao: know the constant within, and you act from a settled centre. ACIM (reframed): you are not built from labels; you choose what you extend and become.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (28, 3, 'Rebuild', 'What Do You Actually Value?', 'Values are the compass beneath goals; naming them makes decisions clearer.',
   'https://www.youtube.com/watch?v=jHeeHg_MXNE', 'Russ Harris: ACT Values', '~15 min', 'https://www.youtube.com/watch?v=jHeeHg_MXNE', 'Russ Harris: ACT Values',
   'https://www.youtube.com/watch?v=jHeeHg_MXNE', 'Russ Harris: ACT Values', 'When your choices and your values disagree, which usually wins — and why?', 'Values compass live sort: from a shortlist, members rank their top value; the room''s aggregate compass appears, then each notes their own true north.',
   'Those Shoes by Maribeth Boelts', 'True value vs wanting what others have.', 'A compass with N/S/E/W — a value written in each direction; the needle points to the most important one, which glows warmly.',
   'Dao: follow your inner nature (ziran) and the path becomes effortless. ACIM (reframed): values are the inner voice choosing direction — not rules imposed from outside.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (29, 3, 'Rebuild', 'The Habits That Build You', 'Identity change is built by small daily practice, not a single dramatic leap.',
   'https://www.youtube.com/watch?v=W1eYrhGeffc', 'James Clear: Atomic Habits (summary)', '~10-15 min', 'https://www.youtube.com/watch?v=W1eYrhGeffc', 'James Clear: Atomic Habits (summary)',
   'https://www.youtube.com/watch?v=W1eYrhGeffc', 'James Clear: Atomic Habits (summary)', 'What is one tiny daily practice that, repeated for a year, would rebuild you?', 'Live ''one small vote'': each person types the 1% habit they''ll cast a vote for daily; the wall becomes a garden of commitments to revisit.',
   'Rosie Revere, Engineer by Andrea Beaty', 'The habit of trying and persisting.', 'Three plant pots — a tiny sprout (Day 1), a growing plant (Day 30), a flourishing flowering plant (Day 90); a child waters them from a can labelled ''Daily Practice''.',
   'Dao: the great is achieved through the small; the journey of a thousand miles begins beneath one''s feet. ACIM (reframed): each small choice is a vote for the self you are becoming.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (30, 3, 'Rebuild', 'Your Body as Foundation', 'Sleep, movement, food, and calm are the base the whole self is built on.',
   'https://www.youtube.com/watch?v=5MuIMqhT8oY', 'Matthew Walker: Sleep Is Your Superpower', '~19 min', 'https://www.youtube.com/watch?v=5MuIMqhT8oY', 'Matthew Walker: Sleep Is Your Superpower',
   'https://www.youtube.com/watch?v=5MuIMqhT8oY', 'Matthew Walker: Sleep Is Your Superpower', 'Which of your four ''charging stations'' (sleep, movement, food, calm) is most depleted?', 'Four-station live check-in: members rate each of sleep/movement/food/calm 1-5; the room''s battery levels display, then each picks one to charge this week.',
   'I Am Yoga by Susan Verde', 'Mindful body awareness.', 'A superhero suit with four charging stations — SLEEP (a bed), MOVEMENT (running shoes), FOOD (an apple), CALM (a peaceful breath) — all glowing green, the suit fully charged.',
   'Dao: honour the body as the vessel of the Way; force nothing, restore rhythmically. ACIM (reframed): care for the vessel so the inner life has a steady home.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (31, 3, 'Rebuild', 'The People You Choose', 'Relationships are the strongest predictor of a good life; choose the garden you grow in.',
   'https://www.youtube.com/watch?v=q4g_cxMWnMk', 'Robert Waldinger: What Makes a Good Life?', '~13 min', 'https://www.youtube.com/watch?v=q4g_cxMWnMk', 'Robert Waldinger: What Makes a Good Life?',
   'https://www.youtube.com/watch?v=q4g_cxMWnMk', 'Robert Waldinger: What Makes a Good Life?', 'Who are the few relationships worth deepening this year — and who are you a good garden for?', 'Live relationship inventory (private): members note who fills vs drains them, then submit one person they''ll invest in; count shown anonymously.',
   'Charlotte''s Web by E.B. White', 'Friendship that helps us grow.', 'A garden of plants side by side, each labelled with a friend''s name, healthy and leaning to support one another; the child is one plant with roots connected to the others.',
   'Dao: the sage keeps company with the natural and the true. ACIM (reframed): the relationships you tend teach you who you are; choose ones that call out your real self.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (32, 3, 'Rebuild', 'How You Speak to Yourself', 'Distanced, kind self-talk (''you'' not ''I'') steadies you under pressure.',
   'https://www.youtube.com/watch?v=NiuDFBNDoSk', 'Ethan Kross: Chatter / Self-Talk', '~15 min', 'https://www.youtube.com/watch?v=NiuDFBNDoSk', 'Ethan Kross: Chatter / Self-Talk',
   'https://www.youtube.com/watch?v=NiuDFBNDoSk', 'Ethan Kross: Chatter / Self-Talk', 'What phrase could you keep in your pocket for the next hard moment?', 'Live phrase-bank: members submit one ''brave'', ''kind'', or ''strong'' phrase; the best are compiled into a shared wall the room can borrow from.',
   'I Am Enough by Grace Byers', 'Affirmations in picture-book form.', 'Three cards — ''BRAVE PHRASE'' (I can be scared AND brave), ''KIND PHRASE'' (a mistake doesn''t make me bad), ''STRONG PHRASE'' (I am doing my best); the child holds them, confident.',
   'Dao: soft words, steady centre — the gentle governs the abrupt. ACIM (reframed): the internal dialogue you repeat is the atmosphere you live in; speak to yourself as an ally.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (33, 3, 'Rebuild', 'Creating Structure That Serves You', 'Rhythm and routine are not cages; they are the trellis a life grows on.',
   'https://www.youtube.com/watch?v=gTaJhjQHcf8', 'Cal Newport: Deep Work / Time Blocking', '~15 min', 'https://www.youtube.com/watch?v=gTaJhjQHcf8', 'Cal Newport: Deep Work / Time Blocking',
   'https://www.youtube.com/watch?v=gTaJhjQHcf8', 'Cal Newport: Deep Work / Time Blocking', 'Where would a little more structure actually give you more freedom?', 'Live day-design: members drag blocks (wake, move, connect, create, rest) onto a shared timeline; the room compares rhythms and each keeps one change.',
   'Bedtime for Frances by Russell Hoban', 'The importance of routine.', 'A simple clock/timeline of a daily rhythm — wake, breakfast, activity, movement, connection, quiet/creative, bedtime — colour-coded, the child calm and settled.',
   'Dao: the wheel''s usefulness is in the ordered spokes and the empty hub. ACIM (reframed): structure frees the mind from deciding, so it can be present.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (34, 3, 'Rebuild', 'Rest as a Practice, Not a Reward', 'Rest is a discipline that restores, not a prize earned after burnout.',
   'https://www.youtube.com/watch?v=9y1xyXtYAsg', 'Alex Soojung-Kim Pang: Rest / Deliberate Rest', '~15-20 min', 'https://www.youtube.com/watch?v=9y1xyXtYAsg', 'Alex Soojung-Kim Pang: Rest / Deliberate Rest',
   'https://www.youtube.com/watch?v=9y1xyXtYAsg', 'Alex Soojung-Kim Pang: Rest / Deliberate Rest', 'Do you rest only once you''ve collapsed — and what would scheduled rest change?', 'Overstimulation meter: members submit their current ''mental tabs open'' number; the room''s average appears, then each schedules one real rest block.',
   'The Rabbit Listened by Cori Doerrfeld', 'Quiet presence that genuinely restores.', 'A brain cartoon in three panels — hot and busy (overstimulated), the child watching clouds (cooling), then a refreshed, clear brain.',
   'Dao: wu wei — in stillness the water clears itself; do less, arrive more. ACIM (reframed): rest is trusting that you don''t have to force the day into shape.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (35, 3, 'Rebuild', 'Creativity and Expression', 'Making things — for their own sake — is a birthright, not a talent reserved for a few.',
   'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Elizabeth Gilbert: Your Elusive Creative Genius', '~19 min', 'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Elizabeth Gilbert: Your Elusive Creative Genius',
   'https://www.youtube.com/watch?v=iG9CE55wbtY', 'Elizabeth Gilbert: Your Elusive Creative Genius', 'What would you make if no one graded it and no one saw?', 'Live make-and-share: 90-second sketch/word/idea from everyone, submitted to a joyful, un-judged wall of creations.',
   'The Dot by Peter Reynolds', 'Making something because it matters to you.', 'A workshop of children making things — drawing, building, folding — all different, all absorbed; speech bubbles: ''I made this!'' No grades, just making.',
   'Dao: creation flows when you stop forcing and let it move through you. ACIM (reframed): expression is the self extending outward; joy, not judgement, is the measure.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (36, 3, 'Rebuild', 'Purpose — What You''re Here For', 'Purpose is where your gifts meet a need; it is discovered by doing, not just thinking.',
   'https://www.youtube.com/watch?v=fLJsdqxnZb0', 'Scott Dinsmore: How to Find Work You Love', '~18 min', 'https://www.youtube.com/watch?v=fLJsdqxnZb0', 'Scott Dinsmore: How to Find Work You Love',
   'https://www.youtube.com/watch?v=fLJsdqxnZb0', 'Scott Dinsmore: How to Find Work You Love', 'Where do your strengths and the world''s needs overlap — even in a small way?', 'Missing-piece live board: members submit one gift they carry; the room assembles a giant ''puzzle'' showing how different pieces complete a bigger picture.',
   'The Jelly That Wouldn''t Wiggle by Angela Dalton', 'Each person''s unique contribution.', 'A giant puzzle with one piece missing; the child holds their unique piece with special qualities written on it; placed, the picture completes.',
   'Dao: each thing fulfils its own nature and the whole is served. ACIM (reframed): your purpose is to extend your true self; the world is completed by your particular light.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (37, 3, 'Rebuild', 'Money, Abundance and Your Relationship With Resources', 'Our money ''scripts'' are inherited beliefs; needs, wants, and generosity can be sorted consciously.',
   'https://www.youtube.com/watch?v=8gxNHkQBkF8', 'Brad Klontz: Money Scripts', '~15-20 min', 'https://www.youtube.com/watch?v=8gxNHkQBkF8', 'Brad Klontz: Money Scripts',
   'https://www.youtube.com/watch?v=8gxNHkQBkF8', 'Brad Klontz: Money Scripts', 'What did you absorb about money as a child — and does it still serve you?', 'Need/want/could-share live sort: members drop items into three columns; the aggregate reveals the room''s mix and sparks the generosity conversation.',
   'Those Shoes by Maribeth Boelts', 'Needs vs wants, and the joy of generosity.', 'Three sorting columns — NEED (food, shelter, warmth), WANT (toys, treats), COULD SHARE (time, kindness, skills); a child places items, thoughtful.',
   'Dao: knowing when you have enough is true wealth. ACIM (reframed): security is not a number; it is trust in your own inner sufficiency.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (38, 3, 'Rebuild', 'The Community You Build', 'We are made for contribution; a healthy community is a hive where each brings something.',
   'https://www.youtube.com/watch?v=q4g_cxMWnMk', 'Robert Waldinger: What Makes a Good Life?', '~13 min', 'https://www.youtube.com/watch?v=q4g_cxMWnMk', 'Robert Waldinger: What Makes a Good Life?',
   'https://www.youtube.com/watch?v=q4g_cxMWnMk', 'Robert Waldinger: What Makes a Good Life?', 'What would you bring to a community you actually wanted to belong to?', 'Live contribution pledge: members submit one thing they''ll offer the room this term; the hive fills with pledged gifts.',
   'Last Stop on Market Street by Matt de la Peña', 'Noticing and contributing to community.', 'A beehive with every bee busy and contributing; one bee is the child, carrying a small glowing gift to share with the hive.',
   'Dao: the valley gives to all and competes with none. ACIM (reframed): belonging is built by extending yourself, not by earning a place.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (39, 3, 'Rebuild', 'Integration — Who You Are Becoming', 'Phase 3 close: identity, values, habits, body, and community are rebuilt — now you live them.',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', '~9 min', 'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', 'Who have you become over these weeks that you weren''t at the start?', 'Before/after live wall: members submit one word for ''who I was'' and ''who I''m becoming''; the room''s transformation is shown as a shared arc.',
   'Oh, the Places You''ll Go! by Dr Seuss', 'From building to living.', 'The Week-27 building site now finished — a real building with a door at the top labelled ''Phase 4: Live It''; the child stands ready at the door.',
   'Dao: the constant Way expresses itself through steady character. ACIM (reframed): becoming is remembering; you are growing back into what was always true.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (40, 4, 'Live It', 'From Self-Development to Service', 'The point of inner work is not self-improvement forever; it is to give what you''ve grown.',
   'https://www.youtube.com/watch?v=lmyZMtPVodo', 'Viktor Frankl on Meaning / service & wellbeing (verify)', '~15 min', 'https://www.youtube.com/watch?v=lmyZMtPVodo', 'Viktor Frankl on Meaning / service & wellbeing (verify)',
   'https://www.youtube.com/watch?v=lmyZMtPVodo', 'Viktor Frankl on Meaning / service & wellbeing (verify)', 'What have you healed enough to now offer someone else?', 'Treasure-map live board: members submit their three most useful learnings and one person who could benefit; the room becomes a map of gifts to share.',
   'Each Kindness by Jacqueline Woodson', 'Kindness and what it does when shared.', 'A treasure map with three marked treasures (the child''s key learnings); a path from each to someone who could benefit; the child sharing a treasure with a friend.',
   'Dao: the sage accumulates nothing and so has plenty to give. ACIM (reframed): what you have received is complete only when extended to another.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (41, 4, 'Live It', 'Teaching What You''ve Learned', 'You learn something twice when you teach it; sharing wisdom simply deepens it in you.',
   'https://www.youtube.com/watch?v=FLbqzbAaEiI', 'The Feynman Technique / Protégé Effect (verify)', '~10 min', 'https://www.youtube.com/watch?v=FLbqzbAaEiI', 'The Feynman Technique / Protégé Effect (verify)',
   'https://www.youtube.com/watch?v=FLbqzbAaEiI', 'The Feynman Technique / Protégé Effect (verify)', 'What could you teach in one sentence that took you a lifetime to learn?', 'Live ''teach it simply'': members submit a one-line lesson as if to a 10-year-old; the clearest are read aloud as gifts to the room.',
   'Zen Shorts by Jon J. Muth', 'Passing wisdom simply and gently.', 'A child standing confidently, explaining to a group — speech bubble ''This is what I learned...''; the group listens, a glowing light bulb above the teacher-child.',
   'Dao: the sage teaches without words, mostly by how they live. ACIM (reframed): to teach is to strengthen what you want to keep; you give and receive at once.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (42, 4, 'Live It', 'The Courage to Be Seen', 'Being truly seen is the reward on the far side of the fear of judgement.',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', '~20 min', 'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability',
   'https://www.youtube.com/watch?v=iCvmsMzlF7o', 'Brené Brown: The Power of Vulnerability', 'Where are you still hiding the real you — and what would being seen there make possible?', 'Live courage spectrum: ''how seen do you let yourself be?'' 1-10; members place a marker, then submit one place they''ll show up more honestly.',
   'Perfectly Norman by Tom Percival', 'Revealing who you really are despite fear.', 'The Week-10 mask turned around so the real side shows; friends smile and reach toward the child. Caption: ''The real me is wonderful.''',
   'Dao: the uncarved block needs no polish to be whole. ACIM (reframed): what you hide, you fear; what you reveal to safe others, you heal.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (43, 4, 'Live It', 'Living Your Values Under Pressure', 'Values are only real when they hold in the storm, not just the calm.',
   'https://www.youtube.com/watch?v=jHeeHg_MXNE', 'Russ Harris: ACT Values (moral courage under pressure)', '~15 min', 'https://www.youtube.com/watch?v=jHeeHg_MXNE', 'Russ Harris: ACT Values (moral courage under pressure)',
   'https://www.youtube.com/watch?v=jHeeHg_MXNE', 'Russ Harris: ACT Values (moral courage under pressure)', 'When was the last time keeping your values cost you something — and was it worth it?', 'Dilemma live poll: facilitator poses a values dilemma; members vote, then a few explain their reasoning to the room — no right answer, just clarity.',
   'Wonder by R.J. Palacio', 'Moral courage in a child-accessible format.', 'A compass in a storm (rain, wind, dark clouds) with the needle still pointing steadily to the child''s values written on its face; the child holds it firmly.',
   'Dao: the deep-rooted tree bends in the gale and does not break. ACIM (reframed): under pressure, return to your inner compass rather than the crowd''s fear.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (44, 4, 'Live It', 'Conflict as a Growth Practice', 'Conflict handled with honesty and needs (''I feel… I need…'') becomes connection, not rupture.',
   'https://www.youtube.com/watch?v=l7ToNudVd2I', 'Marshall Rosenberg: Nonviolent Communication', '~15-20 min', 'https://www.youtube.com/watch?v=l7ToNudVd2I', 'Marshall Rosenberg: Nonviolent Communication',
   'https://www.youtube.com/watch?v=l7ToNudVd2I', 'Marshall Rosenberg: Nonviolent Communication', 'In your hardest current conflict, what do you actually feel — and what do you actually need?', 'Live ''I feel / I need'' builder: members privately draft one honest sentence for a real conflict; facilitator models the structure with a volunteer scenario.',
   'Enemy Pie by Derek Munson', 'Conflict, assumptions, and unexpected friendship.', 'Two children pulling a knotted rope; one stops and says ''I feel... and I need...''; the other listens; the knot loosens; the final panel shows them solving it together.',
   'Dao: yield and overcome; the soft approach unties what force only tightens. ACIM (reframed): conflict is two calls for the same thing — understanding; answer that, not the attack.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (45, 4, 'Live It', 'Generosity as a Way of Being', 'Giving that isn''t depleting — time, encouragement, help — grows the giver too.',
   'https://www.youtube.com/watch?v=M7SBFnFvPeY', 'Adam Grant: Are You a Giver or a Taker?', '~13 min', 'https://www.youtube.com/watch?v=M7SBFnFvPeY', 'Adam Grant: Are You a Giver or a Taker?',
   'https://www.youtube.com/watch?v=M7SBFnFvPeY', 'Adam Grant: Are You a Giver or a Taker?', 'What could you give freely this week that would cost little and mean much?', 'Live giving-wall: everyone submits one non-money gift they''ll offer someone by Sunday; the wall of gifts is the room''s collective generosity.',
   'Have You Filled a Bucket Today? by Carol McCloud', 'Bucket-filling as everyday generosity.', 'A child''s hands holding something invisible but glowing (kindness/encouragement/help), offered to someone else — and it still glows in the child''s hands; it grew.',
   'Dao: the more the sage gives, the more they have. ACIM (reframed): to give is to keep; what you extend, you experience as your own.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (46, 4, 'Live It', 'Enough — Living From Sufficiency', 'Sufficiency is noticing what is already good instead of chasing the next thing.',
   'https://www.youtube.com/watch?v=oHGKTZSe_k4', 'Lynne Twist: The Soul of Money / Sufficiency (verify)', '~15-20 min', 'https://www.youtube.com/watch?v=oHGKTZSe_k4', 'Lynne Twist: The Soul of Money / Sufficiency (verify)',
   'https://www.youtube.com/watch?v=oHGKTZSe_k4', 'Lynne Twist: The Soul of Money / Sufficiency (verify)', 'If nothing were added to your life, what is already genuinely enough?', 'Gratitude garden live board: members submit one specific thing they already have that is good; the wall blooms into a shared garden of sufficiency.',
   'The Grateful Ninja by Mary Nhin', 'Accessible gratitude practice for children.', 'A garden full of flowers, each labelled with something the child already has that is good (relationships, abilities, experiences, qualities); the child sits noticing, smiling.',
   'Dao: ''one who knows they have enough is rich.'' ACIM (reframed): peace is not the next acquisition; it is recognising the fullness already present.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (47, 4, 'Live It', 'The Long Game — Patience and Persistence', 'Growth is often invisible before it is visible; roots form long before the shoot appears.',
   'https://www.youtube.com/watch?v=TQMbvJNRpLE', 'Angela Duckworth: Grit', '~6 min', 'https://www.youtube.com/watch?v=TQMbvJNRpLE', 'Angela Duckworth: Grit',
   'https://www.youtube.com/watch?v=TQMbvJNRpLE', 'Angela Duckworth: Grit', 'What are you tempted to quit that is probably just ''still growing underground''?', 'Live ''underground roots'' check-in: members submit one long, unglamorous effort they''ll recommit to; facilitator reflects the room''s shared perseverance.',
   'The Little Engine That Could by Watty Piper', 'The classic perseverance story.', 'A tiny seed underground (nothing visible above); roots spreading and a shoot forming below; then a green shoot breaks the soil. Caption: ''It was growing the whole time.''',
   'Dao: the great is accomplished by the small, done steadily, without hurry. ACIM (reframed): trust the process of your own becoming; it is working even unseen.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (48, 4, 'Live It', 'Leaving People Better Than You Found Them', 'Small, high-quality moments of connection ripple outward far beyond what we see.',
   'https://www.youtube.com/watch?v=cDDWvj_q-o8', 'Cleveland Clinic: Empathy — The Human Connection', '~4 min', 'https://www.youtube.com/watch?v=cDDWvj_q-o8', 'Cleveland Clinic: Empathy — The Human Connection',
   'https://www.youtube.com/watch?v=cDDWvj_q-o8', 'Cleveland Clinic: Empathy — The Human Connection', 'Who did you make slightly brighter or dimmer today — and how, exactly?', 'Ripple live board: members submit one tiny act that could brighten someone tomorrow; the wall becomes a field of rays going outward.',
   'Ordinary Mary''s Extraordinary Deed by Emily Pearson', 'One kindness that ripples outward.', 'A sun with rays reaching different people, each becoming a little brighter; the child at the centre, smiling. Caption: ''I am a sunshine person.''',
   'Dao: water benefits all things and asks nothing in return. ACIM (reframed): every encounter is a chance to add light; you leave your state of mind behind you.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (49, 4, 'Live It', 'Your Legacy — What You''re Building Beyond Yourself', 'Legacy is the ripple of who you were, felt in circles far beyond your own life.',
   'https://www.youtube.com/watch?v=qp0HIF3SfI4', 'Generativity (Erikson) / Covey: Begin With the End in Mind (verify)', '~15 min', 'https://www.youtube.com/watch?v=qp0HIF3SfI4', 'Generativity (Erikson) / Covey: Begin With the End in Mind (verify)',
   'https://www.youtube.com/watch?v=qp0HIF3SfI4', 'Generativity (Erikson) / Covey: Begin With the End in Mind (verify)', 'In fifty years, what do you hope still ripples out from how you lived?', 'Concentric-ripples live board: members submit one mark they want to leave in each circle — close people, community, wider world.',
   'The Giving Tree by Shel Silverstein', 'What we leave behind through how we give.', 'A pond with concentric ripples — the child at centre; first ripple: immediate people; second: community; outer: the world — each showing one positive mark.',
   'Dao: the sage acts and leaves no trace of grasping, yet the good remains. ACIM (reframed): what you extend outlives the form; love is the only legacy that is real.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (50, 4, 'Live It', 'Gratitude as a Practice, Not a Feeling', 'Gratitude is a trainable practice of specific noticing — the more you look, the more you find.',
   'https://www.youtube.com/watch?v=WPPPFqsECz0', 'Robert Emmons: The Science of Gratitude', '~15 min', 'https://www.youtube.com/watch?v=WPPPFqsECz0', 'Robert Emmons: The Science of Gratitude',
   'https://www.youtube.com/watch?v=WPPPFqsECz0', 'Robert Emmons: The Science of Gratitude', 'What three specific (not generic) things were genuinely good today?', 'Live specificity challenge: members submit three specific gratitudes (not ''family'' but the exact moment); the detailed wall models the practice.',
   'Grateful by Debbie Wagenbach', 'Noticing what is already present and good.', 'A camera taking ''photos'' of three specific things the child is grateful for — each detailed and specific; the lens glows warmly. Caption: ''The more I practise, the more I find.''',
   'Dao: contentment is found by receiving what is, fully. ACIM (reframed): gratitude is choosing to see the good that fear overlooks.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (51, 4, 'Live It', 'The Ongoing Practice — There Is No Arrival', 'Growth has no finish line; the practice itself is the destination.',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', '~9 min', 'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', 'If there''s no arrival, what practice do you want to keep for life?', 'Live ''next chapter'' line: members submit the first sentence of their next chapter; the wall shows a room full of stories still being written.',
   'Oh, the Places You''ll Go! by Dr Seuss', 'Into the ongoing adventure.', 'A story''s last page turning to reveal more blank pages ahead; the child writes the first line of the next chapter. Caption: ''The story isn''t finished. It''s just getting started.''',
   'Dao: the Way has no end; you walk it by walking. ACIM (reframed): the practice is the point; you are always beginning again, and that is well.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

INSERT INTO public.curriculum_weeks
  (week_number, block_number, block_theme, weekly_theme, core_learning,
   youtube_url, youtube_title, youtube_runtime, adult_source, adult_video_title,
   teen_source, teen_video_title, reflective_question, interactive_activity,
   kids_picture_book, kids_picture_book_note, kids_colouring_prompt,
   inner_wisdom_alignment)
VALUES (52, 4, 'Live It', 'Integration — A Year of Becoming', 'One year on, you are not finished — you are beginning, with tools, a compass, and a self you''ve met.',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', '~9 min', 'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water',
   'https://www.youtube.com/watch?v=sPOuCd6cBao', 'David Foster Wallace: This Is Water', 'Looking back at Week 1''s you — what would you tell them that you now know?', 'Full-circle live wall: members submit one word for Week-1 self and one for now; the year''s arc is shown, and the room sets its first intention for next year.',
   'Oh, the Places You''ll Go! by Dr Seuss', 'A year-end celebration of the ongoing journey.', 'Week 1 — a child at a threshold with an empty backpack; Week 52 — same child, backpack full, compass in hand, tools ready. Taller. More themselves. Caption: ''Not finished. Beginning.''',
   'Dao: return to the source and begin again, renewed. ACIM (reframed): the end of the year is not a finish but a remembering of who you have always been.')
ON CONFLICT (week_number) DO UPDATE SET
   block_number = EXCLUDED.block_number, block_theme = EXCLUDED.block_theme,
   weekly_theme = EXCLUDED.weekly_theme, core_learning = EXCLUDED.core_learning,
   youtube_url = EXCLUDED.youtube_url, youtube_title = EXCLUDED.youtube_title,
   youtube_runtime = EXCLUDED.youtube_runtime, adult_source = EXCLUDED.adult_source,
   adult_video_title = EXCLUDED.adult_video_title, teen_source = EXCLUDED.teen_source,
   teen_video_title = EXCLUDED.teen_video_title,
   reflective_question = EXCLUDED.reflective_question,
   interactive_activity = EXCLUDED.interactive_activity,
   kids_picture_book = EXCLUDED.kids_picture_book,
   kids_picture_book_note = EXCLUDED.kids_picture_book_note,
   kids_colouring_prompt = EXCLUDED.kids_colouring_prompt,
   inner_wisdom_alignment = EXCLUDED.inner_wisdom_alignment,
   updated_at = now();

