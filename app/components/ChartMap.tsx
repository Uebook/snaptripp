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

const mockCountryData: Record<string, CountryStats> = {
    'Japan': {
        name: 'Japan',
        code: 'JP',
        intensity: 'thoroughly',
        sightseeing: 4.8,
        localPeople: 4.6,
        serviceQuality: 4.9,
        safety: 5.0,
        price: 3.5,
        reviews: [
            {
                user: 'Sarah Mitchell',
                avatar: 'https://i.pravatar.cc/150?u=sarah',
                date: '2 weeks ago',
                text: 'Japan exceeded all my expectations! The blend of ancient traditions and modern technology is fascinating.',
                rating: 5
            },
            {
                user: 'David Chen',
                avatar: 'https://i.pravatar.cc/150?u=david',
                date: '1 month ago',
                text: 'Visited Kyoto and Osaka during cherry blossom season. The temples are breathtaking and the cultural experiences are authentic.',
                rating: 4
            }
        ]
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
    const [countryMapCenter, setCountryMapCenter] = useState<[number, number]>([20, 0])

    // Load places for selected country to display in mini map
    useEffect(() => {
        if (selectedCountry && selectedCountry.name) {
            setCountryPlaces([]);
            setSelectedCities([]);
            setReviewText('');
            setRatings({ sightseeing: 0, localPeople: 0, serviceQuality: 0, safety: 0, price: 0 });

            fetch(`/api/planner/places?country=${encodeURIComponent(selectedCountry.name)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.places && data.places.length > 0) {
                        setCountryPlaces(data.places);

                        // Calculate center
                        let sumLat = 0, sumLng = 0;
                        let validCount = 0;
                        data.places.forEach((p: any) => {
                            if (p.location_lat && p.location_lng) {
                                sumLat += p.location_lat;
                                sumLng += p.location_lng;
                                validCount++;
                            }
                        });
                        if (validCount > 0) {
                            setCountryMapCenter([sumLat / validCount, sumLng / validCount]);
                        }
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
                setSelectedCountry(null); // close modal or refresh country stats
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
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
    }, [])

    const onEachCountry = (feature: any, layer: any) => {
        const countryName = feature.properties.ADMIN
        const stats = mockCountryData[countryName]

        layer.setStyle({
            fillColor: stats ? intensityColors[stats.intensity] : intensityColors.default,
            fillOpacity: stats ? 0.8 : 0.3,
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
                    fillOpacity: stats ? 0.8 : 0.3,
                    weight: 1,
                    color: 'rgba(255, 255, 255, 0.1)'
                })
            },
            click: (e: any) => {
                setSelectedCountry(stats || {
                    name: countryName,
                    code: feature.properties.ISO_A3 || '',
                    intensity: 'visited',
                    sightseeing: 0,
                    localPeople: 0,
                    serviceQuality: 0,
                    safety: 0,
                    price: 0,
                    reviews: []
                })
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
                                <div className="rating-summary">Global average rating: <span>★★★★★ 4.8</span></div>
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

                                {countryPlaces.length > 0 && (
                                    <div className="city-selector-section" style={{ marginBottom: '25px' }}>
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>Select cities you visited:</p>
                                        <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <MapContainer
                                                center={countryMapCenter}
                                                zoom={4}
                                                scrollWheelZoom={false}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                                                {countryPlaces.map((place, idx) => {
                                                    const isSelected = selectedCities.includes(place.city);
                                                    const iconHtml = `<div style="
                                                        background: ${isSelected ? '#ffc107' : 'rgba(255,255,255,0.2)'};
                                                        color: ${isSelected ? '#000' : '#fff'};
                                                        border-radius: 50%;
                                                        width: 24px;
                                                        height: 24px;
                                                        display: flex;
                                                        align-items: center;
                                                        justify-content: center;
                                                        font-weight: bold;
                                                        font-size: 10px;
                                                        border: 2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.5)'};
                                                        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                                                    "></div>`;

                                                    const icon = L.divIcon({
                                                        className: 'custom-city-marker',
                                                        html: iconHtml,
                                                        iconSize: [24, 24],
                                                    });

                                                    return (
                                                        <Marker
                                                            key={idx}
                                                            position={[place.location_lat, place.location_lng]}
                                                            icon={icon}
                                                            eventHandlers={{
                                                                click: () => handleCityToggle(place.city)
                                                            }}
                                                        >
                                                            <Popup>
                                                                <div style={{ color: '#000', fontWeight: 'bold' }}>
                                                                    {place.city}
                                                                    <br />
                                                                    <button
                                                                        onClick={() => handleCityToggle(place.city)}
                                                                        style={{ marginTop: '5px', background: isSelected ? '#dc3545' : '#198754', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                                                                    >
                                                                        {isSelected ? 'Remove' : 'Select'}
                                                                    </button>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    )
                                                })}
                                                <MapResizer />
                                            </MapContainer>
                                        </div>
                                    </div>
                                )}

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
