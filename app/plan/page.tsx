'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import styles from './planner.module.css'

function PlanTripContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCountry = searchParams.get('country') || 'Italy'
  const [plannerStep, setPlannerStep] = useState(1) 
  
  // Selection States
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry)
  const [tripStyle, setTripStyle] = useState<'Intense' | 'Relaxed' | null>(null)
  const [tripDuration, setTripDuration] = useState<'Weekend' | 'Mini' | 'Full' | null>(null)
  const [tripPreference, setTripPreference] = useState<'Unmissable' | 'ALotMore' | null>(null)
  const [tripImmersion, setTripImmersion] = useState<'Unmissable' | 'ALotMore' | null>(null)
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/admin/sync/countries')
        const data = await res.json()
        if (data.success && data.countries.length > 0) {
          setCountries(data.countries)
          // If the default 'Italy' is not in the list, set to the first available country
          if (!data.countries.includes(selectedCountry)) {
            setSelectedCountry(data.countries[0])
          }
        }
      } catch (err) {
        console.error('Failed to fetch countries', err)
        // Fallback
        const fallback = ['Japan', 'Greece', 'India', 'Germany', 'Brazil', 'Italy', 'Spain', 'UAE', 'USA', 'Canada', 'Thailand', 'Ireland']
        setCountries(fallback)
        if (!fallback.includes(selectedCountry)) {
          setSelectedCountry(fallback[0])
        }
      }
    }
    fetchCountries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const renderStepper = () => {
    // Calculate progress line width
    // With 4 steps, there are 3 segments. 
    // Step 1: 0%, Step 2: 33.3%, Step 3: 66.6%, Step 4: 100%
    const progressWidth = ((plannerStep - 1) / 3) * 100

    return (
      <div className={styles.stepper}>
        <div className={styles.stepperLineBase}></div>
        <div className={styles.stepperLineProgress} style={{ width: `${progressWidth}%` }}></div>
        
        {[1, 2, 3, 4].map((s) => {
          const isCompleted = plannerStep > s
          const isActive = plannerStep === s
          const isPending = plannerStep < s
          
          let label = `Step ${s}`
          if (s === 4) label = 'Generate Trip'

          return (
            <div key={s} className={styles.stepWrapper}>
              <div className={`${styles.stepCircle} ${isPending ? styles.pending : (isCompleted ? styles.completed : styles.active)}`}>
                <div className={styles.innerCircle} />
              </div>
              <span className={`${styles.stepLabel} ${isPending ? styles.pending : ''}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const handleNextStep = () => {
    if (plannerStep < 4) {
      setPlannerStep(plannerStep + 1)
    } else {
      // Convert duration label to number of days
      const durationMap: Record<string, number> = {
        'Weekend': 3,
        'Mini': 6,
        'Full': 10
      }
      const days = tripDuration ? durationMap[tripDuration] : 3
      // Navigate to trip map to explore and build itinerary
      router.push(
        `/trip-map?country=${encodeURIComponent(selectedCountry)}&duration=${days}&style=${encodeURIComponent(tripStyle || 'Intense')}&immersion=${encodeURIComponent(tripImmersion || 'Unmissable')}`
      )
    }
  }

  const handleBackStep = () => {
    if (plannerStep > 1) {
      setPlannerStep(plannerStep - 1)
    }
  }

  return (
    <main className={styles.pageWrapper}>
      <SiteHeader />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.welcomeText}>
            Welcome to 
            <select 
              className={styles.countrySelect}
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {countries.length > 0 ? (
                countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))
              ) : (
                <option value="Italy">Italy</option>
              )}
            </select>
          </h1>
          <p className={styles.subHeaderText}>
            Recommended season : December through April
          </p>
        </header>

        {renderStepper()}

        <div className={styles.modal} style={{ width: '100%', maxWidth: '1000px' }}>
          {plannerStep === 1 && (
            <>
              <h2 className={styles.selectionTitle} style={{ textAlign: 'center', marginBottom: '40px' }}>Choose your trip style</h2>
              <div className={styles.optionsGrid}>
                <div 
                  className={`${styles.optionCard} ${tripStyle === 'Intense' ? styles.selected : ''}`}
                  onClick={() => setTripStyle('Intense')}
                >
                  <div className={styles.selectionIndicator}>
                    {tripStyle === 'Intense' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className={styles.iconCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 className={styles.optionTitle}>Intense</h3>
                  <p className={styles.optionDesc}>move more, see more</p>
                </div>

                <div 
                  className={`${styles.optionCard} ${tripStyle === 'Relaxed' ? styles.selected : ''}`}
                  onClick={() => setTripStyle('Relaxed')}
                >
                  <div className={styles.selectionIndicator}>
                    {tripStyle === 'Relaxed' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className={styles.iconCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20"></path>
                      <path d="M2 12h20"></path>
                      <path d="M22 12a10 10 0 0 0-20 0"></path>
                    </svg>
                  </div>
                  <h3 className={styles.optionTitle}>Relaxed</h3>
                  <p className={styles.optionDesc}>laid back, soak in the vibe</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                <button className={styles.btnNext} onClick={handleNextStep} disabled={!tripStyle}>
                  Next Step 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </>
          )}

          {plannerStep === 2 && (
            <>
              <h2 className={styles.selectionTitle} style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.8rem' }}>How long are you staying?</h2>
              <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '60px', fontSize: '0.9rem' }}>Pick a pace that fits your rhythm</p>
              
              <div className={styles.durationVisual} style={{ marginBottom: '40px' }}>
                <div className={`${styles.calIcon} ${tripDuration === 'Weekend' ? styles.selected : ''}`} onClick={() => setTripDuration('Weekend')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {tripDuration === 'Weekend' && <span className={styles.starBadge}>★</span>}
                </div>
                <div className={`${styles.calIcon} ${tripDuration === 'Mini' ? styles.selected : ''}`} onClick={() => setTripDuration('Mini')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {tripDuration === 'Mini' && <span className={styles.starBadge}>★</span>}
                </div>
                <div className={`${styles.calIcon} ${tripDuration === 'Full' ? styles.selected : ''}`} onClick={() => setTripDuration('Full')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {tripDuration === 'Full' && <span className={styles.starBadge}>★</span>}
                </div>
              </div>

              <div className={styles.durationGrid}>
                <div className={`${styles.durationCard} ${tripDuration === 'Weekend' ? styles.selected : ''}`} onClick={() => setTripDuration('Weekend')}>
                  {tripDuration === 'Weekend' && <div className={styles.checkBadge}>✓</div>}
                  <h4>Weekend getaway</h4>
                  <span className={styles.daysPill}>2-4 days</span>
                </div>
                <div className={`${styles.durationCard} ${tripDuration === 'Mini' ? styles.selected : ''}`} onClick={() => setTripDuration('Mini')}>
                  {tripDuration === 'Mini' && <div className={styles.checkBadge}>✓</div>}
                  <h4>Mini-Vacation</h4>
                  <span className={styles.daysPill}>4-9 days</span>
                </div>
                <div className={`${styles.durationCard} ${tripDuration === 'Full' ? styles.selected : ''}`} onClick={() => setTripDuration('Full')}>
                  {tripDuration === 'Full' && <div className={styles.checkBadge}>✓</div>}
                  <h4>Full-Blown Vacation</h4>
                  <span className={styles.daysPill}>9-14 days</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                <button className={styles.btnBack} onClick={handleBackStep}>Back</button>
                <button className={styles.btnNext} onClick={handleNextStep} disabled={!tripDuration}>
                  Let's Go! 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </>
          )}

          {plannerStep === 3 && (
            <>
              <h2 className={styles.selectionTitle} style={{ textAlign: 'center', marginBottom: '40px' }}>Nature Immersion</h2>
              <div className={styles.optionsGrid}>
                <div 
                  className={`${styles.optionCard} ${tripPreference === 'Unmissable' ? styles.selected : ''}`}
                  onClick={() => setTripPreference('Unmissable')}
                >
                  <div className={styles.selectionIndicator}>
                    {tripPreference === 'Unmissable' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className={styles.iconCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 22h20L12 2z"></path>
                    </svg>
                  </div>
                  <h3 className={styles.optionTitle}>Unmissable</h3>
                  <p className={styles.optionDesc}>The landmarks that shouldn't be missed</p>
                </div>

                <div 
                  className={`${styles.optionCard} ${tripPreference === 'ALotMore' ? styles.selected : ''}`}
                  onClick={() => setTripPreference('ALotMore')}
                >
                  <div className={styles.selectionIndicator}>
                    {tripPreference === 'ALotMore' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className={styles.iconCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 14v5"></path>
                      <path d="M16 14v5"></path>
                      <path d="M12 19v3"></path>
                      <path d="M4 10a8 8 0 0 1 16 0c0 4-4 9-8 9s-8-5-8-9z"></path>
                    </svg>
                  </div>
                  <h3 className={styles.optionTitle}>A lot more</h3>
                  <p className={styles.optionDesc}>More landmarks to explore for nature lovers</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                <button className={styles.btnBack} onClick={handleBackStep}>Back</button>
                <button className={styles.btnNext} onClick={handleNextStep} disabled={!tripPreference}>
                  Next Step 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </>
          )}

          {plannerStep === 4 && (
            <>
              <h2 className={styles.selectionTitle} style={{ textAlign: 'center', marginBottom: '40px' }}>Cultural Immersion</h2>
              <div className={styles.optionsGrid}>
                <div 
                  className={`${styles.optionCard} ${tripImmersion === 'Unmissable' ? styles.selected : ''}`}
                  onClick={() => setTripImmersion('Unmissable')}
                >
                  <div className={styles.selectionIndicator}>
                    {tripImmersion === 'Unmissable' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className={styles.iconCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"></path>
                      <path d="M3 10h18"></path>
                      <path d="M5 10v11"></path>
                      <path d="M19 10v11"></path>
                      <path d="M9 10v11"></path>
                      <path d="M15 10v11"></path>
                      <path d="M4 10l8-7 8 7"></path>
                    </svg>
                  </div>
                  <h3 className={styles.optionTitle}>Unmissable</h3>
                  <p className={styles.optionDesc}>The iconic cultural sites and historic monuments you simply can't miss.</p>
                </div>

                <div 
                  className={`${styles.optionCard} ${tripImmersion === 'ALotMore' ? styles.selected : ''}`}
                  onClick={() => setTripImmersion('ALotMore')}
                >
                  <div className={styles.selectionIndicator}>
                    {tripImmersion === 'ALotMore' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className={styles.iconCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <path d="M9 14h6"></path>
                      <path d="M9 14l3 3 3-3"></path>
                      <path d="M12 11v6"></path>
                      <text x="10.5" y="16.5" fontSize="6" fontWeight="bold" fill="currentColor" stroke="none">M</text>
                    </svg>
                  </div>
                  <h3 className={styles.optionTitle}>A lot more</h3>
                  <p className={styles.optionDesc}>For the deep divers. Discover hidden gems, local galleries, and secret history.</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                <button className={styles.btnBack} onClick={handleBackStep}>Back</button>
                <button className={styles.btnNext} onClick={handleNextStep} disabled={!tripImmersion}>
                  Next Step 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}

export default function PlanTrip() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanTripContent />
    </Suspense>
  )
}
