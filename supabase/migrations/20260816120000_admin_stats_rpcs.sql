-- Staff-only aggregate stats for the admin console Progress + Insights tabs.
-- Server-side aggregation keeps the console off 5k-row client pulls, and the
-- security-definer wrapper enforces the facilitator/admin gate in one place.

create or replace function public.admin_progress_stats()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    or public.has_role(auth.uid(), 'admin'::app_role)
  ) then
    raise exception 'not authorized';
  end if;

  return jsonb_build_object(
    'checkins_by_week', (
      select coalesce(jsonb_agg(r), '[]'::jsonb)
      from (
        select date_trunc('week', checked_in_at)::date as week_start,
               count(*) filter (where coalesce(track, 'Adult') = 'Adult') as "Adult",
               count(*) filter (where track = 'Teen') as "Teen",
               count(*) filter (where track = 'Child') as "Child",
               count(*) as total
        from check_ins
        group by 1
        order by 1 desc
        limit 10
      ) r
    ),
    'track_totals', (
      select jsonb_build_object(
        'Adult', count(*) filter (where coalesce(track, 'Adult') = 'Adult'),
        'Teen',  count(*) filter (where track = 'Teen'),
        'Child', count(*) filter (where track = 'Child')
      )
      from check_ins
    ),
    'completions_by_week', (
      select coalesce(jsonb_agg(r), '[]'::jsonb)
      from (
        select week_number, count(*) as "Lessons"
        from lesson_completions
        group by 1 order by 1 limit 12
      ) r
    ),
    'journals_by_week', (
      select coalesce(jsonb_agg(r), '[]'::jsonb)
      from (
        select week_number, count(*) as "Journals"
        from lesson_journal
        group by 1 order by 1 limit 12
      ) r
    )
  );
end;
$$;

create or replace function public.admin_insights_stats()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    or public.has_role(auth.uid(), 'admin'::app_role)
  ) then
    raise exception 'not authorized';
  end if;

  return jsonb_build_object(
    'status_mix', (
      select coalesce(jsonb_agg(r), '[]'::jsonb)
      from (
        select coalesce(membership_status, 'none') as name, count(*) as value
        from profiles group by 1 order by 2 desc
      ) r
    ),
    'signups_by_month', (
      select coalesce(jsonb_agg(r), '[]'::jsonb)
      from (
        select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
               count(*) as new
        from profiles group by 1 order by 1
      ) r
    ),
    'totals', (
      select jsonb_build_object(
        'profiles',   count(*),
        'active',     count(*) filter (where membership_status in ('active', 'trialing')),
        'kids_addon', count(*) filter (where kids_addon),
        'checkins',   (select count(*) from check_ins)
      )
      from profiles
    )
  );
end;
$$;

revoke execute on function public.admin_progress_stats() from public, anon;
revoke execute on function public.admin_insights_stats() from public, anon;
