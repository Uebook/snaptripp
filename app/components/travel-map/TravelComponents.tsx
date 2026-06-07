import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabase';
import { MiniWorldMap } from './InteractiveWorldMap';
import worldCitiesData from '@/app/utils/world_cities.json';
import './travel-map.css';

// ==========================================
// 1. Travel Dashboard (Image 1)
// ==========================================
export function TravelDashboard() {
  const destinations = [
    { name: 'Tokyo, Japan', date: 'Oct 2023', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400' },
    { name: 'Paris, France', date: 'Aug 2023', img: 'https://images.unsplash.com/photo-1502602898657-3e90760b646e?auto=format&fit=crop&q=80&w=400' },
    { name: 'Bali, Indonesia', date: 'May 2023', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400' },
    { name: 'New York, USA', date: 'Jan 2023', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <div className="travel-dashboard animate-fade-in">
      <div className="dashboard-hero">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
          alt="World Map" 
          className="dashboard-map-bg"
          style={{ opacity: 0.15, filter: 'brightness(0) saturate(100%) invert(86%) sepia(51%) saturate(1588%) hue-rotate(345deg) brightness(101%) contrast(106%)' }} // Fake yellow tint for mock
        />
        <div className="dashboard-hero-card">
          <h2>Ready for the next<br/>adventure</h2>
          <p>Sharing my journey with SnapTrip since 2022. Every mile is a story, every city a new perspective.</p>
        </div>
      </div>

      <div className="dashboard-stats-row">
        <div className="stat-item">
          <span className="stat-number">19</span>
          <span className="stat-label">Countries</span>
          <div className="stat-desc">Visited across 4 continents</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">191</span>
          <span className="stat-label">Cities</span>
          <div className="stat-desc">Memories made in every corner</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">191</span>
          <span className="stat-label">Places</span>
          <div className="stat-desc">Explored beautiful places</div>
        </div>
      </div>

      <div className="recent-destinations-section">
        <div className="section-header">
          <h3>Recent Destinations</h3>
          <a href="#" className="view-gallery-link">View Gallery →</a>
        </div>
        <div className="destinations-grid">
          {destinations.map((dest, i) => (
            <div className="destination-card" key={i}>
              <img src={dest.img} alt={dest.name} />
              <div className="destination-card-overlay">
                <h4>{dest.name}</h4>
                <p>{dest.date}</p>
              </div>
            </div>
          ))}
        </div>
              </div>
      </div>
  );
}

// ==========================================
// 2. Digital Passport (Image 2)
// ==========================================
export function DigitalPassport({ 
  onCountriesSelect, 
  userRatingsDb = [] 
}: { 
  onCountriesSelect?: (countries: string[]) => void, 
  userRatingsDb?: any[] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedContinents, setExpandedContinents] = useState<Record<string, boolean>>({ Africa: true });
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const visitedCountries = new Set(userRatingsDb.map(r => r.country));

  const continentsData = [
    { 
      name: 'Africa', 
      total: 54, 
      countries: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'] 
    },
    { 
      name: 'Americas', 
      total: 35, 
      countries: ['Antigua and Barbuda', 'Argentina', 'Bahamas', 'Barbados', 'Belize', 'Bolivia', 'Brazil', 'Canada', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'Ecuador', 'El Salvador', 'Grenada', 'Guatemala', 'Guyana', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Suriname', 'Trinidad and Tobago', 'United States of America', 'Uruguay', 'Venezuela'] 
    },
    { 
      name: 'Asia', 
      total: 49, 
      countries: ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'] 
    },
    { 
      name: 'Europe', 
      total: 44, 
      countries: ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'] 
    },
    { 
      name: 'Oceania', 
      total: 14, 
      countries: ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'] 
    }
  ];

  const toggleContinent = (name: string) => {
    setExpandedContinents(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="digital-passport animate-fade-in" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="passport-header" style={{ marginBottom: '24px' }}>
        <div className="passport-title" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', color: '#031B4E', fontFamily: '"Playfair Display", serif', margin: '0 0 4px' }}>Digital Passport</h2>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Track your global footprint and curate your travel heritage.</p>
        </div>
        <div className="passport-search" style={{ position: 'relative' }}>
          <span className="passport-search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search countries..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }}
          />
        </div>
      </div>

      <div className="passport-continents" style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
        {continentsData.map((continent, idx) => {
          const filteredCountries = continent.countries.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
          const visitedInContinent = continent.countries.filter(c => visitedCountries.has(c)).length;
          
          if (searchQuery && filteredCountries.length === 0) return null;

          const isExpanded = expandedContinents[continent.name] || searchQuery.length > 0;

          return (
            <div className="continent-section" key={idx} style={{ marginBottom: '16px' }}>
              <div 
                className="continent-header" 
                onClick={() => toggleContinent(continent.name)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', cursor: 'pointer', marginBottom: isExpanded ? '12px' : '0' }}
              >
                <div className="continent-title" style={{ fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#9CA3AF', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s', fontSize: '12px' }}>▼</span>
                  {continent.name}
                </div>
                <div className="continent-count" style={{ fontSize: '12px', background: '#E2E8F0', padding: '4px 8px', borderRadius: '12px', color: '#475569', fontWeight: 600 }}>
                  {visitedInContinent} / {continent.total} Visited
                </div>
              </div>
              
              {isExpanded && (
                <div className="country-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {filteredCountries.map((c, i) => {
                    const isVisited = visitedCountries.has(c);
                    const isChecked = selectedCountries.includes(c);
                    return (
                      <div 
                        className="country-item" 
                        key={i} 
                        onClick={() => setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                          padding: '10px 16px', background: isChecked ? '#FFFBF0' : '#FFF', 
                          border: '1px solid', borderColor: isChecked ? '#F6B800' : '#E5E7EB', 
                          borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <div className="country-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="country-flag" style={{ fontSize: '16px' }}>🌍</span>
                          <span className="country-name" style={{ fontSize: '14px', color: '#1E293B', fontWeight: isChecked || isVisited ? 600 : 400 }}>
                            {c} {isVisited && <span style={{ fontSize: '10px', color: '#10B981', background: '#D1FAE5', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>VISITED</span>}
                          </span>
                        </div>
                        <div 
                          className="country-checkbox" 
                          style={{ 
                            width: '20px', height: '20px', borderRadius: '6px', 
                            border: '2px solid', borderColor: isChecked ? '#F6B800' : '#CBD5E1', 
                            background: isChecked ? '#F6B800' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          {isChecked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedCountries.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#031B4E' }}>{selectedCountries.length} countries selected</span>
          <button 
            onClick={() => onCountriesSelect && onCountriesSelect(selectedCountries)}
            style={{ padding: '12px 24px', background: '#F6B800', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            Rate Selected Countries
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================

// 3. Wandered Places (Image 3)
// ==========================================
export function WanderedPlaces({ 
  country, 
  selectedCities, 
  initialCityRatings,
  userId, isCountryLevel,
  onSaveRating,
  onClose
}: { 
  country?: string, 
  selectedCities?: string[], 
  initialCityRatings?: Record<string, Record<string, number>>,
  userId?: string, isCountryLevel?: boolean,
  onSaveRating?: (rating: number) => void,
  onClose?: () => void
}) {
  const places = selectedCities && selectedCities.length > 0 ? selectedCities : ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Kerala'];
  const [activePlace, setActivePlace] = useState(places[0]);
  
  // Store ratings for each city separately
  const [cityRatings, setCityRatings] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    places.forEach(place => {
      // Use DB ratings if they exist, otherwise initialize to 0
      if (initialCityRatings && initialCityRatings[place]) {
        initial[place] = initialCityRatings[place];
      } else {
        initial[place] = {
          Sightseeing: 0,
          'Local people': 0,
          'Service quality': 0,
          Safety: 0,
          'Price/quality': 0,
          'Local cuisine': 0
        };
      }
    });
    return initial;
  });

  const handleStarClick = (category: string, stars: number) => {
    setCityRatings(prev => ({
      ...prev,
      [activePlace]: {
        ...prev[activePlace],
        [category]: stars
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Calculate average rating for the whole country across all selected cities
      let totalCountryScore = 0;
      let totalCategories = 0;
      
      const cityRatingsToSave = places.map(city => {
        const ratings = cityRatings[city] || {
          Sightseeing: 0, 'Local people': 0, 'Service quality': 0, Safety: 0, 'Price/quality': 0, 'Local cuisine': 0
        };
        const values = Object.values(ratings);
        const cityAvg = values.reduce((a, b) => a + (b as number), 0) / (values.length || 1);
        
        totalCountryScore += cityAvg;
        if (cityAvg > 0) totalCategories++;
        
        return {
          city: city,
          country: isCountryLevel ? city : (country || 'Unknown'),
          ratings,
          average_score: cityAvg
        };
      });
      
      // Save to Supabase
      if (userId) {
        const inserts = cityRatingsToSave.map(c => ({
          user_id: userId,
          country: c.country,
          city: c.city,
          ratings: c.ratings,
          average_score: c.average_score,
          updated_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
          .from('user_city_ratings')
          .upsert(inserts, { onConflict: 'user_id,city' });
          
        if (error) {
          console.error("Supabase upsert error:", error);
          alert("Failed to save to database: " + error.message);
        }
      }

      // Pass the overall country average to the parent to update the map color
      const overallAvg = totalCategories > 0 ? totalCountryScore / totalCategories : 0;
      if (onSaveRating) {
        onSaveRating(overallAvg);
      }
    } catch (e) {
      console.error("Error saving ratings:", e);
      if (onSaveRating) onSaveRating(3); // Fallback
    }
  };

  const currentRatings = cityRatings[activePlace] || {};
  
  // Calculate average for the CURRENT CITY being viewed
  const currentCityValues = Object.values(currentRatings);
  const currentCityAvg = currentCityValues.length > 0 
    ? (currentCityValues.reduce((a, b) => a + b, 0) / currentCityValues.length).toFixed(1)
    : "0.0";

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div 
        className="wandered-places animate-pop" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          position: 'relative', 
          maxWidth: '900px', 
          width: '100%', 
          display: 'flex', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          border: 'none',
          padding: 0,
          marginTop: 0
        }}
      >
        {onClose && (
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', zIndex: 10, color: '#9CA3AF' }}>✕</button>
        )}
        <div className="places-sidebar" style={{ borderRight: '1px solid #E5E7EB', flex: '0 0 350px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#F6B800', marginBottom: '8px', fontWeight: 700 }}>Wandered Places</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '30px' }}>Track cities and attractions you've explored</p>
          
          <div className="places-search">
            <span className="places-search-icon">🔍</span>
            <input type="text" placeholder="Search cities or attractions..." />
          </div>
          
          <div className="places-selected-count">
            {places.length} of {places.length} selected
          </div>
          
          <div className="places-list">
            {places.map((place, idx) => (
              <div 
                className={`place-item ${activePlace === place ? 'active' : ''}`} 
                key={idx}
                onClick={() => setActivePlace(place)}
              >
                <span className="place-name">{place}</span>
                <span className="place-arrow">v</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rating-area" style={{ flex: 1, padding: '40px' }}>
          <div className="rating-header">
            <div className="rating-title">
              <h2>Rate {activePlace}</h2>
              <div className="rating-region">📍 {isCountryLevel ? 'Country Overview' : (country || 'India')}</div>
            </div>
            <div className="rating-score">
              <div className="rating-score-number">{currentCityAvg}</div>
              <div className="rating-score-label">AVERAGE CITY RATE</div>
            </div>
          </div>
          
          <div className="rating-categories">
            <h4>Rate your experience in {activePlace}</h4>
            
            {Object.entries(currentRatings).map(([label, stars], i) => (
              <div className="rating-row" key={i}>
                <div className="rating-label">{label}</div>
                <div className="rating-stars">
                  {[1,2,3,4,5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => handleStarClick(label, star)}
                      style={{ color: star <= (stars as number) ? '#F6B800' : '#E5E7EB', cursor: 'pointer' }}
                    >
                      ☆
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleSave}
            style={{ width: '100%', marginTop: '24px', background: '#031B4E', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Rating to Map
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// City Checklist Popup
// ==========================================
export function CityChecklist({ 
  country, 
  initialSelectedCities,
  onContinue,
  onCancel
}: { 
  country: string; 
  initialSelectedCities?: string[];
  onContinue: (selectedCities: string[]) => void;
  onCancel: () => void;
}) {
  const [selectedCities, setSelectedCities] = useState<string[]>(initialSelectedCities || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real city data from AI/API
  const countryCitiesMap: Record<string, string[]> = worldCitiesData as Record<string, string[]>;

  // Fallback to a generic list if country not specifically mapped
  const allCities = countryCitiesMap[country] || [
    'Capital City', 'Major Hub', 'Coastal Town', 'Historic Center', 
    'Mountain Village', 'Business District', 'Old Port', 'Cultural Center',
    'Lake District', 'University Town', 'Resort Area', 'Market City',
    'North City', 'South City', 'East City', 'West City', 'Central City',
    'New Town', 'Old Town', 'Seaside Resort'
  ];
  
  const filteredCities = allCities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  return (
    <div className="share-modal-overlay" onClick={onCancel}>
      <div className="share-modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', padding: '40px', background: '#FFF' }}>
        <button className="share-modal-close" onClick={onCancel}>✕</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
          <div className="continent-title" style={{ fontSize: '1.4rem' }}>
            <span style={{ color: '#9CA3AF' }}>^</span> {country}
          </div>
          <div className="continent-count">
            {selectedCities.length} / {allCities.length} Visited
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔍</span>
            <input 
              type="text" 
              placeholder={`Search cities in ${country}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
        </div>
        
        <div className="country-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredCities.map(city => {
            const isChecked = selectedCities.includes(city);
            return (
              <div className="country-item" key={city} onClick={() => toggleCity(city)} style={{ cursor: 'pointer', background: isChecked ? '#FFFBF0' : '#FFF', borderColor: isChecked ? '#F6B800' : '#E5E7EB' }}>
                <div className="country-info">
                  <span className="country-flag">📍</span>
                  <span className="country-name">{city}</span>
                </div>
                <div className={`country-checkbox ${isChecked ? 'checked' : ''}`}></div>
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '32px', textAlign: 'right' }}>
          <button 
            onClick={() => onContinue(selectedCities)}
            disabled={selectedCities.length === 0}
            style={{ 
              padding: '14px 32px', background: selectedCities.length > 0 ? '#F6B800' : '#E5E7EB', 
              color: selectedCities.length > 0 ? '#111827' : '#9CA3AF', 
              border: 'none', borderRadius: '8px', fontWeight: 700, cursor: selectedCities.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', fontSize: '16px'
            }}
          >
            Continue to Rating
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. Share Modal (Image 4)
// ==========================================
export function ShareJourneyModal({ 
  userRatingsDb = [],
  countryData = {},
  username = "Wanderer",
  onClose 
}: { 
  userRatingsDb?: any[];
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

      const text = encodeURIComponent("Check out my travel journey on SnapTrip!");
      const url = encodeURIComponent("https://snaptrip.app");

      let shareUrl = "";
      if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      else if (platform === 'whatsapp') shareUrl = `https://web.whatsapp.com/send?text=${text} ${url}`;

      if (shareUrl) {
        setTimeout(() => { window.open(shareUrl, '_blank'); }, 300);
      }

    } catch (err) {
      console.error('Failed to capture image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const uniqueCountries = Array.from(new Set(userRatingsDb.map(r => r.country)));
  const totalCountries = uniqueCountries.length;
  const totalCities = userRatingsDb.filter(r => r.city !== 'General').length; 
  const percentWorld = Math.max(1, Math.round((totalCountries / 195) * 100));
  
  const countryCounts = userRatingsDb.reduce((acc, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topDest = Object.keys(countryCounts).sort((a,b) => countryCounts[b] - countryCounts[a])[0] || 'Start Traveling!';
  
  const sortedCities = userRatingsDb.filter(r => r.city !== 'General').map(r => `${r.city}, ${r.country}`).sort();
  const northernmost = sortedCities.length > 0 ? sortedCities[0] : 'N/A';
  const southernmost = sortedCities.length > 1 ? sortedCities[sortedCities.length - 1] : (sortedCities[0] || 'N/A');
  const favRegion = topDest !== 'Start Traveling!' ? topDest : 'N/A';
  
  const keyPlacesCount = Math.min(6, totalCities || 1);

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
        <button className="share-modal-close" onClick={onClose} style={{ zIndex: 50, color: '#9CA3AF' }}>✕</button>
        
        <div style={{ padding: '32px 32px 0' }}>
          <div className="share-modal-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Share your journey</h2>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '15px' }}>Show the world where you've been</p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FBBF24', fontSize: '20px', marginBottom: '8px' }}>🌍</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>{totalCountries}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.5px', marginTop: '8px' }}>COUNTRIES ({percentWorld}%)</div>
            </div>
            <div style={{ width: '1px', height: '50px', background: '#F3F4F6' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FBBF24', fontSize: '20px', marginBottom: '8px' }}>🏢</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>{totalCities}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.5px', marginTop: '8px' }}>CITIES VISITED</div>
            </div>
            <div style={{ width: '1px', height: '50px', background: '#F3F4F6' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FBBF24', fontSize: '20px', marginBottom: '8px' }}>📍</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>{keyPlacesCount}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.5px', marginTop: '8px' }}>KEY PLACES</div>
            </div>
          </div>
          
          <div className="share-preview-divider" style={{ textAlign: 'center', position: 'relative', marginBottom: '32px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#F3F4F6', zIndex: 1 }}></div>
            <span style={{ position: 'relative', zIndex: 2, background: '#fff', padding: '0 16px', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '1px' }}>PREVIEW OF YOUR SHAREABLE POST</span>
          </div>
        </div>
        
        <div style={{ padding: '0 32px' }}>
          <div className="shareable-card" ref={cardRef} style={{ 
            background: '#ffffff', 
            border: '1px solid #F3F4F6',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            paddingBottom: '24px'
          }}>
            <div className="shareable-header" style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'relative' }}>
              <div className="shareable-logo" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#031B4E' }}>SnapTrip</div>
              <div className="shareable-user" style={{ background: '#F3F4F6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#D1D5DB', overflow: 'hidden' }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" style={{ width: '100%', height: '100%' }} alt="avatar" />
                </div>
                @{username.replace(/\s+/g, '_').toLowerCase()}
              </div>
            </div>
            
            <div className="shareable-map" style={{ height: '180px', position: 'relative', marginTop: '-10px' }}>
               <MiniWorldMap countryData={countryData} />
            </div>
            
            <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', color: '#9CA3AF' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>TOP DESTINATION</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{topDest}</div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', color: '#9CA3AF' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>NORTHERNMOST</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{northernmost}</div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', color: '#9CA3AF' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>SOUTHERNMOST</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{southernmost}</div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', color: '#9CA3AF' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>FAVORITE REGION</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{favRegion}</div>
              </div>
            </div>
            
            <div style={{ padding: '24px 24px 0', display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '1.5px', marginBottom: '2px' }}>COUNTRIES</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{totalCountries}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '1.5px', marginBottom: '2px' }}>CITIES</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{totalCities}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '0 32px 32px' }}>
          <div className="share-social-links" style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '24px 0', opacity: isDownloading ? 0.5 : 1, pointerEvents: isDownloading ? 'none' : 'auto' }}>
            <div onClick={() => handleShare('instagram')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#EF4444', letterSpacing: '0.5px' }}>INSTAGRAM</span>
            </div>
            
            <div onClick={() => handleShare('facebook')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.5px' }}>FACEBOOK</span>
            </div>
            
            <div onClick={() => handleShare('twitter')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#374151', letterSpacing: '0.5px' }}>X</span>
            </div>
            
            <div onClick={() => handleShare('linkedin')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.5px' }}>LINKEDIN</span>
            </div>
            
            <div onClick={() => handleShare('whatsapp')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 1.748.458 3.45 1.321 4.956L2 22l5.255-1.378A9.853 9.853 0 0 0 11.99 22c5.46 0 9.914-4.448 9.919-9.91a9.812 9.812 0 0 0-2.908-6.982zM11.992 20.332c-1.479 0-2.932-.398-4.2-1.148l-.301-.178-3.123.818.833-3.041-.196-.312a8.183 8.183 0 0 1-1.258-4.382c.004-4.542 3.704-8.24 8.25-8.24 2.202.002 4.27.859 5.827 2.418a8.188 8.188 0 0 1 2.41 5.825c-.004 4.54-3.705 8.24-8.242 8.24zm4.518-6.167c-.247-.124-1.463-.723-1.692-.808-.228-.08-.394-.123-.559.124-.166.246-.641.808-.784.969-.143.166-.29.185-.537.062-.247-.125-1.045-.385-1.99-1.23-.735-.65-1.23-1.456-1.375-1.703-.143-.247-.015-.38.107-.504.11-.11.247-.287.37-.43.124-.143.165-.246.248-.411.082-.164.041-.311-.02-.434-.062-.124-.559-1.348-.765-1.846-.201-.486-.405-.42-.559-.428-.143-.006-.31-.008-.475-.008a.916.916 0 0 0-.661.309c-.228.246-.867.848-.867 2.066s.889 2.395 1.013 2.56c.124.164 1.745 2.663 4.232 3.738.591.255 1.052.408 1.411.522.595.19 1.137.163 1.564.099.475-.072 1.463-.598 1.668-1.176.206-.579.206-1.075.143-1.177-.061-.102-.227-.164-.474-.288z"/></svg>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#10B981', letterSpacing: '0.5px' }}>WHATSAPP</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn-copy-link" style={{ 
              padding: '14px 40px', 
              background: '#FBBF24', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '9999px', 
              fontWeight: 800, 
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px 0 rgba(251, 191, 36, 0.39)',
              transition: 'transform 0.2s',
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              COPY SHARABLE LINK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
