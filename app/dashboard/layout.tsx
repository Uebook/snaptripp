'use client'

import DashboardSidebar from '../components/DashboardSidebar'
import styles from './DashboardLayout.module.css'
import { usePathname } from 'next/navigation'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showSidebar = pathname !== '/dashboard'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <SiteHeader />
      <div className={styles["dashboard-layout"]} style={{ flex: 1, minHeight: 'auto' }}>
        {showSidebar && <DashboardSidebar />}
        <main className={styles["dashboard-main"]} style={!showSidebar ? { width: '100%', minHeight: 'auto' } : { minHeight: 'auto' }}>
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}

