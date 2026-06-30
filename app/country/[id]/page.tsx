'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import styles from '../country.module.css'

interface CountryData {
  name: string
  desc: string
  heroImg: string
  stats: { capital: string; currency: string; language: string; timeZone: string; bestTime: string }
  countryIntro: string
  bestTimeDesc: string
  publicHolidays: string
  bucketList: string[]
  uniqueAccommodation: string
  overviewImg?: string
  visaEntry: string
  passportDocs: string
  customs: string
  healthRequirements: string
  travelInsurance: string
  entryImg?: string
  safetyRisk: string
  emergencyNumbers: { police: string; ambulance: string; fire: string }
  healthMedical: string
  commonScams: string
  naturalHazards: string
  lgbtqSafety: string
  soloTips: string
  safetyImg?: string
  localEtiquette: { title: string; desc: string }[]
  religion: string
  photographyRules: string
  tipping: string
  languageBasics: string
  socialNorms: string
  festivals: string
  cultureImg?: string
  currencyPayments: string
  localTransport: string
  drivingRules: string
  simConnectivity: string
  vpnInternet: string
  electricityPlugs: string
  essentialApps: string
  logisticsImg?: string
  mustTryFood: string
  alcoholLaws: string
  smokingRules: string
  shopping: string
  souvenirs: string
  environmental: string
  localLaws: string
  experiencesImg?: string
  experienceTitle: string
  experienceDesc: string
  experienceImg: string
  cities: { name: string; desc: string; img: string }[]
}

const FALLBACK: Record<string, CountryData> = {
  japan: {
    name: 'Japan',
    desc: 'A harmonious blend of ancient traditions and futuristic innovation. From the neon-lit streets of Tokyo to the tranquil temples of Kyoto, Japan offers a sensory journey unlike any other.',
    heroImg: '/images/explore_japan.webp',
    stats: { capital: 'Tokyo', currency: 'Yen (¥)', language: 'Japanese', timeZone: 'GMT+9', bestTime: 'Mar – May' },
    countryIntro: 'An archipelago of over 6,000 islands stretching from subarctic Hokkaido to subtropical Okinawa, Japan is defined by volcanic mountains, hot springs, and millennia of rich cultural heritage.',
    bestTimeDesc: 'Spring (March–May) for cherry blossoms and autumn (Sept–Nov) for vibrant foliage are peak seasons. Winter brings world-class skiing in Hokkaido; summer offers lively matsuri festivals.',
    publicHolidays: 'Japan observes 16 public holidays including Golden Week (late April–early May) and Obon (mid-August). Many businesses close and transport fills up quickly — plan ahead.',
    bucketList: ['See cherry blossoms in Ueno Park', 'Climb Mt. Fuji at sunrise', 'Stay in a traditional ryokan', 'Attend a sumo tournament', 'Experience teamLab digital art'],
    uniqueAccommodation: 'Sleep in a capsule hotel in Akihabara, a historic machiya townhouse in Kyoto, or an onsen ryokan in Hakone for an authentic Japanese hospitality experience.',
    overviewImg: '/images/explore_japan.webp',
    visaEntry: 'Citizens of 68 countries can enter Japan visa-free for 15–90 days. Others must apply for a tourist visa through a Japanese consulate.',
    passportDocs: 'Passport must be valid for the duration of your stay. Border control may request proof of onward travel and sufficient funds (approx ¥100,000–¥200,000).',
    customs: 'Duty-free allowance: 3 bottles of alcohol (760ml each), 400 cigarettes, and ¥200,000 in goods. Some medications and items are strictly prohibited.',
    healthRequirements: 'No vaccinations are required. Hepatitis A & B, Typhoid, and Japanese Encephalitis (rural areas) are recommended. Travel health insurance is strongly advised.',
    travelInsurance: 'Japan has no reciprocal healthcare agreements with most countries. Medical costs are high — comprehensive insurance covering evacuation is essential.',
    safetyRisk: 'Japan is one of the safest countries for tourists. Overall risk level is Low. Petty crime is rare; violent crime against tourists is extremely uncommon.',
    emergencyNumbers: { police: '110', ambulance: '119', fire: '119' },
    healthMedical: 'Major cities have excellent hospitals with English-speaking staff. International clinics are available in Tokyo. Pharmacies (薬局) are widely available.',
    commonScams: 'Be wary of overfriendly strangers near tourist spots in Kabukicho who may invite you to a bar (hostess bar scam). Use only metered taxis.',
    naturalHazards: 'Japan sits on the Ring of Fire. Earthquakes are frequent — know your hotel\'s evacuation procedure. Typhoon season runs June–October.',
    lgbtqSafety: 'Generally safe for LGBTQ+ travellers. Same-sex relationships are legal. Tokyo and Osaka are particularly welcoming with vibrant LGBTQ+ communities.',
    soloTips: 'Excellent for solo travellers, especially women. Public transport is safe 24/7. Avoid excessive eye contact in crowded trains. Trust your instincts.',
    safetyImg: '/images/hero_city.webp',
    localEtiquette: [
      { title: 'Greetings', desc: 'Bow when greeting — a slight bow for casual meetings, a deeper one for formal situations. Handshakes are acceptable with foreigners.' },
      { title: 'Footwear', desc: 'Remove shoes when entering homes, ryokans, many traditional restaurants, and some historic temples.' },
      { title: 'Tipping', desc: 'Do not tip in Japan. It can be considered rude. Excellent service is simply the standard.' },
      { title: 'Noise', desc: 'Keep voices low on public transport — phone calls are frowned upon on trains. Queuing is taken seriously.' },
    ],
    religion: 'Remove hats and speak quietly at Shinto shrines and Buddhist temples. Some inner sanctuaries prohibit photography. Purify hands at the temizuya before entering.',
    photographyRules: 'Fine at outdoor shrines, parks, and streets. Many museums, some temples, and theatrical performances prohibit cameras.',
    tipping: 'Tipping is not part of Japanese culture and is actively discouraged. Express gratitude verbally with "Arigatou gozaimasu."',
    languageBasics: 'Konnichiwa (Hello), Arigatou (Thank you), Sumimasen (Excuse me), Eigo hanasemasu ka? (Do you speak English?)',
    socialNorms: 'Eating while walking is frowned upon. Tattoos may restrict access to some onsen. Masks are commonly worn in public.',
    festivals: 'Hanami (March–April), Gion Matsuri in Kyoto (July), Awa Odori dance festival (August), Sapporo Snow Festival (February).',
    cultureImg: '/images/coastal_beach.webp',
    currencyPayments: 'Japan is still largely cash-based. Carry yen — many smaller restaurants, vending machines, and shrines don\'t accept cards. 7-Eleven ATMs accept foreign cards.',
    localTransport: 'Shinkansen bullet trains connect major cities. IC cards (Suica, ICOCA) work on most local trains and buses. Use Google Maps for navigation.',
    drivingRules: 'Drive on the left. Foreign licences need official Japanese translation from your Automobile Association. IDP alone is not valid.',
    simConnectivity: 'Buy a data SIM at the airport (IIJmio, NTT Docomo). eSIM options from Airalo work well. Most cafés and train stations offer free Wi-Fi.',
    vpnInternet: 'Japan has minimal internet restrictions. No major sites are blocked. A VPN is not required but useful for accessing home content.',
    electricityPlugs: '100V AC, 50/60Hz. Type A plugs (two flat pins). Bring a Type A adaptor if from Europe or Australia.',
    essentialApps: 'Google Maps (transit), Google Translate (camera mode), Suica app, Hyperdia (train times), LINE (messaging), Tabelog (restaurants).',
    mustTryFood: 'Ramen, sushi, tempura, takoyaki (Osaka), wagyu beef, kaiseki tasting menus, matcha desserts. Don\'t miss conveyor belt sushi (kaiten-zushi).',
    alcoholLaws: 'Legal drinking age is 20. Alcohol is sold 24/7 in convenience stores and vending machines. Public drinking is generally accepted during festivals.',
    smokingRules: 'Smoking in public outdoor spaces is prohibited in most city centres. Designated smoking rooms exist in many buildings.',
    shopping: 'Fixed prices in most stores — bargaining not expected. Tax-free shopping available for tourists on purchases over ¥5,000; bring your passport.',
    souvenirs: 'Matcha treats, wagashi, lacquerware, kokeshi dolls, tenugui towels, sake. Do NOT export antiques without a cultural property certificate.',
    environmental: 'Strict recycling rules — separate rubbish into burnable, non-burnable, and recyclable. Plastic bag charges apply at most shops.',
    localLaws: 'Drugs: Zero tolerance. Even small amounts of cannabis can result in detention and deportation. Some prescription medicines legal abroad may be illegal in Japan.',
    experiencesImg: '/images/marrakech.webp',
    experienceTitle: 'Traditional Tea Ceremony',
    experienceDesc: 'Experience the mindful preparation of matcha and the profound hospitality of Japanese culture. Participate in a centuries-old ritual that emphasises harmony, respect, purity, and tranquility.',
    experienceImg: '/images/explore_japan.webp',
    cities: [
      { name: 'Tokyo', desc: 'Vibrant metropolis blending neon lights, historic shrines, and world-class cuisine.', img: '/images/hero_city.webp' },
      { name: 'Kyoto', desc: 'Cultural heart of Japan with thousands of classical Buddhist temples and tea houses.', img: '/images/coastal_beach.webp' },
      { name: 'Osaka', desc: 'Dynamic port city known for bold architecture, nightlife, and legendary street food.', img: '/images/marrakech.webp' },
    ]
  },
  italy: {
    name: 'Italy',
    desc: 'The ultimate guide to rolling hills, hidden vineyards, and the slow life of the Italian countryside.',
    heroImg: '/images/guide_italy.webp',
    stats: { capital: 'Rome', currency: 'Euro (€)', language: 'Italian', timeZone: 'GMT+1', bestTime: 'Apr – Jun' },
    countryIntro: 'A boot-shaped peninsula in southern Europe, Italy is a cradle of Western civilisation — home to the Roman Empire, the Renaissance, and unmatched art, food, and fashion.',
    bestTimeDesc: 'Spring (April–June) and autumn (September–October) offer the best weather and smaller crowds. July–August is peak season. Winter is ideal for city breaks and Alps skiing.',
    publicHolidays: 'Italy observes 12 national public holidays including Ferragosto (August 15) when much of the country shuts down.',
    bucketList: ['See the Colosseum at sunrise', 'Cruise the Amalfi Coast', 'Attend opera at La Scala', 'Truffle hunting in Umbria', 'Carnival in Venice'],
    uniqueAccommodation: 'Stay in an agriturismo (farm stay), a restored masseria in Puglia, a cave hotel in Matera, or a villa in Tuscany.',
    overviewImg: '/images/guide_italy.webp',
    visaEntry: 'EU citizens can enter freely. Non-EU travellers from US, UK, Canada, Australia can stay up to 90 days without a visa (Schengen area).',
    passportDocs: 'Passport must be valid for at least 3 months beyond your intended stay. Carry a physical copy when sightseeing.',
    customs: 'Duty-free: 200 cigarettes, 1 litre spirits, 4 litres wine, €430 in goods. Some food items restricted from non-EU countries.',
    healthRequirements: 'No mandatory vaccinations. EHIC/GHIC cards cover EU/UK residents. Travel health insurance strongly recommended for all others.',
    travelInsurance: 'Comprehensive travel insurance with medical cover and cancellation is strongly recommended, especially during peak seasons.',
    safetyRisk: 'Italy is generally safe for tourists. Low violent crime risk but high pickpocket risk in major tourist areas (Rome Termini, Florence Duomo, Naples).',
    emergencyNumbers: { police: '113', ambulance: '118', fire: '115' },
    healthMedical: 'Public hospitals (ospedale) accessible to all. Private clinics are faster and English-friendly. Pharmacies (farmacia) excellent for minor ailments.',
    commonScams: 'Watch for friendship bracelet scam, fake petitions, overcharging at tourist cafés, and unofficial taxi drivers.',
    naturalHazards: 'Volcanic activity near Naples and Sicily. Earthquake risk in central and southern Italy. Check INGV alerts when in high-risk zones.',
    lgbtqSafety: 'Italy is generally welcoming. Same-sex civil unions are legal. Rome and Milan have visible LGBTQ+ scenes. Southern Italy may be more conservative.',
    soloTips: 'Solo female travel is common and safe. Be cautious of over-friendly strangers. Trust your instincts. Dress modestly when visiting churches.',
    localEtiquette: [
      { title: 'Greetings', desc: 'A firm handshake and eye contact are standard. Close friends exchange kisses on both cheeks. Use "Lei" (formal you) with strangers.' },
      { title: 'Dining', desc: 'Italians are serious about food. Don\'t ask for ketchup with pasta. Cappuccino is a morning drink only.' },
      { title: 'Dress Code', desc: 'Shoulders and knees must be covered to enter churches. Beachwear is only for the beach — fines apply in Venice.' },
      { title: 'Punctuality', desc: '"Italian time" is flexible socially but not for trains or official appointments.' },
    ],
    religion: 'Vatican City has strict dress codes. Both shoulders and knees must be covered. No shorts, sleeveless tops, or miniskirts.',
    photographyRules: 'Photography allowed in most public spaces. Many museums (Vatican, Uffizi) prohibit flash. Some churches charge a photography fee.',
    tipping: 'Not obligatory but appreciated. Leave 5–10% at restaurants if service was good. Round up taxi fares.',
    languageBasics: 'Grazie (Thank you), Per favore (Please), Dov\'è...? (Where is...?), Quanto costa? (How much?), Parla inglese? (Do you speak English?)',
    socialNorms: 'Never place your bag on the floor at restaurants — considered bad luck. Sunday is family day; many shops close.',
    festivals: 'Venice Carnival (February), Palio di Siena (July & August), Roma Natale di Roma (April), Alba Truffle Fair (October).',
    cultureImg: '/images/guide_italy.webp',
    currencyPayments: 'Euro. Cards widely accepted in cities; carry cash for small towns and markets. Airport exchange rates are poor — use ATMs in the city.',
    localTransport: 'Trenitalia and Italo high-speed trains connect major cities. Taxis must be officially licensed (white cars). Avoid unlicensed "abusivi" drivers.',
    drivingRules: 'Drive on the right. IDP recommended for non-EU licence holders. ZTL zones in historic city centres — check before driving; fines are automatic.',
    simConnectivity: 'Wind Tre, Vodafone IT, and TIM offer good coverage. eSIM support through Airalo. Free Wi-Fi at most hotels and cafés.',
    vpnInternet: 'No significant internet restrictions. A VPN may help access home streaming services. Public Wi-Fi often requires registration.',
    electricityPlugs: '230V AC, 50Hz. Type F (Schuko) and Type L plugs. Bring a Type F adaptor. US devices may need a voltage converter.',
    essentialApps: 'Google Maps, Trenitalia app, Moovit (local transit), TheFork (restaurant bookings), Duolingo (Italian basics).',
    mustTryFood: 'Cacio e pepe (Rome), ribollita (Tuscany), arancini (Sicily), pesto genovese (Liguria), ossobuco (Milan), tiramisu, and proper gelato.',
    alcoholLaws: 'Legal drinking age is 18. Some cities (Venice, Florence) have banned drinking from glass bottles in public areas.',
    smokingRules: 'Smoking banned in all indoor public places and on public transport. Outdoor restaurant terraces may permit smoking.',
    shopping: 'Florence for leather goods. Milan for high fashion. Bargaining only at open markets. Ask for "scontrino" (receipt) — legally required.',
    souvenirs: 'Limoncello, Murano glass, Florentine leather, hand-painted ceramics, truffle products, local wine and olive oil.',
    environmental: 'Italy is EU-compliant on environmental regulations. Plastic bags charged at shops. Recycling is colour-coded by municipality.',
    localLaws: 'Fines for eating/drinking near monuments. No sitting on church steps in Florence. Cannabis: decriminalised for personal use but technically illegal.',
    experiencesImg: '/images/guide_italy.webp',
    experienceTitle: 'Tuscan Wine Tasting',
    experienceDesc: 'Indulge in an authentic winemaking tour through rolling Chianti hills and medieval cellars. Discover Brunello, Barolo, and Super Tuscans directly from the estates.',
    experienceImg: '/images/guide_italy.webp',
    cities: [
      { name: 'Rome', desc: 'Eternal city of ancient ruins, baroque fountains, Vatican art, and world-class pizza al taglio.', img: '/images/guide_italy.webp' },
      { name: 'Florence', desc: 'Birthplace of the Renaissance — home to Michelangelo\'s David, the Uffizi, and world-class Florentine cuisine.', img: '/images/how_london.webp' },
      { name: 'Venice', desc: 'Built on 118 islands — a labyrinth of canals, gondolas, and palatial architecture unlike anywhere on earth.', img: '/images/coastal_beach.webp' },
    ]
  }
}

// ── Reusable Components ─────────────────────────────────
function Accordion({ title, children, initialOpen = false }: { title: string; children: React.ReactNode; initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  return (
    <div style={{ background: '#fff', marginBottom: '16px', border: '1px solid #EBEBEB', borderRadius: '4px' }}>
      <div className={styles.accordion} onClick={() => setIsOpen(!isOpen)} style={{ borderBottom: isOpen ? '1px solid #F5F5F5' : 'none' }}>
        {title}
        <span className={styles.arrow}>{isOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        )}</span>
      </div>
      {isOpen && <div style={{padding: '18px 22px', color: '#555', fontSize: '0.87rem', lineHeight: 1.6}}>{children}</div>}
    </div>
  )
}

function SectionWrapper({ id, label, title, subtitle, children, bg = '#fff' }: { id: string; label?: string; title?: string; subtitle?: string; children: React.ReactNode; bg?: string }) {
  return (
    <div id={id} style={{ background: bg, padding: '60px 0' }}>
      {(label || title) && (
        <div style={{ padding: '0 64px', marginBottom: '36px', textAlign: 'center' }}>
          {label && <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.22em', color: '#666', margin: '0 0 10px', textTransform: 'uppercase' }}>{label}</p>}
          {title && <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>{title}</h2>}
          {subtitle && <p className={styles.sectionSubtitle} style={{ textAlign: 'center', marginBottom: 0 }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default function CountryPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const countryId = id?.toLowerCase() || 'japan'

  const initial = FALLBACK[countryId] || {
    ...FALLBACK.japan,
    name: id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Destination',
    heroImg: '/images/guide_hero.webp',
    desc: `Discover travel tips, culture, safety, and logistics for ${id || 'this destination'}.`,
    stats: { capital: '—', currency: '—', language: '—', timeZone: '—', bestTime: '—' }
  }

  const [data, setData] = useState<CountryData>(initial)
  const [activeNav, setActiveNav] = useState('overview')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/country-guide-data?id=${countryId}`)
        if (res.ok) {
          const d = await res.json()
          if (d.name) setData(d)
        }
      } catch (e) { /* use fallback */ }
    }
    load()
  }, [countryId])

  const [visaType, setVisaType] = useState<'free' | 'required'>('free')

  return (
    <div className={styles.container}>
      <SiteHeader />

      {/* Premium Hero Section */}
      <div className={styles.premiumHero} style={{ backgroundImage: `url(${data.heroImg})` }}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroLeft}>
            <p className={styles.heroOverTitle}>Complete Destination Guide</p>
            <h1>
              {data.name} {(data as any).flagEmoji || ''}
            </h1>
            <p className={styles.heroSubTitle}>
              {(data as any).heroSubtitle || 'Complete Destination Overview'}
            </p>
            <p className={styles.heroDesc}>{data.desc}</p>
            <div className={styles.heroButtons}>
              <button className={styles.startPlanBtn} onClick={() => window.location.href = `/plan?country=${encodeURIComponent(data.name)}`}>Start Planning →</button>
              <button className={styles.saveGuideBtn}>
                Save Guide <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
          
          <div className={styles.quickFactsCard}>
            <h3>🍀 Quick Facts</h3>
            <div className={styles.quickFactItem}>
              <span>📅 Best Time to Visit</span>
              <strong>{data.stats?.bestTime || 'April - June'}</strong>
            </div>
            <div className={styles.quickFactItem}>
              <span>🪙 Currency</span>
              <strong>{data.stats?.currency || 'Euro (€)'}</strong>
            </div>
            <div className={styles.quickFactItem}>
              <span>📊 Average Temp</span>
              <strong>{(data as any).averageTemp || '10°C - 22°C'}</strong>
            </div>
            <div className={styles.quickFactItem}>
              <span>📄 Visa Information</span>
              <strong>
                {(data as any).visaInfo || 'Visa-Free for 90 days'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Capsule Bar */}
      <div className={styles.tabNavbarWrapper}>
        <div className={styles.tabNavbarCapsule}>
          {[
            { id: 'overview', label: 'Overview', desc: 'Highlights & info', icon: '🗺️' },
            { id: 'entry', label: 'Entry Requirements', desc: 'Visa & customs', icon: '📄' },
            { id: 'safety', label: 'Safety & Security', desc: 'Alerts & numbers', icon: '🛡️' },
            { id: 'culture', label: 'Culture & Conduct', desc: 'Customs & conduct', icon: '🤝' },
            { id: 'logistics', label: 'Logistics', desc: 'Transport & utilities', icon: '📦' },
            { id: 'experiences', label: 'Experiences', desc: 'Food, rules & video', icon: '🍽️' },
          ].map(tab => (
            <button 
              key={tab.id} 
              className={`${styles.tabBtn} ${activeNav === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveNav(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <div>
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabDesc}>{tab.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Render active tab content */}
      <div className={styles.tabPanel}>
        {activeNav === 'overview' && (
          <div>
            {/* 1.1 Country Introduction */}
            <div className={styles.introLayout}>
              <div className={styles.introLeft}>
                <h3>1.1 Country Introduction</h3>
                <p>{data.countryIntro || `Welcome to ${data.name}. Explore the unique culture, safety protocols, and essential logistics for a perfect travel experience.`}</p>
                <div className={styles.introButtons}>
                  <button className={styles.discoverMoreBtn} onClick={() => window.location.href = '#experiences'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    Discover More
                  </button>
                  <button className={styles.officialGuideBtn} onClick={() => window.open(`https://google.com/search?q=official+tourism+site+${encodeURIComponent(data.name)}`, '_blank')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Official Guide
                  </button>
                </div>
              </div>
              <div className={styles.introRightImg} style={{ backgroundImage: `url(${data.overviewImg || data.heroImg})` }}></div>
            </div>

            {/* 1.2 Best Time to Visit Table */}
            <h3>1.2 Best Time to Visit</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.infoTable}>
                <thead>
                  <tr>
                    <th>MONTHS</th>
                    <th>PEAK (SUMMER)</th>
                    <th>SHOULDER (SPRING/AUTUMN) <span className={styles.recommendedTag}>RECOMMENDED</span></th>
                    <th>OFF-PEAK (WINTER)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Months</strong></td>
                    <td>{((data as any).bestTimePeak?.months) || 'June - August'}</td>
                    <td>{((data as any).bestTimeShoulder?.months) || 'April - May / Sept - Oct'}</td>
                    <td>{((data as any).bestTimeOffPeak?.months) || 'Nov - March'}</td>
                  </tr>
                  <tr>
                    <td><strong>Average Temp</strong></td>
                    <td>{((data as any).bestTimePeak?.temp) || '15°C - 20°C'}</td>
                    <td>{((data as any).bestTimeShoulder?.temp) || '10°C - 15°C'}</td>
                    <td>{((data as any).bestTimeOffPeak?.temp) || '5°C - 8°C'}</td>
                  </tr>
                  <tr>
                    <td><strong>Daylight Hours</strong></td>
                    <td>{((data as any).bestTimePeak?.daylight) || '17 - 19 hours'}</td>
                    <td>{((data as any).bestTimeShoulder?.daylight) || '12 - 15 hours'}</td>
                    <td>{((data as any).bestTimeOffPeak?.daylight) || '7 - 9 hours'}</td>
                  </tr>
                  <tr>
                    <td><strong>Ideal For</strong></td>
                    <td>{((data as any).bestTimePeak?.ideal) || 'Festivals, Hiking, Long Days'}</td>
                    <td><strong>{((data as any).bestTimeShoulder?.ideal) || 'Road trips, City exploration, Photography'}</strong></td>
                    <td>{((data as any).bestTimeOffPeak?.ideal) || 'Cosy pubs, Museums, Northern Lights'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 1.3 Public Holidays Card */}
            <div className={styles.holidaysCard}>
              <h4 className={styles.holidaysTitle}>
                <span style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>📅</span> 1.3 Public Holidays
              </h4>
              <div className={styles.holidaysRow}>
                <div className={styles.holidayCol}>
                  <h5>SPRING</h5>
                  <p>{(data as any).holidaysSpring || 'Easter Holidays / Vernal Equinox'}</p>
                </div>
                <div className={styles.holidayCol}>
                  <h5>SUMMER</h5>
                  <p>{(data as any).holidaysSummer || 'Summer Bank Holidays / National Celebrations'}</p>
                </div>
                <div className={styles.holidayCol}>
                  <h5>AUTUMN</h5>
                  <p>{(data as any).holidaysAutumn || 'Mid-Autumn Celebrations / Harvest Festival'}</p>
                </div>
                <div className={styles.holidayCol}>
                  <h5>WINTER</h5>
                  <p>{(data as any).holidaysWinter || 'Christmas Holidays / New Year Festival'}</p>
                </div>
              </div>
            </div>

            {/* 1.4 Bucket List */}
            <div className={styles.bucketListHeader}>
              <h3>1.4 Bucket List</h3>
            </div>
            <div className={styles.bucketListGrid}>
              {((data as any).bucketList || [
                { title: 'Coastline Touring', desc: 'A scenic route of raw beauty and adventure.', tag: 'COAST', type: 'coast', img: '/images/coastal_beach.webp' },
                { title: 'Historic Sightseeing', desc: 'Soaring vistas and iconic monuments.', tag: 'LANDMARK', type: 'landmark', img: '/images/hero_city.webp' },
                { title: 'Cultural Heritage', desc: 'Rich historic libraries and libraries of ancient texts.', tag: 'HERITAGE', type: 'heritage', img: '/images/how_london.webp' },
                { title: 'Local Music & Art', desc: 'Authentic performance and art inside cozy venues.', tag: 'CULTURE', type: 'culture', img: '/images/marrakech.webp' },
                { title: 'National Parks', desc: 'A lush landscape of mountains, lakes, and ancient woods.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' },
              ]).map((item: any, i: number) => {
                let tagClass = '';
                if (item.type === 'coast') tagClass = styles.tagCoast;
                else if (item.type === 'landmark') tagClass = styles.tagLandmark;
                else if (item.type === 'heritage') tagClass = styles.tagHeritage;
                else if (item.type === 'culture') tagClass = styles.tagCulture;
                else if (item.type === 'nature') tagClass = styles.tagNature;

                return (
                  <div key={i} className={styles.bucketCard}>
                    <div className={styles.bucketImg} style={{ backgroundImage: `url(${item.img || '/images/coastal_beach.webp'})` }}>
                      <span className={`${styles.bucketTag} ${tagClass}`}>{item.tag || 'EXPLORE'}</span>
                    </div>
                    <div className={styles.bucketContent}>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1.5 Unique Accommodation */}
            <h3>1.5 Unique Accommodation</h3>
            <div className={styles.accommodationGrid}>
              {((data as any).uniqueAccommodations || [
                { title: 'Luxury Castles & Villas', desc: 'Stay like royalty in historic country estates.', img: '/images/how_london.webp' },
                { title: 'Ocean Lighthouse Cottages', desc: 'Wake up to the direct sound of rolling ocean waves.', img: '/images/coastal_beach.webp' },
                { title: 'Countryside Cabins', desc: 'Authentic local countryside living experience.', img: '/images/why_mountains.webp' },
                { title: 'Glamping Domes', desc: 'Star-gaze from the comfort of a geodome bed.', img: '/images/hero_city.webp' },
              ]).map((item: any, i: number) => (
                <div key={i} className={styles.accomCard} style={{ backgroundImage: `url(${item.img || '/images/how_london.webp'})` }}>
                  <div className={styles.accomContent}>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNav === 'entry' && (
          <div>
            <h2 className={styles.tabTitle}>Entry Requirements</h2>
            <p className={styles.tabSubtitle}>Essential information for travellers entering the country, including visa guidelines, customs regulations, and health protocols.</p>
            
            <div className={styles.entryMainCard} style={{ backgroundImage: `url(${(data as any).entryImg || '/images/hero_city.webp'})` }}>
              <div className={styles.entryMainContent}>
                <h3>Immigration & Entry Control</h3>
                <p>Welcome to {data.name}. Ensure you have valid documents ready upon arrival.</p>
              </div>
            </div>

            <div className={styles.entryGrid}>
              <div className={styles.requirementBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4>📄 Visa Categories</h4>
                  <div className={styles.toggleContainer}>
                    <button className={`${styles.toggleBtn} ${visaType === 'free' ? styles.activeToggle : ''}`} onClick={() => setVisaType('free')}>Visa-Free</button>
                    <button className={`${styles.toggleBtn} ${visaType === 'required' ? styles.activeToggle : ''}`} onClick={() => setVisaType('required')}>Visa Required</button>
                  </div>
                </div>
                {visaType === 'free' ? (
                  <div className={styles.toggleContentGrid}>
                    <div className={styles.toggleCard}>
                      <h5>Eligible Regions</h5>
                      <ul>
                        {((data as any).visaFreeRegions || [
                          'European Union / EEA Members',
                          'United States, Canada, Australia',
                          'Selected Nations (Full list online)'
                        ]).map((region: string, idx: number) => (
                          <li key={idx}>{region}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.toggleCard}>
                      <h5>Conditions</h5>
                      <ul>
                        {((data as any).visaFreeConditions || [
                          'Tourism or Business (90 days)',
                          'Valid Passport for Stay Duration',
                          'Evidence of Sufficient Funds'
                        ]).map((cond: string, idx: number) => (
                          <li key={idx}>{cond}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className={styles.toggleContentGrid}>
                    <div className={styles.toggleCard}>
                      <h5>Who Needs It</h5>
                      <ul>
                        {((data as any).visaRequiredWho || [
                          'Non-exempt third-country nationals',
                          'Stays exceeding 90 days',
                          'Employment or study purposes'
                        ]).map((who: string, idx: number) => (
                          <li key={idx}>{who}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.toggleCard}>
                      <h5>How to Apply</h5>
                      <ul>
                        {((data as any).visaRequiredHow || [
                          'Submit application at local consulate',
                          'Provide invitation or travel booking',
                          'Pay processing fee (approx. €80)'
                        ]).map((how: string, idx: number) => (
                          <li key={idx}>{how}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.requirementBox}>
                <h4>🛂 Passport Checklist</h4>
                <div className={styles.checklistList}>
                  {((data as any).passportChecklist || [
                    { title: '6 Months Validity', desc: 'Recommended validity beyond your planned stay date.' },
                    { title: 'Two Blank Pages', desc: 'Required for entry stamps and visa stickers.' },
                    { title: 'Digital Copy', desc: 'Secure backup highly advised in case of physical loss.' }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className={styles.checklistItem}>
                      <span className={styles.checkIcon}>✓</span>
                      <div className={styles.checkText}>
                        <h5>{item.title}</h5>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.bottomRequirementsGrid}>
              <div className={styles.requirementBox}>
                <h4>📦 Customs Limits (Duty-Free)</h4>
                <div className={styles.dutyFreeGrid}>
                  <div className={styles.dutyFreeCard}>
                    <h5>🚬 Tobacco</h5>
                    <p>{(data as any).customsTobacco || '200 Cigarettes or 50 Cigars'}</p>
                  </div>
                  <div className={styles.dutyFreeCard}>
                    <h5>🍷 Alcohol</h5>
                    <p>{(data as any).customsAlcohol || '1L Spirits or 2L Fortified Wine'}</p>
                  </div>
                  <div className={styles.dutyFreeCard}>
                    <h5>🎁 Gifts</h5>
                    <p>{(data as any).customsGifts || 'Value up to €430 per adult'}</p>
                  </div>
                  <div className={styles.dutyFreeCard}>
                    <h5>💵 Cash</h5>
                    <p>{(data as any).customsCash || 'Declare over €10,000'}</p>
                  </div>
                </div>
              </div>

              <div className={styles.requirementBox}>
                <h4>🩺 Health Requirements</h4>
                <div className={styles.healthList}>
                  <div className={styles.healthItem}>
                    <span style={{ fontSize: '1.2rem' }}>💉</span>
                    <div className={styles.healthText}>
                      <h5>{(data as any).vaccinesTitle || 'No Mandatory Vaccines'}</h5>
                      <p>{(data as any).vaccinesDesc || 'Standard vaccinations recommended (Tetanus, MMR).'}</p>
                    </div>
                  </div>
                  <div className={styles.healthItem}>
                    <span style={{ fontSize: '1.2rem' }}>🏥</span>
                    <div className={styles.healthText}>
                      <h5>{(data as any).insuranceTitle || 'Travel Insurance'}</h5>
                      <p>{(data as any).insuranceDesc || 'Mandatory for visa applicants, highly advised for all.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'safety' && (
          <div>
            <div className={styles.safetyHeaderRow}>
              <span>DESTINATION GUIDE</span>
              <h2>Safety & Security</h2>
              <p>Essential knowledge for a respectful and safe journey through {data.name}. From emergency protocols to local safety advisories.</p>
            </div>

            <div className={styles.safetyColumnsGrid} style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
              <div className={styles.safetySectionCol}>
                <h3><span>03</span> Safety & Security</h3>
                <div className={styles.safetyCardImg} style={{ backgroundImage: `url(${(data as any).safetyImg || '/images/marrakech.webp'})` }}></div>
                
                <div className={styles.safetyNumbersCard}>
                  <div className={styles.safetyNumbersInfo}>
                    <h5>EMERGENCY NUMBERS</h5>
                    <h3>{(data as any).emergency?.police || '112'} / {(data as any).emergency?.ambulance || '112'}</h3>
                    <p>Emergency numbers are free to call and work from any mobile phone, even with no credit or a locked screen.</p>
                  </div>
                  <div className={styles.actionIcons}>
                    <button className={styles.actionBtn} onClick={() => window.open(`tel:${(data as any).emergency?.police || '112'}`)}>📞</button>
                    <button className={styles.actionBtn}>🏥</button>
                  </div>
                </div>

                <div className={styles.dualGrid}>
                  <div className={styles.healthItem}>
                    <div className={styles.healthText}>
                      <h5>{(data as any).healthTipsTitle || '🩺 Health Tips'}</h5>
                      <p>{(data as any).healthTipsDesc || 'Tap water is safe to drink. Carry standard sunscreens and stay hydrated.'}</p>
                    </div>
                  </div>
                  <div className={styles.healthItem}>
                    <div className={styles.healthText}>
                      <h5>{(data as any).safetyAssistanceTitle || '🛡️ Tourist Assistance'}</h5>
                      <p>{(data as any).safetyAssistanceDesc || 'The local Tourist Assistance Service helps victims of crime or accidents.'}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.warningBanner}>
                  <h5>♀ SOLO FEMALE TRAVEL</h5>
                  <h4>{(data as any).soloFemaleTitle || 'Extremely Safe & Accessible'}</h4>
                  <p>{(data as any).soloFemaleDesc || 'Generally very safe. Use common sense in major city centers late at night. Trust your instincts. Public transit is secure and well-monitored.'}</p>
                  <div className={styles.tagRow}>
                    {((data as any).soloFemaleTags || ['RELIABLE', 'WELL-LIT AREAS']).map((tag: string, idx: number) => (
                      <span key={idx} className={styles.warningTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'culture' && (
          <div>
            <div className={styles.safetyHeaderRow}>
              <span>DESTINATION GUIDE</span>
              <h2>Culture & Conduct</h2>
              <p>Understand local customs, language basics, and social etiquette guidelines to travel with respect.</p>
            </div>

            <div className={styles.safetyColumnsGrid} style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
              <div className={styles.safetySectionCol}>
                <h3><span>04</span> Culture & Conduct</h3>
                <div className={styles.cultureIntroCard} style={{ backgroundImage: `url(${(data as any).cultureImg || '/images/why_mountains.webp'})` }}>
                  <div className={styles.cultureIntroContent}>
                    <span className={styles.bucketTag} style={{ background: '#EBA424', color: '#fff', marginBottom: '10px', display: 'inline-block' }}>AUTHENTIC EXPERIENCE</span>
                    <h4>{(data as any).cultureExperienceTitle || 'Local Highlight'}</h4>
                    <p>{(data as any).cultureExperienceDesc || 'Immerse yourself in local traditions, live performances, and historical landmarks.'}</p>
                  </div>
                </div>

                <div className={styles.dualGrid} style={{ marginBottom: '30px' }}>
                  <div className={styles.healthItem}>
                    <span style={{ fontSize: '1.4rem', background: '#e0f2fe', padding: '10px', borderRadius: '12px', marginRight: '6px' }}>💬</span>
                    <div className={styles.healthText}>
                      <h5>{(data as any).cultureHighlight1Title || 'Social Atmosphere'}</h5>
                      <p>{(data as any).cultureHighlight1Desc || 'Locals are friendly, warm, and enjoy engaging in lively conversations.'}</p>
                    </div>
                  </div>
                  <div className={styles.healthItem}>
                    <span style={{ fontSize: '1.4rem', background: '#ffedd5', padding: '10px', borderRadius: '12px', marginRight: '6px' }}>👥</span>
                    <div className={styles.healthText}>
                      <h5>{(data as any).cultureHighlight2Title || 'Social Etiquette'}</h5>
                      <p>{(data as any).cultureHighlight2Desc || 'Learn the basic guidelines for socializing in public and dining.'}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.infoTable}>
                    <thead>
                      <tr>
                        <th colSpan={2}>LOCAL CONDUCT GUIDE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((data as any).conductGuide || [
                        { label: 'Tipping', desc: '10% is standard in restaurants if service charge is not included.' },
                        { label: 'Religion', desc: 'Respectful attire when visiting historic temples or cathedrals.' },
                        { label: 'Punctuality', desc: 'Arrive on time for bookings and transport connections.' },
                        { label: 'Environment', desc: 'Protect natural environments and follow local recycling rules.' }
                      ]).map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ width: '130px' }}><strong>{item.label}</strong></td>
                          <td>{item.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.phrasesSection}>
                  <h4>USEFUL PHRASES</h4>
                  <div className={styles.phrasesGrid}>
                    {((data as any).usefulPhrases || [
                      { phrase: 'Hello', translation: 'Primary standard greeting' },
                      { phrase: 'Thank you', translation: 'Expressing gratitude' }
                    ]).map((p: any, idx: number) => (
                      <div key={idx} className={styles.phraseItem}>
                        <h5>{p.phrase}</h5>
                        <p>{p.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'logistics' && (
          <div>
            <div className={styles.safetyHeaderRow}>
              <span>DESTINATION GUIDE</span>
              <h2>05 Logistics</h2>
            </div>
            
            <div className={styles.logisticsMainCard} style={{ backgroundImage: `url(${(data as any).logisticsImg || '/images/hero_city.webp'})` }}>
              <span className={styles.bucketTag} style={{ background: '#fff', color: '#1a1a1a', margin: '20px' }}>Infrastructure Details</span>
            </div>

            <div className={styles.cardsRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)', padding: 0, marginBottom: '24px' }}>
              <div className={styles.infoCard}>
                <h4 style={{ fontSize: '0.85rem', color: '#855F1B', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>CURRENCY</h4>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px' }}>{data.stats?.currency || 'Local Currency'}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{(data as any).logisticsCurrencyDesc || 'Credit cards widely accepted; keep cash for smaller venues.'}</p>
              </div>
              <div className={styles.infoCard}>
                <h4 style={{ fontSize: '0.85rem', color: '#855F1B', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>DRIVING RULES</h4>
                <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '6px' }}>Side of the road</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px' }}>{data.drivingRules || 'Right side'}</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {((data as any).drivingRulesTags || ['Standard rules']).map((tag: string, idx: number) => (
                    <span key={idx} className={styles.warningTag} style={{ background: '#7c2d12', color: '#ffedd5' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className={styles.infoCard}>
                <h4 style={{ fontSize: '0.85rem', color: '#855F1B', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>LOCAL TRANSPORT</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                  {((data as any).transportTags || ['Rail', 'Bus', 'Taxi']).map((tag: string, idx: number) => (
                    <span key={idx} className={styles.warningTag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cardsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)', padding: 0 }}>
              <div className={styles.infoCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#855F1B', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>ELECTRICITY</h4>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px' }}>{(data as any).plugType || (data.name.toLowerCase() === 'ireland' ? 'Type G plug' : 'Type C & F plug')}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>{(data as any).voltage || '230V / 50Hz'}</p>
                </div>
                <span style={{ fontSize: '2.5rem' }}>🔌</span>
              </div>
              <div className={styles.infoCard}>
                <h4 style={{ fontSize: '0.85rem', color: '#855F1B', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>ESSENTIAL APPS</h4>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {((data as any).essentialApps || ['Google Maps', 'Uber']).map((app: string, idx: number) => (
                    <span key={idx} className={styles.warningTag} style={{ padding: '8px 14px', borderRadius: '10px' }}>{app}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'experiences' && (
          <div>
            <div className={styles.safetyHeaderRow}>
              <span>DESTINATION GUIDE</span>
              <h2>06 Experiences & Rules</h2>
            </div>

            <div className={styles.experiencesGrid}>
              <div className={styles.foodCard}>
                <div className={styles.foodHero} style={{ backgroundImage: `url(${(data as any).experiencesImg || data.heroImg || '/images/marrakech.webp'})` }}>
                  <h4>Traditional Flavors</h4>
                </div>
                <div className={styles.foodContent}>
                  <div>
                    <h5>Must-Try Food & Drink</h5>
                    <ul>
                      {((data as any).mustTryFoods || ['Local Specialities']).map((food: string, idx: number) => (
                        <li key={idx}>{food}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5>Alcohol Laws</h5>
                    <p>{(data as any).alcoholLaws || 'Varies by municipality and country rules.'}</p>
                  </div>
                </div>
              </div>

              <div className={styles.rulesList}>
                {((data as any).localRules || [
                  { emoji: '🚭', title: 'SMOKING/VAPING BAN', desc: 'Strictly prohibited in enclosed public spaces.' },
                  { emoji: '🛍️', title: 'SHOPPING TIPS', desc: 'Levy may apply to plastic bags. Always carry a reusable tote.' },
                  { emoji: '⚖️', title: 'LOCAL LAWS', desc: 'Littering and jaywalking can carry heavy fines.' }
                ]).map((rule: any, idx: number) => (
                  <div key={idx} className={styles.ruleItemCard}>
                    <span style={{ fontSize: '1.2rem' }}>{rule.emoji}</span>
                    <div className={styles.ruleItemText}>
                      <h5>{rule.title}</h5>
                      <p>{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Resource Card */}
            <div className={styles.videoResourceCard}>
              <div className={styles.videoThumbnail} style={{ backgroundImage: `url(${(data as any).videoThumbnail || '/images/coastal_beach.webp'})` }}>
                <button className={styles.playBtn} onClick={() => window.open((data as any).videoUrl || 'https://youtube.com', '_blank')}>▶</button>
              </div>
              <div className={styles.videoInfo}>
                <h5>VIDEO RESOURCE</h5>
                <h3>{(data as any).videoTitle || `The Perfect 10 Days in ${data.name} Itinerary`}</h3>
                <p>{(data as any).videoDesc || 'Watch our comprehensive video guide covering the best routes, hidden gems, and local secrets to help you navigate like a pro.'}</p>
                <button className={styles.watchNowBtn} onClick={() => window.open((data as any).videoUrl || 'https://youtube.com', '_blank')}>Watch Now</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}

