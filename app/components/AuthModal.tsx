import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { validateUsername, checkUsernameAvailability, generateUsernameSuggestions } from '@/lib/utils/username'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

/*
 * ==============================================================================
 * IMPORTANT SOCIAL LOGIN SETUP INSTRUCTIONS:
 * ==============================================================================
 * To make Google login work, you MUST configure it in your 
 * Supabase Dashboard.
 * 
 * 1. Go to your Supabase Dashboard -> Authentication -> Providers.
 * 2. Enable "Google".
 * 3. Enter your "Client ID" and "Client Secret" for Google.
 *    - Google: Get these from Google Cloud Console (https://console.cloud.google.com/)
 * 4. Set the Callback URI in the developer console to:
 *    https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
 * ==============================================================================
 */

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    redirectTo?: string
}

export default function AuthModal({ isOpen, onClose, onSuccess, redirectTo }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Username validation state
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
    const [usernameError, setUsernameError] = useState<string>('')
    const [suggestions, setSuggestions] = useState<string[]>([])

    useEffect(() => {
        if (isLogin || !username) {
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
                setUsernameError('Taken')
                const s = await generateUsernameSuggestions(username)
                setSuggestions(s)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [username, isLogin])

    if (!isOpen) return null

    const handleSocialLogin = async (provider: 'google') => {
        try {
            const nextPath = redirectTo 
                ? (redirectTo.startsWith('http') ? redirectTo.replace(window.location.origin, '') : redirectTo)
                : window.location.pathname + window.location.search;

            if (typeof window !== 'undefined') {
                localStorage.setItem('redirectAfterLogin', nextPath);
            }

            const finalRedirectTo = `https://snaptrip-rho.vercel.app/`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: finalRedirectTo,
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message || `Failed to sign in with ${provider}`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLogin) {
            const validation = validateUsername(username)
            if (!validation.isValid) {
                setError(validation.error || 'Invalid username')
                return
            }
            if (usernameStatus === 'taken' || usernameStatus === 'checking') {
                setError('Please choose an available username.')
                return
            }
        }

        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                let loginEmail = email.trim()
                if (!loginEmail.includes('@')) {
                    // Resolve username to email
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
                onSuccess()
                onClose()
            } else {
                // Check if user already exists to avoid rate limits (using server API to bypass RLS)
                try {
                    const res = await fetch('/api/debug/check-profile', {
                        method: 'POST',
                        body: JSON.stringify({ email }),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const { exists } = await res.json()

                    if (exists) {
                        setError('Account already exists. Please log in.')
                        setIsLogin(true)
                        return
                    }
                } catch (err) {
                    console.error('Pre-check failed:', err)
                    // Continue to signup if check fails (fallback)
                }

                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        fullName,
                        username: username.toLowerCase().trim(),
                    })
                })

                const regData = await res.json()
                if (!res.ok || regData.error) {
                    if (regData.error?.toLowerCase().includes('rate limit')) {
                        setError('Too many attempts. Please try logging in instead.')
                        setIsLogin(true)
                        return
                    }
                    throw new Error(regData.error || 'Failed to create account')
                }

                // Auto-enroll in newsletter
                try {
                    await fetch('/api/newsletter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                } catch (e) {
                    // Ignore newsletter errors
                }

                // Attempt immediate sign in since email is auto-confirmed
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })

                if (signInError) throw signInError

                if (signInData.session) {
                    onSuccess()
                    onClose()
                } else {
                    setError('Account created, but session could not be established automatically. Please log in.')
                    setIsLogin(true)
                }
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(248, 250, 252, 0.85)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 99999,
                overflowY: 'auto',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            {/* Header Area */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <SiteHeader />
                <button 
                    onClick={onClose} 
                    style={{ 
                        position: 'absolute',
                        right: '2rem',
                        top: '1.25rem',
                        border: 'none', 
                        background: 'white', 
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        fontSize: '1.5rem', 
                        cursor: 'pointer', 
                        color: '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 100000
                    }}
                >
                    ×
                </button>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '2rem 4rem' }}>
                <div style={{ display: 'flex', maxWidth: '1200px', width: '100%', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* LEFT PANEL */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: '2rem', minWidth: '400px' }}>
                        <h1 style={{ 
                            fontFamily: 'Playfair Display, serif', 
                            fontSize: '3.5rem', 
                            fontWeight: 'bold', 
                            color: '#111827', 
                            margin: 0, 
                            lineHeight: 1.2 
                        }}>
                            The Art of <span style={{ color: '#F6B800' }}>Journeying</span>
                        </h1>
                        <p style={{ 
                            color: '#6B7280', 
                            marginTop: '1.5rem', 
                            fontSize: '1.05rem', 
                            lineHeight: 1.6, 
                            maxWidth: '500px' 
                        }}>
                            Crafting the perfect travel memory requires more than just a destination. It requires a canvas for your dreams. Join a community of sophisticated travelers using SnapTrip to orchestrate every detail of their global explorations.
                        </p>
                        <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem' }}>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F6B800' }}>150+</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginTop: '0.5rem', color: '#111827' }}>DESTINATIONS</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F6B800' }}>12k</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginTop: '0.5rem', color: '#111827' }}>CURATED SPOTS</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F6B800' }}>24/7</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginTop: '0.5rem', color: '#111827' }}>EXPERT GUIDE</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL (Form) */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <div 
                            style={{
                                backgroundColor: '#ffffff',
                                color: '#1f2937',
                                padding: '2.5rem',
                                borderRadius: '16px',
                                width: '100%',
                                maxWidth: '440px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                fontFamily: 'Inter, sans-serif',
                                margin: '2rem 0'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
                                <h2 style={{ 
                                    margin: 0, 
                                    fontSize: '1.75rem', 
                                    fontWeight: '700', 
                                    color: '#111827', 
                                    letterSpacing: '-0.025em',
                                    fontFamily: 'Inter, sans-serif' 
                                }}>
                                    {isLogin ? 'Plan Your Masterpiece' : 'Start Your Journey'}
                                </h2>
                                <p style={{ marginTop: '0.75rem', color: '#6B7280', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {isLogin ? (
                                        <>
                                            Sign in to start building your custom itinerary <br/>
                                            and <br/>
                                            discover the world's hidden gems.
                                        </>
                                    ) : (
                                        <>
                                            Create an account to start building your custom itinerary <br/>
                                            and <br/>
                                            discover the world's hidden gems.
                                        </>
                                    )}
                                </p>
                            </div>

                            {error && (
                                <div style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.25rem',
                                    fontSize: '0.9rem',
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <button 
                                    type="button"
                                    onClick={() => handleSocialLogin('google')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        width: '100%', padding: '0.875rem', backgroundColor: '#F3F4F6', color: '#374151',
                                        border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                                        transition: 'background-color 0.2s', fontSize: '0.95rem'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
                                <span style={{ padding: '0 1rem', color: '#9CA3AF', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em' }}>OR EMAIL</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#111827', fontSize: '0.75rem' }}>Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required={!isLogin}
                                                placeholder="John Doe"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E7EB',
                                                    color: '#111827',
                                                    backgroundColor: 'white',
                                                    fontSize: '0.95rem'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#111827', fontSize: '0.75rem' }}>Username</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                                    required={!isLogin}
                                                    placeholder="unique_handle"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.875rem',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#ef4444' : usernameStatus === 'available' ? '#10b981' : '#E5E7EB'}`,
                                                        color: '#111827',
                                                        backgroundColor: 'white',
                                                        paddingRight: '2.5rem',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                                {usernameStatus !== 'idle' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: usernameStatus === 'available' ? '#10b981' : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' : '#64748b'
                                                    }}>
                                                        {usernameStatus === 'available' && '✓'}
                                                        {usernameStatus === 'checking' && '◌'}
                                                        {(usernameStatus === 'taken' || usernameStatus === 'invalid') && '✕'}
                                                    </div>
                                                )}
                                            </div>
                                            {usernameError && usernameStatus !== 'available' && (
                                                <div style={{ fontSize: '0.8rem', marginTop: '6px', color: '#ef4444' }}>
                                                    ✕ {usernameError}
                                                </div>
                                            )}
                                            {usernameStatus === 'available' && (
                                                <div style={{ fontSize: '0.8rem', marginTop: '6px', color: '#10b981' }}>
                                                    ✓ This username is available!
                                                </div>
                                            )}
                                            {suggestions.length > 0 && (
                                                <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                                                    <div style={{ color: '#666', marginBottom: '4px' }}>Suggestions:</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {suggestions.map(s => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onClick={() => setUsername(s)}
                                                                style={{
                                                                    background: '#f3f4f6',
                                                                    border: '1px solid #d1d5db',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '12px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#111827', fontSize: '0.75rem' }}>Email Address</label>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="alex@example.com"
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            color: '#111827',
                                            backgroundColor: 'white',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ fontWeight: '700', color: '#111827', fontSize: '0.75rem' }}>Password</label>
                                        {isLogin && <span style={{ color: '#F6B800', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '700' }}>Forgot?</span>}
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            placeholder="••••••••"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                paddingRight: '2.5rem',
                                                borderRadius: '8px',
                                                border: '1px solid #E5E7EB',
                                                color: '#111827',
                                                backgroundColor: 'white',
                                                fontSize: '0.95rem',
                                                letterSpacing: showPassword ? 'normal' : '0.1em'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#9CA3AF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '4px'
                                            }}
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (!isLogin && usernameStatus !== 'available')}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        backgroundColor: '#F6B800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        cursor: (loading || (!isLogin && usernameStatus !== 'available')) ? 'not-allowed' : 'pointer',
                                        opacity: (loading || (!isLogin && usernameStatus !== 'available')) ? 0.7 : 1,
                                        boxShadow: '0 4px 6px -1px rgba(246, 184, 0, 0.3)',
                                        transition: 'background-color 0.2s, transform 0.1s'
                                    }}
                                >
                                    {loading ? 'Processing...' : (isLogin ? 'Begin Your Masterpiece' : 'Create Account')}
                                </button>
                            </form>

                            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#6B7280' }}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#F6B800',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        padding: 0,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {isLogin ? 'Begin for Free' : 'Login'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer Area */}
            <div style={{ marginTop: 'auto', flexShrink: 0 }}>
                <SiteFooter />
            </div>
        </div>
    )
}
