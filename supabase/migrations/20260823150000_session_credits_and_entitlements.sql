-- MC-MEM-106 v2.1: Session credits, free trials, attendance
-- Prepaid session credits: visitor cards and one-offs.
create table if not exists public.session_credits (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  attendee_id uuid references public.attendees(id),   -- null = household pool
  kind text not null check (kind in ('visitor_card','one_off','free_trial')),
  track text not null check (track in ('adult','youth')),
  trips_total int not null,
  trips_used int not null default 0,
  purchased_at timestamptz not null default now(),
  phase int,                                          -- for the per-phase cap
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  constraint trips_sane check (trips_used >= 0 and trips_used <= trips_total)
);

-- Index for fast lookups during check-in
create index if not exists session_credits_household_track
  on public.session_credits (household_id, track, kind)
  where trips_used < trips_total;

-- One free trial per person, for life. Not per household, not per cohort.
create table if not exists public.free_trials (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null unique references public.attendees(id),
  used_at timestamptz,
  session_date date,
  created_at timestamptz not null default now()
);

-- Attendance, with what paid for it.
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.attendees(id),
  session_date date not null,
  week int not null,
  track text not null,
  entitlement text not null check (entitlement in
    ('membership','visitor_card','one_off','free_trial','concession','comp')),
  session_credit_id uuid references public.session_credits(id),
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (attendee_id, session_date)
);

-- Index for attendance lookups
create index if not exists attendance_attendee_date
  on public.attendance (attendee_id, session_date);

-- RLS: attendees can read their own attendance
alter table public.attendance enable row level security;
drop policy if exists "attendance_self_read" on public.attendance;
create policy "attendance_self_read" on public.attendance
  for select using (attendee_id in (
    select id from public.attendees where profile_id = auth.uid()
  ));
drop policy if exists "attendance_staff_write" on public.attendance;
create policy "attendance_staff_write" on public.attendance
  for insert with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('facilitator','admin')
    )
  );

-- RLS: session_credits - household members can read their pool
alter table public.session_credits enable row level security;
drop policy if exists "session_credits_household_read" on public.session_credits;
create policy "session_credits_household_read" on public.session_credits
  for select using (household_id in (
    select household_id from public.attendees where profile_id = auth.uid()
  ));

-- RLS: free_trials - attendee can read their own
alter table public.free_trials enable row level security;
drop policy if exists "free_trials_self_read" on public.free_trials;
create policy "free_trials_self_read" on public.free_trials
  for select using (attendee_id in (
    select id from public.attendees where profile_id = auth.uid()
  ));

-- Grant execute on resolver to authenticated (used by check-in). The resolver
-- lands in a later migration; grant only once it exists.
DO $$
begin
  if exists (select 1 from pg_proc where proname = 'resolve_entitlement') then
    grant execute on function public.resolve_entitlement to authenticated;
  end if;
end $$;

-- Concession flag on households
alter table public.households
  add column if not exists concession_granted boolean not null default false;

-- Trigger to record attendance when a credit is consumed
create or replace function public.record_attendance_on_credit()
returns trigger language plpgsql as $$
declare
  v_attendee uuid;
  v_track text;
  v_session_date date;
  v_week int;
begin
  -- Only fire when a trip is actually consumed
  if old.trips_used < new.trips_used then
    -- Resolve attendee (specific or pool)
    if new.attendee_id is not null then
      v_attendee := new.attendee_id;
    else
      select id into v_attendee
      from public.attendees
      where household_id = new.household_id
        and track = new.track
        and profile_id is not null
      limit 1;
      if v_attendee is null then
        raise exception 'No eligible attendee found for pooled credit';
      end if;
    end if;

    v_track := new.track;
    v_session_date := current_date;
    -- Week number = ceil((session_date - program_start) / 7)
    select ceil(extract(day from (current_date - app_settings.value::date)) / 7.0)::int
    into v_week
    from public.app_settings where key = 'program_start_date';

    insert into public.attendance (
      attendee_id, session_date, week, track, entitlement, session_credit_id
    ) values (
      v_attendee, v_session_date, v_week, v_track, new.kind, new.id
    ) on conflict (attendee_id, session_date) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists record_attendance_on_credit_consumed on public.session_credits;
create trigger record_attendance_on_credit_consumed
  after update of trips_used on public.session_credits
  for each row execute function public.record_attendance_on_credit();