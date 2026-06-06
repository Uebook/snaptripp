import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { first_name, last_name, email, phone, subject, message } = body

    if (!first_name || !last_name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        phone: phone ? phone.trim() : null,
        message: message.trim(),
        status: 'unread'
      })

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "contact_messages" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "contact_messages" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Submit contact message error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit message' }, { status: 500 })
  }
}
