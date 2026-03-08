-- Add preferences column to profiles table
alter table public.profiles
  add column if not exists preferences jsonb default '{"email_notifications": true, "travel_recommendations": true, "public_profile": true}'::jsonb;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
