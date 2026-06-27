import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase.rpc('get_tables_info');
    if (error) {
        // If RPC is not defined, query information_schema or write SQL
        console.log("RPC Error:", error.message);
        // Let's try querying standard tables to see what exists
        const tables = [
            'places', 'published_places', 'countries', 'states', 'cities', 
            'country_guides', 'country_guide_cities', 'country_guide_cards', 
            'country_guide_items', 'destinations', 'traveler_reviews'
        ];
        for (const t of tables) {
            const { count, error: err } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (err) {
                console.log(`Table ${t} does not exist or has error:`, err.message);
            } else {
                console.log(`Table ${t} exists with ${count} rows`);
            }
        }
    } else {
        console.log("Tables:", data);
    }
}

check();
