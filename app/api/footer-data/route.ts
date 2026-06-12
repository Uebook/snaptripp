export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // 1. Fetch settings
    let { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('footer_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    // 2. Fetch links
    let { data: linksData, error: linksError } = await supabaseAdmin
      .from('footer_links')
      .select('*')
      .order('display_order', { ascending: true })

    const defaultSettings = {
      description: 'Simplifying the way you plan, organize, and experience travel — so you can focus on what truly matters: the journey.',
      phone: '',
      email: 'support@snaptrip.io',
      facebook_url: '#',
      twitter_url: '#',
      instagram_url: '#',
      youtube_url: '#'
    }

    const defaultLinks = [
      { label: 'Plan Your Trip', url: '/plan', category: 'Quick Links' },
      { label: 'Travel Map', url: '/travel-map', category: 'Quick Links' },
      { label: 'Explore Countries', url: '/explore', category: 'Quick Links' },
      { label: 'How snaptrip works', url: '/how-it-works', category: 'Quick Links' },
      { label: 'Contact Us', url: '/contact', category: 'Quick Links' },
      { label: 'Blog', url: '/blog', category: 'Quick Links' },
      { label: 'Privacy Policy', url: '/privacy', category: 'Support' },
      { label: 'Terms Of Use', url: '/terms', category: 'Support' }
    ]

    // If tables are missing or not created yet, return fallback defaults
    const isSettingsMissing = settingsError && (settingsError.code === 'PGRST205' || settingsError.message.includes('relation "footer_settings" does not exist'))
    const isLinksMissing = linksError && (linksError.code === 'PGRST205' || linksError.message.includes('relation "footer_links" does not exist'))

    const response = NextResponse.json({
      settings: isSettingsMissing || !settingsData ? defaultSettings : settingsData,
      links: isLinksMissing || !linksData ? defaultLinks : linksData
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response

  } catch (error: any) {
    console.error('Fetch footer-data error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch footer data' }, { status: 500 })
  }
}
