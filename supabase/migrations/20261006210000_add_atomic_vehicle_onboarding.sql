create function public.onboard_vehicle(
  vehicle_year smallint,
  vehicle_make text,
  vehicle_model text,
  vehicle_configuration_state text,
  vehicle_mileage integer,
  vehicle_mileage_unit text,
  vehicle_usage_modes text[],
  replacement_components jsonb default '[]'::jsonb,
  added_modifications jsonb default '[]'::jsonb,
  vehicle_primary_usage_mode text default null,
  vehicle_trim text default null,
  vehicle_nickname text default null,
  vehicle_vin text default null,
  vehicle_notes text default null
)
returns public.vehicles
language plpgsql
set search_path = ''
as $$
declare
  created_vehicle public.vehicles;
begin
  created_vehicle := public.create_vehicle(
    vehicle_year,
    vehicle_make,
    vehicle_model,
    vehicle_configuration_state,
    vehicle_mileage,
    vehicle_mileage_unit,
    vehicle_usage_modes,
    vehicle_primary_usage_mode,
    vehicle_trim,
    vehicle_nickname,
    vehicle_vin,
    vehicle_notes
  );

  perform public.update_vehicle_configuration(
    created_vehicle.id,
    replacement_components,
    added_modifications
  );

  return created_vehicle;
end;
$$;

revoke all on function public.onboard_vehicle(smallint, text, text, text, integer, text, text[], jsonb, jsonb, text, text, text, text, text) from public;
grant execute on function public.onboard_vehicle(smallint, text, text, text, integer, text, text[], jsonb, jsonb, text, text, text, text, text) to authenticated;
