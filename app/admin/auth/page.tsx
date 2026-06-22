'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import '../admin.css' // Adjust path if necessary

export default function AdminAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_email')
    const savedPassword = localStorage.getItem('admin_password')
    const savedRemember = localStorage.getItem('admin_remember') === 'true'
    
    if (savedRemember && savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Use SSR browser client so it syncs session to cookies for middleware
    const supabaseBrowser = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      if (rememberMe) {
        localStorage.setItem('admin_email', email)
        localStorage.setItem('admin_password', password)
        localStorage.setItem('admin_remember', 'true')
      } else {
        localStorage.removeItem('admin_email')
        localStorage.removeItem('admin_password')
        localStorage.removeItem('admin_remember')
      }

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      
      // Force a full browser reload to ensure middleware gets the fresh cookies
      window.location.href = '/admin'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f2f8ff',
      color: '#0b2a4a',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 12px 30px rgba(11, 42, 74, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>Admin Login</h2>
        <p style={{ color: '#6b88a5', margin: '0 0 24px', fontSize: '14px' }}>Secure access for Snaptrip admins</p>
        
        {error && <div style={{ color: '#e11d48', background: '#ffe4e6', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@snaptrip.com" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cfe3ff', outline: 'none' }} 
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px', paddingRight: '48px', borderRadius: '8px', border: '1px solid #cfe3ff', outline: 'none' }} 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b88a5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-4px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '14px', color: '#6b88a5', cursor: 'pointer', userSelect: 'none' }}>Remember me</label>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px', background: '#0b2a4a', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Authenticating...' : 'Sign In securely'}
          </button>
        </form>
      </div>
    </div>
  )
}
