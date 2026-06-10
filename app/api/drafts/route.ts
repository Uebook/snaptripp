import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { country, data } = await request.json();

        if (!country || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let userId = null;
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (token) {
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                userId = user.id;
            }
        }

        const { data: draft, error } = await supabase
            .from('draft_trips')
            .insert({
                user_id: userId,
                country,
                data
            })
            .select()
            .single();

        if (error) {
            console.error("Insert draft error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, draftId: draft.id });

    } catch (error: any) {
        console.error('Save Draft Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
