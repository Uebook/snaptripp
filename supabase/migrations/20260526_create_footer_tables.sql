-- 1. Create footer_settings table
CREATE TABLE IF NOT EXISTS public.footer_settings (
  id text primary key default 'default',
  description text not null,
  phone text not null,
  email text not null,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  youtube_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 'default')
);

-- 2. Create footer_links table
CREATE TABLE IF NOT EXISTS public.footer_links (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  category text not null, -- 'Quick Links', 'Support', or custom headings
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- 4. Select policies (public read access)
DROP POLICY IF EXISTS "Allow public read access to footer_settings" ON public.footer_settings;
CREATE POLICY "Allow public read access to footer_settings" ON public.footer_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to footer_links" ON public.footer_links;
CREATE POLICY "Allow public read access to footer_links" ON public.footer_links FOR SELECT USING (true);

-- 5. Write policies (authenticated users only)
DROP POLICY IF EXISTS "Allow authenticated users to manage footer_settings" ON public.footer_settings;
CREATE POLICY "Allow authenticated users to manage footer_settings" ON public.footer_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage footer_links" ON public.footer_links;
CREATE POLICY "Allow authenticated users to manage footer_links" ON public.footer_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Seed initial footer settings
INSERT INTO public.footer_settings (id, description, phone, email, facebook_url, twitter_url, instagram_url, youtube_url)
VALUES (
  'default',
  'Simplifying the way you plan, organize, and experience travel — so you can focus on what truly matters: the journey.',
  '(123) 456-7890',
  'ABC@gmail.com',
  '#',
  '#',
  '#',
  '#'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed initial footer links
INSERT INTO public.footer_links (label, url, category, display_order)
VALUES 
  ('Plan Your Trip', '/plan', 'Quick Links', 0),
  ('How it works', '/how-it-works', 'Quick Links', 1),
  ('Why Us', '/why-us', 'Quick Links', 2),
  ('Testimonial', '/testimonials', 'Quick Links', 3),
  ('Blog', '/blog', 'Quick Links', 4),
  ('Privacy Policy', '/privacy', 'Support', 0),
  ('Terms Of Use', '/terms', 'Support', 1)
ON CONFLICT DO NOTHING;

-- 8. Force schema reload
NOTIFY pgrst, 'reload schema';
