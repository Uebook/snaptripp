-- Add totalScore to places
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS "totalScore" double precision;
