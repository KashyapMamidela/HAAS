-- Atomically books a slot: validates it against the doctor's weekly
-- schedule, leave calendar and existing bookings, then inserts. SECURITY
-- DEFINER because it must read doctor_schedules/doctor_leaves/appointments
-- rows that belong to other users (the doctor, other patients) to
-- validate the slot — something the calling patient's own RLS grants
-- would never allow. All schedule times are wall-clock Asia/Kolkata.
create or replace function public.book_appointment(
  p_doctor_id uuid,
  p_start_at timestamptz,
  p_reason text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid := auth.uid();
  v_schedule public.doctor_schedules%rowtype;
  v_weekday smallint;
  v_local_start time;
  v_local_end time;
  v_end_at timestamptz;
  v_appointment public.appointments%rowtype;
begin
  if v_patient_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if public.auth_role() <> 'patient' then
    raise exception 'Only patients can book appointments' using errcode = '42501';
  end if;

  if p_start_at < now() then
    raise exception 'Cannot book a time in the past' using errcode = 'P0001';
  end if;

  v_weekday := extract(dow from (p_start_at at time zone 'Asia/Kolkata'))::smallint;
  v_local_start := (p_start_at at time zone 'Asia/Kolkata')::time;

  select *
  into v_schedule
  from public.doctor_schedules
  where doctor_id = p_doctor_id
    and weekday = v_weekday
    and v_local_start >= start_time
    and v_local_start < end_time
  limit 1;

  if not found then
    raise exception 'Doctor is not available at that time' using errcode = 'P0001';
  end if;

  -- Reject times that don't land on the schedule's slot grid.
  if mod(
    extract(epoch from (v_local_start - v_schedule.start_time))::int,
    v_schedule.slot_minutes * 60
  ) <> 0 then
    raise exception 'Selected time is not a valid slot' using errcode = 'P0001';
  end if;

  v_end_at := p_start_at + make_interval(mins => v_schedule.slot_minutes);
  v_local_end := (v_end_at at time zone 'Asia/Kolkata')::time;

  if v_local_end > v_schedule.end_time then
    raise exception 'Selected time is not a valid slot' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.doctor_leaves
    where doctor_id = p_doctor_id
      and date = (p_start_at at time zone 'Asia/Kolkata')::date
  ) then
    raise exception 'Doctor is on leave that day' using errcode = 'P0001';
  end if;

  begin
    insert into public.appointments (patient_id, doctor_id, start_at, end_at, status, reason)
    values (v_patient_id, p_doctor_id, p_start_at, v_end_at, 'confirmed', p_reason)
    returning * into v_appointment;
  exception
    when exclusion_violation then
      -- Someone else won the race between our overlap pre-check (above,
      -- via the schedule lookup) and this insert; the exclusion
      -- constraint on appointments is the actual atomic guarantee.
      raise exception 'That slot was just taken' using errcode = '23P01';
  end;

  return v_appointment;
end;
$$;

revoke all on function public.book_appointment(uuid, timestamptz, text) from public, anon;
grant execute on function public.book_appointment(uuid, timestamptz, text) to authenticated;

-- Returns free slots for a doctor on a given date, honoring their weekly
-- schedule, leave calendar and existing bookings. SECURITY DEFINER for the
-- same reason as book_appointment: availability depends on every existing
-- booking for that doctor, not just the caller's own appointments, and it
-- only ever returns start/end timestamps — no patient-identifying data.
create or replace function public.get_available_slots(p_doctor_id uuid, p_date date)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_weekday smallint := extract(dow from p_date)::smallint;
  v_schedule public.doctor_schedules%rowtype;
  v_slot_start timestamptz;
  v_slot_end timestamptz;
begin
  if exists (
    select 1 from public.doctor_leaves
    where doctor_id = p_doctor_id and date = p_date
  ) then
    return;
  end if;

  for v_schedule in
    select * from public.doctor_schedules
    where doctor_id = p_doctor_id and weekday = v_weekday
    order by start_time
  loop
    v_slot_start := (p_date + v_schedule.start_time) at time zone 'Asia/Kolkata';

    while (v_slot_start at time zone 'Asia/Kolkata')::time + make_interval(mins => v_schedule.slot_minutes)
      <= v_schedule.end_time
    loop
      v_slot_end := v_slot_start + make_interval(mins => v_schedule.slot_minutes);

      if v_slot_start > now()
        and not exists (
          select 1 from public.appointments a
          where a.doctor_id = p_doctor_id
            and a.status <> 'cancelled'
            and tstzrange(a.start_at, a.end_at) && tstzrange(v_slot_start, v_slot_end)
        )
      then
        slot_start := v_slot_start;
        slot_end := v_slot_end;
        return next;
      end if;

      v_slot_start := v_slot_end;
    end loop;
  end loop;
end;
$$;

revoke all on function public.get_available_slots(uuid, date) from public, anon;
grant execute on function public.get_available_slots(uuid, date) to authenticated;
