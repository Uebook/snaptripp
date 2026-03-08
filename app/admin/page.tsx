import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

// Set revalidate to 0 to always fetch fresh data on the server
export const revalidate = 0

export default async function AdminDashboard() {
  let totalUsers = 0
  let activeTrips = 0
  let recentSignups: any[] = []

  try {
    // Fetch Total Users bypassing RLS
    const { count: userCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    totalUsers = userCount || 0

    // Fetch Active Trips (assuming upcoming/current trips are 'active')
    const today = new Date().toISOString()
    const { count: tripCount } = await supabaseAdmin
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .gte('end_date', today)
    activeTrips = tripCount || 0

    // Fetch Recent Signups (from profiles, ordered by created_at)
    const { data: signups } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, created_at, location')
      .order('created_at', { ascending: false })
      .limit(3)
    recentSignups = signups || []

  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  }

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), trend: '+12%', up: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { label: 'Active Trips', value: activeTrips.toLocaleString(), trend: '+5%', up: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
    { label: 'Revenue', value: '$45,200', trend: '+18%', up: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { label: 'Tickets', value: '14', trend: '-20%', up: false, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg> },
  ]

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome back, Admin</h1>
        <p style={{ color: 'var(--admin-muted)', marginTop: '8px', fontSize: '15px' }}>Here&apos;s what&apos;s happening on Snaptrip today.</p>
      </div>
      <div className="admin-grid">
        {stats.map((stat, i) => (
          <div key={i} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="card-label">{stat.label}</div>
                <div className="card-value">{stat.value}</div>
              </div>
              <div style={{
                color: '#fff',
                background: `linear-gradient(135deg, var(--admin-accent) 0%, #38bdf8 100%)`,
                padding: '12px',
                borderRadius: '16px',
                boxShadow: '0 8px 16px var(--admin-accent-glow)'
              }}>
                {stat.icon}
              </div>
            </div>
            <div className={`card-trend ${stat.up ? 'up' : 'down'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {stat.up ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline> : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>}
                {stat.up ? <polyline points="17 6 23 6 23 12"></polyline> : <polyline points="17 18 23 18 23 12"></polyline>}
              </svg>
              {stat.trend} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="admin-row" style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>Recent Signups</h3>
            <Link href="/admin/users" className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>View All</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.length > 0 ? (
                recentSignups.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600' }}>{user.full_name || 'Anonymous User'}</td>
                    <td>{user.location || 'Not Specified'}</td>
                    <td>{formatTimeAgo(user.created_at)}</td>
                    <td><span className="badge success">Verified</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No recent signups found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <button className="admin-button" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                Add New User
              </button>
              <button className="admin-button outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export Reports
              </button>
              <button className="admin-button outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                System Settings
              </button>
            </div>
          </div>

          <div className="admin-card" style={{ background: 'var(--admin-sidebar)', color: '#fff' }}>
            <h3 style={{ color: '#fff' }}>System Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--admin-success)', boxShadow: '0 0 12px var(--admin-success)' }}></div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

