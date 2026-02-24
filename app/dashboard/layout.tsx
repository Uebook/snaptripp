'use client'

import DashboardSidebar from '../components/DashboardSidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dashboard-layout">
            <DashboardSidebar />
            <main className="dashboard-main">
                {children}
            </main>

            <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-main {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          position: relative;
        }
      `}</style>
        </div>
    )
}
