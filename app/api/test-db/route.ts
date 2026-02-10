import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Test 1: Check if we can connect
        const { data: testData, error: testError } = await supabase
            .from('places')
            .select('count')
            .limit(1);

        console.log('Test query result:', { testData, testError });

        // Test 2: Get table info
        const { data: places, error: placesError } = await supabase
            .from('places')
            .select('*')
            .limit(5);

        console.log('Places query:', { places, placesError });

        // Test 3: Get distinct countries
        const { data: countries, error: countriesError } = await supabase
            .from('places')
            .select('country')
            .not('country', 'is', null);

        console.log('Countries query:', { countries, countriesError });

        return Response.json({
            success: true,
            connection: testError ? 'Failed' : 'Success',
            testError: testError?.message,
            placesCount: places?.length || 0,
            placesError: placesError?.message,
            countriesCount: countries?.length || 0,
            countriesError: countriesError?.message,
            samplePlaces: places,
            uniqueCountries: countries ? [...new Set(countries.map((c: any) => c.country))] : []
        });
    } catch (error: any) {
        console.error('DB Test Error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
