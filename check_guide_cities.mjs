import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { count: guideCount } = await supabase.from('country_guides').select('*', { count: 'exact', head: true });
    const { count: guideCityCount } = await supabase.from('country_guide_cities').select('*', { count: 'exact', head: true });
    console.log("Guide Count:", guideCount);
    console.log("Guide City Count:", guideCityCount);

    const { data: guides } = await supabase.from('country_guides').select('*').limit(3);
    console.log("Sample Guides:", guides);

    const { data: guideCities } = await supabase.from('country_guide_cities').select('*').limit(3);
    console.log("Sample Guide Cities:", guideCities);
}

check();
