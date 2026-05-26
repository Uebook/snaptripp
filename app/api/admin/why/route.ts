import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all why items
export async function GET() {
  try {
    const { data: items, error } = await supabaseAdmin
      .from('why_snaptrip')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "why_snaptrip" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "why_snaptrip" table does not exist in the database.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('Fetch why items error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch why items' }, { status: 500 })
  }
}

// POST create a why item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { icon, title, text } = body

    if (!icon || !title || !text) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('why_snaptrip')
      .insert({
        icon: icon.trim(),
        title: title.trim(),
        text: text.trim(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Create why item error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create why item' }, { status: 500 })
  }
}

// PUT update a why item
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, icon, title, text } = body

    if (!id || !icon || !title || !text) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('why_snaptrip')
      .update({
        icon: icon.trim(),
        title: title.trim(),
        text: text.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Update why item error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update why item' }, { status: 500 })
  }
}

// DELETE a why item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('why_snaptrip')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete why item error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete why item' }, { status: 500 })
  }
}
