import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Cache for API responses (in-memory cache)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');

  console.log('=== API ROUTE CALLED ===');
  console.log('Next.js API URL:', request.url);
  console.log('City parameter:', city);

  if (!city) {
    console.log('ERROR: City parameter is missing');
    return NextResponse.json(
      { error: 'City parameter is required' },
      { status: 400 }
    );
  }

  // Check cache first
  const cacheKey = `itinerary-${city.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data for:', city);
    const response = NextResponse.json(cached.data);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Cache', 'HIT');
    return response;
  }

  const apiToken = process.env.APIFY_API_TOKEN;
  
  console.log('API Token exists:', !!apiToken);
  console.log('API Token length:', apiToken?.length || 0);
  
  if (!apiToken) {
    console.log('ERROR: Apify API token is not configured');
    return NextResponse.json(
      { error: 'Apify API token is not configured' },
      { status: 500 }
    );
  }

  try {
    // Initialize the ApifyClient with API token and optimized timeout
    // Reference: https://docs.apify.com/api/client/js/docs/getting-started
    console.log('Initializing ApifyClient...');
    const client = new ApifyClient({
      token: apiToken,
      timeoutSecs: 120, // 2 minute timeout (reduced for faster failure)
      maxRetries: 2, // Reduced retries for speed
    });

    // Prepare Actor input - MAXIMUM SPEED OPTIMIZATION
    // Minimal data, single search, fastest settings
    const input = {
      searchStringsArray: [
        'attractions' // Shortest search term for fastest results
      ],
      locationQuery: city,
      maxCrawledPlacesPerSearch: 10, // Only top 10 items
      language: 'en',
      searchMatching: 'all',
      website: 'allPlaces',
      skipClosedPlaces: true, // Skip closed places for speed
      scrapePlaceDetailPage: false, // CRITICAL: Disabled for speed
      scrapeTableReservationProvider: false,
      includeWebResults: false,
      scrapeDirectories: false,
      maxQuestions: 0,
      scrapeContacts: false, // CRITICAL: Disabled for speed
      scrapeSocialMediaProfiles: {
        facebooks: false,
        instagrams: false,
        youtubes: false,
        tiktoks: false,
        twitters: false
      },
      maximumLeadsEnrichmentRecords: 0,
      maxReviews: 0, // CRITICAL: No reviews for speed
      reviewsSort: 'newest',
      reviewsFilterString: '',
      reviewsOrigin: 'all',
      scrapeReviewsPersonalData: false,
      maxImages: 5, // Fetch up to 5 images per place
      scrapeImageAuthors: false,
    };

    console.log('Input parameters:', JSON.stringify(input, null, 2));
    console.log('=== CALLING APIFY ACTOR ===');
    console.log('Actor ID: compass/crawler-google-places');
    console.log('Method: client.actor().call()');
    const startTime = Date.now();

    // Run the Actor and wait for it to finish
    // Reference: https://docs.apify.com/api/client/js/docs/getting-started
    const run = await client.actor('compass/crawler-google-places').call(input);
    const elapsedTime = Date.now() - startTime;
    console.log(`Actor completed in ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s)`);

    console.log('Actor run completed. Run ID:', run.id);
    console.log('Run status:', run.status);
    console.log('Dataset ID:', run.defaultDatasetId);

    // Fetch and get Actor results from the run's dataset
    console.log('Fetching results from dataset...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log('Items fetched from Apify:', items.length);
    console.log('First item sample:', items[0] ? JSON.stringify(items[0]).substring(0, 200) : 'No items');

    // Limit to top 10 items and transform the data
    const limitedItems = items.slice(0, 10);
    const transformedItems = limitedItems.map((item: any) => {
      // Extract coordinates - Apify Google Maps Scraper returns coordinates in various formats
      let lat: number | null = null;
      let lng: number | null = null;
      
      // Check location object (most common format)
      if (item.location) {
        if (typeof item.location === 'object' && !Array.isArray(item.location)) {
          lat = item.location.lat || item.location.latitude || null;
          lng = item.location.lng || item.location.longitude || item.location.lon || null;
        } else if (Array.isArray(item.location)) {
          // If it's an array, it's usually [lat, lng] or [lng, lat]
          lat = item.location[0];
          lng = item.location[1];
        }
      }
      
      // Check coordinates object
      if ((!lat || !lng) && item.coordinates) {
        if (typeof item.coordinates === 'object' && !Array.isArray(item.coordinates)) {
          lat = item.coordinates.lat || item.coordinates.latitude || lat;
          lng = item.coordinates.lng || item.coordinates.longitude || item.coordinates.lon || lng;
        } else if (Array.isArray(item.coordinates)) {
          lat = item.coordinates[0] || lat;
          lng = item.coordinates[1] || lng;
        }
      }
      
      // Check direct lat/lng properties
      if (!lat && item.lat) lat = item.lat;
      if (!lng && item.lng) lng = item.lng;
      if (!lat && item.latitude) lat = item.latitude;
      if (!lng && item.longitude) lng = item.longitude;
      
      // Check googleMapsUrl for coordinates (sometimes coordinates are in the URL)
      if ((!lat || !lng) && item.googleMapsUrl) {
        const urlMatch = item.googleMapsUrl.match(/[?&]q=([0-9.-]+),([0-9.-]+)/);
        if (urlMatch) {
          lat = parseFloat(urlMatch[1]);
          lng = parseFloat(urlMatch[2]);
        }
      }

      return {
        name: item.title || item.name,
        title: item.title || item.name,
        description: item.description || item.category || item.subtitle,
        rating: item.totalScore || item.rating,
        location: item.address || item.location,
        address: item.address,
        phone: item.phone,
        website: item.website,
        url: item.url || item.googleMapsUrl,
        imageUrl: item.images?.[0] || item.thumbnail,
        images: item.images || (item.thumbnail ? [item.thumbnail] : []), // Array of all images
        category: item.category,
        reviewCount: item.reviewsCount,
        coordinates: lat && lng ? { lat, lng } : null,
        openingHours: item.openingHours,
        price: item.priceRange,
      };
    });

    const responseData = {
      success: true,
      city: city,
      itinerary: transformedItems,
      count: transformedItems.length,
      note: 'Showing top 10 attractions (optimized for speed)',
    };

    // Store in cache
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    // Limit cache size (keep last 50 entries)
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Cache', 'MISS');
    return response;
  } catch (error: any) {
    console.error('=== APIFY API ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch itinerary data',
        message: error.message || 'Unknown error',
        details: error.toString(),
        actorError: error.message?.includes('rent') ? 'This actor requires payment/rental. Please check Apify console for free alternatives.' : undefined
      },
      { status: 500 }
    );
  }
}
