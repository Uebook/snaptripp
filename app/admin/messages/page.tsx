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
  
  // Selected Message for Detail View Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const handleViewMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg)
    if (msg.status === 'unread') {
      await handleMarkRead(msg.id, 'unread')
      setSelectedMessage({ ...msg, status: 'read' })
    }
  }

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
                            onClick={() => handleViewMessage(msg)}
                            className="admin-button" 
                            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none' }}
                          >
                            View
                          </button>
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

      {/* Detailed Message Modal */}
      {selectedMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out forwards',
            border: '1px solid #e2e8f0',
            fontFamily: "'Inter', sans-serif"
          }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                Inquiry Details
              </h3>
              <button 
                onClick={() => setSelectedMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Sender Name</label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>
                    {selectedMessage.first_name} {selectedMessage.last_name}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Date Received</label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Email Address</label>
                  <p style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '0.95rem' }}>
                    <a href={`mailto:${selectedMessage.email}`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{selectedMessage.email}</a>
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Phone Number</label>
                  <p style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '0.95rem' }}>
                    {selectedMessage.phone || '-'}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Subject</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>
                  {selectedMessage.subject}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Message</label>
                <div style={{ 
                  margin: '8px 0 0 0', 
                  whiteSpace: 'pre-wrap', 
                  color: '#334155', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.6', 
                  backgroundColor: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid #f1f5f9' 
                }}>
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <button 
                  onClick={async () => {
                    await handleMarkRead(selectedMessage.id, selectedMessage.status)
                    setSelectedMessage({ ...selectedMessage, status: selectedMessage.status === 'unread' ? 'read' : 'unread' })
                  }}
                  className="admin-button outline"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Mark {selectedMessage.status === 'unread' ? 'Read' : 'Unread'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this message?')) {
                      await handleDelete(selectedMessage.id)
                      setSelectedMessage(null)
                    }
                  }}
                  className="admin-button outline danger"
                  style={{ padding: '8px 16px', fontSize: '13px', color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  Delete
                </button>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="admin-button"
                  style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#0f172a', color: 'white', border: 'none' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

