import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            type,
            overview,
            bucket_list,
            local_foods,
            local_phrases,
            transportation_info,
            cover_image_url
        } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
        }

        // Upsert destination data
        const { data, error } = await supabase
            .from('destinations')
            .upsert({
                name,
                type,
                overview,
                bucket_list,
                local_foods,
                local_phrases,
                transportation_info,
                cover_image_url,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'name, type'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Save Destination Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
