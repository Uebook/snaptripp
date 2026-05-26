'use client'

import React, { useState, useEffect } from 'react'
import styles from '../carousel/carousel.module.css'

interface WhyItem {
  id: string
  icon: string
  title: string
  text: string
}

export default function WhyManager() {
  const [items, setItems] = useState<WhyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WhyItem | null>(null)
  const [tableMissing, setTableMissing] = useState(false)
  
  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    text: ''
  })

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/why', { cache: 'no-store' })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingItem ? 'PUT' : 'POST'
    const body = editingItem ? { ...formData, id: editingItem.id } : formData

    try {
      const res = await fetch('/api/admin/why', {
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
    if (!confirm('Are you sure you want to delete this feature?')) return

    try {
      const res = await fetch(`/api/admin/why?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchItems()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({ icon: '🗺️', title: '', text: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (item: WhyItem) => {
    setEditingItem(item)
    setFormData({
      icon: item.icon,
      title: item.title,
      text: item.text
    })
    setIsModalOpen(true)
  }

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading features...</div>

  if (tableMissing) {
    return (
      <div className={styles.missingTableCard}>
        <div className={styles.missingHeader}>
          <div className={styles.missingIcon}>⚠️</div>
          <h2 className={styles.missingTitle}>Database Table Missing</h2>
        </div>
        <p className={styles.missingText}>
          The <strong>why_snaptrip</strong> table has not been created yet. Please run the SQL migration script provided to set up the database.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.headerActions}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Why SnapTrip Features</div>
        <button onClick={openAddModal} className="admin-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Feature
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <h3 className={styles.emptyTitle}>No Features Found</h3>
          <p className={styles.emptyText}>Add some features to explain why travelers should choose SnapTrip.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardBody}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc} style={{ height: 'auto', WebkitLineClamp: 'none' }}>{item.text}</p>
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
              <h2 className={styles.modalTitle}>{editingItem ? 'Edit Feature' : 'Add New Feature'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Emoji Icon</label>
                    <input required type="text" className={styles.input} value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="🗺️" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Title</label>
                    <input required type="text" className={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Seamless and Intuitive" />
                  </div>

                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Description Text</label>
                    <textarea required className={styles.textarea} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} placeholder="Plan your trip with ease using our clean..." />
                  </div>

                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="admin-btn-primary" style={{ padding: '10px 24px' }}>Save Feature</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
