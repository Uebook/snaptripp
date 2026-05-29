import React, { memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// The color scale based on the user's rating legend
export const getColor = (rating?: number) => {
  if (rating === undefined || rating === 0) return '#E5E7EB'; // blank/white map if not visited (light gray)
  if (rating <= 2) return '#FEF08A'; // visited (light yellow)
  if (rating <= 3) return '#FCD34D'; // saw a bit
  if (rating <= 4) return '#EAB308'; // traveled thoroughly
  return '#B45309'; // know every corner (dark brown/yellow)
};

interface InteractiveWorldMapProps {
  onCountryClick: (countryName: string) => void;
  selectedCountry: string | null;
  countryData: Record<string, { rating: number }>;
}

const InteractiveWorldMap = ({ onCountryClick, selectedCountry, countryData }: InteractiveWorldMapProps) => {
  return (
    <div style={{ width: '100%', height: '500px', background: '#F8FAFC', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ComposableMap projectionConfig={{ scale: 135 }} width={800} height={400} style={{ width: '100%', height: '100%' }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const data = countryData[countryName];
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onCountryClick(countryName)}
                  style={{
                    default: {
                      fill: getColor(data?.rating),
                      outline: 'none',
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                    },
                    hover: {
                      fill: '#FBBF24',
                      outline: 'none',
                      cursor: 'pointer',
                      stroke: '#FFFFFF',
                      strokeWidth: 1,
                    },
                    pressed: {
                      fill: '#F59E0B',
                      outline: 'none',
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>Map Legend</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: '#B45309', borderRadius: '4px' }}></div>
            <span>- know every corner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: '#EAB308', borderRadius: '4px' }}></div>
            <span>- traveled thoroughly</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: '#FCD34D', borderRadius: '4px' }}></div>
            <span>- saw a bit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: '#FEF08A', borderRadius: '4px' }}></div>
            <span>- visited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MiniWorldMap = ({ countryData }: { countryData: Record<string, { rating: number }> }) => {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ComposableMap projectionConfig={{ scale: 145 }} width={800} height={400} style={{ width: '100%', height: '100%' }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const data = countryData[countryName];
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: getColor(data?.rating),
                      outline: 'none',
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                    },
                    hover: { fill: getColor(data?.rating), outline: 'none' },
                    pressed: { fill: getColor(data?.rating), outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(InteractiveWorldMap);
