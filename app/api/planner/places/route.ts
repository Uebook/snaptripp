import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get('country');

        if (!country) {
            return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
        }

        // Fetch ALL data from the published_places table for the selected country
        // This ensures the map only displays REAL curated places from the DB
        const { data: places, error: placesError } = await supabaseAdmin
            .from('published_places')
            .select('*')
            .ilike('country', country)
            .order('city', { ascending: true });

        if (placesError) throw placesError;

        // Fetch country info from destinations table for UI context
        const { data: destination, error: destError } = await supabaseAdmin
            .from('destinations')
            .select('*')
            .ilike('name', country)
            .eq('type', 'country')
            .single();

        return NextResponse.json({
            success: true,
            places: places || [],
            countryInfo: destError ? null : destination
        });

    } catch (error: any) {
        console.error('Fetch Places Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
