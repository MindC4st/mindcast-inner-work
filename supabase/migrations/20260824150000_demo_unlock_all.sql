-- Demo unlock-all override. When app_settings.demo_unlock_all = 'true',
-- every week is open regardless of the 9:30am program schedule. Used for the
-- pre-launch demo so a household can preview the full 52-week journey.

INSERT INTO public.app_settings (key, value) VALUES ('demo_unlock_all', 'true')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.lesson_unlocked(week_number int)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE start_txt text; tz text; start_date date; unlock_at timestamptz; demo boolean;
BEGIN
  IF week_number IS NULL OR week_number < 1 THEN RETURN false; END IF;
  SELECT value = 'true' INTO demo FROM public.app_settings WHERE key = 'demo_unlock_all';
  IF demo THEN RETURN true; END IF;
  SELECT value INTO start_txt FROM public.app_settings WHERE key = 'program_start_date';
  IF start_txt IS NULL OR start_txt = '' THEN RETURN false; END IF;
  SELECT COALESCE(value, 'Pacific/Auckland') INTO tz FROM public.app_settings WHERE key = 'program_timezone';
  start_date := start_txt::date;
  unlock_at := ((start_date + ((week_number - 1) * 7))::timestamp + interval '9 hours 30 minutes')
               AT TIME ZONE COALESCE(tz, 'Pacific/Auckland');
  RETURN now() >= unlock_at;
END;
$$;
GRANT EXECUTE ON FUNCTION public.lesson_unlocked(int) TO anon, authenticated;
