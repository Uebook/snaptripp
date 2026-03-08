'use client'
import styles from './DashboardPage.module.css'

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
        <div className={styles["spinner"]}></div>
      </div>
    )
  }

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Traveler'
  const email = user?.email || profile?.email || ''
  const location = profile?.location || 'Add Location'
  const bio = profile?.bio || 'No bio yet. Tell us about your travel passion!'
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'

  return (
    <div className={styles["profile-view-container"]}>
      {/* Hero Header */}
      <section className={styles["profile-hero"]}>
        <div className={styles["profile-hero-content"]}>
          <div className={styles["profile-avatar-large"]}>
            <div className={styles["avatar-img-wrapper"]}>
              <img
                src={avatarUrl}
                alt="Profile"
              />
            </div>
            <Link href="/dashboard/profile" className={styles["edit-photo-link"]} style={{ textDecoration: 'none', display: 'inline-block' }}>📷 Edit Photo</Link>
          </div>

          <div className={styles["profile-main-info"]}>
            <div className={styles["name-row"]}>
              <h1>{fullName}</h1>
              <span className={styles["verified-badge"]}>✓ VERIFIED</span>
            </div>

            <div className={styles["meta-info"]}>
              <span>📍 {location}</span>
              <span>📅 Member since {new Date(profile?.created_at || user?.created_at).getFullYear()}</span>
              <span>✉️ {email}</span>
            </div>

            <p className={styles["profile-bio"]}>{bio}</p>

            <div className={styles["profile-actions"]}>
              <Link href="/dashboard/profile" className={styles["btn-edit-profile"]}>✏️ Edit Profile</Link>
              <button className={styles["btn-share-profile"]}>🔗 Share Profile</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className={styles["dashboard-content-grid"]}>
        {/* Left Sidebar Stats */}
        <aside className={styles["stats-sidebar"]}>
          <div className={styles["stats-card"]}>
            <h3>Travel Statistics</h3>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-icon"]}>✈️</span>
              <span className={styles["stat-label"]}>Total Trips</span>
              <span className={styles["stat-value"]}>{stats.totalTrips}</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-icon"]}>🌍</span>
              <span className={styles["stat-label"]}>Countries</span>
              <span className={styles["stat-value"]}>{stats.countries}</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-icon"]}>🏙️</span>
              <span className={styles["stat-label"]}>Cities Visited</span>
              <span className={styles["stat-value"]}>{stats.cities}</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-icon"]}>⭐</span>
              <span className={styles["stat-label"]}>Reviews</span>
              <span className={styles["stat-value"]}>{stats.reviews}</span>
            </div>
          </div>

          <div className={styles["achievements-card"]}>
            <h3>Achievements</h3>
            <div className={styles["achievements-grid"]}>
              <div className={`${styles["badge-item"]} ${styles["gold"]}`}>🏆</div>
              <div className={`${styles["badge-item"]} ${styles["yellow"]}`}>🏅</div>
              <div className={`${styles["badge-item"]} ${styles["orange"]}`}>👑</div>
            </div>
          </div>
        </aside>

        {/* Right Main Feed */}
        <main className={styles["recent-trips-section"]}>
          <div className={styles["section-header"]}>
            <h2>Recent Trips</h2>
            <select className={styles["trip-filter"]}>
              <option>All Trips</option>
              <option>Completed</option>
              <option>Upcoming</option>
            </select>
          </div>

          <div className={styles["trips-list"]}>
            {trips.length > 0 ? trips.map(trip => (
              <div key={trip.id} className={styles["trip-feed-card"]}>
                <div className={styles["trip-img"]}>
                  <img src={trip.image_url} alt={trip.title} />
                </div>
                <div className={styles["trip-details"]}>
                  <div className={styles["trip-header"]}>
                    <h3>{trip.title}</h3>
                    <span className={`status-tag ${trip.status.toLowerCase().replace(' ', '-')}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className={styles["trip-meta"]}>
                    <span>📅 {trip.date_range}</span>
                    <span>📍 {trip.places_count} Places</span>
                    <span>👥 {trip.travelers_count} {trip.travelers_count === 1 ? 'Solo Trip' : 'Travelers'}</span>
                  </div>
                  <p className={styles["trip-desc"]}>{trip.description}</p>
                  <div className={styles["trip-footer"]}>
                    <button className={styles["btn-view-details"]} onClick={() => router.push(`/trip-map?tripId=${trip.id}`)}>👁️ View Details</button>
                    <button className={styles["btn-secondary-action"]}>
                      {trip.status === 'Upcoming' ? '✏️ Edit Trip' : '🔁 Duplicate'}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className={styles["empty-trips"]} style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>No trips planned yet.</p>
                <Link href="/" className={styles["btn-edit-profile"]} style={{ display: 'inline-block' }}>Start Planning Now</Link>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
