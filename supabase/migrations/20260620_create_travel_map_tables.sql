-- Create user_country_logs table
CREATE TABLE IF NOT EXISTS public.user_country_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    photo_url TEXT,
    ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
    average_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country)
);

-- RLS Policies for user_country_logs
ALTER TABLE public.user_country_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own country logs" 
ON public.user_country_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own country logs" 
ON public.user_country_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own country logs" 
ON public.user_country_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own country logs" 
ON public.user_country_logs FOR DELETE USING (auth.uid() = user_id);

-- Create user_city_logs table
CREATE TABLE IF NOT EXISTS public.user_city_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country, city)
);

-- RLS Policies for user_city_logs
ALTER TABLE public.user_city_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own city logs" 
ON public.user_city_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own city logs" 
ON public.user_city_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own city logs" 
ON public.user_city_logs FOR DELETE USING (auth.uid() = user_id);

-- Create travel_photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('travel_photos', 'travel_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for travel_photos
CREATE POLICY "Public Access for travel_photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'travel_photos' );

CREATE POLICY "Authenticated users can upload travel_photos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'travel_photos' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own travel_photos"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'travel_photos' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'travel_photos' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own travel_photos"
ON storage.objects FOR DELETE
USING ( bucket_id = 'travel_photos' AND auth.uid() = owner );

-- Force schema reload
NOTIFY pgrst, 'reload schema';
