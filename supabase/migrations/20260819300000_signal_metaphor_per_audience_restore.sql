-- Restore the per-audience 'In Today's World' metaphor onto each live-session
-- row. The content re-seed in 20260819220000_curriculum_content_v3.sql wrote the
-- ADULT signal_metaphor onto every track (Adult, Teen AND Child), overwriting the
-- kid-speak / teen variants mirrored by 20260724080000. This re-applies the
-- correct variant from curriculum_weeks so the kids' deck and colouring sheet use
-- kid-speak, not adult metaphors.
UPDATE public.mindcast_live_sessions ms
SET signal_metaphor = CASE ms.audience
      WHEN 'Teen'  THEN NULLIF(cw.teen_signal_metaphor, '')
      WHEN 'Child' THEN NULLIF(cw.kids_signal_metaphor, '')
      ELSE NULLIF(cw.signal_metaphor, '')
    END
FROM public.curriculum_weeks cw
WHERE ms.week_number = cw.week_number
  AND CASE ms.audience
        WHEN 'Teen'  THEN NULLIF(cw.teen_signal_metaphor, '')
        WHEN 'Child' THEN NULLIF(cw.kids_signal_metaphor, '')
        ELSE NULLIF(cw.signal_metaphor, '')
      END IS NOT NULL;
