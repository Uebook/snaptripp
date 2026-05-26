'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './register.module.css'
import { validateUsername, checkUsernameAvailability, generateUsernameSuggestions } from '@/lib/utils/username'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: '+45', flag: '🇩🇰' },
  { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'Peru', code: '+51', flag: '🇵🇪' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  { name: 'Israel', code: '+972', flag: '🇮🇱' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  { name: 'Belgium', code: '+32', flag: '🇧🇪' },
  { name: 'Austria', code: '+43', flag: '🇦🇹' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  { name: 'Greece', code: '+30', flag: '🇬🇷' },
  { name: 'Finland', code: '+358', flag: '🇫🇮' },
  { name: 'Poland', code: '+48', flag: '🇵🇱' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
  { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
  { name: 'Hungary', code: '#36', flag: '🇭🇺' },
  { name: 'Romania', code: '+40', flag: '🇷🇴' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameError, setUsernameError] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Username live check hook
  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle')
      setUsernameError('')
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      const validation = validateUsername(username)
      if (!validation.isValid) {
        setUsernameStatus('invalid')
        setUsernameError(validation.error || 'Invalid username')
        setSuggestions([])
        return
      }

      setUsernameStatus('checking')
      const isAvailable = await checkUsernameAvailability(username)

      if (isAvailable) {
        setUsernameStatus('available')
        setUsernameError('')
        setSuggestions([])
      } else {
        setUsernameStatus('taken')
        setUsernameError('This username is already taken.')
        const s = await generateUsernameSuggestions(username)
        setSuggestions(s)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check username validation
    const validation = validateUsername(username)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid username')
      return
    }
    if (usernameStatus === 'taken' || usernameStatus === 'checking') {
      setError('Please choose an available username.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create user via server API to bypass email confirmation
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          username: username.toLowerCase().trim(),
          phone: `${phoneCode}${phoneNumber}`,
        })
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Log in immediately since email is auto-confirmed
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <SiteHeader />
      <div className={styles.container} style={{ flex: 1, minHeight: 'auto' }}>
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
                  <label className={styles.label}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="unique_handle" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      required
                      style={{
                        borderColor:
                          usernameStatus === 'available' ? '#10b981' :
                            (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' :
                              undefined
                      }}
                    />
                    {usernameStatus !== 'idle' && (
                      <span style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: usernameStatus === 'available' ? '#10b981' : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' : '#64748b'
                      }}>
                        {usernameStatus === 'available' && '✓'}
                        {usernameStatus === 'checking' && '◌'}
                        {(usernameStatus === 'taken' || usernameStatus === 'invalid') && '✕'}
                      </span>
                    )}
                  </div>
                  {usernameError && usernameStatus !== 'available' && (
                    <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>
                      ✕ {usernameError}
                    </div>
                  )}
                  {usernameStatus === 'available' && (
                    <div style={{ color: '#10b981', fontSize: '11px', marginTop: '2px' }}>
                      ✓ This username is available!
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '11px' }}>
                      <span style={{ color: '#6b7280' }}>Suggestions: </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {suggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setUsername(s)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: '#475569'
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <div className={styles.phoneCodeContainer} ref={dropdownRef}>
                      <div 
                        className={styles.phoneCodeDropdown}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                          <path d="M2 12H22" />
                          <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" />
                        </svg>
                        <span>{phoneCode}</span>
                        <svg 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#6B7280" 
                          strokeWidth="2"
                          style={{ 
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'none', 
                            transition: 'transform 0.2s',
                            marginLeft: '2px'
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                      {isDropdownOpen && (
                        <div className={styles.dropdownList}>
                          <input 
                            type="text" 
                            placeholder="Search country..." 
                            className={styles.dropdownSearch} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className={styles.dropdownItems}>
                            {filteredCountries.map((c) => (
                              <div 
                                key={`${c.code}-${c.name}`} 
                                className={styles.dropdownItem}
                                onClick={() => {
                                  setPhoneCode(c.code)
                                  setIsDropdownOpen(false)
                                  setSearchQuery('')
                                }}
                              >
                                <span className={styles.dropdownFlag}>{c.flag}</span>
                                <span className={styles.dropdownName}>{c.name}</span>
                                <span className={styles.dropdownCode}>{c.code}</span>
                              </div>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div style={{ padding: '12px 16px', fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>
                                No countries found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={styles.input} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
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
                  className={styles.submitButton}
                  disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking' || usernameStatus === 'invalid'}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <p className={styles.loginLinkText}>
                Already have an account? <Link href="/login" className={styles.loginLink}>Log in</Link>
              </p>

              <p className={styles.termsText}>
                By <span className={styles.highlight}>signing up</span>, you agree to SnapTrip&apos;s Terms of Service<br/>and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
