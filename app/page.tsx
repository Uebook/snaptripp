'use client'
import React, { useState, useEffect } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { useRouter } from 'next/navigation'
import { Inria_Serif, Inter } from 'next/font/google';

const inriaSerif = Inria_Serif({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '600'],
  display: 'swap',
});

const DESTINATIONS_DATA: Record<string, any> = {
  Greece: {
    region: 'Europe',
    desc: 'Greece is famous for its iconic blue domes, ancient history, and stunning Aegean sunsets.',
    label: 'Santorini',
    image: '/images/hero_greece_oia.png',
    bgImage: '/images/hero_greece_oia.png',
    locationTag: 'Oia Village, Santorini'
  },
  Italy: {
    region: 'Europe',
    desc: 'Italy is known for its historic art, culinary masterpieces, and the dramatic Amalfi Coast.',
    label: 'Positano',
    image: '/images/card_italy.png',
    bgImage: '/images/card_italy.png',
    locationTag: 'Amalfi Coast, Italy'
  },
  Spain: {
    region: 'Region',
    desc: 'Spain is famous for its islands, beach holidays, surfing, diving and yachting.',
    label: 'Madrid',
    image: '/images/card_madrid.png',
    bgImage: '/images/hero_seoul_night.png',
    locationTag: 'Plaza Mayor, Madrid'
  },
  UAE: {
    region: 'Middle East',
    desc: 'UAE offers a blend of futuristic skyscrapers, luxury shopping, and desert adventures.',
    label: 'Dubai',
    image: '/images/card_uae.png',
    bgImage: '/images/hero_uae_museum.png',
    locationTag: 'Museum of the Future, Dubai'
  },
  USA: {
    region: 'North America',
    desc: 'USA features diverse landscapes from bustling New York streets to the Grand Canyon.',
    label: 'New York',
    image: '/images/card_usa.png',
    bgImage: '/images/card_usa.png',
    locationTag: 'Times Square, New York'
  },
  Canada: {
    region: 'North America',
    desc: 'Canada is renowned for its vast wilderness, stunning lakes, and friendly multicultural cities.',
    label: 'Banff',
    image: '/images/card_canada.png',
    bgImage: '/images/card_canada.png',
    locationTag: 'Moraine Lake, Banff'
  },
  Thailand: {
    region: 'Asia',
    desc: 'Thailand is a land of tropical beaches, ornate temples, and vibrant street life.',
    label: 'Phuket',
    image: '/images/card_thailand.png',
    bgImage: '/images/card_thailand.png',
    locationTag: 'Maya Bay, Phi Phi Islands'
  },
  Ireland: {
    region: 'Europe',
    desc: 'Ireland is known for its lush green landscapes, historic castles, and vibrant culture.',
    label: 'Cliffs of Moher',
    image: '/images/why_mountains.png',
    bgImage: '/images/why_mountains.png',
    locationTag: 'Cliffs of Moher, County Clare'
  }
};

export default function Home() {
  const router = useRouter()
  const [activeDest, setActiveDest] = useState('Spain')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelOffset, setReelOffset] = useState(32.5) // Landing on INDIA (212.5 - 2*90)
  const [landingIndex, setLandingIndex] = useState(2) // Default to India
  const [countries, setCountries] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [animateSteps, setAnimateSteps] = useState(false)
  const [destinationsData, setDestinationsData] = useState<Record<string, any>>(DESTINATIONS_DATA)
  const [whyData, setWhyData] = useState<any[]>([])
  const [testimData, setTestimData] = useState<any[]>([])
  const [blogsData, setBlogsData] = useState<any[]>([])
  const [activeTestimIndex, setActiveTestimIndex] = useState(0)

  const REEL_COUNTRIES = countries.length > 0 
    ? countries.map(c => c.toUpperCase()) 
    : ['JAPAN', 'GREECE', 'INDIA', 'GERMANY', 'BRAZIL', 'ITALY', 'SPAIN', 'UAE', 'USA', 'CANADA', 'THAILAND', 'IRELAND'];
  const ITEM_HEIGHT = 90; // 55px height + 35px gap
  const destKeys = Object.keys(destinationsData)
  const currentIndex = destKeys.indexOf(activeDest)
  const currentData = destinationsData[activeDest] || destinationsData[destKeys[0]] || DESTINATIONS_DATA['Spain']

  // Fetch homepage hero carousel data from DB
  useEffect(() => {
    const fetchHeroCarousel = async () => {
      try {
        const res = await fetch('/api/admin/carousel')
        if (res.ok) {
          const data = await res.json()
          if (data.items && data.items.length > 0) {
            const formatted: Record<string, any> = {}
            data.items.forEach((item: any) => {
              formatted[item.country] = {
                region: item.region,
                desc: item.description,
                label: item.label,
                image: item.image_url,
                bgImage: item.bg_image_url,
                locationTag: item.location_tag
              }
            })
            setDestinationsData(formatted)
            const keys = Object.keys(formatted)
            setActiveDest(prev => keys.includes(prev) ? prev : (keys[0] || 'Spain'))
          }
        }
      } catch (err) {
        console.error('Failed to fetch home carousel from database, using static fallback:', err)
      }
    }
    fetchHeroCarousel()
  }, [])

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/admin/sync/countries')
        const data = await res.json()
        if (data.success) {
          setCountries(data.countries)
        }
      } catch (err) {
        console.error('Failed to fetch countries', err)
        // Fallback
        setCountries(['Japan', 'Greece', 'India', 'Germany', 'Brazil', 'Italy', 'Spain', 'UAE', 'USA', 'Canada', 'Thailand', 'Ireland'])
      }
    }
    fetchCountries()
  }, [])

  // Fetch homepage dynamic sections data
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/homepage-data')
        if (res.ok) {
          const data = await res.json()
          if (data.whySnaptrip) setWhyData(data.whySnaptrip)
          if (data.testimonials) setTestimData(data.testimonials)
          if (data.blogs) setBlogsData(data.blogs)
        }
      } catch (err) {
        console.error('Failed to fetch homepage sections', err)
      }
    }
    fetchSections()
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
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % destKeys.length
      setActiveDest(destKeys[nextIndex])
    }, 3000)
    return () => clearInterval(timer)
  }, [currentIndex, destKeys])

  // Get next two destinations for the side gallery
  const nextDest1 = destKeys[(currentIndex + 1) % destKeys.length]
  const nextDest2 = destKeys[(currentIndex + 2) % destKeys.length]

  return (
    <main className="home-root">
      <SiteHeader />

      {/* 1. Hero Section */}
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
            </div>
          </div>

          <div className="hero-visual">
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
                  .filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
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
                backgroundImage: `url(${destinationsData[searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan']?.image || '/images/explore_japan.png'})` 
              }}
            ></div>
            <div className="v-card-overlay">
              <h3>Explore <span>{searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan'}</span></h3>
              <p>
                {destinationsData[searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan']?.desc || 
                  `Discover the beauty of ${searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan'}, from its vibrant city life to its serene landscapes.`}
              </p>
              <button className="explore-now-btn" onClick={() => router.push(`/plan?country=${encodeURIComponent(searchQuery && searchQuery.trim() !== '' ? searchQuery : 'Japan')}`)}>Explore Now</button>
            </div>
          </div>
        </div>

        <div className="vertical-slider-track">
          <div
            className="slider-handle"
            style={{
              top: isUnlocked ? '90%' : '50%',
              transition: 'top 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={() => setIsUnlocked(!isUnlocked)}
          >
            ||
          </div>
        </div>

        <div className="explore-right">
          {!isUnlocked ? (
            <div className="drag-unlock-text">
              <p>Drag to</p>
              <span>Unlock Fun</span>
            </div>
          ) : (
            <>
              <h2 className="spin-title">No Plans? No Problem. <span>Spin It</span></h2>
              <div className="spin-wheel-outer">
                <div className="spin-indicator"></div>
                <div className="spin-wheel-container">
                  <div
                    className="spin-destinations-reel"
                    style={{
                      transform: `translateY(${reelOffset}px)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
                    }}
                  >
                    {/* Repeat the list to allow for a long spin */}
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
                    setIsSpinning(true);
                    const totalItems = REEL_COUNTRIES.length;
                    const randomLanding = Math.floor(Math.random() * totalItems);
                    const spinRounds = 3; // Spin 3 times before landing
                    const finalIndex = (spinRounds * totalItems) + randomLanding;

                    // We want the finalIndex item to be centered. 
                    // The center of the 480px wheel is 240px.
                    // Each item is 80px high (50px + 30px gap).
                    // The center of an item is at (i * 80) + 25px.
                    // So we need: 240 - ((finalIndex * 80) + 25)
                    const offset = 212.5 - (finalIndex * ITEM_HEIGHT);

                    setReelOffset(offset);
                    setTimeout(() => {
                      setIsSpinning(false);
                      setLandingIndex(finalIndex);
                      
                      // Also update the left card content to the landed country
                      const landedCountry = REEL_COUNTRIES[randomLanding];
                      const formattedCountry = landedCountry === 'UAE' || landedCountry === 'USA' 
                        ? landedCountry 
                        : landedCountry.charAt(0) + landedCountry.slice(1).toLowerCase();
                      
                      setSearchQuery(formattedCountry);
                    }, 3000);
                  }}
                  disabled={isSpinning}
                >
                  {isSpinning ? 'Spinning...' : 'Spin the Compass'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. Journey Map */}
      <section className={`journey-map ${animateSteps ? 'animate' : ''}`}>
        <div className="journey-card">
          {/* World Map BG */}
          <div className="world-map-svg" />

          {/* Left Info */}
          <div className="journey-info">
            <p className="journey-eyebrow">HOW IT WORKS</p>
            <h2 className={inriaSerif.className}>How SnapTrip<br/>Helps You?</h2>
            <p className={`journey-desc ${inter.className}`}>
              SnapTrip, your AI-powered travel partner, offers step-by-step guidance.
              We create instant, detailed itineraries, tailored to your budget and travel dates,
              saving you time and stress.
            </p>
          </div>

          {/* Animated map sequence using provided images */}
          <div className="map-container">
            <img src="/images/Property 1=Variant6.png" alt="Step 1" className="journey-step-img img-step-1" />
            <img src="/images/Property 1=S2.png" alt="Step 2" className="journey-step-img img-step-2" />
            <img src="/images/Property 1=S5.png" alt="Step 3" className="journey-step-img img-step-3" />
            <img src="/images/Property 1=S6 (1).png" alt="Step 4" className="journey-step-img img-step-4" />
            <img src="/images/Property 1=S7 (1).png" alt="Step 5" className="journey-step-img img-step-5" />
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
          <div className="quote-img" style={{ backgroundImage: 'url(/images/why_mountains.png)' }}></div>
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
        <h2>What Our <span>Travelers Says</span></h2>

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
              avatar_url: "/images/testimonial.png",
              image_url: "/images/testimonial.png"
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
        <p className="section-label">ADVENTURE - TRAVEL - STORIES</p>
        <h2>Curated <span>Stories</span> & Perspectives</h2>

        <div className="stories-grid">
          {(() => {
            const mainStory = blogsData.length > 0 ? blogsData[0] : {
              image_url: '/images/marrakech.png',
              category: 'MARRAKECH',
              title: 'Marrakech Magic: The Secret Heart of the Red City',
              excerpt: 'Explore the hidden corners of Marrakech, from the bustling souks to the serene courtyards of riads.',
              slug: '#'
            };
            const sideStories = blogsData.length > 1 ? blogsData.slice(1) : [
              { image_url: '/images/why_mountains.png', title: 'Atlas Adventures: Beyond Berber Hospitality', category: 'MOROCCO', created_at: '2026-02-10T00:00:00Z', slug: '#' },
              { image_url: '/images/hero_city.png', title: 'A Taste of Morocco: A Spice Trail Odyssey', category: 'MOROCCO', created_at: '2026-02-08T00:00:00Z', slug: '#' },
              { image_url: '/images/marrakech.png', title: 'Chasing Dreams: Moroccan landscapes', category: 'MOROCCO', created_at: '2026-02-05T00:00:00Z', slug: '#' }
            ];

            return (
              <>
                <div className="main-story-card" style={{ backgroundImage: `url(${mainStory.image_url})` }}>
                  <div className="story-overlay">
                    <span className="story-category">{mainStory.category}</span>
                    <h3>{mainStory.title}</h3>
                    <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mainStory.excerpt}</p>
                    <button className="read-story-btn" onClick={() => router.push(mainStory.slug !== '#' ? `/blog/${mainStory.slug}` : '#')}>Read More →</button>
                  </div>
                </div>
                <div className="side-stories">
                  {sideStories.map((story, i) => (
                    <div className="side-story-card" key={i}>
                      <div className="side-story-img" style={{ backgroundImage: `url(${story.image_url})` }}></div>
                      <div className="side-story-info">
                        <span className="side-category">{story.category} • {story.created_at ? new Date(story.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}</span>
                        <h4 style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{story.title}</h4>
                        <button className="read-link" onClick={() => router.push(story.slug !== '#' ? `/blog/${story.slug}` : '#')}>Read More →</button>
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
          <div className="cta-input-group">
            <input type="text" placeholder="Write something..." />
            <button className="cta-submit-btn">→</button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
