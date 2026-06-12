import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && session) {
      try {
        const { supabaseAdmin } = await import('@/lib/supabaseAdmin')
        const user = session.user
        const email = user.email
        const fullName = user.user_metadata?.full_name || ''
        
        const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id').eq('id', user.id).maybeSingle()
        
        if (!existingProfile) {
          const cleanName = fullName ? fullName.toLowerCase().replace(/[^a-z0-9]/g, '') : (email?.split('@')[0] || 'traveler')
          const suffix = Math.floor(1000 + Math.random() * 9000)
          
          await supabaseAdmin.from('profiles').insert({
            id: user.id,
            email: email,
            username: `${cleanName}-${suffix}`,
            full_name: fullName,
            avatar_url: user.user_metadata?.avatar_url || ''
          })
        } else {
          await supabaseAdmin.from('profiles').update({ email: email }).eq('id', user.id)
        }
      } catch (err) {
        console.error('Error syncing profile in callback:', err)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
