import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabase';
import { MiniWorldMap } from './InteractiveWorldMap';
import worldCitiesData from '@/app/utils/world_cities.json';
import './travel-map.css';

const MiniCountryMap = dynamic(() => import('./MiniCountryMap'), { ssr: false });

// Continents Categories as requested
export const CONTINENTS_CATEGORIES = [
  "Africa", "Asia", "Australia and Oceania", "Europe", 
  "North and Central America", "South America", "Special Regions"
];

// Provide a comprehensive mapping of countries to continents
export const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // Africa
  "Algeria": "Africa", "Angola": "Africa", "Benin": "Africa", "Botswana": "Africa", "Burkina Faso": "Africa",
  "Burundi": "Africa", "Cabo Verde": "Africa", "Cameroon": "Africa", "Central African Republic": "Africa", "Chad": "Africa",
  "Comoros": "Africa", "Congo": "Africa", "Cote d'Ivoire": "Africa", "DR Congo": "Africa", "Djibouti": "Africa",
  "Egypt": "Africa", "Equatorial Guinea": "Africa", "Eritrea": "Africa", "Eswatini": "Africa", "Ethiopia": "Africa",
  "Gabon": "Africa", "Gambia": "Africa", "Ghana": "Africa", "Guinea": "Africa", "Guinea-Bissau": "Africa",
  "Kenya": "Africa", "Lesotho": "Africa", "Liberia": "Africa", "Libya": "Africa", "Madagascar": "Africa",
  "Malawi": "Africa", "Mali": "Africa", "Mauritania": "Africa", "Mauritius": "Africa", "Morocco": "Africa",
  "Mozambique": "Africa", "Namibia": "Africa", "Niger": "Africa", "Nigeria": "Africa", "Rwanda": "Africa",
  "Sao Tome and Principe": "Africa", "Senegal": "Africa", "Seychelles": "Africa", "Sierra Leone": "Africa", "Somalia": "Africa",
  "South Africa": "Africa", "Sudan": "Africa", "Tanzania": "Africa", "Togo": "Africa", "Tunisia": "Africa",
  "Uganda": "Africa", "Zambia": "Africa", "Zimbabwe": "Africa",

  // South America
  "Argentina": "South America", "Bolivia": "South America", "Brazil": "South America", "Chile": "South America", "Colombia": "South America",
  "Ecuador": "South America", "Guyana": "South America", "Paraguay": "South America", "Peru": "South America", "Suriname": "South America",
  "Uruguay": "South America", "Venezuela": "South America",

  // North and Central America
  "United States of America": "North and Central America", "United States": "North and Central America", "Canada": "North and Central America",
  "Mexico": "North and Central America", "Costa Rica": "North and Central America", "Cuba": "North and Central America", "Dominican Republic": "North and Central America",
  "El Salvador": "North and Central America", "Guatemala": "North and Central America", "Haiti": "North and Central America", "Honduras": "North and Central America",
  "Jamaica": "North and Central America", "Nicaragua": "North and Central America", "Panama": "North and Central America", "Bahamas": "North and Central America",
  "Barbados": "North and Central America",

  // Asia
  "Afghanistan": "Asia", "Armenia": "Asia", "Azerbaijan": "Asia", "Bahrain": "Asia", "Bangladesh": "Asia",
  "Bhutan": "Asia", "Brunei": "Asia", "Cambodia": "Asia", "China": "Asia", "Cyprus": "Asia",
  "Georgia": "Asia", "India": "Asia", "Indonesia": "Asia", "Iran": "Asia", "Iraq": "Asia",
  "Israel": "Asia", "Japan": "Asia", "Jordan": "Asia", "Kazakhstan": "Asia", "Kuwait": "Asia",
  "Kyrgyzstan": "Asia", "Laos": "Asia", "Lebanon": "Asia", "Malaysia": "Asia", "Maldives": "Asia",
  "Mongolia": "Asia", "Myanmar": "Asia", "Nepal": "Asia", "North Korea": "Asia", "Oman": "Asia",
  "Pakistan": "Asia", "Palestine": "Asia", "Philippines": "Asia", "Qatar": "Asia", "Saudi Arabia": "Asia",
  "Singapore": "Asia", "South Korea": "Asia", "Sri Lanka": "Asia", "Syria": "Asia", "Taiwan": "Asia",
  "Tajikistan": "Asia", "Thailand": "Asia", "Timor-Leste": "Asia", "Turkey": "Asia", "Turkmenistan": "Asia",
  "United Arab Emirates": "Asia", "Uzbekistan": "Asia", "Vietnam": "Asia", "Yemen": "Asia",

  // Europe
  "Albania": "Europe", "Andorra": "Europe", "Austria": "Europe", "Belarus": "Europe", "Belgium": "Europe",
  "Bosnia and Herzegovina": "Europe", "Bulgaria": "Europe", "Croatia": "Europe", "Czech Republic": "Europe",
  "Denmark": "Europe", "Estonia": "Europe", "Finland": "Europe", "France": "Europe", "Germany": "Europe",
  "Greece": "Europe", "Hungary": "Europe", "Iceland": "Europe", "Ireland": "Europe", "Italy": "Europe",
  "Latvia": "Europe", "Liechtenstein": "Europe", "Lithuania": "Europe", "Luxembourg": "Europe", "Malta": "Europe",
  "Moldova": "Europe", "Monaco": "Europe", "Montenegro": "Europe", "Netherlands": "Europe", "North Macedonia": "Europe",
  "Norway": "Europe", "Poland": "Europe", "Portugal": "Europe", "Romania": "Europe", "Russia": "Europe",
  "San Marino": "Europe", "Serbia": "Europe", "Slovakia": "Europe", "Slovenia": "Europe", "Spain": "Europe",
  "Sweden": "Europe", "Switzerland": "Europe", "Ukraine": "Europe", "United Kingdom": "Europe", "Vatican City": "Europe",

  // Australia and Oceania
  "Australia": "Australia and Oceania", "Fiji": "Australia and Oceania", "Kiribati": "Australia and Oceania", "Marshall Islands": "Australia and Oceania", "Micronesia": "Australia and Oceania",
  "Nauru": "Australia and Oceania", "New Zealand": "Australia and Oceania", "Palau": "Australia and Oceania", "Papua New Guinea": "Australia and Oceania", "Samoa": "Australia and Oceania",
  "Solomon Islands": "Australia and Oceania", "Tonga": "Australia and Oceania", "Tuvalu": "Australia and Oceania", "Vanuatu": "Australia and Oceania",

  // Special Regions / Others
  "Antarctica": "Special Regions", "Greenland": "Special Regions"
};

export function getContinentForCountry(country: string) {
  return COUNTRY_TO_CONTINENT[country] || "Special Regions"; // Default to Special Regions if unknown
}

// ==========================================
// 1. Travel Score Profile (Image 2)
// ==========================================
export function TravelScoreProfile({ 
  userCountryLogs = [],
  userCityLogs = []
}: { 
  userCountryLogs?: any[],
  userCityLogs?: any[]
}) {
  const tscScore = (userCountryLogs.length * 100) + (userCityLogs.length * 50);

  // Stats calculation
  const regionsVisited = Array.from(new Set(userCountryLogs.map(c => getContinentForCountry(c.country))));
  const bestExploredRegion = regionsVisited.length > 0 ? regionsVisited[0] : 'N/A'; // Simplified logic

  const sortedCities = userCityLogs.map(c => `${c.city}, ${c.country}`).sort();
  const northernmost = sortedCities.length > 0 ? sortedCities[0] : 'N/A';
  const southernmost = sortedCities.length > 1 ? sortedCities[sortedCities.length - 1] : (sortedCities[0] || 'N/A');

  return (
    <div className="travel-score-profile" style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #F6B800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          👑
        </div>
        <div>
          <h2 style={{ fontSize: '24px', color: '#031B4E', marginBottom: '8px', fontFamily: '"Playfair Display", serif' }}>
            You have been to {regionsVisited.join(', ')}
          </h2>
          <div style={{ fontSize: '14px', color: '#64748B' }}>
            Your Travel Score (TSC): <strong style={{ color: '#F6B800', fontSize: '20px' }}>{tscScore} PTS</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '14px', color: '#374151' }}>
        <div>
          <div style={{ marginBottom: '16px' }}><span style={{ color: '#9CA3AF' }}>Best explored region:</span> <strong>{bestExploredRegion}</strong></div>
          <div style={{ marginBottom: '16px' }}><span style={{ color: '#9CA3AF' }}>Visited countries regions:</span> <strong>{regionsVisited.length}</strong></div>
        </div>
        <div>
          <div style={{ marginBottom: '16px' }}><span style={{ color: '#9CA3AF' }}>Northernmost city:</span> <strong>{northernmost}</strong></div>
          <div style={{ marginBottom: '16px' }}><span style={{ color: '#9CA3AF' }}>Southernmost city:</span> <strong>{southernmost}</strong></div>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', fontSize: '13px', color: '#64748B' }}>
        <strong>How points are counted:</strong><br/>
        100 points for a visited country<br/>
        50 points for a visited city
      </div>
    </div>
  );
}

// ==========================================
// 2. Visited Countries Component (Image 3)
// ==========================================
export function VisitedCountriesSection({
  userCountryLogs = [],
  userCityLogs = []
}: {
  userCountryLogs?: any[],
  userCityLogs?: any[]
}) {
  const [activeContinent, setActiveContinent] = useState<string>(CONTINENTS_CATEGORIES[0]);

  // Group countries by continent
  const continentCounts: Record<string, number> = {};
  CONTINENTS_CATEGORIES.forEach(c => continentCounts[c] = 0);
  
  userCountryLogs.forEach(log => {
    const cont = getContinentForCountry(log.country);
    if (continentCounts[cont] !== undefined) {
      continentCounts[cont]++;
    }
  });

  const displayLogs = userCountryLogs.filter(log => getContinentForCountry(log.country) === activeContinent);

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ fontSize: '20px', color: '#031B4E', marginBottom: '24px', textAlign: 'center' }}>Visited countries</h3>
      
      {/* Filter Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
        {CONTINENTS_CATEGORIES.map(continent => (
          <button
            key={continent}
            onClick={() => setActiveContinent(continent)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              border: activeContinent === continent ? 'none' : '1px solid #E5E7EB',
              background: activeContinent === continent ? '#03A9F4' : '#FFF',
              color: activeContinent === continent ? '#FFF' : '#374151',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeContinent === continent ? '0 4px 12px rgba(3, 169, 244, 0.3)' : 'none'
            }}
          >
            <span>{continent}</span>
            <span style={{ 
              background: activeContinent === continent ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
              padding: '2px 8px', borderRadius: '12px', fontSize: '11px' 
            }}>{continentCounts[continent]}</span>
          </button>
        ))}
      </div>

      {/* Country Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {displayLogs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            No countries visited in {activeContinent} yet.
          </div>
        ) : (
          displayLogs.map(log => {
            const citiesCount = userCityLogs.filter(c => c.country === log.country).length;
            return (
              <div key={log.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                {/* Photo Area */}
                <div style={{ height: '140px', background: log.photo_url ? `url(${log.photo_url}) center/cover` : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!log.photo_url && (
                    <button style={{ padding: '8px 16px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                      📸 Add country photo
                    </button>
                  )}
                </div>
                
                {/* Card Body */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🌍</span> {log.country}
                    </div>
                    <span style={{ color: '#F6B800' }}>★ {log.average_score}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{citiesCount}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>cities</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>0</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>places</div>
                    </div>
                  </div>
                  
                  <button style={{ width: '100%', padding: '8px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', fontWeight: 600, fontSize: '12px', color: '#374151', cursor: 'pointer' }}>
                    + Add photos
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. Country Rating Modal (Image 1 - Dual Pane)
// ==========================================
export function CountryRatingModal({
  country,
  userId,
  userCountryLogs = [],
  userCityLogs = [],
  onClose,
  onSave
}: {
  country: string,
  userId?: string,
  userCountryLogs?: any[],
  userCityLogs?: any[],
  onClose: () => void,
  onSave: () => void
}) {
  const allCitiesData = (worldCitiesData as Record<string, string[]>)[country] || ['General City 1', 'General City 2'];
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const COUNTRY_COORDS: Record<string, [number, number]> = {
    "India": [20.5937, 78.9629],
    "Brazil": [-14.235, -51.9253],
    "Algeria": [28.0339, 1.6596],
    "Egypt": [26.8206, 30.8025],
    "Libya": [26.3351, 17.2283],
    "Morocco": [31.7917, -7.0926],
    "South Africa": [-30.5595, 22.9375],
    "France": [46.2276, 2.2137],
    "Italy": [41.8719, 12.5674],
    "Spain": [40.4637, -3.7492],
    "Germany": [51.1657, 10.4515],
    "United Kingdom": [55.3781, -3.436],
    "United States": [37.0902, -95.7129],
    "Canada": [56.1304, -106.3468],
    "Australia": [-25.2744, 133.7751]
  };

  const centerCoord = COUNTRY_COORDS[country] || [20, 0];

  // State for selected cities
  const existingCities = userCityLogs.filter(c => c.country === country).map(c => c.city);
  const [selectedCities, setSelectedCities] = useState<string[]>(existingCities);

  const toggleCity = (city: string) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  // State for ratings
  const existingLog = userCountryLogs.find(l => l.country === country);
  const [ratings, setRatings] = useState<Record<string, number>>(existingLog?.ratings || {
    Sightseeing: 0, 'Local people': 0, 'Service quality': 0, Safety: 0, 'Price/quality': 0, 'Local cuisine': 0
  });

  const handleStarClick = (category: string, stars: number) => {
    setRatings(prev => ({ ...prev, [category]: stars }));
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      const vals = Object.values(ratings);
      const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      
      const { error: err1 } = await supabase.from('user_country_logs').upsert({
        user_id: userId,
        country: country,
        ratings: ratings,
        average_score: avg,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,country' });

      await supabase.from('user_city_logs').delete().eq('user_id', userId).eq('country', country);
      
      if (selectedCities.length > 0) {
        const cityInserts = selectedCities.map(c => ({ user_id: userId, country: country, city: c }));
        await supabase.from('user_city_logs').insert(cityInserts);
      }

      onSave();
      onClose();
    } catch(e) {
      console.error(e);
      alert("Error saving data");
    }
  };

  const filteredCities = allCitiesData.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()));
  const continent = COUNTRY_TO_CONTINENT[country] || 'Explore';

  // Calculate average score dynamically scaled by 2 (e.g. 3.65 stars * 2 = 7.3 rate)
  const ratingsArray = Object.values(ratings);
  const calculatedAvg = ratingsArray.reduce((a, b) => a + b, 0) / (ratingsArray.length || 1);
  const averageRateDisplay = (calculatedAvg * 2).toFixed(1);

  const overlayStyle = {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '40px'
  };

  const modalContentStyle = {
    background: '#fff',
    borderRadius: '24px',
    maxWidth: '900px',
    width: '100%',
    display: 'flex',
    overflow: 'hidden',
    height: '620px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
    color: '#1E293B',
    fontFamily: "'Inter', sans-serif",
    position: 'relative' as const,
    margin: 'auto'
  };

  const closeBtnStyle = {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    border: 'none',
    background: '#FAF8F5',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#6B7280',
    transition: 'all 0.2s',
    zIndex: 10
  };

  const leftPaneStyle = {
    width: '45%',
    background: '#FAF8F5',
    padding: '40px',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0
  };

  const rightPaneStyle = {
    width: '55%',
    background: '#FFF',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div 
        className="animate-pop" 
        onClick={e => e.stopPropagation()} 
        style={modalContentStyle}
      >
        <button 
          onClick={onClose} 
          style={closeBtnStyle}
        >
          ✕
        </button>

        {/* Left Pane - City Checklist / Map view */}
        <div style={leftPaneStyle}>
          <h2 style={{ 
            color: '#EBA424', 
            fontSize: '1.8rem', 
            fontWeight: 800, 
            margin: '0 0 6px',
            fontFamily: "'Playfair Display', serif"
          }}>
            Wandered Places
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 20px' }}>
            Track cities and attractions you've explored
          </p>

          {/* Toggle buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ 
                padding: '8px 16px', 
                background: viewMode === 'list' ? '#EBA424' : '#FFF', 
                color: viewMode === 'list' ? '#FFF' : '#374151', 
                border: '1px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              style={{ 
                padding: '8px 16px', 
                background: viewMode === 'map' ? '#EBA424' : '#FFF', 
                color: viewMode === 'map' ? '#FFF' : '#374151', 
                border: '1px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              On map
            </button>
          </div>
          
          {viewMode === 'list' ? (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #E5E7EB', 
                borderRadius: '12px', 
                padding: '10px 16px', 
                background: '#FFF', 
                marginBottom: '12px' 
              }}>
                <span style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search cities or attractions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    border: 'none', 
                    outline: 'none', 
                    width: '100%', 
                    fontSize: '0.9rem', 
                    marginLeft: '8px', 
                    color: '#1E293B' 
                  }}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 700, margin: '12px 0' }}>
                {selectedCities.length} of {allCitiesData.length} selected
              </div>

              <div className="city-scroll-container" style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                paddingRight: '6px'
              }}>
                {filteredCities.map((city, idx) => {
                  const isSelected = selectedCities.includes(city);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleCity(city)}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: '#FFF', 
                        border: isSelected ? '1px solid #EBA424' : '1px solid #FFEED6', 
                        borderRadius: '12px', 
                        padding: '14px 20px', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        fontWeight: 600, 
                        color: isSelected ? '#855F1B' : '#374151', 
                        fontSize: '0.95rem',
                        boxShadow: isSelected ? '0 2px 8px rgba(235,164,36,0.1)' : 'none'
                      }}
                    >
                      <span>{city}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <MiniCountryMap country={country} center={centerCoord} />
            </div>
          )}
        </div>

        {/* Right Pane - Country Rating */}
        <div style={rightPaneStyle}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '24px' 
          }}>
            <div>
              <h2 style={{ 
                fontSize: '2.2rem', 
                fontWeight: 800, 
                color: '#1E293B', 
                margin: '0 0 4px',
                fontFamily: "'Playfair Display', serif"
              }}>
                Rate {country}
              </h2>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EBA424', letterSpacing: '0.05em' }}>
                📍 {continent.toUpperCase()}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#EBA424', lineHeight: 1 }}>
                {averageRateDisplay}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 800, marginTop: '4px' }}>
                AVERAGE COUNTRY RATE
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0 0 16px' }}>Rate your experience</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {Object.entries(ratings).map(([label, stars]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#4B5563' }}>{label}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = star <= stars;
                    return (
                      <span 
                        key={star} 
                        onClick={() => handleStarClick(label, star)}
                        style={{ 
                          fontSize: '1.6rem', 
                          cursor: 'pointer', 
                          color: isFilled ? '#EBA424' : '#D1D5DB',
                          transition: 'transform 0.1s, color 0.2s',
                          transform: 'scale(1)',
                          display: 'inline-block'
                        }}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              onClick={onClose} 
              style={{ 
                background: '#FAF8F5', 
                border: '1px solid #E5E7EB', 
                padding: '12px 24px', 
                borderRadius: '30px', 
                fontWeight: 600, 
                color: '#4B5563', 
                cursor: 'pointer', 
                transition: 'all 0.2s' 
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              style={{ 
                background: '#EBA424', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '30px', 
                fontWeight: 600, 
                color: '#FFF', 
                cursor: 'pointer', 
                transition: 'all 0.2s' 
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. Share Modal (Image 4)
// ==========================================
export function ShareJourneyModal({ 
  userCountryLogs = [],
  userCityLogs = [],
  countryData = {},
  username = "Wanderer",
  onClose 
}: { 
  userCountryLogs?: any[];
  userCityLogs?: any[];
  countryData?: Record<string, { rating: number }>;
  username?: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async (platform: string) => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'snaptrip.png', { type: 'image/png' })] })) {
        try {
          await navigator.share({
            files: [new File([blob], 'snaptrip.png', { type: 'image/png' })],
            title: 'My SnapTrip Journey',
            text: 'Check out my travel journey on SnapTrip!'
          });
          return; 
        } catch (shareErr) {
          if ((shareErr as any).name !== 'AbortError') { } else { return; }
        }
      }

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Image copied to clipboard! Paste it (Cmd+V / Ctrl+V) into the window that opens.');
        }
      } catch (clipboardErr) {
        const link = document.createElement('a');
        link.download = 'snaptrip-journey.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to capture image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalCountries = userCountryLogs.length;
  const totalCities = userCityLogs.length; 
  const percentWorld = Math.max(1, Math.round((totalCountries / 195) * 100));
  
  const sortedCities = userCityLogs.map(r => `${r.city}, ${r.country}`).sort();
  const northernmost = sortedCities.length > 0 ? sortedCities[0] : 'N/A';
  const southernmost = sortedCities.length > 1 ? sortedCities[sortedCities.length - 1] : (sortedCities[0] || 'N/A');
  const favRegion = userCountryLogs.length > 0 ? userCountryLogs[0].country : 'Start Traveling!';
  
  const keyPlacesCount = Math.min(6, totalCities || 1);

  return (
    <div className="share-modal-overlay" onClick={onClose} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '24px' }}>
      <div className="share-modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', margin: '0 auto', padding: 0, overflow: 'hidden', background: '#FFF', borderRadius: '24px', position: 'relative' }}>
        <button className="share-modal-close" onClick={onClose} style={{ zIndex: 50, color: '#9CA3AF', position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        
        <div style={{ padding: '40px 32px 24px' }}>
          <div className="share-modal-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0' }}>Share map</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 300, color: '#111827', lineHeight: 1 }}>{totalCountries}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>COUNTRIES / {percentWorld}%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 300, color: '#111827', lineHeight: 1 }}>{totalCities}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>CITIES</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 300, color: '#111827', lineHeight: 1 }}>{keyPlacesCount}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>PLACES</div>
            </div>
          </div>
          
          <div className="shareable-card" ref={cardRef} style={{ 
            background: '#242D3C', 
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            color: '#FFFFFF',
            height: '300px'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, opacity: 0.8 }}>
               <MiniWorldMap countryData={countryData} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ background: '#FFF', color: '#111827', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>☑</span> SnapTrip.com
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F6B800', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                       <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{username}</div>
                 </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', width: '120px' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{totalCountries}</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '1px', marginTop: '4px' }}>COUNTRIES / {percentWorld}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{totalCities}</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '1px', marginTop: '4px' }}>CITIES</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{keyPlacesCount}</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '1px', marginTop: '4px' }}>PLACES</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#111827', margin: '0 0 16px', fontWeight: 700 }}>Share your map with your friends!</h3>
          <button className="btn-copy-link" style={{ width: '100%', padding: '14px', background: '#1877F2', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }} onClick={() => handleShare('clipboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Share on Facebook
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button style={{ flex: 1, padding: '10px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#6B7280', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                🔗 Copy link
             </button>
             <button style={{ width: '50px', padding: '10px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#6B7280', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                •••
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
