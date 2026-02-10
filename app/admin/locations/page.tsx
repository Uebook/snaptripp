'use client'
import { useState } from 'react'

export default function AdminLocations() {
    // Countries State
    const [countries, setCountries] = useState([
        { id: 1, name: 'India', code: 'IN', statesCount: 28 },
        { id: 2, name: 'United States', code: 'US', statesCount: 50 },
    ])
    const [countryForm, setCountryForm] = useState({ name: '', code: '' })
    const [editCountryId, setEditCountryId] = useState<number | null>(null)

    // States State
    const [states, setStates] = useState([
        { id: 1, name: 'Maharashtra', country: 'India', citiesCount: 35 },
        { id: 2, name: 'California', country: 'United States', citiesCount: 480 },
    ])
    const [stateForm, setStateForm] = useState({ name: '', country: '' })
    const [editStateId, setEditStateId] = useState<number | null>(null)

    // Cities State
    const [cities, setCities] = useState([
        { id: 1, name: 'Mumbai', state: 'Maharashtra', country: 'India' },
        { id: 2, name: 'Los Angeles', state: 'California', country: 'United States' },
    ])
    const [cityForm, setCityForm] = useState({ name: '', state: '', country: '' })
    const [editCityId, setEditCityId] = useState<number | null>(null)

    // Handlers for Countries
    const handleSaveCountry = () => {
        if (!countryForm.name || !countryForm.code) return
        if (editCountryId !== null) {
            setCountries(countries.map(c => c.id === editCountryId ? { ...c, ...countryForm } : c))
            setEditCountryId(null)
        } else {
            const newCountry = { id: Date.now(), ...countryForm, statesCount: 0 }
            setCountries([...countries, newCountry])
        }
        setCountryForm({ name: '', code: '' })
    }

    const handleEditCountry = (c: any) => {
        setCountryForm({ name: c.name, code: c.code })
        setEditCountryId(c.id)
    }

    const handleDeleteCountry = (id: number) => {
        setCountries(countries.filter(c => c.id !== id))
    }

    // Handlers for States
    const handleSaveState = () => {
        if (!stateForm.name || !stateForm.country) return
        if (editStateId !== null) {
            setStates(states.map(s => s.id === editStateId ? { ...s, ...stateForm } : s))
            setEditStateId(null)
        } else {
            const newState = { id: Date.now(), ...stateForm, citiesCount: 0 }
            setStates([...states, newState])
        }
        setStateForm({ name: '', country: '' })
    }

    const handleEditState = (s: any) => {
        setStateForm({ name: s.name, country: s.country })
        setEditStateId(s.id)
    }

    const handleDeleteState = (id: number) => {
        setStates(states.filter(s => s.id !== id))
    }

    // Handlers for Cities
    const handleSaveCity = () => {
        if (!cityForm.name || !cityForm.state || !cityForm.country) return
        if (editCityId !== null) {
            setCities(cities.map(c => c.id === editCityId ? { ...c, ...cityForm } : c))
            setEditCityId(null)
        } else {
            const newCity = { id: Date.now(), ...cityForm }
            setCities([...cities, newCity])
        }
        setCityForm({ name: '', state: '', country: '' })
    }

    const handleEditCity = (c: any) => {
        setCityForm({ name: c.name, state: c.state, country: c.country })
        setEditCityId(c.id)
    }

    const handleDeleteCity = (id: number) => {
        setCities(cities.filter(c => c.id !== id))
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-grid">
                {/* Countries Card */}
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3>Countries</h3>
                        <button className="admin-button" onClick={handleSaveCountry}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            {editCountryId !== null ? 'Update Country' : 'Add Country'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <input
                            className="admin-search"
                            placeholder="Name"
                            style={{ flex: 1 }}
                            value={countryForm.name}
                            onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                        />
                        <input
                            className="admin-search"
                            placeholder="Code"
                            style={{ width: '80px' }}
                            value={countryForm.code}
                            onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value })}
                        />
                        {editCountryId !== null && (
                            <button className="admin-button outline" onClick={() => { setEditCountryId(null); setCountryForm({ name: '', code: '' }); }}>Cancel</button>
                        )}
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>States</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countries.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: '600' }}>{c.name}</td>
                                    <td>{c.code}</td>
                                    <td>{c.statesCount}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEditCountry(c)}>Edit</button>
                                            <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--admin-danger)' }} onClick={() => handleDeleteCountry(c.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* States Card */}
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3>States</h3>
                        <button className="admin-button" onClick={handleSaveState}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                            {editStateId !== null ? 'Update State' : 'Add State'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <select
                            className="admin-search"
                            style={{ flex: 1 }}
                            value={stateForm.country}
                            onChange={(e) => setStateForm({ ...stateForm, country: e.target.value })}
                        >
                            <option value="">Country</option>
                            {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <input
                            className="admin-search"
                            placeholder="Name"
                            style={{ flex: 1 }}
                            value={stateForm.name}
                            onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })}
                        />
                        {editStateId !== null && (
                            <button className="admin-button outline" onClick={() => { setEditStateId(null); setStateForm({ name: '', country: '' }); }}>Cancel</button>
                        )}
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Country</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: '600' }}>{s.name}</td>
                                    <td>{s.country}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEditState(s)}>Edit</button>
                                            <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--admin-danger)' }} onClick={() => handleDeleteState(s.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cities Card */}
            <div className="admin-card" style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3>Cities</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            className="admin-search"
                            style={{ width: '150px' }}
                            value={cityForm.country}
                            onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })}
                        >
                            <option value="">Country</option>
                            {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select
                            className="admin-search"
                            style={{ width: '150px' }}
                            value={cityForm.state}
                            onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
                        >
                            <option value="">State</option>
                            {states.filter(s => !cityForm.country || s.country === cityForm.country).map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <input
                            className="admin-search"
                            placeholder="City Name"
                            style={{ width: '200px' }}
                            value={cityForm.name}
                            onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                        />
                        <button className="admin-button" onClick={handleSaveCity}>
                            {editCityId !== null ? 'Update City' : 'Add City'}
                        </button>
                        {editCityId !== null && (
                            <button className="admin-button outline" onClick={() => { setEditCityId(null); setCityForm({ name: '', state: '', country: '' }); }}>Cancel</button>
                        )}
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cities.map(city => (
                            <tr key={city.id}>
                                <td style={{ fontWeight: '600' }}>{city.name}</td>
                                <td>{city.state}</td>
                                <td>{city.country}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEditCity(city)}>Edit</button>
                                        <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--admin-danger)' }} onClick={() => handleDeleteCity(city.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
