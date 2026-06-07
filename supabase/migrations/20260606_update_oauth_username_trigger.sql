-- Update the handle_new_user trigger function to auto-generate a username if missing
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  base_username text;
  new_username text;
  counter int := 1;
BEGIN
  -- Determine base username
  -- If full_name exists (OAuth), clean it. Else use the first part of the email.
  IF new.raw_user_meta_data->>'username' IS NOT NULL THEN
    new_username := lower(new.raw_user_meta_data->>'username');
  ELSIF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    base_username := lower(regexp_replace(new.raw_user_meta_data->>'full_name', '[^a-zA-Z0-9]', '', 'g'));
    -- Ensure at least 3 characters
    IF length(base_username) < 3 THEN
      base_username := base_username || 'user';
    END IF;
    new_username := base_username;
  ELSE
    base_username := lower(split_part(new.email, '@', 1));
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
    IF length(base_username) < 3 THEN
      base_username := base_username || 'user';
    END IF;
    new_username := base_username;
  END IF;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
    new_username := base_username || counter::text;
    counter := counter + 1;
  END LOOP;

  INSERT INTO public.profiles (id, full_name, avatar_url, email, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new_username
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    updated_at = NOW();
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
