import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabase';
import { MiniWorldMap } from './InteractiveWorldMap';
import worldCitiesData from '@/app/utils/world_cities.json';
import './travel-map.css';

// Continents Categories as requested
export const CONTINENTS_CATEGORIES = [
  "Africa", "Asia", "Australia and Oceania", "Europe", 
  "North and Central America", "South America", "Special Regions"
];

// Provide a basic mapping (this would ideally be comprehensive)
export const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // Africa
  "Algeria": "Africa", "Egypt": "Africa", "Morocco": "Africa", "South Africa": "Africa", "Libya": "Africa",
  // Asia
  "China": "Asia", "India": "Asia", "Japan": "Asia", "Thailand": "Asia", "Vietnam": "Asia", "Indonesia": "Asia",
  // Australia and Oceania
  "Australia": "Australia and Oceania", "New Zealand": "Australia and Oceania", "Fiji": "Australia and Oceania",
  // Europe
  "France": "Europe", "Germany": "Europe", "Italy": "Europe", "Spain": "Europe", "United Kingdom": "Europe",
  // North and Central America
  "Canada": "North and Central America", "Mexico": "North and Central America", "United States of America": "North and Central America", "Costa Rica": "North and Central America",
  // South America
  "Argentina": "South America", "Brazil": "South America", "Chile": "South America", "Colombia": "South America", "Peru": "South America",
  // Special Regions
  "Antarctica": "Special Regions", "Greenland": "Special Regions"
  // Note: Unmapped countries will default to "Special Regions" or "Unknown" based on logic
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
  
  // Group cities alphabetically
  const groupedCities = allCitiesData.reduce((acc, city) => {
    const letter = city.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(city);
    return acc;
  }, {} as Record<string, string[]>);
  
  const sortedLetters = Object.keys(groupedCities).sort();

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
      // Calculate avg
      const vals = Object.values(ratings);
      const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      
      // Upsert country log
      const { error: err1 } = await supabase.from('user_country_logs').upsert({
        user_id: userId,
        country: country,
        ratings: ratings,
        average_score: avg,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,country' });

      // Handle cities (delete removed, insert new)
      // Delete old ones
      await supabase.from('user_city_logs').delete().eq('user_id', userId).eq('country', country);
      
      // Insert new ones
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

  return (
    <div className="share-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="animate-pop" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: '#fff', borderRadius: '16px', maxWidth: '1000px', width: '100%', 
          display: 'flex', overflow: 'hidden', height: '80vh' 
        }}
      >
        {/* Left Pane - City Checklist */}
        <div style={{ flex: '0 0 350px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', background: '#F8FAFC', minHeight: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', background: '#FFF' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px', color: '#031B4E' }}>
              🌍 {country}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '6px 12px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>List</button>
              <button style={{ padding: '6px 12px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>On map</button>
            </div>
          </div>
          


          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 16px', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Main places</h4>
            
            {sortedLetters.map(letter => (
              <div key={letter} style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, color: '#9CA3AF', marginBottom: '8px', paddingLeft: '8px' }}>{letter}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {groupedCities[letter].map(city => (
                    <label key={city} style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                      background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer' 
                    }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCities.includes(city)} 
                        onChange={() => toggleCity(city)} 
                        style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', background: '#FFF', borderTop: '1px solid #E5E7EB' }}>
            <button onClick={handleSave} style={{ width: '100%', padding: '12px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Save
            </button>
          </div>
        </div>

        {/* Right Pane - Country Rating */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', color: '#374151', margin: 0 }}>Country</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
          </div>

          <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '16px' }}>Add your photo from this country as a cover to make the country card look attractive.</p>
            <button style={{ padding: '10px 24px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              📸 Add country photo
            </button>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: '#E0F2FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: '#0369A1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: '#FFF', padding: '4px 12px', borderRadius: '12px' }}>0</span> Country rate
              </div>
              <span>^</span>
            </div>
            
            <div style={{ padding: '32px 40px', background: '#FFF' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ color: '#64748B', fontSize: '14px' }}>Average country rate: 7.8</div>
                <h4 style={{ margin: '8px 0 0', fontSize: '16px', color: '#111827' }}>And how will you rate it?</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(ratings).map(([label, stars]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#4B5563', fontSize: '14px', width: '120px' }}>{label}</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(star => (
                        <span 
                          key={star} 
                          onClick={() => handleStarClick(label, star)}
                          style={{ color: star <= stars ? '#94A3B8' : '#F1F5F9', cursor: 'pointer', fontSize: '24px' }} // 3pulse uses gray stars
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
