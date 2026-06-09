-- Telefono cliente + anagrafica admin

-- 1) campo telefono sui profili
alter table public.profiles add column if not exists phone text;

-- 2) la creazione profilo salva anche il telefono dai metadata di signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.profiles (id, name, surname, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'surname',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$function$;

-- 3) anagrafica clienti (email da auth.users + telefono), solo per admin
create or replace function public.admin_clients()
returns table (
  id uuid, name text, surname text, phone text, email text, created_at timestamptz,
  plan_description text, plan_price numeric, is_recurring boolean, sub_status text, renew_date date
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if not public.is_admin() then
    raise exception 'Accesso negato';
  end if;
  return query
    select p.id, p.name, p.surname, p.phone, u.email::text, p.created_at,
           pl.description, pl.price,
           (s.stripe_subscription_id like 'sub_%') as is_recurring,
           s.status::text, s.end_date
    from public.profiles p
    join auth.users u on u.id = p.id
    left join lateral (
      select sub.* from public.subscriptions sub
      where sub.user_id = p.id
      order by sub.created_at desc
      limit 1
    ) s on true
    left join public.plans pl on pl.id = s.plan_id
    where p.role = 'client'
    order by p.created_at desc;
end;
$function$;

revoke all on function public.admin_clients() from anon;
grant execute on function public.admin_clients() to authenticated;
