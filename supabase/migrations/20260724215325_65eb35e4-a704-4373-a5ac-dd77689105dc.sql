
-- Grant admin (and ensure facilitator) role to admin@mindcast.co.nz (resolved by
-- email so the id survives a project restore where auth.users ids differ).
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'admin@mindcast.co.nz'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'facilitator'::app_role FROM auth.users WHERE email = 'admin@mindcast.co.nz'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update signup trigger fn to also auto-grant admin/facilitator for admin@mindcast.co.nz
CREATE OR REPLACE FUNCTION public.assign_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IN ('grantashl1@gmail.com', 'admin@mindcast.co.nz') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'facilitator'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;
