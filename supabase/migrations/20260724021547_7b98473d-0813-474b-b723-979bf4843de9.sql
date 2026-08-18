UPDATE public.workbook_entries w SET profile_id = p.id
  FROM public.profiles p WHERE w.profile_id = p.user_id AND w.profile_id <> p.id;
UPDATE public.teen_workbook_entries t SET profile_id = p.id
  FROM public.profiles p WHERE t.profile_id = p.user_id AND t.profile_id <> p.id;
UPDATE public.kids_workbook_entries k SET profile_id = p.id
  FROM public.profiles p WHERE k.profile_id = p.user_id AND k.profile_id <> p.id;

DROP POLICY IF EXISTS "workbook_own" ON public.workbook_entries;
DROP POLICY IF EXISTS "workbook_facilitator_read" ON public.workbook_entries;
CREATE POLICY "workbook_own" ON public.workbook_entries FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "teen_workbook_own" ON public.teen_workbook_entries;
DROP POLICY IF EXISTS "teen_workbook_facilitator_read" ON public.teen_workbook_entries;
CREATE POLICY "teen_workbook_own" ON public.teen_workbook_entries FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());
DROP POLICY IF EXISTS "teen_workbook_guardian_read" ON public.teen_workbook_entries;
CREATE POLICY "teen_workbook_guardian_read" ON public.teen_workbook_entries FOR SELECT
  USING (public.is_guardian_of_profile(profile_id));

DROP POLICY IF EXISTS "kids_workbook_own" ON public.kids_workbook_entries;
DROP POLICY IF EXISTS "kids_workbook_facilitator_read" ON public.kids_workbook_entries;
CREATE POLICY "kids_workbook_own" ON public.kids_workbook_entries FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());
DROP POLICY IF EXISTS "kids_workbook_guardian_read" ON public.kids_workbook_entries;
CREATE POLICY "kids_workbook_guardian_read" ON public.kids_workbook_entries FOR SELECT
  USING (public.is_guardian_of_profile(profile_id));

DROP POLICY IF EXISTS "Facilitators can view all entries"            ON public.entries;
DROP POLICY IF EXISTS "Facilitators can view all scores"             ON public.domain_scores;
DROP POLICY IF EXISTS "Facilitators can view all commitments"        ON public.commitments;
DROP POLICY IF EXISTS "Facilitators can view all bookmark responses" ON public.bookmark_responses;
DROP POLICY IF EXISTS "Facilitators can view all checkins"           ON public.implementation_checkins;
