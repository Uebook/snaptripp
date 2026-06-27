import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { count: countryCount } = await supabase.from('countries').select('*', { count: 'exact', head: true });
    const { count: cityCount } = await supabase.from('cities').select('*', { count: 'exact', head: true });
    console.log("Country Count:", countryCount);
    console.log("City Count:", cityCount);

    const { data: sampleCountries } = await supabase.from('countries').select('*').limit(3);
    console.log("Sample Countries:", sampleCountries);

    const { data: sampleCities } = await supabase.from('cities').select('*').limit(3);
    console.log("Sample Cities:", sampleCities);
}

check();
