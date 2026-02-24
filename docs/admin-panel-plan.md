# Admin Panel Implementation Plan: Destination & Trip Content Management

## Overview
This document outlines the plan to enhance the **Admin Panel** to manage rich destination content (Country Overviews, Bucket Lists, Local Foods, etc.) and integrate it into the **Website** (specifically the comprehensive Trip Generation result view and Explore page).

## 1. Objective
Enable administrators to curate and manage detailed information for countries and major destinations. This data will be displayed to users after they generate a trip (or on the explore page), providing high-value travel insights beyond just a list of places.

**Crucial Note:** We currently have a `places` table populated via Apify sync. This table stores individual Points of Interest (POIs) like museums and parks. We need a **new layer** on top of this to store the rich, destination-level guide content (Overview, Culture, Foods) shown in the screenshot.

## 2. Key Features to Implement (Based on Screenshot)

We will add a new **"Destination Management"** module in the Admin Panel to support the following rich content fields for each Country/State/City:

### A. Core Destination Data (New `destinations` Table)
*   **Brief Country/City Overview**: A rich text description of the destination.
*   **Must Do Bucket-List**: A list of top activities or experiences (e.g., "Visit the Cliffs of Moher", "Kiss the Blarney Stone").
*   **Must Try Foods**: A curated list of local delicacies with images and descriptions.
*   **Common Phrases**: A reference guide for local language phrases (e.g., "Hello" -> "Dia duit").
*   **Local Transportation Options**: Information on how to get around (Bus, Train, Car Rental tips).
*   **Best Time to Visit**: (Optional but recommended) Seasonal advice.
*   **Currency & Visa Info**: (Optional) Practical travel details.

### B. Admin Panel UI Updates
*   **Destination Editor (`app/admin/locations`)**:
    *   Transform `app/admin/locations/page.tsx` from local state to a **Supabase-backed** interface.
    *   **Auto-Discovery**: It should automatically list countries found in the `places` table (via `/api/admin/sync/countries`) so admins can easily add rich content to them.
    *   **Rich Editor**: A form to input Overview, Foods (with image upload/URL), Phrases, etc.

### C. Website Integration
*   **Trip Generation & Explore Page**:
    *   **API**: Create `/api/destinations` to fetch this rich content by country/city name.
    *   **Frontend**: Create a new `DestinationGuide` component (matching the screenshot design) to display the Overview, Bucket List, Foods, etc.
    *   **Integration Points**:
        *   **Explore Page (`app/explore/page.tsx`)**: Update `ItinerarySidebar` to fetch and display this `DestinationGuide` when a country is selected.
        *   **Trip Result Page (`app/trip-map/page.tsx`)**: Add a new "Guide" tab/section in the sidebar to show this info alongside the generated itinerary.

## 3. Database Schema (Supabase)

We need to create a new `destinations` table to hold the rich content. It will be linked loosely by `name` (and potentially `type`) to the existing `places` data.

```sql
create table destinations (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- Matches 'country' or 'city' in places table
  type text not null, -- 'country', 'state', 'city'
  
  -- Rich Content Fields (Matches Screenshot)
  overview text,
  bucket_list jsonb, -- Array of { text, image_url (optional) }
  local_foods jsonb, -- Array of { name, description, image_url }
  local_phrases jsonb, -- Array of { phrase, translation, pronunciation }
  transportation_info text, -- Rich text or JSON
  
  cover_image_url text, -- Main hero image for the destination
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(name, type)
);
```

## 4. Implementation Steps

### Phase 1: Database Setup
1.  **Migration**: Run the SQL to create the `destinations` table.
2.  **Initial Seed**: Insert a sample record for "Ireland" (matching the screenshot) to test the structure.

### Phase 2: Admin Panel Development (`app/admin/locations`)
1.  **Fetch Countries**: Use the existing `/api/admin/sync/countries` to populate the list of available destinations to edit.
2.  **Edit Form**: Build a comprehensive form in `AdminLocations` to upsert data into the `destinations` table.
    *   Include dynamic list inputs for "Foods", "Bucket List", and "Phrases".

### Phase 3: API Development
1.  **Read Endpoint**: Create `app/api/destinations/route.ts` (GET) to fetch guide data by `name`.
2.  **Write Endpoint**: Create `app/api/admin/destinations/route.ts` (POST/PUT) for the admin panel to save data.

### Phase 4: Frontend Integration
1.  **Component**: Build the `DestinationGuide` component.
    *   **Design**: Use cards for foods, a clean list for phrases, and a hero section for the overview.
2.  **Explore Page Integration**:
    *   Modify `ItinerarySidebar` in `app/components/ItinerarySidebar.tsx`.
    *   When a user clicks a country/state, fetch `destinations` data.
    *   If data exists, render the `DestinationGuide` component.
3.  **Trip Map Integration**:
    *   In `app/trip-map/page.tsx`, fetch the destination data for the trip's country.
    *   Display it in the sidebar (either above the places list or in a separate tab).

## 5. Timeline & Priorities
*   **Immediate**: Set up DB schema and Admin interface to allow content entry.
*   **Next**: Build the Frontend display components.
*   **Continuous**: Admins populate data for top destinations (Ireland, UK, etc.).
