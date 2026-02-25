'use client'

import '../home.css'
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import DayPlanner, { DayPlan } from '../components/DayPlanner'
import TimelineView from '../components/TimelineView'
import { MapItem } from '../components/HierarchicalMap'

// Dynamically import TripMap to avoid SSR issues with Leaflet
const TripMap = dynamic(() => import('../components/TripMap'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e9ecef' }}>Loading map...</div>
})

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

import { supabase } from '@/lib/supabase'
import AuthModal from '../components/AuthModal'

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

  // Auth & Saving State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // UI state for Right Sidebar Accordions
  const [activeAccordion, setActiveAccordion] = useState<string | null>('overview')

  // Drag & Drop State
  const [dragItem, setDragItem] = useState<{ itemId: string; fromDayId: string } | null>(null)
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null)


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
    }
  }, [tripIdParam])

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

  const handleSaveTrip = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setIsAuthModalOpen(true)
      return
    }

    const customTitle = window.prompt("Enter a title for your trip:", `${country} Adventure`);
    if (!customTitle) return;

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
          title: customTitle,
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
    )
  }

  const selectedCityData = selectedCity ? places.find(p => p.city === selectedCity) : null;

  return (
    <div className="trip-map-page">
      <SiteHeader />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false)
          handleSaveTrip()
        }}
      />

      <div className="trip-map-container">
        {/* Left Sidebar: Your Itinerary / Day Planner */}
        <div className="sidebar left-sidebar">
          <div className="itinerary-header-premium">
            <h2 className="itinerary-title-premium">Your Itinerary</h2>
            <p className="itinerary-subtitle-premium">{dayPlans.length} Days Planned</p>
          </div>

          <div className="itinerary-scroller-premium">
            {dayPlans.length > 0 ? (
              dayPlans.map((day) => (
                <div
                  key={day.id}
                  className={`day-card-premium animate-slide-up ${dragOverDayId === day.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDayId(day.id) }}
                  onDragLeave={() => setDragOverDayId(null)}
                  onDrop={() => handleDropOnDay(day.id)}
                >
                  <div className="day-card-header">
                    <h3 className="day-label-modern">{day.title}</h3>
                    <span className="day-drop-hint">Drop here</span>
                  </div>
                  <div className="site-list-premium">
                    {day.items.map(item => (
                      <div
                        key={item.id}
                        className={`site-entry-premium draggable-entry ${dragItem?.itemId === item.id ? 'is-dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(item.id, day.id)}
                        onDragEnd={() => { setDragItem(null); setDragOverDayId(null) }}
                      >
                        <div className="drag-handle">⠿</div>
                        <div className="entry-content">
                          <span className="entry-dot" />
                          <span className="entry-name">{item.name}</span>
                        </div>
                        <button
                          className="entry-remove-btn"
                          onClick={() => handleRemoveFromDay(day.id, item.id)}
                          title="Remove"
                        >×</button>
                      </div>
                    ))}
                    {day.items.length === 0 && (
                      <div className="day-empty-drop">Drop a place here</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-itinerary-state">
                <div className="empty-icon-box">📅</div>
                <p>Your plan is empty. Select a city on the right to start adding amazing places!</p>
              </div>
            )}

            {getOthers().length > 0 && (
              <div
                className={`day-card-premium others-card animate-slide-up ${dragOverDayId === 'suggested' ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverDayId('suggested') }}
                onDragLeave={() => setDragOverDayId(null)}
                onDrop={() => handleDropOnDay('suggested')}
              >
                <div className="day-card-header">
                  <h3 className="day-label-modern">Suggested Additions</h3>
                  <span className="day-drop-hint">Drop here to remove</span>
                </div>
                <div className="site-list-premium">
                  {getOthers().slice(0, 8).map(place => (
                    <div
                      key={place.id}
                      className={`site-entry-premium draggable-entry ${dragItem?.itemId === place.id.toString() ? 'is-dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(place.id.toString(), 'suggested')}
                      onDragEnd={() => { setDragItem(null); setDragOverDayId(null) }}
                    >
                      <div className="drag-handle">⠿</div>
                      <div className="entry-content">
                        <span className="entry-dot-alt" />
                        <span className="entry-name" style={{ opacity: 0.7 }}>{place.title}</span>
                      </div>
                      <button
                        className="add-site-btn-round"
                        style={{ width: '24px', height: '24px', fontSize: '14px', marginLeft: 'auto' }}
                        onClick={() => handleAddToItinerary(place)}
                      >+</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="itinerary-footer-actions">
            <button
              className="btn-timeline-floating"
              onClick={() => setShowTimeline(true)}
              disabled={dayPlans.length === 0}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              View Total Timeline
            </button>
            <button
              className="btn-save-trip-primary"
              onClick={handleSaveTrip}
              disabled={isSaving || dayPlans.length === 0}
            >
              {isSaving ? 'Saving...' : 'Save Trip'}
            </button>
          </div>
        </div>

        {/* Center: Map */}
        <div className="trip-map-main-wrapper" style={{ flex: 1, position: 'relative' }}>
          <TripMap
            places={places}
            dayPlans={dayPlans}
            selectedCity={selectedCity}
            onCityClick={(city) => setSelectedCity(city)}
            onAddToPlan={(place) => handleAddToItinerary(place)}
          />
        </div>

        {/* Right Sidebar: Country Discovery (Permanent) */}
        <div className="sidebar right-sidebar">
          {selectedCity ? (
            <div className="discovery-view animate-fade-in">
              <div className="sidebar-header-premium">
                <button
                  onClick={() => setSelectedCity(null)}
                  className="icon-btn back-btn"
                  title="Back to Country Overview"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="city-name-premium">{selectedCity}</h2>
              </div>

              <div className="exploration-content">
                {selectedCityData?.image_url && (
                  <div className="image-card-premium">
                    <img src={selectedCityData.image_url} alt={selectedCity} />
                    <div className="image-overlay-subtle" />
                  </div>
                )}

                <p className="city-description-glass">
                  {selectedCityData?.description || `${selectedCity} is a stunning destination. Explore its hidden gems and vibrant culture.`}
                </p>



                <div className="places-in-city-explorer">
                  <h3 className="section-subtitle-modern">Top Sights in {selectedCity}</h3>
                  <div className="places-scroller-premium">
                    {places.filter(p => p.city === selectedCity).map((place) => (
                      <div key={place.id} className="place-row-premium">
                        <div className="place-icon">🏛️</div>
                        <div className="place-info">
                          <h4>{place.title}</h4>
                          <p>{place.categoryName || 'Sightseeing'}</p>
                        </div>
                        <button className="add-site-btn-round" onClick={() => handleAddToItinerary(place)}>+</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="city-switcher-tray">
                <h4 className="section-subtitle-modern">Explore Other Cities</h4>
                <div className="city-grid-mini">
                  {Array.from(new Set(places.map(p => p.city))).filter(c => c !== selectedCity).slice(0, 4).map(city => (
                    <button key={city} className="city-card-glass" onClick={() => setSelectedCity(city)}>
                      <span>{city}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => router.push('/')} className="btn-secondary-outline back-home">
                ← Main Menu
              </button>
            </div>
          ) : (
            <div className="country-discovery-view animate-fade-in">
              <div className="country-hero-card">
                <img src={countryInfo?.cover_image_url || '/api/placeholder/400/200'} alt={country} />
                <div className="hero-gradient-overlay" />
                <div className="hero-text-overlay">
                  <h2>{country}</h2>
                  <span>Travel Guide</span>
                </div>
              </div>

              <div className="discovery-scroll-area">
                <div className="info-accordion-stack">
                  <div className={`accordion-item ${activeAccordion === 'overview' ? 'active' : ''}`}>
                    <button className="accordion-trigger" onClick={() => setActiveAccordion(activeAccordion === 'overview' ? null : 'overview')}>
                      <span className="icon">🌍</span>
                      <span className="label">Brief Overview</span>
                      <span className="arrow">{activeAccordion === 'overview' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'overview' && (
                      <div className="accordion-content animate-slide-down">
                        <p className="overview-text-premium">{countryInfo?.overview || `Explore the beauty and culture of ${country}.`}</p>
                      </div>
                    )}
                  </div>

                  <div className={`accordion-item ${activeAccordion === 'bucket' ? 'active' : ''}`}>
                    <button className="accordion-trigger" onClick={() => setActiveAccordion(activeAccordion === 'bucket' ? null : 'bucket')}>
                      <span className="icon">✨</span>
                      <span className="label">Must Do Bucket-List</span>
                      <span className="arrow">{activeAccordion === 'bucket' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'bucket' && (
                      <div className="accordion-content animate-slide-down">
                        <div className="bucket-grid">
                          {countryInfo?.bucket_list?.map((item: any, i: number) => (
                            <div key={i} className="bucket-card-glass">
                              {item.image_url && <img src={item.image_url} alt="" />}
                              <p>{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`accordion-item ${activeAccordion === 'foods' ? 'active' : ''}`}>
                    <button className="accordion-trigger" onClick={() => setActiveAccordion(activeAccordion === 'foods' ? null : 'foods')}>
                      <span className="icon">🥘</span>
                      <span className="label">Gastronomy Guide</span>
                      <span className="arrow">{activeAccordion === 'foods' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'foods' && (
                      <div className="accordion-content animate-slide-down">
                        <div className="foods-list" style={{ padding: '0 16px 16px' }}>
                          {countryInfo?.local_foods?.map((food: any, i: number) => (
                            <div key={i} className="food-item-premium" style={{ marginBottom: '20px' }}>
                              <h4 style={{ margin: '0 0 4px', color: 'var(--color-sapphire)', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>{food.name}</h4>
                              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-soft-slate)', lineHeight: '1.5' }}>{food.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="quick-city-selector">
                  <h3 className="section-subtitle-modern">Top Cities to Visit</h3>
                  <div className="city-grid-mini">
                    {Array.from(new Set(places.map(p => p.city))).slice(0, 6).map(city => (
                      <button key={city} className="city-card-glass" onClick={() => setSelectedCity(city)}>
                        <span>{city}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => router.push('/')} className="btn-secondary-outline back-home" style={{ marginTop: '24px' }}>
                  ← Main Menu
                </button>
              </div>
            </div>
          )}
        </div>
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
          --sidebar-right: 380px;
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
          grid-template-columns: var(--sidebar-left) 1fr var(--sidebar-right);
          height: calc(100vh - 64px);
          background: #eef2f7;
        }

        .sidebar {
          background: var(--glass-surface);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 20;
          box-shadow: var(--shadow-luxe);
          overflow: hidden;
          min-height: 0;
        }

        .left-sidebar { border-right: 1px solid var(--glass-border); }
        .right-sidebar { border-left: 1px solid var(--glass-border); }

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

        .sidebar-header-premium {
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(255, 255, 255, 0.4);
        }

        .city-name-premium {
          font-size: 32px;
          font-weight: 900;
          color: var(--color-sapphire);
          margin: 0;
        }

        .country-hero-card {
          width: 100%;
          height: 240px;
          position: relative;
          clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
        }

        .country-hero-card img { width: 100%; height: 100%; object-fit: cover; }
        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(3, 27, 78, 0.9) 100%);
        }

        .hero-text-overlay {
          position: absolute;
          bottom: 40px;
          left: 24px;
          color: var(--color-pure-white);
        }

        .hero-text-overlay h2 { font-size: 38px; margin: 0; }
        .hero-text-overlay span { 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 3px; 
          color: var(--color-gold);
          font-weight: 700;
        }

        .discovery-scroll-area, .exploration-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.5) transparent;
        }
        .discovery-scroll-area::-webkit-scrollbar,
        .exploration-content::-webkit-scrollbar { width: 4px; }
        .discovery-scroll-area::-webkit-scrollbar-track,
        .exploration-content::-webkit-scrollbar-track { background: transparent; }
        .discovery-scroll-area::-webkit-scrollbar-thumb,
        .exploration-content::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.45);
          border-radius: 4px;
        }
        .discovery-scroll-area::-webkit-scrollbar-thumb:hover,
        .exploration-content::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.8);
        }

        .city-description-glass {
          font-size: 15px;
          line-height: 1.8;
          color: var(--color-soft-slate);
          margin-bottom: 32px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          border-left: 4px solid var(--color-gold);
        }

        /* Input & Actions */
        .generation-section-premium {
          margin-bottom: 40px;
          padding: 24px;
          background: var(--color-pure-white);
          border-radius: 20px;
          border: 1px solid var(--color-champagne);
          box-shadow: 0 10px 20px rgba(3,27,78,0.05);
        }

        .input-group-modern {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }

        .premium-input-small {
          width: 70px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          text-align: center;
          font-weight: 800;
          font-size: 18px;
          color: var(--color-sapphire);
          background: var(--color-ice);
        }

        .btn-primary-gradient {
          background: var(--color-sapphire);
          color: var(--color-pure-white);
          border: none;
          height: 48px;
          border-radius: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 13px;
          cursor: pointer;
          flex: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary-gradient:hover {
          background: var(--color-sapphire-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(3, 27, 78, 0.2);
        }

        /* Place Cards */
        .place-row-premium {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--color-pure-white);
          border-radius: 16px;
          margin-bottom: 12px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .place-row-premium:hover {
          border-color: var(--color-gold);
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.08);
        }

        .place-icon { 
          width: 40px; 
          height: 40px; 
          background: var(--color-ice);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .place-info h4 { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; margin: 0; }
        .place-info p { font-size: 12px; color: var(--color-soft-slate); margin-top: 2px; }

        .add-site-btn-round {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--color-ice);
          background: var(--color-pure-white);
          color: var(--color-sapphire);
          font-weight: 900;
          cursor: pointer;
          margin-left: auto;
          transition: all 0.2s;
        }

        .add-site-btn-round:hover {
          background: var(--color-gold);
          color: var(--color-pure-white);
          border-color: var(--color-gold);
        }

        /* Right Sidebar: Itinerary Luxury Timeline */
        .itinerary-header-premium {
          padding: 40px 24px 24px;
          background: rgba(255, 255, 255, 0.2);
        }

        .itinerary-title-premium { font-size: 28px; font-weight: 900; margin: 0; }
        .itinerary-subtitle-premium { 
          font-size: 12px; 
          text-transform: uppercase; 
          letter-spacing: 2px;
          color: var(--color-gold);
          font-weight: 700;
          margin-top: 4px;
        }

        .itinerary-scroller-premium {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.5) transparent;
        }
        .itinerary-scroller-premium::-webkit-scrollbar { width: 4px; }
        .itinerary-scroller-premium::-webkit-scrollbar-track { background: transparent; }
        .itinerary-scroller-premium::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.45);
          border-radius: 4px;
        }
        .itinerary-scroller-premium::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.8);
        }

        .day-card-premium {
          position: relative;
          padding-left: 24px;
          margin-bottom: 40px;
        }

        .day-card-premium::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          bottom: -40px;
          width: 1px;
          background: linear-gradient(to bottom, var(--color-gold) 0%, transparent 100%);
        }

        .day-card-premium:last-child::before { display: none; }

        .day-label-modern {
          font-size: 14px;
          font-weight: 800;
          color: var(--color-sapphire);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .day-label-modern::before {
          content: '';
          width: 9px;
          height: 9px;
          background: var(--color-gold);
          border-radius: 50%;
          position: absolute;
          left: -4px;
          box-shadow: 0 0 0 4px var(--color-pure-white);
        }

        .site-entry-premium {
          background: var(--color-pure-white);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 10px;
          box-shadow: 0 4px 10px rgba(3, 27, 78, 0.03);
          font-weight: 600;
          font-size: 14px;
        }

        /* Footer Actions */
        .itinerary-footer-actions {
          padding: 24px;
          background: rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-timeline-floating {
          height: 54px;
          background: var(--color-pure-white);
          border: 1px solid var(--color-champagne);
          border-radius: 14px;
          font-weight: 800;
          color: var(--color-sapphire);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-timeline-floating:hover {
          background: var(--color-ice);
          border-color: var(--color-gold);
        }

        .btn-save-trip-primary {
          height: 60px;
          background: var(--color-sapphire);
          color: var(--color-pure-white);
          border-radius: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
          cursor: pointer;
        }

        /* Empty States & Placeholders */
        .empty-itinerary-state {
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0.4;
          text-align: center;
        }

        .empty-icon-box { font-size: 48px; margin-bottom: 16px; }

        /* Quick Selectors */
        .quick-city-selector { margin-top: 48px; }
        .city-grid-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .city-card-glass {
          height: 60px;
          background: var(--color-pure-white);
          border-radius: 14px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .city-card-glass:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }

        /* Animations */
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* UI Micro-interactions */
        .icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: var(--color-pure-white);
          border: 1px solid #E2E8F0;
          color: var(--color-sapphire);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover { border-color: var(--color-gold); color: var(--color-gold); }

        .back-home {
          margin: 0 24px 24px;
          height: 48px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid #E2E8F0;
          font-weight: 700;
          color: var(--color-soft-slate);
          cursor: pointer;
        }

        /* --- Left Panel: Section Header --- */
        .section-subtitle-modern {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          color: var(--color-soft-slate);
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-subtitle-modern::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, rgba(212,175,55,0.35), transparent);
        }

        /* --- Accordion --- */
        .info-accordion-stack { margin-bottom: 8px; }

        .accordion-item {
          margin-bottom: 10px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.12);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
          background: var(--color-pure-white);
        }
        .accordion-item.active {
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 6px 24px -4px rgba(212, 175, 55, 0.18);
        }

        .accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }
        .accordion-trigger:hover { background: rgba(248, 250, 252, 0.8); }
        .accordion-item.active .accordion-trigger { background: rgba(212, 175, 55, 0.05); }

        .accordion-trigger .icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--color-ice);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          border: 1px solid rgba(212, 175, 55, 0.15);
          transition: background 0.2s, transform 0.2s;
        }
        .accordion-item.active .accordion-trigger .icon {
          background: linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%);
          transform: scale(1.05);
        }

        .accordion-trigger .label {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--color-sapphire);
          flex: 1;
        }

        .accordion-trigger .arrow {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--color-ice);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 900;
          color: var(--color-soft-slate);
          transition: all 0.25s;
          flex-shrink: 0;
          line-height: 1;
        }
        .accordion-item.active .accordion-trigger .arrow {
          background: var(--color-gold);
          color: #fff;
          transform: rotate(0deg);
        }

        .accordion-content {
          padding: 4px 18px 18px;
        }

        .overview-text-premium {
          font-size: 14px;
          line-height: 1.8;
          color: var(--color-soft-slate);
          margin: 0;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(255,255,255,0.5) 100%);
          border-radius: 12px;
          border-left: 3px solid var(--color-gold);
        }

        /* --- City Cards --- */
        .city-card-glass {
          height: auto;
          min-height: 52px;
          background: linear-gradient(135deg, #fff 0%, var(--color-ice) 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-weight: 700;
          font-size: 13px;
          color: var(--color-sapphire);
          cursor: pointer;
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(3, 27, 78, 0.04);
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .city-card-glass::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--color-gold) 0%, rgba(212,175,55,0.3) 100%);
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .city-card-glass:hover {
          border-color: rgba(212, 175, 55, 0.45);
          color: var(--color-sapphire);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.12);
          transform: translateY(-2px);
        }
        .city-card-glass:hover::before { opacity: 1; }
        .city-card-glass svg {
          opacity: 0.4;
          transition: opacity 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .city-card-glass:hover svg {
          opacity: 1;
          transform: translateX(3px);
          color: var(--color-gold);
          stroke: var(--color-gold);
        }

        .quick-city-selector { margin-top: 36px; }
        .city-grid-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* --- Bucket List Cards --- */
        .bucket-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bucket-card-glass {
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--color-ice), #fff);
          border: 1px solid rgba(212, 175, 55, 0.15);
          padding: 0;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .bucket-card-glass:hover {
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
          transform: translateY(-2px);
        }
        .bucket-card-glass img {
          width: 100%;
          height: 70px;
          object-fit: cover;
          display: block;
        }
        .bucket-card-glass p {
          margin: 0;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-sapphire);
          line-height: 1.4;
        }

        /* --- Food Items --- */
        .food-item-premium {
          padding: 14px 16px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(248,250,252,0.9) 0%, #fff 100%);
          border: 1px solid rgba(212, 175, 55, 0.12);
          margin-bottom: 10px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .food-item-premium:hover {
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.08);
        }
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
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Trip Details...</div>}>
      <TripMapContent />
    </Suspense>
  )
}
