'use client'
import { useState, useEffect } from 'react'

interface FooterSettings {
  description: string
  phone: string
  email: string
  facebook_url: string
  twitter_url: string
  instagram_url: string
  youtube_url: string
}

interface FooterLinkItem {
  id: string
  label: string
  url: string
  category: string
  display_order: number
}

export default function AdminFooterPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'links'>('settings')
  
  // Settings Tab States
  const [settings, setSettings] = useState<FooterSettings>({
    description: '',
    phone: '',
    email: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    youtube_url: ''
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState({ text: '', type: '' })

  // Links Tab States
  const [links, setLinks] = useState<FooterLinkItem[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentLink, setCurrentLink] = useState<Partial<FooterLinkItem>>({
    label: '',
    url: '',
    category: 'Quick Links',
    display_order: 0
  })
  const [linkActionError, setLinkActionError] = useState('')
  const [isSavingLink, setIsSavingLink] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchSettings()
    fetchLinks()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/footer/settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

  const fetchLinks = async () => {
    setIsLoadingLinks(true)
    try {
      const res = await fetch('/api/admin/footer/links', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.links) {
          setLinks(data.links)
        }
      }
    } catch (err) {
      console.error('Error fetching links:', err)
    } finally {
      setIsLoadingLinks(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setSettingsMessage({ text: '', type: '' })

    try {
      const res = await fetch('/api/admin/footer/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (res.ok) {
        setSettingsMessage({ text: 'Footer settings updated successfully!', type: 'success' })
        setSettings(data.settings)
      } else {
        setSettingsMessage({ text: data.error || 'Failed to save settings.', type: 'danger' })
      }
    } catch (err) {
      setSettingsMessage({ text: 'A network error occurred.', type: 'danger' })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleOpenAddModal = () => {
    setCurrentLink({
      label: '',
      url: '',
      category: 'Quick Links',
      display_order: links.length
    })
    setIsEditMode(false)
    setLinkActionError('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (link: FooterLinkItem) => {
    setCurrentLink(link)
    setIsEditMode(true)
    setLinkActionError('')
    setIsModalOpen(true)
  }

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentLink.label || !currentLink.url || !currentLink.category) {
      setLinkActionError('All fields are required.')
      return
    }

    setIsSavingLink(true)
    setLinkActionError('')

    try {
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/footer/links', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLink)
      })

      const data = await res.json()
      if (res.ok) {
        setIsModalOpen(false)
        fetchLinks()
      } else {
        setLinkActionError(data.error || 'Failed to save link.')
      }
    } catch (err) {
      setLinkActionError('A network error occurred.')
    } finally {
      setIsSavingLink(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const res = await fetch(`/api/admin/footer/links?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchLinks()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete link.')
      }
    } catch (err) {
      alert('A network error occurred.')
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Dynamic Tab Headers */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('settings')}
          className={`admin-button ${activeTab === 'settings' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Footer Info & Socials
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`admin-button ${activeTab === 'links' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Footer Links List
        </button>
      </div>

      {/* Settings Panel Tab */}
      {activeTab === 'settings' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Footer General Content</h3>
          
          {settingsMessage.text && (
            <div className={`badge ${settingsMessage.type}`} style={{ display: 'block', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
              {settingsMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Footer Description Text</label>
              <textarea
                value={settings.description}
                onChange={e => setSettings({ ...settings, description: e.target.value })}
                rows={4}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: '10px', marginBottom: '4px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>Social Media Links</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Facebook URL</label>
                <input
                  type="text"
                  value={settings.facebook_url}
                  onChange={e => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="#"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Twitter / X URL</label>
                <input
                  type="text"
                  value={settings.twitter_url}
                  onChange={e => setSettings({ ...settings, twitter_url: e.target.value })}
                  placeholder="#"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagram_url}
                  onChange={e => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="#"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>YouTube URL</label>
                <input
                  type="text"
                  value={settings.youtube_url}
                  onChange={e => setSettings({ ...settings, youtube_url: e.target.value })}
                  placeholder="#"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="admin-button"
              style={{ marginTop: '12px', alignSelf: 'flex-start' }}
            >
              {isSavingSettings ? 'Saving Settings...' : 'Save General Info'}
            </button>
          </form>
        </div>
      )}

      {/* Links List Tab */}
      {activeTab === 'links' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Custom Footer Links</h3>
            <button className="admin-button" onClick={handleOpenAddModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Link
            </button>
          </div>

          {isLoadingLinks ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>Loading links...</div>
          ) : links.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)', background: '#f8fafc', borderRadius: '12px' }}>
              No links created yet. Click "Add New Link" above to seed your footer!
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Path / URL</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id}>
                    <td style={{ fontWeight: '600' }}>{link.label}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>{link.url}</code></td>
                    <td>
                      <span className={`badge ${link.category === 'Support' ? 'warning' : 'success'}`}>
                        {link.category}
                      </span>
                    </td>
                    <td>{link.display_order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="admin-button outline"
                          onClick={() => handleOpenEditModal(link)}
                          style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-button outline"
                          onClick={() => handleDeleteLink(link.id)}
                          style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Popup for Add/Edit Link */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '450px', padding: '32px', margin: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {isEditMode ? 'Edit Footer Link' : 'Add Footer Link'}
            </h3>

            {linkActionError && (
              <div className="badge danger" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px' }}>
                {linkActionError}
              </div>
            )}

            <form onSubmit={handleSaveLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Link Label</label>
                <input
                  type="text"
                  value={currentLink.label || ''}
                  onChange={e => setCurrentLink({ ...currentLink, label: e.target.value })}
                  placeholder="e.g. Help Center"
                  required
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>URL Path</label>
                <input
                  type="text"
                  value={currentLink.url || ''}
                  onChange={e => setCurrentLink({ ...currentLink, url: e.target.value })}
                  placeholder="e.g. /support"
                  required
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Category</label>
                  <select
                    value={currentLink.category || 'Quick Links'}
                    onChange={e => setCurrentLink({ ...currentLink, category: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', height: '42px' }}
                  >
                    <option value="Quick Links">Quick Links</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Display Order</label>
                  <input
                    type="number"
                    value={currentLink.display_order ?? 0}
                    onChange={e => setCurrentLink({ ...currentLink, display_order: parseInt(e.target.value) || 0 })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-button outline"
                  style={{ padding: '10px 20px', borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLink}
                  className="admin-button"
                  style={{ padding: '10px 20px', borderRadius: '10px' }}
                >
                  {isSavingLink ? 'Saving...' : 'Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
