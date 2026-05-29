'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { COUNTRIES } from '@/app/utils/countries'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import { ShareJourneyModal, CityChecklist, WanderedPlaces } from '@/app/components/travel-map/TravelComponents'
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
  const [userRatingsDb, setUserRatingsDb] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showRatingUI, setShowRatingUI] = useState(false);

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country);
    // Pre-fill selected cities from DB
    const existingCitiesForCountry = userRatingsDb.filter(r => r.country === country).map(r => r.city);
    setSelectedCities(existingCitiesForCountry);
    setShowRatingUI(false);
  };

  const handleCitiesContinue = (cities: string[]) => {
    setSelectedCities(cities);
    setShowRatingUI(true);
  };

  const handleSaveRating = (rating: number) => {
    if (selectedCountry) {
      setCountryData(prev => ({
        ...prev,
        [selectedCountry]: { rating: Math.max(1, Math.round(rating)) } // ensure it gets colored
      }));
    }
    
    // Refresh DB data
    if (user) {
      supabase.from('user_city_ratings').select('*').eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setUserRatingsDb(data);
          }
        });
    }

    // Close the popups after saving
    setSelectedCountry(null);
    setShowRatingUI(false);
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
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch map data when user changes
  useEffect(() => {
    if (user) {
      supabase.from('user_city_ratings').select('*').eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setUserRatingsDb(data);
            
            // Reconstruct country data average for map
            const countryAvgs: Record<string, { rating: number }> = {};
            const countrySums: Record<string, { sum: number, count: number }> = {};
            
            data.forEach(item => {
              if (!countrySums[item.country]) {
                countrySums[item.country] = { sum: 0, count: 0 };
              }
              if (item.average_score > 0) {
                countrySums[item.country].sum += item.average_score;
                countrySums[item.country].count += 1;
              }
            });
            
            Object.keys(countrySums).forEach(country => {
              if (countrySums[country].count > 0) {
                countryAvgs[country] = { 
                  rating: Math.max(1, Math.round(countrySums[country].sum / countrySums[country].count)) 
                };
              } else {
                countryAvgs[country] = { rating: 1 }; // visited but no ratings
              }
            });
            
            setCountryData(countryAvgs);
          }
        });
    } else {
      // Clear data if not logged in
      setCountryData({});
      setUserRatingsDb([]);
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (isLoginMode) {
        // Login logic (copied from login/page.tsx logic)
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
        // Signup logic using /api/auth/register
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
      setAuthError(err.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setAuthError(err.message || `Failed to sign in with ${provider}`)
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (!user) {
    return (
      <div className="unauth-travel-map">
        <SiteHeader />
        
        <div className="top-actions">
          <button className="btn-share" onClick={() => router.push('/login')}>Share your Masterpiece</button>
          <button className="btn-add" onClick={() => router.push('/login')}>Add trip</button>
        </div>

        <div className="unauth-hero">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
            alt="World Map Background" 
            className="unauth-world-map-bg"
          />
          
          <div className="unauth-hero-text">
            <span className="unauth-hero-pill">GLOBAL TRAVEL JOURNAL</span>
            <h1 className="unauth-hero-title">Your world,<br/><span>beautifully mapped.</span></h1>
            <p className="unauth-hero-desc">
              Transform your memories into a living map. SnapTrip is the premium space for modern travelers to document their global footprint with sophisticated precision.
            </p>
            
            <div className="unauth-social-proof">
              <div className="unauth-avatars">
                <div className="unauth-avatar">JD</div>
                <div className="unauth-avatar">AS</div>
                <div className="unauth-avatar">+</div>
              </div>
              <span className="unauth-social-text">Join 50k+ explorers documenting their path</span>
            </div>
          </div>

          <div className="unauth-login-card">
            <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLoginMode ? 'Sign in to unlock your personalized map' : 'Start tracking your global footprint today'}</p>
            
            {authError && <div style={{ color: 'red', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>{authError}</div>}

            <button className="social-login-btn" onClick={() => handleSocialLogin('google')} disabled={authLoading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
            <button className="social-login-btn" onClick={() => handleSocialLogin('facebook')} disabled={authLoading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            <div className="login-divider">
              <span>OR EMAIL</span>
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!isLoginMode && (
                <>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Julian Alvarez" 
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                          <path d="M2 12H22" />
                          <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" />
                        </svg>
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
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  {isLoginMode && <a href="/forgot-password" className="forgot-link" style={{ top: '-24px' }}>Forgot?</a>}
                </div>
              </div>

              <button className="btn-signin" type="submit" disabled={authLoading} style={{ marginTop: '8px' }}>
                {authLoading ? 'Processing...' : (isLoginMode ? 'Sign In with SnapTrip' : 'Create Account')}
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
          <button className="btn-get-started" onClick={() => router.push('/login')}>Get Started Now</button>
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

        {/* Global Stats Overview */}
        <div style={{ display: 'flex', gap: '32px', padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', marginBottom: '24px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '36px', color: '#F6B800', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>{Array.from(new Set(userRatingsDb.map(r => r.country))).length}</div>
            <div style={{ fontSize: '18px', color: '#374151', margin: '4px 0 2px' }}>Countries</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Visited across continents</div>
          </div>
          <div style={{ width: '1px', background: '#F1F5F9' }}></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '36px', color: '#F6B800', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>{userRatingsDb.length}</div>
            <div style={{ fontSize: '18px', color: '#374151', margin: '4px 0 2px' }}>Cities</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Memories made in every corner</div>
          </div>
          <div style={{ width: '1px', background: '#F1F5F9' }}></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '36px', color: '#F6B800', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>{userRatingsDb.length > 0 ? userRatingsDb.length * 3 : 0}</div>
            <div style={{ fontSize: '18px', color: '#374151', margin: '4px 0 2px' }}>Places</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Explored beautiful places</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Main Interactive Map */}
          <div style={{ flex: selectedCountry ? '0 0 65%' : '1', transition: 'all 0.3s ease' }}>
            <InteractiveWorldMap 
              countryData={countryData} 
              selectedCountry={selectedCountry}
              onCountryClick={handleCountryClick}
            />
          </div>

          {/* Dynamic Sidebar for Checklists and Ratings */}
          {selectedCountry && (
            <div style={{ flex: '1', animation: 'fadeIn 0.3s ease' }}>
              {!showRatingUI ? (
                <CityChecklist 
                  country={selectedCountry}
                  initialSelectedCities={selectedCities}
                  onContinue={handleCitiesContinue}
                  onCancel={() => setSelectedCountry(null)}
                />
              ) : (
                <WanderedPlaces 
                  country={selectedCountry}
                  selectedCities={selectedCities}
                  userId={user?.id}
                  initialCityRatings={
                    userRatingsDb
                      .filter(r => r.country === selectedCountry && selectedCities.includes(r.city))
                      .reduce((acc, curr) => {
                        acc[curr.city] = curr.ratings;
                        return acc;
                      }, {} as any)
                  }
                  onSaveRating={handleSaveRating}
                  onClose={() => setSelectedCountry(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>

        {isShareModalOpen && (
          <ShareJourneyModal 
            userRatingsDb={userRatingsDb}
            countryData={countryData}
            username={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Wanderer"}
            onClose={() => setIsShareModalOpen(false)} 
          />
        )}<div style={{ marginTop: '60px' }}>
        <SiteFooter />
      </div>
    </div>
  )
}
