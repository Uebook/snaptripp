'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BlockUserButton({ userId, isBlocked }: { userId: string, isBlocked: boolean }) {
       const [loading, setLoading] = useState(false)
       const router = useRouter()

       const handleBlockToggle = async () => {
              if (!confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) return;

              setLoading(true)
              try {
                     const res = await fetch('/api/admin/users/block', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, action: isBlocked ? 'unblock' : 'block' })
                     })

                     if (!res.ok) {
                            const data = await res.json()
                            throw new Error(data.error || 'Failed to update user status')
                     }

                     router.refresh()
              } catch (err: any) {
                     alert(err.message)
              } finally {
                     setLoading(false)
              }
       }

       return (
              <button
                     onClick={handleBlockToggle}
                     disabled={loading}
                     className="admin-button outline"
                     style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            color: isBlocked ? 'var(--admin-success)' : 'var(--admin-danger)',
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                     }}
              >
                     {loading ? '...' : (isBlocked ? 'Unblock' : 'Block')}
              </button>
       )
}
