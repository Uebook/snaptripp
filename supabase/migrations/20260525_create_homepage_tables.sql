-- 1. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  quote text not null,
  avatar_url text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create why_snaptrip table
CREATE TABLE IF NOT EXISTS public.why_snaptrip (
  id uuid default gen_random_uuid() primary key,
  icon text not null,
  title text not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_snaptrip ENABLE ROW LEVEL SECURITY;

-- 4. Select policies (public read access)
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access to testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to why_snaptrip" ON public.why_snaptrip;
CREATE POLICY "Allow public read access to why_snaptrip" ON public.why_snaptrip FOR SELECT USING (true);

-- 5. Write policies (authenticated users only)
DROP POLICY IF EXISTS "Allow authenticated users to manage testimonials" ON public.testimonials;
CREATE POLICY "Allow authenticated users to manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage why_snaptrip" ON public.why_snaptrip;
CREATE POLICY "Allow authenticated users to manage why_snaptrip" ON public.why_snaptrip FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Seed initial data
INSERT INTO public.why_snaptrip (icon, title, text)
VALUES 
('🗺️', 'Seamless and Intuitive', 'Plan your trip with ease using our clean and simple interface.'),
('⭐', 'Effortless Planning', 'Create personalized itineraries tailored to your unique travel style.'),
('⚡', 'Personalized Journeys', 'Our AI-powered engine finds the best places for your journey.'),
('💡', 'Expert Recommendations', 'Get handpicked recommendations from seasoned travelers.')
ON CONFLICT DO NOTHING;

INSERT INTO public.testimonials (name, location, quote, avatar_url, image_url)
VALUES 
('Riya Sharma', 'Dubai', 'Planning my trip was super easy and smooth. Loved the experience.', '/images/testimonial.png', '/images/testimonial.png'),
('Alex Chen', 'Tokyo', 'SnapTrip completely changed how I explore new cities. Highly recommend!', '/images/testimonial.png', '/images/explore_japan.png')
ON CONFLICT DO NOTHING;

-- 7. Force schema reload
NOTIFY pgrst, 'reload schema';
