'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './register.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: 'TemporaryPassword123!', // In a real app, you'd add a password field or use passwordless
        options: {
          data: {
            full_name: fullName,
            phone: `${phoneCode}${phoneNumber}`,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        }
      })

      if (signUpError) throw signUpError

      // Assuming successful registration triggers email verification
      router.push('/verify-email')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Left Panel: Narrative Landscape */}
        <div className={styles.leftPanel}>
          <div className={styles.imageWrapper}>
            {/* Using a placeholder gradient for the beautiful beach image. In production, use next/image with the actual asset. */}
            <div className={styles.bgImage} />
            
            <div className={styles.overlayContent}>
              <div className={styles.pill}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                THE EDITORIAL VOYAGER
              </div>
              <h1 className={styles.title}>Discover the<br/>world, your way.</h1>
              <p className={styles.description}>
                Join an exclusive community of travelers defining<br/>the next horizon of curated journeys.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Registration Form */}
        <div className={styles.rightPanel}>
          <div className={styles.formWrapper}>
            
            <div className={styles.header}>
              <h2 className={styles.welcomeTitle}>Create Account</h2>
              <p className={styles.welcomeSub}>Start your journey with a single step.</p>
            </div>

            <form onSubmit={handleRegister} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Julian Alvarez" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  className={styles.input} 
                  placeholder="julian@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.phoneInputWrapper}>
                  <div className={styles.phoneCodeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M2 12H22" />
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" />
                    </svg>
                    <span>{phoneCode}</span>
                  </div>
                  <input 
                    type="tel" 
                    className={styles.phoneInput} 
                    placeholder="555-0123" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <p className={styles.loginLinkText}>
              Already have an account? <Link href="/login" className={styles.loginLink}>Log in</Link>
            </p>

            <p className={styles.termsText}>
              By <span className={styles.highlight}>signing up</span>, you agree to SnapTrip's Terms of Service<br/>and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
