export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET footer settings
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('footer_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "footer_settings" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "footer_settings" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    const response = NextResponse.json({ settings })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch footer settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch footer settings' }, { status: 500 })
  }
}

// PUT update footer settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { description, phone, email, facebook_url, twitter_url, instagram_url, youtube_url } = body

    if (!description || !phone || !email) {
      return NextResponse.json({ error: 'Description, Phone, and Email are required' }, { status: 400 })
    }

    const { data: settings, error } = await supabaseAdmin
      .from('footer_settings')
      .upsert({
        id: 'default',
        description: description.trim(),
        phone: phone.trim(),
        email: email.trim(),
        facebook_url: (facebook_url || '').trim(),
        twitter_url: (twitter_url || '').trim(),
        instagram_url: (instagram_url || '').trim(),
        youtube_url: (youtube_url || '').trim(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error('Update footer settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update footer settings' }, { status: 500 })
  }
}
