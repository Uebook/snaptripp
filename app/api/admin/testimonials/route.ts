export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all testimonials
export async function GET() {
  try {
    const { data: items, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "testimonials" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "testimonials" table does not exist in the database.'
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
    console.error('Fetch testimonials error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch testimonials' }, { status: 500 })
  }
}

// POST create a testimonial
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, location, quote, avatar_url, image_url } = body

    if (!name || !location || !quote || !avatar_url || !image_url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('testimonials')
      .insert({
        name: name.trim(),
        location: location.trim(),
        quote: quote.trim(),
        avatar_url: avatar_url.trim(),
        image_url: image_url.trim(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create testimonial' }, { status: 500 })
  }
}

// PUT update a testimonial
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, location, quote, avatar_url, image_url } = body

    if (!id || !name || !location || !quote || !avatar_url || !image_url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('testimonials')
      .update({
        name: name.trim(),
        location: location.trim(),
        quote: quote.trim(),
        avatar_url: avatar_url.trim(),
        image_url: image_url.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Update testimonial error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update testimonial' }, { status: 500 })
  }
}

// DELETE a testimonial
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete testimonial error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete testimonial' }, { status: 500 })
  }
}
