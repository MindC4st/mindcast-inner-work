-- Phase 0 (member-safety-critical) — make journals private to their owner.
--
-- Two problems fixed here:
--
--  1. STAFF COULD READ EVERY JOURNAL. Every private table carried a
--     "Facilitators can view all ..." SELECT policy. That contradicts the
--     product promise ("journals unreadable by anyone but the member") and is
--     especially unacceptable for children's reflections. We DROP all of them.
--     Journals are now readable ONLY by their owner (and, for a child/teen, a
--     linked guardian — product decision 2026-07-11). Admins and facilitators
--     get NO journal read; reporting must use non-content aggregates.
--
--  2. BROKEN OWNER KEY on the workbook tables. Policies compared
--     `profile_id = auth.uid()`, but `profile_id` is a FK to profiles.id — a
--     separate random UUID — while the app wrote auth.uid() into it. The policy
--     and the FK could not both hold. We backfill any mis-keyed rows to the
--     real profiles.id and switch RLS to `profile_id = current_profile_id()`.
--     (The app is updated in the same PR to write profiles.id.)

-- ===========================================================================
-- 1. Backfill workbook tables: remap profile_id that was stored as the auth
--    user id (auth.uid()) to the correct profiles.id.
-- ===========================================================================
UPDATE public.workbook_entries w
  SET profile_id = p.id
  FROM public.profiles p
  WHERE w.profile_id = p.user_id AND w.profile_id <> p.id;

UPDATE public.teen_workbook_entries t
  SET profile_id = p.id
  FROM public.profiles p
  WHERE t.profile_id = p.user_id AND t.profile_id <> p.id;

UPDATE public.kids_workbook_entries k
  SET profile_id = p.id
  FROM public.profiles p
  WHERE k.profile_id = p.user_id AND k.profile_id <> p.id;

-- ===========================================================================
-- 2. workbook_entries (adult) — owner-only, no staff read.
-- ===========================================================================
DROP POLICY IF EXISTS "workbook_own" ON public.workbook_entries;
DROP POLICY IF EXISTS "workbook_facilitator_read" ON public.workbook_entries;

CREATE POLICY "workbook_own" ON public.workbook_entries
  FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());

-- ===========================================================================
-- 3. teen_workbook_entries — owner + linked guardian read.
-- ===========================================================================
DROP POLICY IF EXISTS "teen_workbook_own" ON public.teen_workbook_entries;
DROP POLICY IF EXISTS "teen_workbook_facilitator_read" ON public.teen_workbook_entries;

CREATE POLICY "teen_workbook_own" ON public.teen_workbook_entries
  FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "teen_workbook_guardian_read" ON public.teen_workbook_entries
  FOR SELECT
  USING (public.is_guardian_of_profile(profile_id));

-- ===========================================================================
-- 4. kids_workbook_entries — owner + linked guardian read.
-- ===========================================================================
DROP POLICY IF EXISTS "kids_workbook_own" ON public.kids_workbook_entries;
DROP POLICY IF EXISTS "kids_workbook_facilitator_read" ON public.kids_workbook_entries;

CREATE POLICY "kids_workbook_own" ON public.kids_workbook_entries
  FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "kids_workbook_guardian_read" ON public.kids_workbook_entries
  FOR SELECT
  USING (public.is_guardian_of_profile(profile_id));

-- ===========================================================================
-- 5. Legacy journal tables keyed on user_id = auth.uid(): the owner policies
--    are already correct. Only remove the blanket facilitator read. The opt-in
--    "cohort members can view SHARED/group entries" policies stay — those are
--    member-controlled sharing (is_shared), not staff access.
-- ===========================================================================
DROP POLICY IF EXISTS "Facilitators can view all entries"            ON public.entries;
DROP POLICY IF EXISTS "Facilitators can view all scores"             ON public.domain_scores;
DROP POLICY IF EXISTS "Facilitators can view all commitments"        ON public.commitments;
DROP POLICY IF EXISTS "Facilitators can view all bookmark responses" ON public.bookmark_responses;
DROP POLICY IF EXISTS "Facilitators can view all checkins"           ON public.implementation_checkins;
