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

  const REEL_COUNTRIES = ['JAPAN', 'GREECE', 'INDIA', 'GERMANY', 'BRAZIL', 'ITALY', 'SPAIN', 'UAE', 'USA', 'CANADA', 'THAILAND', 'IRELAND'];
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
    }, 5000)
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
              <button className="explore-now-btn" onClick={() => router.push('/plan')}>Explore Now</button>
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
          <div className="world-map-svg" />
          
          {/* Decorative blue cross from Figma design */}
          <div className="decorative-cross" />
          <div className="decorative-cross-center" />
          
          <div className="journey-info">
            <h2 className={inriaSerif.className}>How SnapTrip Helps You?</h2>
            <p className={`section-desc ${inter.className}`}>
              SnapTrip, your AI-powered travel partner, offers step-by-step guidance.
              We create instant, detailed itineraries, tailored to your budget and travel dates,
              saving you time and stress.
            </p>
          </div>

          <div className="map-container">
            <svg className="timeline-svg" viewBox="0 0 719 985" fill="none">
              <defs>
                <clipPath id="timeline-clip">
                  <rect id="timeline-clip-rect" x="0" y="0" width="719" height="0" />
                </clipPath>
              </defs>
              <path
                className="timeline-path-dashed"
                d="M205.594 871.385C196.48 884.813 189.203 899.008 184.115 914.194L172.737 910.383L161.358 906.571C167.215 889.089 175.531 872.943 185.734 857.908L205.594 871.385ZM267.722 792.134L274.995 801.678C261.345 812.08 248.631 822.825 237.166 834.086L220.35 816.963C232.683 804.85 246.191 793.453 260.448 782.589L267.722 792.134ZM353.312 735.365L359.545 745.618C344.853 754.55 330.371 763.518 316.349 772.688L309.781 762.646L303.213 752.604C317.555 743.224 332.292 734.1 347.078 725.111L353.312 735.365ZM440.797 681.551L447.361 691.597C433.06 700.943 418.323 710.057 403.504 719.061L397.273 708.805L391.042 698.55C405.771 689.601 420.251 680.643 434.231 671.506L440.797 681.551ZM521.7 618.47L530.177 626.964C517.956 639.16 504.459 650.632 490.146 661.574L482.858 652.04L475.57 642.507C489.255 632.045 501.913 621.263 513.223 609.977L521.7 618.47ZM575.509 532.42L587.052 535.701C581.967 553.585 574.164 570.074 564.271 585.404L554.188 578.897L544.105 572.392C552.852 558.837 559.597 544.503 563.966 529.138L575.509 532.42ZM585.575 429.013C587.857 437.28 589.694 445.647 591.045 454.105C592.531 463.411 593.388 472.455 593.646 481.253L581.651 481.605L569.656 481.957C569.43 474.235 568.676 466.221 567.346 457.891C566.141 450.346 564.496 442.847 562.44 435.397L585.575 429.013ZM541.709 338.038C551.363 352.11 559.991 366.61 567.313 381.497L556.546 386.794L545.778 392.09C539.024 378.358 531 364.853 521.919 351.615L531.814 344.826L541.709 338.038ZM476.96 262.217C488.894 273.895 500.337 285.983 511.075 298.448L501.983 306.279L492.892 314.111C482.646 302.217 471.676 290.626 460.174 279.37L468.567 270.793L476.96 262.217ZM401.862 197.831C414.852 207.725 427.747 218.067 440.348 228.824L432.556 237.951L424.765 247.077C412.536 236.638 399.989 226.576 387.319 216.923L401.862 197.831ZM320.769 141.766C334.203 150.242 347.999 159.297 361.909 168.894L348.28 188.649C334.664 179.256 321.145 170.381 307.962 162.063L314.365 151.914L320.769 141.766ZM235.674 92.3516C248.738 99.3278 263.241 107.341 278.705 116.315L266.658 137.073C251.462 128.254 237.209 120.378 224.369 113.521L235.674 92.3516ZM169.544 59.5215C169.55 59.524C169.558 59.5271 169.567 59.5312C169.587 59.5398 169.614 59.5521 169.648 59.5674C169.718 59.5983 169.819 59.6429 169.95 59.7012C170.212 59.8178 170.596 59.9895 171.096 60.2148C172.097 60.6658 173.567 61.3331 175.47 62.2109C179.275 63.9666 184.816 66.5659 191.812 69.9629L186.57 80.7578L181.328 91.5518C174.485 88.2286 169.088 85.6978 165.416 84.0039C163.58 83.1571 162.176 82.5192 161.238 82.0967C160.77 81.8855 160.417 81.728 160.186 81.625C160.07 81.5736 159.984 81.5359 159.93 81.5117C159.903 81.4998 159.883 81.4906 159.871 81.4854C159.865 81.4828 159.86 81.4814 159.858 81.4805L159.857 81.4795L169.533 59.5166H169.534L169.544 59.5215Z"
                fill="#EAB308"
                clipPath="url(#timeline-clip)"
              />
            </svg>

            <div className="map-steps">
              {/* Step 1 */}
              <div className="step step-1">
                <div className="step-content">
                  <div className="step-icon-wrapper">
                    <div className="step-pin">
                      <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                        <path d="M17.9077 49.3795C15.3021 48.0767 13.9993 46.3948 13.9993 44.3337C13.9993 43.4003 14.2813 42.535 14.8452 41.7378C15.4091 40.9406 16.1966 40.2503 17.2077 39.667L20.8827 43.1087C20.5327 43.2642 20.1535 43.4392 19.7452 43.6337C19.3368 43.8281 19.016 44.0614 18.7827 44.3337C19.2882 44.9559 20.4549 45.5003 22.2827 45.967C24.1105 46.4337 26.016 46.667 27.9993 46.667C29.9827 46.667 31.898 46.4337 33.7452 45.967C35.5924 45.5003 36.7688 44.9559 37.2744 44.3337C37.0021 44.0225 36.6521 43.7698 36.2243 43.5753C35.7966 43.3809 35.3882 43.2059 34.9994 43.0503L38.616 39.5503C39.7049 40.1725 40.541 40.8823 41.1244 41.6795C41.7077 42.4767 41.9994 43.3614 41.9994 44.3337C41.9994 46.3948 40.6966 48.0767 38.091 49.3795C35.4855 50.6823 32.1216 51.3337 27.9993 51.3337C23.8771 51.3337 20.5132 50.6823 17.9077 49.3795ZM28.0577 38.5003C31.9077 35.6614 34.8049 32.8128 36.7494 29.9545C38.6938 27.0962 39.666 24.2281 39.666 21.3503C39.666 17.3837 38.4021 14.3892 35.8744 12.367C33.3466 10.3448 30.7216 9.33366 27.9993 9.33366C25.2771 9.33366 22.6521 10.3448 20.1243 12.367C17.5966 14.3892 16.3327 17.3837 16.3327 21.3503C16.3327 23.9559 17.2855 26.6684 19.191 29.4878C21.0966 32.3073 24.0521 35.3114 28.0577 38.5003ZM27.9993 44.3337C22.516 40.2892 18.423 36.3614 15.7202 32.5503C13.0174 28.7392 11.666 25.0059 11.666 21.3503C11.666 18.5892 12.1618 16.1684 13.1535 14.0878C14.1452 12.0073 15.4188 10.267 16.9743 8.86699C18.5299 7.46699 20.2799 6.41699 22.2243 5.71699C24.1688 5.01699 26.0938 4.66699 27.9993 4.66699C29.9049 4.66699 31.8299 5.01699 33.7744 5.71699C35.7188 6.41699 37.4688 7.46699 39.0244 8.86699C40.5799 10.267 41.8535 12.0073 42.8452 14.0878C43.8369 16.1684 44.3327 18.5892 44.3327 21.3503C44.3327 25.0059 42.9813 28.7392 40.2785 32.5503C37.5757 36.3614 33.4827 40.2892 27.9993 44.3337ZM27.9993 25.667C29.2827 25.667 30.3813 25.21 31.2952 24.2962C32.2091 23.3823 32.666 22.2837 32.666 21.0003C32.666 19.717 32.2091 18.6184 31.2952 17.7045C30.3813 16.7906 29.2827 16.3337 27.9993 16.3337C26.716 16.3337 25.6174 16.7906 24.7035 17.7045C23.7896 18.6184 23.3327 19.717 23.3327 21.0003C23.3327 22.2837 23.7896 23.3823 24.7035 24.2962C25.6174 25.21 26.716 25.667 27.9993 25.667Z" fill="#EAB308"/>
                      </svg>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v2m0 16v2m10-10h-2M4 10H2" />
                    </svg>
                  </div>
                  <div className="step-text">
                    <p className={inter.className}>Pick your destination</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="step step-2">
                <div className="step-content">
                  <div className="step-icon-wrapper">
                    <div className="step-pin">
                      <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                        <path d="M17.9077 49.3795C15.3021 48.0767 13.9993 46.3948 13.9993 44.3337C13.9993 43.4003 14.2813 42.535 14.8452 41.7378C15.4091 40.9406 16.1966 40.2503 17.2077 39.667L20.8827 43.1087C20.5327 43.2642 20.1535 43.4392 19.7452 43.6337C19.3368 43.8281 19.016 44.0614 18.7827 44.3337C19.2882 44.9559 20.4549 45.5003 22.2827 45.967C24.1105 46.4337 26.016 46.667 27.9993 46.667C29.9827 46.667 31.898 46.4337 33.7452 45.967C35.5924 45.5003 36.7688 44.9559 37.2744 44.3337C37.0021 44.0225 36.6521 43.7698 36.2243 43.5753C35.7966 43.3809 35.3882 43.2059 34.9994 43.0503L38.616 39.5503C39.7049 40.1725 40.541 40.8823 41.1244 41.6795C41.7077 42.4767 41.9994 43.3614 41.9994 44.3337C41.9994 46.3948 40.6966 48.0767 38.091 49.3795C35.4855 50.6823 32.1216 51.3337 27.9993 51.3337C23.8771 51.3337 20.5132 50.6823 17.9077 49.3795ZM28.0577 38.5003C31.9077 35.6614 34.8049 32.8128 36.7494 29.9545C38.6938 27.0962 39.666 24.2281 39.666 21.3503C39.666 17.3837 38.4021 14.3892 35.8744 12.367C33.3466 10.3448 30.7216 9.33366 27.9993 9.33366C25.2771 9.33366 22.6521 10.3448 20.1243 12.367C17.5966 14.3892 16.3327 17.3837 16.3327 21.3503C16.3327 23.9559 17.2855 26.6684 19.191 29.4878C21.0966 32.3073 24.0521 35.3114 28.0577 38.5003ZM27.9993 44.3337C22.516 40.2892 18.423 36.3614 15.7202 32.5503C13.0174 28.7392 11.666 25.0059 11.666 21.3503C11.666 18.5892 12.1618 16.1684 13.1535 14.0878C14.1452 12.0073 15.4188 10.267 16.9743 8.86699C18.5299 7.46699 20.2799 6.41699 22.2243 5.71699C24.1688 5.01699 26.0938 4.66699 27.9993 4.66699C29.9049 4.66699 31.8299 5.01699 33.7744 5.71699C35.7188 6.41699 37.4688 7.46699 39.0244 8.86699C40.5799 10.267 41.8535 12.0073 42.8452 14.0878C43.8369 16.1684 44.3327 18.5892 44.3327 21.3503C44.3327 25.0059 42.9813 28.7392 40.2785 32.5503C37.5757 36.3614 33.4827 40.2892 27.9993 44.3337ZM27.9993 25.667C29.2827 25.667 30.3813 25.21 31.2952 24.2962C32.2091 23.3823 32.666 22.2837 32.666 21.0003C32.666 19.717 32.2091 18.6184 31.2952 17.7045C30.3813 16.7906 29.2827 16.3337 27.9993 16.3337C26.716 16.3337 25.6174 16.7906 24.7035 17.7045C23.7896 18.6184 23.3327 19.717 23.3327 21.0003C23.3327 22.2837 23.7896 23.3823 24.7035 24.2962C25.6174 25.21 26.716 25.667 27.9993 25.667Z" fill="#EAB308"/>
                      </svg>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="step-text">
                    <p className={inter.className}>Choose your trip style</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="step step-3">
                <div className="step-content">
                  <div className="step-icon-wrapper">
                    <div className="step-pin">
                      <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                        <path d="M17.9077 49.3795C15.3021 48.0767 13.9993 46.3948 13.9993 44.3337C13.9993 43.4003 14.2813 42.535 14.8452 41.7378C15.4091 40.9406 16.1966 40.2503 17.2077 39.667L20.8827 43.1087C20.5327 43.2642 20.1535 43.4392 19.7452 43.6337C19.3368 43.8281 19.016 44.0614 18.7827 44.3337C19.2882 44.9559 20.4549 45.5003 22.2827 45.967C24.1105 46.4337 26.016 46.667 27.9993 46.667C29.9827 46.667 31.898 46.4337 33.7452 45.967C35.5924 45.5003 36.7688 44.9559 37.2744 44.3337C37.0021 44.0225 36.6521 43.7698 36.2243 43.5753C35.7966 43.3809 35.3882 43.2059 34.9994 43.0503L38.616 39.5503C39.7049 40.1725 40.541 40.8823 41.1244 41.6795C41.7077 42.4767 41.9994 43.3614 41.9994 44.3337C41.9994 46.3948 40.6966 48.0767 38.091 49.3795C35.4855 50.6823 32.1216 51.3337 27.9993 51.3337C23.8771 51.3337 20.5132 50.6823 17.9077 49.3795ZM28.0577 38.5003C31.9077 35.6614 34.8049 32.8128 36.7494 29.9545C38.6938 27.0962 39.666 24.2281 39.666 21.3503C39.666 17.3837 38.4021 14.3892 35.8744 12.367C33.3466 10.3448 30.7216 9.33366 27.9993 9.33366C25.2771 9.33366 22.6521 10.3448 20.1243 12.367C17.5966 14.3892 16.3327 17.3837 16.3327 21.3503C16.3327 23.9559 17.2855 26.6684 19.191 29.4878C21.0966 32.3073 24.0521 35.3114 28.0577 38.5003ZM27.9993 44.3337C22.516 40.2892 18.423 36.3614 15.7202 32.5503C13.0174 28.7392 11.666 25.0059 11.666 21.3503C11.666 18.5892 12.1618 16.1684 13.1535 14.0878C14.1452 12.0073 15.4188 10.267 16.9743 8.86699C18.5299 7.46699 20.2799 6.41699 22.2243 5.71699C24.1688 5.01699 26.0938 4.66699 27.9993 4.66699C29.9049 4.66699 31.8299 5.01699 33.7744 5.71699C35.7188 6.41699 37.4688 7.46699 39.0244 8.86699C40.5799 10.267 41.8535 12.0073 42.8452 14.0878C43.8369 16.1684 44.3327 18.5892 44.3327 21.3503C44.3327 25.0059 42.9813 28.7392 40.2785 32.5503C37.5757 36.3614 33.4827 40.2892 27.9993 44.3337ZM27.9993 25.667C29.2827 25.667 30.3813 25.21 31.2952 24.2962C32.2091 23.3823 32.666 22.2837 32.666 21.0003C32.666 19.717 32.2091 18.6184 31.2952 17.7045C30.3813 16.7906 29.2827 16.3337 27.9993 16.3337C26.716 16.3337 25.6174 16.7906 24.7035 17.7045C23.7896 18.6184 23.3327 19.717 23.3327 21.0003C23.3327 22.2837 23.7896 23.3823 24.7035 24.2962C25.6174 25.21 26.716 25.667 27.9993 25.667Z" fill="#EAB308"/>
                      </svg>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                      <circle cx="15" cy="16" r="3" />
                      <path d="M15 14v2l1 1" />
                    </svg>
                  </div>
                  <div className="step-text">
                    <p className={inter.className}>Set your trip duration</p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="step step-4">
                <div className="step-content">
                  <div className="step-icon-wrapper">
                    <div className="step-pin">
                      <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                        <path d="M17.9077 49.3795C15.3021 48.0767 13.9993 46.3948 13.9993 44.3337C13.9993 43.4003 14.2813 42.535 14.8452 41.7378C15.4091 40.9406 16.1966 40.2503 17.2077 39.667L20.8827 43.1087C20.5327 43.2642 20.1535 43.4392 19.7452 43.6337C19.3368 43.8281 19.016 44.0614 18.7827 44.3337C19.2882 44.9559 20.4549 45.5003 22.2827 45.967C24.1105 46.4337 26.016 46.667 27.9993 46.667C29.9827 46.667 31.898 46.4337 33.7452 45.967C35.5924 45.5003 36.7688 44.9559 37.2744 44.3337C37.0021 44.0225 36.6521 43.7698 36.2243 43.5753C35.7966 43.3809 35.3882 43.2059 34.9994 43.0503L38.616 39.5503C39.7049 40.1725 40.541 40.8823 41.1244 41.6795C41.7077 42.4767 41.9994 43.3614 41.9994 44.3337C41.9994 46.3948 40.6966 48.0767 38.091 49.3795C35.4855 50.6823 32.1216 51.3337 27.9993 51.3337C23.8771 51.3337 20.5132 50.6823 17.9077 49.3795ZM28.0577 38.5003C31.9077 35.6614 34.8049 32.8128 36.7494 29.9545C38.6938 27.0962 39.666 24.2281 39.666 21.3503C39.666 17.3837 38.4021 14.3892 35.8744 12.367C33.3466 10.3448 30.7216 9.33366 27.9993 9.33366C25.2771 9.33366 22.6521 10.3448 20.1243 12.367C17.5966 14.3892 16.3327 17.3837 16.3327 21.3503C16.3327 23.9559 17.2855 26.6684 19.191 29.4878C21.0966 32.3073 24.0521 35.3114 28.0577 38.5003ZM27.9993 44.3337C22.516 40.2892 18.423 36.3614 15.7202 32.5503C13.0174 28.7392 11.666 25.0059 11.666 21.3503C11.666 18.5892 12.1618 16.1684 13.1535 14.0878C14.1452 12.0073 15.4188 10.267 16.9743 8.86699C18.5299 7.46699 20.2799 6.41699 22.2243 5.71699C24.1688 5.01699 26.0938 4.66699 27.9993 4.66699C29.9049 4.66699 31.8299 5.01699 33.7744 5.71699C35.7188 6.41699 37.4688 7.46699 39.0244 8.86699C40.5799 10.267 41.8535 12.0073 42.8452 14.0878C43.8369 16.1684 44.3327 18.5892 44.3327 21.3503C44.3327 25.0059 42.9813 28.7392 40.2785 32.5503C37.5757 36.3614 33.4827 40.2892 27.9993 44.3337ZM27.9993 25.667C29.2827 25.667 30.3813 25.21 31.2952 24.2962C32.2091 23.3823 32.666 22.2837 32.666 21.0003C32.666 19.717 32.2091 18.6184 31.2952 17.7045C30.3813 16.7906 29.2827 16.3337 27.9993 16.3337C26.716 16.3337 25.6174 16.7906 24.7035 17.7045C23.7896 18.6184 23.3327 19.717 23.3327 21.0003C23.3327 22.2837 23.7896 23.3823 24.7035 24.2962C25.6174 25.21 26.716 25.667 27.9993 25.667Z" fill="#EAB308"/>
                      </svg>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5">
                      <path d="M15 5H9a2 2 0 0 0-2 2v12l5-3 5 3V7a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="10" r="2" />
                    </svg>
                  </div>
                  <div className="step-text">
                    <p className={inter.className}>Select your preferred attractions</p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="step step-5">
                <div className="step-content">
                  <div className="step-icon-wrapper">
                    <div className="step-pin">
                      <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                        <path d="M17.9077 49.3795C15.3021 48.0767 13.9993 46.3948 13.9993 44.3337C13.9993 43.4003 14.2813 42.535 14.8452 41.7378C15.4091 40.9406 16.1966 40.2503 17.2077 39.667L20.8827 43.1087C20.5327 43.2642 20.1535 43.4392 19.7452 43.6337C19.3368 43.8281 19.016 44.0614 18.7827 44.3337C19.2882 44.9559 20.4549 45.5003 22.2827 45.967C24.1105 46.4337 26.016 46.667 27.9993 46.667C29.9827 46.667 31.898 46.4337 33.7452 45.967C35.5924 45.5003 36.7688 44.9559 37.2744 44.3337C37.0021 44.0225 36.6521 43.7698 36.2243 43.5753C35.7966 43.3809 35.3882 43.2059 34.9994 43.0503L38.616 39.5503C39.7049 40.1725 40.541 40.8823 41.1244 41.6795C41.7077 42.4767 41.9994 43.3614 41.9994 44.3337C41.9994 46.3948 40.6966 48.0767 38.091 49.3795C35.4855 50.6823 32.1216 51.3337 27.9993 51.3337C23.8771 51.3337 20.5132 50.6823 17.9077 49.3795ZM28.0577 38.5003C31.9077 35.6614 34.8049 32.8128 36.7494 29.9545C38.6938 27.0962 39.666 24.2281 39.666 21.3503C39.666 17.3837 38.4021 14.3892 35.8744 12.367C33.3466 10.3448 30.7216 9.33366 27.9993 9.33366C25.2771 9.33366 22.6521 10.3448 20.1243 12.367C17.5966 14.3892 16.3327 17.3837 16.3327 21.3503C16.3327 23.9559 17.2855 26.6684 19.191 29.4878C21.0966 32.3073 24.0521 35.3114 28.0577 38.5003ZM27.9993 44.3337C22.516 40.2892 18.423 36.3614 15.7202 32.5503C13.0174 28.7392 11.666 25.0059 11.666 21.3503C11.666 18.5892 12.1618 16.1684 13.1535 14.0878C14.1452 12.0073 15.4188 10.267 16.9743 8.86699C18.5299 7.46699 20.2799 6.41699 22.2243 5.71699C24.1688 5.01699 26.0938 4.66699 27.9993 4.66699C29.9049 4.66699 31.8299 5.01699 33.7744 5.71699C35.7188 6.41699 37.4688 7.46699 39.0244 8.86699C40.5799 10.267 41.8535 12.0073 42.8452 14.0878C43.8369 16.1684 44.3327 18.5892 44.3327 21.3503C44.3327 25.0059 42.9813 28.7392 40.2785 32.5503C37.5757 36.3614 33.4827 40.2892 27.9993 44.3337ZM27.9993 25.667C29.2827 25.667 30.3813 25.21 31.2952 24.2962C32.2091 23.3823 32.666 22.2837 32.666 21.0003C32.666 19.717 32.2091 18.6184 31.2952 17.7045C30.3813 16.7906 29.2827 16.3337 27.9993 16.3337C26.716 16.3337 25.6174 16.7906 24.7035 17.7045C23.7896 18.6184 23.3327 19.717 23.3327 21.0003C23.3327 22.2837 23.7896 23.3823 24.7035 24.2962C25.6174 25.21 26.716 25.667 27.9993 25.667Z" fill="#EAB308"/>
                      </svg>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6m-8 5l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="step-text">
                    <p className={inter.className}>Itinerary Complete!</p>
                  </div>
                </div>
              </div>
            </div>

            <button className={`start-journey-btn ${inter.className}`} onClick={() => router.push('/plan')}>Start Your Journey</button>
          </div>
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
                  <button className="explore-stories-btn" onClick={() => router.push('/blog')}>Explore Stories</button>
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
