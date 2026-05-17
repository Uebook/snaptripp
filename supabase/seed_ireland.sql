-- SEED DATA FOR IRELAND
-- Run this in your Supabase SQL Editor

-- 1. Create destinations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.destinations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL, -- Matches 'country' or 'city' in places
  type text NOT NULL, -- 'country', 'state'
  overview text,
  bucket_list jsonb, -- Array of { text, image_url }
  local_foods jsonb, -- Array of { name, description, image_url }
  local_phrases jsonb, -- Array of { phrase, translation, pronunciation }
  transportation_info text,
  cover_image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(name, type)
);

CREATE INDEX IF NOT EXISTS idx_destinations_name ON destinations(name);

-- 2. Seed destinations table with Ireland
INSERT INTO public.destinations (name, type, overview, bucket_list, local_foods, local_phrases, transportation_info, cover_image_url)
VALUES (
  'Ireland',
  'country',
  'Ireland is a land of myth and legend, known for its lush green landscapes, rugged coastlines, and warm hospitality. From the bustling streets of Dublin to the serene beauty of the Wild Atlantic Way, it offers a rich blend of history, culture, and nature.',
  '[
    {"text": "Visit the Cliffs of Moher", "image_url": "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7"},
    {"text": "Kiss the Blarney Stone", "image_url": null},
    {"text": "Drive the Ring of Kerry", "image_url": null}
  ]'::jsonb,
  '[
    {"name": "Irish Stew", "description": "A hearty stew made with lamb, potatoes, carrots, and onions.", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Irish_stew_2009.jpg/800px-Irish_stew_2009.jpg"},
    {"name": "Soda Bread", "description": "A dense, unleavened bread made with baking soda.", "image_url": null}
  ]'::jsonb,
  '[
    {"phrase": "Dia dhuit", "translation": "Hello", "pronunciation": "dee-a gwitch"},
    {"phrase": "Sláinte", "translation": "Cheers", "pronunciation": "slawn-cha"}
  ]'::jsonb,
  'Public transport (buses and trains) connects major cities. For rural areas, renting a car is highly recommended to explore at your own pace.',
  'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7'
)
ON CONFLICT (name, type) DO UPDATE SET
  overview = EXCLUDED.overview,
  bucket_list = EXCLUDED.bucket_list,
  local_foods = EXCLUDED.local_foods,
  local_phrases = EXCLUDED.local_phrases,
  transportation_info = EXCLUDED.transportation_info,
  cover_image_url = EXCLUDED.cover_image_url;

-- 3. Ensure Ireland exists in the countries table for the dropdown
-- Assuming ID 1 for Ireland if not already present, or just leave it to auto-detect if possible.
-- The geographic tables often use specific IDs from datasets. 
-- Let's just use a high ID to avoid conflicts if we don't know the exact ID.
INSERT INTO public.countries (id, name, iso2, iso3)
VALUES (353, 'Ireland', 'IE', 'IRL')
ON CONFLICT (id) DO NOTHING;

-- 4. Add some cities for Ireland
INSERT INTO public.cities (id, name, country_id, latitude, longitude)
VALUES 
  (35301, 'Dublin', 353, 53.3498, -6.2603),
  (35302, 'Cork', 353, 51.8985, -8.4756),
  (35303, 'Galway', 353, 53.2707, -9.0568)
ON CONFLICT (id) DO NOTHING;

-- 5. Add sample PLACES for Ireland (This populates the Country Dropdown and Map)
INSERT INTO public.places ("country", "city", "title", "location_lat", "location_lng", "categoryName")
VALUES 
  ('Ireland', 'Dublin', 'Guinness Storehouse', 53.3419, -6.2867, 'Tourist Attraction'),
  ('Ireland', 'Dublin', 'Trinity College', 53.3438, -6.2546, 'University'),
  ('Ireland', 'Dublin', 'Temple Bar', 53.3454, -6.2644, 'Entertainment District'),
  ('Ireland', 'Cork', 'Blarney Castle', 51.9291, -8.5705, 'Historic Site'),
  ('Ireland', 'Galway', 'Cliffs of Moher', 52.9719, -9.4265, 'Natural Wonder')
ON CONFLICT ("title", "address") DO NOTHING;

-- 6. Cleanup: Fix city names with trailing '%'
UPDATE public.places 
SET city = TRIM(TRAILING '%' FROM city)
WHERE city LIKE '%%';

UPDATE public.places 
SET city = 'Dublin'
WHERE city ILIKE 'Dublin%';

-- Force schema reload
NOTIFY pgrst, 'reload schema';
