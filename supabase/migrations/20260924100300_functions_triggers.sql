-- Creates a profiles row (role defaults to 'patient') whenever a new
-- auth.users row appears — self-signup, admin-invited doctor, or seed.sql.
-- Doctor/admin accounts get their role promoted afterwards (see seed.sql /
-- the admin "invite doctor" server action), never at signup time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.consultations
for each row execute function public.set_updated_at();

-- Reads the user_role claim the Custom Access Token Hook copies into the
-- JWT. Falls back to 'patient' when the claim is missing (e.g. no session),
-- which is safe because every RLS policy also requires row ownership —
-- an unauthenticated/anon caller still matches zero rows.
create or replace function public.auth_role()
returns public.user_role
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', 'patient')::public.user_role
$$;

-- Maps the signed-in doctor's profile id to their doctors.id, used
-- throughout the RLS policies and RPCs below.
create or replace function public.current_doctor_id()
returns uuid
language sql
stable
as $$
  select id from public.doctors where profile_id = auth.uid()
$$;

-- Supabase Auth Custom Access Token Hook: copies profiles.role into the
-- JWT as `user_role` on every token issue/refresh. This is wired up in
-- supabase/config.toml for local dev; on a hosted project it must also be
-- enabled from the dashboard (Authentication -> Hooks -> Customize Access
-- Token) pointing at public.custom_access_token_hook.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  v_role public.user_role;
begin
  select role into v_role from public.profiles where id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(v_role, 'patient'::public.user_role)));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Only the auth service may invoke the hook; belt-and-braces alongside the
-- SECURITY DEFINER + RLS policy in 20260924100400_rls.sql, since not every
-- Postgres install grants the function owner BYPASSRLS.
grant usage on schema public to supabase_auth_admin;
grant select on public.profiles to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
