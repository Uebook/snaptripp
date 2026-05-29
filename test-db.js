import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing supabase upsert to user_city_ratings without auth...");
  const { data, error } = await supabase.from('user_city_ratings').insert([{
    user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
    country: 'Test',
    city: 'Test City'
  }]);
  
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }
}
test();
