import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as adminSupabase } from '@/lib/supabase';

// GET: Fetch all trips for the authenticated user
export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const token = request.headers.get('Authorization')?.split(' ')[1];
        let userId = null;

        if (token) {
            const { data: { user }, error } = await adminSupabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
            }
        } else {
            // Try getting session from cookie indirectly if needed, but bearer token is standard
            const { data: { session } } = await adminSupabase.auth.getSession();
            if (session) userId = session.user.id;
        }

        // For now, let's rely on RLS and just pass the request if possible, 
        // but since we are in a route handler, we might need to create a server client.
        // However, the existing 'supabase' export is a simple client. 
        // Let's use the standard approach: 

        // Actually, we can just use the Authorization header with the anon key if we were on client,
        // but here we are on server. 
        // Let's trust that the client sends the access token in the header.

        // BETTER APPROACH:
        // Use the token to create a scoped client or just getting the user.
        // Since we enabled RLS, we should ideally use a client that has the user's context.
        // But our `lib/supabase.ts` exports a static client.
        // We will fetch assuming the user is authenticated via the header token.

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        const { data, error } = await supabase
            .from('trips')
            .select(`
                *,
                days:trip_days(
                    *,
                    items:trip_items(*)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, trips: data });

    } catch (error: any) {
        console.error('Fetch Trips Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Save a new trip
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, country, days } = await request.json();

        if (!title || !country || !days) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

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

        // 1. Create Trip
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .insert({
                user_id: user.id,
                title,
                country,
                duration: `${days.length} Days`
            })
            .select()
            .single();

        if (tripError) throw tripError;

        // 2. Create Days and Items
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            const { data: dayData, error: dayError } = await supabase
                .from('trip_days')
                .insert({
                    trip_id: trip.id,
                    day_index: i,
                    title: day.title || `Day ${i + 1}`
                })
                .select()
                .single();

            if (dayError) throw dayError;

            if (day.items && day.items.length > 0) {
                const itemsToInsert = day.items.map((item: any, idx: number) => ({
                    day_id: dayData.id,
                    place_id: item.type === 'place' && item.data ? item.data.id : null,
                    custom_name: item.name,
                    order_index: idx,
                    note: item.note
                }));

                const { error: itemsError } = await supabase
                    .from('trip_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }
        }

        return NextResponse.json({ success: true, tripId: trip.id });

    } catch (error: any) {
        console.error('Save Trip Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
