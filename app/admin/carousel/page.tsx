'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './carousel.module.css'

interface CarouselItem {
  id: string
  country: string
  region: string
  description: string
  label: string
  location_tag: string
  image_url: string
  bg_image_url: string
  created_at?: string
  updated_at?: string
}

const INITIAL_FORM: Omit<CarouselItem, 'id'> & { id?: string } = {
  country: '',
  region: '',
  description: '',
  label: '',
  location_tag: '',
  image_url: '',
  bg_image_url: '',
}

const SQL_MIGRATION = `-- 1. Create home_carousel table
CREATE TABLE IF NOT EXISTS public.home_carousel (
  id uuid default gen_random_uuid() primary key,
  country text not null unique,
  region text not null,
  description text not null,
  label text not null,
  location_tag text not null,
  image_url text not null,
  bg_image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
ALTER TABLE public.home_carousel ENABLE ROW LEVEL SECURITY;

-- 3. Select policy (allow everyone to view carousel destinations)
DROP POLICY IF EXISTS "Allow public read access to home_carousel" ON public.home_carousel;
CREATE POLICY "Allow public read access to home_carousel"
  ON public.home_carousel FOR SELECT
  USING (true);

-- 4. Write policy (allow authenticated users to manage carousel)
DROP POLICY IF EXISTS "Allow authenticated users to manage home_carousel" ON public.home_carousel;
CREATE POLICY "Allow authenticated users to manage home_carousel"
  ON public.home_carousel FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Seed initial carousel data
INSERT INTO public.home_carousel (country, region, description, label, location_tag, image_url, bg_image_url)
VALUES 
('Greece', 'Europe', 'Greece is famous for its iconic blue domes, ancient history, and stunning Aegean sunsets.', 'Santorini', 'Oia Village, Santorini', '/images/hero_greece_oia.png', '/images/hero_greece_oia.png'),
('Italy', 'Europe', 'Italy is known for its historic art, culinary masterpieces, and the dramatic Amalfi Coast.', 'Positano', 'Amalfi Coast, Italy', '/images/card_italy.png', '/images/card_italy.png'),
('Spain', 'Region', 'Spain is famous for its islands, beach holidays, surfing, diving and yachting.', 'Madrid', 'Plaza Mayor, Madrid', '/images/card_madrid.png', '/images/hero_seoul_night.png'),
('UAE', 'Middle East', 'UAE offers a blend of futuristic skyscrapers, luxury shopping, and desert adventures.', 'Dubai', 'Museum of the Future, Dubai', '/images/card_uae.png', '/images/hero_uae_museum.png'),
('USA', 'North America', 'USA features diverse landscapes from bustling New York streets to the Grand Canyon.', 'New York', 'Times Square, New York', '/images/card_usa.png', '/images/card_usa.png'),
('Canada', 'North America', 'Canada is renowned for its vast wilderness, stunning lakes, and friendly multicultural cities.', 'Banff', 'Moraine Lake, Banff', '/images/card_canada.png', '/images/card_canada.png'),
('Thailand', 'Asia', 'Thailand is a land of tropical beaches, ornate temples, and vibrant street life.', 'Phuket', 'Maya Bay, Phi Phi Islands', '/images/card_thailand.png', '/images/card_thailand.png'),
('Ireland', 'Europe', 'Ireland is known for its lush green landscapes, historic castles, and vibrant culture.', 'Cliffs of Moher', 'Cliffs of Moher, County Clare', '/images/why_mountains.png', '/images/why_mountains.png')
ON CONFLICT (country) DO NOTHING;

-- 6. Force schema reload
NOTIFY pgrst, 'reload schema';`

export default function AdminCarouselPage() {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<typeof INITIAL_FORM>(INITIAL_FORM)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Upload States
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingBgImg, setUploadingBgImg] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      setTableMissing(false)
      const res = await fetch('/api/admin/carousel')
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'table_missing') {
          setTableMissing(true)
        } else {
          setErrorMsg(data.error || 'An error occurred while fetching carousel items.')
        }
        return
      }

      setItems(data.items || [])
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Failed to connect to the carousel API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_MIGRATION)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleOpenAddModal = () => {
    setForm(INITIAL_FORM)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: CarouselItem) => {
    setForm({
      id: item.id,
      country: item.country,
      region: item.region,
      description: item.description,
      label: item.label,
      location_tag: item.location_tag,
      image_url: item.image_url,
      bg_image_url: item.bg_image_url,
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setForm(INITIAL_FORM)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image_url' | 'bg_image_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    const isBg = fieldName === 'bg_image_url'
    if (isBg) setUploadingBgImg(true)
    else setUploadingImg(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('carousel')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('carousel')
        .getPublicUrl(filePath)

      setForm((prev) => ({ ...prev, [fieldName]: publicUrl }))
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
    } finally {
      if (isBg) setUploadingBgImg(false)
      else setUploadingImg(false)
    }
  }

  const handleRemoveImage = (fieldName: 'image_url' | 'bg_image_url') => {
    setForm((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.country || !form.region || !form.description || !form.label || !form.location_tag || !form.image_url || !form.bg_image_url) {
      alert('Please fill out all fields and select or upload both images.')
      return
    }

    setSaving(true)
    try {
      const url = '/api/admin/carousel'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save carousel item.')
      }

      alert(isEditing ? 'Carousel item updated successfully!' : 'Carousel item created successfully!')
      handleCloseModal()
      fetchItems()
    } catch (err: any) {
      alert('Error saving carousel item: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, country: string) => {
    if (!confirm(`Are you sure you want to delete the carousel destination for "${country}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/carousel?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete carousel item.')
      }

      alert('Carousel item deleted successfully!')
      fetchItems()
    } catch (err: any) {
      alert('Error deleting item: ' + err.message)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div className={styles.uploadSpinner} style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
        <p style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>Loading hero carousel configuration...</p>
      </div>
    )
  }

  if (tableMissing) {
    return (
      <div className={styles.missingTableCard}>
        <div className={styles.missingHeader}>
          <span className={styles.missingIcon}>⚠️</span>
          <h2 className={styles.missingTitle}>Table "home_carousel" Missing</h2>
        </div>
        <p className={styles.missingText}>
          The database table for homepage hero carousel items does not exist yet. Please run the following SQL script in your Supabase SQL Editor to create the table, set proper RLS permissions, and seed the default destinations.
        </p>
        <div className={styles.sqlCodeBlock}>
          <button className={styles.copyCodeBtn} onClick={handleCopySQL}>
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </button>
          <pre style={{ margin: 0 }}>{SQL_MIGRATION}</pre>
        </div>
        <div className={styles.missingActions}>
          <button className="admin-button" onClick={fetchItems}>
            🔄 Check Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.carouselContainer}>
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '16px', borderRadius: '12px' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <div className={styles.headerActions}>
        <input
          type="text"
          placeholder="Search by country or region..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="admin-button" onClick={handleOpenAddModal}>
          ➕ Add Carousel Item
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>✈️</span>
          <h3 className={styles.emptyTitle}>No Carousel Destinations</h3>
          <p className={styles.emptyText}>
            {searchQuery ? `No matches found for "${searchQuery}"` : 'Get started by creating your first landing banner destination for the homepage!'}
          </p>
          {!searchQuery && (
            <button className="admin-button" onClick={handleOpenAddModal} style={{ marginTop: '12px' }}>
              Create Carousel Item
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <div key={item.id} className={styles.card}>
              <div
                className={styles.cardPreview}
                style={{ backgroundImage: `url(${item.image_url})` }}
              >
                <span className={styles.cardBadge}>{item.region}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitleSection}>
                  <h4 className={styles.cardTitle}>{item.country}</h4>
                  <span className={styles.cardRegion}>{item.region}</span>
                </div>
                <span className={styles.cardLabel}>{item.label}</span>
                <p className={styles.cardDesc}>{item.description}</p>
                <div className={styles.cardLocation}>
                  📍 {item.location_tag}
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => handleOpenEditModal(item)}
                >
                  ✏️ Edit
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(item.id, item.country)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {isEditing ? `Edit Carousel Destination: ${form.country}` : 'Add New Carousel Destination'}
              </h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Country Name</label>
                    <input
                      type="text"
                      name="country"
                      required
                      placeholder="e.g. Greece"
                      className={styles.input}
                      value={form.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Region</label>
                    <input
                      type="text"
                      name="region"
                      required
                      placeholder="e.g. Europe"
                      className={styles.input}
                      value={form.region}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Spot Name / Label</label>
                    <input
                      type="text"
                      name="label"
                      required
                      placeholder="e.g. Santorini"
                      className={styles.input}
                      value={form.label}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Location Tag (Detailed)</label>
                    <input
                      type="text"
                      name="location_tag"
                      required
                      placeholder="e.g. Oia Village, Santorini"
                      className={styles.input}
                      value={form.location_tag}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Description</label>
                    <textarea
                      name="description"
                      required
                      placeholder="A short engaging paragraph about this destination for the home banner..."
                      className={styles.textarea}
                      value={form.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Thumbnail Image */}
                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Thumbnail Image (3:4 portrait or card aspect)</label>
                    <div className={styles.imageUploadSection}>
                      {form.image_url ? (
                        <div
                          className={styles.imagePreview}
                          style={{ backgroundImage: `url(${form.image_url})` }}
                        >
                          <button
                            type="button"
                            className={styles.removePreviewBtn}
                            onClick={() => handleRemoveImage('image_url')}
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div className={styles.uploadOptions}>
                          <input
                            type="text"
                            name="image_url"
                            placeholder="Paste image URL (e.g. /images/card_italy.png)"
                            className={styles.input}
                            value={form.image_url}
                            onChange={handleInputChange}
                          />
                          <div className={styles.uploadOr}>Or upload local file</div>
                          <div className={styles.fileInputWrapper}>
                            <button type="button" className={styles.browseBtn}>
                              Browse Image
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              className={styles.fileInput}
                              onChange={(e) => handleFileUpload(e, 'image_url')}
                            />
                            {uploadingImg && <div className={styles.uploadSpinner}></div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className={`${styles.formGroup} ${styles.formSpan2}`}>
                    <label className={styles.label}>Hero Background Image (Large landscape or widescreen aspect)</label>
                    <div className={styles.imageUploadSection}>
                      {form.bg_image_url ? (
                        <div
                          className={styles.imagePreview}
                          style={{ backgroundImage: `url(${form.bg_image_url})` }}
                        >
                          <button
                            type="button"
                            className={styles.removePreviewBtn}
                            onClick={() => handleRemoveImage('bg_image_url')}
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div className={styles.uploadOptions}>
                          <input
                            type="text"
                            name="bg_image_url"
                            placeholder="Paste background image URL"
                            className={styles.input}
                            value={form.bg_image_url}
                            onChange={handleInputChange}
                          />
                          <div className={styles.uploadOr}>Or upload local file</div>
                          <div className={styles.fileInputWrapper}>
                            <button type="button" className={styles.browseBtn}>
                              Browse Image
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              className={styles.fileInput}
                              onChange={(e) => handleFileUpload(e, 'bg_image_url')}
                            />
                            {uploadingBgImg && <div className={styles.uploadSpinner}></div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className="admin-button outline"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-button" disabled={saving}>
                  {saving ? (
                    <>
                      <div className={styles.uploadSpinner} style={{ width: '14px', height: '14px', borderWidth: '1.5px', borderTopColor: 'white' }}></div>
                      Saving...
                    </>
                  ) : (
                    'Save Destination'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
