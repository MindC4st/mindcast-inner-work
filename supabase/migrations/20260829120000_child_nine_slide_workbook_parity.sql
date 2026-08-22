-- Restore the confirmed child sequence to nine projected slides.
--
-- Adult and Teen keep the eight shared lesson beats. Child inserts the
-- safeguarded colouring activity before Go Deeper, then continues through the
-- same reflection, intention/practice and affirmation close. The printable
-- workbook uses this same 8 / 8 / 9 sequence.

UPDATE public.lesson_slides
   SET applies_to_tracks = '{Adult,Teen,Child}'
 WHERE slide_key = 'deeper';

-- Verify after db push:
--   SELECT count(*) FROM public.lesson_slides
--    WHERE is_active AND 'Adult' = ANY(applies_to_tracks)
--      AND component_key <> 'FacilitatorNotes'; -- 8
--   SELECT count(*) FROM public.lesson_slides
--    WHERE is_active AND 'Teen' = ANY(applies_to_tracks)
--      AND component_key <> 'FacilitatorNotes'; -- 8
--   SELECT count(*) FROM public.lesson_slides
--    WHERE is_active AND 'Child' = ANY(applies_to_tracks)
--      AND component_key <> 'FacilitatorNotes'; -- 9
