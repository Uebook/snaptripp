
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    try {
        console.log('--- Fetching Comprehensive World Data ---');
        // This is a large file (~45MB)
        const res = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries+states+cities.json');
        const worldData = await res.json();

        console.log(`Loaded data for ${worldData.length} countries`);

        // 1. Countries
        const countries = worldData.map(c => ({
            id: c.id,
            name: c.name,
            iso3: c.iso3,
            iso2: c.iso2,
            phone_code: c.phonecode,
            capital: c.capital,
            currency: c.currency,
            native: c.native,
            emoji: c.emoji
        }));

        console.log('--- Syncing Countries ---');
        const { error: cError } = await supabase.from('countries').upsert(countries);
        if (cError) throw cError;
        console.log(`Synced ${countries.length} countries`);

        // 2. States
        const states = [];
        const cities = [];

        worldData.forEach(country => {
            if (country.states) {
                country.states.forEach(state => {
                    states.push({
                        id: state.id,
                        name: state.name,
                        country_id: country.id,
                        state_code: state.state_code
                    });

                    if (state.cities) {
                        state.cities.forEach(city => {
                            cities.push({
                                id: city.id,
                                name: city.name,
                                state_id: state.id,
                                country_id: country.id,
                                latitude: city.latitude,
                                longitude: city.longitude
                            });
                        });
                    }
                });
            }
        });

        console.log('--- Syncing States ---');
        const STATE_BATCH = 1000;
        for (let i = 0; i < states.length; i += STATE_BATCH) {
            const batch = states.slice(i, i + STATE_BATCH);
            const { error: sError } = await supabase.from('states').upsert(batch);
            if (sError) console.error(`State batch error at ${i}:`, sError.message);
        }
        console.log(`Synced ${states.length} states`);

        console.log('--- Syncing Cities (Batched) ---');
        const CITY_BATCH = 2000;
        for (let i = 0; i < cities.length; i += CITY_BATCH) {
            const batch = cities.slice(i, i + CITY_BATCH);
            const { error: batchError } = await supabase.from('cities').upsert(batch);
            if (batchError) {
                console.error(`City batch error at ${i}:`, batchError.message);
            }
            if (i % 10000 === 0) {
                console.log(`Progress: ${i}/${cities.length} cities synced...`);
            }
        }
        console.log('Successfully synced all data!');

    } catch (error) {
        console.error('Seeding failed:', error.message);
    }
}

seedData();
