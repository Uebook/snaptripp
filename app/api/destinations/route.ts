import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const type = searchParams.get('type'); // optional

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    try {
        let query = supabase
            .from('destinations')
            .select('*')
            .eq('name', name);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ data: null, message: "Destination not found" }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Fetch Destination Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
