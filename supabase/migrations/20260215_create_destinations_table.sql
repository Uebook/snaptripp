-- Create destinations table for rich content
create table destinations (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- Matches 'country' or 'city' in places
  type text not null, -- 'country', 'state'
  
  -- Rich Content Fields
  overview text,
  bucket_list jsonb, -- Array of { text, image_url }
  local_foods jsonb, -- Array of { name, description, image_url }
  local_phrases jsonb, -- Array of { phrase, translation, pronunciation }
  transportation_info text,
  
  cover_image_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(name, type)
);

-- Index for faster lookups
create index idx_destinations_name on destinations(name);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
