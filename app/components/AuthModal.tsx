import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { validateUsername, checkUsernameAvailability, generateUsernameSuggestions } from '@/lib/utils/username'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
        }}>
            <div style={{
                backgroundColor: 'white',
                color: '#1f2937', // Force dark text color
                padding: '2rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                        {isLogin ? 'Login' : 'Create Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666',
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                    placeholder="John Doe"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        color: '#111827',
                                        backgroundColor: 'white',
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                        required={!isLogin}
                                        placeholder="unique_handle"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: `1px solid ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#ef4444' : usernameStatus === 'available' ? '#10b981' : '#d1d5db'}`,
                                            color: '#111827',
                                            backgroundColor: 'white',
                                            paddingRight: '2.5rem'
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
                                    <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#ef4444' }}>
                                        ✕ {usernameError}
                                    </div>
                                )}
                                {usernameStatus === 'available' && (
                                    <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#10b981' }}>
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
                                                        padding: '2px 8px',
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

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Email or Username</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com or username"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                color: '#111827',
                                backgroundColor: 'white',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Password</label>
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
                                    padding: '0.75rem',
                                    paddingRight: '2.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    color: '#111827',
                                    backgroundColor: 'white',
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
                                    color: '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            padding: '0.75rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: (loading || (!isLogin && usernameStatus !== 'available')) ? 'not-allowed' : 'pointer',
                            opacity: (loading || (!isLogin && usernameStatus !== 'available')) ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    )
}
