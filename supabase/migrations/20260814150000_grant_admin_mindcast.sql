-- Grant admin + facilitator to admin@mindcast.co.nz (resolved by email).
--
-- The profiles.is_admin flag is protected by prevent_profile_privilege_escalation
-- (service_role only), so roles are granted via user_roles — which is what both
-- the app AuthContext and the has_role() RLS helper check.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'admin@mindcast.co.nz'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'facilitator'::app_role FROM auth.users WHERE email = 'admin@mindcast.co.nz'
ON CONFLICT (user_id, role) DO NOTHING;
