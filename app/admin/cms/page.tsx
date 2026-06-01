'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PageData {
  id: string
  slug: string
  title: string
  meta_description: string
  updated_at: string
}

export default function AdminCMS() {
  const [pages, setPages] = useState<PageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/cms/pages', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setPages(data.pages || [])
      } else {
        if (data.error === 'table_missing') {
          setErrorMsg('The pages table is missing. Please run the migration script: 20260601_create_cms_tables.sql')
        } else {
          setErrorMsg(data.error || 'Failed to fetch pages')
        }
      }
    } catch (err) {
      setErrorMsg('A network error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Content Management (CMS)</h1>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Static Pages</h3>
          <p style={{ color: 'var(--admin-muted)', marginBottom: '12px' }}>Manage content for Privacy, Terms, etc.</p>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--admin-accent)' }}>{pages.length}</div>
        </div>
        <div className="admin-card">
          <h3>Settings & Toggles</h3>
          <div>Feature flags & app settings</div>
          <div style={{ marginTop: '12px' }}>
            <label><input type="checkbox" defaultChecked /> Enable Blogs</label><br />
            <label><input type="checkbox" defaultChecked /> Enable Reviews</label><br />
            <label><input type="checkbox" /> Beta Features</label>
          </div>
        </div>
        <div className="admin-card">
          <h3>Email Templates</h3>
          <div>Manage system email templates</div>
          <button className="admin-button" style={{ marginTop: '12px' }}>New Template</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Static Pages Data</h3>
        
        {errorMsg && (
          <div className="badge danger" style={{ display: 'block', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-muted)' }}>Loading pages...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td style={{ fontWeight: '600' }}>{page.title}</td>
                  <td style={{ color: 'var(--admin-muted)' }}>/{page.slug}</td>
                  <td><span className="badge success">Published</span></td>
                  <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/cms/${page.slug}`} className="admin-button outline" style={{ padding: '6px 12px', textDecoration: 'none' }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && !errorMsg && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-muted)' }}>
                    No pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: '24px' }}>
        <h3>Email Templates Data</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Template</th>
              <th>Trigger</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Welcome Email</td>
              <td>New user signup</td>
              <td>2026-01-05</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
            <tr>
              <td>Trip Reminder</td>
              <td>48 hrs before trip</td>
              <td>2026-01-02</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
