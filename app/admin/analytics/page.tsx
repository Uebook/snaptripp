import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { TopDestinationsChart, UserGrowthChart, ActiveUsersPieChart } from './DashboardCharts'

export const revalidate = 0

export default async function AdminAnalytics() {

  // 1. Fetch total users and growth data
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, created_at, updated_at')

  // 2. Fetch all trips for destinations data
  const { data: trips, error: tripsError } = await supabaseAdmin
    .from('trips')
    .select('country')

  if (profileError || tripsError) {
    console.error("Analytics fetch error:", profileError || tripsError)
  }

  const safeProfiles = profiles || []
  const safeTrips = trips || []

  const totalUsers = safeProfiles.length
  const totalTrips = safeTrips.length

  // -- Data Processing for Charts --

  // A. Top Destinations (BarChart)
  const countryCounts: Record<string, number> = {}
  safeTrips.forEach(trip => {
    if (trip.country) {
      // Normalize country names if needed, but assuming they are mostly clean
      countryCounts[trip.country] = (countryCounts[trip.country] || 0) + 1
    }
  })

  const topDestinationsData = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  const topCountriesString = topDestinationsData.slice(0, 3).map(d => d.country).join(', ') || 'N/A'

  // B. User Growth (AreaChart/LineChart) - Last 6 Months
  const growthMonths: Record<string, number> = {}
  const now = new Date()

  // Initialize last 6 months to 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear()
    growthMonths[monthKey] = 0
  }

  safeProfiles.forEach(p => {
    const createdDate = new Date(p.created_at)
    // Only count if it's within the last 6 months broadly
    const monthKey = createdDate.toLocaleString('default', { month: 'short' }) + ' ' + createdDate.getFullYear()
    if (growthMonths[monthKey] !== undefined) {
      growthMonths[monthKey]++
    }
  })

  const userGrowthData = Object.entries(growthMonths).map(([month, users]) => ({ month, users }))

  // C. Active vs Inactive (PieChart)
  // Let's define "Active" as created or updated in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let activeCount = 0
  let inactiveCount = 0

  safeProfiles.forEach(p => {
    const lastActive = new Date(p.updated_at || p.created_at)
    if (lastActive >= thirtyDaysAgo) {
      activeCount++
    } else {
      inactiveCount++
    }
  })

  const activePercentage = totalUsers ? Math.round((activeCount / totalUsers) * 100) : 0
  const inactivePercentage = totalUsers ? Math.round((inactiveCount / totalUsers) * 100) : 0

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Platform Analytics</h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Monitor your platform&apos;s growth, user activity, and popular destinations.</p>
      </div>

      <div className="admin-grid" style={{ marginBottom: '32px' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '10px', color: '#4f46e5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Total Users</h3>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>{totalUsers.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '10px', color: '#d97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Total Trips Planned</h3>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>{totalTrips.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '10px', color: '#16a34a' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Top Destinations</h3>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={topCountriesString}>
                {topCountriesString}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '10px', color: '#9333ea' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>User Activity (30d)</h3>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                <span style={{ color: '#10b981' }}>{activePercentage}%</span> <span style={{ color: '#cbd5e1', fontWeight: 400 }}>·</span> <span style={{ color: '#94a3b8' }}>{inactivePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '32px' }}>

        {/* Left Column: Growth & Destinations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="admin-card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>User Growth (Last 6 Months)</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', marginTop: '4px' }}>New account signups and platform joinings.</p>
            </div>
            <UserGrowthChart data={userGrowthData} />
          </div>

          <div className="admin-card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Top Planned Destinations</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Most frequently saved countries across all user itineraries.</p>
            </div>
            <TopDestinationsChart data={topDestinationsData} />
          </div>
        </div>

        {/* Right Column: Activity Pie Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="admin-card" style={{ padding: '32px', height: '100%' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Active vs Inactive Users</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Users active within the last 30 days.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 60px)' }}>
              <ActiveUsersPieChart activeCount={activeCount} inactiveCount={inactiveCount} />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

