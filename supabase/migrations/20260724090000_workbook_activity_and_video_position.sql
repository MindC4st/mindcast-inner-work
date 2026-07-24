-- Workbook equivalent of every live interactive activity, for the printed
-- coursebook and at-home (free/workbook) members. Each is the paper version of
-- that week's on-screen activity: an individual, writable prompt. Plus a
-- per-week video_position ('early' = evidence right after the metaphor;
-- 'late' = a closing story near the end) so the deck can flex the video slot.

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS workbook_activity text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_position text NOT NULL DEFAULT 'early'
    CHECK (video_position IN ('early','late'));

UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for the ''noise'' you walked in with. Beneath it, name the quieter ''signal'' it''s been drowning out.', updated_at = now() WHERE week_number = 1;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one ''old story'' you tell about yourself. Then rewrite it into one truer line.', updated_at = now() WHERE week_number = 2;
UPDATE public.curriculum_weeks SET workbook_activity = 'Circle your most automatic trigger this week. Write one ''pause move'' you''ll try before it fires next time.', updated_at = now() WHERE week_number = 3;
UPDATE public.curriculum_weeks SET workbook_activity = 'On the body outline, shade where you feel tension today. Write one word for what it might be telling you.', updated_at = now() WHERE week_number = 4;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one real strength and one ''still-growing'' edge. Notice that you hold both at once.', updated_at = now() WHERE week_number = 5;
UPDATE public.curriculum_weeks SET workbook_activity = 'Name the comparison that costs you most (feeds / peers / family). Write one race you''re quitting.', updated_at = now() WHERE week_number = 6;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your inner critic''s harshest line. Underneath, write what a kind coach would say instead.', updated_at = now() WHERE week_number = 7;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the ''surface'' feeling you show (e.g. angry). Below the waterline, name the deeper feeling underneath (scared / hurt / tired).', updated_at = now() WHERE week_number = 8;
UPDATE public.curriculum_weeks SET workbook_activity = 'Privately write one hurt you''ve carried, and name one caring person who could hold space for it. (Yours to keep — not shared.)', updated_at = now() WHERE week_number = 9;
UPDATE public.curriculum_weeks SET workbook_activity = 'Mark 1-10: how known do you feel by the people around you? Write one place you could be a little more real.', updated_at = now() WHERE week_number = 10;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one person you misjudged this week. Then write their situation from their side.', updated_at = now() WHERE week_number = 11;
UPDATE public.curriculum_weeks SET workbook_activity = 'Map one habit: trigger -> action -> reward. Write one healthier action you could swap in from the same trigger.', updated_at = now() WHERE week_number = 12;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the one thing from Phase 1 you can''t un-see now.', updated_at = now() WHERE week_number = 13;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the one thing you''re finally giving yourself permission to begin.', updated_at = now() WHERE week_number = 14;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for ''the me I was told to be'' and one for ''the me I''m becoming''.', updated_at = now() WHERE week_number = 15;
UPDATE public.curriculum_weeks SET workbook_activity = 'Privately write one grievance you''re still gripping, and one thing you''d reclaim by loosening it.', updated_at = now() WHERE week_number = 16;
UPDATE public.curriculum_weeks SET workbook_activity = 'Work the four steps for one thing you''re punishing yourself for: name it / own it / make it right / do better.', updated_at = now() WHERE week_number = 17;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one harsh line you tell yourself, then rewrite it the way a wise, kind coach would.', updated_at = now() WHERE week_number = 18;
UPDATE public.curriculum_weeks SET workbook_activity = 'Rate how full your ''yes'' cup is (1-10). Write one honest boundary you''ll practise this week.', updated_at = now() WHERE week_number = 19;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one kind, true line for someone near you. Notice how kindness grows when it''s shared.', updated_at = now() WHERE week_number = 20;
UPDATE public.curriculum_weeks SET workbook_activity = 'Complete: ''From ___ I learned ___.'' Write one lesson to keep and one to gently update.', updated_at = now() WHERE week_number = 21;
UPDATE public.curriculum_weeks SET workbook_activity = 'Name one piece of armour you wear (control / sarcasm / busyness) and one person you''d like to lower it with.', updated_at = now() WHERE week_number = 22;
UPDATE public.curriculum_weeks SET workbook_activity = 'Place a current loss on the autumn -> winter -> spring -> summer line. Write what it may be making room for.', updated_at = now() WHERE week_number = 23;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write a current fear, then decide: genuine danger, or discomfort dressed as danger? (Real fire / burnt toast.)', updated_at = now() WHERE week_number = 24;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write an old ''I am the kind of person who...'' line, then rewrite it into a truer version.', updated_at = now() WHERE week_number = 25;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for what you''ve let go this phase.', updated_at = now() WHERE week_number = 26;
UPDATE public.curriculum_weeks SET workbook_activity = 'List the qualities you choose to build with. Star your three foundation ones.', updated_at = now() WHERE week_number = 27;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your single ''true north'' value, and one recent choice it should have guided.', updated_at = now() WHERE week_number = 28;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the one 1% habit you''ll commit to daily for a year.', updated_at = now() WHERE week_number = 29;
UPDATE public.curriculum_weeks SET workbook_activity = 'Rate sleep / movement / food / calm (1-5). Circle the most depleted and write one way to charge it this week.', updated_at = now() WHERE week_number = 30;
UPDATE public.curriculum_weeks SET workbook_activity = 'List who fills you and who drains you. Write one relationship you''ll invest in.', updated_at = now() WHERE week_number = 31;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one ''brave'', one ''kind'', and one ''strong'' phrase to keep in your pocket.', updated_at = now() WHERE week_number = 32;
UPDATE public.curriculum_weeks SET workbook_activity = 'Sketch your ideal day''s rhythm (wake / move / connect / create / rest). Circle one change you''ll keep.', updated_at = now() WHERE week_number = 33;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your current ''mental tabs open'' number. Schedule one real rest block this week.', updated_at = now() WHERE week_number = 34;
UPDATE public.curriculum_weeks SET workbook_activity = 'Make one small thing here — a sketch, a few words, an idea — just because. No grading.', updated_at = now() WHERE week_number = 35;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one gift you carry. Name one place it could help complete a bigger picture.', updated_at = now() WHERE week_number = 36;
UPDATE public.curriculum_weeks SET workbook_activity = 'Sort three things into: need / want / could-share. Notice what the sorting reveals.', updated_at = now() WHERE week_number = 37;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one thing you''ll bring to your community this term.', updated_at = now() WHERE week_number = 38;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for ''who I was'' at the start and one for ''who I''m becoming''.', updated_at = now() WHERE week_number = 39;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your three most useful learnings and one person who could benefit from each.', updated_at = now() WHERE week_number = 40;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one lesson you''ve learned, in a single sentence a 10-year-old would understand.', updated_at = now() WHERE week_number = 41;
UPDATE public.curriculum_weeks SET workbook_activity = 'Mark 1-10: how seen do you let yourself be? Write one place you''ll show up more honestly.', updated_at = now() WHERE week_number = 42;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write a values dilemma you''re facing, then the choice your values point to — and why.', updated_at = now() WHERE week_number = 43;
UPDATE public.curriculum_weeks SET workbook_activity = 'For one real conflict, write one honest sentence: ''I feel ___, and I need ___.''', updated_at = now() WHERE week_number = 44;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one non-money gift (time / help / encouragement) you''ll give someone by Sunday.', updated_at = now() WHERE week_number = 45;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one specific thing you already have that is genuinely good — and enough.', updated_at = now() WHERE week_number = 46;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one long, unglamorous effort you''ll recommit to, even though the progress is still unseen.', updated_at = now() WHERE week_number = 47;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one tiny act that could brighten someone tomorrow.', updated_at = now() WHERE week_number = 48;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one mark you want to leave in each circle: close people / community / wider world.', updated_at = now() WHERE week_number = 49;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write three specific gratitudes from today — the exact moment, not the general category.', updated_at = now() WHERE week_number = 50;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the first sentence of your next chapter.', updated_at = now() WHERE week_number = 51;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for your Week-1 self and one for now. Then set one intention for the year ahead.', updated_at = now() WHERE week_number = 52;
