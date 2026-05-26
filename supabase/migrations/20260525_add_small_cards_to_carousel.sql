ALTER TABLE public.home_carousel
ADD COLUMN small_card_1_title text,
ADD COLUMN small_card_1_image text,
ADD COLUMN small_card_2_title text,
ADD COLUMN small_card_2_image text;

NOTIFY pgrst, 'reload schema';
