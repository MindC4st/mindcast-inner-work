-- Expose the track-safe worksheet fields through the existing paid curriculum
-- RPC. Direct curriculum_weeks reads remain staff-only; members receive only
-- their entitled, unlocked track through this field whitelist.

CREATE OR REPLACE FUNCTION public.curriculum_for_track(
  p_audience text,
  p_week int DEFAULT NULL
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audience text;
  v_staff boolean;
BEGIN
  v_audience := CASE lower(COALESCE(p_audience, ''))
    WHEN 'adult' THEN 'Adult'
    WHEN 'teen' THEN 'Teen'
    WHEN 'child' THEN 'Child'
    WHEN 'kids' THEN 'Child'
    ELSE NULL
  END;

  IF v_audience IS NULL THEN
    RETURN;
  END IF;

  v_staff :=
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role);

  IF NOT v_staff AND NOT public.can_access_track(v_audience) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    jsonb_build_object(
      'week_number', c.week_number,
      'block_number', c.block_number,
      'block_theme', c.block_theme,
      'weekly_theme', c.weekly_theme,
      'core_learning', c.core_learning,
      'youtube_url', c.youtube_url,
      'youtube_title', c.youtube_title,
      'reflective_question', c.reflective_question,
      'interactive_activity', c.interactive_activity,
      'inner_wisdom_alignment', c.inner_wisdom_alignment,
      'opening_question', c.opening_question,
      'thought_provoking_question', c.thought_provoking_question,
      'workbook_activity', c.workbook_activity,
      'activity_type', c.activity_type,
      'activity_options', c.activity_options
    )
    || CASE v_audience
      WHEN 'Adult' THEN jsonb_build_object(
        'signal_metaphor', c.signal_metaphor,
        'adult_source', c.adult_source,
        'adult_video_title', c.adult_video_title
      )
      WHEN 'Teen' THEN jsonb_build_object(
        'teen_signal_metaphor', c.teen_signal_metaphor,
        'teen_source', c.teen_source,
        'teen_video_title', c.teen_video_title
      )
      WHEN 'Child' THEN jsonb_build_object(
        'kids_signal_metaphor', c.kids_signal_metaphor,
        'kids_activity_type', c.kids_activity_type,
        'kids_source', c.kids_source,
        'kids_title', c.kids_title,
        'kids_picture_book', c.kids_picture_book,
        'kids_picture_book_note', c.kids_picture_book_note,
        'kids_picture_book_author', c.kids_picture_book_author,
        'kids_picture_book_question', c.kids_picture_book_question,
        'kids_colouring_prompt', c.kids_colouring_prompt,
        'kids_game', c.kids_game,
        'kids_game_equipment', c.kids_game_equipment,
        'kids_game_under5', c.kids_game_under5,
        'kids_nz_alternative', c.kids_nz_alternative,
        'kids_nz_alternative_author', c.kids_nz_alternative_author,
        'kids_nz_alternative_note', c.kids_nz_alternative_note,
        'kids_nz_alternative_verified', c.kids_nz_alternative_verified,
        'kids_read_aloud_source_check', c.kids_read_aloud_source_check
      )
      ELSE '{}'::jsonb
    END
  FROM public.curriculum_weeks c
  WHERE (p_week IS NULL OR c.week_number = p_week)
    AND (v_staff OR public.lesson_unlocked(c.week_number))
  ORDER BY c.week_number;
END;
$$;

REVOKE ALL ON FUNCTION public.curriculum_for_track(text, int)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.curriculum_for_track(text, int)
  TO authenticated;
