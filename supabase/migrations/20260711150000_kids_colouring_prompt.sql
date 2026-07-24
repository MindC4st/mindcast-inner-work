-- Add a per-child-lesson A4 colouring-page prompt to the 52-week curriculum.
--
-- Each week already has a shared `weekly_theme` and a `kids_title`. This adds a
-- ready-to-paste Google Flow / Imagen prompt that generates an A4 line-art
-- colouring page based on that week's theme. The prompt is built from each
-- row's own theme, so it populates correctly for all 52 weeks regardless of
-- their content (which lives only in the live DB).
--
-- Re-run safe: only fills rows where the prompt is still empty. To regenerate
-- after editing themes, set kids_colouring_prompt = '' for those rows and
-- re-run this UPDATE.

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS kids_colouring_prompt text DEFAULT '';

UPDATE public.curriculum_weeks
SET kids_colouring_prompt =
  'A4 portrait children''s colouring page. Black-and-white LINE ART ONLY: bold, '
  || 'clean, even outlines, no shading, no grey, no colour, pure white background. '
  || 'Large, simple, friendly shapes an under-8 can colour inside the lines. A warm, '
  || 'playful scene that illustrates the theme "'
  || COALESCE(NULLIF(btrim(weekly_theme), ''), NULLIF(btrim(kids_title), ''), 'kindness')
  || '"'
  || CASE WHEN COALESCE(btrim(kids_title), '') <> ''
       THEN ' (this week''s children''s lesson: ' || btrim(kids_title) || ')'
       ELSE '' END
  || '. Cute characters, nature, and everyday objects; thick uniform line weight '
  || 'suited to crayons. Centred composition with a clear border margin. '
  || 'NO text, NO words, NO letters, NO numbers. Style: classic kids'' activity-book '
  || 'colouring page. Aspect ratio 3:4 (A4 portrait).'
WHERE COALESCE(btrim(kids_colouring_prompt), '') = '';
