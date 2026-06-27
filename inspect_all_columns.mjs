import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const tables = ['places', 'published_places', 'countries', 'states', 'cities', 'destinations'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
            console.log(`Error on table ${t}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`Table ${t} columns:`, Object.keys(data[0]));
            console.log(`Sample row for ${t}:`, data[0]);
        } else {
            console.log(`Table ${t} is empty`);
        }
    }
}

check();
