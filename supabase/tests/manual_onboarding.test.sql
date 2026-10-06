begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(7);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'onboarding@example.com');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select lives_ok(
  $$select public.onboard_vehicle(
    1999::smallint, 'Mazda', 'MX-5', 'stock', 80000, 'mi', array['street']
  )$$,
  'minimal stock onboarding succeeds without advanced configuration'
);
select is(
  (select count(*) from public.vehicles where model = 'MX-5'),
  1::bigint,
  'minimal onboarding stores the vehicle'
);

select lives_ok(
  $$select public.onboard_vehicle(
    vehicle_year => 1992::smallint,
    vehicle_make => 'Nissan',
    vehicle_model => '240SX',
    vehicle_configuration_state => 'swapped',
    vehicle_mileage => 150000,
    vehicle_mileage_unit => 'mi',
    vehicle_usage_modes => array['street', 'track'],
    replacement_components => '[
      {"componentType":"chassis","origin":"original","model":"S13"},
      {"componentType":"engine","origin":"swapped","model":"M50"}
    ]'::jsonb,
    added_modifications => '[{"category":"engine","name":"M50 swap"}]'::jsonb
  )$$,
  'swapped onboarding succeeds as one operation'
);
select results_eq(
  $$select component_type, model from public.vehicle_components
    where vehicle_id = (select id from public.vehicles where model = '240SX')
    order by component_type$$,
  $$values ('chassis'::text, 'S13'::text), ('engine'::text, 'M50'::text)$$,
  'swapped onboarding stores chassis and engine independently'
);
select is(
  (select count(*) from public.modifications where name = 'M50 swap'),
  1::bigint,
  'optional onboarding modifications are stored'
);

select throws_ok(
  $$select public.onboard_vehicle(
    2000::smallint,
    'Broken',
    'Rollback',
    'swapped',
    1,
    'mi',
    array['street'],
    '[{"componentType":"invalid","origin":"swapped"}]'::jsonb
  )$$,
  '23514',
  null,
  'invalid advanced configuration rolls back the entire onboarding operation'
);
select is(
  (select count(*) from public.vehicles where make = 'Broken'),
  0::bigint,
  'failed advanced configuration leaves no partial vehicle'
);

select * from finish(true);
rollback;
