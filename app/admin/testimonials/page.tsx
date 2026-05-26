'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../carousel/carousel.module.css'

interface Testimonial {
  id: string
  name: string
  location: string
  quote: string
  avatar_url: string
  image_url: string
}

export default function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null)
  const [tableMissing, setTableMissing] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    quote: '',
    avatar_url: '',
    image_url: ''
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/testimonials')
      const data = await res.json()
      
      if (!res.ok) {
        if (data.error === 'table_missing') setTableMissing(true)
        return
      }
      
      setItems(data.items || [])
      setTableMissing(false)
    } catch (err) {
      console.error('Failed to fetch', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar_url' | 'image_url') => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      if (field === 'avatar_url') setUploadingAvatar(true)
      else setUploadingImage(true)

      const { error: uploadError, data } = await supabase.storage
        .from('carousel') // Reusing carousel bucket for simplicity
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('carousel')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, [field]: publicUrl }))
    } catch (error: any) {
      alert('Error uploading image: ' + error.message)
    } finally {
      if (field === 'avatar_url') setUploadingAvatar(false)
      else setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingItem ? 'PUT' : 'POST'
    const body = editingItem ? { ...formData, id: editingItem.id } : formData

    try {
      const res = await fetch('/api/admin/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchItems()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save item')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchItems()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({ name: '', location: '', quote: '', avatar_url: '', image_url: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      location: item.location,
      quote: item.quote,
      avatar_url: item.avatar_url,
      image_url: item.image_url
    })
    setIsModalOpen(true)
  }

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading Testimonials...</div>

  if (tableMissing) {
    return (
      <div className={styles.missingTableCard}>
        <div className={styles.missingHeader}>
          <div className={styles.missingIcon}>⚠️</div>
          <h2 className={styles.missingTitle}>Database Table Missing</h2>
        </div>
        <p className={styles.missingText}>
          The <strong>testimonials</strong> table has not been created yet. Please run the SQL migration script provided in the plan to set up the database.
        </p>
      </div>
    )
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.headerActions}>
        <input 
          type="text" 
          placeholder="Search testimonials..." 
          className={styles.searchBar}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button onClick={openAddModal} className="admin-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Testimonial
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h3 className={styles.emptyTitle}>No Testimonials Found</h3>
          <p className={styles.emptyText}>Add your first traveler testimonial to display on the home page.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardPreview} style={{ backgroundImage: `url(${item.image_url})` }}>
                <span className={styles.cardBadge}>{item.location}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitleSection}>
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                </div>
                <p className={styles.cardDesc}>"{item.quote}"</p>
              </div>
              <div className={styles.cardActions}>
                <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openEditModal(item)}>Edit</button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Traveler Name</label>
                    <input required type="text" className={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="E.g. Riya Sharma" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Location / City</label>
                    <input required type="text" className={styles.input} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="E.g. Dubai" />
                  </div>

                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Quote</label>
                    <textarea required className={styles.textarea} value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} placeholder="Planning my trip was super easy and smooth..." />
                  </div>

                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Traveler Avatar (Small Image)</label>
                    <div className={styles.imageUploadSection}>
                      <div className={styles.uploadOptions}>
                        <div className={styles.fileInputWrapper}>
                          <input type="file" accept="image/*" onChange={e => handleUpload(e, 'avatar_url')} className={styles.fileInput} disabled={uploadingAvatar} />
                          <button type="button" className={styles.browseBtn}>
                            {uploadingAvatar ? 'Uploading...' : 'Browse Local Files'}
                          </button>
                          <span className={styles.fileSelectedName}>or drag and drop</span>
                        </div>
                        <div className={styles.uploadOr}>URL</div>
                        <input type="text" className={styles.input} value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} placeholder="https://..." />
                      </div>
                      {formData.avatar_url && (
                        <div className={styles.imagePreview} style={{ backgroundImage: `url(${formData.avatar_url})`, height: 80, width: 80, borderRadius: '50%' }}>
                          <button type="button" className={styles.removePreviewBtn} onClick={() => setFormData({...formData, avatar_url: ''})}>×</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Polaroid Image (Large Photo)</label>
                    <div className={styles.imageUploadSection}>
                      <div className={styles.uploadOptions}>
                        <div className={styles.fileInputWrapper}>
                          <input type="file" accept="image/*" onChange={e => handleUpload(e, 'image_url')} className={styles.fileInput} disabled={uploadingImage} />
                          <button type="button" className={styles.browseBtn}>
                            {uploadingImage ? 'Uploading...' : 'Browse Local Files'}
                          </button>
                          <span className={styles.fileSelectedName}>or drag and drop</span>
                        </div>
                        <div className={styles.uploadOr}>URL</div>
                        <input type="text" className={styles.input} value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                      </div>
                      {formData.image_url && (
                        <div className={styles.imagePreview} style={{ backgroundImage: `url(${formData.image_url})` }}>
                          <button type="button" className={styles.removePreviewBtn} onClick={() => setFormData({...formData, image_url: ''})}>×</button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="admin-btn-primary" style={{ padding: '10px 24px' }}>Save Testimonial</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
