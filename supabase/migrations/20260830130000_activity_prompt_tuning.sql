-- The live interaction library already has seven distinct surfaces. Tune the
-- generic scale and sentence-stem prompts to the actual Notion lesson content,
-- and remove the only two back-to-back repetitions in the 52-week sequence.
-- Final distribution:
--   phrase 13 · scale 12 · choice 10 · reflection 8 · wordcloud 6
--   none 2 · whiteboard 1
-- No adjacent weeks use the same surface.

UPDATE public.curriculum_weeks
   SET activity_type = 'wordcloud',
       activity_options = ''
 WHERE week_number = 4;

UPDATE public.curriculum_weeks
   SET activity_type = 'phrase',
       activity_options = 'In ________ I choose to show ________ while keeping ________ private.'
 WHERE week_number = 42;

UPDATE public.curriculum_weeks AS c
   SET activity_options = v.statement || chr(10) || v.low_label || chr(10) || v.high_label
  FROM (VALUES
    (2,  'How much does one story about you still feel like fact?',                         'Not much',            'Very strongly'),
    (5,  'How clearly can you see yourself using specific evidence today?',                'Not clearly',         'Very clearly'),
    (12, 'How automatic does the habit feel right now?',                                   'Barely automatic',    'Almost automatic'),
    (18, 'How much does your inner voice sound like a useful coach today?',                 'Mostly critic',       'Mostly coach'),
    (21, 'How much is this relationship expectation supported by present evidence?',       'Mostly inherited',    'Well supported'),
    (25, 'How complete does your current version of the story feel?',                       'Leaves a lot out',     'Feels fuller'),
    (29, 'How easy is this tiny habit to begin in your current environment?',               'High friction',       'Easy to start'),
    (33, 'How steady is one helpful anchor in your week?',                                  'Not steady yet',      'Very steady'),
    (36, 'How clear is one direction you want to explore?',                                 'Not clear yet',       'Clear enough to test'),
    (44, 'How ready do you feel to name a need in a small disagreement?',                   'Not ready',           'Ready to try'),
    (47, 'How sustainable does your current approach feel?',                                'Draining',            'Sustainable'),
    (50, 'How balanced is your attention between good things and hard things?',             'Mostly one-sided',    'Balanced')
  ) AS v(week_number, statement, low_label, high_label)
 WHERE c.week_number = v.week_number
   AND c.activity_type = 'scale';

UPDATE public.curriculum_weeks AS c
   SET activity_options = v.template
  FROM (VALUES
    (7,  'What happened was ________, and the next useful step is ________.'),
    (11, 'What I know is ________; another possible explanation is ________.'),
    (14, 'One choice I can start myself is ________; my smallest step is ________.'),
    (17, 'What I can repair is ________; the behaviour I want to change is ________.'),
    (20, 'What feels scarce is ________; one practical support or action is ________.'),
    (24, 'My prediction is ________; the smallest safe test is ________.'),
    (31, 'One setting that shapes me is ________; one small adjustment is ________.'),
    (35, 'Before I judge it, I will make ________ for ________ minutes.'),
    (40, 'I notice ________; before I help, I will ask ________.'),
    (42, 'In ________ I choose to show ________ while keeping ________ private.'),
    (45, 'I can offer ________; one limit I want to keep is ________.'),
    (48, 'One question I can ask is ________; then I will ________.'),
    (51, 'When I need ________, my smallest useful tool is ________.')
  ) AS v(week_number, template)
 WHERE c.week_number = v.week_number
   AND c.activity_type = 'phrase';
