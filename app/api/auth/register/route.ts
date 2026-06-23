import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, username } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // 1. Generate or validate username
    let finalUsername = username ? username.toLowerCase().trim() : ''
    if (!finalUsername) {
      const cleanName = fullName ? fullName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'traveler'
      const suffix = Math.floor(1000 + Math.random() * 9000)
      finalUsername = `${cleanName}-${suffix}`
    }

    // Ensure username is unique globally
    let isTaken = true
    let attempts = 0
    while (isTaken && attempts < 10) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', finalUsername)
        .maybeSingle()

      if (!existingUser) {
        isTaken = false
      } else {
        attempts++
        const cleanName = fullName ? fullName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'traveler'
        const suffix = Math.floor(1000 + Math.random() * 9000)
        finalUsername = `${cleanName}-${suffix}`
      }
    }

    // 2. Create the user using Admin auth to auto-confirm email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username: finalUsername,
        phone: phone || ''
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

      if (authData.user) {
      // 3. Update the profile table manually to store extra metadata
      const defaultPreferences = {
        email_notifications: true,
        travel_recommendations: true,
        public_profile: true,
        newsletter_subscription: true
      }

      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: authData.user.id,
        email: authData.user.email,
        username: finalUsername,
        full_name: fullName || '',
        phone: phone || '',
        preferences: defaultPreferences,
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.warn('Could not upsert profile directly, trying update:', profileError)
        // If upsert failed, try simple update
        await supabaseAdmin.from('profiles').update({
          email: authData.user.email,
          username: finalUsername,
          full_name: fullName || '',
          phone: phone || '',
          preferences: defaultPreferences,
          updated_at: new Date().toISOString(),
        }).eq('id', authData.user.id)
      }

      // Auto-enroll in newsletter
      if (authData.user.email) {
        try {
          await supabaseAdmin.from('newsletter_subscribers').upsert(
            { email: authData.user.email, status: 'active' },
            { onConflict: 'email' }
          )
        } catch (e) {
          console.error('Auto-enroll newsletter error:', e)
        }
      }
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error: any) {
    console.error('Registration API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
