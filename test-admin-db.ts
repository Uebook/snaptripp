import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('Profiles:', profiles, 'Error:', profileError);

  const { data: allTrips, error: tripError } = await supabaseAdmin
    .from('trips')
    .select('id, user_id, title, destination, start_date, end_date')
    .order('start_date', { ascending: false });

  console.log('Trips:', allTrips, 'Error:', tripError);
}
test();
