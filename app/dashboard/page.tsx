'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Trip {
  id: string
  title: string
  country: string
  duration: string
  created_at: string
}

const Sparkline = ({ color = '#886ab5', height = 30, width = 100 }) => {
  const points = Array.from({ length: 10 }, (_, i) => `${(i * width) / 9},${Math.random() * height}`)
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path
        d={`M ${points.join(' L ')}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const CircularProgress = ({ value, label, subValue, color = '#886ab5' }: { value: number, label: string, subValue: string, color?: string }) => (
  <div className="circular-card">
    <div className="circular-container">
      <svg viewBox="0 0 36 36" className="circular-chart">
        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path
          className="circle"
          strokeDasharray={`${value}, 100`}
          stroke={color}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.35" className="percentage">{value}</text>
      </svg>
    </div>
    <div className="circular-info">
      <span className="circular-label">{label}</span>
      <div className="circular-spark">
        <Sparkline color={color} width={60} height={20} />
        <span className="circular-sub" style={{ background: color }}>{subValue}</span>
      </div>
    </div>
    <style jsx>{`
      .circular-card { background: white; padding: 20px; border-radius: 4px; display: flex; align-items: center; gap: 15px; border: 1px solid #e9ecef; }
      .circular-container { width: 60px; height: 60px; }
      .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 100%; }
      .circle-bg { fill: none; stroke: #eee; stroke-width: 2.8; }
      .circle { fill: none; stroke-width: 2.8; stroke-linecap: round; transition: stroke-dasharray 0.3s ease; }
      .percentage { fill: #444; font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; text-anchor: middle; }
      .circular-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
      .circular-label { font-size: 11px; font-weight: 700; color: #444; text-transform: uppercase; }
      .circular-spark { display: flex; align-items: center; justify-content: space-between; }
      .circular-sub { font-size: 10px; font-weight: 700; color: white; padding: 1px 4px; border-radius: 3px; }
    `}</style>
  </div>
)

export default function Dashboard() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuthAndFetchTrips = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)
      try {
        const res = await fetch('/api/trips', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
        const data = await res.json()
        if (data.success) setTrips(data.trips)
      } catch (error) { console.error('Error fetching trips:', error) }
      finally { setLoading(false) }
    }
    checkAuthAndFetchTrips()
  }, [router])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #fff; }
          .spinner { width: 30px; height: 30px; border: 2px solid #f3f3f3; border-top: 2px solid #886ab5; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard">
      <header className="page-header">
        <div className="header-left">
          <nav className="breadcrumbs">
            <span>SnapTrip</span> / <span>Application Intel</span> / <span className="current">Analytics Dashboard</span>
          </nav>
          <div className="header-title-row">
            <span className="title-icon">📊</span>
            <h1 className="page-title">Analytics <span className="title-light">Dashboard</span></h1>
          </div>
        </div>
        <div className="header-right">
          <div className="header-stat">
            <div className="stat-text">
              <span className="stat-label">TOTAL TRIPS</span>
              <span className="stat-value text-violet">{trips.length}</span>
            </div>
            <Sparkline color="#886ab5" />
          </div>
          <div className="header-stat">
            <div className="stat-text">
              <span className="stat-label">PLANNED DAYS</span>
              <span className="stat-value text-pink">{trips.length * 5}</span>
            </div>
            <Sparkline color="#f06292" />
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Main Chart Card */}
        <div className="card live-feeds-card">
          <div className="card-header">
            <h2 className="card-title">Live Feeds</h2>
            <div className="card-controls">
              <div className="toggle-group">
                <span className="toggle-dot"></span>
                <span>Live Update</span>
              </div>
              <nav className="card-tabs">
                <span className="active-tab">Live Stats</span>
                <span>Revenue</span>
              </nav>
            </div>
          </div>
          <div className="card-body main-chart-body">
            <div className="chart-area">
              <svg viewBox="0 0 1000 300" className="area-chart">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#886ab5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#886ab5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="area" d="M0,300 L0,200 C100,240 200,100 300,180 C400,220 500,150 600,210 C700,240 800,120 900,150 L1000,100 L1000,300 Z" fill="url(#chartGradient)" />
                <path className="line" d="M0,200 C100,240 200,100 300,180 C400,220 500,150 600,210 C700,240 800,120 900,150 L1000,100" fill="none" stroke="#886ab5" strokeWidth="3" />
              </svg>
              <div className="chart-grid">
                {[0, 25, 50, 75, 100, 125, 150, 175].map(tick => <span key={tick}>{tick}</span>)}
              </div>
            </div>
            <div className="side-tasks">
              <div className="task-item">
                <div className="task-info"><span>Trip Planning progress</span><span>130 / 500 tasks</span></div>
                <div className="progress-bar"><div className="progress" style={{ width: '26%', background: '#333' }}></div></div>
              </div>
              <div className="task-item">
                <div className="task-info"><span>Destinations Explorer</span><span>440 visited</span></div>
                <div className="progress-bar"><div className="progress" style={{ width: '65%', background: '#1dc9b7' }}></div></div>
              </div>
              <div className="task-item">
                <div className="task-info"><span>Bugs Squashed</span><span>77%</span></div>
                <div className="progress-bar"><div className="progress" style={{ width: '77%', background: '#2196f3' }}></div></div>
              </div>
              <div className="task-item">
                <div className="task-info"><span>User Testing</span><span>7 days</span></div>
                <div className="progress-bar"><div className="progress" style={{ width: '40%', background: '#886ab5' }}></div></div>
              </div>
              <div className="task-actions">
                <Link href="/explore" className="btn-outline">Plan New Journey</Link>
                <Link href="/dashboard/trips" className="btn-outline">View All Trips</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Circular Stats Row */}
        <div className="stats-row">
          <CircularProgress value={75} label="SERVER LOAD" subValue="97%" color="#886ab5" />
          <CircularProgress value={79} label="DISK SPACE" subValue="76%" color="#1dc9b7" />
          <CircularProgress value={23} label="DATA TTF" subValue="10GB" color="#2196f3" />
          <CircularProgress value={36} label="TEMP." subValue="124" color="#f06292" />
        </div>

        {/* Bottom Widgets */}
        <div className="bottom-widgets">
          <div className="card chat-widget">
            <div className="card-header">
              <h2 className="card-title">Trip Assistant</h2>
              <div className="chat-controls">
                <span className="dot teal"></span>
                <span className="dot pink"></span>
                <span className="menu-dot">⋮</span>
              </div>
            </div>
            <div className="card-body chat-body">
              <div className="message">
                <div className="msg-avatar">LH</div>
                <div className="msg-content">
                  <span className="msg-author">Lisa Hatchensen</span>
                  <p>Hey did you meet the new board of directors? He&apos;s a bit of a geek if you ask me...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card map-widget">
            <div className="card-header">
              <h2 className="card-title">Travel Origins</h2>
              <div className="map-controls">
                <span className="dot teal"></span>
                <span className="dot yellow"></span>
                <span className="dot pink"></span>
                <span className="menu-dot">⋮</span>
              </div>
            </div>
            <div className="card-body map-body">
              <div className="mock-map">
                <div className="map-zoom">
                  <button>+</button>
                  <button>-</button>
                </div>
                <div className="map-shape" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .analytics-dashboard {
          padding: 30px;
          background: #f4f7f6;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #444;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .breadcrumbs { font-size: 11px; color: #886ab5; margin-bottom: 15px; }
        .breadcrumbs .current { color: #888; }

        .header-title-row { display: flex; align-items: center; gap: 10px; }
        .title-icon { font-size: 24px; color: #888; }
        .page-title { font-size: 24px; margin: 0; font-weight: 700; color: #333; }
        .title-light { font-weight: 300; }

        .header-right { display: flex; gap: 40px; }
        .header-stat { display: flex; align-items: center; gap: 15px; }
        .stat-text { display: flex; flex-direction: column; align-items: flex-end; }
        .stat-label { font-size: 10px; font-weight: 800; opacity: 0.6; }
        .stat-value { font-size: 18px; font-weight: 800; display: block; margin-top: -2px; }
        .text-violet { color: #886ab5; }
        .text-pink { color: #f06292; }

        .dashboard-grid { display: grid; gap: 30px; }

        .card { background: white; border-radius: 4px; border: 1px solid #e9ecef; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .card-header { padding: 15px 20px; border-bottom: 1px solid #f1f1f1; display: flex; justify-content: space-between; align-items: center; }
        .card-title { font-size: 14px; font-weight: 700; color: #555; margin: 0; }

        .live-feeds-card { }
        .card-controls { display: flex; align-items: center; gap: 30px; font-size: 11px; font-weight: 700; color: #999; }
        .toggle-group { display: flex; align-items: center; gap: 6px; }
        .toggle-dot { width: 14px; height: 14px; background: #eee; border-radius: 50%; border: 2px solid #ddd; }
        
        .card-tabs { border-bottom: 2px solid #eee; display: flex; gap: 20px; }
        .card-tabs span { padding-bottom: 5px; cursor: pointer; transition: all 0.2s; }
        .active-tab { color: #886ab5; border-bottom: 2px solid #886ab5; margin-bottom: -2px; }

        .main-chart-body { display: grid; grid-template-columns: 1fr 300px; padding: 20px; gap: 40px; }
        .chart-area { position: relative; }
        .area-chart { width: 100%; height: auto; }
        .chart-grid { display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 10px; font-size: 10px; color: #bbb; }

        .side-tasks { display: flex; flex-direction: column; gap: 15px; }
        .task-item { display: flex; flex-direction: column; gap: 6px; }
        .task-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #555; }
        .progress-bar { width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
        .progress { height: 100%; border-radius: 4px; }

        .task-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
        .btn-outline { background: #f8f9fa; border: 1px solid #ddd; color: #666; padding: 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center; text-decoration: none; }
        .btn-outline:hover { background: #eee; }

        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }

        .bottom-widgets { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .chat-controls, .map-controls { display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.teal { background: #1dc9b7; }
        .dot.pink { background: #f06292; }
        .dot.yellow { background: #ffca28; }
        .menu-dot { color: #bbb; cursor: pointer; margin-left: 5px; }

        .chat-body { padding: 20px; height: 200px; }
        .message { display: flex; gap: 15px; }
        .msg-avatar { width: 40px; height: 40px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #888; }
        .msg-content { flex: 1; }
        .msg-author { display: block; font-size: 12px; font-weight: 700; color: #886ab5; margin-bottom: 4px; }
        .msg-content p { font-size: 13px; margin: 0; line-height: 1.5; color: #666; }

        .map-body { padding: 20px; }
        .mock-map { height: 200px; background: #e0f2f1; border-radius: 4px; position: relative; overflow: hidden; }
        .map-zoom { position: absolute; left: 10px; top: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 5; }
        .map-zoom button { width: 25px; height: 25px; background: white; border: 1px solid #ddd; border-radius: 3px; cursor: pointer; font-weight: 700; }
        .map-shape { position: absolute; inset: 20px; background: #b2dfdb; clip-path: polygon(10% 25%, 35% 25%, 35% 10%, 65% 10%, 65% 25%, 90% 25%, 90% 50%, 65% 50%, 65% 65%, 35% 65%, 35% 50%, 10% 50%); }

        /* Overrides for sidebar layout integration */
        .analytics-dashboard a { text-decoration: none !important; }
      `}</style>
    </div>
  )
}

