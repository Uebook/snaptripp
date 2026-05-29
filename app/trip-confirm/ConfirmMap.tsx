'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Place {
  id: number
  title: string
  city: string
  country: string
  location_lat: number
  location_lng: number
  categoryName?: string
  image_url?: string
}

interface ConfirmMapProps {
  places: Place[]
}

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

export default function ConfirmMap({ places }: ConfirmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
      zoomControl: true,
      attributionControl: true,
    }).setView([20, 0], 2)

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia3Jvbm9zYW51aiIsImEiOiJjbW1oaXozOWQwNGZkMnBzN3V5dWNodzVoIn0.2lA72tk0dUkLIANsYmbPQg', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || places.length === 0) return

    // Clear existing markers and lines
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current!.removeLayer(layer)
      }
    })

    const markers: L.Marker[] = []
    const latlngs: L.LatLngExpression[] = []

    places.forEach((place, index) => {
      latlngs.push([place.location_lat, place.location_lng])
      
      const iconHtml = `<div style="background: linear-gradient(135deg, #F6B800, #F59E0B); color: #031B4E; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; border: 2px solid white; box-shadow: 0 4px 12px rgba(246, 184, 0, 0.5);">${index + 1}</div>`
      const icon = L.divIcon({ className: 'confirm-city-marker', html: iconHtml, iconSize: [28, 28], iconAnchor: [14, 14] })
      
      const marker = L.marker([place.location_lat, place.location_lng], { icon })
      marker.bindTooltip(`<strong>${place.title}</strong><br/>${place.city}`, {
        direction: 'top',
        offset: [0, -14],
        className: 'confirm-tooltip'
      })
      marker.addTo(mapRef.current!)
      markers.push(marker)
    })

    // Draw the line connecting the places
    if (latlngs.length > 1) {
      const polyline = L.polyline(latlngs, {
        color: '#F6B800',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(mapRef.current!)
    }

    // Fit map to all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      mapRef.current.fitBounds(group.getBounds().pad(0.2), { animate: true, maxZoom: 14 })
    }
  }, [places])

  return (
    <>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <style jsx global>{`
        .confirm-city-marker { background: transparent !important; border: none !important; }
        .confirm-tooltip {
          background: #031B4E !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
        .confirm-tooltip::before { display: none !important; }
        .leaflet-tooltip-top.confirm-tooltip::before { display: none !important; }
      `}</style>
    </>
  )
}
