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
    }

    const defaultSteps = [
      // Planning steps
      { type: 'planning', step_number: '01', title: 'Discover Your Perfect Destination', description: 'Find destinations that match your travel style, interests, and preferences. Explore new places with personalized recommendations.' },
      { type: 'planning', step_number: '02', title: 'Flexible Itinerary Management', description: 'Easily add, remove, or rearrange activities and destinations throughout your journey.' },
      { type: 'planning', step_number: '03', title: 'Travel Smarter, Stress Less', description: 'Keep your plans organized in one place and make changes effortlessly as your trip evolves.' },
      
      // Walkthrough steps
      { id: 'h1', type: 'how', step_number: '01', title: 'Pick your destination', description: 'Search 10,000+ destinations. See trending spots, seasonal highlights, and visa requirements upfront - no surprises at checkout.', display_order: 0 },
      { id: 'h2', type: 'how', step_number: '02', title: 'Choose your travel style', description: 'Adventure, culture, relaxation, or food tour? Tell us your vibe and group size - solo, couple, family, or squad- and we tailor everything.', display_order: 1 },
      { id: 'h3', type: 'how', step_number: '03', title: 'Plan Your Schedule', description: 'Select the number of days for your trip and let SnapTrip create a balanced itinerary.', display_order: 2 },
      { id: 'h4', type: 'how', step_number: '04', title: 'Select attractions', description: 'Browse curated must-sees and hidden gems. Add or remove stops-the AI instantly recalculates your daily route to cut travel time.', display_order: 3 },
      { id: 'h5', type: 'how', step_number: '05', title: 'Itinerary Complete!', description: 'Download your full plan maps, bookings, emergency contacts, and cost summary. Works offline too-ready wherever you land.', display_order: 4 }
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
