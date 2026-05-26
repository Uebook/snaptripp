export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET how_it_works settings
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('how_it_works_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "how_it_works_settings" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "how_it_works_settings" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    const response = NextResponse.json({ settings })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Fetch how_it_works settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update how_it_works settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      hero_badge, hero_title, hero_description, planning_title, how_works_title, how_works_desc,
      demo_i_time_1, demo_i_label_1, demo_i_title_1, demo_i_price_1, demo_i_desc_1, demo_i_tags_1,
      demo_i_time_2, demo_i_label_2, demo_i_title_2, demo_i_price_2, demo_i_desc_2, demo_i_img_2,
      demo_i_ai_suggestion, demo_map_placeholder, demo_support_placeholder
    } = body

    if (!hero_badge || !hero_title || !hero_description || !planning_title || !how_works_title || !how_works_desc) {
      return NextResponse.json({ error: 'Core fields are required' }, { status: 400 })
    }

    const updateObj: any = {
      id: 'default',
      hero_badge: hero_badge.trim(),
      hero_title: hero_title.trim(),
      hero_description: hero_description.trim(),
      planning_title: planning_title.trim(),
      how_works_title: how_works_title.trim(),
      how_works_desc: how_works_desc.trim(),
      updated_at: new Date().toISOString()
    }

    if (demo_i_time_1 !== undefined) updateObj.demo_i_time_1 = demo_i_time_1.trim();
    if (demo_i_label_1 !== undefined) updateObj.demo_i_label_1 = demo_i_label_1.trim();
    if (demo_i_title_1 !== undefined) updateObj.demo_i_title_1 = demo_i_title_1.trim();
    if (demo_i_price_1 !== undefined) updateObj.demo_i_price_1 = demo_i_price_1.trim();
    if (demo_i_desc_1 !== undefined) updateObj.demo_i_desc_1 = demo_i_desc_1.trim();
    if (demo_i_tags_1 !== undefined) updateObj.demo_i_tags_1 = demo_i_tags_1.trim();
    if (demo_i_time_2 !== undefined) updateObj.demo_i_time_2 = demo_i_time_2.trim();
    if (demo_i_label_2 !== undefined) updateObj.demo_i_label_2 = demo_i_label_2.trim();
    if (demo_i_title_2 !== undefined) updateObj.demo_i_title_2 = demo_i_title_2.trim();
    if (demo_i_price_2 !== undefined) updateObj.demo_i_price_2 = demo_i_price_2.trim();
    if (demo_i_desc_2 !== undefined) updateObj.demo_i_desc_2 = demo_i_desc_2.trim();
    if (demo_i_img_2 !== undefined) updateObj.demo_i_img_2 = demo_i_img_2.trim();
    if (demo_i_ai_suggestion !== undefined) updateObj.demo_i_ai_suggestion = demo_i_ai_suggestion.trim();
    if (demo_map_placeholder !== undefined) updateObj.demo_map_placeholder = demo_map_placeholder.trim();
    if (demo_support_placeholder !== undefined) updateObj.demo_support_placeholder = demo_support_placeholder.trim();

    const { data: settings, error } = await supabaseAdmin
      .from('how_it_works_settings')
      .upsert(updateObj)
      .select()
      .single()

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'migration_missing',
          message: 'One or more walkthrough demo columns do not exist. Please run the SQL migration script: 20260526_add_demo_to_how_it_works_settings.sql in your Supabase SQL editor.'
        }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error('Update how_it_works settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
  }
}
