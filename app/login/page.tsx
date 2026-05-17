'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
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
    <div className={styles.container}>
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
      <div className={styles.rightPanel}>
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

          <form onSubmit={handleLogin}>
            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="name@example.com" 
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
              <input 
                type="password" 
                className={styles.input} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
  )
}
