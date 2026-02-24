'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import '../home.css'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { MapItem } from '../components/HierarchicalMap'
import ItinerarySidebar from '../components/ItinerarySidebar'
import DayPlanner, { DayPlan } from '../components/DayPlanner'
import TimelineView from '../components/TimelineView'
import { detectSearchType } from '../utils/searchTypeDetector'

// Dynamically import to avoid SSR issues
const HierarchicalMap = dynamic(() => import('../components/HierarchicalMap'), {
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', borderRadius: '12px' }}>Loading map...</div>
})

function ExploreContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<'city' | 'state' | 'country'>('city')
  const [mapItems, setMapItems] = useState<MapItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null)


  const [dayPlans, setDayPlans] = useState<DayPlan[]>([])
  const [showTimeline, setShowTimeline] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [fallbackItem, setFallbackItem] = useState<MapItem | null>(null)

  const handleSearch = useCallback(async (queryOverride?: string, forcedType?: 'city' | 'state' | 'country') => {
    const query = (queryOverride ?? searchQuery).trim()
    if (!query) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError(null)
    setMapItems([])
    setSelectedItem(null)

    if (queryOverride) {
      setSearchQuery(query)
    }

    const detectedType = forcedType || detectSearchType(query)
    setSearchType(detectedType)

    try {
      let response: Response
      let data: any

      // Route to appropriate API based on search type
      if (detectedType === 'country') {
        response = await fetch(`/api/itinerary/country?country=${encodeURIComponent(query)}`)
        data = await response.json()

        if (response.ok && data.states) {
          const items: MapItem[] = data.states.map((item: any, index: number) => ({
            id: `state-${index}`,
            name: item.name,
            type: 'state' as const,
            coordinates: item.coordinates || { lat: 0, lng: 0 },
            data: item.data
          }))
          setMapItems(items)
        } else {
          throw new Error(data.message || data.error || 'Failed to fetch country data')
        }
      } else if (detectedType === 'state') {
        response = await fetch(`/api/itinerary/state?state=${encodeURIComponent(query)}`)
        data = await response.json()

        if (response.ok && data.cities) {
          const items: MapItem[] = data.cities.map((item: any, index: number) => ({
            id: `city-${index}`,
            name: item.name,
            type: 'city' as const,
            coordinates: item.coordinates || { lat: 0, lng: 0 },
            data: item.data
          }))
          setMapItems(items)
        } else {
          throw new Error(data.message || data.error || 'Failed to fetch state data')
        }
      } else {
        // City search - show places
        response = await fetch(`/api/itinerary?city=${encodeURIComponent(query)}`)
        data = await response.json()

        if (response.ok && data.itinerary) {
          const items: MapItem[] = (data.itinerary || []).map((item: any, index: number) => ({
            id: `place-${index}`,
            name: item.name || item.title || 'Unknown',
            type: 'place' as const,
            coordinates: item.coordinates || { lat: 0, lng: 0 },
            data: item
          }))
          setMapItems(items)
        } else {
          throw new Error(data.message || data.error || 'Failed to fetch city data')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const query = searchParams.get('query')
    const typeParam = searchParams.get('type') as 'city' | 'state' | 'country' | null
    if (query) {
      setAutoMode(true)
      handleSearch(query, typeParam || undefined)
    }
  }, [searchParams, handleSearch])

  useEffect(() => {
    if (!autoMode || !searchQuery) return
    let cancelled = false

    const fetchCoords = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
        if (!res.ok) return
        const data = await res.json()
        const first = data?.[0]
        if (!first || cancelled) return
        setFallbackItem({
          id: 'country-focus',
          name: searchQuery,
          type: 'city' as const,
          coordinates: { lat: Number(first.lat), lng: Number(first.lon) }
        })
      } catch {
        // ignore
      }
    }

    fetchCoords()
    return () => { cancelled = true }
  }, [autoMode, searchQuery])

  const handleItemClick = async (item: MapItem) => {
    // Scenario 1: Country → State → Click state → Show cities in sidebar
    if (item.type === 'state' && searchType === 'country') {
      setLoading(true)
      try {
        const response = await fetch(`/api/itinerary/state?state=${encodeURIComponent(item.name)}`)
        const data = await response.json()

        if (response.ok && data.cities) {
          const cities: MapItem[] = data.cities.map((city: any, idx: number) => ({
            id: `${item.id}-city-${idx}`,
            name: city.name,
            type: 'city' as const,
            coordinates: city.coordinates || { lat: 0, lng: 0 },
            data: city.data
          }))

          setSelectedItem({
            ...item,
            children: cities
          })
        } else {
          setSelectedItem(item)
        }
      } catch (err) {
        setSelectedItem(item)
      } finally {
        setLoading(false)
      }
    }
    // Scenario 2: State → City → Click city → Show top 5 itinerary in sidebar
    else if (item.type === 'city' && searchType === 'state') {
      setLoading(true)
      try {
        const response = await fetch(`/api/itinerary?city=${encodeURIComponent(item.name)}`)
        const data = await response.json()

        if (response.ok && data.itinerary) {
          // Get top 5 places
          const top5Places: MapItem[] = data.itinerary.slice(0, 5).map((it: any, idx: number) => ({
            id: `${item.id}-place-${idx}`,
            name: it.name || it.title || 'Unknown',
            type: 'place' as const,
            coordinates: it.coordinates || { lat: 0, lng: 0 },
            data: it
          }))

          setSelectedItem({
            ...item,
            children: top5Places
          })
        } else {
          setSelectedItem(item)
        }
      } catch (err) {
        setSelectedItem(item)
      } finally {
        setLoading(false)
      }
    }
    // Scenario 3: City → Place → Click place → Show popup (handled by map, don't open sidebar)
    else if (item.type === 'place' && searchType === 'city') {
      // Don't open sidebar for places in city search - popup is shown by map
      return
    }
    // Country → State → City → Click city → Show top 5 itinerary
    else if (item.type === 'city' && searchType === 'country') {
      setLoading(true)
      try {
        const response = await fetch(`/api/itinerary?city=${encodeURIComponent(item.name)}`)
        const data = await response.json()

        if (response.ok && data.itinerary) {
          // Get top 5 places
          const top5Places: MapItem[] = data.itinerary.slice(0, 5).map((it: any, idx: number) => ({
            id: `${item.id}-place-${idx}`,
            name: it.name || it.title || 'Unknown',
            type: 'place' as const,
            coordinates: it.coordinates || { lat: 0, lng: 0 },
            data: it
          }))

          setSelectedItem({
            ...item,
            children: top5Places
          })
        } else {
          setSelectedItem(item)
        }
      } catch (err) {
        setSelectedItem(item)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddToItinerary = (item: MapItem) => {
    // Add to the first day by default, creating one if none exist
    if (dayPlans.length === 0) {
      const newDay: DayPlan = {
        id: `day-${Date.now()}`,
        title: 'Day 1',
        items: [item]
      }
      setDayPlans([newDay])
    } else {
      // Add to Day 1 (index 0) or ask user? For now, Day 1.
      const newDays = [...dayPlans]
      // Avoid duplicates in the first day
      if (!newDays[0].items.find(i => i.id === item.id)) {
        newDays[0].items.push(item)
        setDayPlans(newDays)
      }
    }
  }

  const handleUpdateDays = (updatedDays: DayPlan[]) => {
    setDayPlans(updatedDays)
  }

  const handleRemoveItem = (dayId: string, itemId: string) => {
    const newDays = dayPlans.map(day => {
      if (day.id === dayId) {
        return { ...day, items: day.items.filter(i => i.id !== itemId) }
      }
      return day
    })
    setDayPlans(newDays)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <SiteHeader />
      {/* Day Planner Sidebar */}
      {dayPlans.length > 0 && (
        <DayPlanner
          days={dayPlans}
          onUpdateDays={handleUpdateDays}
          onRemoveItem={handleRemoveItem}
          onGenerateTimeline={() => setShowTimeline(true)}
          onSaveTrip={() => alert("Save functionality coming to Explore page soon! Go to Planner to save.")}
        />
      )}

      {/* Main Content */}
      <main style={{
        paddingTop: '2rem',
        paddingLeft: dayPlans.length > 0 ? '370px' : '2rem', // Shift content when planner is open
        paddingRight: selectedItem ? '400px' : '2rem',
        minHeight: '100vh',
        transition: 'all 0.3s'
      }}>
        {!autoMode && (
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome to Snaptrip
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Search by city, state, or country to explore destinations
            </p>
          </div>
        )}

        {/* Search Form */}
        {!autoMode && (
          <div style={{
            background: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Search Location (City, State, or Country)
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., Delhi, California, India"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.3s'
                }}
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
            {searchQuery && (
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                Detected as: <strong>{searchType}</strong>
              </p>
            )}
          </div>
        )}

        {error && !autoMode && (
          <div style={{
            padding: '1rem',
            background: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Map */}
        {(mapItems.length > 0 || autoMode) && (
          <div style={{
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <HierarchicalMap
              items={mapItems.length > 0 ? mapItems : (fallbackItem ? [fallbackItem] : [])}
              searchType={autoMode ? 'country' : (searchType || 'country')}
              onItemClick={handleItemClick}
              selectedItem={selectedItem}
              zoomOverride={autoMode ? 5 : undefined}
            />
          </div>
        )}
      </main>

      {/* Sidebar - Only show for state/city clicks, not for place clicks in city search */}
      {selectedItem && !(selectedItem.type === 'place' && searchType === 'city') && (
        <ItinerarySidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToItinerary={handleAddToItinerary}
          loading={loading}
        />
      )}

      {/* Timeline View */}
      {showTimeline && (
        <TimelineView
          items={dayPlans.flatMap(d => d.items)} // Flatten for now, existing TimelineView expects flat list
          onClose={() => setShowTimeline(false)}
        />
      )}
      <SiteFooter />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Explore...</div>}>
      <ExploreContent />
    </Suspense>
  )
}
