'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
    }
  })
  const [stats, setStats] = useState({
    trips: 0,
    countries: 0
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !loading) {
        // Only redirect if NOT loading and no session
        // To be even safer for subagent, we'll log it first
        console.log("No session found, redirecting...");
        router.push('/')
        return
      }

      if (!session) return; // session should be checked by now

      setUser(session.user)

      try {
        // Fetch Profile from DB
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          const names = profileData.full_name ? profileData.full_name.split(' ') : ['']
          const firstName = names[0] || ''
          const lastName = names.slice(1).join(' ') || ''

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
              email_notifications: profileData.preferences?.email_notifications ?? true,
              travel_recommendations: profileData.preferences?.travel_recommendations ?? true,
              public_profile: profileData.preferences?.public_profile ?? true
            }
          })
        } else {
          setProfile(prev => ({
            ...prev,
            email: session.user.email || '',
            created_at: session.user.created_at,
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
          }))
        }

        // Fetch Stats
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsSaving(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update Profile state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))

      // Update DB
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
          preferences: profile.preferences,
          updated_at: new Date().toISOString()
        })
      if (error) throw error
      alert("Profile saved successfully!")
    } catch (error: any) {
      alert("Failed to save profile: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '40px' }}>Loading profile...</div>

  return (
    <div className="profile-edit-body">
      <header className="profile-edit-header">
        <div className="header-text">
          <h1>Edit Profile</h1>
          <p>Update your personal information and preferences</p>
        </div>
        <div className="header-buttons">
          <button className="btn-cancel" onClick={() => router.push('/dashboard')}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </header>

      <div className="profile-edit-grid">
        {/* Left Column: Photo & Stats */}
        <div className="edit-left-column">
          <div className="photo-card">
            <div className="avatar-preview">
              <img
                src={profile.avatar_url}
                alt="Profile"
              />
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
              className="btn-change-photo"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isSaving}
            >
              {isSaving ? 'Uploading...' : '↑ Change Photo'}
            </button>
            <p className="photo-hint">JPG, PNG or GIF. Max size 2MB</p>
          </div>

          <div className="account-stats-card">
            <h3>Account Stats</h3>
            <div className="stat-row">
              <span className="label">Trips Planned</span>
              <span className="value">{stats.trips}</span>
            </div>
            <div className="stat-row border-top">
              <span className="label">Countries Visited</span>
              <span className="value">{stats.countries}</span>
            </div>
            <div className="stat-row border-top">
              <span className="label">Member Since</span>
              <span className="value">{new Date(profile.created_at).getFullYear() || '-'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="edit-right-column">
          {/* Personal Info */}
          <div className="form-card">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
              <div className="input-group full-width">
                <label>Email Address</label>
                <div className="icon-input">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <div className="icon-input">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Location</label>
                <div className="icon-input">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. New York, USA"
                  />
                </div>
              </div>
              <div className="input-group full-width">
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

          {/* Preferences */}
          <div className="form-card">
            <h3>Preferences</h3>
            <div className="preferences-list">
              <div className="pref-item">
                <div className="pref-text">
                  <span className="pref-label">Email Notifications</span>
                  <span className="pref-desc">Receive updates about your trips and new features</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={profile.preferences.email_notifications}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, email_notifications: e.target.checked }
                    }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="pref-item divider">
                <div className="pref-text">
                  <span className="pref-label">Travel Recommendations</span>
                  <span className="pref-desc">Get personalized destination suggestions</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={profile.preferences.travel_recommendations}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, travel_recommendations: e.target.checked }
                    }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="pref-item divider">
                <div className="pref-text">
                  <span className="pref-label">Public Profile</span>
                  <span className="pref-desc">Make your profile visible to other travelers</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={profile.preferences.public_profile}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, public_profile: e.target.checked }
                    }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="form-card security-card">
            <h3>🛡️ Security Settings</h3>
            <div className="security-actions">
              <button className="btn-outline">🔓 Change Password</button>
              <button className="btn-outline">📱 Enable 2FA</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-edit-body {
          padding: 40px;
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .profile-edit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .header-text h1 {
          font-size: 2rem;
          color: #0a192f;
          margin: 0 0 8px 0;
          font-weight: 700;
        }

        .header-text p {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
        }

        .header-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save {
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .profile-edit-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 30px;
          max-width: 1200px;
        }

        .photo-card, .account-stats-card, .form-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #edf2f7;
          margin-bottom: 30px;
        }

        .photo-card {
          text-align: center;
        }

        .avatar-preview {
          width: 120px;
          height: 120px;
          border-radius: 20px;
          border: 3px solid #0ea5e9;
          overflow: hidden;
          margin: 0 auto 20px;
        }

        .avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-change-photo {
          background: white;
          border: 1px solid #0ea5e9;
          color: #0ea5e9;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .photo-hint {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }

        .account-stats-card h3, .form-card h3 {
          font-size: 1.1rem;
          color: #0a192f;
          margin: 0 0 24px 0;
          font-weight: 700;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
        }

        .stat-row.border-top {
          border-top: 1px solid #f1f5f9;
        }

        .stat-row .label { color: #64748b; font-size: 0.9rem; }
        .stat-row .value { font-weight: 800; color: #0ea5e9; }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .input-group.full-width {
          grid-column: span 2;
        }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0a192f;
          margin-bottom: 8px;
        }

        .input-group input, .input-group textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }

        .input-group input:focus, .input-group textarea:focus {
          border-color: #0ea5e9;
          background: white;
        }

        .icon-input {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
          pointer-events: none;
        }

        .icon-input input {
          padding-left: 44px;
        }

        .preferences-list {
          display: flex;
          flex-direction: column;
        }

        .pref-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
        }

        .pref-item.divider {
          border-top: 1px solid #f1f5f9;
        }

        .pref-text { display: flex; flex-direction: column; gap: 4px; }
        .pref-label { font-weight: 700; color: #0a192f; font-size: 0.95rem; }
        .pref-desc { font-size: 0.85rem; color: #64748b; }

        .toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #e2e8f0;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider { background-color: #0ea5e9; }
        input:checked + .slider:before { transform: translateX(20px); }

        .security-card {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
        }

        .security-actions {
          display: flex;
          gap: 15px;
        }

        .btn-outline {
          background: white;
          border: 1px solid #0ea5e9;
          color: #0ea5e9;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
