export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all carousel items (public read-only)
export async function GET() {
  try {
    const { data: items, error } = await supabaseAdmin
      .from('home_carousel')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "home_carousel" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "home_carousel" table does not exist in the database.'
        }, { status: 404 })
      }
      throw error
    }

    const response = NextResponse.json({ items })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch carousel error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch carousel items' }, { status: 500 })
  }
}
