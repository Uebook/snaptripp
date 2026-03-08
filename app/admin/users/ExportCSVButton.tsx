'use client'

import { useState } from 'react'

export default function ExportCSVButton() {
       const [loading, setLoading] = useState(false)

       const handleExport = async () => {
              setLoading(true)
              try {
                     const response = await fetch('/api/admin/export-users')
                     if (!response.ok) {
                            throw new Error('Export failed to generate on server.')
                     }

                     const blob = await response.blob()
                     const url = window.URL.createObjectURL(blob)

                     const a = document.createElement('a')
                     a.href = url
                     // The suggested filename from Content-Disposition is usually handled automatically,
                     // but if we explicitly click an anchor tag, we should set a download attribute.
                     a.download = `snaptrip_users_${new Date().toISOString().split('T')[0]}.csv`

                     document.body.appendChild(a)
                     a.click()

                     window.URL.revokeObjectURL(url)
                     document.body.removeChild(a)
              } catch (error) {
                     console.error('Error exporting CSV:', error)
                     alert('Failed to export CSV. Please check the console or try again later.')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <button
                     className="admin-button outline"
                     onClick={handleExport}
                     disabled={loading}
                     style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                     </svg>
                     {loading ? 'Exporting...' : 'Export CSV'}
              </button>
       )
}
