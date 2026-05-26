'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './login.module.css'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let loginEmail = email.trim()
      if (!loginEmail.includes('@')) {
        // Resolve username to email from public.profiles
        const cleanUsername = loginEmail.replace('@', '').toLowerCase().trim()
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', cleanUsername)
          .maybeSingle()

        if (profileErr) throw profileErr
        if (!profileData?.email) {
          throw new Error('Username not found')
        }
        loginEmail = profileData.email
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) throw error

      if (loginEmail === 'admin@snaptrip.com') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <SiteHeader />
      <div className={styles.container} style={{ flex: 1, minHeight: 'auto' }}>
        {/* Left Panel: Narrative Landscape */}
        <div 
          className={styles.leftPanel} 
          style={{ backgroundImage: 'url("/login-bg.png")' }}
        >
          <div className={styles.overlay} />
          <div className={styles.leftContent}>
            <p className={styles.tagline}>Curated Journeys</p>
            <h1 className={styles.title}>Your next adventure begins here.</h1>
            <p className={styles.description}>
              Experience travel through the lens of a premium magazine. 
              Tailored itineraries, hidden gems, and unforgettable moments.
            </p>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className={styles.rightPanel} style={{ position: 'relative' }}>
          <div className={styles.formWrapper}>
            <Link href="/" className={styles.logo}>SnapTrip</Link>
            
            <h2 className={styles.welcomeTitle}>Welcome Back</h2>
            <p className={styles.welcomeSub}>Sign in to access your curated itineraries.</p>

            <div className={styles.socialButtons}>
              <button 
                className={styles.socialButton}
                onClick={() => handleSocialLogin('google')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button 
                className={styles.socialButton}
                onClick={() => handleSocialLogin('facebook')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>

            <div className={styles.divider}>OR</div>

            {/* Quick Login Helper for Development */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                Local Development Account
              </div>
              <div style={{ color: '#64748b', marginBottom: '10px' }}>
                Use the following credentials to access the Admin Panel:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', fontFamily: 'monospace', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '10px' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <strong style={{ color: '#0f172a' }}>admin@snaptrip.com</strong>
                <span style={{ color: '#64748b' }}>Password:</span>
                <strong style={{ color: '#0f172a' }}>adminpassword123</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@snaptrip.com')
                  setPassword('adminpassword123')
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  boxSizing: 'border-box'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4338ca'}
                onMouseOut={(e) => e.currentTarget.style.background = '#4f46e5'}
              >
                Auto-fill Admin Credentials
              </button>
            </div>

            <form onSubmit={handleLogin}>
              {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email or Username</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="name@example.com or username" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.label}>Password</label>
                  <Link href="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={styles.input} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </form>

            <p className={styles.footer}>
              Don't have an account? <Link href="/register" className={styles.signupLink}>Sign up for free</Link>
            </p>
          </div>

          <p className={styles.copyright}>
            © 2024 SnapTrip. Designed for the curious traveler.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
