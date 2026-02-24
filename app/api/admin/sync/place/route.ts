import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// DELETE a single place
export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    try {
        const { error } = await supabaseAdmin
            .from('places')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Place deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete Place Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT/PATCH to update a single place
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('places')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data[0],
            message: 'Place updated successfully'
        });

    } catch (error: any) {
        console.error('Update Place Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
