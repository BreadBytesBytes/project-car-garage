alter table public.vehicles enable row level security;
alter table public.vehicle_mileage_history enable row level security;
alter table public.vehicle_components enable row level security;
alter table public.modifications enable row level security;
alter table public.vehicle_usage_profiles enable row level security;

revoke all on table public.vehicles from anon, authenticated;
revoke all on table public.vehicle_mileage_history from anon, authenticated;
revoke all on table public.vehicle_components from anon, authenticated;
revoke all on table public.modifications from anon, authenticated;
revoke all on table public.vehicle_usage_profiles from anon, authenticated;

grant select on table public.vehicles to authenticated;
grant select on table public.vehicle_mileage_history to authenticated;
grant select on table public.vehicle_components to authenticated;
grant select on table public.modifications to authenticated;
grant select on table public.vehicle_usage_profiles to authenticated;

create policy "Owners can read vehicles"
on public.vehicles
for select
to authenticated
using (
  exists (
    select 1 from public.garages
    where garages.id = vehicles.garage_id
      and garages.owner_id = (select auth.uid())
  )
);

create policy "Owners can read vehicle mileage"
on public.vehicle_mileage_history
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    join public.garages on garages.id = vehicles.garage_id
    where vehicles.id = vehicle_mileage_history.vehicle_id
      and garages.owner_id = (select auth.uid())
  )
);

create policy "Owners can read vehicle components"
on public.vehicle_components
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    join public.garages on garages.id = vehicles.garage_id
    where vehicles.id = vehicle_components.vehicle_id
      and garages.owner_id = (select auth.uid())
  )
);

create policy "Owners can read modifications"
on public.modifications
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    join public.garages on garages.id = vehicles.garage_id
    where vehicles.id = modifications.vehicle_id
      and garages.owner_id = (select auth.uid())
  )
);

create policy "Owners can read vehicle usage"
on public.vehicle_usage_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    join public.garages on garages.id = vehicles.garage_id
    where vehicles.id = vehicle_usage_profiles.vehicle_id
      and garages.owner_id = (select auth.uid())
  )
);

create function private.assert_vehicle_owner(requested_vehicle_id uuid)
returns public.vehicles
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_vehicle public.vehicles;
begin
  if (select auth.uid()) is null then
    raise insufficient_privilege using message = 'Authentication required.';
  end if;

  select vehicles.* into owned_vehicle
  from public.vehicles
  join public.garages on garages.id = vehicles.garage_id
  where vehicles.id = requested_vehicle_id
    and garages.owner_id = (select auth.uid());

  if owned_vehicle.id is null then
    raise no_data_found using message = 'Vehicle not found.';
  end if;

  return owned_vehicle;
end;
$$;

revoke all on function private.assert_vehicle_owner(uuid) from public;

create function public.create_vehicle(
  vehicle_year smallint,
  vehicle_make text,
  vehicle_model text,
  vehicle_configuration_state text,
  vehicle_mileage integer,
  vehicle_mileage_unit text,
  vehicle_usage_modes text[],
  vehicle_primary_usage_mode text default null,
  vehicle_trim text default null,
  vehicle_nickname text default null,
  vehicle_vin text default null,
  vehicle_notes text default null
)
returns public.vehicles
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_garage_id uuid;
  created_vehicle public.vehicles;
begin
  if (select auth.uid()) is null then
    raise insufficient_privilege using message = 'Authentication required.';
  end if;

  select garages.id into owned_garage_id
  from public.garages
  where garages.owner_id = (select auth.uid())
    and garages.archived_at is null;

  if owned_garage_id is null then
    raise no_data_found using message = 'Active garage not found.';
  end if;

  if coalesce(cardinality(vehicle_usage_modes), 0) = 0 then
    raise check_violation using message = 'Choose at least one usage mode.';
  end if;

  if exists (
    select 1 from unnest(vehicle_usage_modes) as usage_mode
    where usage_mode not in ('street', 'track', 'autocross', 'drag', 'rally', 'off_road', 'show', 'storage', 'other')
  ) then
    raise check_violation using message = 'Invalid usage mode.';
  end if;

  if vehicle_primary_usage_mode is not null
    and not (vehicle_primary_usage_mode = any(vehicle_usage_modes)) then
    raise check_violation using message = 'Primary usage must be selected.';
  end if;

  insert into public.vehicles (
    garage_id,
    year,
    make,
    model,
    trim,
    nickname,
    vin,
    configuration_state,
    current_mileage,
    mileage_unit,
    notes
  ) values (
    owned_garage_id,
    vehicle_year,
    trim(vehicle_make),
    trim(vehicle_model),
    nullif(trim(vehicle_trim), ''),
    nullif(trim(vehicle_nickname), ''),
    nullif(upper(trim(vehicle_vin)), ''),
    vehicle_configuration_state,
    vehicle_mileage,
    vehicle_mileage_unit,
    nullif(trim(vehicle_notes), '')
  ) returning * into created_vehicle;

  insert into public.vehicle_mileage_history (vehicle_id, mileage, mileage_unit)
  values (created_vehicle.id, vehicle_mileage, vehicle_mileage_unit);

  insert into public.vehicle_usage_profiles (vehicle_id, usage_mode, is_primary)
  select created_vehicle.id, usage_mode, usage_mode = vehicle_primary_usage_mode
  from (select distinct unnest(vehicle_usage_modes) as usage_mode) selected_modes;

  return created_vehicle;
end;
$$;

create function public.update_vehicle_mileage(
  requested_vehicle_id uuid,
  new_mileage integer,
  measured_at timestamptz default now()
)
returns public.vehicles
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_vehicle public.vehicles;
begin
  owned_vehicle := private.assert_vehicle_owner(requested_vehicle_id);

  if new_mileage < 0 then
    raise check_violation using message = 'Mileage cannot be negative.';
  end if;

  update public.vehicles
  set current_mileage = new_mileage
  where id = requested_vehicle_id
  returning * into owned_vehicle;

  insert into public.vehicle_mileage_history (
    vehicle_id,
    mileage,
    mileage_unit,
    recorded_at
  ) values (
    requested_vehicle_id,
    new_mileage,
    owned_vehicle.mileage_unit,
    measured_at
  );

  return owned_vehicle;
end;
$$;

create function public.update_vehicle_configuration(
  requested_vehicle_id uuid,
  replacement_components jsonb default '[]'::jsonb,
  added_modifications jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  component jsonb;
  modification jsonb;
  requested_component_type text;
  component_origin text;
begin
  perform private.assert_vehicle_owner(requested_vehicle_id);

  if jsonb_typeof(replacement_components) <> 'array'
    or jsonb_typeof(added_modifications) <> 'array' then
    raise check_violation using message = 'Configuration inputs must be arrays.';
  end if;

  for component in select value from jsonb_array_elements(replacement_components)
  loop
    requested_component_type := component ->> 'componentType';
    component_origin := component ->> 'origin';

    if requested_component_type not in ('chassis', 'engine', 'transmission', 'differential', 'other')
      or component_origin not in ('original', 'swapped', 'unknown_history', 'user_entered') then
      raise check_violation using message = 'Invalid component type or origin.';
    end if;

    update public.vehicle_components
    set
      is_current = false,
      removed_on = coalesce((component ->> 'installedOn')::date, removed_on)
    where vehicle_id = requested_vehicle_id
      and vehicle_components.component_type = requested_component_type
      and is_current;

    insert into public.vehicle_components (
      vehicle_id,
      component_type,
      manufacturer,
      family,
      model,
      variant,
      origin,
      installed_on,
      installed_mileage,
      notes
    ) values (
      requested_vehicle_id,
      requested_component_type,
      nullif(trim(component ->> 'manufacturer'), ''),
      nullif(trim(component ->> 'family'), ''),
      nullif(trim(component ->> 'model'), ''),
      nullif(trim(component ->> 'variant'), ''),
      component_origin,
      (component ->> 'installedOn')::date,
      (component ->> 'installedMileage')::integer,
      nullif(trim(component ->> 'notes'), '')
    );
  end loop;

  for modification in select value from jsonb_array_elements(added_modifications)
  loop
    insert into public.modifications (
      vehicle_id,
      category,
      name,
      manufacturer,
      part_number,
      status,
      installed_on,
      installed_mileage,
      notes
    ) values (
      requested_vehicle_id,
      trim(modification ->> 'category'),
      trim(modification ->> 'name'),
      nullif(trim(modification ->> 'manufacturer'), ''),
      nullif(trim(modification ->> 'partNumber'), ''),
      coalesce(nullif(modification ->> 'status', ''), 'installed'),
      (modification ->> 'installedOn')::date,
      (modification ->> 'installedMileage')::integer,
      nullif(trim(modification ->> 'notes'), '')
    );
  end loop;
end;
$$;

create function public.archive_vehicle(requested_vehicle_id uuid)
returns public.vehicles
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_vehicle public.vehicles;
begin
  owned_vehicle := private.assert_vehicle_owner(requested_vehicle_id);

  update public.vehicles
  set archived_at = coalesce(archived_at, now())
  where id = requested_vehicle_id
  returning * into owned_vehicle;

  return owned_vehicle;
end;
$$;

revoke all on function public.create_vehicle(smallint, text, text, text, integer, text, text[], text, text, text, text, text) from public;
revoke all on function public.update_vehicle_mileage(uuid, integer, timestamptz) from public;
revoke all on function public.update_vehicle_configuration(uuid, jsonb, jsonb) from public;
revoke all on function public.archive_vehicle(uuid) from public;

grant execute on function public.create_vehicle(smallint, text, text, text, integer, text, text[], text, text, text, text, text) to authenticated;
grant execute on function public.update_vehicle_mileage(uuid, integer, timestamptz) to authenticated;
grant execute on function public.update_vehicle_configuration(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.archive_vehicle(uuid) to authenticated;
