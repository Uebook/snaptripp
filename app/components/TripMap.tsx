'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DayPlan } from './DayPlanner'

// Fix for default marker icon in Next.js - Using more robust CDN links
if (typeof window !== 'undefined') {
    (L.Icon.Default as any).imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/'
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
    dayPlans?: DayPlan[]
    loading?: boolean
    selectedCity?: string | null
    onCityClick?: (city: string) => void
    onAddToPlan?: (place: Place) => void
    onRemoveFromPlan?: (placeId: number) => void
    onViewFullDetails?: (place: Place) => void
    isSavedTripView?: boolean
}

export default function TripMap({ places, dayPlans = [], selectedCity, onCityClick, onAddToPlan, onRemoveFromPlan, onViewFullDetails, isSavedTripView = false }: TripMapProps) {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)

    // Persistent LayerGroups
    const cityLayerRef = useRef<L.LayerGroup>(L.layerGroup())
    const placeLayerRef = useRef<L.LayerGroup>(L.layerGroup())
    const tripLayerRef = useRef<L.LayerGroup>(L.layerGroup())

    const [zoomLevel, setZoomLevel] = useState<number>(6)
    const lastFittedRef = useRef<string>('')
    const CITY_ZOOM_THRESHOLD = 10.5

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current) return
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                scrollWheelZoom: false, // Disable zoom on scroll as requested
                doubleClickZoom: true,
                zoomControl: true
            }).setView([53.3498, -6.2603], 6) // Start centered on Ireland at city-level view

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(mapRef.current)

            mapRef.current.on('zoom', () => {
                if (!mapRef.current) return
                const newZoom = mapRef.current.getZoom()
                setZoomLevel(newZoom)
            })

            const resizeObserver = new ResizeObserver(() => {
                mapRef.current?.invalidateSize()
            })
            resizeObserver.observe(mapContainerRef.current)
            return () => resizeObserver.disconnect()
        }
    }, [])

    const isPlaceInPlan = (placeId: number) => {
        return dayPlans.some(day => day.items.some(item => item.data?.id === placeId || item.id === `place-${placeId}`))
    }

    // Populating layers with markers
    useEffect(() => {
        if (!mapRef.current) return

        cityLayerRef.current.clearLayers()
        placeLayerRef.current.clearLayers()
        tripLayerRef.current.clearLayers()

        // 1. Populate City Markers (Zoomed Out) with DE-CLUTTERING
        const cityGroups = places.reduce((acc, place) => {
            const rawCity = (place.city || 'Other').trim();
            // Normalize: ignore small noise like "Vault", "Basement" if they are near a bigger city
            // For now, just group by name and handle overlap logic later
            const cityName = rawCity;
            if (!acc[cityName]) acc[cityName] = { name: cityName, lat: 0, lng: 0, count: 0 }
            acc[cityName].lat += place.location_lat
            acc[cityName].lng += place.location_lng
            acc[cityName].count += 1
            return acc
        }, {} as Record<string, { name: string, lat: number, lng: number, count: number }>)

        const cities = Object.values(cityGroups).map(c => ({
            name: c.name,
            lat: c.lat / c.count,
            lng: c.lng / c.count,
            count: c.count
        })).sort((a, b) => b.count - a.count); // Most places first

        const visibleCities: typeof cities = [];
        cities.forEach(city => {
            // Loosen de-cluttering further: 0.01 degrees allows very close suburbs to show
            const tooClose = visibleCities.some(v =>
                Math.abs(v.lat - city.lat) < 0.01 && Math.abs(v.lng - city.lng) < 0.01
            );
            if (!tooClose) {
                visibleCities.push(city);
            }
        });

        visibleCities.forEach(city => {
            const iconHtml = `<div style="background: white; color: #031B4E; border-radius: 20px; padding: 10px 20px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; border: 2px solid #F6B800; box-shadow: 0 4px 15px rgba(0,0,0,0.18); white-space: nowrap; cursor: pointer; transition: all 0.2s;"><span style="margin-right: 8px;">🏙️</span>${city.name}</div>`
            const icon = L.divIcon({ className: 'city-marker-premium', html: iconHtml, iconSize: [140, 44], iconAnchor: [70, 22] })
            const marker = L.marker([city.lat, city.lng], { icon })
            marker.on('click', () => {
                if (onCityClick) onCityClick(city.name)
                mapRef.current?.setView([city.lat, city.lng], 12)
            })
            marker.addTo(cityLayerRef.current)
        })

        // 2. Populate Place Markers (Zoomed In) with CITY FILTERING
        // Only show places in selectedCity if one is selected
        const filteredPlaces = selectedCity ? places.filter(p => p.city === selectedCity) : places;

        filteredPlaces.forEach((place, index) => {
            const isInPlan = isPlaceInPlan(place.id)
            const iconHtml = `<div style="background: ${isInPlan ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">${index + 1}</div>`;
            const icon = L.divIcon({ className: 'custom-place-marker', html: iconHtml, iconSize: [38, 38], iconAnchor: [19, 19] })
            const marker = L.marker([place.location_lat, place.location_lng], { icon })

            const popupContent = `
                <div class="map-premium-popup" style="min-width: 300px; max-width: 340px; font-family: 'Inter', sans-serif; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
                    ${place.image_url ? `<div style="height: 180px; overflow: hidden; position: relative;"><img src="${place.image_url}" style="width: 100%; height: 100%; object-fit: cover;" /><div style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; color: #031B4E;">★ ${place.reviewsCount || 0}</div></div>` : ''}
                    <div style="padding: 20px; background: #fff;">
                        <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #031B4E; line-height: 1.2;">${place.title}</h3>
                        <p style="margin: 6px 0 16px; font-size: 13px; color: #64748b; line-height: 1.5;">${place.categoryName || 'Sights & Landmarks'}</p>
                        
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                            ${place.address ? `<div style="display: flex; gap: 10px; font-size: 13px; color: #475569;"><span style="color: #ef4444; flex-shrink: 0;">📍</span> <span>${place.address}</span></div>` : ''}
                            ${place.phone ? `<div style="display: flex; gap: 10px; font-size: 13px; color: #475569;"><span style="flex-shrink: 0;">📞</span> <span>${place.phone}</span></div>` : ''}
                            ${place.website ? `<div style="display: flex; gap: 10px; font-size: 13px; color: #475569;"><span style="flex-shrink: 0;">🌐</span> <a href="${place.website.startsWith('http') ? place.website : 'https://' + place.website}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">Visit Website</a></div>` : ''}
                        </div>

                        ${isInPlan ?
                    `<button class="remove-from-plan-btn" style="width: 100%; padding: 14px; background: #fff; color: #ef4444; border: 2px solid #fee2e2; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; margin-bottom: 12px;"><span>✕</span> Remove from Plan</button>` :
                    `<button class="add-to-plan-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s; margin-bottom: 12px;">+ Add to Plan</button>`
                }
                
                <div style="text-align: center;">
                    <button class="view-full-details-btn" style="background: none; border: none; color: #667eea; font-weight: 600; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 4px;">View Full Details</button>
                </div>
                    </div>
                </div>`;

            marker.bindPopup(popupContent, { minWidth: 280, className: 'leaflet-popup-premium' })
            marker.on('popupopen', (e) => {
                const popup = e.popup.getElement();
                const addBtn = popup?.querySelector('.add-to-plan-btn');
                const removeBtn = popup?.querySelector('.remove-from-plan-btn');
                const viewDetailsBtn = popup?.querySelector('.view-full-details-btn');

                if (addBtn) addBtn.addEventListener('click', () => { if (onAddToPlan) onAddToPlan(place); marker.closePopup(); });
                if (removeBtn) removeBtn.addEventListener('click', () => { if (onRemoveFromPlan) onRemoveFromPlan(place.id); marker.closePopup(); });
                if (viewDetailsBtn) viewDetailsBtn.addEventListener('click', () => { if (onViewFullDetails) onViewFullDetails(place); marker.closePopup(); });
            });
            marker.addTo(placeLayerRef.current)
        })

        // 3. Populate Trip Markers
        dayPlans.forEach((day, dIdx) => {
            day.items.forEach((item, iIdx) => {
                const place = item.data
                if (!place || !place.location_lat || !place.location_lng) return
                const colors = ['#e53e3e', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];
                const color = colors[dIdx % colors.length];
                const iconHtml = `<div style="background: ${color}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; border: 3px solid white; box-shadow: 0 6px 15px rgba(0,0,0,0.35);">${iIdx + 1}</div>`;
                const icon = L.divIcon({ className: 'trip-place-marker', html: iconHtml, iconSize: [40, 40], iconAnchor: [20, 20] })
                const marker = L.marker([place.location_lat, place.location_lng], { icon, zIndexOffset: 2000 })
                const popupContent = `
                    <div style="padding: 12px; font-family: 'Inter', sans-serif;">
                        <span style="display: block; font-size: 11px; font-weight: 800; color: ${color}; text-transform: uppercase; margin-bottom: 4px;">Day ${dIdx + 1}</span>
                        <h4 style="margin: 0; font-size: 16px; color: #031B4E;">${item.name}</h4>
                    </div>`;
                marker.bindPopup(popupContent)
                marker.addTo(tripLayerRef.current)
            })
        })

    }, [places, dayPlans, onCityClick, onAddToPlan, onRemoveFromPlan, selectedCity]) // Added selectedCity to dependency

    // Visibility Management
    useEffect(() => {
        if (!mapRef.current) return
        const syncLayer = (layer: L.LayerGroup, shouldBeVisible: boolean) => {
            const hasLayer = mapRef.current?.hasLayer(layer)
            if (shouldBeVisible && !hasLayer) layer.addTo(mapRef.current!)
            else if (!shouldBeVisible && hasLayer) layer.remove()
        }

        if (zoomLevel < CITY_ZOOM_THRESHOLD) {
            syncLayer(cityLayerRef.current, true)
            syncLayer(placeLayerRef.current, false)
            syncLayer(tripLayerRef.current, false)
            // Auto clear selected city if zoom out far
            if (zoomLevel < 7 && selectedCity && onCityClick) onCityClick('')
        } else {
            syncLayer(cityLayerRef.current, false)
            if (isSavedTripView) {
                syncLayer(placeLayerRef.current, false)
                syncLayer(tripLayerRef.current, true)
            } else {
                syncLayer(placeLayerRef.current, true)
                syncLayer(tripLayerRef.current, false)
            }
        }
    }, [zoomLevel, isSavedTripView, selectedCity, onCityClick])

    // Fit bounds
    useEffect(() => {
        if (!mapRef.current || places.length === 0) return
        const currentViewState = isSavedTripView ? `trip:${dayPlans.length}` : `explore:${places.length}:${selectedCity || 'all'}`
        if (lastFittedRef.current !== currentViewState) {
            let bounds: L.LatLngBounds | null = null

            if (isSavedTripView) {
                const markers = (tripLayerRef.current.getLayers() as L.Marker[])
                if (markers.length > 0) bounds = L.featureGroup(markers).getBounds()
            } else if (!selectedCity) {
                // For the "explore all" view, we strictly want to see CITIES, not individual places.
                const cityMarkers = (cityLayerRef.current.getLayers() as L.Marker[])
                if (cityMarkers.length > 0) {
                    bounds = L.featureGroup(cityMarkers).getBounds()
                } else {
                    // Fallback to a fixed country view (Ireland) to ensure we start at city-level
                    mapRef.current.setView([53.3498, -6.2603], 6)
                    lastFittedRef.current = currentViewState
                    return;
                }
            } else {
                const cityPlaces = places.filter(p => p.city === selectedCity)
                if (cityPlaces.length > 0) {
                    const lats = cityPlaces.map(p => p.location_lat)
                    const lngs = cityPlaces.map(p => p.location_lng)
                    bounds = L.latLngBounds([Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)])
                }
            }

            if (bounds) {
                const fitOptions: L.FitBoundsOptions = { animate: true }
                if (!selectedCity && !isSavedTripView) {
                    fitOptions.maxZoom = 9 // Don't zoom in past city level overview on startup
                }
                mapRef.current.fitBounds(bounds.pad(0.35), fitOptions)
                lastFittedRef.current = currentViewState
            }
        }
    }, [places, dayPlans, isSavedTripView, selectedCity])

    // Day lines
    useEffect(() => {
        if (!mapRef.current || !dayPlans || dayPlans.length === 0) return;
        const colors = ['#e53e3e', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];
        const pLines: L.Polyline[] = [];
        dayPlans.forEach((day, index) => {
            const rawCoords = day.items.map(i => [i.coordinates.lat, i.coordinates.lng] as [number, number]).filter(c => c[0] && c[1]);
            if (rawCoords.length > 1) {
                const pl = L.polyline(rawCoords, { color: colors[index % colors.length], weight: 5, opacity: 0.7, dashArray: '10, 10' }).addTo(mapRef.current!);
                pLines.push(pl);
            }
        });
        return () => pLines.forEach(p => p.remove());
    }, [dayPlans]);

    return (
        <div ref={mapContainerRef} className="map-view premium-map" style={{ width: '100%', height: '100%', background: '#f8fafc' }}>
            <style jsx global>{`
                .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 16px; border: none; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
                .leaflet-popup-content { margin: 0; width: 320px !important; }
                .leaflet-popup-tip-container { display: none; }
                .city-marker-premium:hover div { transform: scale(1.05); border-color: #031B4E !important; }
            `}</style>
        </div>
    )
}
