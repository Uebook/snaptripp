-- 1. Create home_carousel table
CREATE TABLE IF NOT EXISTS public.home_carousel (
  id uuid default gen_random_uuid() primary key,
  country text not null unique,
  region text not null,
  description text not null,
  label text not null,
  location_tag text not null,
  image_url text not null,
  bg_image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
ALTER TABLE public.home_carousel ENABLE ROW LEVEL SECURITY;

-- 3. Select policy (allow everyone to view carousel destinations)
DROP POLICY IF EXISTS "Allow public read access to home_carousel" ON public.home_carousel;
CREATE POLICY "Allow public read access to home_carousel"
  ON public.home_carousel FOR SELECT
  USING (true);

-- 4. Write policy (allow authenticated users to manage carousel)
DROP POLICY IF EXISTS "Allow authenticated users to manage home_carousel" ON public.home_carousel;
CREATE POLICY "Allow authenticated users to manage home_carousel"
  ON public.home_carousel FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Seed initial carousel data
INSERT INTO public.home_carousel (country, region, description, label, location_tag, image_url, bg_image_url)
VALUES 
('Greece', 'Europe', 'Greece is famous for its iconic blue domes, ancient history, and stunning Aegean sunsets.', 'Santorini', 'Oia Village, Santorini', '/images/hero_greece_oia.png', '/images/hero_greece_oia.png'),
('Italy', 'Europe', 'Italy is known for its historic art, culinary masterpieces, and the dramatic Amalfi Coast.', 'Positano', 'Amalfi Coast, Italy', '/images/card_italy.png', '/images/card_italy.png'),
('Spain', 'Region', 'Spain is famous for its islands, beach holidays, surfing, diving and yachting.', 'Madrid', 'Plaza Mayor, Madrid', '/images/card_madrid.png', '/images/hero_seoul_night.png'),
('UAE', 'Middle East', 'UAE offers a blend of futuristic skyscrapers, luxury shopping, and desert adventures.', 'Dubai', 'Museum of the Future, Dubai', '/images/card_uae.png', '/images/hero_uae_museum.png'),
('USA', 'North America', 'USA features diverse landscapes from bustling New York streets to the Grand Canyon.', 'New York', 'Times Square, New York', '/images/card_usa.png', '/images/card_usa.png'),
('Canada', 'North America', 'Canada is renowned for its vast wilderness, stunning lakes, and friendly multicultural cities.', 'Banff', 'Moraine Lake, Banff', '/images/card_canada.png', '/images/card_canada.png'),
('Thailand', 'Asia', 'Thailand is a land of tropical beaches, ornate temples, and vibrant street life.', 'Phuket', 'Maya Bay, Phi Phi Islands', '/images/card_thailand.png', '/images/card_thailand.png'),
('Ireland', 'Europe', 'Ireland is known for its lush green landscapes, historic castles, and vibrant culture.', 'Cliffs of Moher', 'Cliffs of Moher, County Clare', '/images/why_mountains.png', '/images/why_mountains.png')
ON CONFLICT (country) DO NOTHING;

-- 6. Force schema reload
NOTIFY pgrst, 'reload schema';
