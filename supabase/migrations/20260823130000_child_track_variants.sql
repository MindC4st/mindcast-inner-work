-- Child track variants — the child deck runs the SAME eight positions as
-- Adult/Teen, with the content swapped per track:
--
--   1 Roll call          (not join code, not bracelet tap — no child devices)
--   2 Last week we learnt (recap only — no intention return for 5-11s)
--   3 Wisdom / today      (kids_signal_metaphor wording, gated Gemini clip)
--   4 The picture book    (read live from a purchased copy)
--   5 Colouring           (this IS the child's Go Deeper slot)
--   6 Talk about picture  (spoken only — nothing recorded or displayed)
--   7 One thing this week (no if-then — too abstract below about ten)
--   8 Affirmation + game  (game notes in the facilitator drawer only)
--
-- Two structural changes:
--
-- 1. Colouring replaces Go Deeper for Child. v4 gave Child a ninth slide
--    (colouring AND deeper); the confirmed sequence is eight positions with
--    colouring occupying the Go Deeper slot, so deeper no longer applies.
--
-- 2. Colouring approval gate. An unreviewed AI image must not reach children
--    in one tap: generation lands 'unapproved', a facilitator approves before
--    the page can display or print. Pages already in place were generated and
--    used under the old flow, so they are grandfathered as approved.

UPDATE public.lesson_slides
   SET applies_to_tracks = '{Adult,Teen}'
 WHERE slide_key = 'deeper';

ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS coloring_approval text NOT NULL DEFAULT 'unapproved'
    CHECK (coloring_approval IN ('unapproved','approved'));

UPDATE public.mindcast_live_sessions
   SET coloring_approval = 'approved'
 WHERE COALESCE(btrim(coloring_page_url), '') <> '';

-- Verify after db push:
--   SELECT slide_key, applies_to_tracks FROM public.lesson_slides
--    WHERE slide_key IN ('deeper','coloring');
--     -- deeper {Adult,Teen} · coloring {Child}
--   SELECT count(*) FROM public.lesson_slides
--    WHERE is_active AND 'Child' = ANY(applies_to_tracks) AND slide_key <> 'notes';
--     -- expect 8
