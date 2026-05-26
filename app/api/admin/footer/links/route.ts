export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all footer links
export async function GET() {
  try {
    const { data: links, error } = await supabaseAdmin
      .from('footer_links')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "footer_links" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "footer_links" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    const response = NextResponse.json({ links })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch footer links error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch footer links' }, { status: 500 })
  }
}

// POST create a footer link
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { label, url, category, display_order } = body

    if (!label || !url || !category) {
      return NextResponse.json({ error: 'Label, URL, and Category are required' }, { status: 400 })
    }

    const { data: link, error } = await supabaseAdmin
      .from('footer_links')
      .insert({
        label: label.trim(),
        url: url.trim(),
        category: category.trim(),
        display_order: typeof display_order === 'number' ? display_order : 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, link })
  } catch (error: any) {
    console.error('Create footer link error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create footer link' }, { status: 500 })
  }
}

// PUT update a footer link
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, label, url, category, display_order } = body

    if (!id || !label || !url || !category) {
      return NextResponse.json({ error: 'ID, Label, URL, and Category are required' }, { status: 400 })
    }

    const { data: link, error } = await supabaseAdmin
      .from('footer_links')
      .update({
        label: label.trim(),
        url: url.trim(),
        category: category.trim(),
        display_order: typeof display_order === 'number' ? display_order : 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, link })
  } catch (error: any) {
    console.error('Update footer link error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update footer link' }, { status: 500 })
  }
}

// DELETE a footer link
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('footer_links')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete footer link error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete footer link' }, { status: 500 })
  }
}
