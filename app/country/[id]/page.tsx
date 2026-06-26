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

  return (
    <div className={styles.container}>
      <SiteHeader />

      <div className={styles.pageLayout}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>COUNTRY GUIDE</h3>
            <p>THE CURATED JOURNEY</p>
          </div>
          <nav className={styles.sidebarNav}>
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'entry', label: 'REQUIREMENTS' },
              { id: 'safety', label: 'SAFETY' },
              { id: 'culture', label: 'CULTURE' },
              { id: 'logistics', label: 'LOGISTICS' },
              { id: 'cities', label: 'PLACES' },
            ].map(n => (
              <a key={n.id} href={`#${n.id}`} className={activeNav === n.id ? styles.active : ''} onClick={() => setActiveNav(n.id)}>
                {n.label}
              </a>
            ))}
          </nav>
          <button className={styles.downloadBtn}>DOWNLOAD PDF</button>
        </aside>

        {/* ── Main Content ── */}
        <main className={styles.mainContent}>
          {/* Hero */}
          <div style={{ padding: '0 64px', marginTop: '40px' }}>
            <div className={styles.heroImg} style={{ backgroundImage: `url(${data.heroImg})`, borderRadius: '16px' }} />
          </div>

          {/* Title */}
          <div className={styles.titleRow}>
            <div className={styles.titleInfo}>
              <h1>{data.name}</h1>
              <p>{data.desc}</p>
            </div>
            <button className={styles.saveBtn}>SAVE FOR TRIP</button>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { label: 'CAPITAL', value: data.stats?.capital || '—' },
              { label: 'CURRENCY', value: data.stats?.currency || '—' },
              { label: 'LANGUAGE', value: data.stats?.language || '—' },
              { label: 'TIME ZONE', value: data.stats?.timeZone || '—' },
              { label: 'BEST TIME', value: data.stats?.bestTime || '—' },
            ].map(s => (
              <div key={s.label} className={styles.statItem}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>

          <div className={styles.contentDivider} style={{ margin: '40px 64px' }} />

          {/* ── 01 OVERVIEW ── */}
          <div id="overview">
            <div className={styles.cardsRow} style={{ padding: '0 64px 60px' }}>
              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <h3>About</h3>
                <p>{data.countryIntro}</p>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </div>
                <h3>Travel Snapshot</h3>
                <p>Efficiency meets elegance. Navigate with ease using the Shinkansen, indulge in world-class culinary delights, and find peace in Zen gardens.</p>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3>Best Time to Visit</h3>
                <p>{data.bestTimeDesc}</p>
              </div>
            </div>
          </div>

          {/* ── 02 ENTRY REQUIREMENTS ── */}
          <SectionWrapper id="entry" bg="#F4F4F1">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.22em', color: '#666', margin: '0 0 10px', textTransform: 'uppercase' }}>ENTRY REQUIREMENTS</p>
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
              <div>
                <Accordion title="Visa Policy" initialOpen={true}>
                  {data.visaEntry || 'Citizens of many countries, including the US, UK, Canada, and Australia, can enter Japan for tourism for up to 90 days without a visa. Ensure your travel purpose is strictly temporary.'}
                </Accordion>
                <Accordion title="Passport Validity">
                  {data.passportDocs || 'Passport must be valid for the duration of your stay. Border control may request proof of onward travel and sufficient funds.'}
                </Accordion>
                <Accordion title="Arrival & Customs">
                  {data.customs || 'Duty-free allowance: 3 bottles of alcohol, 400 cigarettes, and ¥200,000 in goods. Some medications and items are strictly prohibited.'}
                </Accordion>
              </div>
            </div>
          </SectionWrapper>

          {/* ── 03 SAFETY & SECURITY ── */}
          <div id="safety" style={{ padding: '60px 64px' }}>
            <div className={styles.darkBox} style={{ background: '#1A1A1A', borderColor: '#1A1A1A', borderRadius: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '40px 60px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#F6B800', marginBottom: '20px' }}>Emergency & Safety</h4>
                <p style={{ color: '#EBEBEB', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '30px' }}>
                  {data.safetyRisk}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', color: '#EBEBEB', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#F6B800' }}>POLICE</strong> <span>{data.emergencyNumbers?.police || '110'}</span>
                  <strong style={{ color: '#F6B800' }}>AMBULANCE</strong> <span>{data.emergencyNumbers?.ambulance || '119'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className={styles.darkColumn}>
                  <h4 style={{ color: '#F6B800' }}>SAFETY TIPS</h4>
                  <p style={{ fontStyle: 'italic', color: '#EBEBEB' }}>"{data.naturalHazards}"</p>
                </div>
                <div className={styles.darkColumn}>
                  <h4 style={{ color: '#F6B800' }}>EMBASSY INFO</h4>
                  <p style={{ color: '#EBEBEB' }}>Most major embassies are located in the Minato-ku district of Tokyo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 04 CULTURE & CONDUCT ── */}
          <div id="culture" className={styles.twoColGrid}>
            <div className={styles.infoCol}>
              <h3 className={styles.colTitle}>Laws & Regulations</h3>
              <div className={styles.colItems}>
                <div className={styles.colItem} style={{ border: 'none', padding: '0 0 16px', borderBottom: '1px solid #F3F3F3', borderRadius: 0, gap: '20px' }}>
                  <div style={{ color: '#F6B800' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </div>
                  <div>
                    <h5>RESTRICTED ITEMS</h5>
                    <p>{data.localLaws || 'Strict laws on medication; some common over-the-counter drugs are prohibited.'}</p>
                  </div>
                </div>
                <div className={styles.colItem} style={{ border: 'none', padding: '0 0 16px', borderBottom: '1px solid #F3F3F3', borderRadius: 0, gap: '20px' }}>
                  <div style={{ color: '#F6B800' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
                  </div>
                  <div>
                    <h5>DRESS CODES</h5>
                    <p>{data.religion || 'Modest dress is required at temples and shrines. Shoulders and knees should be covered.'}</p>
                  </div>
                </div>
                <div className={styles.colItem} style={{ border: 'none', padding: '0', borderRadius: 0, gap: '20px' }}>
                  <div style={{ color: '#F6B800' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                  </div>
                  <div>
                    <h5>PUBLIC SMOKING</h5>
                    <p>{data.smokingRules || 'Smoking on streets is banned in many districts; use designated smoking areas only.'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCol}>
              <h3 className={styles.colTitle}>Cultural Etiquette</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F9F9F9', borderRadius: '8px', padding: '20px' }}>
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F6B800', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    DO'S
                  </div>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <li>Remove shoes when entering homes or certain restaurants.</li>
                    <li>Bow slightly when greeting or thanking someone.</li>
                    <li>Use both hands when giving or receiving business cards.</li>
                  </ul>
                </div>
                <div style={{ paddingLeft: '15px', borderLeft: '1px solid #EBEBEB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D32F2F', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    DON'TS
                  </div>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <li>No tipping—it is often seen as insulting or confusing.</li>
                    <li>Avoid talking loudly on trains or public transport.</li>
                    <li>Never stick your chopsticks vertically in a bowl of rice.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 64px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#555', fontWeight: 600 }}>Travel Essentials</h3>
          </div>

          {/* ── 05 LOGISTICS ── */}
          <div id="logistics">
            <div className={styles.cardsRow} style={{ padding: '0 64px 60px' }}>
              <div className={styles.infoCard} style={{ background: '#fff' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#F6B800', letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>MONEY</h4>
                <p style={{ fontSize: '0.85rem', color: '#111', lineHeight: 1.6, marginBottom: '20px', fontWeight: 500 }}>
                  {data.currencyPayments || 'While Japan is becoming more card-friendly, cash remains king in rural areas. 7-Eleven ATMs are most reliable for foreign cards.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  NO TIPPING REQUIRED
                </div>
              </div>
              <div className={styles.infoCard} style={{ background: '#fff' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#F6B800', letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>CONNECTIVITY</h4>
                <p style={{ fontSize: '0.85rem', color: '#111', lineHeight: 1.6, marginBottom: '20px', fontWeight: 500 }}>
                  {data.simConnectivity || 'eSIMs like Airalo or Ubigi are highly recommended. Pocket WiFi is a popular alternative for groups.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                  PLUG TYPE A & B (100V)
                </div>
              </div>
              <div className={styles.infoCard} style={{ background: '#fff' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#F6B800', letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>TRANSPORT</h4>
                <p style={{ fontSize: '0.85rem', color: '#111', lineHeight: 1.6, marginBottom: '20px', fontWeight: 500 }}>
                  {data.localTransport || 'The Japan Rail (JR) Pass offers unlimited travel on most trains. Buy a Suica or Pasmo card for local subways.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                  USE GOOGLE MAPS
                </div>
              </div>
            </div>
          </div>

          {/* ── 06 HEALTH & WELL-BEING ── */}
          <div style={{ padding: '0 64px 60px' }}>
            <div style={{ background: '#EAE9E4', borderRadius: '4px', padding: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div style={{ backgroundImage: `url(${data.experiencesImg || '/images/explore_japan.webp'})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '300px', borderRadius: '4px' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '30px', color: '#111' }}>Health & Well-being</h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.75rem', color: '#F6B800', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>VACCINATIONS</h4>
                  <p style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.5 }}>No specific vaccinations required for short-term travel, but standard boosters are recommended.</p>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.75rem', color: '#F6B800', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>WATER SAFETY</h4>
                  <p style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.5 }}>Tap water is safe to drink throughout the country and is of exceptionally high quality.</p>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '0.75rem', color: '#F6B800', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>WEATHER PRECAUTIONS</h4>
                  <p style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.5 }}>Summers can be extremely humid (June-August). Typhoons are possible from August to October.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── TOP CITIES ── */}
          {(data.cities || []).length > 0 && (
            <section id="cities" className={styles.citiesSection} style={{ padding: '40px 64px 80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
                <div>
                  <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.22em', color: '#F6B800', margin: '0 0 10px', textTransform: 'uppercase' }}>CURATED DESTINATIONS</p>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#333', margin: 0 }}>Top Places to Explore</h2>
                </div>
                {countryId === 'japan' && (
                  <div style={{ width: '80px', height: '80px', background: '#C3D0CC', opacity: 0.8, borderRadius: '4px', position: 'relative' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: 'none', stroke: '#fff', strokeWidth: 2 }}>
                       <path d="M40 80 Q60 60 70 40 T80 20" />
                       <path d="M45 75 Q65 55 75 35" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className={styles.citiesGrid}>
                {(data.cities || []).slice(0, 3).map((city, i) => (
                  <div key={i} className={styles.cityCard}>
                    <div className={styles.cityImg} style={{ backgroundImage: `url(${city.img})`, borderRadius: '4px', height: '280px' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 8px' }}>{city.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{city.desc}</p>
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

