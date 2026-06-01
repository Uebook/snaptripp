export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // 1. Fetch settings
    let { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('how_it_works_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    // 2. Fetch steps
    let { data: stepsData, error: stepsError } = await supabaseAdmin
      .from('how_it_works_steps')
      .select('*')
      .order('display_order', { ascending: true })

    const defaultSettings = {
      hero_badge: 'INTRODUCING ATLAS LUMINA',
      hero_title: 'Crafting Your Next Odyssey.',
      hero_description: 'A fusion of high-end editorial curation and artificial intelligence. SnapTrip transforms wandering into precision exploration.',
      hero_bg_image: '/images/how_hero.png',
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
    }

    const defaultSteps = [
      // Planning steps
      { type: 'planning', step_number: '01', title: 'Define Your Muse', description: 'Tell our AI your desired mood—whether it\'s the quiet zen of Kyoto or the kinetic pulse of Berlin.' },
      { type: 'planning', step_number: '02', title: 'Curated Logic', description: 'We calculate flight windows, seasonal shifts, and cultural events to anchor your dates perfectly.' },
      { type: 'planning', step_number: '03', title: 'Dynamic Refinement', description: 'Your itinerary lives and breathes. Adjust one stop, and our system re-optimizes your entire journey.' },
      
      // Walkthrough steps
      { type: 'how', step_number: '01', title: 'Pick your destination', description: 'Search 10,000+ destinations. See trending spots, seasonal highlights.' },
      { type: 'how', step_number: '02', title: 'Choose your travel style', description: 'Adventure, culture, or food tour? Tell us your vibe.' },
      { type: 'how', step_number: '03', title: 'Set duration & budget', description: 'Pick travel dates and a daily budget auto-calculated.' },
      { type: 'how', step_number: '04', title: 'Select attractions', description: 'Browse curated must-sees and hidden gems.' },
      { type: 'how', step_number: '05', title: 'Itinerary Complete!', description: 'Download your full plan maps and bookings.' }
    ]

    const isSettingsMissing = settingsError && (settingsError.code === 'PGRST205' || settingsError.message.includes('relation "how_it_works_settings" does not exist'))
    const isStepsMissing = stepsError && (stepsError.code === 'PGRST205' || stepsError.message.includes('relation "how_it_works_steps" does not exist'))

    const response = NextResponse.json({
      settings: isSettingsMissing || !settingsData ? defaultSettings : { ...defaultSettings, ...settingsData },
      steps: isStepsMissing || !stepsData ? defaultSteps : stepsData
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response

  } catch (error: any) {
    console.error('Fetch how-it-works-data error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch how-it-works data' }, { status: 500 })
  }
}
