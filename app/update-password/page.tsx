'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import styles from '../login/login.module.css'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Optional: check if the user actually has a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('No active session found. Please try resetting your password again.')
      }
    })
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.')
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.')
      }

      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <SiteHeader />
      <div className={styles.container} style={{ flex: 1, minHeight: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', borderRadius: '16px', background: 'white' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Update Password</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>Please enter your new password below.</p>

          <form onSubmit={handleUpdatePassword}>
            {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', marginBottom: '16px', fontSize: '14px', padding: '10px', background: '#ecfdf5', borderRadius: '8px' }}>Password updated successfully! Redirecting...</div>}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>New Password</label>
              <input 
                type="password" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Confirm New Password</label>
              <input 
                type="password" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', background: '#031B4E', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
              disabled={loading || success}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
