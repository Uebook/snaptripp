'use client'
import { useState, useEffect, useCallback } from 'react'

// Popular travel destination countries
const COUNTRY_LIST = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
    'Brazil', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba',
    'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hong Kong',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan', 'Kenya', 'South Korea', 'Laos', 'Malaysia', 'Maldives', 'Mexico',
    'Morocco', 'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Norway', 'Pakistan', 'Peru',
    'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa',
    'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Tanzania', 'Thailand', 'Turkey',
    'UAE', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam', 'Zimbabwe'
];

const PREDEFINED_CITIES: { [key: string]: string[] } = {
    'Ireland': ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny', 'Sligo', 'Killarney', 'Tralee', 'Wexford'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Bristol', 'Oxford', 'Cambridge', 'Belfast'],
    'USA': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Seattle', 'Washington DC', 'Boston', 'Austin'],
    'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Strasbourg', 'Lille', 'Toulouse', 'Nantes', 'Cannes'],
    'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Bologna', 'Verona', 'Genoa', 'Palermo'],
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Dresden', 'Leipzig', 'Stuttgart', 'Nuremberg', 'Bonn'],
    'Spain': ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Malaga', 'Bilbao', 'Palma de Mallorca', 'Granada', 'San Sebastian', 'Alicante'],
    'Greece': ['Athens', 'Thessaloniki', 'Heraklion', 'Rhodes Town', 'Chania', 'Corfu Town', 'Santorini', 'Mykonos', 'Patras', 'Nafplio'],
    'Portugal': ['Lisbon', 'Porto', 'Faro', 'Sintra', 'Coimbra', 'Braga', 'Evora', 'Lagos', 'Cascais', 'Aveiro'],
    'Finland': ['Helsinki', 'Rovaniemi', 'Tampere', 'Turku', 'Oulu', 'Espoo', 'Vantaa', 'Lahti', 'Kuopio', 'Porvoo'],
    'India': ['Mumbai', 'New Delhi', 'Bangalore', 'Goa', 'Jaipur', 'Udaipur', 'Kolkata', 'Chennai', 'Hyderabad', 'Varanasi', 'Kochi', 'Agra'],
    'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Fujairah', 'Ras Al Khaimah'],
    'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Hua Hin'],
    'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo', 'Fukuoka', 'Nara', 'Hiroshima', 'Okinawa'],
    'Singapore': ['Singapore'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Cairns', 'Gold Coast', 'Canberra'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Quebec City', 'Victoria', 'Whistler'],
    'Mexico': ['Mexico City', 'Cancun', 'Playa del Carmen', 'Puerto Vallarta', 'Tulum', 'Guadalajara', 'Cabo San Lucas']
};

export default function AdminDataSync() {
    // Add animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    // Countries to manage for syncing
    const [syncCountries, setSyncCountries] = useState<any[]>([])
    const [newCountryName, setNewCountryName] = useState('')
    const [syncingId, setSyncingId] = useState<number | null>(null)
    const [progress, setProgress] = useState<{ [key: number]: number }>({})

    // City selection state
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [customCountry, setCustomCountry] = useState('')
    const [cities, setCities] = useState<any[]>([])
    const [selectedCities, setSelectedCities] = useState<{name: string, lat: string, lng: string, radius: string}[]>([])
    const [manualCity, setManualCity] = useState('')
    const [isLoadingCities, setIsLoadingCities] = useState(false)


    const loadExistingCountries = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/sync/countries')
            const data = await res.json()
            if (data.success && data.countries.length > 0) {
                const countryList = data.countries.map((name: string, idx: number) => ({
                    id: idx + 1,
                    name: name,
                    status: 'Checking...',
                    count: 0,
                    loading: false
                }))
                setSyncCountries(countryList)
                // Check status for each
                countryList.forEach((c: any) => checkSyncStatus(c.id, c.name))
            }
        } catch (err) {
            console.error('Failed to load existing countries', err)
        }
    }, [])

    const loadCities = async (country: string) => {
        setIsLoadingCities(true)
        setSelectedCities([])
        try {
            const res = await fetch(`/api/planner/cities?country=${encodeURIComponent(country)}`)
            const data = await res.json()

            let dbCities = data.success ? data.cities : []
            const predefined = PREDEFINED_CITIES[country] || []

            // Merge: start with DB cities, then add predefined if they don't already exist
            const merged = [...dbCities]
            predefined.forEach(cityName => {
                if (!dbCities.some((c: any) => c.name.toLowerCase() === cityName.toLowerCase())) {
                    merged.push({ name: cityName, lat: null, lng: null })
                }
            })

            setCities(merged.sort((a, b) => a.name.localeCompare(b.name)))
        } catch (err) {
            console.error('Failed to load cities', err)
            // Fallback to predefined only if fetch fails
            const predefined = PREDEFINED_CITIES[country] || []
            setCities(predefined.map(name => ({ name, lat: null, lng: null })).sort((a, b) => a.name.localeCompare(b.name)))
        } finally {
            setIsLoadingCities(false)
        }
    }

    const checkSyncStatus = async (id: number, country: string) => {
        updateCountryState(id, { loading: true, status: 'Checking...' })
        try {
            const res = await fetch(`/api/admin/sync/check?country=${encodeURIComponent(country)}`)
            const data = await res.json()
            updateCountryState(id, {
                loading: false,
                status: data.synced ? 'Synced' : 'Not Synced',
                count: data.count || 0,
                cities: data.cities || []
            })
        } catch (err) {
            console.error('Check sync failed', err)
            updateCountryState(id, { loading: false, status: 'Error' })
        }
    }

    const updateCountryState = (id: number, updates: any) => {
        setSyncCountries(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    }

    const handleCountrySelect = (country: string) => {
        setSelectedCountry(country)
        if (country) {
            loadCities(country)
        } else {
            setCities([])
        }
    }

    const handleCityToggle = (cityName: string) => {
        setSelectedCities(prev =>
            prev.some(c => c.name === cityName)
                ? prev.filter(c => c.name !== cityName)
                : [...prev, { name: cityName, lat: '', lng: '', radius: '25' }]
        )
    }

    const handleAddManualCity = () => {
        if (manualCity && !selectedCities.some(c => c.name === manualCity)) {
            setSelectedCities([...selectedCities, { name: manualCity, lat: '', lng: '', radius: '25' }])
            setManualCity('')
        }
    }

    const handleSync = async (id: number, country: string, specificCities?: {name: string, lat: string, lng: string, radius: string}[]) => {
        // Ensure the country is in the tracking list for visual feedback
        const exists = syncCountries.find(c => c.name === country)
        if (!exists) {
            const newEntry = {
                id: id,
                name: country,
                status: 'Syncing...',
                count: 0,
                loading: true
            }
            setSyncCountries(prev => [newEntry, ...prev])
        } else {
            updateCountryState(id, { status: 'Syncing...' })
        }

        setSyncingId(id)
        setProgress(prev => ({ ...prev, [id]: 0 }))

        // Start a fake progress interval
        const interval = setInterval(() => {
            setProgress(prev => {
                const curr = prev[id] || 0
                if (curr < 95) {
                    const increment = Math.floor(Math.random() * 3) + 1
                    return { ...prev, [id]: Math.min(95, curr + increment) }
                }
                return prev
            })
        }, 800)

        try {
            const res = await fetch('/api/admin/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    country,
                    cities: specificCities?.length ? specificCities : undefined
                })
            })
            const data = await res.json()
            clearInterval(interval)

            if (data.success) {
                setProgress(prev => ({ ...prev, [id]: 100 }))
                setTimeout(() => {
                    alert(data.message)
                    checkSyncStatus(id, country)
                    setProgress(prev => {
                        const newP = { ...prev }
                        delete newP[id]
                        return newP
                    })
                    // Clear selection after success
                    if (specificCities) {
                        setSelectedCities([])
                        setSelectedCountry(null)
                    }
                }, 500)
            } else {
                alert(`Sync failed: ${data.error}`)
                updateCountryState(id, { status: 'Failed' })
            }
        } catch (err) {
            clearInterval(interval)
            console.error('Sync failed', err)
            alert('An error occurred during sync')
            updateCountryState(id, { status: 'Failed' })
        } finally {
            setSyncingId(null)
        }
    }

    useEffect(() => {
        // Load existing countries from database on mount
        loadExistingCountries()
    }, [loadExistingCountries])

    const handleDelete = (id: number) => {
        setSyncCountries(syncCountries.filter(c => c.id !== id))
    }

    const handleDeleteData = async (id: number, country: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete ALL synced places for ${country}? This action cannot be undone.`)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/admin/sync/delete?country=${encodeURIComponent(country)}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                alert(data.message)
                checkSyncStatus(id, country)
            } else {
                alert(`Delete failed: ${data.error}`)
            }
        } catch (err) {
            console.error('Delete failed', err)
            alert('An error occurred during deletion')
        }
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-card" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <h3 style={{ marginBottom: '8px' }}>Refined Data Sync</h3>
                        <p className="card-label" style={{ textTransform: 'none' }}>Select a country and specific cities to perform a deep sync with Apify.</p>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>1. Select Country</label>
                            <select
                                className="admin-search"
                                style={{ width: '100%', padding: '10px 12px', marginBottom: '8px' }}
                                value={COUNTRY_LIST.includes(selectedCountry || '') ? selectedCountry : (selectedCountry ? 'custom' : '')}
                                onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                        handleCountrySelect(customCountry)
                                    } else {
                                        handleCountrySelect(e.target.value)
                                        setCustomCountry('')
                                    }
                                }}
                            >
                                <option value="">Select a country...</option>
                                {COUNTRY_LIST.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                                <option value="custom">Other / Custom</option>
                            </select>
                            {((selectedCountry && !COUNTRY_LIST.includes(selectedCountry)) || selectedCountry === 'custom' || (!COUNTRY_LIST.includes(selectedCountry || '') && selectedCountry !== null)) ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        className="admin-search"
                                        placeholder="Enter custom country..."
                                        style={{ flex: 1, padding: '8px 12px' }}
                                        value={customCountry}
                                        onChange={(e) => {
                                            setCustomCountry(e.target.value)
                                            setSelectedCountry(e.target.value)
                                        }}
                                        onBlur={() => handleCountrySelect(customCountry)}
                                    />
                                </div>
                            ) : null}
                        </div>

                        {selectedCountry && (
                            <div style={{ marginTop: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>2. Select Cities (Top 5-7 recommended)</label>

                                <div style={{ marginBottom: '12px' }}>
                                    <select
                                        className="admin-search"
                                        style={{ width: '100%', padding: '10px 12px' }}
                                        value=""
                                        onChange={(e) => e.target.value && handleCityToggle(e.target.value)}
                                        disabled={isLoadingCities || cities.length === 0}
                                    >
                                        <option value="">Choose from existing cities...</option>
                                        {cities.filter(city => !selectedCities.some(c => c.name === city.name)).map(city => (
                                            <option key={city.name} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCities.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        marginBottom: '16px',
                                        padding: '12px',
                                        background: 'rgba(59, 130, 246, 0.05)',
                                        borderRadius: '8px',
                                        border: '1px dashed rgba(59, 130, 246, 0.3)'
                                    }}>
                                        {selectedCities.map((city, index) => (
                                            <div
                                                key={city.name}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    padding: '12px',
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    background: '#fff',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{city.name}</span>
                                                    <span
                                                        onClick={() => handleCityToggle(city.name)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontSize: '16px',
                                                            lineHeight: '1',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444'
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: '100px' }}>
                                                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Lat (Optional)</label>
                                                        <input 
                                                            className="admin-search" 
                                                            placeholder="e.g. 48.8566" 
                                                            style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                                                            value={city.lat}
                                                            onChange={(e) => {
                                                                const newCities = [...selectedCities];
                                                                newCities[index].lat = e.target.value;
                                                                setSelectedCities(newCities);
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '100px' }}>
                                                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Lng (Optional)</label>
                                                        <input 
                                                            className="admin-search" 
                                                            placeholder="e.g. 2.3522" 
                                                            style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                                                            value={city.lng}
                                                            onChange={(e) => {
                                                                const newCities = [...selectedCities];
                                                                newCities[index].lng = e.target.value;
                                                                setSelectedCities(newCities);
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '100px' }}>
                                                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Radius (km)</label>
                                                        <input 
                                                            className="admin-search" 
                                                            type="number"
                                                            style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                                                            value={city.radius}
                                                            onChange={(e) => {
                                                                const newCities = [...selectedCities];
                                                                newCities[index].radius = e.target.value;
                                                                setSelectedCities(newCities);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <input
                                        className="admin-search"
                                        placeholder="Add city manually..."
                                        style={{ flex: 1, padding: '8px 12px' }}
                                        value={manualCity}
                                        onChange={(e) => setManualCity(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddManualCity()}
                                    />
                                    <button className="admin-button outline" onClick={handleAddManualCity}>Add</button>
                                </div>
                            </div>
                        )}

                        {selectedCountry && (
                            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a8a' }}>Target: {selectedCountry}</span>
                                    {selectedCities.length > 0 && <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '500' }}> • {selectedCities.length} cities selected</span>}
                                </div>
                                <button
                                    className="admin-button"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: syncingId !== null ? 'rgba(59, 130, 246, 0.5)' : 'var(--admin-accent)',
                                        cursor: syncingId !== null ? 'not-allowed' : 'pointer'
                                    }}
                                    disabled={!selectedCountry || selectedCities.length === 0 || syncingId !== null}
                                    onClick={() => {
                                        const countryEntry = syncCountries.find(c => c.name === selectedCountry)
                                        const id = countryEntry ? countryEntry.id : Date.now()
                                        handleSync(id, selectedCountry!, selectedCities)
                                    }}
                                >
                                    {syncingId !== null ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <div className="sync-spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            Syncing... {progress[syncingId] || 0}%
                                        </div>
                                    ) : (
                                        `Sync ${selectedCities.length} Cities in ${selectedCountry}`
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: '1.5', minWidth: '400px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Status Overview</h3>
                        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Country</th>
                                        <th>Status</th>
                                        <th>Places</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {syncCountries.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: '600', padding: '12px 16px' }}>
                                                <div style={{ fontSize: '15px', color: '#1e3a8a' }}>{c.name}</div>
                                                {c.cities && c.cities.length > 0 && (
                                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '400', marginTop: '4px' }}>
                                                        {c.cities.slice(0, 5).map((city: any) => `${city.name} (${city.count})`).join(', ')}
                                                        {c.cities.length > 5 ? '...' : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: c.status === 'Synced' ? 'var(--admin-success)' :
                                                            c.status === 'Syncing...' ? 'var(--admin-accent)' :
                                                                c.status === 'Not Synced' ? 'var(--admin-muted)' : 'var(--admin-danger)'
                                                    }}></div>
                                                    <span className={`badge ${c.status === 'Synced' ? 'success' : c.status === 'Syncing...' ? 'info' : 'warning'}`}>
                                                        {c.status === 'Syncing...' && progress[c.id] !== undefined
                                                            ? `${progress[c.id]}%`
                                                            : c.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{c.count.toLocaleString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <a
                                                        href={`/admin/data-sync/${encodeURIComponent(c.name)}`}
                                                        className="admin-button outline"
                                                        style={{ padding: '6px 10px', fontSize: '12px', textDecoration: 'none' }}
                                                    >
                                                        View
                                                    </a>
                                                    <button
                                                        className="admin-button outline"
                                                        style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--admin-danger)' }}
                                                        onClick={() => c.count > 0 ? handleDeleteData(c.id, c.name) : handleDelete(c.id)}
                                                    >
                                                        Del
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="admin-card" style={{ background: 'var(--admin-sidebar)', color: '#fff' }}>
                <h4 style={{ color: '#fff', marginBottom: '12px' }}>About Sync Process</h4>
                <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Pulling data uses your <strong>Apify API Token</strong> to search Google Maps.</li>
                    <li>Data includes business category, address, phone, website, coordinates, and more.</li>
                    <li>Synchronized data is stored in your <strong>Supabase</strong> &apos;places&apos; table.</li>
                    <li>Updates will refresh existing records to ensure data accuracy.</li>
                </ul>
            </div>
        </div>
    )
}
