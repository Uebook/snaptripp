-- 1. Create pages table for CMS
CREATE TABLE IF NOT EXISTS public.pages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    content text,
    meta_description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'unread' NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies for pages
DROP POLICY IF EXISTS "Allow public read access to pages" ON public.pages;
CREATE POLICY "Allow public read access to pages" ON public.pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage pages" ON public.pages;
CREATE POLICY "Allow authenticated users to manage pages" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for contact_messages
DROP POLICY IF EXISTS "Allow public to insert messages" ON public.contact_messages;
CREATE POLICY "Allow public to insert messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage messages" ON public.contact_messages;
CREATE POLICY "Allow authenticated users to manage messages" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default CMS pages
INSERT INTO public.pages (slug, title, content, meta_description) VALUES
('privacy', 'Privacy Policy', '<p>Your privacy policy content goes here.</p>', 'Our Privacy Policy'),
('terms', 'Terms of Use', '<p>Your terms of use content goes here.</p>', 'Our Terms of Use')
ON CONFLICT (slug) DO NOTHING;
