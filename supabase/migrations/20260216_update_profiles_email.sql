-- Add email and password columns to profiles if they don't exist
-- WARNING: Storing passwords in plain text is a security risk. This is done per user request.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN 
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF; 
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'password') THEN 
        ALTER TABLE public.profiles ADD COLUMN password text;
    END IF;
END $$;

-- Update the handle_new_user trigger function to include email
-- Note: Triggers on auth.users CANNOT access the raw password as it is hashed before insert.
-- Therefore, the password must be synced from the client side (AuthModal).
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
