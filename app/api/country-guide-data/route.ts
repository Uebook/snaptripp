import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id') || 'japan'
    const countryId = rawId.toLowerCase()

    // 1. Fetch main country guide
    let { data: guide, error: guideError } = await supabaseAdmin
      .from('country_guides')
      .select('*')
      .eq('id', countryId)
      .maybeSingle()

    // 2. Fetch cards
    let { data: cards, error: cardsError } = await supabaseAdmin
      .from('country_guide_cards')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })

    // 3. Fetch items (connectivity & etiquette)
    let { data: items, error: itemsError } = await supabaseAdmin
      .from('country_guide_items')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })

    // 4. Fetch cities
    let { data: cities, error: citiesError } = await supabaseAdmin
      .from('country_guide_cities')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })

    const isRelationMissing = (guideError && (guideError.code === 'PGRST205' || guideError.message.includes('relation "country_guides" does not exist'))) || 
                              (cardsError && cardsError.message.includes('relation'))

    if (isRelationMissing || !guide) {
      // Return static fallback for Japan if table is missing or dynamic record not loaded yet
      if (countryId === 'japan') {
        const fallbackJapan = {
          name: 'Japan',
          desc: 'A harmonious blend of ancient traditions and futuristic innovation. From the neon-lit streets of Tokyo to the tranquil temples of Kyoto, Japan offers a sensory journey unlike any other.',
          heroImg: '/images/explore_japan.png',
          stats: { capital: 'Tokyo', currency: 'Yen (¥)', language: 'Japanese', timeZone: 'GMT+9', bestTime: 'Mar - May' },
          cards: [
            { title: 'About', desc: 'An archipelago of over 6,000 islands, Japan\'s topography ranges from snow-capped peaks to tropical beaches, defined by deep spiritual roots.' },
            { title: 'Travel Snapshot', desc: 'Efficiency meets elegance. Navigate with ease using the Shinkansen, indulge in world-class culinary delights, and find peace in Zen gardens.' },
            { title: 'Best Time to Visit', desc: 'Spring for Sakura blossoms and Autumn for fiery maple leaves are peak seasons. Winter offers world-class skiing in Hokkaido.' }
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
        }
        return NextResponse.json(fallbackJapan)
      } else {
        // Dynamic fallback for other countries so it is graceful
        const titleCaseName = rawId.charAt(0).toUpperCase() + rawId.slice(1)
        return NextResponse.json({
          name: titleCaseName,
          desc: `Discover ${titleCaseName} - planning options coming soon.`,
          heroImg: '/images/guide_hero.png',
          stats: { capital: 'N/A', currency: 'N/A', language: 'N/A', timeZone: 'N/A', bestTime: 'N/A' },
          cards: [],
          emergency: { police: '112', ambulance: '112', embassy: 'Contact your local embassy.' },
          connectivity: [],
          etiquette: [],
          experience: { title: 'Sightseeing', desc: `Experience the local culture in ${titleCaseName}`, img: '/images/guide_hero.png' },
          cities: []
        })
      }
    }

    // Map DB record structures to match the frontend expectations
    return NextResponse.json({
      name: guide.name,
      desc: guide.desc,
      heroImg: guide.hero_img,
      stats: {
        capital: guide.capital,
        currency: guide.currency,
        language: guide.language,
        timeZone: guide.time_zone,
        bestTime: guide.best_time
      },
      cards: (cards || []).map(c => ({ title: c.title, desc: c.desc, icon_name: c.icon_name })),
      emergency: {
        police: guide.emergency_police,
        ambulance: guide.emergency_ambulance,
        embassy: guide.emergency_embassy
      },
      connectivity: (items || []).filter(i => i.type === 'connectivity').map(item => ({ title: item.title, desc: item.desc })),
      etiquette: (items || []).filter(i => i.type === 'etiquette').map(item => ({ title: item.title, desc: item.desc })),
      experience: {
        title: guide.experience_title,
        desc: guide.experience_desc,
        img: guide.experience_img
      },
      cities: (cities || []).map(city => ({ name: city.name, desc: city.desc, img: city.img_url }))
    })
  } catch (error: any) {
    console.error('Fetch country dynamic data error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch country data' }, { status: 500 })
  }
}
