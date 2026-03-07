'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Trip {
  id: string
  title: string
  country: string
  date_range: string
  places_count: number
  travelers_count: number
  status: 'Completed' | 'Upcoming' | 'In Progress'
  image_url?: string
  description?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [stats, setStats] = useState({
    totalTrips: 0,
    countries: 0,
    cities: 0,
    reviews: 0
  })

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const currentUser = session.user
      setUser(currentUser)

      try {
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        setProfile(profileData)

        // 2. Fetch Stats
        const statsRes = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats({
            totalTrips: statsData.stats.totalTrips,
            countries: statsData.stats.countries,
            cities: statsData.stats.places, // Using places as cities
            reviews: statsData.stats.reviews
          })
        }

        // 3. Fetch Trips
        const tripsRes = await fetch('/api/trips', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        const tripsData = await tripsRes.json()
        if (tripsData.success) {
          const mappedTrips = tripsData.trips.map((t: any) => ({
            id: t.id,
            title: t.title,
            country: t.country,
            date_range: t.duration || 'Flexible',
            places_count: t.days?.reduce((acc: number, d: any) => acc + (d.items?.length || 0), 0) || 0,
            travelers_count: 1,
            status: t.status || 'Upcoming',
            image_url: t.image_url || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=400`,
            description: t.description || `A wonderful trip to ${t.country}.`
          }))
          setTrips(mappedTrips)
        }

      } catch (err) {
        console.error('Dashboard Init Error:', err)
      } finally {
        setLoading(false)
      }
    }
    initDashboard()
  }, [router])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div className="spinner"></div>
        <style jsx>{`
          .spinner { width: 30px; height: 30px; border: 2px solid #f3f3f3; border-top: 2px solid #000; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Traveler'
  const email = user?.email || profile?.email || ''
  const location = profile?.location || 'Add Location'
  const bio = profile?.bio || 'No bio yet. Tell us about your travel passion!'
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'

  return (
    <div className="profile-view-container">
      {/* Hero Header */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            <div className="avatar-img-wrapper">
              <img
                src={avatarUrl}
                alt="Profile"
              />
            </div>
            <Link href="/dashboard/profile" className="edit-photo-link" style={{ textDecoration: 'none', display: 'inline-block' }}>📷 Edit Photo</Link>
          </div>

          <div className="profile-main-info">
            <div className="name-row">
              <h1>{fullName}</h1>
              <span className="verified-badge">✓ VERIFIED</span>
            </div>

            <div className="meta-info">
              <span>📍 {location}</span>
              <span>📅 Member since {new Date(profile?.created_at || user?.created_at).getFullYear()}</span>
              <span>✉️ {email}</span>
            </div>

            <p className="profile-bio">{bio}</p>

            <div className="profile-actions">
              <Link href="/dashboard/profile" className="btn-edit-profile">✏️ Edit Profile</Link>
              <button className="btn-share-profile">🔗 Share Profile</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Left Sidebar Stats */}
        <aside className="stats-sidebar">
          <div className="stats-card">
            <h3>Travel Statistics</h3>
            <div className="stat-item">
              <span className="stat-icon">✈️</span>
              <span className="stat-label">Total Trips</span>
              <span className="stat-value">{stats.totalTrips}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🌍</span>
              <span className="stat-label">Countries</span>
              <span className="stat-value">{stats.countries}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏙️</span>
              <span className="stat-label">Cities Visited</span>
              <span className="stat-value">{stats.cities}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">Reviews</span>
              <span className="stat-value">{stats.reviews}</span>
            </div>
          </div>

          <div className="achievements-card">
            <h3>Achievements</h3>
            <div className="achievements-grid">
              <div className="badge-item gold">🏆</div>
              <div className="badge-item yellow">🏅</div>
              <div className="badge-item orange">👑</div>
            </div>
          </div>
        </aside>

        {/* Right Main Feed */}
        <main className="recent-trips-section">
          <div className="section-header">
            <h2>Recent Trips</h2>
            <select className="trip-filter">
              <option>All Trips</option>
              <option>Completed</option>
              <option>Upcoming</option>
            </select>
          </div>

          <div className="trips-list">
            {trips.length > 0 ? trips.map(trip => (
              <div key={trip.id} className="trip-feed-card">
                <div className="trip-img">
                  <img src={trip.image_url} alt={trip.title} />
                </div>
                <div className="trip-details">
                  <div className="trip-header">
                    <h3>{trip.title}</h3>
                    <span className={`status-tag ${trip.status.toLowerCase().replace(' ', '-')}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="trip-meta">
                    <span>📅 {trip.date_range}</span>
                    <span>📍 {trip.places_count} Places</span>
                    <span>👥 {trip.travelers_count} {trip.travelers_count === 1 ? 'Solo Trip' : 'Travelers'}</span>
                  </div>
                  <p className="trip-desc">{trip.description}</p>
                  <div className="trip-footer">
                    <button className="btn-view-details" onClick={() => router.push(`/trip-map?tripId=${trip.id}`)}>👁️ View Details</button>
                    <button className="btn-secondary-action">
                      {trip.status === 'Upcoming' ? '✏️ Edit Trip' : '🔁 Duplicate'}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-trips" style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>No trips planned yet.</p>
                <Link href="/" className="btn-edit-profile" style={{ display: 'inline-block' }}>Start Planning Now</Link>
              </div>
            )}
          </div>

          {/* Bottom Tabs Mock */}
          <div className="dashboard-bottom-nav">
            <button className="active">📁 My Trips</button>
            <button>❤️ Wishlist</button>
            <button>⭐ Reviews</button>
            <button>⚙️ Settings</button>
          </div>
        </main>
      </div>

      <style jsx>{`
        .profile-view-container {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .profile-hero {
          background: #0a192f;
          color: white;
          padding: 60px 40px;
        }

        .profile-hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 40px;
          align-items: flex-start;
        }

        .profile-avatar-large {
          flex-shrink: 0;
          text-align: center;
        }

        .avatar-img-wrapper {
          width: 150px;
          height: 150px;
          border-radius: 20px;
          border: 4px solid #ffc107;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .avatar-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .edit-photo-link {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }

        .profile-main-info {
          flex: 1;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .name-row h1 {
          font-size: 2.5rem;
          margin: 0;
          font-weight: 700;
        }

        .verified-badge {
          background: #ffc107;
          color: #000;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .meta-info {
          display: flex;
          gap: 25px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .profile-bio {
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 30px;
          max-width: 800px;
        }

        .profile-actions {
          display: flex;
          gap: 15px;
        }

        .btn-edit-profile {
          background: #ffc107;
          color: #000;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.95rem;
        }

        .btn-share-profile {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
        }

        .dashboard-content-grid {
          max-width: 1200px;
          margin: 40px auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
          padding: 0 40px;
        }

        .stats-sidebar {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .stats-card, .achievements-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #edf2f7;
        }

        .stats-card h3, .achievements-card h3 {
          font-size: 1.1rem;
          margin: 0 0 20px 0;
          color: #0a192f;
        }

        .stat-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .stat-item:last-child { border-bottom: none; }

        .stat-icon { font-size: 1.2rem; margin-right: 15px; }
        .stat-label { flex: 1; color: #64748b; font-size: 0.9rem; }
        .stat-value { font-weight: 700; color: #0a192f; }

        .achievements-grid {
          display: flex;
          gap: 15px;
        }

        .badge-item {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .badge-item.gold { background: #fee2e2; }
        .badge-item.yellow { background: #fef3c7; }
        .badge-item.orange { background: #ffedd5; }

        .recent-trips-section {
          flex: 1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .section-header h2 {
          font-size: 1.5rem;
          margin: 0;
          color: #0a192f;
        }

        .trip-filter {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          outline: none;
        }

        .trips-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .trip-feed-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #edf2f7;
        }

        .trip-img {
          width: 200px;
          height: 100%;
          flex-shrink: 0;
        }

        .trip-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .trip-details {
          padding: 24px;
          flex: 1;
        }

        .trip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .trip-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #0a192f;
        }

        .status-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-tag.completed { background: #dcfce7; color: #166534; }
        .status-tag.upcoming { background: #e0f2fe; color: #0369a1; }

        .trip-meta {
          display: flex;
          gap: 20px;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 15px;
        }

        .trip-desc {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 20px;
        }

        .trip-footer {
          display: flex;
          gap: 15px;
        }

        .btn-view-details {
          background: #f1f5f9;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-secondary-action {
          background: transparent;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .dashboard-bottom-nav {
          margin-top: 40px;
          background: white;
          padding: 10px;
          border-radius: 12px;
          display: flex;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #edf2f7;
        }

        .dashboard-bottom-nav button {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          font-weight: 600;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dashboard-bottom-nav button.active {
          background: #0a192f;
          color: white;
        }
      `}</style>
    </div>
  )
}
