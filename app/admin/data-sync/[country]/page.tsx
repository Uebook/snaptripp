'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ViewCountryData() {
    const params = useParams()
    const router = useRouter()
    const country = decodeURIComponent(params.country as string)
    const [places, setPlaces] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [editingPlace, setEditingPlace] = useState<any>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        fetchPlaces()
    }, [country])

    const fetchPlaces = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/sync/places?country=${encodeURIComponent(country)}`)
            const data = await res.json()
            if (data.success) {
                setPlaces(data.data)
            }
        } catch (err) {
            console.error('Failed to fetch places', err)
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

    const filteredPlaces = places.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="admin-dashboard">
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link href="/admin/data-sync" className="admin-button outline" style={{ padding: '8px 12px' }}>
                    ← Back to Sync
                </Link>
                <h2>Synced Data: {country}</h2>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <input
                        className="admin-search"
                        placeholder="Search places, categories..."
                        style={{ width: '300px', margin: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="badge info">{filteredPlaces.length} Places Found</div>
                </div>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
                    <table className="admin-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
                            <tr>
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
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td></tr>
                            ) : filteredPlaces.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No data found for this country.</td></tr>
                            ) : filteredPlaces.map((p, idx) => (
                                <tr key={p.id || idx}>
                                    <td>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'var(--admin-bg)' }}>
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🖼️</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-sidebar)' }}>{p.title}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{p.categoryName || p.subTitle}</div>
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
                                        <div style={{ fontSize: '11px', maxHeight: '60px', overflowY: 'auto' }}>
                                            {p.openingHours_0_day && <div>{p.openingHours_0_day}: {p.openingHours_0_hours}</div>}
                                            {p.openingHours_1_day && <div>{p.openingHours_1_day}: {p.openingHours_1_hours}</div>}
                                            {p.openingHours_2_day && <div style={{ color: 'var(--admin-muted)' }}>+ more days</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
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
                                            <img src={editingPlace.image_url} alt="Preview" style={{ marginTop: '8px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                        )}
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
