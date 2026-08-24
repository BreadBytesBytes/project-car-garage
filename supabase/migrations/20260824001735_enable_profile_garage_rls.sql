alter table public.profiles enable row level security;
alter table public.garages enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.garages from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (default_unit_system, default_currency_code, time_zone, archived_at)
  on table public.profiles to authenticated;

grant select on table public.garages to authenticated;
grant update (name, archived_at) on table public.garages to authenticated;

create policy "Users can read their profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id)
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

create policy "Owners can read their garage"
on public.garages
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "Owners can update their garage"
on public.garages
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);
