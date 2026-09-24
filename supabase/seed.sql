-- =========================================================================
-- Local/dev seed data — 4 departments, 6 doctors with weekly schedules,
-- 3 patients and 1 admin. NOT for production use.
--
-- Every seeded account signs in with the password: password123
-- =========================================================================

do $$
declare
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  v_password text := crypt('password123', gen_salt('bf'));

  v_dept_cardiology uuid;
  v_dept_dermatology uuid;
  v_dept_pediatrics uuid;
  v_dept_orthopedics uuid;

  v_users jsonb := '[
    {"email":"admin@haas.dev","full_name":"Priya Nair","role":"admin","phone":"+91 90000 00001"},
    {"email":"meera.rao@haas.dev","full_name":"Dr. Meera Rao","role":"doctor","phone":"+91 90000 00002"},
    {"email":"arjun.nair@haas.dev","full_name":"Dr. Arjun Nair","role":"doctor","phone":"+91 90000 00003"},
    {"email":"kavita.iyer@haas.dev","full_name":"Dr. Kavita Iyer","role":"doctor","phone":"+91 90000 00004"},
    {"email":"sanjay.gupta@haas.dev","full_name":"Dr. Sanjay Gupta","role":"doctor","phone":"+91 90000 00005"},
    {"email":"neha.kulkarni@haas.dev","full_name":"Dr. Neha Kulkarni","role":"doctor","phone":"+91 90000 00006"},
    {"email":"vikram.desai@haas.dev","full_name":"Dr. Vikram Desai","role":"doctor","phone":"+91 90000 00007"},
    {"email":"anita.sharma@example.com","full_name":"Anita Sharma","role":"patient","phone":"+91 98000 00001"},
    {"email":"rohit.verma@example.com","full_name":"Rohit Verma","role":"patient","phone":"+91 98000 00002"},
    {"email":"fatima.sheikh@example.com","full_name":"Fatima Sheikh","role":"patient","phone":"+91 98000 00003"}
  ]'::jsonb;

  v_user jsonb;
  v_user_id uuid;

  v_meera_id uuid;
  v_arjun_id uuid;
  v_kavita_id uuid;
  v_sanjay_id uuid;
  v_neha_id uuid;
  v_vikram_id uuid;

  v_doc_meera uuid;
  v_doc_arjun uuid;
  v_doc_kavita uuid;
  v_doc_sanjay uuid;
  v_doc_neha uuid;
  v_doc_vikram uuid;
begin
  -- Departments -----------------------------------------------------------
  insert into public.departments (name, description, icon) values
    ('Cardiology', 'Heart health, checkups and long-term care.', 'heart'),
    ('Dermatology', 'Skin, hair and nail conditions.', 'sparkles'),
    ('Pediatrics', 'Care for infants, children and teens.', 'person-standing'),
    ('Orthopedics', 'Bones, joints and muscle injuries.', 'bone');

  select id into v_dept_cardiology from public.departments where name = 'Cardiology';
  select id into v_dept_dermatology from public.departments where name = 'Dermatology';
  select id into v_dept_pediatrics from public.departments where name = 'Pediatrics';
  select id into v_dept_orthopedics from public.departments where name = 'Orthopedics';

  -- Auth users --------------------------------------------------------------
  -- Inserting into auth.users directly (rather than through the Auth API)
  -- is the standard way to seed local Supabase dev data. The
  -- on_auth_user_created trigger fires for each row and creates the
  -- matching profiles row with role='patient'; we promote admin/doctor
  -- roles explicitly afterwards, the same way the real admin "invite
  -- doctor" flow will.
  for v_user in select * from jsonb_array_elements(v_users)
  loop
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      v_instance_id, v_user_id, 'authenticated', 'authenticated',
      v_user ->> 'email', v_password, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_user ->> 'full_name'),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_user ->> 'email'),
      'email', now(), now(), now()
    );

    update public.profiles
    set role = (v_user ->> 'role')::public.user_role,
        full_name = v_user ->> 'full_name',
        phone = v_user ->> 'phone'
    where id = v_user_id;

    case v_user ->> 'email'
      when 'meera.rao@haas.dev' then v_meera_id := v_user_id;
      when 'arjun.nair@haas.dev' then v_arjun_id := v_user_id;
      when 'kavita.iyer@haas.dev' then v_kavita_id := v_user_id;
      when 'sanjay.gupta@haas.dev' then v_sanjay_id := v_user_id;
      when 'neha.kulkarni@haas.dev' then v_neha_id := v_user_id;
      when 'vikram.desai@haas.dev' then v_vikram_id := v_user_id;
      else null;
    end case;
  end loop;

  -- Doctors -------------------------------------------------------------
  insert into public.doctors (profile_id, department_id, specialization, qualification, fee, bio)
  values (v_meera_id, v_dept_cardiology, 'Cardiologist', 'MD (Cardiology)', 800, 'General and preventive cardiology.')
  returning id into v_doc_meera;

  insert into public.doctors (profile_id, department_id, specialization, qualification, fee, bio)
  values (v_arjun_id, v_dept_cardiology, 'Interventional Cardiologist', 'DM (Cardiology)', 1200, 'Angioplasty and complex cardiac procedures.')
  returning id into v_doc_arjun;

  insert into public.doctors (profile_id, department_id, specialization, qualification, fee, bio)
  values (v_kavita_id, v_dept_dermatology, 'Dermatologist', 'MD (Dermatology)', 600, 'Skin, hair and cosmetic dermatology.')
  returning id into v_doc_kavita;

  insert into public.doctors (profile_id, department_id, specialization, qualification, fee, bio)
  values (v_sanjay_id, v_dept_pediatrics, 'Pediatrician', 'MD (Pediatrics)', 500, 'General pediatric care and vaccinations.')
  returning id into v_doc_sanjay;

  insert into public.doctors (profile_id, department_id, specialization, qualification, fee, bio)
  values (v_neha_id, v_dept_pediatrics, 'Neonatologist', 'DM (Neonatology)', 900, 'Newborn and infant intensive care.')
  returning id into v_doc_neha;

  insert into public.doctors (profile_id, department_id, specialization, qualification, fee, bio)
  values (v_vikram_id, v_dept_orthopedics, 'Orthopedic Surgeon', 'MS (Orthopedics)', 1000, 'Joint replacement and sports injuries.')
  returning id into v_doc_vikram;

  -- Schedules: Monday-Friday, a morning and an afternoon block each ------
  insert into public.doctor_schedules (doctor_id, weekday, start_time, end_time, slot_minutes)
  select doctors.doc_id, weekdays.weekday, blocks.start_time, blocks.end_time, doctors.slot_minutes
  from (values
    (v_doc_meera, 20), (v_doc_arjun, 20), (v_doc_kavita, 15),
    (v_doc_sanjay, 15), (v_doc_neha, 20), (v_doc_vikram, 30)
  ) as doctors(doc_id, slot_minutes)
  cross join (values (1), (2), (3), (4), (5)) as weekdays(weekday)
  cross join (values (time '09:00', time '13:00'), (time '14:00', time '17:00')) as blocks(start_time, end_time);

  -- One upcoming leave day, to exercise that code path -------------------
  insert into public.doctor_leaves (doctor_id, date, reason)
  values (v_doc_meera, (current_date + interval '10 days')::date, 'Conference');
end $$;
