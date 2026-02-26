'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DayPlan } from './DayPlanner'

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
    dayPlans?: DayPlan[]
    loading?: boolean
    selectedCity?: string | null
    onCityClick?: (city: string) => void
    onAddToPlan?: (place: Place) => void
    isSavedTripView?: boolean
}

export default function TripMap({ places, dayPlans = [], selectedCity, onCityClick, onAddToPlan, isSavedTripView = false }: TripMapProps) {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<L.Marker[]>([])

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current) return
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(mapRef.current)

            // Auto resize map when container dimensions change (e.g. sidebar toggles)
            const resizeObserver = new ResizeObserver(() => {
                mapRef.current?.invalidateSize()
            })
            resizeObserver.observe(mapContainerRef.current)

            // Cleanup observer on unmount
            return () => {
                resizeObserver.disconnect()
            }
        }
    }, [])

    // Update markers and view
    useEffect(() => {
        if (!mapRef.current) return

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        if (isSavedTripView && dayPlans.length > 0) {
            // Only show places saved in the day plans
            const placeMarkers: L.Marker[] = []

            dayPlans.forEach((day, dIdx) => {
                day.items.forEach((item, iIdx) => {
                    const place = item.data
                    if (!place || !place.location_lat || !place.location_lng) return

                    const colors = ['#e53e3e', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];
                    const color = colors[dIdx % colors.length];

                    const iconHtml = `<div style="
                        background: ${color};
                        color: white;
                        border-radius: 50%;
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 14px;
                        border: 3px solid white;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                    ">${iIdx + 1}</div>`;

                    const icon = L.divIcon({
                        className: 'custom-trip-marker',
                        html: iconHtml,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                    })

                    const marker = L.marker([place.location_lat, place.location_lng], { icon, zIndexOffset: 1000 }).addTo(mapRef.current!)

                    const popupContent = `
                        <div style="min-width: 280px; max-width: 320px;">
                            ${place.image_url ? `<img src="${place.image_url}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />` : ''}
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <h3 style="margin: 0; font-size: 17px; color: #031B4E; line-height: 1.3; padding-right: 10px;">${place.title}</h3>
                                <div style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; background: ${color}20; color: ${color}; white-space: nowrap; border: 1px solid ${color}40;">Day ${dIdx + 1}</div>
                            </div>
                            
                            ${place.reviewsCount ? `<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                                <span style="color: #f59e0b; font-size: 14px;">★</span>
                                <span style="font-size: 13px; color: #666; font-weight: 500;">${place.reviewsCount} reviews</span>
                            </div>` : ''}
                            
                            <p style="margin: 8px 0; font-size: 13px; color: #555; line-height: 1.5;">${place.description && place.description.length > 100 ? place.description.substring(0, 100) + '...' : place.description || ''}</p>
                            
                            ${(place.website || place.phone || place.address) ? `
                            <div style="margin: 12px 0 0; padding-top: 12px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #666; display: flex; flex-direction: column; gap: 8px;">
                                ${place.address ? `<div style="display: flex; gap: 8px; align-items: flex-start;"><span style="font-size: 14px;">📍</span> <span style="line-height: 1.4;">${place.address}</span></div>` : ''}
                                ${place.phone ? `<div style="display: flex; gap: 8px; align-items: center;"><span style="font-size: 14px;">📞</span> <span>${place.phone}</span></div>` : ''}
                                ${place.website ? `<div style="display: flex; gap: 8px; align-items: center;"><span style="font-size: 14px;">🌐</span> <a href="${place.website.startsWith('http') ? place.website : 'https://' + place.website}" target="_blank" style="color: #667eea; text-decoration: none; word-break: break-all;">Website</a></div>` : ''}
                            </div>
                            ` : ''}
                        </div>
                    `
                    marker.bindPopup(popupContent, { minWidth: 250 })

                    placeMarkers.push(marker)
                    markersRef.current.push(marker)
                })
            })

            if (placeMarkers.length > 0) {
                const group = new L.FeatureGroup(placeMarkers)
                mapRef.current.fitBounds(group.getBounds().pad(0.3))
            }

        } else if (!selectedCity) {
            if (places.length === 0) return;
            // Group places by city
            const cityGroups = places.reduce((acc, place) => {
                if (!acc[place.city]) {
                    acc[place.city] = {
                        name: place.city,
                        lat: 0,
                        lng: 0,
                        count: 0
                    }
                }
                acc[place.city].lat += place.location_lat
                acc[place.city].lng += place.location_lng
                acc[place.city].count += 1
                return acc
            }, {} as Record<string, { name: string, lat: number, lng: number, count: number }>)

            const cityMarkers: L.Marker[] = []

            Object.values(cityGroups).forEach(city => {
                const avgLat = city.lat / city.count
                const avgLng = city.lng / city.count

                const iconHtml = `<div style="
                    background: white;
                    color: #031B4E;
                    border-radius: 20px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 14px;
                    border: 2px solid #667eea;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    white-space: nowrap;
                    cursor: pointer;
                ">
                    <span style="margin-right: 6px;">🏙️</span>
                    ${city.name}
                </div>`

                const icon = L.divIcon({
                    className: 'city-marker',
                    html: iconHtml,
                    iconSize: [120, 40],
                    iconAnchor: [60, 20],
                })

                const marker = L.marker([avgLat, avgLng], { icon }).addTo(mapRef.current!)
                marker.on('click', () => {
                    if (onCityClick) onCityClick(city.name)
                })
                cityMarkers.push(marker)
                markersRef.current.push(marker)
            })

            // Fit to show all cities
            if (cityMarkers.length > 0) {
                const group = new L.FeatureGroup(cityMarkers)
                mapRef.current.fitBounds(group.getBounds().pad(0.2))
            }
        } else {
            // Show places for the selected city
            const cityPlaces = places.filter(p => p.city === selectedCity)
            const placeMarkers: L.Marker[] = []

            cityPlaces.forEach((place, index) => {
                // Check if place is in any day plan
                let planInfo = null;
                if (dayPlans) {
                    for (let i = 0; i < dayPlans.length; i++) {
                        const day = dayPlans[i];
                        const itemIndex = day.items.findIndex(item => item.id === `place-${place.id}`);
                        if (itemIndex !== -1) {
                            planInfo = { dayIndex: i, itemIndex, dayId: day.id };
                            break;
                        }
                    }
                }

                let iconHtml;
                let zIndexOffset = 0;

                if (planInfo) {
                    const colors = ['#e53e3e', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];
                    const color = colors[planInfo.dayIndex % colors.length];
                    zIndexOffset = 1000;

                    iconHtml = `<div style="
                        background: ${color};
                        color: white;
                        border-radius: 50%;
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 14px;
                        border: 3px solid white;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                    ">${planInfo.itemIndex + 1}</div>`;
                } else {
                    iconHtml = `<div style="
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
                    ">${index + 1}</div>`;
                }

                const icon = L.divIcon({
                    className: 'custom-trip-marker',
                    html: iconHtml,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                })

                const marker = L.marker([place.location_lat, place.location_lng], { icon, zIndexOffset }).addTo(mapRef.current!)

                // Popup and Draggable logic remains same...
                const element = marker.getElement()
                if (element) {
                    element.draggable = true
                    element.addEventListener('dragstart', (e) => {
                        const mapItem = {
                            id: `place-${place.id}`,
                            name: place.title,
                            type: 'place',
                            coordinates: { lat: place.location_lat, lng: place.location_lng },
                            data: place
                        }
                        e.dataTransfer!.setData('application/json', JSON.stringify(mapItem))
                    })
                }

                const popupContent = `
                    <div style="min-width: 280px; max-width: 320px;">
                        ${place.image_url ? `<img src="${place.image_url}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />` : ''}
                        <h3 style="margin: 0; font-size: 17px; color: #031B4E;">${place.title}</h3>
                        ${place.reviewsCount ? `<div style="display: flex; align-items: center; gap: 4px; margin-top: 4px; margin-bottom: 8px;">
                            <span style="color: #f59e0b; font-size: 14px;">★</span>
                            <span style="font-size: 13px; color: #666;">${place.reviewsCount} reviews</span>
                        </div>` : ''}
                        <p style="margin: 8px 0; font-size: 13px; color: #555;">${place.description && place.description.length > 100 ? place.description.substring(0, 100) + '...' : place.description || ''}</p>
                        
                        ${(place.website || place.phone || place.address) ? `
                        <div style="margin: 12px 0; padding-top: 12px; border-top: 1px solid #eee; font-size: 12px; color: #666; display: flex; flex-direction: column; gap: 6px;">
                            ${place.address ? `<div style="display: flex; gap: 6px; align-items: start;"><span style="font-size: 14px;">📍</span> <span style="line-height: 1.4;">${place.address}</span></div>` : ''}
                            ${place.phone ? `<div style="display: flex; gap: 6px; align-items: center;"><span style="font-size: 14px;">📞</span> <span>${place.phone}</span></div>` : ''}
                            ${place.website ? `<div style="display: flex; gap: 6px; align-items: center;"><span style="font-size: 14px;">🌐</span> <a href="${place.website.startsWith('http') ? place.website : 'https://' + place.website}" target="_blank" style="color: #667eea; text-decoration: none; word-break: break-all;">Website</a></div>` : ''}
                        </div>
                        ` : ''}
                        
                        <button class="add-to-plan-btn" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 12px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                            + Add to Plan
                        </button>
                    </div>
                `
                marker.bindPopup(popupContent, { minWidth: 280 })

                marker.on('popupopen', (e) => {
                    const popupNode = e.popup.getElement();
                    if (popupNode) {
                        const btn = popupNode.querySelector('.add-to-plan-btn');
                        if (btn) {
                            btn.addEventListener('click', () => {
                                if (onAddToPlan) onAddToPlan(place);
                                marker.closePopup();
                            });
                        }
                    }
                });
                placeMarkers.push(marker)
                markersRef.current.push(marker)
            })

            if (placeMarkers.length > 0) {
                const group = new L.FeatureGroup(placeMarkers)
                mapRef.current.fitBounds(group.getBounds().pad(0.3))
            }
        }
    }, [places, selectedCity, dayPlans, onCityClick])

    // handle resize and polylines...
    useEffect(() => {
        if (!mapRef.current) return;

        if (!dayPlans || dayPlans.length === 0) return;

        const colors = ['#e53e3e', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];
        const polylines: L.Polyline[] = [];

        dayPlans.forEach((day, index) => {
            const latLngs = day.items
                .map(item => [item.coordinates.lat, item.coordinates.lng] as [number, number])
                .filter(c => c[0] && c[1]);

            if (latLngs.length > 1) {
                const polyline = L.polyline(latLngs, {
                    color: colors[index % colors.length],
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '8, 8',
                }).addTo(mapRef.current!);
                polylines.push(polyline);
            }
        });

        // Connect days with subtle lines
        for (let i = 0; i < dayPlans.length - 1; i++) {
            const currentDay = dayPlans[i];
            const nextDay = dayPlans[i + 1];

            const currentValidItems = currentDay.items.filter(item => item.coordinates?.lat && item.coordinates?.lng);
            const nextValidItems = nextDay.items.filter(item => item.coordinates?.lat && item.coordinates?.lng);

            if (currentValidItems.length > 0 && nextValidItems.length > 0) {
                const lastItem = currentValidItems[currentValidItems.length - 1];
                const firstItem = nextValidItems[0];
                const polyline = L.polyline([
                    [lastItem.coordinates.lat, lastItem.coordinates.lng],
                    [firstItem.coordinates.lat, firstItem.coordinates.lng]
                ], {
                    color: '#94a3b8', // slate-400
                    weight: 3,
                    opacity: 0.5,
                    dashArray: '4, 12',
                }).addTo(mapRef.current!);
                polylines.push(polyline);
            }
        }

        return () => polylines.forEach(p => p.remove());
    }, [dayPlans]);

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

