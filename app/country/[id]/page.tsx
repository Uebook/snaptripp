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
    heroImg: '/images/explore_japan.png',
    stats: { capital: 'Tokyo', currency: 'Yen (¥)', language: 'Japanese', timeZone: 'GMT+9', bestTime: 'Mar – May' },
    countryIntro: 'An archipelago of over 6,000 islands stretching from subarctic Hokkaido to subtropical Okinawa, Japan is defined by volcanic mountains, hot springs, and millennia of rich cultural heritage.',
    bestTimeDesc: 'Spring (March–May) for cherry blossoms and autumn (Sept–Nov) for vibrant foliage are peak seasons. Winter brings world-class skiing in Hokkaido; summer offers lively matsuri festivals.',
    publicHolidays: 'Japan observes 16 public holidays including Golden Week (late April–early May) and Obon (mid-August). Many businesses close and transport fills up quickly — plan ahead.',
    bucketList: ['See cherry blossoms in Ueno Park', 'Climb Mt. Fuji at sunrise', 'Stay in a traditional ryokan', 'Attend a sumo tournament', 'Experience teamLab digital art'],
    uniqueAccommodation: 'Sleep in a capsule hotel in Akihabara, a historic machiya townhouse in Kyoto, or an onsen ryokan in Hakone for an authentic Japanese hospitality experience.',
    overviewImg: '/images/explore_japan.png',
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
    safetyImg: '/images/hero_city.png',
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
    cultureImg: '/images/coastal_beach.png',
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
    experiencesImg: '/images/marrakech.png',
    experienceTitle: 'Traditional Tea Ceremony',
    experienceDesc: 'Experience the mindful preparation of matcha and the profound hospitality of Japanese culture. Participate in a centuries-old ritual that emphasises harmony, respect, purity, and tranquility.',
    experienceImg: '/images/explore_japan.png',
    cities: [
      { name: 'Tokyo', desc: 'Vibrant metropolis blending neon lights, historic shrines, and world-class cuisine.', img: '/images/hero_city.png' },
      { name: 'Kyoto', desc: 'Cultural heart of Japan with thousands of classical Buddhist temples and tea houses.', img: '/images/coastal_beach.png' },
      { name: 'Osaka', desc: 'Dynamic port city known for bold architecture, nightlife, and legendary street food.', img: '/images/marrakech.png' },
    ]
  },
  italy: {
    name: 'Italy',
    desc: 'The ultimate guide to rolling hills, hidden vineyards, and the slow life of the Italian countryside.',
    heroImg: '/images/guide_italy.png',
    stats: { capital: 'Rome', currency: 'Euro (€)', language: 'Italian', timeZone: 'GMT+1', bestTime: 'Apr – Jun' },
    countryIntro: 'A boot-shaped peninsula in southern Europe, Italy is a cradle of Western civilisation — home to the Roman Empire, the Renaissance, and unmatched art, food, and fashion.',
    bestTimeDesc: 'Spring (April–June) and autumn (September–October) offer the best weather and smaller crowds. July–August is peak season. Winter is ideal for city breaks and Alps skiing.',
    publicHolidays: 'Italy observes 12 national public holidays including Ferragosto (August 15) when much of the country shuts down.',
    bucketList: ['See the Colosseum at sunrise', 'Cruise the Amalfi Coast', 'Attend opera at La Scala', 'Truffle hunting in Umbria', 'Carnival in Venice'],
    uniqueAccommodation: 'Stay in an agriturismo (farm stay), a restored masseria in Puglia, a cave hotel in Matera, or a villa in Tuscany.',
    overviewImg: '/images/guide_italy.png',
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
    cultureImg: '/images/guide_italy.png',
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
    experiencesImg: '/images/guide_italy.png',
    experienceTitle: 'Tuscan Wine Tasting',
    experienceDesc: 'Indulge in an authentic winemaking tour through rolling Chianti hills and medieval cellars. Discover Brunello, Barolo, and Super Tuscans directly from the estates.',
    experienceImg: '/images/guide_italy.png',
    cities: [
      { name: 'Rome', desc: 'Eternal city of ancient ruins, baroque fountains, Vatican art, and world-class pizza al taglio.', img: '/images/guide_italy.png' },
      { name: 'Florence', desc: 'Birthplace of the Renaissance — home to Michelangelo\'s David, the Uffizi, and world-class Florentine cuisine.', img: '/images/how_london.png' },
      { name: 'Venice', desc: 'Built on 118 islands — a labyrinth of canals, gondolas, and palatial architecture unlike anywhere on earth.', img: '/images/coastal_beach.png' },
    ]
  }
}

// ── Reusable: Section with optional image split ──────────────────────
function GuideSection({ label, title, subtitle, img, children }: {
  label: string; title: string; subtitle: string; img?: string; children: React.ReactNode
}) {
  const hasImage = !!img
  return (
    <section className={styles.guideSection}>
      <p className={styles.sectionLabel}>{label}</p>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionSubtitle}>{subtitle}</p>

      {hasImage ? (
        <div className={styles.sectionWithImg}>
          <div className={styles.sectionPoints}>{children}</div>
          <div className={styles.sectionImg} style={{ backgroundImage: `url(${img})` }} />
        </div>
      ) : (
        <div className={styles.sectionFull}>{children}</div>
      )}
    </section>
  )
}

// ── Reusable: Bullet point list ──────────────────────────────────────
function BulletList({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className={styles.bulletList}>
      {items.map((item, i) => (
        <div key={i} className={styles.bulletItem}>
          <div className={styles.bulletDot} />
          <div>
            <strong className={styles.bulletTitle}>{item.title}</strong>
            <p className={styles.bulletDesc}>{item.desc}</p>
          </div>
        </div>
      ))}
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
    heroImg: '/images/guide_hero.png',
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

  const renderIcon = (type: string) => {
    if (type === 'snapshot') return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><circle cx="12" cy="14" r="3"/>
      </svg>
    )
    if (type === 'clock') return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )
  }

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
              { id: 'entry', label: 'ENTRY REQUIREMENTS' },
              { id: 'safety', label: 'SAFETY & SECURITY' },
              { id: 'culture', label: 'CULTURE & CONDUCT' },
              { id: 'logistics', label: 'LOGISTICS' },
              { id: 'experiences', label: 'EXPERIENCES & RULES' },
              { id: 'cities', label: 'TOP CITIES' },
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
          <div className={styles.heroImg} style={{ backgroundImage: `url(${data.heroImg})` }} />

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

          <div className={styles.contentDivider} />

          {/* ── 01 OVERVIEW ── */}
          <div id="overview">
            <GuideSection
              label="01 — OVERVIEW"
              title="Overview"
              subtitle="First impressions and essential country context"
              img={data.overviewImg}
            >
              <BulletList items={[
                { title: 'Country Introduction', desc: data.countryIntro },
                { title: 'Best Time to Visit', desc: data.bestTimeDesc },
                { title: 'Public Holidays', desc: data.publicHolidays },
                { title: 'Unique Accommodation', desc: data.uniqueAccommodation },
                ...(data.bucketList || []).map(b => ({ title: '🗺 Bucket List', desc: b }))
              ]} />
            </GuideSection>
          </div>

          <div className={styles.contentDivider} />

          {/* ── 02 ENTRY REQUIREMENTS ── */}
          <div id="entry">
            <GuideSection
              label="02 — ENTRY REQUIREMENTS"
              title="Entry Requirements"
              subtitle="What you need before and at the border"
              img={data.entryImg}
            >
              <BulletList items={[
                { title: 'Visa & Entry', desc: data.visaEntry },
                { title: 'Passport & Documentation', desc: data.passportDocs },
                { title: 'Customs & Duty-Free', desc: data.customs },
                { title: 'Health Requirements', desc: data.healthRequirements },
                { title: 'Travel Insurance', desc: data.travelInsurance },
              ]} />
            </GuideSection>
          </div>

          <div className={styles.contentDivider} />

          {/* ── 03 SAFETY & SECURITY ── */}
          <div id="safety">
            <GuideSection
              label="03 — SAFETY & SECURITY"
              title="Safety & Security"
              subtitle="Staying safe on the ground"
              img={data.safetyImg}
            >
              <BulletList items={[
                { title: 'Safety Alerts & Risk Level', desc: data.safetyRisk },
                { title: 'Emergency Numbers', desc: `Police: ${data.emergencyNumbers?.police || '—'} · Ambulance: ${data.emergencyNumbers?.ambulance || '—'} · Fire: ${data.emergencyNumbers?.fire || '—'}` },
                { title: 'Health & Medical', desc: data.healthMedical },
                { title: 'Common Scams', desc: data.commonScams },
                { title: 'Natural Hazards', desc: data.naturalHazards },
                { title: 'LGBTQ+ Safety', desc: data.lgbtqSafety },
                { title: 'Solo & Female Traveller Tips', desc: data.soloTips },
              ]} />
            </GuideSection>
          </div>

          <div className={styles.contentDivider} />

          {/* ── 04 CULTURE & CONDUCT ── */}
          <div id="culture">
            <GuideSection
              label="04 — CULTURE & CONDUCT"
              title="Culture & Conduct"
              subtitle="Blending in and showing respect"
              img={data.cultureImg}
            >
              <BulletList items={[
                ...(data.localEtiquette || []).map(e => ({ title: e.title, desc: e.desc })),
                { title: 'Religion & Sacred Sites', desc: data.religion },
                { title: 'Photography Rules', desc: data.photographyRules },
                { title: 'Tipping', desc: data.tipping },
                { title: 'Language Basics', desc: data.languageBasics },
                { title: 'Social Norms', desc: data.socialNorms },
                { title: 'Festivals & Events', desc: data.festivals },
              ]} />
            </GuideSection>
          </div>

          <div className={styles.contentDivider} />

          {/* ── 05 LOGISTICS ── */}
          <div id="logistics">
            <GuideSection
              label="05 — LOGISTICS"
              title="Logistics"
              subtitle="Getting around and staying connected"
              img={data.logisticsImg}
            >
              <BulletList items={[
                { title: 'Currency & Payments', desc: data.currencyPayments },
                { title: 'Local Transport', desc: data.localTransport },
                { title: 'Driving Rules', desc: data.drivingRules },
                { title: 'SIM & Connectivity', desc: data.simConnectivity },
                { title: 'VPN & Internet', desc: data.vpnInternet },
                { title: 'Electricity & Plugs', desc: data.electricityPlugs },
                { title: 'Essential Apps', desc: data.essentialApps },
              ]} />
            </GuideSection>
          </div>

          <div className={styles.contentDivider} />

          {/* ── 06 EXPERIENCES & RULES ── */}
          <div id="experiences">
            <GuideSection
              label="06 — EXPERIENCES & RULES"
              title="Experiences & Rules"
              subtitle="Food, shopping, and what to know legally"
              img={data.experiencesImg}
            >
              <BulletList items={[
                { title: 'Must-Try Food & Drink', desc: data.mustTryFood },
                { title: 'Alcohol Laws', desc: data.alcoholLaws },
                { title: 'Smoking & Vaping Rules', desc: data.smokingRules },
                { title: 'Shopping & Bargaining', desc: data.shopping },
                { title: 'Souvenirs', desc: data.souvenirs },
                { title: 'Environmental Considerations', desc: data.environmental },
                { title: 'Laws & Local Bylaws', desc: data.localLaws },
              ]} />
            </GuideSection>
          </div>



          {/* ── TOP CITIES ── */}
          {(data.cities || []).length > 0 && (
            <section id="cities" className={styles.citiesSection}>
              <div className={styles.citiesHeader}>
                <p className={styles.sectionLabel}>TOP CITIES TO EXPLORE</p>
                <h2>Must Visit Cities</h2>
              </div>
              <div className={styles.citiesGrid}>
                {(data.cities || []).map((city, i) => (
                  <div key={i} className={styles.cityCard}>
                    <div className={styles.cityImg} style={{ backgroundImage: `url(${city.img})` }} />
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
