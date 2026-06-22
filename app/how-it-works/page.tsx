'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import styles from './how-it-works.module.css'

interface PageSettings {
  hero_badge: string
  hero_title: string
  hero_description: string
  hero_bg_image: string
  planning_title: string
  how_works_title: string
  how_works_desc: string
  demo_i_time_1: string
  demo_i_label_1: string
  demo_i_title_1: string
  demo_i_price_1: string
  demo_i_desc_1: string
  demo_i_tags_1: string
  demo_i_time_2: string
  demo_i_label_2: string
  demo_i_title_2: string
  demo_i_price_2: string
  demo_i_desc_2: string
  demo_i_img_2: string
  demo_i_ai_suggestion: string
  demo_map_placeholder: string
  demo_support_placeholder: string
}

interface StepItem {
  id: string
  type: string
  step_number: string
  title: string
  description: string
  display_order: number
}

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('itinerary')
  
  const [settings, setSettings] = useState<PageSettings>({
    hero_badge: '',
    hero_title: 'Crafting Your<br/><span style="font-style: italic; font-family: var(--font-inria)">Next Odyssey</span>',
    hero_description: 'A fusion of high-end editorial curation and artificial intelligence. SnapTrip transforms wandering into precision exploration.',
    hero_bg_image: '/images/Container.png',
    planning_title: 'The Art of Seamless Planning',
    how_works_title: 'How It Works',
    how_works_desc: 'Snaptrip guides you through every step of your travel planning — from discovering destinations to creating a personalized itinerary. With simple tools and smart suggestions, you can plan your perfect trip quickly and without stress.',
    demo_i_time_1: '08',
    demo_i_label_1: 'MORNING ARRIVAL',
    demo_i_title_1: 'Tokyo Narita Express',
    demo_i_price_1: '$32.00',
    demo_i_desc_1: 'Direct transfer to Shinjuku. Our concierge has pre-booked your green car seats for maximum comfort.',
    demo_i_tags_1: 'TRANSPORT, PRE-PAID',
    demo_i_time_2: '13',
    demo_i_label_2: 'LUNCH ENGAGEMENT',
    demo_i_title_2: 'Kozue, Park Hyatt',
    demo_i_price_2: '$120.00',
    demo_i_desc_2: 'Contemporary Japanese dining with views across the Tokyo skyline. Window table confirmed.',
    demo_i_img_2: '/images/how_food.png',
    demo_i_ai_suggestion: 'Based on current weather, we recommend visiting the Gyoen Garden at 4:00 PM for optimal lighting.',
    demo_map_placeholder: 'Live Map Visualization',
    demo_support_placeholder: '24/7 Concierge Support'
  })

  const [steps, setSteps] = useState<StepItem[]>([
    { id: 'p1', type: 'planning', step_number: '01', title: 'Discover Your Perfect Destination', description: 'Find destinations that match your travel style, interests, and preferences. Explore new places with personalized recommendations.', display_order: 0 },
    { id: 'p2', type: 'planning', step_number: '02', title: 'Flexible Itinerary Management', description: 'Easily add, remove, or rearrange activities and destinations throughout your journey.', display_order: 1 },
    { id: 'p3', type: 'planning', step_number: '03', title: 'Travel Smarter, Stress Less', description: 'Keep your plans organized in one place and make changes effortlessly as your trip evolves.', display_order: 2 },
    { id: 'h1', type: 'how', step_number: '01', title: 'Pick your destination', description: 'Search 10,000+ destinations. See trending spots, seasonal highlights, and visa requirements upfront - no surprises at checkout.', display_order: 0 },
    { id: 'h2', type: 'how', step_number: '02', title: 'Choose your travel style', description: 'Adventure, culture, relaxation, or food tour? Tell us your vibe and group size - solo, couple, family, or squad- and we tailor everything.', display_order: 1 },
    { id: 'h3', type: 'how', step_number: '03', title: 'Plan Your Schedule', description: 'Select the number of days for your trip and let SnapTrip create a balanced itinerary.', display_order: 2 },
    { id: 'h4', type: 'how', step_number: '04', title: 'Select attractions', description: 'Browse curated must-sees and hidden gems. Add or remove stops-the AI instantly recalculates your daily route to cut travel time.', display_order: 3 },
    { id: 'h5', type: 'how', step_number: '05', title: 'Itinerary Complete!', description: 'Download your full plan maps, bookings, emergency contacts, and cost summary. Works offline too-ready wherever you land.', display_order: 4 }
  ])

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/how-it-works-data', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.settings) setSettings(data.settings)
          if (data.steps && data.steps.length > 0) setSteps(data.steps)
        }
      } catch (err) {
        console.error('Error fetching how-it-works data:', err)
      }
    }
    loadData()
  }, [])

  const planningSteps = steps.filter(s => s.type === 'planning')
  const howSteps = steps.filter(s => s.type === 'how')

  return (
    <div className={styles.container}>
      <SiteHeader />

      <section className={styles.hero} style={{ backgroundImage: `url("${settings.hero_bg_image || '/images/how_hero.png'}")` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>

          <h1 
            className={styles.heroTitle}
            dangerouslySetInnerHTML={{ __html: settings.hero_title.replace('\n', '<br />') }}
          />
          <p className={styles.heroSub}>
            {settings.hero_description}
          </p>
          <div className={styles.heroButtons}>
            <Link href="/plan" className={styles.btnPrimary}>Start Your Journey</Link>
            <Link href="/explore" className={styles.btnSecondary}>Explore Countries</Link>
          </div>
        </div>
      </section>

      <section className={styles.planningSection}>
        <div className={styles.planningContent}>
          <div className={styles.planningText}>
            <h2 className={styles.sectionTitle}>{settings.planning_title}</h2>
            <div className={styles.planningSteps}>
              {planningSteps.map((step, idx) => (
                <div className={styles.pStep} key={step.id || idx}>
                  <span className={styles.pStepNum}>{step.step_number}</span>
                  <div>
                    <h3 className={styles.pStepTitle}>{step.title}</h3>
                    <p className={styles.pStepDesc}>{step.description}</p>
                  </div>
                </div>
              ))}
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

      <section className={styles.howSection}>
        <div className={styles.howBg} style={{ backgroundImage: 'url("/images/image11.png")' }} />
        <div className={styles.howHeader}>
          <h2 className={styles.howTitle}>{settings.how_works_title}</h2>
          <p className={styles.howDesc}>
            {settings.how_works_desc}
          </p>
        </div>

        <div className={styles.arcContainer}>
          <div className={styles.arcWrapper}>
            <svg viewBox="0 0 1000 700" className={styles.arcSvg}>
              {/* Thick yellow arc */}
              <path d="M 150 245 A 200 140 0 0 1 150 455" fill="none" stroke="#F6B800" strokeWidth="40" strokeLinecap="round" opacity="0.6" />
              <path d="M 150 245 A 200 140 0 0 1 150 455" fill="none" stroke="#F6B800" strokeWidth="20" strokeLinecap="round" />
              
              {/* Main dashed arc */}
              <path id="mainArc" d="M 250 105 Q 450 350 250 595" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="10 10" />
              
              {/* Connecting lines */}
              <line x1="301" y1="178" x2="430" y2="70" stroke="#333" strokeWidth="2" />
              <line x1="334" y1="252" x2="490" y2="210" stroke="#333" strokeWidth="2" />
              <line x1="350" y1="350" x2="530" y2="350" stroke="#333" strokeWidth="2" />
              <line x1="334" y1="448" x2="490" y2="490" stroke="#333" strokeWidth="2" />
              <line x1="301" y1="521" x2="430" y2="630" stroke="#333" strokeWidth="2" />
              
              {/* Black start/end dots */}
              <circle cx="250" cy="105" r="12" fill="#000" />
              <circle cx="250" cy="595" r="12" fill="#000" />

              {/* Yellow dots on the dashed arc */}
              <circle cx="301" cy="178" r="8" fill="#F6B800" stroke="#000" strokeWidth="2" />
              <circle cx="334" cy="252" r="8" fill="#F6B800" stroke="#000" strokeWidth="2" />
              <circle cx="350" cy="350" r="8" fill="#F6B800" stroke="#000" strokeWidth="2" />
              <circle cx="334" cy="448" r="8" fill="#F6B800" stroke="#000" strokeWidth="2" />
              <circle cx="301" cy="521" r="8" fill="#F6B800" stroke="#000" strokeWidth="2" />
              
              {/* Optional small decorative triangles */}
              <path d="M 270 140 L 290 133 L 285 147 Z" fill="#F6B800" transform="rotate(-15, 280, 140)" />
              <path d="M 320 420 L 340 427 L 315 434 Z" fill="#F6B800" transform="rotate(30, 320, 427)" />
            </svg>

            {howSteps[0] && (
              <div className={styles.stepBubble} style={{ top: '10%', left: '42%', background: '#F6B800' }}>
                <div className={styles.stepNum}>{howSteps[0].step_number}</div>
                <div className={styles.stepText}>
                  <h4>{howSteps[0].title}</h4>
                  <p>{howSteps[0].description}</p>
                </div>
              </div>
            )}
            {howSteps[1] && (
              <div className={styles.stepBubble} style={{ top: '30%', left: '48%', background: '#FDE68A' }}>
                <div className={styles.stepNum}>{howSteps[1].step_number}</div>
                <div className={styles.stepText}>
                  <h4>{howSteps[1].title}</h4>
                  <p>{howSteps[1].description}</p>
                </div>
              </div>
            )}
            {howSteps[2] && (
              <div className={styles.stepBubble} style={{ top: '50%', left: '52%', background: '#F6B800' }}>
                <div className={styles.stepNum}>{howSteps[2].step_number}</div>
                <div className={styles.stepText}>
                  <h4>{howSteps[2].title}</h4>
                  <p>{howSteps[2].description}</p>
                </div>
              </div>
            )}
            {howSteps[3] && (
              <div className={styles.stepBubble} style={{ top: '70%', left: '48%', background: '#FDE68A' }}>
                <div className={styles.stepNum}>{howSteps[3].step_number}</div>
                <div className={styles.stepText}>
                  <h4>{howSteps[3].title}</h4>
                  <p>{howSteps[3].description}</p>
                </div>
              </div>
            )}
            {howSteps[4] && (
              <div className={styles.stepBubble} style={{ top: '90%', left: '42%', background: '#F6B800' }}>
                <div className={styles.stepNum}>{howSteps[4].step_number}</div>
                <div className={styles.stepText}>
                  <h4>{howSteps[4].title}</h4>
                  <p>{howSteps[4].description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.tabsSection}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsHeader}>
            <button className={`${styles.tabBtn} ${activeTab === 'itinerary' ? styles.active : ''}`} onClick={() => setActiveTab('itinerary')}>
              <span className={styles.tabIcon}>📅</span> Itinerary
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'support' ? styles.activeSupport : ''}`} onClick={() => setActiveTab('support')}>
              <span className={styles.tabIcon}>🎧</span> Support
            </button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'itinerary' && (
              <div className={styles.phasesDemo}>

                {/* Phase One */}
                <div className={styles.phaseRow}>
                  <div className={styles.phaseCircle}>1</div>
                  <div className={styles.phaseContent}>
                    <div className={styles.phaseLabel}><span className={styles.phaseLabelIcon}>🗺️</span> PHASE ONE</div>
                    <h3 className={styles.phaseTitle}>Select a City: Map Discovery</h3>
                    <p className={styles.phaseDesc}>Begin your journey by exploring our global map interface. Pinpoint your next adventure using interactive markers that reveal real-time insights about cities worldwide, from bustling metropolises to hidden gems.</p>
                    <div className={styles.phaseTags}>
                      <span className={styles.phaseTag}>GLOBAL RADIUS</span>
                      <span className={styles.phaseTag}>INTERACTIVE MARKERS</span>
                    </div>
                  </div>
                </div>

                {/* Phase Two */}
                <div className={styles.phaseRow}>
                  <div className={styles.phaseCircle}>2</div>
                  <div className={styles.phaseContent}>
                    <div className={styles.phaseLabel}><span className={styles.phaseLabelIcon}>📍</span> PHASE TWO</div>
                    <h3 className={styles.phaseTitle}>Choose Attractions: Curated Landmarks</h3>
                    <p className={styles.phaseDesc}>Dive into a selection of curated landmarks and hidden gems. Our system analyzes millions of data points to suggest attractions tailored to your personal preferences. Add world-renowned sites or local secrets to your custom bucket list with a single click.</p>
                    <div className={styles.phaseCards}>
                      <div className={styles.phaseCard}>
                        <div className={styles.phaseCardIcon}>👍</div>
                        <div className={styles.phaseCardLabel}>Top Suggestions</div>
                      </div>
                      <div className={styles.phaseCard}>
                        <div className={styles.phaseCardIcon}>✅</div>
                        <div className={styles.phaseCardLabel}>Curated Landmarks</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase Three */}
                <div className={styles.phaseRow}>
                  <div className={styles.phaseCircle}>3</div>
                  <div className={styles.phaseContent}>
                    <div className={styles.phaseLabel}><span className={styles.phaseLabelIcon}>⚡</span> PHASE THREE</div>
                    <h3 className={styles.phaseTitle}>Finalize Itinerary: Optimization Engine</h3>
                    <p className={styles.phaseDesc}>Let our advanced optimization engine handle the logistics. The platform automatically calculates the most efficient travel routes, provides precise time-on-site estimates, and generates a comprehensive day-wise breakdown. Adjust your schedule in real-time as your travel needs evolve.</p>
                    <div className={styles.phaseAi}>
                      <span className={styles.phaseAiIcon}>🤖</span>
                      <div>
                        <strong>AI-Powered Route Optimization Active</strong>
                        <p>Intelligent scheduling engine processing your data.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
            {activeTab === 'support' && (
              <div className={styles.supportDemo}>
                <div className={styles.supportHeader}>
                  <div>
                    <h3 className={styles.supportTitle}>Safety Shield</h3>
                    <p className={styles.supportDesc}>
                      Intelligent assistance and local resources curated based on your current geographical context for total peace of mind.
                    </p>
                  </div>
                  <button className={styles.sosBtn}>
                    <span className={styles.asterisk}>✱</span> GLOBAL SOS
                  </button>
                </div>

                <div className={styles.zonesGrid}>
                  {/* Primary Zone */}
                  <div className={styles.zoneCard}>
                    <div className={styles.zoneHeader}>
                      <div className={styles.zoneInfo}>
                        <h4>Primary Zone</h4>
                        <div className={styles.zoneMeta}>
                          <span className={styles.metaBadge}>CURRENT LOCATION</span>
                          <span className={styles.metaTime}>14:30 | EN/HI</span>
                        </div>
                      </div>
                      <div className={styles.zoneIcon}>🏢</div>
                    </div>

                    <div className={styles.emergencyNumbers}>
                      <div className={styles.numberBox}>
                        <span className={styles.numberLabel}>AMBULANCE</span>
                        <span className={styles.numberValue}>911</span>
                      </div>
                      <div className={styles.numberBox}>
                        <span className={styles.numberLabel}>LOCAL POLICE</span>
                        <span className={styles.numberValue}>110</span>
                      </div>
                    </div>

                    <div className={styles.facilityInfo}>
                      <div className={styles.facilityTitle}>
                        <span className={styles.plusIcon}>🏥</span> Nearby Medical Care
                      </div>
                      <div className={styles.facilityDetails}>
                        <div className={styles.statusDot}></div>
                        <div>
                          <strong>Central General Hospital</strong>
                          <span>Emergency Dept | 24/7 Support</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transit Zone */}
                  <div className={styles.zoneCard}>
                    <div className={styles.zoneHeader}>
                      <div className={styles.zoneInfo}>
                        <h4>Transit Zone</h4>
                        <div className={styles.zoneMeta}>
                          <span className={`${styles.metaBadge} ${styles.transit}`}>NEXT DESTINATION</span>
                          <span className={styles.metaTime}>17:00 | EN/FR</span>
                        </div>
                      </div>
                      <div className={styles.zoneIcon}>🧭</div>
                    </div>

                    <div className={styles.emergencyNumbers}>
                      <div className={styles.numberBox}>
                        <span className={styles.numberLabel}>EMERGENCY</span>
                        <span className={styles.numberValue}>119</span>
                      </div>
                      <div className={styles.numberBox}>
                        <span className={styles.numberLabel}>SAFETY HUB</span>
                        <span className={styles.numberValue}>112</span>
                      </div>
                    </div>

                    <div className={styles.facilityInfo}>
                      <div className={styles.facilityTitle}>
                        <span className={styles.infoIcon}>ℹ️</span> Protocol & Guidance
                      </div>
                      <p className={styles.protocolText}>
                        Keep your digital emergency vault synced. Medical facilities here require insurance validation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
