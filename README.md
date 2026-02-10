# Snaptrip

A Next.js travel planning application that uses Apify API to fetch city-wise itinerary and attraction data.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Apify API token:**
   
   Create a `.env.local` file in the root directory and add your Apify API token:
   ```
   APIFY_API_TOKEN=your_apify_api_token_here
   ```

   Your API token can be found at: https://console.apify.com/settings/integrations

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- **City-wise Attractions**: Search for attractions in any city using the Booking Attractions Scraper
- **Personalized Itineraries**: Generate multi-day itineraries for your destination
- **Real-time Data**: Fetches live data from Apify actors

## API Endpoints

- `GET /api/itinerary?city={cityName}` - Get attractions for a city
- `POST /api/itinerary/personalized` - Get personalized multi-day itinerary
  ```json
  {
    "city": "Paris",
    "days": 3,
    "preferences": {}
  }
  ```

## Apify Actors Used

- **Google Maps Scraper** (`compass/crawler-google-places`): Extracts data from Google Maps including:
  - Business names, addresses, contact info (phone, website)
  - Ratings, reviews, and review counts
  - Categories, descriptions, images
  - Opening hours, price ranges
  - Coordinates and location data
  
  This actor can search by location and multiple search terms to find tourist attractions, things to do, landmarks, and more. [Learn more](https://apify.com/compass/crawler-google-places)

## Learn More

- [Apify API Documentation](https://docs.apify.com/platform/integrations/api)
- [Next.js Documentation](https://nextjs.org/docs)
