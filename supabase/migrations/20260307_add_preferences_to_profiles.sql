
-- Add preferences column to profiles
alter table public.profiles
  add column if not exists preferences jsonb default '{}'::jsonb;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
