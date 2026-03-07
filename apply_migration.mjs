
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
    console.log('--- Applying Preferences Migration ---');

    // 1. Get a valid user ID
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    if (!profiles || profiles.length === 0) {
        console.log('No profiles found. Cannot test.');
        return;
    }
    const userId = profiles[0].id;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                preferences: {
                    email_notifications: true,
                    travel_recommendations: true,
                    public_profile: true
                }
            })
            .eq('id', userId);

        if (error && error.message.includes('column "preferences" of relation "profiles" does not exist')) {
            console.log('Preferences column IS MISSING.');
        } else if (error) {
            console.log('Update failed with error:', error.message);
        } else {
            console.log('Preferences column EXISTS and updated successfully.');
        }
    } catch (err) {
        console.error('Migration test failed:', err);
    }
}

applyMigration();
