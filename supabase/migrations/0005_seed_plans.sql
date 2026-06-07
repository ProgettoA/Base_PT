-- =====================================================================
-- 0005_seed_plans.sql - Dati reali dei pacchetti (dal vecchio database)
-- =====================================================================
-- stripe_amount_cents = prezzo in CENTESIMI (price * 100), corretto per Stripe.
-- 7 piani in presenza (online = false), 3 piani online (online = true).

insert into public.plans
  (plan_code, lessons_count, description, price, stripe_amount_cents, online, active)
values
  ('Mens_4',   4,  'Abbonamento Mensile - 4 Lezioni',      200,   20000,  false, true),
  ('Mens_8',   8,  'Abbonamento Mensile - 8 Lezioni',      400,   40000,  false, true),
  ('Trim_12',  12, 'Abbonamento Trimestrale - 12 Lezioni', 570,   57000,  false, true),
  ('Trim_24',  24, 'Abbonamento Trimestrale - 24 Lezioni', 1000,  100000, false, true),
  ('Sem_24',   24, 'Abbonamento Semestrale - 24 Lezioni',  1000,  100000, false, true),
  ('Sem_48',   48, 'Abbonamento Semestrale - 48 Lezioni',  1900,  190000, false, true),
  ('Intens',   72, 'Abbonamento Intensivo',                2400,  240000, false, true),
  ('Onl_Mens', 0,  'Coaching online Mensile',              90,    9000,   true,  true),
  ('Trim_Onl', 0,  'Coaching online Trimestrale',          240,   24000,  true,  true),
  ('Sem_Onl',  0,  'Coaching online Semestrale',           400,   40000,  true,  true);
