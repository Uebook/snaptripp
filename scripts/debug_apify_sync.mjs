import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugSync() {
    console.log('Starting debug sync...');

    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
        console.error('Error: APIFY_API_TOKEN not found in environment');
        return;
    }

    const client = new ApifyClient({ token: apiToken });
    const country = 'Maldives'; // Test with a small dataset
    const cities = ['Male'];

    const input = {
        searchStringsArray: [`visit ${cities[0]}, ${country}`],
        locationQuery: `${cities[0]}, ${country}`,
        maxCrawledPlacesPerSearch: 5, // Limit to 5 for quick debug
        language: 'en',
        scrapePlaceDetailPage: false, // Turn off for speed
    };

    try {
        console.log('Calling Apify Actor...');
        const run = await client.actor('compass/crawler-google-places').call(input);
        console.log(`Actor run finished. Dataset ID: ${run.defaultDatasetId}`);

        console.log('Fetching dataset items...');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log(`Fetched ${items.length} items.`);

        if (items.length > 0) {
            console.log('First item sample:', items[0].title);
        } else {
            console.warn('No items found.');
        }

    } catch (err) {
        console.error('Debug Sync Error:', err);
    }
}

debugSync();
