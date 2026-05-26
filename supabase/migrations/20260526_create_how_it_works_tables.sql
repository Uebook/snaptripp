-- 1. Create how_it_works_settings table
CREATE TABLE IF NOT EXISTS public.how_it_works_settings (
  id text primary key default 'default',
  hero_badge text not null,
  hero_title text not null,
  hero_description text not null,
  planning_title text not null,
  how_works_title text not null,
  how_works_desc text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 'default')
);

-- 2. Create how_it_works_steps table
CREATE TABLE IF NOT EXISTS public.how_it_works_steps (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'planning' or 'how'
  step_number text not null, -- '01', '02', etc.
  title text not null,
  description text not null,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.how_it_works_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;

-- 4. Select policies (public read access)
DROP POLICY IF EXISTS "Allow public read access to how_it_works_settings" ON public.how_it_works_settings;
CREATE POLICY "Allow public read access to how_it_works_settings" ON public.how_it_works_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to how_it_works_steps" ON public.how_it_works_steps;
CREATE POLICY "Allow public read access to how_it_works_steps" ON public.how_it_works_steps FOR SELECT USING (true);

-- 5. Write policies (authenticated users only)
DROP POLICY IF EXISTS "Allow authenticated users to manage how_it_works_settings" ON public.how_it_works_settings;
CREATE POLICY "Allow authenticated users to manage how_it_works_settings" ON public.how_it_works_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage how_it_works_steps" ON public.how_it_works_steps;
CREATE POLICY "Allow authenticated users to manage how_it_works_steps" ON public.how_it_works_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Seed initial general page settings
INSERT INTO public.how_it_works_settings (id, hero_badge, hero_title, hero_description, planning_title, how_works_title, how_works_desc)
VALUES (
  'default',
  'INTRODUCING ATLAS LUMINA',
  'Crafting Your Next Odyssey.',
  'A fusion of high-end editorial curation and artificial intelligence. SnapTrip transforms wandering into precision exploration.',
  'The Art of Seamless Planning',
  'How It Works',
  'Snaptrip guides you through every step of your travel planning — from discovering destinations to creating a personalized itinerary. With simple tools and smart suggestions, you can plan your perfect trip quickly and without stress.'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed initial page steps (Art of Planning + Timeline walkthrough)
INSERT INTO public.how_it_works_steps (type, step_number, title, description, display_order)
VALUES 
  -- Planning steps
  ('planning', '01', 'Define Your Muse', 'Tell our AI your desired mood—whether it''s the quiet zen of Kyoto or the kinetic pulse of Berlin.', 0),
  ('planning', '02', 'Curated Logic', 'We calculate flight windows, seasonal shifts, and cultural events to anchor your dates perfectly.', 1),
  ('planning', '03', 'Dynamic Refinement', 'Your itinerary lives and breathes. Adjust one stop, and our system re-optimizes your entire journey.', 2),
  
  -- Walkthrough steps
  ('how', '01', 'Pick your destination', 'Search 10,000+ destinations. See trending spots, seasonal highlights.', 0),
  ('how', '02', 'Choose your travel style', 'Adventure, culture, or food tour? Tell us your vibe.', 1),
  ('how', '03', 'Set duration & budget', 'Pick travel dates and a daily budget auto-calculated.', 2),
  ('how', '04', 'Select attractions', 'Browse curated must-sees and hidden gems.', 3),
  ('how', '05', 'Itinerary Complete!', 'Download your full plan maps and bookings.', 4)
ON CONFLICT DO NOTHING;

-- 8. Force schema reload
NOTIFY pgrst, 'reload schema';
