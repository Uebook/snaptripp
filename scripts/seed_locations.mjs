import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const COUNTRIES_CSV = './countries.csv';
const CITIES_CSV = './cities.csv';

async function seedCountries() {
    console.log('--- Starting Countries Seed ---');
    const countries = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(COUNTRIES_CSV)
            .pipe(csv())
            .on('data', (row) => {
                countries.push({
                    id: parseInt(row.id),
                    name: row.name,
                    iso3: row.iso3,
                    iso2: row.iso2,
                    phone_code: row.phonecode,
                    capital: row.capital,
                    currency: row.currency,
                    native: row.native,
                    emoji: row.emoji
                });
            })
            .on('end', async () => {
                console.log(`Parsed ${countries.length} countries. Starting upload...`);
                // Upsert in batches of 100
                for (let i = 0; i < countries.length; i += 100) {
                    const batch = countries.slice(i, i + 100);
                    const { error } = await supabase.from('countries').upsert(batch, { onConflict: 'id' });
                    if (error) {
                        console.error('Error inserting countries batch:', error);
                        reject(error);
                        return;
                    }
                    console.log(`Uploaded countries ${i + 1} to ${Math.min(i + 100, countries.length)}`);
                }
                console.log('--- Countries Seed Complete ---\n');
                resolve();
            });
    });
}

async function seedCities() {
    console.log('--- Starting Cities Seed ---');
    let batch = [];
    let totalParsed = 0;
    let totalUploaded = 0;
    const BATCH_SIZE = 2000;

    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(CITIES_CSV)
            .pipe(csv())
            .on('data', async (row) => {
                const city = {
                    id: parseInt(row.id),
                    name: row.name,
                    country_id: parseInt(row.country_id),
                    latitude: row.latitude ? parseFloat(row.latitude) : null,
                    longitude: row.longitude ? parseFloat(row.longitude) : null,
                };
                
                batch.push(city);
                totalParsed++;

                if (batch.length >= BATCH_SIZE) {
                    stream.pause(); // Pause stream to wait for async upload
                    const currentBatch = [...batch];
                    batch = [];
                    
                    const { error } = await supabase.from('cities').upsert(currentBatch, { onConflict: 'id' });
                    if (error) {
                        console.error('Error inserting cities batch:', error);
                        reject(error);
                        return;
                    }
                    totalUploaded += currentBatch.length;
                    console.log(`Uploaded ${totalUploaded} cities...`);
                    stream.resume(); // Resume stream after successful upload
                }
            })
            .on('end', async () => {
                // Upload remaining items
                if (batch.length > 0) {
                    const { error } = await supabase.from('cities').upsert(batch, { onConflict: 'id' });
                    if (error) {
                        console.error('Error inserting final cities batch:', error);
                        reject(error);
                        return;
                    }
                    totalUploaded += batch.length;
                    console.log(`Uploaded ${totalUploaded} cities...`);
                }
                console.log(`--- Cities Seed Complete! Total Uploaded: ${totalUploaded} ---\n`);
                resolve();
            });
    });
}

async function main() {
    try {
        await seedCountries();
        await seedCities();
        console.log('✅ Entire seed process finished successfully!');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
    }
}

main();
