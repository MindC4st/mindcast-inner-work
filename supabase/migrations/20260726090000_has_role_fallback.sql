-- Extend has_role() to also recognise the legacy profiles.is_admin flag.
-- Many RLS policies gate on has_role('admin') — but the app-level AuthContext
-- also treats profile.is_admin=true as admin.  Without this matching fallback
-- an admin account that only has the profile flag (no user_roles row) will be
-- blocked by every server-side RLS gate.
--
-- Behaviour:
--   has_role(uid, 'admin' | 'facilitator') now returns true if EITHER
--   a user_roles row exists OR profiles.is_admin is true for that user.
--   Other roles (e.g. 'member') remain unchanged.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
  OR (
    _role IN ('facilitator', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = _user_id AND is_admin = true
    )
  )
$$;
