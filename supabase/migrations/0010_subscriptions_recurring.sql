-- 0010: supporto abbonamenti ricorrenti
-- cancel_at_period_end: il cliente ha annullato il rinnovo (resta attivo fino a end_date)
-- stripe_customer_id: cliente Stripe collegato (per webhook e gestione)
alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists stripe_customer_id text;

-- Univoco: evita doppioni quando webhook + success page registrano lo stesso abbonamento
create unique index if not exists subscriptions_stripe_sub_uniq
  on public.subscriptions (stripe_subscription_id);
