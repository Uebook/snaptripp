import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: pages, error } = await supabaseAdmin
      .from('pages')
      .select('id, slug, title, meta_description, updated_at')
      .order('title', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "pages" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "pages" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ pages })
  } catch (error: any) {
    console.error('Fetch pages error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch pages' }, { status: 500 })
  }
}
