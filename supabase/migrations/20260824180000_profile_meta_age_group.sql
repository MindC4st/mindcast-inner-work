-- Read age_group + first_name from raw_user_meta_data when a profile is
-- auto-created, so an invited teen is a teen from the very first database
-- event (no temporary 'adult' state before the invite-teen post-upsert).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, first_name, age_group)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'age_group', ''), 'adult')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$function$;
