create function private.normalize_usage_primary()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.is_primary = coalesce(new.is_primary, false);
  return new;
end;
$$;

create trigger vehicle_usage_profiles_normalize_primary
before insert on public.vehicle_usage_profiles
for each row execute function private.normalize_usage_primary();

revoke all on function private.normalize_usage_primary() from public;
