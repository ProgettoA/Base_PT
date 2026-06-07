-- =====================================================================
-- 0002_bookings.sql - Prenotazioni
-- =====================================================================

create table public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references public.profiles (id) on delete cascade,
  trainer_name       text,
  date               date not null,
  time               text not null,            -- formato "HH:MM"
  duration           integer,                  -- minuti
  notes              text,
  number_of_clients  integer not null default 1,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.bookings is 'Prenotazioni delle sessioni. client_id => profiles.id.';

create index bookings_date_idx      on public.bookings (date);
create index bookings_client_id_idx on public.bookings (client_id);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

create policy "bookings_select_authenticated"
  on public.bookings for select to authenticated
  using ( true );

create policy "bookings_insert_self_or_admin"
  on public.bookings for insert to authenticated
  with check ( client_id = auth.uid() or public.is_admin() );

create policy "bookings_update_own_or_admin"
  on public.bookings for update to authenticated
  using ( client_id = auth.uid() or public.is_admin() )
  with check ( client_id = auth.uid() or public.is_admin() );

create policy "bookings_delete_own_or_admin"
  on public.bookings for delete to authenticated
  using ( client_id = auth.uid() or public.is_admin() );
