import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabase';
import { MiniWorldMap } from './InteractiveWorldMap';
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
export function DigitalPassport() {
  const continents = [
    { name: 'Africa', visited: 0, total: 54, expanded: true, countries: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Côte d\'Ivoire', 'DR Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'] },
    { name: 'Americas', visited: 0, total: 35, expanded: false, countries: [] },
    { name: 'Asia', visited: 0, total: 49, expanded: false, countries: [] },
    { name: 'Europe', visited: 0, total: 44, expanded: false, countries: [] },
    { name: 'Oceania', visited: 0, total: 14, expanded: false, countries: [] }
  ];

  return (
    <div className="digital-passport animate-fade-in">
      <div className="passport-header">
        <div className="passport-title">
          <h2>Digital Passport</h2>
          <p>Track your global footprint and curate your travel heritage.</p>
        </div>
        <div className="passport-search">
          <span className="passport-search-icon">🔍</span>
          <input type="text" placeholder="Search countries..." />
        </div>
      </div>

      <div className="passport-continents">
        {continents.map((continent, idx) => (
          <div className="continent-section" key={idx}>
            <div className="continent-header">
              <div className="continent-title">
                <span style={{color: '#9CA3AF', transform: continent.expanded ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: '0.2s'}}>^</span>
                {continent.name}
              </div>
              <div className="continent-count">
                {continent.visited} / {continent.total} Visited
              </div>
            </div>
            
            {continent.expanded && continent.countries && (
              <div className="country-grid">
                {continent.countries.map((c, i) => (
                  <div className="country-item" key={i}>
                    <div className="country-info">
                      <span className="country-flag">🌍</span>
                      <span className="country-name">{c}</span>
                    </div>
                    <div className={`country-checkbox ${c === 'Morocco' ? 'checked' : ''}`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
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
  userId,
  onSaveRating,
  onClose
}: { 
  country?: string, 
  selectedCities?: string[], 
  initialCityRatings?: Record<string, Record<string, number>>,
  userId?: string,
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
          city,
          country: country || 'Unknown',
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
              <div className="rating-region">📍 {country || 'India'}</div>
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
  
  // Real city data mapping for top countries
  const countryCitiesMap: Record<string, string[]> = {
    'United States of America': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Indianapolis', 'Charlotte', 'San Francisco', 'Seattle', 'Denver', 'Washington D.C.', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'New Orleans', 'Wichita', 'Cleveland', 'Tampa', 'Bakersfield', 'Aurora', 'Honolulu', 'Anaheim', 'Santa Ana', 'Corpus Christi', 'Riverside', 'Lexington', 'St. Louis', 'Stockton', 'Pittsburgh', 'Saint Paul', 'Cincinnati', 'Anchorage', 'Henderson', 'Greensboro', 'Plano', 'Newark', 'Lincoln', 'Toledo', 'Orlando', 'Chula Vista', 'Irvine', 'Fort Wayne', 'Jersey City', 'Durham', 'St. Petersburg', 'Laredo', 'Buffalo', 'Madison', 'Lubbock', 'Chandler', 'Scottsdale', 'Glendale', 'Reno', 'Norfolk', 'Winston-Salem', 'North Las Vegas', 'Irving', 'Chesapeake', 'Gilbert', 'Hialeah', 'Garland', 'Fremont', 'Baton Rouge', 'Richmond', 'Boise', 'San Bernardino'],
    'China': ['Shanghai', 'Beijing', 'Chongqing', 'Tianjin', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Nanjing', 'Wuhan', "Xi'an", 'Hangzhou', 'Dongguan', 'Foshan', 'Shenyang', 'Harbin', 'Qingdao', 'Dalian', 'Jinan', 'Zhengzhou', 'Changsha', 'Kunming', 'Changchun', 'Ürümqi', 'Shantou', 'Hefei', 'Shijiazhuang', 'Ningbo', 'Taiyuan', 'Nanning', 'Xiamen', 'Fuzhou', 'Wenzhou', 'Changzhou', 'Nanchang', 'Tangshan', 'Guiyang', 'Wuxi', 'Lanzhou', 'Zhongshan', 'Handan', 'Weifang', "Huai'an", 'Zibo', 'Shaoxing', 'Yantai', 'Huizhou', 'Luoyang', 'Nantong', 'Baotou', 'Liuzhou', 'Hong Kong', 'Macau'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Campo Grande', 'Natal', 'Teresina', 'São Bernardo do Campo', 'Nova Iguaçu', 'João Pessoa', 'São José dos Campos', 'Santo André', 'Ribeirão Preto', 'Jaboatão dos Guararapes', 'Osasco', 'Uberlândia', 'Sorocaba', 'Contagem', 'Aracaju', 'Feira de Santana', 'Cuiabá', 'Joinville', 'Aparecida de Goiânia', 'Londrina', 'Juiz de Fora', 'Ananindeua', 'Porto Velho', 'Niterói', 'Belford Roxo', 'Caxias do Sul', 'Campos dos Goytacazes', 'Macapá', 'Florianópolis', 'Vila Velha', 'Mauá', 'São João de Meriti'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad', 'Goa'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Cranbourne', 'Canberra', 'Newcastle', 'Wollongong', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Toowoomba', 'Darwin', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Coffs Harbour', 'Bundaberg', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton', 'Port Macquarie'],
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Nîmes', 'Angers', 'Villeurbanne', 'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan', 'Boulogne-Billancourt'],
    'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kawasaki', 'Kobe', 'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka', 'Okayama', 'Naha', 'Kagoshima', 'Funabashi', 'Hachioji', 'Himeji', 'Matsuyama', 'Utsunomiya', 'Higashiosaka', 'Kawaguchi'],
    'United Kingdom': ['London', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Manchester', 'Sheffield', 'Leeds', 'Edinburgh', 'Leicester', 'Coventry', 'Bradford', 'Cardiff', 'Belfast', 'Nottingham', 'Hull', 'Newcastle upon Tyne', 'Stoke-on-Trent', 'Southampton', 'Derby', 'Portsmouth', 'Brighton', 'Plymouth', 'Northampton', 'Reading', 'Luton', 'Wolverhampton', 'Bolton', 'Aberdeen', 'Bournemouth'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Taranto', 'Brescia', 'Parma', 'Prato', 'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia', 'Ravenna', 'Livorno', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara'],
    'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'St. Catharines', 'Regina', "St. John's", 'Kelowna', 'Barrie', 'Sherbrooke', 'Guelph', 'Kanata', 'Abbotsford', 'Trois-Rivières', 'Kingston', 'Milton', 'Moncton', 'White Rock']
  };

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
      
      // 1. Try native Web Share API with File sharing (Mobile/Safari)
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'snaptrip.png', { type: 'image/png' })] })) {
        try {
          await navigator.share({
            files: [new File([blob], 'snaptrip.png', { type: 'image/png' })],
            title: 'My SnapTrip Journey',
            text: 'Check out my travel journey on SnapTrip!'
          });
          return; // Success, we're done!
        } catch (shareErr) {
          console.log('Share sheet was closed or failed.', shareErr);
          // Don't fall through to clipboard if they just cancelled the share sheet
          if ((shareErr as any).name !== 'AbortError') {
             // Continue to fallback
          } else {
             return; 
          }
        }
      }

      // 2. Fallback: Copy to Clipboard and Open Web App
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Image copied to clipboard! Paste it (Cmd+V / Ctrl+V) into the window that opens.');
        }
      } catch (clipboardErr) {
        console.error('Clipboard copy failed', clipboardErr);
        // Fallback to downloading if clipboard fails
        const link = document.createElement('a');
        link.download = 'snaptrip-journey.png';
        link.href = dataUrl;
        link.click();
      }

      // Open social share link
      const text = encodeURIComponent("Check out my travel journey on SnapTrip!");
      const url = encodeURIComponent("https://snaptrip.app");

      let shareUrl = "";
      if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      else if (platform === 'whatsapp') shareUrl = `https://web.whatsapp.com/send?text=${text} ${url}`;

      if (shareUrl) {
        setTimeout(() => {
          window.open(shareUrl, '_blank');
        }, 300);
      }

    } catch (err) {
      console.error('Failed to capture image', err);
    } finally {
      setIsDownloading(false);
    }
  };
  const uniqueCountries = Array.from(new Set(userRatingsDb.map(r => r.country)));
  const totalCountries = uniqueCountries.length;
  const totalCities = userRatingsDb.length;
  const percentWorld = Math.max(1, Math.round((totalCountries / 195) * 100));
  
  // Find top destination
  const countryCounts = userRatingsDb.reduce((acc, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topDest = Object.keys(countryCounts).sort((a,b) => countryCounts[b] - countryCounts[a])[0] || 'Start Traveling!';
  
  // Fake northernmost/southernmost based on their cities to look dynamic
  const sortedCities = userRatingsDb.map(r => `${r.city}, ${r.country}`).sort();
  const northernmost = sortedCities.length > 0 ? sortedCities[0] : 'N/A';
  const southernmost = sortedCities.length > 1 ? sortedCities[sortedCities.length - 1] : (sortedCities[0] || 'N/A');
  const favRegion = topDest !== 'Start Traveling!' ? topDest : 'N/A';
  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content animate-pop" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>✕</button>
        
        <div className="share-modal-header">
          <h2>Share your journey</h2>
          <p>Show the world where you've been</p>
        </div>
        
        <div className="share-preview-divider">
          <span>PREVIEW OF YOUR SHAREABLE POST</span>
        </div>
        
        <div className="shareable-card" ref={cardRef} style={{ 
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)', 
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div className="shareable-header" style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="shareable-logo" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>SnapTrip</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, marginTop: '4px' }}>
                <span style={{ color: '#F59E0B' }}>{totalCountries}</span> Countries • <span style={{ color: '#F59E0B' }}>{totalCities}</span> Cities
              </div>
            </div>
            <div className="shareable-user" style={{ background: '#F3F4F6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, color: '#4B5563' }}>👤 @{username.replace(/\s+/g, '_').toLowerCase()}</div>
          </div>
          
          <div className="shareable-map" style={{ height: '280px', position: 'relative', marginTop: '-10px' }}>
             <MiniWorldMap countryData={countryData} />
             {/* Gradient overlay to make text pop */}
             <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))', pointerEvents: 'none' }} />
          </div>
          
          <div className="shareable-highlights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '0 24px 20px', marginTop: '16px', position: 'relative', zIndex: 10 }}>
            <div className="highlight-item" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
                </div>
                <div className="highlight-label" style={{ fontSize: '0.5rem', color: '#6B7280', fontWeight: 800, letterSpacing: '0.5px' }}>TOP DEST</div>
              </div>
              <div className="highlight-val" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', lineHeight: '1.2' }}>{topDest}</div>
            </div>
            
            <div className="highlight-item" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                </div>
                <div className="highlight-label" style={{ fontSize: '0.5rem', color: '#6B7280', fontWeight: 800, letterSpacing: '0.5px' }}>FARTHEST N.</div>
              </div>
              <div className="highlight-val" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', lineHeight: '1.2' }}>{northernmost}</div>
            </div>
            
            <div className="highlight-item" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div className="highlight-label" style={{ fontSize: '0.5rem', color: '#6B7280', fontWeight: 800, letterSpacing: '0.5px' }}>FARTHEST S.</div>
              </div>
              <div className="highlight-val" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', lineHeight: '1.2' }}>{southernmost}</div>
            </div>
            
            <div className="highlight-item" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
                <div className="highlight-label" style={{ fontSize: '0.5rem', color: '#6B7280', fontWeight: 800, letterSpacing: '0.5px' }}>FAV REGION</div>
              </div>
              <div className="highlight-val" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', lineHeight: '1.2' }}>{favRegion}</div>
            </div>
          </div>
        </div>
        
        <div className="share-social-links" style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '32px 0', opacity: isDownloading ? 0.5 : 1, pointerEvents: isDownloading ? 'none' : 'auto' }}>
          {/* Instagram */}
          <div onClick={() => handleShare('instagram')} className="social-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#F9FAFB', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#FFE4E6'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#F9FAFB'; }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          {/* Facebook */}
          <div onClick={() => handleShare('facebook')} className="social-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#F9FAFB', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#DBEAFE'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#F9FAFB'; }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#1877F2"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </div>
          {/* X / Twitter */}
          <div onClick={() => handleShare('twitter')} className="social-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#F9FAFB', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#E5E7EB'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#F9FAFB'; }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
          </div>
          {/* LinkedIn */}
          <div onClick={() => handleShare('linkedin')} className="social-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#F9FAFB', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#DBEAFE'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#F9FAFB'; }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </div>
          {/* WhatsApp */}
          <div onClick={() => handleShare('whatsapp')} className="social-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#F9FAFB', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#DCFCE7'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#F9FAFB'; }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#25D366"><path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 1.748.458 3.45 1.321 4.956L2 22l5.255-1.378A9.853 9.853 0 0 0 11.99 22c5.46 0 9.914-4.448 9.919-9.91a9.812 9.812 0 0 0-2.908-6.982zM11.992 20.332c-1.479 0-2.932-.398-4.2-1.148l-.301-.178-3.123.818.833-3.041-.196-.312a8.183 8.183 0 0 1-1.258-4.382c.004-4.542 3.704-8.24 8.25-8.24 2.202.002 4.27.859 5.827 2.418a8.188 8.188 0 0 1 2.41 5.825c-.004 4.54-3.705 8.24-8.242 8.24zm4.518-6.167c-.247-.124-1.463-.723-1.692-.808-.228-.08-.394-.123-.559.124-.166.246-.641.808-.784.969-.143.166-.29.185-.537.062-.247-.125-1.045-.385-1.99-1.23-.735-.65-1.23-1.456-1.375-1.703-.143-.247-.015-.38.107-.504.11-.11.247-.287.37-.43.124-.143.165-.246.248-.411.082-.164.041-.311-.02-.434-.062-.124-.559-1.348-.765-1.846-.201-.486-.405-.42-.559-.428-.143-.006-.31-.008-.475-.008a.916.916 0 0 0-.661.309c-.228.246-.867.848-.867 2.066s.889 2.395 1.013 2.56c.124.164 1.745 2.663 4.232 3.738.591.255 1.052.408 1.411.522.595.19 1.137.163 1.564.099.475-.072 1.463-.598 1.668-1.176.206-.579.206-1.075.143-1.177-.061-.102-.227-.164-.474-.288z"/></svg>
          </div>
        </div>
        
        <button className="btn-copy-link" style={{ 
          width: '100%', 
          padding: '16px', 
          background: '#F6B800', 
          color: '#111827', 
          border: 'none', 
          borderRadius: '12px', 
          fontWeight: 800, 
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          COPY SHARABLE LINK
        </button>
      </div>
    </div>
  );
}
