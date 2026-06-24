import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    try {
        // 1. Fetch all place IDs for this country to handle foreign key dependencies
        const { data: places, error: fetchError } = await supabaseAdmin
            .from('places')
            .select('id')
            .eq('country', country);

        if (fetchError) throw fetchError;

        // 2. Delete dependent trip_items in chunks to avoid URL length limits
        if (places && places.length > 0) {
            const chunkSize = 200;
            for (let i = 0; i < places.length; i += chunkSize) {
                const chunkIds = places.slice(i, i + chunkSize).map(p => p.id);
                const { error: tripItemsError } = await supabaseAdmin
                    .from('trip_items')
                    .delete()
                    .in('place_id', chunkIds);
                    
                if (tripItemsError) {
                    console.error('Error deleting dependent trip items:', tripItemsError);
                    throw tripItemsError;
                }
            }
            
            // Also attempt to delete from published_places
            await supabaseAdmin.from('published_places').delete().eq('country', country);
        }

        // 3. Now delete the places themselves
        const { error } = await supabaseAdmin
            .from('places')
            .delete()
            .eq('country', country);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Successfully deleted all data for ${country}`
        });

    } catch (error: any) {
        console.error('Delete Country Data Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
