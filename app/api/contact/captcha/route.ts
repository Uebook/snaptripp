import { NextResponse } from 'next/server'
import crypto from 'crypto'

const SECRET = 'snaptrip-captcha-secure-signing-key-98234'

export async function GET() {
  try {
    const num1 = Math.floor(Math.random() * 9) + 1 // 1 to 9
    const num2 = Math.floor(Math.random() * 9) + 1 // 1 to 9
    const answer = num1 + num2
    const expiry = Date.now() + 10 * 60 * 1000 // 10 minutes from now

    const data = JSON.stringify({ num1, num2, answer, expiry })
    
    // Sign the data
    const hmac = crypto.createHmac('sha256', SECRET)
    hmac.update(data)
    const signature = hmac.digest('hex')

    // The token contains both the plaintext data and its signature
    const token = Buffer.from(JSON.stringify({ data, signature })).toString('base64')

    return NextResponse.json({
      question: `What is ${num1} + ${num2}?`,
      token
    })
  } catch (error: any) {
    console.error('Captcha generation error:', error)
    return NextResponse.json({ error: 'Failed to generate captcha' }, { status: 500 })
  }
}
