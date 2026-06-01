import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const country = searchParams.get('country')

    if (!country) return NextResponse.json({ success: false, error: 'Country missing' }, { status: 400 })

    try {
        const { data, error } = await supabaseAdmin
            .from('published_places')
            .select('id')
            .eq('country', country)
        
        if (error) throw error

        return NextResponse.json({ success: true, data: data.map(d => d.id) })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
