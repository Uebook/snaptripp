import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
       try {
              const body = await request.json()
              const { email, password, fullName, username } = body

              if (!email || !password || !username) {
                     return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 })
              }

              // Check if username already exists globally
              const { data: existingUser, error: checkError } = await supabaseAdmin
                     .from('profiles')
                     .select('id')
                     .eq('username', username)
                     .single()

              if (existingUser && !checkError) {
                     return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
              }

              // Use Supabase Admin auth to create a user directly bypassing signup confirmation
              const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                     email,
                     password,
                     email_confirm: true,
                     user_metadata: {
                            full_name: fullName,
                            username: username
                     }
              })

              if (authError) {
                     return NextResponse.json({ error: authError.message }, { status: 400 })
              }

              // Since we create via admin, the profile trigger *should* run if you have one, 
              // but we can also manually insert or update the profile to be safe.
              if (authData.user) {
                     const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
                            id: authData.user.id,
                            email: email,
                            username: username,
                            full_name: fullName,
                            updated_at: new Date().toISOString(),
                     })

                     if (profileError) {
                            console.warn("Could not upsert profile directly, might already exist via trigger:", profileError)
                            // If it failed because the trigger ran but didn't set username, try to strictly update the username
                            await supabaseAdmin.from('profiles').update({
                                   username: username,
                                   full_name: fullName
                            }).eq('id', authData.user.id)
                     }
              }

              return NextResponse.json({ success: true, user: authData.user })
       } catch (error: any) {
              console.error('Add user error:', error)
              return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
       }
}

