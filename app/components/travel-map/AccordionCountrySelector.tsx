import React, { useState } from 'react';
import { CONTINENTS_CATEGORIES, getContinentForCountry } from './TravelComponentsNew';
import worldCitiesData from '@/app/utils/world_cities.json';

// Get all countries from our cities data
const ALL_COUNTRIES = Object.keys(worldCitiesData).sort();

// Helper to get a generic flag emoji if we don't have real data
function getFlagEmoji(countryName: string) {
  // Simple deterministic emoji based on first letter for demo purposes
  // In a real app we'd map ISO codes to flag emojis
  return '🌍';
}

export function AccordionCountrySelector({
  userCountryLogs = [],
  onCountrySelect
}: {
  userCountryLogs?: any[],
  onCountrySelect?: (country: string) => void
}) {
  const [expandedContinent, setExpandedContinent] = useState<string | null>('Africa');
  const [searchQuery, setSearchQuery] = useState('');

  // Get visited country names
  const visitedCountries = userCountryLogs.map(log => log.country);

  // Group countries by continent
  const continentData: Record<string, string[]> = {};
  CONTINENTS_CATEGORIES.forEach(c => continentData[c] = []);
  
  ALL_COUNTRIES.forEach(country => {
    const cont = getContinentForCountry(country);
    if (continentData[cont]) {
      continentData[cont].push(country);
    } else {
      continentData["Special Regions"].push(country);
    }
  });

  const toggleAccordion = (continent: string) => {
    if (expandedContinent === continent) {
      setExpandedContinent(null);
    } else {
      setExpandedContinent(continent);
    }
  };

  return (
    <div style={{ marginTop: '40px', background: '#F8FAFC', padding: '24px', borderRadius: '16px' }}>
      <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', color: '#111827', margin: 0, fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>Select the country you've visited</h3>
          <button style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> Filter
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF' }}>
          <span style={{ color: '#9CA3AF' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            placeholder="Start typing country name" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#111827' }}
          />
        </div>

        {/* Accordion List */}
        <div style={{ padding: '16px 24px' }}>
          {CONTINENTS_CATEGORIES.map(continent => {
            const countriesInCont = continentData[continent].filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
            const visitedInCont = countriesInCont.filter(c => visitedCountries.includes(c)).length;
            const isExpanded = expandedContinent === continent;

            if (searchQuery && countriesInCont.length === 0) return null;

            return (
              <div 
                key={continent} 
                style={{ 
                  marginBottom: '12px',
                  border: isExpanded ? '1px dashed #3B82F6' : '1px solid transparent',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {/* Accordion Row */}
                <div 
                  onClick={() => toggleAccordion(continent)}
                  style={{ 
                    padding: '16px 24px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: '#FFF',
                    color: '#111827',
                    borderBottom: isExpanded ? '1px dashed #3B82F6' : '1px solid #F3F4F6',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '16px', fontFamily: '"Playfair Display", serif' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '12px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    <span>{continent}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '6px 12px', borderRadius: '24px' }}>
                    {visitedInCont} / {countriesInCont.length} Visited
                  </div>
                </div>

                {/* Expanded Content (Country Grid) */}
                {isExpanded && (
                  <div style={{ padding: '24px', background: '#FFF' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                      {countriesInCont.map(country => {
                        const isVisited = visitedCountries.includes(country);
                        return (
                          <div 
                            key={country}
                            onClick={() => onCountrySelect && onCountrySelect(country)}
                            style={{ 
                              background: '#FFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              padding: '10px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#374151',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                              {/* Flag / Icon */}
                              <span style={{ fontSize: '16px' }}>{getFlagEmoji(country)}</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country}</span>
                            </div>
                            
                            {/* Checkbox */}
                            <div style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '4px', 
                              border: isVisited ? 'none' : '1px solid #D1D5DB', 
                              background: isVisited ? '#3B82F6' : '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {isVisited && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
