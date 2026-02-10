'use client'
import './home.css'
import 'leaflet/dist/leaflet.css'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function Home() {
  const router = useRouter()
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)
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

  const destinationImages = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1443926818681-717d074a57af?q=80&w=1200&auto=format&fit=crop'
  ]
  const blogImages = [
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
  ]
  const audienceImages = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop'
  ]
  const testimonialImages = [
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop'
  ]
  return (
    <main className="home-root">
      <SiteHeader />

      <section className="hero">
        <div className="hero-left">
          <div className="pill">AI-Powered Travel Planning</div>
          <h1>
            Plan Your <br /> Dream Trip <br /> in <span className="highlight">Seconds</span>
          </h1>
          <p>
            SnapTrip turns your travel ideas into smart, personalised itineraries instantly
            with cutting-edge AI technology.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => { setPlannerStep(0); setIsPlannerOpen(true) }}>
              Start Planning
            </button>
            <button className="secondary">Watch Demo</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="quick-search">
            <h3>Quick Search</h3>
            <label>Where do you want to go?</label>
            <input placeholder="Select Destination" />
            <div className="quick-row">
              <div>
                <label>Check In</label>
                <input placeholder="mm/dd/yyyy" />
              </div>
              <div>
                <label>Check Out</label>
                <input placeholder="mm/dd/yyyy" />
              </div>
            </div>
            <div className="quick-grid">
              <button>Adventure</button>
              <button>Relaxation</button>
              <button>Cultural</button>
              <button>Luxury</button>
            </div>
            <button className="primary full">Generate Itinerary</button>
          </div>
        </div>
      </section>

      <section id="destinations" className="section light">
        <div className="section-title">
          <span className="pill soft">Top Destinations</span>
          <h2>Countries People Love the Most!</h2>
          <p>Explore the world&apos;s most stunning destinations with AI-powered recommendations</p>
        </div>
        <div className="destination-grid">
          {[
            { name: 'Greece', stat: '245 Trips Planned', tags: ['Islands', 'History', 'Beach'] },
            { name: 'Italy', stat: '312 Tours Available', tags: ['Art', 'Food', 'Culture'] },
            { name: 'Spain', stat: '189 Tours Available', tags: ['Fiesta', 'Coast', 'Tapas'] },
            { name: 'France', stat: '278 Tours Available', tags: ['Romance', 'Wine', 'Fashion'] },
            { name: 'Portugal', stat: '156 Tours Available', tags: ['Surf', 'Porto', 'Tiles'] },
            { name: 'Croatia', stat: '134 Tours Available', tags: ['Adriatic', 'Islands', 'Nature'] }
          ].map((item, idx) => (
            <div className="destination-card" key={item.name}>
              <div
                className="destination-image"
                style={{ backgroundImage: `url(${destinationImages[idx]})` }}
              />
              <div className="destination-overlay" />
              <div className="destination-content">
                <h4>{item.name}</h4>
                <p>{item.stat}</p>
                <div className="tag-row">
                  {item.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
              <button className="arrow-btn">➜</button>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-title">
          <span className="pill">Features</span>
          <h2>How Snaptrip Helps You</h2>
        </div>
        <div className="feature-grid">
          {[
            'Pick Destination',
            'Choose Dates',
            'Build Itinerary',
            'Add Places',
            'Ready to Go'
          ].map((t) => (
            <div className="feature" key={t}>
              <div className="feature-icon" />
              <h4>{t}</h4>
              <p>Simple steps to plan your perfect trip.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="section light">
        <div className="two-col">
          <div>
            <h2>Why Choose Snaptrip?</h2>
            <p>
              Create personalized itineraries, explore popular places, and manage
              your travel timelines with ease.
            </p>
            <ul className="list">
              <li>AI-assisted planning</li>
              <li>Local recommendations</li>
              <li>Collaborative trips</li>
            </ul>
          </div>
          <div className="image-panel" />
        </div>
      </section>

      <section className="section features-highlight">
        <div className="section-title">
          <span className="pill soft">Our Features</span>
          <h2>
            What Sets Us <span className="accent">Apart</span>
          </h2>
        </div>
        <div className="feature-cards">
          {[
            { title: 'Effortless Planning', text: 'AI does the work. You enjoy the journey.', tone: 'blue', icon: '✨' },
            { title: 'No Middlemen', text: 'Direct connections to authentic experiences.', tone: 'gold', icon: '⬡' },
            { title: 'Cultural Immersion', text: 'Experience destinations like a local.', tone: 'purple', icon: '🌍' },
            { title: 'Curated Experience', text: 'Hand‑picked by travel experts.', tone: 'pink', icon: '♦' },
            { title: 'Offline Access', text: 'Travel without internet worries.', tone: 'green', icon: '⬇' },
            { title: 'Share Stories', text: 'Create beautiful travel memories.', tone: 'orange', icon: '↗' }
          ].map((card) => (
            <div className={`feature-card ${card.tone}`} key={card.title}>
              <div className="icon-box">{card.icon}</div>
              <h4>{card.title}</h4>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section light">
        <div className="section-title">
          <span className="pill">Who it&apos;s for</span>
          <h2>Who Is It For?</h2>
        </div>
        <div className="card-grid">
          {['Adventure Seekers', 'Busy Professionals', 'Family Trips'].map((t, idx) => (
            <div className="card" key={t}>
              <div
                className="card-img"
                style={{ backgroundImage: `url(${audienceImages[idx]})` }}
              />
              <h4>{t}</h4>
              <p>Tailored experiences for every traveler.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section testimonials">
        <div className="section-title">
          <span className="pill soft">Testimonials</span>
          <h2>
            What Travellers Say<br />About <span className="accent-gold">SnapTrip</span>
          </h2>
        </div>
        <div className="testimonial-grid">
          {[
            {
              quote:
                '“SnapTrip made planning my Greece vacation incredibly easy! The AI understood exactly what I wanted.”',
              name: 'Sarah Mitchell',
              role: 'Travel Blogger',
              tone: 'blue'
            },
            {
              quote:
                '“As a busy professional, I don’t have time for planning. SnapTrip gave me a complete Italy itinerary in minutes!”',
              name: 'James Rodriguez',
              role: 'Entrepreneur',
              tone: 'gold'
            },
            {
              quote:
                '“The cultural recommendations were perfect! I experienced Spain like a local. SnapTrip exceeded expectations.”',
              name: 'Emma Thompson',
              role: 'Photographer',
              tone: 'purple'
            }
          ].map((t, idx) => (
            <div className={`testimonial-card ${t.tone}`} key={t.name}>
              <div className="stars">★★★★★</div>
              <p className="quote">{t.quote}</p>
              <div className="person">
                <div
                  className="avatar"
                  style={{ backgroundImage: `url(${testimonialImages[idx]})` }}
                />
                <div>
                  <strong>{t.name}</strong>
                  <div className="role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="blogs" className="section light">
        <div className="section-title">
          <span className="pill soft">Blogs</span>
          <h2>Our Latest Blogs</h2>
          <p>Discover travel tips, destination guides, and inspiring stories from around the world</p>
        </div>
        <div className="blog-grid">
          {[
            {
              title: 'Hidden Gems in the Mediterranean',
              excerpt: 'Discover secret beaches, charming villages, and authentic local experiences away from tourist crowds.',
              category: 'Destinations',
              date: 'Feb 5, 2026',
              readTime: '5 min read',
              image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop'
            },
            {
              title: 'Budget Travel: Europe on $50/Day',
              excerpt: 'Learn how to explore Europe without breaking the bank with our expert money-saving tips and tricks.',
              category: 'Travel Tips',
              date: 'Feb 3, 2026',
              readTime: '7 min read',
              image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
            },
            {
              title: 'Best Mountains to Visit in 2026',
              excerpt: 'From the Alps to the Himalayas, explore the most breathtaking mountain destinations for adventure seekers.',
              category: 'Adventure',
              date: 'Jan 28, 2026',
              readTime: '6 min read',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop'
            }
          ].map((blog) => (
            <div className="blog-card" key={blog.title}>
              <div className="blog-image" style={{ backgroundImage: `url(${blog.image})` }}>
                <span className="blog-category">{blog.category}</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{blog.date}</span>
                  <span className="blog-dot">•</span>
                  <span className="blog-read-time">{blog.readTime}</span>
                </div>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
                <button className="blog-read-more">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="blog-cta">
          <button className="primary">View All Blogs</button>
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Your Travel Journey Starts Here</h2>
          <p>Sign up to receive curated itineraries and updates.</p>
        </div>
        <div className="cta-form">
          <input placeholder="Enter your email" />
          <button className="primary">Subscribe</button>
        </div>
      </section>

      <SiteFooter />

      {isPlannerOpen && (
        <div className="planner-overlay">
          <div className="planner-modal">
            <div className="planner-header">
              <div>
                <h3>{selectedCountry ? `Welcome to ${selectedCountry}` : 'Plan Your Trip'}</h3>
                <p>{selectedCountry ? 'Let\'s create your perfect itinerary' : 'Select your destination to begin'}</p>
              </div>
              <button className="close-btn" onClick={() => setIsPlannerOpen(false)}>×</button>
            </div>

            <div className="planner-steps">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`step ${plannerStep === n ? 'active' : plannerStep > n ? 'completed' : ''}`}>
                  {n}
                </div>
              ))}
            </div>

            {plannerStep === 0 && (
              <div className="planner-card">
                <h4>Select your destination</h4>
                <p>Choose a country from our database</p>
                <div className="planner-select-wrapper">
                  <select
                    className="planner-select"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    disabled={loadingCountries}
                  >
                    <option value="">-- Select a country --</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div className="planner-actions">
                  <button className="primary" onClick={() => setPlannerStep(1)} disabled={!selectedCountry}>Continue</button>
                </div>
              </div>
            )}

            {plannerStep === 1 && (
              <div className="planner-card">
                <h4>Choose your trip style</h4>
                <p>Select the pace that matches your travel personality</p>
                <div className="planner-options">
                  <button className={`option ${tripStyle === 'Intense' ? 'selected' : ''}`} onClick={() => setTripStyle('Intense')}>
                    <strong>Intense</strong>
                    <span>More tours, more experiences</span>
                  </button>
                  <button className={`option ${tripStyle === 'Relaxed' ? 'selected' : ''}`} onClick={() => setTripStyle('Relaxed')}>
                    <strong>Relaxed</strong>
                    <span>Take it easy, unwind</span>
                  </button>
                </div>
                <div className="planner-actions">
                  <button className="secondary" onClick={() => setPlannerStep(0)}>Back</button>
                  <button className="primary" onClick={() => setPlannerStep(2)} disabled={!tripStyle}>Continue</button>
                </div>
              </div>
            )}

            {plannerStep === 2 && (
              <div className="planner-card">
                <h4>Choose your trip duration</h4>
                <p>How long would you like to explore Finland?</p>
                <div className="planner-options vertical">
                  <button className={`option ${tripDuration === 'Weekend' ? 'selected' : ''}`} onClick={() => setTripDuration('Weekend')}>
                    <strong>Weekend Getaway</strong>
                    <span>2-4 days of adventure</span>
                  </button>
                  <button className={`option ${tripDuration === 'Mini' ? 'selected' : ''}`} onClick={() => setTripDuration('Mini')}>
                    <strong>Mini-Vacation</strong>
                    <span>4-6 days of exploration</span>
                  </button>
                  <button className={`option ${tripDuration === 'Full' ? 'selected' : ''}`} onClick={() => setTripDuration('Full')}>
                    <strong>Full-Blown Vacation</strong>
                    <span>7+ days of immersion</span>
                  </button>
                </div>
                <div className="planner-actions">
                  <button className="secondary" onClick={() => setPlannerStep(1)}>Back</button>
                  <button className="primary" onClick={() => setPlannerStep(3)} disabled={!tripDuration}>Continue</button>
                </div>
              </div>
            )}

            {plannerStep === 3 && (
              <div className="planner-card">
                <h4>Pick immersion</h4>
                <p>Select the experience focus for your trip</p>
                <div className="planner-options">
                  <button className={`option ${immersion === 'Nature' ? 'selected' : ''}`} onClick={() => setImmersion('Nature')}>
                    <strong>Nature Immersion</strong>
                    <span>Unmissable outdoors & views</span>
                  </button>
                  <button className={`option ${immersion === 'Culture' ? 'selected' : ''}`} onClick={() => setImmersion('Culture')}>
                    <strong>Cultural Immersion</strong>
                    <span>Local culture and stories</span>
                  </button>
                </div>
                <div className="planner-actions">
                  <button className="secondary" onClick={() => setPlannerStep(2)}>Back</button>
                  <button className="primary" onClick={() => setPlannerStep(4)} disabled={!immersion}>
                    View Map
                  </button>
                </div>
              </div>
            )}

            {plannerStep === 4 && (
              <div className="planner-card map-card">
                <h4>Explore {selectedCountry}</h4>
                <p>Discover cities in your destination</p>
                {loadingCities ? (
                  <div className="loading-spinner">Loading cities...</div>
                ) : cities.length > 0 ? (
                  <div className="map-container">
                    <MapContainer
                      center={[cities[0].lat, cities[0].lng]}
                      zoom={6}
                      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
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
                    <div className="cities-list">
                      <h5>Cities ({cities.length})</h5>
                      <div className="cities-grid">
                        {cities.map((city, idx) => (
                          <span key={idx} className="city-tag">{city.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-cities">No cities found for {selectedCountry}</div>
                )}
                <div className="planner-actions">
                  <button className="secondary" onClick={() => setPlannerStep(3)}>Back</button>
                  <button className="primary" onClick={handleGenerateTrip}>Generate Trip</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
