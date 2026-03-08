'use client'

import DashboardSidebar from '../components/DashboardSidebar'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles["dashboard-layout"]}>
      <DashboardSidebar />
      <main className={styles["dashboard-main"]}>
        {children}
      </main>
    </div>
  )
}
