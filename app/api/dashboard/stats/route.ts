import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as adminSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
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

        // 1. Fetch Trips for country and basic count
        const { data: trips, error: tripsError } = await supabase
            .from('trips')
            .select('id, country')
            .eq('user_id', user.id);

        if (tripsError) throw tripsError;

        const totalTrips = trips.length;
        const uniqueCountries = Array.from(new Set(trips.map(t => t.country))).filter(Boolean).length;

        // 2. Fetch Places Count (via trip_days and trip_items)
        const tripIds = trips.map(t => t.id);
        let totalPlaces = 0;

        if (tripIds.length > 0) {
            const { data: days, error: daysError } = await supabase
                .from('trip_days')
                .select('id')
                .in('trip_id', tripIds);

            if (!daysError && days && days.length > 0) {
                const dayIds = days.map(d => d.id);
                const { count, error: itemsError } = await supabase
                    .from('trip_items')
                    .select('*', { count: 'exact', head: true })
                    .in('day_id', dayIds);

                if (!itemsError) totalPlaces = count || 0;
            }
        }

        // 3. Mock Reviews for now as review table might not be implemented yet
        const totalReviews = 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalTrips,
                countries: uniqueCountries,
                places: totalPlaces,
                reviews: totalReviews
            }
        });

    } catch (error: any) {
        console.error('Fetch Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
