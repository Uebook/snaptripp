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

  // Mock data for the demonstration based on design
  const [trips] = useState<Trip[]>([
    {
      id: '1',
      title: 'Romantic Paris Getaway',
      country: 'France',
      date_range: 'Mar 15-22, 2024',
      places_count: 8,
      travelers_count: 2,
      status: 'Completed',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400',
      description: 'Explored the City of Light with visits to iconic landmarks, charming cafes, and romantic Seine river cruises. Unforgettable memories!'
    },
    {
      id: '2',
      title: 'Tokyo Adventure',
      country: 'Japan',
      date_range: 'Jun 10-20, 2024',
      places_count: 15,
      travelers_count: 1,
      status: 'Upcoming',
      image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400',
      description: 'Immersive journey through Japanese culture, from ancient temples to modern technology districts. Cherry blossom season awaits!'
    },
    {
      id: '3',
      title: 'Greek Island Hopping',
      country: 'Greece',
      date_range: 'Aug 5-18, 2023',
      places_count: 5,
      travelers_count: 4,
      status: 'Completed',
      image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=400',
      description: 'Magical Mediterranean adventure exploring Santorini, Mykonos, and hidden gems. Sunset views and authentic Greek cuisine!'
    }
  ])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)
      setLoading(false)
    }
    checkAuth()
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

  const fullName = user?.user_metadata?.full_name || 'Sarah Anderson'
  const email = user?.email || 'sarah.anderson@email.com'

  return (
    <div className="profile-view-container">
      {/* Hero Header */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            <div className="avatar-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                alt="Profile"
              />
            </div>
            <button className="edit-photo-link">📷 Edit Photo</button>
          </div>

          <div className="profile-main-info">
            <div className="name-row">
              <h1>{fullName}</h1>
              <span className="verified-badge">✓ VERIFIED</span>
            </div>

            <div className="meta-info">
              <span>📍 San Francisco, CA</span>
              <span>📅 Member since 2022</span>
              <span>✉️ {email}</span>
            </div>

            <p className="profile-bio">
              Passionate traveler exploring the world one destination at a time. Love discovering hidden gems, local cuisine, and connecting with people from different cultures. Always planning my next adventure!
            </p>

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
              <span className="stat-value">18</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🌍</span>
              <span className="stat-label">Countries</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏙️</span>
              <span className="stat-label">Cities Visited</span>
              <span className="stat-value">45</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">Reviews</span>
              <span className="stat-value">32</span>
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
            {trips.map(trip => (
              <div key={trip.id} className="trip-feed-card">
                <div className="trip-img">
                  <img src={trip.image_url} alt={trip.title} />
                </div>
                <div className="trip-details">
                  <div className="trip-header">
                    <h3>{trip.title}</h3>
                    <span className={`status-tag ${trip.status.toLowerCase()}`}>
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
                    <button className="btn-view-details">👁️ View Details</button>
                    <button className="btn-secondary-action">
                      {trip.status === 'Upcoming' ? '✏️ Edit Trip' : '🔁 Duplicate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
