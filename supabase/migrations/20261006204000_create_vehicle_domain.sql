create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (id) on delete cascade,
  year smallint not null check (year between 1886 and 9999),
  make text not null check (length(trim(make)) between 1 and 100),
  model text not null check (length(trim(model)) between 1 and 100),
  trim text check (trim is null or length(btrim(trim)) between 1 and 100),
  nickname text check (nickname is null or length(trim(nickname)) between 1 and 100),
  vin text check (vin is null or length(trim(vin)) between 1 and 32),
  configuration_state text not null
    check (configuration_state in ('stock', 'modified', 'swapped')),
  current_mileage integer not null check (current_mileage >= 0),
  mileage_unit text not null check (mileage_unit in ('mi', 'km')),
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_mileage_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  mileage integer not null check (mileage >= 0),
  mileage_unit text not null check (mileage_unit in ('mi', 'km')),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.vehicle_components (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  component_type text not null
    check (component_type in ('chassis', 'engine', 'transmission', 'differential', 'other')),
  manufacturer text check (manufacturer is null or length(trim(manufacturer)) between 1 and 100),
  family text check (family is null or length(trim(family)) between 1 and 100),
  model text check (model is null or length(trim(model)) between 1 and 100),
  variant text check (variant is null or length(trim(variant)) between 1 and 100),
  origin text not null
    check (origin in ('original', 'swapped', 'unknown_history', 'user_entered')),
  is_current boolean not null default true,
  installed_on date,
  installed_mileage integer check (installed_mileage is null or installed_mileage >= 0),
  removed_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (removed_on is null or installed_on is null or removed_on >= installed_on)
);

create unique index vehicle_components_one_current_type
on public.vehicle_components (vehicle_id, component_type)
where is_current;

create table public.modifications (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  category text not null check (length(trim(category)) between 1 and 100),
  name text not null check (length(trim(name)) between 1 and 200),
  manufacturer text check (manufacturer is null or length(trim(manufacturer)) between 1 and 100),
  part_number text check (part_number is null or length(trim(part_number)) between 1 and 100),
  status text not null default 'installed'
    check (status in ('planned', 'installed', 'removed')),
  installed_on date,
  installed_mileage integer check (installed_mileage is null or installed_mileage >= 0),
  removed_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (removed_on is null or installed_on is null or removed_on >= installed_on)
);

create table public.vehicle_usage_profiles (
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  usage_mode text not null
    check (usage_mode in ('street', 'track', 'autocross', 'drag', 'rally', 'off_road', 'show', 'storage', 'other')),
  is_primary boolean not null default false,
  intensity text check (intensity is null or length(trim(intensity)) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vehicle_id, usage_mode)
);

create unique index vehicle_usage_profiles_one_primary
on public.vehicle_usage_profiles (vehicle_id)
where is_primary;

create index vehicles_garage_id_idx on public.vehicles (garage_id);
create index vehicle_mileage_history_vehicle_recorded_idx
on public.vehicle_mileage_history (vehicle_id, recorded_at desc);
create index vehicle_components_vehicle_id_idx on public.vehicle_components (vehicle_id);
create index modifications_vehicle_id_idx on public.modifications (vehicle_id);

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function private.set_updated_at();

create trigger vehicle_components_set_updated_at
before update on public.vehicle_components
for each row execute function private.set_updated_at();

create trigger modifications_set_updated_at
before update on public.modifications
for each row execute function private.set_updated_at();

create trigger vehicle_usage_profiles_set_updated_at
before update on public.vehicle_usage_profiles
for each row execute function private.set_updated_at();
