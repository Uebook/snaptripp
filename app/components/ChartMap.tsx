'use client'

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/lib/supabase'

function getContinentForCountry(country: string): string {
    const continents: Record<string, string> = {
        'India': 'South Asia',
        'Italy': 'Southern Europe',
        'France': 'Western Europe',
        'Spain': 'Southern Europe',
        'Germany': 'Western Europe',
        'United Kingdom': 'Northern Europe',
        'United States': 'North America',
        'Canada': 'North America',
        'Japan': 'East Asia',
        'Australia': 'Oceania',
        'Brazil': 'South America',
        'South Africa': 'Africa',
        'China': 'East Asia',
        'Egypt': 'North Africa',
    };
    return continents[country] || 'Explore';
}

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
        price: 0,
        localCuisine: 0
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
            setRatings({ sightseeing: 0, localPeople: 0, serviceQuality: 0, safety: 0, price: 0, localCuisine: 0 });

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

            {/* Detail Modal Overlay - Custom Split Layout */}
            {selectedCountry && (
                <div className="modal-overlay" onClick={() => setSelectedCountry(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedCountry(null)}>✕</button>

                        <div className="split-modal-body">
                            {/* Left Panel - Wandered Places */}
                            <div className="left-panel">
                                <h2 className="wandered-title">Wandered Places</h2>
                                <p className="wandered-subtitle">Track cities and attractions you've explored</p>
                                
                                <div className="search-bar-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search cities or attractions..." 
                                        value={customCityInput}
                                        onChange={(e) => setCustomCityInput(e.target.value)}
                                        className="search-cities-input"
                                    />
                                </div>

                                <div className="selected-counter">
                                    {selectedCities.length} of {countryPlaces.length || 120} selected
                                </div>

                                <div className="city-cards-list">
                                    {(countryPlaces.length > 0 ? countryPlaces : [
                                        { city: 'Agra' }, { city: 'Ahmedabad' }, { city: 'Ajanta' },
                                        { city: 'Amritsar' }, { city: 'Bangalore' }, { city: 'Chennai' }
                                    ])
                                    .filter(p => p.city && p.city.toLowerCase().includes(customCityInput.toLowerCase()))
                                    .map((p, idx) => {
                                        const isSelected = selectedCities.includes(p.city);
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`city-card ${isSelected ? 'city-card-selected' : ''}`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedCities(prev => prev.filter(c => c !== p.city));
                                                    } else {
                                                        setSelectedCities(prev => [...prev, p.city]);
                                                    }
                                                }}
                                            >
                                                <span>{p.city}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Panel - Rating Panel */}
                            <div className="right-panel">
                                <div className="right-panel-header">
                                    <div className="header-info">
                                        <h2 className="rate-country-title">Rate {selectedCountry.name}</h2>
                                        <span className="region-tag">📍 {getContinentForCountry(selectedCountry.name).toUpperCase()}</span>
                                    </div>
                                    <div className="header-score-wrapper">
                                        <div className="score-val">
                                            {(((selectedCountry.sightseeing + selectedCountry.localPeople + selectedCountry.serviceQuality + selectedCountry.safety + selectedCountry.price) / 5 || 0) * 2).toFixed(1)}
                                        </div>
                                        <div className="score-label">AVERAGE COUNTRY RATE</div>
                                    </div>
                                </div>

                                <p className="rate-intro-text">Rate your experience</p>

                                <div className="rating-categories-list">
                                    {[
                                        { key: 'sightseeing', label: 'Sightseeing' },
                                        { key: 'localPeople', label: 'Local people' },
                                        { key: 'serviceQuality', label: 'Service quality' },
                                        { key: 'safety', label: 'Safety' },
                                        { key: 'price', label: 'Price/quality' },
                                        { key: 'localCuisine', label: 'Local cuisine' }
                                    ].map(cat => (
                                        <div key={cat.key} className="rating-category-row">
                                            <span className="category-label">{cat.label}</span>
                                            <div className="interactive-stars">
                                                {[1, 2, 3, 4, 5].map(star => {
                                                    const isFilled = star <= (ratings as any)[cat.key];
                                                    return (
                                                        <span 
                                                            key={star} 
                                                            onClick={() => handleRatingChange(cat.key, star)}
                                                            className="star-icon"
                                                            style={{ color: isFilled ? '#EBA424' : '#D1D5DB' }}
                                                        >
                                                            ★
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder={`Write your review about ${selectedCountry.name}...`}
                                    className="review-input-modern"
                                />

                                <div className="form-actions-modern">
                                    <button className="btn-cancel-modern" onClick={() => setSelectedCountry(null)}>Cancel</button>
                                    <button
                                        className="btn-post-modern"
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
.flaunt-btn:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 12px 25px rgba(255,193,7,0.4);
                }
                 .modal-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 1001;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }
                .modal-content {
                    background: #FFF;
                    width: 100%;
                    max-width: 900px;
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.15);
                    color: #1E293B;
                    font-family: 'Inter', sans-serif;
                }
                .close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    border: none;
                    background: #FAF8F5;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: #6B7280;
                    transition: all 0.2s;
                    z-index: 10;
                }
                .close-btn:hover { background: #E5E7EB; color: #1E293B; }

                .split-modal-body {
                    display: flex;
                    height: 640px;
                }
                .left-panel {
                    width: 45%;
                    background: #FAF8F5;
                    padding: 40px;
                    border-right: 1px solid #E5E7EB;
                    display: flex;
                    flex-direction: column;
                }
                .right-panel {
                    width: 55%;
                    background: #FFF;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }
                .right-panel::-webkit-scrollbar { width: 6px; }
                .right-panel::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }

                .wandered-title {
                    color: #EBA424;
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin: 0 0 6px;
                    font-family: 'Playfair Display', serif;
                }
                .wandered-subtitle {
                    color: #6B7280;
                    font-size: 0.9rem;
                    margin: 0 0 20px;
                }
                .search-bar-wrapper {
                    display: flex;
                    align-items: center;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 10px 16px;
                    background: #FFF;
                    margin-bottom: 12px;
                }
                .search-icon {
                    color: #9CA3AF;
                    font-size: 0.95rem;
                }
                .search-cities-input {
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 0.9rem;
                    margin-left: 8px;
                    color: #1E293B;
                }
                .selected-counter {
                    font-size: 0.85rem;
                    color: #6B7280;
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .city-cards-list {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding-right: 6px;
                }
                .city-cards-list::-webkit-scrollbar { width: 6px; }
                .city-cards-list::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }

                .city-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #FFF;
                    border: 1px solid #FFEED6;
                    border-radius: 12px;
                    padding: 14px 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.95rem;
                }
                .city-card:hover, .city-card-selected {
                    background: #FFF8EE;
                    border-color: #EBA424;
                    color: #855F1B;
                }
                .chevron-icon {
                    font-size: 0.75rem;
                    color: #9CA3AF;
                }

                .right-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                .rate-country-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #1E293B;
                    margin: 0 0 4px;
                    font-family: 'Playfair Display', serif;
                }
                .region-tag {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #EBA424;
                    letter-spacing: 0.05em;
                }
                .header-score-wrapper {
                    text-align: right;
                }
                .score-val {
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: #EBA424;
                    line-height: 1;
                }
                .score-label {
                    font-size: 0.65rem;
                    color: #9CA3AF;
                    font-weight: 800;
                    margin-top: 4px;
                }

                .rate-intro-text {
                    font-size: 0.9rem;
                    color: #6B7280;
                    margin: 0 0 16px;
                }
                .rating-categories-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .rating-category-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .category-label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #4B5563;
                }
                .interactive-stars {
                    display: flex;
                    gap: 6px;
                }
                .star-icon {
                    font-size: 1.6rem;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                .star-icon:hover {
                    transform: scale(1.2);
                }

                .review-input-modern {
                    width: 100%;
                    border: 1px solid #E5E7EB;
                    border-radius: 16px;
                    padding: 16px;
                    min-height: 90px;
                    resize: none;
                    font-size: 0.95rem;
                    outline: none;
                    margin-bottom: 20px;
                    color: #1E293B;
                    font-family: inherit;
                }
                .review-input-modern:focus { border-color: #EBA424; }

                .form-actions-modern {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .btn-cancel-modern {
                    background: #FAF8F5;
                    border: 1px solid #E5E7EB;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-weight: 600;
                    color: #4B5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel-modern:hover { background: #E5E7EB; color: #1E293B; }
                .btn-post-modern {
                    background: #EBA424;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-weight: 600;
                    color: #FFF;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-post-modern:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(235,164,36,0.25); }

                @media (max-width: 768px) {
                    .split-modal-body { flex-direction: column; height: auto; max-height: 85vh; }
                    .left-panel { width: 100%; border-right: none; border-bottom: 1px solid #E5E7EB; padding: 24px; }
                    .right-panel { width: 100%; padding: 24px; }
                }
            `}</style>
        </div>
    )
}
