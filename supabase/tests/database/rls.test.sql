-- RLS regression tests. Run with:  supabase test db
-- (requires Docker; this spins up a disposable local Postgres, applies all
-- migrations + seed.sql, then runs every file under supabase/tests/).
begin;
create extension if not exists pgtap;

select plan(4);

-- ---------------------------------------------------------------------
-- Fixtures: one appointment for Anita Sharma with Dr. Meera Rao, and one
-- for Rohit Verma with Dr. Arjun Nair — from the accounts seed.sql
-- already creates. Inserted as the postgres superuser, so RLS does not
-- apply to these setup statements.
-- ---------------------------------------------------------------------
do $$
declare
  v_anita_id uuid;
  v_rohit_id uuid;
  v_doc_meera uuid;
  v_doc_arjun uuid;
begin
  select id into v_anita_id from public.profiles where full_name = 'Anita Sharma';
  select id into v_rohit_id from public.profiles where full_name = 'Rohit Verma';
  select d.id into v_doc_meera from public.doctors d
    join public.profiles p on p.id = d.profile_id where p.full_name = 'Dr. Meera Rao';
  select d.id into v_doc_arjun from public.doctors d
    join public.profiles p on p.id = d.profile_id where p.full_name = 'Dr. Arjun Nair';

  insert into public.appointments (patient_id, doctor_id, start_at, end_at, status)
  values (v_anita_id, v_doc_meera, now() + interval '1 day', now() + interval '1 day 20 minutes', 'confirmed');

  insert into public.appointments (patient_id, doctor_id, start_at, end_at, status)
  values (v_rohit_id, v_doc_arjun, now() + interval '2 days', now() + interval '2 days 20 minutes', 'confirmed');
end $$;

-- ---------------------------------------------------------------------
-- Test 1 & 2: a patient cannot read another patient's appointment, but
-- can read their own.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', (select id from public.profiles where full_name = 'Anita Sharma')::text,
    'role', 'authenticated',
    'user_role', 'patient'
  )::text,
  true
);

select is(
  (select count(*)::int from public.appointments
   where patient_id = (select id from public.profiles where full_name = 'Rohit Verma')),
  0,
  'Patient (Anita) cannot read another patient''s (Rohit) appointment'
);

select is(
  (select count(*)::int from public.appointments
   where patient_id = (select id from public.profiles where full_name = 'Anita Sharma')),
  1,
  'Patient (Anita) can read her own appointment'
);

reset role;

-- ---------------------------------------------------------------------
-- Test 3 & 4: a doctor cannot read the profile of a patient they have
-- never had an appointment with, but can read one they have.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', (select p.id from public.profiles p
            join public.doctors d on d.profile_id = p.id
            where p.full_name = 'Dr. Meera Rao')::text,
    'role', 'authenticated',
    'user_role', 'doctor'
  )::text,
  true
);

select is(
  (select count(*)::int from public.profiles where full_name = 'Rohit Verma'),
  0,
  'Doctor (Meera) cannot read another doctor''s (Arjun) patient (Rohit)'
);

select is(
  (select count(*)::int from public.profiles where full_name = 'Anita Sharma'),
  1,
  'Doctor (Meera) can read her own patient (Anita)'
);

reset role;

select * from finish();
rollback;
