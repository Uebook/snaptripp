-- Add hero_bg_image to explore_settings
ALTER TABLE public.explore_settings
ADD COLUMN IF NOT EXISTS hero_bg_image text DEFAULT '/images/guide_hero.png';
