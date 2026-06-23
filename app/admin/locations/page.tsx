'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const ITEMS_PER_PAGE = 10

export default function AdminLocations() {
    // Countries State
    const [countries, setCountries] = useState<any[]>([])
    const [countryCount, setCountryCount] = useState(0)
    const [countryPage, setCountryPage] = useState(0)
    const [countrySearch, setCountrySearch] = useState('')
    const [countryForm, setCountryForm] = useState({ name: '', iso2: '', phone_code: '' })
    const [editCountryId, setEditCountryId] = useState<number | null>(null)
    const [isLoadingCountries, setIsLoadingCountries] = useState(false)

    // Cities State
    const [cities, setCities] = useState<any[]>([])
    const [cityCount, setCityCount] = useState(0)
    const [cityPage, setCityPage] = useState(0)
    const [citySearch, setCitySearch] = useState('')
    const [cityForm, setCityForm] = useState({ name: '', country_id: '', latitude: '', longitude: '' })
    const [editCityId, setEditCityId] = useState<number | null>(null)
    const [isLoadingCities, setIsLoadingCities] = useState(false)

    // All Countries for selects
    const [allCountriesList, setAllCountriesList] = useState<any[]>([])

    // Load static data for dropdowns
    useEffect(() => {
        const loadDropdownData = async () => {
            const { data: cData } = await supabase.from('countries').select('id, name').order('name')
            if (cData) setAllCountriesList(cData)
        }
        loadDropdownData()
    }, [])

    // Fetch Countries
    const fetchCountries = useCallback(async () => {
        setIsLoadingCountries(true)
        try {
            let query = supabase.from('countries').select('*', { count: 'exact' })

            if (countrySearch) {
                query = query.ilike('name', `%${countrySearch}%`)
            }

            const from = countryPage * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, count, error } = await query
                .order('name')
                .range(from, to)

            if (error) throw error
            setCountries(data || [])
            setCountryCount(count || 0)
        } catch (err) {
            console.error('Fetch countries error:', err)
        } finally {
            setIsLoadingCountries(false)
        }
    }, [countryPage, countrySearch])

    // Fetch Cities
    const fetchCities = useCallback(async () => {
        setIsLoadingCities(true)
        try {
            let query = supabase.from('cities').select('*, countries(name)', { count: 'exact' })

            if (citySearch) {
                query = query.ilike('name', `%${citySearch}%`)
            }

            const from = cityPage * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, count, error } = await query
                .order('name')
                .range(from, to)

            if (error) throw error
            setCities(data || [])
            setCityCount(count || 0)
        } catch (err) {
            console.error('Fetch cities error:', err)
        } finally {
            setIsLoadingCities(false)
        }
    }, [cityPage, citySearch])

    useEffect(() => { fetchCountries() }, [fetchCountries])
    useEffect(() => { fetchCities() }, [fetchCities])

    // Handlers for Countries
    const handleSaveCountry = async () => {
        if (!countryForm.name || !countryForm.iso2) return
        try {
            if (editCountryId !== null) {
                const { error } = await supabase.from('countries').update(countryForm).eq('id', editCountryId)
                if (error) throw error
                setEditCountryId(null)
            } else {
                const { error } = await supabase.from('countries').insert([{ ...countryForm, id: Date.now() % 2147483647 }])
                if (error) throw error
            }
            setCountryForm({ name: '', iso2: '', phone_code: '' })
            fetchCountries()
        } catch (err: any) { alert(err.message) }
    }

    const handleDeleteCountry = async (id: number) => {
        if (!confirm('Are you sure you want to delete this country and its associated states and cities?')) return
        const { error } = await supabase.from('countries').delete().eq('id', id)
        if (error) alert(error.message)
        else fetchCountries()
    }


    // Handlers for Cities
    const handleSaveCity = async () => {
        if (!cityForm.name || !cityForm.country_id) return
        try {
            const payload = {
                ...cityForm,
                latitude: cityForm.latitude ? parseFloat(cityForm.latitude) : null,
                longitude: cityForm.longitude ? parseFloat(cityForm.longitude) : null
            }
            if (editCityId !== null) {
                const { error } = await supabase.from('cities').update(payload).eq('id', editCityId)
                if (error) throw error
                setEditCityId(null)
            } else {
                const { error } = await supabase.from('cities').insert([{ ...payload, id: Date.now() % 2147483647 }])
                if (error) throw error
            }
            setCityForm({ name: '', country_id: '', latitude: '', longitude: '' })
            fetchCities()
        } catch (err: any) { alert(err.message) }
    }

    const handleDeleteCity = async (id: number) => {
        if (!confirm('Delete this city?')) return
        const { error } = await supabase.from('cities').delete().eq('id', id)
        if (error) alert(error.message)
        else fetchCities()
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-grid">
                {/* Countries Card */}
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3>Countries ({countryCount})</h3>
                            <div style={{ marginTop: '8px' }}>
                                <input
                                    className="admin-search"
                                    placeholder="Search Countries..."
                                    value={countrySearch}
                                    onChange={(e) => { setCountrySearch(e.target.value); setCountryPage(0); }}
                                    style={{ width: '200px', fontSize: '13px' }}
                                />
                            </div>
                        </div>
                        <button className="admin-button" onClick={handleSaveCountry}>
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
                            placeholder="ISO2"
                            style={{ width: '60px' }}
                            value={countryForm.iso2}
                            onChange={(e) => setCountryForm({ ...countryForm, iso2: e.target.value })}
                        />
                        {editCountryId !== null && (
                            <button className="admin-button outline" onClick={() => { setEditCountryId(null); setCountryForm({ name: '', iso2: '', phone_code: '' }); }}>Cancel</button>
                        )}
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>ISO2</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingCountries ? <tr><td colSpan={3}>Loading...</td></tr> : countries.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: '600' }}>{c.name} {c.emoji}</td>
                                    <td>{c.iso2}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="admin-button outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => { setEditCountryId(c.id); setCountryForm({ name: c.name, iso2: c.iso2, phone_code: c.phone_code }); }}>Edit</button>
                                            <button className="admin-button outline" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--admin-danger)' }} onClick={() => handleDeleteCountry(c.id)}>Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                        <button className="admin-button outline" disabled={countryPage === 0} onClick={() => setCountryPage(p => p - 1)}>Prev</button>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>Page {countryPage + 1} of {Math.ceil(countryCount / ITEMS_PER_PAGE)}</span>
                        <button className="admin-button outline" disabled={(countryPage + 1) * ITEMS_PER_PAGE >= countryCount} onClick={() => setCountryPage(p => p + 1)}>Next</button>
                    </div>
                </div>


            </div>

            {/* Cities Card */}
            <div className="admin-card" style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3>Cities ({cityCount})</h3>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                                className="admin-search"
                                placeholder="Search Cities..."
                                value={citySearch}
                                onChange={(e) => { setCitySearch(e.target.value); setCityPage(0); }}
                                style={{ width: '200px' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '600px' }}>
                        <select
                            className="admin-search"
                            style={{ width: '130px' }}
                            value={cityForm.country_id}
                            onChange={(e) => setCityForm({ ...cityForm, country_id: e.target.value })}
                        >
                            <option value="">Country</option>
                            {allCountriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input
                            className="admin-search"
                            placeholder="City Name"
                            style={{ width: '150px' }}
                            value={cityForm.name}
                            onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                        />
                        <button className="admin-button" onClick={handleSaveCity}>
                            {editCityId !== null ? 'Update City' : 'Add City'}
                        </button>
                        {editCityId !== null && (
                            <button className="admin-button outline" onClick={() => { setEditCityId(null); setCityForm({ name: '', country_id: '', latitude: '', longitude: '' }); }}>Cancel</button>
                        )}
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>City</th>
                            <th>Country</th>
                            <th>Coordinates</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingCities ? <tr><td colSpan={4}>Loading...</td></tr> : cities.map(city => (
                            <tr key={city.id}>
                                <td style={{ fontWeight: '600' }}>{city.name}</td>
                                <td>{city.countries?.name}</td>
                                <td style={{ fontSize: '11px', color: '#64748b' }}>{city.latitude}, {city.longitude}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => {
                                            setEditCityId(city.id);
                                            setCityForm({
                                                name: city.name,
                                                country_id: city.country_id?.toString() || '',
                                                latitude: city.latitude?.toString() || '',
                                                longitude: city.longitude?.toString() || ''
                                            });
                                        }}>Edit</button>
                                        <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--admin-danger)' }} onClick={() => handleDeleteCity(city.id)}>Del</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                    <button className="admin-button outline" disabled={cityPage === 0} onClick={() => setCityPage(p => p - 1)}>Prev</button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>Page {cityPage + 1} of {Math.ceil(cityCount / ITEMS_PER_PAGE)}</span>
                    <button className="admin-button outline" disabled={(cityPage + 1) * ITEMS_PER_PAGE >= cityCount} onClick={() => setCityPage(p => p + 1)}>Next</button>
                </div>
            </div>
        </div>
    )
}
