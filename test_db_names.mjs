import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data } = await supabase.from('countries').select('name');
  const dbNames = data.map(d => d.name);
  const mapNames = JSON.parse(fs.readFileSync('map_names.json', 'utf8'));
  
  const unmapped = [];
  mapNames.forEach(mName => {
    if (!dbNames.includes(mName)) {
      unmapped.push(mName);
    }
  });
  console.log("Unmapped count:", unmapped.length);
  console.log("Unmapped:", unmapped.slice(0, 20));
}
run();
