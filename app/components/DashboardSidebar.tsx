'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface NavItem {
  name: string
  icon: string
  href: string
  badge?: string
}

interface NavGroup {
  category: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    category: 'Your Account',
    items: [
      { name: 'Profile', icon: '👤', href: '/dashboard/profile' },
      { name: 'Trip saved', icon: '🗺️', href: '/dashboard/trips' },
      { name: 'Setting', icon: '⚙️', href: '/dashboard/settings' },
    ]
  }
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="modern-sidebar">
      <div className="sidebar-header">
        <Link href="/" className="brand-link">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-text">SnapTrip WebApp</span>
          <span className="chevron-down">⌄</span>
        </Link>
      </div>

      <div className="user-profile-section">
        <div className="user-avatar-wrapper">
          <div className="avatar-disc">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="status-indicator online"></div>
        </div>
        <div className="user-info">
          <span className="user-name">
            {user?.user_metadata?.full_name || 'Dr. Codex Lantern'}
            <span className="chevron-down">⌄</span>
          </span>
          <span className="user-location">Toronto, Canada</span>
        </div>
        <div className="background-image-overlay"></div>
      </div>

      <nav className="nav-container">
        {navigation.map((group, i) => (
          <div key={i} className="nav-group">
            <h3 className="nav-category-title">{group.category} <span className="category-chevron">⌃</span></h3>
            <ul className="nav-list">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href
                return (
                  <li key={j} className="nav-item-wrapper">
                    <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-name">{item.name}</span>
                      {item.badge && <span className="item-badge">{item.badge}</span>}
                      {isActive && <div className="active-dot"></div>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>

      <style jsx>{`
        .modern-sidebar {
          width: 280px;
          height: 100vh;
          background: #3d464d;
          color: #adb5bd;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          left: 0;
          font-family: 'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, oxygen, ubuntu, cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .sidebar-header {
          background: #464f56;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white !important;
          text-decoration: none !important;
          font-weight: 500;
          font-size: 15px;
          width: 100%;
        }

        .brand-logo {
          width: 30px;
          height: 30px;
          background: #886ab5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-text {
          flex: 1;
        }

        .chevron-down {
          font-size: 14px;
          opacity: 0.5;
        }

        .user-profile-section {
          padding: 25px 20px;
          background: #464f56 url('https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=400') center/cover;
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          overflow: hidden;
        }

        .user-profile-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(43, 46, 51, 0.7);
          z-index: 1;
        }

        .user-avatar-wrapper {
          position: relative;
          z-index: 2;
        }

        .avatar-disc {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 2px solid white;
          background: #886ab5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #2b2e33;
        }
        .status-indicator.online { background: #1dc9b7; }

        .user-info {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }

        .user-name {
          color: white;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .user-location {
          font-size: 11px;
          opacity: 0.8;
        }

        .nav-container {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .nav-group {
          padding-top: 15px;
        }

        .nav-category-title {
          padding: 0 20px 10px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.4);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-chevron { font-size: 9px; }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          color: #adb5bd !important;
          text-decoration: none !important;
          font-size: 13.5px;
          position: relative;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: rgba(0,0,0,0.1);
          color: white !important;
          text-decoration: none !important;
        }

        .nav-link.active {
          background: #464f56;
          color: white !important;
          font-weight: 500;
          text-decoration: none !important;
        }

        .item-icon {
          width: 20px;
          text-align: center;
          opacity: 0.7;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-name { 
          flex: 1;
          color: inherit !important;
        }

        .item-badge {
          background: #886ab5;
          color: white !important;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
        }

        .active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1dc9b7;
          position: absolute;
          right: 20px;
        }

        .sidebar-footer {
          padding: 15px 20px;
          border-top: 1px solid rgba(0,0,0,0.1);
          background: rgba(0,0,0,0.1);
        }

        .logout-button {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #adb5bd !important;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          transition: all 0.2s;
          text-decoration: none !important;
        }

        .logout-button:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444 !important;
          border-color: #ef4444;
        }
      `}</style>
      <style jsx global>{`
        .modern-sidebar a, 
        .modern-sidebar a:hover, 
        .modern-sidebar a:focus, 
        .modern-sidebar a:active,
        .modern-sidebar a:visited {
          color: inherit !important;
          text-decoration: none !important;
          outline: none !important;
        }
      `}</style>
    </aside>
  )
}
