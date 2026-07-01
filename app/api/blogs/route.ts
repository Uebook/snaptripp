export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all published blogs (public read-only)
export async function GET() {
  try {
    const { data: blogs, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('status', 'Published')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "blogs" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "blogs" table does not exist in the database.'
        }, { status: 404 })
      }
      throw error
    }

    const response = NextResponse.json({ blogs })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch blogs error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch blogs' }, { status: 500 })
  }
}
