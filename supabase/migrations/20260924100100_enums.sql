create type public.user_role as enum ('patient', 'doctor', 'admin');

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'checked_in',
  'in_consultation',
  'completed',
  'cancelled',
  'no_show'
);
