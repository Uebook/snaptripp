import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Get distinct countries from the places table
        const { data, error } = await supabase
            .from('places')
            .select('country')
            .not('country', 'is', null);

        if (error) throw error;

        // Extract unique country names
        const uniqueCountries = [...new Set(data.map(item => item.country))];

        return NextResponse.json({
            success: true,
            countries: uniqueCountries
        });

    } catch (error: any) {
        console.error('Fetch Countries Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
