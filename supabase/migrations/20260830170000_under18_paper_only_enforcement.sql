-- Child and teen worksheets are paper-only. Extend the existing teen
-- read-only trigger to every legacy workbook and community-submission table
-- so a teen login cannot create digital reflections by calling the API
-- directly. NFC attendance is still recorded by the trusted check-in edge
-- function using service_role.

CREATE OR REPLACE FUNCTION public.prevent_teen_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND lower(COALESCE(p.age_group, '')) IN ('teen', 'child', 'kids', 'little_ones')
  ) THEN
    RAISE EXCEPTION 'Under-18 accounts are read-only and cannot submit.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.workbook_entries;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.workbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.teen_workbook_entries;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.teen_workbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.kids_workbook_entries;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.kids_workbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.story_submissions;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.story_submissions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.word_submissions;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.word_submissions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();
