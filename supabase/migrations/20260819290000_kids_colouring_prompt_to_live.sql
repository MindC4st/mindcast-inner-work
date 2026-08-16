-- Wire the curated per-week colouring prompt (from the child v3 CSV, stored on
-- curriculum_weeks.kids_colouring_prompt) into the table the generator reads.
-- generate-coloring-page uses mindcast_live_sessions.coloring_prompt.
UPDATE public.mindcast_live_sessions m
SET coloring_prompt = c.kids_colouring_prompt
FROM public.curriculum_weeks c
WHERE m.week_number = c.week_number
  AND m.audience = 'Child'
  AND c.kids_colouring_prompt <> ''
  AND (m.coloring_prompt IS NULL OR m.coloring_prompt = '');
