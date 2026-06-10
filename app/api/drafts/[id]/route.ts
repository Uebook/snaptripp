import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const { data: draft, error } = await supabase
            .from('draft_trips')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Get draft error:", error);
            return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, draft });

    } catch (error: any) {
        console.error('Fetch Draft Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { data } = await request.json();

        if (!data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
            .from('draft_trips')
            .update({ data })
            .eq('id', id);

        if (error) {
            console.error("Update draft error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, draftId: id });

    } catch (error: any) {
        console.error('Update Draft Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
