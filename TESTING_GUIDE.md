# Testing Guide for Snaptrip Hierarchical Map System

## ✅ Components Created

1. **HierarchicalMap** - Smart map with different marker types
2. **ItinerarySidebar** - Expandable sidebar with tree structure
3. **DragDropItinerary** - Top bar for building itinerary
4. **TimelineView** - Visual timeline of selected places
5. **SearchTypeDetector** - Detects city/state/country

## 🧪 How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test City Search
- Go to http://localhost:3000
- Enter a city name (e.g., "Delhi", "Paris", "New York")
- Click "Search"
- **Expected**: Map shows places with blue markers
- Click any marker → Sidebar opens with place details
- Click "Add" button → Place appears in top bar

### 3. Test State Search (Future Enhancement)
- Enter a state name (e.g., "California", "Maharashtra")
- **Expected**: Map shows cities with teal markers
- Click a city marker → Sidebar shows places in that city
- Click "Add" on a place → Adds to itinerary

### 4. Test Country Search (Future Enhancement)
- Enter a country name (e.g., "India", "USA")
- **Expected**: Map shows states with green markers
- Click state → Shows cities
- Click city → Shows places

### 5. Test Drag & Drop
- Add multiple places to itinerary (top bar)
- Drag items to reorder them
- Click × to remove items
- **Expected**: Items reorder smoothly

### 6. Test Timeline View
- Add at least 2 places to itinerary
- Click "Generate Timeline" button
- **Expected**: Timeline modal opens showing numbered steps
- Each step shows place details
- Click × to close timeline

### 7. Test Sidebar Expandable Sections
- Click on a city/state marker
- Sidebar opens
- Click on expandable sections (▶)
- **Expected**: Sections expand to show children
- Click again (▼) to collapse

## 🐛 Known Issues / Future Enhancements

1. **State/Country API**: Currently uses city API for all searches. Need to create separate APIs for state and country searches.

2. **Geocoding**: Search type detection is basic. Could be enhanced with a geocoding API.

3. **Caching**: State/country searches not yet cached separately.

## ✅ What's Working

- ✅ City search with places on map
- ✅ Click markers to see details
- ✅ Add places to itinerary
- ✅ Drag & drop to reorder
- ✅ Timeline view generation
- ✅ Sidebar with expandable sections
- ✅ Search type detection (basic)
- ✅ Different marker colors by type
- ✅ Responsive layout

## 🚀 Next Steps

1. Create API endpoints for state searches
2. Create API endpoints for country searches
3. Enhance search type detection with geocoding
4. Add more countries/states to detection list
5. Add route optimization in timeline
