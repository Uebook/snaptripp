CREATE TABLE IF NOT EXISTS public.user_city_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
    average_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city)
);

-- RLS Policies
ALTER TABLE public.user_city_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own city ratings" 
ON public.user_city_ratings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own city ratings" 
ON public.user_city_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own city ratings" 
ON public.user_city_ratings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own city ratings" 
ON public.user_city_ratings FOR DELETE 
USING (auth.uid() = user_id);
