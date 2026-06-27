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
  const [dbCities, setDbCities] = useState<{ name: string; img_url?: string; desc?: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      setLoadingCities(true);
      try {
        // 1. Try country_guide_cities
        const { data: guideCities, error: guideErr } = await supabase
          .from('country_guide_cities')
          .select('name, img_url, desc')
          .ilike('country_id', country);

        if (!guideErr && guideCities && guideCities.length > 0) {
          setDbCities(guideCities.map(c => ({
            name: c.name,
            img_url: c.img_url || '/images/hero_city.png',
            desc: c.desc || ''
          })));
          setLoadingCities(false);
          return;
        }

        // 2. Try countries + cities table
        const { data: countryRow } = await supabase
          .from('countries')
          .select('id')
          .ilike('name', country)
          .maybeSingle();

        if (countryRow) {
          const { data: citiesList } = await supabase
            .from('cities')
            .select('name, latitude, longitude')
            .eq('country_id', countryRow.id)
            .order('name', { ascending: true })
            .limit(150);

          if (citiesList && citiesList.length > 0) {
            setDbCities(citiesList.map(c => ({
              name: c.name,
              img_url: '/images/hero_city.png',
              desc: `Lat: ${c.latitude.toFixed(2)}, Lng: ${c.longitude.toFixed(2)}`
            })));
            setLoadingCities(false);
            return;
          }
        }

        // 3. Fallback
        const staticCities = (worldCitiesData as Record<string, string[]>)[country] || [];
        setDbCities(staticCities.map(c => ({ name: c, img_url: '/images/hero_city.png' })));
      } catch (e) {
        console.error("Error loading cities from DB:", e);
        const staticCities = (worldCitiesData as Record<string, string[]>)[country] || [];
        setDbCities(staticCities.map(c => ({ name: c, img_url: '/images/hero_city.png' })));
      } finally {
        setLoadingCities(false);
      }
    }
    fetchCities();
  }, [country]);

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // State for selected cities
  const existingCities = userCityLogs.filter(c => c.country === country).map(c => c.city);
  const [selectedCities, setSelectedCities] = useState<string[]>(existingCities);

  const toggleCity = (cityName: string) => {
    setSelectedCities(prev => prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]);
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

        {/* Left Pane - City Checklist */}
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

          {loadingCities ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600 }}>Loading cities from database...</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 700, margin: '12px 0' }}>
                {selectedCities.length} of {dbCities.length} selected
              </div>

              <div className="city-scroll-container" style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                paddingRight: '6px'
              }}>
                {dbCities
                  .filter(city => city.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((city, idx) => {
                    const isSelected = selectedCities.includes(city.name);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleCity(city.name)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          background: '#FFF', 
                          border: isSelected ? '1px solid #EBA424' : '1px solid #FFEED6', 
                          borderRadius: '12px', 
                          padding: '10px 14px', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s', 
                          fontWeight: 600, 
                          color: isSelected ? '#855F1B' : '#374151', 
                          fontSize: '0.95rem',
                          boxShadow: isSelected ? '0 2px 8px rgba(235,164,36,0.1)' : 'none'
                        }}
                      >
                        <img 
                          src={city.img_url || '/images/hero_city.png'} 
                          alt={city.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 700 }}>{city.name}</span>
                          {city.desc && <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.desc}</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
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
    <div className="share-modal-overlay" onClick={onClose} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}>
      <div className="share-modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '32px', background: '#FFF', borderRadius: '16px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <button className="share-modal-close" onClick={onClose} style={{ zIndex: 50, color: '#9CA3AF', position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}>✕</button>
        
        <div className="share-modal-header" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0' }}>Share your journey</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>Show the world where you've been</p>
        </div>
        
        {/* Divider with text */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          <div style={{ padding: '0 12px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1px' }}>PREVIEW OF YOUR SHAREABLE POST</div>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
        </div>
        
        <div className="shareable-card" ref={cardRef} style={{ 
          background: '#DFD6C9',
          borderRadius: '16px',
          padding: '40px',
          display: 'flex',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '380px'
        }}>
          {/* Left Column (Text & Stats) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
             <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000', fontWeight: 800, fontSize: '18px' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                 SnapTrip
               </div>
               <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#000', marginTop: '24px', marginBottom: '16px', lineHeight: 1, letterSpacing: '-1px' }}>{username}</h1>
               <p style={{ fontSize: '18px', color: '#111', fontWeight: 500, maxWidth: '240px', lineHeight: 1.4 }}>Exploring the world, one city at a time.</p>
             </div>

             <div style={{ display: 'flex', gap: '32px', marginTop: '40px' }}>
                <div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  <div style={{ fontSize: '42px', fontWeight: 800, color: '#000', lineHeight: 1, marginTop: '12px' }}>{totalCountries}</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#000', letterSpacing: '1px', marginTop: '8px' }}>COUNTRIES<br/>VISITED</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#000', opacity: 0.2 }}></div>
                <div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
                  <div style={{ fontSize: '42px', fontWeight: 800, color: '#000', lineHeight: 1, marginTop: '12px' }}>{totalCities}</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#000', letterSpacing: '1px', marginTop: '8px' }}>CITIES<br/>VISITED</div>
                </div>
             </div>
          </div>
          
          {/* Right Column (Map) */}
          <div style={{ flex: 1.4, position: 'relative' }}>
             <div style={{ position: 'absolute', top: '-15%', right: '-15%', bottom: '-15%', left: '-15%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '130%', height: '130%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <MiniWorldMap countryData={countryData} baseColor="#4B5563" highlightColor="#F59E0B" strokeColor="transparent" />
               </div>
             </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Share on</div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'url(#ig-grad)' }}>
                <defs>
                  <linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22">
                    <stop offset="0%" stopColor="#f09433"/>
                    <stop offset="25%" stopColor="#e6683c"/>
                    <stop offset="50%" stopColor="#dc2743"/>
                    <stop offset="75%" stopColor="#cc2366"/>
                    <stop offset="100%" stopColor="#bc1888"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </button>
            <button style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X (Twitter)
            </button>
            <button style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            <button style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </button>
          </div>
          
          <button style={{ padding: '12px 24px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleShare('clipboard')}>
             {isDownloading ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
             Copy shareable link
          </button>
        </div>
      </div>
    </div>
  );
}
