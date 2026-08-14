-- Week 1: swap all three tracks' videos to the new Week 1 videos and rewrite
-- the reflective questions + activities around each transcript, keeping the
-- 'See Clearly' / 'The Signal and the Noise' theme.
--   Adult: Cal Newport — Slow Productivity (accomplishment without burnout)
--   Teen:  7 Hard Truths for Teens
--   Child: Listening to My Body (Gabi Garcia) + a group game for ~40 kids
--
-- Also adds two child-track columns to curriculum_weeks: kids_source (video)
-- and kids_game (the group game).

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS kids_source text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_game   text DEFAULT '';

-- ---------------------------------------------------------------------------
-- mindcast_live_sessions — per-audience video + reflective/activity columns.
-- ---------------------------------------------------------------------------

-- Adult — Cal Newport, Slow Productivity
UPDATE public.mindcast_live_sessions
SET
  video_link               = $wk1$https://www.youtube.com/watch?v=0HMjTxKRbaI$wk1$,
  video_description        = $wk1$Cal Newport (Big Think): 'Slow Productivity — The Lost Art of Accomplishment Without Burnout'. Pseudo-productivity vs. outcomes: do fewer things at once, work at a natural pace, obsess over quality. Runtime ~10 min.$wk1$,
  video_backup_description = $wk1$Search: 'Cal Newport slow productivity Big Think' if link unavailable.$wk1$,
  experiential_exercise    = $wk1$THE OUTCOME AUDIT: List everything currently on your plate — meetings, tasks, projects, 'shoulds'. For each one, ask: is this real, valuable work — or visible activity? Then circle the one to three things that, if done excellently, would make the rest matter less. Finally: what's one commitment you could put down this week to give the important few your full attention? Share your 'fewer things' shortlist.$wk1$,
  guided_reflection        = $wk1$Sit quietly. Bring to mind a typical busy day — the meetings, the email, the Slack pings, the feeling of being 'on' without ever finishing anything that matters. Notice how that hum feels in your body. That's pseudo-productivity — noise. Now ask: what would I actually be proud to have produced this week? Not how busy I looked. What I completed. Feel the difference between the two. That shift — from activity to outcome — is what this year is learning to see.$wk1$,
  journaling_prompt        = $wk1$Where in your week are you performing busyness instead of producing something that matters — and what's the one thing you'd need to do fewer of (or obsess more over) to change that?$wk1$,
  weekly_practice_mon      = $wk1$Catch one moment of 'visible activity' today — a meeting, an email, a task that's motion without meaning. Name it: 'This is noise, not the work.'$wk1$,
  weekly_practice_wed      = $wk1$Do fewer things. Pick one important task and give it a single, uninterrupted 90-minute block — no email, no Slack, no switching. Notice the quality of your attention.$wk1$,
  weekly_practice_sun      = $wk1$Work at a natural pace. Intentionally take one thing off your plate — a commitment, a meeting, a 'should' — and let yourself have a genuinely slower day. Notice what it feels like not to redline.$wk1$,
  core_affirmation         = $wk1$I measure my day by what I finish, not how busy I looked. I do fewer things, at a natural pace, and obsess over quality.$wk1$,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Adult';

-- Teen — 7 Hard Truths for Teens
UPDATE public.mindcast_live_sessions
SET
  video_link               = $wk1$https://www.youtube.com/watch?v=Thlbqg2sKEM$wk1$,
  video_description        = $wk1$7 Hard Truths for Teens — a no-sugarcoating talk on ownership, time, habits, friendship, and the regret of wasted time. Runtime ~10 min.$wk1$,
  video_backup_description = $wk1$Search: '7 hard truths for teens' if link unavailable.$wk1$,
  experiential_exercise    = $wk1$SEVEN TRUTHS, ONE SIGNAL: The video names seven hard truths. Write down as many as you remember. Next to each, mark SIGNAL (something calling you to see clearly and act) or NOISE (something you've been tuning out, dodging, or hoping isn't real). Now circle the one that stung the most. Underneath it write: 'What is this truth trying to get me to see — and what one small choice would I make today if I took it seriously?' Share the number you circled — not the full answer, unless you want to.$wk1$,
  guided_reflection        = $wk1$Close your eyes. Hear the first truth again: nobody is coming to save you. Notice what that does in your body — does it feel heavy, or does it feel like power? Now scan the week behind you. Where were you waiting? Waiting for motivation, waiting for someone to push you, waiting for 'later'. That waiting is the noise. The signal underneath it is simple: you're the main character, and the story moves when you move. What's one thing you'd do differently this week if you really believed that?$wk1$,
  journaling_prompt        = $wk1$Which of the seven truths hit you hardest — and what is it asking you to see about your life that you've been avoiding?$wk1$,
  weekly_practice_mon      = $wk1$Catch a waiting moment. One time today you catch yourself waiting for something to happen TO you instead of making it happen. Name it out loud.$wk1$,
  weekly_practice_wed      = $wk1$Run a phone audit. Check your screen time, multiply it by 365, and look at the number. Then set one boundary for today — one app deleted, or notifications off except for real people.$wk1$,
  weekly_practice_sun      = $wk1$Take one small risk this week — something you'd regret NOT doing. Try it, fail, look silly. Then write down the story. That's the signal you lived.$wk1$,
  core_affirmation         = $wk1$I stop waiting for rescue. I am the main character, and today counts.$wk1$,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Teen';

-- Child — Listening to My Body (Gabi Garcia)
UPDATE public.mindcast_live_sessions
SET
  video_link               = $wk1$https://www.youtube.com/watch?v=UOsxlVpQT14$wk1$,
  video_description        = $wk1$Listening to My Body by Gabi Garcia (read-aloud) — sensations and feelings, and how to listen to what your body needs. Runtime ~10 min.$wk1$,
  video_backup_description = $wk1$Search: 'Listening to my body Gabi Garcia read aloud' if link unavailable.$wk1$,
  experiential_exercise    = $wk1$BODY DETECTIVE: Rub your hands together fast for 30 seconds. What do you notice — heat? Tingles? Sweat? That's a sensation. Now put your hand on your heart and jump 15 times. What changed? Your body talks through sensations and feelings. Now draw, or tell a partner, one thing your body is telling you right now.$wk1$,
  guided_reflection        = $wk1$Close your eyes. Put one hand on your belly. Take 10 slow, deep breaths. Feel your belly move in and out — soft and relaxed, or tight? Now ask your body a quiet question: 'What do I need right now?' A snack? Water? Rest? A quiet corner? A jump around? You don't have to answer with words. Your body already knows. Just listen.$wk1$,
  journaling_prompt        = $wk1$Draw a picture of your body when it feels happy and calm — and a picture of your body when it's telling you it needs something. What's different?$wk1$,
  weekly_practice_mon      = $wk1$Be a body detective today. Notice one sensation — hungry, wiggly, warm, tired — and tell a grown-up what you found.$wk1$,
  weekly_practice_wed      = $wk1$When a big feeling comes, try horse lips: breathe in through your nose, then blow a big puff out through your lips so they flap like a horse. What happens to the feeling?$wk1$,
  weekly_practice_sun      = $wk1$Give yourself a butterfly hug — wrap your arms around yourself and squeeze gently, just the way you like it. Tell a grown-up what your body said back.$wk1$,
  core_affirmation         = $wk1$My body talks to me, and I'm learning to listen. I know the difference between a calm body and a wiggly one.$wk1$,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Child';

-- ---------------------------------------------------------------------------
-- curriculum_weeks — portal / coursebook (per-track sources + child assets).
-- ---------------------------------------------------------------------------
UPDATE public.curriculum_weeks
SET
  youtube_url           = $wk1$https://www.youtube.com/watch?v=0HMjTxKRbaI$wk1$,
  youtube_title         = $wk1$Cal Newport: Slow Productivity — The Lost Art of Accomplishment Without Burnout$wk1$,
  youtube_runtime       = $wk1$~10 min$wk1$,
  adult_source          = $wk1$https://www.youtube.com/watch?v=0HMjTxKRbaI$wk1$,
  adult_video_title     = $wk1$Cal Newport: Slow Productivity$wk1$,
  teen_source           = $wk1$https://www.youtube.com/watch?v=Thlbqg2sKEM$wk1$,
  teen_video_title      = $wk1$7 Hard Truths for Teens$wk1$,
  kids_source           = $wk1$https://www.youtube.com/watch?v=UOsxlVpQT14$wk1$,
  kids_picture_book     = $wk1$Listening to My Body by Gabi Garcia$wk1$,
  kids_picture_book_note = $wk1$Sensations and feelings — tuning in to what your body needs.$wk1$,
  kids_game             = $wk1$FEELINGS FREEZE: Music plays and everyone walks around the room. When the music stops, the leader calls out a feeling — happy, angry, scared, excited, tired — and everyone freezes, showing that feeling with their whole body (face AND body). Then the leader asks: 'Where do you feel it?' and everyone points to where it lives (tummy, heart, hands, jaw). Variation 'BODY DETECTIVE': the leader calls out a sensation — cold, sweaty, wiggly, calm, shaky — and everyone freezes in that body state. No one is out, everyone plays, and it teaches body awareness in a room of 40 kids.$wk1$,
  reflective_question   = $wk1$Where in your week are you performing busyness instead of producing something that matters — and what's the one thing you'd need to do fewer of (or obsess more over) to change that?$wk1$,
  interactive_activity  = $wk1$THE OUTCOME AUDIT: List everything currently on your plate — meetings, tasks, projects, 'shoulds'. For each one, ask: is this real, valuable work — or visible activity? Then circle the one to three things that, if done excellently, would make the rest matter less. Finally: what's one commitment you could put down this week to give the important few your full attention? Share your 'fewer things' shortlist.$wk1$,
  updated_at            = now()
WHERE week_number = 1;
