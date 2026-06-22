import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert([{ email }])
      
    if (error) {
        // If table doesn't exist or other error, just ignore or log
        console.error('Newsletter insert error:', error)
        // If it's a unique violation, that's fine, they are already subscribed
        if (error.code !== '23505') {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { email, status } = await request.json()
    if (!email || !status) {
      return NextResponse.json({ error: 'Email and status are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email, status }, { onConflict: 'email' })
      
    if (error) {
      console.error('Newsletter update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
