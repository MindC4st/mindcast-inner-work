
-- Grant admin (and ensure facilitator) role to admin@mindcast.co.nz
INSERT INTO public.user_roles (user_id, role)
VALUES ('3f001b14-fbd0-4260-b082-b12715f7a010', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('3f001b14-fbd0-4260-b082-b12715f7a010', 'facilitator'::app_role)
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
