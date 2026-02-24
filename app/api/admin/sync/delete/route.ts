import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    try {
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
