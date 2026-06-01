-- Add hero_bg_image to how_it_works_settings
ALTER TABLE public.how_it_works_settings
ADD COLUMN IF NOT EXISTS hero_bg_image text DEFAULT '/images/how_hero.png';
