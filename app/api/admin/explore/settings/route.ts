export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET explore settings
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('explore_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "explore_settings" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "explore_settings" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Fetch explore settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update explore settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { hero_tagline, hero_title, quote_text, quote_author } = body

    if (!hero_tagline || !hero_title || !quote_text || !quote_author) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: settings, error } = await supabaseAdmin
      .from('explore_settings')
      .upsert({
        id: 'default',
        hero_tagline: hero_tagline.trim(),
        hero_title: hero_title.trim(),
        quote_text: quote_text.trim(),
        quote_author: quote_author.trim(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error('Update explore settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
  }
}
