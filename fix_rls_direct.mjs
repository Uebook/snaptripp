
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applyFixes() {
    console.log('--- Fixing RLS and Storage ---');

    // 1. Ensure 'avatars' bucket exists and is public
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('avatars');
    if (bucketError && bucketError.message.includes('not found')) {
        console.log('Creating "avatars" bucket...');
        await supabase.storage.createBucket('avatars', { public: true });
    } else if (!bucket?.public) {
        console.log('Updating "avatars" bucket to public...');
        await supabase.storage.updateBucket('avatars', { public: true });
    } else {
        console.log('Bucket "avatars" already exists and is public.');
    }

    // 2. We can't run raw SQL (CREATE POLICY) via the JS client easily.
    // But we can check if the profile exists and is updatable by trying a dummy update with admin.
    // The error "new row violates row-level security policy" specifically happens on INSERT/UPDATE.

    console.log('NOTE: Raw SQL policies must be applied in the Supabase Dashboard.');
    console.log('Applying direct data fixes if possible...');

    // Check profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

    if (profileError) {
        console.warn('Could not read profiles:', profileError.message);
    } else {
        console.log('Profiles table is accessible.');
    }

    console.log('Fix script finished. Please ensure SQL policies from supabase/migrations/20260307_fix_profile_storage_rls.sql are run in the dashboard.');
}

applyFixes();
