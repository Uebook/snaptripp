-- Add unique constraint and index for usernames
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
