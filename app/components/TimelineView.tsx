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
                        padding: '1.2rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '1.5rem',
                        alignItems: 'stretch'
                      }}>
                        {item.data?.image_url && (
                          <div style={{ flexShrink: 0, width: '220px', display: 'flex' }}>
                            <img
                              src={item.data.image_url}
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                minHeight: '180px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          </div>
                        )}

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h3 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.3rem',
                            color: '#031B4E',
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 800
                          }}>
                            {item.name}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '1rem' }}>
                            <span style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontWeight: '700'
                            }}>
                              {item.data?.categoryName || 'PLACE'}
                            </span>

                            {item.data?.reviewsCount ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                                <span style={{ color: '#f59e0b' }}>★</span>
                                {item.data.reviewsCount} reviews
                              </span>
                            ) : null}
                          </div>

                          {item.data?.description && (
                            <p style={{
                              fontSize: '0.95rem',
                              color: '#334155',
                              lineHeight: 1.5,
                              margin: '0 0 1rem 0'
                            }}>
                              {item.data.description}
                            </p>
                          )}

                          {(item.data?.address || item.data?.phone || item.data?.website) && (
                            <div style={{ margin: '12px 0', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {item.data.address && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                  <span style={{ color: '#ef4444' }}>📍</span>
                                  <span style={{ lineHeight: 1.4 }}>{item.data.address}</span>
                                </div>
                              )}
                              {item.data.phone && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ color: '#64748b' }}>📞</span>
                                  <span>{item.data.phone}</span>
                                </div>
                              )}
                              {item.data.website && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ color: '#3b82f6' }}>🌐</span>
                                  <a
                                    href={item.data.website.startsWith('http') ? item.data.website : 'https://' + item.data.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#3b82f6', textDecoration: 'none', wordBreak: 'break-all' }}
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
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
                                gap: '4px',
                                color: '#D4AF37',
                                fontWeight: '700',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                padding: '8px 12px',
                                background: '#FFFDF5',
                                borderRadius: '6px',
                                transition: 'background 0.2s',
                                border: '1px solid #fef3c7',
                                marginTop: '8px',
                                alignSelf: 'flex-start'
                              }}
                              onMouseOver={(e) => (e.target as HTMLAnchorElement).style.background = '#fef3c7'}
                              onMouseOut={(e) => (e.target as HTMLAnchorElement).style.background = '#FFFDF5'}
                            >
                              View on Maps ↗
                            </a>
                          )}
                        </div>
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
