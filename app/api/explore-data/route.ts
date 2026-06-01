export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // 1. Fetch settings
    let { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('explore_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    // 2. Fetch featured guides
    let { data: guidesData, error: guidesError } = await supabaseAdmin
      .from('country_guides')
      .select('id, name, desc, tag, hero_img, is_featured')
      .eq('is_featured', true)

    const defaultSettings = {
      hero_tagline: 'Explore the Unseen',
      hero_title: 'Where will your curiosity lead you next?',
      quote_text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
      quote_author: 'MARCEL PROUST',
      hero_bg_image: '/images/guide_hero.png'
    }

    const defaultGuides = [
      { id: 'japan', name: 'Japan', desc: 'From the neon lifelines of Shinjuku to the silent moss gardens of Kyoto, discover the duality of the rising sun.', tag: 'Culture', hero_img: '/images/guide_japan.png', is_featured: true },
      { id: 'italy', name: 'Italy', desc: 'The ultimate guide to the rolling hills, hidden vineyards, and the slow life of the Italian countryside.', tag: 'Editorial', hero_img: '/images/guide_italy.png', is_featured: true },
      { id: 'morocco', name: 'Morocco', desc: 'Exploring the vibrant souks of Marrakesh and the blue-washed walls of Chefchaouen.', tag: 'Lifestyle', hero_img: '/images/guide_morocco.png', is_featured: true },
      { id: 'france', name: 'France', desc: 'Journeying through the lavender fields of Provence and the rugged coastline of Brittany.', tag: 'Vintage', hero_img: '/images/guide_france.png', is_featured: true }
    ]

    const isSettingsMissing = settingsError && (settingsError.code === 'PGRST205' || settingsError.message.includes('relation "explore_settings" does not exist'))
    const isGuidesMissing = guidesError && (guidesError.code === 'PGRST205' || guidesError.message.includes('relation "country_guides" does not exist'))

    // Reconstruct list structure expected by page
    const guides = isGuidesMissing || !guidesData || guidesData.length === 0 ? defaultGuides : guidesData.map(g => ({
      id: g.id,
      title: g.name + ': ' + g.tag + ' Guide', // matches static layout format if needed, but let's provide direct properties
      desc: g.desc,
      image: g.hero_img,
      tag: g.tag
    }))

    return NextResponse.json({
      settings: isSettingsMissing || !settingsData ? defaultSettings : settingsData,
      guides
    })
  } catch (error: any) {
    console.error('Fetch explore data error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch explore data' }, { status: 500 })
  }
}
