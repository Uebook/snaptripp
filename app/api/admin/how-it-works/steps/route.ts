import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all steps
export async function GET() {
  try {
    const { data: steps, error } = await supabaseAdmin
      .from('how_it_works_steps')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "how_it_works_steps" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "how_it_works_steps" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ steps })
  } catch (error: any) {
    console.error('Fetch how_it_works steps error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch steps' }, { status: 500 })
  }
}

// POST create a step
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, step_number, title, description, display_order } = body

    if (!type || !step_number || !title || !description) {
      return NextResponse.json({ error: 'Type, Step Number, Title, and Description are required' }, { status: 400 })
    }

    const { data: step, error } = await supabaseAdmin
      .from('how_it_works_steps')
      .insert({
        type,
        step_number: step_number.trim(),
        title: title.trim(),
        description: description.trim(),
        display_order: typeof display_order === 'number' ? display_order : 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, step })
  } catch (error: any) {
    console.error('Create how_it_works step error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create step' }, { status: 500 })
  }
}

// PUT update a step
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, type, step_number, title, description, display_order } = body

    if (!id || !type || !step_number || !title || !description) {
      return NextResponse.json({ error: 'ID, Type, Step Number, Title, and Description are required' }, { status: 400 })
    }

    const { data: step, error } = await supabaseAdmin
      .from('how_it_works_steps')
      .update({
        type,
        step_number: step_number.trim(),
        title: title.trim(),
        description: description.trim(),
        display_order: typeof display_order === 'number' ? display_order : 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, step })
  } catch (error: any) {
    console.error('Update how_it_works step error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update step' }, { status: 500 })
  }
}

// DELETE a step
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('how_it_works_steps')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete how_it_works step error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete step' }, { status: 500 })
  }
}
