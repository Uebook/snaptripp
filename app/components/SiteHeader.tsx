'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'
import { useRouter, usePathname } from 'next/navigation'

export default function SiteHeader() {
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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

  const getLinkClass = (path: string) => {
    return pathname === path ? 'active' : ''
  }

  return (
    <header className="home-header">
      <div className="header-container">
        <Link href="/" className="logo-container">
          <span className="logo-text">SnapTrip</span>
        </Link>

        <nav className="nav-links">
          <Link href="/plan" className={getLinkClass('/plan')}>Plan Your Trip</Link>
          <Link href="/blog" className={getLinkClass('/blog')}>Blog</Link>
          <Link href="/explore" className={getLinkClass('/explore')}>Country Guide</Link>
          <Link href="/how-it-works" className={getLinkClass('/how-it-works')}>How SnapTrip Work</Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-profile">
              <button onClick={handleLogout} className="logout-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <Link href="/login" className="profile-icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </Link>
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
