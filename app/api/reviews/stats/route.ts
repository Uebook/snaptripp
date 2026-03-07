
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Fetch all reviews
        const { data: reviews, error } = await supabaseAdmin
            .from('traveler_reviews')
            .select('*');

        if (error) throw error;

        // Aggregate by country
        const stats: Record<string, any> = {};

        reviews?.forEach(rev => {
            if (!stats[rev.country]) {
                stats[rev.country] = {
                    name: rev.country,
                    count: 0,
                    sightseeing: 0,
                    localPeople: 0,
                    serviceQuality: 0,
                    safety: 0,
                    price: 0,
                    cities: new Set()
                };
            }

            const s = stats[rev.country];
            s.count++;
            s.sightseeing += rev.sightseeing_rating || 0;
            s.localPeople += rev.local_people_rating || 0;
            s.serviceQuality += rev.service_quality_rating || 0;
            s.safety += rev.safety_rating || 0;
            s.price += rev.price_rating || 0;

            if (rev.selected_cities) {
                rev.selected_cities.forEach((c: string) => s.cities.add(c));
            }
        });

        // Finalize averages and intensity
        const result: Record<string, any> = {};
        Object.keys(stats).forEach(name => {
            const s = stats[name];
            const avg = (val: number) => parseFloat((val / s.count).toFixed(1));

            // Determine intensity
            let intensity = 'visited';
            const cityCount = s.cities.size;
            if (cityCount >= 7 || s.count >= 10) intensity = 'corner';
            else if (cityCount >= 4 || s.count >= 5) intensity = 'thoroughly';
            else if (cityCount >= 2 || s.count >= 2) intensity = 'bit';

            result[name] = {
                name,
                intensity,
                sightseeing: avg(s.sightseeing),
                localPeople: avg(s.localPeople),
                serviceQuality: avg(s.serviceQuality),
                safety: avg(s.safety),
                price: avg(s.price),
                reviewCount: s.count,
                cityCount
            };
        });

        return NextResponse.json({ success: true, stats: result });

    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
