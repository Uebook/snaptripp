import React, { useState } from 'react';
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
export function WanderedPlaces() {
  const places = ['Agra', 'Ahmedabad', 'Ajanta', 'Amritsar', 'Bangalore', 'Chennai'];
  const [activePlace, setActivePlace] = useState('Agra');

  return (
    <div className="wandered-places animate-fade-in">
      <div className="places-sidebar">
        <h2>Wandered Places</h2>
        <p>Track cities and attractions you've explored</p>
        
        <div className="places-search">
          <span className="places-search-icon">🔍</span>
          <input type="text" placeholder="Search cities or attractions..." />
        </div>
        
        <div className="places-selected-count">
          0 of 120 selected
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
      
      <div className="rating-area">
        <div className="rating-header">
          <div className="rating-title">
            <h2>Rate India</h2>
            <div className="rating-region">📍 SOUTH ASIA</div>
          </div>
          <div className="rating-score">
            <div className="rating-score-number">7.3</div>
            <div className="rating-score-label">AVERAGE COUNTRY RATE</div>
          </div>
        </div>
        
        <div className="rating-categories">
          <h4>Rate your experience</h4>
          
          {[
            { label: 'Sightseeing', stars: 4 },
            { label: 'Local people', stars: 5 },
            { label: 'Service quality', stars: 3 },
            { label: 'Safety', stars: 4 },
            { label: 'Price/quality', stars: 4 },
            { label: 'Local cuisine', stars: 0 }
          ].map((cat, i) => (
            <div className="rating-row" key={i}>
              <div className="rating-label">{cat.label}</div>
              <div className="rating-stars">
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: star <= cat.stars ? '#F6B800' : '#E5E7EB' }}>☆</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. Share Modal (Image 4)
// ==========================================
export function ShareJourneyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content animate-pop" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>✕</button>
        
        <div className="share-modal-header">
          <h2>Share your journey</h2>
          <p>Show the world where you've been</p>
        </div>
        
        <div className="share-stats-overview">
          <div className="share-stat">
            <div className="share-stat-icon">🌎</div>
            <div className="share-stat-num">17</div>
            <div className="share-stat-label">COUNTRIES (7%)</div>
          </div>
          <div className="share-stat">
            <div className="share-stat-icon">🏢</div>
            <div className="share-stat-num">60</div>
            <div className="share-stat-label">CITIES VISITED</div>
          </div>
          <div className="share-stat">
            <div className="share-stat-icon">📍</div>
            <div className="share-stat-num">6</div>
            <div className="share-stat-label">KEY PLACES</div>
          </div>
        </div>
        
        <div className="share-preview-divider">
          <span>PREVIEW OF YOUR SHAREABLE POST</span>
        </div>
        
        <div className="shareable-card">
          <div className="shareable-header">
            <div className="shareable-logo">SnapTrip</div>
            <div className="shareable-user">👤 @Sree_travels</div>
          </div>
          
          <div className="shareable-map">
             <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
              alt="World Map" 
              style={{ width: '150%', opacity: 0.2, margin: '-20px 0 0 -20px' }}
            />
          </div>
          
          <div className="shareable-highlights">
            <div className="highlight-item">
              <div className="highlight-label">↗ TOP DESTINATION</div>
              <div className="highlight-val">Japan</div>
            </div>
            <div className="highlight-item">
              <div className="highlight-label">↗ NORTHERNMOST</div>
              <div className="highlight-val">Oslo, Norway</div>
            </div>
            <div className="highlight-item">
              <div className="highlight-label">↘ SOUTHERNMOST</div>
              <div className="highlight-val">Ushuaia, Argentina</div>
            </div>
            <div className="highlight-item">
              <div className="highlight-label">♡ FAVORITE REGION</div>
              <div className="highlight-val">Europe</div>
            </div>
          </div>
          
          <div className="shareable-footer">
            <div className="footer-stat">
              <div className="highlight-label">COUNTRIES</div>
              <div className="highlight-val">17</div>
            </div>
            <div className="footer-stat">
              <div className="highlight-label">CITIES</div>
              <div className="highlight-val">60</div>
            </div>
          </div>
        </div>
        
        <div className="share-social-links">
          <div className="social-icon insta">📷<br/>INSTAGRAM</div>
          <div className="social-icon fb">📘<br/>FACEBOOK</div>
          <div className="social-icon x">𝕏<br/>X</div>
          <div className="social-icon linkedin">💼<br/>LINKEDIN</div>
          <div className="social-icon whatsapp">💬<br/>WHATSAPP</div>
        </div>
        
        <button className="btn-copy-link">
          📋 COPY SHARABLE LINK
        </button>
      </div>
    </div>
  );
}
