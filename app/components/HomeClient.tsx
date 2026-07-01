'use client'

import React, { useState, useEffect } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Inria_Serif, Inter } from 'next/font/google'
import '../home.css'

const inriaSerif = Inria_Serif({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '600'],
  display: 'swap',
})

const DESTINATIONS_DATA: Record<string, any> = {
  Greece: {
    region: 'Europe',
    desc: 'Greece is famous for its iconic blue domes, ancient history, and stunning Aegean sunsets.',
    label: 'Santorini',
    image: '/images/hero_greece_oia.webp',
    bgImage: '/images/hero_greece_oia.webp',
    locationTag: 'Oia Village, Santorini'
  },
  Italy: {
    region: 'Europe',
    desc: 'Italy is known for its historic art, culinary masterpieces, and the dramatic Amalfi Coast.',
    label: 'Positano',
    image: '/images/card_italy.webp',
    bgImage: '/images/card_italy.webp',
    locationTag: 'Amalfi Coast, Italy'
  },
  Spain: {
    region: 'Region',
    desc: 'Spain is famous for its islands, beach holidays, surfing, diving and yachting.',
    label: 'Madrid',
    image: '/images/card_madrid.webp',
    bgImage: '/images/hero_seoul_night.webp',
    locationTag: 'Plaza Mayor, Madrid'
  },
  UAE: {
    region: 'Middle East',
    desc: 'UAE offers a blend of futuristic skyscrapers, luxury shopping, and desert adventures.',
    label: 'Dubai',
    image: '/images/card_uae.webp',
    bgImage: '/images/hero_uae_museum.webp',
    locationTag: 'Museum of the Future, Dubai'
  },
  USA: {
    region: 'North America',
    desc: 'USA features diverse landscapes from bustling New York streets to the Grand Canyon.',
    label: 'New York',
    image: '/images/card_usa.webp',
    bgImage: '/images/card_usa.webp',
    locationTag: 'Times Square, New York'
  },
  Canada: {
    region: 'North America',
    desc: 'Canada is renowned for its vast wilderness, stunning lakes, and friendly multicultural cities.',
    label: 'Banff',
    image: '/images/card_canada.webp',
    bgImage: '/images/card_canada.webp',
    locationTag: 'Moraine Lake, Banff'
  },
  Thailand: {
    region: 'Asia',
    desc: 'Thailand is a land of tropical beaches, ornate temples, and vibrant street life.',
    label: 'Phuket',
    image: '/images/card_thailand.webp',
    bgImage: '/images/card_thailand.webp',
    locationTag: 'Maya Bay, Phi Phi Islands'
  },
  Ireland: {
    region: 'Europe',
    desc: 'Ireland is known for its lush green landscapes, historic castles, and vibrant culture.',
    label: 'Cliffs of Moher',
    image: '/images/why_mountains.webp',
    bgImage: '/images/why_mountains.webp',
    locationTag: 'Cliffs of Moher, County Clare'
  }
}

export default function HomeClient({
  initialCarouselData,
  initialCountries,
  initialWhyData,
  initialTestimData,
  initialBlogsData
}: {
  initialCarouselData: Record<string, any>,
  initialCountries: string[],
  initialWhyData: any[],
  initialTestimData: any[],
  initialBlogsData: any[]
}) {
  const router = useRouter()
  const [destinationsData, setDestinationsData] = useState<Record<string, any>>(
    Object.keys(initialCarouselData).length > 0 ? initialCarouselData : DESTINATIONS_DATA
  )
  const [activeDest, setActiveDest] = useState(
    Object.keys(initialCarouselData).length > 0 ? Object.keys(initialCarouselData)[0] : 'Spain'
  )
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showExploreBtn, setShowExploreBtn] = useState(false)
  const [reelOffset, setReelOffset] = useState(15) // Landing on INDIA
  const [landingIndex, setLandingIndex] = useState(2) // Default to India
  
  const [countries, setCountries] = useState<string[]>(initialCountries)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [animateSteps, setAnimateSteps] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newsletterMsg, setNewsletterMsg] = useState('')

  const [isHeroLoading, setIsHeroLoading] = useState(false) // Renders instantly on the client!
  const [whyData, setWhyData] = useState<any[]>(initialWhyData)
  const [testimData, setTestimData] = useState<any[]>(initialTestimData)
  const [blogsData, setBlogsData] = useState<any[]>(initialBlogsData)
  const [activeTestimIndex, setActiveTestimIndex] = useState(0)

  const REEL_COUNTRIES = countries.length > 0 
    ? countries.map(c => c.toUpperCase()) 
    : ['JAPAN', 'GREECE', 'INDIA', 'GERMANY', 'BRAZIL', 'ITALY', 'SPAIN', 'UAE', 'USA', 'CANADA', 'THAILAND', 'IRELAND']
  const ITEM_HEIGHT = 80 // 50px height + 30px gap
  const destKeys = Object.keys(destinationsData)
  const currentIndex = destKeys.indexOf(activeDest)
  const currentData = destinationsData[activeDest] || destinationsData[destKeys[0]] || DESTINATIONS_DATA['Spain']

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      })
      const data = await res.json()
      if (res.ok) {
        setNewsletterStatus('success')
        setNewsletterMsg('Thanks for subscribing!')
        setNewsletterEmail('')
      } else {
        setNewsletterStatus('error')
        setNewsletterMsg(data.error || 'Failed to subscribe')
      }
    } catch (err: any) {
      setNewsletterStatus('error')
      setNewsletterMsg(err.message || 'Something went wrong')
    }
  }


  // Fetch countries dynamically from the API
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch('/api/countries')
        const data = await res.json()
        if (data.success && Array.isArray(data.countries)) {
          setCountries(data.countries)
        }
      } catch (err) {
        console.error('Failed to fetch countries from api:', err)
      }
    }
    fetchCountries()
  }, [])

  // Observer for Journey section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateSteps(true)
        }
      },
      { threshold: 0.3 }
    )

    const section = document.querySelector('.journey-map')
    if (section) observer.observe(section)

    return () => {
      if (section) observer.unobserve(section)
    }
  }, [])

  // Auto-scroll logic
  useEffect(() => {
    if (destKeys.length === 0) return
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % destKeys.length
      setActiveDest(destKeys[nextIndex])
    }, 3000)
    return () => clearInterval(timer)
  }, [currentIndex, destKeys])

  // Get next two destinations for the side gallery
  const nextDest1 = destKeys.length > 1 ? destKeys[(currentIndex + 1) % destKeys.length] : ''
  const nextDest2 = destKeys.length > 2 ? destKeys[(currentIndex + 2) % destKeys.length] : ''

  return (
    <main className="home-root">
      <SiteHeader />

      {/* 1. Hero Section */}
      {isHeroLoading ? (
        <div className="hero-skeleton-container animate-pulse-luxe">
          <div className="skeleton-content">
            <div className="skeleton-text">
              <div className="skeleton-line short" />
              <div className="skeleton-title" />
              <div className="skeleton-title-second" />
              <div className="skeleton-nav" />
              <div className="skeleton-gallery">
                <div className="skeleton-thumb" />
                <div className="skeleton-thumb" />
              </div>
            </div>
            <div className="skeleton-visual">
              <div className="skeleton-card" />
            </div>
          </div>
          <style jsx>{`
            .hero-skeleton-container {
              max-width: 1400px;
              margin: 0 auto;
              padding: 120px 80px 80px;
              height: 70vh;
              min-height: 600px;
              display: flex;
              align-items: center;
            }
            .skeleton-content {
              display: flex;
              width: 100%;
              gap: 80px;
            }
            .skeleton-text {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .skeleton-line {
              height: 16px;
              background: #F1F5F9;
              border-radius: 8px;
              width: 120px;
            }
            .skeleton-title {
              height: 56px;
              background: #F1F5F9;
              border-radius: 12px;
              width: 80%;
            }
            .skeleton-title-second {
              height: 56px;
              background: #F1F5F9;
              border-radius: 12px;
              width: 60%;
              margin-bottom: 40px;
            }
            .skeleton-nav {
              height: 48px;
              background: #F1F5F9;
              border-radius: 24px;
              width: 110px;
              margin-bottom: 40px;
            }
            .skeleton-gallery {
              display: flex;
              gap: 20px;
            }
            .skeleton-thumb {
              height: 120px;
              width: 110px;
              background: #F1F5F9;
              border-radius: 20px;
            }
            .skeleton-visual {
              width: 55%;
              height: 480px;
              background: #F1F5F9;
              border-radius: 40px;
            }
            .animate-pulse-luxe {
              animation: pulseLuxe 1.5s infinite ease-in-out;
            }
            @keyframes pulseLuxe {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
            @media (max-width: 992px) {
              .hero-skeleton-container { padding: 40px 20px; height: auto; }
              .skeleton-content { flex-direction: column; gap: 40px; }
              .skeleton-visual { width: 100%; height: 300px; }
            }
          `}</style>
        </div>
      ) : (
        <section className="hero-redesign">
          <div className="hero-content">
            <div className="hero-text">
              <p className="hero-subtitle">Handpicked. Trusted. Yours.</p>
              <h1>
                Travel further,<br />
                feel more.
              </h1>
              <div className="hero-nav-btns">
                <button
                  className="nav-arrow left"
                  onClick={() => setActiveDest(destKeys[(currentIndex - 1 + destKeys.length) % destKeys.length])}
                >←</button>
                <button
                  className="nav-arrow right"
                  onClick={() => setActiveDest(destKeys[(currentIndex + 1) % destKeys.length])}
                >→</button>
              </div>

              <div className="left-gallery">
                {nextDest1 && (
                  <div
                    className="gallery-img"
                    style={{ 
                      backgroundImage: `url(${destinationsData[nextDest1]?.image || ''})`,
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '20px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => setActiveDest(nextDest1)}
                  >
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0, height: '80px',
                      background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0) 100%)',
                      borderRadius: '0 0 25px 25px',
                      zIndex: 1
                    }}></div>
                    <span style={{ 
                      color: '#fff', 
                      fontSize: '14px', 
                      fontWeight: '700', 
                      position: 'relative', 
                      zIndex: 2,
                      letterSpacing: '0.5px'
                    }}>{nextDest1}</span>
                  </div>
                )}
                {nextDest2 && (
                  <div
                    className="gallery-img"
                    style={{ 
                      backgroundImage: `url(${destinationsData[nextDest2]?.image || ''})`,
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '20px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => setActiveDest(nextDest2)}
                  >
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0, height: '80px',
                      background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0) 100%)',
                      borderRadius: '0 0 25px 25px',
                      zIndex: 1
                    }}></div>
                    <span style={{ 
                      color: '#fff', 
                      fontSize: '14px', 
                      fontWeight: '700', 
                      position: 'relative', 
                      zIndex: 2,
                      letterSpacing: '0.5px'
                    }}>{nextDest2}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="hero-visual">
              {currentData && (
                <div className="hero-main-img" style={{ backgroundImage: `url(${currentData.bgImage})` }}>
                  <div className="spark-card">
                    <div className="spark-header">
                      <span className="spark-icon">🌍</span>
                      <div>
                        <h4>{activeDest}</h4>
                        <p>{currentData.region}</p>
                      </div>
                    </div>
                    <p className="spark-desc">{currentData.desc}</p>
                    <span className="spark-sub-label">{currentData.label}</span>
                    <div className="card-thumb" style={{ backgroundImage: `url(${currentData.image})` }}></div>
                  </div>
                  <div className="location-tag" onClick={() => router.push('/guide')}>
                    <span>{currentData.locationTag}</span>
                    <div className="location-arrow">→</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="hero-destinations">
            {destKeys.map(d => (
              <span
                key={d}
                className={d === activeDest ? 'active' : ''}
                onClick={() => setActiveDest(d)}
                style={{ cursor: 'pointer' }}
              >
                {d}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 2. Search & Explore */}
      <section className={`search-explore ${isUnlocked ? 'unlocked' : ''}`}>
        <div className="explore-left">
          <div className="compact-search">
            <button className="search-orange-btn" onClick={() => setShowDropdown(!showDropdown)}>🔍</button>
            <input
              type="text"
              placeholder="Search Country or destination"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
            <span className="search-chevron" onClick={() => setShowDropdown(!showDropdown)}>▼</span>

            {showDropdown && (
              <div className="country-dropdown-list">
                {countries
                  .filter(c => countries.includes(searchQuery) || c.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(country => (
                    <div
                      key={country}
                      className="dropdown-item"
                      onClick={() => {
                        setSearchQuery(country);
                        setShowDropdown(false);
                      }}
                    >
                      {country}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div className="explore-v-card">
            <div 
              className="v-card-img" 
              style={{ 
                backgroundImage: `url(${destinationsData[searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan']?.image || '/images/explore_japan.webp'})` 
              }}
            ></div>
            <div className="v-card-overlay">
              <h3>Explore <span>{searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan'}</span></h3>
              <p>
                {destinationsData[searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan']?.desc || 
                  `Discover the beauty of ${searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan'}, from its vibrant city life to its serene landscapes.`}
              </p>
            </div>
          </div>

          {/* Explore Now Button Centered Below the Card */}
          <button 
            className="explore-now-btn-below" 
            onClick={() => router.push(`/plan?country=${encodeURIComponent(searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan')}`)}
          >
            Explore Now
          </button>
        </div>

        {/* Vertical Divider Line */}
        <div className="vertical-divider" />

        <div className="explore-right">
          {!isUnlocked ? (
            <div className="explore-right-locked">
              <div className="sparkles-icon">✨✨</div>
              <p className="ready-text">Ready to Explore?</p>
              <h2 className="unlock-title">Unlock the<br />Fun</h2>
              <p className="unlock-desc">Click below to start your next adventure.</p>
              
              <button className="unlock-now-btn" onClick={() => setIsUnlocked(true)}>
                ✨ Unlock Now
              </button>

              <div className="arrow-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="arrow-svg">
                  <path d="M18 6 C13 14 8 16 6 20" />
                  <polyline points="10 20 6 20 6 16" />
                </svg>
                <span className="arrow-text">Click to unlock amazing experiences!</span>
              </div>
            </div>
          ) : (
            <>
              <h2 className="spin-title">No Plans? No Problem. <span>Spin It</span></h2>
              <div className="spin-wheel-outer">
                <div className="spin-indicator"></div>
                <div className="spin-wheel-container">
                  <div className="spin-wheel-inner-ring"></div>
                  <div
                    className="spin-destinations-reel"
                    style={{
                      transform: `translateY(${reelOffset}px)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
                    }}
                  >
                    {[...REEL_COUNTRIES, ...REEL_COUNTRIES, ...REEL_COUNTRIES, ...REEL_COUNTRIES, ...REEL_COUNTRIES].map((d, i) => (
                      <span
                        key={`${d}-${i}`}
                        className={i === landingIndex ? 'active' : ''}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className="spin-action-btn"
                  onClick={() => {
                    setIsSpinning(true)
                    setShowExploreBtn(false)
                    const totalItems = REEL_COUNTRIES.length
                    const randomLanding = Math.floor(Math.random() * totalItems)
                    const spinRounds = 3
                    const finalIndex = (spinRounds * totalItems) + randomLanding
                    const offset = 175 - (finalIndex * ITEM_HEIGHT)

                    setReelOffset(offset)
                    setTimeout(() => {
                      setIsSpinning(false)
                      setLandingIndex(finalIndex)
                      
                      const landedCountry = REEL_COUNTRIES[randomLanding]
                      const originalCountry = countries.find(c => c.toUpperCase() === landedCountry.toUpperCase()) || 
                        (landedCountry === 'UAE' || landedCountry === 'USA' 
                          ? landedCountry 
                          : landedCountry.charAt(0) + landedCountry.slice(1).toLowerCase())
                      
                      setSearchQuery(originalCountry)
                      setShowExploreBtn(true)
                    }, 3000)
                  }}
                  disabled={isSpinning}
                >
                  {isSpinning ? 'Spinning...' : 'Spin the Compass'}
                </button>
                {showExploreBtn && (
                  <button
                    className="explore-now-btn-below"
                    style={{ marginTop: '15px' }}
                    onClick={() => router.push(`/plan?country=${encodeURIComponent(searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan')}`)}
                  >
                    Explore Now
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. Journey Map */}
      <section className={`journey-map ${animateSteps ? 'animate' : ''}`}>
        <div className="journey-card">
          <div className="world-map-svg" />

          <div className="journey-info">
            <p className="journey-eyebrow">HOW IT WORKS</p>
            <h2 className={inriaSerif.className}>How SnapTrip<br/>Helps You?</h2>
            <p className={`journey-desc ${inter.className}`}>
              SnapTrip, your AI-powered travel partner, offers step-by-step guidance.
              We create instant, detailed itineraries, tailored to your budget and travel dates,
              saving you time and stress.
            </p>
          </div>

          <div className="map-container">
            <img src="/images/Property 1=Variant6.png" alt="Step 1" className="journey-step-img img-step-1" />
            <img src="/images/Property 1=S2.png" alt="Step 2" className="journey-step-img img-step-2" />
            <img src="/images/Property 1=S5.png" alt="Step 3" className="journey-step-img img-step-3" />
            <img src="/images/Property 1=S6 (1).png" alt="Step 4" className="journey-step-img img-step-4" />
            <img src="/images/Property 1=S7 (1).png" alt="Step 5" className="journey-step-img img-step-5" />
          </div>

          <div className="journey-circles">
            <div className="journey-circle circle-1" style={{ backgroundImage: 'url(/images/how_tokyo.webp)', left: '100px', top: '0', zIndex: 2 }}></div>
            <div className="journey-circle circle-2" style={{ backgroundImage: 'url(/images/hero_greece_oia.webp)', left: '-30px', top: '140px', zIndex: 1 }}></div>
            <div className="journey-circle circle-3" style={{ backgroundImage: 'url(/images/alpine_mountains.webp)', left: '200px', top: '160px', zIndex: 3 }}></div>
            <div className="journey-circle circle-4" style={{ backgroundImage: 'url(/images/how_positano.webp)', left: '80px', top: '300px', zIndex: 4 }}></div>
          </div>

          <button className={`start-journey-btn ${inter.className}`} onClick={() => router.push(`/plan?country=${encodeURIComponent(activeDest)}`)}>
            Start Your Journey
          </button>
        </div>
      </section>

      {/* 4. Why SnapTrip */}
      <section className="why-snaptrip">
        <p className="section-label">ADVENTURE - PLANNER</p>
        <h2>Why SnapTrip</h2>

        <div className="why-grid">
          {(whyData.length > 0 ? whyData : [
            { icon: '🗺️', title: 'Seamless and Intuitive', text: 'Plan your trip with ease using our clean and simple interface.' },
            { icon: '⭐', title: 'Effortless Planning', text: 'Create personalized itineraries tailored to your unique travel style.' },
            { icon: '⚡', title: 'Personalized Journeys', text: 'Our AI-powered engine finds the best places for your journey.' },
            { icon: '💡', title: 'Expert Recommendations', text: 'Get handpicked recommendations from seasoned travelers.' }
          ]).map(item => (
            <div className="why-card" key={item.title}>
              <div className="why-icon" style={{ color: '#EBA424' }}>{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="quote-section">
          <div className="quote-img" style={{ backgroundImage: 'url(/images/why_mountains.webp)' }}></div>
          <div className="quote-content">
            <blockquote>
              "Travel is not about the destination, but the identity we find when we leave the home behind."
            </blockquote>
            <cite>— The Snaptrip Ethos</cite>
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="testimonials-redesign">
        <h2>What Our <span>Travelers Say</span></h2>

        <div className="testimonial-layout" style={{ position: 'relative' }}>
          {testimData.length > 1 && (
            <div style={{ position: 'absolute', top: '50%', left: '-30px', right: '-30px', display: 'flex', justifyContent: 'space-between', zIndex: 10, transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <button 
                onClick={() => setActiveTestimIndex((prev) => (prev - 1 + testimData.length) % testimData.length)} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', fontSize: '24px', color: '#64748b', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#EBA424'}
                onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
              >←</button>
              <button 
                onClick={() => setActiveTestimIndex((prev) => (prev + 1) % testimData.length)} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', fontSize: '24px', color: '#64748b', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#EBA424'}
                onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
              >→</button>
            </div>
          )}
          {(() => {
            const currentT = testimData.length > 0 ? testimData[activeTestimIndex] : {
              quote: "Planning my trip was super easy and smooth. Loved the experience.",
              name: "Riya Sharma",
              location: "Dubai",
              avatar_url: "/images/testimonial.webp",
              image_url: "/images/testimonial.webp"
            };
            return (
              <>
                <div className="testimonial-main">
                  <div className="location-pin">📍</div>
                  <blockquote style={{ minHeight: '120px' }}>
                    "{currentT.quote}"
                  </blockquote>
                  <div className="testimonial-user">
                    <img src={currentT.avatar_url} alt={currentT.name} className="user-avatar" style={{ objectFit: 'cover' }} />
                    <div>
                      <h4>{currentT.name}</h4>
                      <p>{currentT.location}</p>
                    </div>
                  </div>
                </div>
                <div className="testimonial-polaroid">
                  <div className="polaroid-img" style={{ backgroundImage: `url(${currentT.image_url})` }}></div>
                </div>
              </>
            )
          })()}
        </div>
      </section>

      {/* 6. Curated Stories */}
      <section className="curated-stories">
        <p className="section-label">PREMIUM TRAVEL JOURNAL</p>
        <div className="curated-header-row">
          <h2>Curated <span>Stories</span> &<br />Perspectives</h2>
          <p className="curated-subtitle">
            Expert insights from our globetrotting community to help you plan your next escape.
          </p>
        </div>

        <div className="stories-grid">
          {(() => {
            const mainStory = blogsData.length > 0 ? blogsData[0] : {
              image_url: '/images/marrakech.webp',
              category: 'FEATURED ENTRY',
              created_at: '2023-10-12T00:00:00Z',
              title: 'Marrakech Magic: The Secret Heart of the Red City',
              excerpt: 'Discover the hidden riads and vibrant markets of the Red City. From tea ceremonies to secret garden retreats, immerse yourself in...',
              slug: '#'
            };
            const sideStories = blogsData.length > 1 ? blogsData.slice(1) : [
              { 
                image_url: '/images/why_mountains.webp', 
                title: 'Atlas Adventures: Remote Berber Hospitality', 
                category: 'ADVENTURE', 
                created_at: '2023-11-05T00:00:00Z', 
                excerpt: 'Experience the majestic peaks and warm mountain welcomes of the Berber people.',
                slug: '#' 
              },
              { 
                image_url: '/images/hero_city.webp', 
                title: 'A Taste of Morocco: A Spice Trail Odyssey', 
                category: 'CULINARY', 
                created_at: '2024-01-20T00:00:00Z', 
                excerpt: 'A journey through aromatic spices and traditional tagine secrets of Marrakech.',
                slug: '#' 
              },
              { 
                image_url: '/images/marrakech.webp', 
                title: 'Château Charms: Romantic Loire Landscapes', 
                category: 'CULTURE', 
                created_at: '2024-02-14T00:00:00Z', 
                excerpt: "Fairy-tale castles and world-class vineyards in the heart of France's Loire valley.",
                slug: '#' 
              }
            ];

            return (
              <>
                <div className="main-story-card" style={{ backgroundImage: `url(${mainStory.image_url})` }}>
                  <div className="story-overlay">
                    <span className="story-category">
                      {mainStory.category} • {mainStory.created_at ? new Date(mainStory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}
                    </span>
                    <h3>{mainStory.title}</h3>
                    <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mainStory.excerpt}</p>
                    <button className="read-story-btn" onClick={() => router.push(mainStory.slug !== '#' ? `/blog/${mainStory.slug}` : '#')}>Read Full Journal ➔</button>
                  </div>
                </div>
                <div className="side-stories">
                  {sideStories.map((story, i) => (
                    <div className="side-story-card" key={i}>
                      <div className="side-story-img" style={{ backgroundImage: `url(${story.image_url})` }}></div>
                      <div className="side-story-info">
                        <span className="side-category">
                          {story.category} • {story.created_at ? new Date(story.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : ''}
                        </span>
                        <h4 style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{story.title}</h4>
                        <p className="side-story-excerpt" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {story.excerpt || 'Read the full stories from our curated collection.'}
                        </p>
                        <button className="read-link" onClick={() => router.push(story.slug !== '#' ? `/blog/${story.slug}` : '#')}>Explore Entry ➔</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <p className="cta-label">YOUR DIGITAL COMPANION</p>
          <h2>Access exclusive travel journals and curated guides.</h2>
          
          <form onSubmit={handleNewsletterSubmit} className="cta-input-group" style={{ position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Enter your email..." 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              disabled={newsletterStatus === 'loading'}
            />
            <button type="submit" className="cta-submit-btn" disabled={newsletterStatus === 'loading'}>
              {newsletterStatus === 'loading' ? '...' : '→'}
            </button>
          </form>
          {newsletterMsg && (
            <div style={{ marginTop: '12px', fontSize: '14px', color: newsletterStatus === 'success' ? '#10b981' : '#ef4444' }}>
              {newsletterMsg}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
