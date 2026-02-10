import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state');

  if (!state) {
    return NextResponse.json(
      { error: 'State parameter is required' },
      { status: 400 }
    );
  }

  // Check cache
  const cacheKey = `state-cities-${state.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    const response = NextResponse.json(cached.data);
    response.headers.set('Cache-Control', 'public, s-maxage=300');
    response.headers.set('X-Cache', 'HIT');
    return response;
  }

  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Apify API token is not configured' },
      { status: 500 }
    );
  }

  try {
    const client = new ApifyClient({
      token: apiToken,
      timeoutSecs: 120,
      maxRetries: 2,
    });

    // Search for cities in the state
    const input = {
      searchStringsArray: ['city', 'town'],
      locationQuery: state,
      maxCrawledPlacesPerSearch: 20, // Get cities
      language: 'en',
      searchMatching: 'all',
      website: 'allPlaces',
      skipClosedPlaces: true,
      scrapePlaceDetailPage: false,
      scrapeTableReservationProvider: false,
      includeWebResults: false,
      scrapeDirectories: false,
      maxQuestions: 0,
      scrapeContacts: false,
      scrapeSocialMediaProfiles: {
        facebooks: false,
        instagrams: false,
        youtubes: false,
        tiktoks: false,
        twitters: false
      },
      maximumLeadsEnrichmentRecords: 0,
      maxReviews: 0,
      reviewsSort: 'newest',
      reviewsFilterString: '',
      reviewsOrigin: 'all',
      scrapeReviewsPersonalData: false,
      maxImages: 0,
      scrapeImageAuthors: false,
    };

    const run = await client.actor('compass/crawler-google-places').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Transform to city format
    const cities = items.slice(0, 20).map((item: any, index: number) => {
      let lat: number | null = null;
      let lng: number | null = null;
      
      if (item.location) {
        if (typeof item.location === 'object' && !Array.isArray(item.location)) {
          lat = item.location.lat || item.location.latitude || null;
          lng = item.location.lng || item.location.longitude || item.location.lon || null;
        } else if (Array.isArray(item.location)) {
          lat = item.location[0];
          lng = item.location[1];
        }
      }

      return {
        id: `city-${index}`,
        name: item.title || item.name || 'Unknown City',
        type: 'city',
        coordinates: lat && lng ? { lat, lng } : { lat: 0, lng: 0 },
        data: {
          address: item.address,
          rating: item.totalScore || item.rating,
        }
      };
    });

    const responseData = {
      success: true,
      state: state,
      cities: cities,
      count: cities.length,
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'public, s-maxage=300');
    response.headers.set('X-Cache', 'MISS');
    return response;
  } catch (error: any) {
    console.error('State API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch state data',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
