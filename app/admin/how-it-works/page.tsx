'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PageSettings {
  hero_badge: string
  hero_title: string
  hero_description: string
  planning_title: string
  how_works_title: string
  how_works_desc: string
  demo_i_time_1: string
  demo_i_label_1: string
  demo_i_title_1: string
  demo_i_price_1: string
  demo_i_desc_1: string
  demo_i_tags_1: string
  demo_i_time_2: string
  demo_i_label_2: string
  demo_i_title_2: string
  demo_i_price_2: string
  demo_i_desc_2: string
  demo_i_img_2: string
  demo_i_ai_suggestion: string
  demo_map_placeholder: string
  demo_support_placeholder: string
}

interface StepItem {
  id: string
  type: 'planning' | 'how'
  step_number: string
  title: string
  description: string
  display_order: number
}

export default function AdminHowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'planning_steps' | 'how_steps'>('settings')

  // Tab 1 Settings States
  const [settings, setSettings] = useState<PageSettings>({
    hero_badge: '',
    hero_title: '',
    hero_description: '',
    planning_title: '',
    how_works_title: '',
    how_works_desc: '',
    demo_i_time_1: '',
    demo_i_label_1: '',
    demo_i_title_1: '',
    demo_i_price_1: '',
    demo_i_desc_1: '',
    demo_i_tags_1: '',
    demo_i_time_2: '',
    demo_i_label_2: '',
    demo_i_title_2: '',
    demo_i_price_2: '',
    demo_i_desc_2: '',
    demo_i_img_2: '',
    demo_i_ai_suggestion: '',
    demo_map_placeholder: '',
    demo_support_placeholder: ''
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState({ text: '', type: '' })
  const [uploadingImg, setUploadingImg] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImg(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `how-it-works-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('blogs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blogs')
        .getPublicUrl(filePath)

      setSettings(prev => ({ ...prev, demo_i_img_2: publicUrl }))
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
    } finally {
      setUploadingImg(false)
    }
  }

  // Steps Lists States
  const [steps, setSteps] = useState<StepItem[]>([])
  const [isLoadingSteps, setIsLoadingSteps] = useState(false)

  // Add/Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [modalType, setModalType] = useState<'planning' | 'how'>('planning')
  const [currentStep, setCurrentStep] = useState<Partial<StepItem>>({
    step_number: '',
    title: '',
    description: '',
    display_order: 0
  })
  const [modalError, setModalError] = useState('')
  const [isSavingStep, setIsSavingStep] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchSteps()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/how-it-works/settings', { cache: 'no-store' })
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

  const fetchSteps = async () => {
    setIsLoadingSteps(true)
    try {
      const res = await fetch('/api/admin/how-it-works/steps', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.steps) {
          setSteps(data.steps)
        }
      }
    } catch (err) {
      console.error('Error fetching steps:', err)
    } finally {
      setIsLoadingSteps(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setSettingsMsg({ text: '', type: '' })

    try {
      const res = await fetch('/api/admin/how-it-works/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (res.ok) {
        setSettingsMsg({ text: 'Page settings updated successfully!', type: 'success' })
        setSettings(data.settings)
      } else {
        setSettingsMsg({ text: data.error || 'Failed to save settings.', type: 'danger' })
      }
    } catch (err) {
      setSettingsMsg({ text: 'A network error occurred.', type: 'danger' })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleOpenAddModal = (type: 'planning' | 'how') => {
    const list = steps.filter(s => s.type === type)
    setCurrentStep({
      type,
      step_number: String(list.length + 1).padStart(2, '0'),
      title: '',
      description: '',
      display_order: list.length
    })
    setModalType(type)
    setIsEditMode(false)
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (step: StepItem) => {
    setCurrentStep(step)
    setModalType(step.type)
    setIsEditMode(true)
    setModalError('')
    setIsModalOpen(true)
  }

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStep.step_number || !currentStep.title || !currentStep.description) {
      setModalError('All fields are required.')
      return
    }

    setIsSavingStep(true)
    setModalError('')

    try {
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/how-it-works/steps', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentStep, type: modalType })
      })

      const data = await res.json()
      if (res.ok) {
        setIsModalOpen(false)
        fetchSteps()
      } else {
        setModalError(data.error || 'Failed to save step.')
      }
    } catch (err) {
      setModalError('A network error occurred.')
    } finally {
      setIsSavingStep(false)
    }
  }

  const handleDeleteStep = async (id: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return

    try {
      const res = await fetch(`/api/admin/how-it-works/steps?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchSteps()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete step.')
      }
    } catch (err) {
      alert('A network error occurred.')
    }
  }

  const planningSteps = steps.filter(s => s.type === 'planning')
  const howSteps = steps.filter(s => s.type === 'how')

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('settings')}
          className={`admin-button ${activeTab === 'settings' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Hero & Page Intros
        </button>
        <button
          onClick={() => setActiveTab('planning_steps')}
          className={`admin-button ${activeTab === 'planning_steps' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Art of Planning Steps
        </button>
        <button
          onClick={() => setActiveTab('how_steps')}
          className={`admin-button ${activeTab === 'how_steps' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Walkthrough Timeline
        </button>
      </div>

      {/* Tab 1: Hero & Layout Settings */}
      {activeTab === 'settings' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Hero Section & General Text</h3>

          {settingsMsg.text && (
            <div className={`badge ${settingsMsg.type}`} style={{ display: 'block', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
              {settingsMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Badge Text</label>
                <input
                  type="text"
                  value={settings.hero_badge}
                  onChange={e => setSettings({ ...settings, hero_badge: e.target.value })}
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
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Subtitle / Description</label>
              <textarea
                value={settings.hero_description}
                onChange={e => setSettings({ ...settings, hero_description: e.target.value })}
                rows={3}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Planning Section Title</label>
              <input
                type="text"
                value={settings.planning_title}
                onChange={e => setSettings({ ...settings, planning_title: e.target.value })}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>How It Works Section Title</label>
              <input
                type="text"
                value={settings.how_works_title}
                onChange={e => setSettings({ ...settings, how_works_title: e.target.value })}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>How It Works Section Description</label>
              <textarea
                value={settings.how_works_desc}
                onChange={e => setSettings({ ...settings, how_works_desc: e.target.value })}
                rows={3}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: 'var(--admin-accent)' }}>Interactive Demo - Itinerary Tab</h4>
              
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Slot 1 (Morning Arrival)</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Time</label>
                    <input
                      type="text"
                      value={settings.demo_i_time_1}
                      onChange={e => setSettings({ ...settings, demo_i_time_1: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Label</label>
                    <input
                      type="text"
                      value={settings.demo_i_label_1}
                      onChange={e => setSettings({ ...settings, demo_i_label_1: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Price</label>
                    <input
                      type="text"
                      value={settings.demo_i_price_1}
                      onChange={e => setSettings({ ...settings, demo_i_price_1: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Title</label>
                    <input
                      type="text"
                      value={settings.demo_i_title_1}
                      onChange={e => setSettings({ ...settings, demo_i_title_1: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={settings.demo_i_tags_1}
                      onChange={e => setSettings({ ...settings, demo_i_tags_1: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Description</label>
                  <textarea
                    value={settings.demo_i_desc_1}
                    onChange={e => setSettings({ ...settings, demo_i_desc_1: e.target.value })}
                    rows={2}
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Slot 2 (Lunch Engagement)</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Time</label>
                    <input
                      type="text"
                      value={settings.demo_i_time_2}
                      onChange={e => setSettings({ ...settings, demo_i_time_2: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Label</label>
                    <input
                      type="text"
                      value={settings.demo_i_label_2}
                      onChange={e => setSettings({ ...settings, demo_i_label_2: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Price</label>
                    <input
                      type="text"
                      value={settings.demo_i_price_2}
                      onChange={e => setSettings({ ...settings, demo_i_price_2: e.target.value })}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Title</label>
                  <input
                    type="text"
                    value={settings.demo_i_title_2}
                    onChange={e => setSettings({ ...settings, demo_i_title_2: e.target.value })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Description</label>
                  <textarea
                    value={settings.demo_i_desc_2}
                    onChange={e => setSettings({ ...settings, demo_i_desc_2: e.target.value })}
                    rows={2}
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Slot 2 Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                      type="text"
                      value={settings.demo_i_img_2}
                      onChange={e => setSettings({ ...settings, demo_i_img_2: e.target.value })}
                      placeholder="e.g. /images/how_food.png"
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', flexGrow: 1, boxSizing: 'border-box' }}
                    />
                    <div style={{ position: 'relative' }}>
                      <input
                        type="file"
                        accept="image/*"
                        id="slot-image-file"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="slot-image-file"
                        className="admin-button outline"
                        style={{ padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'inline-block', fontSize: '13px', margin: 0 }}
                      >
                        {uploadingImg ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  </div>
                  {settings.demo_i_img_2 && (
                    <div style={{ marginTop: '8px', border: '1px dashed var(--admin-border)', padding: '6px', borderRadius: '8px', display: 'inline-block', background: '#fff' }}>
                      <img src={settings.demo_i_img_2} alt="Preview" style={{ maxHeight: '80px', borderRadius: '6px', display: 'block' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>AI Suggestion & Other Tabs</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>AI Suggestion Text</label>
                    <textarea
                      value={settings.demo_i_ai_suggestion}
                      onChange={e => setSettings({ ...settings, demo_i_ai_suggestion: e.target.value })}
                      rows={2}
                      required
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Live Map Tab Placeholder</label>
                      <input
                        type="text"
                        value={settings.demo_map_placeholder}
                        onChange={e => setSettings({ ...settings, demo_map_placeholder: e.target.value })}
                        required
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: '600', fontSize: '12px', color: 'var(--admin-muted)' }}>Support Tab Placeholder</label>
                      <input
                        type="text"
                        value={settings.demo_support_placeholder}
                        onChange={e => setSettings({ ...settings, demo_support_placeholder: e.target.value })}
                        required
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="admin-button"
              style={{ alignSelf: 'flex-start' }}
            >
              {isSavingSettings ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Art of Planning Steps */}
      {activeTab === 'planning_steps' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Planning Steps</h3>
            <button className="admin-button" onClick={() => handleOpenAddModal('planning')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Planning Step
            </button>
          </div>

          {isLoadingSteps ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>Loading...</div>
          ) : planningSteps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>No planning steps found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Step Number</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {planningSteps.map(step => (
                  <tr key={step.id}>
                    <td style={{ fontWeight: '700', color: 'var(--admin-accent)' }}>{step.step_number}</td>
                    <td style={{ fontWeight: '600' }}>{step.title}</td>
                    <td style={{ maxWidth: '400px' }}>{step.description}</td>
                    <td>{step.display_order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="admin-button outline" onClick={() => handleOpenEditModal(step)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}>Edit</button>
                        <button className="admin-button outline" onClick={() => handleDeleteStep(step.id)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Walkthrough steps */}
      {activeTab === 'how_steps' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Walkthrough Steps</h3>
            <button className="admin-button" onClick={() => handleOpenAddModal('how')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Timeline Step
            </button>
          </div>

          {isLoadingSteps ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>Loading...</div>
          ) : howSteps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>No timeline steps found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Step Number</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {howSteps.map(step => (
                  <tr key={step.id}>
                    <td style={{ fontWeight: '700', color: 'var(--admin-accent)' }}>{step.step_number}</td>
                    <td style={{ fontWeight: '600' }}>{step.title}</td>
                    <td style={{ maxWidth: '400px' }}>{step.description}</td>
                    <td>{step.display_order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="admin-button outline" onClick={() => handleOpenEditModal(step)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}>Edit</button>
                        <button className="admin-button outline" onClick={() => handleDeleteStep(step.id)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Popup for Add/Edit Steps */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '450px', padding: '32px', margin: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {isEditMode ? 'Edit Step' : 'Add Step'} ({modalType === 'planning' ? 'Planning' : 'Walkthrough'})
            </h3>

            {modalError && (
              <div className="badge danger" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveStep} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Step Indicator (e.g. 01)</label>
                  <input
                    type="text"
                    value={currentStep.step_number || ''}
                    onChange={e => setCurrentStep({ ...currentStep, step_number: e.target.value })}
                    placeholder="01"
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Display Order</label>
                  <input
                    type="number"
                    value={currentStep.display_order ?? 0}
                    onChange={e => setCurrentStep({ ...currentStep, display_order: parseInt(e.target.value) || 0 })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Step Title</label>
                <input
                  type="text"
                  value={currentStep.title || ''}
                  onChange={e => setCurrentStep({ ...currentStep, title: e.target.value })}
                  placeholder="Step title"
                  required
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Description / Subtext</label>
                <textarea
                  value={currentStep.description || ''}
                  onChange={e => setCurrentStep({ ...currentStep, description: e.target.value })}
                  rows={4}
                  placeholder="Explain this step..."
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                />
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
                  disabled={isSavingStep}
                  className="admin-button"
                  style={{ padding: '10px 20px', borderRadius: '10px' }}
                >
                  {isSavingStep ? 'Saving...' : 'Save Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
