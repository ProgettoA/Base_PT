-- =====================================================================
-- 0003_availability.sql — Disponibilita del Personal Trainer
-- =====================================================================

-- Enum giorni della settimana (come nel vecchio select PocketBase)
create type public.day_of_week as enum (
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
);

-- ---------------------------------------------------------------------
-- 1. availability — slot per data specifica
-- ---------------------------------------------------------------------
create table public.availability (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  start_time    text not null,
  end_time      text not null,
  is_available  boolean not null default true,
  max_clients   integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index availability_date_idx on public.availability (date);

create trigger availability_set_updated_at
  before update on public.availability
  for each row execute function public.set_updated_at();

alter table public.availability enable row level security;

create policy "availability_select_authenticated"
  on public.availability for select to authenticated
  using ( true );

create policy "availability_write_admin"
  on public.availability for all to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------------------------------------------------------------------
-- 2. weekly_availability — disponibilita ricorrente (lettura pubblica)
-- ---------------------------------------------------------------------
create table public.weekly_availability (
  id            uuid primary key default gen_random_uuid(),
  day_of_week   public.day_of_week not null,
  time_slots    jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger weekly_availability_set_updated_at
  before update on public.weekly_availability
  for each row execute function public.set_updated_at();

alter table public.weekly_availability enable row level security;

-- Lettura pubblica (anche utenti non loggati, sito vetrina)
create policy "weekly_availability_select_public"
  on public.weekly_availability for select to anon, authenticated
  using ( true );

create policy "weekly_availability_write_admin"
  on public.weekly_availability for all to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------------------------------------------------------------------
-- 3. availability_exceptions — chiusure / eccezioni
-- ---------------------------------------------------------------------
create table public.availability_exceptions (
  id              uuid primary key default gen_random_uuid(),
  exception_date  date not null,
  is_closed       boolean not null default false,
  time_slots      jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index availability_exceptions_date_idx
  on public.availability_exceptions (exception_date);

create trigger availability_exceptions_set_updated_at
  before update on public.availability_exceptions
  for each row execute function public.set_updated_at();

alter table public.availability_exceptions enable row level security;

create policy "availability_exceptions_select_authenticated"
  on public.availability_exceptions for select to authenticated
  using ( true );

create policy "availability_exceptions_write_admin"
  on public.availability_exceptions for all to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );
