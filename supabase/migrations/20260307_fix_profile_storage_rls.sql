
-- 1. Profiles Table Policies
-- Enable RLS (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" 
        ON public.profiles 
        FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Allow users to update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Allow users to view their own profile (and maybe others)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Profiles are viewable by everyone" 
        ON public.profiles 
        FOR SELECT 
        USING (true);
    END IF;
END $$;

-- 2. Storage Policies for 'avatars' bucket
-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy to allow users to upload their own avatar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar upload policy'
    ) THEN
        CREATE POLICY "Avatar upload policy"
        ON storage.objects
        FOR INSERT
        WITH CHECK (
            bucket_id = 'avatars' 
            AND (storage.foldername(name))[1] = 'avatars'
        );
    END IF;
END $$;

-- Policy to allow users to update their own avatar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar update policy'
    ) THEN
        CREATE POLICY "Avatar update policy"
        ON storage.objects
        FOR UPDATE
        USING (
            bucket_id = 'avatars' 
            AND (storage.foldername(name))[1] = 'avatars'
        );
    END IF;
END $$;

-- Policy to allow public access to avatars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar public access'
    ) THEN
        CREATE POLICY "Avatar public access"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'avatars');
    END IF;
END $$;
