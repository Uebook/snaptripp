'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import styles from './ProfilePage.module.css'
import { validateUsername, checkUsernameAvailability, generateUsernameSuggestions } from '@/lib/utils/username'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: '',
    created_at: '',
    preferences: {
      email_notifications: true,
      travel_recommendations: true,
      public_profile: true
    },
    username: ''
  })
  const [stats, setStats] = useState({
    trips: 0,
    countries: 0
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameError, setUsernameError] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [initialUsername, setInitialUsername] = useState('')

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !loading) {
        console.log("No session found, redirecting...");
        router.push('/')
        return
      }

      if (!session) return;

      setUser(session.user)

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          const names = profileData.full_name ? profileData.full_name.split(' ') : ['']
          const firstName = names[0] || ''
          const lastName = names.slice(1).join(' ') || ''

          let dbPrefs = profileData.preferences
          if (typeof dbPrefs === 'string' && dbPrefs.trim().startsWith('{')) {
            try {
              dbPrefs = JSON.parse(dbPrefs)
            } catch (e) {
              console.error("Failed to parse preferences string:", e)
            }
          }

          setProfile({
            first_name: firstName,
            last_name: lastName,
            email: profileData.email || session.user.email || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            created_at: profileData.created_at || session.user.created_at,
            preferences: {
              email_notifications: dbPrefs?.email_notifications ?? true,
              travel_recommendations: dbPrefs?.travel_recommendations ?? true,
              public_profile: dbPrefs?.public_profile ?? true
            },
            username: profileData.username || ''
          })
          setInitialUsername(profileData.username || '')
        } else {
          setProfile(prev => ({
            ...prev,
            email: session.user.email || '',
            created_at: session.user.created_at,
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
          }))
        }

        const { count: tripsCount } = await supabase
          .from('trips')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)

        const { data: reviewsData } = await supabase
          .from('traveler_reviews')
          .select('country')
          .eq('user_id', session.user.id)

        const uniqueCountries = new Set(reviewsData?.map(r => r.country) || [])

        setStats({
          trips: tripsCount || 0,
          countries: uniqueCountries.size
        })

      } catch (error) {
        console.error("Error fetching profile details:", error)
      }

      setLoading(false)
    }
    fetchUser()
  }, [router])

  // Real-time username validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      const username = profile.username.toLowerCase().trim()

      if (!username || username === initialUsername) {
        setUsernameStatus('idle')
        setUsernameError('')
        setSuggestions([])
        return
      }

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
        setUsernameError('This username is already taken.')
        const s = await generateUsernameSuggestions(username)
        setSuggestions(s)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [profile.username, initialUsername])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsSaving(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError
      alert("Photo updated successfully!")

    } catch (error: any) {
      alert("Error uploading photo: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Final check on username
    if (profile.username !== initialUsername) {
      const validation = validateUsername(profile.username)
      if (!validation.isValid) {
        alert(validation.error)
        return
      }
      if (usernameStatus === 'taken' || usernameStatus === 'checking') {
        alert("Please choose an available username first.")
        return
      }
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: `${profile.first_name} ${profile.last_name}`.trim(),
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          username: profile.username.toLowerCase().trim(),
          preferences: profile.preferences,
          updated_at: new Date().toISOString()
        })
      if (error) throw error
      setInitialUsername(profile.username.toLowerCase().trim())
      alert("Profile saved successfully!")
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      alert("Failed to save profile: " + (error.message || "Unknown error"))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long.")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })
      if (error) throw error
      alert("Password updated successfully!")
      setShowPasswordForm(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      alert("Error updating password: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["spinner"]}></div>
        <h2>Loading your profile...</h2>
        <p>Please wait while we fetch your adventure details.</p>
      </div>
    )
  }

  return (
    <div className={styles["profile-edit-body"]}>
      <header className={styles["profile-edit-header"]}>
        <div className={styles["header-text"]}>
          <h1>Edit Profile</h1>
          <p>Update your personal information and preferences</p>
        </div>
        <div className={styles["header-buttons"]}>
          <button className={styles["btn-cancel"]} onClick={() => router.push('/dashboard')}>Cancel</button>
          <button className={styles["btn-save"]} onClick={handleSave} disabled={isSaving || (usernameStatus !== 'available' && usernameStatus !== 'idle')}>
            {isSaving ? 'Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </header>

      <div className={styles["profile-edit-grid"]}>
        <div className={styles["edit-left-column"]}>
          <div className={styles["photo-card"]}>
            <div className={styles["avatar-preview"]}>
              <img src={profile.avatar_url} alt="Profile" />
            </div>
            <input
              type="file"
              id="avatar-upload"
              hidden
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isSaving}
            />
            <button
              className={styles["btn-change-photo"]}
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isSaving}
            >
              {isSaving ? 'Uploading...' : '↑ Change Photo'}
            </button>
            <p className={styles["photo-hint"]}>JPG, PNG or GIF. Max size 2MB</p>
          </div>

          <div className={styles["account-stats-card"]}>
            <h3>Account Stats</h3>
            <div className={styles["stat-row"]}>
              <span className={styles["label"]}>Trips Planned</span>
              <span className={styles["value"]}>{stats.trips}</span>
            </div>
            <div className={`${styles["stat-row"]} ${styles["border-top"]}`}>
              <span className={styles["label"]}>Countries Visited</span>
              <span className={styles["value"]}>{stats.countries}</span>
            </div>
            <div className={`${styles["stat-row"]} ${styles["border-top"]}`}>
              <span className={styles["label"]}>Member Since</span>
              <span className={styles["value"]}>{new Date(profile.created_at).getFullYear() || '-'}</span>
            </div>
          </div>
        </div>

        <div className={styles["edit-right-column"]}>
          <div className={styles["form-card"]}>
            <h3>Personal Information</h3>
            <div className={styles["form-grid"]}>
              <div className={styles["input-group"]}>
                <label>First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className={styles["input-group"]}>
                <label>Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
              <div className={`${styles["input-group"]} ${styles["full-width"]}`}>
                <label>Email Address</label>
                <div className={styles["icon-input"]}>
                  <span className={styles["input-icon"]}>✉️</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className={`${styles["input-group"]} ${styles["full-width"]}`}>
                <label>Username (Public Profile Handle)</label>
                <div className={styles["icon-input"]}>
                  <span className={styles["input-icon"]}>@</span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '') }))}
                    placeholder="your-unique-handle"
                    style={{
                      borderColor:
                        usernameStatus === 'available' ? '#10b981' :
                          (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' :
                            undefined
                    }}
                  />
                  {usernameStatus !== 'idle' && (
                    <span className={`${styles["verification-badge"]} ${usernameStatus === 'available' ? styles.success :
                        (usernameStatus === 'taken' || usernameStatus === 'invalid') ? styles.error :
                          styles.checking
                      }`}>
                      {usernameStatus === 'available' && '✓'}
                      {usernameStatus === 'checking' && '◌'}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && '✕'}
                    </span>
                  )}
                </div>

                {/* Username Feedback logic */}
                {usernameStatus === 'checking' && (
                  <div className={styles["field-feedback"]}>
                    <div className={styles["spinner-small"]}></div>
                    <span>Checking availability...</span>
                  </div>
                )}
                {usernameStatus === 'available' && (
                  <div className={`${styles["field-feedback"]} ${styles["feedback-success"]}`}>
                    ✓ This username is available!
                  </div>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <div className={`${styles["field-feedback"]} ${styles["feedback-error"]}`}>
                    ✕ {usernameError}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className={styles["suggestions-container"]}>
                    <p>Suggestions:</p>
                    <div className={styles["suggestions-list"]}>
                      {suggestions.map(s => (
                        <span
                          key={s}
                          className={styles["suggestion-chip"]}
                          onClick={() => setProfile(prev => ({ ...prev, username: s }))}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className={styles["field-hint"]}>Your public profile will be at snaptrip.com/{profile.username || 'username'}</p>
              </div>
              <div className={styles["input-group"]}>
                <label>Phone Number</label>
                <div className={styles["icon-input"]}>
                  <span className={styles["input-icon"]}>📞</span>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className={styles["input-group"]}>
                <label>Location</label>
                <div className={styles["icon-input"]}>
                  <span className={styles["input-icon"]}>📍</span>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. New York, USA"
                  />
                </div>
              </div>
              <div className={`${styles["input-group"]} ${styles["full-width"]}`}>
                <label>Bio</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your travel style!"
                />
              </div>
            </div>
          </div>

          <div className={styles["form-card"]}>
            <h3>Preferences</h3>
            <div className={styles["preferences-list"]}>
              <div className={styles["pref-item"]}>
                <div className={styles["pref-text"]}>
                  <span className={styles["pref-label"]}>Email Notifications</span>
                  <span className={styles["pref-desc"]}>Receive updates about your trips and new features</span>
                </div>
                <label className={styles["toggle"]}>
                  <input
                    type="checkbox"
                    checked={profile.preferences.email_notifications}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, email_notifications: e.target.checked }
                    }))}
                  />
                  <span className={styles["slider"]}></span>
                </label>
              </div>
              <div className={`${styles["pref-item"]} ${styles["divider"]}`}>
                <div className={styles["pref-text"]}>
                  <span className={styles["pref-label"]}>Travel Recommendations</span>
                  <span className={styles["pref-desc"]}>Get personalized destination suggestions</span>
                </div>
                <label className={styles["toggle"]}>
                  <input
                    type="checkbox"
                    checked={profile.preferences.travel_recommendations}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, travel_recommendations: e.target.checked }
                    }))}
                  />
                  <span className={styles["slider"]}></span>
                </label>
              </div>
              <div className={`${styles["pref-item"]} ${styles["divider"]}`}>
                <div className={styles["pref-text"]}>
                  <span className={styles["pref-label"]}>Public Profile</span>
                  <span className={styles["pref-desc"]}>Make your profile visible to other travelers</span>
                </div>
                <label className={styles["toggle"]}>
                  <input
                    type="checkbox"
                    checked={profile.preferences.public_profile}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, public_profile: e.target.checked }
                    }))}
                  />
                  <span className={styles["slider"]}></span>
                </label>
              </div>
            </div>
          </div>

          <div className={`${styles["form-card"]} ${styles["security-card"]}`}>
            <h3>🛡️ Security Settings</h3>
            <div className={styles["security-actions"]}>
              <button
                className={styles["btn-outline"]}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? '✕ Cancel' : '🔓 Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className={styles["password-form"]}>
                <div className={styles["input-group"]}>
                  <label>New Password</label>
                  <div className={styles["password-input-wrapper"]}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      className={styles["toggle-password"]}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className={styles["input-group"]}>
                  <label>Confirm New Password</label>
                  <div className={styles["password-input-wrapper"]}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      className={styles["toggle-password"]}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <button type="submit" className={styles["btn-save"]} disabled={isSaving}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
