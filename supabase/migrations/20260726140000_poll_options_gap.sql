-- Fill the gap the launch audit found: five weeks are set to activity_type
-- 'poll' but had no options, so the Together slide silently fell back to the
-- plain exercise slide instead of running a poll.
--
-- Poll weeks: 3, 4, 6, 10, 19, 23, 28, 30, 34, 37, 42, 43.
-- Options already seeded: 6, 10, 19, 23, 30, 34, 42. These are the other five,
-- written from each week's own activity so the choices match the room.

-- Week 3 · The Pattern Interrupt — vote on your most automatic trigger.
UPDATE public.curriculum_weeks SET activity_options =
  'Stress or pressure' || chr(10) || 'Feeling criticised' || chr(10) ||
  'Boredom' || chr(10) || 'Tiredness' || chr(10) || 'Being rushed'
  WHERE week_number = 3 AND COALESCE(activity_options,'') = '';

-- Week 4 · What Your Body Is Telling You — where does the tension sit?
UPDATE public.curriculum_weeks SET activity_options =
  'Head or jaw' || chr(10) || 'Throat or chest' || chr(10) ||
  'Shoulders or neck' || chr(10) || 'Stomach' || chr(10) || 'Hands'
  WHERE week_number = 4 AND COALESCE(activity_options,'') = '';

-- Week 28 · What Do You Actually Value? — rank your top value.
UPDATE public.curriculum_weeks SET activity_options =
  'Connection' || chr(10) || 'Freedom' || chr(10) || 'Growth' || chr(10) ||
  'Security' || chr(10) || 'Contribution' || chr(10) || 'Honesty'
  WHERE week_number = 28 AND COALESCE(activity_options,'') = '';

-- Week 37 · Money and Resources — need / want / could-share.
UPDATE public.curriculum_weeks SET activity_options =
  'A need' || chr(10) || 'A want' || chr(10) || 'Something I could share'
  WHERE week_number = 37 AND COALESCE(activity_options,'') = '';

-- Week 43 · Living Your Values Under Pressure — what usually wins?
UPDATE public.curriculum_weeks SET activity_options =
  'My values held' || chr(10) || 'I went quiet' || chr(10) ||
  'I went along with the room' || chr(10) || 'I still am not sure'
  WHERE week_number = 43 AND COALESCE(activity_options,'') = '';

-- Verify: every poll week should now have options.
--   SELECT week_number FROM public.curriculum_weeks
--   WHERE activity_type = 'poll' AND COALESCE(activity_options,'') = '';   -- expect 0 rows
