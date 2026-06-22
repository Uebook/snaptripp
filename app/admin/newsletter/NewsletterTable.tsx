'use client'

import { useState } from 'react'

export default function NewsletterTable({ subscribers }: { subscribers: any[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const totalPages = Math.ceil(subscribers.length / itemsPerPage)
  
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSubscribers = subscribers.slice(startIndex, startIndex + itemsPerPage)

  const handleExportCsv = () => {
    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,Email,Status,Subscribed On\n";
    
    // Rows
    subscribers.forEach(sub => {
      const dateStr = new Date(sub.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      })
      const row = `"${sub.email}","${sub.status}","${dateStr}"`
      csvContent += row + "\n"
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="admin-grid">
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Subscribers List</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleExportCsv}
              className="admin-button outline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
        
        <table className="admin-table">
        <thead>
          <tr>
            <th>Email Address</th>
            <th>Status</th>
            <th>Subscribed On</th>
          </tr>
        </thead>
        <tbody>
          {currentSubscribers.length > 0 ? (
            currentSubscribers.map((sub) => (
              <tr key={sub.id}>
                <td style={{ fontWeight: '500' }}>{sub.email}</td>
                <td>
                  <span className={`badge ${sub.status === 'active' ? 'success' : 'neutral'}`}>
                    {sub.status || 'active'}
                  </span>
                </td>
                <td>{new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: '#6b88a5' }}>
                No newsletter subscribers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px', borderTop: '1px solid var(--admin-border)' }}>
          <span style={{ color: 'var(--admin-muted)', fontSize: '14px' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, subscribers.length)} of {subscribers.length} entries
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--admin-border)',
                background: currentPage === 1 ? '#f9fafb' : '#fff',
                color: currentPage === 1 ? '#9ca3af' : '#111827',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--admin-border)',
                background: currentPage === totalPages ? '#f9fafb' : '#fff',
                color: currentPage === totalPages ? '#9ca3af' : '#111827',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
