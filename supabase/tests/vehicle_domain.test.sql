begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(37);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'vehicle-a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'vehicle-b@example.com');

insert into public.vehicles (
  id, garage_id, year, make, model, configuration_state, current_mileage, mileage_unit
)
select
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  garages.id,
  1991,
  'BMW',
  '325i',
  'modified',
  120000,
  'mi'
from public.garages
where owner_id = '22222222-2222-2222-2222-222222222222';

insert into public.vehicle_mileage_history (vehicle_id, mileage, mileage_unit)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 120000, 'mi');
insert into public.vehicle_components (
  vehicle_id, component_type, model, origin
) values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'engine', 'M20', 'original'
);
insert into public.modifications (vehicle_id, category, name)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'suspension', 'Coilovers');
insert into public.vehicle_usage_profiles (vehicle_id, usage_mode, is_primary)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'street', true);

select policies_are(
  'public',
  'vehicles',
  array['Owners can read vehicles'],
  'vehicles have only their owner-read policy'
);
select policies_are(
  'public',
  'vehicle_mileage_history',
  array['Owners can read vehicle mileage'],
  'mileage history has only its owner-read policy'
);
select policies_are(
  'public',
  'vehicle_components',
  array['Owners can read vehicle components'],
  'components have only their owner-read policy'
);
select policies_are(
  'public',
  'modifications',
  array['Owners can read modifications'],
  'modifications have only their owner-read policy'
);
select policies_are(
  'public',
  'vehicle_usage_profiles',
  array['Owners can read vehicle usage'],
  'usage profiles have only their owner-read policy'
);

set local role anon;
select throws_ok(
  $$select * from public.vehicles$$,
  '42501',
  null,
  'anonymous clients cannot read vehicles'
);
select throws_ok(
  $$select public.create_vehicle(
    1990::smallint, 'Mazda', 'MX-5', 'stock', 1, 'mi', array['street']
  )$$,
  '42501',
  null,
  'anonymous clients cannot execute vehicle operations'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select lives_ok(
  $$select public.create_vehicle(
    vehicle_year => 1992::smallint,
    vehicle_make => ' Nissan ',
    vehicle_model => '240SX',
    vehicle_configuration_state => 'swapped',
    vehicle_mileage => 150000,
    vehicle_mileage_unit => 'mi',
    vehicle_usage_modes => array['street', 'track'],
    vehicle_primary_usage_mode => 'street',
    vehicle_nickname => 'S13'
  )$$,
  'User A creates a vehicle through the service operation'
);
select results_eq(
  $$select year, make, model, current_mileage from public.vehicles$$,
  $$values (1992::smallint, 'Nissan'::text, '240SX'::text, 150000)$$,
  'vehicle identity and current mileage are stored'
);
select results_eq(
  $$select mileage from public.vehicle_mileage_history$$,
  array[150000],
  'create appends the initial mileage record'
);
select is(
  (select count(*) from public.vehicle_usage_profiles),
  2::bigint,
  'all selected usage modes are stored'
);
select results_eq(
  $$select usage_mode from public.vehicle_usage_profiles where is_primary$$,
  array['street'::text],
  'the optional primary usage mode is stored'
);

select lives_ok(
  $$select public.update_vehicle_configuration(
    (select id from public.vehicles where nickname = 'S13'),
    '[
      {"componentType":"chassis","origin":"original","model":"S13"},
      {"componentType":"engine","origin":"original","model":"KA24DE"}
    ]'::jsonb,
    '[{"category":"suspension","name":"Coilovers"}]'::jsonb
  )$$,
  'User A records the initial independent configuration'
);
select is(
  (select count(*) from public.vehicle_components),
  2::bigint,
  'chassis and engine are stored independently'
);
select is(
  (select count(*) from public.modifications),
  1::bigint,
  'configuration updates can append modifications'
);
select lives_ok(
  $$select public.update_vehicle_configuration(
    (select id from public.vehicles where nickname = 'S13'),
    '[{
      "componentType":"engine",
      "origin":"swapped",
      "manufacturer":"BMW",
      "model":"M50",
      "installedOn":"2026-09-01",
      "installedMileage":150100
    }]'::jsonb
  )$$,
  'User A swaps the engine transactionally'
);
select is(
  (select count(*) from public.vehicle_components where component_type = 'engine'),
  2::bigint,
  'a component swap preserves both engine records'
);
select results_eq(
  $$select model from public.vehicle_components
    where component_type = 'engine' and is_current$$,
  array['M50'::text],
  'the replacement engine becomes current'
);
select results_eq(
  $$select model from public.vehicle_components
    where component_type = 'engine' and not is_current$$,
  array['KA24DE'::text],
  'the original engine remains as history'
);

select lives_ok(
  $$select public.update_vehicle_mileage(
    (select id from public.vehicles where nickname = 'S13'),
    150250,
    '2026-10-07T12:00:00Z'
  )$$,
  'User A updates mileage through the append operation'
);
select results_eq(
  $$select current_mileage from public.vehicles$$,
  array[150250],
  'current mileage reflects the latest record'
);
select is(
  (select count(*) from public.vehicle_mileage_history),
  2::bigint,
  'mileage updates append instead of overwrite'
);
select results_eq(
  $$select mileage from public.vehicle_mileage_history order by recorded_at$$,
  array[150000, 150250],
  'mileage history remains chronological'
);
select lives_ok(
  $$select public.archive_vehicle(
    (select id from public.vehicles where nickname = 'S13')
  )$$,
  'User A archives their vehicle through the controlled operation'
);
select ok(
  (select archived_at is not null from public.vehicles),
  'archiving retains the vehicle row'
);

select is(
  (select count(*) from public.vehicles),
  1::bigint,
  'User A sees only their vehicle'
);
select is_empty(
  $$select * from public.vehicles
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'User A cannot select User B vehicle'
);
select is_empty(
  $$select * from public.vehicle_mileage_history
    where vehicle_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'User A cannot select User B mileage'
);
select is_empty(
  $$select * from public.vehicle_components
    where vehicle_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'User A cannot select User B components'
);
select is_empty(
  $$select * from public.modifications
    where vehicle_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'User A cannot select User B modifications'
);
select is_empty(
  $$select * from public.vehicle_usage_profiles
    where vehicle_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'User A cannot select User B usage profiles'
);

select throws_ok(
  $$select public.archive_vehicle('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,
  'P0002',
  null,
  'User A cannot archive User B vehicle through the service operation'
);
select throws_ok(
  $$select public.update_vehicle_mileage(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1
  )$$,
  'P0002',
  null,
  'User A cannot append User B mileage'
);
select throws_ok(
  $$select public.update_vehicle_configuration(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '[]'::jsonb
  )$$,
  'P0002',
  null,
  'User A cannot change User B configuration'
);
select throws_ok(
  $$insert into public.vehicles (
    garage_id, year, make, model, configuration_state, current_mileage, mileage_unit
  ) values (
    (select id from public.garages limit 1), 1990, 'Mazda', 'MX-5', 'stock', 1, 'mi'
  )$$,
  '42501',
  null,
  'raw vehicle insert is not exposed to the client'
);
select throws_ok(
  $$update public.vehicles set make = 'Changed'$$,
  '42501',
  null,
  'raw vehicle update is not exposed to the client'
);
select throws_ok(
  $$delete from public.vehicles$$,
  '42501',
  null,
  'raw vehicle delete is not exposed to the client'
);

select * from finish(true);
rollback;
