begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(14);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'user-a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'user-b@example.com');

select policies_are(
  'public',
  'profiles',
  array['Users can read their profile', 'Users can update their profile'],
  'profiles have only the expected ownership policies'
);
select policies_are(
  'public',
  'garages',
  array['Owners can read their garage', 'Owners can update their garage'],
  'garages have only the expected ownership policies'
);

set local role anon;
select throws_ok(
  $$select * from public.profiles$$,
  '42501',
  null,
  'anonymous clients cannot read profiles'
);
select throws_ok(
  $$select * from public.garages$$,
  '42501',
  null,
  'anonymous clients cannot read garages'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$select id from public.profiles$$,
  array['11111111-1111-1111-1111-111111111111'::uuid],
  'User A reads their profile'
);
select results_eq(
  $$select owner_id from public.garages$$,
  array['11111111-1111-1111-1111-111111111111'::uuid],
  'User A reads their garage'
);
select results_eq(
  $$update public.profiles
    set default_unit_system = 'metric'
    where id = '11111111-1111-1111-1111-111111111111'
    returning default_unit_system$$,
  array['metric'::text],
  'User A updates their profile'
);
select results_eq(
  $$update public.garages
    set name = 'Track Cars'
    where owner_id = '11111111-1111-1111-1111-111111111111'
    returning name$$,
  array['Track Cars'::text],
  'User A updates their garage'
);

select is_empty(
  $$select * from public.profiles
    where id = '22222222-2222-2222-2222-222222222222'$$,
  'User A cannot select User B profile'
);
select is_empty(
  $$select * from public.garages
    where owner_id = '22222222-2222-2222-2222-222222222222'$$,
  'User A cannot select User B garage'
);
select is_empty(
  $$update public.profiles
    set default_unit_system = 'metric'
    where id = '22222222-2222-2222-2222-222222222222'
    returning id$$,
  'User A cannot update User B profile'
);
select is_empty(
  $$update public.garages
    set name = 'Stolen Garage'
    where owner_id = '22222222-2222-2222-2222-222222222222'
    returning id$$,
  'User A cannot update User B garage'
);
select throws_ok(
  $$delete from public.profiles
    where id = '22222222-2222-2222-2222-222222222222'$$,
  '42501',
  null,
  'User A cannot delete User B profile'
);
select throws_ok(
  $$delete from public.garages
    where owner_id = '22222222-2222-2222-2222-222222222222'$$,
  '42501',
  null,
  'User A cannot delete User B garage'
);

select * from finish(true);
rollback;
