import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as adminSupabase } from '@/lib/supabase'; // Rename if needed, or remove if not used

// GET: Fetch a specific trip by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const tripId = params.id;
        if (!tripId) {
            return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
        }

        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create authenticated Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        // Fetch Trip with Days and Items
        const { data, error } = await supabase
            .from('trips')
            .select(`
                *,
                days:trip_days(
                    *,
                    items:trip_items(
                        *,
                        place:places(*)
                    )
                )
            `)
            .eq('id', tripId)
            // .eq('user_id', user.id) // RLS handles this now, but keeping it doesn't hurt
            .single();

        if (error) {
            throw error;
        }

        // Sort days and items in code since deep nested sorting in Supabase API can be tricky
        // (Though you can order by foreign key if set up). 
        // Let's do a quick sort here to be safe.
        if (data && data.days) {
            data.days.sort((a: any, b: any) => a.day_index - b.day_index);
            data.days.forEach((day: any) => {
                if (day.items) {
                    day.items.sort((a: any, b: any) => a.order_index - b.order_index);
                }
            });
        }

        return NextResponse.json({ success: true, trip: data });

    } catch (error: any) {
        console.error('Fetch Trip Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
