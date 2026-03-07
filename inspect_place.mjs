import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to read .env.local
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
    supabaseKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';
} catch (e) { }

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlace() {
    const { data, error } = await supabase
        .from('places')
        .select('*')
        .limit(1);

    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data[0], null, 2));
}

checkPlace();
