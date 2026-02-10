import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { country, city, cities, searchTerms } = await request.json();

        if (!country) {
            return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        const apiToken = process.env.APIFY_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'Apify API token missing' }, { status: 500 });
        }

        const client = new ApifyClient({ token: apiToken });
        const targetCities = cities && Array.isArray(cities) ? cities : (city ? [city] : [null]);

        let allSyncedItems: any[] = [];

        for (const targetCity of targetCities) {
            // 1. Prepare crawler input
            const input = {
                searchStringsArray: searchTerms || [
                    'tourist attractions',
                    'must visit places',
                    targetCity ? `visit ${targetCity}` : `visit ${country}`,
                    'popular attractions'
                ],
                locationQuery: targetCity ? `${targetCity}, ${country}` : country,
                maxCrawledPlacesPerSearch: 250, // Increased to 250 as requested
                language: 'en',
                scrapePlaceDetailPage: true,
                minScore: 4, // 4+ stars filter
                categoryWhitelist: [
                    'city park', 'garden', 'memorial park', 'park', 'tourist attraction',
                    'museum', 'art museum', 'history museum', 'science museum',
                    'landmark', 'historical landmark', 'monument', 'historical place',
                    'castle', 'palace', 'fortress', 'cathedral', 'church', 'basilica',
                    'temple', 'shrine', 'mosque', 'zoo', 'aquarium', 'botanical garden',
                    'national park', 'state park', 'viewpoint', 'observation deck',
                    'amusement park', 'theme park', 'water park'
                ]
            };

            // 2. Run crawler
            const run = await client.actor('compass/crawler-google-places').call(input);
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            // 3. Transform data to match requested columns (Internal to loop for context)
            const transformedCityData = items.map((item: any) => {
                // Robust coordinate extraction
                let lat: number | null = null;
                let lng: number | null = null;

                if (item.location) {
                    if (typeof item.location === 'object' && !Array.isArray(item.location)) {
                        lat = item.location.lat || item.location.latitude || null;
                        lng = item.location.lng || item.location.longitude || item.location.lon || null;
                    } else if (Array.isArray(item.location)) {
                        lat = item.location[0];
                        lng = item.location[1];
                    }
                }

                if ((!lat || !lng) && item.coordinates) {
                    if (typeof item.coordinates === 'object' && !Array.isArray(item.coordinates)) {
                        lat = item.coordinates.lat || item.coordinates.latitude || lat;
                        lng = item.coordinates.lng || item.coordinates.longitude || item.coordinates.lon || lng;
                    } else if (Array.isArray(item.coordinates)) {
                        lat = item.coordinates[0] || lat;
                        lng = item.coordinates[1] || lng;
                    }
                }

                if (!lat && item.lat) lat = item.lat;
                if (!lng && item.lng) lng = item.lng;
                if (!lat && item.latitude) lat = item.latitude;
                if (!lng && item.longitude) lng = item.longitude;

                if ((!lat || !lng) && item.googleMapsUrl) {
                    const urlMatch = item.googleMapsUrl.match(/[?&]q=([0-9.-]+),([0-9.-]+)/);
                    if (urlMatch) {
                        lat = parseFloat(urlMatch[1]);
                        lng = parseFloat(urlMatch[2]);
                    }
                }

                const data: any = {
                    website: item.website,
                    title: item.title || item.name,
                    subTitle: item.subTitle || item.category,
                    reviewsCount: item.reviewsCount,
                    postalCode: item.postalCode,
                    phone: item.phone,
                    description: item.description,
                    city: item.city || targetCity || country, // Correct fallback inside loop
                    categoryName: item.categoryName || item.category,
                    address: item.address,
                    country: country,
                    image_url: item.imageUrls?.[0] || item.imageUrl || null,
                    location_lat: lat,
                    location_lng: lng,
                };

                // Map opening hours (0-6)
                if (item.openingHours && Array.isArray(item.openingHours)) {
                    item.openingHours.forEach((oh: any, i: number) => {
                        if (i < 7) {
                            data[`openingHours_${i}_day`] = oh.day;
                            data[`openingHours_${i}_hours`] = oh.hours;
                        }
                    });
                }

                // Map additionalInfo (Accessibility, Children, Crowd, Pets, Planning)
                const mapAdditional = (category: string, dbCategory: string, labels: { [key: string]: string }, max: number) => {
                    for (let i = 0; i < max; i++) {
                        Object.values(labels).forEach(dbLabel => {
                            data[`ai_${dbCategory}_${i}_${dbLabel}`] = false;
                        });
                    }

                    if (item.additionalInfo && item.additionalInfo[category]) {
                        const categoryItems = item.additionalInfo[category];
                        categoryItems.forEach((val: any, i: number) => {
                            if (i < max) {
                                Object.entries(labels).forEach(([origScroll, dbLabel]) => {
                                    const key = `ai_${dbCategory}_${i}_${dbLabel}`;
                                    if (typeof val === 'object') {
                                        data[key] = val[origScroll] === true;
                                    } else if (typeof val === 'string') {
                                        data[key] = val === origScroll;
                                    }
                                });
                            }
                        });
                    }
                };

                mapAdditional('Accessibility', 'Acc', {
                    'Wheelchair accessible entrance': 'entrance',
                    'Wheelchair accessible parking lot': 'parking',
                    'Wheelchair accessible restroom': 'restroom'
                }, 5);
                mapAdditional('Children', 'Chld', { 'Good for kids': 'kids' }, 4);
                mapAdditional('Crowd', 'Crwd', { 'LGBTQ+ friendly': 'lgbtq' }, 4);
                mapAdditional('Pets', 'Pets', { 'Dogs allowed': 'dogs' }, 3);
                mapAdditional('Planning', 'Plan', { 'Getting tickets in advance recommended': 'tickets' }, 4);

                return data;
            });

            allSyncedItems = [...allSyncedItems, ...transformedCityData];
        }

        // 4. Audit Log (Log the first 2 items completely for inspection)
        console.log('=== DATA SYNC AUDIT START ===');
        console.log(`Summary: Syncing ${allSyncedItems.length} items for ${country}`);
        if (allSyncedItems.length > 0) {
            console.log('Sample Data (First Item):', JSON.stringify(allSyncedItems[0], null, 2));
        }
        console.log('=== DATA SYNC AUDIT END ===');

        // 5. Save to Supabase
        const { error } = await supabaseAdmin
            .from('places')
            .upsert(allSyncedItems, { onConflict: 'title,address' });

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${allSyncedItems.length} places for ${country}`,
            count: allSyncedItems.length
        });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
