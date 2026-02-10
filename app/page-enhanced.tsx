'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HierarchicalMap, { MapItem } from './components/HierarchicalMap'
import ItinerarySidebar from './components/ItinerarySidebar'
import DragDropItinerary from './components/DragDropItinerary'
import TimelineView from './components/TimelineView'
import { detectSearchType } from './utils/searchTypeDetector'

// Dynamically import to avoid SSR issues
const HierarchicalMapDynamic = dynamic(() => Promise.resolve(HierarchicalMap), {
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', borderRadius: '12px' }}>Loading map...</div>
})

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<'city' | 'state' | 'country'>('city')
  const [mapItems, setMapItems] = useState<MapItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null)
  const [selectedItineraryItems, setSelectedItineraryItems] = useState<MapItem[]>([])
  const [showTimeline, setShowTimeline] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError(null)
    setMapItems([])
    setSelectedItem(null)

    const detectedType = detectSearchType(searchQuery)
    setSearchType(detectedType)

    try {
      // For now, use city API - will enhance later for state/country
      const response = await fetch(`/api/itinerary?city=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch data')
      }

      // Transform API response to MapItem format
      const items: MapItem[] = (data.itinerary || []).map((item: any, index: number) => ({
        id: `place-${index}`,
        name: item.name || item.title || 'Unknown',
        type: 'place' as const,
        coordinates: item.coordinates || { lat: 0, lng: 0 },
        data: item
      }))

      setMapItems(items)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = async (item: MapItem) => {
    if (item.type === 'city' || item.type === 'state') {
      // Fetch child items
      setLoading(true)
      try {
        const response = await fetch(`/api/itinerary?city=${encodeURIComponent(item.name)}`)
        const data = await response.json()
        
        if (response.ok && data.itinerary) {
          const children: MapItem[] = data.itinerary.map((it: any, idx: number) => ({
            id: `${item.id}-child-${idx}`,
            name: it.name || it.title || 'Unknown',
            type: item.type === 'city' ? 'place' : 'city',
            coordinates: it.coordinates || { lat: 0, lng: 0 },
            data: it
          }))
          
          setSelectedItem({
            ...item,
            children
          })
        } else {
          setSelectedItem(item)
        }
      } catch (err) {
        setSelectedItem(item)
      } finally {
        setLoading(false)
      }
    } else {
      setSelectedItem(item)
    }
  }

  const handleAddToItinerary = (item: MapItem) => {
    if (!selectedItineraryItems.find(i => i.id === item.id)) {
      setSelectedItineraryItems([...selectedItineraryItems, item])
    }
  }

  const handleRemoveFromItinerary = (id: string) => {
    setSelectedItineraryItems(selectedItineraryItems.filter(item => item.id !== id))
  }

  const handleReorderItems = (items: MapItem[]) => {
    setSelectedItineraryItems(items)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Drag & Drop Itinerary Bar */}
      {selectedItineraryItems.length > 0 && (
        <DragDropItinerary
          selectedItems={selectedItineraryItems}
          onRemoveItem={handleRemoveFromItinerary}
          onReorderItems={handleReorderItems}
          onGenerateTimeline={() => setShowTimeline(true)}
        />
      )}

      {/* Main Content */}
      <main style={{
        paddingTop: selectedItineraryItems.length > 0 ? '220px' : '2rem',
        padding: selectedItineraryItems.length > 0 ? '220px 2rem 2rem 2rem' : '2rem',
        minHeight: '100vh',
        marginRight: selectedItem ? '400px' : '0',
        transition: 'margin-right 0.3s'
      }}>
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

        {/* Search Form */}
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
              onClick={handleSearch}
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

        {error && (
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
        {mapItems.length > 0 && (
          <div style={{
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <HierarchicalMapDynamic
              items={mapItems}
              searchType={searchType}
              onItemClick={handleItemClick}
              selectedItem={selectedItem}
            />
          </div>
        )}
      </main>

      {/* Sidebar */}
      {selectedItem && (
        <ItinerarySidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToItinerary={handleAddToItinerary}
        />
      )}

      {/* Timeline View */}
      {showTimeline && (
        <TimelineView
          items={selectedItineraryItems}
          onClose={() => setShowTimeline(false)}
        />
      )}
    </div>
  )
}
