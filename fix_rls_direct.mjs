
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applyFixes() {
    console.log('--- Fixing RLS and Storage (Final) ---');

    // 1. Ensure 'avatars' bucket
    const { data: bucket } = await supabase.storage.getBucket('avatars');
    if (!bucket) {
        await supabase.storage.createBucket('avatars', { public: true });
    }

    // 2. We can't run raw SQL (CREATE POLICY) via the JS client easily.
    // HOWEVER, we can check if the user can UPSERT by trying a real update on an existing profile.
    // Let's assume the RLS needs to be applied in the dashboard.

    console.log('IMPORTANT: Please run the following SQL in your Supabase Dashboard SQL Editor:');
    console.log(`
-- 1. Profiles Table Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- 2. Storage Policies for 'avatars' bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
CREATE POLICY "Avatar upload policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
CREATE POLICY "Avatar update policy" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  `);

    // Try to update one profile to 'true' to ensure it works from code
    const { data: profs } = await supabase.from('profiles').select('id').limit(1);
    if (profs && profs.length > 0) {
        console.log('Updating a sample profile to check code-to-db link...');
        const { error } = await supabase.from('profiles').update({
            preferences: {
                email_notifications: true,
                travel_recommendations: true,
                public_profile: true
            }
        }).eq('id', profs[0].id);
        if (error) console.error('Update check failed:', error.message);
        else console.log('Successfully updated sample profile preferences.');
    }

    console.log('Check complete.');
}

applyFixes();
