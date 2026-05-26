-- 1. Create explore_settings table
CREATE TABLE IF NOT EXISTS public.explore_settings (
  id text primary key default 'default',
  hero_tagline text not null,
  hero_title text not null,
  quote_text text not null,
  quote_author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 'default')
);

-- 2. Create country_guides table
CREATE TABLE IF NOT EXISTS public.country_guides (
  id text primary key, -- e.g. 'japan', 'italy'
  name text not null,
  "desc" text not null,
  tag text not null,
  hero_img text not null,
  is_featured boolean not null default false,
  capital text not null,
  currency text not null,
  language text not null,
  time_zone text not null,
  best_time text not null,
  emergency_police text not null,
  emergency_ambulance text not null,
  emergency_embassy text not null,
  experience_title text not null,
  experience_desc text not null,
  experience_img text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create country_guide_cards table
CREATE TABLE IF NOT EXISTS public.country_guide_cards (
  id uuid default gen_random_uuid() primary key,
  country_id text references public.country_guides(id) ON DELETE CASCADE not null,
  icon_name text not null, -- 'about', 'snapshot', 'clock'
  title text not null,
  "desc" text not null,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create country_guide_items table
CREATE TABLE IF NOT EXISTS public.country_guide_items (
  id uuid default gen_random_uuid() primary key,
  country_id text references public.country_guides(id) ON DELETE CASCADE not null,
  type text not null, -- 'connectivity' or 'etiquette'
  title text not null,
  "desc" text not null,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create country_guide_cities table
CREATE TABLE IF NOT EXISTS public.country_guide_cities (
  id uuid default gen_random_uuid() primary key,
  country_id text references public.country_guides(id) ON DELETE CASCADE not null,
  name text not null,
  "desc" text not null,
  img_url text not null,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.explore_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_guide_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_guide_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_guide_cities ENABLE ROW LEVEL SECURITY;

-- 7. Select policies (public read access)
DROP POLICY IF EXISTS "Allow public read access to explore_settings" ON public.explore_settings;
CREATE POLICY "Allow public read access to explore_settings" ON public.explore_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to country_guides" ON public.country_guides;
CREATE POLICY "Allow public read access to country_guides" ON public.country_guides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to country_guide_cards" ON public.country_guide_cards;
CREATE POLICY "Allow public read access to country_guide_cards" ON public.country_guide_cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to country_guide_items" ON public.country_guide_items;
CREATE POLICY "Allow public read access to country_guide_items" ON public.country_guide_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to country_guide_cities" ON public.country_guide_cities;
CREATE POLICY "Allow public read access to country_guide_cities" ON public.country_guide_cities FOR SELECT USING (true);

-- 8. Write policies (authenticated users only)
DROP POLICY IF EXISTS "Allow auth manage explore_settings" ON public.explore_settings;
CREATE POLICY "Allow auth manage explore_settings" ON public.explore_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth manage country_guides" ON public.country_guides;
CREATE POLICY "Allow auth manage country_guides" ON public.country_guides FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth manage country_guide_cards" ON public.country_guide_cards;
CREATE POLICY "Allow auth manage country_guide_cards" ON public.country_guide_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth manage country_guide_items" ON public.country_guide_items;
CREATE POLICY "Allow auth manage country_guide_items" ON public.country_guide_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth manage country_guide_cities" ON public.country_guide_cities;
CREATE POLICY "Allow auth manage country_guide_cities" ON public.country_guide_cities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Seed initial Explore settings
INSERT INTO public.explore_settings (id, hero_tagline, hero_title, quote_text, quote_author)
VALUES (
  'default',
  'Explore the Unseen',
  'Where will your curiosity lead you next?',
  'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
  'MARCEL PROUST'
)
ON CONFLICT (id) DO NOTHING;

-- 10. Seed initial Country Guides
INSERT INTO public.country_guides (id, name, "desc", tag, hero_img, is_featured, capital, currency, language, time_zone, best_time, emergency_police, emergency_ambulance, emergency_embassy, experience_title, experience_desc, experience_img)
VALUES 
(
  'japan',
  'Japan',
  'A harmonious blend of ancient traditions and futuristic innovation. From the neon-lit streets of Tokyo to the tranquil temples of Kyoto, Japan offers a sensory journey unlike any other.',
  'Culture',
  '/images/explore_japan.png',
  true,
  'Tokyo',
  'Yen (¥)',
  'Japanese',
  'GMT+9',
  'Mar - May',
  '110',
  '119',
  'Contact your local embassy or consulate for specific assistance.',
  'Traditional Tea Ceremony',
  'Experience the mindful preparation of matcha and the profound hospitality of Japanese culture.',
  '/images/explore_japan.png'
),
(
  'italy',
  'Italy',
  'The ultimate guide to the rolling hills, hidden vineyards, and the slow life of the Italian countryside.',
  'Editorial',
  '/images/guide_italy.png',
  true,
  'Rome',
  'Euro (€)',
  'Italian',
  'GMT+1',
  'Apr - Jun',
  '113',
  '118',
  'Contact your local embassy or consulate for specific assistance.',
  'Tuscan Wine Tasting',
  'Indulge in authentic winemaking tours and tasting inside historic medieval cellars.',
  '/images/guide_italy.png'
),
(
  'morocco',
  'Morocco',
  'Exploring the vibrant souks of Marrakesh and the blue-washed walls of Chefchaouen.',
  'Lifestyle',
  '/images/guide_morocco.png',
  true,
  'Rabat',
  'Dirham (MAD)',
  'Arabic, Berber',
  'GMT+1',
  'Mar - May',
  '19',
  '15',
  'Contact your local embassy or consulate for specific assistance.',
  'Marrakesh Souk Tour',
  'Navigate the rich, spice-filled alleys and artisan markets with a licensed local guide.',
  '/images/guide_morocco.png'
),
(
  'france',
  'France',
  'Journeying through the lavender fields of Provence and the rugged coastline of Brittany.',
  'Vintage',
  '/images/guide_france.png',
  true,
  'Paris',
  'Euro (€)',
  'French',
  'GMT+1',
  'May - Sep',
  '17',
  '15',
  'Contact your local embassy or consulate for specific assistance.',
  'Seine Sunset Cruise',
  'Sail along Paris'' famous river landmarks while enjoying fine cheese and wine.',
  '/images/guide_france.png'
)
ON CONFLICT (id) DO NOTHING;

-- 11. Seed initial Country Guide Cards (Japan)
INSERT INTO public.country_guide_cards (country_id, icon_name, title, "desc", display_order)
VALUES 
  ('japan', 'about', 'About', 'An archipelago of over 6,000 islands, Japan''s topography ranges from snow-capped peaks to tropical beaches, defined by deep spiritual roots.', 0),
  ('japan', 'snapshot', 'Travel Snapshot', 'Efficiency meets elegance. Navigate with ease using the Shinkansen, indulge in world-class culinary delights, and find peace in Zen gardens.', 1),
  ('japan', 'clock', 'Best Time to Visit', 'Spring for Sakura blossoms and Autumn for fiery maple leaves are peak seasons. Winter offers world-class skiing in Hokkaido.', 2),
  ('italy', 'about', 'About', 'Rich history, majestic architecture, and culinary brilliance define the cradle of the Renaissance.', 0),
  ('italy', 'snapshot', 'Travel Snapshot', 'Savor world-class pasta, navigate romantic canal towns, and enjoy relaxed evening strolls.', 1),
  ('italy', 'clock', 'Best Time to Visit', 'Spring and Autumn are the best seasons for scenic country touring with mild weather.', 2)
ON CONFLICT DO NOTHING;

-- 12. Seed initial Country Guide Items (Japan)
INSERT INTO public.country_guide_items (country_id, type, title, "desc", display_order)
VALUES 
  ('japan', 'connectivity', 'SIM Cards', 'Purchase data SIM cards or rent pocket Wi-Fi at airports.', 0),
  ('japan', 'connectivity', 'Transportation', 'Use Japan Rail (JR) Pass for intercity travel and Suica/Pasmo for local transit.', 1),
  ('japan', 'etiquette', 'Greetings', 'Bowing is the customary greeting. Handshakes are also common in business.', 0),
  ('japan', 'etiquette', 'Footwear', 'Take off your shoes when entering homes, ryokans, and some traditional restaurants.', 1),
  ('japan', 'etiquette', 'Tipping', 'Do not tip in restaurants or taxis; excellent service is standard.', 2)
ON CONFLICT DO NOTHING;

-- 13. Seed initial Country Guide Cities (Japan)
INSERT INTO public.country_guide_cities (country_id, name, "desc", img_url, display_order)
VALUES 
  ('japan', 'Tokyo', 'Vibrant metropolis blending neon lights and historic shrines.', '/images/hero_city.png', 0),
  ('japan', 'Kyoto', 'Cultural heart with thousands of classical Buddhist temples.', '/images/coastal_beach.png', 1),
  ('japan', 'Osaka', 'A dynamic port city known for modern architecture and hearty street food.', '/images/marrakech.png', 2)
ON CONFLICT DO NOTHING;

-- 14. Force schema reload
NOTIFY pgrst, 'reload schema';
