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
    <header className="home-header" style={{ backgroundColor: '#0a192f', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="home-nav" style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="home-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#ffc107', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '18px' }}>
            🚀
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>SnapTrip</span>
        </Link>

        <nav className="home-links" style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/how-it-works" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>How It Works</Link>
          <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>About</Link>
          <Link href="/blog" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>Blog</Link>
          <Link href="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>Contact</Link>
          {user && (
            <Link href="/dashboard" style={{ color: '#ffc107', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, opacity: 1 }}>Dashboard</Link>
          )}
        </nav>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'white', opacity: 0.8 }}>
                {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="home-cta"
                style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="home-cta"
              style={{ backgroundColor: '#ffc107', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get Started
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
