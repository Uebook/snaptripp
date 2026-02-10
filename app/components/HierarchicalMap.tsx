'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

export interface MapItem {
  id: string
  name: string
  type: 'place' | 'city' | 'state'
  coordinates: { lat: number; lng: number }
  data?: any
  children?: MapItem[]
}

interface HierarchicalMapProps {
  items: MapItem[]
  searchType: 'city' | 'state' | 'country'
  onItemClick?: (item: MapItem) => void
  selectedItem?: MapItem | null
  zoomOverride?: number
}

export default function HierarchicalMap({ items, searchType, onItemClick, selectedItem, zoomOverride }: HierarchicalMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const initializedRef = useRef(false)
  const isMountedRef = useRef(true)

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || initializedRef.current || mapRef.current) return

    // Wait a bit to ensure DOM is ready and has dimensions
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return

      // Check if container has dimensions
      const rect = mapContainerRef.current.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        console.warn('Map container has no dimensions, retrying...')
        return
      }

      try {
        // Default center (will be updated when items load)
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
          preferCanvas: false
        }).setView([20, 0], 2)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)

        // Invalidate size after a short delay to ensure proper rendering
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 200)

        initializedRef.current = true
      } catch (error) {
        console.error('Error initializing map:', error)
        initializedRef.current = false
      }
    }, 200)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Update markers when items change
  useEffect(() => {
    if (!isMountedRef.current || !mapRef.current || !mapContainerRef.current) return

    const itemsWithCoords = items.filter(item => item.coordinates && item.coordinates.lat && item.coordinates.lng)

    if (itemsWithCoords.length === 0) {
      return
    }

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove()
        } catch (e) {
          // Ignore errors during cleanup
        }
      })
      markersRef.current = []

      // Calculate center
      const avgLat = itemsWithCoords.reduce((sum, item) => sum + item.coordinates.lat, 0) / itemsWithCoords.length
      const avgLng = itemsWithCoords.reduce((sum, item) => sum + item.coordinates.lng, 0) / itemsWithCoords.length

      // Adjust zoom based on search type
      const defaultZoom = searchType === 'country' ? 5 : searchType === 'state' ? 7 : 12
      const zoom = typeof zoomOverride === 'number' ? zoomOverride : defaultZoom

      // Update map view
      if (mapRef.current) {
        mapRef.current.setView([avgLat, avgLng], zoom)
        // Invalidate size to ensure proper rendering
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)
      }

      // Add markers with different colors based on type
      itemsWithCoords.forEach((item, index) => {
        let color = '#667eea' // Default blue
        let iconSize = [30, 30]

        if (item.type === 'state') {
          color = '#28a745' // Green for states
          iconSize = [35, 35]
        } else if (item.type === 'city') {
          color = '#17a2b8' // Teal for cities
          iconSize = [32, 32]
        } else {
          color = '#667eea' // Blue for places
        }

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
          background: ${color};
          color: white;
          border-radius: 50%;
          width: ${iconSize[0]}px;
          height: ${iconSize[1]}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: ${item.type === 'state' ? '14px' : '12px'};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${item.type === 'state' ? 'S' : item.type === 'city' ? 'C' : index + 1}</div>`,
          iconSize: iconSize as [number, number],
          iconAnchor: [iconSize[0] / 2, iconSize[1] / 2] as [number, number],
        })

        if (!mapRef.current) return

        const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon }).addTo(mapRef.current)

        // Enhanced popup content based on item type
        let popupContent = ''
        if (item.type === 'place' && item.data) {
          // Get images array
          const images = item.data.images || (item.data.imageUrl ? [item.data.imageUrl] : [])
          const mainImage = images[0] || item.data.imageUrl

          // Detailed popup for places (city search scenario)
          popupContent = `
          <div style="min-width: 250px; max-width: 300px;">
            ${mainImage ? `
              <img 
                src="${mainImage}" 
                alt="${item.name}"
                style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
                onerror="this.style.display='none'"
              />
            ` : ''}
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
              ${item.name}
            </h3>
            ${item.data.category ? `<span style="display: inline-block; background: #f0f0ff; color: #667eea; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 8px;">${item.data.category}</span>` : ''}
            ${item.data.description ? `<p style="margin: 8px 0; font-size: 13px; color: #666; line-height: 1.4;">${item.data.description.substring(0, 100)}${item.data.description.length > 100 ? '...' : ''}</p>` : ''}
            ${item.data.rating ? `<div style="margin: 8px 0; font-size: 13px; color: #888;">⭐ ${item.data.rating.toFixed(1)}${item.data.reviewCount ? ` (${item.data.reviewCount} reviews)` : ''}</div>` : ''}
            ${item.data.address ? `<p style="margin: 4px 0; font-size: 12px; color: #999;">📍 ${item.data.address}</p>` : ''}
            ${item.data.phone ? `<p style="margin: 4px 0; font-size: 12px; color: #999;">☎️ ${item.data.phone}</p>` : ''}
            ${item.data.url ? `<a href="${item.data.url}" target="_blank" style="display: inline-block; margin-top: 8px; color: #667eea; text-decoration: none; font-size: 12px;">View on Maps →</a>` : ''}
          </div>
        `
        } else {
          // Simple popup for states/cities
          popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
              ${item.name}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Type: ${item.type}
            </p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">
              Click to see details
            </p>
          </div>
        `
        }

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        })

        marker.on('click', () => {
          if (onItemClick) {
            onItemClick(item)
          }
        })

        markersRef.current.push(marker)
      })

      // Fit map to show all markers
      if (markersRef.current.length > 0 && mapRef.current) {
        try {
          const group = new L.FeatureGroup(markersRef.current)
          const bounds = group.getBounds()
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds.pad(0.1))
          }
        } catch (error) {
          console.error('Error fitting bounds:', error)
        }
      }
    } catch (error) {
      console.error('Error updating markers:', error)
    }
  }, [items, searchType, onItemClick])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false

      // Clear markers first
      markersRef.current.forEach(marker => {
        try {
          if (marker && mapRef.current) {
            mapRef.current.removeLayer(marker)
          }
          marker.remove()
        } catch (e) {
          // Ignore errors during cleanup
        }
      })
      markersRef.current = []

      // Remove map
      if (mapRef.current) {
        try {
          // Remove all layers first
          mapRef.current.eachLayer((layer) => {
            try {
              mapRef.current?.removeLayer(layer)
            } catch (e) {
              // Ignore
            }
          })
          mapRef.current.remove()
        } catch (e) {
          // Ignore errors
        }
        mapRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  const itemsWithCoords = items.filter(item => item.coordinates && item.coordinates.lat && item.coordinates.lng)

  if (itemsWithCoords.length === 0) {
    return (
      <div style={{
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        borderRadius: '12px',
        color: '#666'
      }}>
        No location data available to display on map
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 0
      }}
    />
  )
}
