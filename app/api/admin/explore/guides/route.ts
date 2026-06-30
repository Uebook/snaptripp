export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all country guides
export async function GET() {
  try {
    const { data: guides, error } = await supabaseAdmin
      .from('country_guides')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "country_guides" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "country_guides" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    const response = NextResponse.json({ guides })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch country guides error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch country guides' }, { status: 500 })
  }
}

// POST create a country guide
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, desc, tag, hero_img, is_featured, capital, currency, language, time_zone, best_time, emergency_police, emergency_ambulance, emergency_embassy, experience_title, experience_desc, experience_img, sections_data } = body

    if (!id || !name || !desc || !tag || !hero_img || !capital || !currency || !language || !time_zone || !best_time || !emergency_police || !emergency_ambulance || !emergency_embassy || !experience_title || !experience_desc || !experience_img) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const cleanId = id.trim().toLowerCase().replace(/\s+/g, '-')

    const { data: guide, error } = await supabaseAdmin
      .from('country_guides')
      .insert({
        id: cleanId,
        name: name.trim(),
        desc: desc.trim(),
        tag: tag.trim(),
        hero_img: hero_img.trim(),
        is_featured: !!is_featured,
        capital: capital.trim(),
        currency: currency.trim(),
        language: language.trim(),
        time_zone: time_zone.trim(),
        best_time: best_time.trim(),
        emergency_police: emergency_police.trim(),
        emergency_ambulance: emergency_ambulance.trim(),
        emergency_embassy: emergency_embassy.trim(),
        experience_title: experience_title.trim(),
        experience_desc: experience_desc.trim(),
        experience_img: experience_img.trim(),
        sections_data: sections_data || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A country guide with this ID already exists.' }, { status: 400 })
      }
      if (error.message && (error.message.includes('column "sections_data"') || error.message.includes('sections_data'))) {
        return NextResponse.json({ 
          error: 'migration_missing',
          message: 'The "sections_data" column does not exist in the "country_guides" table. Please run the SQL migration script (20260630_add_sections_data.sql) in your Supabase SQL editor.'
        }, { status: 400 })
      }
      throw error
    }

    // Seed some empty/placeholder cards, connectivity items, and cities for the new country guide
    await supabaseAdmin.from('country_guide_cards').insert([
      { country_id: cleanId, icon_name: 'about', title: 'About', desc: `Overview of ${name.trim()}.`, display_order: 0 },
      { country_id: cleanId, icon_name: 'snapshot', title: 'Travel Snapshot', desc: `Highlights of ${name.trim()}.`, display_order: 1 },
      { country_id: cleanId, icon_name: 'clock', title: 'Best Time to Visit', desc: `Ideal travel seasons for ${name.trim()}.`, display_order: 2 }
    ])

    return NextResponse.json({ success: true, guide })
  } catch (error: any) {
    console.error('Create country guide error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create country guide' }, { status: 500 })
  }
}

// PUT update a country guide
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, desc, tag, hero_img, is_featured, capital, currency, language, time_zone, best_time, emergency_police, emergency_ambulance, emergency_embassy, experience_title, experience_desc, experience_img, sections_data } = body

    if (!id || !name || !desc || !tag || !hero_img || !capital || !currency || !language || !time_zone || !best_time || !emergency_police || !emergency_ambulance || !emergency_embassy || !experience_title || !experience_desc || !experience_img) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: guide, error } = await supabaseAdmin
      .from('country_guides')
      .update({
        name: name.trim(),
        desc: desc.trim(),
        tag: tag.trim(),
        hero_img: hero_img.trim(),
        is_featured: !!is_featured,
        capital: capital.trim(),
        currency: currency.trim(),
        language: language.trim(),
        time_zone: time_zone.trim(),
        best_time: best_time.trim(),
        emergency_police: emergency_police.trim(),
        emergency_ambulance: emergency_ambulance.trim(),
        emergency_embassy: emergency_embassy.trim(),
        experience_title: experience_title.trim(),
        experience_desc: experience_desc.trim(),
        experience_img: experience_img.trim(),
        sections_data: sections_data || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.message && (error.message.includes('column "sections_data"') || error.message.includes('sections_data'))) {
        return NextResponse.json({ 
          error: 'migration_missing',
          message: 'The "sections_data" column does not exist in the "country_guides" table. Please run the SQL migration script (20260630_add_sections_data.sql) in your Supabase SQL editor.'
        }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, guide })
  } catch (error: any) {
    console.error('Update country guide error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update country guide' }, { status: 500 })
  }
}

// DELETE a country guide
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('country_guides')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete country guide error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete country guide' }, { status: 500 })
  }
}
