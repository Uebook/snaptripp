'use client'

import { MapItem } from './HierarchicalMap'

interface TimelineViewProps {
  items: MapItem[]
  onClose: () => void
}

export default function TimelineView({ items, onClose }: TimelineViewProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>
            Your Timeline
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          {items.map((item, index) => (
            <div key={item.id} style={{
              display: 'flex',
              marginBottom: '2rem',
              position: 'relative'
            }}>
              {/* Timeline line */}
              {index < items.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '60px',
                  width: '2px',
                  height: 'calc(100% + 1rem)',
                  background: '#667eea'
                }} />
              )}

              {/* Timeline dot */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                marginRight: '1.5rem',
                flexShrink: 0,
                zIndex: 1
              }}>
                {index + 1}
              </div>

              {/* Content */}
              <div style={{
                flex: 1,
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                {/* Image */}
                {(item.data?.images?.[0] || item.data?.imageUrl) && (
                  <img 
                    src={item.data.images?.[0] || item.data.imageUrl} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.3rem',
                  color: '#333'
                }}>
                  {item.name}
                </h3>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.9rem',
                  color: '#666',
                  textTransform: 'capitalize'
                }}>
                  {item.type}
                </p>
                {item.data && (
                  <div>
                    {item.data.description && (
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        {item.data.description}
                      </p>
                    )}
                    {item.data.rating && (
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        ⭐ {item.data.rating}
                      </p>
                    )}
                    {item.data.address && (
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        📍 {item.data.address}
                      </p>
                    )}
                  </div>
                )}
                {item.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${item.coordinates.lat},${item.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      color: '#667eea',
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    View on Maps →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
