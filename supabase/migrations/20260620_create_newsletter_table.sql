CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the API to work if it uses anon key, though the API currently uses service_role key)
CREATE POLICY "Allow public insert" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Allow admins to read
CREATE POLICY "Allow admins to select" ON public.newsletter_subscribers
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );
