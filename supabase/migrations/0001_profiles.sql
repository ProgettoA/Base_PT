-- =====================================================================
-- 0001_profiles.sql - Profili applicativi, ruoli e RLS
-- =====================================================================

-- 1. Ruoli applicativi (admin = Personal Trainer)
create type public.app_role as enum ('client', 'admin');

-- 2. Tabella profili (1:1 con auth.users)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.app_role not null default 'client',
  name        text,
  surname     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Profilo applicativo collegato a auth.users. role = admin => Personal Trainer.';

-- 3. updated_at automatico
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4. Creazione automatica del profilo alla registrazione
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, surname)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'surname'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Helper: l'utente corrente e admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 6. Anti privilege-escalation: un client NON puo promuoversi admin
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Solo un admin puo modificare il ruolo.';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- 7. Row Level Security
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using ( id = auth.uid() or public.is_admin() );

create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using ( id = auth.uid() or public.is_admin() )
  with check ( id = auth.uid() or public.is_admin() );
