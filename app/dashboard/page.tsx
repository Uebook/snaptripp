'use client'

import styles from './DashboardPage.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface SessionInfo {
  device: string
  location: string
  ip: string
  timeAgo: string
  isCurrent: boolean
}

interface SavedPlace {
  id: string
  title: string
  location: string
  category: 'Beach' | 'Mountain' | 'City Escape' | 'Retreat'
  description: string
  price: string
  imageUrl: string
}

interface Expedition {
  id: string
  title: string
  category: string
  date: string
  description: string
  duration: string
  airline: string
  country: string
  imageUrl: string
  price: number
  taxes: number
  fee: number
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'personal-info' | 'my-trips' | 'security' | 'notifications' | 'travel-history' | 'saved-places'>('personal-info')
  const [trips, setTrips] = useState<any[]>([])
  const [loadingTrips, setLoadingTrips] = useState(true)

  // Profile Form States
  const [profile, setProfile] = useState<any>({
    full_name: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    avatar_url: ''
  })
  const [initialProfile, setInitialProfile] = useState<any>(null)
  const [phonePrefix, setPhonePrefix] = useState('+1')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Security States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([
    { device: 'MacBook Pro 16"', location: 'London, United Kingdom', ip: '192.168.1.1', timeAgo: 'Active now', isCurrent: true },
    { device: 'iPhone 15 Pro', location: 'Paris, France', ip: '192.168.2.14', timeAgo: '2 hours ago', isCurrent: false },
    { device: 'iPad Air', location: 'Berlin, Germany', ip: '192.168.1.75', timeAgo: '3 days ago', isCurrent: false }
  ])

  // Notifications Preferences
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    travel_recommendations: true,
    public_profile: true
  })

  // Travel History Modals / Receipts
  const [selectedReceipt, setSelectedReceipt] = useState<Expedition | null>(null)
  
  // Saved Places State
  const [savedFilter, setSavedFilter] = useState<'All' | 'Beach' | 'Mountain' | 'City Escape'>('All')
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    {
      id: '1',
      title: 'Amalfi Coast, Italy',
      location: 'Amalfi Coast, Italy',
      category: 'Beach',
      description: 'Starting from $3,400 per person',
      price: '$3,400',
      imageUrl: '/images/card_italy.png'
    },
    {
      id: '2',
      title: 'Zermatt, Switzerland',
      location: 'Zermatt, Switzerland',
      category: 'Mountain',
      description: 'Immaculate peaks and world-class luxury skiing retreats.',
      price: '$2,800',
      imageUrl: '/images/alpine_mountains.png'
    },
    {
      id: '3',
      title: 'Jaipur, India',
      location: 'Jaipur, India',
      category: 'City Escape',
      description: "The Pink City's rich heritage and vibrant artisanal markets.",
      price: '$1,950',
      imageUrl: '/images/card_barcelona.png'
    },
    {
      id: '4',
      title: 'Dubai, UAE',
      location: 'Dubai, UAE',
      category: 'City Escape',
      description: 'Ultra-modern luxury and desert-oasis experiences.',
      price: '$4,100',
      imageUrl: '/images/card_uae.png'
    },
    {
      id: '5',
      title: 'Ubud, Bali',
      location: 'Ubud, Bali',
      category: 'Retreat',
      description: 'Spiritual sanctuaries and infinity pools amidst terraced jungles.',
      price: '$1,450',
      imageUrl: '/images/coastal_beach.png'
    }
  ])
  const [heartedPlaces, setHeartedPlaces] = useState<string[]>(['1', '2', '3', '4', '5'])

  // Expeditions Data
  const expeditions: Expedition[] = [
    {
      id: 'e1',
      title: 'Amalfi Dreamscape',
      category: 'Luxury Stay',
      date: 'May 12 – May 19, 2023',
      description: 'A 7-day immersion into the heart of the Italian coast, featuring private villa stays in Positano and curated lemon grove tours.',
      duration: '7 Days',
      airline: 'ITA Airways',
      country: 'Italy',
      imageUrl: '/images/how_positano.png',
      price: 3400,
      taxes: 280,
      fee: 120
    },
    {
      id: 'e2',
      title: 'Eternal Kyoto',
      category: 'Cultural Heritage',
      date: 'Oct 05 – Oct 17, 2022',
      description: '12 days exploring the hidden temples and tea houses of Japan. A journey focused on mindfulness and historical architecture.',
      duration: '12 Days',
      airline: 'Japan Airlines',
      country: 'Japan',
      imageUrl: '/images/explore_japan.png',
      price: 4900,
      taxes: 420,
      fee: 180
    },
    {
      id: 'e3',
      title: 'Alpine Retreat',
      category: 'Winter Escape',
      date: 'Jan 20 – Jan 25, 2022',
      description: 'Winter escape to Zermatt. Focused on wellness, world-class skiing, and gourmet alpine dining.',
      duration: '5 Days',
      airline: 'Swiss International Air Lines',
      country: 'Switzerland',
      imageUrl: '/images/alpine_mountains.png',
      price: 2800,
      taxes: 210,
      fee: 90
    }
  ]

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      try {
        // Fetch Profile
        let { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (!profileData) {
          const fullName = currentUser.user_metadata?.full_name || ''
          const email = currentUser.email || ''
          const cleanName = fullName ? fullName.toLowerCase().replace(/[^a-z0-9]/g, '') : (email?.split('@')[0] || 'traveler')
          const suffix = Math.floor(1000 + Math.random() * 9000)
          const avatarUrl = currentUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
          
          profileData = {
            id: currentUser.id,
            email: email,
            username: `${cleanName}-${suffix}`,
            full_name: fullName,
            avatar_url: avatarUrl,
            phone: '',
            bio: '',
            location: '',
            preferences: {
              email_notifications: true,
              travel_recommendations: true,
              public_profile: true
            },
            updated_at: new Date().toISOString()
          }

          // Auto-sync for OAuth users
          await supabase.from('profiles').upsert(profileData)
        }

        if (profileData) {
          const loadedProfile = {
            full_name: profileData.full_name || currentUser.user_metadata?.full_name || '',
            username: profileData.username || '',
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
          }
          setProfile(loadedProfile)
          setInitialProfile(loadedProfile)

          // Parse Preferences
          let dbPrefs = profileData.preferences
          if (dbPrefs) {
            if (typeof dbPrefs === 'string') {
              try {
                dbPrefs = JSON.parse(dbPrefs)
              } catch (e) {
                console.error('Failed to parse preferences:', e)
              }
            }
            setPreferences({
              email_notifications: dbPrefs.email_notifications ?? true,
              travel_recommendations: dbPrefs.travel_recommendations ?? true,
              public_profile: dbPrefs.public_profile ?? true
            })
          }
        }

        // Fetch Trips
        const res = await fetch('/api/trips', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        const data = await res.json()
        if (data.success) {
          setTrips(data.trips)
        }
      } catch (err) {
        console.error('Error loading dashboard profile/trips data:', err)
      } finally {
        setLoading(false)
        setLoadingTrips(false)
      }
    }

    initDashboard()
  }, [router])

  // Profile Save
  const handleSaveProfile = async () => {
    if (!user) return
    
    const cleanUsername = profile.username ? profile.username.toLowerCase().replace(/[^a-z0-9._]/g, '') : null;

    setIsSavingProfile(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          username: cleanUsername,
          bio: profile.bio,
          location: profile.location,
          avatar_url: profile.avatar_url,
          preferences: preferences,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setInitialProfile({ ...profile, username: cleanUsername || '' })
      alert('Changes saved successfully!')
    } catch (err: any) {
      alert('Error saving profile changes: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Discard Profile Changes
  const handleDiscardProfile = () => {
    if (initialProfile) {
      setProfile({ ...initialProfile })
    }
  }

  // File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsSavingProfile(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError
      alert('Profile photo updated successfully!')
    } catch (err: any) {
      alert('Error uploading photo: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Remove Photo
  const handleRemovePhoto = async () => {
    if (!user) return
    const defaultUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    try {
      setIsSavingProfile(true)
      setProfile((prev: any) => ({ ...prev, avatar_url: defaultUrl }))

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: defaultUrl })
        .eq('id', user.id)

      if (error) throw error
      alert('Profile photo removed.')
    } catch (err: any) {
      alert('Error removing photo: ' + err.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      alert('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      alert('Error updating password: ' + err.message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Toggle Saved Place Heart State
  const toggleHeart = (id: string) => {
    if (heartedPlaces.includes(id)) {
      setHeartedPlaces(heartedPlaces.filter(pId => pId !== id))
    } else {
      setHeartedPlaces([...heartedPlaces, id])
    }
  }

  // Logout Session Row
  const handleLogoutSession = (device: string) => {
    if (confirm(`Are you sure you want to log out session on ${device}?`)) {
      setActiveSessions(activeSessions.filter(s => s.device !== device))
    }
  }

  // Logout All Devices
  const handleLogoutAllDevices = async () => {
    if (confirm('Are you sure you want to log out from all devices?')) {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1d5db' }}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles["dashboard-wrapper"]}>
      {/* Top Header / Profile Outline Trigger */}
      <div className={styles["dashboard-header-bar"]}>
        <button className={styles["profile-outline-btn"]} onClick={() => router.push('/dashboard')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className={styles["dashboard-grid-layout"]}>
        {/* Main Content Pane */}
        <div className={styles["main-content-flow"]}>
          
          {/* Tab 1: Personal Info */}
          {activeTab === 'personal-info' && (
            <>
              <div className={styles["card-container"]}>
                <div className={styles["profile-photo-section"]}>
                  <div className={styles["avatar-large-preview"]}>
                    <img src={profile.avatar_url} alt="Profile" />
                  </div>
                  <div>
                    <h3 className={styles["card-header-title"]} style={{ fontSize: '18px', marginBottom: '4px' }}>Profile Photo</h3>
                    <p className={styles["card-header-subtitle"]} style={{ fontSize: '14px', marginBottom: '16px' }}>Update your profile picture to be recognized easily.</p>
                    <div className={styles["photo-action-buttons"]}>
                      <input 
                        type="file" 
                        id="avatar-uploader-file" 
                        hidden 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                      />
                      <button 
                        className={styles["btn-upload-yellow"]}
                        onClick={() => document.getElementById('avatar-uploader-file')?.click()}
                      >
                        Upload New
                      </button>
                      <button className={styles["btn-remove-outline"]} onClick={handleRemovePhoto}>Remove</button>
                    </div>
                  </div>
                </div>

                <div className={styles["inputs-grid-layout"]}>
                  <div className={styles["field-block"]}>
                    <span className={styles["field-label-tag"]}>Full Name</span>
                    <input 
                      type="text" 
                      className={styles["field-input-box"]}
                      value={profile.full_name}
                      onChange={e => setProfile({...profile, full_name: e.target.value})}
                    />
                  </div>

                  <div className={styles["field-block"]}>
                    <span className={styles["field-label-tag"]}>Username</span>
                    <input 
                      type="text" 
                      className={styles["field-input-box"]}
                      value={profile.username ? (profile.username.startsWith('@') ? profile.username : `@${profile.username}`) : ''}
                      onChange={e => setProfile({...profile, username: e.target.value.replace('@', '')})}
                    />
                  </div>

                  <div className={styles["field-block"]}>
                    <span className={styles["field-label-tag"]}>Location</span>
                    <input 
                      type="text" 
                      className={styles["field-input-box"]}
                      placeholder="e.g. New York, USA"
                      value={profile.location}
                      onChange={e => setProfile({...profile, location: e.target.value})}
                    />
                  </div>

                  <div className={`${styles["field-block"]} ${styles["span-2"]}`}>
                    <span className={styles["field-label-tag"]}>Bio & Travel Philosophy</span>
                    <textarea 
                      className={`${styles["field-input-box"]} ${styles["textarea-field"]}`}
                      value={profile.bio}
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles["form-action-footer"]}>
                  <button className={styles["btn-discard-link"]} onClick={handleDiscardProfile}>Discard changes</button>
                  <button className={styles["btn-save-changes"]} onClick={handleSaveProfile} disabled={isSavingProfile}>
                    <span className={styles["check-icon-circle"]}>✓</span>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>


            </>
          )}

          {/* Tab 2: Security */}
          {activeTab === 'security' && (
            <>
              <div className={styles["card-container"]}>
                <h2 className={styles["card-header-title"]}>Security Settings</h2>
                <p className={styles["card-header-subtitle"]}>Manage your account security and password to keep your travel plans safe.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
                  {/* Change Password Card */}
                  <div className={styles["card-container"]} style={{ padding: '30px', boxShadow: 'none', border: '1px solid #f3f4f6' }}>
                    <h3 className={styles["section-title-bold"]} style={{ fontSize: '18px', marginBottom: '20px' }}>🔑 Change Password</h3>
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                      <div className={styles["field-block"]}>
                        <span className={styles["field-label-tag"]}>New Password</span>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showNewPassword ? "text" : "password"}
                            required
                            placeholder="••••••••" 
                            className={styles["field-input-box"]}
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {showNewPassword ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className={styles["field-block"]}>
                        <span className={styles["field-label-tag"]}>Confirm New Password</span>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="••••••••" 
                            className={styles["field-input-box"]}
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {showConfirmPassword ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <button type="submit" className={styles["btn-upload-yellow"]} style={{ marginTop: '10px' }} disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className={styles["card-container"]}>
              <h2 className={styles["card-header-title"]}>Notifications & Visibility Settings</h2>
              <p className={styles["card-header-subtitle"]}>Refine how you interact with the community and what alerts you receive.</p>

              <div className={styles["pref-checkbox-list"]}>
                <div className={styles["pref-checkbox-row"]}>
                  <div className={styles["pref-checkbox-left"]}>
                    <span className={styles["pref-checkbox-title"]}>Email Notifications</span>
                    <span className={styles["pref-checkbox-desc"]}>Receive updates about your trip schedules, booking confirmations, and status alerts.</span>
                  </div>
                  <button 
                    className={`${styles["switch-toggle-btn"]} ${preferences.email_notifications ? styles["switch-active"] : ''}`}
                    onClick={() => {
                      const newPrefs = { ...preferences, email_notifications: !preferences.email_notifications }
                      setPreferences(newPrefs)
                    }}
                  >
                    <span className={styles["switch-knob"]}></span>
                  </button>
                </div>

                <div className={styles["pref-checkbox-row"]}>
                  <div className={styles["pref-checkbox-left"]}>
                    <span className={styles["pref-checkbox-title"]}>Travel Recommendations</span>
                    <span className={styles["pref-checkbox-desc"]}>Get personalized weekly travel summaries, matching recommendations, and guides.</span>
                  </div>
                  <button 
                    className={`${styles["switch-toggle-btn"]} ${preferences.travel_recommendations ? styles["switch-active"] : ''}`}
                    onClick={() => {
                      const newPrefs = { ...preferences, travel_recommendations: !preferences.travel_recommendations }
                      setPreferences(newPrefs)
                    }}
                  >
                    <span className={styles["switch-knob"]}></span>
                  </button>
                </div>

              </div>

              <div className={styles["form-action-footer"]}>
                <button className={styles["btn-save-changes"]} onClick={handleSaveProfile} disabled={isSavingProfile}>
                  <span className={styles["check-icon-circle"]}>✓</span>
                  {isSavingProfile ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Travel History */}
          {activeTab === 'travel-history' && (
            <>
              <div className={styles["card-container"]} style={{ background: 'none', padding: 0, boxShadow: 'none' }}>
                <h2 className={styles["card-header-title"]}>Travel History</h2>
                <p className={styles["card-header-subtitle"]} style={{ marginBottom: '24px' }}>Every mile tells a story. Review your past adventures and plan your next one.</p>

                <div className={styles["metrics-row-layout"]} style={{ marginBottom: '32px' }}>
                  {/* Total Footprint */}
                  <div className={styles["metric-card-total-miles"]}>
                    <span className={styles["metric-card-miles-label"]}>Total Footprint</span>
                    <div className={styles["metric-card-miles-value"]}>34,582 <span style={{ fontSize: '20px', fontWeight: '600' }}>mi</span></div>
                    <span className={styles["metric-card-miles-sub"]}>Across 12 global expeditions</span>
                    <div className={styles["globe-graphic-overlay"]}>
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                      </svg>
                    </div>
                  </div>

                  {/* Countries Visited */}
                  <div className={styles["metric-card-countries"]}>
                    <div className={styles["explorer-tier-badge"]}>Explorer Tier</div>
                    <div className={styles["metric-card-countries-header"]}>🏆</div>
                    <div className={styles["metric-card-countries-value"]}>08</div>
                    <span className={styles["metric-card-countries-label"]}>Countries Visited</span>
                  </div>
                </div>

                <div className={styles["expeditions-list-section"]}>
                  <div className={styles["expeditions-list-header"]}>
                    <span className={styles["expeditions-list-title"]}>Recent Expeditions</span>
                    <button className={styles["filter-icon-btn"]} onClick={() => alert('Filter applied')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                    </button>
                  </div>

                  {expeditions.map((exp) => (
                    <div key={exp.id} className={styles["expedition-feed-card"]}>
                      <div className={styles["expedition-image-panel"]}>
                        <img src={exp.imageUrl} alt={exp.title} />
                        <span className={styles["expedition-category-badge"]}>{exp.category}</span>
                      </div>
                      <div className={styles["expedition-content-panel"]}>
                        <div>
                          <div className={styles["expedition-meta-top"]}>
                            <h3 className={styles["expedition-title-text"]}>{exp.title}</h3>
                            <span className={styles["expedition-date-text"]}>{exp.date}</span>
                          </div>
                          <p className={styles["expedition-desc-text"]}>{exp.description}</p>
                          <div className={styles["expedition-details-row"]}>
                            <span className={styles["expedition-detail-item"]}>📅 {exp.duration}</span>
                            <span className={styles["expedition-detail-item"]}>✈️ {exp.airline}</span>
                            <span className={styles["expedition-detail-item"]}>📍 {exp.country}</span>
                          </div>
                        </div>
                        <div className={styles["expedition-footer-buttons"]}>
                          <div className={styles["expedition-left-buttons"]}>
                            <button className={styles["btn-rebook-yellow"]} onClick={() => router.push(`/explore`)}>Rebook</button>
                            <button className={styles["btn-receipt-outline"]} onClick={() => setSelectedReceipt(exp)}>View Receipt</button>
                          </div>
                          <button className={styles["btn-share-icon"]} onClick={() => alert('Receipt shared!')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="18" cy="5" r="3" />
                              <circle cx="6" cy="12" r="3" />
                              <circle cx="18" cy="19" r="3" />
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab: My Trips */}
          {activeTab === 'my-trips' && (
            <div className={styles["card-container"]} style={{ background: 'none', padding: 0, boxShadow: 'none' }}>
              <h2 className={styles["card-header-title"]}>My Travel Archives</h2>
              <p className={styles["card-header-subtitle"]} style={{ marginBottom: '24px' }}>A curated collection of your planned and upcoming adventures.</p>

              {loadingTrips ? (
                <div>Searching your archives...</div>
              ) : trips.length === 0 ? (
                <div className={styles["card-container"]} style={{ textAlign: 'center', padding: '60px 40px', background: 'white', borderRadius: '24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#031B4E', marginBottom: '8px' }}>Your map is uncharted</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Begin your legacy by planning your first escape.</p>
                  <button className={styles["btn-upload-yellow"]} onClick={() => router.push('/explore')}>Discover Destinations</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {trips.map((trip) => (
                    <div key={trip.id} style={{
                      background: 'white', borderRadius: '28px', overflow: 'hidden', border: '1px solid #F1F5F9',
                      boxShadow: '0 10px 40px rgba(3, 27, 78, 0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(3, 27, 78, 0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(3, 27, 78, 0.05)'; }}
                    >
                      <div style={{
                        height: '160px', background: '#031B4E', position: 'relative', padding: '24px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        backgroundImage: `linear-gradient(rgba(3, 27, 78, 0.4), rgba(3, 27, 78, 0.8)), url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800')`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }}>
                        <div style={{
                          alignSelf: 'flex-end', background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)',
                          padding: '6px 14px', borderRadius: '30px', color: 'white', fontSize: '10px', fontWeight: '800',
                          textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>Upcoming</div>
                        <div style={{
                          fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '800', color: 'white',
                          textShadow: '0 2px 15px rgba(0,0,0,0.4)', letterSpacing: '-0.5px'
                        }}>{trip.country}</div>
                      </div>
                      
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '800', color: '#031B4E', margin: '0 0 12px' }}>{trip.title}</h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>
                          <span>📅 {trip.duration}</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                          <button 
                            style={{
                              flex: 1, background: '#031B4E', color: 'white', textAlign: 'center', padding: '12px',
                              borderRadius: '12px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer',
                              boxShadow: '0 5px 15px rgba(3, 27, 78, 0.2)', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#0A2B6E'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#031B4E'}
                            onClick={() => router.push(`/trip-confirm?tripId=${trip.id}`)}
                          >
                            Open Planner
                          </button>
                          <button 
                            style={{
                              width: '44px', background: '#FFF1F2', border: 'none', borderRadius: '12px',
                              cursor: 'pointer', fontSize: '18px', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#FFE4E6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#FFF1F2'}
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this trip?')) {
                                const { error } = await supabase.from('trips').delete().eq('id', trip.id)
                                if (!error) setTrips(prev => prev.filter(t => t.id !== trip.id))
                              }
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Navigation Sidebar */}
        <div className={styles["right-sidebar-navigation-card"]}>
          <button 
            className={`${styles["sidebar-tab-button"]} ${activeTab === 'personal-info' ? styles["active-tab"] : ''}`}
            onClick={() => setActiveTab('personal-info')}
          >
            <span className={styles["tab-icon"]}>👤</span>
            Personal Info
          </button>

          <button 
            className={`${styles["sidebar-tab-button"]} ${activeTab === 'my-trips' ? styles["active-tab"] : ''}`}
            onClick={() => setActiveTab('my-trips')}
          >
            <span className={styles["tab-icon"]}>✈️</span>
            My Trips
          </button>

          <button 
            className={`${styles["sidebar-tab-button"]} ${activeTab === 'security' ? styles["active-tab"] : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className={styles["tab-icon"]}>🛡️</span>
            Security
          </button>

          <button 
            className={`${styles["sidebar-tab-button"]} ${activeTab === 'notifications' ? styles["active-tab"] : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className={styles["tab-icon"]}>🔔</span>
            Notifications
          </button>

          <button 
            className={styles["sidebar-tab-button"]}
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
          >
            <span className={styles["tab-icon"]}>🚪</span>
            Log Out
          </button>
        </div>
      </div>

    </div>
  )
}
