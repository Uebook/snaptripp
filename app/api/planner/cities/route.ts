import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get('country');

        if (!country) {
            return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
        }

        // Get distinct cities with their coordinates for the selected country
        const { data, error } = await supabase
            .from('places')
            .select('city, location_lat, location_lng')
            .eq('country', country)
            .not('city', 'is', null)
            .not('location_lat', 'is', null)
            .not('location_lng', 'is', null);

        if (error) throw error;

        // Group by city and get average coordinates for each city
        const cityMap = new Map<string, { lat: number; lng: number; count: number }>();

        data.forEach(place => {
            const existing = cityMap.get(place.city);
            if (existing) {
                existing.lat += place.location_lat;
                existing.lng += place.location_lng;
                existing.count += 1;
            } else {
                cityMap.set(place.city, {
                    lat: place.location_lat,
                    lng: place.location_lng,
                    count: 1
                });
            }
        });

        // Calculate average coordinates for each city
        const cities = Array.from(cityMap.entries()).map(([name, data]) => ({
            name,
            lat: data.lat / data.count,
            lng: data.lng / data.count
        }));

        return NextResponse.json({
            success: true,
            cities
        });

    } catch (error: any) {
        console.error('Fetch Cities Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
