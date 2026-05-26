'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ExploreSettings {
  hero_tagline: string
  hero_title: string
  quote_text: string
  quote_author: string
}

interface CountryGuide {
  id: string
  name: string
  desc: string
  tag: string
  hero_img: string
  is_featured: boolean
  capital: string
  currency: string
  language: string
  time_zone: string
  best_time: string
  emergency_police: string
  emergency_ambulance: string
  emergency_embassy: string
  experience_title: string
  experience_desc: string
  experience_img: string
}

interface GuideDetails {
  cards: { title: string; desc: string; icon_name: string }[]
  connectivity: { title: string; desc: string }[]
  etiquette: { title: string; desc: string }[]
  cities: { name: string; desc: string; img_url: string }[]
}

export default function AdminExplorePage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'guides'>('settings')

  // Tab 1 Explore Settings States
  const [settings, setSettings] = useState<ExploreSettings>({
    hero_tagline: '',
    hero_title: '',
    quote_text: '',
    quote_author: ''
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState({ text: '', type: '' })

  // Tab 2 Guides States
  const [guides, setGuides] = useState<CountryGuide[]>([])
  const [isLoadingGuides, setIsLoadingGuides] = useState(false)

  // Add/Edit Guide General Modal
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentGuide, setCurrentGuide] = useState<Partial<CountryGuide>>({
    id: '',
    name: '',
    desc: '',
    tag: 'Culture',
    hero_img: '/images/guide_hero.png',
    is_featured: false,
    capital: '',
    currency: '',
    language: '',
    time_zone: '',
    best_time: '',
    emergency_police: '',
    emergency_ambulance: '',
    emergency_embassy: '',
    experience_title: '',
    experience_desc: '',
    experience_img: '/images/guide_hero.png'
  })
  const [generalModalError, setGeneralModalError] = useState('')
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)

  // Nested Details Editor Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [activeDetailsGuideId, setActiveDetailsGuideId] = useState('')
  const [details, setDetails] = useState<GuideDetails>({
    cards: [],
    connectivity: [],
    etiquette: [],
    cities: []
  })
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const [detailsModalError, setDetailsModalError] = useState('')

  // Upload States
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false)
  const [uploadingExpImg, setUploadingExpImg] = useState(false)
  const [uploadingCityImg, setUploadingCityImg] = useState<Record<number, boolean>>({})

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'hero_img' | 'experience_img' | 'city_img',
    cityIdx?: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'hero_img') setUploadingHeroImg(true)
    else if (type === 'experience_img') setUploadingExpImg(true)
    else if (type === 'city_img' && cityIdx !== undefined) {
      setUploadingCityImg(prev => ({ ...prev, [cityIdx]: true }))
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `explore-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('carousel')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('carousel')
        .getPublicUrl(filePath)

      if (type === 'hero_img') {
        setCurrentGuide(prev => ({ ...prev, hero_img: publicUrl }))
      } else if (type === 'experience_img') {
        setCurrentGuide(prev => ({ ...prev, experience_img: publicUrl }))
      } else if (type === 'city_img' && cityIdx !== undefined) {
        updateCityField(cityIdx, 'img_url', publicUrl)
      }
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
    } finally {
      if (type === 'hero_img') setUploadingHeroImg(false)
      else if (type === 'experience_img') setUploadingExpImg(false)
      else if (type === 'city_img' && cityIdx !== undefined) {
        setUploadingCityImg(prev => ({ ...prev, [cityIdx]: false }))
      }
    }
  }

  const renderImageUploader = (
    label: string,
    value: string,
    onUrlChange: (url: string) => void,
    onRemove: () => void,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isUploading: boolean
  ) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>{label}</label>
        <div className="image-upload-section">
          {value ? (
            <div className="image-preview-box" style={{ backgroundImage: `url(${value})` }}>
              <button type="button" className="remove-preview-btn" onClick={onRemove}>
                &times;
              </button>
            </div>
          ) : (
            <div className="image-upload-options">
              <input
                type="text"
                placeholder="Paste image URL (e.g. /images/guide_france.png)"
                className="image-upload-input"
                value={value}
                onChange={e => onUrlChange(e.target.value)}
              />
              <div className="image-upload-or">Or upload local file</div>
              <div className="file-input-wrapper">
                <button type="button" className="browse-btn">
                  Browse Image
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input-hidden"
                  onChange={onFileChange}
                />
                {isUploading && <div className="upload-spinner"></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchSettings()
    fetchGuides()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/explore/settings')
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

  const fetchGuides = async () => {
    setIsLoadingGuides(true)
    try {
      const res = await fetch('/api/admin/explore/guides')
      if (res.ok) {
        const data = await res.json()
        if (data.guides) {
          setGuides(data.guides)
        }
      }
    } catch (err) {
      console.error('Error fetching guides:', err)
    } finally {
      setIsLoadingGuides(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setSettingsMessage({ text: '', type: '' })

    try {
      const res = await fetch('/api/admin/explore/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (res.ok) {
        setSettingsMessage({ text: 'Settings saved successfully!', type: 'success' })
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

  const handleOpenAddGeneralModal = () => {
    setCurrentGuide({
      id: '',
      name: '',
      desc: '',
      tag: 'Culture',
      hero_img: '/images/guide_hero.png',
      is_featured: false,
      capital: '',
      currency: '',
      language: '',
      time_zone: '',
      best_time: '',
      emergency_police: '112',
      emergency_ambulance: '112',
      emergency_embassy: 'Contact your local embassy.',
      experience_title: 'Sightseeing Tour',
      experience_desc: 'Discover local highlights with a guided exploration.',
      experience_img: '/images/guide_hero.png'
    })
    setIsEditMode(false)
    setGeneralModalError('')
    setIsGeneralModalOpen(true)
  }

  const handleOpenEditGeneralModal = (guide: CountryGuide) => {
    setCurrentGuide(guide)
    setIsEditMode(true)
    setGeneralModalError('')
    setIsGeneralModalOpen(true)
  }

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingGeneral(true)
    setGeneralModalError('')

    try {
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/explore/guides', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentGuide)
      })

      const data = await res.json()
      if (res.ok) {
        setIsGeneralModalOpen(false)
        fetchGuides()
      } else {
        setGeneralModalError(data.error || 'Failed to save country guide.')
      }
    } catch (err) {
      setGeneralModalError('A network error occurred.')
    } finally {
      setIsSavingGeneral(false)
    }
  }

  const handleDeleteGuide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country guide? This will also delete all its cities, etiquette guidelines, and cards.')) return

    try {
      const res = await fetch(`/api/admin/explore/guides?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchGuides()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete guide.')
      }
    } catch (err) {
      alert('A network error occurred.')
    }
  }

  const handleToggleFeatured = async (guide: CountryGuide) => {
    try {
      const updated = { ...guide, is_featured: !guide.is_featured }
      const res = await fetch('/api/admin/explore/guides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (res.ok) {
        fetchGuides()
      }
    } catch (err) {
      console.error('Error toggling featured state:', err)
    }
  }

  // Details Modal Loader
  const handleOpenDetailsModal = async (countryId: string) => {
    setActiveDetailsGuideId(countryId)
    setDetailsModalError('')
    setIsLoadingDetails(true)
    setIsDetailsModalOpen(true)

    try {
      const res = await fetch(`/api/admin/explore/guides/details?country_id=${countryId}`)
      if (res.ok) {
        const data = await res.json()
        setDetails({
          cards: data.cards || [],
          connectivity: data.connectivity || [],
          etiquette: data.etiquette || [],
          cities: data.cities || []
        })
      }
    } catch (err) {
      setDetailsModalError('Failed to load sub-details.')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingDetails(true)
    setDetailsModalError('')

    try {
      const res = await fetch('/api/admin/explore/guides/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_id: activeDetailsGuideId,
          ...details
        })
      })

      if (res.ok) {
        setIsDetailsModalOpen(false)
      } else {
        const data = await res.json()
        setDetailsModalError(data.error || 'Failed to save details.')
      }
    } catch (err) {
      setDetailsModalError('A network error occurred.')
    } finally {
      setIsSavingDetails(false)
    }
  }

  // Nested Child Updaters
  const updateCardField = (idx: number, field: string, val: string) => {
    const updated = [...details.cards]
    updated[idx] = { ...updated[idx], [field]: val }
    setDetails({ ...details, cards: updated })
  }

  const addDetailItem = (type: 'connectivity' | 'etiquette') => {
    const updated = [...details[type]]
    updated.push({ title: '', desc: '' })
    setDetails({ ...details, [type]: updated })
  }

  const updateItemField = (type: 'connectivity' | 'etiquette', idx: number, field: string, val: string) => {
    const updated = [...details[type]]
    updated[idx] = { ...updated[idx], [field]: val }
    setDetails({ ...details, [type]: updated })
  }

  const removeDetailItem = (type: 'connectivity' | 'etiquette', idx: number) => {
    const updated = [...details[type]]
    updated.splice(idx, 1)
    setDetails({ ...details, [type]: updated })
  }

  const addCity = () => {
    const updated = [...details.cities]
    updated.push({ name: '', desc: '', img_url: '/images/hero_city.png' })
    setDetails({ ...details, cities: updated })
  }

  const updateCityField = (idx: number, field: string, val: string) => {
    const updated = [...details.cities]
    updated[idx] = { ...updated[idx], [field]: val }
    setDetails({ ...details, cities: updated })
  }

  const removeCity = (idx: number) => {
    const updated = [...details.cities]
    updated.splice(idx, 1)
    setDetails({ ...details, cities: updated })
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Submenu Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('settings')}
          className={`admin-button ${activeTab === 'settings' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Explore Headers & Quotes
        </button>
        <button
          onClick={() => setActiveTab('guides')}
          className={`admin-button ${activeTab === 'guides' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Country Guides List
        </button>
      </div>

      {/* Tab 1: Headers & Quotes Settings */}
      {activeTab === 'settings' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Explore Page Settings</h3>

          {settingsMessage.text && (
            <div className={`badge ${settingsMessage.type}`} style={{ display: 'block', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
              {settingsMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Tagline</label>
                <input
                  type="text"
                  value={settings.hero_tagline}
                  onChange={e => setSettings({ ...settings, hero_tagline: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Title</label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Marcel Proust Quote Text</label>
              <textarea
                value={settings.quote_text}
                onChange={e => setSettings({ ...settings, quote_text: e.target.value })}
                rows={3}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Quote Author Signature</label>
              <input
                type="text"
                value={settings.quote_author}
                onChange={e => setSettings({ ...settings, quote_author: e.target.value })}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={isSavingSettings} className="admin-button" style={{ alignSelf: 'flex-start' }}>
              {isSavingSettings ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Country Guides List */}
      {activeTab === 'guides' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Country Guides</h3>
            <button className="admin-button" onClick={handleOpenAddGeneralModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Country
            </button>
          </div>

          {isLoadingGuides ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>Loading country guides...</div>
          ) : guides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>No guides found. Click Add New Country above to start!</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Country ID</th>
                  <th>Name</th>
                  <th>Tag</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide.id}>
                    <td><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>{guide.id}</code></td>
                    <td style={{ fontWeight: '600' }}>{guide.name}</td>
                    <td><span className="badge warning">{guide.tag}</span></td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={guide.is_featured}
                          onChange={() => handleToggleFeatured(guide)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="admin-button outline" onClick={() => handleOpenEditGeneralModal(guide)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}>
                          Edit Base
                        </button>
                        <button className="admin-button outline" onClick={() => handleOpenDetailsModal(guide.id)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-accent)' }}>
                          Edit Sub-Sections
                        </button>
                        <button className="admin-button outline" onClick={() => handleDeleteGuide(guide.id)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
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

      {/* Modal 1: Add/Edit Base General Info */}
      {isGeneralModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <div className="admin-card" style={{ width: '600px', padding: '32px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {isEditMode ? 'Edit Country Base Info' : 'Create Country Guide'}
            </h3>

            {generalModalError && (
              <div className="badge danger" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px' }}>
                {generalModalError}
              </div>
            )}

            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Country ID (unique slug)</label>
                  <input
                    type="text"
                    value={currentGuide.id || ''}
                    onChange={e => setCurrentGuide({ ...currentGuide, id: e.target.value })}
                    disabled={isEditMode}
                    placeholder="e.g. spain"
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Country Name</label>
                  <input
                    type="text"
                    value={currentGuide.name || ''}
                    onChange={e => setCurrentGuide({ ...currentGuide, name: e.target.value })}
                    placeholder="e.g. Spain"
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Editorial Tag</label>
                  <select
                    value={currentGuide.tag || 'Culture'}
                    onChange={e => setCurrentGuide({ ...currentGuide, tag: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', height: '42px' }}
                  >
                    <option value="Culture">Culture</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>

                {renderImageUploader(
                  'Featured Image Path',
                  currentGuide.hero_img || '',
                  url => setCurrentGuide({ ...currentGuide, hero_img: url }),
                  () => setCurrentGuide({ ...currentGuide, hero_img: '' }),
                  e => handleFileUpload(e, 'hero_img'),
                  uploadingHeroImg
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Overview Description</label>
                <textarea
                  value={currentGuide.desc || ''}
                  onChange={e => setCurrentGuide({ ...currentGuide, desc: e.target.value })}
                  rows={3}
                  required
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Stats Snapshot</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Capital" value={currentGuide.capital || ''} onChange={e => setCurrentGuide({ ...currentGuide, capital: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                <input type="text" placeholder="Currency" value={currentGuide.currency || ''} onChange={e => setCurrentGuide({ ...currentGuide, currency: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                <input type="text" placeholder="Language" value={currentGuide.language || ''} onChange={e => setCurrentGuide({ ...currentGuide, language: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Time Zone" value={currentGuide.time_zone || ''} onChange={e => setCurrentGuide({ ...currentGuide, time_zone: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                <input type="text" placeholder="Best Time to Visit" value={currentGuide.best_time || ''} onChange={e => setCurrentGuide({ ...currentGuide, best_time: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Emergency & Safety</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Police Line" value={currentGuide.emergency_police || ''} onChange={e => setCurrentGuide({ ...currentGuide, emergency_police: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                <input type="text" placeholder="Ambulance Line" value={currentGuide.emergency_ambulance || ''} onChange={e => setCurrentGuide({ ...currentGuide, emergency_ambulance: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
              </div>
              <input type="text" placeholder="Embassy Guidance" value={currentGuide.emergency_embassy || ''} onChange={e => setCurrentGuide({ ...currentGuide, emergency_embassy: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />

              <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Traditional Experience Feature</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Experience Title</label>
                  <input type="text" placeholder="Experience Title" value={currentGuide.experience_title || ''} onChange={e => setCurrentGuide({ ...currentGuide, experience_title: e.target.value })} required style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }} />
                </div>
                {renderImageUploader(
                  'Experience Image Path',
                  currentGuide.experience_img || '',
                  url => setCurrentGuide({ ...currentGuide, experience_img: url }),
                  () => setCurrentGuide({ ...currentGuide, experience_img: '' }),
                  e => handleFileUpload(e, 'experience_img'),
                  uploadingExpImg
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Experience Description</label>
                <textarea placeholder="Experience Description" value={currentGuide.experience_desc || ''} onChange={e => setCurrentGuide({ ...currentGuide, experience_desc: e.target.value })} required rows={2} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsGeneralModalOpen(false)} className="admin-button outline" style={{ padding: '10px 20px', borderRadius: '10px' }}>Cancel</button>
                <button type="submit" disabled={isSavingGeneral} className="admin-button" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                  {isSavingGeneral ? 'Saving...' : 'Save General Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Sub-Sections Editor */}
      {isDetailsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '750px', padding: '32px', margin: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Edit Guide sub-sections for: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{activeDetailsGuideId}</code>
            </h3>

            {detailsModalError && (
              <div className="badge danger" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px' }}>
                {detailsModalError}
              </div>
            )}

            {isLoadingDetails ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--admin-muted)' }}>Loading country details...</div>
            ) : (
              <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 3 Quick Cards */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Overview Cards (Must be exactly 3)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {details.cards.map((card, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <strong>Card {idx + 1}</strong>
                        <input type="text" placeholder="Title" value={card.title} onChange={e => updateCardField(idx, 'title', e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                        <textarea placeholder="Description" value={card.desc} onChange={e => updateCardField(idx, 'desc', e.target.value)} required rows={4} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connectivity & Etiquette items */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Connectivity list */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Connectivity & Transport</h4>
                      <button type="button" onClick={() => addDetailItem('connectivity')} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                      {details.connectivity.map((item, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                          <input type="text" placeholder="Header" value={item.title} onChange={e => updateItemField('connectivity', idx, 'title', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <textarea placeholder="Instruction" value={item.desc} onChange={e => updateItemField('connectivity', idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none' }} />
                          <button type="button" onClick={() => removeDetailItem('connectivity', idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Etiquette list */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Local Etiquette</h4>
                      <button type="button" onClick={() => addDetailItem('etiquette')} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                      {details.etiquette.map((item, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                          <input type="text" placeholder="Header" value={item.title} onChange={e => updateItemField('etiquette', idx, 'title', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <textarea placeholder="Instruction" value={item.desc} onChange={e => updateItemField('etiquette', idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none' }} />
                          <button type="button" onClick={() => removeDetailItem('etiquette', idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Cities */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Must-Visit Cities</h4>
                    <button type="button" onClick={addCity} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add City</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                    {details.cities.map((city, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input type="text" placeholder="City Name" value={city.name} onChange={e => updateCityField(idx, 'name', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
                          
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input type="text" placeholder="Image URL or Path" value={city.img_url} onChange={e => updateCityField(idx, 'img_url', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', flex: 1 }} />
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                              <button type="button" className="admin-button outline" style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                {uploadingCityImg[idx] ? '...' : 'Upload'}
                              </button>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                onChange={e => handleFileUpload(e, 'city_img', idx)}
                                disabled={!!uploadingCityImg[idx]}
                              />
                            </div>
                          </div>
                        </div>
                        <textarea placeholder="Description" value={city.desc} onChange={e => updateCityField(idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none', width: '100%', boxSizing: 'border-box' }} />
                        <button type="button" onClick={() => removeCity(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="admin-button outline" style={{ padding: '10px 20px', borderRadius: '10px' }}>Cancel</button>
                  <button type="submit" disabled={isSavingDetails} className="admin-button" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                    {isSavingDetails ? 'Saving Sub-Sections...' : 'Save Sub-Sections'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
