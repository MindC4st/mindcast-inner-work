-- Batch: apply pending schema & schedule migrations (PR #7/#8 groundwork), then run 040000/060000 sanitise + inner-wisdom reflow, 070000 modern signal metaphors, 080000 teen/child metaphors, 090000 workbook activity + video_position.

-- ============================================================
-- 20260711160000: add member-facing content columns (schema only; row upsert skipped)
-- ============================================================
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS core_learning           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_url             text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_title           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_runtime         text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reflective_question     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS interactive_activity    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_picture_book       text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_picture_book_note  text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_colouring_prompt   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS inner_wisdom_alignment  text DEFAULT '';

-- ============================================================
-- 20260711170000: program schedule + membership tiers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_settings_read_all" ON public.app_settings;
CREATE POLICY "app_settings_read_all" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "app_settings_admin_write" ON public.app_settings;
CREATE POLICY "app_settings_admin_write" ON public.app_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.app_settings (key, value) VALUES
  ('program_start_date', NULL), ('program_timezone', 'Pacific/Auckland')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.lesson_unlocked(week_number int)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE start_txt text; tz text; start_date date; unlock_at timestamptz;
BEGIN
  IF week_number IS NULL OR week_number < 1 THEN RETURN false; END IF;
  SELECT value INTO start_txt FROM public.app_settings WHERE key = 'program_start_date';
  IF start_txt IS NULL OR start_txt = '' THEN RETURN false; END IF;
  SELECT COALESCE(value, 'Pacific/Auckland') INTO tz FROM public.app_settings WHERE key = 'program_timezone';
  start_date := start_txt::date;
  unlock_at := ((start_date + ((week_number - 1) * 7))::timestamp + interval '9 hours 30 minutes')
               AT TIME ZONE COALESCE(tz, 'Pacific/Auckland');
  RETURN now() >= unlock_at;
END;
$$;
GRANT EXECUTE ON FUNCTION public.lesson_unlocked(int) TO anon, authenticated;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'none'
    CHECK (membership_tier IN ('none','adult','teen')),
  ADD COLUMN IF NOT EXISTS kids_addon boolean NOT NULL DEFAULT false;
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'adult'
    CHECK (tier IN ('adult','teen','kids_addon'));

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.nfc_id IS DISTINCT FROM OLD.nfc_id
     OR NEW.membership_status IS DISTINCT FROM OLD.membership_status
     OR NEW.membership_tier IS DISTINCT FROM OLD.membership_tier
     OR NEW.kids_addon IS DISTINCT FROM OLD.kids_addon
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify privileged profile fields.';
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 20260711180000: activity_type column (backfill via lesson-plan hand mapping)
-- ============================================================
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

-- ============================================================
-- 20260724030000: paywall / unlock enforcement
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND membership_status IN ('active','trialing')
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_active_member() TO authenticated;

DROP POLICY IF EXISTS "curriculum_read" ON public.curriculum_weeks;
DROP POLICY IF EXISTS "curriculum_read_authenticated" ON public.curriculum_weeks;
DROP POLICY IF EXISTS "curriculum_read_gated" ON public.curriculum_weeks;
CREATE POLICY "curriculum_read_gated" ON public.curriculum_weeks
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR (public.is_active_member() AND public.lesson_unlocked(week_number))
  );

CREATE OR REPLACE FUNCTION public.curriculum_public(p_week int DEFAULT NULL)
RETURNS TABLE (
  week_number int, block_number int, block_theme text, weekly_theme text,
  core_learning text, adult_video_title text, teen_video_title text, kids_title text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT week_number, block_number, block_theme, weekly_theme,
         core_learning, adult_video_title, teen_video_title, kids_title
  FROM public.curriculum_weeks
  WHERE (p_week IS NULL OR week_number = p_week)
  ORDER BY week_number;
$$;
GRANT EXECUTE ON FUNCTION public.curriculum_public(int) TO anon, authenticated;

DROP POLICY IF EXISTS "sessions_read_authenticated" ON public.mindcast_live_sessions;
DROP POLICY IF EXISTS "sessions_read_members" ON public.mindcast_live_sessions;
CREATE POLICY "sessions_read_members" ON public.mindcast_live_sessions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.is_active_member()
  );

DROP POLICY IF EXISTS "checkins_insert" ON public.check_ins;
DROP POLICY IF EXISTS "checkins_insert_self" ON public.check_ins;
CREATE POLICY "checkins_insert_self" ON public.check_ins
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR profile_id = public.current_profile_id()
  );

-- ============================================================
-- 20260724040000: IP sanitise (no-op if no ACIM text present)
-- ============================================================
UPDATE public.curriculum_weeks
SET inner_wisdom_alignment = replace(inner_wisdom_alignment, 'ACIM (reframed):', 'Inner reframe:'),
    updated_at = now()
WHERE inner_wisdom_alignment LIKE '%ACIM%';

-- ============================================================
-- 20260724060000: Inner Wisdom reflow (single-sentence, sanitised)
-- ============================================================
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'What can be named is never the whole of you — the deepest signal lives beneath every label; you are not the image or the username, but the awareness behind it.', updated_at = now() WHERE week_number = 1;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Before the world ever named you, you were already whole; the self you have edited and defended over the years is not the real one.', updated_at = now() WHERE week_number = 2;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'There is a quiet space where action arises without forcing — between what happens and the story you tell about it, there is always a choice-point, and it is yours.', updated_at = now() WHERE week_number = 3;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Trust the felt current beneath the words; the body is a messenger, not the enemy — listen to it without judging.', updated_at = now() WHERE week_number = 4;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'A pool reflects clearly only once it stops being stirred; true seeing is looking at yourself without the filter of self-attack.', updated_at = now() WHERE week_number = 5;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The bamboo does not envy the oak — each follows its own nature; comparison is a fear''s arithmetic, and your worth was never on the scale.', updated_at = now() WHERE week_number = 6;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Harshness hardens while softness endures — water wears down the hardest stone; the critic is only fear talking, and you can choose the kinder voice instead.', updated_at = now() WHERE week_number = 7;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Depth is reached by softening, not by forcing; every upset is a fear asking to be understood, not obeyed.', updated_at = now() WHERE week_number = 8;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The valley receives every stream and is not broken by any of it; the wound is not who you are — healing is remembering the wholeness underneath it.', updated_at = now() WHERE week_number = 9;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Natural, unpolished and whole — like uncarved wood; the mask is an invented self, and the real one needs no performance.', updated_at = now() WHERE week_number = 10;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The wise see through the eyes of everyone; whatever you choose to see in another, you strengthen in yourself.', updated_at = now() WHERE week_number = 11;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'A river carves a canyon drop by drop — small repeated action shapes everything; you become what you practise, so choose the pattern on purpose.', updated_at = now() WHERE week_number = 12;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Awareness is the water we forget we are swimming in — notice the medium itself; seeing clearly is the whole work, and everything else follows from it.', updated_at = now() WHERE week_number = 13;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The way moves through willingness, not permission; you are the author of your own go-ahead — no outside verdict is needed.', updated_at = now() WHERE week_number = 14;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Return to the natural shape beneath the ones others imposed; the false self is only a costume, and you are free to take it off.', updated_at = now() WHERE week_number = 15;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The soft and yielding outlast the rigid, and a clenched fist can receive nothing; forgiveness is dropping the story that keeps you in pain — a gift to yourself.', updated_at = now() WHERE week_number = 16;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Water does not war with the rock it flows past; it simply continues — guilt is not payment, so release yourself and let the lesson stay.', updated_at = now() WHERE week_number = 17;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'A wise gardener shapes by tending, not by scolding; change the voice you use inside and the whole inner weather changes.', updated_at = now() WHERE week_number = 18;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'A full cup cannot receive, so empty it to be useful — but choose what you pour; people-pleasing chases a verdict you already hold, so give from wholeness, not fear.', updated_at = now() WHERE week_number = 19;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The way is inexhaustible — the more it gives, the more it has; what you extend, you strengthen, because love is not a limited supply.', updated_at = now() WHERE week_number = 20;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Honour the source, then walk your own path; keep the love that was real and gently release the fear that was taught.', updated_at = now() WHERE week_number = 21;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'What yields survives the storm that snaps the rigid; the armour you raise is what keeps the very closeness you long for at bay.', updated_at = now() WHERE week_number = 22;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'All things rise and return, and emptiness comes before new form; nothing real is lost — endings only reveal what was never only the form.', updated_at = now() WHERE week_number = 23;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Meet the current without gripping and fear softens when it is not fought; fear is a call for reassurance from your own inner voice, not a fact.', updated_at = now() WHERE week_number = 24;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The map is not the territory — drop the smaller story to see the larger one; you are the author, not the character, and the pen is in your hand.', updated_at = now() WHERE week_number = 25;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Emptiness is what makes a cup useful — you have made room; laying down the false leaves only the real, and the real was never heavy.', updated_at = now() WHERE week_number = 26;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Know the constant within and you act from a settled centre; you are not built from labels — you choose what you extend and become.', updated_at = now() WHERE week_number = 27;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Follow your own nature and the path grows effortless; values are your inner voice choosing a direction, not rules imposed from outside.', updated_at = now() WHERE week_number = 28;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Great things are built from small ones, and a thousand-mile journey begins beneath your feet; each small choice quietly shapes the person you are becoming.', updated_at = now() WHERE week_number = 29;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Honour the body as the vessel that carries you — force nothing, restore in rhythm; care for the vessel so the inner life has a steady home.', updated_at = now() WHERE week_number = 30;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Keep company with what is natural and true; the relationships you tend teach you who you are, so choose the ones that call out your real self.', updated_at = now() WHERE week_number = 31;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Soft words and a steady centre govern the abrupt; the way you speak to yourself is the atmosphere you live in — be your own ally.', updated_at = now() WHERE week_number = 32;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'A wheel is useful because of both its ordered spokes and its empty hub; structure frees the mind from deciding, so it can simply be present.', updated_at = now() WHERE week_number = 33;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'In stillness, water clears itself — do less and arrive more; rest is trusting that you don''t have to force the day into shape.', updated_at = now() WHERE week_number = 34;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Creation flows when you stop forcing and let it move through you; expression is the self reaching outward, and joy — not judgement — is the measure.', updated_at = now() WHERE week_number = 35;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Each thing fulfils its own nature and the whole is served; your work is to extend your true self, and the world is completed by your particular light.', updated_at = now() WHERE week_number = 36;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Knowing when you have enough is the truest wealth; security is not a number — it is trust in your own inner sufficiency.', updated_at = now() WHERE week_number = 37;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The valley gives to all and competes with none; belonging is built by extending yourself, not by earning a place.', updated_at = now() WHERE week_number = 38;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The lasting way shows itself through steady character; becoming is really remembering — you are growing back into what was always true.', updated_at = now() WHERE week_number = 39;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The wise hold onto nothing and so always have plenty to give; what you have received becomes complete only when you pass it on.', updated_at = now() WHERE week_number = 40;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The wise teach mostly by how they live; to teach something is to strengthen it in yourself — you give and receive at once.', updated_at = now() WHERE week_number = 41;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'What is whole needs no polish to be enough; what you hide, you fear, and what you reveal to safe people, you begin to heal.', updated_at = now() WHERE week_number = 42;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'A deep-rooted tree bends in the gale and does not break; under pressure, return to your inner compass rather than the crowd''s fear.', updated_at = now() WHERE week_number = 43;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Yield and overcome — the gentle approach unties what force only pulls tighter; conflict is two people calling for the same thing, understanding, so answer that and not the attack.', updated_at = now() WHERE week_number = 44;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The more you give, the more you have; to give is to keep, and what you extend you experience as your own.', updated_at = now() WHERE week_number = 45;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'One who knows they have enough is already rich; peace is not the next thing you acquire — it is noticing the fullness already here.', updated_at = now() WHERE week_number = 46;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Great things are accomplished by small steps taken steadily, without hurry; trust your own becoming — it is working even when unseen.', updated_at = now() WHERE week_number = 47;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Water benefits everything and asks nothing back; every encounter is a chance to add light, and you carry your state of mind with you wherever you go.', updated_at = now() WHERE week_number = 48;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The wise act and leave no grasping behind, yet the good remains; what you extend outlives its form — a life given in love is the only legacy that is real.', updated_at = now() WHERE week_number = 49;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Contentment comes from receiving what is, fully; gratitude is choosing to see the good that fear overlooks.', updated_at = now() WHERE week_number = 50;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'The way has no end — you walk it by walking; the practice is the point, and you are always beginning again, which is exactly as it should be.', updated_at = now() WHERE week_number = 51;
UPDATE public.curriculum_weeks SET inner_wisdom_alignment = 'Return to the source and begin again, renewed; the end of the year is not a finish line but a remembering of who you have always been.', updated_at = now() WHERE week_number = 52;

-- ============================================================
-- 20260724070000: modern signal_metaphor (adult)
-- ============================================================
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS signal_metaphor text DEFAULT '';

UPDATE public.curriculum_weeks SET signal_metaphor = 'Your mind is a phone with 47 tabs open and notifications firing — the signal is the one tab you opened on purpose. Today: close the tabs (one breath, one thing) and hear the quiet channel underneath the noise.', updated_at = now() WHERE week_number = 1;
UPDATE public.curriculum_weeks SET signal_metaphor = 'The stories you tell about yourself run like an app in the background, quietly draining the battery. Today: catch one ''I''m the kind of person who…'' and ask — did I write this, or did it just install itself?', updated_at = now() WHERE week_number = 2;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Between the notification buzzing and your hand grabbing the phone there''s a half-second gap — that gap is a superpower. Today: find the buzz-to-grab gap in one habit and slot a single breath into it.', updated_at = now() WHERE week_number = 3;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Your body is the check-engine light your dashboard mind keeps ignoring — tight shoulders and a clenched jaw are data, not noise. Today: do a ten-second body scan before you fire back the stressful message.', updated_at = now() WHERE week_number = 4;
UPDATE public.curriculum_weeks SET signal_metaphor = 'The front camera shows every flaw; a good friend''s photo catches you laughing — self-awareness is choosing the friend''s lens. Today: describe yourself the way someone who loves you would.', updated_at = now() WHERE week_number = 5;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Scrolling compares your behind-the-scenes to everyone''s highlight reel — a treadmill where you sweat and never move. Today: name one ''race'' you''re quitting and mute the feed that runs it.', updated_at = now() WHERE week_number = 6;
UPDATE public.curriculum_weeks SET signal_metaphor = 'The inner critic is a group chat in your head that only ever roasts you — you can mute it and add a coach who''s honest but kind. Today: when the roast fires, ask ''would I say this to my best mate?''', updated_at = now() WHERE week_number = 7;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Anger is just the app icon; tap it and the real feeling opens underneath — fear, hurt, tiredness. Today: next time you''re ''grumpy'', open the icon and read what''s actually inside.', updated_at = now() WHERE week_number = 8;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Old hurts are a heavy backpack you''ve worn so long you forgot it''s on — naming them in a safe room is setting it down for a minute. Today: name one thing you''ve been carrying, just to feel the weight lift.', updated_at = now() WHERE week_number = 9;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Your profile is the filtered photo; the real you is the whole camera roll — and the right people want the camera roll. Today: show one true, unfiltered thing to someone safe.', updated_at = now() WHERE week_number = 10;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Everyone''s driving with a dashcam you can''t see — the person who cut you off might be racing to a hospital. Today: give one person the benefit of their unseen story.', updated_at = now() WHERE week_number = 11;
UPDATE public.curriculum_weeks SET signal_metaphor = 'A habit is an autoplay playlist — one trigger and the next track just starts. Today: spot the trigger track for one habit and swap the next song on purpose.', updated_at = now() WHERE week_number = 12;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You''ve been handed a toolkit — a pause button, a feelings-iceberg, a mirror, a mute button for the critic. Today: pick the one tool you''ll actually keep in your pocket.', updated_at = now() WHERE week_number = 13;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You keep refreshing an inbox for an approval email that''s never coming — because you''re the one who has to hit send. Today: give yourself the green light on one thing you''ve been waiting on.', updated_at = now() WHERE week_number = 14;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You''ve been reading lines off a teleprompter someone else wrote — but it isn''t your story. Today: put down one ''should'' and say the line that''s actually yours.', updated_at = now() WHERE week_number = 15;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Resentment is gripping a hot coal to throw at someone — you''re the one getting burned. Today: name one grudge and picture opening your hand and setting the coal down.', updated_at = now() WHERE week_number = 16;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You wouldn''t keep charging a friend for a debt they already paid — so stop billing yourself for the same mistake. Today: mark one thing ''paid — lesson kept'' and close the account.', updated_at = now() WHERE week_number = 17;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Swap the heckler in your head for a good coach — same honesty, opposite tone. Today: rewrite one harsh line the way a great coach would say it.', updated_at = now() WHERE week_number = 18;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Saying yes to everything is never closing any apps — your battery hits 1% by noon; a boundary is low-power mode on purpose. Today: turn one fear-''yes'' into an honest ''no''.', updated_at = now() WHERE week_number = 19;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Kindness isn''t a biscuit tin that empties — it''s a candle that lights other candles and loses nothing. Today: give something away as if it multiplies, because it does.', updated_at = now() WHERE week_number = 20;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You inherited relationship ''settings'' the way a phone ships with defaults — some are great, some need updating. Today: spot one default about love you want to change.', updated_at = now() WHERE week_number = 21;
UPDATE public.curriculum_weeks SET signal_metaphor = 'The armour that got you through school now sets off the metal detector at the hug. Today: lower one piece of armour — sarcasm, busyness, control — with one safe person.', updated_at = now() WHERE week_number = 22;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Winter looks like the tree died, but it''s just clearing the branches for spring. Today: name what an ending has quietly made room for.', updated_at = now() WHERE week_number = 23;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Most alarms in your head are burnt toast, not a house fire — the smoke detector just can''t tell the difference. Today: label one fear ''burnt toast'' and open a window instead of running.', updated_at = now() WHERE week_number = 24;
UPDATE public.curriculum_weeks SET signal_metaphor = 'An old story is a saved route on your maps app that no longer goes where you live. Today: delete one outdated ''I always…'' and set a new destination.', updated_at = now() WHERE week_number = 25;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You''ve cleared a pile of old apps clogging the phone — permission-seeking, resentment, armour. Today: notice how much lighter and faster you run without them.', updated_at = now() WHERE week_number = 26;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Instead of the labels stuck on you like airport baggage tags, you get to pack your own bag. Today: choose the three qualities you''re building yourself from.', updated_at = now() WHERE week_number = 27;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Values are your GPS ''home'' setting — every turn is easier once it''s locked in. Today: name your true-north value and check one recent decision against it.', updated_at = now() WHERE week_number = 28;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You don''t get fit from one epic gym session — you get fit from showing up small and often; identity works the same. Today: pick the 1% habit you''ll repeat like brushing your teeth.', updated_at = now() WHERE week_number = 29;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Your body is the phone the whole day runs on, and sleep, movement, food and calm are the four charging cables. Today: plug in the one that''s most drained.', updated_at = now() WHERE week_number = 30;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You become the average of your five most-opened contacts. Today: pick one relationship to open more, and one notification to turn down.', updated_at = now() WHERE week_number = 31;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Talk to yourself like you''d text a friend having a hard day — not like an anonymous troll in the comments. Today: keep one kind phrase in your pocket for the next hard moment.', updated_at = now() WHERE week_number = 32;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Routine isn''t a cage — it''s the trellis a plant climbs to reach the light. Today: add one small anchor (same wake time, one blocked hour) and let freedom grow on it.', updated_at = now() WHERE week_number = 33;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You plug your phone in before it dies, not after — do the same for yourself. Today: schedule one real rest block before you''re down to 1%.', updated_at = now() WHERE week_number = 34;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Making something is like cooking for yourself — it doesn''t need a Michelin star to feed you. Today: make one small thing no one will grade.', updated_at = now() WHERE week_number = 35;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Purpose is where your skills and the world''s needs overlap — the sweet spot of the Venn diagram. Today: name one small place that overlap already exists.', updated_at = now() WHERE week_number = 36;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Your money ''scripts'' are inherited apps running in the background of every purchase. Today: sort one thing into need / want / could-share and notice which script ran.', updated_at = now() WHERE week_number = 37;
UPDATE public.curriculum_weeks SET signal_metaphor = 'A community is a beehive — it works because everyone brings something back. Today: name the one thing you''ll bring to a room you want to belong to.', updated_at = now() WHERE week_number = 38;
UPDATE public.curriculum_weeks SET signal_metaphor = 'The building site is now a home you can live in — identity, values, habits, people. Today: name who you''ve become, and step through the door into living it.', updated_at = now() WHERE week_number = 39;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You don''t hoard the wifi password once you''re connected — you share it; inner work is the same. Today: give one thing you''ve healed enough to offer someone else.', updated_at = now() WHERE week_number = 40;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Explaining something to a ten-year-old is how you find out you actually understand it. Today: put one lesson into one plain sentence and pass it on.', updated_at = now() WHERE week_number = 41;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Turning your camera on in the meeting is scary for two seconds and connecting for the rest. Today: show up ''camera-on'' in one place you usually hide.', updated_at = now() WHERE week_number = 42;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Your values are only real in the storm, not the sunshine — like a compass that has to work when the sky goes dark. Today: name one value you''ll hold even when it costs you.', updated_at = now() WHERE week_number = 43;
UPDATE public.curriculum_weeks SET signal_metaphor = '''You always…'' starts a fight; ''I feel… I need…'' starts a conversation. Today: rewrite one hard message in the second language.', updated_at = now() WHERE week_number = 44;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Some gifts — encouragement, time, attention — cost nothing and still glow in your own hands after you give them. Today: give one non-money gift by Sunday.', updated_at = now() WHERE week_number = 45;
UPDATE public.curriculum_weeks SET signal_metaphor = 'The ''add to cart'' feeling is a treadmill — one more thing never becomes enough. Today: name three things you already have that are genuinely enough.', updated_at = now() WHERE week_number = 46;
UPDATE public.curriculum_weeks SET signal_metaphor = 'A seed spends weeks looking like nothing while it grows roots — don''t dig it up to check. Today: recommit to one slow, unglamorous thing that''s still growing underground.', updated_at = now() WHERE week_number = 47;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You leave a ''tip'' in every interaction — a little brighter or a little dimmer. Today: leave one person brighter, on purpose.', updated_at = now() WHERE week_number = 48;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Drop a stone in a pond and the ripples reach edges you''ll never see. Today: name one mark you want rippling out from how you live.', updated_at = now() WHERE week_number = 49;
UPDATE public.curriculum_weeks SET signal_metaphor = 'Gratitude is a camera — the more you practise pointing it, the more good it finds in frame. Today: capture three specific good moments in words, not generic ones.', updated_at = now() WHERE week_number = 50;
UPDATE public.curriculum_weeks SET signal_metaphor = 'There''s no ''finish line'' notification for growth — the walk is the point. Today: name the one practice you''ll keep for life, arrival or not.', updated_at = now() WHERE week_number = 51;
UPDATE public.curriculum_weeks SET signal_metaphor = 'You''re not closing a book, you''re turning to a blank page with a full backpack and a compass. Today: write the first line of next year''s chapter.', updated_at = now() WHERE week_number = 52;

UPDATE public.mindcast_live_sessions ms
SET signal_metaphor = cw.signal_metaphor
FROM public.curriculum_weeks cw
WHERE ms.week_number = cw.week_number AND COALESCE(cw.signal_metaphor,'') <> '';

-- ============================================================
-- 20260724080000: teen + child variants of the metaphor
-- ============================================================
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS teen_signal_metaphor text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_signal_metaphor text DEFAULT '';

UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your brain''s like your phone with every app open and buzzing — the signal is the one thing that actually matters. Today: flick on Do Not Disturb for a minute and notice the quiet.', kids_signal_metaphor = 'Your mind can get loud like a room full of shouting toys. Take a big breath and find the quiet voice inside — that''s the real you.', updated_at = now() WHERE week_number = 1;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'The things you believe about yourself are like an old status you never updated — and half of them aren''t even true. Today: catch one ''I''m not…'' and ask who typed that.', kids_signal_metaphor = 'Sometimes we carry heavy ''story stones'' like ''I can''t''. You can set one down and pick up a lighter one: ''I can try''.', updated_at = now() WHERE week_number = 2;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Between someone''s annoying comment and your comeback there''s a tiny gap — that gap is your power button. Today: press pause once before you react.', kids_signal_metaphor = 'When a big feeling comes, press your own PAUSE button and count 1-2-3 before you do anything.', updated_at = now() WHERE week_number = 3;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your body sends notifications before your brain does — butterflies, tight chest, hot face. Today: read one before a stressful moment instead of ignoring it.', kids_signal_metaphor = 'Your body talks to you! Butterflies in your tummy or a hot face — where do YOU feel your feelings?', updated_at = now() WHERE week_number = 4;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your front camera shows every flaw; a real mate sees you laughing. Today: look at yourself the way your best friend does.', kids_signal_metaphor = 'Look in the mirror and say something kind to yourself, just like a good friend would.', updated_at = now() WHERE week_number = 5;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Comparing your life to everyone''s feed is comparing your bloopers to their highlight reel. Today: mute one account that quietly makes you feel small.', kids_signal_metaphor = 'You''re your very own puzzle — nobody else has your pieces. You don''t need to be like anyone else.', updated_at = now() WHERE week_number = 6;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'That mean voice in your head is like a hater in the comments — you can mute it and keep a coach. Today: talk to yourself the way you''d talk to your best mate.', kids_signal_metaphor = 'If a grumpy gremlin says mean things inside, don''t listen — listen to the kind coach who says ''you can do it''.', updated_at = now() WHERE week_number = 7;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Being ''angry'' is usually just the top layer — scared, hurt or tired is underneath. Today: dig one feeling one level deeper.', kids_signal_metaphor = 'Angry is like the tip of an iceberg — underneath might be sad or scared. What''s under yours?', updated_at = now() WHERE week_number = 8;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Old hurts are like a heavy bag you forgot you''re even carrying. Today: tell one safe person one thing you''ve been carrying.', kids_signal_metaphor = 'Everyone has hurts, like a little stone in their pocket. You don''t have to carry it alone — safe people help.', updated_at = now() WHERE week_number = 9;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your finsta is closer to the real you than your main account. Today: show the real you to one person you trust.', kids_signal_metaphor = 'Sometimes we wear a pretend face. The people who love you want to see the real, wonderful you.', updated_at = now() WHERE week_number = 10;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'The person who snapped at you might be having the worst day of their life — you just can''t see it. Today: give one person the benefit of the doubt.', kids_signal_metaphor = 'Everyone has a story you can''t see. Be kind — you never know what someone might be feeling.', updated_at = now() WHERE week_number = 11;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'A habit is autoplay — one trigger and the next thing just happens. Today: swap one autoplay action on purpose.', kids_signal_metaphor = 'Habits are like a path you walk again and again. You can choose to make a new, better path.', updated_at = now() WHERE week_number = 12;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You''ve unlocked a toolkit this term — a pause button, a mute button, a feelings map. Today: pick the one you''ll actually keep.', kids_signal_metaphor = 'You''ve learned lots of tools — a pause button, a feelings map, a kind coach. Which one will you keep in your pocket?', updated_at = now() WHERE week_number = 13;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You keep waiting to get ''picked'' — but you''re allowed to pick yourself. Today: give yourself the green light on one thing.', kids_signal_metaphor = 'You don''t have to wait for a turn to try something good. Give yourself a big green GO!', updated_at = now() WHERE week_number = 14;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You''ve been playing a character other people wrote for you. Today: do one small thing that''s actually YOU.', kids_signal_metaphor = 'You don''t have to be who others say. You get to make your own special mark, like the first dot on a page.', updated_at = now() WHERE week_number = 15;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Holding a grudge is holding a hot chip — you''re the one it burns. Today: let one go.', kids_signal_metaphor = 'Holding a mad feeling is like holding a hot stone. Open your hand and let it go — you''ll feel better.', updated_at = now() WHERE week_number = 16;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You already paid for that mistake — stop charging yourself for it on repeat. Today: mark it ''lesson learned'' and move on.', kids_signal_metaphor = 'Everyone makes mistakes. Say sorry, make it right, and be kind to yourself — you''re still learning.', updated_at = now() WHERE week_number = 17;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Swap the hater in your head for a coach — same honesty, kinder tone. Today: rewrite one harsh thought the way a coach would.', kids_signal_metaphor = 'Turn the grumpy gremlin into a kind coach who says: ''You can do it, keep trying.''', updated_at = now() WHERE week_number = 18;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Saying yes to everything drains your battery to 1% by lunch. Today: say one honest ''no''.', kids_signal_metaphor = 'It''s okay to say ''no'' sometimes. Your ''yes'' means more when it comes from your heart.', updated_at = now() WHERE week_number = 19;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Kindness isn''t snacks that run out — it''s a phone charger that charges someone else and stays full. Today: give some away.', kids_signal_metaphor = 'Some things grow when you share them — like kindness and love! The more you give, the more there is.', updated_at = now() WHERE week_number = 20;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You picked up ''settings'' from the people who raised you — some are great, some need updating. Today: notice one you''d change.', kids_signal_metaphor = 'The people who love us teach us things. Keep the good lessons and gently let go of the ones that don''t help.', updated_at = now() WHERE week_number = 21;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'The tough act that once protected you now keeps good people out. Today: drop it a little with one safe person.', kids_signal_metaphor = 'Sometimes we build a wall to feel safe. But a wall can have a little door for the people we trust.', updated_at = now() WHERE week_number = 22;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Winter looks empty but it''s just clearing space for spring. Today: name what an ending has made room for.', kids_signal_metaphor = 'Even when the leaves fall, the tree isn''t gone — it''s resting and getting ready to grow again.', updated_at = now() WHERE week_number = 23;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Most ''panic'' is burnt toast, not a real fire — the alarm just can''t tell the difference. Today: label one fear ''burnt toast'' and breathe.', kids_signal_metaphor = 'Sometimes the worry alarm goes off for burnt toast, not a real fire. Take a breath — you are safe.', updated_at = now() WHERE week_number = 24;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'An old ''I always mess this up'' is a saved route that doesn''t go where you live now. Today: set a new destination.', kids_signal_metaphor = 'An old story like ''I always get it wrong'' can be rewritten. You get to add new, truer pages.', updated_at = now() WHERE week_number = 25;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You''ve deleted some heavy apps this term — grudges, armour, pressure. Today: notice how much lighter you run.', kids_signal_metaphor = 'You''ve put down some heavy stones and picked up some light feathers. Doesn''t that feel lighter?', updated_at = now() WHERE week_number = 26;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You don''t have to keep the labels people stuck on you — pack your own bag. Today: pick three qualities you''re built from.', kids_signal_metaphor = 'You get to choose what you''re made of — kind, brave, curious. Which bricks will you build with?', updated_at = now() WHERE week_number = 27;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your values are your GPS ''home'' setting — lock it in and choices get easier. Today: name your top one.', kids_signal_metaphor = 'A compass points the way. Your kindness and honesty are like your own compass inside.', updated_at = now() WHERE week_number = 28;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You don''t level up in one epic session — you grind small and daily. Today: pick one 1% habit to repeat.', kids_signal_metaphor = 'A tiny seed watered every day grows big. Small good habits grow YOU big too.', updated_at = now() WHERE week_number = 29;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your body''s the console everything runs on — sleep, food, moving and chill are the charge cables. Today: plug in the one that''s flat.', kids_signal_metaphor = 'Your body is like a superhero suit — sleep, food, moving and calm keep it charged up!', updated_at = now() WHERE week_number = 30;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You become the average of your closest few — choose your circle on purpose. Today: invest in one good friend.', kids_signal_metaphor = 'Good friends are like a garden growing side by side, helping each other stand tall.', updated_at = now() WHERE week_number = 31;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Talk to yourself like a mate, not a hater in the comments. Today: keep one kind phrase ready for a hard moment.', kids_signal_metaphor = 'Talk to yourself kindly, like talking to a friend: ''I can be scared AND brave.''', updated_at = now() WHERE week_number = 32;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Routine isn''t boring — it''s the frame that actually gives you more free time. Today: add one anchor to your day.', kids_signal_metaphor = 'A day with a gentle rhythm — wake, play, rest — helps you feel calm and happy.', updated_at = now() WHERE week_number = 33;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You charge your phone before it dies, not after — do the same for you. Today: plan real rest before you crash.', kids_signal_metaphor = 'Even superheroes need to rest and recharge. Resting isn''t being lazy — it''s getting stronger.', updated_at = now() WHERE week_number = 34;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Making stuff for fun (not for likes) actually feeds you. Today: make one thing nobody will grade.', kids_signal_metaphor = 'Make something just because it''s fun! It doesn''t have to be perfect — the making is the joy.', updated_at = now() WHERE week_number = 35;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Purpose is where what you''re good at meets what the world needs. Today: spot one small overlap.', kids_signal_metaphor = 'You have a special gift the world needs — like the puzzle piece that completes the picture.', updated_at = now() WHERE week_number = 36;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your money habits are hand-me-downs — needs, wants and sharing can be sorted on purpose. Today: sort one thing.', kids_signal_metaphor = 'Some things we need, some we want, and some we can share. Sharing feels really good!', updated_at = now() WHERE week_number = 37;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'A crew is a beehive — it works because everyone brings something back. Today: bring one thing to your group.', kids_signal_metaphor = 'A community is like a beehive — everyone brings something to help. What will you bring?', updated_at = now() WHERE week_number = 38;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your building site is now a place you can live in — values, habits, people. Today: name who you''ve become.', kids_signal_metaphor = 'You''ve built something wonderful inside — now it''s time to live it. Look how much you''ve grown!', updated_at = now() WHERE week_number = 39;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You share the wifi password once you''re connected — share what you''ve learned too. Today: help one person with it.', kids_signal_metaphor = 'When you learn something good, share it! Helping others makes the good even bigger.', updated_at = now() WHERE week_number = 40;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You really learn something when you can explain it simply. Today: teach one thing in a single sentence.', kids_signal_metaphor = 'Teaching a friend what you know helps you both. What could you teach in one sentence?', updated_at = now() WHERE week_number = 41;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Camera-on is scary for two seconds and connecting for the rest. Today: show up honestly somewhere you usually hide.', kids_signal_metaphor = 'The real you is wonderful. It''s brave and good to let people see the true you.', updated_at = now() WHERE week_number = 42;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Your values are only real when they actually cost you something. Today: hold one even when it''s hard.', kids_signal_metaphor = 'Doing the right thing can be hard, like holding a compass in a storm. Hold on to what you know is kind.', updated_at = now() WHERE week_number = 43;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = '''You always…'' starts a fight; ''I feel… I need…'' starts a conversation. Today: try the second one.', kids_signal_metaphor = 'When you''re upset with a friend, say ''I feel...'' and ''I need...'' — it helps you both.', updated_at = now() WHERE week_number = 44;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Some gifts cost nothing and still glow — time, help, a good word. Today: give one.', kids_signal_metaphor = 'You can give gifts that aren''t money — a smile, a helping hand, a kind word. They''re the best kind!', updated_at = now() WHERE week_number = 45;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = '''One more thing'' never becomes enough — it''s a treadmill. Today: name three things you already have that are enough.', kids_signal_metaphor = 'You already have so many good things! Let''s notice them and feel grateful.', updated_at = now() WHERE week_number = 46;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'A seed looks like nothing while it grows roots underground — don''t quit early. Today: recommit to one slow thing.', kids_signal_metaphor = 'A seed grows underground before you can see it. Keep going — you''re growing even when it doesn''t show!', updated_at = now() WHERE week_number = 47;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Every interaction leaves a tip — a bit brighter or a bit dimmer. Today: leave one person brighter.', kids_signal_metaphor = 'You can be a sunshine person, making others a little brighter wherever you go!', updated_at = now() WHERE week_number = 48;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Drop a stone in a pond and the ripples reach places you''ll never see. Today: name one mark you want to leave.', kids_signal_metaphor = 'Your kindness makes ripples, like a stone in a pond, reaching further than you can see.', updated_at = now() WHERE week_number = 49;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'Gratitude is a camera — the more you point it, the more good it finds. Today: name three specific good things.', kids_signal_metaphor = 'Gratitude is like a camera for good things. Snap three you''re thankful for today!', updated_at = now() WHERE week_number = 50;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'There''s no ''you win'' screen for growing up — the game itself is the point. Today: pick one practice to keep for life.', kids_signal_metaphor = 'You never finish growing — and that''s the fun part! Keep going, the adventure continues.', updated_at = now() WHERE week_number = 51;
UPDATE public.curriculum_weeks SET teen_signal_metaphor = 'You''re not closing the book, you''re on a fresh page with a full backpack. Today: write the first line of your next chapter.', kids_signal_metaphor = 'Look how far you''ve come this year! The story isn''t finished — it''s just beginning.', updated_at = now() WHERE week_number = 52;

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

-- ============================================================
-- 20260724090000: workbook_activity + video_position
-- ============================================================
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS workbook_activity text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_position text NOT NULL DEFAULT 'early'
    CHECK (video_position IN ('early','late'));

UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for the ''noise'' you walked in with. Beneath it, name the quieter ''signal'' it''s been drowning out.', updated_at = now() WHERE week_number = 1;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one ''old story'' you tell about yourself. Then rewrite it into one truer line.', updated_at = now() WHERE week_number = 2;
UPDATE public.curriculum_weeks SET workbook_activity = 'Circle your most automatic trigger this week. Write one ''pause move'' you''ll try before it fires next time.', updated_at = now() WHERE week_number = 3;
UPDATE public.curriculum_weeks SET workbook_activity = 'On the body outline, shade where you feel tension today. Write one word for what it might be telling you.', updated_at = now() WHERE week_number = 4;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one real strength and one ''still-growing'' edge. Notice that you hold both at once.', updated_at = now() WHERE week_number = 5;
UPDATE public.curriculum_weeks SET workbook_activity = 'Name the comparison that costs you most (feeds / peers / family). Write one race you''re quitting.', updated_at = now() WHERE week_number = 6;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your inner critic''s harshest line. Underneath, write what a kind coach would say instead.', updated_at = now() WHERE week_number = 7;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the ''surface'' feeling you show (e.g. angry). Below the waterline, name the deeper feeling underneath (scared / hurt / tired).', updated_at = now() WHERE week_number = 8;
UPDATE public.curriculum_weeks SET workbook_activity = 'Privately write one hurt you''ve carried, and name one caring person who could hold space for it. (Yours to keep — not shared.)', updated_at = now() WHERE week_number = 9;
UPDATE public.curriculum_weeks SET workbook_activity = 'Mark 1-10: how known do you feel by the people around you? Write one place you could be a little more real.', updated_at = now() WHERE week_number = 10;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one person you misjudged this week. Then write their situation from their side.', updated_at = now() WHERE week_number = 11;
UPDATE public.curriculum_weeks SET workbook_activity = 'Map one habit: trigger -> action -> reward. Write one healthier action you could swap in from the same trigger.', updated_at = now() WHERE week_number = 12;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the one thing from Phase 1 you can''t un-see now.', updated_at = now() WHERE week_number = 13;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the one thing you''re finally giving yourself permission to begin.', updated_at = now() WHERE week_number = 14;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for ''the me I was told to be'' and one for ''the me I''m becoming''.', updated_at = now() WHERE week_number = 15;
UPDATE public.curriculum_weeks SET workbook_activity = 'Privately write one grievance you''re still gripping, and one thing you''d reclaim by loosening it.', updated_at = now() WHERE week_number = 16;
UPDATE public.curriculum_weeks SET workbook_activity = 'Work the four steps for one thing you''re punishing yourself for: name it / own it / make it right / do better.', updated_at = now() WHERE week_number = 17;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one harsh line you tell yourself, then rewrite it the way a wise, kind coach would.', updated_at = now() WHERE week_number = 18;
UPDATE public.curriculum_weeks SET workbook_activity = 'Rate how full your ''yes'' cup is (1-10). Write one honest boundary you''ll practise this week.', updated_at = now() WHERE week_number = 19;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one kind, true line for someone near you. Notice how kindness grows when it''s shared.', updated_at = now() WHERE week_number = 20;
UPDATE public.curriculum_weeks SET workbook_activity = 'Complete: ''From ___ I learned ___.'' Write one lesson to keep and one to gently update.', updated_at = now() WHERE week_number = 21;
UPDATE public.curriculum_weeks SET workbook_activity = 'Name one piece of armour you wear (control / sarcasm / busyness) and one person you''d like to lower it with.', updated_at = now() WHERE week_number = 22;
UPDATE public.curriculum_weeks SET workbook_activity = 'Place a current loss on the autumn -> winter -> spring -> summer line. Write what it may be making room for.', updated_at = now() WHERE week_number = 23;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write a current fear, then decide: genuine danger, or discomfort dressed as danger? (Real fire / burnt toast.)', updated_at = now() WHERE week_number = 24;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write an old ''I am the kind of person who...'' line, then rewrite it into a truer version.', updated_at = now() WHERE week_number = 25;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for what you''ve let go this phase.', updated_at = now() WHERE week_number = 26;
UPDATE public.curriculum_weeks SET workbook_activity = 'List the qualities you choose to build with. Star your three foundation ones.', updated_at = now() WHERE week_number = 27;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your single ''true north'' value, and one recent choice it should have guided.', updated_at = now() WHERE week_number = 28;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the one 1% habit you''ll commit to daily for a year.', updated_at = now() WHERE week_number = 29;
UPDATE public.curriculum_weeks SET workbook_activity = 'Rate sleep / movement / food / calm (1-5). Circle the most depleted and write one way to charge it this week.', updated_at = now() WHERE week_number = 30;
UPDATE public.curriculum_weeks SET workbook_activity = 'List who fills you and who drains you. Write one relationship you''ll invest in.', updated_at = now() WHERE week_number = 31;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one ''brave'', one ''kind'', and one ''strong'' phrase to keep in your pocket.', updated_at = now() WHERE week_number = 32;
UPDATE public.curriculum_weeks SET workbook_activity = 'Sketch your ideal day''s rhythm (wake / move / connect / create / rest). Circle one change you''ll keep.', updated_at = now() WHERE week_number = 33;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your current ''mental tabs open'' number. Schedule one real rest block this week.', updated_at = now() WHERE week_number = 34;
UPDATE public.curriculum_weeks SET workbook_activity = 'Make one small thing here — a sketch, a few words, an idea — just because. No grading.', updated_at = now() WHERE week_number = 35;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one gift you carry. Name one place it could help complete a bigger picture.', updated_at = now() WHERE week_number = 36;
UPDATE public.curriculum_weeks SET workbook_activity = 'Sort three things into: need / want / could-share. Notice what the sorting reveals.', updated_at = now() WHERE week_number = 37;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one thing you''ll bring to your community this term.', updated_at = now() WHERE week_number = 38;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for ''who I was'' at the start and one for ''who I''m becoming''.', updated_at = now() WHERE week_number = 39;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write your three most useful learnings and one person who could benefit from each.', updated_at = now() WHERE week_number = 40;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one lesson you''ve learned, in a single sentence a 10-year-old would understand.', updated_at = now() WHERE week_number = 41;
UPDATE public.curriculum_weeks SET workbook_activity = 'Mark 1-10: how seen do you let yourself be? Write one place you''ll show up more honestly.', updated_at = now() WHERE week_number = 42;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write a values dilemma you''re facing, then the choice your values point to — and why.', updated_at = now() WHERE week_number = 43;
UPDATE public.curriculum_weeks SET workbook_activity = 'For one real conflict, write one honest sentence: ''I feel ___, and I need ___.''', updated_at = now() WHERE week_number = 44;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one non-money gift (time / help / encouragement) you''ll give someone by Sunday.', updated_at = now() WHERE week_number = 45;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one specific thing you already have that is genuinely good — and enough.', updated_at = now() WHERE week_number = 46;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one long, unglamorous effort you''ll recommit to, even though the progress is still unseen.', updated_at = now() WHERE week_number = 47;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one tiny act that could brighten someone tomorrow.', updated_at = now() WHERE week_number = 48;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one mark you want to leave in each circle: close people / community / wider world.', updated_at = now() WHERE week_number = 49;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write three specific gratitudes from today — the exact moment, not the general category.', updated_at = now() WHERE week_number = 50;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write the first sentence of your next chapter.', updated_at = now() WHERE week_number = 51;
UPDATE public.curriculum_weeks SET workbook_activity = 'Write one word for your Week-1 self and one for now. Then set one intention for the year ahead.', updated_at = now() WHERE week_number = 52;