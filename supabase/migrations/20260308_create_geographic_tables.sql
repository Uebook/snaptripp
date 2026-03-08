-- Migration to create geographic lookup tables

-- 1. Countries table
create table countries (
  id bigint primary key,
  name text not null,
  iso3 char(3),
  iso2 char(2),
  phone_code text,
  capital text,
  currency text,
  native text,
  emoji text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. States table
create table states (
  id bigint primary key,
  name text not null,
  country_id bigint references countries(id) on delete cascade,
  state_code text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Cities table
create table cities (
  id bigint primary key,
  name text not null,
  state_id bigint references states(id) on delete cascade,
  country_id bigint references countries(id) on delete cascade,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_countries_name on countries(name);
create index idx_states_name on states(name);
create index idx_cities_name on cities(name);
create index idx_cities_country_id on cities(country_id);
create index idx_cities_state_id on cities(state_id);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
