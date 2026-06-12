import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // 1. Check if user exists in auth.users
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }

    const user = users.find(u => u.email === email.trim().toLowerCase())

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // 2. Fetch profile preferences to check OTP
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const preferences = profile?.preferences || {}

    if (preferences.reset_otp !== otp || !preferences.otp_expires_at) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    if (Date.now() > preferences.otp_expires_at) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // 3. OTP is valid! Generate a secure reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    preferences.reset_token = resetToken
    preferences.reset_otp = null // Invalidate OTP so it can't be reused

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ preferences })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, resetToken })
  } catch (error: any) {
    console.error('Verify OTP API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
