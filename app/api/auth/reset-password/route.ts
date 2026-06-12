import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email, resetToken, newPassword } = await request.json()

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Check if user exists in auth.users
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }

    const user = users.find(u => u.email === email.trim().toLowerCase())

    if (!user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
    }

    // 2. Fetch profile preferences to check reset_token
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const preferences = profile?.preferences || {}

    if (!preferences.reset_token || preferences.reset_token !== resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token. Please request a new OTP.' }, { status: 400 })
    }

    // 3. Update the password
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (updateAuthError) {
      throw updateAuthError
    }

    // 4. Invalidate reset token
    preferences.reset_token = null
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ preferences })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error: any) {
    console.error('Reset Password API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
