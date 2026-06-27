import React, { useState } from 'react';
import { CONTINENTS_CATEGORIES, getContinentForCountry } from './TravelComponentsNew';
import worldCitiesData from '@/app/utils/world_cities.json';

// Get all countries from our cities data
const ALL_COUNTRIES = Object.keys(worldCitiesData).sort();

const COUNTRY_CODES: Record<string, string> = {
  // Africa
  "Algeria": "dz", "Angola": "ao", "Benin": "bj", "Botswana": "bw", "Burkina Faso": "bf",
  "Burundi": "bi", "Cabo Verde": "cv", "Cape Verde": "cv", "Cameroon": "cm", "Central African Republic": "cf", "Chad": "td",
  "Comoros": "km", "Congo": "cg", "Cote d'Ivoire": "ci", "DR Congo": "cd", "Djibouti": "dj",
  "Egypt": "eg", "Equatorial Guinea": "gq", "Eritrea": "er", "Eswatini": "sz", "Ethiopia": "et",
  "Gabon": "ga", "Gambia": "gm", "Ghana": "gh", "Guinea": "gn", "Guinea-Bissau": "gw",
  "Kenya": "ke", "Lesotho": "ls", "Liberia": "lr", "Libya": "ly", "Madagascar": "mg",
  "Malawi": "mw", "Mali": "ml", "Mauritania": "mr", "Mauritius": "mu", "Morocco": "ma",
  "Mozambique": "mz", "Namibia": "na", "Niger": "ne", "Nigeria": "ng", "Rwanda": "rw",
  "Sao Tome and Principe": "st", "Senegal": "sn", "Seychelles": "sc", "Sierra Leone": "sl", "Somalia": "so",
  "South Africa": "za", "Sudan": "sd", "Tanzania": "tz", "Togo": "tg", "Tunisia": "tn",
  "Uganda": "ug", "Zambia": "zm", "Zimbabwe": "zw",
  // Americas
  "Argentina": "ar", "Bolivia": "bo", "Brazil": "br", "Chile": "cl", "Colombia": "co",
  "Ecuador": "ec", "Guyana": "gy", "Paraguay": "py", "Peru": "pe", "Suriname": "sr",
  "Uruguay": "uy", "Venezuela": "ve", "United States of America": "us", "United States": "us", "Canada": "ca",
  "Mexico": "mx", "Costa Rica": "cr", "Cuba": "cu", "Dominican Republic": "do", "El Salvador": "sv",
  "Guatemala": "gt", "Haiti": "ht", "Honduras": "hn", "Jamaica": "jm", "Nicaragua": "ni", "Panama": "pa",
  "Bahamas": "bs", "Barbados": "bb", "Belize": "bz", "Dominica": "dm", "Grenada": "gd", "Puerto Rico": "pr",
  "Saint Lucia": "lc", "Trinidad and Tobago": "tt", "Saint Vincent and the Grenadines": "vc",
  // Asia
  "Afghanistan": "af", "Armenia": "am", "Azerbaijan": "az", "Bahrain": "bh", "Bangladesh": "bd",
  "Bhutan": "bt", "Brunei": "bn", "Cambodia": "kh", "China": "cn", "Cyprus": "cy",
  "Georgia": "ge", "India": "in", "Indonesia": "id", "Iran": "ir", "Iraq": "iq",
  "Israel": "il", "Japan": "jp", "Jordan": "jo", "Kazakhstan": "kz", "Kuwait": "kw",
  "Kyrgyzstan": "kg", "Laos": "la", "Lebanon": "lb", "Malaysia": "my", "Maldives": "mv",
  "Mongolia": "mn", "Myanmar": "mm", "Nepal": "np", "North Korea": "kp", "Oman": "om",
  "Pakistan": "pk", "Palestine": "ps", "Philippines": "ph", "Qatar": "qa", "Saudi Arabia": "sa",
  "Singapore": "sg", "South Korea": "kr", "Sri Lanka": "lk", "Syria": "sy", "Taiwan": "tw",
  "Tajikistan": "tj", "Thailand": "th", "Timor-Leste": "tl", "Turkey": "tr", "Turkmenistan": "tm",
  "United Arab Emirates": "ae", "Uzbekistan": "uz", "Vietnam": "vn", "Yemen": "ye", "Hong Kong": "hk", "Macau": "mo",
  // Europe
  "Albania": "al", "Andorra": "ad", "Austria": "at", "Belarus": "by", "Belgium": "be",
  "Bosnia and Herzegovina": "ba", "Bulgaria": "bg", "Croatia": "hr", "Czech Republic": "cz",
  "Denmark": "dk", "Estonia": "ee", "Finland": "fi", "France": "fr", "Germany": "de",
  "Greece": "gr", "Hungary": "hu", "Iceland": "is", "Ireland": "ie", "Italy": "it",
  "Latvia": "lv", "Liechtenstein": "li", "Lithuania": "lt", "Luxembourg": "lu", "Malta": "mt",
  "Moldova": "md", "Monaco": "mc", "Montenegro": "me", "Netherlands": "nl", "North Macedonia": "mk", "Macedonia": "mk",
  "Norway": "no", "Poland": "pl", "Portugal": "pt", "Romania": "ro", "Russia": "ru",
  "San Marino": "sm", "Serbia": "rs", "Slovakia": "sk", "Slovenia": "si", "Spain": "es",
  "Sweden": "se", "Switzerland": "ch", "Ukraine": "ua", "United Kingdom": "gb", "Vatican City": "va",
  "Gibraltar": "gi", "Faroe Islands": "fo", "Isle of Man": "im", "Guernsey": "gg", "Jersey": "je", "Kosovo": "xk",
  "Vatican City State": "va", "Vatican": "va",
  // Oceania
  "Australia": "au", "Fiji": "fj", "Kiribati": "ki", "Marshall Islands": "mh", "Micronesia": "fm",
  "Nauru": "nr", "New Zealand": "nz", "Palau": "pw", "Papua New Guinea": "pg", "Samoa": "ws",
  "Solomon Islands": "sb", "Tonga": "to", "Tuvalu": "tv", "Vanuatu": "vu", "Cook Islands": "ck", "Niue": "nu",
  // Special Regions
  "Anguilla": "ai", "Antigua and Barbuda": "ag", "Aruba": "aw", "British Indian Ocean Territory": "io",
  "Cayman Islands": "ky", "Christmas Island": "cx", "Falkland Islands": "fk", "Greenland": "gl",
  "Guadeloupe": "gp", "Heard Island and McDonald Islands": "hm", "Mayotte": "yt", "Montserrat": "ms",
  "New Caledonia": "nc", "Northern Mariana Islands": "mp", "Pitcairn": "pn", "Reunion": "re",
  "Saint Pierre and Miquelon": "pm", "South Georgia and the South Sandwich Islands": "gs", "Tokelau": "tk",
  "Turks and Caicos Islands": "tc"
};

export function AccordionCountrySelector({
  userCountryLogs = [],
  onCountrySelect,
  onToggleCountry
}: {
  userCountryLogs?: any[],
  onCountrySelect?: (country: string) => void,
  onToggleCountry?: (country: string) => void
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
    <div style={{ marginTop: '40px', background: '#FFF', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
      <div style={{ background: '#FFF', borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#111827', margin: 0, fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>Select the country you've visited</h3>
          <button style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> Filter
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF' }}>
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
        <div style={{ padding: '24px 0 0' }}>
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
                  border: '1px solid #E5E7EB',
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
                    borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '15px', fontFamily: '"Playfair Display", serif' }}>
                    <span style={{ color: '#6B7280', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
                    <span>{continent}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '6px 12px', borderRadius: '24px' }}>
                    {visitedInCont} / {countriesInCont.length} Visited
                  </div>
                </div>

                {/* Expanded Content (Country Grid) */}
                {isExpanded && (
                  <div style={{ padding: '24px', background: '#FFF' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {countriesInCont.map(country => {
                        const isVisited = visitedCountries.includes(country);
                        const code = COUNTRY_CODES[country];
                        const flagUrl = code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null;

                        return (
                          <div 
                            key={country}
                            onClick={() => onCountrySelect && onCountrySelect(country)}
                            style={{ 
                              background: '#FFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '12px',
                              padding: '12px 16px',
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
                              {flagUrl ? (
                                <img 
                                  src={flagUrl} 
                                  alt="" 
                                  style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                                />
                              ) : (
                                <span style={{ fontSize: '16px' }}>🌍</span>
                              )}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country}</span>
                            </div>
                            
                            {/* Checkbox */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleCountry) {
                                  onToggleCountry(country);
                                }
                              }}
                              style={{ 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '50%', 
                                border: isVisited ? 'none' : '1px solid #D1D5DB', 
                                background: isVisited ? '#EBA424' : '#FFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                cursor: 'pointer'
                              }}
                            >
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
