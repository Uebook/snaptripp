'use client'
import { useState, useEffect } from 'react'

interface ContactMessage {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages || [])
      } else {
        if (data.error === 'table_missing') {
          setErrorMsg('The contact_messages table is missing. Please run the migration script: 20260601_create_cms_tables.sql')
        } else {
          setErrorMsg(data.error || 'Failed to fetch messages')
        }
      }
    } catch (err) {
      setErrorMsg('A network error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkRead = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread'
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m))
      } else {
        alert('Failed to update status')
      }
    } catch (err) {
      alert('A network error occurred.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id))
        // Adjust pagination if needed
        if (currentMessages.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
      } else {
        alert('Failed to delete message')
      }
    } catch (err) {
      alert('A network error occurred.')
    }
  }

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMessages = messages.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(messages.length / itemsPerPage)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Contact Inquiries</h1>
      </div>

      <div className="admin-card">
        {errorMsg && (
          <div className="badge danger" style={{ display: 'block', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>Loading messages...</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Message Snippet</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMessages.map(msg => (
                    <tr key={msg.id} style={{ background: msg.status === 'unread' ? 'rgba(235, 164, 36, 0.05)' : 'transparent' }}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(msg.created_at).toLocaleDateString()}</td>
                      <td style={{ fontWeight: '600' }}>{msg.first_name} {msg.last_name}</td>
                      <td>{msg.email}</td>
                      <td>{msg.phone || '-'}</td>
                      <td>{msg.subject}</td>
                      <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msg.message}
                      </td>
                      <td>
                        {msg.status === 'unread' ? (
                          <span className="badge warning">Unread</span>
                        ) : (
                          <span className="badge success">Read</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleMarkRead(msg.id, msg.status)}
                            className="admin-button outline" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            {msg.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                          </button>
                          <button 
                            onClick={() => handleDelete(msg.id)}
                            className="admin-button outline danger" 
                            style={{ padding: '6px 12px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && !errorMsg && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>
                        No messages received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px', gap: '12px', padding: '0 20px 20px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="admin-button outline"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="admin-button outline"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

