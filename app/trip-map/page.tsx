'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SiteHeader from '../components/SiteHeader'

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

function TripMapContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const country = searchParams.get('country')
  const tripStyle = searchParams.get('style')
  const duration = searchParams.get('duration')
  const immersion = searchParams.get('immersion')

  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use refs for potential interaction if needed (though logic moved to TripMap)
  const markersRef = useRef<any[]>([])
  const mapRef = useRef<any>(null)

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

        if (data.success && data.places) {
          setPlaces(data.places)
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

  return (
    <div className="trip-map-page">
      <SiteHeader />

      <div className="trip-map-container">
        <div className="trip-map-sidebar">
          <div className="trip-info">
            <h1>{country}</h1>
            <p className="trip-subtitle">Your Personalized Trip</p>

            <div className="trip-details">
              <div className="detail-item">
                <span className="detail-label">Style</span>
                <span className="detail-value">{tripStyle || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{duration || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Immersion</span>
                <span className="detail-value">{immersion || 'Not specified'}</span>
              </div>
            </div>

            <div className="places-stats">
              <h3>Discovered Places</h3>
              <p className="places-count">{places.length} locations</p>
            </div>

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading amazing places...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>⚠️ {error}</p>
              </div>
            )}

            {!loading && places.length > 0 && (
              <div className="places-list">
                <h3>All Locations</h3>
                <div className="places-scroll">
                  {places.map((place, index) => (
                    <div
                      key={place.id}
                      className="place-item"
                    >
                      <div className="place-number">{index + 1}</div>
                      <div className="place-info">
                        <h4>{place.title}</h4>
                        <p>{place.city}</p>
                        {place.categoryName && <span className="place-category">{place.categoryName}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => router.push('/')} className="back-home-button">
            ← Back to Home
          </button>
        </div>

        <div className="trip-map-main">
          <TripMap places={places} />
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .trip-map-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .trip-map-container {
          display: grid;
          grid-template-columns: 420px 1fr;
          height: calc(100vh - 70px);
          gap: 0;
        }

        .trip-map-sidebar {
          background: white;
          border-right: 1px solid #e0e6ed;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-shadow: 2px 0 12px rgba(3, 27, 78, 0.08);
        }

        .trip-info {
          padding: 32px 28px;
          flex: 1;
        }

        .trip-info h1 {
          font-size: 32px;
          font-weight: 800;
          color: #031B4E;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .trip-subtitle {
          color: #6b88a5;
          font-size: 15px;
          margin: 0 0 28px 0;
          font-weight: 500;
        }

        .trip-details {
          background: linear-gradient(135deg, #f7fbff 0%, #e8f3ff 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 28px;
          border: 1px solid #d9e9ff;
          box-shadow: 0 2px 8px rgba(30, 136, 229, 0.08);
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(107, 136, 165, 0.15);
        }

        .detail-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .detail-item:first-child {
          padding-top: 0;
        }

        .detail-label {
          font-size: 13px;
          color: #6b88a5;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 15px;
          font-weight: 700;
          color: #031B4E;
          background: white;
          padding: 6px 14px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(3, 27, 78, 0.1);
        }

        .places-stats {
          margin-bottom: 28px;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
          position: relative;
          overflow: hidden;
        }

        .places-stats::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .places-stats h3 {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 8px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
        }

        .places-count {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin: 0;
          position: relative;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 48px 20px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          margin: 0 auto 20px;
          border: 4px solid #e8f3ff;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #6b88a5;
          font-size: 15px;
          font-weight: 500;
        }

        .error-state {
          background: #fff5f5;
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
        }

        .error-state p {
          color: #e53e3e;
          font-weight: 600;
          margin: 0;
        }

        .places-list {
          margin-top: 28px;
        }

        .places-list h3 {
          font-size: 17px;
          color: #031B4E;
          margin: 0 0 16px 0;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .places-list h3::before {
          content: '📍';
          font-size: 20px;
        }

        .places-scroll {
          max-height: 420px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .places-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .places-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .places-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .places-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .place-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 10px;
          background: white;
          border: 1px solid #e8f3ff;
        }

        .place-item:hover {
          background: linear-gradient(135deg, #f7fbff 0%, #e8f3ff 100%);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .place-number {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .place-info {
          flex: 1;
          min-width: 0;
        }

        .place-info h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 700;
          color: #031B4E;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .place-info p {
          margin: 0;
          font-size: 13px;
          color: #6b88a5;
          font-weight: 500;
        }

        .place-category {
          display: inline-block;
          background: linear-gradient(135deg, #e8f3ff 0%, #d9e9ff 100%);
          color: #1e88e5;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 6px;
          border: 1px solid #d9e9ff;
        }

        .back-home-button {
          margin: 20px 28px 28px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #031B4E 0%, #0A3D91 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(3, 27, 78, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .back-home-button:hover {
          background: linear-gradient(135deg, #0A3D91 0%, #1565C0 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(3, 27, 78, 0.35);
        }

        .back-home-button:active {
          transform: translateY(0);
        }

        .trip-map-main {
          position: relative;
          background: #e9ecef;
          height: 100%;
          width: 100%;
        }

        .trip-map-error {
          text-align: center;
          padding: 100px 32px;
          background: white;
          border-radius: 20px;
          margin: 40px;
          box-shadow: 0 8px 24px rgba(3, 27, 78, 0.12);
        }

        .trip-map-error h2 {
          color: #031B4E;
          margin-bottom: 16px;
          font-size: 28px;
          font-weight: 800;
        }

        .trip-map-error p {
          color: #6b88a5;
          font-size: 16px;
          margin-bottom: 32px;
        }

        .back-button {
          margin-top: 24px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #F6B800 0%, #f9c74f 100%);
          color: #031B4E;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(246, 184, 0, 0.3);
        }

        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(246, 184, 0, 0.4);
        }
      `}</style>
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
