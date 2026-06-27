import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_tables'); // Or try an introspective query
  console.log("RPC Data:", data);
  if (error) {
     const { data: qData, error: qErr } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
     console.log("Schema data:", qData);
     console.log("Schema err:", qErr);
  }
}
run();
