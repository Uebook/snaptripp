'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'
import { useRouter } from 'next/navigation'

export default function SiteHeader() {
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="home-header">
      <div className="home-nav">
        <Link href="/" className="home-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="logo-badge">✈</span>
          SnapTrip
        </Link>
        <nav className="home-links">
          <Link href="/explore">Explore</Link>
          <Link href="/planner">Planner</Link>
          {user && <Link href="/dashboard">Dashboard</Link>}
        </nav>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="home-cta"
                style={{ backgroundColor: 'transparent', color: '#666', border: '1px solid #ddd' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="home-cta">
              Login
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </header>
  )
}
