
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixRLS() {
    console.log('--- Applying RLS Fixes ---');

    // 1. Storage - Ensure bucket and policies
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'avatars')) {
        await supabase.storage.createBucket('avatars', { public: true });
        console.log('Bucket "avatars" created.');
    }

    // Note: We can't run raw SQL (CREATE POLICY) via the JS client easily.
    // But we can check if the user can update their profile.
    // Actually, I'll use the CLI if available, or just instruct the user.
    // Wait, I can try to use a simple data operation to see if RLS is the issue.

    console.log('RLS settings cannot be fully applied via JS client without an RPC.');
    console.log('Please run the SQL in supabase/migrations/20260307_fix_profile_storage_rls.sql in the Supabase Dashboard SQL Editor.');
}

fixRLS();
