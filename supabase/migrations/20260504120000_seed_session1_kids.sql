-- Seed Session 1 — Little Ones and Teens tracks
-- Safe to re-run: deletes and re-inserts for session_number = 1
DO $$
DECLARE
  v_session_id uuid;
BEGIN
  SELECT id INTO v_session_id FROM sessions WHERE session_number = 1 LIMIT 1;

  IF v_session_id IS NULL THEN
    RAISE NOTICE 'sessions.session_number=1 not found — skipping kids_sessions seed';
    RETURN;
  END IF;

  DELETE FROM kids_sessions WHERE parent_session_id = v_session_id;

  -- Little Ones (ages 4–11)
  INSERT INTO kids_sessions (parent_session_id, age_group, lesson_theme, activity_type, activity_description, materials_needed, facilitator_notes)
  VALUES (
    v_session_id,
    'little_ones',
    'Who Am I Really?',
    'Discussion circles',
    'Read The Invisible String together. Then ask the children: "Who are you when no one is watching? What''s different about that person from who you are at school or with your friends?" Finish by drawing your ''inside self'' and ''outside self'' side by side.',
    'The Invisible String by Patrice Karst (picture book), crayons, A4 paper',
    'Mirrors the adult theme of meaning vs. junk values (Johann Hari). Key insight for little ones: there is a real ''you'' underneath the performing self. The Invisible String introduces the idea that connection is invisible but always present — a perfect entry point for identity work.'
  );

  -- Teens (ages 12–24)
  INSERT INTO kids_sessions (parent_session_id, age_group, lesson_theme, activity_type, activity_description, materials_needed, facilitator_notes, video_title)
  VALUES (
    v_session_id,
    'teens',
    'Finding Your True Identity',
    'Journal prompt',
    'Watch the first 15 minutes of the video together. Then journal independently: "Write about a time you acted differently to fit in. What did you give up to do that? Who were you trying to be?" Share one sentence with the group — only if you want to. Closing discussion: "What does happiness look like when it''s really yours?"',
    'Journals or paper, pens, laptop or screen for video',
    'Source: Jay Shetty — On Purpose podcast. Search YouTube: "Jay Shetty how to find your true identity". Accessible for ages 12+. Parallels the adult session on meaning (Johann Hari) — teen framing is identity as the foundation of real happiness. The bridge question for discussion: adults ask ''where is meaning?'' teens ask ''who am I?'' — same root inquiry.'
  );

END $$;
