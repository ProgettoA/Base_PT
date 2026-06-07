-- =====================================================================
-- 0007_subscriptions_minutes.sql
-- Saldo orario: tracciamo il consumo in MINUTI (non solo in lezioni).
-- 1 lezione = 60 minuti. Backfill dai dati esistenti (lessons_used * 60).
-- =====================================================================

alter table public.subscriptions
  add column if not exists minutes_used integer not null default 0;

update public.subscriptions
  set minutes_used = coalesce(lessons_used, 0) * 60
  where minutes_used = 0 and coalesce(lessons_used, 0) > 0;
