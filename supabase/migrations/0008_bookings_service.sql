-- =====================================================================
-- 0008_bookings_service.sql
-- Distingui prenotazioni PT da prenotazioni Osteopata.
-- Default 'pt' = tutte le prenotazioni esistenti restano sul PT.
-- =====================================================================

alter table public.bookings
  add column if not exists service text not null default 'pt';

alter table public.bookings
  drop constraint if exists bookings_service_check;

alter table public.bookings
  add constraint bookings_service_check check (service in ('pt', 'osteopath'));

create index if not exists bookings_service_idx on public.bookings(service);
