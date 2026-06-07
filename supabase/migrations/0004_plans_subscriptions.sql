-- =====================================================================
-- 0004_plans_subscriptions.sql — Pacchetti lezioni e abbonamenti
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. plans — pacchetti / piani acquistabili (lettura pubblica)
-- ---------------------------------------------------------------------
-- Mapping dal vecchio PocketBase:
--   Codice_piano  -> plan_code
--   Numero_lezioni-> lessons_count
--   Descrizione   -> description
--   Prezzo        -> price               (EUR, valore da mostrare)
--   Prezzo_Stripe -> stripe_amount_cents (centesimi inviati a Stripe come unit_amount)
--   Online        -> online
--   Attivo        -> active
create table public.plans (
  id                   uuid primary key default gen_random_uuid(),
  plan_code            text not null,
  lessons_count        integer,
  description          text not null,
  price                numeric(10,2) not null,
  stripe_amount_cents  integer not null,
  online               boolean not null default false,
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on column public.plans.price is 'Prezzo in EUR da mostrare in UI (es. 29.99)';
comment on column public.plans.stripe_amount_cents is 'Importo in centesimi per Stripe unit_amount (es. 2999)';

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

alter table public.plans enable row level security;

-- Lettura pubblica: la pagina prezzi è visibile anche senza login
create policy "plans_select_public"
  on public.plans for select to anon, authenticated
  using ( true );

create policy "plans_write_admin"
  on public.plans for all to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------------------------------------------------------------------
-- 2. subscriptions — abbonamenti / acquisti degli utenti
-- ---------------------------------------------------------------------
create type public.subscription_status as enum ('active', 'cancelled', 'expired');

create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles (id) on delete cascade,
  plan_id                 uuid not null references public.plans (id)    on delete restrict,
  stripe_subscription_id  text,
  status                  public.subscription_status not null default 'active',
  start_date              date not null default current_date,
  end_date                date,
  payment_date            date,
  lessons_used            integer not null default 0 check (lessons_used >= 0),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Lettura: il proprio abbonamento, o tutti se admin
create policy "subscriptions_select_own_or_admin"
  on public.subscriptions for select to authenticated
  using ( user_id = auth.uid() or public.is_admin() );

-- Creazione: un cliente solo per sé, admin per chiunque.
-- (In produzione la crea il webhook Stripe via service_role, che bypassa l'RLS.)
create policy "subscriptions_insert_self_or_admin"
  on public.subscriptions for insert to authenticated
  with check ( user_id = auth.uid() or public.is_admin() );

-- Modifica: proprietario o admin
create policy "subscriptions_update_own_or_admin"
  on public.subscriptions for update to authenticated
  using ( user_id = auth.uid() or public.is_admin() )
  with check ( user_id = auth.uid() or public.is_admin() );

-- Cancellazione: solo admin
create policy "subscriptions_delete_admin"
  on public.subscriptions for delete to authenticated
  using ( public.is_admin() );
