import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: messages, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "contact_messages" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "contact_messages" table does not exist. Please run migrations.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Fetch messages error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 })
  }
}
