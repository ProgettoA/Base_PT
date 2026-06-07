-- =====================================================================
-- 0009_admin_roles_per_service.sql (VERSIONE CORRETTA)
-- Tre tipi di admin (admin_pt, admin_osteopath, superadmin) e orari
-- scopati per servizio. Idempotente: si puo rilanciare senza errori.
-- =====================================================================

-- ====== PART A: enum -> text (solo se ancora enum) ======
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and udt_name = 'app_role'
  ) then
    alter table public.profiles alter column role type text using role::text;
    alter table public.profiles alter column role set default 'client';
  end if;
end $$;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('client','admin','admin_pt','admin_osteopath','superadmin'));

-- ====== PART A.bis: migra 'admin' a 'superadmin' ======
-- Disabilito temporaneamente i trigger sulla tabella profiles per evitare
-- che prevent_role_self_escalation blocchi l'update di migrazione
-- (auth.uid() e' null nel contesto SQL Editor).
alter table public.profiles disable trigger user;

update public.profiles
   set role = 'superadmin'
 where role = 'admin';

alter table public.profiles enable trigger user;

-- ====== PART B: helper functions ======
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin','admin_pt','admin_osteopath','superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin');
$$;

create or replace function public.is_pt_admin()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin_pt','superadmin')
  );
$$;

create or replace function public.is_osteo_admin()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin_osteopath','superadmin')
  );
$$;

-- ====== PART C: colonna service su weekly_availability e availability_exceptions ======
alter table public.weekly_availability
  add column if not exists service text not null default 'pt';
alter table public.weekly_availability
  drop constraint if exists weekly_availability_service_check;
alter table public.weekly_availability
  add constraint weekly_availability_service_check check (service in ('pt','osteopath'));
create index if not exists weekly_availability_service_idx on public.weekly_availability(service);

alter table public.availability_exceptions
  add column if not exists service text not null default 'pt';
alter table public.availability_exceptions
  drop constraint if exists availability_exceptions_service_check;
alter table public.availability_exceptions
  add constraint availability_exceptions_service_check check (service in ('pt','osteopath'));
create index if not exists availability_exceptions_service_idx on public.availability_exceptions(service);

-- Duplica le righe come 'osteopath' SOLO se non esistono gia (idempotente).
do $$
begin
  if not exists (select 1 from public.weekly_availability where service = 'osteopath') then
    insert into public.weekly_availability (day_of_week, time_slots, service)
    select day_of_week, time_slots, 'osteopath'
    from public.weekly_availability where service = 'pt';
  end if;

  if not exists (select 1 from public.availability_exceptions where service = 'osteopath') then
    insert into public.availability_exceptions (exception_date, is_closed, time_slots, service)
    select exception_date, is_closed, time_slots, 'osteopath'
    from public.availability_exceptions where service = 'pt';
  end if;
end $$;

-- ====== PART D: RLS policies di scrittura, scopate per servizio ======
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='weekly_availability'
      and cmd in ('INSERT','UPDATE','DELETE','ALL')
  loop
    execute format('drop policy %I on public.weekly_availability', pol.policyname);
  end loop;
end $$;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='availability_exceptions'
      and cmd in ('INSERT','UPDATE','DELETE','ALL')
  loop
    execute format('drop policy %I on public.availability_exceptions', pol.policyname);
  end loop;
end $$;

create policy "weekly_availability_admin_insert"
  on public.weekly_availability for insert to authenticated
  with check (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  );

create policy "weekly_availability_admin_update"
  on public.weekly_availability for update to authenticated
  using (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  )
  with check (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  );

create policy "weekly_availability_admin_delete"
  on public.weekly_availability for delete to authenticated
  using (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  );

create policy "availability_exceptions_admin_insert"
  on public.availability_exceptions for insert to authenticated
  with check (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  );

create policy "availability_exceptions_admin_update"
  on public.availability_exceptions for update to authenticated
  using (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  )
  with check (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  );

create policy "availability_exceptions_admin_delete"
  on public.availability_exceptions for delete to authenticated
  using (
    (service = 'pt' and public.is_pt_admin()) or
    (service = 'osteopath' and public.is_osteo_admin())
  );
