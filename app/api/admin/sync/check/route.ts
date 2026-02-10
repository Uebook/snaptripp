import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    try {
        // Check if any places exist for this country
        const { count, error } = await supabase
            .from('places')
            .select('*', { count: 'exact', head: true })
            .eq('country', country);

        if (error) {
            // If table doesn't exist, we'll treat it as not synced
            if (error.code === 'PGRST116' || error.message.includes('relation "places" does not exist')) {
                return NextResponse.json({ synced: false, count: 0, cities: [], tableMissing: true });
            }
            throw error;
        }

        // Get count per city
        const { data: cityData, error: cityError } = await supabase
            .from('places')
            .select('city')
            .eq('country', country);

        const cityCounts: { [key: string]: number } = {};
        if (cityData) {
            cityData.forEach((item: any) => {
                const cityName = item.city || 'Unknown';
                cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
            });
        }

        const cities = Object.entries(cityCounts).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count);

        return NextResponse.json({
            synced: (count || 0) > 0,
            count: count || 0,
            cities: cities
        });

    } catch (error: any) {
        console.error('Check Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
