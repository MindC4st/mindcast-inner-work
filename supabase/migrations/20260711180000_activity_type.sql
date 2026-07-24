-- Structured interactive-activity type for the live in-session widget.
--
-- curriculum_weeks.interactive_activity stays the human description shown on
-- screen. activity_type is the machine field that drives WHICH live input the
-- members get, so the widget is deterministic (not inferred from prose):
--   wordcloud  : everyone submits one word -> live word cloud
--   poll       : vote / rate / spectrum / this-or-that -> live tally
--   reflection : submit a line / open text -> live wall or moderated Q&A
--   none       : private journaling only (nothing shared to a screen)
--
-- Backfilled per week from the 52-week lesson plan (each week hand-classified
-- from its activity description). Default 'reflection' covers the rest.

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS activity_type text NOT NULL DEFAULT 'reflection'
    CHECK (activity_type IN ('wordcloud','poll','reflection','none'));

UPDATE public.curriculum_weeks AS c
SET activity_type = v.t
FROM (VALUES
  (1,'wordcloud'), (8,'wordcloud'), (15,'wordcloud'), (26,'wordcloud'), (39,'wordcloud'), (52,'wordcloud'),
  (3,'poll'), (4,'poll'), (6,'poll'), (10,'poll'), (19,'poll'), (23,'poll'),
  (28,'poll'), (30,'poll'), (34,'poll'), (37,'poll'), (42,'poll'), (43,'poll'),
  (9,'none'), (16,'none')
) AS v(wk, t)
WHERE c.week_number = v.wk;
