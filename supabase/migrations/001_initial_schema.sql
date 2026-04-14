create extension if not exists pgcrypto;

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes integer not null check (duration_minutes between 30 and 240),
  price integer not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  salon_name text not null,
  address text not null,
  business_hours jsonb not null default '{"open":"10:00","close":"19:00","slotIntervalMinutes":30}'::jsonb,
  regular_holiday jsonb not null default '[]'::jsonb,
  map_url text,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_code text not null unique,
  line_user_id text,
  line_display_name text,
  customer_name text not null,
  menu_id uuid not null references public.menus(id) on delete restrict,
  reservation_date date not null,
  reservation_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'reschedule_requested')),
  note text,
  admin_note text,
  requested_new_date date,
  requested_new_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  blocked_date date not null,
  blocked_time time,
  is_all_day boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  line_user_id text,
  event_type text not null,
  message_text text,
  raw_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reservation_histories (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  event_type text not null,
  previous_status text,
  new_status text,
  memo text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reservations_date_idx on public.reservations (reservation_date, reservation_time);
create index if not exists reservations_status_idx on public.reservations (status);
create index if not exists blocked_slots_date_idx on public.blocked_slots (blocked_date, blocked_time);
create index if not exists message_logs_line_user_idx on public.message_logs (line_user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menus_set_updated_at on public.menus;
create trigger menus_set_updated_at
before update on public.menus
for each row
execute function public.set_updated_at();

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
before update on public.business_settings
for each row
execute function public.set_updated_at();

create or replace function public.create_reservation_with_lock(
  p_reservation_code text,
  p_line_user_id text,
  p_line_display_name text,
  p_customer_name text,
  p_menu_id uuid,
  p_reservation_date date,
  p_reservation_time time,
  p_note text
)
returns setof public.reservations
language plpgsql
as $$
declare
  inserted_row public.reservations;
  target_duration integer;
  business_hours_config jsonb;
  target_start integer;
  target_end integer;
  close_minutes integer;
  blocked_exists boolean;
  conflicting_exists boolean;
begin
  perform pg_advisory_xact_lock(hashtext('reservation:' || p_reservation_date::text));

  select duration_minutes into target_duration
  from public.menus
  where id = p_menu_id
    and is_active = true;

  if target_duration is null then
    raise exception 'Selected menu is inactive or missing';
  end if;

  select coalesce(bs.business_hours, '{"open":"10:00","close":"19:00","slotIntervalMinutes":30}'::jsonb)
    into business_hours_config
  from public.business_settings as bs
  limit 1;

  target_start := extract(hour from p_reservation_time)::integer * 60 + extract(minute from p_reservation_time)::integer;
  target_end := target_start + target_duration;
  close_minutes := split_part(coalesce(business_hours_config ->> 'close', '19:00'), ':', 1)::integer * 60
    + split_part(coalesce(business_hours_config ->> 'close', '19:00'), ':', 2)::integer;

  if target_end > close_minutes then
    raise exception 'Requested time exceeds business hours';
  end if;

  select exists (
    select 1
    from public.blocked_slots
    where blocked_date = p_reservation_date
      and (
        is_all_day = true
        or (
          blocked_time is not null
          and (
            extract(hour from blocked_time)::integer * 60 + extract(minute from blocked_time)::integer
          ) >= target_start
          and (
            extract(hour from blocked_time)::integer * 60 + extract(minute from blocked_time)::integer
          ) < target_end
        )
      )
  ) into blocked_exists;

  if blocked_exists then
    raise exception 'Requested time overlaps with a blocked slot';
  end if;

  select exists (
    select 1
    from public.reservations r
    join public.menus m on m.id = r.menu_id
    where r.reservation_date = p_reservation_date
      and r.status in ('pending', 'confirmed', 'reschedule_requested')
      and target_start < (
        extract(hour from r.reservation_time)::integer * 60
        + extract(minute from r.reservation_time)::integer
        + m.duration_minutes
      )
      and (
        extract(hour from r.reservation_time)::integer * 60
        + extract(minute from r.reservation_time)::integer
      ) < target_end
  ) into conflicting_exists;

  if conflicting_exists then
    raise exception 'Requested time overlaps with another reservation';
  end if;

  insert into public.reservations (
    reservation_code,
    line_user_id,
    line_display_name,
    customer_name,
    menu_id,
    reservation_date,
    reservation_time,
    status,
    note
  )
  values (
    p_reservation_code,
    p_line_user_id,
    p_line_display_name,
    p_customer_name,
    p_menu_id,
    p_reservation_date,
    p_reservation_time,
    'pending',
    p_note
  )
  returning * into inserted_row;

  insert into public.reservation_histories (
    reservation_id,
    event_type,
    previous_status,
    new_status,
    memo,
    payload
  )
  values (
    inserted_row.id,
    'created',
    null,
    'pending',
    p_note,
    jsonb_build_object('reservation_code', inserted_row.reservation_code)
  );

  return next inserted_row;
end;
$$;
