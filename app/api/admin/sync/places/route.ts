import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('places')
            .select('*')
            .eq('country', country)
            .order('title', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error('Fetch Country Places Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
