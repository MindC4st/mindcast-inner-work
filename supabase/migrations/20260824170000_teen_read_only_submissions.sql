-- Server-side teen read-only guarantee. A teen account (age_group = 'teen')
-- may READ the curriculum but may not submit anything. A trigger blocks
-- INSERT/UPDATE on every submission surface for a teen's own auth.uid(),
-- while service_role (door kiosk, staff actions) is unaffected.

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
      AND lower(COALESCE(p.age_group, '')) = 'teen'
  ) THEN
    RAISE EXCEPTION 'Teen accounts are read-only and cannot submit.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.lesson_journal;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.lesson_journal
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.check_ins;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.session_responses;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT ON public.session_responses
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.bookmark_responses;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.bookmark_responses
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.commitments;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.commitments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();

DROP TRIGGER IF EXISTS trg_prevent_teen_submission ON public.implementation_checkins;
CREATE TRIGGER trg_prevent_teen_submission
  BEFORE INSERT OR UPDATE ON public.implementation_checkins
  FOR EACH ROW EXECUTE FUNCTION public.prevent_teen_submission();
