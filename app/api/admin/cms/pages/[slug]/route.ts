import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ page })
  } catch (error: any) {
    console.error('Fetch page error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch page' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    const body = await request.json()
    const { title, content, meta_description } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .update({
        title: title.trim(),
        content: content.trim(),
        meta_description: meta_description?.trim() || '',
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, page })
  } catch (error: any) {
    console.error('Update page error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update page' }, { status: 500 })
  }
}
