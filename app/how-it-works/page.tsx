'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import styles from './how-it-works.module.css'

const HOW_IT_WORKS_STEPS = [
  {
    id: '01',
    title: 'Pick your destination',
    desc: 'Search 10,000+ destinations. See trending spots, seasonal highlights, and visa requirements upfront - no surprises at checkout.'
  },
  {
    id: '02',
    title: 'Choose your travel style',
    desc: 'Adventure, culture, relaxation, or food tour? Tell us your vibe and group size - solo, couple, family, or squad- and we tailor everything.'
  },
  {
    id: '03',
    title: 'Set duration & budget',
    desc: 'Pick travel dates and a daily budget. SnapTrip auto-flights, hotels, and activities to fit your spend - lives, as you move the slider.'
  },
  {
    id: '04',
    title: 'Select attractions',
    desc: 'Browse curated must-sees and hidden gems. Add or remove stops-the AI instantly recalculates your daily route to cut travel time.'
  },
  {
    id: '05',
    title: 'Itinerary Complete!',
    desc: 'Download your full plan maps, bookings, emergency contacts, and cost summary. Works offline too-ready wherever you land.'
  }
]

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('itinerary')

  return (
    <div className={styles.container}>
      <SiteHeader />

      {/* Hero Section */}
      <section className={styles.hero} style={{ backgroundImage: 'url("/images/how_hero.png")' }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>INTRODUCING ATLAS LUMINA</span>
          <h1 className={styles.heroTitle}>
            Crafting Your <br />
            <i>Next Odyssey.</i>
          </h1>
          <p className={styles.heroSub}>
            A fusion of high-end editorial curation and artificial intelligence. 
            SnapTrip transforms wandering into precision exploration.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/plan" className={styles.btnPrimary}>Start Your Journey</Link>
            <Link href="/explore" className={styles.btnSecondary}>View Journal</Link>
          </div>
        </div>
      </section>

      {/* Art of Planning Section */}
      <section className={styles.planningSection}>
        <div className={styles.planningContent}>
          <div className={styles.planningText}>
            <h2 className={styles.sectionTitle}>The Art of Seamless Planning</h2>
            <div className={styles.planningSteps}>
              <div className={styles.pStep}>
                <span className={styles.pStepNum}>01</span>
                <div>
                  <h3 className={styles.pStepTitle}>Define Your Muse</h3>
                  <p className={styles.pStepDesc}>
                    Tell our AI your desired mood—whether it's the quiet zen of Kyoto or the kinetic pulse of Berlin.
                  </p>
                </div>
              </div>
              <div className={styles.pStep}>
                <span className={styles.pStepNum}>02</span>
                <div>
                  <h3 className={styles.pStepTitle}>Curated Logic</h3>
                  <p className={styles.pStepDesc}>
                    We calculate flight windows, seasonal shifts, and cultural events to anchor your dates perfectly.
                  </p>
                </div>
              </div>
              <div className={styles.pStep}>
                <span className={styles.pStepNum}>03</span>
                <div>
                  <h3 className={styles.pStepTitle}>Dynamic Refinement</h3>
                  <p className={styles.pStepDesc}>
                    Your itinerary lives and breathes. Adjust one stop, and our system re-optimizes your entire journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.planningCollage}>
            <div className={styles.collageGrid}>
              <img src="/images/how_tokyo.png" alt="Tokyo" className={styles.collageImg} />
              <img src="/images/guide_japan.png" alt="Kyoto" className={styles.collageImg} />
              <img src="/images/how_london.png" alt="London" className={styles.collageImg} />
              <img src="/images/how_positano.png" alt="Positano" className={styles.collageImg} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howSection}>
        <div className={styles.howBg} style={{ backgroundImage: 'url("/images/how_works_bg.png")' }} />
        <div className={styles.howHeader}>
          <h2 className={styles.howTitle}>How It Works</h2>
          <p className={styles.howDesc}>
            Snaptrip guides you through every step of your travel planning — from discovering destinations to creating 
            a personalized itinerary. With simple tools and smart suggestions, you can plan your perfect trip quickly 
            and without stress.
          </p>
        </div>

        <div className={styles.arcContainer}>
          <div className={styles.arcWrapper}>
            {/* The Arc and Decorative Elements */}
            <svg viewBox="0 0 1000 800" className={styles.arcSvg}>
              {/* Inner Decorative Arc */}
              <path 
                d="M 120 250 A 150 150 0 0 1 120 550" 
                fill="none" 
                stroke="#F6B800" 
                strokeWidth="40" 
                strokeLinecap="round"
                opacity="0.6"
              />
              <path 
                d="M 120 250 A 150 150 0 0 1 120 550" 
                fill="none" 
                stroke="#F6B800" 
                strokeWidth="20" 
                strokeLinecap="round"
              />

              {/* Main Dashed Arc */}
              <path 
                id="mainArc"
                d="M 250 100 A 350 350 0 0 1 250 700" 
                fill="none" 
                stroke="#333" 
                strokeWidth="2" 
                strokeDasharray="10 10" 
              />

              {/* Connecting Lines */}
              <line x1="250" y1="250" x2="450" y2="250" stroke="#333" strokeWidth="2" />
              <line x1="390" y1="150" x2="450" y2="150" stroke="#333" strokeWidth="2" />
              <line x1="430" y1="400" x2="550" y2="400" stroke="#333" strokeWidth="2" />
              <line x1="390" y1="650" x2="450" y2="650" stroke="#333" strokeWidth="2" />
              <line x1="250" y1="550" x2="450" y2="550" stroke="#333" strokeWidth="2" />

              {/* Dots on Arc */}
              <circle cx="250" cy="100" r="10" fill="#000" />
              <circle cx="390" cy="150" r="8" fill="#F6B800" stroke="#000" strokeWidth="3" />
              <circle cx="250" cy="250" r="8" fill="#F6B800" stroke="#000" strokeWidth="3" />
              <circle cx="430" cy="400" r="8" fill="#F6B800" stroke="#000" strokeWidth="3" />
              <circle cx="250" cy="550" r="8" fill="#F6B800" stroke="#000" strokeWidth="3" />
              <circle cx="390" cy="650" r="8" fill="#F6B800" stroke="#000" strokeWidth="3" />
              <circle cx="250" cy="700" r="10" fill="#000" />

              {/* Small Planes */}
              <path d="M 280 120 L 300 110 L 295 130 Z" fill="#F6B800" transform="rotate(-15, 290, 120)" />
              <path d="M 450 450 L 470 460 L 445 470 Z" fill="#F6B800" transform="rotate(30, 450, 460)" />
            </svg>

            {/* Step Bubbles */}
            <div className={styles.stepBubble} style={{ top: '15%', left: '45%' }}>
              <div className={styles.stepNum}>01</div>
              <div className={styles.stepText}>
                <h4>Pick your destination</h4>
                <p>Search 10,000+ destinations. See trending spots, seasonal highlights.</p>
              </div>
            </div>
            <div className={styles.stepBubble} style={{ top: '31%', left: '52%' }}>
              <div className={styles.stepNum}>02</div>
              <div className={styles.stepText}>
                <h4>Choose your travel style</h4>
                <p>Adventure, culture, or food tour? Tell us your vibe.</p>
              </div>
            </div>
            <div className={styles.stepBubble} style={{ top: '50%', left: '55%' }}>
              <div className={styles.stepNum}>03</div>
              <div className={styles.stepText}>
                <h4>Set duration & budget</h4>
                <p>Pick travel dates and a daily budget auto-calculated.</p>
              </div>
            </div>
            <div className={styles.stepBubble} style={{ top: '69%', left: '52%' }}>
              <div className={styles.stepNum}>04</div>
              <div className={styles.stepText}>
                <h4>Select attractions</h4>
                <p>Browse curated must-sees and hidden gems.</p>
              </div>
            </div>
            <div className={styles.stepBubble} style={{ top: '81%', left: '45%' }}>
              <div className={styles.stepNum}>05</div>
              <div className={styles.stepText}>
                <h4>Itinerary Complete!</h4>
                <p>Download your full plan maps and bookings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className={styles.tabsSection}>
        <p className={styles.tabsHint}>Switch between tabs - All three sections are interactive</p>
        
        <div className={styles.tabsContainer}>
          <div className={styles.tabsHeader}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'itinerary' ? styles.active : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              <span>📅 Itinerary</span>
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'map' ? styles.active : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <span>🗺️ Live Map</span>
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'support' ? styles.active : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <span>🎧 Support</span>
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'itinerary' && (
              <div className={styles.itineraryDemo}>
                <div className={styles.iItem}>
                  <div className={styles.iTime}>08</div>
                  <div className={styles.iDetails}>
                    <span className={styles.iLabel}>MORNING ARRIVAL</span>
                    <div className={styles.iHeader}>
                      <h3>Tokyo Narita Express</h3>
                      <span className={styles.iPrice}>$32.00</span>
                    </div>
                    <p className={styles.iDesc}>
                      Direct transfer to Shinjuku. Our concierge has pre-booked your green car seats for maximum comfort.
                    </p>
                    <div className={styles.iTags}>
                      <span className={styles.tag}>TRANSPORT</span>
                      <span className={styles.tag}>PRE-PAID</span>
                    </div>
                  </div>
                </div>

                <div className={styles.iItem}>
                  <div className={styles.iTime}>13</div>
                  <div className={styles.iDetails}>
                    <span className={styles.iLabel}>LUNCH ENGAGEMENT</span>
                    <div className={styles.iHeader}>
                      <h3>Kozue, Park Hyatt</h3>
                      <span className={styles.iPrice}>$120.00</span>
                    </div>
                    <p className={styles.iDesc}>
                      Contemporary Japanese dining with views across the Tokyo skyline. Window table confirmed.
                    </p>
                    <img src="/images/how_food.png" alt="Food" className={styles.iImage} />
                  </div>
                </div>

                <div className={styles.aiSuggestion}>
                  <div className={styles.aiIcon}>💡</div>
                  <div>
                    <strong>AI Suggestion</strong>
                    <p>Based on current weather, we recommend visiting the Gyoen Garden at 4:00 PM for optimal lighting.</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'map' && <div className={styles.placeholder}>Live Map Visualization</div>}
            {activeTab === 'support' && <div className={styles.placeholder}>24/7 Concierge Support</div>}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
