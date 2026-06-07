-- =====================================================================
-- 0006_bookings_subscription_link.sql
-- Collega ogni prenotazione all'abbonamento che consuma, per poter
-- scalare/restituire le lezioni automaticamente.
-- =====================================================================

alter table public.bookings
  add column if not exists subscription_id uuid
  references public.subscriptions(id) on delete set null;

create index if not exists bookings_subscription_id_idx
  on public.bookings(subscription_id);
