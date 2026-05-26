export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all detail relations for a country
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('country_id')

    if (!countryId) {
      return NextResponse.json({ error: 'Country ID is required' }, { status: 400 })
    }

    // 1. Fetch cards
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('country_guide_cards')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })

    // 2. Fetch items (connectivity & etiquette)
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('country_guide_items')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })

    // 3. Fetch cities
    const { data: cities, error: citiesError } = await supabaseAdmin
      .from('country_guide_cities')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })

    if (cardsError) throw cardsError
    if (itemsError) throw itemsError
    if (citiesError) throw citiesError

    const response = NextResponse.json({
      cards: cards || [],
      connectivity: (items || []).filter(i => i.type === 'connectivity'),
      etiquette: (items || []).filter(i => i.type === 'etiquette'),
      cities: cities || []
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch country guide details error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch country guide details' }, { status: 500 })
  }
}

// PUT bulk update country details
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { country_id, cards, connectivity, etiquette, cities } = body

    if (!country_id) {
      return NextResponse.json({ error: 'Country ID is required' }, { status: 400 })
    }

    // Wrap in a simple transactional block (consecutive queries)
    // 1. Delete old cards, items, and cities
    await supabaseAdmin.from('country_guide_cards').delete().eq('country_id', country_id)
    await supabaseAdmin.from('country_guide_items').delete().eq('country_id', country_id)
    await supabaseAdmin.from('country_guide_cities').delete().eq('country_id', country_id)

    // 2. Insert new cards
    if (cards && cards.length > 0) {
      const formattedCards = cards.map((c: any, index: number) => ({
        country_id,
        icon_name: c.icon_name || 'about',
        title: c.title.trim(),
        desc: c.desc.trim(),
        display_order: index
      }))
      const { error: e1 } = await supabaseAdmin.from('country_guide_cards').insert(formattedCards)
      if (e1) throw e1
    }

    // 3. Insert new logistics items (connectivity + etiquette)
    const formattedItems: any[] = []
    if (connectivity && connectivity.length > 0) {
      connectivity.forEach((item: any, index: number) => {
        formattedItems.push({
          country_id,
          type: 'connectivity',
          title: item.title.trim(),
          desc: item.desc.trim(),
          display_order: index
        })
      })
    }
    if (etiquette && etiquette.length > 0) {
      etiquette.forEach((item: any, index: number) => {
        formattedItems.push({
          country_id,
          type: 'etiquette',
          title: item.title.trim(),
          desc: item.desc.trim(),
          display_order: index
        })
      })
    }
    if (formattedItems.length > 0) {
      const { error: e2 } = await supabaseAdmin.from('country_guide_items').insert(formattedItems)
      if (e2) throw e2
    }

    // 4. Insert new cities
    if (cities && cities.length > 0) {
      const formattedCities = cities.map((c: any, index: number) => ({
        country_id,
        name: c.name.trim(),
        desc: c.desc.trim(),
        img_url: c.img_url.trim(),
        display_order: index
      }))
      const { error: e3 } = await supabaseAdmin.from('country_guide_cities').insert(formattedCities)
      if (e3) throw e3
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Bulk update country guide details error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update country guide details' }, { status: 500 })
  }
}
