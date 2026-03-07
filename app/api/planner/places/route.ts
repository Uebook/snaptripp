import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get('country');

        console.log('API Fetch Places for country:', country);

        if (!country) {
            return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
        }

        // Get all places for the selected country with coordinates
        const { data: places, error: placesError } = await supabaseAdmin
            .from('places')
            .select('*')
            .eq('country', country)
            .not('location_lat', 'is', null)
            .not('location_lng', 'is', null)
            .limit(200);

        if (placesError) throw placesError;

        // Also fetch country info from destinations table
        const { data: destination, error: destError } = await supabaseAdmin
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
