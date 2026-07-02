
-- 1. Trigger to block self-writes to privileged profile columns.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role (edge functions / admin scripts) bypasses this guard.
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.nfc_id     IS DISTINCT FROM OLD.nfc_id THEN
    RAISE EXCEPTION 'Cannot modify privileged profile fields (is_admin, is_active, nfc_id).';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_block_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2. word_submissions: was USING(true); scope to authenticated + facilitators.
DROP POLICY IF EXISTS "word_read" ON public.word_submissions;
CREATE POLICY "word_read_authenticated"
  ON public.word_submissions FOR SELECT
  TO authenticated
  USING (true);

REVOKE SELECT ON public.word_submissions FROM anon;
