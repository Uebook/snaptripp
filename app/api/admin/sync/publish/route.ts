import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
    try {
        const { action, place, places, id, ids } = await req.json()

        if (action === 'publish') {
            const { error } = await supabaseAdmin.from('published_places').upsert(place)
            if (error) throw error
            return NextResponse.json({ success: true })
        } 
        
        if (action === 'unpublish') {
            const { error } = await supabaseAdmin.from('published_places').delete().eq('id', id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        if (action === 'publish_bulk') {
            const { error } = await supabaseAdmin.from('published_places').upsert(places)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        if (action === 'unpublish_bulk') {
            const { error } = await supabaseAdmin.from('published_places').delete().in('id', ids)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (err: any) {
        console.error('Publish Error:', err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
