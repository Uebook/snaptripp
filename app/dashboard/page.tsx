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
  const [activeTab, setActiveTab] = useState<'personal-info' | 'security' | 'notifications' | 'travel-history' | 'saved-places'>('personal-info')

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
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

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

          // Try parsing phone prefix
          if (loadedProfile.phone && loadedProfile.phone.startsWith('+')) {
            const parts = loadedProfile.phone.split(' ')
            if (parts.length > 1) {
              setPhonePrefix(parts[0])
              setProfile((prev: any) => ({ ...prev, phone: parts.slice(1).join(' ') }))
            }
          }
        }
      } catch (err) {
        console.error('Error loading dashboard profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [router])

  // Profile Save
  const handleSaveProfile = async () => {
    if (!user) return
    setIsSavingProfile(true)

    try {
      const fullPhone = `${phonePrefix} ${profile.phone}`.trim()
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          username: profile.username.toLowerCase().replace(/[^a-z0-9._]/g, ''),
          phone: fullPhone,
          bio: profile.bio,
          location: profile.location,
          avatar_url: profile.avatar_url,
          preferences: preferences,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setInitialProfile({ ...profile, phone: profile.phone })
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
                      value={profile.username.startsWith('@') ? profile.username : `@${profile.username}`}
                      onChange={e => setProfile({...profile, username: e.target.value.replace('@', '')})}
                    />
                  </div>

                  <div className={styles["field-block"]}>
                    <span className={styles["field-label-tag"]}>Phone Number</span>
                    <div className={styles["phone-input-wrapper"]}>
                      <select 
                        className={styles["phone-prefix-select"]}
                        value={phonePrefix}
                        onChange={e => setPhonePrefix(e.target.value)}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+91">+91</option>
                        <option value="+33">+33</option>
                        <option value="+49">+49</option>
                      </select>
                      <input 
                        type="tel" 
                        className={`${styles["field-input-box"]} ${styles["phone-number-field"]}`}
                        value={profile.phone}
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
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

              {/* Verify Identity Banner */}
              <div className={styles["verify-identity-card"]}>
                <div className={styles["verify-card-left"]}>
                  <span className={styles["verify-title"]}>Verify Your Identity</span>
                  <span className={styles["verify-desc"]}>Increase your booking limits and get the verified traveler badge on your profile.</span>
                  <button 
                    onClick={() => alert('Verification process started! Please upload a valid ID in the Traveler ID page.')}
                    className={styles["verify-link"]} 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    Get Started &rarr;
                  </button>
                </div>
                <div className={styles["verify-card-right-bg"]}>
                  <svg width="74" height="74" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                </div>
              </div>

              {/* Travel History Summary List */}
              <div className={styles["travel-history-summary-card"]}>
                <h3 className={styles["section-title-bold"]}>Travel History</h3>
                <div className={styles["summary-list-container"]}>
                  <div className={styles["summary-list-item"]} onClick={() => setActiveTab('travel-history')}>
                    <div className={styles["summary-item-left"]}>
                      <div className={styles["pin-icon-wrapper"]}>📍</div>
                      <div className={styles["summary-item-details"]}>
                        <span className={styles["summary-item-title"]}>Tokyo, Japan</span>
                        <span className={styles["summary-item-subtitle"]}>Oct 2023 &bull; 10 days</span>
                      </div>
                    </div>
                    <span className={styles["chevron-right-grey"]}>&rarr;</span>
                  </div>

                  <div className={styles["summary-list-item"]} onClick={() => setActiveTab('travel-history')}>
                    <div className={styles["summary-item-left"]}>
                      <div className={styles["pin-icon-wrapper"]}>📍</div>
                      <div className={styles["summary-item-details"]}>
                        <span className={styles["summary-item-title"]}>Paris, France</span>
                        <span className={styles["summary-item-subtitle"]}>May 2023 &bull; 7 days</span>
                      </div>
                    </div>
                    <span className={styles["chevron-right-grey"]}>&rarr;</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Security */}
          {activeTab === 'security' && (
            <>
              <div className={styles["card-container"]}>
                <h2 className={styles["card-header-title"]}>Security Settings</h2>
                <p className={styles["card-header-subtitle"]}>Manage your account security, set up authentication methods, and monitor active sessions to keep your travel plans safe.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  {/* Change Password Card */}
                  <div className={styles["card-container"]} style={{ padding: '30px', boxShadow: 'none', border: '1px solid #f3f4f6' }}>
                    <h3 className={styles["section-title-bold"]} style={{ fontSize: '18px', marginBottom: '20px' }}>🔑 Change Password</h3>
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className={styles["field-block"]}>
                        <span className={styles["field-label-tag"]}>Current Password</span>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••" 
                          className={styles["field-input-box"]}
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                      </div>
                      <div className={styles["field-block"]}>
                        <span className={styles["field-label-tag"]}>New Password</span>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••" 
                          className={styles["field-input-box"]}
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                      </div>
                      <div className={styles["field-block"]}>
                        <span className={styles["field-label-tag"]}>Confirm New Password</span>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••" 
                          className={styles["field-input-box"]}
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                      </div>
                      <button type="submit" className={styles["btn-upload-yellow"]} style={{ width: '100%', marginTop: '10px' }} disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  {/* Two-Factor Auth Card */}
                  <div className={styles["two-factor-auth-card"]} style={{ border: '1px solid #f3f4f6', boxShadow: 'none', padding: '30px' }}>
                    <div className={styles["two-factor-header-row"]}>
                      <h3 className={styles["section-title-bold"]} style={{ fontSize: '18px', margin: 0 }}>🛡️ Two-Factor Auth</h3>
                      <button 
                        className={`${styles["switch-toggle-btn"]} ${twoFactorEnabled ? styles["switch-active"] : ''}`}
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      >
                        <span className={styles["switch-knob"]}></span>
                      </button>
                    </div>
                    <p className={styles["card-header-subtitle"]} style={{ fontSize: '13px', margin: '12px 0 0 0' }}>Add an extra layer of security to your account by requiring more than just a password to log in.</p>

                    <div className={styles["authenticator-app-badge"]}>
                      <div className={styles["auth-badge-icon"]}>📱</div>
                      <div className={styles["auth-badge-details"]}>
                        <span className={styles["auth-badge-title"]}>Authenticator App</span>
                        <span className={styles["auth-badge-desc"]}>{twoFactorEnabled ? 'Google Authenticator active' : 'Inactive'}</span>
                      </div>
                    </div>

                    <button className={styles["btn-manage-auth"]} onClick={() => alert('Authenticator settings modal opened.')}>Manage Auth Methods</button>
                  </div>
                </div>

                {/* Active Sessions Card */}
                <div className={styles["active-sessions-card"]} style={{ border: '1px solid #f3f4f6', boxShadow: 'none', padding: '30px', marginBottom: '24px' }}>
                  <div className={styles["active-sessions-header"]}>
                    <h3 className={styles["section-title-bold"]} style={{ fontSize: '18px', margin: 0 }}>💻 Active Sessions</h3>
                    <button className={styles["logout-all-btn-red"]} onClick={handleLogoutAllDevices}>LOG OUT FROM ALL DEVICES</button>
                  </div>

                  <div className={styles["sessions-list-container"]}>
                    {activeSessions.map((session, i) => (
                      <div key={i} className={styles["session-item-row"]}>
                        <div className={styles["session-left-details"]}>
                          <div className={`${styles["device-icon-circle"]} ${session.isCurrent ? styles.gold : ''}`}>
                            {session.device.includes('iPhone') || session.device.includes('iPad') ? '📱' : '💻'}
                          </div>
                          <div className={styles["session-texts"]}>
                            <span className={styles["session-device-name"]}>
                              {session.device}
                              {session.isCurrent && <span className={styles["current-session-badge"]}>Current</span>}
                            </span>
                            <span className={styles["session-meta-line"]}>Chrome &bull; {session.location} &bull; {session.ip}</span>
                          </div>
                        </div>
                        <div className={styles["session-action-area"]}>
                          {session.isCurrent ? (
                            <span className={styles["active-session-text"]}>Active</span>
                          ) : (
                            <button className={styles["btn-session-logout-red"]} onClick={() => handleLogoutSession(session.device)}>Logout</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login History */}
                <div className={styles["login-history-card"]} style={{ border: '1px solid #f3f4f6', boxShadow: 'none', padding: '30px' }}>
                  <h3 className={styles["section-title-bold"]} style={{ fontSize: '18px', marginBottom: '20px' }}>📒 Login History</h3>
                  <div className={styles["history-metrics-grid"]}>
                    <div className={styles["history-metric-box"]}>
                      <span className={styles["history-metric-label"]}>Last Password Change</span>
                      <span className={styles["history-metric-value"]}>September 12, 2023</span>
                    </div>
                    <div className={styles["history-metric-box"]}>
                      <span className={styles["history-metric-label"]}>Failed Login Attempts</span>
                      <span className={styles["history-metric-value"]}>0 in last 30 days</span>
                    </div>
                    <div className={styles["history-metric-box"]}>
                      <span className={styles["history-metric-label"]}>Security Score</span>
                      <span className={`${styles["history-metric-value"]} ${styles.excellent}`}>Excellent (98/100)</span>
                    </div>
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

                <div className={styles["pref-checkbox-row"]}>
                  <div className={styles["pref-checkbox-left"]}>
                    <span className={styles["pref-checkbox-title"]}>Public Profile Visibility</span>
                    <span className={styles["pref-checkbox-desc"]}>Allow other globetrotters to view your travel archives, map data, and recommendations.</span>
                  </div>
                  <button 
                    className={`${styles["switch-toggle-btn"]} ${preferences.public_profile ? styles["switch-active"] : ''}`}
                    onClick={() => {
                      const newPrefs = { ...preferences, public_profile: !preferences.public_profile }
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

          {/* Tab 5: Saved Places */}
          {activeTab === 'saved-places' && (
            <div className={styles["card-container"]} style={{ background: 'none', padding: 0, boxShadow: 'none' }}>
              <h2 className={styles["card-header-title"]}>Saved Destinations</h2>
              <p className={styles["card-header-subtitle"]} style={{ marginBottom: '24px' }}>Curate your next escape from your collection of dream spots.</p>

              <div className={styles["saved-places-tabs-row"]}>
                {(['All', 'Beach', 'Mountain', 'City Escape'] as const).map(tab => (
                  <button 
                    key={tab} 
                    className={`${styles["saved-pill-button"]} ${savedFilter === tab ? styles["active-pill"] : ''}`}
                    onClick={() => setSavedFilter(tab)}
                  >
                    {tab === 'All' ? 'All Trips' : tab}
                  </button>
                ))}
              </div>

              <div className={styles["saved-places-grid"]}>
                {savedPlaces
                  .filter(place => savedFilter === 'All' || place.category === savedFilter)
                  .map((place, i) => (
                    <div key={place.id} className={`${styles["saved-place-card"]} ${i === 0 ? styles["large-feature-card"] : ''}`}>
                      <div className={styles["saved-place-image-panel"]}>
                        <img src={place.imageUrl} alt={place.title} />
                        <button 
                          className={`${styles["heart-badge-icon"]} ${heartedPlaces.includes(place.id) ? styles["heart-active"] : ''}`}
                          onClick={() => toggleHeart(place.id)}
                        >
                          ❤️
                        </button>
                        <span className={styles["saved-place-category-badge"]}>{place.category}</span>
                      </div>
                      <div className={styles["saved-place-content-panel"]}>
                        <div>
                          <div className={styles["saved-place-title-row"]}>
                            <h3 className={styles["saved-place-title"]}>{place.title}</h3>
                          </div>
                          <p className={styles["saved-place-desc"]}>{place.description}</p>
                        </div>
                        <div className={styles["saved-place-footer"]}>
                          <span className={styles["saved-place-price"]}>{place.price} <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal' }}>/ person</span></span>
                          <button className={styles["btn-plan-trip-yellow"]} onClick={() => router.push(`/trip-map?country=${encodeURIComponent(place.location.split(',')[1]?.trim() || '')}`)}>Plan Trip</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className={styles["saved-places-footer-section"]}>
                <button className={styles["btn-discover-more-outline"]} onClick={() => router.push('/explore')}>Discover More Destinations</button>
              </div>
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
            className={`${styles["sidebar-tab-button"]} ${activeTab === 'travel-history' ? styles["active-tab"] : ''}`}
            onClick={() => setActiveTab('travel-history')}
          >
            <span className={styles["tab-icon"]}>⏳</span>
            Travel History
          </button>

          <button 
            className={`${styles["sidebar-tab-button"]} ${activeTab === 'saved-places' ? styles["active-tab"] : ''}`}
            onClick={() => setActiveTab('saved-places')}
          >
            <span className={styles["tab-icon"]}>🔖</span>
            Saved Places
          </button>
        </div>
      </div>

      {/* Receipt Modal (Travel History View) */}
      {selectedReceipt && (
        <div className={styles["modal-backdrop-blur"]} onClick={() => setSelectedReceipt(null)}>
          <div className={styles["modal-content-card"]} onClick={e => e.stopPropagation()}>
            <button className={styles["modal-close-btn"]} onClick={() => setSelectedReceipt(null)}>✕</button>
            
            <div className={styles["receipt-modal-header"]}>
              <span className={styles["receipt-modal-title"]}>Booking Invoice</span>
              <div className={styles["receipt-modal-sub"]}>Invoice #{selectedReceipt.id.toUpperCase()} &bull; {selectedReceipt.date}</div>
            </div>

            <div className={styles["receipt-details-list"]}>
              <div className={styles["receipt-details-row"]}>
                <span className={styles["receipt-row-label"]}>Destination Tour</span>
                <span className={styles["receipt-row-val"]}>{selectedReceipt.title} ({selectedReceipt.country})</span>
              </div>
              <div className={styles["receipt-details-row"]}>
                <span className={styles["receipt-row-label"]}>Carrier Flight</span>
                <span className={styles["receipt-row-val"]}>{selectedReceipt.airline}</span>
              </div>
              <div className={styles["receipt-details-row"]}>
                <span className={styles["receipt-row-label"]}>Duration</span>
                <span className={styles["receipt-row-val"]}>{selectedReceipt.duration}</span>
              </div>
              <div className={styles["receipt-details-row"]}>
                <span className={styles["receipt-row-label"]}>Base Cost</span>
                <span className={styles["receipt-row-val"]}>${selectedReceipt.price.toLocaleString()}</span>
              </div>
              <div className={styles["receipt-details-row"]}>
                <span className={styles["receipt-row-label"]}>Taxes</span>
                <span className={styles["receipt-row-val"]}>${selectedReceipt.taxes.toLocaleString()}</span>
              </div>
              <div className={styles["receipt-details-row"]}>
                <span className={styles["receipt-row-label"]}>Service Fee</span>
                <span className={styles["receipt-row-val"]}>${selectedReceipt.fee.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles["receipt-modal-footer"]}>
              <span className={styles["receipt-total-label"]}>Total Paid</span>
              <span className={styles["receipt-total-val"]}>${(selectedReceipt.price + selectedReceipt.taxes + selectedReceipt.fee).toLocaleString()}</span>
            </div>

            <button className={styles["btn-upload-yellow"]} style={{ width: '100%' }} onClick={() => alert('PDF receipt downloaded!')}>
              Download PDF Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
