import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

export async function POST(request: Request) {
  try {
    // Dynamically parse env files just in case the server wasn't restarted
    const loadEnv = (file: string) => {
      try {
        const envPath = path.resolve(process.cwd(), file)
        if (fs.existsSync(envPath)) {
          const parsed = dotenv.parse(fs.readFileSync(envPath))
          for (const key in parsed) {
            if (!process.env[key]) process.env[key] = parsed[key]
          }
        }
      } catch (e) {}
    }
    
    // Load .env.local, and fallback to .env.example if user put creds there
    loadEnv('.env.local')
    loadEnv('.env.example')

    // Configure nodemailer transporter dynamically to pick up fresh env vars
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.replace(/['"]/g, ''), // Strip quotes just in case
      },
    })

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 1. Check if user exists in auth.users
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }

    const user = users.find(u => u.email === email.trim().toLowerCase())

    if (!user) {
      // Return success anyway to prevent email enumeration, but we don't send an email
      return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' })
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes from now

    // 3. Save OTP in profile preferences JSONB
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const preferences = profile?.preferences || {}
    preferences.reset_otp = otp
    preferences.otp_expires_at = expiresAt

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ preferences })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // 4. Send email via SMTP
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SnapTrip" <noreply@snaptrip.com>',
      to: user.email,
      subject: 'Your Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
          <h2 style="color: #031B4E;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px;">Hello,</p>
          <p style="color: #4b5563; font-size: 16px;">We received a request to reset the password for your SnapTrip account. Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #031B4E;">${otp}</span>
          </div>
          <p style="color: #4b5563; font-size: 16px;">This code will expire in 15 minutes.</p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (error: any) {
    console.error('Forgot password API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
