'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { COUNTRIES } from '@/app/utils/countries'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import { ShareJourneyModal, TravelScoreProfile, VisitedCountriesSection, CountryRatingModal } from '@/app/components/travel-map/TravelComponentsNew'
import { AccordionCountrySelector } from '@/app/components/travel-map/AccordionCountrySelector'
import InteractiveWorldMap from '@/app/components/travel-map/InteractiveWorldMap'
import '@/app/components/travel-map/travel-map.css'
import '@/app/trip-map/unauth.css'

export default function TravelMapPage() {
  const router = useRouter()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Interactive Map State
  const [countryData, setCountryData] = useState<Record<string, { rating: number }>>({});
  const [userCountryLogs, setUserCountryLogs] = useState<any[]>([]);
  const [userCityLogs, setUserCityLogs] = useState<any[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mainViewMode, setMainViewMode] = useState<'map' | 'list'>('map');

  const fetchUserData = async (userId: string) => {
    // We swallow errors because if tables don't exist yet, we still want the UI to render empty
    try {
      const { data: countries, error: countriesError } = await supabase.from('user_country_logs').select('*').eq('user_id', userId);
      const { data: cities, error: citiesError } = await supabase.from('user_city_logs').select('*').eq('user_id', userId);
      
      if (countries && !countriesError) {
        setUserCountryLogs(countries);
        const countryAvgs: Record<string, { rating: number }> = {};
        countries.forEach(item => {
          countryAvgs[item.country] = { rating: Math.max(1, Math.round(item.average_score || 1)) };
        });
        setCountryData(countryAvgs);
      }
      if (cities && !citiesError) {
        setUserCityLogs(cities);
      }
    } catch (error) {
      console.warn("Failed to fetch user data:", error);
    }
  };

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country);
  };

  const handleToggleCountry = async (country: string) => {
    if (!user) return;
    const isVisited = userCountryLogs.some(log => log.country === country);
    try {
      if (isVisited) {
        await supabase.from('user_country_logs').delete().eq('user_id', user.id).eq('country', country);
        await supabase.from('user_city_logs').delete().eq('user_id', user.id).eq('country', country);
      } else {
        await supabase.from('user_country_logs').upsert({
          user_id: user.id,
          country: country,
          ratings: { Sightseeing: 0, 'Local people': 0, 'Service quality': 0, Safety: 0, 'Price/quality': 0, 'Local cuisine': 0 },
          average_score: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,country' });
      }
      fetchUserData(user.id);
    } catch (e) {
      console.error("Error toggling country:", e);
    }
  };

  // Auth Card State
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phoneCode, setPhoneCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setCountryData({});
        setUserCountryLogs([]);
        setUserCityLogs([]);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (isLoginMode) {
        let loginEmail = email.trim()
        if (!loginEmail.includes('@')) {
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
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email.trim(), 
            password,
            fullName,
            username: username.toLowerCase().trim(),
            phone: `${phoneCode}${phoneNumber}`
          })
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to create account')
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInError) throw signInError
      }
    } catch (err: any) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google') => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', '/travel-map');
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `https://snaptrip-rho.vercel.app/`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setAuthError(err.message || `Failed to sign in with ${provider}`)
    }
  }

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>

  if (!user) {
    return (
      <div className="unauth-travel-map">
        <SiteHeader />
        
        <div className="unauth-hero">
          <div className="unauth-hero-text animate-fade-in">
            <span className="unauth-hero-pill">GLOBAL TRAVEL JOURNAL</span>
            <h1 className="unauth-hero-title">Your world,<br/><span>beautifully mapped.</span></h1>
            <p className="unauth-hero-desc">Transform your memories into a living map. SnapTrip is the premium space for modern travelers to document their global footprint with sophisticated precision.</p>
            <div className="unauth-social-proof">
              <div className="unauth-avatars">
                <div className="unauth-avatar">JR</div>
                <div className="unauth-avatar">AS</div>
                <div className="unauth-avatar">+</div>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>Join 50k+ explorers documenting their path</span>
            </div>
          </div>
          
          <div className="unauth-login-card animate-slide-up">
            <form onSubmit={handleAuth} className="auth-form-card">
              <h2>{isLoginMode ? 'Welcome Back' : 'Start Your Journey'}</h2>
              <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px' }}>
                Sign in to unlock your personalized map
              </p>
              
              {authError && <div className="auth-error-msg">{authError}</div>}
              
              <button type="button" onClick={() => handleSocialLogin('google')} className="social-login-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>


              <div className="login-divider"><span>OR EMAIL</span></div>

              {!isLoginMode && (
                <>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Alex Wanderer" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Username</label>
                    <input 
                      type="text" 
                      placeholder="unique_handle" 
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      required
                    />
                  </div>
                </>
              )}

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="alex@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {!isLoginMode && (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Phone Number</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', 
                          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', 
                          fontSize: '14px', cursor: 'pointer' 
                        }}
                      >
                        <span>{phoneCode}</span>
                      </div>
                      {isDropdownOpen && (
                        <div style={{ 
                          position: 'absolute', top: '100%', left: 0, width: '240px', maxHeight: '200px', 
                          overflowY: 'auto', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', 
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, marginTop: '4px' 
                        }}>
                          {COUNTRIES.map(c => (
                            <div 
                              key={c.code + c.name} 
                              onClick={() => { setPhoneCode(c.code); setIsDropdownOpen(false); }}
                              style={{ padding: '8px 12px', display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '14px', alignItems: 'center' }}
                            >
                              <span>{c.flag}</span>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                              <span style={{ color: '#6B7280' }}>{c.code}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input 
                      type="tel" 
                      placeholder="555-0123" 
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      required={!isLoginMode}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              )}
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>Password</label>
                  {isLoginMode && <a href="/forgot-password" style={{ fontSize: '0.75rem', color: '#F6B800', fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>}
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={authLoading} className="btn-signin">
                {authLoading ? 'Please wait...' : (isLoginMode ? 'Sign In with SnapTrip' : 'Create Account')}
              </button>
            </form>
            
            <div className="signup-hint">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(!isLoginMode); setAuthError(null); }}>
                {isLoginMode ? "Sign up for free" : "Sign in here"}
              </a>
            </div>
          </div>
        </div>

        <div className="unauth-cta-section">
          <h2>Ready for the next<br/>adventure?</h2>
          <p>Join the community documenting their world journey in a way that truly matters. Your story deserves a canvas this grand.</p>
          <button className="btn-get-started" onClick={() => setIsLoginMode(false)}>Get Started Now</button>
        </div>
        
        <SiteFooter />
      </div>
    )
  }



  return (
    <div className="travel-map-page" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      <SiteHeader />
      
      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#031B4E', margin: '0 0 8px', fontFamily: '"Playfair Display", serif' }}>Your Travel Map</h1>
            <p style={{ color: '#64748B', margin: 0 }}>Track your journeys, collect stamps, and relive your favorite memories.</p>
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            style={{ padding: '12px 24px', background: '#F6B800', color: '#031B4E', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-12-4l4-4 4 4m-4-4v12" />
            </svg>
            Share Journey
          </button>
        </div>

        {/* View Mode Toggle Option */}
        <div style={{ 
          display: 'flex', 
          background: '#FFF', 
          padding: '6px', 
          borderRadius: '30px', 
          width: 'fit-content', 
          marginBottom: '32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          position: 'relative'
        }}>
          <button 
            onClick={() => setMainViewMode('map')}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              background: mainViewMode === 'map' ? '#F6B800' : 'transparent',
              color: mainViewMode === 'map' ? '#031B4E' : '#64748B',
              boxShadow: mainViewMode === 'map' ? '0 4px 12px rgba(246, 184, 0, 0.25)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            Map
          </button>
          <button 
            onClick={() => setMainViewMode('list')}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              background: mainViewMode === 'list' ? '#F6B800' : 'transparent',
              color: mainViewMode === 'list' ? '#031B4E' : '#64748B',
              boxShadow: mainViewMode === 'list' ? '0 4px 12px rgba(246, 184, 0, 0.25)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </button>
        </div>

        {mainViewMode === 'map' ? (
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
            <div style={{ flex: '1', height: '600px', background: '#FFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
              <InteractiveWorldMap 
                countryData={countryData} 
                selectedCountry={selectedCountry}
                onCountryClick={handleCountryClick}
              />
            </div>
          </div>
        ) : (
          <AccordionCountrySelector 
            userCountryLogs={userCountryLogs} 
            onCountrySelect={handleCountryClick} 
            onToggleCountry={handleToggleCountry}
          />
        )}



        {selectedCountry && (
          <CountryRatingModal 
            country={selectedCountry}
            userId={user.id}
            userCountryLogs={userCountryLogs}
            userCityLogs={userCityLogs}
            onClose={() => setSelectedCountry(null)}
            onSave={() => fetchUserData(user.id)}
          />
        )}
      </div>

      {isShareModalOpen && (
        <ShareJourneyModal 
          userCountryLogs={userCountryLogs}
          userCityLogs={userCityLogs}
          countryData={countryData}
          username={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Wanderer"}
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}
      
      <div style={{ marginTop: '60px' }}>
        <SiteFooter />
      </div>
    </div>
  )
}
