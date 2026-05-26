'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  read_time: string
  image_url: string
  status?: string
  created_at?: string
}

function HtmlEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Sync state to editor innerHTML on edit load
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '<p><br></p>'
    }
  }, [value])

  const execCmd = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div style={{ border: '1px solid var(--admin-border)', borderRadius: '14px', background: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .editor-btn {
          padding: 6px 10px;
          background: #fff;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--admin-text);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          transition: all 0.2s;
        }
        .editor-btn:hover {
          background: #e2e8f0;
          border-color: var(--admin-muted);
          transform: translateY(-1px);
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', borderBottom: '1px solid var(--admin-border)', background: '#f1f5f9', alignItems: 'center' }}>
        <button type="button" className="editor-btn" onClick={() => execCmd('bold')} title="Bold"><b>B</b></button>
        <button type="button" className="editor-btn" onClick={() => execCmd('italic')} title="Italic"><i>I</i></button>
        <button type="button" className="editor-btn" onClick={() => execCmd('underline')} title="Underline"><u>U</u></button>
        <button type="button" className="editor-btn" onClick={() => execCmd('strikeThrough')} title="Strikethrough"><s>S</s></button>
        
        <div style={{ width: '1px', height: '20px', background: 'var(--admin-border)', margin: '0 4px' }} />
        
        <button type="button" className="editor-btn" onClick={() => execCmd('formatBlock', '<h2>')} title="H2">H2</button>
        <button type="button" className="editor-btn" onClick={() => execCmd('formatBlock', '<h3>')} title="H3">H3</button>
        <button type="button" className="editor-btn" onClick={() => execCmd('formatBlock', '<p>')} title="Paragraph">P</button>
        <button type="button" className="editor-btn" onClick={() => execCmd('formatBlock', '<blockquote>')} title="Blockquote">Quote</button>
        
        <div style={{ width: '1px', height: '20px', background: 'var(--admin-border)', margin: '0 4px' }} />
        
        <button type="button" className="editor-btn" onClick={() => execCmd('insertUnorderedList')} title="Bullet List">• List</button>
        <button type="button" className="editor-btn" onClick={() => execCmd('insertOrderedList')} title="Numbered List">1. List</button>
        
        <div style={{ width: '1px', height: '20px', background: 'var(--admin-border)', margin: '0 4px' }} />
        
        <button type="button" className="editor-btn" onClick={() => {
          const url = prompt('Enter link URL:')
          if (url) execCmd('createLink', url)
        }} title="Insert Link">🔗 Link</button>
        <button type="button" className="editor-btn" onClick={() => execCmd('unlink')} title="Remove Link">🚫 Unlink</button>
        <button type="button" className="editor-btn" onClick={() => execCmd('removeFormat')} title="Clear Formatting">🗑️</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: '260px',
          maxHeight: '500px',
          padding: '20px',
          outline: 'none',
          background: '#ffffff',
          overflowY: 'auto',
          fontSize: '15px',
          lineHeight: '1.6',
          fontFamily: "'Inter', sans-serif"
        }}
      />
    </div>
  )
}

export default function AdminBlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTableMissing, setIsTableMissing] = useState(false)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Destinations')
  const [readTime, setReadTime] = useState('5 min read')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('Published')
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)

  const fetchBlogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blogs')
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'table_missing') {
          setIsTableMissing(true)
          return
        }
        throw new Error(data.error || 'Failed to fetch blogs')
      }
      setBlogs(data.blogs || [])
      setIsTableMissing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setSlug(generatedSlug)
    }
  }, [title, editingId])

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setCategory('Destinations')
    setReadTime('5 min read')
    setImageUrl('')
    setStatus('Published')
    setIsFormOpen(false)
  }

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id)
    setTitle(blog.title)
    setSlug(blog.slug)
    setExcerpt(blog.excerpt)
    setContent(blog.content)
    setCategory(blog.category)
    setReadTime(blog.read_time)
    setImageUrl(blog.image_url)
    setStatus(blog.status || 'Published')
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete blog')

      setBlogs(blogs.filter((b) => b.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImg(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('blogs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blogs')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
    } finally {
      setUploadingImg(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      id: editingId,
      title,
      slug,
      excerpt,
      content,
      category,
      read_time: readTime,
      image_url: imageUrl,
      status
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save blog')

      resetForm()
      fetchBlogs()
    } catch (err: any) {
      setError(err.message || 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  const migrationSql = `-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  read_time text not null,
  image_url text not null,
  status text not null default 'Published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- If the table already exists, run this command to add the column:
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS status text not null default 'Published';

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to blogs" ON public.blogs;
CREATE POLICY "Allow public read access to blogs"
  ON public.blogs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage blogs" ON public.blogs;
CREATE POLICY "Allow authenticated users to manage blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';`

  if (isTableMissing) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div className="admin-card" style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 12px 0', fontSize: '20px', fontWeight: '800' }}>⚠️ Database Migration Required</h2>
          <p style={{ color: '#991b1b', lineHeight: '1.6', fontSize: '15px' }}>
            The <strong>blogs</strong> table does not exist in your database. Please run the following SQL script inside the <strong>SQL Editor</strong> of your Supabase Dashboard to create the table and setup RLS permissions:
          </p>
          <pre style={{
            background: '#1e293b',
            color: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            margin: '20px 0',
            lineHeight: '1.5'
          }}>
            {migrationSql}
          </pre>
          <button 
            className="admin-button" 
            onClick={() => {
              navigator.clipboard.writeText(migrationSql)
              alert('SQL script copied to clipboard!')
            }}
          >
            Copy SQL Script
          </button>
          <button 
            className="admin-button outline" 
            style={{ marginLeft: '12px' }} 
            onClick={fetchBlogs}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Articles & Editorial Stories</h2>
          <p style={{ color: 'var(--admin-muted)', marginTop: '4px' }}>Create, update, and manage articles published on the website.</p>
        </div>
        <button 
          className="admin-button"
          onClick={() => {
            if (isFormOpen) resetForm()
            else setIsFormOpen(true)
          }}
        >
          {isFormOpen ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {error && (
        <div className="admin-card" style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#b91c1c', marginBottom: '20px', fontWeight: 500 }}>
          Error: {error}
        </div>
      )}

      {isFormOpen && (
        <div className="admin-card" style={{ marginBottom: '32px', animation: 'fadeIn 0.2s ease' }}>
          <h3>{editingId ? 'Edit Article' : 'New Article Detail'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Title</label>
                <input 
                  type="text" 
                  className="admin-search" 
                  style={{ width: '100%', padding: '12px' }} 
                  placeholder="e.g. Hidden Gems in Kyoto"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Slug</label>
                <input 
                  type="text" 
                  className="admin-search" 
                  style={{ width: '100%', padding: '12px' }} 
                  placeholder="e.g. hidden-gems-kyoto"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Category</label>
                <select 
                  className="admin-search" 
                  style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: 'inherit' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Destinations">Destinations</option>
                  <option value="Travel Tips">Travel Tips</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Food">Food</option>
                  <option value="Nature">Nature</option>
                  <option value="Guide">Guide</option>
                </select>
              </div>
              <div>
                <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Read Time</label>
                <input 
                  type="text" 
                  className="admin-search" 
                  style={{ width: '100%', padding: '12px' }} 
                  placeholder="e.g. 5 min read"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Status</label>
                <select 
                  className="admin-search" 
                  style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: 'inherit' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Image Selection</label>
                <div style={{ position: 'relative' }}>
                  <button type="button" className="admin-button outline" style={{ width: '100%', padding: '10px' }}>
                    Browse Local File
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Or Paste Image URL</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="admin-search" 
                  style={{ flex: 1, padding: '12px' }} 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
                {uploadingImg && <div className="upload-spinner" style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>}
              </div>
              {imageUrl && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={imageUrl} alt="Preview" style={{ height: '60px', width: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--admin-muted)', wordBreak: 'break-all' }}>{imageUrl}</span>
                  <button type="button" onClick={() => setImageUrl('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                </div>
              )}
            </div>

            <div>
              <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Excerpt (Short description)</label>
              <textarea 
                className="admin-search" 
                style={{ width: '100%', padding: '12px', height: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                placeholder="A brief snippet of the post for listing cards..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="card-label" style={{ display: 'block', marginBottom: '6px' }}>Content (HTML formatted body)</label>
              <HtmlEditor value={content} onChange={setContent} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="admin-button outline" onClick={resetForm}>Cancel</button>
              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>Loading articles...</div>
        ) : blogs.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Read Time</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td style={{ fontWeight: '600' }}>{blog.title}</td>
                  <td><span className="badge info" style={{ background: '#e0f2fe', color: '#0369a1' }}>{blog.category}</span></td>
                  <td>
                    <span 
                      className={`badge ${blog.status === 'Draft' ? 'warning' : 'success'}`} 
                      style={{ 
                        background: blog.status === 'Draft' ? '#fffbeb' : '#ecfdf5', 
                        color: blog.status === 'Draft' ? 'var(--admin-warning)' : 'var(--admin-success)' 
                      }}
                    >
                      {blog.status || 'Published'}
                    </span>
                  </td>
                  <td>{blog.read_time}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{blog.slug}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(blog)}>Edit</button>
                      <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(blog.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>No articles found. Click &quot;New Article&quot; to publish your first story.</div>
        )}
      </div>
    </div>
  )
}
