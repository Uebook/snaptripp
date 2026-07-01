export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET unique countries for places (public read-only)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('places')
      .select('country')
      .not('country', 'is', null)

    if (error) throw error

    const uniqueCountries = Array.from(new Set(data.map((item: any) => item.country)))

    return NextResponse.json({
      success: true,
      countries: uniqueCountries
    })
  } catch (error: any) {
    console.error('Fetch Countries Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch countries' }, { status: 500 })
  }
}
