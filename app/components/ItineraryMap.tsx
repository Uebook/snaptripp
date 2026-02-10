'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ItineraryItem {
  name?: string
  title?: string
  description?: string
  rating?: number
  address?: string
  phone?: string
  website?: string
  url?: string
  imageUrl?: string
  category?: string
  reviewCount?: number
  coordinates: { lat: number; lng: number } | null
  price?: string
}

interface ItineraryMapProps {
  items: ItineraryItem[]
  city?: string
}

export default function ItineraryMap({ items, city }: ItineraryMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Filter items with valid coordinates
    const itemsWithCoords = items.filter(item => item.coordinates && item.coordinates.lat && item.coordinates.lng)

    if (itemsWithCoords.length === 0) {
      console.log('No items with coordinates to display on map')
      return
    }

    // Initialize map
    if (!mapRef.current) {
      // Calculate center from all coordinates
      const avgLat = itemsWithCoords.reduce((sum, item) => sum + item.coordinates!.lat, 0) / itemsWithCoords.length
      const avgLng = itemsWithCoords.reduce((sum, item) => sum + item.coordinates!.lng, 0) / itemsWithCoords.length

      mapRef.current = L.map(mapContainerRef.current).setView([avgLat, avgLng], 12)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each item
    itemsWithCoords.forEach((item, index) => {
      const { lat, lng } = item.coordinates!
      
      // Create custom icon with number
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${index + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!)

      // Create popup content
      const popupContent = `
        <div style="min-width: 250px; max-width: 300px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
            ${item.name || item.title || 'Location'}
          </h3>
          ${item.category ? `<span style="display: inline-block; background: #f0f0ff; color: #667eea; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 8px;">${item.category}</span>` : ''}
          ${item.description ? `<p style="margin: 8px 0; font-size: 13px; color: #666; line-height: 1.4;">${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>` : ''}
          ${item.rating ? `<div style="margin: 8px 0; font-size: 13px; color: #888;">⭐ ${item.rating.toFixed(1)}${item.reviewCount ? ` (${item.reviewCount} reviews)` : ''}</div>` : ''}
          ${item.address ? `<p style="margin: 4px 0; font-size: 12px; color: #999;">📍 ${item.address}</p>` : ''}
          ${item.phone ? `<p style="margin: 4px 0; font-size: 12px; color: #999;">☎️ ${item.phone}</p>` : ''}
          ${item.website ? `<a href="${item.website}" target="_blank" style="display: inline-block; margin-top: 8px; color: #667eea; text-decoration: none; font-size: 12px;">Visit Website →</a>` : ''}
          ${item.url ? `<a href="${item.url}" target="_blank" style="display: inline-block; margin-top: 8px; margin-left: 8px; color: #28a745; text-decoration: none; font-size: 12px;">View on Maps →</a>` : ''}
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [items])

  const itemsWithCoords = items.filter(item => item.coordinates && item.coordinates.lat && item.coordinates.lng)

  if (itemsWithCoords.length === 0) {
    return (
      <div style={{
        height: '400px',
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
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#333'
      }}>
        Map View {city && `- ${city}`}
      </h3>
      <div
        ref={mapContainerRef}
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 0
        }}
      />
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}
