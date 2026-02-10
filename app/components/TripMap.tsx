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

interface Place {
    id: number
    title: string
    city: string
    country: string
    location_lat: number
    location_lng: number
    categoryName?: string
    description?: string
    address?: string
    phone?: string
    website?: string
    image_url?: string
    reviewsCount?: number
}

interface TripMapProps {
    places: Place[]
    loading?: boolean
}

export default function TripMap({ places }: TripMapProps) {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<L.Marker[]>([])

    // Initialize and update map
    useEffect(() => {
        if (!mapContainerRef.current || places.length === 0) return

        // Initialize map if not already done
        if (!mapRef.current) {
            const avgLat = places.reduce((sum, p) => sum + p.location_lat, 0) / places.length
            const avgLng = places.reduce((sum, p) => sum + p.location_lng, 0) / places.length

            mapRef.current = L.map(mapContainerRef.current).setView([avgLat, avgLng], 6)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(mapRef.current)
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        // Add markers for each place
        places.forEach((place, index) => {
            const icon = L.divIcon({
                className: 'custom-trip-marker',
                html: `<div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${index + 1}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            })

            const marker = L.marker([place.location_lat, place.location_lng], { icon }).addTo(mapRef.current!)

            const popupContent = `
        <div style="min-width: 280px; max-width: 320px;">
          ${place.image_url ? `
            <img 
              src="${place.image_url}" 
              alt="${place.title}"
              style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"
              onerror="this.style.display='none'"
            />
          ` : ''}
          <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: bold; color: #031B4E;">
            ${place.title}
          </h3>
          ${place.categoryName ? `<span style="display: inline-block; background: #e8f3ff; color: #1e88e5; padding: 4px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">${place.categoryName}</span>` : ''}
          ${place.description ? `<p style="margin: 8px 0; font-size: 13px; color: #555; line-height: 1.5;">${place.description.substring(0, 120)}${place.description.length > 120 ? '...' : ''}</p>` : ''}
          ${place.reviewsCount ? `<div style="margin: 8px 0; font-size: 13px; color: #666;">⭐ ${place.reviewsCount} reviews</div>` : ''}
          ${place.address ? `<p style="margin: 6px 0; font-size: 12px; color: #888;">📍 ${place.address}</p>` : ''}
          ${place.phone ? `<p style="margin: 4px 0; font-size: 12px; color: #888;">☎️ ${place.phone}</p>` : ''}
          ${place.website ? `<a href="${place.website}" target="_blank" style="display: inline-block; margin-top: 10px; color: #667eea; text-decoration: none; font-size: 12px; font-weight: 600;">Visit Website →</a>` : ''}
        </div>
      `

            marker.bindPopup(popupContent, {
                maxWidth: 320,
                className: 'custom-trip-popup'
            })

            markersRef.current.push(marker)
        })

        // Fit map to show all markers
        if (markersRef.current.length > 0) {
            const group = new L.FeatureGroup(markersRef.current)
            mapRef.current.fitBounds(group.getBounds().pad(0.1))
        }

        return () => {
            markersRef.current.forEach(marker => marker.remove())
            markersRef.current = []
        }
    }, [places])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    return <div ref={mapContainerRef} className="map-view" style={{ width: '100%', height: '100%' }} />
}
