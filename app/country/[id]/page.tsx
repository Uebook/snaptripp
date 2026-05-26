'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import styles from '../country.module.css'

interface CardItem {
  title: string
  desc: string
  icon_name: string
}

interface ConnectivityItem {
  title: string
  desc: string
}

interface EtiquetteItem {
  title: string
  desc: string
}

interface CityItem {
  name: string
  desc: string
  img: string
}

interface CountryData {
  name: string
  desc: string
  heroImg: string
  stats: {
    capital: string
    currency: string
    language: string
    timeZone: string
    bestTime: string
  }
  cards: CardItem[]
  emergency: {
    police: string
    ambulance: string
    embassy: string
  }
  connectivity: ConnectivityItem[]
  etiquette: EtiquetteItem[]
  experience: {
    title: string
    desc: string
    img: string
  }
  cities: CityItem[]
}

const FALLBACK_GUIDES: Record<string, CountryData> = {
  japan: {
    name: 'Japan',
    desc: 'A harmonious blend of ancient traditions and futuristic innovation. From the neon-lit streets of Tokyo to the tranquil temples of Kyoto, Japan offers a sensory journey unlike any other.',
    heroImg: '/images/explore_japan.png',
    stats: { capital: 'Tokyo', currency: 'Yen (¥)', language: 'Japanese', timeZone: 'GMT+9', bestTime: 'Mar - May' },
    cards: [
      { icon_name: 'about', title: 'About', desc: 'An archipelago of over 6,000 islands, Japan\'s topography ranges from snow-capped peaks to tropical beaches, defined by deep spiritual roots.' },
      { icon_name: 'snapshot', title: 'Travel Snapshot', desc: 'Efficiency meets elegance. Navigate with ease using the Shinkansen, indulge in world-class culinary delights, and find peace in Zen gardens.' },
      { icon_name: 'clock', title: 'Best Time to Visit', desc: 'Spring for Sakura blossoms and Autumn for fiery maple leaves are peak seasons. Winter offers world-class skiing in Hokkaido.' }
    ],
    emergency: { police: '110', ambulance: '119', embassy: 'Contact your local embassy or consulate for specific assistance.' },
    connectivity: [
      { title: 'SIM Cards', desc: 'Purchase data SIM cards or rent pocket Wi-Fi at airports.' },
      { title: 'Transportation', desc: 'Use Japan Rail (JR) Pass for intercity travel and Suica/Pasmo for local transit.' }
    ],
    etiquette: [
      { title: 'Greetings', desc: 'Bowing is the customary greeting. Handshakes are also common in business.' },
      { title: 'Footwear', desc: 'Take off your shoes when entering homes, ryokans, and some traditional restaurants.' },
      { title: 'Tipping', desc: 'Do not tip in restaurants or taxis; excellent service is standard.' }
    ],
    experience: { title: 'Traditional Tea Ceremony', desc: 'Experience the mindful preparation of matcha and the profound hospitality of Japanese culture.', img: '/images/explore_japan.png' },
    cities: [
      { name: 'Tokyo', desc: 'Vibrant metropolis blending neon lights and historic shrines.', img: '/images/hero_city.png' },
      { name: 'Kyoto', desc: 'Cultural heart with thousands of classical Buddhist temples.', img: '/images/coastal_beach.png' },
      { name: 'Osaka', desc: 'A dynamic port city known for modern architecture and hearty street food.', img: '/images/marrakech.png' }
    ]
  },
  italy: {
    name: 'Italy',
    desc: 'The ultimate guide to the rolling hills, hidden vineyards, and the slow life of the Italian countryside.',
    heroImg: '/images/guide_italy.png',
    stats: { capital: 'Rome', currency: 'Euro (€)', language: 'Italian', timeZone: 'GMT+1', bestTime: 'Apr - Jun' },
    cards: [
      { icon_name: 'about', title: 'About', desc: 'Rich history, majestic architecture, and culinary brilliance define the cradle of the Renaissance.' },
      { icon_name: 'snapshot', title: 'Travel Snapshot', desc: 'Savor world-class pasta, navigate romantic canal towns, and enjoy relaxed evening strolls.' },
      { icon_name: 'clock', title: 'Best Time to Visit', desc: 'Spring and Autumn are the best seasons for scenic country touring with mild weather.' }
    ],
    emergency: { police: '113', ambulance: '118', embassy: 'Contact your local embassy or consulate for specific assistance.' },
    connectivity: [],
    etiquette: [],
    experience: { title: 'Tuscan Wine Tasting', desc: 'Indulge in authentic winemaking tours and tasting inside historic medieval cellars.', img: '/images/guide_italy.png' },
    cities: []
  }
}

export default function CountryPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const countryId = id?.toLowerCase() || 'japan'

  // Load fallback values for initial render to prevent layout flashes
  const initialData = FALLBACK_GUIDES[countryId] || {
    name: id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Destination',
    desc: `Explore travel snapshots, stats, top cities, and dynamic tips for ${id || 'this destination'}.`,
    heroImg: '/images/guide_hero.png',
    stats: { capital: 'N/A', currency: 'N/A', language: 'N/A', timeZone: 'N/A', bestTime: 'N/A' },
    cards: [],
    emergency: { police: '112', ambulance: '112', embassy: 'Contact your local embassy.' },
    connectivity: [],
    etiquette: [],
    experience: { title: 'Sightseeing', desc: 'Discover unique historic highlights and tours.', img: '/images/guide_hero.png' },
    cities: []
  }

  const [data, setData] = useState<CountryData>(initialData)

  useEffect(() => {
    async function loadCountryData() {
      try {
        const res = await fetch(`/api/country-guide-data?id=${countryId}`)
        if (res.ok) {
          const resData = await res.json()
          setData(resData)
        }
      } catch (err) {
        console.error('Error loading country data:', err)
      }
    }
    loadCountryData()
  }, [countryId])

  const renderCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'snapshot':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="8" width="18" height="12" rx="2" ry="2"/>
            <path d="M7 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
            <circle cx="12" cy="14" r="3"/>
          </svg>
        )
      case 'clock':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        )
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        )
    }
  }

  return (
    <div className={styles.container}>
      <SiteHeader />
      
      <div className={styles.pageLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>COUNTRY GUIDE</h3>
            <p>THE CURATED JOURNEY</p>
          </div>
          <nav className={styles.sidebarNav}>
            <a href="#overview" className={styles.active}>OVERVIEW</a>
            <a href="#requirements">REQUIREMENTS</a>
            <a href="#safety">SAFETY</a>
            <a href="#culture">CULTURE</a>
            <a href="#logistics">LOGISTICS</a>
            <a href="#places">PLACES</a>
          </nav>
          <button className={styles.downloadBtn}>DOWNLOAD PDF</button>
        </aside>

        {/* Right Main Content */}
        <main className={styles.mainContent}>
          {/* Hero Image */}
          <div className={styles.heroImg} style={{ backgroundImage: `url(${data.heroImg})` }}></div>

          {/* Title & Save Row */}
          <div className={styles.titleRow}>
            <div className={styles.titleInfo}>
              <h1>{data.name}</h1>
              <p>{data.desc}</p>
            </div>
            <button className={styles.saveBtn}>SAVE FOR TRIP</button>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span>CAPITAL</span>
              <strong>{data.stats.capital}</strong>
            </div>
            <div className={styles.statItem}>
              <span>CURRENCY</span>
              <strong>{data.stats.currency}</strong>
            </div>
            <div className={styles.statItem}>
              <span>LANGUAGE</span>
              <strong>{data.stats.language}</strong>
            </div>
            <div className={styles.statItem}>
              <span>TIME ZONE</span>
              <strong>{data.stats.timeZone}</strong>
            </div>
            <div className={styles.statItem}>
              <span>BEST TIME</span>
              <strong>{data.stats.bestTime}</strong>
            </div>
          </div>

          {/* Info Cards */}
          {data.cards.length > 0 && (
            <div className={styles.cardsRow}>
              {data.cards.map((card, idx) => (
                <div key={idx} className={styles.infoCard}>
                  <div className={styles.cardIcon}>{renderCardIcon(card.icon_name)}</div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          )}

          <div className={styles.contentDivider} />

          {/* Good To Know Section */}
          <section id="requirements" className={styles.section}>
            <p className={styles.sectionLabel}>GOOD TO KNOW</p>
            <div className={styles.goodToKnowLayout}>
              <div className={styles.accordions}>
                <div className={styles.accordion}>
                  <span>Currency</span>
                  <span className={styles.arrow}>›</span>
                </div>
                <div className={styles.accordion}>
                  <span>Safety & Security</span>
                  <span className={styles.arrow}>›</span>
                </div>
                <div className={styles.accordion}>
                  <span>Local Etiquette</span>
                  <span className={styles.arrow}>›</span>
                </div>
              </div>
              <div className={styles.darkBox}>
                <div className={styles.darkColumn}>
                  <h4>EMERGENCY INFO</h4>
                  <p>Police: {data.emergency.police}</p>
                  <p>Ambulance/Fire: {data.emergency.ambulance}</p>
                  <p>Emergency Line: 112</p>
                </div>
                <div className={styles.darkColumn}>
                  <h4>EMBASSY INFO</h4>
                  <p>{data.emergency.embassy}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Info Grid (Connectivity & Etiquette) */}
          <div id="logistics" className={styles.twoColGrid}>
            <div className={styles.infoCol}>
              <h3 className={styles.colTitle}>Transportation & Connectivity</h3>
              <div className={styles.colItems}>
                {data.connectivity.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Transportation tips pending.</p>
                ) : (
                  data.connectivity.map((item, i) => (
                    <div key={i} className={styles.colItem}>
                      <div className={styles.colDot}></div>
                      <div>
                        <h5>{item.title}</h5>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div id="culture" className={styles.infoCol}>
              <h3 className={styles.colTitle}>Local Etiquette</h3>
              <div className={styles.colItems}>
                {data.etiquette.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Etiquette tips pending.</p>
                ) : (
                  data.etiquette.map((item, i) => (
                    <div key={i} className={styles.colItem}>
                      <div className={styles.colDot}></div>
                      <div>
                        <h5>{item.title}</h5>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Traditional Experience */}
          <section className={styles.experienceSection}>
            <div className={styles.expImg} style={{ backgroundImage: `url(${data.experience.img})` }}></div>
            <div className={styles.expContent}>
              <p className={styles.expLabel}>TRADITIONAL EXPERIENCES</p>
              <h3>{data.experience.title}</h3>
              <p>{data.experience.desc}</p>
              <Link href="#" className={styles.readMore}>View Recommended Experiences →</Link>
            </div>
          </section>

          {/* Top Cities */}
          {data.cities.length > 0 && (
            <section id="places" className={styles.citiesSection}>
              <div className={styles.citiesHeader}>
                <p className={styles.sectionLabel}>TOP CITIES TO EXPLORE</p>
                <h2>Must Visit Cities</h2>
              </div>
              <div className={styles.citiesGrid}>
                {data.cities.map((city, i) => (
                  <div key={i} className={styles.cityCard}>
                    <div className={styles.cityImg} style={{ backgroundImage: `url(${city.img})` }}></div>
                    <h4>{city.name}</h4>
                    <p>{city.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}

