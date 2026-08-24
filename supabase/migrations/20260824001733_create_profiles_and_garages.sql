create schema private;
revoke all on schema private from public;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  default_unit_system text not null default 'imperial'
    check (default_unit_system in ('imperial', 'metric')),
  default_currency_code text not null default 'USD'
    check (default_currency_code ~ '^[A-Z]{3}$'),
  time_zone text not null default 'UTC'
    check (length(trim(time_zone)) between 1 and 100),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null default 'My Garage'
    check (length(trim(name)) between 1 and 100),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger garages_set_updated_at
before update on public.garages
for each row execute function private.set_updated_at();

create function private.provision_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_currency text := upper(trim(new.raw_user_meta_data ->> 'default_currency_code'));
  requested_time_zone text := trim(new.raw_user_meta_data ->> 'time_zone');
  requested_units text := trim(new.raw_user_meta_data ->> 'default_unit_system');
begin
  insert into public.profiles (
    id,
    default_unit_system,
    default_currency_code,
    time_zone
  )
  values (
    new.id,
    case when requested_units in ('imperial', 'metric') then requested_units else 'imperial' end,
    case when requested_currency ~ '^[A-Z]{3}$' then requested_currency else 'USD' end,
    case
      when length(requested_time_zone) between 1 and 100 then requested_time_zone
      else 'UTC'
    end
  );

  insert into public.garages (owner_id) values (new.id);

  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;
revoke all on function private.provision_new_user() from public;

create trigger provision_user_profile_and_garage
after insert on auth.users
for each row execute function private.provision_new_user();
