-- Add demo fields to how_it_works_settings table
ALTER TABLE public.how_it_works_settings 
ADD COLUMN IF NOT EXISTS demo_i_time_1 text not null default '08',
ADD COLUMN IF NOT EXISTS demo_i_label_1 text not null default 'MORNING ARRIVAL',
ADD COLUMN IF NOT EXISTS demo_i_title_1 text not null default 'Tokyo Narita Express',
ADD COLUMN IF NOT EXISTS demo_i_price_1 text not null default '$32.00',
ADD COLUMN IF NOT EXISTS demo_i_desc_1 text not null default 'Direct transfer to Shinjuku. Our concierge has pre-booked your green car seats for maximum comfort.',
ADD COLUMN IF NOT EXISTS demo_i_tags_1 text not null default 'TRANSPORT, PRE-PAID',
ADD COLUMN IF NOT EXISTS demo_i_time_2 text not null default '13',
ADD COLUMN IF NOT EXISTS demo_i_label_2 text not null default 'LUNCH ENGAGEMENT',
ADD COLUMN IF NOT EXISTS demo_i_title_2 text not null default 'Kozue, Park Hyatt',
ADD COLUMN IF NOT EXISTS demo_i_price_2 text not null default '$120.00',
ADD COLUMN IF NOT EXISTS demo_i_desc_2 text not null default 'Contemporary Japanese dining with views across the Tokyo skyline. Window table confirmed.',
ADD COLUMN IF NOT EXISTS demo_i_img_2 text not null default '/images/how_food.png',
ADD COLUMN IF NOT EXISTS demo_i_ai_suggestion text not null default 'Based on current weather, we recommend visiting the Gyoen Garden at 4:00 PM for optimal lighting.',
ADD COLUMN IF NOT EXISTS demo_map_placeholder text not null default 'Live Map Visualization',
ADD COLUMN IF NOT EXISTS demo_support_placeholder text not null default '24/7 Concierge Support';

-- Force schema reload
NOTIFY pgrst, 'reload schema';
