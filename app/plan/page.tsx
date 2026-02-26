'use client'
import '../home.css'
import 'leaflet/dist/leaflet.css'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function PlanTrip() {
    const router = useRouter()
    const [plannerStep, setPlannerStep] = useState(0)
    const [selectedCountry, setSelectedCountry] = useState<string>('')
    const [countries, setCountries] = useState<string[]>([])
    const [cities, setCities] = useState<{ name: string; lat: number; lng: number }[]>([])
    const [tripStyle, setTripStyle] = useState<'Intense' | 'Relaxed' | null>(null)
    const [tripDuration, setTripDuration] = useState<'Weekend' | 'Mini' | 'Full' | null>(null)
    const [immersion, setImmersion] = useState<'Nature' | 'Culture' | null>(null)
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingCities, setLoadingCities] = useState(false)

    // Fetch countries from database
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true)
            try {
                const res = await fetch('/api/admin/sync/countries')
                const data = await res.json()
                if (data.success && data.countries) {
                    setCountries(data.countries.sort())
                }
            } catch (error) {
                console.error('Failed to fetch countries:', error)
            } finally {
                setLoadingCountries(false)
            }
        }
        fetchCountries()
    }, [])

    // Fetch cities when country is selected
    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedCountry) return
            setLoadingCities(true)
            try {
                const res = await fetch(`/api/planner/cities?country=${encodeURIComponent(selectedCountry)}`)
                const data = await res.json()
                if (data.success && data.cities) {
                    setCities(data.cities)
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error)
            } finally {
                setLoadingCities(false)
            }
        }
        fetchCities()
    }, [selectedCountry])

    // Handle Generate Trip navigation
    const handleGenerateTrip = () => {
        const params = new URLSearchParams({
            country: selectedCountry,
            style: tripStyle || '',
            duration: tripDuration || '',
            immersion: immersion || ''
        })
        router.push(`/trip-map?${params.toString()}`)
    }

    return (
        <main className="home-root planner-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
            <SiteHeader />

            <div className="planner-page-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', backgroundImage: 'url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>

                {/* Dark overlay for readability */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3, 27, 78, 0.6)' }}></div>

                <div className="planner-modal" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '700px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', padding: '40px' }}>
                    <div className="planner-header">
                        <div>
                            <h3 style={{ fontSize: '28px', color: '#031B4E', marginBottom: '8px' }}>{selectedCountry ? `Welcome to ${selectedCountry}` : 'Plan Your Trip'}</h3>
                            <p style={{ fontSize: '15px', color: '#6b88a5' }}>{selectedCountry ? 'Let\'s create your perfect itinerary' : 'Select your destination to begin'}</p>
                        </div>
                    </div>

                    <div className="planner-steps" style={{ margin: '30px 0' }}>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: plannerStep === n ? '#F6B800' : plannerStep > n ? '#4caf50' : '#d9e9ff',
                                color: plannerStep === n || plannerStep > n ? 'white' : '#031B4E',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s'
                            }}>
                                {plannerStep > n ? '✓' : n}
                            </div>
                        ))}
                    </div>

                    {plannerStep === 0 && (
                        <div className="planner-card">
                            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Select your destination</h4>
                            <p style={{ color: '#6b88a5', marginBottom: '24px' }}>Choose a country from our database</p>
                            <div className="planner-select-wrapper">
                                <select
                                    className="planner-select"
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    disabled={loadingCountries}
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', backgroundColor: '#f8fafc', outline: 'none', transition: 'border-color 0.2s' }}
                                >
                                    <option value="">-- Select a country --</option>
                                    {countries.map((country) => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="planner-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="primary" onClick={() => setPlannerStep(1)} disabled={!selectedCountry} style={{ padding: '12px 32px', fontSize: '16px' }}>Continue</button>
                            </div>
                        </div>
                    )}

                    {plannerStep === 1 && (
                        <div className="planner-card">
                            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Choose your trip style</h4>
                            <p style={{ color: '#6b88a5', marginBottom: '24px' }}>Select the pace that matches your travel personality</p>
                            <div className="planner-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <button className={`option ${tripStyle === 'Intense' ? 'selected' : ''}`} onClick={() => setTripStyle('Intense')} style={{ padding: '20px', borderRadius: '16px', border: tripStyle === 'Intense' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: tripStyle === 'Intense' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Intense</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>More tours, more experiences</span>
                                </button>
                                <button className={`option ${tripStyle === 'Relaxed' ? 'selected' : ''}`} onClick={() => setTripStyle('Relaxed')} style={{ padding: '20px', borderRadius: '16px', border: tripStyle === 'Relaxed' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: tripStyle === 'Relaxed' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Relaxed</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>Take it easy, unwind</span>
                                </button>
                            </div>
                            <div className="planner-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                                <button className="secondary" onClick={() => setPlannerStep(0)} style={{ padding: '12px 32px', fontSize: '16px', backgroundColor: 'transparent', color: '#6b88a5', border: '1px solid #e2e8f0' }}>Back</button>
                                <button className="primary" onClick={() => setPlannerStep(2)} disabled={!tripStyle} style={{ padding: '12px 32px', fontSize: '16px' }}>Continue</button>
                            </div>
                        </div>
                    )}

                    {plannerStep === 2 && (
                        <div className="planner-card">
                            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Choose your trip duration</h4>
                            <p style={{ color: '#6b88a5', marginBottom: '24px' }}>How long would you like to explore {selectedCountry}?</p>
                            <div className="planner-options vertical" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <button className={`option ${tripDuration === 'Weekend' ? 'selected' : ''}`} onClick={() => setTripDuration('Weekend')} style={{ padding: '20px', borderRadius: '16px', border: tripDuration === 'Weekend' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: tripDuration === 'Weekend' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Weekend Getaway</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>2-4 days of adventure</span>
                                </button>
                                <button className={`option ${tripDuration === 'Mini' ? 'selected' : ''}`} onClick={() => setTripDuration('Mini')} style={{ padding: '20px', borderRadius: '16px', border: tripDuration === 'Mini' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: tripDuration === 'Mini' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Mini-Vacation</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>4-6 days of exploration</span>
                                </button>
                                <button className={`option ${tripDuration === 'Full' ? 'selected' : ''}`} onClick={() => setTripDuration('Full')} style={{ padding: '20px', borderRadius: '16px', border: tripDuration === 'Full' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: tripDuration === 'Full' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Full-Blown Vacation</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>7+ days of immersion</span>
                                </button>
                            </div>
                            <div className="planner-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                                <button className="secondary" onClick={() => setPlannerStep(1)} style={{ padding: '12px 32px', fontSize: '16px', backgroundColor: 'transparent', color: '#6b88a5', border: '1px solid #e2e8f0' }}>Back</button>
                                <button className="primary" onClick={() => setPlannerStep(3)} disabled={!tripDuration} style={{ padding: '12px 32px', fontSize: '16px' }}>Continue</button>
                            </div>
                        </div>
                    )}

                    {plannerStep === 3 && (
                        <div className="planner-card">
                            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Pick immersion</h4>
                            <p style={{ color: '#6b88a5', marginBottom: '24px' }}>Select the experience focus for your trip</p>
                            <div className="planner-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <button className={`option ${immersion === 'Nature' ? 'selected' : ''}`} onClick={() => setImmersion('Nature')} style={{ padding: '20px', borderRadius: '16px', border: immersion === 'Nature' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: immersion === 'Nature' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Nature Immersion</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>Unmissable outdoors & views</span>
                                </button>
                                <button className={`option ${immersion === 'Culture' ? 'selected' : ''}`} onClick={() => setImmersion('Culture')} style={{ padding: '20px', borderRadius: '16px', border: immersion === 'Culture' ? '2px solid #F6B800' : '2px solid #e2e8f0', backgroundColor: immersion === 'Culture' ? '#fffaf0' : 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <strong style={{ display: 'block', fontSize: '18px', color: '#031B4E', marginBottom: '8px' }}>Cultural Immersion</strong>
                                    <span style={{ color: '#6b88a5', fontSize: '14px' }}>Local culture and stories</span>
                                </button>
                            </div>
                            <div className="planner-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                                <button className="secondary" onClick={() => setPlannerStep(2)} style={{ padding: '12px 32px', fontSize: '16px', backgroundColor: 'transparent', color: '#6b88a5', border: '1px solid #e2e8f0' }}>Back</button>
                                <button className="primary" onClick={() => setPlannerStep(4)} disabled={!immersion} style={{ padding: '12px 32px', fontSize: '16px' }}>
                                    View Map
                                </button>
                            </div>
                        </div>
                    )}

                    {plannerStep === 4 && (
                        <div className="planner-card map-card">
                            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Explore {selectedCountry}</h4>
                            <p style={{ color: '#6b88a5', marginBottom: '16px' }}>Discover cities in your destination</p>
                            {loadingCities ? (
                                <div className="loading-spinner" style={{ padding: '40px', textAlign: 'center', color: '#6b88a5' }}>Loading cities...</div>
                            ) : cities.length > 0 ? (
                                <div className="map-container">
                                    <MapContainer
                                        center={[cities[0].lat, cities[0].lng]}
                                        zoom={6}
                                        style={{ height: '350px', width: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        {cities.map((city, idx) => (
                                            <Marker key={idx} position={[city.lat, city.lng]}>
                                                <Popup>{city.name}</Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                    <div className="cities-list" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                        <h5 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#031B4E' }}>Cities ({cities.length})</h5>
                                        <div className="cities-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {cities.map((city, idx) => (
                                                <span key={idx} className="city-tag" style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '13px', color: '#031B4E' }}>{city.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-cities" style={{ padding: '40px', textAlign: 'center', color: '#6b88a5', backgroundColor: '#f8fafc', borderRadius: '16px' }}>No cities found for {selectedCountry}</div>
                            )}
                            <div className="planner-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                                <button className="secondary" onClick={() => setPlannerStep(3)} style={{ padding: '12px 32px', fontSize: '16px', backgroundColor: 'transparent', color: '#6b88a5', border: '1px solid #e2e8f0' }}>Back</button>
                                <button className="primary" onClick={handleGenerateTrip} style={{ padding: '12px 32px', fontSize: '16px' }}>Generate Trip</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SiteFooter />
        </main>
    )
}
