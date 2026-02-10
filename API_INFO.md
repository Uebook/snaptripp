# Snaptrip API Information

## API Endpoints

### 1. Get Attractions for a City
**URL:** `http://localhost:3000/api/itinerary?city={cityName}`

**Method:** GET

**Example:**
```
http://localhost:3000/api/itinerary?city=delhi
http://localhost:3000/api/itinerary?city=paris
http://localhost:3000/api/itinerary?city=new%20york
```

**Response Format:**
```json
{
  "success": true,
  "city": "delhi",
  "itinerary": [...],
  "count": 20
}
```

### 2. Get Personalized Itinerary
**URL:** `http://localhost:3000/api/itinerary/personalized`

**Method:** POST

**Body:**
```json
{
  "city": "delhi",
  "days": 3,
  "preferences": {}
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/itinerary/personalized \
  -H "Content-Type: application/json" \
  -d '{"city":"delhi","days":3}'
```

## How to Check Console Logs

### Server-Side Console (Terminal)
1. Open the terminal where you ran `npm run dev`
2. You'll see logs like:
   - `=== API ROUTE CALLED ===`
   - `URL: http://localhost:3000/api/itinerary?city=delhi`
   - `City parameter: delhi`
   - `API Token exists: true`
   - `Creating Apify client...`
   - `Calling Apify actor: ...`
   - Any errors will be logged with `=== APIFY API ERROR ===`

### Client-Side Console (Browser)
1. Open your browser (Chrome/Firefox)
2. Press `F12` or `Right-click → Inspect`
3. Go to the **Console** tab
4. You'll see logs like:
   - `=== CLIENT API CALL ===`
   - `API URL: /api/itinerary?city=delhi`
   - `Full URL: http://localhost:3000/api/itinerary?city=delhi`
   - `Response status: 200` or error status
   - `Response data: {...}`

### Network Tab (Browser)
1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Click on the request to `/api/itinerary`
4. Check:
   - **Headers**: Request/Response headers
   - **Payload**: Request parameters
   - **Response**: JSON response data
   - **Status**: HTTP status code

## Testing the API Directly

### Using curl:
```bash
# Test attractions endpoint
curl "http://localhost:3000/api/itinerary?city=delhi"

# Test personalized endpoint
curl -X POST http://localhost:3000/api/itinerary/personalized \
  -H "Content-Type: application/json" \
  -d '{"city":"delhi","days":3}'
```

### Using browser:
Just open the URL directly:
```
http://localhost:3000/api/itinerary?city=delhi
```

## Common Issues

1. **Actor requires payment**: The Apify actor may need to be rented. Check the error message for details.
2. **API token not found**: Make sure `.env.local` exists with `APIFY_API_TOKEN=your_token`
3. **Server not running**: Make sure `npm run dev` is running

## Apify Actor Used

**Google Maps Scraper** (`compass/crawler-google-places`)
- Extracts business data from Google Maps
- Searches by location and multiple search terms
- Returns: names, addresses, phone, website, ratings, reviews, categories, images, opening hours, and more
- Has a free trial option - check [Apify Store](https://apify.com/compass/crawler-google-places) for current pricing

## API Input Format

The Google Maps Scraper accepts:
```json
{
  "locationQuery": "city name",
  "searchQueries": ["tourist attractions", "things to do", ...],
  "maxCrawledPlaces": 20,
  "language": "en"
}
```
