import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    // Get unique countries by grouping or just selecting all and creating a set
    const { data, error } = await supabase.from('places').select('country').limit(5000);
    const unique = new Set(data.map(d => d.country));
    console.log("Unique countries in DB:", Array.from(unique));
}

check();
