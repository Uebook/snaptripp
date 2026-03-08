'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddUserModal() {
       const [isOpen, setIsOpen] = useState(false)
       const [loading, setLoading] = useState(false)
       const [error, setError] = useState<string | null>(null)
       const router = useRouter()

       const [formData, setFormData] = useState({
              fullName: '',
              username: '',
              email: '',
              password: ''
       })

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              setError(null)

              try {
                     const res = await fetch('/api/admin/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                     })

                     const data = await res.json()

                     if (!res.ok) {
                            throw new Error(data.error || 'Failed to create user')
                     }

                     setIsOpen(false)
                     setFormData({ fullName: '', username: '', email: '', password: '' })
                     router.refresh() // Refresh the user list
              } catch (err: any) {
                     setError(err.message)
              } finally {
                     setLoading(false)
              }
       }

       return (
              <>
                     <button className="admin-button" onClick={() => setIsOpen(true)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                            Add User
                     </button>

                     {isOpen && (
                            <div style={{
                                   position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                   background: 'rgba(3, 27, 78, 0.4)', zIndex: 9999,
                                   display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                   <div style={{
                                          background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '440px',
                                          boxShadow: '0 25px 50px -12px rgba(3, 27, 78, 0.25)', border: '1px solid #e2e8f0',
                                          margin: '20px'
                                   }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                 <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Add New User</h3>
                                                 <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                                          </div>

                                          {error && (
                                                 <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                                        {error}
                                                 </div>
                                          )}

                                          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                                 <div style={{ display: 'flex', gap: '16px' }}>
                                                        <div style={{ flex: 1 }}>
                                                               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Full Name</label>
                                                               <input
                                                                      type="text"
                                                                      required
                                                                      value={formData.fullName}
                                                                      placeholder="e.g. Jane Doe"
                                                                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                                                               />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Username</label>
                                                               <input
                                                                      type="text"
                                                                      required
                                                                      value={formData.username}
                                                                      placeholder="e.g. janedoe99"
                                                                      pattern="[a-zA-Z0-9_]+"
                                                                      title="Letters, numbers and underscores only"
                                                                      onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                                                               />
                                                        </div>
                                                 </div>

                                                 <div>
                                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Email Address</label>
                                                        <input
                                                               type="email"
                                                               required
                                                               placeholder="jane@example.com"
                                                               value={formData.email}
                                                               onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                               style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                                                        />
                                                 </div>

                                                 <div>
                                                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                                                               Password
                                                               <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '12px' }}>Min 6 chars</span>
                                                        </label>
                                                        <input
                                                               type="password"
                                                               required
                                                               placeholder="••••••••"
                                                               minLength={6}
                                                               value={formData.password}
                                                               onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                               style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', letterSpacing: '2px' }}
                                                        />
                                                 </div>

                                                 <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                                        <button
                                                               type="button"
                                                               onClick={() => setIsOpen(false)}
                                                               style={{ flex: 1, padding: '14px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '14px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
                                                        >
                                                               Cancel
                                                        </button>
                                                        <button
                                                               type="submit"
                                                               disabled={loading}
                                                               style={{ flex: 1, padding: '14px', background: '#031B4E', color: 'white', border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '15px', opacity: loading ? 0.8 : 1 }}
                                                        >
                                                               {loading ? 'Creating...' : 'Create User'}
                                                        </button>
                                                 </div>
                                          </form>
                                   </div>
                            </div>
                     )}
              </>
       )
}
