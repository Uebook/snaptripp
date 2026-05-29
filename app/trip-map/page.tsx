'use client'

import '../home.css'
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import DayPlanner, { DayPlan } from '../components/DayPlanner'
import TimelineView from '../components/TimelineView'
import { MapItem } from '../components/HierarchicalMap'
import AuthModal from '../components/AuthModal'
import PlaceDetailsModal from '../components/PlaceDetailsModal'

// Dynamically import TripMap to avoid SSR issues with Leaflet
const TripMap = dynamic(() => import('../components/TripMap'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e9ecef' }}>Loading map...</div>
})

import { supabase } from '@/lib/supabase'

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
  postalCode?: string
  subTitle?: string
  // Opening Hours
  openingHours_0_day?: string; openingHours_1_day?: string; openingHours_2_day?: string; openingHours_3_day?: string; openingHours_4_day?: string; openingHours_5_day?: string; openingHours_6_day?: string;
  openingHours_0_hours?: string; openingHours_1_hours?: string; openingHours_2_hours?: string; openingHours_3_hours?: string; openingHours_4_hours?: string; openingHours_5_hours?: string; openingHours_6_hours?: string;
  // Accessibility
  ai_Acc_0_entrance?: boolean; ai_Acc_1_entrance?: boolean; ai_Acc_2_entrance?: boolean; ai_Acc_3_entrance?: boolean; ai_Acc_4_entrance?: boolean;
  ai_Acc_0_parking?: boolean; ai_Acc_1_parking?: boolean; ai_Acc_2_parking?: boolean; ai_Acc_3_parking?: boolean; ai_Acc_4_parking?: boolean;
  ai_Acc_0_restroom?: boolean; ai_Acc_1_restroom?: boolean; ai_Acc_2_restroom?: boolean; ai_Acc_3_restroom?: boolean; ai_Acc_4_restroom?: boolean;
  // Kids, Pets, Plan
  ai_Chld_0_kids?: boolean; ai_Chld_1_kids?: boolean; ai_Chld_2_kids?: boolean; ai_Chld_3_kids?: boolean;
  ai_Pets_0_dogs?: boolean; ai_Pets_1_dogs?: boolean; ai_Pets_2_dogs?: boolean;
  ai_Plan_0_tickets?: boolean; ai_Plan_1_tickets?: boolean; ai_Plan_2_tickets?: boolean; ai_Plan_3_tickets?: boolean;
}

function TripMapContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const country = searchParams.get('country')
  const tripStyle = searchParams.get('style')
  const duration = searchParams.get('duration')
  const immersion = searchParams.get('immersion')
  const tripIdParam = searchParams.get('tripId')

  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countryInfo, setCountryInfo] = useState<any>(null)

  // Day Planner State
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([])
  const [showTimeline, setShowTimeline] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [daysCount, setDaysCount] = useState<number>(1)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(!tripIdParam)
  const [isItineraryOpen, setIsItineraryOpen] = useState<boolean>(false)

  // Auth & Saving State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaveTitleModalOpen, setIsSaveTitleModalOpen] = useState(false)
  const [saveTripTitle, setSaveTripTitle] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  // UI state for Right Sidebar Accordions
  const [activeAccordion, setActiveAccordion] = useState<string | null>('overview')
  const [activeCityTab, setActiveCityTab] = useState<string>('Overview')

  // Drag & Drop State
  const [dragItem, setDragItem] = useState<{ itemId: string; fromDayId: string } | null>(null)
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null)

  // Mobile layout state
  const [activeMobileTab, setActiveMobileTab] = useState<'itinerary' | 'map' | 'explore'>('map')
  const [activeDetailsPlace, setActiveDetailsPlace] = useState<Place | null>(null)

  // Use refs for potential interaction if needed (though logic moved to TripMap)
  const markersRef = useRef<any[]>([])
  const mapRef = useRef<any>(null)

  // Check auth user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null)
    })
  }, [])

  // Load trip if ID exists
  useEffect(() => {
    if (tripIdParam) {
      const fetchTrip = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) return

          const res = await fetch(`/api/trips/${tripIdParam}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          const data = await res.json()
          if (data.success && data.trip) {
            const loadedDays: DayPlan[] = data.trip.days.map((day: any) => ({
              id: day.id,
              title: day.title,
              items: day.items.map((item: any) => ({
                id: item.id,
                name: item.custom_name || item.place?.title || 'Unknown Place',
                type: 'place',
                coordinates: item.place ? { lat: item.place.location_lat, lng: item.place.location_lng } : { lat: 0, lng: 0 },
                data: item.place || {}
              }))
            }))
            setDayPlans(loadedDays)
          }
        } catch (err) {
          console.error('Failed to load trip', err)
        }
      }
      fetchTrip()
    } else {
      // Load from local storage draft if it's a new trip
      try {
        const draft = localStorage.getItem('snaptrip_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDayPlans(parsed);
            setDaysCount(parsed.length);
          }
        }
      } catch (e) {
        console.error('Failed to load draft from local storage', e);
      }
    }
  }, [tripIdParam])

  // Save to localStorage on change so progress isn't lost
  useEffect(() => {
    if (!tripIdParam && dayPlans.length > 0) {
      localStorage.setItem('snaptrip_draft', JSON.stringify(dayPlans));
    }
  }, [dayPlans, tripIdParam])

  // Fetch places for the selected country
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!country) {
        setError('No country selected')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch(`/api/planner/places?country=${encodeURIComponent(country)}`)
        const data = await res.json()

        if (data.success) {
          setPlaces(data.places)
          setCountryInfo(data.countryInfo)
        } else {
          setError(data.error || 'Failed to fetch places')
        }

      } catch (err) {
        console.error('Error fetching places:', err)
        setError('Failed to load places')
      } finally {
        setLoading(false)
      }
    }

    fetchPlaces()
  }, [country])

  const handleSaveTripClick = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    setSaveTripTitle(`${country} Adventure`)
    setIsSaveTitleModalOpen(true)
  }

  const confirmSaveTrip = async () => {
    if (!saveTripTitle.trim()) return;

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return;

    try {
      setIsSaving(true)
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          country: country || 'Unknown',
          title: saveTripTitle.trim(),
          days: dayPlans.map(d => ({
            title: d.title,
            items: d.items.map(i => ({
              type: i.type,
              name: i.name,
              note: '',
              data: { id: i.data.id }
            }))
          }))
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('Trip saved successfully!')
      } else {
        alert('Failed to save: ' + data.error)
      }

    } catch (err) {
      console.error('Save error', err)
      alert('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Planner Handlers
  const handleUpdateDaysCount = (newCount: number) => {
    setDaysCount(newCount);
    const newDays = [...dayPlans];
    if (newCount > newDays.length) {
      while (newDays.length < newCount) {
        newDays.push({
          id: `day-${Date.now()}-${newDays.length + 1}`,
          title: `Day ${newDays.length + 1}`,
          items: []
        });
      }
    } else if (newCount < newDays.length) {
      newDays.splice(newCount, newDays.length - newCount);
    }
    setDayPlans(newDays);
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

  const handleAddToItinerary = (place: Place, targetDayIndex?: number) => {
    const item: MapItem = {
      id: `place-${place.id}`,
      name: place.title,
      type: 'place',
      coordinates: { lat: place.location_lat, lng: place.location_lng },
      data: place
    }

    const newDays = [...dayPlans]

    // Prevent duplicates globally
    if (newDays.some(day => day.items.some(i => i.id === item.id))) return;

    if (targetDayIndex !== undefined) {
      if (newDays[targetDayIndex]) {
        newDays[targetDayIndex].items.push(item);
        setDayPlans(newDays);
      }
      return;
    }

    // Auto-add logic
    if (newDays.length === 0) {
      newDays.push({
        id: `day-${Date.now()}-1`,
        title: `Day 1`,
        items: []
      });
    }

    let lastDayIndex = newDays.length - 1;
    if (newDays[lastDayIndex].items.length >= 4) {
      // Auto add a new day when the last one has 4 items
      lastDayIndex++;
      newDays.push({
        id: `day-${Date.now()}-${lastDayIndex + 1}`,
        title: `Day ${lastDayIndex + 1}`,
        items: []
      });
      setDaysCount(newDays.length);
    }

    newDays[lastDayIndex].items.push(item);
    setDayPlans(newDays);
  }

  const getOthers = () => {
    if (!selectedCity) return [];
    const cityPlaces = places.filter(p => p.city === selectedCity);
    const assignedPlaceIds = new Set(dayPlans.flatMap(d => d.items.map(i => i.id.replace('place-', ''))));
    return cityPlaces.filter(p => !assignedPlaceIds.has(p.id.toString()));
  }

  // --- Drag & Drop Handlers ---
  const handleDragStart = (itemId: string, fromDayId: string) => {
    setDragItem({ itemId, fromDayId })
  }

  const handleDropOnDay = (toDayId: string) => {
    if (!dragItem || dragItem.fromDayId === toDayId) {
      setDragItem(null)
      setDragOverDayId(null)
      return
    }

    if (dragItem.fromDayId === 'suggested') {
      const place = places.find(p => p.id.toString() === dragItem.itemId)
      if (place) {
        const dayIndex = dayPlans.findIndex(d => d.id === toDayId)
        handleAddToItinerary(place, dayIndex)
      }
      setDragItem(null)
      setDragOverDayId(null)
      return
    }

    if (toDayId === 'suggested') {
      handleRemoveFromDay(dragItem.fromDayId, dragItem.itemId)
      setDragItem(null)
      setDragOverDayId(null)
      return
    }

    const newDays = dayPlans.map(day => ({ ...day, items: [...day.items] }))
    const fromDay = newDays.find(d => d.id === dragItem.fromDayId)
    const toDay = newDays.find(d => d.id === toDayId)
    if (!fromDay || !toDay) return
    const itemIndex = fromDay.items.findIndex(i => i.id === dragItem.itemId)
    if (itemIndex === -1) return
    const [movedItem] = fromDay.items.splice(itemIndex, 1)
    toDay.items.push(movedItem)
    setDayPlans(newDays)
    setDragItem(null)
    setDragOverDayId(null)
  }

  const handleRemoveFromDay = (dayId: string, itemId: string) => {
    setDayPlans(dayPlans.map(day =>
      day.id === dayId ? { ...day, items: day.items.filter(i => i.id !== itemId) } : day
    ))
  }

  const handleRemoveGlobal = (placeId: number) => {
    const itemId = `place-${placeId}`;
    setDayPlans(dayPlans.map(day => ({
      ...day,
      items: day.items.filter(i => i.id !== itemId)
    })))
  }

  const isPlaceInPlanGlobal = (placeId: number) => {
    const itemId = `place-${placeId}`;
    return dayPlans.some(day => day.items.some(item => item.data?.id === placeId || item.id === itemId));
  };

  const selectedCityData = selectedCity ? places.find(p => p.city === selectedCity) : null;

  if (!country) {
    return (
      <div className="trip-map-page">
        <SiteHeader />
        <div className="trip-map-error">
          <h2>No Country Selected</h2>
          <p>Please go back and select a destination.</p>
          <button onClick={() => router.push('/')} className="back-button">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-map-page">
      <div className="trip-map-header-wrapper">
        <SiteHeader />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          handleSaveTripClick();
        }}
      />

      {isSaveTitleModalOpen && (
        <div className="save-modal-overlay" onClick={() => setIsSaveTitleModalOpen(false)}>
          <div className="save-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="save-modal-title">Name Your Journey</h3>
            <p className="save-modal-subtitle">Give your itinerary a memorable name before saving.</p>
            <input
              type="text"
              className="save-modal-input"
              value={saveTripTitle}
              onChange={e => setSaveTripTitle(e.target.value)}
              placeholder="e.g. Summer in Ireland"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSaveTitleModalOpen(false);
                  confirmSaveTrip();
                }
              }}
            />
            <div className="save-modal-actions">
              <button className="btn-cancel" onClick={() => setIsSaveTitleModalOpen(false)}>Cancel</button>
              <button
                className="btn-confirm"
                onClick={() => {
                  setIsSaveTitleModalOpen(false);
                  confirmSaveTrip();
                }}
                disabled={!saveTripTitle.trim() || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Grid ─────────────────────────────────────────────────────── */}
      <div
        className={`trip-map-container ${isItineraryOpen ? 'itinerary-open' : 'itinerary-closed'}`}
        style={{
          gridTemplateAreas: '"guide map itinerary"',
          gridTemplateColumns: isItineraryOpen ? '450px 1fr 400px' : '450px 1fr 0px',
          gridTemplateRows: '1fr',
          transition: 'grid-template-columns 0.3s ease-in-out'
        }}
      >

        {/* ── Right Sidebar (Itinerary) ── */}
        {dayPlans.length > 0 && (
          <div
            className={`sidebar itinerary-sidebar ${activeMobileTab === 'itinerary' ? 'mobile-active' : ''} ${!isItineraryOpen ? 'sidebar-hidden' : ''}`}
            style={{ gridArea: 'itinerary', display: 'flex', flexDirection: 'column' }}
          >
            <div className="itinerary-header-horizontal">
              <div className="itinerary-info-horizontal">
                <div className="itinerary-title-horizontal">
                  <span>Your Itinerary</span>
                  <h4>{country?.toUpperCase()} TRIP • {dayPlans.length} DAYS</h4>
                </div>
              </div>
              <div className="itinerary-actions-horizontal">
                <button 
                  className="btn-confirm-itinerary"
                  onClick={() => router.push(`/trip-confirm?country=${encodeURIComponent(country || '')}`)}
                >
                  CONFIRM ITINERARY
                </button>
              </div>
            </div>

            <div className="itinerary-scroller-premium" style={{ flexDirection: 'column', overflowY: 'auto' }}>
              {dayPlans.map((day, idx) => (
                <div
                  key={day.id}
                  className={`day-card-premium ${dragOverDayId === day.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDayId(day.id) }}
                  onDragLeave={() => setDragOverDayId(null)}
                  onDrop={() => handleDropOnDay(day.id)}
                >
                  <div className="day-card-header" style={{ borderBottom: '1px solid #F3F4F6', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="step-number" style={{ width: '28px', height: '28px', fontSize: '14px' }}>{idx + 1}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 className="day-label-modern" style={{ margin: 0, fontSize: '15px' }}>{day.title}</h3>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Oct {14 + idx}</span>
                      </div>
                    </div>
                  </div>
                  <div className="site-list-premium" style={{ padding: '16px', gap: '12px', display: 'flex', flexDirection: 'column' }}>
                    {day.items.map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id, day.id)}
                        className="site-entry-premium"
                        style={{ 
                          padding: '8px 12px', 
                          background: '#FFFFFF', 
                          borderRadius: '8px', 
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'grab',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
                            <circle cx="4" cy="4" r="1.5"/><circle cx="4" cy="10" r="1.5"/><circle cx="4" cy="16" r="1.5"/>
                            <circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/>
                          </svg>
                        </div>
                        {item.data?.image_url && (
                          <img 
                            src={item.data.image_url} 
                            alt="" 
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span>09:00 AM</span>
                            <span>•</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.data?.city || 'City'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromDay(day.id, item.id)}
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px', padding: '4px', lineHeight: 1 }}
                          title="Remove from plan"
                        >×</button>
                      </div>
                    ))}
                    <div
                      className="day-empty-drop"
                      style={{ border: '2px dashed #E5E7EB', borderRadius: '8px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '12px', gap: '8px' }}
                    >
                      <span style={{ fontSize: '20px' }}>+</span> ADD ATTRACTION
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Center: Map ─────────────────────────────────────────────────── */}
        <div
          className={`trip-map-main-wrapper ${activeMobileTab === 'map' ? 'mobile-active' : ''}`}
          style={{ flex: 1, position: 'relative', gridArea: 'map' }}
        >
          {/* Popular Attractions Carousel (when no plan) */}
          {dayPlans.length === 0 && (
            <div className="popular-attractions-carousel animate-fade-in">
              <div className="carousel-header">
                <span style={{ color: '#F6B800', fontSize: '18px' }}>✨</span>
                <h3>Popular attractions</h3>
              </div>
              <div className="carousel-track">
                {(() => {
                  const pool = selectedCity ? places.filter(p => p.city === selectedCity) : places;
                  const displayPlaces = pool.slice(0, 4);
                  
                  if (displayPlaces.length === 0) return null;
                  
                  return displayPlaces.map((place) => (
                    <div 
                      key={place.id} 
                      className="popular-card" 
                      onClick={() => handleAddToItinerary(place)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={place.image_url || '/api/placeholder/400/200'} 
                        alt="" 
                        onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23ccc"><rect width="100" height="100" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12px" fill="%23999">No Image</text></svg>'; }} 
                      />
                      <div className="popular-card-info">
                        <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.title}</h4>
                        <p>{place.city} • {place.categoryName || 'Attraction'}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Weather Widget */}
          <div className="weather-widget">
            <div className="weather-main">
              <span style={{ fontSize: '32px' }}>⛅</span>
              <div className="weather-info">
                <div className="weather-temp">24°C</div>
                <strong>{country}</strong>
                <span>Sunny</span>
              </div>
            </div>
            <div className="weather-footer">
              Best time to visit: <span>April - June</span>
            </div>
          </div>

          <TripMap
            places={places}
            dayPlans={dayPlans}
            selectedCity={selectedCity}
            isSavedTripView={!!tripIdParam}
            onCityClick={(city) => {
              setSelectedCity(city)
              if (window.innerWidth <= 768) setActiveMobileTab('explore')
            }}
            onAddToPlan={(place) => handleAddToItinerary(place)}
            onRemoveFromPlan={(placeId) => handleRemoveGlobal(placeId)}
            onViewFullDetails={(place) => {
              setActiveDetailsPlace(place);
              setIsRightSidebarOpen(true);
            }}
          />
        </div> {/* ← closes trip-map-main-wrapper div */}

        {/* Itinerary Toggle Button */}
        {dayPlans.length > 0 && (
          <div 
            className="itinerary-toggle-tab"
            onClick={() => setIsItineraryOpen(!isItineraryOpen)}
          >
            {isItineraryOpen ? 'Close Itinerary ▾' : 'Your Itinerary ▾'}
          </div>
        )}

        {/* ── Left Sidebar: Guide / Place Details ────────────────────────── */}
        <div
          className={`sidebar right-sidebar ${activeMobileTab === 'explore' ? 'mobile-active' : ''}`}
          style={{ gridArea: 'guide' }}
        >
          <div className="country-discovery-view animate-fade-in" style={{ position: 'relative' }}>
            <div className="welcome-header">
                <h1>Welcome to <i>{country}</i></h1>
                <p>Explore the best experiences, plan your days, and build your perfect itinerary.</p>
              </div>

              <div className="controls-row">
                <div className="country-select-minimal">
                  <span style={{ fontSize: '18px' }}>🇮🇹</span>
                  {country}
                  <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
                </div>
                <div className="days-counter-minimal">
                  <span>Days</span>
                  <button className="counter-btn" onClick={() => handleUpdateDaysCount(Math.max(1, daysCount - 1))}>-</button>
                  <strong>{daysCount}</strong>
                  <button className="counter-btn" onClick={() => handleUpdateDaysCount(daysCount + 1)}>+</button>
                </div>
                <div className="search-bar-minimal">
                  <input
                    type="text"
                    placeholder={`Search ${selectedCity || country}...`}
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  />
                  <span style={{ color: '#F6B800' }}>🔍</span>
                </div>
              </div>

              <div className="discovery-scroll-area">
                {selectedCity ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', margin: 0 }}>Nearby results</h3>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Showing {places.filter(p => p.city === selectedCity).length} results</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Curation Spotlight</span>
                      <span style={{ fontSize: '11px', color: '#F6B800', fontWeight: '700', letterSpacing: '1px' }}>VIEW GALLERY</span>
                    </div>

                    {places.filter(p => p.city === selectedCity).map(place => (
                      <div 
                        key={place.id} 
                        draggable
                        onDragStart={() => handleDragStart(place.id.toString(), 'suggested')}
                        className="attraction-card-editorial" 
                        style={{
                          ...(isPlaceInPlanGlobal(place.id) ? { border: '2px solid #48bb78', boxShadow: '0 4px 15px rgba(72, 187, 120, 0.2)' } : {}),
                          cursor: 'grab'
                        }}
                      >
                        <div className="card-top">
                          <img 
                            src={place.image_url || '/api/placeholder/100/100'} 
                            alt="" 
                            className="card-img" 
                            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23ccc"><rect width="100" height="100" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12px" fill="%23999">No Image</text></svg>'; }}
                          />
                          <div className="card-main-info">
                            <h4>{place.title}</h4>
                            <span className="card-category">{place.categoryName || 'Attraction'}</span>
                            <div className="card-meta">
                              <span className="card-rating">★ 4.9</span>
                              <span>(2,841)</span>
                              <span>• Open until 7PM</span>
                            </div>
                          </div>
                          <button
                            className="card-action-btn"
                            onClick={() => handleAddToItinerary(place)}
                          >
                            {isPlaceInPlanGlobal(place.id) ? '✓' : '+'}
                          </button>
                        </div>
                        <div className="card-footer-info" onClick={() => setActiveDetailsPlace(place)}>
                          MORE INFO <span style={{ marginLeft: '4px', fontSize: '14px' }}>▾</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="explorer-view">
                    <h2 style={{ fontSize: '24px', margin: '0 0 8px' }}>{country} Explorer</h2>
                    <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px' }}>Welcome to your personal guide to {country}.</p>

                    {dayPlans.length > 0 ? (
                      <div style={{ padding: '20px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD', marginBottom: '32px' }}>
                        <h4 style={{ color: '#0369A1', margin: '0 0 8px', fontSize: '16px' }}>Your itinerary is active! ✨</h4>
                        <p style={{ color: '#0C4A6E', margin: 0, fontSize: '14px' }}>
                          Select any city on the map or zoom in to discover more attractions to add to your plan.
                        </p>
                      </div>
                    ) : (
                      <div className="explorer-steps">
                        <div className="explorer-step">
                          <div className="step-number">1</div>
                          <div className="step-content">
                            <h4>Select a City</h4>
                            <p>Click a marker on the map to begin your journey.</p>
                          </div>
                        </div>
                        <div className="explorer-step">
                          <div className="step-number">2</div>
                          <div className="step-content">
                            <h4>Choose Attractions</h4>
                            <p>Browse local landmarks and add them to your itinerary.</p>
                          </div>
                        </div>
                        <div className="explorer-step">
                          <div className="step-number">3</div>
                          <div className="step-content">
                            <h4>Finalize Itinerary</h4>
                            <p>Review your day-wise plan and start your tour.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="explorer-card">
                      <div className="explorer-card-icon">🏛️</div>
                      <div className="explorer-card-text">
                        <h5>Timeless Art &amp; Living Culture</h5>
                        <p>Witness the genius of the masters as you wander through galleries.</p>
                      </div>
                    </div>
                    <div className="explorer-card" style={{ background: '#FFF7ED' }}>
                      <div className="explorer-card-icon" style={{ color: '#F97316' }}>🍴</div>
                      <div className="explorer-card-text">
                        <h5>Savor the Flavors of Tradition</h5>
                        <p>Indulge in artisanal delicacies and world-class vintages.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div> {/* ← closes right-sidebar div */}

      </div> {/* ← closes trip-map-container div */}

      {/* Modals */}
      {activeDetailsPlace && (
        <PlaceDetailsModal
          place={activeDetailsPlace}
          onClose={() => setActiveDetailsPlace(null)}
          dayPlans={dayPlans}
          onAddToItinerary={(place, dayIdx) => handleAddToItinerary(place)} // Or handle dayIdx if supported
          isPlaceInPlanGlobal={isPlaceInPlanGlobal}
          onRemoveFromPlan={() => handleRemoveGlobal(activeDetailsPlace.id)}
        />
      )}

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <div className="mobile-bottom-nav">
        <button className={`mobile-nav-btn ${activeMobileTab === 'itinerary' ? 'active' : ''}`} onClick={() => setActiveMobileTab('itinerary')}>
          <span className="icon">📋</span>
          Itinerary
        </button>
        <button className={`mobile-nav-btn ${activeMobileTab === 'map' ? 'active' : ''}`} onClick={() => setActiveMobileTab('map')}>
          <span className="icon">🗺️</span>
          Map
        </button>
        <button className={`mobile-nav-btn ${activeMobileTab === 'explore' ? 'active' : ''}`} onClick={() => setActiveMobileTab('explore')}>
          <span className="icon">✨</span>
          Explore
        </button>
      </div>

      <style jsx global>{`
        :root {
          /* Luxury Palette */
          --color-sapphire: #031B4E;
          --color-sapphire-light: #0A2B6E;
          --color-gold: #D4AF37;
          --color-gold-muted: rgba(212, 175, 55, 0.2);
          --color-champagne: #F5E6BE;
          --color-pure-white: #FFFFFF;
          --color-soft-slate: #64748B;
          --color-ice: #F8FAFC;
          
          /* Effects */
          --glass-surface: rgba(255, 255, 255, 0.75);
          --glass-border: rgba(255, 255, 255, 0.3);
          --glass-blur: blur(12px);
          --shadow-luxe: 0 20px 40px -10px rgba(3, 27, 78, 0.12);
          
          /* Spacing */
          --sidebar-left: 400px;
          --sidebar-right: 480px;
        }

        .trip-map-page {
          height: 100vh;
          overflow: hidden;
          background: var(--color-ice);
          font-family: 'Inter', sans-serif;
          color: var(--color-sapphire);
        }

        .trip-map-container {
          display: grid;
          position: relative;
          grid-template-areas: 
            "guide map"
            "itinerary itinerary";
          grid-template-columns: 450px 1fr;
          grid-template-rows: 1fr 320px;
          height: calc(100vh - 64px);
          background: #FFFFFF;
        }

        .trip-map-container.fullscreen-map {
          grid-template-areas: "map map" "itinerary itinerary";
          grid-template-columns: 1fr !important;
        }

        .sidebar {
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 20;
          overflow: hidden;
          min-height: 0;
        }

        .itinerary-toggle-tab {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          transform-origin: bottom right;
          background-color: #031B4E;
          color: white;
          padding: 8px 16px;
          border-radius: 8px 8px 0 0;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
          letter-spacing: 1px;
        }

        .itinerary-closed .itinerary-sidebar {
          display: none !important;
        }

        .left-sidebar { border-top: 1px solid #E2E8F0; }
        .right-sidebar { border-right: 1px solid #E2E8F0; }

        .itinerary-scroller-premium {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          overflow-x: hidden;
          overflow-y: auto;
          flex: 1;
        }

        .day-card-premium {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .day-card-premium:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        /* Typography & Headings */
        h1, h2, h3 {
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }

        /* Discovery & Exploration (Left) */
        .discovery-view, .country-discovery-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .itinerary-header-horizontal {
          padding: 20px 40px;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .itinerary-info-horizontal {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .itinerary-title-horizontal {
          display: flex;
          flex-direction: column;
        }

        .itinerary-title-horizontal h4 {
          font-size: 16px;
          color: #111827;
          font-weight: 700;
          margin: 0;
        }

        .itinerary-title-horizontal span {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .itinerary-actions-horizontal {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-confirm-itinerary {
          padding: 10px 20px;
          background: var(--color-sapphire);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-confirm-itinerary:hover {
          background: var(--color-sapphire-light);
        }

        .btn-share-itinerary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #fff;
          color: var(--color-sapphire);
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-share-itinerary:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }

        .popular-attractions-carousel {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          padding: 24px;
          width: 800px;
          z-index: 1000;
        }

        .carousel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .carousel-header h3 {
          font-size: 16px;
          color: #111827;
          font-weight: 700;
          margin: 0;
        }

        .carousel-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .carousel-track::-webkit-scrollbar { display: none; }

        .popular-card {
          min-width: 240px;
          border: 1px solid #F3F4F6;
          border-radius: 12px;
          overflow: hidden;
        }

        .popular-card img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .popular-card-info {
          padding: 12px;
        }

        .popular-card-info h4 {
          font-size: 14px;
          color: #111827;
          margin: 0 0 4px;
          font-weight: 700;
        }

        .popular-card-info p {
          font-size: 11px;
          color: #9CA3AF;
          margin: 0;
        }

        .welcome-header {
          padding: 40px 32px 20px;
        }

        .welcome-header h1 {
          font-size: 28px;
          color: #031B4E;
          margin: 0;
          font-weight: 400;
        }

        .welcome-header h1 i {
          color: #F6B800;
          font-style: italic;
          font-weight: 700;
          text-transform: uppercase;
        }

        .welcome-header p {
          color: #6B7280;
          font-size: 14px;
          margin: 8px 0 0;
        }

        .controls-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          padding: 0 32px 24px;
        }

        .weather-widget {
          position: absolute;
          top: 24px;
          right: 24px;
          background: #FFFFFF;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 200px;
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .weather-temp {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
        }

        .weather-info {
          display: flex;
          flex-direction: column;
        }

        .weather-info strong { font-size: 16px; color: #111827; }
        .weather-info span { font-size: 14px; color: #6B7280; }

        .weather-footer {
          border-top: 1px solid #F3F4F6;
          padding-top: 12px;
          font-size: 13px;
          color: #4B5563;
        }

        .weather-footer span { color: #111827; font-weight: 600; margin-left: 4px; }

        .country-select-minimal {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #FAFAFA;
          font-weight: 600;
          font-size: 14px;
          color: #111827;
        }

        .days-counter-minimal {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #FAFAFA;
        }

        .days-counter-minimal span {
          font-size: 14px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .days-counter-minimal strong {
          font-size: 18px;
          color: #111827;
          min-width: 20px;
          text-align: center;
        }

        .counter-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid #D1D5DB;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          color: #4B5563;
        }

        .search-bar-minimal {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 16px;
          background: #FAFAFA;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          height: 44px;
        }

        .search-bar-minimal input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #111827;
        }

        .search-bar-minimal input::placeholder { color: #9CA3AF; }

        .discovery-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.5) transparent;
        }
        .discovery-scroll-area::-webkit-scrollbar { width: 4px; }
        .discovery-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .discovery-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.45);
          border-radius: 4px;
        }

        .explorer-steps {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        .explorer-step {
          display: flex;
          gap: 16px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F6B800;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 16px;
          color: #111827;
          margin: 0 0 4px;
        }

        .step-content p {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }

        .explorer-card {
          background: #EEF2FF;
          padding: 24px;
          border-radius: 12px;
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
        }

        .explorer-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #F6B800;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          flex-shrink: 0;
        }

        .explorer-card-text h5 {
          font-size: 15px;
          color: #111827;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .explorer-card-text p {
          font-size: 13px;
          color: #4B5563;
          margin: 0;
          line-height: 1.5;
        }

        /* Place Cards */
        .attraction-card-editorial {
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
          border: 1px solid #F3F4F6;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
        }

        .card-top {
          display: flex;
          padding: 16px;
          gap: 16px;
          position: relative;
        }

        .card-img {
          width: 90px;
          height: 90px;
          border-radius: 8px;
          object-fit: cover;
        }

        .card-main-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-main-info h4 {
          font-size: 16px;
          color: #111827;
          font-weight: 700;
          margin: 0;
        }

        .card-category {
          font-size: 11px;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 4px 0 8px;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #6B7280;
        }

        .card-meta span { display: flex; align-items: center; gap: 4px; }
        .card-rating { color: #F6B800; font-weight: 700; }

        .card-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: #FFFFFF;
          color: #F6B800;
          flex-shrink: 0;
          align-self: flex-start;
        }

        .card-footer-info {
          padding: 12px 16px;
          background: #FAFAFA;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          border-top: 1px solid #F3F4F6;
        }

        /* Animations */
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .panel-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-ice);
          border: 1px solid #e2e8f0;
          color: var(--color-sapphire);
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }

        .panel-close-btn:hover {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        .right-panel-close {
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
        }

        .sidebar.sidebar-hidden {
          display: none !important;
        }

        /* Place Details Sidebar */
        .place-details-sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fff;
        }

        .place-hero-sidebar {
          position: relative;
          height: 280px;
          flex-shrink: 0;
        }

        .sidebar-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(3, 27, 78, 0.9) 100%);
        }

        .sidebar-hero-content {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          color: #fff;
        }

        .sidebar-category-badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--color-gold);
          color: #031B4E;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .sidebar-hero-content h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          line-height: 1.2;
        }

        .sidebar-details-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          scrollbar-width: thin;
        }

        .sidebar-info-section {
          margin-bottom: 32px;
        }

        .sidebar-description {
          font-size: 14px;
          line-height: 1.7;
          color: #475569;
          margin: 0 0 24px;
        }

        .sidebar-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-row {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        .contact-row span:first-child {
          width: 20px;
          flex-shrink: 0;
        }

        .contact-row a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .sidebar-section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #1e293b;
          font-weight: 800;
          margin: 0 0 16px;
        }

        .sidebar-features-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .side-feature-chip {
          padding: 6px 14px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .sidebar-hours-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sidebar-hour-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-hour-row .day { color: #64748b; }
        .sidebar-hour-row .hours { color: #1e293b; font-weight: 600; }

        .sidebar-btn-add {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.25);
          transition: all 0.3s;
        }

        .sidebar-btn-remove {
          width: 100%;
          padding: 16px;
          background: #fff;
          color: #ef4444;
          border: 2px solid #fee2e2;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sidebar-btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.35);
        }

        .sidebar-btn-remove:hover {
          background: #fef2f2;
        }

        /* Save Trip Modal */
        .save-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(3, 27, 78, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 20px;
        }

        .save-modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.2);
          animation: modalPopUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }

        @keyframes modalPopUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .save-modal-title {
          margin: 0 0 12px 0;
          font-size: 1.6rem;
          color: var(--color-sapphire);
          font-family: "Playfair Display", serif;
          font-weight: 800;
        }

        .save-modal-subtitle {
          margin: 0 0 24px 0;
          font-size: 0.95rem;
          color: var(--color-soft-slate);
          line-height: 1.5;
        }

        .save-modal-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 1rem;
          color: #1e293b;
          background: #f8fafc;
          margin-bottom: 24px;
          transition: all 0.2s;
          box-sizing: border-box;
          outline: none;
        }
        .save-modal-input:focus {
          border-color: #D4AF37;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        .save-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: stretch;
        }

        .save-modal-actions button {
          flex: 1;
          padding: 12px 0;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .save-modal-actions .btn-cancel {
          background: #f1f5f9;
          color: #475569;
        }
        .save-modal-actions .btn-cancel:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .save-modal-actions .btn-confirm {
          background: linear-gradient(135deg, var(--color-sapphire) 0%, var(--color-sapphire-light) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 27, 78, 0.2);
        }
        .save-modal-actions .btn-confirm:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(3, 27, 78, 0.3);
        }
        .save-modal-actions .btn-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #fff;
          border-top: 1px solid #eee;
          z-index: 1000;
          justify-content: space-around;
          align-items: center;
        }

        .mobile-nav-btn {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #888;
          gap: 4px;
          padding: 8px 16px;
          cursor: pointer;
        }

        .mobile-nav-btn.active { color: var(--color-sapphire); }
        .mobile-nav-btn .icon { font-size: 20px; }

        @media (max-width: 1024px) {
          .trip-map-container {
            grid-template-columns: var(--sidebar-left) 1fr;
          }
          .right-sidebar {
            position: fixed;
            right: 0;
            top: 64px;
            bottom: 0;
            width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 50;
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          }
          .right-sidebar.mobile-active {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .trip-map-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 64px - 64px);
          }

          .mobile-bottom-nav { display: flex; }

          .sidebar, .trip-map-main-wrapper {
            display: none;
            width: 100%;
            height: 100%;
          }

          .sidebar.mobile-active, .trip-map-main-wrapper.mobile-active {
            display: flex;
            position: relative;
            transform: none;
            top: 0;
            z-index: auto;
            box-shadow: none;
          }

          .right-sidebar { left: 0; right: 0; width: 100%; }
        }

        .sidebar-hidden { display: none !important; }
      `}</style>

      {showTimeline && (
        <TimelineView
          dayPlans={dayPlans}
          onClose={() => setShowTimeline(false)}
        />
      )}

      <SiteFooter />
    </div>
  )
}

export default function TripMapPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#031B4E', marginBottom: '8px' }}>Loading Trip Map...</div>
          <div style={{ color: '#64748B' }}>Initializing your personalized adventure planner</div>
        </div>
      </div>
    }>
      <TripMapContent />
    </Suspense>
  )
}