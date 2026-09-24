-- profiles: one row per auth.users row, created by the handle_new_user
-- trigger (see 20260924100300_functions_triggers.sql). id is deliberately
-- the same value as auth.users.id, not a separate surrogate key.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text,
  phone text,
  dob date,
  gender text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  department_id uuid not null references public.departments (id) on delete restrict,
  specialization text,
  qualification text,
  fee numeric(10, 2) not null default 0 check (fee >= 0),
  bio text,
  created_at timestamptz not null default now()
);

create index doctors_department_id_idx on public.doctors (department_id);

-- weekday: 0 = Sunday .. 6 = Saturday (matches Postgres extract(dow from ...)).
-- Schedule times are wall-clock Asia/Kolkata time, not UTC.
create table public.doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 15 check (slot_minutes > 0),
  created_at timestamptz not null default now(),
  constraint doctor_schedules_time_check check (end_time > start_time),
  -- Prevent admin from saving two overlapping blocks for the same doctor/day.
  -- Times are cast to a fixed arbitrary date so tsrange overlap can be used
  -- (Postgres has no native range type for `time`).
  constraint doctor_schedules_no_overlap exclude using gist (
    doctor_id with =,
    weekday with =,
    tsrange(date '2000-01-01' + start_time, date '2000-01-01' + end_time) with &&
  )
);

create index doctor_schedules_doctor_id_idx on public.doctor_schedules (doctor_id);

create table public.doctor_leaves (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (doctor_id, date)
);

create index doctor_leaves_doctor_id_date_idx on public.doctor_leaves (doctor_id, date);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_check check (end_at > start_at),
  -- The double-booking guard: no two non-cancelled appointments for the
  -- same doctor may occupy overlapping time. book_appointment() also
  -- pre-checks this for a friendly error, but this constraint is the real
  -- atomic guarantee under concurrent bookings.
  constraint appointments_no_overlap exclude using gist (
    doctor_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status <> 'cancelled')
);

create index appointments_doctor_id_start_at_idx on public.appointments (doctor_id, start_at);
create index appointments_patient_id_idx on public.appointments (patient_id);
create index appointments_status_idx on public.appointments (status);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments (id) on delete cascade,
  notes text,
  diagnosis text,
  vitals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations (id) on delete cascade,
  medicines jsonb not null default '[]'::jsonb,
  instructions text,
  created_at timestamptz not null default now()
);

create index prescriptions_consultation_id_idx on public.prescriptions (consultation_id);

create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  file_path text not null,
  type text,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index medical_records_patient_id_idx on public.medical_records (patient_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_read_at_idx on public.notifications (user_id, read_at);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
