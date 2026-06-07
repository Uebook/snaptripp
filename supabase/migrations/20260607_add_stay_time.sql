-- Add stay_time column to places
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS stay_time text;

-- Add stay_time column to published_places
ALTER TABLE public.published_places ADD COLUMN IF NOT EXISTS stay_time text;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
