'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                onSuccess()
                onClose()
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

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })

                if (error) {
                    if (error.message.toLowerCase().includes('rate limit')) {
                        setError('Too many attempts. Please try logging in instead.')
                        setIsLogin(true)
                        return
                    }
                    throw error
                }

                if (data.session && data.user) {
                    // Sync profile manually just in case trigger fails or latency
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        password: password, // WARNING: Storing plain text password
                        updated_at: new Date().toISOString(),
                    })

                    onSuccess()
                    onClose()
                } else if (data.user) {
                    // Sync profile manually
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        password: password, // WARNING: Storing plain text password
                        updated_at: new Date().toISOString(),
                    })

                    // Attempt immediate sign in
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    })

                    if (signInData.session) {
                        onSuccess()
                        onClose()
                    } else {
                        // Verification required
                        alert('Account created! Please check your email to verify your account.')
                        setIsLogin(true)
                    }
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
            zIndex: 2000,
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
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
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
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••••"
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

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
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
