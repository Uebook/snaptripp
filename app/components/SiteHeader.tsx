'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'
import { useRouter, usePathname } from 'next/navigation'

export default function SiteHeader() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, username')
        .eq('id', userId)
        .maybeSingle()
      
      if (!error && data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await supabase.auth.signOut()
    router.push('/')
  }

  const getLinkClass = (path: string) => {
    return pathname === path ? 'active' : ''
  }

  const toggleDropdown = async () => {
    const nextState = !isDropdownOpen
    setIsDropdownOpen(nextState)
    if (nextState && user) {
      // Fetch fresh profile details when opening dropdown
      await fetchProfile(user.id)
    }
  }

  return (
    <header className="home-header">
      <div className="header-container">
        <Link href="/" className="logo-container">
          <img src="/images/applogo.webp" alt="SnapTrip" className="logo-img" style={{ height: '64px', width: 'auto' }} />
        </Link>

        <nav className="nav-links">
          <Link href="/plan" className={getLinkClass('/plan')}>Plan Your Trip</Link>
          <Link href="/travel-map" className={getLinkClass('/travel-map')}>Travel Map</Link>
          <Link href="/explore" className={getLinkClass('/explore')}>Explore Countries</Link>
          <Link href="/how-it-works" className={getLinkClass('/how-it-works')}>How snaptrip works</Link>
          <Link href="/contact" className={getLinkClass('/contact')}>Contact Us</Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-profile-container" ref={dropdownRef}>
              <button onClick={toggleDropdown} className="avatar-btn" aria-label="User menu">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User Profile'}
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-fallback">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">
                      {profile?.full_name || user.email?.split('@')[0] || 'Explorer'}
                    </div>
                    {profile?.username && (
                      <div className="dropdown-user-username">@{profile.username}</div>
                    )}
                  </div>
                  
                  <Link href="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9"></rect>
                      <rect x="14" y="3" width="7" height="5"></rect>
                      <rect x="14" y="12" width="7" height="9"></rect>
                      <rect x="3" y="16" width="7" height="5"></rect>
                    </svg>
                    Dashboard
                  </Link>

                  <button onClick={handleLogout} className="dropdown-item logout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
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
