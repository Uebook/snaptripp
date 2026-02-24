import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get('country');

        if (!country) {
            return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
        }

        // Get all places for the selected country with coordinates
        const { data: places, error: placesError } = await supabase
            .from('places')
            .select('id, title, city, country, location_lat, location_lng, categoryName, description, address, phone, website, image_url, reviewsCount')
            .eq('country', country)
            .not('location_lat', 'is', null)
            .not('location_lng', 'is', null)
            .limit(200);

        if (placesError) throw placesError;

        // Also fetch country info from destinations table
        const { data: destination, error: destError } = await supabase
            .from('destinations')
            .select('*')
            .eq('name', country)
            .eq('type', 'country')
            .single();

        // Don't throw if destination not found, just return null
        const countryInfo = destError ? null : destination;

        return NextResponse.json({
            success: true,
            places: places || [],
            countryInfo
        });


    } catch (error: any) {
        console.error('Fetch Places Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
