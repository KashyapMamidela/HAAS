-- =========================================================================
-- profiles
-- =========================================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_select_by_treating_doctor" on public.profiles
for select using (
  public.auth_role() = 'doctor'
  and exists (
    select 1 from public.appointments a
    where a.patient_id = profiles.id
      and a.doctor_id = public.current_doctor_id()
  )
);

create policy "profiles_admin_all" on public.profiles
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- Lets the custom_access_token_hook (running as supabase_auth_admin) read
-- the role to stamp into the JWT, independent of the grant in the previous
-- migration — some Postgres installs don't give the function owner BYPASSRLS.
create policy "profiles_select_by_auth_admin" on public.profiles
for select to supabase_auth_admin using (true);

-- =========================================================================
-- departments — public reference data
-- =========================================================================
alter table public.departments enable row level security;

create policy "departments_public_read" on public.departments
for select using (true);

create policy "departments_admin_write" on public.departments
for insert with check (public.auth_role() = 'admin');

create policy "departments_admin_update" on public.departments
for update using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

create policy "departments_admin_delete" on public.departments
for delete using (public.auth_role() = 'admin');

-- =========================================================================
-- doctors — readable by any signed-in user (booking flow browses doctors),
-- writable only by admin.
-- =========================================================================
alter table public.doctors enable row level security;

create policy "doctors_read_authenticated" on public.doctors
for select to authenticated using (true);

create policy "doctors_admin_write" on public.doctors
for insert with check (public.auth_role() = 'admin');

create policy "doctors_admin_update" on public.doctors
for update using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

create policy "doctors_admin_delete" on public.doctors
for delete using (public.auth_role() = 'admin');

-- =========================================================================
-- doctor_schedules — readable by any signed-in user (slot picker relies on
-- it indirectly through get_available_slots, and the doctor's own
-- read-only schedule page reads it directly), writable only by admin.
-- =========================================================================
alter table public.doctor_schedules enable row level security;

create policy "doctor_schedules_read_authenticated" on public.doctor_schedules
for select to authenticated using (true);

create policy "doctor_schedules_admin_write" on public.doctor_schedules
for insert with check (public.auth_role() = 'admin');

create policy "doctor_schedules_admin_update" on public.doctor_schedules
for update using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

create policy "doctor_schedules_admin_delete" on public.doctor_schedules
for delete using (public.auth_role() = 'admin');

-- =========================================================================
-- doctor_leaves — a doctor manages their own leave requests; admin manages
-- all. Not publicly readable: availability is only ever exposed through
-- get_available_slots(), which is SECURITY DEFINER.
-- =========================================================================
alter table public.doctor_leaves enable row level security;

create policy "doctor_leaves_select_own" on public.doctor_leaves
for select using (doctor_id = public.current_doctor_id());

create policy "doctor_leaves_insert_own" on public.doctor_leaves
for insert with check (doctor_id = public.current_doctor_id());

create policy "doctor_leaves_delete_own" on public.doctor_leaves
for delete using (doctor_id = public.current_doctor_id());

create policy "doctor_leaves_admin_all" on public.doctor_leaves
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- =========================================================================
-- appointments — the core ownership boundary. Patients and doctors only
-- ever see their own rows; admins see everything.
--
-- Deliberately no insert policy for patients/doctors: creating an
-- appointment always goes through the book_appointment() RPC (SECURITY
-- DEFINER), which re-validates the schedule/leave/overlap rules that a
-- raw client-side insert could otherwise bypass. Likewise there is no
-- generic patient update policy — cancel/reschedule are RPCs added in a
-- later phase for the same reason. Doctors CAN update their own rows
-- directly (status transitions in the consultation queue: check-in ->
-- start -> complete/no-show) since those don't need re-validating against
-- the exclusion constraint.
-- =========================================================================
alter table public.appointments enable row level security;

create policy "appointments_select_own_patient" on public.appointments
for select using (patient_id = auth.uid());

create policy "appointments_select_own_doctor" on public.appointments
for select using (doctor_id = public.current_doctor_id());

create policy "appointments_update_own_doctor" on public.appointments
for update using (doctor_id = public.current_doctor_id())
with check (doctor_id = public.current_doctor_id());

create policy "appointments_admin_all" on public.appointments
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- =========================================================================
-- consultations — doctor manages consultations for their own appointments;
-- the patient can read (never write) their own; admin manages all.
-- =========================================================================
alter table public.consultations enable row level security;

create policy "consultations_doctor_all_own" on public.consultations
for all using (
  exists (
    select 1 from public.appointments a
    where a.id = consultations.appointment_id
      and a.doctor_id = public.current_doctor_id()
  )
) with check (
  exists (
    select 1 from public.appointments a
    where a.id = consultations.appointment_id
      and a.doctor_id = public.current_doctor_id()
  )
);

create policy "consultations_select_own_patient" on public.consultations
for select using (
  exists (
    select 1 from public.appointments a
    where a.id = consultations.appointment_id
      and a.patient_id = auth.uid()
  )
);

create policy "consultations_admin_all" on public.consultations
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- =========================================================================
-- prescriptions — same ownership chain as consultations, one hop further.
-- =========================================================================
alter table public.prescriptions enable row level security;

create policy "prescriptions_doctor_all_own" on public.prescriptions
for all using (
  exists (
    select 1 from public.consultations c
    join public.appointments a on a.id = c.appointment_id
    where c.id = prescriptions.consultation_id
      and a.doctor_id = public.current_doctor_id()
  )
) with check (
  exists (
    select 1 from public.consultations c
    join public.appointments a on a.id = c.appointment_id
    where c.id = prescriptions.consultation_id
      and a.doctor_id = public.current_doctor_id()
  )
);

create policy "prescriptions_select_own_patient" on public.prescriptions
for select using (
  exists (
    select 1 from public.consultations c
    join public.appointments a on a.id = c.appointment_id
    where c.id = prescriptions.consultation_id
      and a.patient_id = auth.uid()
  )
);

create policy "prescriptions_admin_all" on public.prescriptions
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- =========================================================================
-- medical_records — patient owns and manages their own uploads; a doctor
-- can read (never write) records for patients they have an appointment
-- with; admin manages all.
-- =========================================================================
alter table public.medical_records enable row level security;

create policy "medical_records_patient_all_own" on public.medical_records
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

create policy "medical_records_select_by_treating_doctor" on public.medical_records
for select using (
  exists (
    select 1 from public.appointments a
    where a.patient_id = medical_records.patient_id
      and a.doctor_id = public.current_doctor_id()
  )
);

create policy "medical_records_admin_all" on public.medical_records
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- =========================================================================
-- notifications — a user reads their own and can mark their own read;
-- rows are otherwise inserted by trusted server code (service role /
-- SECURITY DEFINER), never directly by clients.
-- =========================================================================
alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications_admin_all" on public.notifications
for all using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- =========================================================================
-- audit_logs — admin-readable only. No direct insert policy for anyone:
-- writes go through log_audit() below, which stamps actor_id from the
-- session itself so it can't be spoofed by the caller.
-- =========================================================================
alter table public.audit_logs enable row level security;

create policy "audit_logs_admin_select" on public.audit_logs
for select using (public.auth_role() = 'admin');

create or replace function public.log_audit(
  p_action text,
  p_entity text,
  p_entity_id uuid default null,
  p_meta jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_meta);
end;
$$;

revoke all on function public.log_audit(text, text, uuid, jsonb) from public, anon;
grant execute on function public.log_audit(text, text, uuid, jsonb) to authenticated;
