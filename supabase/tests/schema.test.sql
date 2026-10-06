begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(8);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'garages', 'garages table exists');
select col_is_pk('public', 'profiles', 'id', 'profiles use UUID ownership IDs');
select col_is_pk('public', 'garages', 'id', 'garages use UUID IDs');
select col_type_is(
  'public',
  'profiles',
  'created_at',
  'timestamp with time zone',
  'profile timestamps include a timezone'
);
select col_type_is(
  'public',
  'garages',
  'created_at',
  'timestamp with time zone',
  'garage timestamps include a timezone'
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111111',
  'owner@example.com',
  '{"time_zone":"America/La_Paz"}'::jsonb
);

select results_eq(
  $$select default_unit_system, default_currency_code, time_zone
    from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'$$,
  $$values ('imperial'::text, 'USD'::text, 'America/La_Paz'::text)$$,
  'signup provisions the profile defaults'
);

select results_eq(
  $$select owner_id, name
    from public.garages
    where owner_id = '11111111-1111-1111-1111-111111111111'$$,
  $$values ('11111111-1111-1111-1111-111111111111'::uuid, 'My Garage'::text)$$,
  'signup provisions exactly one default garage'
);

select * from finish(true);
rollback;
