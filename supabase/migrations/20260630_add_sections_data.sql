-- Migration to add sections_data JSONB column to country_guides
ALTER TABLE public.country_guides ADD COLUMN IF NOT EXISTS sections_data jsonb DEFAULT '{}'::jsonb;

-- Force schema reload to refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
