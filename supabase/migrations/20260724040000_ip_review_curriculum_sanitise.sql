-- IP-review remediation for the 52-week curriculum content.
-- Full review: business/legal/05_ip_review_52_weeks.md
--
-- All risk was in curriculum_weeks (member-facing inner_wisdom_alignment + one
-- activity line). The live-session seed carried none of it. Fixes here run as
-- UPDATEs so they apply on any database via `supabase db push`, regardless of
-- what was previously seeded.
--
-- The YouTube embeds/attributions (Brené Brown, David Foster Wallace, James
-- Clear talks, Fred Luskin) are unchanged — embedding and naming a real,
-- officially-uploaded talk is legitimate.

-- 1. Remove the "ACIM" (A Course in Miracles) attribution from every week.
--    The reframed ideas are Mindcast's own synthesis in original words; naming
--    ACIM — modern, in-copyright, trademarked, and historically enforced — in
--    commercial member-facing text is unnecessary trademark/association risk.
UPDATE public.curriculum_weeks
SET inner_wisdom_alignment = replace(inner_wisdom_alignment, 'ACIM (reframed):', 'Inner reframe:'),
    updated_at = now()
WHERE inner_wisdom_alignment LIKE '%ACIM%';

-- 2a. "This is water" (David Foster Wallace) used as a quoted line -> own words.
UPDATE public.curriculum_weeks
SET inner_wisdom_alignment =
      'Dao: awareness is the water we forget we are swimming in — notice the medium itself. Inner reframe: seeing clearly is the whole work; everything else follows from it.',
    updated_at = now()
WHERE inner_wisdom_alignment LIKE '%This is water%';

-- 2b. "vote for the self you are becoming" (James Clear, Atomic Habits) -> own
--     words, in the alignment note and the interactive activity.
UPDATE public.curriculum_weeks
SET inner_wisdom_alignment =
      'Dao: the great is achieved through the small; a thousand-mile journey begins beneath one''s feet. Inner reframe: each small choice quietly shapes the person you are becoming.',
    updated_at = now()
WHERE inner_wisdom_alignment LIKE '%vote for the self you are becoming%';

UPDATE public.curriculum_weeks
SET interactive_activity = replace(
      replace(interactive_activity, 'the 1% habit they''ll cast a vote for daily', 'the 1% habit they''ll commit to daily'),
      'Live ''one small vote''', 'Live ''one small commitment'''),
    updated_at = now()
WHERE interactive_activity LIKE '%cast a vote for daily%';

-- 2c. "darkness within darkness, the gateway" (tracks a copyrighted Tao
--     translation) -> public-domain-based paraphrase in own words.
UPDATE public.curriculum_weeks
SET inner_wisdom_alignment =
      'Dao: depth opens by softening, not forcing — the unforced, quiet descent reveals what striving hides. Inner reframe: every upset is a fear asking to be understood, not obeyed.',
    updated_at = now()
WHERE inner_wisdom_alignment LIKE '%darkness within darkness%';

-- After this migration, no row should contain 'ACIM' — verify:
--   SELECT count(*) FROM public.curriculum_weeks WHERE inner_wisdom_alignment LIKE '%ACIM%';  -- expect 0
