'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import styles from './explore.module.css'

interface ExploreSettings {
  hero_tagline: string
  hero_title: string
  quote_text: string
  quote_author: string
  hero_bg_image: string
}

interface GuideItem {
  id: string
  title: string
  desc: string
  image: string
  tag: string
}

const REGIONS = [
  {
    name: 'Europe',
    countries: ['France', 'Italy', 'Greece', 'Iceland', 'Spain', 'Switzerland']
  },
  {
    name: 'The Americas',
    countries: ['Canada', 'Mexico', 'Peru', 'United States', 'Brazil', 'Argentina']
  },
  {
    name: 'Asia Pacific',
    countries: ['Japan', 'Vietnam', 'Australia', 'New Zealand', 'Thailand', 'Indonesia']
  },
  {
    name: 'Africa & Middle East',
    countries: ['Morocco', 'South Africa', 'Kenya', 'Egypt', 'Jordan', 'UAE']
  }
]

export default function CountryGuide() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const [settings, setSettings] = useState<ExploreSettings>({
    hero_tagline: 'Explore the Unseen',
    hero_title: 'Where will your curiosity lead you next?',
    quote_text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
    quote_author: 'MARCEL PROUST',
    hero_bg_image: '/images/guide_hero.png'
  })

  const [featuredGuides, setFeaturedGuides] = useState<GuideItem[]>([
    { id: 'japan', title: 'Japan: The Art of Zen & Modernity', desc: 'From the neon lifelines of Shinjuku to the silent moss gardens of Kyoto, discover the duality of the rising sun.', image: '/images/guide_japan.png', tag: 'Culture' },
    { id: 'italy', title: 'Italy: A Summer in Tuscany', desc: 'The ultimate guide to the rolling hills, hidden vineyards, and the slow life of the Italian countryside.', image: '/images/guide_italy.png', tag: 'Editorial' },
    { id: 'morocco', title: 'Morocco: Colors of the Maghreb', desc: 'Exploring the vibrant souks of Marrakesh and the blue-washed walls of Chefchaouen.', image: '/images/guide_morocco.png', tag: 'Lifestyle' },
    { id: 'france', title: 'France: Beyond the City of Light', desc: 'Journeying through the lavender fields of Provence and the rugged coastline of Brittany.', image: '/images/guide_france.png', tag: 'Vintage' }
  ])

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/explore-data')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) setSettings(data.settings)
          if (data.guides && data.guides.length > 0) setFeaturedGuides(data.guides)
        }
      } catch (err) {
        console.error('Error fetching explore overview data:', err)
      }
    }
    loadData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/trip-map?query=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className={styles.container}>
      <SiteHeader />

      {/* Hero Section */}
      <section 
        className={styles.hero} 
        style={{ backgroundImage: `url("${settings.hero_bg_image || '/images/guide_hero.png'}")` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroTagline}>{settings.hero_tagline}</span>
          <h1 className={styles.heroTitle}>{settings.hero_title}</h1>
          
          <form className={styles.searchWrapper} onSubmit={handleSearch}>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Search destinations, experiences, or stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Featured Guides Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Featured Editorial Guides</h2>
            <p className={styles.sectionDesc}>In-depth narratives and curated selections from our global contributors.</p>
          </div>
          <Link href="/blog" className={styles.viewAll}>View All Stories</Link>
        </div>

        <div className={styles.editorialGrid}>
          {featuredGuides.map((guide) => (
            <Link key={guide.id} href={`/country/${guide.id}`} className={styles.guideCard}>
              <div className={styles.cardImageWrapper}>
                <img src={guide.image} alt={guide.title} className={styles.cardImage} />
                <span className={styles.cardTag}>{guide.tag}</span>
              </div>
              <h3 className={styles.cardTitle}>{guide.title}</h3>
              <p className={styles.cardDesc}>{guide.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className={styles.quoteSection}>
        <span className={styles.quoteMark}>“</span>
        <p className={styles.quoteText}>
          {settings.quote_text}
        </p>
        <span className={styles.quoteAuthor}>— {settings.quote_author.toUpperCase()}</span>
      </section>

      {/* Regions Section */}
      <section className={styles.regionsSection}>
        <div className={styles.regionsHeader}>
          <h2 className={styles.sectionTitle}>Browse by Region</h2>
        </div>
        
        <div className={styles.regionsGrid}>
          {REGIONS.map((region) => (
            <div key={region.name}>
              <span className={styles.regionTitle}>{region.name}</span>
              <ul className={styles.regionList}>
                {region.countries.map((country) => (
                  <li key={country} className={styles.regionItem}>
                    <Link href={`/country/${encodeURIComponent(country.toLowerCase())}`} className={styles.regionLink}>
                      {country}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <div className={styles.newsletterInfo}>
            <h2 className={styles.newsletterTitle}>The Weekly Dispatch</h2>
            <p className={styles.newsletterDesc}>
              Curated travel inspiration, exclusive guides, and cultural insights delivered directly to your inbox.
            </p>
          </div>
          <div className={styles.newsletterForm}>
            <div className={styles.newsletterInputWrapper}>
              <input type="email" placeholder="Your email address" className={styles.newsletterInput} />
            </div>
            <button className={styles.newsletterSubmit}>Subscribe</button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

