-- Create a table for public profiles (optional but good practice)
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create trips table
create table trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  country text,
  style text,
  duration text,
  immersion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table trips enable row level security;

create policy "Users can view their own trips."
  on trips for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own trips."
  on trips for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own trips."
  on trips for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own trips."
  on trips for delete
  using ( auth.uid() = user_id );

-- Create trip_days table
create table trip_days (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  day_index integer not null, -- 0 for Day 1, etc.
  title text, -- e.g. "Day 1", "Day 2"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table trip_days enable row level security;

create policy "Users can view days of their own trips."
  on trip_days for select
  using ( exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() ) );

create policy "Users can insert days for their own trips."
  on trip_days for insert
  with check ( exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() ) );

create policy "Users can update days for their own trips."
    on trip_days for update
    using ( exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() ) );

create policy "Users can delete days for their own trips."
    on trip_days for delete
    using ( exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() ) );


-- Create trip_items table
create table trip_items (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references trip_days(id) on delete cascade not null,
  place_id bigint references places(id), -- Nullable if it's a custom item, but linking to places here
  custom_name text, -- If place_id is null or to override? Let's just use it for now.
  order_index integer not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table trip_items enable row level security;

create policy "Users can view items of their own trips."
  on trip_items for select
  using ( exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() ) );

create policy "Users can insert items for their own trips."
  on trip_items for insert
  with check ( exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() ) );

create policy "Users can update items for their own trips."
    on trip_items for update
    using ( exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() ) );

create policy "Users can delete items for their own trips."
    on trip_items for delete
    using ( exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() ) );

-- Function to handle new user profile creation automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
