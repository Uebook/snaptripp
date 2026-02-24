'use client'

import { MapItem } from './HierarchicalMap'
import { DayPlan } from './DayPlanner'

interface TimelineViewProps {
  dayPlans: DayPlan[]
  onClose: () => void
}

export default function TimelineView({ dayPlans, onClose }: TimelineViewProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid #f0f4f8',
          paddingBottom: '1rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#031B4E', fontFamily: '"Playfair Display", serif' }}>
            Your Trip Timeline
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#f0f4f8',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#333',
              transition: 'background 0.2s'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          {dayPlans.map((day, dayIndex) => (
            <div key={day.id} style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(212, 175, 55, 0.1)',
                color: '#D4AF37',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontSize: '0.9rem'
              }}>
                {day.title}
              </div>

              {day.items.length === 0 ? (
                <div style={{ paddingLeft: '2rem', color: '#888', fontStyle: 'italic' }}>
                  No places planned for this day yet.
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                  {day.items.map((item, itemIndex) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      marginBottom: '2rem',
                      position: 'relative'
                    }}>
                      {/* Vertical line connecting items in the same day */}
                      {itemIndex < day.items.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: '19px',
                          top: '40px',
                          width: '2px',
                          height: 'calc(100% + 1rem)',
                          background: '#e2e8f0'
                        }} />
                      )}

                      {/* Timeline dot */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: '2px solid #D4AF37',
                        color: '#D4AF37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginRight: '1.5rem',
                        flexShrink: 0,
                        zIndex: 1
                      }}>
                        {itemIndex + 1}
                      </div>

                      {/* Content Card */}
                      <div style={{
                        flex: 1,
                        background: '#fff',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}>
                        {(item.data?.images?.[0] || item.data?.imageUrl) && (
                          <img
                            src={item.data.images?.[0] || item.data.imageUrl}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '220px',
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
                          fontSize: '1.4rem',
                          color: '#031B4E',
                          fontFamily: '"Playfair Display", serif'
                        }}>
                          {item.name}
                        </h3>
                        <p style={{
                          margin: '0 0 1rem 0',
                          fontSize: '0.85rem',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: '600'
                        }}>
                          {item.type}
                        </p>
                        {item.data && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {item.data.description && (
                              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                                {item.data.description}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                              {item.data.rating && (
                                <span>⭐ {item.data.rating}</span>
                              )}
                              {item.data.address && (
                                <span>📍 {item.data.address}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {item.coordinates && (
                          <a
                            href={`https://www.google.com/maps?q=${item.coordinates.lat},${item.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '1rem',
                              color: '#D4AF37',
                              fontWeight: '600',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              padding: '6px 12px',
                              background: 'rgba(212, 175, 55, 0.05)',
                              borderRadius: '6px',
                              transition: 'background 0.2s'
                            }}
                          >
                            View on Maps ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
