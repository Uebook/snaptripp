-- Add missing fields to profiles table
alter table public.profiles
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists bio text;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
