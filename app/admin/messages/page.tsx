'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ContactMessage {
  id: string
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

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
    // In a full implementation, you'd have a PUT endpoint to update status.
    // For now, we simulate marking it locally to demonstrate intent.
    alert('This would mark message as read/unread in a full implementation. (Update endpoint needed)')
  }

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
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message Snippet</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} style={{ background: msg.status === 'unread' ? 'rgba(235, 164, 36, 0.05)' : 'transparent' }}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(msg.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: '600' }}>{msg.first_name} {msg.last_name}</td>
                  <td>{msg.email}</td>
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
                    <button 
                      onClick={() => handleMarkRead(msg.id, msg.status)}
                      className="admin-button outline" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {msg.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && !errorMsg && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>
                    No messages received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
