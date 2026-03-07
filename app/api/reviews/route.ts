import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET: Fetch reviews (either by country or for the current user)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get('country');

        if (country) {
            // Fetch all reviews for this country (public data)
            const { data, error } = await supabaseAdmin
                .from('traveler_reviews')
                .select('*')
                .eq('country', country)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return NextResponse.json({ success: true, reviews: data });
        }

        // If no country, fetch reviews for current user (requires auth)
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('traveler_reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, reviews: data });

    } catch (error: any) {
        console.error('Fetch Reviews Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Save a new review
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            country,
            selected_cities,
            sightseeing_rating,
            local_people_rating,
            service_quality_rating,
            safety_rating,
            price_rating,
            review_text
        } = body;

        if (!country) {
            return NextResponse.json({ error: 'Country is required' }, { status: 400 });
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

        const { data: review, error: reviewError } = await supabase
            .from('traveler_reviews')
            .insert({
                user_id: user.id,
                country,
                selected_cities: selected_cities || [],
                sightseeing_rating,
                local_people_rating,
                service_quality_rating,
                safety_rating,
                price_rating,
                review_text
            })
            .select()
            .single();

        if (reviewError) throw reviewError;

        return NextResponse.json({ success: true, review });

    } catch (error: any) {
        console.error('Save Review Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
