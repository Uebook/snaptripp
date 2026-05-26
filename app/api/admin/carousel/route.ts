export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all carousel items
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

// POST create a carousel item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { country, region, description, label, location_tag, image_url, bg_image_url } = body

    if (!country || !region || !description || !label || !location_tag || !image_url || !bg_image_url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('home_carousel')
      .insert({
        country: country.trim(),
        region: region.trim(),
        description: description.trim(),
        label: label.trim(),
        location_tag: location_tag.trim(),
        image_url: image_url.trim(),
        bg_image_url: bg_image_url.trim(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Create carousel item error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create carousel item' }, { status: 500 })
  }
}

// PUT update a carousel item
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, country, region, description, label, location_tag, image_url, bg_image_url } = body

    if (!id || !country || !region || !description || !label || !location_tag || !image_url || !bg_image_url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('home_carousel')
      .update({
        country: country.trim(),
        region: region.trim(),
        description: description.trim(),
        label: label.trim(),
        location_tag: location_tag.trim(),
        image_url: image_url.trim(),
        bg_image_url: bg_image_url.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Update carousel item error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update carousel item' }, { status: 500 })
  }
}

// DELETE a carousel item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('home_carousel')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete carousel item error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete carousel item' }, { status: 500 })
  }
}
