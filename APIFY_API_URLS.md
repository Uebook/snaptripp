# Apify API URLs and Console Information

## Architecture Overview

1. **Frontend** → Calls our Next.js API routes at `http://localhost:3000/api/itinerary` (local development)
2. **Next.js API Routes** → Call Apify's official API at `https://api.apify.com/v2/...`

## Apify API v2 Endpoints Used

Based on [Apify API v2 Documentation](https://docs.apify.com/api/v2):

### Run Actor Synchronously and Get Dataset Items

**Endpoint:**
```
POST https://api.apify.com/v2/acts/{actorId}/run-sync-get-dataset-items?token={YOUR_TOKEN}
```

**For Google Maps Scraper:**
```
POST https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token={YOUR_TOKEN}
```

**Request Body:**
```json
{
  "locationQuery": "city name",
  "searchStringsArray": ["tourist attractions", "things to do", ...],
  "maxCrawledPlacesPerSearch": 20,
  "language": "en",
  "skipClosedPlaces": false
}
```

**Response:**
Returns array of place items directly (no need to fetch dataset separately)

## Our Next.js API Routes

### 1. Get Attractions
- **URL:** `http://localhost:3000/api/itinerary?city={cityName}`
- **Method:** GET
- **Calls:** `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items`

### 2. Get Personalized Itinerary
- **URL:** `http://localhost:3000/api/itinerary/personalized`
- **Method:** POST
- **Body:** `{ "city": "cityName", "days": 3 }`
- **Calls:** `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items`

## Console Logs

### Server Console (Terminal)
When you call the API, you'll see:
```
=== API ROUTE CALLED ===
Next.js API URL: http://localhost:3000/api/itinerary?city=delhi
City parameter: delhi
=== CALLING APIFY API ===
Apify API URL: https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=...
Method: POST
Actor ID: compass~crawler-google-places
Apify API Response Status: 200
Items fetched from Apify: 20
```

### Browser Console (F12)
```
=== CLIENT API CALL ===
API URL: /api/itinerary?city=delhi
Full URL: http://localhost:3000/api/itinerary?city=delhi
Response status: 200
Response data: {success: true, city: "delhi", itinerary: [...], count: 20}
```

## Important Notes

- **localhost:3000** is only for our Next.js API routes (your backend)
- **api.apify.com** is the official Apify API endpoint (external service)
- The Next.js routes act as a proxy/backend that calls Apify's API
- All Apify API calls go to `https://api.apify.com/v2/...` (not localhost)

## Testing Directly

You can test the Apify API directly using curl:

```bash
curl -X POST "https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "locationQuery": "delhi",
    "searchStringsArray": ["tourist attractions"],
    "maxCrawledPlacesPerSearch": 10,
    "language": "en"
  }'
```

## References

- [Apify API v2 Documentation](https://docs.apify.com/api/v2)
- [Google Maps Scraper Actor](https://apify.com/compass/crawler-google-places)
