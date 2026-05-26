import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all homepage dynamic data
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch testimonials
    const { data: testimonials, error: tError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    // Fetch why_snaptrip
    const { data: whySnaptrip, error: wError } = await supabaseAdmin
      .from('why_snaptrip')
      .select('*')
      .order('created_at', { ascending: true })

    // Fetch latest 4 published blogs for curated stories
    const { data: blogs, error: bError } = await supabaseAdmin
      .from('blogs')
      .select('title, slug, excerpt, category, read_time, image_url, created_at')
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .limit(4)

    // Check for errors
    if (tError) console.error('Testimonials fetch error:', tError)
    if (wError) console.error('Why SnapTrip fetch error:', wError)
    if (bError) console.error('Blogs fetch error:', bError)

    // Determine missing tables
    const missingTables = [];
    if (tError?.code === 'PGRST205' || tError?.message.includes('relation "testimonials" does not exist')) missingTables.push('testimonials');
    if (wError?.code === 'PGRST205' || wError?.message.includes('relation "why_snaptrip" does not exist')) missingTables.push('why_snaptrip');

    if (missingTables.length > 0) {
      return NextResponse.json({ 
        error: 'tables_missing',
        message: 'Some tables do not exist in the database.',
        missingTables
      }, { status: 404 })
    }

    return NextResponse.json({ 
      testimonials: testimonials || [],
      whySnaptrip: whySnaptrip || [],
      blogs: blogs || []
    })

  } catch (error: any) {
    console.error('Fetch homepage data error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch homepage data' }, { status: 500 })
  }
}
