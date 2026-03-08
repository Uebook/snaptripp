import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
       try {
              const { userId, action } = await req.json()

              if (!userId || !action) {
                     return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
              }

              if (action === 'block') {
                     const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                            ban_duration: '876000h' // Effective permanent ban
                     })

                     if (error) throw error
              } else if (action === 'unblock') {
                     const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                            ban_duration: 'none'
                     })

                     if (error) throw error
              } else {
                     return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
              }

              return NextResponse.json({ success: true })
       } catch (error: any) {
              console.error('Error blocking/unblocking user:', error)
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
