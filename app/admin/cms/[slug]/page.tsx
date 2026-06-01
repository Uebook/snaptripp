'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PageData {
  id: string
  slug: string
  title: string
  content: string
  meta_description: string
}

export default function AdminCMSEdit({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { slug } = params
  
  const [page, setPage] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchPage()
  }, [slug])

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setPage(data.page)
      } else {
        setMsg({ text: data.error || 'Failed to fetch page', type: 'danger' })
      }
    } catch (err) {
      setMsg({ text: 'Network error', type: 'danger' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!page) return
    setIsSaving(true)
    setMsg({ text: '', type: '' })

    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          content: page.content,
          meta_description: page.meta_description
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ text: 'Page updated successfully!', type: 'success' })
        setPage(data.page)
      } else {
        setMsg({ text: data.error || 'Failed to save', type: 'danger' })
      }
    } catch (err) {
      setMsg({ text: 'Network error', type: 'danger' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading page editor...</div>
  if (!page && !isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Page not found. <Link href="/admin/cms">Go Back</Link></div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/admin/cms" className="admin-button outline" style={{ padding: '8px', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Edit Page: /{slug}</h1>
      </div>

      <div className="admin-card">
        {msg.text && (
          <div className={`badge ${msg.type}`} style={{ display: 'block', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Page Title</label>
            <input
              type="text"
              value={page?.title || ''}
              onChange={e => setPage(p => p ? { ...p, title: e.target.value } : null)}
              required
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Meta Description (SEO)</label>
            <textarea
              value={page?.meta_description || ''}
              onChange={e => setPage(p => p ? { ...p, meta_description: e.target.value } : null)}
              rows={2}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Page Content (HTML supported)</label>
            <p style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '-4px', marginBottom: '4px' }}>
              You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, and &lt;li&gt; to format the content.
            </p>
            <textarea
              value={page?.content || ''}
              onChange={e => setPage(p => p ? { ...p, content: e.target.value } : null)}
              rows={15}
              required
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="admin-button"
            style={{ alignSelf: 'flex-start', padding: '12px 24px' }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
