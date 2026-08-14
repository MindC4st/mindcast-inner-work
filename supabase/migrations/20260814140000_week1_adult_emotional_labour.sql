-- Week 1 Adult: swap the adult video to the emotional-labour talk
-- (kJ_Gg5DPCQU) and rewrite the adult reflective questions + activities around
-- it, keeping the 'See Clearly' / 'The Signal and the Noise' theme.
-- The invisible mental load is the noise; naming it, making it visible, and
-- moving from "helping out" to "taking ownership" is the signal.
-- Teen and Child are untouched (still set by 20260814130000).

-- ---------------------------------------------------------------------------
-- mindcast_live_sessions — Adult week 1.
-- ---------------------------------------------------------------------------
UPDATE public.mindcast_live_sessions
SET
  video_link               = $wk1$https://www.youtube.com/watch?v=kJ_Gg5DPCQU$wk1$,
  video_description        = $wk1$Emotional Labour — the invisible mental load in relationships: naming the work, making it visible, and moving from 'helping out' to 'taking ownership'. Runtime ~20 min.$wk1$,
  video_backup_description = $wk1$Search: 'emotional labour invisible mental load relationships' if link unavailable.$wk1$,
  experiential_exercise    = $wk1$MAKE THE INVISIBLE VISIBLE: For one week, track everything you carry — seen and unseen. Two columns: 'Visible tasks' (dishes, laundry, bills) and 'Invisible load' (remembering, planning, anticipating, following up). Be specific. Then compare your list with the person beside you. What's on your list that they'd never notice? What would happen if you stopped carrying one item silently? Share one thing from the 'invisible' column that surprised you.$wk1$,
  guided_reflection        = $wk1$Sit quietly. Notice the list running in your head — the reminders, the plans, the things you hold so others don't have to. Feel that quiet, constant hum. That's the noise — invisible, relentless, and easy to stop noticing until you're running on fumes. Now bring to mind one thing on that list you've never actually named out loud. Ask yourself: who knows I carry this? What would it take to name it — not as an accusation, but as the truth? Naming it doesn't make it heavier. It's the first step toward sharing it.$wk1$,
  journaling_prompt        = $wk1$What invisible load have you been carrying silently — and what would it take to name it, so it could finally be seen and shared?$wk1$,
  weekly_practice_mon      = $wk1$Catch the hum. Once today, notice the mental list running in the background and write down one invisible thing you're carrying that no one else can see.$wk1$,
  weekly_practice_wed      = $wk1$Make one thing visible. Name one invisible responsibility out loud to the person who shares your life — not as a complaint, as information: 'I carry this. I'd like us to see it together.'$wk1$,
  weekly_practice_sun      = $wk1$Move from helping to owning. Identify one task you've been 'helping with' that you could own — and one task you're carrying that someone else could own. Take one concrete step toward real ownership.$wk1$,
  core_affirmation         = $wk1$I see the invisible load, I name it without blame, and I share it so we can carry it together.$wk1$,
  updated_at               = now()
WHERE week_number = 1 AND audience = 'Adult';

-- ---------------------------------------------------------------------------
-- curriculum_weeks — adult fields (portal + coursebook).
-- ---------------------------------------------------------------------------
UPDATE public.curriculum_weeks
SET
  youtube_url          = $wk1$https://www.youtube.com/watch?v=kJ_Gg5DPCQU$wk1$,
  youtube_title        = $wk1$Emotional Labour: The Invisible Mental Load$wk1$,
  youtube_runtime      = $wk1$~20 min$wk1$,
  adult_source         = $wk1$https://www.youtube.com/watch?v=kJ_Gg5DPCQU$wk1$,
  adult_video_title    = $wk1$Emotional Labour: The Invisible Mental Load$wk1$,
  reflective_question  = $wk1$What invisible load have you been carrying silently — and what would it take to name it, so it could finally be seen and shared?$wk1$,
  interactive_activity = $wk1$MAKE THE INVISIBLE VISIBLE: For one week, track everything you carry — seen and unseen. Two columns: 'Visible tasks' (dishes, laundry, bills) and 'Invisible load' (remembering, planning, anticipating, following up). Be specific. Then compare your list with the person beside you. What's on your list that they'd never notice? What would happen if you stopped carrying one item silently? Share one thing from the 'invisible' column that surprised you.$wk1$,
  updated_at           = now()
WHERE week_number = 1;
