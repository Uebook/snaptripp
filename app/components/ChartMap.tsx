'use client'

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/lib/supabase'

// Fix for default marker icon in Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
}

interface CountryStats {
    name: string
    code: string
    intensity: 'corner' | 'thoroughly' | 'bit' | 'visited'
    sightseeing: number
    localPeople: number
    serviceQuality: number
    safety: number
    price: number
    reviews: Array<{
        user: string
        avatar: string
        date: string
        text: string
        rating: number
    }>
}

const intensityColors = {
    corner: '#ffa500',      // Know every corner
    thoroughly: '#ffc107',  // Traveled thoroughly
    bit: '#ffdb58',         // Saw a bit
    visited: '#ffe5b4',     // Visited
    default: 'rgba(255, 255, 255, 0.05)' // Not visited (dark mode adjusted)
}

// Dynamic Stats from DB
interface AggregateStats {
    [countryName: string]: {
        name: string;
        intensity: 'corner' | 'thoroughly' | 'bit' | 'visited';
        sightseeing: number;
        localPeople: number;
        serviceQuality: number;
        safety: number;
        price: number;
        reviewCount: number;
        cityCount: number;
    }
}

function MapResizer() {
    const map = useMap()
    useEffect(() => {
        const resizeMap = () => {
            setTimeout(() => {
                map.invalidateSize()
            }, 100)
        }
        window.addEventListener('resize', resizeMap)
        resizeMap()
        return () => window.removeEventListener('resize', resizeMap)
    }, [map])
    return null
}

export default function ChartMap() {
    const [geoData, setGeoData] = useState<any>(null)
    const [stats, setStats] = useState<AggregateStats>({})
    const [selectedCountry, setSelectedCountry] = useState<CountryStats | null>(null)
    const [showLegend, setShowLegend] = useState(true)

    // Review Form State
    const [reviewText, setReviewText] = useState('')
    const [ratings, setRatings] = useState({
        sightseeing: 0,
        localPeople: 0,
        serviceQuality: 0,
        safety: 0,
        price: 0
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [countryPlaces, setCountryPlaces] = useState<any[]>([])
    const [selectedCities, setSelectedCities] = useState<string[]>([])
    const [customCityInput, setCustomCityInput] = useState('')
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

    // Load places for selected country to display in mini map
    useEffect(() => {
        if (selectedCountry && selectedCountry.name) {
            setCountryPlaces([]);
            setSelectedCities([]);
            setCustomCityInput('');
            setIsCityDropdownOpen(false);
            setReviewText('');
            setRatings({ sightseeing: 0, localPeople: 0, serviceQuality: 0, safety: 0, price: 0 });

            fetch(`/api/planner/places?country=${encodeURIComponent(selectedCountry.name)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.places && data.places.length > 0) {
                        setCountryPlaces(data.places);

                    }
                })
        }
    }, [selectedCountry?.name])

    const handleRatingChange = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }))
    }

    const handleCityToggle = (cityName: string) => {
        if (selectedCities.includes(cityName)) {
            setSelectedCities(prev => prev.filter(c => c !== cityName))
        } else {
            setSelectedCities(prev => [...prev, cityName])
        }
    }


    const handlePostReview = async () => {
        if (!selectedCountry) return;

        if (selectedCities.length === 0) {
            alert("Please select at least one city you visited.");
            return;
        }

        try {
            setIsSubmitting(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert("Please log in to post a review");
                setIsSubmitting(false);
                return;
            }

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    country: selectedCountry.name,
                    selected_cities: selectedCities,
                    sightseeing_rating: ratings.sightseeing,
                    local_people_rating: ratings.localPeople,
                    service_quality_rating: ratings.serviceQuality,
                    safety_rating: ratings.safety,
                    price_rating: ratings.price,
                    review_text: reviewText
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("Review posted successfully!");
                setSelectedCountry(null);

                // Refresh global stats to update map colors and modal defaults
                const statsRes = await fetch('/api/reviews/stats');
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.stats);
            } else {
                alert("Failed to post review: " + data.error);
            }
        } catch (err) {
            console.error("Error posting review:", err);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        // Fetch GeoJSON
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))

        // Fetch Global Stats
        fetch('/api/reviews/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStats(data.stats)
            })
    }, [])

    const onEachCountry = (feature: any, layer: any) => {
        const countryName = feature.properties.ADMIN || feature.properties.name
        const countryStats = stats[countryName]

        layer.setStyle({
            fillColor: countryStats ? intensityColors[countryStats.intensity] : intensityColors.default,
            fillOpacity: countryStats ? 0.8 : 0.3,
            color: 'rgba(255, 255, 255, 0.1)',
            weight: 1
        })

        layer.on({
            mouseover: (e: any) => {
                const l = e.target
                l.setStyle({
                    fillOpacity: 1,
                    weight: 2,
                    color: '#ffc107'
                })
            },
            mouseout: (e: any) => {
                const l = e.target
                l.setStyle({
                    fillOpacity: countryStats ? 0.8 : 0.3,
                    weight: 1,
                    color: 'rgba(255, 255, 255, 0.1)'
                })
            },
            click: async (e: any) => {
                const finalCountryName = countryName || 'Unknown Country';
                const iso2 = feature.properties['ISO3166-1-Alpha-2'] || feature.properties.iso_a2 || '';
                const iso3 = feature.properties['ISO3166-1-Alpha-3'] || feature.properties.iso_a3 || '';

                const baseStats = countryStats || {
                    name: finalCountryName,
                    code: iso2,
                    intensity: 'visited' as const,
                    sightseeing: 0,
                    localPeople: 0,
                    serviceQuality: 0,
                    safety: 0,
                    price: 0,
                    reviews: []
                };

                setSelectedCountry({
                    ...baseStats,
                    code: iso2,
                    reviews: [] // Load these dynamically
                });

                // Fetch real reviews for this country
                try {
                    const res = await fetch(`/api/reviews?country=${encodeURIComponent(finalCountryName)}`);
                    const data = await res.json();
                    if (data.success) {
                        setSelectedCountry(prev => {
                            if (!prev || (prev.name !== finalCountryName)) return prev;
                            return {
                                ...prev,
                                reviews: data.reviews.map((r: any) => ({
                                    user: r.user_id.substring(0, 8),
                                    avatar: `https://i.pravatar.cc/150?u=${r.user_id}`,
                                    date: new Date(r.created_at).toLocaleDateString(),
                                    text: r.review_text,
                                    rating: r.sightseeing_rating
                                }))
                            };
                        });
                    }
                } catch (err) {
                    console.error("Error fetching country reviews:", err);
                }
            }
        })
    }

    return (
        <div className="map-wrapper">
            <div className="map-container-inner">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={2}
                    style={{ height: '100%', width: '100%', background: '#0a192f' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {geoData && (
                        <GeoJSON
                            data={geoData}
                            onEachFeature={onEachCountry}
                        />
                    )}
                    <MapResizer />
                </MapContainer>
            </div>

            {/* Legend - Glassmorphism */}
            <div className={`legend-box ${showLegend ? 'active' : ''}`}>
                <div className="legend-header" onClick={() => setShowLegend(!showLegend)}>
                    <span>Map Legend</span>
                    <span className="toggle-icon">{showLegend ? '▼' : '▲'}</span>
                </div>
                {showLegend && (
                    <div className="legend-items">
                        <div className="legend-item">
                            <div className="color-sq" style={{ background: intensityColors.corner }} />
                            <span>know every corner</span>
                        </div>
                        <div className="legend-item">
                            <div className="color-sq" style={{ background: intensityColors.thoroughly }} />
                            <span>traveled thoroughly</span>
                        </div>
                        <div className="legend-item">
                            <div className="color-sq" style={{ background: intensityColors.bit }} />
                            <span>saw a bit</span>
                        </div>
                        <div className="legend-item">
                            <div className="color-sq" style={{ background: intensityColors.visited }} />
                            <span>visited</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Button */}
            <div className="top-action">
                <button className="flaunt-btn">
                    Flaunt your Global Footprint
                </button>
            </div>

            {/* Detail Modal Overlay - Glassmorphism */}
            {selectedCountry && (
                <div className="modal-overlay" onClick={() => setSelectedCountry(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedCountry(null)}>✕</button>

                        <div className="modal-header">
                            <div className="country-flag">
                                {selectedCountry.code ? (
                                    <img src={`https://flagcdn.com/w160/${selectedCountry.code.toLowerCase()}.png`} alt="" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏳️</div>
                                )}
                            </div>
                            <div className="country-info">
                                <h2 style={{ color: 'white' }}>{selectedCountry.name}</h2>
                                <div className="rating-summary">
                                    Global average rating:
                                    <span>
                                        {' ★'.repeat(Math.round(
                                            (selectedCountry.sightseeing +
                                                selectedCountry.localPeople +
                                                selectedCountry.serviceQuality +
                                                selectedCountry.safety +
                                                selectedCountry.price) / 5 || 0
                                        ))}
                                        {((selectedCountry.sightseeing +
                                            selectedCountry.localPeople +
                                            selectedCountry.serviceQuality +
                                            selectedCountry.safety +
                                            selectedCountry.price) / 5 || 0).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="ratings-section">
                                <h3 style={{ color: '#ffc107', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Category Ratings</h3>
                                <div className="ratings-list">
                                    {[
                                        { label: 'Sightseeing', val: selectedCountry.sightseeing, icon: '🏛️' },
                                        { label: 'Local People', val: selectedCountry.localPeople, icon: '👥' },
                                        { label: 'Service Quality', val: selectedCountry.serviceQuality, icon: '🧼' },
                                        { label: 'Safety', val: selectedCountry.safety, icon: '🛡️' },
                                        { label: 'Price', val: selectedCountry.price, icon: '💰' },
                                    ].map(stat => (
                                        <div key={stat.label} className="rating-row">
                                            <span className="rating-icon">{stat.icon}</span>
                                            <span className="rating-label">{stat.label}</span>
                                            <div className="rating-bar-bg">
                                                <div className="rating-bar-fill" style={{ width: `${(stat.val / 5) * 100}%` }} />
                                            </div>
                                            <span className="rating-val">{stat.val || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="reviews-section">
                                <h3 style={{ color: '#ffc107', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Traveler Reviews ({selectedCountry.reviews.length})</h3>
                                <div className="reviews-list">
                                    {selectedCountry.reviews.length > 0 ? (
                                        selectedCountry.reviews.map((rev, i) => (
                                            <div key={i} className="review-card">
                                                <img src={rev.avatar} alt="" className="user-avatar" />
                                                <div className="review-content">
                                                    <div className="review-header">
                                                        <span className="user-name">{rev.user}</span>
                                                        <div className="stars">{'★'.repeat(rev.rating)}</div>
                                                    </div>
                                                    <div className="review-date">{rev.date}</div>
                                                    <p className="review-text">{rev.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ opacity: 0.5, fontSize: '14px', fontStyle: 'italic' }}>No reviews yet. Be the first to share your experience!</p>
                                    )}
                                </div>
                            </div>

                            <div className="share-form">
                                <h3 style={{ color: '#ffc107', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Share Your Experience</h3>

                                <div className="rating-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px', marginBottom: '25px' }}>
                                    {[
                                        { key: 'sightseeing', label: 'Sightseeing' },
                                        { key: 'localPeople', label: 'Local People' },
                                        { key: 'serviceQuality', label: 'Service Quality' },
                                        { key: 'safety', label: 'Safety' },
                                        { key: 'price', label: 'Price' }
                                    ].map((cat) => (
                                        <div key={cat.key} className="rating-slider-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{cat.label}</span>
                                                <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{(ratings as any)[cat.key] || '-'} / 5</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="5"
                                                value={(ratings as any)[cat.key]}
                                                onChange={(e) => handleRatingChange(cat.key, parseInt(e.target.value))}
                                                className="modern-range-slider"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="manual-city-input-wrapper">
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>What cities did you visit?</p>

                                    <div className="city-input-group" style={{ display: 'flex', gap: '10px', marginBottom: '15px', position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={customCityInput}
                                            onChange={(e) => {
                                                setCustomCityInput(e.target.value)
                                                setIsCityDropdownOpen(true)
                                            }}
                                            onFocus={() => setIsCityDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 200)}
                                            placeholder={`Search cities in ${selectedCountry.name}...`}
                                            className="custom-city-input"
                                        />

                                        {/* Dropdown Menu */}
                                        {isCityDropdownOpen && (
                                            <div className="city-dropdown-menu">
                                                {Array.from(new Set(countryPlaces.map(p => p.city)))
                                                    .filter(city => city && city.toLowerCase().includes(customCityInput.toLowerCase()) && !selectedCities.includes(city))
                                                    .map(city => (
                                                        <div
                                                            key={city}
                                                            className="city-dropdown-item"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCities(prev => [...prev, city]);
                                                                setCustomCityInput('');
                                                                setIsCityDropdownOpen(false);
                                                            }}
                                                        >
                                                            {city}
                                                        </div>
                                                    ))
                                                }
                                                {Array.from(new Set(countryPlaces.map(p => p.city))).filter(city => city && city.toLowerCase().includes(customCityInput.toLowerCase()) && !selectedCities.includes(city)).length === 0 && (
                                                    <div className="city-dropdown-empty">
                                                        {customCityInput.trim() ? "No cities found" : "Type to search cities..."}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedCities.length > 0 && (
                                        <div className="selected-cities-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                                            {selectedCities.map(city => (
                                                <div key={city} className="city-tag">
                                                    {city}
                                                    <button onClick={() => handleCityToggle(city)} className="btn-remove-tag">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>


                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder={`Write your review about ${selectedCountry.name}...`}
                                    className="review-input"
                                />
                                <div className="form-actions">
                                    <button className="btn-cancel" onClick={() => setSelectedCountry(null)}>Cancel</button>
                                    <button
                                        className="btn-post"
                                        onClick={handlePostReview}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Posting...' : 'Post Review'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .map-wrapper {
                    height: 100%;
                    width: 100%;
                    position: relative;
                    background: #0a192f;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .map-container-inner {
                    height: 100%;
                    width: 100%;
                }
                .legend-box {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    z-index: 1000;
                    background: rgba(10, 25, 47, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                    min-width: 200px;
                    color: white;
                    transition: all 0.3s ease;
                }
                .legend-header {
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 0.6);
                }
                .legend-items {
                    padding: 0 15px 15px 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                }
                .color-sq {
                    width: 14px;
                    height: 14px;
                    border-radius: 3px;
                    flex-shrink: 0;
                    box-shadow: 0 0 10px rgba(0,0,0,0.2);
                }
                .top-action {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                .flaunt-btn {
                    background: #ffc107;
                    color: #000;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 14px;
                    box-shadow: 0 8px 20px rgba(255,193,7,0.3);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .flaunt-btn:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 12px 25px rgba(255,193,7,0.4);
                }
                
                .modal-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 1001;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }
                .modal-content {
                    background: rgba(10, 25, 47, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: 100%;
                    max-width: 750px;
                    max-height: 90vh;
                    border-radius: 32px;
                    overflow-y: auto;
                    position: relative;
                    padding: 45px;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
                    color: white;
                }
                .modal-content::-webkit-scrollbar { width: 6px; }
                .modal-content::-webkit-scrollbar-track { background: transparent; }
                .modal-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

                .close-btn {
                    position: absolute;
                    top: 25px;
                    right: 25px;
                    border: none;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: rgba(255,255,255,0.1); }

                .modal-header {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 45px;
                    align-items: flex-start;
                }
                .country-flag {
                    width: 120px;
                    height: 80px;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                    flex-shrink: 0;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .country-flag img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .country-info h2 {
                    margin: 0 0 8px 0;
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                }
                .rating-summary {
                    color: rgba(255,255,255,0.5);
                    font-size: 15px;
                }
                .rating-summary span {
                    color: #ffc107;
                    font-weight: 800;
                    margin-left: 5px;
                }
                
                .ratings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin: 20px 0 50px 0;
                }
                .rating-row {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .rating-icon {
                    font-size: 22px;
                    width: 30px;
                    text-align: center;
                }
                .rating-label {
                    font-size: 14px;
                    width: 100px;
                    color: rgba(255,255,255,0.8);
                }
                .rating-bar-bg {
                    flex: 1;
                    height: 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 5px;
                    position: relative;
                    overflow: hidden;
                }
                .rating-bar-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, #ffc107, #ffa500);
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(255,193,7,0.3);
                }
                .rating-val {
                    font-size: 14px;
                    font-weight: 800;
                    width: 35px;
                    text-align: right;
                    color: #ffc107;
                }
                
                .reviews-list {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin: 20px 0 50px 0;
                }
                .review-card {
                    display: flex;
                    gap: 24px;
                    padding: 28px;
                    border-radius: 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .user-avatar {
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    border: 2px solid rgba(255,255,255,0.1);
                }
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .user-name {
                    font-weight: 800;
                    font-size: 16px;
                }
                .stars {
                    color: #ffc107;
                    font-size: 14px;
                }
                .review-date {
                    font-size: 12px;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 15px;
                }
                .review-text {
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.8;
                    color: rgba(255,255,255,0.8);
                }
                
                .share-form {
                    padding: 35px;
                    border-radius: 28px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                }

                .custom-city-input {
                    flex: 1;
                    padding: 12px 18px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .custom-city-input:focus { border-color: #ffc107; }
                
                .btn-add-city {
                    padding: 0 24px;
                    border-radius: 12px;
                    border: none;
                    background: #ffc107;
                    color: black;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-add-city:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,193,7,0.3); }
                .btn-add-city:disabled { opacity: 0.5; cursor: not-allowed; }

                .city-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 5px);
                    left: 0;
                    right: 80px; /* Leave space for Add button */
                    background: #112240;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .city-dropdown-menu::-webkit-scrollbar { width: 6px; }
                .city-dropdown-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                
                .city-dropdown-item {
                    padding: 12px 18px;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .city-dropdown-item:last-child { border-bottom: none; }
                .city-dropdown-item:hover { background: rgba(255,255,255,0.08); }
                .city-dropdown-item.custom-add { color: #ffc107; font-style: italic; }
                .city-dropdown-empty { padding: 12px 18px; color: rgba(255,255,255,0.5); font-size: 13px; font-style: italic; }

                .city-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.1);
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 13px;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .btn-remove-tag {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.6);
                    cursor: pointer;
                    font-size: 16px;
                    line-height: 1;
                    padding: 0 0 2px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .btn-remove-tag:hover { color: #ffc107; }

                .star-rating {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 25px;
                    margin-top: 15px;
                }
                .empty-star {
                    font-size: 32px;
                    color: rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .empty-star:hover { color: #ffc107; transform: scale(1.1); }

                .review-input {
                    width: 100%;
                    height: 140px;
                    padding: 20px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    margin-bottom: 25px;
                    font-size: 15px;
                    resize: none;
                    outline: none;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }
                .review-input:focus { border-color: #ffc107; }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 20px;
                }
                .btn-cancel {
                    padding: 14px 28px;
                    border-radius: 12px;
                    border: none;
                    background: rgba(255,255,255,0.05);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-cancel:hover { background: rgba(255,255,255,0.1); }

                .btn-post {
                    padding: 14px 28px;
                    border-radius: 12px;
                    border: none;
                    background: #ffc107;
                    color: black;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(255,193,7,0.2);
                    transition: all 0.2s;
                }
                .btn-post:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(255,193,7,0.3); }

                @media (max-width: 600px) {
                    .top-action { top: 15px; right: 15px; left: 15px; }
                    .flaunt-btn { width: 100%; }
                    .legend-box { bottom: 15px; left: 15px; right: 15px; min-width: 0; }
                    .modal-overlay { padding: 15px; }
                    .modal-content { padding: 30px 20px; border-radius: 24px; }
                    .modal-header { flex-direction: column; gap: 20px; margin-bottom: 30px; }
                    .country-flag { width: 100%; height: 160px; }
                    .country-info h2 { font-size: 1.8rem; }
                    .rating-label { width: 80px; }
                    .review-card { padding: 20px; flex-direction: column; gap: 15px; }
                    .share-form { padding: 25px; }
                }

                /* Modern Range Slider */
                .modern-range-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(255,255,255,0.1);
                    outline: none;
                }
                .modern-range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #ffc107;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(255,193,7,0.5);
                    transition: transform 0.1s;
                }
                .modern-range-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    )
}
