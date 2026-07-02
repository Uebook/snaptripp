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

  return (
    <div className="travel-score-profile" style={{ maxWidth: '800px', margin: '0 auto', background: '#FFF', borderRadius: '24px', padding: '40px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
      {/* Top Trophy Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '50%', 
          border: '3px solid #F6B800', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#FFF'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F6B800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
            <path d="M12 2a5 5 0 0 0-5 5v3.5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: '20px', color: '#1E293B', fontWeight: 600, margin: '0 0 4px 0', lineHeight: '1.4' }}>
            You have been to {regionsVisited.join(', ') || 'no regions yet'}
          </h2>
        </div>
      </div>

      {/* Travel Score display */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#854D0E', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Travel Score (TSC)
          <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #854D0E', fontSize: '11px', fontWeight: 'bold' }}>i</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px 0' }}>
          <span style={{ fontSize: '64px', fontWeight: 800, color: '#854D0E', lineHeight: '1' }}>{tscScore.toLocaleString()}</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#854D0E' }}>TSC</span>
        </div>
        <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>Your total travel score</div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '24px 0', marginBottom: '32px', justifyContent: 'space-between' }}>
        {/* Countries Visited */}
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
          <div style={{ color: '#854D0E', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{userCountryLogs.length}</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Countries<br/>Visited</div>
        </div>

        {/* Cities Visited */}
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
          <div style={{ color: '#854D0E', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{userCityLogs.length}</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cities<br/>Visited</div>
        </div>

        {/* Continents Explored */}
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
          <div style={{ color: '#854D0E', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10M6 10h10"/>
            </svg>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{regionsVisited.length}</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continents<br/>Explored</div>
        </div>

        {/* Rank */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#854D0E', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>#4</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rank<br/>Among Friends</div>
        </div>
      </div>

      {/* How Travel Score (TSC) is calculated Box */}
      <div style={{ background: '#FEF08A', opacity: 0.9, borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ color: '#854D0E', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>
          How Travel Score (TSC) is calculated?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#713F12', fontSize: '14px', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
            100 points for every visited country
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#713F12', fontSize: '14px', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            50 points for every visited city
          </div>
        </div>
      </div>

      {/* Airplane bottom CTA & Decorative Background corner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#854D0E', fontSize: '15px', fontWeight: 600, paddingRight: '60px', position: 'relative', zIndex: 1 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(45deg)' }}>
          <path d="M21 16V8a2 2 0 0 0-2-2h-5l-7-4v4H3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v4l7 4v-4h5a2 2 0 0 0 2-2z"/>
        </svg>
        Keep exploring new places to increase your Travel Score (TSC)!
      </div>
      
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '90px', height: '90px', background: '#FDE047', borderRadius: '100px 0 0 0', opacity: 0.5, zIndex: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '10px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#854D0E" strokeWidth="2.5" style={{ transform: 'rotate(-15deg)' }}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 2. Visited Countries Component (Image 3)
// ==========================================
export function VisitedCountriesSection({
  userCountryLogs = [],
  userCityLogs = [],
  userId,
  onUpdate
}: {
  userCountryLogs?: any[],
  userCityLogs?: any[],
  userId?: string,
  onUpdate?: () => void
}) {
  const [activeContinent, setActiveContinent] = useState<string>(CONTINENTS_CATEGORIES[0]);
  const [uploadingCountry, setUploadingCountry] = useState<string | null>(null);
  const [showCitiesCountry, setShowCitiesCountry] = useState<string | null>(null);

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

  const getContinentEmoji = (continentName: string) => {
    switch(continentName) {
      case "Africa": return "🦁";
      case "Asia": return "🐼";
      case "Australia and Oceania": return "🦘";
      case "Europe": return "🏰";
      case "North and Central America": return "🍁";
      case "South America": return "🐆";
      default: return "❄️";
    }
  };

  const getCountryFlag = (country: string): string => {
    const flagMap: Record<string, string> = {
      "India": "🇮🇳", "South Africa": "🇿🇦", "Libya": "🇱🇾", "Greece": "🇬🇷", "Germany": "🇩🇪", "Brazil": "🇧🇷",
      "France": "🇫🇷", "United Kingdom": "🇬🇧", "United States": "🇺🇸", "United States of America": "🇺🇸",
      "Canada": "🇨🇦", "Australia": "🇦🇺", "Japan": "🇯🇵", "China": "🇨🇳", "Italy": "🇮🇹", "Spain": "🇪🇸",
      "Russia": "🇷🇺", "Egypt": "🇪🇬", "Argentina": "🇦🇷", "Mexico": "🇲🇽", "Singapore": "🇸🇬", "Thailand": "🇹🇭"
    };
    return flagMap[country] || "🌍";
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, country: string) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setUploadingCountry(country);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `travel-map-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = fileName;

      // Try uploading to 'travel_photos' first, fallback to 'carousel'
      let uploadBucket = 'travel_photos';
      let { error: uploadError } = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, file);

      if (uploadError) {
        uploadBucket = 'carousel';
        const backupResult = await supabase.storage
          .from(uploadBucket)
          .upload(filePath, file);
        if (backupResult.error) {
          throw new Error(backupResult.error.message || uploadError.message);
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from(uploadBucket)
        .getPublicUrl(filePath);

      const existingLog = userCountryLogs.find(log => log.country === country);
      const currentRatings = existingLog?.ratings || {};

      // Try upserting with direct photo_url column first
      const { error: directError } = await supabase.from('user_city_ratings').upsert({
        id: existingLog?.id,
        user_id: userId,
        country: country,
        city: `--COUNTRY_LOG--${country}`,
        photo_url: publicUrl,
        ratings: {
          ...currentRatings,
          photo_url: publicUrl
        },
        average_score: existingLog?.average_score || 0
      }, { onConflict: 'user_id,city' });

      if (directError) {
        // Fallback without direct photo_url column
        const { error: fallbackError } = await supabase.from('user_city_ratings').upsert({
          id: existingLog?.id,
          user_id: userId,
          country: country,
          city: `--COUNTRY_LOG--${country}`,
          ratings: {
            ...currentRatings,
            photo_url: publicUrl
          },
          average_score: existingLog?.average_score || 0
        }, { onConflict: 'user_id,city' });
        if (fallbackError) throw fallbackError;
      }

      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert('Failed to upload photo: ' + err.message);
    } finally {
      setUploadingCountry(null);
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '28px', color: '#031B4E', margin: '0 0 8px 0', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>Visited countries</h3>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Explore the countries you've visited across different continents.</p>
      </div>
      
      {/* Filter Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '40px' }}>
        {CONTINENTS_CATEGORIES.map(continent => {
          const active = activeContinent === continent;
          return (
            <button
              key={continent}
              onClick={() => setActiveContinent(continent)}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: '1px solid #E2E8F0',
                background: active ? '#F6B800' : '#FFF',
                color: active ? '#FFF' : '#475569',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{getContinentEmoji(continent)} {continent}</span>
              <span style={{ 
                marginLeft: '4px',
                paddingLeft: '8px', 
                borderLeft: `1px solid ${active ? 'rgba(255,255,255,0.3)' : '#E2E8F0'}`,
                fontSize: '12px' 
              }}>{continentCounts[continent]}</span>
            </button>
          );
        })}
      </div>

      {/* Country Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
        {displayLogs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            No countries visited in {activeContinent} yet.
          </div>
        ) : (
          displayLogs.map(log => {
            const citiesCount = userCityLogs.filter(c => c.country === log.country).length;
            const photoUrl = log.photo_url || log.ratings?.photo_url;
            return (
              <div key={log.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                {/* Photo Area */}
                <div style={{ height: '180px', background: photoUrl ? `url(${photoUrl}) center/cover` : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {uploadingCountry === log.country ? (
                    <span style={{ color: '#031B4E', fontWeight: 600 }}>Uploading...</span>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id={`file-input-${log.country.replace(/\s+/g, '-')}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, log.country)}
                      />
                      <button 
                        onClick={() => document.getElementById(`file-input-${log.country.replace(/\s+/g, '-')}`)?.click()}
                        style={{ 
                          padding: '10px 20px', 
                          background: '#F6B800', 
                          color: '#FFF', 
                          border: 'none', 
                          borderRadius: '30px', 
                          fontWeight: 700, 
                          fontSize: '13px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(246, 184, 0, 0.2)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        {photoUrl ? "Change photo" : "Add country photo"}
                      </button>
                    </>
                  )}
                </div>
                
                {/* Card Body */}
                <div style={{ padding: '20px' }}>
                  {/* Header with Flag, Name, and Star Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 700, color: '#031B4E', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{getCountryFlag(log.country)}</span>
                      <span>{log.country}</span>
                    </div>
                    
                    <button style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '10px', 
                      border: '1px solid #E2E8F0', 
                      background: 'transparent',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#94A3B8',
                      cursor: 'pointer'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0 0 16px 0' }} />

                  {/* Stats with icons */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', marginBottom: '16px' }}>
                    <div 
                      onClick={() => citiesCount > 0 && setShowCitiesCountry(showCitiesCountry === log.country ? null : log.country)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: citiesCount > 0 ? 'pointer' : 'default', flex: 1 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#F6B800' }}>{citiesCount}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="2" y="10" width="20" height="12" rx="2"/>
                          <path d="M6 10V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6"/>
                        </svg>
                        cities visited
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#031B4E' }}>0</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        places visited
                      </div>
                    </div>
                  </div>

                  {showCitiesCountry === log.country && (
                    <div style={{ 
                      padding: '10px', 
                      background: '#F8FAFC', 
                      borderRadius: '8px', 
                      marginBottom: '16px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      color: '#475569'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '6px', color: '#031B4E' }}>Visited Cities:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {userCityLogs.filter(c => c.country === log.country).map((c, idx) => (
                          <span key={idx} style={{ background: '#E2E8F0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#031B4E', fontWeight: 500 }}>
                            📍 {c.city}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add more countries dashed button */}
      <button 
        onClick={() => {
          const selectBtn = document.querySelector('button[onClick*="setMainViewMode(\'list\')"]') as HTMLButtonElement;
          if (selectBtn) selectBtn.click();
        }}
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '40px auto 0 auto',
          padding: '16px',
          background: 'transparent',
          border: '2px dashed #CBD5E1',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: '#F6B800',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '15px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F6B800'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #F6B800', fontSize: '14px', lineHeight: 1 }}>+</span>
        Add more countries
      </button>
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
        // 1. Map mismatched map names to DB names
        const dbCountryName = {
          'Dem. Rep. Congo': 'Democratic Republic of the Congo',
          'United States of America': 'United States',
          'Bahamas': 'The Bahamas',
          'Czechia': 'Czech Republic',
          "Côte d'Ivoire": "Ivory Coast",
          'Timor-Leste': 'East Timor',
          'Palestine': 'Palestinian Territory',
          'Gambia': 'The Gambia',
          'Dominican Rep.': 'Dominican Republic',
          'Central African Rep.': 'Central African Republic',
          'Eq. Guinea': 'Equatorial Guinea',
          'eSwatini': 'Swaziland',
          'W. Sahara': 'Western Sahara',
          'Falkland Is.': 'Falkland Islands (Islas Malvinas)',
          'Greenland': 'Greenland', // Usually fine but just in case
          'Solomon Is.': 'Solomon Islands',
          'Papua New Guinea': 'Papua New Guinea',
          'New Caledonia': 'New Caledonia',
        }[country] || country;

        // 1. Try country_guide_cities
        const { data: guideCities, error: guideErr } = await supabase
          .from('country_guide_cities')
          .select('name, img_url, desc')
          .ilike('country_id', dbCountryName);

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
          .ilike('name', dbCountryName)
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
      
      const { error: err1 } = await supabase.from('user_city_ratings').upsert({
        user_id: userId,
        country: country,
        city: `--COUNTRY_LOG--${country}`,
        ratings: ratings,
        average_score: avg,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,city' });

      await supabase.from('user_city_ratings').delete().eq('user_id', userId).eq('country', country).neq('city', `--COUNTRY_LOG--${country}`);
      
      if (selectedCities.length > 0) {
        const cityInserts = selectedCities.map(c => ({ user_id: userId, country: country, city: c }));
        await supabase.from('user_city_ratings').upsert(cityInserts, { onConflict: 'user_id,city' });
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
    <div className="country-rating-modal-overlay" style={overlayStyle} onClick={onClose}>
      <div 
        className="country-rating-modal-content animate-pop" 
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
        <div className="country-rating-left-pane" style={leftPaneStyle}>
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
        <div className="country-rating-right-pane" style={rightPaneStyle}>
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

          <div className="country-rating-actions" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
            <button className="share-btn" style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
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
            <button className="share-btn" style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button className="share-btn" style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X (Twitter)
            </button>
            <button className="share-btn" style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            <button className="share-btn" style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleShare('clipboard')}>
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
