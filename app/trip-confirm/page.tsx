'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SiteHeader from '../components/SiteHeader'
import { supabase } from '@/lib/supabase'
import AuthModal from '../components/AuthModal'
import PlaceDetailsModal from '../components/PlaceDetailsModal'

// Dynamically import map to avoid SSR issues
const ConfirmMap = dynamic(() => import('./ConfirmMap'), { ssr: false, loading: () => <div className="confirm-map-placeholder">Loading map...</div> })

interface Place {
  id: number
  title: string
  city: string
  country: string
  location_lat: number
  location_lng: number
  categoryName?: string
  description?: string
  image_url?: string
  reviewsCount?: number
  openingHours_0_hours?: string
}

function TripConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tripIdParam = searchParams.get('tripId')
  const defaultCountry = searchParams.get('country') || 'Italy'
  const defaultDuration = parseInt(searchParams.get('duration') || '3')

  const [country, setCountry] = useState(defaultCountry)
  const [duration, setDuration] = useState(defaultDuration)
  const style = searchParams.get('style') || 'Intense'
  const immersion = searchParams.get('immersion') || 'Unmissable'

  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [activeDay, setActiveDay] = useState(1)
  const [dayPlans, setDayPlans] = useState<any[] | null>(null)
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  const [activeDetailsPlace, setActiveDetailsPlace] = useState<any>(null)
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [saveTripTitle, setSaveTripTitle] = useState(`${country} Discovery`)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  // Derive trip meta
  const tripName = `${country} Discovery`
  const styleEmojis: Record<string, string> = { Intense: '⚡', Relaxed: '🌿' }
  const immersionLabels: Record<string, string> = { Unmissable: '🏛️ Iconic Sites', ALotMore: '🔍 Hidden Gems' }

  // Build itinerary: from real user selection, fallback to mock if no selection
  let itineraryDays: Array<{ day: number; items: Place[] }> = []
  
  if (dayPlans) {
    itineraryDays = dayPlans.map((day, idx) => ({
      day: idx + 1,
      items: day.items.map((i: any) => i.data || i)
    }))
  } else {
    const shuffled = [...places].sort(() => 0.5 - Math.random()).slice(0, duration * 4)
    for (let d = 0; d < duration; d++) {
      const start = d * 4
      const end = Math.min(start + 4, shuffled.length)
      const items = shuffled.slice(start, end)
      if (items.length > 0) itineraryDays.push({ day: d + 1, items })
    }
  }

  const allItineraryPlaces = itineraryDays.flatMap(d => d.items).filter(Boolean)
  const uniqueCities = [...new Set(allItineraryPlaces.map(p => p.city).filter(Boolean))].slice(0, 5)
  const totalActivities = allItineraryPlaces.length

  // Tag generation based on actual data
  const getDynamicTags = () => {
    const defaultTags = [
      style === 'Intense' ? 'Adventure' : 'Leisure',
      immersion === 'ALotMore' ? 'Off-the-Beaten-Path' : 'Landmarks'
    ]
    if (allItineraryPlaces.length === 0) return [...defaultTags, 'Culture', 'Food']
    
    const categoryCounts: Record<string, number> = {}
    allItineraryPlaces.forEach(p => {
      if (p.categoryName) {
        categoryCounts[p.categoryName] = (categoryCounts[p.categoryName] || 0) + 1
      }
    })
    
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3)

    const uniqueTags = new Set([...defaultTags, ...topCategories])
    const tags = Array.from(uniqueTags)
    if (tags.length < 4) tags.push('Culture')
    if (tags.length < 4) tags.push('Food')
    return Array.from(new Set(tags)).slice(0, 5)
  }
  const tripTags = getDynamicTags()

  useEffect(() => {
    const loadTripData = async () => {
      setIsInitializing(true)
      if (tripIdParam) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const headers: any = {}
          if (session) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          }

          const res = await fetch(`/api/trips/${tripIdParam}`, { headers })
          const data = await res.json()
          if (data.success && data.trip) {
            setCountry(data.trip.country)
            setDuration(data.trip.days?.length || 1)
            setSaveTripTitle(data.trip.title)
            
            const loadedDays = data.trip.days.map((day: any) => ({
              id: day.id,
              title: day.title,
              items: day.items.map((item: any) => ({
                id: item.id,
                name: item.custom_name || item.place?.title || 'Unknown Place',
                type: 'place',
                data: item.place || {}
              }))
            }))
            setDayPlans(loadedDays)
          }
        } catch (err) {
          console.error('Failed to fetch trip from API:', err)
        }
      } else {
        try {
          const draft = localStorage.getItem('snaptrip_draft')
          if (draft) {
            const parsed = JSON.parse(draft)
            if (parsed.length > 0) {
              setDayPlans(parsed)
            }
          }
        } catch(e) {}
      }
      setIsInitializing(false)
    }
    loadTripData()
  }, [tripIdParam])

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/planner/places?country=${encodeURIComponent(country)}`)
        const data = await res.json()
        if (data.success) {
          setPlaces(data.places)
        }
      } catch (err) {
        console.error('Failed to fetch places:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaces()
  }, [country])



  const times = ['09:00 AM', '11:30 AM', '01:30 PM', '03:30 PM', '06:00 PM', '08:00 PM']
  const timeLabels = ['MORNING', 'MORNING', 'AFTERNOON', 'AFTERNOON', 'EVENING', 'EVENING']

  const handleConfirm = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }

    setSaveTripTitle(`${country} Discovery`)
    setIsSaveModalOpen(true)
  }

  const confirmSaveTrip = async () => {
    if (!saveTripTitle.trim()) return;

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return;

    try {
      setIsSaving(true)
      
      const payload = {
        country: country || 'Unknown',
        title: saveTripTitle.trim(),
        days: dayPlans ? dayPlans.map(d => ({
            title: d.title,
            items: d.items.map((i: any) => ({
              type: i.type || 'place',
              name: i.name || i.data?.title || 'Unknown Place',
              note: '',
              data: { id: i.data?.id }
            }))
        })) : itineraryDays.map(d => ({
            title: `Day ${d.day}`,
            items: d.items.map((i: any) => ({
              type: 'place',
              name: i.title || i.name || 'Unknown Place',
              note: '',
              data: { id: i.id }
            }))
        }))
      }

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        localStorage.removeItem('snaptrip_draft')
        router.push(`/trip-map?tripId=${data.tripId}`)
      } else {
        alert('Failed to save: ' + data.error)
      }

    } catch (err) {
      console.error('Save error', err)
      alert('Error saving trip')
    } finally {
      setIsSaving(false)
      setIsSaveModalOpen(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    handleConfirm()
  }

  const handleEdit = () => {
    if (tripIdParam) {
      router.push(`/trip-map?country=${encodeURIComponent(country)}&tripId=${tripIdParam}`)
    } else {
      router.push(
        `/trip-map?country=${encodeURIComponent(country)}&duration=${duration}&style=${encodeURIComponent(style)}&immersion=${encodeURIComponent(immersion)}`
      )
    }
  }

  const activeItems = itineraryDays.find(d => d.day === activeDay)?.items || []

  if (isInitializing) {
    return (
      <div className="confirm-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F8FAFC' }}>
        <SiteHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="map-loading-spinner" style={{ margin: '0 auto 24px', width: '60px', height: '60px', borderWidth: '4px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#031B4E', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Loading your itinerary...</h2>
          <p style={{ color: '#64748B', fontSize: '16px' }}>Fetching destinations and structured plans for your journey</p>
        </div>
      </div>
    )
  }

  return (
    <div className="confirm-page">
      <SiteHeader />

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div className="save-modal-overlay" onClick={() => setIsSaveModalOpen(false)}>
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
                  confirmSaveTrip();
                }
              }}
            />
            <div className="save-modal-actions">
              <button className="btn-cancel" onClick={() => setIsSaveModalOpen(false)}>Cancel</button>
              <button
                className="btn-confirm"
                onClick={confirmSaveTrip}
                disabled={!saveTripTitle.trim() || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background blobs */}
      <div className="confirm-bg">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />
      </div>

      <div className="confirm-container">
        {/* Page Header */}
        <div className="confirm-header">
          <button 
            onClick={() => router.back()} 
            style={{ position: 'absolute', top: '40px', left: '24px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '18px', color: '#031B4E' }}
            title="Go Back"
          >
            ←
          </button>
          <div className="confirm-badge">✈️ Trip Summary</div>
          <h1 className="confirm-title">Review &amp; Confirm Your Trip</h1>
          <p className="confirm-subtitle">Take a moment to confirm your itinerary before starting your journey</p>
        </div>

        <div className="confirm-grid">
          {/* LEFT COLUMN */}
          <div className="confirm-left">
            {/* Destination Card */}
            <div className="dest-card">
              <div className="dest-card-header">
                <span className="dest-label">DESTINATION</span>
              </div>
              <div className="dest-card-body">
                <div className="dest-flag-avatar">
                  {country.slice(0, 2).toUpperCase()}
                </div>
                <div className="dest-info">
                  <h2 className="dest-name">{tripName}</h2>
                  <p className="dest-cities">
                    {uniqueCities.length > 0
                      ? uniqueCities.join(' · ')
                      : 'Loading cities...'}
                  </p>
                </div>
              </div>

              <div className="dest-tags">
                {tripTags.map(tag => (
                  <span key={tag} className="dest-tag">{tag}</span>
                ))}
              </div>

              <div className="dest-stats">
                <div className="dest-stat">
                  <strong>{itineraryDays.length || duration}</strong>
                  <span>Total Days</span>
                </div>
                <div className="dest-stat-divider" />
                <div className="dest-stat">
                  <strong>{loading ? '...' : totalActivities}</strong>
                  <span>Activities</span>
                </div>
                <div className="dest-stat-divider" />
                <div className="dest-stat">
                  <strong>{loading ? '...' : uniqueCities.length}</strong>
                  <span>Cities</span>
                </div>
              </div>

              {/* Style pills */}
              <div className="dest-meta-row">
                <span className="meta-pill">
                  {styleEmojis[style] || '⚡'} {style} Pace
                </span>
                <span className="meta-pill">
                  {immersionLabels[immersion] || '🏛️ Iconic Sites'}
                </span>
              </div>
            </div>

            {/* Itinerary Overview */}
            <div className="itinerary-card">
              <div className="itinerary-card-header">
                <div>
                  <h3 className="itinerary-title">Itinerary Overview</h3>
                  <p className="itinerary-subtitle">Structured Your Trip Day By Day</p>
                </div>
              </div>

              <div className="itinerary-layout">
                {/* Day selector column */}
                <div className="day-selector">
                  {itineraryDays.slice(0, Math.min(duration, 7)).map(d => (
                    <button
                      key={d.day}
                      className={`day-pill ${activeDay === d.day ? 'active' : ''}`}
                      onClick={() => setActiveDay(d.day)}
                    >
                      <span className="day-pill-label">DAY</span>
                      <span className="day-pill-num">{String(d.day).padStart(2, '0')}</span>
                    </button>
                  ))}
                  {duration > 7 && (
                    <div className="day-pill-more">+{duration - 7}</div>
                  )}
                </div>

                {/* Day activity timeline */}
                <div className="day-timeline">
                  {loading ? (
                    <div className="timeline-loading">
                      <div className="skeleton-line w-60" />
                      <div className="skeleton-line w-40" />
                      <div className="skeleton-line w-60" />
                    </div>
                  ) : activeItems.length === 0 ? (
                    <div className="timeline-empty">No activities found for this day.</div>
                  ) : (
                    activeItems.map((item, idx) => (
                      <div key={item.id} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-line" />
                        <div className="timeline-content">
                          <div className="timeline-time">
                            <span className="t-time">{times[idx] || '09:00 AM'}</span>
                            <span className="t-dot">•</span>
                            <span className="t-period">{timeLabels[idx] || 'MORNING'}</span>
                          </div>
                          <div className="timeline-body">
                            <div className="timeline-title-row">
                              <h4 className="timeline-name">{item.title}</h4>
                              <button className="timeline-drag">⋮⋮</button>
                            </div>
                            <p className="timeline-desc">
                              {item.description
                                ? item.description.slice(0, 60) + (item.description.length > 60 ? '…' : '')
                                : item.categoryName || 'Explore this wonderful attraction'}
                            </p>
                            <button 
                              style={{ marginTop: '10px', fontSize: '11px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '700' }}
                              onClick={() => setActiveDetailsPlace(item)}
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="confirm-right">
            {/* Map */}
            <div className="confirm-map-card">
              {!loading && (allItineraryPlaces.length > 0 || places.length > 0) ? (
                <ConfirmMap places={allItineraryPlaces.length > 0 ? allItineraryPlaces : places} />
              ) : (
                <div className="confirm-map-placeholder">
                  <div className="map-loading-spinner" />
                  <span>Loading map...</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button className="btn-confirm-trip" onClick={handleConfirm}>
              ✈️ Confirm Trip
            </button>
            <button className="btn-edit-trip" onClick={handleEdit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Trip
            </button>

            {/* Trip info pills */}
            <div className="confirm-info-pills">
              <div className="info-pill">
                <span className="info-pill-icon">📅</span>
                <span>{itineraryDays.length || duration} Days</span>
              </div>
              <div className="info-pill">
                <span className="info-pill-icon">🌍</span>
                <span>{country}</span>
              </div>
              <div className="info-pill">
                <span className="info-pill-icon">{styleEmojis[style] || '⚡'}</span>
                <span>{style}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {activeDetailsPlace && (
        <PlaceDetailsModal 
          place={activeDetailsPlace}
          onClose={() => setActiveDetailsPlace(null)}
          dayPlans={dayPlans || []}
          readonly={true}
        />
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');

        .confirm-page {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Background */
        .confirm-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.08;
        }
        .blob-1 {
          width: 600px; height: 600px;
          background: #3B82F6;
          top: -100px; left: -200px;
        }
        .blob-2 {
          width: 500px; height: 500px;
          background: #F6B800;
          top: 30%; right: -150px;
        }
        .blob-3 {
          width: 400px; height: 400px;
          background: #10B981;
          bottom: -50px; left: 30%;
        }

        .confirm-container {
          position: relative;
          z-index: 1;
          max-width: 1140px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* Header */
        .confirm-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .confirm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF9E7;
          color: #B45309;
          border: 1px solid #FDE68A;
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .confirm-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          color: #031B4E;
          margin: 0 0 12px;
          line-height: 1.2;
        }
        .confirm-subtitle {
          font-size: 15px;
          color: #64748B;
          margin: 0;
        }

        /* Grid */
        .confirm-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          align-items: start;
        }

        /* ── Destination Card ── */
        .dest-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 24px rgba(3, 27, 78, 0.05);
          margin-bottom: 24px;
        }
        .dest-card-header {
          margin-bottom: 16px;
        }
        .dest-label {
          font-size: 10px;
          font-weight: 800;
          color: #94A3B8;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .dest-card-body {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .dest-flag-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #F6B800, #F59E0B);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(246, 184, 0, 0.4);
          letter-spacing: -0.5px;
        }
        .dest-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 800;
          color: #031B4E;
          margin: 0 0 4px;
        }
        .dest-cities {
          font-size: 13px;
          color: #64748B;
          margin: 0;
        }

        .dest-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .dest-tag {
          padding: 5px 14px;
          background: #FEF9E7;
          color: #B45309;
          border: 1px solid #FDE68A;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .dest-stats {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          gap: 0;
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          padding: 18px 0;
          text-align: center;
          margin-bottom: 20px;
        }
        .dest-stat strong {
          display: block;
          font-size: 24px;
          font-weight: 900;
          color: #F6B800;
          line-height: 1;
          margin-bottom: 4px;
        }
        .dest-stat span {
          font-size: 11px;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .dest-stat-divider {
          width: 1px;
          background: #E5E7EB;
        }

        .dest-meta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .meta-pill {
          padding: 6px 14px;
          background: #EEF2FF;
          color: #4338CA;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }

        /* ── Itinerary Card ── */
        .itinerary-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 24px rgba(3, 27, 78, 0.05);
          overflow: hidden;
        }
        .itinerary-card-header {
          padding: 24px 28px 20px;
          border-bottom: 1px solid #F1F5F9;
        }
        .itinerary-title {
          font-size: 18px;
          font-weight: 800;
          color: #031B4E;
          margin: 0 0 4px;
        }
        .itinerary-subtitle {
          font-size: 12px;
          color: #94A3B8;
          margin: 0;
        }

        .itinerary-layout {
          display: flex;
          gap: 0;
          min-height: 360px;
          max-height: 420px;
        }

        /* Day selector */
        .day-selector {
          width: 80px;
          flex-shrink: 0;
          border-right: 1px solid #F1F5F9;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          background: #FAFAFA;
          scrollbar-width: none;
        }
        .day-selector::-webkit-scrollbar { display: none; }
        .day-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 2px solid #E5E7EB;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s;
          gap: 1px;
        }
        .day-pill:hover {
          border-color: #F6B800;
        }
        .day-pill.active {
          background: #F6B800;
          border-color: #F6B800;
          box-shadow: 0 4px 12px rgba(246, 184, 0, 0.35);
        }
        .day-pill-label {
          font-size: 8px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.5px;
        }
        .day-pill.active .day-pill-label {
          color: rgba(255,255,255,0.75);
        }
        .day-pill-num {
          font-size: 16px;
          font-weight: 900;
          color: #031B4E;
          line-height: 1;
        }
        .day-pill.active .day-pill-num {
          color: #FFFFFF;
        }
        .day-pill-more {
          font-size: 11px;
          color: #94A3B8;
          text-align: center;
          padding: 6px 0;
          font-weight: 700;
        }

        /* Day Timeline */
        .day-timeline {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 0;
          scrollbar-width: thin;
          scrollbar-color: rgba(246, 184, 0, 0.3) transparent;
        }
        .day-timeline::-webkit-scrollbar { width: 4px; }
        .day-timeline::-webkit-scrollbar-thumb {
          background: rgba(246, 184, 0, 0.3);
          border-radius: 4px;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
          position: relative;
          padding-bottom: 20px;
        }
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        .timeline-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #F6B800;
          flex-shrink: 0;
          margin-top: 5px;
          border: 2px solid #FDE68A;
          position: relative;
          z-index: 1;
        }
        .timeline-line {
          position: absolute;
          left: 4px;
          top: 15px;
          bottom: -5px;
          width: 2px;
          background: linear-gradient(to bottom, #F6B800, #FDE68A, transparent);
        }
        .timeline-item:last-child .timeline-line {
          display: none;
        }
        .timeline-content {
          flex: 1;
          min-width: 0;
        }
        .timeline-time {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .t-time {
          font-size: 10px;
          font-weight: 800;
          color: #031B4E;
          letter-spacing: 0.3px;
        }
        .t-dot {
          color: #CBD5E1;
          font-size: 10px;
        }
        .t-period {
          font-size: 9px;
          font-weight: 800;
          color: #F6B800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .timeline-body {
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.2s;
        }
        .timeline-body:hover {
          border-color: #F6B800;
        }
        .timeline-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .timeline-name {
          font-size: 13px;
          font-weight: 800;
          color: #031B4E;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .timeline-drag {
          color: #CBD5E1;
          background: none;
          border: none;
          cursor: grab;
          font-size: 14px;
          padding: 0;
          flex-shrink: 0;
          line-height: 1;
        }
        .timeline-desc {
          font-size: 11px;
          color: #64748B;
          margin: 0;
          line-height: 1.4;
        }

        .timeline-loading, .timeline-empty {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px 0;
        }
        .save-modal-overlay {
          position: fixed; inset: 0; background: rgba(3, 27, 78, 0.6);
          backdrop-filter: blur(4px); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .save-modal-content {
          background: white; border-radius: 20px; width: 100%; max-width: 440px; padding: 32px;
          box-shadow: 0 24px 48px rgba(3, 27, 78, 0.2); text-align: center;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .save-modal-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: #031B4E; margin: 0 0 8px; }
        .save-modal-subtitle { color: #64748B; font-size: 14px; margin: 0 0 24px; }
        .save-modal-input {
          width: 100%; padding: 16px; border: 2px solid #E2E8F0; border-radius: 12px;
          font-size: 16px; color: #031B4E; font-weight: 600; text-align: center; margin-bottom: 24px;
          outline: none; transition: all 0.2s;
        }
        .save-modal-input:focus { border-color: #F6B800; box-shadow: 0 0 0 4px rgba(246, 184, 0, 0.15); }
        .save-modal-actions { display: flex; gap: 12px; }
        .save-modal-actions button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; border: none; }
        .save-modal-actions .btn-cancel { background: #F1F5F9; color: #64748B; }
        .save-modal-actions .btn-cancel:hover { background: #E2E8F0; color: #031B4E; }
        .save-modal-actions .btn-confirm { background: #F6B800; color: #031B4E; }
        .save-modal-actions .btn-confirm:hover:not(:disabled) { background: #F59E0B; transform: translateY(-1px); }
        .save-modal-actions .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
        .timeline-empty {
          color: #94A3B8;
          font-size: 13px;
          align-items: center;
          justify-content: center;
          height: 200px;
        }
        .skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .w-60 { width: 60%; }
        .w-40 { width: 40%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── RIGHT COLUMN ── */
        .confirm-right {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .confirm-map-card {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
          box-shadow: 0 8px 30px rgba(3, 27, 78, 0.08);
          height: 320px;
        }

        .confirm-map-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F1F5F9;
          gap: 12px;
          color: #64748B;
          font-size: 13px;
          font-weight: 600;
        }
        .map-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #E5E7EB;
          border-top-color: #F6B800;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-confirm-trip {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #F6B800 0%, #F59E0B 100%);
          color: #031B4E;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px rgba(246, 184, 0, 0.4);
          letter-spacing: 0.3px;
        }
        .btn-confirm-trip:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(246, 184, 0, 0.5);
        }
        .btn-confirm-trip:active {
          transform: translateY(0);
        }

        .btn-edit-trip {
          width: 100%;
          padding: 14px;
          background: #FFFFFF;
          color: #031B4E;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-edit-trip:hover {
          border-color: #031B4E;
          background: #F8FAFC;
        }

        .confirm-info-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .info-pill {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          white-space: nowrap;
        }
        .info-pill-icon {
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .confirm-grid {
            grid-template-columns: 1fr;
          }
          .confirm-right {
            position: static;
          }
          .confirm-map-card {
            height: 240px;
          }
        }
      `}</style>
    </div>
  )
}

export default function TripConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#031B4E', marginBottom: '8px' }}>Preparing your trip...</div>
          <div style={{ color: '#64748B' }}>Building your perfect itinerary</div>
        </div>
      </div>
    }>
      <TripConfirmContent />
    </Suspense>
  )
}
