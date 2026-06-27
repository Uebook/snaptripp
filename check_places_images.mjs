import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: cols } = await supabase.from('places').select('*').limit(5);
    console.log("Sample places:", cols);

    const { data: withImg } = await supabase.from('places').select('*').not('image_url', 'is', null).limit(3);
    console.log("Places with image_url:", withImg);

    const { data: withPic } = await supabase.from('places').select('*').not('photo_url', 'is', null).limit(3);
    console.log("Places with photo_url:", withPic);
}

check();
