-- Keep the founder/admin account staffed even if the auth user is recreated
-- from the Supabase dashboard after the one-off grant migration already ran.
-- Idempotent: also grants immediately for the current row.

create or replace function public.grant_admin_by_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'admin@mindcast.co.nz' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin'::app_role)
      on conflict (user_id, role) do nothing;
    insert into public.user_roles (user_id, role) values (new.id, 'facilitator'::app_role)
      on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists grant_admin_by_email_on_signup on auth.users;
create trigger grant_admin_by_email_on_signup
  after insert on auth.users
  for each row execute function public.grant_admin_by_email();

insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users where email = 'admin@mindcast.co.nz'
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'facilitator'::app_role from auth.users where email = 'admin@mindcast.co.nz'
on conflict (user_id, role) do nothing;
