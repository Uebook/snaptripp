-- Create traveler_reviews table
create table traveler_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  country text not null,
  selected_cities text[] default '{}',
  sightseeing_rating integer check (sightseeing_rating between 1 and 5),
  local_people_rating integer check (local_people_rating between 1 and 5),
  service_quality_rating integer check (service_quality_rating between 1 and 5),
  safety_rating integer check (safety_rating between 1 and 5),
  price_rating integer check (price_rating between 1 and 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_traveler_reviews_user_id on traveler_reviews(user_id);
create index idx_traveler_reviews_country on traveler_reviews(country);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
