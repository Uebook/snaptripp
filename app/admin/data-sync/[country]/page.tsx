'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ViewCountryData() {
    const params = useParams()
    const router = useRouter()
    const country = decodeURIComponent(params.country as string)
    const [places, setPlaces] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [publishedIds, setPublishedIds] = useState<number[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [activeTab, setActiveTab] = useState<'all' | 'published'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [reviewFilter, setReviewFilter] = useState<number | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<string[]>([])
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
    const [editingPlace, setEditingPlace] = useState<any>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setCategoryDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        fetchPlaces()
    }, [country])

    const fetchPlaces = async () => {
        setLoading(true)
        try {
            const [placesRes, publishedRes] = await Promise.all([
                fetch(`/api/admin/sync/places?country=${encodeURIComponent(country)}`),
                fetch(`/api/admin/sync/published-places?country=${encodeURIComponent(country)}`)
            ])
            const placesData = await placesRes.json()
            const publishedData = await publishedRes.json()

            if (placesData.success) {
                setPlaces(placesData.data)
            }
            if (publishedData.success) {
                setPublishedIds(publishedData.data)
            }
        } catch (err) {
            console.error('Failed to fetch data', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return
        }

        try {
            const res = await fetch(`/api/admin/sync/place?id=${id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                alert('Place deleted successfully')
                fetchPlaces() // Refresh the list
            } else {
                alert(`Delete failed: ${data.error}`)
            }
        } catch (err) {
            console.error('Delete failed', err)
            alert('An error occurred during deletion')
        }
    }

    const handleEdit = (place: any) => {
        setEditingPlace(place)
        setShowEditModal(true)
    }

    const handleSaveEdit = async () => {
        if (!editingPlace) return

        try {
            const res = await fetch(`/api/admin/sync/place`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPlace)
            })
            const data = await res.json()
            if (data.success) {
                alert('Place updated successfully')
                setShowEditModal(false)
                setEditingPlace(null)
                fetchPlaces() // Refresh the list
            } else {
                alert(`Update failed: ${data.error}`)
            }
        } catch (err) {
            console.error('Update failed', err)
            alert('An error occurred during update')
        }
    }



    const handleSinglePublish = async (place: any, publish: boolean) => {
        if (!window.confirm(`Are you sure you want to ${publish ? 'publish' : 'unpublish'} "${place.title}"?`)) return
        
        // Optimistic
        if (publish) {
            setPublishedIds(prev => [...prev, place.id])
        } else {
            setPublishedIds(prev => prev.filter(id => id !== place.id))
        }

        try {
            const res = await fetch('/api/admin/sync/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: publish ? 'publish' : 'unpublish',
                    id: place.id,
                    place: publish ? place : undefined
                })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)
        } catch (err) {
            console.error('Publish toggle failed', err)
            if (publish) {
                setPublishedIds(prev => prev.filter(id => id !== place.id))
            } else {
                setPublishedIds(prev => [...prev, place.id])
            }
            alert('Failed to update publish status')
        }
    }

    const handleBulkPublish = async (publish: boolean) => {
        if (selectedIds.length === 0) return

        if (!window.confirm(`Are you sure you want to ${publish ? 'publish' : 'unpublish'} ${selectedIds.length} selected places to the map?`)) return

        const placesToUpdate = places.filter(p => selectedIds.includes(p.id))

        // Optimistic
        if (publish) {
            setPublishedIds(prev => Array.from(new Set([...prev, ...selectedIds])))
        } else {
            setPublishedIds(prev => prev.filter(id => !selectedIds.includes(id)))
        }

        try {
            const res = await fetch('/api/admin/sync/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: publish ? 'publish_bulk' : 'unpublish_bulk',
                    ids: selectedIds,
                    places: publish ? placesToUpdate : undefined
                })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)
            alert(`Successfully ${publish ? 'published' : 'unpublished'} ${selectedIds.length} places.`)
            setSelectedIds([]) // Clear selection
        } catch (err) {
            console.error('Bulk publish failed', err)
            fetchPlaces()
            alert('Bulk update failed. Refreshed data.')
        }
    }

    const uniqueCategories = Array.from(new Set(places.map(p => p.categoryName).filter(Boolean))).sort();

    const canPublishSelected = selectedIds.length > 0 && selectedIds.some(id => !publishedIds.includes(id));
    const canUnpublishSelected = selectedIds.length > 0 && selectedIds.some(id => publishedIds.includes(id));

    const filteredPlaces = places.filter(p => {
        if (activeTab === 'published' && !publishedIds.includes(p.id)) return false;

        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter.length === 0 ? true : categoryFilter.includes(p.categoryName);
        
        const reviews = p.reviewsCount || 0;
        const matchesReviews = reviewFilter === null ? true : reviews >= reviewFilter;

        return matchesSearch && matchesCategory && matchesReviews;
    })

    return (
        <div className="admin-dashboard">
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link href="/admin/data-sync" className="admin-button outline" style={{ padding: '8px 12px' }}>
                    ← Back to Sync
                </Link>
                <h2>Synced Data: {country}</h2>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                        className="admin-button" 
                        style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', opacity: canPublishSelected ? 1 : 0.5, cursor: canPublishSelected ? 'pointer' : 'not-allowed' }} 
                        onClick={() => handleBulkPublish(true)}
                        disabled={!canPublishSelected}
                    >
                        ✓ Publish Selected ({selectedIds.length})
                    </button>
                    <button 
                        className="admin-button outline" 
                        style={{ padding: '8px 12px', color: '#ef4444', borderColor: '#ef4444', opacity: canUnpublishSelected ? 1 : 0.5, cursor: canUnpublishSelected ? 'pointer' : 'not-allowed' }} 
                        onClick={() => handleBulkPublish(false)}
                        disabled={!canUnpublishSelected}
                    >
                        ✕ Unpublish Selected ({selectedIds.length})
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--admin-border)' }}>
                <button 
                    style={{ 
                        padding: '12px 24px', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'all' ? '2px solid var(--admin-accent)' : '2px solid transparent',
                        color: activeTab === 'all' ? 'var(--admin-accent)' : 'var(--admin-muted)',
                        fontWeight: activeTab === 'all' ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '15px'
                    }}
                    onClick={() => setActiveTab('all')}
                >
                    All Scraped Data ({places.length})
                </button>
                <button 
                    style={{ 
                        padding: '12px 24px', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'published' ? '2px solid var(--admin-accent)' : '2px solid transparent',
                        color: activeTab === 'published' ? 'var(--admin-accent)' : 'var(--admin-muted)',
                        fontWeight: activeTab === 'published' ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '15px'
                    }}
                    onClick={() => setActiveTab('published')}
                >
                    Published to Map ({publishedIds.length})
                </button>
            </div>
            
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '150px' }} ref={dropdownRef}>
                        <div 
                            className="admin-search" 
                            style={{ margin: 0, width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '40px' }}
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>
                                {categoryFilter.length === 0 
                                    ? 'All Categories' 
                                    : `${categoryFilter.length} Selected`}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--admin-muted)' }}>▼</span>
                        </div>
                        
                        {categoryDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: '#fff',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '12px',
                                marginTop: '4px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                zIndex: 100,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <label style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, background: categoryFilter.length === 0 ? 'var(--admin-bg)' : 'transparent' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={categoryFilter.length === 0} 
                                        onChange={() => setCategoryFilter([])} 
                                    />
                                    <span>All Categories</span>
                                </label>
                                {uniqueCategories.map((cat: any) => (
                                    <label key={cat} style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, background: categoryFilter.includes(cat) ? 'var(--admin-bg)' : 'transparent' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={categoryFilter.includes(cat)} 
                                            onChange={() => {
                                                if (categoryFilter.includes(cat)) {
                                                    setCategoryFilter(categoryFilter.filter(c => c !== cat))
                                                } else {
                                                    setCategoryFilter([...categoryFilter, cat])
                                                }
                                            }}
                                        />
                                        <span>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <select
                        className="admin-search"
                        style={{ flex: 1, minWidth: '150px', margin: 0, width: '100%' }}
                        value={reviewFilter || ''}
                        onChange={(e) => setReviewFilter(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Reviews</option>
                        <option value="100">100+ Reviews</option>
                        <option value="200">200+ Reviews</option>
                        <option value="300">300+ Reviews</option>
                        <option value="400">400+ Reviews</option>
                        <option value="500">500+ Reviews</option>
                        <option value="600">600+ Reviews</option>
                        <option value="700">700+ Reviews</option>
                        <option value="800">800+ Reviews</option>
                        <option value="900">900+ Reviews</option>
                        <option value="1000">1000+ Reviews</option>
                    </select>

                    <input
                        className="admin-search"
                        placeholder="Search places, categories..."
                        style={{ flex: 1, minWidth: '150px', margin: 0, width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="badge info" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{filteredPlaces.length} Places Found</div>
                </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <table className="admin-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
                            <tr>
                                <th style={{ width: '60px', textAlign: 'center' }}>
                                    <input 
                                        type="checkbox"
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        checked={filteredPlaces.length > 0 && selectedIds.length === filteredPlaces.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(filteredPlaces.map(p => p.id))
                                            } else {
                                                setSelectedIds([])
                                            }
                                        }}
                                    />
                                </th>
                                <th style={{ width: '80px' }}>Image</th>
                                <th>Title & Category</th>
                                <th>Location</th>
                                <th>Contact & Web</th>
                                <th>Features (Accessibility/Kids/etc)</th>
                                <th>Opening Hours</th>
                                <th style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td></tr>
                            ) : filteredPlaces.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>No data found for this country.</td></tr>
                            ) : filteredPlaces.map((p, idx) => (
                                <tr key={p.id || idx}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            checked={selectedIds.includes(p.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIds(prev => [...prev, p.id])
                                                } else {
                                                    setSelectedIds(prev => prev.filter(id => id !== p.id))
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'var(--admin-bg)' }}>
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.title} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🖼️</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {p.title}
                                            {publishedIds.includes(p.id) && (
                                                <span className="badge success" style={{ fontSize: '9px', padding: '2px 6px' }}>Published</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{p.categoryName || p.subTitle}</div>
                                        <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', fontWeight: 'bold' }}>
                                            ⭐ {p.totalScore || 'N/A'} ({p.reviewsCount || 0} reviews)
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>{p.city}, {p.address}</div>
                                        {p.location_lat && (
                                            <div style={{ fontSize: '10px', color: 'var(--admin-muted)', marginTop: '4px' }}>
                                                {p.location_lat}, {p.location_lng}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>{p.phone || 'No Phone'}</div>
                                        {p.website && (
                                            <a href={p.website} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--admin-accent)', textDecoration: 'underline' }}>
                                                Visit Website
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {p.ai_Acc_0_entrance && <span className="badge success" style={{ fontSize: '9px' }}>♿ Entrance</span>}
                                            {p.ai_Acc_0_parking && <span className="badge success" style={{ fontSize: '9px' }}>🚗 Parking</span>}
                                            {p.ai_Chld_0_kids && <span className="badge info" style={{ fontSize: '9px' }}>🧒 Kids</span>}
                                            {p.ai_Pets_0_dogs && <span className="badge warning" style={{ fontSize: '9px' }}>🐶 Dogs</span>}
                                            {p.ai_Crwd_0_lgbtq && <span className="badge info" style={{ fontSize: '9px' }}>🌈 LGBTQ+</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '11px', maxHeight: '80px', overflowY: 'auto' }}>
                                            {p.stay_time && <div style={{ marginBottom: '4px', fontWeight: '600', color: 'var(--admin-accent)' }}>Stay: {p.stay_time}</div>}
                                            {p.openingHours_0_day && <div>{p.openingHours_0_day}: {p.openingHours_0_hours}</div>}
                                            {p.openingHours_1_day && <div>{p.openingHours_1_day}: {p.openingHours_1_hours}</div>}
                                            {p.openingHours_2_day && <div style={{ color: 'var(--admin-muted)' }}>+ more days</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                                            {activeTab === 'published' ? (
                                                <button
                                                    className="admin-button outline"
                                                    style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: '#ef4444', width: '100%' }}
                                                    onClick={() => handleSinglePublish(p, false)}
                                                >
                                                    ✕ Unpublish
                                                </button>
                                            ) : (
                                                <button
                                                    className="admin-button outline"
                                                    style={{ 
                                                        padding: '4px 8px', 
                                                        fontSize: '11px', 
                                                        color: publishedIds.includes(p.id) ? 'var(--admin-muted)' : '#10b981', 
                                                        borderColor: publishedIds.includes(p.id) ? 'var(--admin-border)' : '#10b981', 
                                                        width: '100%',
                                                        background: publishedIds.includes(p.id) ? 'var(--admin-bg)' : 'transparent',
                                                        cursor: publishedIds.includes(p.id) ? 'not-allowed' : 'pointer'
                                                    }}
                                                    onClick={() => !publishedIds.includes(p.id) && handleSinglePublish(p, true)}
                                                    disabled={publishedIds.includes(p.id)}
                                                >
                                                    {publishedIds.includes(p.id) ? '✓ Published' : '✓ Publish'}
                                                </button>
                                            )}
                                            <button
                                                className="admin-button outline"
                                                style={{ padding: '4px 8px', fontSize: '11px', width: '100%' }}
                                                onClick={() => handleEdit(p)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="admin-button outline"
                                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--admin-danger)', width: '100%' }}
                                                onClick={() => handleDelete(p.id, p.title)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingPlace && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="admin-card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '20px' }}>Edit Place: {editingPlace.title}</h3>

                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Basic Information */}
                            <div>
                                <h4 style={{ marginBottom: '12px', color: 'var(--admin-accent)', borderBottom: '2px solid var(--admin-accent)', paddingBottom: '6px' }}>📋 Basic Information</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Title</label>
                                        <input
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0 }}
                                            value={editingPlace.title || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, title: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Category</label>
                                            <input
                                                className="admin-search"
                                                style={{ width: '100%', margin: 0 }}
                                                value={editingPlace.categoryName || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, categoryName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Subtitle</label>
                                            <input
                                                className="admin-search"
                                                style={{ width: '100%', margin: 0 }}
                                                value={editingPlace.subTitle || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, subTitle: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Description</label>
                                        <textarea
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0, minHeight: '80px', fontFamily: 'inherit' }}
                                            value={editingPlace.description || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Image URL</label>
                                        <input
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0 }}
                                            value={editingPlace.image_url || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, image_url: e.target.value })}
                                        />
                                        {editingPlace.image_url && (
                                            <img src={editingPlace.image_url} alt="Preview" referrerPolicy="no-referrer" style={{ marginTop: '8px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Stay Time / Duration</label>
                                        <input
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0 }}
                                            placeholder="e.g., 2-3 hours, Half day"
                                            value={editingPlace.stay_time || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, stay_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div>
                                <h4 style={{ marginBottom: '12px', color: 'var(--admin-accent)', borderBottom: '2px solid var(--admin-accent)', paddingBottom: '6px' }}>📍 Location</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>City</label>
                                            <input
                                                className="admin-search"
                                                style={{ width: '100%', margin: 0 }}
                                                value={editingPlace.city || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, city: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Postal Code</label>
                                            <input
                                                className="admin-search"
                                                style={{ width: '100%', margin: 0 }}
                                                value={editingPlace.postalCode || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, postalCode: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Address</label>
                                        <input
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0 }}
                                            value={editingPlace.address || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, address: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Latitude</label>
                                            <input
                                                className="admin-search"
                                                type="number"
                                                step="any"
                                                style={{ width: '100%', margin: 0 }}
                                                value={editingPlace.location_lat || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, location_lat: parseFloat(e.target.value) || null })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Longitude</label>
                                            <input
                                                className="admin-search"
                                                type="number"
                                                step="any"
                                                style={{ width: '100%', margin: 0 }}
                                                value={editingPlace.location_lng || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, location_lng: parseFloat(e.target.value) || null })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h4 style={{ marginBottom: '12px', color: 'var(--admin-accent)', borderBottom: '2px solid var(--admin-accent)', paddingBottom: '6px' }}>📞 Contact</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Phone</label>
                                        <input
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0 }}
                                            value={editingPlace.phone || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Website</label>
                                        <input
                                            className="admin-search"
                                            style={{ width: '100%', margin: 0 }}
                                            value={editingPlace.website || ''}
                                            onChange={(e) => setEditingPlace({ ...editingPlace, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div>
                                <h4 style={{ marginBottom: '12px', color: 'var(--admin-accent)', borderBottom: '2px solid var(--admin-accent)', paddingBottom: '6px' }}>🕐 Opening Hours</h4>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {[0, 1, 2, 3, 4, 5, 6].map(idx => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
                                            <input
                                                className="admin-search"
                                                placeholder="Day"
                                                style={{ width: '100%', margin: 0, fontSize: '12px' }}
                                                value={editingPlace[`openingHours_${idx}_day`] || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, [`openingHours_${idx}_day`]: e.target.value })}
                                            />
                                            <input
                                                className="admin-search"
                                                placeholder="Hours (e.g., 9:00 AM - 5:00 PM)"
                                                style={{ width: '100%', margin: 0, fontSize: '12px' }}
                                                value={editingPlace[`openingHours_${idx}_hours`] || ''}
                                                onChange={(e) => setEditingPlace({ ...editingPlace, [`openingHours_${idx}_hours`]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <h4 style={{ marginBottom: '12px', color: 'var(--admin-accent)', borderBottom: '2px solid var(--admin-accent)', paddingBottom: '6px' }}>✨ Features</h4>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {/* Accessibility */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>♿ Accessibility</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                            {['entrance', 'parking', 'restroom'].map(feature => (
                                                <div key={feature} style={{ padding: '8px', background: 'var(--admin-bg)', borderRadius: '6px' }}>
                                                    <label style={{ fontSize: '12px', textTransform: 'capitalize', display: 'block', marginBottom: '4px' }}>{feature}</label>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {[0, 1, 2, 3, 4].map(idx => (
                                                            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingPlace[`ai_Acc_${idx}_${feature}`] || false}
                                                                    onChange={(e) => setEditingPlace({ ...editingPlace, [`ai_Acc_${idx}_${feature}`]: e.target.checked })}
                                                                />
                                                                {idx + 1}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Kids */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>🧒 Good for Kids</label>
                                        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--admin-bg)', borderRadius: '6px' }}>
                                            {[0, 1, 2, 3].map(idx => (
                                                <label key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlace[`ai_Chld_${idx}_kids`] || false}
                                                        onChange={(e) => setEditingPlace({ ...editingPlace, [`ai_Chld_${idx}_kids`]: e.target.checked })}
                                                    />
                                                    Option {idx + 1}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* LGBTQ+ */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>🌈 LGBTQ+ Friendly</label>
                                        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--admin-bg)', borderRadius: '6px' }}>
                                            {[0, 1, 2, 3].map(idx => (
                                                <label key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlace[`ai_Crwd_${idx}_lgbtq`] || false}
                                                        onChange={(e) => setEditingPlace({ ...editingPlace, [`ai_Crwd_${idx}_lgbtq`]: e.target.checked })}
                                                    />
                                                    Option {idx + 1}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pets */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>🐶 Dog Friendly</label>
                                        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--admin-bg)', borderRadius: '6px' }}>
                                            {[0, 1, 2].map(idx => (
                                                <label key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlace[`ai_Pets_${idx}_dogs`] || false}
                                                        onChange={(e) => setEditingPlace({ ...editingPlace, [`ai_Pets_${idx}_dogs`]: e.target.checked })}
                                                    />
                                                    Option {idx + 1}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Planning/Tickets */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>🎫 Tickets/Planning</label>
                                        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--admin-bg)', borderRadius: '6px' }}>
                                            {[0, 1, 2, 3].map(idx => (
                                                <label key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlace[`ai_Plan_${idx}_tickets`] || false}
                                                        onChange={(e) => setEditingPlace({ ...editingPlace, [`ai_Plan_${idx}_tickets`]: e.target.checked })}
                                                    />
                                                    Option {idx + 1}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                            <button
                                className="admin-button outline"
                                onClick={() => {
                                    setShowEditModal(false)
                                    setEditingPlace(null)
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-button"
                                onClick={handleSaveEdit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
